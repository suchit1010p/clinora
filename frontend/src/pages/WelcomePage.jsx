import React from 'react'
import Navbar from '../layouts/Navbar'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useState } from 'react'
import "./styles/Welcome.css"

function WelcomePage() {
    const [doctor, setDoctor] = useState(null)
  return (
    <div>
    <Navbar />

    <section className="welcome-card">
        <p className="welcome-tag">Your Health, Our Priority</p>

        <h1>
            Welcome to <span>Clinora</span>
        </h1>

        <p className="welcome-description">
            Clinora is an AI-powered automation platform that helps doctors build lasting patient relationships through intelligent follow-ups throughout their healthcare journey. It encourages timely revisits whenever a patient's progress indicates the need for further medical attention.
        </p>

        <Link
            className="welcome-booking"
            to={doctor ? "/appointment" : "/login"}
        >
            Book Appointment
            <ArrowRight className="arrow" />
        </Link>
    </section>
</div>
  )
}

export default WelcomePage