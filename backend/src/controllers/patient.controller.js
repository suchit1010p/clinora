import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { getDoctorById } from "../repositories/doctor.Repository.js";
import { getPatientById, getPatientKPIs, getPatients } from "../repositories/patient.Repository.js";

export const getAllPatientController = asyncHandler(async (req, res) => {
    const doctorId = req.doctor.id;

    const pageNumber =
        Number(req.query.page) || 1;

    const pageSize =
        Number(req.query.limit) || 10;

    if (pageNumber < 1) {
        throw new ApiError(
            400,
            "Invalid page number"
        );
    }

    if ( pageSize < 1 || pageSize > 100 ) {
        throw new ApiError(
            400,
            "Limit must be between 1 and 100"
        );
    }

    const result = await getPatients(doctorId, pageNumber, pageSize);

    return res.status(200).json(
        new ApiResponse(
            200,
            result,
            "patients retrieved successfully"
        )
    )
})

export const getPatientKPIsController = asyncHandler(async (req, res) => {
    const result = await getPatientKPIs(req.doctor.id);
    return res.status(200).json(new ApiResponse(200, result, "patient KPIs retrieved successfully"));
})