import React from "react";
import { Routes, Route, NavLink } from "react-router-dom";
import AdminDashboard from "./AdminDashboard.jsx";
import CreateJob from "./CreateJob.jsx";
import ManageJob from "./ManageJob.jsx";
import ManageApplicants from "./ManageApplicants.jsx";
import Profile from "./Profile.jsx";
import Login from "./Login.jsx";
import ForgetPassword from "./ForgetPassword.jsx";
import ResetPassword from "./ResetPassword.jsx";







const NotFound = () => <h1>Page Not Found</h1>;

export function NavPage() {
  return (
    <Routes>
      <Route path="/" element={<AdminDashboard />} />
      <Route path="login" element={<Login />} />
      <Route path="create-job" element={<CreateJob />} />
      <Route path="manage-job" element={<ManageJob />} />
      <Route path="manage-applicants" element={<ManageApplicants />} />
      <Route path="profile" element={<Profile />} /> 
      <Route path="/forget-password" element={<ForgetPassword />} />
      <Route path="reset-password/:token" element={<ResetPassword />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
