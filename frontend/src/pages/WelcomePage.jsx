import Navbar from '../layouts/Navbar'
import { Link } from 'react-router-dom'
import { ArrowRight, Brain, Send, Shield } from 'lucide-react'
import { useEffect } from 'react'
import "./styles/Welcome.css"
import { useSelector, useDispatch } from 'react-redux'
import { refreshAuth } from '../features/auth/authSlice'

function WelcomePage() {
    const { user, checkingAuth, authChecked } = useSelector((state) => state.auth)
    const dispatch = useDispatch()

    useEffect(() => {
        if (!user && !checkingAuth && !authChecked) {
            dispatch(refreshAuth())
        }
    }, [authChecked, checkingAuth, dispatch, user])

    return (
        <div className="welcome-page-container">
            <Navbar />

            {/* Hero Section */}
            <header className="welcome-hero">
                <p className="welcome-tag">Your Health, Our Priority</p>

                <h1>
                    Welcome to <span>Clinora</span>
                </h1>

                <p className="welcome-description">
                    Clinora is an AI-powered automation platform that helps doctors build lasting patient relationships through intelligent follow-ups throughout their healthcare journey. It encourages timely revisits whenever a patient's progress indicates the need for further medical attention.
                </p>

                <div className="welcome-cta-group">
                    <Link
                        className="welcome-booking"
                        to={user ? "/appointments" : "/login"}
                    >
                        Book Appointment
                        <ArrowRight className="arrow" />
                    </Link>
                    <a className="welcome-learn-more" href="#features">
                        Learn More
                    </a>
                </div>
            </header>

            {/* Stats Section */}
            <section className="stats-section">
                <div className="stat-card">
                    <h3>98%</h3>
                    <p>Follow-up Success</p>
                </div>
                <div className="stat-card">
                    <h3>10k+</h3>
                    <p>Connected Patients</p>
                </div>
                <div className="stat-card">
                    <h3>24/7</h3>
                    <p>AI Monitoring</p>
                </div>
                <div className="stat-card">
                    <h3>30%</h3>
                    <p>Clinic Time Saved</p>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="features-section">
                <div className="section-header">
                    <h2>Why Doctors Trust <span>Clinora</span></h2>
                    <p>Experience intelligent patient care automation designed for modern healthcare practices.</p>
                </div>

                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">
                            <Brain />
                        </div>
                        <h3>AI-Powered Check-ins</h3>
                        <p>Automatically monitors patient recovery trajectories and flags anomalous progress to recommend timely clinic revisits.</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">
                            <Send />
                        </div>
                        <h3>Telegram Integration</h3>
                        <p>Patients receive instant check-ins, medical recommendations, and interactive responses directly on their favorite chat app.</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">
                            <Shield />
                        </div>
                        <h3>Secure Doctor Dashboard</h3>
                        <p>Clinicians easily view patient logs, recovery progress tracks, AI summary reports, and upcoming appointments.</p>
                    </div>
                </div>
            </section>

            {/* How it Works Section */}
            <section id="how-it-works" className="how-it-works-section">
                <div className="section-header">
                    <h2>How It <span>Works</span></h2>
                    <p>A seamless, automated care cycle that bridges clinical consultations and patient recovery.</p>
                </div>

                <div className="steps-container">
                    <div className="step-card">
                        <div className="step-number">1</div>
                        <h3>Doctor Consultation</h3>
                        <p>The appointment and treatment summary are securely recorded, prompting Clinora to initialize patient check-in triggers.</p>
                    </div>

                    <div className="step-card">
                        <div className="step-number">2</div>
                        <h3>AI Recovery Checks</h3>
                        <p>Clinora automatically contacts the patient via Telegram based on clinical timelines to assess pain levels, side-effects, and recovery.</p>
                    </div>

                    <div className="step-card">
                        <div className="step-number">3</div>
                        <h3>Smart Revisit Booking</h3>
                        <p>If the patient reporting flags potential complications or requires clinical checkup, Clinora invites them to book a follow-up revisit.</p>
                    </div>
                </div>
            </section>

            {/* Footer Section */}
            <footer className="welcome-footer">
                <p>&copy; {new Date().getFullYear()} Clinora Care Platform. All rights reserved.</p>
                <div className="footer-links">
                    <Link to="/login">Doctor Portal</Link>
                    <Link to="/register">Register Clinic</Link>
                    <a href="#features">Features</a>
                </div>
            </footer>
        </div>
    )
}

export default WelcomePage
