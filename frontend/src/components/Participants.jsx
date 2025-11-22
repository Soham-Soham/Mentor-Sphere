import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearRoom, removeParticipant } from "../redux/slices/roomSlice";
import socket from "../socket/socket";
import axios from "axios";

const Participants = () => {
  const roomDetails = useSelector((state) => state.room.room);
  const participants = useSelector((state) => state.room.participants);
  const user = useSelector((state) => state.auth.user);

  const [myRole, setMyRole] = useState("no role");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // get myRole
  useEffect(() => {
    if (participants && user) {
      const myParticipant = participants?.find(
        (p) => p?.user?._id === user?._id
      );
      setMyRole(myParticipant?.role || "no role");
    }
  }, [participants, user]);

  // Leave Room 
  const leaveRoomHandle = async () => {
    try {
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/room/${roomDetails?.roomId
        }/leaveRoom`,
        {},
        { withCredentials: true }
      );
      dispatch(clearRoom());
    } catch (error) {
      console.error("Error leaving room: ", error);
    }
  };

  // Role Change
  const handleRoleChange = async (userId, newRole) => {
    try {
      if (newRole === "editor") {
        await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/participants/grant-write`,
          { roomId: roomDetails.roomId, userToGrant: userId },
          { withCredentials: true }
        );
      } else if (newRole === "viewer") {
        await axios.post(
          `${import.meta.env.VITE_BACKEND_URL
          }/api/v1/participants/revoke-write`,
          { roomId: roomDetails.roomId, userToRevoke: userId },
          { withCredentials: true }
        );
      }
    } catch (error) {
      console.error("Role change error:", err);
    }
  };

  // Kick Participants
  const handleKick = async (userId) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL
        }/api/v1/participants/kickParticipant`,
        { roomId: roomDetails.roomId, userToKick: userId },
        { withCredentials: true }
      );
    } catch (error) {
      console.error("Kick error:", err);
    }
  };

  return (
    <>
      {/* Participants Info */}
      {participants && roomDetails && (
        <div className=" flex flex-col gap-1">
          <h1 className=" font-bold">Participants - {participants.length}</h1>
          {participants.map((participant) => (
            <div
              key={participant?._id}
              className={` flex justify-between items-center gap-4 ${participant?.role == "owner" ? "bg-green-700" : "bg-sky-900 text-white"
                }  p-2 rounded-md `}
            >
              <img
                src={participant?.user?.avatar}
                alt=""
                className=" rounded-full h-10 w-10"
              />
              <p>{participant?.user?.name}</p>
              {myRole === "owner" && participant?.role != "owner" ? (
                <>
                  <select
                    defaultValue={participant?.role}
                    onChange={(e) =>
                      handleRoleChange(participant.user._id, e.target.value)
                    }
                    className="text-black"
                  >
                    <option value="viewer">Viewer</option>
                    <option value="editor">Editor</option>
                  </select>
                  <button
                    onClick={() => handleKick(participant.user._id)}
                    className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-800"
                  >
                    Kick
                  </button>
                </>
              ) : (<p className=" text-yellow-300">{participant?.role}</p>)}
            </div>
          ))}
        </div>
      )}

      <div className=" flex flex-col gap-2 h-full">
        {roomDetails && participants ? (
          <button
            className=" bg-red-500 hover:bg-red-600 px-4 py-2 mt-5 rounded text-white"
            onClick={leaveRoomHandle}
          >
            Leave Room
          </button>
        ) : (<div className=" h-full flex justify-center items-center overflow-hidden font-imFellFrench">You are not part of any room</div>)}
      </div>
    </>
  )
};

export default Participants;
