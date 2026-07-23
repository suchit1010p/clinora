import { ArrowRight } from "lucide-react";
import "./Navbar.css";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

const Navbar = () => {
    const { user } = useSelector((state) => state.auth);

    return (
        <div className="navbar">
            <div className="logo">
                <img src="./favicon.png" alt="Clinora" />
                <p>CLINORA</p>
            </div>

            <ul className="nav-menu">
                <li>Doctor</li>
                <li>Hospital</li>
                <li>Services</li>
                <li>About</li>
            </ul>

            <Link
                className="nav-start"
                to={user ? "/appointments" : "/login"}
            >
                Let's start
                <ArrowRight className="arrow" />
            </Link>
        </div>
    );
};

export default Navbar;
