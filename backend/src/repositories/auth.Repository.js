import { sql } from "../db/db.js";

export async function createRefreshTokenForPatient(
    patientId,
    tokenHash,
    expiresAt
) {
    const result = await sql`
        INSERT INTO refresh_tokens (
            patient_id,
            token_hash,
            expires_at
        )
        VALUES (${patientId}, ${tokenHash}, ${expiresAt})
        RETURNING *;
    `;

    return result?.[0] ?? null;
}

export async function createRefreshTokenForDoctor(
    doctorId,
    tokenHash,
    expiresAt
) {
    const result = await sql`
        INSERT INTO refresh_tokens (
            doctor_id,
            token_hash,
            expires_at
        )
        VALUES (${doctorId}, ${tokenHash}, ${expiresAt})
        RETURNING *;
    `;

    return result?.[0] ?? null;
}