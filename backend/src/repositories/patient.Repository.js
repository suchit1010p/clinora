import { sql } from "../db/db.js";

export async function createPatient({ name, dateOfBirth, sex, mobile, email, passwordHash, blood_group }) {
    const result = await sql`
        INSERT INTO patients (
            name,
            date_of_birth,
            sex,
            mobile,
            email,
            password_hash,
            blood_group,
        )
        VALUES (${name}, ${dateOfBirth}, ${sex}, ${mobile}, ${email}, ${passwordHash}, ${blood_group},)
        RETURNING *;
    `;

    return result?.[0] ?? null;
}

export async function getPatientById(id) {
    const result = await sql`
        SELECT *
        FROM patients
        WHERE id = ${id};
    `;

    return result?.[0] ?? null;
}

export async function getPatientByMail(email) {
    const result = await sql`
        SELECT *
        FROM patients
        WHERE email = ${email};
    `;

    return result?.[0] ?? null;
}

export async function getPatientByMobile(mobile) {
    const result = await sql`
        SELECT *
        FROM patients
        WHERE mobile = ${mobile};
    `;

    return result?.[0] ?? null;
}

export async function getPatients(doctorId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    const result = await sql`
        SELECT DISTINCT
            p.id,
            p.name,
            p.email,
            p.mobile,
            p.sex,
            p.date_of_birth,
            p.created_at,

            COUNT (a.id) AS appointment_count
        FROM patients p

        INNER JOIN appointments a
            ON p.id = a.patient_id
        
        

        WHERE a.doctor_id = ${doctorId}
        
        GROUP BY
            p.id,
            p.name,
            p.email,
            p.mobile,
            p.sex,
            p.date_of_birth,
            p.created_at

        ORDER BY p.created_at DESC

        LIMIT ${limit}
        OFFSET ${offset};
    `;

    return result;
}

export async function getPatientKPIs(doctorId) {
    // total patients
    // new this month

    const result = await sql`
        SELECT
            COUNT (DISTINCT p.id) AS total_patients,
            COUNT(DISTINCT p.id)
                FILTER (
                    WHERE DATE_TRUNC('month', p.created_at)
                    = DATE_TRUNC('month', CURRENT_DATE)
                ) AS new_this_month

            FROM patients p

            INNER JOIN appointments a
                ON p.id = a.patient_id

            WHERE a.doctor_id = ${doctorId};
    `;


    return result?.[0] ?? null;
}


export const getPatient = async (patientId) => {
    const result = await sql`
        SELECT * FROM patients WHERE id = ${patientId}
    `

    return result[0]
}