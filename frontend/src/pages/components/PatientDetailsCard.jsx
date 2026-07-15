import React from 'react';
import { Edit, Phone, Mail, Droplet, Calendar, MapPin, AlertCircle, ChevronRight } from 'lucide-react';

const PatientDetailsCard = ({ patient, isLoading }) => {
    const getAge = (dob) => {
        if (!dob) return '-';
        const birthDate = new Date(dob);
        const difference = Date.now() - birthDate.getTime();
        const age = Math.floor(difference / (1000 * 60 * 60 * 24 * 365.25));
        return age;
    };

    return (
        <div className="apmt-card">
            <div className="apmt-card-header">
                <h2 className="apmt-card-title">Patient Details</h2>
            </div>

            <div className="patient-meta">
                <h3 className="patient-name">{isLoading ? 'Loading...' : (patient?.name || 'Loading...')}</h3>
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

        </div>
    );
};

export default PatientDetailsCard;
