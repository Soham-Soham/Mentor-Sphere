import { Router } from "express";
import {saveCodeSnapshot,getCodeHistory} from "../controllers/codeHistory.controller.js";
import verifyJWT from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT);

router.route("/save-code").post(saveCodeSnapshot);
router.route("/code-history/:roomId").get(getCodeHistory);

export default router; 