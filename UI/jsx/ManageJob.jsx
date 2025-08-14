import React, { useEffect, useState } from "react";
import { gql, useQuery, useMutation } from "@apollo/client";
import { Container, Table, Button, Modal, Form, Alert, Badge, Navbar, Nav, Image } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import Footer from "./Footer.jsx";
const GET_ALL_JOBS = gql`
  query GetAllJobs {
    getAllJobs {
      _id
      title
      location
      type
      deadline
      description
      salary
      aboutJob
      aboutYou
      whatWeLookFor
      mustHave
      benefits
      email
    }
  }
`;

const UPDATE_JOB = gql`
  mutation UpdateJob($id: ID!, $input: JobInput!) {
    updateJob(id: $id, input: $input) {
      _id
      title
      location
      type
      deadline
      description
      salary
      aboutJob
      aboutYou
      whatWeLookFor
      mustHave
      benefits
      email
    }
  }
`;
const DELETE_JOB = gql`
  mutation DeleteJob($id: ID!) {
    deleteJob(id: $id)
  }
`;

const ManageJob = () => {
  const { data, loading, error, refetch } = useQuery(GET_ALL_JOBS);
  
  const [updateJob] = useMutation(UPDATE_JOB);
  const [deleteJob] = useMutation(DELETE_JOB);

  const [selectedJob, setSelectedJob] = useState(null);
  const [formData, setFormData] = useState({ mustHave: [] });
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState(null);
  const [mustHaveInput, setMustHaveInput] = useState("");

  const handleEditClick = (job) => {
    setSelectedJob(job);
    setFormData({ ...job, mustHave: job.mustHave || [] });
    setShowModal(true);
    setMustHaveInput("");
  };

  const handleChange = (e) => {
  const { name, value } = e.target;

  if (name === "salary") {
    // Allow only numbers (and optional decimal point)
    const numericRegex = /^\d*\.?\d*$/;
    if (!numericRegex.test(value)) return; // Reject non-numeric input
  }

  setFormData((prev) => ({ ...prev, [name]: value }));
};


  const handleAddMustHave = () => {
    if (mustHaveInput.trim() !== "") {
      setFormData((prev) => ({
        ...prev,
        mustHave: [...(prev.mustHave || []), mustHaveInput.trim()],
      }));
      setMustHaveInput("");
    }
  };

  const handleRemoveMustHave = (index) => {
    setFormData((prev) => ({
      ...prev,
      mustHave: prev.mustHave.filter((_, i) => i !== index),
    }));
  };

  const handleUpdate = async () => {
    try {
      const {
        title,
        description,
        location,
        salary,
        type,
        deadline,
        aboutJob,
        aboutYou,
        whatWeLookFor,
        mustHave,
        benefits,
        email,
      } = formData;

      const input = {
        title,
        description,
        location,
        salary,
        type,
        deadline,
        aboutJob,
        aboutYou,
        whatWeLookFor,
        mustHave,
        benefits,
        email,
      };

      await updateJob({ variables: { id: selectedJob._id, input } });
      setMessage({ type: "success", text: "Job updated successfully" });
      setShowModal(false);
      refetch();
    } catch (err) {
      setMessage({ type: "danger", text: "Update error: " + err.message });
    }
  };

   const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;

    try {
      await deleteJob({ variables: { id } });
      setMessage({ type: "success", text: "Job deleted successfully" });
      refetch();
    } catch (err) {
      setMessage({ type: "danger", text: "Delete error: " + err.message });
    }
  };

  if (loading) return <p>Loading jobs...</p>;
  if (error) return <p>Error: {error.message}</p>;

  if (loading) return <p>Loading jobs...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      {/* Navbar */}
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


      <Container className="py-4">
        <h2 className="mb-4">Manage Jobs</h2>
        {message && <Alert variant={message.type}>{message.text}</Alert>}

        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Title</th>
              <th>Location</th>
              <th>Type</th>
              <th>Deadline</th>
              <th>Salary</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.getAllJobs.map((job) => (
              <tr key={job._id}>
                <td>{job.title}</td>
                <td>{job.location}</td>
                <td>{job.type}</td>
                <td>{job.deadline}</td>
                <td>{job.salary}</td>
                <td className="d-flex gap-2">
                   <Button
                   className="action-btn approve-btn btn-sm"
                    variant="warning"
                    size="sm"
                    onClick={() => handleEditClick(job)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(job._id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        {}
        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" scrollable>
          <Modal.Header closeButton>
            <Modal.Title>Edit Job</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Title</Form.Label>
                <Form.Control name="title" value={formData.title || ""} onChange={handleChange} />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control as="textarea" rows={3} name="description" value={formData.description || ""} onChange={handleChange} />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Location</Form.Label>
                <Form.Control name="location" value={formData.location || ""} onChange={handleChange} />
              </Form.Group>

             <Form.Group className="mb-3">
  <Form.Label>Salary</Form.Label>
  <Form.Control
    name="salary"
    value={formData.salary || ""}
    onChange={handleChange}
    inputMode="numeric"
    placeholder="Enter salary in numbers only"
  />
</Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Type</Form.Label>
                <Form.Select name="type" value={formData.type || ""} onChange={handleChange}>
                  <option value="">Select Type</option>
                  <option value="Full-Time">Full-Time</option>
                  <option value="Part-Time">Part-Time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Application Deadline</Form.Label>
                <Form.Control
                  type="date"
                  name="deadline"
                  value={formData.deadline ? formData.deadline.split("T")[0] : ""}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>About the Job</Form.Label>
                <Form.Control as="textarea" rows={2} name="aboutJob" value={formData.aboutJob || ""} onChange={handleChange} />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>About You</Form.Label>
                <Form.Control as="textarea" rows={2} name="aboutYou" value={formData.aboutYou || ""} onChange={handleChange} />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>What We Look For</Form.Label>
                <Form.Control as="textarea" rows={2} name="whatWeLookFor" value={formData.whatWeLookFor || ""} onChange={handleChange} />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Must-Have Skills</Form.Label>
                <div className="d-flex mb-2">
                  <Form.Control
                    value={mustHaveInput}
                    onChange={(e) => setMustHaveInput(e.target.value)}
                    placeholder="Add skill or experience"
                  />
                  <Button variant="outline-primary" className="ms-2" onClick={handleAddMustHave}>
                    Add
                  </Button>
                </div>
                <div>
                  {formData.mustHave && formData.mustHave.length > 0 ? (
                    formData.mustHave.map((item, idx) => (
                      <Badge
                        key={idx}
                        pill
                        bg="info"
                        className="me-2 mb-2"
                        style={{ cursor: "pointer" }}
                        onClick={() => handleRemoveMustHave(idx)}
                        title="Click to remove"
                      >
                        {item} &times;
                      </Badge>
                    ))
                  ) : (
                    <p className="text-muted">No must-have skills added.</p>
                  )}
                </div>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Benefits</Form.Label>
                <Form.Control as="textarea" rows={2} name="benefits" value={formData.benefits || ""} onChange={handleChange} />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Contact Email</Form.Label>
                <Form.Control type="email" name="email" value={formData.email || ""} readOnly />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleUpdate}>
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
      <div className="mt-auto"> <Footer/></div>
     
    </div>
  );
};

export default ManageJob;
