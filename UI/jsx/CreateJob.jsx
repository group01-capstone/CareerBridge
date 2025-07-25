import React, { useState, useEffect } from "react";
import Footer from "./Footer.jsx";
import {
  Container, Form, Button, Row, Col, Alert, Card, Navbar, Nav, Image
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

const CreateJob = () => {
  const email = localStorage.getItem("adminEmail");
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
    email: email || ""
  });

  const [mustHaveInput, setMustHaveInput] = useState("");
  const [message, setMessage] = useState(null);

  const { data } = useQuery(GET_ADMIN_PROFILE, {
    variables: { email },
    skip: !email
  });

  const [createJob] = useMutation(CREATE_JOB, {
    update(cache, { data: { createJob } }) {
      const existingJobs = cache.readQuery({ query: GET_ALL_JOBS });
      if (existingJobs) {
        cache.writeQuery({
          query: GET_ALL_JOBS,
          data: { getAllJobs: [createJob, ...existingJobs.getAllJobs] },
        });
      }
    }
  });

  useEffect(() => {
    if (data?.getAdminProfile?.companyName) {
      setFormData(prev => ({
        ...prev,
        email: email,
      }));
    }
  }, [data, email]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddMustHave = () => {
    if (mustHaveInput.trim() !== "") {
      setFormData((prev) => ({
        ...prev,
        mustHave: [...prev.mustHave, mustHaveInput.trim()]
      }));
      setMustHaveInput("");
    }
  };

  const handleRemoveMustHave = (index) => {
    setFormData((prev) => ({
      ...prev,
      mustHave: prev.mustHave.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    try {
      await createJob({ variables: { input: formData } });
      setMessage({ type: "success", text: "Job created successfully." });
      setFormData(prev => ({
        ...prev,
        title: "", description: "", location: "", salary: "", type: "", deadline: "",
        aboutJob: "", aboutYou: "", whatWeLookFor: "", mustHave: [], benefits: ""
      }));
    } catch (err) {
      console.error("Job creation error:", err);
      setMessage({ type: "danger", text: err.message });
    }
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


      <Container className="py-5">
        <Card className="p-4 shadow-lg border-0 rounded-4">
          <h3 className="dashboard-title text-center fw-bold mb-4">
            <Briefcase size={28} className="me-2" />Create a New Job
          </h3>
          {message && <Alert variant={message.type}>{message.text}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Job Title</Form.Label>
                  <Form.Control name="title" value={formData.title} onChange={handleChange} required />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label><MapPin size={16} className="me-1" />Location</Form.Label>
                  <Form.Control name="location" value={formData.location} onChange={handleChange} required />
                </Form.Group>
               <Form.Group className="mb-3">
  <Form.Label><DollarSign size={16} className="me-1" />Salary</Form.Label>
  <Form.Control
    name="salary"
    value={formData.salary}
    onChange={handleChange}
    inputMode="numeric"
    pattern="[0-9]*"
    onKeyPress={(e) => {
      if (!/[0-9]/.test(e.key)) {
        e.preventDefault();
      }
    }}
    required
  />
</Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Job Type</Form.Label>
                  <Form.Select name="type" value={formData.type} onChange={handleChange} required>
                    <option value="">Select Type</option>
                    <option value="Full-Time">Full-Time</option>
                    <option value="Part-Time">Part-Time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label><Calendar size={16} className="me-1" />Application Deadline</Form.Label>
                  <Form.Control type="date" name="deadline" value={formData.deadline} onChange={handleChange} />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control as="textarea" rows={4} name="description" value={formData.description} onChange={handleChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>About the Job</Form.Label>
              <Form.Control as="textarea" rows={3} name="aboutJob" value={formData.aboutJob} onChange={handleChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>About You</Form.Label>
              <Form.Control as="textarea" rows={3} name="aboutYou" value={formData.aboutYou} onChange={handleChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>What We Look For</Form.Label>
              <Form.Control as="textarea" rows={3} name="whatWeLookFor" value={formData.whatWeLookFor} onChange={handleChange} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Must-Have Skills & Experience</Form.Label>
              <div className="d-flex mb-2">
                <Form.Control value={mustHaveInput} onChange={(e) => setMustHaveInput(e.target.value)} placeholder="e.g. React.js" />
                <Button  className="main-btn me-2"onClick={handleAddMustHave}>Add</Button>
              </div>
              {formData.mustHave.map((item, idx) => (
                <div key={idx} className="d-flex justify-content-between align-items-center mb-1">
                  <span>🔹 {item}</span>
                  <Button className="main-btn me-2" onClick={() => handleRemoveMustHave(idx)}>Remove</Button>
                </div>
              ))}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Working With Us (Benefits)</Form.Label>
              <Form.Control as="textarea" rows={3} name="benefits" value={formData.benefits} onChange={handleChange} />
            </Form.Group>

            <div className="d-flex justify-content-center">
  <Button className="main-btn" variant="success" type="submit" size="lg">
    Post Job
  </Button>
</div>

          </Form>
        </Card>
      </Container>
      <Footer/>
    </div>
  );
};

export default CreateJob;
