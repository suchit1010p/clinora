import React, { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useSelector, useDispatch } from 'react-redux'
import { getAppointmentDetails, clearAppointmentDetails } from '../features/appointments/appointment/appointmentDetails'
import { getPatientDetails, clearPatientDetails } from '../features/patients/patient/patientDetailSlice'

// Import Refactored Components
import PatientDetailsCard from './components/PatientDetailsCard.jsx'
import AppointmentDetailsCard from './components/AppointmentDetailsCard.jsx'
import ConsultationRecordingCard from './components/ConsultationRecordingCard.jsx'
import MedicalReportsCard from './components/MedicalReportsCard.jsx'
import AiSummaryCard from './components/AiSummaryCard.jsx'

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

    const currentStatus = appointment?.status || 'Pending';

    return (
        <div className="apmt-container">
            {/* Desktop Top Nav */}


            {/* Page Header (Matches Section 2 Specification) */}
            <div className="apmt-page-header">
                <div className="apmt-header-title-block">
                    <h1 className="apmt-page-title">Appointment Details</h1>
                    <span className="apmt-id-sub">Appointment #{appointment?.id || appointmentId}</span>
                </div>
                <div className="apmt-header-status-block">
                    <span className={`status-pill ${currentStatus.toLowerCase()}`}>
                        {currentStatus}
                    </span>
                </div>
            </div>

            {/* Layout Grid */}
            <div className="apmt-layout">
                {/* Left Column - Patient Details & Appointment Details */}
                <div className="apmt-left-col">
                    <PatientDetailsCard patient={patient} isLoading={isPatientLoading} />
                    <AppointmentDetailsCard appointment={appointment} user={user} />
                </div>

                {/* Right Column - Recording, Medical Reports, AI Summary */}
                <div className="apmt-right-col">
                    <ConsultationRecordingCard appointmentId={appointmentId} />
                    <MedicalReportsCard appointmentId={appointmentId} />

                    {/* AI Generated Summary + Diagnosis (Preserved) */}
                    <AiSummaryCard appointmentId={appointmentId} />
                </div>
            </div>
        </div>
    )
}

export default ApmtUsagePage;
