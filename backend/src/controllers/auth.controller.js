import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createPatient, getPatientByMail, getPatientByMobile, getPatientById } from "../repositories/patient.Repository.js";
import { createDoctor, getDoctorByMail, getDoctorById } from "../repositories/doctor.Repository.js";
import { createRefreshTokenForDoctor, createRefreshTokenForPatient, getRefreshTokenForDoctor, getRefreshTokenForPatient } from "../repositories/auth.Repository.js";
import { generateAccessAndRefereshTokensForDoctor, generateAccessAndRefereshTokensForPatient } from "../utils/genAcc&RefToken.js";
import { ApiResponse } from "../utils/ApiResponse.js";



export const Login = asyncHandler(async (req,res) => {
    let { email, password, role } = req.body;

    email = email?.trim();
    password = password?.trim();

    if(!email || !password) {
        throw new ApiError(400, "email and password both required");
    }

    const user = role === "patient" ? await getPatientByMail(email) : await getDoctorByMail(email);


    if (!user) {
        throw new ApiError(404, "user does not exist, Please register!!")
    }

    const storedPassword = user.password_hash || user.password;
    const isPasswordCorrect = await bcrypt.compare(password, storedPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid user credentials")
    }

    const { accessToken, refreshToken } = role == 'patient' ? await generateAccessAndRefereshTokensForPatient(user.id) : await generateAccessAndRefereshTokensForDoctor(user.id)
    
    const safeuser = { ...user };
    delete safeuser.password_hash;
    
    const options = {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
    };

    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, { user: safeuser }, "Login successful")
        )
}) 

// RegisterDoctor

export const RegisterDoctor = asyncHandler(async (req, res) => {
    let { name, specialization, email, password } = req.body;

    name = name?.trim();
    specialization = specialization?.trim();
    email = email?.trim();
    password = password?.trim();

    if (!name || !specialization || !email || !password) {
        throw new ApiError(400, "name, specialization, email and password are required");
    }

    const existing = await getDoctorByMail(email);
    if (existing) {
        throw new ApiError(409, "doctor with this email already exists");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const doctor = await createDoctor({ name, specialization, email, passwordHash });

    const { accessToken, refreshToken } = await generateAccessAndRefereshTokensForDoctor(doctor.id);

    const safeDoctor = { ...doctor };
    delete safeDoctor.password_hash;

    const options = {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
    };

    return res.status(201)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(201, { doctor: safeDoctor }, "Registration successful"));
});

export const RegisterPatient = asyncHandler(async (req, res) => {
    let { name, dateOfBirth, sex, mobile, email, password } = req.body;

    name = name?.trim();
    dateOfBirth = dateOfBirth?.trim();
    sex = sex?.trim();
    mobile = mobile?.trim();
    email = email?.trim();
    password = password?.trim();

    if (!name || !dateOfBirth || !sex || !mobile || !email || !password) {
        throw new ApiError(400, "name, dateOfBirth, sex, mobile, email and password are required");
    }

    const existingByEmail = await getPatientByMail(email);
    if (existingByEmail) {
        throw new ApiError(409, "patient with this email already exists");
    }

    const existingByMobile = await getPatientByMobile(mobile);
    if (existingByMobile) {
        throw new ApiError(409, "patient with this mobile already exists");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const patient = await createPatient({ name, dateOfBirth, sex, mobile, email, passwordHash });

    const { accessToken, refreshToken } = await generateAccessAndRefereshTokensForPatient(patient.id);

    const safePatient = { ...patient };
    delete safePatient.password_hash;

    const options = {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
    };

    return res.status(201)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(201, { patient: safePatient }, "Registration successful"));
});


// refreshAccessToken 

export const refreshAccessToken = asyncHandler(async (req, res) => {
    const token = req.cookies?.refreshToken || req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
        throw new ApiError(401, "Refresh token missing");
    }

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    } catch (error) {
        throw new ApiError(401, "Invalid refresh token");
    }

    const isPatient = decoded?.role === "patient";
    const refreshTokenRow = isPatient
        ? await getRefreshTokenForPatient(token)
        : await getRefreshTokenForDoctor(token);

    if (!refreshTokenRow) {
        throw new ApiError(401, "Refresh token not found");
    }

    const user = isPatient
        ? await getPatientById(decoded.id)
        : await getDoctorById(decoded.id);

    if (!user) {
        throw new ApiError(401, "User not found");
    }

    const { accessToken, refreshToken: newRefreshToken } = isPatient
        ? await generateAccessAndRefereshTokensForPatient(user.id)
        : await generateAccessAndRefereshTokensForDoctor(user.id);

    const safeUser = { ...user };
    delete safeUser.password;
    delete safeUser.password_hash;

    const options = {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
    };

    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(new ApiResponse(200, { user: safeUser }, "Token refreshed"));
});

export const getMe = asyncHandler(async (req, res) => {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
        throw new ApiError(401, "Access token missing");
    }

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (error) {
        throw new ApiError(401, "Invalid access token");
    }

    const user = decoded?.role === "patient"
        ? await getPatientById(decoded.id)
        : await getDoctorById(decoded.id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const safeUser = { ...user };
    delete safeUser.password;
    delete safeUser.password_hash;

    return res.status(200).json(new ApiResponse(200, { user: safeUser }, "User info retrieved"));
});
