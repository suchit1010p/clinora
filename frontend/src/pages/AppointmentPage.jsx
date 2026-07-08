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
} from "lucide-react";

import "./styles/Appointments.css";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
    const appointments = useSelector((state) => state.appointment.items);
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

    useEffect(() => {
        dispatch(getKPI());
    }, [dispatch, appointments]);

    useEffect(() => {
        dispatch(getAppointments({ page, limit }));
    }, [dispatch, page, limit]);


    const renderStatuscard = (appointmentId) => (
        <div className="status-card">
            {STATUS.map((item, index) => (
                <div key={index}>
                    <button onClick={() => handleUpdateStatus(appointmentId, item)}>{item}</button>
                    <hr />
                </div>
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
                        />
                    </div>

                    <button className="add-btn" onClick={() => navigate('/appointments/create')}>
                        <Plus size={18} />
                        New Appointment
                    </button>

                </div>

                {/* Filters */}

                <div className="filters">

                    <select>
                        <option>All Status</option>
                    </select>

                    <input type="date" />

                    <input type="date" />

                    <select>
                        <option>All Doctors</option>
                    </select>

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
                                <td>{index + 1}</td>
                                <td>{appointment.patient_name}</td>

                                <td>
                                    <p>{Math.floor((Date.now() - new Date(appointment.date_of_birth)) / (1000 * 60 * 60 * 24 * 365))} Years</p>
                                    <p>{appointment.sex}</p>
                                </td>
                                <td>
                                    <p>{appointment.email}</p>
                                    <p>{appointment.mobile}</p>
                                </td>
                                <td>{new Date(appointment.scheduled_at).toLocaleDateString()}</td>
                                <td>
                                    <span className={`status ${appointment.status.toLowerCase()}`}>{appointment.status}</span>
                                </td>
                                <td>
                                    <div className="action-buttons">

                                        <button className="action-btn edit" onClick={() => (
                                            setStatusMenu(prev => prev === appointment.id ? null : appointment.id)
                                        )}>
                                            <Pencil size={16} />
                                        </button>
                                        {statusMenu === appointment.id && renderStatuscard(appointment.id)}
                                        
                                        <button className="action-btn view">
                                            <Eye size={16} />
                                        </button>
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