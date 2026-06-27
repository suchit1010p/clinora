import jwt from "jsonwebtoken"
import { asyncHandler } from "../utils/asyncHandler"
import { ApiError } from "../utils/ApiError"
import { getPatientById } from "../repositories/patient.Repository"


export const verifyPatientJWT = async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        
        // console.log(token);
        if (!token) {
            throw new ApiError(401, "Unauthorized request")
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const patient = await getPatientById(decodedToken?.id)
    
        if (!patient) {
            throw new ApiError(401, "Invalid Access Token")
        }
    
        req.patient = patient;
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }
}