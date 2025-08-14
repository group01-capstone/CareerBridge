// src/components/CreateJob.jsx
import React, { useState, useEffect } from "react";
import Footer from "./Footer.jsx";
import {
  Container,
  Form,
  Button,
  Row,
  Col,
  Alert,
  Card,
  Navbar,
  Nav,
  Image,
} from "react-bootstrap";
import { gql, useMutation, useQuery } from "@apollo/client";
import { NavLink } from "react-router-dom";
import { Briefcase, Calendar, MapPin, DollarSign } from "react-feather";
import "/public/style.css";

const CREATE_JOB = gql`
  mutation CreateJob($input: JobInput!) {
    createJob(input: $input) {
      _id
      title
      description
      location
      salary
      type
      deadline
      aboutJob
      aboutYou
      whatWeLookFor
      mustHave
      benefits
      email
      companyName
      createdAt
    }
  }
`;

const GET_ALL_JOBS = gql`
  query GetAllJobs {
    getAllJobs {
      _id
      title
      description
      location
      salary
      type
      deadline
      aboutJob
      aboutYou
      whatWeLookFor
      mustHave
      benefits
      email
      companyName
      createdAt
    }
  }
`;

const GET_ADMIN_PROFILE = gql`
  query GetAdminProfile($email: String!) {
    getAdminProfile(email: $email) {
      companyName
    }
  }
`;

export default function CreateJob() {
  const email = localStorage.getItem("adminEmail") || "";
  const today = new Date().toISOString().split("T")[0];

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    salary: "",
    type: "",
    deadline: "",
    aboutJob: "",
    aboutYou: "",
    whatWeLookFor: "",
    mustHave: [],
    benefits: "",
    email: email,
  });

  const [mustHaveInput, setMustHaveInput] = useState("");
  const [message, setMessage] = useState(null);

  const { data } = useQuery(GET_ADMIN_PROFILE, {
    variables: { email },
    skip: !email,
  });

  const [createJob] = useMutation(CREATE_JOB, {
    update(cache, { data: { createJob } }) {
      const existing = cache.readQuery({ query: GET_ALL_JOBS });
      if (existing?.getAllJobs) {
        cache.writeQuery({
          query: GET_ALL_JOBS,
          data: { getAllJobs: [createJob, ...existing.getAllJobs] },
        });
      }
    },
  });

  useEffect(() => {
    if (data?.getAdminProfile?.companyName) {
      setFormData((prev) => ({
        ...prev,
        email: email,
      }));
    }
  }, [data, email]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // lock salary to numbers
    if (name === "salary" && value && !/^\d*$/.test(value)) return;

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddMustHave = () => {
    const v = mustHaveInput.trim();
    if (!v) return;
    setFormData((prev) => ({ ...prev, mustHave: [...prev.mustHave, v] }));
    setMustHaveInput("");
  };

  const handleRemoveMustHave = (index) => {
    setFormData((prev) => ({
      ...prev,
      mustHave: prev.mustHave.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    try {
      await createJob({ variables: { input: formData } });
      setMessage({ type: "success", text: "Job created successfully." });
      setFormData((prev) => ({
        ...prev,
        title: "",
        description: "",
        location: "",
        salary: "",
        type: "",
        deadline: "",
        aboutJob: "",
        aboutYou: "",
        whatWeLookFor: "",
        mustHave: [],
        benefits: "",
      }));
      setMustHaveInput("");
    } catch (err) {
      setMessage({ type: "danger", text: err.message });
    }
  };

  return (
    // Sticky footer layout
    <div className="d-flex flex-column min-vh-100 bg-light">
      {/* Navbar */}
      <Navbar
        expand="lg"
        className="top-navbar px-3"
        bg="light"
        variant="light"
        sticky="top"
      >
        <Container fluid>
          <Navbar.Brand>
            <Image src="/images/logo.png" alt="Logo" className="nav-logo" />
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="admin-navbar-nav" />
          <Navbar.Collapse id="admin-navbar-nav">
            <Nav className="ms-auto nav-links">
              <NavLink to="/admin" className="nav-link">
                Dashboard
              </NavLink>
              <NavLink to="/admin/create-job" className="nav-link">
                Create Job
              </NavLink>
              <NavLink to="/admin/manage-job" className="nav-link">
                Manage Job
              </NavLink>
              <NavLink to="/admin/manage-applicants" className="nav-link">
                Manage Applicants
              </NavLink>
              <NavLink to="/admin/profile" className="nav-link active">
                Profile
              </NavLink>
              <NavLink to="/" className="nav-link">
                Logout
              </NavLink>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Main */}
      <Container className="py-5 flex-grow-1">
        <Row className="justify-content-center">
          <Col xs={12} md={10} lg={8}>
            <Card className="p-4 shadow-lg border-0 rounded-4 standard-form-card">
              <h3 className="dashboard-title text-center fw-bold mb-4">
                <Briefcase size={28} className="me-2" />
                Create a New Job
              </h3>

              {message && <Alert variant={message.type}>{message.text}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Job Title</Form.Label>
                      <Form.Control
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>
                        <MapPin size={16} className="me-1" />
                        Location
                      </Form.Label>
                      <Form.Control
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>
                        <DollarSign size={16} className="me-1" />
                        Salary
                      </Form.Label>
                      <Form.Control
                        name="salary"
                        value={formData.salary}
                        onChange={handleChange}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        onKeyPress={(e) => {
                          if (!/[0-9]/.test(e.key)) e.preventDefault();
                        }}
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Job Type</Form.Label>
                      <Form.Select
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Type</option>
                        <option value="Full-Time">Full-Time</option>
                        <option value="Part-Time">Part-Time</option>
                        <option value="Contract">Contract</option>
                        <option value="Internship">Internship</option>
                      </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>
                        <Calendar size={16} className="me-1" />
                        Application Deadline
                      </Form.Label>
                      <Form.Control
                        type="date"
                        name="deadline"
                        value={formData.deadline}
                        onChange={handleChange}
                        min={today}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>About the Job</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="aboutJob"
                    value={formData.aboutJob}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>About the Company</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="aboutYou"
                    value={formData.aboutYou}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>What We Look For</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="whatWeLookFor"
                    value={formData.whatWeLookFor}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Must-Have Skills & Experience</Form.Label>
                  <div className="d-flex mb-2 gap-2">
                    <Form.Control
                      value={mustHaveInput}
                      onChange={(e) => setMustHaveInput(e.target.value)}
                      placeholder="e.g. React.js"
                    />
                    <Button className="main-btn" onClick={handleAddMustHave} type="button">
                      Add
                    </Button>
                  </div>

                  {formData.mustHave.map((item, idx) => (
                    <div
                      key={idx}
                      className="d-flex justify-content-between align-items-center mb-1"
                    >
                      <span>🔹 {item}</span>
                      <Button
                        className="main-btn"
                        onClick={() => handleRemoveMustHave(idx)}
                        type="button"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Working With Us (Benefits)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="benefits"
                    value={formData.benefits}
                    onChange={handleChange}
                  />
                </Form.Group>

                <div className="d-flex justify-content-center">
                  <Button className="main-btn" variant="success" type="submit" size="lg">
                    Post Job
                  </Button>
                </div>
              </Form>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Footer pinned to bottom */}
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}
