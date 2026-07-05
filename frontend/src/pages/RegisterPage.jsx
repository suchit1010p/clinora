import React, { useState, useEffect } from 'react'
import Select from "react-select"
import "./styles/Register.css"
import { useDispatch, useSelector } from "react-redux";
import { registerAuth } from "../features/auth/authSlice.js";
import { useNavigate } from "react-router-dom";
const SpecializationFields = [
    "Allergy and Immunology",
    "Anesthesiology",
    "Cardiology",
    "Cardiothoracic Surgery",
    "Cardiovascular Surgery",
    "Clinical Genetics",
    "Clinical Immunology",
    "Clinical Neurophysiology",
    "Colorectal Surgery",
    "Critical Care Medicine",
    "Dentistry",
    "Dermatology",
    "Dermatopathology",
    "Developmental Pediatrics",
    "Diabetology",
    "Emergency Medicine",
    "Endocrinology",
    "Endocrine Surgery",
    "Family Medicine",
    "Forensic Medicine",
    "Forensic Pathology",
    "Gastroenterology",
    "General Medicine",
    "General Practice",
    "General Surgery",
    "Geriatric Medicine",
    "Geriatrics",
    "Gynecologic Oncology",
    "Gynecology",
    "Hematology",
    "Hematology and Oncology",
    "Hepatology",
    "Hospital Medicine",
    "Hyperbaric Medicine",
    "Immunology",
    "Infectious Disease",
    "Internal Medicine",
    "Interventional Cardiology",
    "Interventional Pain Medicine",
    "Interventional Radiology",
    "Maternal-Fetal Medicine",
    "Medical Genetics",
    "Medical Oncology",
    "Neonatology",
    "Nephrology",
    "Neurocritical Care",
    "Neurology",
    "Neuromuscular Medicine",
    "Neuroradiology",
    "Neurosurgery",
    "Nuclear Medicine",
    "Nutrition Medicine",
    "Obesity Medicine",
    "Obstetrics",
    "Obstetrics and Gynecology",
    "Occupational Medicine",
    "Ophthalmology",
    "Optometry",
    "Oral and Maxillofacial Surgery",
    "Orthodontics",
    "Orthopedic Oncology",
    "Orthopedic Surgery",
    "Orthopedics",
    "Otolaryngology",
    "Pain Management",
    "Palliative Care",
    "Pathology",
    "Pediatric Cardiology",
    "Pediatric Critical Care",
    "Pediatric Dentistry",
    "Pediatric Dermatology",
    "Pediatric Endocrinology",
    "Pediatric Gastroenterology",
    "Pediatric Hematology",
    "Pediatric Infectious Disease",
    "Pediatric Intensive Care",
    "Pediatric Nephrology",
    "Pediatric Neurology",
    "Pediatric Neurosurgery",
    "Pediatric Oncology",
    "Pediatric Ophthalmology",
    "Pediatric Orthopedics",
    "Pediatric Otolaryngology",
    "Pediatric Pulmonology",
    "Pediatric Radiology",
    "Pediatric Rheumatology",
    "Pediatric Surgery",
    "Pediatric Urology",
    "Pediatrics",
    "Periodontics",
    "Physical Medicine and Rehabilitation",
    "Plastic Surgery",
    "Preventive Medicine",
    "Primary Care",
    "Proctology",
    "Psychiatry",
    "Child and Adolescent Psychiatry",
    "Addiction Psychiatry",
    "Geriatric Psychiatry",
    "Forensic Psychiatry",
    "Psychosomatic Medicine",
    "Public Health",
    "Pulmonary Medicine",
    "Pulmonology",
    "Radiation Oncology",
    "Radiology",
    "Reconstructive Surgery",
    "Reproductive Endocrinology",
    "Reproductive Medicine",
    "Respiratory Medicine",
    "Rheumatology",
    "Sleep Medicine",
    "Sports Medicine",
    "Surgical Oncology",
    "Thoracic Surgery",
    "Transplant Surgery",
    "Trauma Surgery",
    "Tropical Medicine",
    "Urogynecology",
    "Urology",
    "Vascular Surgery",
    "Venereology",
    "Aviation Medicine",
    "Aerospace Medicine",
    "Lifestyle Medicine",
    "Integrative Medicine",
    "Regenerative Medicine",
    "Sexual Medicine",
    "Clinical Pharmacology",
    "Pharmacology",
    "Medical Microbiology",
    "Virology",
    "Bacteriology",
    "Parasitology",
    "Clinical Pathology",
    "Anatomical Pathology",
    "Cytopathology",
    "Molecular Pathology",
    "Genomic Medicine",
    "Rehabilitation Medicine",
    "Sports and Exercise Medicine",
    "Cosmetic Surgery",
    "Cosmetic Dermatology",
    "Hair Transplant Surgery",
    "Trichology",
    "Andrology",
    "Breast Surgery",
    "Hand Surgery",
    "Spine Surgery",
    "Foot and Ankle Surgery",
    "Hip and Knee Surgery",
    "Shoulder and Elbow Surgery",
    "Pediatric Endocrinology",
    "Pediatric Allergy and Immunology",
    "Pediatric Emergency Medicine",
    "Pediatric Rehabilitation Medicine",
    "Medical Toxicology",
    "Clinical Toxicology",
    "Transfusion Medicine",
    "Blood Banking",
    "Hospice and Palliative Medicine",
    "Community Medicine",
    "Rural Medicine",
    "Travel Medicine",
    "Marine Medicine",
    "Telemedicine",
    "Clinical Nutrition",
    "Rehabilitation Psychiatry",
    "Pain Medicine",
    "Female Pelvic Medicine and Reconstructive Surgery",
    "Reconstructive Urology",
    "Vascular and Interventional Radiology",
    "Neurointerventional Surgery",
    "Electrophysiology",
    "Heart Failure Medicine",
    "Structural Heart Disease",
    "Adult Congenital Heart Disease",
    "Lipidology",
    "Bone Marrow Transplantation",
    "Stem Cell Therapy",
    "Clinical Informatics",
    "Medical Administration",
    "Health Informatics"
]

