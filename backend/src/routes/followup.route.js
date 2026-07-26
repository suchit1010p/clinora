import { Router } from "express";


import { verifyDoctorJWT } from "../middlewares/auth.doctor.middleware.js";
import { generateFollowUps, checkFollowUps } from "../controllers/FollowUpAgent.controller.js";

const router = Router();

router.post("/:appointmentId/generate-followups", verifyDoctorJWT, generateFollowUps)
router.get("/:appointmentId/check-followups", verifyDoctorJWT, checkFollowUps)

export default router