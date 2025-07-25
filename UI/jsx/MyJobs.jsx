import React, { useState } from "react";
import Footer from "./Footer.jsx";
import {
  Container,
  Row,
  Col,
  Card,
  Navbar,
  Nav,
  Image,
  Spinner,
} from "react-bootstrap";
import { NavLink } from "react-router-dom";
import { gql, useQuery } from "@apollo/client";
import { ChevronDown, ChevronUp } from "react-feather";

const GET_APPLIED_JOBS = gql`
  query GetAppliedJobsByUser($userEmail: String!) {
    getAppliedJobsByUser(userEmail: $userEmail) {
      _id
      title
      type
      location
      salary
      description
      aboutJob
      aboutYou
      whatWeLookFor
      mustHave
      benefits
      companyName
      application {
        status
      }
    }
  }
`;

const MyJobs = () => {
  const userEmail = localStorage.getItem("userEmail") || "user@example.com";

  const { loading, error, data } = useQuery(GET_APPLIED_JOBS, {
    variables: { userEmail },
    fetchPolicy: "network-only",
  });

  const [expandedJobId, setExpandedJobId] = useState(null);

  const toggleJobDetails = (id) => {
    setExpandedJobId((prev) => (prev === id ? null : id));
  };

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
        <NavLink to="/user/home" className="nav-link active">Find Job</NavLink>
        <NavLink to="/user/my-jobs" className="nav-link">My Jobs</NavLink>
        <NavLink to="/user/profile" className="nav-link">Profile</NavLink>
        <NavLink to="/" className="nav-link">Logout</NavLink>
      </Nav>
    </Navbar.Collapse>
  </Container>
</Navbar>


      <Container fluid="xl" className="py-5">
        <h2 className="dashboard-title text-center fw-bold mb-4">My Applied Jobs</h2>

        {loading ? (
          <div className="text-center"><Spinner animation="border" /></div>
        ) : error ? (
          <p className="text-danger text-center">Error loading jobs: {error.message}</p>
        ) : data.getAppliedJobsByUser.length === 0 ? (
          <p className="text-center">You have not applied for any jobs yet.</p>
        ) : (
          <Row>
            {data.getAppliedJobsByUser.map((job) => {
              const isOpen = expandedJobId === job._id;
              
              const status = job.application?.status || "Pending";

              return (
                <Col md={6} key={job._id} className="mb-4">
                  <Card className={`shadow-sm border-0 p-3 h-100 ${isOpen ? "bg-light border-success" : "bg-white"}`}>
                    <Card.Body>
                      <div
                        role="button"
                        onClick={() => toggleJobDetails(job._id)}
                        className="d-flex justify-content-between align-items-center fw-bold mb-2 job-title"
                      >
                        {job.title}
                        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </div>

                      <Card.Text><span className="label-text">Company:</span> {job.companyName}</Card.Text>
                      <Card.Text><span className="label-text">Type:</span> {job.type}</Card.Text>
                      <Card.Text><span className="label-text">Location:</span> {job.location}</Card.Text>
                      <Card.Text><span className="label-text">Salary:</span> {job.salary}</Card.Text>
                      <Card.Text className={`fw-bold ${
                        status.toLowerCase() === "approved"
                          ? "text-success"
                          : status.toLowerCase() === "rejected"
                          ? "text-danger"
                          : "text-warning"
                      }`}>
                        Status: {status.charAt(0).toUpperCase() + status.slice(1)}
                      </Card.Text>

                      {isOpen && (
                        <>
                          <hr />
                          <p><span className="label-text">Description:</span> {job.description}</p>
                          <p><span className="label-text">About the Job:</span> {job.aboutJob}</p>
                          <p><span className="label-text">About You:</span> {job.aboutYou}</p>
                          <p><span className="label-text">What We Look For:</span> {job.whatWeLookFor}</p>
                          <p><span className="label-text">Must-Have:</span></p>
                          <ul>
                            {job.mustHave?.map((item, idx) => (
                              <li key={idx}>{item}</li>
                            ))}
                          </ul>
                          <p><span className="label-text">Benefits:</span> {job.benefits}</p>
                        </>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}
      </Container>
      <Footer/>
    </div>
  );
};

export default MyJobs;