const options = SpecializationFields.map((item) => ({
    value: item,
    label: item
}))

function RegisterPage() {

    const { user, loading, error, message } = useSelector((state) => state.auth);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [specialization, setSpecialization] = useState(null);
    const [password, setPassword] = useState("");


    const dispatch = useDispatch()
    const navigate = useNavigate()

    const handleSubmit = (e) => {
        e.preventDefault()
        console.log({
            name,
            email,
            specialization,
            password
        });

        const payload = {
            name,
            email,
            specialization,
            password
        }


        dispatch(registerAuth(payload))

        setEmail("")
        setName("")
        setPassword("")
        setSpecialization(null)
    }

    useEffect(() => {
        if (user) {
            setTimeout(() => {
                navigate("/home")
            }
            , 500)
        }
    }, [message, user, dispatch])
    

    return (
        <div className='register-container'>
            <div className="register-card">
                <div className="header-text">
                    <h1>Welcome to Clinora</h1>
                    <p>Register to continue</p>
                </div>
                <form onSubmit={handleSubmit} className="form">
                    <div className="form-group">
                        <label>Name:</label>
                        <input
                            type="text"
                            placeholder='Enter your name'
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>specialization:</label>
                        <Select
                            options={options}
                            value={options.find(
                                options => options.value === specialization
                            )}
                            placeholder="Select Specialization..."
                            isSearchable
                            isClearable
                            onChange={(selected) => setSpecialization(selected?.value || "")}
                        />
                    </div>
                    <div className="form-group">
                        <label>Email:</label>
                        <input
                            type="email"
                            value={email}
                            placeholder='example@gmail.com'
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Password:</label>
                        <input
                            type="password"
                            value={password}
                            placeholder='Enter your password'
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type='submit' disabled={loading}>
                        {loading ? "Registering..." : "Register"}
                    </button>
                </form>
                {error && <p className="error-message">{error}</p>}
                {message && <p className="success-message">{message}</p>}
                <span className="bottom-text">
                    Already have an account? <a href="/login">Login</a>
                </span>
            </div>
        </div>
    )
}

export default RegisterPage