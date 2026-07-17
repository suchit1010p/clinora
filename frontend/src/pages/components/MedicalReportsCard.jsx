import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Upload, FileText, Eye, Download, Trash2, Loader2, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import api from '../../services/api.js';

const MedicalReportsCard = ({ appointmentId }) => {
    const [reports, setReports] = useState([]);
    const [isUploadingReport, setIsUploadingReport] = useState(false);
    const [reportError, setReportError] = useState(null);
    // Set of reportIds currently being extracted
    const [extractingIds, setExtractingIds] = useState(new Set());
    const fileInputRef = useRef(null);
    const pollIntervalRef = useRef(null);

    const fetchReports = useCallback(async () => {
        try {
            const response = await api.get(`appointments/${appointmentId}/report`);
            if (response.data?.success) {
                const incoming = response.data.data || [];
                setReports(incoming);

                // Auto-clear IDs whose extraction is now confirmed by the backend
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

    // Poll while any extraction is in progress
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
            // Step 1: Get S3 presigned URL
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

            // Step 2: Upload file directly to S3
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

            // Step 3: File is now in S3 — trigger extraction and mark as extracting
            const reportId = response.data.data?.report?.id;
            if (reportId) {
                setExtractingIds((prev) => new Set([...prev, reportId]));
                api.post(`appointments/${appointmentId}/report/${reportId}/extract`, { contentType })
                    .catch(err => console.warn("Report extraction trigger failed (non-blocking):", err));
            }

            // Step 4: Refresh reports list
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
                <span className="extraction-badge extraction-badge--done" title="AI content extracted — ready for summary">
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
        <div className="apmt-card">
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
                    className="apmt-card-btn apmt-card-btn-outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingReport}
                >
                    {isUploadingReport ? <Loader2 size={16} className="spin-icon" /> : <Upload size={16} />}
                    <span>{isUploadingReport ? 'Uploading...' : 'Upload Report'}</span>
                </button>
            </div>

            {reportError && (
                <div style={{ color: '#dc2626', backgroundColor: '#fef2f2', border: '1px solid #fca5a5', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' }}>
                    {reportError}
                </div>
            )}

            <div className="reports-table-wrapper">
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
        </div>
    );
};

export default MedicalReportsCard;
