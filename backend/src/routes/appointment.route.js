import { Router } from "express";
import { createAppointmentController, getAppointmentKPIsController, getAppointmentsPaginatedController, deleteAppointmentController, changeAppointmentStatusController, getAppointmentController } from "../controllers/appointment.controller.js";
import { getAppointmentAudioFilesController, uploadAudioFileToS3Controller, deleteAppointmentAudioFileController } from "../controllers/audio.controller.js";
import { verifyDoctorJWT } from "../middlewares/auth.doctor.middleware.js";

const router = Router();

router.get("/", verifyDoctorJWT, getAppointmentsPaginatedController)
router.get("/kpi", verifyDoctorJWT, getAppointmentKPIsController)
router.post("/create", verifyDoctorJWT, createAppointmentController);
router.delete("/delete", verifyDoctorJWT, deleteAppointmentController)
router.patch("/status", verifyDoctorJWT, changeAppointmentStatusController)

router.post("/:appointmentId/audio/upload", verifyDoctorJWT, uploadAudioFileToS3Controller)
router.get("/:appointmentId/audio", verifyDoctorJWT, getAppointmentAudioFilesController)
router.delete("/:appointmentId/audio/:audioId", verifyDoctorJWT, deleteAppointmentAudioFileController)
router.get("/:appointmentId", verifyDoctorJWT, getAppointmentController)

export default router;
