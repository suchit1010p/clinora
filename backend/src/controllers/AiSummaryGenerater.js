import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { getAppointmentById } from "../repositories/appointment.Repository.js";
import { getDoctorById } from "../repositories/doctor.Repository.js";
import { getPatientById } from "../repositories/patient.Repository.js";
import { GoogleGenAI } from "@google/genai";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import s3 from "../db/aws.js";
import { sql } from "../db/db.js";
import { deleteFileFromS3 } from "../utils/s3.js";
import { getSummaryPrompt } from "./prompts/SummaryPrompt.js";

const sanitizeForS3 = (name) => {
    if (!name) return "unknown";
    return name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "_")
        .replace(/_+/g, "_");
};

/**
 * GET /:appointmentId/summary
 *
 * 1. Fetch all audio transcripts (audio_extractions) for the appointment from S3
 * 2. Fetch all report extraction texts (report_extractions) for the appointment from S3
 * 3. Call Gemini with the combined data + summary system prompt
 * 4. Store the summary JSON to S3 and the file_url in ai_summaries table
 * 5. Return the summary to the frontend
 */
export const getAppointmentSummaryController = asyncHandler(async (req, res) => {
    const { appointmentId } = req.params;

    if (!appointmentId) {
        throw new ApiError(400, "appointmentId is required");
    }

    // Verify appointment exists and belongs to this doctor
    const appointment = await getAppointmentById(appointmentId);
    if (!appointment) {
        throw new ApiError(404, "Appointment not found");
    }

    if (appointment.doctor_id !== req.doctor.id) {
        throw new ApiError(403, "You are not authorized to access this appointment");
    }

    // Check if a summary already exists — if so, fetch from S3 and return
    const existingSummary = await getExistingSummary(appointmentId);
    if (existingSummary) {
        try {
            const summaryText = await fetchTextFromS3(existingSummary.summary);
            return res.status(200).json(
                new ApiResponse(200, { summary: JSON.parse(summaryText) }, "Summary retrieved successfully")
            );
        } catch (err) {
            console.error("[Summary] Failed to fetch existing summary from S3:", err.message);
            // If the S3 file is missing, return 404 so it can be regenerated manually
            throw new ApiError(404, "Summary file not found on storage");
        }
    }

    throw new ApiError(404, "Summary not found for this appointment");
});


/**
 * POST /:appointmentId/summary
 *
 * 1. Fetch all audio transcripts (audio_extractions) for the appointment from S3
 * 2. Fetch all report extraction texts (report_extractions) for the appointment from S3
 * 3. Call Gemini with the combined data + summary system prompt
 * 4. Store the summary JSON to S3 and the file_url in ai_summaries table
 * 5. Return the summary to the frontend
 */
export const generateAppointmentSummaryController = asyncHandler(async (req, res) => {
    const { appointmentId } = req.params;

    if (!appointmentId) {
        throw new ApiError(400, "appointmentId is required");
    }

    // Verify appointment exists and belongs to this doctor
    const appointment = await getAppointmentById(appointmentId);
    if (!appointment) {
        throw new ApiError(404, "Appointment not found");
    }

    if (appointment.doctor_id !== req.doctor.id) {
        throw new ApiError(403, "You are not authorized to access this appointment");
    }

    // Check if a summary already exists — if so, fetch from S3 and return
    const existingSummary = await getExistingSummary(appointmentId);
    if (existingSummary) {
        try {
            const summaryText = await fetchTextFromS3(existingSummary.summary);
            return res.status(200).json(
                new ApiResponse(200, { summary: JSON.parse(summaryText) }, "Summary already exists")
            );
        } catch (err) {
            console.error("[Summary] Failed to fetch existing summary from S3, regenerating:", err.message);
            // If the S3 file is missing, fall through and generate
        }
    }

    // 1. Get all audio transcripts from S3
    const transcriptTexts = await fetchAllTranscripts(appointmentId);
    console.log(`[Summary] Found ${transcriptTexts.length} transcript(s) for appointment ${appointmentId}`);

    // 2. Get all report extraction texts from S3
    const reportTexts = await fetchAllReportExtractions(appointmentId);
    console.log(`[Summary] Found ${reportTexts.length} report extraction(s) for appointment ${appointmentId}`);

    if (transcriptTexts.length === 0 && reportTexts.length === 0) {
        throw new ApiError(400, "No transcripts or report extractions found. Please generate transcripts or upload reports first.");
    }

    // 3. Combine all texts
    const combinedTranscript = transcriptTexts.join("\n\n--- Next Recording ---\n\n");
    const combinedReportText = reportTexts.join("\n\n--- Next Report ---\n\n");

    // 4. Call Gemini to generate summary
    const summaryData = await generateSummaryWithGemini(combinedTranscript, combinedReportText);
    console.log(`[Summary] Gemini summary generated for appointment ${appointmentId}`);

    // 5. Build S3 key and store summary JSON to S3
    const doctor = await getDoctorById(req.doctor.id);
    const patient = await getPatientById(appointment.patient_id);

    const doctorName = sanitizeForS3(doctor?.name || "doctor");
    const patientName = sanitizeForS3(patient?.name || "patient");

    const summaryKey = `summary/${doctorName}_${req.doctor.id}/${patientName}_${appointment.patient_id}/${appointmentId}/summary.json`;

    await storeSummaryToS3(summaryKey, summaryData);
    console.log(`[Summary] Summary stored in S3: ${summaryKey}`);

    console.log("summary data : \n", summaryData);

    // 6. Store S3 file_url in ai_summaries table
    // If an old (broken) row exists, delete it first
    if (existingSummary) {
        await deleteSummaryFromDB(existingSummary.id);
    }
    await storeSummaryInDB(appointmentId, summaryKey);
    console.log(`[Summary] Summary DB entry created for appointment ${appointmentId}`);

    // 7. Return summary
    return res.status(200).json(
        new ApiResponse(200, { summary: summaryData }, "Summary generated successfully")
    );
});


