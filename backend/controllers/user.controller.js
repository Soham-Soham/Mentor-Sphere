import { User } from "../models/user.model.js";
import { sendRestPasswordEmail, sendSuccessResetPasswordEmail, sendVerificationEmail } from "../nodemailer/emails.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import crypto from 'crypto';


const registerUser = async(req,res)=>{
    try {
        //get user data
        //check field are not empty
        //if empty- validation error - return
        const {name,email,password} = req.body;
        if(!name|| !email ||!password){
            return res.status(500).json({message:"All the fields are required !"});
        }

        //check email in DB
        const existingUser = await User.findOne({email:email});
        //if present && isVerified:false - return with message
        if(existingUser){
            return res.status(409).json({message:"User with Email Already Registered"});
        }

        //handle avatar-image if any 
        let uploadedImage;
        if(req.file?.path){
            uploadedImage = await uploadOnCloudinary(req.file.path);
            // console.log("uploadedImage: ",uploadedImage);
            if(!uploadedImage){
                return res.status(500).json({message:"Error while uploading avatar"});
            }
        }
        let randomNumber = Math.floor(Math.random() * 50) + 1;
        const avatarUrl = uploadedImage?.url || `https://xsgames.co/randomusers/assets/avatars/pixel/${randomNumber}.jpg`;

        //generate verification token && verification expireAt
        const verificationToken = Math.floor(100000 + Math.random()*900000).toString();
        const verificationTokenExpiresAt = Date.now()+3600000;

        //send email
        const sendEmail = await sendVerificationEmail(email,verificationToken);
        if(!sendEmail){
            return res.status(500).json({message:"Error while sending verification Email"})
        }

        //create user - with verification token and verification expiresAt
        const user = await User.create({
            name,
            email,
            password,
            avatar:avatarUrl,
            verificationToken,
            verificationTokenExpiresAt,
            isVerified: false,
        });
        
        //return successful message
        res.status(200).json({message:"Registration successfull. Please check your email to verify your account"});

    } catch (error) {
        console.error("RegisterUser:: Error:",error);
        res.status(500).json({ message: "Internal Server Error" })
    }
}

const verifyUser = async(req,res)=>{
    try {
        //get token from url
        //get user from DB based on verificationToken
        //if not user found- Error message
        //send message
        const {token} = req.params;
        const user = await User.findOne({verificationToken:token})
        if(!user || Date.now() > user.verificationTokenExpiresAt){
            return res.status(400).json({message:"Invalid or expired verification token"})
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiresAt = undefined;

        await user.save();

        return res.status(200).json({message:"Email verified successfully. You can now Login"});
    } catch (error) {
        console.error("VerifyUser:: Error: ",error);
        res.status(500).json({message:"Internal Error"});
    }
}

const loginUser = async(req,res)=>{
    try {
        //get email and password
        //check fields not empty
        //check user in DB using email
        //check user isVerified
        //if not present - return -message
        //check password
        //generate JWT token
        
        const {email,password} = req.body;
        if(!email || !password){
            return res.status(400).json({message:"All field are required"})
        }

        const user = await User.findOne({email:email});
        if(!user){
            return res.status(400).json({message:"User not Found or Didn't Registered"})
        }

        if(user.isVerified == false){
            return res.status(400).json({message:"Please Verify Your Email First"})
        }

        const isPasswordValid = await user.isPasswordCorrect(password);
        if(!isPasswordValid){
            return res.status(401).json({message:"Invalid user Password"})
        }

        const jwtToken = await user.generateJwtToken();
        const loggedInUser = await User.findById(user._id).select("-password");
        const options = {
            httpOnly: true,
            secure: true,
            sameSite: "None",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        }

        return res.status(200).cookie("Token",jwtToken,options).json({message:"User LoggedIn Successfully",user:loggedInUser})

    } catch (error) {
        console.error("LoginUser:: Error: ",error);
        res.status(500).json({message:"Internal Error"});
    }
}

const logoutUser = async(req,res)=>{
    try {
        //clear all cookie
        const options = {
            httpOnly: true,
            secure: true,
            sameSite: "None",
        }

        return res.status(200).clearCookie("Token",options).json({message:"User Logged Out Successfully"})
    } catch (error) {
        console.error("LogoutUser:: Error: ",error);
        res.status(500).json({message:"Internal Error"});
    }
}

const forgotPassword = async(req,res)=>{
    try {
       //get email
       //check if user with this email is present
       //generate resetPassword Token
       //store token it to User's DB
       //send email
       //send response
       const {email} = req.body;
       if(!email){
            return res.status(400).json({message:"Field is Required"})
       }
       const user = await User.findOne({email:email}).select("-password");
       if(!user){
            return res.status(400).json({message:"User not Found"})
       }

       const resetPasswordToken = crypto.randomBytes(20).toString("hex");
       const resetPasswordExpiresAt = Date.now() + 3600000;

       const sendEmail = await sendRestPasswordEmail(user.email,resetPasswordToken);
       if(!sendEmail){
        return res.status(400).json({message:"Failed to send reset password mail"})
       }

       user.resetPasswordToken = resetPasswordToken;
       user.resetPasswordExpiresAt = resetPasswordExpiresAt;

       await user.save();

       return res.status(200).json({message:"Reset Password Email Sent Successfully"})

    } catch (error) {
        console.error("ForgotPassword:: Error: ",error);
        res.status(500).json({message:"Internal Error"});
    }
}

const resetPassword = async(req,res)=>{
    try {
        //get resetToken
        //get new password and confirm password
        //get user using resetPassword token

        const {resetToken} = req.params;
        const {newPassword,confirmPassword} = req.body;

        if(!newPassword || !confirmPassword){
            return res.status(400).json({message:"All fields are required"})
        }

        if(newPassword !== confirmPassword){
            return res.status(400).json({message:"Incorrect Confirm Password"})
        }

        const user = await User.findOne({
            resetPasswordToken: resetToken,
            resetPasswordExpiresAt: {$gt: Date.now()}
        }).select("-password")

        if(!user){
            return res.status(400).json({message:"Invalid Token or Expired Token"})
        }
        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiresAt = undefined;

        await user.save();

        await sendSuccessResetPasswordEmail(user.email);

        return res.status(200).json({message:"Password Reset Successfully"})

    } catch (error) {
        console.error("Reset Password:: Error: ",error);
        res.status(500).json({message:"Internal Error"}); 
    }
}

const me = async(req,res)=>{
    try {
        const userId = req.user._id;
        const user = await User.findById(userId).select("-password");
        if(!user){
            return res.status(404).json({message:"User Not Found"})
        }
        return res.status(200).json({user})
    } catch (error) {
        console.error("Me:: Error: ",error);
        res.status(500).json({message:"Internal Error"}); 
    }
}


export {registerUser,verifyUser,loginUser,logoutUser,forgotPassword,resetPassword,me};