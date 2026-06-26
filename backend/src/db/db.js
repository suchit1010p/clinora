import { neon } from "@neondatabase/serverless"

const connectDB = async () => {
    try {
        const sql = neon(process.env.DATABASE_URL)
        const result = await sql`SELECT version()`;
        if(result) {
            console.log("\nPostgreSQL is connected....!!")
        }
    } catch (error) {
        console.log(`PostgreSQL connection error: \n ${error}`)
    }
}

export default connectDB