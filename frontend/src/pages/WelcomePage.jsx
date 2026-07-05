import React from 'react'
import Navbar from '../layouts/Navbar'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useState, useEffect } from 'react'
import "./styles/Welcome.css"
import { useSelector, useDispatch } from 'react-redux'
import { refreshAuth } from '../features/auth/authSlice'

function WelcomePage() {
    const { user } = useSelector((state) => state.auth)
    const dispatch = useDispatch()

    useEffect(() => {
        console.log("WelcomePage useEffect called, user:", user)
        console.log("Cookies:", document.cookie.includes("refreshToken"))
        // is user does not exist and cookies has refresh token then refresh the token and set the user in redux store
        if (!user && document.cookie.includes("refreshToken")) {
            console.log("refreshing token exists so dispatching refreshAccessToken called")
            dispatch(refreshAuth())
        }
    })
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
            to={user ? "/appointment" : "/login"}
        >
            Book Appointment
            <ArrowRight className="arrow" />
        </Link>
    </section>
</div>
  )
}

export default WelcomePage