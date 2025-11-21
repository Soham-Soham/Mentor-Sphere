import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended: true,limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

//import routes
import userRouter from "./routers/user.routes.js";
import roomRouter from "./routers/room.routes.js";
import participantRouter from "./routers/participants.routes.js";
import codeHistoryRouter from "./routers/codeHistory.routes.js";
import judgeRoutes from "./routers/judge.routes.js";

//routes declaration
app.use("/api/v1/users",userRouter);
app.use("/api/v1/room",roomRouter);
app.use("/api/v1/participants",participantRouter);
app.use("/api/v1/history",codeHistoryRouter);
app.use("/api/v1",judgeRoutes);

export default app;