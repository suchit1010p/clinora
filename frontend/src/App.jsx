import React from 'react'
import { Route, Routes } from "react-router-dom"


import Welcome from './pages/WelcomePage'
import AuthLayout from './layouts/AuthLayout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import MainLayout from './layouts/MainLayout'
import HomePage from './pages/HomePage'
import ProtectedRoute from './routes/ProtectedRoute'

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
                    <Route path='/home' element={<HomePage />} />
                </Route>
            </Route>

        </Routes>
    )
}

export default App
