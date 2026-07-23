import React, { useState } from "react";
import "./styles/Login.css";
import { useDispatch, useSelector } from "react-redux";
import { loginAuth } from "../features/auth/authSlice.js";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";

function LoginPage() {

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const dispatch = useDispatch()
    const { user, message, error, loading } = useSelector((state) => state.auth)

    const navigate = useNavigate()

    useEffect(() => {
        if (message == "Login successful" && user) {
            setTimeout(() => {
                navigate("/appointments")
            }, 500)
        }
    }, [message, user, dispatch])  


    const handleLogin = (e) => {
        e.preventDefault();
        console.log({
            email, password
        });

        const payload = {
            email,
            password
        }

        dispatch(loginAuth(payload))

        setEmail("")
        setPassword("")
    };

    const handleGuestLogin = () => {
        const payload = {
            email: "suchit1564@gmail.com",
            password: "sa"
        }
        dispatch(loginAuth(payload))
    };

    return (
        <div className="login-container">
            <div className="login-wrapper">
                <div className="login-card">
                <div className="header-text">
                    <h1>Welcome Back</h1>
                    <p>Login to continue to Clinora</p>
                </div>

                <form onSubmit={handleLogin} className="form">
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            placeholder="Enter your email"
                            onChange={(e) => setEmail(e.target.value)}
                            required />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            placeholder="Enter your password"
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" disabled={loading}>
                        {loading ? "Logining...": "login"}
                    </button>
                </form>

                {error && <p className="error-message">{error}</p>}
                {message && <p className="success-message">{message}</p>}

                <span className="bottom-text" >
                    Don't have an account? <a href="/register">Register</a>
                </span>
            </div>

            <button 
                type="button" 
                className="guest-login-btn" 
                onClick={handleGuestLogin}
                disabled={loading}
            >
                <LogIn size={18} />
                {loading ? "Logging in..." : "Continue as Guest"}
            </button>
        </div>
    </div>
);
}

export default LoginPage;