import { Room } from "../models/room.model.js";
import { Participant } from "../models/participant.model.js";
import { User } from "../models/user.model.js";
import { v4 as uuidv4 } from "uuid";
import { CodeHistory } from "../models/codeHistory.model.js";

//create Room
//join room
//leave room
//get room details

const createRoom = async (req, res) => {
  try {
    //get details
    //check if not empty
    //create room with unique roomId
    //add in Participant document
    const { name, maxParticipants } = req.body;
    const userId = req.user._id;
    if (!name) {
      return res.status(400).json({ message: "Room name is required" });
    }

    const room = await Room.create({
      roomId: uuidv4(),
      name,
      createdBy: userId,
      maxParticipants,
      participants: [userId],
    });

    await Participant.create({
      user: userId,
      room: room._id,
      role: "owner",
    });

    res.status(200).json({ message: "Room Created", room });
  } catch (error) {
    console.error("CreateRoom:: Error: ", error);
    res.status(500).json({ message: "CreateRoom:: Internal Server Error" });
  }
};

const joinRoom = async (req, res) => {
  try {
    //get roomId -> check if room is there or not
    //get userId from req
    //check if user is already in room
    //check if room.participants.length >= room.maxParticipants
    //create participant
    //push userId in room.participants
    const { roomId } = req.body;
    const userId = req.user._id;

    const room = await Room.findOne({ roomId });
    if (!room) return res.status(404).json({ message: "Room not found" });

    const alreadyParticipant = await Participant.findOne({
      user: userId,
      room: room._id,
    });
    if (alreadyParticipant)
      return res.status(200).json({ message: "Already joined", room });

    if (room.participants.length >= room.maxParticipants) {
      return res.status(403).json({ message: "Room is full" });
    }

    await Participant.create({ user: userId, room: room._id, role: "viewer" });
    room.participants.push(userId);
    await room.save();

    const io = req.app.get("io");
    io.to(roomId).emit("room-updated");
    io.to(roomId).emit("user-joined", { userId, name: req.user.name });

    res.status(200).json({ message: "Joined room successfully", room });
  } catch (error) {
    console.error("joinRoom:: Error", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getRoomDetails = async (req, res) => {
  try {
    // const {roomId} = req.params;
    const userId = req.user._id;

    const participant = await Participant.findOne({ user: userId }).populate(
      "room"
    );
    if (!participant) {
      return res.status(404).json({ message: "You are not part of any room" });
    }

    const room = await Room.findById(participant.room._id)
      .populate("participants", "name avatar email")
      .populate("createdBy", "name email avatar");

    if (!room) {
      return res.status(404).json({ message: "Room not Found" });
    }

    const participantRoles = await Participant.find({
      room: room._id,
    }).populate("user", "name email avatar");

    res.status(200).json({ room, participantRoles });
  } catch (error) {
    console.error("GetRoomDetails:: Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const leaveRoom = async (req, res) => {
  try {
    //current RoomId
    //current userId
    //find room and remove current userId
    //find in Participant and delete that data
    const { roomId } = req.params;
    const userId = req.user._id;

    const room = await Room.findOne({ roomId });
    if (!room) {
      return res.status(404).json({ message: "Room Not Found" });
    }

    const participant = await Participant.findOne({ user: userId, room: room._id });
    if (!participant) {
      return res.status(404).json({ message: "You are not part of this room" });
    }

    const isOwner = participant.role === "owner";

    await Participant.deleteOne({ user: userId, room: room._id });

    room.participants = room.participants.filter(
      (participantId) => participantId.toString() !== userId.toString()
    );

    const io = req.app.get("io");

    if (isOwner) {
      await Participant.deleteMany({ room: room._id });
      await Room.deleteOne({ _id: room._id });
      await CodeHistory.deleteMany({ room: room._id });

      io.to(roomId).emit("room-updated");

      return res.status(200).json({ message: "Owner left, Room Deleted !!" })
    }

    await room.save();

    io.to(roomId).emit("room-updated");
    io.to(roomId).emit("user-left", { userId, name: req.user.name });

    res.status(200).json({ message: "Left the room" });
  } catch (error) {
    console.error("LeaveRoom:: Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const deleteRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user._id;
    // console.log(userId);

    const room = await Room.findOne({ roomId });
    if (!room) {
      return res.status(404).json({ message: "Room Not Found" });
    }

    const owner = await Participant.findOne({
      room: room._id,
      user: userId,
      role: "owner",
    });

    if (!owner) {
      return res
        .status(403)
        .json({ message: "Only Owner can delete the Room" });
    }

    await Participant.deleteMany({ room: room._id });
    await Room.deleteOne({ _id: room._id });
    // await CodeHistory.deleteMany({room:room._id})
    const io = req.app.get("io");
    io.to(roomId).emit("room-updated");

    res.status(200).json({ message: "Room Deleted Successfully" });
  } catch (error) {
    console.error("DeleteRoom:: Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export { createRoom, leaveRoom, deleteRoom, joinRoom, getRoomDetails };
