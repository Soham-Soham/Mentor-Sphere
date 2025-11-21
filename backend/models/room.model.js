import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    roomId:{
        type: String,
        unique: true,
        required: true,
    },
    createdBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required: true,
    },
    maxParticipants:{
        type: Number,
        default: 2,
    },
    participants:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }]
},{timestamps:true})

export const Room = mongoose.model("Room",roomSchema);