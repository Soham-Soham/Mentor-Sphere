import {User} from "../models/user.model.js";
import jwt from "jsonwebtoken";

const verifyJWT = async(req,res,next)=>{
    try {
        const token = req.cookies?.Token || req.header("Authorization")?.replace("Bearer ","");
        
        if(!token){
            return res.status(401).json({message:"Unauthorized Request"})
        }
        const decodedToken = jwt.verify(token,process.env.JWT_SECRET);
        const user = await User.findOne({_id:decodedToken?._id}).select("-password");
        if(!user){
            return res.status(401).json({message:"Invalid Access Token"});
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("VerifyJWT:: Invalid Token:",error);
        return res.status(401).json({ message: "Invalid or expired token" });
    }
}

export default verifyJWT;