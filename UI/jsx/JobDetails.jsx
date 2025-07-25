import React from "react";
import { useParams } from "react-router-dom";
import { gql, useQuery } from "@apollo/client";
import { Container, Card, Spinner } from "react-bootstrap";

const GET_JOB_BY_ID = gql`
  query GetJobById($id: ID!) {
    getJobById(id: $id) {
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
    }
  }
`;

const JobDetails = () => {
  const { id } = useParams();
  const { loading, error, data } = useQuery(GET_JOB_BY_ID, { variables: { id } });

  if (loading) return <Spinner animation="border" />;
  if (error) return <p>Error loading job details.</p>;

  const job = data.getJobById;

  return (
    <Container className="py-4">
      <Card className="p-4">
        <h2>{job.title}</h2>
        <p><strong>Type:</strong> {job.type}</p>
        <p><strong>Location:</strong> {job.location}</p>
        <p><strong>Salary:</strong> {job.salary}</p>
        <hr />
        <p><strong>Description:</strong> {job.description}</p>
        <p><strong>About the Job:</strong> {job.aboutJob}</p>
        <p><strong>About You:</strong> {job.aboutYou}</p>
        <p><strong>What We Look For:</strong> {job.whatWeLookFor}</p>
        <p><strong>Must-Have:</strong></p>
        <ul>
          {job.mustHave.map((item, index) => <li key={index}>{item}</li>)}
        </ul>
        <p><strong>Benefits:</strong> {job.benefits}</p>
      </Card>
    </Container>
  );
};

export default JobDetails;
