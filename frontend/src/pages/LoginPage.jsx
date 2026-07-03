import React from "react";
import "./styles/Login.css";

function LoginPage() {
    const handleLogin = (e) => {
        e.preventDefault();
        console.log("Login form submitted");
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h1>Welcome Back</h1>
                    <p>Login to continue to Clinora</p>
                </div>

                <form onSubmit={handleLogin} className="form">
                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" placeholder="Enter your email" required />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input type="password" placeholder="Enter your password" required />
                    </div>

                    <button type="submit">Login</button>
                </form>

                <span className="bottom-text">
                    Don't have an account? <a href="/register">Register</a>
                </span>
            </div>
        </div>
    );
}

export default LoginPage;