import React, { useState, useEffect } from "react";
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
  Image
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

const Profile = () => {
  const email = localStorage.getItem("adminEmail");
  const [message, setMessage] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

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
    instagram: ""
  });

  const { data, loading, refetch } = useQuery(GET_PROFILE, {
    variables: { email },
    skip: !email,
    fetchPolicy: "network-only"
  });

  const [saveProfile] = useMutation(SAVE_PROFILE);

  useEffect(() => {
    if (data?.getAdminProfile) {
      setFormData(data.getAdminProfile);
    }
  }, [data]);

  const handleChange = (e) => {
    if (!isEditMode) return;
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

    if (!isEditMode) return;

    setMessage(null);

    if (!formData.email || !formData.companyName) {
      setMessage({ type: "danger", text: "Email and Company Name are required." });
      return;
    }

    const cleanedInput = Object.fromEntries(
      Object.entries({
        ...stripGraphQLFields(formData),
        foundedYear: parseInt(formData.foundedYear || "0", 10),
      }).filter(([_, v]) => v !== "")
    );

    try {
      await saveProfile({ variables: { input: cleanedInput } });
      const { data: refreshed } = await refetch();
      if (refreshed?.getAdminProfile) {
        setFormData(refreshed.getAdminProfile);
      }
      setMessage({ type: "success", text: "Profile saved successfully." });
      setIsEditMode(false);
    } catch (error) {
      console.error("Save profile error:", error);
      setMessage({ type: "danger", text: error.message });
    }
  };

  const toggleEdit = () => setIsEditMode(true);

  if (loading) return <p className="text-center mt-5">Loading profile...</p>;

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
        <h3 className="dashboard-title text-center fw-bold mb-4">Company Profile</h3>
        {message && <Alert variant={message.type}>{message.text}</Alert>}

        <Form onSubmit={handleSubmit}>
          {/* Company Information */}
          <Container className="bg-white p-4 mb-4 rounded-3 shadow-sm">
            <h5 className="text-secondary fw-bold mb-3">Company Information</h5>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Company Name</Form.Label>
                  <Form.Control name="companyName" value={formData.companyName} onChange={handleChange} readOnly={!isEditMode} />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Industry</Form.Label>
                  <Form.Control name="industry" value={formData.industry} onChange={handleChange} readOnly={!isEditMode} />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Registration Number</Form.Label>
                  <Form.Control name="registrationNumber" value={formData.registrationNumber} onChange={handleChange} readOnly={!isEditMode} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Founded Year</Form.Label>
                  <Form.Control type="number" name="foundedYear" value={formData.foundedYear} onChange={handleChange} readOnly={!isEditMode} />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Team Size</Form.Label>
                  <Form.Control name="teamSize" value={formData.teamSize} onChange={handleChange} readOnly={!isEditMode} />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Website</Form.Label>
                  <Form.Control name="website" value={formData.website} onChange={handleChange} readOnly={!isEditMode} />
                </Form.Group>
              </Col>
            </Row>
          </Container>

          {/* Contact Details */}
          <Container className="bg-white p-4 mb-4 rounded-3 shadow-sm">
            <h5 className="text-secondary fw-bold mb-3">Contact Details</h5>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control type="email" name="email" value={formData.email} readOnly plaintext />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control name="phone" value={formData.phone} onChange={handleChange} readOnly={!isEditMode} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Address</Form.Label>
                  <Form.Control as="textarea" rows={3} name="address" value={formData.address} onChange={handleChange} readOnly={!isEditMode} />
                </Form.Group>
              </Col>
            </Row>
          </Container>

          {/* Business Overview */}
          <Container className="bg-white p-4 mb-4 rounded-3 shadow-sm">
            <h5 className="text-secondary fw-bold mb-3">Business Overview</h5>
            <Form.Group>
              <Form.Control as="textarea" rows={4} name="overview" value={formData.overview} onChange={handleChange} readOnly={!isEditMode} />
            </Form.Group>
          </Container>

          {/* Social Media */}
          <Container className="bg-white p-4 mb-4 rounded-3 shadow-sm">
            <h5 className="text-secondary fw-bold mb-3">Social Media Links</h5>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>LinkedIn</Form.Label>
                  <Form.Control name="linkedin" value={formData.linkedin} onChange={handleChange} readOnly={!isEditMode} />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Twitter</Form.Label>
                  <Form.Control name="twitter" value={formData.twitter} onChange={handleChange} readOnly={!isEditMode} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Facebook</Form.Label>
                  <Form.Control name="facebook" value={formData.facebook} onChange={handleChange} readOnly={!isEditMode} />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Instagram</Form.Label>
                  <Form.Control name="instagram" value={formData.instagram} onChange={handleChange} readOnly={!isEditMode} />
                </Form.Group>
              </Col>
            </Row>
          </Container>

          {/* Action Buttons */}
          <div className="text-end px-3">
            {isEditMode ? (
              <>
                <Button type="submit" size="lg" variant="success" className="main-btn me-2">
                  Save
                </Button>
                <Button type="button" variant="danger"  size="lg" onClick={() => setIsEditMode(false)}>
                  Cancel
                </Button>
              </>
            ) : (
              <Button type="button" size="lg" variant="primary" onClick={setIsEditMode(true)}>
                Edit Profile
              </Button>
            )}
          </div>
        </Form>
      </Container>
      <Footer/>
    </div>
  );
};

export default Profile;
