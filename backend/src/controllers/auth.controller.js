import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import bcrypt from "bcrypt";
import { createPatient, getPatientByMail, getPatientByMobile } from "../repositories/patient.Repository.js";
import { createDoctor, getDoctorByMail } from "../repositories/doctor.Repository.js";
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
            new ApiResponse(201, {user: safeuser}, "Login successfull")
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
