import { Outlet, NavLink } from "react-router-dom";
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
    X
} from "lucide-react";
import { useState } from "react";

function MainLayout() {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);

    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        dispatch(logOut());
    };

    const handleNavLinkClick = () => {
        setSidebarOpen(false);
    };

    return (
        <div className="home-page">
            {/* Mobile Header Menu Button */}
            <button
                className="menu-btn"
                onClick={() => setSidebarOpen(!sidebarOpen)}
            >
                {sidebarOpen ? <X size={28} /> : <Menu size={28} />}
            </button>

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

                    <NavLink
                        to="/audio-files"
                        className={({ isActive }) =>
                            isActive ? "navlink-buttons active" : "navlink-buttons"
                        }
                        onClick={handleNavLinkClick}
                    >
                        <AudioLines className="navicons" />
                        <span>Audio Files</span>
                    </NavLink>

                    <NavLink
                        to="/ai-summaries"
                        className={({ isActive }) =>
                            isActive ? "navlink-buttons active" : "navlink-buttons"
                        }
                        onClick={handleNavLinkClick}
                    >
                        <Astroid className="navicons" />
                        <span>AI Summaries</span>
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