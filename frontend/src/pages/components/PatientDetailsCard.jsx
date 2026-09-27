import React from 'react';
import { User, Phone, Mail, Droplet, Calendar, MapPin, AlertCircle } from 'lucide-react';

const PatientDetailsCard = ({ patient, isLoading }) => {
    const getAge = (dob) => {
        if (!dob) return '-';
        const birthDate = new Date(dob);
        if (isNaN(birthDate.getTime())) return '-';
        const difference = Date.now() - birthDate.getTime();
        const age = Math.floor(difference / (1000 * 60 * 60 * 24 * 365.25));
        return age > 0 ? age : 0;
    };

    return (
        <div className="apmt-card patient-details-card">
            <div className="apmt-card-header">
                <h2 className="apmt-card-title">Patient Details</h2>
            </div>

            {/* Patient Profile: Avatar + Name + Demographics */}
            <div className="patient-meta-wrapper">
                <div className="patient-avatar-box">
                    <User size={22} />
                </div>
                <div className="patient-meta">
                    <h3 className="patient-name">
                        {isLoading ? 'Loading...' : (patient?.name || 'Patient Name')}
                    </h3>
                    <p className="patient-subtitle">
                        {getAge(patient?.date_of_birth)} Years • <span className="capitalize">{patient?.sex || 'N/A'}</span>
                    </p>
                </div>
            </div>

            {/* Contacts */}
            <div className="patient-contacts">
                <div className="contact-item">
                    <Phone size={15} className="contact-icon" />
                    <span>{patient?.mobile || 'No phone'}</span>
                </div>
                <div className="contact-item email-item">
                    <Mail size={15} className="contact-icon" />
                    <span>{patient?.email || 'No email'}</span>
                </div>
            </div>

            <hr className="patient-divider" />

            {/* Secondary 2-Column Information Grid */}
            <div className="patient-secondary-grid">
                <div className="secondary-info-item">
                    <span className="secondary-label">
                        <Droplet size={14} className="secondary-icon" />
                        Blood Group
                    </span>
                    <span className="secondary-value">{patient?.blood_group || 'N/A'}</span>
                </div>

                <div className="secondary-info-item">
                    <span className="secondary-label">
                        <Calendar size={14} className="secondary-icon" />
                        Date of Birth
                    </span>
                    <span className="secondary-value">
                        {patient?.date_of_birth
                            ? new Date(patient.date_of_birth).toLocaleDateString()
                            : 'N/A'}
                    </span>
                </div>

                <div className="secondary-info-item">
                    <span className="secondary-label">
                        <MapPin size={14} className="secondary-icon" />
                        Address
                    </span>
                    <span className="secondary-value">{patient?.address || 'Not provided'}</span>
                </div>

                <div className="secondary-info-item">
                    <span className="secondary-label">
                        <AlertCircle size={14} className="secondary-icon" />
                        Allergies
                    </span>
                    <span className="secondary-value">{patient?.allergies || 'None'}</span>
                </div>
            </div>
        </div>
    );
};

export default PatientDetailsCard;
