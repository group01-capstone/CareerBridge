import React, { useState } from "react";
import { Navbar, Nav, Container, Image } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { gql, useMutation } from "@apollo/client";
import { useNavigate, Link, NavLink } from "react-router-dom"; 
import "/public/style.css";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-wrapper">
      
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