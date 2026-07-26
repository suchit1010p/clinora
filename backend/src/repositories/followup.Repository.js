import { sql } from "../db/db.js";

export async function createFollowUpRepository(appointmentId, patientId, attempt, scheduled_at) {
    const result = await sql`
        INSERT INTO followup_sessions (
            appointment_id,
            patient_id,
            attempt,
            scheduled_at
        )
        VALUES (${appointmentId}, ${patientId}, ${attempt}, ${scheduled_at})
        RETURNING *;
    `;
    return result?.[0] ?? null;
}

export async function getFollowUpsByAppointmentId(appointmentId) {
    const result = await sql`
        SELECT * FROM followup_sessions WHERE appointment_id = ${appointmentId};
    `;
    return result ?? null;
}