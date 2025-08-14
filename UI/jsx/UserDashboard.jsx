import React, { useState, useEffect } from "react";
import Footer from "./Footer.jsx";

import {
  Container,
  Row,
  Col,
  Card,
  Navbar,
  Nav,
  Image,
  Button,
  Spinner,
  Collapse,
  Toast,
  ToastContainer,
  Form,
  Modal,
} from "react-bootstrap";
import { NavLink } from "react-router-dom";
import { gql, useQuery, useMutation, useApolloClient } from "@apollo/client";
import { ChevronDown, ChevronUp } from "react-feather";
import "/public/style.css";
import "bootstrap/dist/css/bootstrap.min.css";

const GET_ALL_JOBS = gql`
  query {
    getAllJobs {
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
      deadline
    }
  }
`;

const SAVE_JOB = gql`
  mutation SaveJob($userEmail: String!, $jobId: ID!) {
    saveJob(userEmail: $userEmail, jobId: $jobId) {
      success
      message
    }
  }
`;

const GET_USER_PROFILE = gql`
  query GetUserProfile($email: String!) {
    getUserProfile(email: $email) {
      resumeFile
      coverLetterFile
    }
  }
`;

const APPLY_FOR_JOB = gql`
  mutation ApplyForJob($input: ApplyJobInput!) {
    applyForJob(input: $input) {
      _id
      userEmail
      appliedAt
    }
  }
`;

const GET_APPLIED_JOBS = gql`
  query GetAppliedJobsByUser($userEmail: String!) {
    getAppliedJobsByUser(userEmail: $userEmail) {
      _id
    }
  }
`;

