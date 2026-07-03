import { ArrowRight } from "lucide-react";
import React, { useState } from "react";
import "./Navbar.css";
import { Link } from "react-router-dom";

const Navbar = () => {
    const [doctor] = useState(false);

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
                to={doctor ? "/appointment" : "/login"}
            >
                Let's start
                <ArrowRight className="arrow" />
            </Link>
        </div>
    );
};

export default Navbar;