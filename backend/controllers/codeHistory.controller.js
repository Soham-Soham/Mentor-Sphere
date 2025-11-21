import { CodeHistory } from "../models/codeHistory.model.js";
import { Room } from "../models/room.model.js";
import { Participant } from "../models/participant.model.js";

const saveCodeSnapshot = async (req, res) => {
  try {
    const { roomId } = req.body;
    const { code } = req.body;
    const userId = req.user._id;

    const room = await Room.findOne({ roomId });
    if (!room) return res.status(404).json({ message: "Room not found" });

    const participant = await Participant.findOne({
      user: userId,
      room: room._id,
    });

    if (!participant || participant.role !== "owner") {
      return res.status(403).json({ message: "Only room owner can save code" });
    }

    await CodeHistory.create({ room: room._id, code });

    res.status(200).json({ message: "Code snapshot saved" });
  } catch (error) {
    console.error("SaveCodeSnapshot:: Error", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


const getCodeHistory = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user._id;

    const room = await Room.findOne({ roomId });
    if (!room) return res.status(404).json({ message: "Room not found" });

    const participant = await Participant.findOne({
      user: userId,
      room: room._id,
    });

    if (!participant || participant.role !== "owner") {
      return res
        .status(403)
        .json({ message: "Only room owner can view code history" });
    }

    const history = await CodeHistory.find({ room: room._id }).sort({ timestamp: -1 });

    res.status(200).json({ codeVersions: history });
  } catch (error) {
    console.error("GetCodeHistory:: Error", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export { saveCodeSnapshot, getCodeHistory };