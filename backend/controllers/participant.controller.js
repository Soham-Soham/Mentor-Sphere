import {Participant} from "../models/participant.model.js"
import {Room} from "../models/room.model.js"

//grand access
//revoke access
//kick participant

const grantWriteAccess = async(req,res)=>{
    try {
        const {roomId,userToGrant} = req.body;
        const currentUserId = req.user._id;

        const room = await Room.findOne({roomId});
        if(!room){
            return res.status(404).json({message:"Room Not Found"})
        }

        const owner = await Participant.findOne({user:currentUserId,room:room._id,role:"owner"})
        if(!owner){
            return res.status(403).json({message:"Only Owner can Change the Permission"})
        }
        
        const participant = await Participant.findOne({user:userToGrant,room:room._id});
        
        participant.role = "editor";
        await participant.save();
        
        const io = req.app.get("io");
        io.to(roomId).emit("room-updated");

        res.status(200).json({message:"Write Access Granted"});
    } catch (error) {
        console.error("GrantWriteAccess:: Error:",error);
        res.status(500).json({message:"Internal Server Error"})
    }
}

const revokeWriteAccess = async(req,res)=>{
    try {
        const {roomId,userToRevoke} = req.body;
        const currentUserId = req.user._id;

        const room = await Room.findOne({roomId});
        if(!room){
            return res.status(404).json({message:"Room Not Found"})
        }

        const owner = await Participant.findOne({user:currentUserId,room:room._id,role:"owner"})
        if(!owner){
            return res.status(403).json({message:"Only Owner can Change the Permission"})
        }

        const participant = await Participant.findOne({user:userToRevoke,room:room._id});
        participant.role = "viewer";
        await participant.save();

        const io = req.app.get("io");
        io.to(roomId).emit("room-updated");

        res.status(200).json({message:"Write Access Revoked"});
    } catch (error) {
        console.error("RevokeWriteAccess:: Error:",error);
        res.status(500).json({message:"Internal Server Error"})
    }
}

const kickParticipant = async(req,res)=>{
    try {
        const {roomId,userToKick} = req.body;
        const currentUserId = req.user._id;

        const room = await Room.findOne({roomId});
        if(!room){
            return res.status(404).json({message:"Room Not Found"})
        }

        const owner = await Participant.findOne({user:currentUserId,room:room._id,role:"owner"})
        if(!owner){
            return res.status(403).json({message:"Only Owner can kick the Participants"})
        }

        await Participant.deleteOne({user:userToKick,room:room._id});

        room.participants = room.participants.filter(id => id.toString() !== userToKick.toString());
        await room.save();

        req.app.get("io").to(roomId).emit("participant-kicked",userToKick);

        const io = req.app.get("io");
        io.to(roomId).emit("room-updated");

        res.status(200).json({message:"User Removed From Room"});
    } catch (error) {
        console.error("KickParticipant:: Error:",error);
        res.status(500).json({message:"Internal Server Error"})    
    }
}

export {grantWriteAccess,revokeWriteAccess,kickParticipant}