// src/components/MyJobs.jsx
import React, { useState, useEffect } from "react";
import Footer from "./Footer.jsx";
import {
  Container,
  Modal,
  Form,
  Row,
  Col,
  Card,
  Navbar,
  Nav,
  Image,
  Spinner,
  Button,
  Toast,
  ToastContainer,
} from "react-bootstrap";
import { NavLink } from "react-router-dom";
import { gql, useQuery, useMutation } from "@apollo/client";
import { ChevronDown, ChevronUp } from "react-feather";
import { BREAK } from "graphql";

// --- GraphQL Queries & Mutations ---
const GET_APPLIED_JOBS = gql`
  query GetAppliedJobsByUser($userEmail: String!) {
    getAppliedJobsByUser(userEmail: $userEmail) {
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
      application { status }
    }
  }
`;

const GET_SAVED_JOBS = gql`
  query GetSavedJobsByUser($userEmail: String!) {
    getSavedJobsByUser(userEmail: $userEmail) {
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

const SAVE_JOB = gql`
  mutation SaveJob($userEmail: String!, $jobId: ID!) {
    saveJob(userEmail: $userEmail, jobId: $jobId) {
      success
      message
    }
  }
`;

const DELETE_SAVED_JOB = gql`
  mutation DeleteSavedJob($userEmail: String!, $jobId: ID!) {
    deleteSavedJob(userEmail: $userEmail, jobId: $jobId)
  }
