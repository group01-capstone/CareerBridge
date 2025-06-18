import React from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Navbar,
  Nav,
  Image,
  Button
} from "react-bootstrap";
import { NavLink } from "react-router-dom";
import "/public/style.css";
import "bootstrap/dist/css/bootstrap.min.css";

const UserDashboard = () => {
  return (
    <div className="bg-light min-vh-100">
      <Navbar expand="lg" className="top-navbar px-3">
        <Navbar.Brand>
          <Image src="/images/logo.png" alt="Logo" className="nav-logo" />
        </Navbar.Brand>
        <Nav className="ml-auto nav-links">
          <NavLink to="/user/home" className="nav-link active">Home</NavLink>
          <NavLink to="/user/my-jobs" className="nav-link">My Jobs</NavLink>
          <NavLink to="/user/profile" className="nav-link">Profile</NavLink>
           <NavLink to="/logout" className="nav-link">Logout</NavLink>
        </Nav>
      </Navbar>

      <Container fluid="xl" className="py-5">
        <h2 className="text-center text-success mb-4 fw-bold">User Dashboard</h2>
        <Row className="justify-content-center">
          <Col md={4} className="mb-4">
            <Card className="shadow-sm border-0 p-3 bg-white">
              <Card.Body className="text-center">
                <Card.Title>Explore Jobs</Card.Title>
                <Card.Text>Browse and filter job categories that suit you best.</Card.Text>
                <NavLink to="/user/home">
                  <Button variant="outline-success">Find Jobs</Button>
                </NavLink>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4} className="mb-4">
            <Card className="shadow-sm border-0 p-3 bg-white">
              <Card.Body className="text-center">
                <Card.Title>My Jobs</Card.Title>
                <Card.Text>See applied and saved jobs along with application status.</Card.Text>
                <NavLink to="/user/my-jobs">
                  <Button variant="outline-success">View My Jobs</Button>
                </NavLink>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4} className="mb-4">
            <Card className="shadow-sm border-0 p-3 bg-white">
              <Card.Body className="text-center">
                <Card.Title>My Profile</Card.Title>
                <Card.Text>Manage your details, resume, and preferences.</Card.Text>
                <NavLink to="/user/profile">
                  <Button variant="outline-success">Edit Profile</Button>
                </NavLink>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default UserDashboard;
