import { Router } from "express";
import { getAllPatientController, getPatientKPIsController } from "../controllers/patient.controller.js";

import { verifyDoctorJWT } from "../middlewares/auth.doctor.middleware.js";

const router = Router();

router.get("/", verifyDoctorJWT, getAllPatientController)
router.get('/kpi', verifyDoctorJWT, getPatientKPIsController);


export default router