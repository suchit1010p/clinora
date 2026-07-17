import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { getAppointmentById } from "../repositories/appointment.Repository.js";
import { createReportEntry, getReportsByAppointmentId, getReportById, deleteReportEntry } from "../repositories/report.Repository.js";
import { getDoctorById } from "../repositories/doctor.Repository.js";
import { getPatientById } from "../repositories/patient.Repository.js";
import { generatePresignedUploadUrl, generatePresignedDownloadUrl, deleteFileFromS3 } from "../utils/s3.js";
import { extractAndStoreReportContent } from "./AiMedicalReportsController.js";
import { getExtractionByReportId, deleteExtractionByReportId } from "../repositories/reportExtraction.Repository.js";

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

// Called by the frontend AFTER the S3 PUT succeeds — this is when the file actually exists
export const triggerReportExtractionController = asyncHandler(async (req, res) => {
    const { appointmentId, reportId } = req.params;
    const { contentType } = req.body;

    if (!appointmentId || !reportId) {
        throw new ApiError(400, "appointmentId and reportId are required");
    }

    const appointment = await getAppointmentById(appointmentId);
    if (!appointment) {
        throw new ApiError(404, "appointment doesn't exist");
    }

    if (appointment.doctor_id !== req.doctor.id) {
        throw new ApiError(403, "you are not authorized to trigger extraction for this appointment");
    }

    const reportFile = await getReportById(reportId);
    if (!reportFile) {
        throw new ApiError(404, "report file doesn't exist");
    }

    // Respond immediately — extraction runs fully in the background
    res.status(202).json(
        new ApiResponse(202, null, "Report extraction started")
    );

    // Fire-and-forget: file is now in S3, safe to extract
    extractAndStoreReportContent(
        reportFile.file_url,
        appointmentId,
        reportFile.id,
        contentType || "application/pdf"
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
        reports.map(async (file) => {
            const extraction = await getExtractionByReportId(file.id);
            return {
                ...file,
                downloadUrl: await generatePresignedDownloadUrl(file.file_url),
                has_extraction: !!extraction,
            };
        })
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

    // 1. Delete linked extraction from S3 and DB (if one exists)
    const extraction = await getExtractionByReportId(reportId);
    if (extraction) {
        try {
            await deleteFileFromS3(extraction.file_url);
            console.log("Report extraction deleted from S3:", extraction.file_url);
        } catch (s3ExtractionError) {
            console.error("Failed to delete report extraction from S3, continuing:", s3ExtractionError);
        }

        try {
            await deleteExtractionByReportId(reportId);
            console.log("Report extraction DB record deleted for report_id:", reportId);
        } catch (dbExtractionError) {
            console.error("Failed to delete report extraction DB record, continuing:", dbExtractionError);
        }
    } else {
        console.log("No extraction found for report_id:", reportId, "— skipping extraction cleanup");
    }

    // 2. Delete report file from AWS S3
    try {
        await deleteFileFromS3(reportFile.file_url);
    } catch (s3Error) {
        console.error("Failed to delete report file from S3, continuing with DB deletion:", s3Error);
    }

    // 3. Delete report database entry
    await deleteReportEntry(reportId);

    return res.status(200).json(
        new ApiResponse(200, null, "Report file deleted successfully")
    );
});
