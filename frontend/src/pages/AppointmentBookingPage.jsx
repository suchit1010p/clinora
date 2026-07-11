import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import api from '../services/api.js'
import { createAppointment } from '../features/appointments/appointmentsSlice.js'
import './styles/AppointmentBooking.css'

const AppointmentBookingPage = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { user } = useSelector((state) => state.auth)

    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(null)
    const [patient, setPatient] = useState(null)

    const [patientForm, setPatientForm] = useState({
        name: '',
        email: '',
        mobile: '',
        sex: 'male',
        dateOfBirth: '',
        blood_group: 'O+'
    })

    const [scheduledAt, setScheduledAt] = useState('')

    const handleChange = (event) => {
        const { name, value } = event.target
        setPatientForm((prev) => ({ ...prev, [name]: value }))
    }

    const handlePatientStep = async (event) => {
        event.preventDefault()
        setError(null)
        setSuccess(null)

        const { name, email, mobile, sex, dateOfBirth, blood_group } = patientForm
        if (!email && !mobile) {
            setError('Please provide patient email or mobile.')
            return
        }

        setLoading(true)

        try {
            const query = new URLSearchParams()
            if (email) query.append('email', email.trim())
            if (mobile) query.append('mobile', mobile.trim())

            const response = await api.get(`auth/patient/check?${query.toString()}`)
            const existingPatient = response.data?.data?.patient

            if (existingPatient) {
                setPatient(existingPatient)
                setSuccess('Patient found. Continue to book the appointment.')
                setStep(2)
            }
        } catch (lookupError) {
            if (lookupError?.response?.status === 404) {
                if (!name || !dateOfBirth || !sex) {
                    setError('Patient not found. Please complete name, date of birth and sex to register.')
                } else {
                    try {
                        const registerResponse = await api.post('auth/patient/register-booking', {
                            name: name.trim(),
                            email: email.trim(),
                            mobile: mobile.trim(),
                            sex,
                            dateOfBirth,
                            password: 'sa',
                            blood_group
                        })
                        const newPatient = registerResponse.data?.data?.patient
                        setPatient(newPatient)
                        setSuccess('Patient registered successfully. Continue to book the appointment.')
                        setStep(2)
                    } catch (registerError) {
                        setError(registerError?.response?.data?.message || registerError.message || 'Unable to register patient.')
                    }
                }
            } else {
                setError(lookupError?.response?.data?.message || lookupError.message || 'Unable to check patient.')
            }
        } finally {
            setLoading(false)
        }
    }

    const handleAppointmentStep = async (event) => {
        event.preventDefault()
        setError(null)
        setSuccess(null)

        if (!patient?.id) {
            setError('Patient information is missing.')
            return
        }

        if (!scheduledAt) {
            setError('Please select a date and time for the appointment.')
            return
        }

        setLoading(true)

        try {
            await dispatch(
                createAppointment({
                    patientId: patient.id,
                    doctorId: user?.id,
                    scheduledAt,
                    status: 'pending',
                })
            ).unwrap()

            setSuccess('Appointment created successfully.')
            navigate('/appointments')
        } catch (appointmentError) {
            setError(appointmentError?.message || 'Unable to create appointment.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="booking-page">

            {/* Header */}

            <div className="booking-top">

                <button
                    className="back-btn"
                    onClick={() => navigate("/appointments")}
                    type="button"
                >
                    Back
                </button>

                <div>
                    <h1>Book Appointment</h1>
                    <p>Create a new patient appointment</p>
                </div>

            </div>


            {/* Progress */}

            <div className="booking-progress">

                <div className={`progress-step ${step >= 1 ? "active" : ""}`}>
                    <div className="circle">
                        {step > 1 ? "✓" : "1"}
                    </div>

                    <span>Patient</span>
                </div>

                <div className={`progress-line ${step >= 2 ? "active" : ""}`} />

                <div className={`progress-step ${step >= 2 ? "active" : ""}`}>
                    <div className="circle">
                        {step > 2 ? "✓" : "2"}
                    </div>

                    <span>Appointment</span>
                </div>

                <div className="progress-line" />

                <div className={`progress-step ${step === 3 ? "active" : ""}`}>
                    <div className="circle">3</div>

                    <span>Complete</span>
                </div>

            </div>


            {/* Status */}

            <div className="step-title">

                <span>
                    Step {step} of 2
                </span>

                <h2>
                    {step === 1
                        ? "Patient Information"
                        : "Appointment Details"}
                </h2>

            </div>


            {error && (
                <div className="booking-alert error">
                    {error}
                </div>
            )}

            {success && (
                <div className="booking-alert success">
                    {success}
                </div>
            )}


            {/* Card */}

            <div className="booking-card">

                {step === 1 && (
                    <form onSubmit={handlePatientStep}>

                        <div className="input-grid">

                            <div className="input-box">
                                <label>Name</label>
                                <input
                                    name="name"
                                    value={patientForm.name}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="input-box">
                                <label>Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={patientForm.email}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="input-box">
                                <label>Mobile</label>
                                <input
                                    name="mobile"
                                    value={patientForm.mobile}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="input-box">
                                <label>Gender</label>

                                <select
                                    name="sex"
                                    value={patientForm.sex}
                                    onChange={handleChange}
                                >
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div className="input-box full">
                                <label>Date of Birth</label>

                                <input
                                    type="date"
                                    name="dateOfBirth"
                                    value={patientForm.dateOfBirth}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="input-box">
                                <label>BloodGroup</label>

                                <select
                                    name="blood_group"
                                    value={patientForm.blood_group}
                                    onChange={handleChange}
                                >
                                    <option value="O+">O+</option>
                                    <option value="O-">O-</option>
                                    <option value="A+">A+</option>
                                    <option value="A-">A-</option>
                                    <option value="B+">B+</option>
                                    <option value="B-">B-</option>
                                    <option value="AB+">AB+</option>
                                    <option value="AB-">AB-</option>
                                </select>
                            </div>
                        </div>

                        <div className="footer-buttons">

                            <button
                                type="button"
                                className="secondary-button"
                                onClick={() => navigate("/appointments")}
                            >
                                Cancel
                            </button>

                            <button
                                className="primary-button"
                                disabled={loading}
                            >
                                {loading
                                    ? "Checking..."
                                    : "Continue →"}
                            </button>

                        </div>

                    </form>
                )}


                {step === 2 && (
                    <form onSubmit={handleAppointmentStep}>

                        <div className="summary-card">

                            <h3>Patient Summary</h3>

                            <div className="summary-grid">

                                <div>
                                    <small>Name</small>
                                    <p>{patient?.name}</p>
                                </div>

                                <div>
                                    <small>Email</small>
                                    <p>{patient?.email}</p>
                                </div>

                                <div>
                                    <small>Mobile</small>
                                    <p>{patient?.mobile}</p>
                                </div>

                                <div>
                                    <small>Gender</small>
                                    <p>{patient?.sex}</p>
                                </div>

                            </div>

                        </div>

                        <div className="input-box appointment-box">

                            <label>Appointment Date & Time</label>

                            <input
                                type="datetime-local"
                                value={scheduledAt}
                                onChange={(e) => setScheduledAt(e.target.value)}
                            />

                        </div>

                        <div className="footer-buttons">

                            <button
                                type="button"
                                className="secondary-button"
                                onClick={() => setStep(1)}
                            >
                                ← Previous
                            </button>

                            <button
                                className="primary-button"
                                disabled={loading}
                            >
                                {loading
                                    ? "Booking..."
                                    : "Create Appointment"}
                            </button>

                        </div>

                    </form>
                )}

            </div>

        </div>
    )
}

export default AppointmentBookingPage
