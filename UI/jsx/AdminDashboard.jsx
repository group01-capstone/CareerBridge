import React from "react";
import Footer from "./Footer.jsx";
import {
  Container,
  Row,
  Col,
  Card,
  Image,
  Badge,
  Navbar,
  Nav
} from "react-bootstrap";
import { NavLink } from "react-router-dom";
import "/public/style.css";
import "bootstrap/dist/css/bootstrap.min.css";

const AdminDashboard = () => {
  return (
    <div className="bg-light min-vh-100">
      <Navbar expand="lg" className="top-navbar px-3" bg="light" variant="light" sticky="top">
  <Container fluid>
    <Navbar.Brand>
      <Image src="/images/logo.png" alt="Logo" className="nav-logo" />
    </Navbar.Brand>
    <Navbar.Toggle aria-controls="admin-navbar-nav" />
    <Navbar.Collapse id="admin-navbar-nav">
      <Nav className="ms-auto nav-links">
        <NavLink to="/admin" className="nav-link">Dashboard</NavLink>
        <NavLink to="/admin/create-job" className="nav-link">Create Job</NavLink>
        <NavLink to="/admin/manage-job" className="nav-link">Manage Job</NavLink>
        <NavLink to="/admin/manage-applicants" className="nav-link">Manage Applicants</NavLink>
        <NavLink to="/admin/profile" className="nav-link active">Profile</NavLink>
        <NavLink to="/" className="nav-link">Logout</NavLink>
      </Nav>
    </Navbar.Collapse>
  </Container>
</Navbar>


      <Container fluid="xl" className="py-5">
        <h2 className="text-center text-primary fw-bold mb-5">📊 Admin Dashboard</h2>
        <Row className="g-4">
          <Col md={4}>
            <Card className="border-0 shadow-lg rounded-4 bg-white">
              <Card.Body className="text-center py-4">
                <div className="mb-3">
                  <i className="bi bi-briefcase-fill fs-1 text-success"></i>
                </div>
                <Card.Title className="fs-5 text-uppercase text-muted">Total Jobs</Card.Title>
                <h2 className="display-5 fw-bold text-dark">120</h2>
                <Badge bg="success" pill>Active</Badge>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="border-0 shadow-lg rounded-4 bg-white">
              <Card.Body className="text-center py-4">
                <div className="mb-3">
                  <i className="bi bi-people-fill fs-1 text-info"></i>
                </div>
                <Card.Title className="fs-5 text-uppercase text-muted">Registered Users</Card.Title>
                <h2 className="display-5 fw-bold text-dark">340</h2>
                <Badge bg="info" pill>New This Month</Badge>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="border-0 shadow-lg rounded-4 bg-white">
              <Card.Body className="text-center py-4">
                <div className="mb-3">
                  <i className="bi bi-file-earmark-person-fill fs-1 text-warning"></i>
                </div>
                <Card.Title className="fs-5 text-uppercase text-muted">Total Applications</Card.Title>
                <h2 className="display-5 fw-bold text-dark">580</h2>
                <Badge bg="warning" pill>Pending Review</Badge>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
  
    </div>
  );
};

export default AdminDashboard;
