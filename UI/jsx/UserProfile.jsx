// UserProfile.jsx (Updated for Admin/Job Seeker profile handling)
import React, { useState, useEffect } from "react";
import {
  Container, Row, Col, Form, Button, Navbar, Nav, Image, Card
} from "react-bootstrap";
import { NavLink } from "react-router-dom";
import { gql, useMutation, useQuery } from "@apollo/client";
import "/public/style.css";
import "bootstrap/dist/css/bootstrap.min.css";

const GET_USER_PROFILE = gql`
  query GetUserProfile($email: String!) {
    getUserProfile(email: $email) {
      firstName
      lastName
      username
      email
      gender
      status
      mobile
      city
      country
      educationLevel
      customEducation
      customSkills
      customJobs
      linkedin
      github
      resumeFile
      profilePhoto
    }
  }
`;

const SAVE_USER_PROFILE = gql`
  mutation SaveUserProfile($input: UserProfileInput!) {
    saveUserProfile(input: $input) {
      email
      username
    }
  }
`;

const educationOptions = [
  "Primary Education (Grades 1–6)",
  "Secondary Education (Grades 7–12 / High School Diploma)",
  "Vocational Training / Trade School",
  "Post-secondary Certificate / Diploma",
  "Associate Degree (2 years)",
  "Bachelor’s Degree (3–4 years)",
  "Master’s Degree",
  "Doctorate / PhD",
  "Other"
];

const statusOptions = ["Single", "Married", "Divorced", "Widowed"];
const genderOptions = ["Male", "Female", "Other"];

const skillsMap = {
  "Primary Education (Grades 1–6)": ["Basic literacy", "Numeracy", "Communication", "Social interaction"],
  "Secondary Education (Grades 7–12 / High School Diploma)": ["Critical thinking", "Teamwork", "Basic computer use", "Time management"],
  "Vocational Training / Trade School": ["Technical know-how", "Safety procedures", "Hands-on experience"],
  "Post-secondary Certificate / Diploma": ["Specialized training", "Problem-solving", "Industry-specific tools"],
  "Associate Degree (2 years)": ["Communication", "Basic research", "Foundational knowledge"],
  "Bachelor’s Degree (3–4 years)": ["Research", "Project management", "Analytical thinking", "Digital literacy"],
  "Master’s Degree": ["Leadership", "Strategic planning", "Advanced research"],
  "Doctorate / PhD": ["Expert-level research", "Innovation", "Academic writing"],
  "Other": []
};

const jobMap = {
  "Primary Education (Grades 1–6)": ["Cashier", "Warehouse worker", "Food service worker"],
  "Secondary Education (Grades 7–12 / High School Diploma)": ["Retail assistant", "Delivery driver", "Customer service rep"],
  "Vocational Training / Trade School": ["Electrician", "Mechanic", "Hairstylist", "Welder"],
  "Post-secondary Certificate / Diploma": ["Dental assistant", "Graphic designer", "Early childhood educator"],
  "Associate Degree (2 years)": ["Lab technician", "Paralegal", "IT support", "Medical assistant"],
  "Bachelor’s Degree (3–4 years)": ["Software developer", "Teacher", "Marketing coordinator", "HR specialist"],
  "Master’s Degree": ["Manager", "Psychologist", "Data analyst", "University lecturer"],
  "Doctorate / PhD": ["Research scientist", "Professor", "Policy advisor", "Senior consultant"],
  "Other": []
};
async function uploadFile(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) throw new Error("Upload failed");
  const data = await response.json();
  return data.filename;
}

