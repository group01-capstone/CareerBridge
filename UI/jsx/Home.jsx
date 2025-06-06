import React from "react";
import { useNavigate } from "react-router-dom";
import "/public/style.css";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-wrapper">
      
      <div className="top-navbar">
        <img src="/images/logo.png" alt="Logo" className="nav-logo" />

        <div className="nav-actions">
          <button className="main-btn nav-btn" onClick={() => navigate("/login")}>
            Log In
          </button>
          <button className="main-btn nav-btn" onClick={() => navigate("/signup")}>
            Sign Up
          </button>
        </div>
      </div>

      
      <div className="hero-section">
        <img
          src="/images/avatar.webp"
          alt="Phil the Career Advisor"
          className="avatar-img animated-fade"
        />
        <h2 className="animated-slide">
          WELCOME! I'M <span>TALENTRA</span>,<br />YOUR CAREER ADVISOR.
        </h2>
        <p className="animated-fade">
          Sign up or log in to get job matches made for you.
        </p>

        <div className="button-group animated-pop">
          <button className="main-btn large-btn" onClick={() => navigate("/signup")}>
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
}