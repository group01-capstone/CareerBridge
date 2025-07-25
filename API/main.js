const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");
require("dotenv").config({ path: "api.env" });
const express = require("express");
const uploadRoute = require("./upload");
const { ApolloServer, gql } = require("apollo-server-express");
const app = express();


const {
  connectToDB,
  signupUser,
  loginUser,
  saveAdminProfile,
  getAdminProfile,
  saveUserProfile,
  getUserProfile,
  createJob,
  applyForJob,
  getApplicantsByJobId,
  getAppliedJobsByUser,
  updateJob,
  updateApplicantStatus,
} = require("./db");

const { ObjectId } = require("mongodb");

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "..", "public", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// GraphQL Schema
const typeDefs = gql`
  type User {
    _id: ID!
    email: String!
    name: String!
    role: String!
  }

  type AdminProfile {
    _id: ID!
    companyName: String!
    industry: String
    registrationNumber: String
    foundedYear: Int
    teamSize: String
    website: String
    email: String
    phone: String
    address: String
    overview: String
    linkedin: String
    twitter: String
    facebook: String
    instagram: String
  }

  type UserProfile {
    _id: ID!
    firstName: String
    lastName: String
    email: String!
    gender: String
    mobile: String
    city: String
    country: String
    experienceLevel: String
    educationLevel: String
    customEducation: String
    customSkills: String
    customJobs: String
    linkedin: String
    github: String
    resumeFile: String
    coverLetterFile: String
    profilePhoto: String
    selfIntroVideo: String
  }

  # NEW: Application type to represent user application status for a job
  type Application {
    status: String
  }

  type Job {
    _id: ID!
    title: String!
    description: String!
    location: String
    salary: String
    type: String
    deadline: String
    createdAt: String
    aboutJob: String
    aboutYou: String
    whatWeLookFor: String
    mustHave: [String]
    benefits: String
    email: String!
    companyName: String

    # NEW: Embed application info for this user in job query result
    application: Application
  }

type Applicant {
  _id: ID!
  userEmail: String!
  userProfile: UserProfile
  appliedAt: String
  status: String
  resumeFile: String
  coverLetterFile: String
}


  input SignupInput {
    email: String!
    password: String!
    name: String!
    role: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input AdminProfileInput {
    companyName: String!
    industry: String
    registrationNumber: String
    foundedYear: Int
    teamSize: String
    website: String
    email: String!
    phone: String
    address: String
    overview: String
    linkedin: String
    twitter: String
    facebook: String
    instagram: String
  }

  input UserProfileInput {
    firstName: String
    lastName: String
    email: String!
    gender: String
    mobile: String
    city: String
    country: String
    experienceLevel: String
    educationLevel: String
    customEducation: String
    customSkills: String
    customJobs: String
    linkedin: String
    github: String
    resumeFile: String
    coverLetterFile: String
    profilePhoto: String
    selfIntroVideo: String
  }

  input JobInput {
    title: String!
    description: String!
    location: String
    salary: String
    type: String
    deadline: String
    aboutJob: String
    aboutYou: String
    whatWeLookFor: String
    mustHave: [String]
    benefits: String
    email: String!
  }

  input ApplyJobInput {
  userEmail: String!
  jobId: ID!
  resume: String
  coverLetter: String
}
  type Query {
    _empty: String
    getAdminProfile(email: String!): AdminProfile
    getUserProfile(email: String!): UserProfile
    getAllJobs: [Job]
    getJobById(id: ID!): Job
    getApplicants(jobId: ID!): [Applicant]
    
    # No schema change here - return list of Jobs with embedded application info
    getAppliedJobsByUser(userEmail: String!): [Job!]!
  }

  type Mutation {
    signup(input: SignupInput!): User!
    login(input: LoginInput!): User!
    saveAdminProfile(input: AdminProfileInput!): AdminProfile!
    saveUserProfile(input: UserProfileInput!): UserProfile!
    createJob(input: JobInput!): Job!
    applyForJob(input: ApplyJobInput!): Applicant!
    updateJob(id: ID!, input: JobInput!): Job!
    updateApplicantStatus(applicantId: ID!, status: String!): Applicant!
  }
`;

