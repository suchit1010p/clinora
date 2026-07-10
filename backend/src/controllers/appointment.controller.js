import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { getDoctorById } from "../repositories/doctor.Repository.js";
import { getPatientById } from "../repositories/patient.Repository.js";
import { createAppointment, getAppointmentById, getAppointmentKPIs, getAppointmentsPaginated, updateAppointmentStatus, deleteAppointment, getAppointment } from "../repositories/appointment.Repository.js";

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
    
    const doctorId = req.doctor.id;

    const pageNumber =
        Number(req.query.page) || 1;

    const pageSize =
        Number(req.query.limit) || 10;

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
    const result = await getAppointmentKPIs(req.doctor.id);
    return res.status(200).json(new ApiResponse(200, result, "Appointment KPIs retrieved successfully"));
})

export const getAppointmentController = asyncHandler(async (req, res) => {
    const { appointmentId } = req.params;
    let result 
    try {
        result = await getAppointment(req.doctor.id);
    } catch (error) {
        throw new ApiError(400, "error while getting the appointment data")
    }

    
    return res.status(200).json(new ApiResponse(200, result, "Appointment data retrieved successfully"));
})

export const changeAppointmentStatusController = asyncHandler(async (req, res) => {
    const { appointmentId } = req.body;
    const { status } = req.body;

    if (!appointmentId || !status) {
        throw new ApiError(400, "appointmentId and status are required");
    }

    const appointment = await getAppointmentById(appointmentId);
    if (!appointment) {
        throw new ApiError(404, "Appointment not found");
    }

    if (appointment.doctor_id !== req.doctor.id) {
        throw new ApiError(403, "You are not authorized to change the status of this appointment");
    }

    const validStatuses = ["pending", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
        throw new ApiError(400, "Invalid status value");
    }

    const updatedAppointment = await updateAppointmentStatus(appointmentId, status);

    return res.status(200).json(new ApiResponse(200, { appointment: updatedAppointment }, "Appointment status updated successfully"));
});




export const deleteAppointmentController = asyncHandler(async (req, res) => {
    const { appointmentId } = req.body;

    if (!appointmentId) {
        throw new ApiError(400, "appointmentId is required");
    }

    const appointment = await getAppointmentById(appointmentId);
    if (!appointment) {
        throw new ApiError(404, "Appointment not found");
    }

    if (appointment.doctor_id !== req.doctor.id) {
        throw new ApiError(403, "You are not authorized to delete this appointment");
    }

    await deleteAppointment(appointmentId);

    return res.status(200).json(new ApiResponse(200, null, "Appointment deleted successfully"));
});

