import { ArrowRight } from "lucide-react";
import "./Navbar.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const Navbar = () => {
    const { user } = useSelector((state) => state.auth);
    const location = useLocation();
    const navigate = useNavigate();

    const handleScroll = (id) => {
        if (location.pathname !== '/') {
            navigate(`/${id}`);
        } else {
            const element = document.querySelector(id);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    return (
        <div className="navbar">
            <div className="navbar-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                <img src="./favicon.png" alt="Clinora" />
                <p>CLINORA</p>
            </div>

            <ul className="nav-menu">
                {user ? (
                    <>
                        <li><Link to="/appointments">Appointments</Link></li>
                        <li><Link to="/patients">Patients</Link></li>
                        <li><Link to="/appointments/create">New Booking</Link></li>
                    </>
                ) : (
                    <>
                        <li><a href="#features" onClick={(e) => { e.preventDefault(); handleScroll('#features'); }}>Features</a></li>
                        <li><a href="#how-it-works" onClick={(e) => { e.preventDefault(); handleScroll('#how-it-works'); }}>How It Works</a></li>
                        <li><Link to="/login">Doctor Portal</Link></li>
                    </>
                )}
            </ul>

            <Link
                className="nav-start"
                to={user ? "/appointments" : "/login"}
            >
                {user ? "Dashboard" : "Let's start"}
                <ArrowRight className="arrow" />
            </Link>
        </div>
    );
};

export default Navbar;
