import { Router } from "express";
import { createAppointmentController, getAppointmentKPIsController, getAppointmentsPaginatedController, deleteAppointmentController, changeAppointmentStatusController, getAppointmentController } from "../controllers/appointment.controller.js";
import { getAppointmentAudioFilesController, uploadAudioFileToS3Controller, deleteAppointmentAudioFileController } from "../controllers/audio.controller.js";
import { uploadReportToS3Controller, getAppointmentReportsController, deleteAppointmentReportController, triggerReportExtractionController } from "../controllers/report.controller.js";
import { generateTranscriptController } from "../controllers/AiTranscript.controller.js";
import { getAppointmentSummaryController } from "../controllers/AiSummaryGenerater.js";
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

router.post("/:appointmentId/report/upload", verifyDoctorJWT, uploadReportToS3Controller)
router.get("/:appointmentId/report", verifyDoctorJWT, getAppointmentReportsController)
router.delete("/:appointmentId/report/:reportId", verifyDoctorJWT, deleteAppointmentReportController)
router.post("/:appointmentId/report/:reportId/extract", verifyDoctorJWT, triggerReportExtractionController)

router.get("/:appointmentId", verifyDoctorJWT, getAppointmentController)

router.post("/:appointmentId/transcript", verifyDoctorJWT, generateTranscriptController);

router.get("/:appointmentId/summary", verifyDoctorJWT, getAppointmentSummaryController)

export default router;
