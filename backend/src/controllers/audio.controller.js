import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { getAppointmentById } from "../repositories/appointment.Repository.js";
import { createAudioFileEntry, getAudioFilesByAppointmentId, getAudioFileById, deleteAudioFileEntry } from "../repositories/audioFile.Repository.js";
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

export const uploadAudioFileToS3Controller = asyncHandler(async (req, res) => {
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
        throw new ApiError(403, "you are not authorized to upload audio for this appointment");
    }

    const doctor = await getDoctorById(req.doctor.id);
    const patient = await getPatientById(appointment.patient_id);

    const doctorName = sanitizeForS3(doctor?.name || "doctor");
    const patientName = sanitizeForS3(patient?.name || "patient");

    const safeFileName = fileName || `${Date.now()}-${appointmentId}.mp3`;
    const resolvedContentType = contentType || "audio/mpeg";
    const audioFileKey = `audioFiles/${doctorName}_${req.doctor.id}/${patientName}_${appointment.patient_id}/${appointmentId}/${safeFileName}`;

    const uploadUrl = await generatePresignedUploadUrl(audioFileKey, resolvedContentType);
    const audioFileEntry = await createAudioFileEntry(audioFileKey, appointmentId);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                uploadUrl,
                audioFileKey,
                contentType: resolvedContentType,
                audioFile: audioFileEntry,
            },
            "Presigned upload URL generated successfully"
        )
    );
});

export const getAppointmentAudioFilesController = asyncHandler(async (req, res) => {
    const { appointmentId } = req.params;

    if (!appointmentId) {
        throw new ApiError(400, "appointment id required");
    }

    const appointment = await getAppointmentById(appointmentId);
    if (!appointment) {
        throw new ApiError(404, "appointment doesn't exist");
    }

    if (appointment.doctor_id !== req.doctor.id) {
        throw new ApiError(403, "you are not authorized to access audio for this appointment");
    }

    const audioFiles = await getAudioFilesByAppointmentId(appointmentId);

    const audioFilesWithUrls = await Promise.all(
        audioFiles.map(async (file) => ({
            ...file,
            downloadUrl: await generatePresignedDownloadUrl(file.file_url),
        }))
    );

    return res.status(200).json(
        new ApiResponse(200, audioFilesWithUrls, "Audio files retrieved successfully")
    );
});

export const deleteAppointmentAudioFileController = asyncHandler(async (req, res) => {
    const { appointmentId, audioId } = req.params;

    if (!appointmentId || !audioId) {
        throw new ApiError(400, "appointmentId and audioId are required");
    }

    const appointment = await getAppointmentById(appointmentId);
    if (!appointment) {
        throw new ApiError(404, "appointment doesn't exist");
    }

    if (appointment.doctor_id !== req.doctor.id) {
        throw new ApiError(403, "you are not authorized to delete audio for this appointment");
    }

    const audioFile = await getAudioFileById(audioId);
    if (!audioFile) {
        throw new ApiError(404, "audio file doesn't exist");
    }

    if (audioFile.appointment_id !== Number(appointmentId)) {
        throw new ApiError(400, "audio file does not belong to this appointment");
    }

    // 1. Delete file from AWS S3
    try {
        await deleteFileFromS3(audioFile.file_url);
    } catch (s3Error) {
        console.error("Failed to delete file from S3, continuing with DB deletion:", s3Error);
    }

    // 2. Delete database entry
    await deleteAudioFileEntry(audioId);

    return res.status(200).json(
        new ApiResponse(200, null, "Audio file deleted successfully")
    );
});

