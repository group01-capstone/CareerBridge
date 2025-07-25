import React from "react";
import { Routes, Route } from "react-router-dom";
import UserDashboard from "./UserDashboard.jsx";
import UserProfile from "./UserProfile.jsx";
import MyJobs from "./MyJobs.jsx";
import JobDetails from "./JobDetails.jsx";


const NotFound = () => <h1>Page Not Found</h1>;

export default function UserNavPage() {
  return (
    <Routes>
      <Route path="/" element={<UserDashboard />} />
      <Route path="home" element={<UserDashboard />} />
      <Route path="profile" element={<UserProfile />} />
      <Route path="my-jobs" element={<MyJobs />} />
      <Route path="job/:id" element={<JobDetails />} />
      <Route path="/user/job/:id" element={<JobDetails />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
