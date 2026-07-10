import { Router } from "express";
import { createAppointmentController, getAppointmentKPIsController, getAppointmentsPaginatedController, deleteAppointmentController, changeAppointmentStatusController, getAppointmentController } from "../controllers/appointment.controller.js";
import { verifyDoctorJWT } from "../middlewares/auth.doctor.middleware.js";

const router = Router();

router.get("/", verifyDoctorJWT, getAppointmentsPaginatedController)
router.get("/:appointmentId", verifyDoctorJWT, getAppointmentController)
router.post("/create", verifyDoctorJWT, createAppointmentController);
router.get("/kpi", verifyDoctorJWT, getAppointmentKPIsController)
router.delete("/delete", verifyDoctorJWT, deleteAppointmentController)
router.patch("/status", verifyDoctorJWT, changeAppointmentStatusController)


export default router;
