import { sql } from "../db/db.js";

export async function createReportEntry(key, appointmentId) {
    const result = await sql`
        INSERT INTO reports (
            file_url,
            appointment_id
        )
        VALUES (${key}, ${appointmentId})
        RETURNING *;
    `;

    return result?.[0] ?? null;
}

export async function getReportsByAppointmentId(appointmentId) {
    const result = await sql`
        SELECT id, file_url, appointment_id, created_at
        FROM reports
        WHERE appointment_id = ${appointmentId}
        ORDER BY created_at DESC;
    `;

    return result ?? [];
}

export async function getReportById(id) {
    const result = await sql`
        SELECT id, file_url, appointment_id, created_at
        FROM reports
        WHERE id = ${id};
    `;

    return result?.[0] ?? null;
}

export async function deleteReportEntry(id) {
    const result = await sql`
        DELETE FROM reports
        WHERE id = ${id}
        RETURNING *;
    `;

    return result?.[0] ?? null;
}
