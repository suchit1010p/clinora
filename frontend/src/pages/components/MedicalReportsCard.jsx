import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Upload, FileText, Eye, Download, Trash2, Loader2, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import api from '../../services/api.js';

const MedicalReportsCard = ({ appointmentId }) => {
    const [reports, setReports] = useState([]);
    const [isUploadingReport, setIsUploadingReport] = useState(false);
    const [reportError, setReportError] = useState(null);
    const [extractingIds, setExtractingIds] = useState(new Set());
    const fileInputRef = useRef(null);
    const pollIntervalRef = useRef(null);

    const fetchReports = useCallback(async () => {
        try {
            const response = await api.get(`appointments/${appointmentId}/report`);
            if (response.data?.success) {
                const incoming = response.data.data || [];
                setReports(incoming);

                // Auto-clear IDs whose extraction is confirmed
                setExtractingIds((prev) => {
                    if (prev.size === 0) return prev;
                    const next = new Set(prev);
                    incoming.forEach((r) => {
                        if (r.has_extraction) next.delete(r.id);
                    });
                    return next;
                });
            }
        } catch (err) {
            console.error("Error fetching reports:", err);
        }
    }, [appointmentId]);

    useEffect(() => {
        if (appointmentId) fetchReports();
    }, [appointmentId, fetchReports]);

    useEffect(() => {
        if (extractingIds.size > 0) {
            pollIntervalRef.current = setInterval(() => {
                fetchReports();
            }, 4000);
        } else {
            clearInterval(pollIntervalRef.current);
        }
        return () => clearInterval(pollIntervalRef.current);
    }, [extractingIds.size, fetchReports]);

    const handleReportUpload = async (file) => {
        if (!file) return;
        setIsUploadingReport(true);
        setReportError(null);

        const fileName = file.name;
        const contentType = file.type || "application/pdf";

        try {
            let response;
            try {
                response = await api.post(`appointments/${appointmentId}/report/upload`, {
                    fileName,
                    contentType
                });
            } catch (backendError) {
                console.error("Backend error getting S3 upload URL for report:", backendError);
                throw new Error(`Backend API Error: ${backendError.response?.data?.message || backendError.message}`);
            }

            if (!response.data?.success) {
                throw new Error("Backend API responded with success: false");
            }

            const { uploadUrl } = response.data.data;
            if (!uploadUrl) {
                throw new Error("No upload URL returned from backend API");
            }

            try {
                await axios.put(uploadUrl, file, {
                    headers: { 'Content-Type': contentType }
                });
            } catch (s3Error) {
                console.error("S3 upload error details for report:", s3Error);
                if (s3Error.response) {
                    throw new Error(`S3 Error (HTTP ${s3Error.response.status}): ${s3Error.message}`);
                } else if (s3Error.request) {
                    throw new Error("S3 CORS/Network Error: Please enable CORS (PUT, GET, HEAD) on your S3 bucket.");
                } else {
                    throw new Error(`S3 Upload Error: ${s3Error.message}`);
                }
            }

            const reportId = response.data.data?.report?.id;
            if (reportId) {
                setExtractingIds((prev) => new Set([...prev, reportId]));
                api.post(`appointments/${appointmentId}/report/${reportId}/extract`, { contentType })
                    .catch(err => console.warn("Report extraction trigger failed (non-blocking):", err));
            }

            await fetchReports();
        } catch (err) {
            console.error("Report upload failed:", err);
            setReportError(err.message || "Failed to upload medical report.");
        } finally {
            setIsUploadingReport(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleDeleteReport = async (reportId) => {
        if (!window.confirm("Are you sure you want to delete this medical report?")) return;

        try {
            const response = await api.delete(`appointments/${appointmentId}/report/${reportId}`);
            if (response.data?.success) {
                setExtractingIds((prev) => {
                    const next = new Set(prev);
                    next.delete(reportId);
                    return next;
                });
                await fetchReports();
            }
        } catch (err) {
            console.error("Error deleting report:", err);
            alert("Failed to delete medical report. Please try again.");
        }
    };

    const getExtractionBadge = (report) => {
        const isExtracting = extractingIds.has(report.id);

        if (report.has_extraction) {
            return (
                <span className="extraction-badge extraction-badge--done" title="AI content extracted">
                    <CheckCircle2 size={12} />
                    Extracted
                </span>
            );
        }

        if (isExtracting) {
            return (
                <span className="extraction-badge extraction-badge--progress" title="Extracting content with AI...">
                    <Loader2 size={12} className="spin-icon" />
                    Extracting…
                </span>
            );
        }

        return null;
    };

    return (
        <div className="apmt-card medical-reports-card">
            {/* Header: Title + Upload Button */}
            <div className="apmt-card-header">
                <h2 className="apmt-card-title">Medical Reports</h2>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => handleReportUpload(e.target.files[0])}
                    style={{ display: 'none' }}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
                <button
                    type="button"
                    className="apmt-card-btn apmt-card-btn-outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingReport}
                >
                    {isUploadingReport ? <Loader2 size={16} className="spin-icon" /> : <Upload size={16} />}
                    <span>{isUploadingReport ? 'Uploading...' : 'Upload Report'}</span>
                </button>
            </div>

            {reportError && (
                <div className="report-error-banner">
                    {reportError}
                </div>
            )}

            {/* DESKTOP TABLE VIEW */}
            <div className="reports-table-wrapper desktop-only">
                <table className="reports-table">
                    <thead>
                        <tr>
                            <th>File Name</th>
                            <th>Uploaded On</th>
                            <th>Type</th>
                            <th>AI Status</th>
                            <th className="actions-header">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reports.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: '13px' }}>
                                    No medical reports uploaded.
                                </td>
                            </tr>
                        ) : (
                            reports.map((report) => {
                                const fileName = report.file_url ? report.file_url.split('/').pop() : 'Report';
                                const fileType = fileName.split('.').pop().toUpperCase();
                                const formattedDate = report.created_at
                                    ? new Date(report.created_at).toLocaleDateString('en-GB')
                                    : 'N/A';

                                return (
                                    <tr key={report.id}>
                                        <td data-label="File Name">
                                            <div className="report-file-cell">
                                                <span className="pdf-icon-wrapper">
                                                    <FileText size={20} />
                                                </span>
                                                <span className="report-file-name" title={fileName}>{fileName}</span>
                                            </div>
                                        </td>
                                        <td data-label="Uploaded On">{formattedDate}</td>
                                        <td data-label="Type">{fileType || 'FILE'}</td>
                                        <td data-label="AI Status">
                                            {getExtractionBadge(report)}
                                        </td>
                                        <td data-label="Actions">
                                            <div className="table-actions-cell">
                                                <button
                                                    className="action-icon-btn view"
                                                    title="View"
                                                    onClick={() => window.open(report.downloadUrl, '_blank')}
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    className="action-icon-btn download"
                                                    title="Download"
                                                    onClick={() => window.open(report.downloadUrl, '_blank')}
                                                >
                                                    <Download size={16} />
                                                </button>
                                                <button
                                                    className="action-icon-btn delete"
                                                    title="Delete"
                                                    onClick={() => handleDeleteReport(report.id)}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* MOBILE CARD VIEW (Section 9) */}
            <div className="mobile-reports-container mobile-only">
                {reports.length === 0 ? (
                    <p className="no-reports-msg">
                        No medical reports uploaded yet.
                    </p>
                ) : (
                    reports.map((report) => {
                        const fileName = report.file_url ? report.file_url.split('/').pop() : 'Report';
                        const fileType = fileName.split('.').pop().toUpperCase();
                        const formattedDate = report.created_at
                            ? new Date(report.created_at).toLocaleDateString('en-GB')
                            : 'N/A';

                        return (
                            <div key={report.id} className="mobile-report-card">
                                <div className="mobile-report-top">
                                    <div className="mobile-report-icon-box">
                                        <FileText size={20} />
                                    </div>
                                    <div className="mobile-report-info">
                                        <span className="mobile-report-filename" title={fileName}>
                                            {fileName}
                                        </span>
                                        <span className="mobile-report-sub">
                                            {formattedDate} · {fileType || 'PDF'}
                                        </span>
                                    </div>
                                    {getExtractionBadge(report)}
                                </div>

                                <div className="mobile-report-actions">
                                    <button
                                        type="button"
                                        className="mobile-report-action-pill view"
                                        title="View report"
                                        onClick={() => window.open(report.downloadUrl, '_blank')}
                                    >
                                        <Eye size={15} />
                                        <span>View</span>
                                    </button>

                                    <button
                                        type="button"
                                        className="mobile-report-action-pill download"
                                        title="Download report"
                                        onClick={() => window.open(report.downloadUrl, '_blank')}
                                    >
                                        <Download size={15} />
                                        <span>Download</span>
                                    </button>

                                    <button
                                        type="button"
                                        className="mobile-report-action-pill delete"
                                        title="Delete report"
                                        onClick={() => handleDeleteReport(report.id)}
                                    >
                                        <Trash2 size={15} />
                                        <span>Delete</span>
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default MedicalReportsCard;
