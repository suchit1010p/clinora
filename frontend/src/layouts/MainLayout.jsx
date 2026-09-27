import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import "./MainLayout.css";
import { useSelector, useDispatch } from "react-redux";
import { logOut } from "../features/auth/authSlice";
import {
    Astroid,
    AudioLines,
    CalendarDays,
    CircleUser,
    Users,
    Menu,
    X,
    Bell,
    ArrowLeft,
    MoreVertical
} from "lucide-react";
import { useState } from "react";

function MainLayout() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useSelector((state) => state.auth);

    const [sidebarOpen, setSidebarOpen] = useState(false);

    const isAppointmentDetails = location.pathname.startsWith('/appointments/') && location.pathname !== '/appointments/create';

    const handleLogout = () => {
        dispatch(logOut());
    };

    const handleNavLinkClick = () => {
        setSidebarOpen(false);
    };

    return (
        <div className="home-page">
            {/* Mobile Top Header */}
            <header className="mobile-top-header">
                {isAppointmentDetails ? (
                    <button
                        className="mobile-header-back-btn"
                        onClick={() => navigate('/appointments')}
                        aria-label="Back to Appointments"
                    >
                        <ArrowLeft size={22} />
                    </button>
                ) : (
                    <button
                        className="mobile-header-menu-btn"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        aria-label="Toggle navigation menu"
                    >
                        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                )}

                <div className="mobile-header-brand">
                    <img src="/faviconIcon.png" alt="Clinora" className="mobile-header-logo-img" />
                    <span>Clinora</span>
                </div>

                {isAppointmentDetails ? (
                    <button
                        className="mobile-header-more-btn"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        aria-label="Menu options"
                    >
                        <MoreVertical size={20} />
                    </button>
                ) : (
                    <div className="mobile-header-notification" aria-label="Notifications">
                        <Bell size={20} />
                    </div>
                )}
            </header>

            {/* Mobile Backdrop Overlay */}
            {sidebarOpen && (
                <div
                    className="sidebar-backdrop"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar Navigation */}
            <div className={`sidebar ${sidebarOpen ? "open" : ""}`}>
                {/* Logo */}
                <div className="logo">
                    <img src="/faviconIcon.png" alt="Clinora" />

                    <div className="logo-text">
                        <h2>Clinora</h2>
                        <p>Clinic Manager</p>
                    </div>

                    <button
                        className="sidebar-close-btn"
                        onClick={() => setSidebarOpen(false)}
                        aria-label="Close navigation menu"
                    >
                        <X size={22} />
                    </button>
                </div>

                {/* Navigation Links */}
                <div className="navlinks">
                    <NavLink
                        to="/appointments"
                        className={({ isActive }) =>
                            isActive ? "navlink-buttons active" : "navlink-buttons"
                        }
                        onClick={handleNavLinkClick}
                    >
                        <CalendarDays className="navicons" />
                        <span>Appointments</span>
                    </NavLink>

                    <NavLink
                        to="/patients"
                        className={({ isActive }) =>
                            isActive ? "navlink-buttons active" : "navlink-buttons"
                        }
                        onClick={handleNavLinkClick}
                    >
                        <Users className="navicons" />
                        <span>Patients</span>
                    </NavLink>
                </div>

                {/* Doctor Profile */}
                <div className="doctor-profile">
                    <CircleUser className="doctor-profile-icon" />

                    <h2>{user?.name || "Doctor"}</h2>
                    <p>{user?.specialization || "General Physician"}</p>

                    <hr />

                    <button className="logout-button" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="page">
                <Outlet />
            </div>
        </div>
    );
}

export default MainLayout;