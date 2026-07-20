import React, { useState, useEffect } from 'react';
import { Sparkles, Bot, Loader2, AlertTriangle, Activity, FileText, Pill, ClipboardList, Calendar, Shield, Stethoscope, Heart, Trash2 } from 'lucide-react';
import api from '../../services/api.js';

const AiSummaryCard = ({ appointmentId }) => {
    const [summaryData, setSummaryData] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isFetching, setIsFetching] = useState(true);   // true on initial load
    const [error, setError] = useState(null);

    // Auto-fetch existing summary from S3 when the component mounts
    useEffect(() => {
        if (!appointmentId) return;

        const fetchExistingSummary = async () => {
            setIsFetching(true);
            try {
                const response = await api.get(`appointments/${appointmentId}/summary`);
                if (response.data?.success && response.data?.data?.summary) {
                    setSummaryData(response.data.data.summary);
                }
            } catch (err) {
                // 400 means no transcripts/reports yet — not an error to surface on load
                // 404 means no summary exists yet — silently stay in empty state
                if (err.response?.status !== 400 && err.response?.status !== 404) {
                    console.error("Error fetching existing summary:", err);
                }
            } finally {
                setIsFetching(false);
            }
        };

        fetchExistingSummary();
    }, [appointmentId]);

    const handleGenerateSummary = async () => {
        if (isGenerating) return;
        setIsGenerating(true);
        setError(null);

        try {
            const response = await api.post(`appointments/${appointmentId}/summary`);
            if (response.data?.success && response.data?.data?.summary) {
                setSummaryData(response.data.data.summary);
            } else {
                setError("Failed to generate summary. Please try again.");
            }
        } catch (err) {
            console.error("Error generating summary:", err);
            setError(err.response?.data?.message || "Failed to generate summary. Make sure transcripts or reports exist.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDeleteSummary = async () => {
        if (isDeleting) return;
        if (!window.confirm("Are you sure you want to delete this AI-generated summary? You can regenerate it later.")) {
            return;
        }

        setIsDeleting(true);
        try {
            const response = await api.delete(`appointments/${appointmentId}/summary`);
            if (response.data?.success !== false) {
                setSummaryData(null);
                setError(null);
            }
        } catch (err) {
            console.error("Error deleting summary:", err);
            alert(err.response?.data?.message || "Failed to delete summary. Please try again.");
        } finally {
            setIsDeleting(false);
        }
    };

    const getRiskLevelClass = (level) => {
        if (!level) return '';
        const l = level.toLowerCase();
        if (l.includes('high') || l.includes('severe')) return 'risk-high';
        if (l.includes('moderate') || l.includes('medium')) return 'risk-moderate';
        return 'risk-low';
    };

    // Loading state — initial auto-fetch in flight
    if (isFetching) {
        return (
            <div className="apmt-card">
                <div className="apmt-card-header">
                    <h2 className="apmt-card-title">AI Generated Summary</h2>
                    <div className="summary-skeleton-btn" />
                </div>
                <div className="ai-summary-box summary-skeleton-box">
                    <div className="summary-skeleton-icon" />
                    <div className="summary-skeleton-lines">
                        <div className="summary-skeleton-line" style={{ width: '80%' }} />
                        <div className="summary-skeleton-line" style={{ width: '55%' }} />
                    </div>
                </div>
            </div>
        );
    }

    // Empty state — summary not yet generated
    if (!summaryData) {
        return (

            <>
                {/* AI Generated Summary Card — Empty State */}
                <div className="apmt-card">
                    <div className="apmt-card-header">
                        <h2 className="apmt-card-title">AI Generated Summary</h2>
                        <button
                            className="apmt-card-btn apmt-card-btn-outline"
                            onClick={handleGenerateSummary}
                            disabled={isGenerating}
                        >
                            {isGenerating ? (
                                <Loader2 size={16} className="spin-icon" />
                            ) : (
                                <Sparkles size={16} />
                            )}
                            <span>{isGenerating ? 'Generating...' : 'Generate'}</span>
                        </button>
                    </div>

                    <div className="ai-summary-box">
                        <div className="robot-icon-wrapper">
                            <Bot size={22} />
                        </div>
                        <div className="ai-summary-text-block">
                            <h4 className="ai-summary-title">
                                {error
                                    ? error
                                    : 'Summary will appear here after generating from the consultation recordings and uploaded reports.'}
                            </h4>
                            {error ? (
                                <p className="ai-summary-sub" style={{ color: '#ef4444' }}>
                                    <AlertTriangle size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                                    Please check that transcripts and/or reports are available.
                                </p>
                            ) : (
                                <p className="ai-summary-sub">This will help you save time and focus on diagnosis.</p>
                            )}
                        </div>
                    </div>
                </div>
            </>
        );
    }

    // ── Populated State — summary data exists ──
    return (
        <>
            {/* AI Generated Summary Card */}
            <div className="apmt-card summary-populated-card">
                <div className="apmt-card-header">
                    <h2 className="apmt-card-title">
                        <Sparkles size={18} style={{ color: '#7c3aed', marginRight: 8, verticalAlign: 'middle' }} />
                        AI Generated Summary
                    </h2>
                    <div className="summary-header-actions">
                        {summaryData.riskLevel && (
                            <span className={`summary-risk-badge ${getRiskLevelClass(summaryData.riskLevel)}`}>
                                <Shield size={14} />
                                {summaryData.riskLevel}
                            </span>
                        )}
                        <button
                            className="apmt-card-btn summary-delete-btn"
                            onClick={handleDeleteSummary}
                            disabled={isDeleting}
                            title="Delete this summary"
                        >
                            {isDeleting ? (
                                <Loader2 size={14} className="spin-icon" />
                            ) : (
                                <Trash2 size={14} />
                            )}
                            <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
                        </button>
                    </div>
                </div>

                {/* Overall Summary */}
                {summaryData.summary && (
                    <div className="summary-overview-box">
                        <Bot size={18} className="summary-overview-icon" />
                        <p className="summary-overview-text">{summaryData.summary}</p>
                    </div>
                )}

                {/* Summary Grid */}
                <div className="summary-details-grid">

                    {/* Chief Complaint */}
                    {summaryData.chiefComplaint && (
                        <div className="summary-detail-item">
                            <div className="summary-detail-header">
                                <AlertTriangle size={16} />
                                <span>Chief Complaint</span>
                            </div>
                            <p className="summary-detail-content">{summaryData.chiefComplaint}</p>
                        </div>
                    )}

                    {/* History */}
                    {summaryData.history && (
                        <div className="summary-detail-item">
                            <div className="summary-detail-header">
                                <ClipboardList size={16} />
                                <span>History</span>
                            </div>
                            <p className="summary-detail-content">{summaryData.history}</p>
                        </div>
                    )}

                    {/* Symptoms */}
                    {summaryData.symptoms?.length > 0 && (
                        <div className="summary-detail-item">
                            <div className="summary-detail-header">
                                <Activity size={16} />
                                <span>Symptoms</span>
                            </div>
                            <div className="summary-tag-list">
                                {summaryData.symptoms.map((s, i) => (
                                    <span key={i} className="summary-tag tag-symptom">{s}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Observations */}
                    {summaryData.observations?.length > 0 && (
                        <div className="summary-detail-item">
                            <div className="summary-detail-header">
                                <Stethoscope size={16} />
                                <span>Observations</span>
                            </div>
                            <div className="summary-tag-list">
                                {summaryData.observations.map((o, i) => (
                                    <span key={i} className="summary-tag tag-observation">{o}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Report Findings */}
                    {summaryData.reportFindings?.length > 0 && (
                        <div className="summary-detail-item summary-detail-full">
                            <div className="summary-detail-header">
                                <FileText size={16} />
                                <span>Report Findings</span>
                            </div>
                            <ul className="summary-findings-list">
                                {summaryData.reportFindings.map((f, i) => (
                                    <li key={i}>{f}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Medications */}
                    {summaryData.medications?.length > 0 && (
                        <div className="summary-detail-item">
                            <div className="summary-detail-header">
                                <Pill size={16} />
                                <span>Medications</span>
                            </div>
                            <div className="summary-tag-list">
                                {summaryData.medications.map((m, i) => (
                                    <span key={i} className="summary-tag tag-medication">{m}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Recommendations */}
                    {summaryData.recommendations?.length > 0 && (
                        <div className="summary-detail-item">
                            <div className="summary-detail-header">
                                <Heart size={16} />
                                <span>Recommendations</span>
                            </div>
                            <ul className="summary-findings-list">
                                {summaryData.recommendations.map((r, i) => (
                                    <li key={i}>{r}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Follow-up */}
                    {summaryData.followUp && (
                        <div className="summary-detail-item">
                            <div className="summary-detail-header">
                                <Calendar size={16} />
                                <span>Follow-up</span>
                            </div>
                            <p className="summary-detail-content">{summaryData.followUp}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Diagnosis Card — auto-populated from AI */}
            <div className="apmt-card">
                <div className="apmt-card-header" style={{ marginBottom: '16px' }}>
                    <h2 className="apmt-card-title">
                        <Stethoscope size={18} style={{ color: '#2563eb', marginRight: 8, verticalAlign: 'middle' }} />
                        Diagnosis
                    </h2>
                </div>

                <div className="diagnosis-display-grid">
                    <div className="diagnosis-display-item">
                        <label>Chief Complaint</label>
                        <p>{summaryData.chiefComplaint || 'Not identified'}</p>
                    </div>
                    <div className="diagnosis-display-item">
                        <label>Diagnosis</label>
                        <p>{summaryData.diagnosis || 'Not determined'}</p>
                    </div>
                    <div className="diagnosis-display-item">
                        <label>Follow-up</label>
                        <p>{summaryData.followUp || 'No follow-up specified'}</p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AiSummaryCard;
