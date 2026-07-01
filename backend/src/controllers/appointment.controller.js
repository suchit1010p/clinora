import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { getDoctorById } from "../repositories/doctor.Repository.js";
import { getPatientById } from "../repositories/patient.Repository.js";
import { createAppointment } from "../repositories/appointment.Repository.js";

export const createAppointmentController = asyncHandler(async (req, res) => {
    const { patientId, doctorId, scheduledAt } = req.body;

    if (!patientId || !doctorId || !scheduledAt) {
        throw new ApiError(400, "patientId, doctorId, and scheduledAt are required");
    }

    const patient = await getPatientById(patientId);
    if (!patient) {
        throw new ApiError(404, "Patient not found");
    }

    const doctor = await getDoctorById(doctorId);
    if (!doctor) {
        throw new ApiError(404, "Doctor not found");
    }

    const scheduledDate = new Date(scheduledAt);
    if (Number.isNaN(scheduledDate.getTime())) {
        throw new ApiError(400, "scheduledAt must be a valid date/time");
    }

    const appointment = await createAppointment({
        patientId,
        doctorId,
        scheduledAt: scheduledDate,
        status: "pending"
    });

    return res.status(201).json(new ApiResponse(201, { appointment }, "Appointment created successfully"));
});