const UserProfile = () => {
  const email = localStorage.getItem("userEmail");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: email || "",
    gender: "",
    status: "",
    mobile: "",
    city: "",
    country: "",
    educationLevel: "",
    customEducation: "",
    customSkills: "",
    customJobs: "",
    linkedin: "",
    github: "",
    resumeFile: "",
    profilePhoto: ""
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const { data } = useQuery(GET_USER_PROFILE, { variables: { email }, skip: !email });
  const [saveUserProfile] = useMutation(SAVE_USER_PROFILE);

  useEffect(() => {
    if (data?.getUserProfile) {
      setFormData(data.getUserProfile);
    }
  }, [data]);

   const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "resumeFile" && files?.[0]) {
      setResumeFile(files[0]);
    } else if (name === "profilePhoto" && files?.[0]) {
      setProfilePhoto(files[0]);
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleEducationChange = (e) => {
    const selected = e.target.value;
    setFormData({
      ...formData,
      educationLevel: selected,
      customEducation: "",
      customSkills: "",
      customJobs: ""
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let uploadedResume = formData.resumeFile;
      let uploadedPhoto = formData.profilePhoto;

      if (resumeFile instanceof File) {
        uploadedResume = await uploadFile(resumeFile);
      }
      if (profilePhoto instanceof File) {
        uploadedPhoto = await uploadFile(profilePhoto);
      }

      await saveUserProfile({
        variables: {
          input: {
            ...formData,
            resumeFile: uploadedResume,
            profilePhoto: uploadedPhoto
          }
        }
      });

      alert("Profile saved successfully!");
    } catch (err) {
      console.error("Error saving profile:", err);
      alert("Failed to save profile");
    }
  };

  const skillsOptions = skillsMap[formData.educationLevel] || [];
  const jobOptions = jobMap[formData.educationLevel] || [];

  return (
    <div className="bg-light min-vh-100">
      <Navbar expand="lg" className="top-navbar px-3">
        <Navbar.Brand>
          <Image src="/images/logo.png" alt="Logo" className="nav-logo" />
        </Navbar.Brand>
        <Nav className="ml-auto nav-links">
          <NavLink to="/user/home" className="nav-link">Home</NavLink>
          <NavLink to="/user/my-jobs" className="nav-link">My Jobs</NavLink>
          <NavLink to="/user/profile" className="nav-link active">Profile</NavLink>
          <NavLink to="/logout" className="nav-link">Logout</NavLink>
        </Nav>
      </Navbar>

      <Container className="py-5">
        <h3 className="text-center text-success mb-4 fw-bold">User Profile</h3>
        <Card className="p-4 shadow-sm border-0">
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={4}><Form.Group><Form.Label>First Name *</Form.Label><Form.Control name="firstName" value={formData.firstName} onChange={handleChange} required /></Form.Group></Col>
              <Col md={4}><Form.Group><Form.Label>Last Name *</Form.Label><Form.Control name="lastName" value={formData.lastName} onChange={handleChange} required /></Form.Group></Col>
              <Col md={4}><Form.Group><Form.Label>Username *</Form.Label><Form.Control name="username" value={formData.username} onChange={handleChange} required /></Form.Group></Col>
            </Row>
            <Row>
              <Col md={4}><Form.Group><Form.Label>Email</Form.Label><Form.Control value={formData.email} readOnly plaintext /></Form.Group></Col>
              <Col md={4}><Form.Group><Form.Label>Gender *</Form.Label><Form.Select name="gender" value={formData.gender} onChange={handleChange} required><option value="">Select Gender</option>{genderOptions.map((g, i) => <option key={i} value={g}>{g}</option>)}</Form.Select></Form.Group></Col>
              <Col md={4}><Form.Group><Form.Label>Status *</Form.Label><Form.Select name="status" value={formData.status} onChange={handleChange} required><option value="">Select Status</option>{statusOptions.map((s, i) => <option key={i} value={s}>{s}</option>)}</Form.Select></Form.Group></Col>
            </Row>
            <Row>
              <Col md={6}><Form.Group><Form.Label>Mobile *</Form.Label><Form.Control name="mobile" value={formData.mobile} onChange={handleChange} required /></Form.Group></Col>
              <Col md={3}><Form.Group><Form.Label>City *</Form.Label><Form.Control name="city" value={formData.city} onChange={handleChange} required /></Form.Group></Col>
              <Col md={3}><Form.Group><Form.Label>Country *</Form.Label><Form.Control name="country" value={formData.country} onChange={handleChange} required /></Form.Group></Col>
            </Row>
            <Form.Group><Form.Label>Education Level *</Form.Label><Form.Select name="educationLevel" value={formData.educationLevel} onChange={handleEducationChange} required><option value="">Select Education Level</option>{educationOptions.map((e, i) => <option key={i} value={e}>{e}</option>)}</Form.Select>{formData.educationLevel === "Other" && <Form.Control className="mt-2" name="customEducation" placeholder="Enter custom education" value={formData.customEducation} onChange={handleChange} />}</Form.Group>

            {formData.educationLevel && (
              <>
                <Form.Group><Form.Label>Relevant Skills *</Form.Label><Form.Select name="customSkills" value={formData.customSkills} onChange={handleChange} required><option value="">Select Skill</option>{skillsOptions.map((s, i) => <option key={i} value={s}>{s}</option>)}<option value="Other">Other</option></Form.Select>{formData.customSkills === "Other" && <Form.Control className="mt-2" name="customSkills" placeholder="Enter custom skill" onChange={handleChange} />}</Form.Group>

                <Form.Group><Form.Label>Example Jobs *</Form.Label><Form.Select name="customJobs" value={formData.customJobs} onChange={handleChange} required><option value="">Select Job</option>{jobOptions.map((j, i) => <option key={i} value={j}>{j}</option>)}<option value="Other">Other</option></Form.Select>{formData.customJobs === "Other" && <Form.Control className="mt-2" name="customJobs" placeholder="Enter custom job" onChange={handleChange} />}</Form.Group>
              </>
            )}

            <Row>
              <Col md={6}><Form.Group><Form.Label>LinkedIn</Form.Label><Form.Control name="linkedin" value={formData.linkedin} onChange={handleChange} placeholder="https://linkedin.com/in/yourname" /></Form.Group></Col>
              <Col md={6}><Form.Group><Form.Label>GitHub</Form.Label><Form.Control name="github" value={formData.github} onChange={handleChange} placeholder="https://github.com/yourname" /></Form.Group></Col>
            </Row>
            <Form.Group><Form.Label>Upload Resume (PDF)</Form.Label><Form.Control type="file" name="resumeFile" accept=".pdf" onChange={handleChange} /></Form.Group>
            <Form.Group><Form.Label>Upload Profile Photo</Form.Label><Form.Control type="file" name="profilePhoto" accept="image/*" onChange={handleChange} /></Form.Group>
            <div className="text-end mt-3">
              <Button type="submit" variant="success">Save Profile</Button>
            </div>
          </Form>
        </Card>
      </Container>
    </div>
  );
};

export default UserProfile;
