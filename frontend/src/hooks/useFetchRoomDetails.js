import { useDispatch } from "react-redux";
import { setRoom } from "../redux/slices/roomSlice";
import axios from "axios";

const useFetchRoomDetails = () => {
  const dispatch = useDispatch();

  const fetchRoomDetails = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/room/roomDetails`,
        { withCredentials: true }
      );
      console.log(data);
      
      dispatch(setRoom({
        room: data.room,
        participants: data.participantRoles
      }));
    } catch (error) {
      console.log("FetchRoomDetails Error:", error?.response?.data?.message);
    }
  };

  return fetchRoomDetails;
};

export default useFetchRoomDetails;
