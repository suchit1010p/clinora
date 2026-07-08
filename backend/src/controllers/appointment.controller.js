import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { getDoctorById } from "../repositories/doctor.Repository.js";
import { getPatientById } from "../repositories/patient.Repository.js";
import { createAppointment, getAppointmentKPIs, getAppointmentsPaginated } from "../repositories/appointment.Repository.js";

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


export const getAppointmentsPaginatedController = asyncHandler(async (req, res) => {
    
    const doctorId = req.user.id;

    const pageNumber =
        Number(req.body.page) || 1;

    const pageSize =
        Number(req.body.limit) || 10;

    if (pageNumber < 1) {
        throw new ApiError(
            400,
            "Invalid page number"
        );
    }

    if ( pageSize < 1 || pageSize > 100 ) {
        throw new ApiError(
            400,
            "Limit must be between 1 and 100"
        );
    }

    const doctor = await getDoctorById(doctorId);

    if(!doctor) {
        throw new ApiError(404, "Doctor not found");
    }

    const result = await getAppointmentsPaginated(doctorId, pageNumber, pageSize);

    return res.status(200).json(
        new ApiResponse(
            200,
            result,
            "Appointments retrieved successfully"
        )
    )
    
});

export const getAppointmentKPIsController = asyncHandler(async (req, res) => {
    return await getAppointmentKPIs(req.user.id);
})

