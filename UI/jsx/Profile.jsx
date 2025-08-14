// src/components/Profile.jsx
import React, { useState, useEffect, useMemo } from "react";
import Footer from "./Footer.jsx";
import {
  Container,
  Row,
  Col,
  Button,
  Form,
  Alert,
  Navbar,
  Nav,
  Image,
  Card,
  Spinner,
} from "react-bootstrap";
import { gql, useMutation, useQuery } from "@apollo/client";
import { NavLink } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "/public/style.css";

// GraphQL definitions
const GET_PROFILE = gql`
  query GetAdminProfile($email: String!) {
    getAdminProfile(email: $email) {
      _id
      companyName
      industry
      registrationNumber
      foundedYear
      teamSize
      website
      email
      phone
      address
      overview
      linkedin
      twitter
      facebook
      instagram
      __typename
    }
  }
`;

const SAVE_PROFILE = gql`
  mutation SaveAdminProfile($input: AdminProfileInput!) {
    saveAdminProfile(input: $input) {
      email
      companyName
    }
  }
`;

export default function Profile() {
  const email = useMemo(() => localStorage.getItem("adminEmail"), []);
  const [message, setMessage] = useState(null);
  const [profileExists, setProfileExists] = useState(false);

  const [formData, setFormData] = useState({
    companyName: "",
    industry: "",
    registrationNumber: "",
    foundedYear: "",
    teamSize: "",
    website: "",
    email: email || "",
    phone: "",
    address: "",
    overview: "",
    linkedin: "",
    twitter: "",
    facebook: "",
    instagram: "",
  });

  const { data, loading, refetch } = useQuery(GET_PROFILE, {
    variables: { email },
    skip: !email,
    fetchPolicy: "network-only",
  });

  const [saveProfile] = useMutation(SAVE_PROFILE);

  useEffect(() => {
    if (data?.getAdminProfile) {
      setFormData(data.getAdminProfile);
      setProfileExists(true);
    } else {
      setProfileExists(false);
    }
  }, [data]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const stripGraphQLFields = (obj) => {
    const clone = { ...obj };
    delete clone.__typename;
    delete clone._id;
    return clone;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!formData.email || !formData.companyName) {
      setMessage({ type: "danger", text: "Email and Company Name are required." });
      return;
    }

    const cleanedInput = Object.fromEntries(
      Object.entries({
        ...stripGraphQLFields(formData),
        foundedYear: formData.foundedYear ? parseInt(formData.foundedYear, 10) : undefined,
      }).filter(([_, v]) => v !== "" && v !== undefined)
    );

    try {
      await saveProfile({ variables: { input: cleanedInput } });
      const { data: refreshed } = await refetch();
      if (refreshed?.getAdminProfile) {
        setFormData(refreshed.getAdminProfile);
        setProfileExists(true);
      }
      setMessage({
        type: "success",
        text: profileExists ? "Profile updated successfully." : "Profile saved successfully.",
      });
    } catch (error) {
      console.error("Save profile error:", error);
      setMessage({ type: "danger", text: error.message });
    }
  };

  return (
    // Sticky footer layout
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

      {/* Main content */}
      <Container className="py-5 flex-grow-1">
        <Row className="justify-content-center">
          <Col xs={12} md={10} lg={8}>
            <Card className="p-4 shadow-lg border-0 rounded-4 standard-form-card">
              <h3 className="dashboard-title text-center fw-bold mb-4">Company Profile</h3>

              {message && <Alert variant={message.type}>{message.text}</Alert>}

              {loading ? (
                <div className="d-flex justify-content-center py-5">
                  <Spinner animation="border" />
                </div>
              ) : (
                <Form onSubmit={handleSubmit}>
                  {/* Company Information */}
                  <div className="bg-white p-4 mb-4 rounded-3 shadow-sm">
                    <h5 className="text-secondary fw-bold mb-3">Company Information</h5>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Company Name</Form.Label>
                          <Form.Control
                            name="companyName"
                            value={formData.companyName || ""}
                            onChange={handleChange}
                          />
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label>Industry</Form.Label>
                          <Form.Control
                            name="industry"
                            value={formData.industry || ""}
                            onChange={handleChange}
                          />
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label>Registration Number</Form.Label>
                          <Form.Control
                            name="registrationNumber"
                            value={formData.registrationNumber || ""}
                            onChange={handleChange}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Founded Year</Form.Label>
                          <Form.Control
                            type="number"
                            name="foundedYear"
                            value={formData.foundedYear || ""}
                            onChange={handleChange}
                          />
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label>Team Size</Form.Label>
                          <Form.Control
                            name="teamSize"
                            value={formData.teamSize || ""}
                            onChange={handleChange}
                          />
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label>Website</Form.Label>
                          <Form.Control
                            name="website"
                            value={formData.website || ""}
                            onChange={handleChange}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </div>

                  {/* Contact Details */}
                  <div className="bg-white p-4 mb-4 rounded-3 shadow-sm">
                    <h5 className="text-secondary fw-bold mb-3">Contact Details</h5>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Email</Form.Label>
                          <Form.Control
                            type="email"
                            name="email"
                            value={formData.email || ""}
                            readOnly
                            plaintext
                          />
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label>Phone</Form.Label>
                          <Form.Control
                            name="phone"
                            value={formData.phone || ""}
                            onChange={handleChange}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Address</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={3}
                            name="address"
                            value={formData.address || ""}
                            onChange={handleChange}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </div>

                  {/* Business Overview */}
                  <div className="bg-white p-4 mb-4 rounded-3 shadow-sm">
                    <h5 className="text-secondary fw-bold mb-3">Business Overview</h5>
                    <Form.Group>
                      <Form.Control
                        as="textarea"
                        rows={4}
                        name="overview"
                        value={formData.overview || ""}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </div>

                  {/* Social Media */}
                  <div className="bg-white p-4 mb-4 rounded-3 shadow-sm">
                    <h5 className="text-secondary fw-bold mb-3">Social Media Links</h5>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>LinkedIn</Form.Label>
                          <Form.Control
                            name="linkedin"
                            value={formData.linkedin || ""}
                            onChange={handleChange}
                          />
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label>Twitter</Form.Label>
                          <Form.Control
                            name="twitter"
                            value={formData.twitter || ""}
                            onChange={handleChange}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Facebook</Form.Label>
                          <Form.Control
                            name="facebook"
                            value={formData.facebook || ""}
                            onChange={handleChange}
                          />
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label>Instagram</Form.Label>
                          <Form.Control
                            name="instagram"
                            value={formData.instagram || ""}
                            onChange={handleChange}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </div>

                  {/* Action Buttons */}
                  <div className="d-flex justify-content-end gap-2">
                    <Button type="submit" size="lg" variant="success" className="main-btn">
                      Save
                    </Button>
                  </div>
                </Form>
              )}
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
