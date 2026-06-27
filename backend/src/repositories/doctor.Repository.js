import { sql } from "../db/db";

export async function getDoctorById(id) {

    const query = `
        SELECT *
        FROM doctors
        WHERE id = $1;
    `;

    const result = await sql.query(
        query,
        [id]
    );

    return result.rows[0];
}