import { Router } from "express";
import { forgotPassword,registerUser,logoutUser,loginUser,resetPassword,verifyUser, me } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js";
import verifyJWT from "../middlewares/auth.middleware.js";
import { User } from "../models/user.model.js";

const router = Router();

router.route("/register").post(upload.single("avatar"),registerUser);
router.route("/verify/:token").get(verifyUser);
router.route("/login").post(loginUser);
router.route("/logout").post(logoutUser);
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password/:resetToken").post(resetPassword);
router.route("/me").get(verifyJWT,me);

export default router;