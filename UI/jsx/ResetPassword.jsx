import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, gql } from "@apollo/client";
import { Container, Form, Button, Alert, Row, Col } from "react-bootstrap";

const RESET_PASSWORD = gql`
  mutation ResetPasswordWithToken($email: String!, $newPassword: String!) {
    resetPassword(email: $email, newPassword: $newPassword) {
      success
      message
    }
  }
`;

export default function ResetPassword() {
 const { token: email } = useParams(); 
  const [newPassword, setNewPassword] = useState("");
  const [resetPassword, { data, loading, error }] = useMutation(RESET_PASSWORD);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await resetPassword({ variables: { token, newPassword } });
    if (data?.resetPasswordWithToken?.success) {
      alert("Password changed successfully!");
      navigate("/login");
    }
  };

  return (
    <Container className="my-5">
      <Row className="justify-content-center">
        <Col xs={12} md={6}>
          <h2 className="mb-4 text-center">Set New Password</h2>
          <Form onSubmit={handleSubmit} className="shadow p-4 rounded bg-white">
            <Form.Group className="mb-3">
              <Form.Label>New Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </Form.Group>
            <Button type="submit" className="w-100" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </Button>
            {error && <Alert variant="danger" className="mt-3">{error.message}</Alert>}
            {data && !data.resetPasswordWithToken.success && (
              <Alert variant="warning" className="mt-3">{data.resetPasswordWithToken.message}</Alert>
            )}
          </Form>
        </Col>
      </Row>
    </Container>
  );
}
