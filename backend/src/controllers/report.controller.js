import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { getAppointmentById } from "../repositories/appointment.Repository.js";
import { createReportEntry, getReportsByAppointmentId, getReportById, deleteReportEntry } from "../repositories/report.Repository.js";
import { getDoctorById } from "../repositories/doctor.Repository.js";
import { getPatientById } from "../repositories/patient.Repository.js";
import { generatePresignedUploadUrl, generatePresignedDownloadUrl, deleteFileFromS3 } from "../utils/s3.js";

const sanitizeForS3 = (name) => {
    if (!name) return "unknown";
    return name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "_")
        .replace(/_+/g, "_");
};

export const uploadReportToS3Controller = asyncHandler(async (req, res) => {
    const { appointmentId } = req.params;
    const { fileName, contentType } = req.body;
    
    if (!appointmentId) {
        throw new ApiError(400, "appointment id required");
    }

    const appointment = await getAppointmentById(appointmentId);
    if (!appointment) {
        throw new ApiError(404, "appointment doesn't exist");
    }

    if (appointment.doctor_id !== req.doctor.id) {
        throw new ApiError(403, "you are not authorized to upload reports for this appointment");
    }

    const doctor = await getDoctorById(req.doctor.id);
    const patient = await getPatientById(appointment.patient_id);

    const doctorName = sanitizeForS3(doctor?.name || "doctor");
    const patientName = sanitizeForS3(patient?.name || "patient");

    const safeFileName = fileName || `${Date.now()}-${appointmentId}.pdf`;
    const resolvedContentType = contentType || "application/pdf";
    const reportKey = `medicalReports/${doctorName}_${req.doctor.id}/${patientName}_${appointment.patient_id}/${appointmentId}/${safeFileName}`;

    const uploadUrl = await generatePresignedUploadUrl(reportKey, resolvedContentType);
    const reportEntry = await createReportEntry(reportKey, appointmentId);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                uploadUrl,
                reportKey,
                contentType: resolvedContentType,
                report: reportEntry,
            },
            "Presigned upload URL generated successfully"
        )
    );
});

export const getAppointmentReportsController = asyncHandler(async (req, res) => {
    const { appointmentId } = req.params;

    if (!appointmentId) {
        throw new ApiError(400, "appointment id required");
    }

    const appointment = await getAppointmentById(appointmentId);
    if (!appointment) {
        throw new ApiError(404, "appointment doesn't exist");
    }

    if (appointment.doctor_id !== req.doctor.id) {
        throw new ApiError(403, "you are not authorized to access reports for this appointment");
    }

    const reports = await getReportsByAppointmentId(appointmentId);

    const reportsWithUrls = await Promise.all(
        reports.map(async (file) => ({
            ...file,
            downloadUrl: await generatePresignedDownloadUrl(file.file_url),
        }))
    );

    return res.status(200).json(
        new ApiResponse(200, reportsWithUrls, "Medical reports retrieved successfully")
    );
});

export const deleteAppointmentReportController = asyncHandler(async (req, res) => {
    const { appointmentId, reportId } = req.params;

    if (!appointmentId || !reportId) {
        throw new ApiError(400, "appointmentId and reportId are required");
    }

    const appointment = await getAppointmentById(appointmentId);
    if (!appointment) {
        throw new ApiError(404, "appointment doesn't exist");
    }

    if (appointment.doctor_id !== req.doctor.id) {
        throw new ApiError(403, "you are not authorized to delete reports for this appointment");
    }

    const reportFile = await getReportById(reportId);
    if (!reportFile) {
        throw new ApiError(404, "report file doesn't exist");
    }

    if (reportFile.appointment_id !== Number(appointmentId)) {
        throw new ApiError(400, "report file does not belong to this appointment");
    }

    // 1. Delete file from AWS S3
    try {
        await deleteFileFromS3(reportFile.file_url);
    } catch (s3Error) {
        console.error("Failed to delete file from S3, continuing with DB deletion:", s3Error);
    }

    // 2. Delete database entry
    await deleteReportEntry(reportId);

    return res.status(200).json(
        new ApiResponse(200, null, "Report file deleted successfully")
    );
});
