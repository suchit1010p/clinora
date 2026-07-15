import React from 'react';
import { Edit, User, Calendar, Clock, AlertCircle, FileText } from 'lucide-react';

const AppointmentDetailsCard = ({ appointment, user }) => {
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
        </div>
    );
};

export default AppointmentDetailsCard;
