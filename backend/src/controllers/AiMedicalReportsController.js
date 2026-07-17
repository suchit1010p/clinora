import { GoogleGenAI } from "@google/genai";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import s3 from "../db/aws.js";
import { REPORT_EXTRACTION_PROMPT } from "./prompts/ReportExtractionPrompt.js";
import { createExtractionEntry } from "../repositories/reportExtraction.Repository.js";


/**
 * Fetch a file from S3 and return it as a Base64-encoded string.
 */
const fetchReportFromS3AsBase64 = async (s3Key) => {
    const command = new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: s3Key,
    });

    const response = await s3.send(command);

    if (!response.Body) {
        throw new Error("S3 response body is empty for key: " + s3Key);
    }

    const buffer = Buffer.from(await response.Body.transformToByteArray());
    return buffer.toString("base64");
};

/**
 * Call Gemini with the PDF data and return extracted text.
 */
const extractTextFromReport = async (base64Pdf, mimeType) => {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
            {
                role: "user",
                parts: [
                    {
                        inlineData: {
                            mimeType,           // e.g. "application/pdf" or "image/jpeg"
                            data: base64Pdf,
                        },
                    },
                    {
                        text: REPORT_EXTRACTION_PROMPT,
                    },
                ],
            },
        ],
    });

    return response.text;
};

/**
 * Upload extracted text as a .txt file to S3.
 * Returns the S3 key of the stored extraction.
 */
const storeExtractionToS3 = async (extractionKey, extractedText) => {
    const command = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: extractionKey,
        Body: extractedText,
        ContentType: "text/plain",
    });

    await s3.send(command);
    return extractionKey;
};

// Public: triggered after a report is successfully uploaded to S3

/**
 * Extract content from a medical report and persist the extraction.
 *
 * @param {string} reportKey      - S3 key of the uploaded report file
 * @param {string} appointmentId  - appointment the report belongs to
 * @param {number} reportId       - DB id of the report row
 * @param {string} contentType    - MIME type of the uploaded file (e.g. "application/pdf")
 *
 * This function is intentionally fire-and-forget (no await from caller).
 * All errors are caught and logged so they never crash the upload response.
 */
export const extractAndStoreReportContent = async (reportKey, appointmentId, reportId, contentType) => {
    try {
        console.log(`[ReportExtraction] Starting extraction for report ${reportId} | key: ${reportKey}`);

        // 1. Fetch the report from S3 as base64
        let base64Report;
        try {
            base64Report = await fetchReportFromS3AsBase64(reportKey);
            console.log(`[ReportExtraction] Fetched report from S3 for report ${reportId}`);
        } catch (fetchError) {
            console.error(`[ReportExtraction] Failed to fetch report from S3:`, fetchError.message);
            return;
        }

        // 2. Extract text using Gemini
        let extractedText;
        try {
            extractedText = await extractTextFromReport(base64Report, contentType || "application/pdf");
            console.log(`[ReportExtraction] Gemini extraction complete for report ${reportId}`);
        } catch (aiError) {
            console.error(`[ReportExtraction] Gemini extraction failed:`, aiError.message);
            return;
        }

        // 3. Build the extraction S3 key (mirrors the report path under /Extractions/)
        const extractionKey = reportKey.replace(
            /\/([^/]+)\.[^/.]+$/,
            "/Extractions/$1.txt"
        );
        console.log(`[ReportExtraction] Extraction key: ${extractionKey}`);

        // 4. Store extraction text to S3
        try {
            await storeExtractionToS3(extractionKey, extractedText);
            console.log(`[ReportExtraction] Extraction stored in S3 for report ${reportId}`);
        } catch (s3Error) {
            console.error(`[ReportExtraction] Failed to store extraction in S3:`, s3Error.message);
            return;
        }

        // 5. Store extraction key in DB
        try {
            await createExtractionEntry(extractionKey, appointmentId, reportId);
            console.log(`[ReportExtraction] Extraction DB entry created for report ${reportId}`);
        } catch (dbError) {
            console.error(`[ReportExtraction] Failed to store extraction in DB:`, dbError.message);
        }

    } catch (unexpectedError) {
        console.error(`[ReportExtraction] Unexpected error:`, unexpectedError.message);
    }
};
