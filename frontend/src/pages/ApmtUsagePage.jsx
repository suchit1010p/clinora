import React, { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, MoreVertical, Sparkles, Bot, Save } from 'lucide-react'
import { useSelector, useDispatch } from 'react-redux'
import { getAppointmentDetails, clearAppointmentDetails } from '../features/appointments/appointment/appointmentDetails'
import { getPatientDetails, clearPatientDetails } from '../features/patients/patient/patientDetailSlice'

// Import Refactored Components
import PatientDetailsCard from './components/PatientDetailsCard.jsx'
import AppointmentDetailsCard from './components/AppointmentDetailsCard.jsx'
import ConsultationRecordingCard from './components/ConsultationRecordingCard.jsx'
import MedicalReportsCard from './components/MedicalReportsCard.jsx'

import './styles/ApmtUsage.css'

const ApmtUsagePage = () => {
    const dispatch = useDispatch()
    const { appointmentId } = useParams()

    const patient = useSelector((state) => state.patient.data)
    const appointment = useSelector((state) => state.appointment.data)
    const isPatientLoading = useSelector((state) => state.patient.loading)
    const { user } = useSelector((state) => state.auth)

    useEffect(() => {
        if (!appointmentId) return;

        const loadData = async () => {
            try {
                const actionResult = await dispatch(getAppointmentDetails(appointmentId)).unwrap();
                const patientId = actionResult?.data?.patient_id;
                if (patientId) {
                    dispatch(getPatientDetails(patientId));
                }
            } catch (err) {
                console.error("Error loading appointment details:", err);
            }
        };

        loadData();

        return () => {
            dispatch(clearAppointmentDetails());
            dispatch(clearPatientDetails());
        };
    }, [dispatch, appointmentId])

    return (
        <div className="apmt-container">
            {/* Header */}
            <div className="apmt-header">
                <Link to="/appointments" className="apmt-back-link">
                    <ArrowLeft size={18} />
                    <span>Back to Appointments</span>
                </Link>
                <h1 className="apmt-page-title">Appointment Details</h1>
                <div className="apmt-header-right">
                    <span className="apmt-id-badge">Appointment #{appointmentId || '1023'}</span>
                    <button className="apmt-more-btn">
                        <MoreVertical size={20} />
                    </button>
                </div>
            </div>

            {/* Layout Grid */}
            <div className="apmt-layout">
                {/* Left Column - Patient Details & Appointment Details */}
                <div className="apmt-left-col">
                    <PatientDetailsCard patient={patient} isLoading={isPatientLoading} />
                    <AppointmentDetailsCard appointment={appointment} user={user} />
                </div>

                {/* Right Column - Recording, Medical Reports, AI Summary, Diagnosis */}
                <div className="apmt-right-col">
                    <ConsultationRecordingCard appointmentId={appointmentId} />
                    <MedicalReportsCard appointmentId={appointmentId} />

                    {/* AI Generated Summary Card */}
                    <div className="apmt-card">
                        <div className="apmt-card-header">
                            <h2 className="apmt-card-title">AI Generated Summary</h2>
                            <button className="apmt-card-btn apmt-card-btn-outline">
                                <Sparkles size={16} />
                                <span>Generate</span>
                            </button>
                        </div>

                        <div className="ai-summary-box">
                            <div className="robot-icon-wrapper">
                                <Bot size={22} />
                            </div>
                            <div className="ai-summary-text-block">
                                <h4 className="ai-summary-title">
                                    Summary will appear here after generating from the consultation recordings and uploaded reports.
                                </h4>
                                <p className="ai-summary-sub">This will help you save time and focus on diagnosis.</p>
                            </div>
                        </div>
                    </div>

                    {/* Diagnosis Card */}
                    <div className="apmt-card">
                        <div className="apmt-card-header" style={{ marginBottom: '16px' }}>
                            <h2 className="apmt-card-title">Diagnosis</h2>
                        </div>

                        <div className="diagnosis-grid">
                            <div className="form-field">
                                <label>Problem</label>
                                <textarea placeholder="Enter patient problem"></textarea>
                            </div>
                            <div className="form-field">
                                <label>Diagnosis</label>
                                <textarea placeholder="Enter diagnosis"></textarea>
                            </div>
                            <div className="form-field">
                                <label>Follow-up Date</label>
                                <div className="date-input-container">
                                    <input type="date" />
                                </div>
                            </div>
                        </div>

                        <div className="diagnosis-footer-actions">
                            <button className="apmt-card-btn apmt-card-btn-primary">
                                <Save size={16} className="btn-icon" />
                                <span>Save Diagnosis</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ApmtUsagePage;
