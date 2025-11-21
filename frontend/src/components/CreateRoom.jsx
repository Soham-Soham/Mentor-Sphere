import { useState } from 'react';
import {useNavigate} from 'react-router-dom';
import createRoomBg from "../assets/create_room_bg.jpg";
import useFetchRoomDetails from '../hooks/useFetchRoomDetails.js';
import axios from 'axios';

const CreateRoom = () => {

  const [roomName,setRoomName] = useState("");
  const [maxParticipants,setMaxParticipants] = useState(2);
  const [errorMsg,setErrorMsg] = useState("");

  const fetchRoomDetails = useFetchRoomDetails();
  const navigate = useNavigate();

  const handleClear = ()=>{
    setRoomName("");
    setMaxParticipants(2);
    setErrorMsg("");
  }

  const handleSubmit = async(e)=>{
    e.preventDefault();
    try {
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/room/createRoom`,{name:roomName,maxParticipants:maxParticipants},{withCredentials:true})
      fetchRoomDetails();
      navigate("/dashboard/codeEditor")
    } catch (error) {
      console.log(error);
      
      setErrorMsg(error.response?.data?.message);
    }
  }

  return ( 
    <div style={{backgroundImage: `url(${createRoomBg})`}} className={` h-full bg-no-repeat bg-cover `}>
      <div className=' h-full backdrop-blur-lg flex flex-col justify-center items-center gap-5 relative'>
        <div className=''>
          <h1 className=' text-xl font-bold font-mon p-2'>Create Room</h1>
        </div>
        <div className='rounded-md p-4 backdrop-blur-2xl shadow-2xl'>
          <form onSubmit={handleSubmit}>
            <div className=' flex flex-col gap-5'>
              <div className=' text-lg'>
                <label htmlFor="roomName" className=' font-semibold mr-3'>Room Name</label>
                <input type="text" name='roomName' id='roomName' required placeholder='e.g., Project Alfa' value={roomName} onChange={(e)=>setRoomName(e.target.value)} className=' p-1 ring-1 outline-blue-400 rounded-sm' />
              </div>
              <div className=' text-lg'>
                <label htmlFor="maxParticipants" className=' font-semibold mr-3'>Max Participants</label>
                <input type="number" name='maxParticipants' id='maxParticipants' min={2} max={5} onChange={(e)=>setMaxParticipants(e.target.value)} className=' p-1 ring-1 outline-none rounded-sm' />
              </div>
              <div className=' flex justify-start items-center gap-10'>
                <button onClick={handleClear} className=' border-2 border-blue-400 py-2 px-8 rounded-md text-lg font-bold font-mono hover:bg-blue-400 hover:text-white transition-all duration-500'>Clear</button>
                <button type='submit' className=' bg-blue-400 py-3 px-8 rounded-md text-white text-lg font-bold font-mono hover:bg-blue-600 transition-all duration-400'>Create</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  ) 
}

export default CreateRoom;