/**
 * DELETE /:appointmentId/summary
 *
 * Delete the AI-generated summary from both S3 and the ai_summaries table.
 */
export const deleteAppointmentSummaryController = asyncHandler(async (req, res) => {
    const { appointmentId } = req.params;

    if (!appointmentId) {
        throw new ApiError(400, "appointmentId is required");
    }

    const appointment = await getAppointmentById(appointmentId);
    if (!appointment) {
        throw new ApiError(404, "Appointment not found");
    }

    if (appointment.doctor_id !== req.doctor.id) {
        throw new ApiError(403, "You are not authorized to access this appointment");
    }

    const existingSummary = await getExistingSummary(appointmentId);
    if (!existingSummary) {
        throw new ApiError(404, "No summary found for this appointment");
    }

    // 1. Delete from S3
    try {
        await deleteFileFromS3(existingSummary.summary);
        console.log(`[Summary] Deleted from S3: ${existingSummary.summary}`);
    } catch (s3Error) {
        console.error("[Summary] Failed to delete summary from S3, continuing:", s3Error.message);
    }

    // 2. Delete from DB
    await deleteSummaryFromDB(existingSummary.id);
    console.log(`[Summary] DB entry deleted for appointment ${appointmentId}`);

    return res.status(200).json(
        new ApiResponse(200, null, "Summary deleted successfully")
    );
});


// ─── Helper Functions ────────────────────────────────────────────────

/**
 * Check if a summary already exists in the ai_summaries table.
 * The `summary` column now stores the S3 file_url.
 */
async function getExistingSummary(appointmentId) {
    const result = await sql`
        SELECT id, summary, created_at
        FROM ai_summaries
        WHERE appointment_id = ${appointmentId}
        ORDER BY created_at DESC
        LIMIT 1;
    `;
    return result?.[0] ?? null;
}

/**
 * Fetch all audio transcript file URLs for an appointment,
 * then download each from S3 and return as an array of text strings.
 */
async function fetchAllTranscripts(appointmentId) {
    const rows = await sql`
        SELECT file_url FROM audio_extractions
        WHERE appointment_id = ${appointmentId};
    `;

    const texts = [];
    for (const row of rows) {
        try {
            const text = await fetchTextFromS3(row.file_url);
            texts.push(text);
        } catch (err) {
            console.error(`[Summary] Failed to fetch transcript from S3: ${row.file_url}`, err.message);
        }
    }
    return texts;
}

/**
 * Fetch all report extraction file URLs for an appointment,
 * then download each from S3 and return as an array of text strings.
 */
async function fetchAllReportExtractions(appointmentId) {
    const rows = await sql`
        SELECT file_url FROM report_extractions
        WHERE appointment_id = ${appointmentId};
    `;

    const texts = [];
    for (const row of rows) {
        try {
            const text = await fetchTextFromS3(row.file_url);
            texts.push(text);
        } catch (err) {
            console.error(`[Summary] Failed to fetch report extraction from S3: ${row.file_url}`, err.message);
        }
    }
    return texts;
}

/**
 * Download a text file from S3 and return its content as a string.
 */
async function fetchTextFromS3(s3Key) {
    const command = new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: s3Key,
    });

    const response = await s3.send(command);

    if (!response.Body) {
        throw new Error("S3 response body is empty for key: " + s3Key);
    }

    const buffer = Buffer.from(await response.Body.transformToByteArray());
    return buffer.toString("utf-8");
}

/**
 * Call Gemini with the transcript + report text and return parsed JSON.
 */
async function generateSummaryWithGemini(transcript, reportText) {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const prompt = getSummaryPrompt(transcript || "No transcript available.", reportText || "No medical reports available.");

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
            {
                role: "user",
                parts: [{ text: prompt }],
            },
        ],
    });

    console.log("------------------------------------------------------");
    console.log(response.usageMetadata);
    console.log("------------------------------------------------------");

    let rawText = response.text;

    // Strip markdown code fences if Gemini wraps the JSON
    rawText = rawText.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim();

    try {
        return JSON.parse(rawText);
    } catch (parseError) {
        console.error("[Summary] Failed to parse Gemini response as JSON:", rawText);
        throw new ApiError(500, "AI returned invalid JSON. Please try again.");
    }
}

/**
 * Upload the summary JSON to S3.
 */
async function storeSummaryToS3(s3Key, summaryData) {
    const command = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: s3Key,
        Body: JSON.stringify(summaryData, null, 2),
        ContentType: "application/json",
    });

    await s3.send(command);
}

/**
 * Store the S3 file_url in the ai_summaries table (summary column holds the S3 key).
 */
async function storeSummaryInDB(appointmentId, s3Key) {
    await sql`
        INSERT INTO ai_summaries (appointment_id, summary)
        VALUES (${appointmentId}, ${s3Key});
    `;
}

/**
 * Delete a summary row from the ai_summaries table.
 */
async function deleteSummaryFromDB(summaryId) {
    await sql`
        DELETE FROM ai_summaries
        WHERE id = ${summaryId};
    `;
}