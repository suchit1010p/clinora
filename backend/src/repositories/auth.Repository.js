import { sql } from "../db/db";

export async function createRefreshTokenForPatient(
    patientId,
    tokenHash,
    expiresAt
) {

    const query = `
        INSERT INTO refresh_tokens (
            patient_id,
            token_hash,
            expires_at
        )
        VALUES (
            $1,
            $2,
            $3
        )
        RETURNING *;
    `;

    const result = await sql.query(
        query,
        [
            patientId,
            tokenHash,
            expiresAt
        ]
    );

    return result.rows[0];
}

export async function createRefreshTokenForDoctor(
    doctorId,
    tokenHash,
    expiresAt
) {

    const query = `
        INSERT INTO refresh_tokens (
            doctor_id,
            token_hash,
            expires_at
        )
        VALUES (
            $1,
            $2,
            $3
        )
        RETURNING *;
    `;

    const result = await sql.query(
        query,
        [
            doctorId,
            tokenHash,
            expiresAt
        ]
    );

    return result.rows[0];
}