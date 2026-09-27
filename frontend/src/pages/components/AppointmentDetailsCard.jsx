import React, { useEffect, useState } from 'react';
import { User, Calendar, Clock, AlertCircle, FileText, Loader2, Check, RefreshCw } from 'lucide-react';
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

    const currentStatus = appointment?.status || 'Pending';

    return (
        <div className="apmt-card appointment-details-card">
            <div className="apmt-card-header">
                <h2 className="apmt-card-title">Appointment Details</h2>
            </div>

            {/* Compact 2-column or list info layout */}
            <div className="apmt-details-grid">
                <div className="apmt-grid-item">
                    <span className="apmt-grid-label">
                        <User size={14} className="apmt-icon" />
                        Doctor
                    </span>
                    <span className="apmt-grid-value">
                        {user?.name ? `Dr. ${user.name}` : (appointment?.doctor || 'TBD')}
                    </span>
                </div>

                <div className="apmt-grid-item">
                    <span className="apmt-grid-label">
                        <Calendar size={14} className="apmt-icon" />
                        Date
                    </span>
                    <span className="apmt-grid-value">
                        {appointment?.scheduled_at ? new Date(appointment.scheduled_at).toLocaleDateString() : 'N/A'}
                    </span>
                </div>

                <div className="apmt-grid-item">
                    <span className="apmt-grid-label">
                        <Clock size={14} className="apmt-icon" />
                        Time
                    </span>
                    <span className="apmt-grid-value">
                        {appointment?.scheduled_at ? new Date(appointment.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                    </span>
                </div>

                <div className="apmt-grid-item">
                    <span className="apmt-grid-label">
                        <AlertCircle size={14} className="apmt-icon" />
                        Status
                    </span>
                    <span className="apmt-grid-value">
                        <span className={`status-pill ${currentStatus.toLowerCase()}`}>
                            {currentStatus}
                        </span>
                    </span>
                </div>

                <div className="apmt-grid-item">
                    <span className="apmt-grid-label">
                        <FileText size={14} className="apmt-icon" />
                        Visit Type
                    </span>
                    <span className="apmt-grid-value">
                        {appointment?.visitType || 'Consultation'}
                    </span>
                </div>

                <div className="apmt-grid-item apmt-grid-item--full">
                    <span className="apmt-grid-label">
                        <FileText size={14} className="apmt-icon" />
                        Reason
                    </span>
                    <span className="apmt-grid-value">
                        {appointment?.reason || 'No reason provided'}
                    </span>
                </div>
            </div>

            {/* Follow-ups action */}
            <div className="apmt-followups-action">
                <button
                    onClick={handleGenerateFollowups}
                    disabled={loading || success}
                    className={`apmt-card-btn ${success ? 'apmt-card-btn-generated' : 'apmt-card-btn-primary'}`}
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
                    <span className="apmt-followup-error">
                        {error}
                    </span>
                )}
            </div>
        </div>
    );
};

export default AppointmentDetailsCard;
