import React from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Image,
  Navbar,
  Nav
} from "react-bootstrap";
import { NavLink } from "react-router-dom";
import "/public/style.css";
import "bootstrap/dist/css/bootstrap.min.css";

const AdminDashboard = () => {
  return (
    <div className="bg-light min-vh-100">
      
      <Navbar expand="lg" className="top-navbar px-3">
        <Navbar.Brand>
          <Image src="/images/logo.png" alt="Logo" className="nav-logo" />
        </Navbar.Brand>
        <Nav className="ml-auto nav-links">
          <NavLink to="/admin" className="nav-link active">Dashboard</NavLink>
          <NavLink to="/admin/create-job" className="nav-link">Create Job</NavLink>
          <NavLink to="/admin/manage-job" className="nav-link">Manage Job</NavLink>
          <NavLink to="/admin/manage-applicants" className="nav-link">Manage Applicants</NavLink>
          <NavLink to="/admin/profile" className="nav-link">Profile</NavLink>
          <NavLink to="/logout" className="nav-link">Logout</NavLink>
        </Nav>
      </Navbar>

      <Container fluid="xl" className="py-5">
        <h2 className="text-center text-primary mb-4 fw-bold">Admin Dashboard</h2>
        <Row className="justify-content-center">
          <Col md={4} className="mb-4">
            <Card className="shadow-sm border-0 p-3 bg-white">
              <Card.Body className="text-center">
                <Card.Title>Total Jobs</Card.Title>
                <Card.Text className="display-6 fw-semibold">120</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-4">
            <Card className="shadow-sm border-0 p-3 bg-white">
              <Card.Body className="text-center">
                <Card.Title>Registered Users</Card.Title>
                <Card.Text className="display-6 fw-semibold">340</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-4">
            <Card className="shadow-sm border-0 p-3 bg-white">
              <Card.Body className="text-center">
                <Card.Title>Total Applications</Card.Title>
                <Card.Text className="display-6 fw-semibold">580</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AdminDashboard;
