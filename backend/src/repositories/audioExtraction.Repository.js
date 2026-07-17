import { sql } from "../db/db.js";

/**
 * Fetch the transcript extraction record linked to a given audio file.
 * Returns null if no transcript has been generated yet.
 */
export async function getTranscriptByAudioFileId(audioFileId) {
    const result = await sql`
        SELECT id, content, appointment_id, audio_file_id
        FROM audio_extractions
        WHERE audio_file_id = ${audioFileId}
        LIMIT 1;
    `;

    return result?.[0] ?? null;
}

/**
 * Delete the transcript extraction record linked to a given audio file.
 * Returns the deleted row, or null if nothing was found.
 */
export async function deleteTranscriptByAudioFileId(audioFileId) {
    const result = await sql`
        DELETE FROM audio_extractions
        WHERE audio_file_id = ${audioFileId}
        RETURNING *;
    `;

    return result?.[0] ?? null;
}
