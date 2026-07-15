import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, Play, Pause, MoreVertical, Sparkles, Send, Trash2, FileText } from 'lucide-react';
import axios from 'axios';
import api from '../../services/api.js';

const ConsultationRecordingCard = ({ appointmentId }) => {
    const [recordings, setRecordings] = useState([]);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);
    const [playingId, setPlayingId] = useState(null);
    const [audioInstance, setAudioInstance] = useState(null);
    const [durations, setDurations] = useState({});
    const [activeDropdownId, setActiveDropdownId] = useState(null);

    const mediaRecorderRef = useRef(null);
    const streamRef = useRef(null);
    const chunksRef = useRef([]);
    const timerRef = useRef(null);

    const fetchRecordings = useCallback(async () => {
        try {
            const response = await api.get(`appointments/${appointmentId}/audio`);
            if (response.data?.success) {
                setRecordings(response.data.data || []);
            }
        } catch (err) {
            console.error("Error fetching audio files:", err);
        }
    }, [appointmentId]);

    useEffect(() => {
        if (appointmentId) {
            fetchRecordings();
        }
    }, [appointmentId, fetchRecordings]);

    // Handle recording list durations loader
    useEffect(() => {
        recordings.forEach((rec) => {
            if (rec.downloadUrl && !durations[rec.id]) {
                const audio = new Audio(rec.downloadUrl);
                audio.addEventListener('loadedmetadata', () => {
                    const mins = Math.floor(audio.duration / 60);
                    const secs = Math.floor(audio.duration % 60);
                    const formatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
                    setDurations((prev) => ({
                        ...prev,
                        [rec.id]: formatted,
                    }));
                });
            }
        });
    }, [recordings, durations]);

    // Pause audio player on unmount
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

            const { uploadUrl } = response.data.data;
            if (!uploadUrl) {
                throw new Error("No upload URL returned from backend API");
            }

            // Step 2: Upload binary data directly to S3
            try {
                await axios.put(uploadUrl, blob, {
                    headers: {
                        'Content-Type': 'audio/webm'
                    }
                });
            } catch (s3Error) {
                console.error("S3 upload error details:", s3Error);
                if (s3Error.response) {
                    throw new Error(`S3 Error (HTTP ${s3Error.response.status}): ${s3Error.message}`);
                } else if (s3Error.request) {
                    throw new Error("S3 CORS/Network Error: This is likely a CORS block. Please enable CORS (PUT, GET, HEAD) on your AWS S3 bucket.");
                } else {
                    throw new Error(`S3 Upload Error: ${s3Error.message}`);
                }
            }

            // Step 3: Fetch updated list
            await fetchRecordings();
        } catch (err) {
            console.error("S3 Upload Flow Failed:", err);
            setUploadError(err.message || "Failed to store recording on AWS S3. Please verify bucket settings.");
        } finally {
            setIsUploading(false);
        }
    };

    const handlePlayPause = (recording) => {
        if (playingId === recording.id) {
            audioInstance.pause();
            setPlayingId(null);
        } else {
            if (audioInstance) {
                audioInstance.pause();
            }
            const newAudio = new Audio(recording.downloadUrl);
            newAudio.play().catch(err => console.error("Audio playback error:", err));
            newAudio.addEventListener('ended', () => setPlayingId(null));
            setAudioInstance(newAudio);
            setPlayingId(recording.id);
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            const mediaRecorder = new MediaRecorder(stream);
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

    return (
        <div className="apmt-card">
            <div className="apmt-card-header">
                <h2 className="apmt-card-title">Consultation Recording</h2>
                <button
                    className={`record-btn ${isRecording ? 'recording' : ''}`}
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={isUploading}
                    title={isRecording ? 'Stop Recording' : 'Start Recording'}
                >
                    <Mic size={20} />
                </button>
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
                                        className="audio-dropdown-item delete-action"
                                        onClick={() => handleDeleteAudio(recording.id)}
                                    >
                                        <Trash2 size={14} />
                                        <span>Delete</span>
                                    </button>
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
    );
};

export default ConsultationRecordingCard;
