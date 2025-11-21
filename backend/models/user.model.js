import mongoose from "mongoose";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

//create schema
//encrypt password before storing to database
//create methods on schema - 1.for checking encrypted password 2.for generating jwt token

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        unique: true,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    avatar:{
        type: String
    },
    isVerified:{
        type: Boolean,
        default: false
    },
    lastLogin:{
        type: Date,
        default: Date.now()
    },
    verificationToken: String,
    verificationTokenExpiresAt: Date,
    resetPasswordToken: String,
    resetPasswordExpiresAt: Date
},{timestamps:true})

userSchema.pre("save",async function(next) {
    if(!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password,10);
    next(); 
})

userSchema.methods.isPasswordCorrect = async function(password) {
    return await bcrypt.compare(password,this.password);
}

userSchema.methods.generateJwtToken = async function () {
    return await jwt.sign({
        _id: this._id,
        email: this.email,
        name: this.name
    },process.env.JWT_SECRET)
}


const User = mongoose.model("User",userSchema);

export {User};