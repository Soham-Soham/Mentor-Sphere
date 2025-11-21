import app from './app.js';
import http from 'http';
import cors from 'cors';
import colors from 'colors';
import { configDotenv } from 'dotenv';
import { Server } from 'socket.io';
import connectDB from './db/db.js';
import { socketManager } from './socket/socketManager.js';

configDotenv();
const PORT = process.env.PORT;

const server = http.createServer(app);
const io = new Server(server,{
    cors:{
        origin:process.env.CORS_ORIGIN,
        credentials:true
    }
});

app.set("io",io);
socketManager(io);

connectDB()
.then(()=>{
    server.listen(PORT,()=>{
        console.log(`Server is listening on PORT: ${PORT}`);
    })
})
.catch((err)=>{
    console.log("MongoDB connection Failed !",err);
})
