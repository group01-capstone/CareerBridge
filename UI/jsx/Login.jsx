import React, { useState } from "react";
import { gql, useMutation } from "@apollo/client";
import { useNavigate, Link } from "react-router-dom";
import "/public/style.css"; // Update this path based on your project structure

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
    try {
      const response = await login({ variables: { input: form } });
      if (response.data.login) {
        alert(`Welcome, ${response.data.login.name}!`);
        navigate("/admin");
      }
    } catch (err) {
      alert("Login failed: " + err.message);
    }
  };

  return (
    <div className="login-wrapper">
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
          <Link to="/forgot-password">Forgot Password?</Link>
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
    </div>
  );
}
