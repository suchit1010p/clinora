import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import api from '../services/api.js'
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
    Pause, // Imported Pause icon as we'll need it!
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
import { useSelector, useDispatch } from 'react-redux'
import { getAppointmentDetails, clearAppointmentDetails } from '../features/appointments/appointment/appointmentDetails'
import { getPatientDetails, clearPatientDetails } from '../features/patients/patient/patientDetailSlice'

const ApmtUsagePage = () => {
    const dispatch = useDispatch()
    const { appointmentId } = useParams()

    const patient = useSelector((state) => state.patient.data)
    const appointment = useSelector((state) => state.appointment.data)
    const isPatientLoading = useSelector((state) => state.patient.loading)
    const isAppointmentLoading = useSelector((state) => state.appointment.loading)
    const { user } = useSelector((state) => state.auth)

    // Audio recording & fetching states
    const [recordings, setRecordings] = useState([])
    const [isRecording, setIsRecording] = useState(false)
    const [recordingTime, setRecordingTime] = useState(0)
    const [isUploading, setIsUploading] = useState(false)
    const [uploadError, setUploadError] = useState(null)
    const [playingId, setPlayingId] = useState(null)
    const [audioInstance, setAudioInstance] = useState(null)
    const [durations, setDurations] = useState({})
    const [activeDropdownId, setActiveDropdownId] = useState(null)

    const mediaRecorderRef = useRef(null)
    const streamRef = useRef(null)
    const chunksRef = useRef([])
    const timerRef = useRef(null)

    const getAge = (dob) => {
        if (!dob) return '-';
        const birthDate = new Date(dob);
        const difference = Date.now() - birthDate.getTime();
        const age = Math.floor(difference / (1000 * 60 * 60 * 24 * 365.25));
        return age >= 0 ? age : '-';
    }

    const fetchRecordings = useCallback(async () => {
        try {
            const response = await api.get(`appointments/${appointmentId}/audio`);
            if (response.data?.success) {
                setRecordings(response.data.data || []);
            }
        } catch (err) {
            console.error("Error fetching recordings:", err);
        }
    }, [appointmentId]);

    const fetchDuration = (id, url) => {
        if (durations[id]) return;
        const audio = new Audio(url);
        audio.addEventListener('loadedmetadata', () => {
            const minutes = Math.floor(audio.duration / 60);
            const seconds = Math.floor(audio.duration % 60);
            const formatted = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            setDurations(prev => ({ ...prev, [id]: formatted }));
        });
        audio.addEventListener('error', () => {
            setDurations(prev => ({ ...prev, [id]: '0:00' }));
        });
    };

    const handlePlayPause = (recording) => {
        if (playingId === recording.id) {
            if (audioInstance) {
                audioInstance.pause();
            }
            setPlayingId(null);
        } else {
            if (audioInstance) {
                audioInstance.pause();
            }
            const audio = new Audio(recording.downloadUrl);
            audio.play().catch(err => {
                console.error("Audio playback failed:", err);
            });
            setPlayingId(recording.id);
            setAudioInstance(audio);
            audio.onended = () => {
                setPlayingId(null);
            };
        }
    };

    // Clean up audio on unmount
    useEffect(() => {
        return () => {
            if (audioInstance) {
                audioInstance.pause();
            }
        };
    }, [audioInstance]);

    const handleDeleteAudio = async (audioId) => {
        if (!window.confirm("Are you sure you want to delete this recording?")) {
            return;
        }

        try {
            const response = await api.delete(`appointments/${appointmentId}/audio/${audioId}`);
            if (response.data?.success) {
                if (playingId === audioId) {
                    if (audioInstance) {
                        audioInstance.pause();
                    }
                    setPlayingId(null);
                }
                await fetchRecordings();
            }
        } catch (err) {
            console.error("Error deleting audio recording:", err);
            alert("Failed to delete recording. Please try again.");
        } finally {
            setActiveDropdownId(null);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleUpload = async (blob) => {
        setIsUploading(true);
        setUploadError(null);

        const now = new Date();
        const dateStr = now.toLocaleDateString('en-GB').replace(/\//g, '_');
        const timeStr = now.toLocaleTimeString('en-US', { hour12: false }).replace(/:/g, '_');
        const fileName = `Consultation_${dateStr}_${timeStr}.webm`;

        try {
            // Step 1: Get presigned upload URL from backend
            let response;
            try {
                response = await api.post(`appointments/${appointmentId}/audio/upload`, {
                    fileName,
                    contentType: 'audio/webm'
                });
            } catch (backendError) {
                console.error("Backend error fetching presigned URL:", backendError);
                throw new Error(`Backend API Error: ${backendError.response?.data?.message || backendError.message}`);
            }

            if (!response.data?.success) {
                throw new Error("Backend API responded with success: false");
            }

            const uploadUrl = response.data.data?.uploadUrl;
            if (!uploadUrl) {
                throw new Error("No upload URL returned from backend API");
            }

            // Step 2: Upload file directly to S3 via PUT request
            try {
                await axios.put(uploadUrl, blob, {
                    headers: {
                        'Content-Type': 'audio/webm'
                    }
                });
            } catch (s3Error) {
                console.error("S3 PUT upload error details:", s3Error);
                if (s3Error.response) {
                    throw new Error(`S3 Error (HTTP ${s3Error.response.status}): ${s3Error.message}`);
                } else if (s3Error.request) {
                    throw new Error("S3 CORS/Network Error: This is likely a CORS block. Please enable CORS (PUT, GET, HEAD) on your AWS S3 bucket.");
                } else {
                    throw new Error(`S3 Upload Error: ${s3Error.message}`);
                }
            }

            // Step 3: Re-fetch recordings
            await fetchRecordings();
        } catch (err) {
            console.error("Upload process failed:", err);
            setUploadError(err.message || "Failed to store recording on AWS S3.");
        } finally {
            setIsUploading(false);
        }
    };

    const startRecording = async () => {
        try {
            setUploadError(null);
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data && e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                handleUpload(blob);
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);

            timerRef.current = setInterval(() => {
                setRecordingTime((prev) => prev + 1);
            }, 1000);
        } catch (err) {
            console.error("Error accessing microphone:", err);
            setUploadError("Could not access microphone. Please check permissions.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop());
                streamRef.current = null;
            }
        }
    };

    useEffect(() => {
        if (!appointmentId) return;

        const loadData = async () => {
            try {
                const actionResult = await dispatch(getAppointmentDetails(appointmentId)).unwrap();
                const patientId = actionResult?.data?.patient_id;
                if (patientId) {
                    dispatch(getPatientDetails(patientId));
                }
                fetchRecordings();
            } catch (err) {
                console.error("Error loading appointment details:", err);
            }
        };

        loadData();

        return () => {
            dispatch(clearAppointmentDetails());
            dispatch(clearPatientDetails());
        };
    }, [dispatch, appointmentId, fetchRecordings])


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
                            <h3 className="patient-name">{isPatientLoading ? 'Loading...' : (patient?.name || 'Loading...')}</h3>
                            <p className="patient-subtitle">{patient?.sex || 'N/A'} • {getAge(patient?.date_of_birth)} Years</p>
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
                                <span className="detail-value">{patient?.blood_group || 'N/A'}</span>
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
                                <span className="detail-value">{user?.name ? `Dr. ${user.name}` : (appointment?.doctor || 'TBD')}</span>
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
                            {!isRecording ? (
                                <button 
                                    className="apmt-card-btn apmt-card-btn-primary"
                                    onClick={startRecording}
                                    disabled={isUploading}
                                >
                                    <Mic size={16} />
                                    <span>Record</span>
                                </button>
                            ) : (
                                <button 
                                    className="apmt-card-btn"
                                    onClick={stopRecording}
                                    style={{ backgroundColor: '#ef4444', color: 'white' }}
                                >
                                    <Clock size={16} />
                                    <span>Stop</span>
                                </button>
                            )}
                        </div>

                        <div className={`recording-banner ${isRecording ? 'recording-active' : ''}`}>
                            <div className="record-indicator">
                                <div className={`record-dot ${isRecording ? 'dot-pulsing' : isUploading ? 'dot-uploading' : uploadError ? 'dot-error' : ''}`}></div>
                            </div>
                            <div className="recording-banner-text" style={{ flexGrow: 1 }}>
                                <h4 className="recording-banner-title">
                                    {isRecording ? 'Recording...' : isUploading ? 'Uploading to S3...' : uploadError ? 'Upload Failed' : 'Ready to record'}
                                </h4>
                                <p className="recording-banner-sub">
                                    {isRecording 
                                        ? `Elapsed Time: ${formatTime(recordingTime)}` 
                                        : isUploading 
                                            ? 'Uploading your audio recording securely...' 
                                            : uploadError 
                                                ? uploadError 
                                                : 'Press the record button to start the consultation.'}
                                </p>
                            </div>
                            {isRecording && (
                                <button 
                                    className="apmt-card-btn" 
                                    onClick={stopRecording}
                                    style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', padding: '6px 12px', fontSize: '13px', cursor: 'pointer' }}
                                >
                                    Stop
                                </button>
                            )}
                        </div>

                        <div className="recordings-section-title">
                            <span>Previous Recordings</span>
                            <span>Duration</span>
                        </div>

                        <div className="recordings-list">
                            {recordings.length === 0 ? (
                                <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '24px 0' }}>
                                    No recordings available.
                                </p>
                            ) : (
                                recordings.map((recording) => {
                                    const fileName = recording.file_url ? recording.file_url.split('/').pop() : 'Recording';
                                    const formattedDate = recording.created_at 
                                        ? (() => {
                                            const d = new Date(recording.created_at);
                                            const day = d.getDate();
                                            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                                            const month = monthNames[d.getMonth()];
                                            const year = d.getFullYear();
                                            const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                            return `${day} ${month} ${year} • ${time}`;
                                        })()
                                        : 'N/A';

                                    return (
                                        <div key={recording.id} className="recording-item">
                                            <div className="recording-item-left">
                                                <div className="audio-icon-wrapper">
                                                    <FileText size={18} />
                                                </div>
                                                <div className="audio-info">
                                                    <span className="audio-name">{fileName}</span>
                                                    <span className="audio-date">{formattedDate}</span>
                                                </div>
                                            </div>
                                            <div className="recording-item-right" style={{ position: 'relative' }}>
                                                <button 
                                                    className="audio-play-btn" 
                                                    onClick={() => handlePlayPause(recording)}
                                                    style={{ border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                >
                                                    {playingId === recording.id ? (
                                                        <Pause size={16} fill="currentColor" style={{ color: 'var(--accent-blue)' }} />
                                                    ) : (
                                                        <Play size={16} fill="currentColor" />
                                                    )}
                                                </button>
                                                <span className="audio-duration">{durations[recording.id] || '...'}</span>
                                                <button 
                                                    className="audio-menu-btn"
                                                    onClick={() => setActiveDropdownId(activeDropdownId === recording.id ? null : recording.id)}
                                                    style={{ border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                >
                                                    <MoreVertical size={16} />
                                                </button>

                                                {activeDropdownId === recording.id && (
                                                    <div className="audio-dropdown-menu">
                                                        <button 
                                                            className="audio-dropdown-item delete-action"
                                                            onClick={() => handleDeleteAudio(recording.id)}
                                                        >
                                                            <Trash2 size={14} />
                                                            <span>Delete</span>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
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
