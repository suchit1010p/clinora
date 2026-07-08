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

// get appointments in pagination by doctorId
export async function getAppointmentsPaginated(doctorId, page, limit) {
    const offset = (page - 1) * limit;

    const result = await sql`
        SELECT
            a.id,
            a.status,
            a.scheduled_at,
            a.completed_at,
            a.created_at,

            p.id AS patient_id,
            p.name AS patient_name,
            p.email,
            p.mobile,
            p.sex,
            p.date_of_birth

        FROM appointments AS a

        INNER JOIN patients AS p
            ON a.patient_id = p.id

        WHERE a.doctor_id = ${doctorId}

        ORDER BY a.scheduled_at DESC

        LIMIT ${limit}
        OFFSET ${offset};
    `;
    return result;
}

export async function getAppointmentKPIs(doctorId) {
    const result = await sql`
        SELECT 
            COUNT(*) AS total_appointments,

            COUNT(*) FILTER (
                WHERE status = 'completed'
            ) AS completed_appointments,

            COUNT(*) FILTER (
                WHERE status = 'pending'
            ) AS upcoming_appointments,

            COUNT(*)FILTER (
                WHERE status = 'cancelled'
            ) AS cancelled_appointments
        
        FROM appointments
        WHERE doctor_id = ${doctorId};
    `

    return result
}
