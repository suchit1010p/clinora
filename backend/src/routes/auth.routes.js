import { Router } from "express";
import { Login, RegisterDoctor, RegisterPatient, RegisterPatientForBooking, refreshAccessToken, getMe, checkPatientForBooking } from "../controllers/auth.controller.js";

const router = Router();

router.post("/login", Login);
router.post("/doctor/register", RegisterDoctor);
router.post("/patient/register", RegisterPatient);
router.post("/patient/register-booking", RegisterPatientForBooking);
router.get("/patient/check", checkPatientForBooking);
router.post("/refresh-token", refreshAccessToken);
router.get("/me", getMe);

export default router;
