import { Router } from "express";
import { Login, RegisterDoctor, RegisterPatient, refreshAccessToken, getMe } from "../controllers/auth.controller.js";

const router = Router();

router.post("/login", Login);
router.post("/doctor/register", RegisterDoctor);
router.post("/patient/register", RegisterPatient);
router.post("/refresh-token", refreshAccessToken);
router.get("/me", getMe);

export default router;
