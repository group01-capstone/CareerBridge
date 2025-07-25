import React, { useState } from "react";
import { Navbar, Nav, Container, Image } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { gql, useMutation } from "@apollo/client";
import { useNavigate, Link, NavLink } from "react-router-dom"; 
import "/public/style.css";

const SIGNUP_MUTATION = gql`
  mutation Signup($input: SignupInput!) {
    signup(input: $input) {
      _id
      email
      name
      role
    }
  }
`;

export default function Signup() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    role: ""
  });

  const [signup, { error }] = useMutation(SIGNUP_MUTATION);
  const navigate = useNavigate();

  // Password must be at least 8 characters with uppercase, lowercase, number, and special char
  const isStrongPassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  };

  // Name should contain only letters and spaces
  const isValidName = (name) => /^[A-Za-z\s]+$/.test(name.trim());

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.role) {
      alert("Please select a role before signing up.");
      return;
    }

    if (!isValidName(form.name)) {
      alert("Full Name should contain only letters and spaces.");
      return;
    }

    if (!isStrongPassword(form.password)) {
      alert(
        "!Password must be at least 8 characters long and include:\n" +
        "- Uppercase letter\n" +
        "- Lowercase letter\n" +
        "- Number\n" +
        "- Special character (@$!%*?&)"
      );
      return;
    }

    try {
      if (form.role !== "admin" && form.role !== "user") return;

      await signup({ variables: { input: form } });
      alert("Signup successful");
      navigate("/login");
    } catch (err) {
      console.error("Signup error:", err);
    }
  };

  const getHeading = () => {
    if (form.role === "admin") return "Employer Signup";
    if (form.role === "user") return "Job Seeker Signup";
    return "Sign Up";
  };

  return (
    <div className="signup-wrapper">
      {/* Top Navbar */}
      <Navbar expand="lg" className="top-navbar px-3" bg="light" variant="light" sticky="top">
        <Container fluid>
          <Navbar.Brand>
            <Image src="/images/logo.png" alt="CareerBridge Logo" className="nav-logo" />
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="login-navbar-nav" />
          <Navbar.Collapse id="login-navbar-nav">
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

      {}
      <div className="signup-container">
        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="signup-form">
          <h2>{getHeading()}</h2>

          <div className="role-toggle">
            <span
              className={form.role === "admin" ? "role-link active" : "role-link"}
              onClick={() => setForm({ ...form, role: "admin" })}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === "Enter") setForm({ ...form, role: "admin" });
              }}
            >
              I am an Employer
            </span>
            <span
              className={form.role === "user" ? "role-link active" : "role-link"}
              onClick={() => setForm({ ...form, role: "user" })}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === "Enter") setForm({ ...form, role: "user" });
              }}
            >
              I am a Job Seeker
            </span>
          </div>

          <input
            type="text"
            placeholder="Full Name"
            value={form.name}
            onChange={(e) => {
              const value = e.target.value;
              if (/^[A-Za-z\s]*$/.test(value)) {
                setForm({ ...form, name: value });
              }
            }}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />

          <button type="submit" className="main-btn bounce">Register</button>
          {error && <p className="error-msg">{error.message}</p>}
        </form>

        {}
        <div className="signup-illustration">
          <img src="/images/signup.png" alt="Job Application" />
        </div>
      </div>
    </div>
  );
}