const UserDashboard = () => {
  const userEmail = localStorage.getItem("userEmail") || "user@example.com";

  // Fetch all jobs
  const { loading, error, data } = useQuery(GET_ALL_JOBS);

  // Fetch user profile to get existing resume and cover letter paths
  const {
    data: profileData,
    loading: profileLoading,
    error: profileError,
  } = useQuery(GET_USER_PROFILE, {
    variables: { email: userEmail },
    skip: !userEmail,
  });

  const [applyForJob] = useMutation(APPLY_FOR_JOB);
  const [saveJob] = useMutation(SAVE_JOB);

  const client = useApolloClient();

  const [expandedJobId, setExpandedJobId] = useState(null);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    variant: "success",
  });
  const [selectedType, setSelectedType] = useState("All");

  const [showModal, setShowModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  // Existing files
  const [useExistingResume, setUseExistingResume] = useState(false);
  const [useExistingCoverLetter, setUseExistingCoverLetter] = useState(false);
  const [existingResumePath, setExistingResumePath] = useState("");
  const [existingCoverLetterPath, setExistingCoverLetterPath] = useState("");

  const [resumeFile, setResumeFile] = useState(null);
  const [coverLetterFile, setCoverLetterFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [locationSearchTerm, setLocationSearchTerm] = useState("");

  useEffect(() => {
    if (profileData?.getUserProfile) {
      setExistingResumePath(profileData.getUserProfile.resumeFile || "");
      setExistingCoverLetterPath(profileData.getUserProfile.coverLetterFile || "");
      setUseExistingResume(!!profileData.getUserProfile.resumeFile);
      setUseExistingCoverLetter(!!profileData.getUserProfile.coverLetterFile);
    }
  }, [profileData, showModal]);

  const toggleJobDetails = (id) => {
    setExpandedJobId((prev) => (prev === id ? null : id));
  };

  const openApplyModal = (job) => {
    setSelectedJob(job);
    setResumeFile(null);
    setCoverLetterFile(null);
    setShowModal(true);
  };

  const handleSubmitApplication = async () => {
    if ((!useExistingResume && !resumeFile) || !selectedJob) {
      setToast({
        show: true,
        message: "Please provide a resume.",
        variant: "warning",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      let resumePath = existingResumePath;
      let coverLetterPath = existingCoverLetterPath;

      // Upload new files only if user chooses to upload new ones
      if (!useExistingResume && resumeFile) {
        const formData = new FormData();
        formData.append("resume", resumeFile);
        if (!useExistingCoverLetter && coverLetterFile) {
          formData.append("coverLetter", coverLetterFile);
        }

        const uploadResponse = await fetch(
          "http://localhost:5000/upload/user-dashboard",
          {
            method: "POST",
            body: formData,
          }
        );

        if (!uploadResponse.ok) throw new Error("File upload failed");
        const uploadData = await uploadResponse.json();

        resumePath = uploadData.resume || "";
        if (!useExistingCoverLetter) {
          coverLetterPath = uploadData.coverLetter || "";
        }
      }

      await applyForJob({
        variables: {
          input: {
            userEmail,
            jobId: selectedJob._id,
            resume: resumePath,
            coverLetter: coverLetterPath || "",
          },
        },
        refetchQueries: ["GetAppliedJobsByUser"],
      });

      setToast({
        show: true,
        message: ` Applied for ${selectedJob.title}`,
        variant: "success",
      });
    } catch (err) {
      const msg = err.message || "Something went wrong";
      if (msg.includes("User profile not found")) {
        setToast({
          show: true,
          message: " Please complete your profile before applying.",
          variant: "warning",
        });
      } else {
        setToast({
          show: true,
          message: ` Failed to apply: ${msg}`,
          variant: "danger",
        });
      }
    } finally {
      setIsSubmitting(false);
      setShowModal(false);
    }
  };

  const handleSave = async (jobId, title) => {
    try {
      await saveJob({
        variables: { userEmail, jobId },
      });
      setToast({
        show: true,
        message: `Saved ${title} to your list`,
        variant: "info",
      });
    } catch (error) {
      setToast({
        show: true,
        message: `Failed to save ${title}: ${error.message}`,
        variant: "danger",
      });
    }
  };

  const filteredJobs =
    data?.getAllJobs.filter((job) => {
      const matchesType = selectedType === "All" || job.type === selectedType;
      const matchesTitle = job.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesLocation = job.location
        .toLowerCase()
        .includes(locationSearchTerm.toLowerCase());
      return matchesType && matchesTitle && matchesLocation;
    }) || [];

  return (
    <div className="user-dashboard-wrapper d-flex flex-column min-vh-100">
      <div className="flex-grow-1">
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
                <NavLink to="/user/home" className="nav-link active">
                  Find Job
                </NavLink>
                <NavLink to="/user/my-jobs" className="nav-link">
                  My Jobs
                </NavLink>
                <NavLink to="/user/profile" className="nav-link">
                  Profile
                </NavLink>
                <NavLink to="/" className="nav-link">
                  Logout
                </NavLink>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>

        <Container fluid className="py-1 px-4">
          <Row className="flex-column flex-lg-row">
            {/* Filter panel */}
            <Col lg={3} className="mb-4">
              <div className="filter-panel sticky-filter p-4 bg-white rounded shadow-sm">
                <Form.Group className="mt-4">
                  <Form.Label>Search Jobs by Title</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter job title..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoComplete="off"
                  />

                  <Form.Group className="mt-4">
                    <Form.Label>Search Jobs by Location</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter location..."
                      value={locationSearchTerm}
                      onChange={(e) => setLocationSearchTerm(e.target.value)}
                      autoComplete="off"
                    />
                  </Form.Group>
                  <br />
                </Form.Group>
                <br />
                <h5 className="mb-3 text-dark fw-semibold">Filter by Job Type</h5>
                {["All", "Full-Time", "Part-Time", "Internship", "Contract"].map(
                  (type) => (
                    <Form.Check
                      key={type}
                      type="radio"
                      label={type}
                      value={type}
                      checked={selectedType === type}
                      onChange={() => setSelectedType(type)}
                      className="mb-2"
                    />
                  )
                )}
              </div>
            </Col>

            {/* Jobs list */}
            <Col lg={9}>
              <h2 className="dashboard-title text-center fw-bold mb-4">
                Explore Jobs
              </h2>

              {loading ? (
                <div className="text-center">
                  <Spinner animation="border" />
                </div>
              ) : error ? (
                <p className="text-danger text-center">
                  Error loading jobs: {error.message}
                </p>
              ) : filteredJobs.length === 0 ? (
                <p className="text-center">No matching jobs found.</p>
              ) : (
                // ✅ one column until lg, two columns at lg+
                <Row className="g-4 job-list">
                  {filteredJobs.map((job) => {
                    const isOpen = expandedJobId === job._id;
                    const deadlinePassed =
                      job.deadline && new Date(job.deadline) < new Date();

                    return (
                      <Col xs={12} lg={6} key={job._id}>
                        <Card
                          className={`job-card shadow-sm border-0 h-100 ${
                            isOpen ? "border-success bg-light" : ""
                          }`}
                        >
                          <Card.Body>
                            <div
                              role="button"
                              onClick={() => toggleJobDetails(job._id)}
                              className="d-flex justify-content-between align-items-center fw-bold mb-2 job-title"
                            >
                              {job.title}
                              {isOpen ? (
                                <ChevronUp size={20} />
                              ) : (
                                <ChevronDown size={20} />
                              )}
                            </div>

                            <Card.Text>
                              <span className="label-text">Company:</span>{" "}
                              {job.companyName}
                            </Card.Text>
                            <Card.Text>
                              <span className="label-text">Type:</span>{" "}
                              {job.type}
                            </Card.Text>
                            <Card.Text>
                              <span className="label-text">Location:</span>{" "}
                              {job.location}
                            </Card.Text>
                            <Card.Text>
                              <span className="label-text">Salary:</span>{" "}
                              {job.salary}
                            </Card.Text>
                            {job.deadline && (
                              <Card.Text>
                                <span className="label-text">Deadline:</span>{" "}
                                {new Date(job.deadline).toLocaleDateString()}
                              </Card.Text>
                            )}

                            <Collapse in={isOpen}>
                              <div>
                                <hr />
                                <p>
                                  <span className="label-text">Description:</span>{" "}
                                  {job.description}
                                </p>
                                <p>
                                  <span className="label-text">About the Job:</span>{" "}
                                  {job.aboutJob}
                                </p>
                                <p>
                                  <span className="label-text">About You:</span>{" "}
                                  {job.aboutYou}
                                </p>
                                <p>
                                  <span className="label-text">
                                    What We Look For:
                                  </span>{" "}
                                  {job.whatWeLookFor}
                                </p>
                                <p>
                                  <span className="label-text">Must-Have:</span>
                                </p>
                                <ul>
                                  {job.mustHave?.map((item, index) => (
                                    <li key={index}>{item}</li>
                                  ))}
                                </ul>
                                <p>
                                  <span className="label-text">Benefits:</span>{" "}
                                  {job.benefits}
                                </p>
                              </div>
                            </Collapse>

                            <div className="d-flex justify-content-end mt-3 flex-wrap gap-2">
                              {deadlinePassed ? (
                                <span className="text-danger fw-semibold">
                                  No longer Accepting Applications
                                </span>
                              ) : (
                                <>
                                  <Button
                                    className="main-btn apply-text m-0"
                                    size="sm"
                                    onClick={() => openApplyModal(job)}
                                    variant="primary"
                                  >
                                    Apply
                                  </Button>
                                  <Button
                                    className="main-btn m-0"
                                    size="sm"
                                    onClick={() =>
                                      handleSave(job._id, job.title)
                                    }
                                  >
                                    Save
                                  </Button>
                                </>
                              )}
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    );
                  })}
                </Row>
              )}
            </Col>
          </Row>
        </Container>

        <ToastContainer position="bottom-end" className="p-3">
          <Toast
            onClose={() => setToast({ ...toast, show: false })}
            show={toast.show}
            bg={toast.variant}
            delay={3000}
            autohide
          >
            <Toast.Body className="text-white">{toast.message}</Toast.Body>
          </Toast>
        </ToastContainer>

        <Modal show={showModal} onHide={() => setShowModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Upload Resume to Apply</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {profileLoading ? (
              <div className="text-center">
                <Spinner animation="border" />
              </div>
            ) : profileError ? (
              <p className="text-danger text-center">
                Error loading profile data.
              </p>
            ) : (
              <>
                {/* Use existing resume checkbox */}
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label={
                      existingResumePath
                        ? `Use existing resume (${existingResumePath
                            .split("/")
                            .pop()})`
                        : "No existing resume found"
                    }
                    checked={useExistingResume}
                    disabled={!existingResumePath}
                    onChange={() => setUseExistingResume(!useExistingResume)}
                  />
                </Form.Group>

                {/* Upload new resume if not using existing */}
                {!useExistingResume && (
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Upload New Resume <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => setResumeFile(e.target.files[0])}
                    />
                  </Form.Group>
                )}

                {/* Use existing cover letter checkbox */}
                <Form.Group className="mb-3 mt-4">
                  <Form.Check
                    type="checkbox"
                    label={
                      existingCoverLetterPath
                        ? `Use existing cover letter (${existingCoverLetterPath
                            .split("/")
                            .pop()})`
                        : "No existing cover letter found"
                    }
                    checked={useExistingCoverLetter}
                    disabled={!existingCoverLetterPath}
                    onChange={() =>
                      setUseExistingCoverLetter(!useExistingCoverLetter)
                    }
                  />
                </Form.Group>

                {/* Upload new cover letter if not using existing */}
                {!useExistingCoverLetter && (
                  <Form.Group className="mb-3">
                    <Form.Label>Upload New Cover Letter (Optional)</Form.Label>
                    <Form.Control
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => setCoverLetterFile(e.target.files[0])}
                    />
                  </Form.Group>
                )}
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              disabled={(!useExistingResume && !resumeFile) || isSubmitting}
              onClick={handleSubmitApplication}
            >
              {isSubmitting ? (
                <Spinner size="sm" animation="border" />
              ) : (
                "Submit Application"
              )}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>

      <Footer />
    </div>
  );
};

export default UserDashboard;