// Resolvers
const resolvers = {
  Query: {
    _empty: () => "API is running",
    getAdminProfile: async (_, { email }) => {
      try {
        return await getAdminProfile(email);
      } catch (err) {
        console.error("GetAdminProfile error:", err.message);
        throw new Error(err.message);
      }
    },
    getUserProfile: async (_, { email }) => {
      try {
        return await getUserProfile(email);
      } catch (err) {
        console.error("GetUserProfile error:", err.message);
        throw new Error(err.message);
      }
    },
    getAllJobs: async () => {
      const db = await connectToDB();
      return await db.collection("jobs").find().toArray();
    },
    getJobById: async (_, { id }) => {
      try {
        const db = await connectToDB();
        return await db.collection("jobs").findOne({ _id: new ObjectId(id) });
      } catch (err) {
        console.error("getJobById error:", err.message);
        throw new Error("Failed to fetch job details");
      }
    },
    getApplicants: async (_, { jobId }) => {
      try {
       
        return await getApplicantsByJobId(jobId);
      } catch (err) {
        console.error("getApplicants error:", err.message);
        throw new Error(err.message);
      }
    },

    // UPDATED resolver to join jobs and user's applications with status
    getAppliedJobsByUser: async (_, { userEmail }) => {
      try {
        const db = await connectToDB();

        
        const applications = await db
          .collection("applications")
          .find({ userEmail })
          .toArray();

        if (applications.length === 0) return [];

       
        const jobIds = applications.map((app) => app.jobId);


        const jobs = await db
          .collection("jobs")
          .find({ _id: { $in: jobIds } })
          .toArray();

        
        return jobs.map((job) => {
          const application = applications.find(
            (app) => app.jobId.toString() === job._id.toString()
          );

          return {
            ...job,
            application: {
              status: application?.status || "Pending",
            },
          };
        });
      } catch (err) {
        console.error("getAppliedJobsByUser error:", err.message);
        throw new Error(err.message);
      }
    },
  },

  Mutation: {
    signup: async (_, { input }) => {
      try {
        return await signupUser(input);
      } catch (err) {
        console.error("Signup error:", err.message);
        throw new Error(err.message);
      }
    },
    login: async (_, { input }) => {
      try {
        return await loginUser(input);
      } catch (err) {
        console.error("Login error:", err.message);
        throw new Error(err.message);
      }
    },
    saveAdminProfile: async (_, { input }) => {
      if (!input.email || !input.companyName) {
        throw new Error("Email and company name are required.");
      }
      try {
        return await saveAdminProfile(input);
      } catch (err) {
        console.error("SaveAdminProfile error:", err.message);
        throw new Error(err.message);
      }
    },
    saveUserProfile: async (_, { input }) => {
      if (!input.email) throw new Error("Email is required.");
      try {
        return await saveUserProfile(input);
      } catch (err) {
        console.error("SaveUserProfile error:", err.message);
        throw new Error("SaveUserProfile failed: " + err.message);
      }
    },
    createJob: async (_, { input }) => {
      try {
        console.log(" Received input for createJob:", input);
        return await createJob(input);
      } catch (err) {
        console.error("CreateJob error:", err.message);
        throw new Error(err.message);
      }
    },
    applyForJob: async (_, { input }) => {
      try {
        return await applyForJob(input);
      } catch (err) {
        console.error("applyForJob error:", err.message);
        throw new Error(err.message);
      }
    },
    updateJob: async (_, { id, input }) => {
      try {
        return await updateJob(id, input);
      } catch (err) {
        console.error("updateJob error:", err.message);
        throw new Error(err.message);
      }
    },
    updateApplicantStatus: async (_, { applicantId, status }) => {
      try {
        return await updateApplicantStatus(applicantId, status);
      } catch (err) {
        console.error("updateApplicantStatus error:", err.message);
        throw new Error(err.message);
      }
    },
  },
};

// Start Express Server
async function startServer() {
  const app = express();

  app.use(cors());
  app.use(bodyParser.json({ limit: "50mb" }));
  app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

  app.use("/upload", uploadRoute);
  app.use("/uploads", express.static(path.join(__dirname,  "..", "public", "uploads")));



app.use("/user_uploads", express.static(path.join(__dirname,"..", "public", "user_uploads")));

 

  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();
  server.applyMiddleware({ app, path: "/graphql" });

  await connectToDB();

  const port = process.env.API_PORT || 5000;
  app.listen(port, () => {
    console.log(` Server ready at http://localhost:${port}${server.graphqlPath}`);
  });
}

startServer();
