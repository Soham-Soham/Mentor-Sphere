import {Router} from "express";
import {createRoom,joinRoom,deleteRoom,leaveRoom,getRoomDetails} from "../controllers/room.controller.js";
import verifyJWT from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT);

router.route("/createRoom").post(createRoom);
router.route("/join").post(joinRoom);
router.route("/roomDetails").get(getRoomDetails);
router.route("/:roomId/leaveRoom").put(leaveRoom);
router.route("/:roomId/deleteRoom").delete(deleteRoom);

export default router;