import { sql } from "../db/db";

export async function getPatientById(id) {

    const query = `
        SELECT *
        FROM patients
        WHERE id = $1;
    `;

    const result = await sql.query(
        query,
        [id]
    );

    return result.rows[0];
}