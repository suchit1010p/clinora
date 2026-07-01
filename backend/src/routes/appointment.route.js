import { Router } from "express";
import { createAppointmentController } from "../controllers/appointment.controller.js";

const router = Router();

router.post("/", createAppointmentController);

export default router;
