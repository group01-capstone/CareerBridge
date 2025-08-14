// src/pages/ChangePassword.jsx (or wherever you keep it)
import React, { useState, useEffect } from "react";
import { useMutation, gql } from "@apollo/client";
import {
  Container,
  Form,
  Button,
  Alert,
  Navbar,
  Nav,
  Image,
} from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const CHANGE_PASSWORD = gql`
  mutation ChangePassword($email: String!, $newPassword: String!) {
    changePassword(email: $email, newPassword: $newPassword) {
      success
      message
    }
  }
`;

export default function ChangePassword() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changePassword, { data, loading, error }] = useMutation(CHANGE_PASSWORD);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await changePassword({ variables: { email, newPassword } });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!data?.changePassword) return;

    const { success, message } = data.changePassword;

    if (success) {
      const timer = setTimeout(() => navigate("/login"), 2000);
      return () => clearTimeout(timer);
    } else {
      if (
        message?.toLowerCase().includes("user with this email does not exist") ||
        message?.toLowerCase().includes("email not found")
      ) {
        const timer = setTimeout(() => navigate("/signup"), 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [data, navigate]);

  return (
    <div className="login-wrapper">
      {/* Top Nav (same as Login) */}
      <Navbar expand="lg" className="top-navbar px-3" bg="light" variant="light" sticky="top">
        <Container fluid>
          <Navbar.Brand>
            <Image src="/images/logo.png" alt="CareerBridge Logo" className="nav-logo" />
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="change-navbar-nav" />
          <Navbar.Collapse id="change-navbar-nav">
            <Nav className="ms-auto nav-links">
              <div className="nav-actions">
                <button className="main-btn nav-btn" onClick={() => navigate("/login")}>
                  Log In
                </button>
                <button className="main-btn nav-btn" onClick={() => navigate("/signup")}>
                  Sign Up
                </button>
              </div>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Main content container (same structure as Login) */}
      <div className="login-container">
        {/* Left: Form */}
        <form className="login-form animated-form" onSubmit={handleSubmit}>
          <h2 className="animated-title">Change Password</h2>

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />

          <button type="submit" className="main-btn login-animated-btn" disabled={loading}>
            {loading ? "Updating..." : "Change Password"}
          </button>

          {/* Messages */}
          {error && <p className="error-msg mt-3">Error: {error.message}</p>}

          {data?.changePassword && (
            <Alert
              className="mt-3"
              variant={data.changePassword.success ? "success" : "warning"}
            >
              {data.changePassword.message}
            </Alert>
          )}

          <p className="signup-link mt-3">
            Remembered your password? <Link to="/login">Back to Login</Link>
          </p>
        </form>

        {/* Right: Illustration (same as Login, change image if you want) */}
        <div className="login-illustration">
          <img src="/images/signup.png" alt="Change Password Illustration" />
        </div>
      </div>
    </div>
  );
}
