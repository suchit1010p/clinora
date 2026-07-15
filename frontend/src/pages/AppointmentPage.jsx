import React from "react";
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
} from "lucide-react";

import "./styles/Appointments.css";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getKPI } from "../features/appointments/kpiSlice.js";
import { getAppointments, updateStatus, deleteAppointment } from "../features/appointments/appointmentsSlice.js";

// {
//             "total_appointments": "1",
//             "completed_appointments": "0",
//             "upcoming_appointments": "1",
//             "cancelled_appointments": "0"
//         }

// "data": [
//         {
//             "id": 5,
//             "status": "pending",
//             "scheduled_at": "2026-01-06T18:30:00.000Z",
//             "completed_at": null,
//             "created_at": "2026-06-30T03:50:28.450Z",
//             "patient_id": 1,
//             "patient_name": "nisarg",
//             "email": "nisarg1564@gmail.com",
//             "mobile": "8140605081",
//             "sex": "male",
//             "date_of_birth": "2005-08-09T18:30:00.000Z"
//         }
//     ],

const AppointmentPage = () => {
    const kpiData = useSelector((state) => state.kpi.items);
    const appointments = useSelector((state) => state.appointments.items);
    console.log(appointments)
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const STATUS = [
        "pending",
        "completed",
        "cancelled"
    ]

    const [statusMenu, setStatusMenu] = useState(null);

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

    // Close dropdown on click outside
    useEffect(() => {
        if (!statusFilterOpen) return;
        const handleOutsideClick = () => setStatusFilterOpen(false);
        window.addEventListener("click", handleOutsideClick);
        return () => window.removeEventListener("click", handleOutsideClick);
    }, [statusFilterOpen]);

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


    const renderStatuscard = (appointmentId) => (
        <div className="status-card">
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
    )

    async function handleUpdateStatus(id, item) {

        const payload = {
            status: item,
            appointmentId: id,
        };
        try {
            await dispatch(updateStatus(payload)).unwrap();
            setStatusMenu(null);
        } catch (err) {
            console.error(err);
        }

        setStatusMenu(null);
    }

    async function handleDeleteAppointment(appointmentId) {
        try {
            await dispatch(deleteAppointment(appointmentId)).unwrap();
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <div className="appointments-page">

            {/* Header */}

            <div className="page-header">
                <div>
                    <h1>Appointments</h1>
                    <p>View and manage all patient appointments.</p>
                </div>

                <div className="notification">
                    <Bell size={22} />
                </div>
            </div>

            {/* KPI */}

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
                        <span>Upcoming</span>
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

            {/* Appointment Section */}

            <div className="appointment-card">

                {/* Toolbar */}

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

                {/* Filters */}

                <div className="filters">

                    <div className="custom-filter-dropdown">
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

                {/* Table */}

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

                        {appointments?.map((appointment, index) => (
                            <tr key={appointment.id}>
                                <td data-label="#">{index + 1}</td>
                                <td data-label="Patient">{appointment.patient_name}</td>

                                <td data-label="Age / Sex">
                                    <p>{Math.floor((Date.now() - new Date(appointment.date_of_birth)) / (1000 * 60 * 60 * 24 * 365))} Years</p>
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
                                <td data-label="Actions">
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
                        ))}
                    </tbody>
                </table>

            </div>

        </div>
    );
};

export default AppointmentPage;