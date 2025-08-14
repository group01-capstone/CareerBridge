import React, { useState } from "react";
import { Navbar, Nav, Container, Image } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { gql, useMutation } from "@apollo/client";
import { useNavigate, Link, NavLink } from "react-router-dom";
import "/public/style.css";

const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      _id
      email
      name
      role
    }
  }
`;

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [login, { error, loading }] = useMutation(LOGIN_MUTATION);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email.trim() || !form.password.trim()) {
      alert("Please enter both email and password.");
      return;
    }

    try {
      const response = await login({ variables: { input: form } });

      if (response.data.login) {
        const { email, name, role } = response.data.login;

        localStorage.removeItem("adminEmail");
        localStorage.removeItem("userEmail");

        if (role === "admin") {
          localStorage.setItem("adminEmail", email);
          localStorage.setItem("userRole", "admin");
          navigate("/admin");
        } else {
          localStorage.setItem("userEmail", email);
          localStorage.setItem("userRole", "user");
          navigate("/user");
        }

        alert(`Welcome, ${name}!`);
      }
    } catch (err) {
      alert("Login failed: " + err.message);
    }
  };

  return (
    <div className="login-wrapper">
      {}
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
      <div className="login-container">
        {}
        <form className="login-form animated-form" onSubmit={handleSubmit}>
          <h2 className="animated-title">Welcome Back</h2>

          <input
            type="email"
            placeholder="Email Address"
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

          <div className="forgot-password">
            <Link to="/forget-password">Forgot Password?</Link>
          </div>

          <button
            type="submit"
            className="main-btn login-animated-btn"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="signup-link">
            New to CareerBridge? <Link to="/signup">Create an account</Link>
          </p>

          {error && <p className="error-msg">Error: {error.message}</p>}
        </form>

        {}
        <div className="login-illustration">
          <img src="/images/signup.png" alt="Login Illustration" />
        </div>
      </div>
    </div>
  );
}
