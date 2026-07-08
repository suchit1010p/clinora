import React from 'react'
import { Route, Routes } from "react-router-dom"


import Welcome from './pages/WelcomePage'
import AuthLayout from './layouts/AuthLayout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import MainLayout from './layouts/MainLayout'
import ProtectedRoute from './routes/ProtectedRoute'
import AppointmentPage from './pages/AppointmentPage'
import PatientsPage from './pages/patientsPage'
import AppointmentBookingPage from './pages/AppointmentBookingPage'


function App() {
    return (
        <Routes>

            {/* Public Route */}
            <Route path='/' element={<Welcome />} />

            <Route element={<AuthLayout />}>
                <Route path='/login' element={<LoginPage />} />
                <Route path='/register' element={<RegisterPage />} />
            </Route>


            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
                <Route element={<MainLayout />}>
                    <Route path='/appointments' element={<AppointmentPage />} />
                    <Route path='/appointments/create' element={<AppointmentBookingPage />} />
                    <Route path='/patients' element={<PatientsPage />} />
                </Route>
            </Route>

        </Routes>
    )
}

export default App
