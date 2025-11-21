import mongoose from 'mongoose';

const participantSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    room:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room",
        required: true
    },
    role:{
        type: String,
        enum:["owner","editor","viewer"],
        default: "viewer"
    },
    joinedAt:{
        type: Date,
        default: Date.now()
    }
})

export const Participant = mongoose.model("Participant",participantSchema);
