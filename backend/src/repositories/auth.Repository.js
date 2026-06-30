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

export async function getRefreshTokenForPatient(tokenHash) {
    const result = await sql`
        SELECT *
        FROM refresh_tokens
        WHERE patient_id IS NOT NULL
          AND token_hash = ${tokenHash}
        ORDER BY id DESC
        LIMIT 1;
    `;

    return result?.[0] ?? null;
}

export async function getRefreshTokenForDoctor(tokenHash) {
    const result = await sql`
        SELECT *
        FROM refresh_tokens
        WHERE doctor_id IS NOT NULL
          AND token_hash = ${tokenHash}
        ORDER BY id DESC
        LIMIT 1;
    `;

    return result?.[0] ?? null;
}