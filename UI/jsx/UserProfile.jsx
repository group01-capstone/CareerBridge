import React, { useState, useEffect } from "react";
import Footer from "./Footer.jsx";
import {
  Container, Row, Col, Form, Button, Navbar, Nav, Image, Card
} from "react-bootstrap";
import { NavLink, useNavigate } from "react-router-dom";
import { gql, useMutation, useQuery } from "@apollo/client";
import "/public/style.css";
import "bootstrap/dist/css/bootstrap.min.css";

const SERVER_URL =
  (typeof __SERVER_URL__ !== "undefined" && __SERVER_URL__) ||
  "http://localhost:5000";

/* ================= GraphQL ================= */
const SAVE_USER_PROFILE = gql`
  mutation SaveUserProfile($input: UserProfileInput!) {
    saveUserProfile(input: $input) {
      email
    }
  }
`;

const UPDATE_USER_PROFILE = gql`
  mutation UpdateUserProfile($input: UserProfileInput!) {
    updateUserProfile(input: $input) {
      email
    }
  }
`;

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
      __typename
    }
  }
`;

/* ============== Helpers / Lookups ============== */
const omitTypename = (val) => {
  if (Array.isArray(val)) return val.map(omitTypename);
  if (val && typeof val === "object") {
    const { __typename, ...rest } = val;
    for (const k of Object.keys(rest)) rest[k] = omitTypename(rest[k]);
    return rest;
  }
  return val;
};

const lettersOnlyKeyDown = (e) => {
  const allowed = ["Backspace", "Tab", "ArrowLeft", "ArrowRight", "Delete", "Home", "End"];
  const regex = /^[a-zA-Z\s'-]$/;
  if (!allowed.includes(e.key) && !regex.test(e.key)) e.preventDefault();
};


// Helper function to upload to GridFS and return the fileId string
async function uploadToGridFS(file) {
  const formData = new FormData();
  formData.append("file", file);

  console.log("Uploading file:", file);  // Log file details before uploading

  const response = await fetch(`${SERVER_URL}/upload-gridfs`, {
    method: "POST",
    body: formData,
  });

  console.log("Response from server:", response);  // Log response status

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    console.error(`Upload failed: ${response.status} - ${text}`); // Detailed error logging
    throw new Error(`Upload failed (${response.status}) ${text}`);
  }

  const data = await response.json().catch(() => ({}));
  if (!data?.fileId) {
    console.error("Upload failed: missing fileId");  // More detailed error logging
    throw new Error("Upload failed: missing fileId");
  }

  console.log("File uploaded successfully:", data);  // Success log
  return data.fileId; // Return GridFS ObjectId string
}


// Function to generate URL for files stored in GridFS
function getFileURL(val) {
  if (!val) return "";
  const raw = String(val).trim();

  const isHex24 = /^[a-fA-F0-9]{24}$/.test(raw);
  if (isHex24) return `${SERVER_URL}/files/${raw}`;

  if (/^https?:\/\//i.test(raw)) return raw;

  const uploadsMatch = raw.match(/(?:^|\/)uploads\/.+$/i);
  if (uploadsMatch) {
    const rel = uploadsMatch[0].replace(/^\/?/, "");
    return `${SERVER_URL}/${encodeURI(rel)}`;
  }

  const base = raw.replace(/^.*[\\/]/, "");
  return `${SERVER_URL}/uploads/${encodeURIComponent(base)}`;
}

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

/* ================= Component ================= */
export default function UserProfile() {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState(localStorage.getItem("userEmail") || "");
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "",
    gender: "", experienceLevel: "", mobile: "", city: "", country: "",
    educationLevel: "", customEducation: "",
    customSkills: "",           // selected option OR "Other"
    customSkillsOther: "",      // free text when "Other"
    customJobs: "",             // selected option OR "Other"
    customJobsOther: "",        // free text when "Other"
    linkedin: "", github: "",
    resumeFile: "", profilePhoto: "", selfIntroVideo: "", coverLetterFile: ""
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
  const [updateUserProfile] = useMutation(UPDATE_USER_PROFILE);

  const normalizeOtherFields = (profile) => {
    const edu = profile.educationLevel || "";
    const allowedSkills = skillsMap[edu] || [];
    const allowedJobs = jobMap[edu] || [];
    const normalized = { ...profile };

    if (normalized.customSkills && !allowedSkills.includes(normalized.customSkills)) {
      normalized.customSkillsOther = normalized.customSkills;
      normalized.customSkills = "Other";
    }
    if (normalized.customJobs && !allowedJobs.includes(normalized.customJobs)) {
      normalized.customJobsOther = normalized.customJobs;
      normalized.customJobs = "Other";
    }
    return normalized;
  };

  useEffect(() => {
    if (!userEmail) {
      alert("Please login first.");
      navigate("/login");
      return;
    }
    if (data?.getUserProfile) {
      setFormData(normalizeOtherFields(omitTypename(data.getUserProfile)));
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
      customSkillsOther: "",
      customJobs: "",
      customJobsOther: ""
    });
  };

  const validateFields = () => {
    const lettersOnly = /^[A-Za-z\s'-]+$/;
    const mobilePattern = /^\+?\d{7,15}$/;
    const urlPattern = /^(https?:\/\/)?([\w.-]+)+(:\d+)?(\/[\w.-]*)*\/?$/i;
    const allowedProfilePhotoExt = ["jpeg", "jpg", "png"];
    const allowedVideoExt = ["mp4", "mov", "avi", "wmv", "flv", "mkv", "webm"];
    const allowedDocExt = ["pdf", "doc", "docx"];

    const getExt = (filename) => {
      if (!filename) return "";
      const parts = filename.split(".");
      return parts.length > 1 ? parts.pop().toLowerCase() : "";
    };

    const required = [
      "firstName", "lastName", "gender", "mobile",
      "city", "country", "educationLevel",
      "experienceLevel", "linkedin"
    ];

    for (const f of required) {
      if (!formData[f] || formData[f].toString().trim() === "") {
        alert(`Please fill the required field: ${f}`);
        return false;
      }
    }

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      alert("Email is missing or invalid.");
      return false;
    }
    if (!lettersOnly.test(formData.firstName)) return alert("First Name should contain letters only."), false;
    if (!lettersOnly.test(formData.lastName)) return alert("Last Name should contain letters only."), false;
    if (!lettersOnly.test(formData.city)) return alert("City should contain letters only."), false;
    if (!lettersOnly.test(formData.country)) return alert("Country should contain letters only."), false;
    if (!mobilePattern.test(formData.mobile)) return alert("Mobile number is invalid."), false;

    if (!urlPattern.test(formData.linkedin)) return alert("Please enter a valid LinkedIn URL."), false;
    if (formData.github && formData.github.trim() !== "" && !urlPattern.test(formData.github))
      return alert("Please enter a valid GitHub URL."), false;

    if (!formData.customSkills || (formData.customSkills === "Other" && !formData.customSkillsOther.trim())) {
      return alert("Please select a skill or provide a custom skill."), false;
    }
    if (!formData.customJobs || (formData.customJobs === "Other" && !formData.customJobsOther.trim())) {
      return alert("Please select a job or provide a custom job."), false;
    }

    if (resumeFile instanceof File) {
      if (!allowedDocExt.includes(getExt(resumeFile.name))) return alert("Resume must be PDF/DOC/DOCX."), false;
    } else if (formData.resumeFile) {
      // now could be GridFS id; skip ext check if 24-hex
      const isHex24 = /^[a-fA-F0-9]{24}$/.test(formData.resumeFile);
      const ext = getExt(formData.resumeFile);
      if (!isHex24 && ext && !allowedDocExt.includes(ext)) return alert("Existing resume file type invalid."), false;
    } else return alert("Please upload your resume."), false;

    if (coverLetterFile instanceof File) {
      if (!allowedDocExt.includes(getExt(coverLetterFile.name))) return alert("Cover Letter must be PDF/DOC/DOCX."), false;
    } else if (formData.coverLetterFile) {
      const isHex24 = /^[a-fA-F0-9]{24}$/.test(formData.coverLetterFile);
      const ext = formData.coverLetterFile && formData.coverLetterFile.includes(".")
        ? formData.coverLetterFile.split(".").pop().toLowerCase()
        : "";
      if (!isHex24 && ext && !allowedDocExt.includes(ext)) return alert("Existing cover letter file type invalid."), false;
    }

    if (profilePhoto instanceof File) {
      if (!allowedProfilePhotoExt.includes(getExt(profilePhoto.name))) return alert("Profile Photo must be jpeg/jpg/png."), false;
    } else if (formData.profilePhoto) {
      const isHex24 = /^[a-fA-F0-9]{24}$/.test(formData.profilePhoto);
      const ext = formData.profilePhoto && formData.profilePhoto.includes(".")
        ? formData.profilePhoto.split(".").pop().toLowerCase()
        : "";
      if (!isHex24 && ext && !allowedProfilePhotoExt.includes(ext)) return alert("Existing profile photo type invalid."), false;
    } else return alert("Please upload a profile photo."), false;

    if (introVideo instanceof File) {
      if (!allowedVideoExt.includes(getExt(introVideo.name))) return alert("Self Intro Video format invalid."), false;
    } else if (formData.selfIntroVideo) {
      const isHex24 = /^[a-fA-F0-9]{24}$/.test(formData.selfIntroVideo);
      const ext = formData.selfIntroVideo && formData.selfIntroVideo.includes(".")
        ? formData.selfIntroVideo.split(".").pop().toLowerCase()
        : "";
      if (!isHex24 && ext && !allowedVideoExt.includes(ext)) return alert("Existing self intro video type invalid."), false;
    }

    if (formData.educationLevel === "Other" && (!formData.customEducation || formData.customEducation.trim() === ""))
      return alert("Please enter custom education details."), false;

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateFields()) return;

    try {
      // Start with whatever is already there (may be GridFS id or old path)
      let resume = formData.resumeFile;
      let photo = formData.profilePhoto;
      let video = formData.selfIntroVideo;
      let coverLetter = formData.coverLetterFile || "";

      // NEW: upload to GridFS if user selected a new file
      if (resumeFile instanceof File) resume = await uploadToGridFS(resumeFile);
      if (profilePhoto instanceof File) photo = await uploadToGridFS(profilePhoto);
      if (introVideo instanceof File) video = await uploadToGridFS(introVideo);
      if (coverLetterFile instanceof File) coverLetter = await uploadToGridFS(coverLetterFile);

      const normalizedCustomSkills =
        formData.customSkills === "Other" ? formData.customSkillsOther.trim() : formData.customSkills;

      const normalizedCustomJobs =
        formData.customJobs === "Other" ? formData.customJobsOther.trim() : formData.customJobs;

      const input = omitTypename({
        ...formData,
        customSkills: normalizedCustomSkills,
        customJobs: normalizedCustomJobs,
        customSkillsOther: undefined,
        customJobsOther: undefined,
        // Store GridFS ids (string)
        resumeFile: typeof resume === "string" ? resume : "",
        profilePhoto: typeof photo === "string" ? photo : "",
        selfIntroVideo: typeof video === "string" ? video : "",
        coverLetterFile: typeof coverLetter === "string" ? coverLetter : ""
      });

      const isUpdating = !!data?.getUserProfile;
      if (isUpdating) {
        await updateUserProfile({ variables: { input } });
        alert("Profile updated successfully!");
      } else {
        await saveUserProfile({ variables: { input } });
        alert("Profile created successfully!");
      }
    } catch (err) {
      console.error("GraphQL error:", err);
      const msg =
        err?.networkError?.result?.errors?.[0]?.message ||
        err?.message ||
        "Unknown error";
      alert("Error saving profile: " + msg);
    }
  };

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
                <h2 className="dashboard-title text-center fw-bold mb-4">User Profile</h2>
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
                    onKeyDown={(e) => {
                      const allowed = ["Backspace", "Tab", "ArrowLeft", "ArrowRight", "Delete", "Home", "End"];
                      if (!allowed.includes(e.key) && !/^[0-9+]$/.test(e.key)) e.preventDefault();
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
                    {(skillsMap[formData.educationLevel] || []).map((s, i) => (
                      <option key={i} value={s}>{s}</option>
                    ))}
                    <option value="Other">Other</option>
                  </Form.Select>

                  {formData.customSkills === "Other" && (
                    <Form.Control
                      className="mt-2"
                      name="customSkillsOther"
                      placeholder="Enter custom skill"
                      value={formData.customSkillsOther}
                      onChange={handleChange}
                    />
                  )}
                </Form.Group>

                <Form.Group controlId="customJobs" className="mb-3">
                  <Form.Label className="fw-semibold">Preferred Jobs *</Form.Label>
                  <Form.Select
                    name="customJobs"
                    value={formData.customJobs}
                    onChange={handleChange}
                  >
                    <option value="">Select Job</option>
                    {(jobMap[formData.educationLevel] || []).map((j, i) => (
                      <option key={i} value={j}>{j}</option>
                    ))}
                    <option value="Other">Other</option>
                  </Form.Select>

                  {formData.customJobs === "Other" && (
                    <Form.Control
                      className="mt-2"
                      name="customJobsOther"
                      placeholder="Enter custom job"
                      value={formData.customJobsOther}
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
              {formData.resumeFile && typeof formData.resumeFile === "string" && (
                <div className="mt-2">
                  <a href={getFileURL(formData.resumeFile)} target="_blank" rel="noreferrer">View Uploaded Resume</a>
                </div>
              )}
            </Form.Group>

            <Form.Group controlId="coverLetterFile" className="mb-3">
              <Form.Label className="fw-semibold">Upload Cover Letter (PDF, DOC, DOCX)</Form.Label>
              <Form.Control
                type="file"
                name="coverLetterFile"
                accept=".pdf,.doc,.docx"
                onChange={handleChange}
              />
              {formData.coverLetterFile && typeof formData.coverLetterFile === "string" && (
                <div className="mt-2">
                  <a href={getFileURL(formData.coverLetterFile)} target="_blank" rel="noreferrer">View Uploaded Cover Letter</a>
                </div>
              )}
            </Form.Group>

            <Form.Group controlId="profilePhoto" className="mb-3">
              <Form.Label className="fw-semibold">Upload Profile Photo (jpeg, jpg, png) *</Form.Label>
              <Form.Control
                type="file"
                name="profilePhoto"
                accept="image/jpeg,image/jpg,image/png"
                onChange={handleChange}
              />
              {formData.profilePhoto && typeof formData.profilePhoto === "string" && (
                <div className="mt-2">
                  <img
                    src={getFileURL(formData.profilePhoto)}
                    alt="Profile"
                    style={{ maxWidth: "150px", borderRadius: "8px", border: "1px solid #ddd" }}
                  />
                </div>
              )}
            </Form.Group>

            <Form.Group controlId="selfIntroVideo" className="mb-3">
              <Form.Label className="fw-semibold">Upload Self Introduction Video (Optional)</Form.Label>
              <Form.Control
                type="file"
                name="selfIntroVideo"
                accept="video/mp4,video/avi,video/mov,video/wmv,video/flv,video/mkv,video/webm"
                onChange={handleChange}
              />
              {formData.selfIntroVideo && typeof formData.selfIntroVideo === "string" && (
                <div className="mt-3">
                  <video
                    src={getFileURL(formData.selfIntroVideo)}
                    controls
                    style={{ maxWidth: "100%", maxHeight: "300px" }}
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              )}
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

        
