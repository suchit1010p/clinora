import { sql } from "../db/db.js";

export async function createAppointment({ patientId, doctorId, scheduledAt, status = "scheduled", completedAt = null }) {
    const result = await sql`
        INSERT INTO appointments (
            patient_id,
            doctor_id,
            status,
            scheduled_at,
            completed_at
        )
        VALUES (${patientId}, ${doctorId}, ${status}, ${scheduledAt}, ${completedAt})
        RETURNING *;
    `;

    return result?.[0] ?? null;
}

export async function getAppointmentById(appointmentId) {
    const result = await sql`
        SELECT * FROM appointments WHERE id = ${appointmentId};
    `;

    return result?.[0] ?? null;
}

export async function getAppointmentByName(username) {
    const result = await sql`
        SELECT * FROM appointments 
        JOIN patients ON 
        appointments.patient_id = patients.id 
        WHERE patients.name = ${username};
    `;

    return result?.[0] ?? null;
}

