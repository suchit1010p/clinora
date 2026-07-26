import React, { useEffect, useState } from 'react';
import { Edit, User, Calendar, Clock, AlertCircle, FileText, Loader2, Check, RefreshCw } from 'lucide-react';
import api from '../../services/api.js';

const AppointmentDetailsCard = ({ appointment, user }) => {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);

    const handleGenerateFollowups = async () => {
        if (!appointment?.id) return;
        setLoading(true);
        setError(null);
        try {
            await api.post(`followup/${appointment.id}/generate-followups`);
            setSuccess(true);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to generate follow-ups. Please try again.');
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        let isMounted = true;
        const checkFollowUpsStatus = async () => {
            if (!appointment?.id) return;
            setError(null);
            try {
                const response = await api.get(`followup/${appointment.id}/check-followups`);
                if (isMounted && response.data?.data && response.data.data.length > 0) {
                    setSuccess(true);
                }
            } catch (err) {
                console.error(err);
            }
        };

        setSuccess(false);
        checkFollowUpsStatus();

        return () => {
            isMounted = false;
        };
    }, [appointment?.id]);

    return (
        <div className="apmt-card">
            <div className="apmt-card-header">
                <h2 className="apmt-card-title">Appointment Details</h2>
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

            <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                    onClick={handleGenerateFollowups}
                    disabled={loading || success}
                    className={`apmt-card-btn ${success ? 'apmt-card-btn-generated' : 'apmt-card-btn-primary'}`}
                    style={{ width: '100%', justifyContent: 'center' }}
                >
                    {loading ? (
                        <>
                            <Loader2 className="spin-icon" size={16} />
                            Generating Follow-ups...
                        </>
                    ) : success ? (
                        <>
                            <Check size={16} />
                            Follow-ups Generated
                        </>
                    ) : (
                        <>
                            <RefreshCw size={16} />
                            Generate Follow-ups
                        </>
                    )}
                </button>
                {error && (
                    <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', textAlign: 'center' }}>
                        {error}
                    </span>
                )}
            </div>
        </div>
    );
};

export default AppointmentDetailsCard;
