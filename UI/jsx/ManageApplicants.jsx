import React, { useState } from "react";
import Footer from "./Footer.jsx";
import { gql, useQuery, useMutation } from "@apollo/client";
import { NavLink } from "react-router-dom";
import {
  Container,
  Table,
  Spinner,
  Alert,
  Accordion,
  Navbar,
  Nav,
  Image,
  Button,
} from "react-bootstrap";

const SERVER_URL = "http://localhost:5000";

/* ========= Helpers ========= */
const buildFileURL = (path) => {
  if (!path) return "";
  const raw = String(path).trim();

  // already absolute
  if (/^https?:\/\//i.test(raw)) return raw;

  // keep only uploads/user_uploads part if present
  const match = raw.match(/(?:^|\/)(uploads|user_uploads)\/.+$/i);
  if (match) {
    const rel = match[0].replace(/^\/?/, "");
    return `${SERVER_URL}/${encodeURI(rel)}`;
  }

  // otherwise assume filename in /uploads
  const base = raw.replace(/^.*[\\/]/, "");
  return `${SERVER_URL}/uploads/${encodeURIComponent(base)}`;
};

/* ========= GraphQL ========= */
const GET_ALL_JOBS = gql`
  query {
    getAllJobs {
      _id
      title
    }
  }
`;

const GET_APPLICANTS = gql`
  query GetApplicants($jobId: ID!) {
    getApplicants(jobId: $jobId) {
      _id
      userEmail
      resumeFile
      coverLetterFile
      userProfile {
        firstName
        lastName
        email
        mobile
        city
        country
        educationLevel
        profilePhoto
        selfIntroVideo
      }
      appliedAt
      status
    }
  }
`;

const UPDATE_APPLICANT_STATUS = gql`
  mutation UpdateApplicantStatus($applicantId: ID!, $status: String!) {
    updateApplicantStatus(applicantId: $applicantId, status: $status) {
      _id
      status
    }
  }
`;

const ManageApplicants = () => {
  const { data: jobsData, loading: jobsLoading, error: jobsError } = useQuery(GET_ALL_JOBS);
  const [selectedJobId, setSelectedJobId] = useState(null);

  const {
    data: applicantsData,
    loading: applicantsLoading,
    error: applicantsError,
    refetch: refetchApplicants,
  } = useQuery(GET_APPLICANTS, {
    variables: { jobId: selectedJobId },
    skip: !selectedJobId,
  });

  const [updateApplicantStatus] = useMutation(UPDATE_APPLICANT_STATUS);
  const [updating, setUpdating] = useState({});

  const handleStatusChange = async (applicantId, status) => {
    try {
      setUpdating((prev) => ({ ...prev, [applicantId]: true }));
      await updateApplicantStatus({ variables: { applicantId, status } });
      await refetchApplicants();
    } catch (error) {
      alert("Failed to update status: " + error.message);
    } finally {
      setUpdating((prev) => ({ ...prev, [applicantId]: false }));
    }
  };

  // Safe date formatting
  const formatAppliedDate = (appliedAt) => {
    if (!appliedAt) return "N/A";
    let dateValue;
    if (typeof appliedAt === "string" || typeof appliedAt === "number") {
      dateValue = appliedAt;
    } else if (typeof appliedAt === "object" && appliedAt.$date) {
      dateValue = appliedAt.$date;
    } else {
      return "Invalid Date";
    }
    const d = new Date(dateValue);
    if (isNaN(d.getTime())) return "Invalid Date";
    return `${d.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}, ${d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
  };

  return (
   <div className="d-flex flex-column min-vh-100 bg-light">
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
              <NavLink to="/admin/manage-applicants" className="nav-link active">Manage Applicants</NavLink>
              <NavLink to="/admin/profile" className="nav-link">Profile</NavLink>
              <NavLink to="/" className="nav-link">Logout</NavLink>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container className="py-4 flex-grow-1">
        <h3 className="dashboard-title text-center fw-bold mb-4">Manage Applicants</h3>

        {jobsLoading && <Spinner animation="border" />}
        {jobsError && <Alert variant="danger">{jobsError.message}</Alert>}

        <Accordion defaultActiveKey="0">
          {jobsData?.getAllJobs.map((job, index) => (
            <Accordion.Item
              eventKey={index.toString()}
              key={job._id}
              onClick={() => setSelectedJobId(job._id)}
            >
              <Accordion.Header>{job.title}</Accordion.Header>
              <Accordion.Body>
                {selectedJobId === job._id && (
                  <>
                    {applicantsLoading ? (
                      <Spinner animation="border" />
                    ) : applicantsError ? (
                      <Alert variant="danger">{applicantsError.message}</Alert>
                    ) : applicantsData?.getApplicants.length === 0 ? (
                      <p>No applicants yet.</p>
                    ) : (
                      <Table striped bordered hover responsive>
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Photo</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Mobile</th>
                            <th>City</th>
                            <th>Country</th>
                            <th>Education</th>
                            <th>Resume</th>
                            <th>Cover Letter</th>
                            <th>Intro Video</th>
                            <th>Applied At</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {applicantsData.getApplicants.map((applicant, i) => {
                            const {
                              userProfile,
                              appliedAt,
                              status = "Pending",
                              _id,
                              resumeFile,
                              coverLetterFile,
                            } = applicant;

                            const isUpdating = updating[_id];
                            const isDecisionMade = status.toLowerCase() !== "pending";

                            const resumeURL = buildFileURL(resumeFile);
                            const coverURL = buildFileURL(coverLetterFile);
                            const photoURL = buildFileURL(userProfile?.profilePhoto);
                            const videoURL = buildFileURL(userProfile?.selfIntroVideo);

                            const fullName = userProfile
                              ? `${userProfile.firstName || ""} ${userProfile.lastName || ""}`.trim() || "N/A"
                              : "N/A";

                            return (
                              <tr key={_id}>
                                <td>{i + 1}</td>

                                {/* Profile Photo */}
                                <td style={{ width: 80, textAlign: "center" }}>
                                  {photoURL ? (
                                    <img
                                      src={photoURL}
                                      alt="Profile"
                                      style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 8 }}
                                    />
                                  ) : (
                                    "N/A"
                                  )}
                                </td>

                                <td>{fullName}</td>
                                <td>{userProfile?.email || "N/A"}</td>
                                <td>{userProfile?.mobile || "N/A"}</td>
                                <td>{userProfile?.city || "N/A"}</td>
                                <td>{userProfile?.country || "N/A"}</td>
                                <td>{userProfile?.educationLevel || "N/A"}</td>

                                <td>
                                  {resumeURL ? (
                                    <a href={resumeURL} target="_blank" rel="noopener noreferrer">
                                      View
                                    </a>
                                  ) : (
                                    "N/A"
                                  )}
                                </td>

                                <td>
                                  {coverURL ? (
                                    <a href={coverURL} target="_blank" rel="noopener noreferrer">
                                      View
                                    </a>
                                  ) : (
                                    "N/A"
                                  )}
                                </td>

                                {/* Intro Video */}
                                <td style={{ minWidth: 180 }}>
                                  {videoURL ? (
                                    <video
                                      src={videoURL}
                                      controls
                                      style={{ width: 160, maxHeight: 120 }}
                                    />
                                  ) : (
                                    "N/A"
                                  )}
                                </td>

                                <td>{formatAppliedDate(appliedAt)}</td>

                                <td
                                  className={`fw-bold ${
                                    status.toLowerCase() === "accepted"
                                      ? "text-success"
                                      : status.toLowerCase() === "rejected"
                                      ? "text-danger"
                                      : "text-warning"
                                  }`}
                                >
                                  {status}
                                </td>

                                <td>
                                  <div className="d-flex gap-2">
                                    <Button
                                      className="action-btn approve-btn btn-sm"
                                      disabled={isDecisionMade || isUpdating}
                                      onClick={() => handleStatusChange(_id, "Accepted")}
                                    >
                                      {isUpdating && status.toLowerCase() !== "accepted"
                                        ? "Approving..."
                                        : "Approve"}
                                    </Button>
                                    <Button
                                      className="action-btn reject-btn btn-sm"
                                      disabled={isDecisionMade || isUpdating}
                                      onClick={() => handleStatusChange(_id, "Rejected")}
                                    >
                                      {isUpdating && status.toLowerCase() !== "rejected"
                                        ? "Rejecting..."
                                        : "Reject"}
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </Table>
                    )}
                  </>
                )}
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
      </Container>

       <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
};

export default ManageApplicants;
