import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { getAppointmentById } from "../repositories/appointment.Repository.js";
import { createAudioFileEntry, getAudioFilesByAppointmentId } from "../repositories/audioFile.Repository.js";
import { generatePresignedUploadUrl, generatePresignedDownloadUrl } from "../utils/s3.js";

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

    const safeFileName = fileName || `${Date.now()}-${appointmentId}.mp3`;
    const resolvedContentType = contentType || "audio/mpeg";
    const audioFileKey = `audioFiles/${req.doctor.id}/${appointment.patient_id}/${appointmentId}/${safeFileName}`;

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

