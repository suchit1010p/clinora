import { sql } from "../db/db.js";

export async function createAudioFileEntry(key, appointmentId) {
    const result = await sql`
        INSERT INTO audio_files (
            file_url,
            appointment_id
        )
        VALUES (${key}, ${appointmentId})
        RETURNING *;
    `;

    return result?.[0] ?? null;
}

export async function getAudioFilesByAppointmentId(appointmentId) {
    const result = await sql`
        SELECT id, file_url, appointment_id, created_at
        FROM audio_files
        WHERE appointment_id = ${appointmentId}
        ORDER BY created_at DESC;
    `;

    return result ?? [];
}

export async function getAudioFileById(id) {
    const result = await sql`
        SELECT id, file_url, appointment_id, created_at
        FROM audio_files
        WHERE id = ${id};
    `;

    return result?.[0] ?? null;
}

export async function deleteAudioFileEntry(id) {
    const result = await sql`
        DELETE FROM audio_files
        WHERE id = ${id}
        RETURNING *;
    `;

    return result?.[0] ?? null;
}