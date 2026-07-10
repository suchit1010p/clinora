import { Router } from "express";
import { getAllPatientController, getPatientController, getPatientKPIsController } from "../controllers/patient.controller.js";

import { verifyDoctorJWT } from "../middlewares/auth.doctor.middleware.js";

const router = Router();

router.get("/", verifyDoctorJWT, getAllPatientController)
router.get('/kpi', verifyDoctorJWT, getPatientKPIsController);
router.get("/:patientId", verifyDoctorJWT, getPatientController)


export default router