import { io } from "socket.io-client";

const socket = io(`${import.meta.env.VITE_BACKEND_URL}`,{
    withCredentials: true,
    transports: ["polling", "websocket"], 
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
});

export default socket;