`;

export default function MyJobs() {
  const userEmail = localStorage.getItem("userEmail") || "user@example.com";

  const { loading: loadingApplied, error: errorApplied, data: dataApplied } =
    useQuery(GET_APPLIED_JOBS, { variables: { userEmail }, fetchPolicy: "network-only" });

  const {
    loading: loadingSaved,
    error: errorSaved,
    data: dataSaved,
    refetch: refetchSaved,
  } = useQuery(GET_SAVED_JOBS, { variables: { userEmail }, fetchPolicy: "network-only" });

  const { data: profileData } = useQuery(GET_USER_PROFILE, {
    variables: { email: userEmail },
    skip: !userEmail,
  });

  const [activeTab, setActiveTab] = useState("applied"); // 'applied' | 'saved'
  const [expandedJobId, setExpandedJobId] = useState(null);
  const [saveJob] = useMutation(SAVE_JOB);
  const [applyForJob] = useMutation(APPLY_FOR_JOB);
  const [deleteSavedJob] = useMutation(DELETE_SAVED_JOB);

  const [showModal, setShowModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [coverLetterFile, setCoverLetterFile] = useState(null);
  const [useExistingResume, setUseExistingResume] = useState(false);
  const [useExistingCoverLetter, setUseExistingCoverLetter] = useState(false);
  const [existingResumePath, setExistingResumePath] = useState("");
  const [existingCoverLetterPath, setExistingCoverLetterPath] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", variant: "info" });

  useEffect(() => {
    if (profileData?.getUserProfile) {
      const { resumeFile, coverLetterFile } = profileData.getUserProfile;
      setExistingResumePath(resumeFile || "");
      setExistingCoverLetterPath(coverLetterFile || "");
      setUseExistingResume(!!resumeFile);
      setUseExistingCoverLetter(!!coverLetterFile);
    }
  }, [profileData]);

  const toggleJobDetails = (id) => {
    setExpandedJobId((prev) => (prev === id ? null : id));
  };

  const handleDeleteSavedJob = async (jobId) => {
    try {
      await deleteSavedJob({ variables: { userEmail, jobId } });
      setToast({ show: true, message: "Saved job deleted successfully.", variant: "success" });
      refetchSaved();
    } catch (err) {
      setToast({ show: true, message: "Failed to delete saved job. Please try again.", variant: "danger" });
      console.error("Delete saved job error:", err);
    }
  };

  const handleSubmitApplication = async () => {
    if ((!useExistingResume && !resumeFile) || !selectedJob) {
      setToast({ show: true, message: "Please upload a resume.", variant: "warning" });
      return;
    }

    try {
      setIsSubmitting(true);

      let resumePath = existingResumePath;
      let coverLetterPath = existingCoverLetterPath;

      if (!useExistingResume && resumeFile) {
        const formData = new FormData();
        formData.append("resume", resumeFile);
        if (!useExistingCoverLetter && coverLetterFile) formData.append("coverLetter", coverLetterFile);

        const uploadResponse = await fetch("http://localhost:5000/upload/user-dashboard", {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok) throw new Error("File upload failed");

        const uploadData = await uploadResponse.json();
        resumePath = uploadData.resume || "";
        if (!useExistingCoverLetter) coverLetterPath = uploadData.coverLetter || "";
      }

      await applyForJob({
        variables: {
          input: { userEmail, jobId: selectedJob._id, resume: resumePath, coverLetter: coverLetterPath || "" },
        },
        refetchQueries: ["GetAppliedJobsByUser"],
      });

      setToast({ show: true, message: `Applied to ${selectedJob.title}`, variant: "success" });
    } catch (err) {
      setToast({ show: true, message: `Failed to apply: ${err.message}`, variant: "danger" });
    } finally {
      setIsSubmitting(false);
      setShowModal(false);
      refetchSaved();
    }
  };

  const renderJobCard = (job, isApplied = false) => {
    const isOpen = expandedJobId === job._id;
    const status = isApplied ? job.application?.status || "Pending" : null;
    const deadlinePassed = job.deadline ? new Date(job.deadline) < new Date() : false;

    return (
      <Card className={`shadow-sm border-0 p-3 h-100 ${isOpen ? "bg-light border-success" : "bg-white"}`}>
        <Card.Body>
          <div
            role="button"
            onClick={() => toggleJobDetails(job._id)}
            className="d-flex justify-content-between align-items-center fw-bold mb-2 job-title"
          >
            {job.title}
            {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>

          <Card.Text><span className="label-text">Company:</span> {job.companyName}</Card.Text>
          <Card.Text><span className="label-text">Type:</span> {job.type}</Card.Text>
          <Card.Text><span className="label-text">Location:</span> {job.location}</Card.Text>
          <Card.Text><span className="label-text">Salary:</span> {job.salary}</Card.Text>
          <Card.Text>
            <span className="label-text">Deadline:</span>{" "}
            {job.deadline ? new Date(job.deadline).toLocaleDateString() : "N/A"}
          </Card.Text>

          {isApplied ? (
            <Card.Text
              className={`fw-bold ${
                status.toLowerCase() === "approved"
                  ? "text-success"
                  : status.toLowerCase() === "rejected"
                  ? "text-danger"
                  : "text-warning"
              }`}
            >
              Status: {status.charAt(0).toUpperCase() + status.slice(1)}
            </Card.Text>
          ) : (
            <>
              {deadlinePassed ? (
                <div className="d-flex justify-content-between align-items-center mt-2">
                  <Card.Text className="text-danger fw-bold mb-0">No Longer Accepting Applications</Card.Text>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSavedJob(job._id);
                    }}
                  >
                    Delete
                  </Button>
                </div>
              ) : (
                <div className="d-flex justify-content-between mt-2">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => {
                      setSelectedJob(job);
                      setShowModal(true);
                    }}
                  >
                    Apply
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSavedJob(job._id);
                    }}
                  >
                    Delete
                  </Button>
                </div>
              )}
            </>
          )}

          {isOpen && (
            <>
              <hr />
              <p><span className="label-text">Description:</span> {job.description}</p>
              <p><span className="label-text">About the Job:</span> {job.aboutJob}</p>
              <p><span className="label-text">About You:</span> {job.aboutYou}</p>
              <p><span className="label-text">What We Look For:</span> {job.whatWeLookFor}</p>
              <p><span className="label-text">Must-Have:</span></p>
              <ul>{job.mustHave?.map((item, idx) => <li key={idx}>{item}</li>)}</ul>
              <p><span className="label-text">Benefits:</span> {job.benefits}</p>
            </>
          )}
        </Card.Body>
      </Card>
    );
  };

  return (
    // 👇 Flex column wrapper ensures sticky footer
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
              <NavLink to="/user/home" className="nav-link active">Find Job</NavLink>
              <NavLink to="/user/my-jobs" className="nav-link">My Jobs</NavLink>
              <NavLink to="/user/profile" className="nav-link">Profile</NavLink>
              <NavLink to="/" className="nav-link">Logout</NavLink>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Main content grows to take remaining height */}
      <Container fluid="xl" className="py-5 flex-grow-1">
        {/* Toggle Buttons */}
        <div className="d-flex justify-content-center mb-4">
  <Button
    className="main-btn px-5 me-2" // ← Add margin-end to create gap
    variant={activeTab === "applied" ? "primary" : "outline-primary"}
    onClick={() => setActiveTab("applied")}
  >
    Applied Jobs
  </Button>

  <Button
    className="main-btn px-5"
    variant={activeTab === "saved" ? "primary" : "outline-primary"}
    onClick={() => setActiveTab("saved")}
  >
    Saved Jobs
  </Button>
</div>


        {/* Applied Jobs */}
        {activeTab === "applied" && (
          <>
            <h2 className="dashboard-title text-center fw-bold mb-4">My Applied Jobs</h2>
            {loadingApplied ? (
              <div className="text-center"><Spinner animation="border" /></div>
            ) : errorApplied ? (
              <p className="text-danger text-center">
                Error loading applied jobs: {errorApplied.message}
              </p>
            ) : dataApplied.getAppliedJobsByUser.length === 0 ? (
              <p className="text-center">You have not applied for any jobs yet.</p>
            ) : (
              <Row>
                {dataApplied.getAppliedJobsByUser.map((job) => (
                  <Col md={6} key={job._id} className="mb-4">
                    {renderJobCard(job, true)}
                  </Col>
                ))}
              </Row>
            )}
          </>
        )}

        {/* Saved Jobs */}
        {activeTab === "saved" && (
          <>
            <h2 className="dashboard-title text-center fw-bold mb-4">Saved Jobs</h2>
            {loadingSaved ? (
              <div className="text-center"><Spinner animation="border" /></div>
            ) : errorSaved ? (
              <p className="text-danger text-center">
                Error loading saved jobs: {errorSaved.message}
              </p>
            ) : dataSaved.getSavedJobsByUser.length === 0 ? (
              <p className="text-center">You have not saved any jobs yet.</p>
            ) : (
              <Row>
                {dataSaved.getSavedJobsByUser.map((job) => (
                  <Col md={6} key={job._id} className="mb-4">
                    {renderJobCard(job, false)}
                  </Col>
                ))}
              </Row>
            )}
          </>
        )}
      </Container>

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>Upload Resume to Apply</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              label={
                existingResumePath
                  ? `Use existing resume (${existingResumePath.split("/").pop()})`
                  : "No existing resume found"
              }
              checked={useExistingResume}
              disabled={!existingResumePath}
              onChange={() => setUseExistingResume(!useExistingResume)}
            />
          </Form.Group>
          {!useExistingResume && (
            <Form.Group className="mb-3">
              <Form.Label>Upload Resume *</Form.Label>
              <Form.Control
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setResumeFile(e.target.files[0])}
              />
            </Form.Group>
          )}
          <Form.Group className="mb-3 mt-4">
            <Form.Check
              type="checkbox"
              label={
                existingCoverLetterPath
                  ? `Use existing cover letter (${existingCoverLetterPath.split("/").pop()})`
                  : "No existing cover letter found"
              }
              checked={useExistingCoverLetter}
              disabled={!existingCoverLetterPath}
              onChange={() => setUseExistingCoverLetter(!useExistingCoverLetter)}
            />
          </Form.Group>
          {!useExistingCoverLetter && (
            <Form.Group className="mb-3">
              <Form.Label>Upload Cover Letter (optional)</Form.Label>
              <Form.Control
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setCoverLetterFile(e.target.files[0])}
              />
            </Form.Group>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button
            variant="primary"
            disabled={(!useExistingResume && !resumeFile) || isSubmitting}
            onClick={handleSubmitApplication}
          >
            {isSubmitting ? <Spinner size="sm" animation="border" /> : "Submit Application"}
          </Button>
        </Modal.Footer>
      </Modal>

      <ToastContainer position="top-end" className="p-3">
        <Toast
          bg={toast.variant}
          show={toast.show}
          onClose={() => setToast({ ...toast, show: false })}
          delay={3000}
          autohide
        >
          <Toast.Body>{toast.message}</Toast.Body>
        </Toast>
      </ToastContainer>

      {/* Footer pinned to bottom on short pages */}
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}
