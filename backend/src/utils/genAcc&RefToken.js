import { createRefreshTokenForDoctor, createRefreshTokenForPatient } from "../repositories/auth.Repository.js";
import { getDoctorById } from "../repositories/doctor.Repository.js";
import { getPatientById } from "../repositories/patient.Repository.js";
import { ApiError } from "./ApiError.js"
import jwt from "jsonwebtoken"


const generateAccessAndRefereshTokensForPatient = async (patientId) => {
    try {
        const patient = await getPatientById(patientId);

        if(!patient) {
            throw new ApiError(404, "patient not found")
        }

        const accessToken = generateAccesstoken(patient, "patient")
        const refreshToken = generateRefreshToken(patient, "patient")

        await createRefreshTokenForPatient(patientId, refreshToken, process.env.REFRESH_TOKEN_EXPIRY)
        
        return {accessToken, refreshToken}
    } catch (error) {
        throw new ApiError(500, "Token generation failed");
    }
}


const generateAccessAndRefereshTokensForDoctor = async (doctorId) => {
    try {
        const doctor = await getDoctorById(doctorId);

        if(!doctor) {
            throw new ApiError(404, "patient not found")
        }

        const accessToken = generateAccesstoken(doctor, "doctor")
        const refreshToken = generateRefreshToken(doctor, "doctor")

        await createRefreshTokenForDoctor(doctorId, refreshToken, process.env.REFRESH_TOKEN_EXPIRY)
        
        return {accessToken, refreshToken}
    } catch (error) {
        throw new ApiError(500, "Token generation failed");
    }
}

const generateAccesstoken = async (user, role) => {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: role
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

const generateRefreshtoken = async (user, role) => {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: role
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export { generateAccessAndRefereshTokensForDoctor, generateAccessAndRefereshTokensForPatient }