import React from 'react'
import { useParams, Link } from 'react-router-dom'
import './styles/ApmtUsage.css'
import {
    ArrowLeft,
    Edit,
    Phone,
    Mail,
    Droplet,
    Calendar,
    MapPin,
    AlertCircle,
    ChevronRight,
    User,
    Clock,
    Mic,
    Play,
    MoreVertical,
    Sparkles,
    Send,
    Upload,
    Eye,
    Download,
    Trash2,
    Bot,
    Save,
    FileText
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { getAppointmentDetails } from '../features/appointments/appointment/appointmentDetails'
import { getPatientDetails } from '../features/patients/patient/patientDetailSlice'

const ApmtUsagePage = () => {
    const dispatch = useDispatch()

    const { appointmentId } = useParams()
    const patient = useSelector((state) => state.patient.items) || {}
    const appointment = useSelector((state) => state.appointment.items) || {}

    // patient =  {
    //     "id": 3,
    //     "name": "prit",
    //     "date_of_birth": "2005-05-19T18:30:00.000Z",
    //     "sex": "male",
    //     "mobile": "9265660527",
    //     "email": "pri@gmail.com",
    //     "created_at": "2026-07-08T01:44:09.633Z"
    // }

    // appointment = {
    //     "id": 7,
    //     "patient_id": 3,
    //     "doctor_id": 7,
    //     "status": "completed",
    //     "scheduled_at": "2026-07-10T10:17:00.000Z",
    //     "completed_at": null,
    //     "created_at": "2026-07-08T01:44:31.465Z"
    // }

    useEffect(() => {
        dispatch(getAppointmentDetails(appointmentId))
    }, [dispatch, appointmentId])

    useEffect(() => {
        if (appointment?.patient_id) {
            dispatch(getPatientDetails(appointment.patient_id))
        }
    }, [dispatch, appointment?.patient_id])

    const previousRecordings = [
        {
            id: 1,
            name: 'Consultation_24_May_2025_09_30_AM.mp3',
            date: '24 May 2025 • 09:30 AM',
            duration: '12:42'
        },
        {
            id: 2,
            name: 'Consultation_18_May_2025_10_00_AM.mp3',
            date: '18 May 2025 • 10:00 AM',
            duration: '09:18'
        },
        {
            id: 3,
            name: 'Consultation_05_May_2025_11_15_AM.mp3',
            date: '05 May 2025 • 11:15 AM',
            duration: '15:20'
        }
    ]

    const medicalReports = [
        {
            id: 1,
            name: 'CBC_Report.pdf',
            uploadedOn: '20 May 2025',
            size: '1.2 MB'
        },
        {
            id: 2,
            name: 'ECG_Report.pdf',
            uploadedOn: '18 May 2025',
            size: '950 KB'
        },
        {
            id: 3,
            name: 'XRay_Chest.pdf',
            uploadedOn: '15 May 2025',
            size: '1.4 MB'
        }
    ]

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
                    {/* Patient Details Card */}
                    <div className="apmt-card">
                        <div className="apmt-card-header">
                            <h2 className="apmt-card-title">Patient Details</h2>
                            <button className="apmt-card-edit">
                                <Edit size={14} />
                                <span>Edit</span>
                            </button>
                        </div>

                        <div className="patient-meta">
                            <h3 className="patient-name">{patient?.name || 'Loading...'}</h3>
                            <p className="patient-subtitle">{patient?.sex || 'N/A'} • {patient?.age ?? '-'} Years</p>
                        </div>

                        <div className="patient-contacts">
                            <div className="contact-item">
                                <Phone size={16} />
                                <span>{patient?.mobile || 'No phone'}</span>
                            </div>
                            <div className="contact-item email-item">
                                <Mail size={16} />
                                <span>{patient?.email || 'No email'}</span>
                            </div>
                        </div>

                        <hr className="patient-divider" />

                        <div className="patient-details-list">
                            <div className="detail-row">
                                <span className="detail-label">
                                    <Droplet size={16} />
                                    Blood Group
                                </span>
                                <span className="detail-value">{patient?.bloodGroup || 'N/A'}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">
                                    <Calendar size={16} />
                                    Date of Birth
                                </span>
                                <span className="detail-value">
                                    {patient?.date_of_birth
                                        ? new Date(patient.date_of_birth).toLocaleDateString()
                                        : 'N/A'}
                                </span>

                            </div>
                            <div className="detail-row">
                                <span className="detail-label">
                                    <MapPin size={16} />
                                    Address
                                </span>
                                <span className="detail-value">{patient?.address || 'Not provided'}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">
                                    <AlertCircle size={16} />
                                    Allergies
                                </span>
                                <span className="detail-value">{patient?.allergies || 'None'}</span>
                            </div>
                        </div>

                        <button className="view-profile-btn">
                            <span>View Full Profile</span>
                            <ChevronRight size={16} />
                        </button>
                    </div>

                    {/* Appointment Details Card */}
                    <div className="apmt-card">
                        <div className="apmt-card-header">
                            <h2 className="apmt-card-title">Appointment Details</h2>
                            <button className="apmt-card-edit">
                                <Edit size={14} />
                                <span>Edit</span>
                            </button>
                        </div>

                        <div className="patient-details-list" style={{ marginBottom: 0 }}>
                            <div className="detail-row">
                                <span className="detail-label">
                                    <User size={16} />
                                    Doctor
                                </span>
                                <span className="detail-value">{appointment?.doctor || 'TBD'}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">
                                    <Calendar size={16} />
                                    Date
                                </span>
                                <span className="detail-value">{appointment?.scheduled_at ? new Date(appointment.scheduled_at).toLocaleDateString() : 'N/A'}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">
                                    <Clock size={16} />
                                    Time
                                </span>
                                <span className="detail-value">{appointment?.scheduled_at ? new Date(appointment.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">
                                    <AlertCircle size={16} />
                                    Status
                                </span>
                                <span className="status-badge">{appointment?.status || 'Pending'}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">
                                    <FileText size={16} />
                                    Visit Type
                                </span>
                                <span className="detail-value">{appointment?.visitType || 'Consultation'}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">
                                    <FileText size={16} />
                                    Reason
                                </span>
                                <span className="detail-value">{appointment?.reason || 'No reason provided'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Recording, Medical Reports, AI Summary, Diagnosis */}
                <div className="apmt-right-col">
                    {/* Consultation Recording Card */}
                    <div className="apmt-card">
                        <div className="apmt-card-header">
                            <h2 className="apmt-card-title">Consultation Recording</h2>
                            <button className="apmt-card-btn apmt-card-btn-primary">
                                <Mic size={16} />
                                <span>Record</span>
                            </button>
                        </div>

                        <div className="recording-banner">
                            <div className="record-indicator">
                                <div className="record-dot"></div>
                            </div>
                            <div className="recording-banner-text">
                                <h4 className="recording-banner-title">Ready to record</h4>
                                <p className="recording-banner-sub">Press the record button to start the consultation.</p>
                            </div>
                        </div>

                        <div className="recordings-section-title">
                            <span>Previous Recordings</span>
                            <span>Duration</span>
                        </div>

                        <div className="recordings-list">
                            {previousRecordings.map((recording) => (
                                <div key={recording.id} className="recording-item">
                                    <div className="recording-item-left">
                                        <div className="audio-icon-wrapper">
                                            <FileText size={18} />
                                        </div>
                                        <div className="audio-info">
                                            <span className="audio-name">{recording.name}</span>
                                            <span className="audio-date">{recording.date}</span>
                                        </div>
                                    </div>
                                    <div className="recording-item-right">
                                        <button className="audio-play-btn">
                                            <Play size={16} fill="currentColor" />
                                        </button>
                                        <span className="audio-duration">{recording.duration}</span>
                                        <button className="audio-menu-btn">
                                            <MoreVertical size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="recording-footer-actions">
                            <button className="apmt-card-btn apmt-card-btn-outline" style={{ marginRight: 'auto' }}>
                                <Sparkles size={16} />
                                <span>Generate Transcript</span>
                            </button>
                            <button className="apmt-card-btn apmt-card-btn-primary">
                                <Send size={16} />
                                <span>Submit Recording</span>
                            </button>
                        </div>
                    </div>

                    {/* Medical Reports Card */}
                    <div className="apmt-card">
                        <div className="apmt-card-header">
                            <h2 className="apmt-card-title">Medical Reports</h2>
                            <button className="apmt-card-btn apmt-card-btn-outline">
                                <Upload size={16} />
                                <span>Upload Report</span>
                            </button>
                        </div>

                        <div className="reports-table-wrapper">
                            <table className="reports-table">
                                <thead>
                                    <tr>
                                        <th>File Name</th>
                                        <th>Uploaded On</th>
                                        <th>Size</th>
                                        <th className="actions-header">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {medicalReports.map((report) => (
                                        <tr key={report.id}>
                                            <td>
                                                <div className="report-file-cell">
                                                    <span className="pdf-icon-wrapper">
                                                        <FileText size={20} />
                                                    </span>
                                                    <span className="report-file-name">{report.name}</span>
                                                </div>
                                            </td>
                                            <td>{report.uploadedOn}</td>
                                            <td>{report.size}</td>
                                            <td>
                                                <div className="table-actions-cell">
                                                    <button className="action-icon-btn view" title="View">
                                                        <Eye size={16} />
                                                    </button>
                                                    <button className="action-icon-btn download" title="Download">
                                                        <Download size={16} />
                                                    </button>
                                                    <button className="action-icon-btn delete" title="Delete">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

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

export default ApmtUsagePage
