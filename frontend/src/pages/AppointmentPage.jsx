import React, { useEffect, useState } from "react";
import {
    Bell,
    CalendarDays,
    CircleCheckBig,
    Clock4,
    X,
    Search,
    Plus,
    Eye,
    Pencil,
    Trash2,
    ChevronDown,
    ChevronRight,
    Phone,
    Mail,
    Calendar,
    Clock,
    SlidersHorizontal,
    User,
    MoreVertical
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { getKPI } from "../features/appointments/kpiSlice.js";
import { getAppointments, updateStatus, deleteAppointment } from "../features/appointments/appointmentsSlice.js";
import "./styles/Appointments.css";

const AppointmentPage = () => {
    const kpiData = useSelector((state) => state.kpi.items);
    const appointments = useSelector((state) => state.appointments.items);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const STATUS = [
        "pending",
        "completed",
        "cancelled"
    ];

    const [statusMenu, setStatusMenu] = useState(null);
    const [mobileActionMenuId, setMobileActionMenuId] = useState(null);
    const [mobileDateFilterOpen, setMobileDateFilterOpen] = useState(false);

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("All Status");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [statusFilterOpen, setStatusFilterOpen] = useState(false);

    // Debounce search term
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
        }, 300);
        return () => clearTimeout(handler);
    }, [search]);

    // Close dropdowns on click outside
    useEffect(() => {
        const handleOutsideClick = () => {
            setStatusFilterOpen(false);
            setStatusMenu(null);
            setMobileActionMenuId(null);
        };
        window.addEventListener("click", handleOutsideClick);
        return () => window.removeEventListener("click", handleOutsideClick);
    }, []);

    useEffect(() => {
        dispatch(getKPI());
    }, [dispatch, appointments]);

    useEffect(() => {
        dispatch(getAppointments({
            page,
            limit,
            search: debouncedSearch,
            status: selectedStatus === "All Status" ? "" : selectedStatus,
            startDate,
            endDate
        }));
    }, [dispatch, page, limit, debouncedSearch, selectedStatus, startDate, endDate]);

    // Format helpers
    const getAge = (dob) => {
        if (!dob) return "-";
        const birthDate = new Date(dob);
        if (isNaN(birthDate.getTime())) return "-";
        const now = new Date();
        let age = now.getFullYear() - birthDate.getFullYear();
        const monthDiff = now.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birthDate.getDate())) {
            age--;
        }
        return `${age > 0 ? age : 0} Years`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const d = new Date(dateString);
        if (isNaN(d.getTime())) return dateString;
        return d.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
        });
    };

    const formatTime = (dateString) => {
        if (!dateString) return "-";
        const d = new Date(dateString);
        if (isNaN(d.getTime())) return "-";
        return d.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        });
    };

    const renderStatuscard = (appointmentId) => (
        <div className="status-card" onClick={(e) => e.stopPropagation()}>
            {STATUS.map((item, index) => (
                <button
                    key={index}
                    className={`status-btn-${item}`}
                    onClick={() => handleUpdateStatus(appointmentId, item)}
                >
                    {item}
                </button>
            ))}
        </div>
    );

    async function handleUpdateStatus(id, item) {
        const payload = {
            status: item,
            appointmentId: id,
        };
        try {
            await dispatch(updateStatus(payload)).unwrap();
            setStatusMenu(null);
            setMobileActionMenuId(null);
        } catch (err) {
            console.error(err);
        }
        setStatusMenu(null);
        setMobileActionMenuId(null);
    }

    async function handleDeleteAppointment(appointmentId) {
        try {
            await dispatch(deleteAppointment(appointmentId)).unwrap();
            setMobileActionMenuId(null);
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <div className="appointments-page">

            {/* Page Header */}
            <div className="page-header">
                <div className="header-titles">
                    <h1>Appointments</h1>
                    <p>View and manage all patient appointments.</p>
                </div>

                <div className="notification desktop-notification">
                    <Bell size={22} />
                </div>
            </div>

            {/* KPI Statistics */}
            <div className="kpi-grid">
                <div className="card">
                    <div className="icon blue">
                        <CalendarDays size={24} />
                    </div>
                    <div className="card-content">
                        <span>Total Appointments</span>
                        <h2>{kpiData?.total_appointments || 4}</h2>
                        <small>This Month</small>
                    </div>
                </div>

                <div className="card">
                    <div className="icon green">
                        <CircleCheckBig size={24} />
                    </div>
                    <div className="card-content">
                        <span>Completed</span>
                        <h2>{kpiData?.completed_appointments || 18}</h2>
                        <small>This Month</small>
                    </div>
                </div>

                <div className="card">
                    <div className="icon orange">
                        <Clock4 size={24} />
                    </div>
                    <div className="card-content">
                        <span>Pending</span>
                        <h2>{kpiData?.upcoming_appointments || 21}</h2>
                        <small>Next 7 Days</small>
                    </div>
                </div>

                <div className="card">
                    <div className="icon red">
                        <X size={24} />
                    </div>
                    <div className="card-content">
                        <span>Cancelled</span>
                        <h2>{kpiData?.cancelled_appointments || 4}</h2>
                        <small>This Month</small>
                    </div>
                </div>
            </div>

            {/* ========================================================
                DESKTOP VIEW: Table & Desktop Toolbar (Preserved)
               ======================================================== */}
            <div className="appointment-card desktop-only">
                {/* Desktop Toolbar */}
                <div className="toolbar">
                    <div className="search-box">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search patient name or ID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <button className="add-btn" onClick={() => navigate('/appointments/create')}>
                        <Plus size={18} />
                        New Appointment
                    </button>
                </div>

                {/* Desktop Filters */}
                <div className="filters">
                    <div className="custom-filter-dropdown" onClick={(e) => e.stopPropagation()}>
                        <button
                            type="button"
                            className="dropdown-trigger-btn"
                            onClick={(e) => {
                                e.stopPropagation();
                                setStatusFilterOpen(!statusFilterOpen);
                            }}
                        >
                            <span>{selectedStatus}</span>
                            <ChevronDown size={16} />
                        </button>
                        {statusFilterOpen && (
                            <div className="dropdown-options-menu">
                                {["All Status", "pending", "completed", "cancelled"].map((statusOption) => (
                                    <button
                                        key={statusOption}
                                        type="button"
                                        className={`dropdown-option-item ${statusOption.toLowerCase()}`}
                                        onClick={() => {
                                            setSelectedStatus(statusOption === "All Status" ? "All Status" : statusOption);
                                            setStatusFilterOpen(false);
                                        }}
                                    >
                                        {statusOption}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        placeholder="Start Date"
                    />

                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        placeholder="End Date"
                    />
                </div>

                {/* Desktop Table */}
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Patient</th>
                            <th>age/sex</th>
                            <th>Contact</th>
                            <th>Scheduled_at</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {appointments?.length === 0 ? (
                            <tr>
                                <td colSpan="7" style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                                    No appointments found.
                                </td>
                            </tr>
                        ) : (
                            appointments?.map((appointment, index) => (
                                <tr key={appointment.id} onClick={() => navigate(`/appointments/${appointment.id}`)} style={{ cursor: "pointer" }} >
                                    <td data-label="#">{index + 1}</td>
                                    <td data-label="Patient">{appointment.patient_name}</td>

                                    <td data-label="Age / Sex">
                                        <p>{getAge(appointment.date_of_birth)}</p>
                                        <p style={{ textTransform: 'capitalize' }}>{appointment.sex}</p>
                                    </td>
                                    <td data-label="Contact">
                                        <p>{appointment.email}</p>
                                        <p>{appointment.mobile}</p>
                                    </td>
                                    <td data-label="Scheduled At">{new Date(appointment.scheduled_at).toLocaleDateString()}</td>
                                    <td data-label="Status">
                                        <span className={`status ${appointment.status.toLowerCase()}`}>{appointment.status}</span>
                                    </td>
                                    <td data-label="Actions" onClick={(e) => e.stopPropagation()}>
                                        <div className="action-buttons">
                                            <button className="action-btn edit" onClick={() => (
                                                setStatusMenu(prev => prev === appointment.id ? null : appointment.id)
                                            )}>
                                                <Pencil size={16} />
                                            </button>
                                            {statusMenu === appointment.id && renderStatuscard(appointment.id)}
                                            <Link key={appointment.id} to={`/appointments/${appointment.id}`}>
                                                <button className="action-btn view">
                                                    <Eye size={16} />
                                                </button>
                                            </Link>
                                            <button className="action-btn delete" onClick={() => handleDeleteAppointment(appointment.id)}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* ========================================================
                MOBILE VIEW: Custom Mobile UI from Reference
               ======================================================== */}
            <div className="mobile-appointments-section mobile-only">
                {/* 1. Mobile Search & Filter Button Row */}
                <div className="mobile-search-row">
                    <div className="mobile-search-box">
                        <Search size={18} className="mobile-search-icon" />
                        <input
                            type="text"
                            placeholder="Search patient name or ID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        {search && (
                            <button
                                type="button"
                                className="mobile-search-clear-btn"
                                onClick={() => setSearch("")}
                                aria-label="Clear search"
                            >
                                <X size={15} />
                            </button>
                        )}
                    </div>

                    <button
                        type="button"
                        className={`mobile-filter-icon-btn ${mobileDateFilterOpen || startDate || endDate ? "active" : ""}`}
                        onClick={() => setMobileDateFilterOpen(!mobileDateFilterOpen)}
                        aria-label="Filter appointments by date"
                    >
                        <SlidersHorizontal size={19} />
                        {(startDate || endDate) && <span className="mobile-filter-active-dot" />}
                    </button>
                </div>

                {/* Mobile Date Filter Drawer (Toggled by Filter Icon) */}
                {mobileDateFilterOpen && (
                    <div className="mobile-date-drawer" onClick={(e) => e.stopPropagation()}>
                        <div className="mobile-drawer-header">
                            <span className="mobile-drawer-title">Filter by Date</span>
                            {(startDate || endDate) && (
                                <button
                                    type="button"
                                    className="mobile-drawer-reset-btn"
                                    onClick={() => {
                                        setStartDate("");
                                        setEndDate("");
                                    }}
                                >
                                    Reset
                                </button>
                            )}
                        </div>
                        <div className="mobile-date-grid">
                            <div className="mobile-date-field">
                                <label>Start Date</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </div>
                            <div className="mobile-date-field">
                                <label>End Date</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. Mobile Controls Row: [ All Status ▼ ]  [ + New Appointment ] */}
                <div className="mobile-actions-row">
                    <div className="custom-filter-dropdown mobile-status-dropdown" onClick={(e) => e.stopPropagation()}>
                        <button
                            type="button"
                            className="dropdown-trigger-btn"
                            onClick={(e) => {
                                e.stopPropagation();
                                setStatusFilterOpen(!statusFilterOpen);
                            }}
                        >
                            <span>{selectedStatus}</span>
                            <ChevronDown size={16} />
                        </button>
                        {statusFilterOpen && (
                            <div className="dropdown-options-menu">
                                {["All Status", "pending", "completed", "cancelled"].map((statusOption) => (
                                    <button
                                        key={statusOption}
                                        type="button"
                                        className={`dropdown-option-item ${statusOption.toLowerCase()}`}
                                        onClick={() => {
                                            setSelectedStatus(statusOption === "All Status" ? "All Status" : statusOption);
                                            setStatusFilterOpen(false);
                                        }}
                                    >
                                        {statusOption}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <button
                        type="button"
                        className="mobile-new-apmt-btn"
                        onClick={() => navigate('/appointments/create')}
                    >
                        <Plus size={18} />
                        <span>New Appointment</span>
                    </button>
                </div>

                {/* 3. Mobile Appointment Cards List */}
                <div className="mobile-cards-list">
                    {appointments?.length === 0 ? (
                        <div className="mobile-empty-card">
                            <CalendarDays size={42} className="mobile-empty-icon" />
                            <h3>No appointments found</h3>
                            <p>No appointments match your search or filter criteria.</p>
                        </div>
                    ) : (
                        appointments?.map((appointment) => (
                            <div
                                key={appointment.id}
                                className="mobile-appointment-card"
                                onClick={() => navigate(`/appointments/${appointment.id}`)}
                            >
                                {/* Card Header: Patient Avatar + Name + Subtitle + Status Badge */}
                                <div className="mobile-card-top">
                                    <div className="mobile-patient-profile">
                                        <div className="mobile-avatar">
                                            <User size={19} />
                                        </div>
                                        <div className="mobile-patient-info">
                                            <h3 className="mobile-patient-name">{appointment.patient_name}</h3>
                                            <p className="mobile-patient-sub">
                                                {getAge(appointment.date_of_birth)} • <span className="capitalize">{appointment.sex}</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mobile-status-pill-container">
                                        <span className={`mobile-status-pill ${appointment.status.toLowerCase()}`}>
                                            {appointment.status}
                                        </span>
                                    </div>
                                </div>

                                {/* Contact Details */}
                                <div className="mobile-contact-list">
                                    {appointment.mobile && (
                                        <div className="mobile-contact-row">
                                            <Phone size={14} className="mobile-contact-icon" />
                                            <span>{appointment.mobile}</span>
                                        </div>
                                    )}
                                    {appointment.email && (
                                        <div className="mobile-contact-row">
                                            <Mail size={14} className="mobile-contact-icon" />
                                            <span>{appointment.email}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Divider */}
                                <div className="mobile-card-hr" />

                                {/* Card Footer: Date, Time & Action Menu / Details Arrow */}
                                <div className="mobile-card-bottom">
                                    <div className="mobile-datetime-group">
                                        <div className="mobile-datetime-item">
                                            <Calendar size={14} className="mobile-dt-icon" />
                                            <span>{formatDate(appointment.scheduled_at)}</span>
                                        </div>
                                        <div className="mobile-datetime-item">
                                            <Clock size={14} className="mobile-dt-icon" />
                                            <span>{formatTime(appointment.scheduled_at)}</span>
                                        </div>
                                    </div>

                                    <div className="mobile-actions-area" onClick={(e) => e.stopPropagation()}>
                                        <button
                                            type="button"
                                            className="mobile-card-options-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setMobileActionMenuId(mobileActionMenuId === appointment.id ? null : appointment.id);
                                            }}
                                            aria-label="Appointment options"
                                        >
                                            <MoreVertical size={18} />
                                        </button>

                                        {/* Mobile Action Dropdown */}
                                        {mobileActionMenuId === appointment.id && (
                                            <div className="mobile-card-options-menu" onClick={(e) => e.stopPropagation()}>
                                                <div className="mobile-menu-section-title">Change Status</div>
                                                <div className="mobile-menu-status-options">
                                                    {STATUS.map((s) => (
                                                        <button
                                                            key={s}
                                                            type="button"
                                                            className={`mobile-menu-status-btn ${s} ${appointment.status.toLowerCase() === s ? "active" : ""}`}
                                                            onClick={() => handleUpdateStatus(appointment.id, s)}
                                                        >
                                                            {s}
                                                        </button>
                                                    ))}
                                                </div>

                                                <div className="mobile-menu-hr" />

                                                <button
                                                    type="button"
                                                    className="mobile-menu-item view"
                                                    onClick={() => navigate(`/appointments/${appointment.id}`)}
                                                >
                                                    <Eye size={15} />
                                                    <span>View Details</span>
                                                </button>

                                                <button
                                                    type="button"
                                                    className="mobile-menu-item delete"
                                                    onClick={() => handleDeleteAppointment(appointment.id)}
                                                >
                                                    <Trash2 size={15} />
                                                    <span>Delete Appointment</span>
                                                </button>
                                            </div>
                                        )}

                                        <div className="mobile-card-arrow-link">
                                            <ChevronRight size={19} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

        </div>
    );
};

export default AppointmentPage;