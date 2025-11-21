import { Router } from "express";
import {grantWriteAccess,kickParticipant,revokeWriteAccess} from "../controllers/participant.controller.js";
import verifyJWT from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT);

router.route("/grant-write").post(grantWriteAccess);
router.route("/revoke-write").post(revokeWriteAccess);
router.route("/kickParticipant").post(kickParticipant);

export default router;