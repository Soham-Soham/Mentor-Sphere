import mongoose from 'mongoose';

const codeHistorySchema = new mongoose.Schema({
    room:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Room",
        required: true
    },
    code:{
        type: String
    }
},{timestamps: true})

export const CodeHistory = mongoose.model("CodeHistory",codeHistorySchema);