import { sql } from "../db/db.js";

export async function createPatient({ name, dateOfBirth, sex, mobile, email, passwordHash }) {
    const result = await sql`
        INSERT INTO patients (
            name,
            date_of_birth,
            sex,
            mobile,
            email,
            password_hash
        )
        VALUES (${name}, ${dateOfBirth}, ${sex}, ${mobile}, ${email}, ${passwordHash})
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