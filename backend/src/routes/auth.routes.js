import { Router } from "express";
import { Login, RegisterDoctor, RegisterPatient } from "../controllers/auth.controller.js";

const router = Router();

router.post("/login", Login);
router.post("/doctor/register", RegisterDoctor);
router.post("/patient/register", RegisterPatient);

export default router;
