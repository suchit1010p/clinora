import { sql } from "../db/db.js";

export async function createDoctor({ name, specialization, email, passwordHash }) {
    const result = await sql`
        INSERT INTO doctors (
            name,
            specialization,
            email,
            password_hash
        )
        VALUES (${name}, ${specialization}, ${email}, ${passwordHash})
        RETURNING *;
    `;

    return result?.[0] ?? null;
}

export async function getDoctorById(id) {
    const result = await sql`
        SELECT *
        FROM doctors
        WHERE id = ${id};
    `;

    return result?.[0] ?? null;
}

export async function getDoctorByMail(email) {
    const result = await sql`
        SELECT *
        FROM doctors
        WHERE email = ${email};
    `;

    return result?.[0] ?? null;
}