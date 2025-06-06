import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Form,
  Alert,
  Navbar,
  Nav,
  Image
} from "react-bootstrap";
import { gql, useMutation } from "@apollo/client";
import { NavLink } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "/public/style.css";


const CREATE_PROFILE = gql`
  mutation CreateAdminProfile($input: AdminProfileInput!) {
    createAdminProfile(input: $input) {
      companyName
      email
    }
  }
`;

const Profile = () => {
  const [formData, setFormData] = useState({
    companyName: "",
    industry: "",
    registrationNumber: "",
    foundedYear: "",
    teamSize: "",
    website: "",
    email: "",
    phone: "",
    address: "",
    overview: "",
    linkedin: "",
    twitter: "",
    facebook: "",
    instagram: ""
  });

  const [message, setMessage] = useState(null);
  const [createProfile] = useMutation(CREATE_PROFILE);

  useEffect(() => {
    const storedEmail = localStorage.getItem("adminEmail");
    if (storedEmail) {
      setFormData(prev => ({ ...prev, email: storedEmail }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.companyName) {
      setMessage({ type: "danger", text: "Company name and email are required." });
      return;
    }

    try {
      const { data } = await createProfile({
        variables: {
          input: {
            ...formData,
            foundedYear: parseInt(formData.foundedYear || "0", 10)
          }
        }
      });

      setMessage({
        type: "success",
        text: `Profile for ${data.createAdminProfile.companyName} created successfully.`
      });
    } catch (error) {
      setMessage({
        type: "danger",
        text: error.message.includes("already exists")
          ? "Profile already exists for this email."
          : "Failed to create profile."
      });
    }
  };

  return (
    <div className="bg-light min-vh-100">
      <Navbar expand="lg" className="top-navbar px-3">
        <Navbar.Brand>
          <Image src="/images/logo.png" alt="Logo" className="nav-logo" />
        </Navbar.Brand>
        <Nav className="ml-auto nav-links">
          <NavLink to="/admin" className="nav-link">Dashboard</NavLink>
          <NavLink to="/admin/create-job" className="nav-link">Create Job</NavLink>
          <NavLink to="/admin/manage-job" className="nav-link">Manage Job</NavLink>
          <NavLink to="/admin/manage-applicants" className="nav-link">Manage Applicants</NavLink>
          <NavLink to="/admin/profile" className="nav-link active">Profile</NavLink>
          <NavLink to="/" className="nav-link">Logout</NavLink>
        </Nav>
      </Navbar>

      <Container fluid="xl" className="py-5">
        <h2 className="text-center text-primary mb-4 fw-bold">Create Company Profile</h2>
        {message && <Alert variant={message.type}>{message.text}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Container className="bg-white p-4 mb-4 rounded-3 shadow-sm">
            <h5 className="text-secondary fw-bold mb-3">Company Information</h5>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Company Name</Form.Label>
                  <Form.Control
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="e.g. CareerBridge Inc."
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Industry</Form.Label>
                  <Form.Control
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    placeholder="e.g. HR Tech"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Registration Number</Form.Label>
                  <Form.Control
                    name="registrationNumber"
                    value={formData.registrationNumber}
                    onChange={handleChange}
                    placeholder="e.g. CB-2023-9987"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Founded Year</Form.Label>
                  <Form.Control
                    name="foundedYear"
                    value={formData.foundedYear}
                    onChange={handleChange}
                    type="number"
                    placeholder="e.g. 2020"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Team Size</Form.Label>
                  <Form.Control
                    name="teamSize"
                    value={formData.teamSize}
                    onChange={handleChange}
                    placeholder="e.g. 51-200"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Website</Form.Label>
                  <Form.Control
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://example.com"
                  />
                </Form.Group>
              </Col>
            </Row>
          </Container>

          <Container className="bg-white p-4 mb-4 rounded-3 shadow-sm">
            <h5 className="text-secondary fw-bold mb-3">Contact Details</h5>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    type="email"
                    placeholder="admin@example.com"
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 123 456 7890"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    as="textarea"
                    rows={3}
                    placeholder="123 Main St, City, Country"
                  />
                </Form.Group>
              </Col>
            </Row>
          </Container>

         
          <Container className="bg-white p-4 mb-4 rounded-3 shadow-sm">
            <h5 className="text-secondary fw-bold mb-3">Business Overview</h5>
            <Form.Group>
              <Form.Control
                name="overview"
                value={formData.overview}
                onChange={handleChange}
                as="textarea"
                rows={4}
                placeholder="Brief description of your company..."
              />
            </Form.Group>
          </Container>

          
          <Container className="bg-white p-4 mb-4 rounded-3 shadow-sm">
            <h5 className="text-secondary fw-bold mb-3">Social Media Links</h5>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>LinkedIn</Form.Label>
                  <Form.Control
                    name="linkedin"
                    value={formData.linkedin}
                    onChange={handleChange}
                    placeholder="https://linkedin.com/..."
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Twitter</Form.Label>
                  <Form.Control
                    name="twitter"
                    value={formData.twitter}
                    onChange={handleChange}
                    placeholder="https://twitter.com/..."
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Facebook</Form.Label>
                  <Form.Control
                    name="facebook"
                    value={formData.facebook}
                    onChange={handleChange}
                    placeholder="https://facebook.com/..."
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Instagram</Form.Label>
                  <Form.Control
                    name="instagram"
                    value={formData.instagram}
                    onChange={handleChange}
                    placeholder="https://instagram.com/..."
                  />
                </Form.Group>
              </Col>
            </Row>
          </Container>

         
          <div className="text-end px-3">
            <Button type="submit" size="lg" variant="primary">
              Create Profile
            </Button>
          </div>
        </Form>
      </Container>
    </div>
  );
};

export default Profile;
