import { sql } from "../db/db.js";

/**
 * Fetch the extraction record linked to a given report.
 * Returns null if no extraction has been generated yet.
 */
export async function getExtractionByReportId(reportId) {
    const result = await sql`
        SELECT id, file_url, appointment_id, report_id
        FROM report_extractions
        WHERE report_id = ${reportId}
        LIMIT 1;
    `;

    return result?.[0] ?? null;
}

/**
 * Delete the extraction record linked to a given report.
 * Returns the deleted row, or null if nothing was found.
 */
export async function deleteExtractionByReportId(reportId) {
    const result = await sql`
        DELETE FROM report_extractions
        WHERE report_id = ${reportId}
        RETURNING *;
    `;

    return result?.[0] ?? null;
}

/**
 * Create a new report extraction entry.
 */
export async function createExtractionEntry(fileUrl, appointmentId, reportId) {
    const result = await sql`
        INSERT INTO report_extractions (
            file_url,
            appointment_id,
            report_id
        )
        VALUES (${fileUrl}, ${appointmentId}, ${reportId})
        RETURNING *;
    `;

    return result?.[0] ?? null;
}
