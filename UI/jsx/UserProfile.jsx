import React, { useState, useEffect } from "react";
import Footer from "./Footer.jsx";
import {
  Container, Row, Col, Form, Button, Navbar, Nav, Image, Card
} from "react-bootstrap";
import { NavLink, useNavigate } from "react-router-dom";
import { gql, useMutation, useQuery } from "@apollo/client";
import "/public/style.css";
import "bootstrap/dist/css/bootstrap.min.css";

const GET_USER_PROFILE = gql`
  query GetUserProfile($email: String!) {
    getUserProfile(email: $email) {
      firstName
      lastName
      email
      gender
      experienceLevel
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
      selfIntroVideo
      coverLetterFile
    }
  }
`;

const SAVE_USER_PROFILE = gql`
  mutation SaveUserProfile($input: UserProfileInput!) {
    saveUserProfile(input: $input) {
      email
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
  "IT",
  "Accounting",
  "Engineering",
  "Other"
];

const genderOptions = ["Male", "Female", "Other"];
const experienceOptions = ["Fresher", "Intermediate", "Senior"];

const skillsMap = {
  "Primary Education (Grades 1–6)": ["Basic literacy", "Numeracy", "Communication", "Social interaction"],
  "Secondary Education (Grades 7–12 / High School Diploma)": ["Critical thinking", "Teamwork", "Basic computer use", "Time management"],
  "Vocational Training / Trade School": ["Technical know-how", "Safety procedures", "Hands-on experience"],
  "Post-secondary Certificate / Diploma": ["Specialized training", "Problem-solving", "Industry-specific tools"],
  "Associate Degree (2 years)": ["Communication", "Basic research", "Foundational knowledge"],
  "Bachelor’s Degree (3–4 years)": ["Research", "Project management", "Analytical thinking", "Digital literacy"],
  "Master’s Degree": ["Leadership", "Strategic planning", "Advanced research"],
  "Doctorate / PhD": ["Expert-level research", "Innovation", "Academic writing"],
  "IT": ["Web Development", "Database Management", "Cybersecurity", "Cloud Computing", "Networking"],
  "Accounting": ["Bookkeeping", "Financial Reporting", "Auditing", "Tax Preparation", "Accounts Payable/Receivable"],
  "Engineering": ["AutoCAD", "MATLAB", "Thermodynamics", "Circuit Analysis", "Project Estimation"],
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
  "IT": ["Frontend Developer", "Backend Developer", "IT Support Specialist", "Network Administrator", "DevOps Engineer"],
  "Accounting": ["Accountant", "Auditor", "Tax Analyst", "Payroll Clerk", "Financial Analyst"],
  "Engineering": ["Mechanical Engineer", "Electrical Engineer", "Civil Engineer", "QA Engineer", "Project Engineer"],
  "Other": []
};

async function uploadFile(file) {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch("http://localhost:5000/upload", {
    method: "POST",
    body: formData,
  });
  if (!response.ok) throw new Error("Upload failed");
  const data = await response.json();
  return data.filename;
}

// Block typing anything but letters, space, apostrophe, hyphen in specific inputs
function lettersOnlyKeyDown(e) {
  const allowedKeys = [
    "Backspace", "Tab", "ArrowLeft", "ArrowRight", "Delete", "Home", "End"
  ];
  const regex = /^[a-zA-Z\s'-]$/;
  if (
    !allowedKeys.includes(e.key) && 
    !regex.test(e.key)
  ) {
    e.preventDefault();
  }
}

export default function UserProfile() {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState(localStorage.getItem("userEmail") || "");
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "",
    gender: "", experienceLevel: "", mobile: "", city: "", country: "",
    educationLevel: "", customEducation: "", customSkills: "", customJobs: "",
    linkedin: "", github: "", resumeFile: "", profilePhoto: "", selfIntroVideo: "", coverLetterFile: ""
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [introVideo, setIntroVideo] = useState(null);
  const [coverLetterFile, setCoverLetterFile] = useState(null);

  const { data } = useQuery(GET_USER_PROFILE, {
    variables: { email: userEmail },
    skip: !userEmail,
    fetchPolicy: "network-only"
  });

  const [saveUserProfile] = useMutation(SAVE_USER_PROFILE);

  useEffect(() => {
    if (!userEmail) {
      alert("Please login first.");
      navigate("/login");
      return;
    }
    if (data?.getUserProfile) {
      setFormData(data.getUserProfile);
    } else {
      setFormData((prev) => ({ ...prev, email: userEmail }));
    }
  }, [data, userEmail, navigate]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "resumeFile") setResumeFile(files[0]);
    else if (name === "profilePhoto") setProfilePhoto(files[0]);
    else if (name === "selfIntroVideo") setIntroVideo(files[0]);
    else if (name === "coverLetterFile") setCoverLetterFile(files[0]);
    else setFormData({ ...formData, [name]: value });
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

  const validateFields = () => {
    const lettersOnly = /^[A-Za-z\s'-]+$/;
    const mobilePattern = /^\+?\d{7,15}$/;
    const urlPattern = /^(https?:\/\/)?([\w.-]+)+(:\d+)?(\/[\w.-]*)*\/?$/i;
    const allowedProfilePhotoExt = ["jpeg", "jpg", "png"];
    const allowedVideoExt = ["mp4", "mov", "avi", "wmv", "flv", "mkv", "webm"];
    const allowedDocExt = ["pdf", "doc", "docx"];

    const getFileExtension = (filename) => {
      if (!filename) return "";
      const parts = filename.split(".");
      return parts.length > 1 ? parts.pop().toLowerCase() : "";
    };

    const requiredFields = [
      "firstName", "lastName", "gender", "mobile",
      "city", "country", "educationLevel",
      "experienceLevel", "linkedin"
    ];

    for (const field of requiredFields) {
      if (!formData[field] || formData[field].toString().trim() === "") {
        alert(`Please fill the required field: ${field}`);
        return false;
      }
    }

    if (!formData.email) {
      alert("Email is missing.");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      alert("Email format is invalid.");
      return false;
    }

    if (!lettersOnly.test(formData.firstName)) {
      alert("First Name should contain letters only.");
      return false;
    }
    if (!lettersOnly.test(formData.lastName)) {
      alert("Last Name should contain letters only.");
      return false;
    }
    if (!lettersOnly.test(formData.city)) {
      alert("City should contain letters only.");
      return false;
    }
    if (!lettersOnly.test(formData.country)) {
      alert("Country should contain letters only.");
      return false;
    }

    if (!mobilePattern.test(formData.mobile)) {
      alert("Mobile number is invalid. It should be 7 to 15 digits, optional leading '+'.");
      return false;
    }

    if (!urlPattern.test(formData.linkedin)) {
      alert("Please enter a valid LinkedIn URL.");
      return false;
    }
    if (formData.github && formData.github.trim() !== "" && !urlPattern.test(formData.github)) {
      alert("Please enter a valid GitHub URL.");
      return false;
    }

    if (resumeFile instanceof File) {
      const ext = getFileExtension(resumeFile.name);
      if (!allowedDocExt.includes(ext)) {
        alert("Resume must be a PDF or DOC/DOCX file.");
        return false;
      }
    } else if (formData.resumeFile) {
      const ext = getFileExtension(formData.resumeFile);
      if (!allowedDocExt.includes(ext)) {
        alert("Existing resume file type is invalid. Please upload a valid PDF or DOC/DOCX.");
        return false;
      }
    } else {
      alert("Please upload your resume.");
      return false;
    }

    if (coverLetterFile instanceof File) {
      const ext = getFileExtension(coverLetterFile.name);
      if (!allowedDocExt.includes(ext)) {
        alert("Cover Letter must be a PDF or DOC/DOCX file.");
        return false;
      }
    } else if (formData.coverLetterFile) {
      const ext = getFileExtension(formData.coverLetterFile);
      if (ext && !allowedDocExt.includes(ext)) {
        alert("Existing cover letter file type is invalid. Please upload a valid PDF or DOC/DOCX.");
        return false;
      }
    }

    if (profilePhoto instanceof File) {
      const ext = getFileExtension(profilePhoto.name);
      if (!allowedProfilePhotoExt.includes(ext)) {
        alert("Profile Photo must be jpeg, jpg, or png.");
        return false;
      }
    } else if (formData.profilePhoto) {
      const ext = getFileExtension(formData.profilePhoto);
      if (ext && !allowedProfilePhotoExt.includes(ext)) {
        alert("Existing profile photo file type is invalid. Please upload jpeg, jpg, or png.");
        return false;
      }
    } else {
      alert("Please upload a profile photo.");
      return false;
    }

    if (introVideo instanceof File) {
      const ext = getFileExtension(introVideo.name);
      if (!allowedVideoExt.includes(ext)) {
        alert("Self Introduction Video must be a valid video format (mp4, mov, avi, wmv, flv, mkv, webm).");
        return false;
      }
    } else if (formData.selfIntroVideo) {
      const ext = getFileExtension(formData.selfIntroVideo);
      if (ext && !allowedVideoExt.includes(ext)) {
        alert("Existing self introduction video file type is invalid.");
        return false;
      }
    }

    if (formData.educationLevel === "Other" && (!formData.customEducation || formData.customEducation.trim() === "")) {
      alert("Please enter custom education details.");
      return false;
    }

    if (formData.customSkills === "Other" && (!formData.customSkills || formData.customSkills.trim() === "")) {
      alert("Please enter a custom skill.");
      return false;
    }

    if (formData.customJobs === "Other" && (!formData.customJobs || formData.customJobs.trim() === "")) {
      alert("Please enter a custom job.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateFields()) return;

    try {
      let resume = formData.resumeFile;
      let photo = formData.profilePhoto;
      let video = formData.selfIntroVideo;
      let coverLetter = formData.coverLetterFile || "";

      if (resumeFile instanceof File) resume = await uploadFile(resumeFile);
      if (profilePhoto instanceof File) photo = await uploadFile(profilePhoto);
      if (introVideo instanceof File) video = await uploadFile(introVideo);
      if (coverLetterFile instanceof File) coverLetter = await uploadFile(coverLetterFile);

      const variables = {
        input: {
          ...formData,
          resumeFile: typeof resume === "string" ? resume : "",
          profilePhoto: typeof photo === "string" ? photo : "",
          selfIntroVideo: typeof video === "string" ? video : "",
          coverLetterFile: typeof coverLetter === "string" ? coverLetter : ""
        }
      };

      await saveUserProfile({ variables });
      alert("Profile saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Error saving profile: " + err.message);
    }
  };

  const skillsOptions = skillsMap[formData.educationLevel] || [];
  const jobOptions = jobMap[formData.educationLevel] || [];

  return (
    <div className="bg-light min-vh-100">
      <Navbar expand="lg" className="top-navbar px-3 shadow-sm" bg="light" variant="light" sticky="top">
        <Container fluid>
          <Navbar.Brand>
            <Image src="/images/logo.png" alt="Logo" className="nav-logo" />
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="admin-navbar-nav" />
          <Navbar.Collapse id="admin-navbar-nav">
            <Nav className="ms-auto nav-links fw-semibold">
              <NavLink to="/user/home" className="nav-link active">Find Job</NavLink>
              <NavLink to="/user/my-jobs" className="nav-link">My Jobs</NavLink>
              <NavLink to="/user/profile" className="nav-link">Profile</NavLink>
              <NavLink to="/" className="nav-link">Logout</NavLink>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container className="py-5" style={{ maxWidth: "1100px" }}>
        <h3 className="dashboard-title text-center fw-bold mb-4 text-primary">User Profile</h3>
        <Card className="p-4 shadow-lg border-0 bg-white rounded">
          <Form onSubmit={handleSubmit} noValidate>

            {/* Personal Details */}
            <h5 className="mb-3 text-secondary border-bottom pb-1">Personal Details</h5>
            <Row className="mb-3">
              <Col md={4}>
                <Form.Group controlId="firstName">
                  <Form.Label className="fw-semibold">First Name *</Form.Label>
                  <Form.Control
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Enter your first name"
                    autoComplete="given-name"
                    onKeyDown={lettersOnlyKeyDown}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="lastName">
                  <Form.Label className="fw-semibold">Last Name *</Form.Label>
                  <Form.Control
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Enter your last name"
                    autoComplete="family-name"
                    onKeyDown={lettersOnlyKeyDown}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="email">
                  <Form.Label className="fw-semibold">Email *</Form.Label>
                  <Form.Control
                    name="email"
                    value={formData.email}
                    readOnly
                    plaintext
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={4}>
                <Form.Group controlId="gender">
                  <Form.Label className="fw-semibold">Gender *</Form.Label>
                  <Form.Select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                  >
                    <option value="">Select Gender</option>
                    {genderOptions.map((g, i) => (
                      <option key={i} value={g}>{g}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="mobile">
  <Form.Label className="fw-semibold">Mobile *</Form.Label>
  <Form.Control
    name="mobile"
    value={formData.mobile}
    onChange={handleChange}
    placeholder="Enter your mobile number"
    type="tel"
    inputMode="numeric"
    pattern="\d{7,15}"
    title="Enter a valid phone number (only digits allowed)"
    onKeyDown={(e) => {
      const allowedKeys = [
        "Backspace", "Tab", "ArrowLeft", "ArrowRight", "Delete", "Home", "End"
      ];
      if (
        !allowedKeys.includes(e.key) &&
        !/^[0-9]$/.test(e.key)
      ) {
        e.preventDefault();
      }
    }}
  />
</Form.Group>


              </Col>
              <Col md={4}>
                <Form.Group controlId="city">
                  <Form.Label className="fw-semibold">City *</Form.Label>
                  <Form.Control
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Enter your city"
                    onKeyDown={lettersOnlyKeyDown}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={4}>
                <Form.Group controlId="country">
                  <Form.Label className="fw-semibold">Country *</Form.Label>
                  <Form.Control
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    placeholder="Enter your country"
                    onKeyDown={lettersOnlyKeyDown}
                  />
                </Form.Group>
              </Col>
              <h5 className="mb-3 text-secondary border-bottom pb-1">Education & Experience</h5>
            <Row className="mb-3"></Row>
              <Col md={4}>
                <Form.Group controlId="experienceLevel">
                  <Form.Label className="fw-semibold">Experience Level *</Form.Label>
                  <Form.Select
                    name="experienceLevel"
                    value={formData.experienceLevel}
                    onChange={handleChange}
                  >
                    <option value="">Select Experience</option>
                    {experienceOptions.map((e, i) => (
                      <option key={i} value={e}>{e}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="educationLevel">
                  <Form.Label className="fw-semibold">Education Level *</Form.Label>
                  <Form.Select
                    name="educationLevel"
                    value={formData.educationLevel}
                    onChange={handleEducationChange}
                  >
                    <option value="">Select Education Level</option>
                    {educationOptions.map((e, i) => <option key={i} value={e}>{e}</option>)}
                  </Form.Select>
                  {formData.educationLevel === "Other" && (
                    <Form.Control
                      className="mt-2"
                      name="customEducation"
                      placeholder="Enter custom education"
                      value={formData.customEducation}
                      onChange={handleChange}
                    />
                  )}
                </Form.Group>
              </Col>
            </Row>

            {formData.educationLevel && (
              <>
                <Form.Group controlId="customSkills" className="mb-3">
                  <Form.Label className="fw-semibold">Relevant Skills *</Form.Label>
                  <Form.Select
                    name="customSkills"
                    value={formData.customSkills}
                    onChange={handleChange}
                  >
                    <option value="">Select Skill</option>
                    {skillsOptions.map((s, i) => <option key={i} value={s}>{s}</option>)}
                    <option value="Other">Other</option>
                  </Form.Select>
                  {formData.customSkills === "Other" && (
                    <Form.Control
                      className="mt-2"
                      name="customSkills"
                      placeholder="Enter custom skill"
                      value={formData.customSkills}
                      onChange={handleChange}
                    />
                  )}
                </Form.Group>

                <Form.Group controlId="customJobs" className="mb-3">
                  <Form.Label className="fw-semibold">Preffered Jobs *</Form.Label>
                  <Form.Select
                    name="customJobs"
                    value={formData.customJobs}
                    onChange={handleChange}
                  >
                    <option value="">Select Job</option>
                    {jobOptions.map((j, i) => <option key={i} value={j}>{j}</option>)}
                    <option value="Other">Other</option>
                  </Form.Select>
                  {formData.customJobs === "Other" && (
                    <Form.Control
                      className="mt-2"
                      name="customJobs"
                      placeholder="Enter custom job"
                      value={formData.customJobs}
                      onChange={handleChange}
                    />
                  )}
                </Form.Group>
              </>
            )}

            {/* Social Links */}
            <h5 className="mb-3 text-secondary border-bottom pb-1 mt-4">Social Links</h5>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="linkedin">
                  <Form.Label className="fw-semibold">LinkedIn *</Form.Label>
                  <Form.Control
                    name="linkedin"
                    value={formData.linkedin}
                    onChange={handleChange}
                    placeholder="Enter LinkedIn URL"
                    type="url"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="github">
                  <Form.Label className="fw-semibold">GitHub</Form.Label>
                  <Form.Control
                    name="github"
                    value={formData.github}
                    onChange={handleChange}
                    placeholder="Enter GitHub URL (optional)"
                    type="url"
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Uploads */}
            <h5 className="mb-3 text-secondary border-bottom pb-1 mt-4">Uploads</h5>
            <Form.Group controlId="resumeFile" className="mb-3">
              <Form.Label className="fw-semibold">Upload Resume (PDF, DOC, DOCX) *</Form.Label>
              <Form.Control
                type="file"
                name="resumeFile"
                accept=".pdf,.doc,.docx"
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group controlId="coverLetterFile" className="mb-3">
              <Form.Label className="fw-semibold">Upload Cover Letter (PDF, DOC, DOCX)</Form.Label>
              <Form.Control
                type="file"
                name="coverLetterFile"
                accept=".pdf,.doc,.docx"
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group controlId="profilePhoto" className="mb-3">
              <Form.Label className="fw-semibold">Upload Profile Photo (jpeg, jpg, png) *</Form.Label>
              <Form.Control
                type="file"
                name="profilePhoto"
                accept="image/jpeg,image/jpg,image/png"
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group controlId="selfIntroVideo" className="mb-3">
              <Form.Label className="fw-semibold">Upload Self Introduction Video (Optional)</Form.Label>
              <Form.Control
                type="file"
                name="selfIntroVideo"
                accept="video/mp4,video/avi,video/mov,video/wmv,video/flv,video/mkv,video/webm"
                onChange={handleChange}
              />
            </Form.Group>

            <div className="text-center mt-4">
              <Button className="main-btn px-5" type="submit" variant="success" size="lg">
                Save Profile
              </Button>
            </div>
          </Form>
        </Card>
      </Container>

      <Footer />
    </div>
  );
}
