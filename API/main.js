// API/main.js
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");
require("dotenv").config({ path: "api.env" });
const express = require("express");

const { ApolloServer, gql } = require("apollo-server-express");
const { ApolloServerPluginLandingPageGraphQLPlayground } = require("apollo-server-core");

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
  saveJob,
  getSavedJobsByUser,
} = require("./db");

const { ObjectId } = require("mongodb");
const makeUploadRouter = require("./upload-gridfs"); // <--- hyphen filename


const uploadsDir = path.join(__dirname, "..", "public", "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// ---------------- GraphQL Schema ----------------
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
    email: String           # <--- made nullable to avoid crashes
    companyName: String
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

  type DashboardStats {
    totalJobs: Int!
    totalUsers: Int!
    pendingApplications: Int!
  }

  type ResponseMessage {
    success: Boolean!
    message: String!
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

  type SaveJobResponse {
    success: Boolean!
    message: String
  }

  type Query {
    _empty: String
    getAdminProfile(email: String!): AdminProfile
    getUserProfile(email: String!): UserProfile
    getAllJobs: [Job]
    getJobById(id: ID!): Job
    getApplicants(jobId: ID!): [Applicant]
    getAppliedJobsByUser(userEmail: String!): [Job!]!
    getSavedJobsByUser(userEmail: String!): [Job!]!
    getDashboardStats: DashboardStats!
  }

  type Mutation {
    signup(input: SignupInput!): User!
    login(input: LoginInput!): User!
    saveAdminProfile(input: AdminProfileInput!): AdminProfile!
    saveUserProfile(input: UserProfileInput!): UserProfile!
    updateUserProfile(input: UserProfileInput!): UserProfile!
    createJob(input: JobInput!): Job!
    applyForJob(input: ApplyJobInput!): Applicant!
    updateJob(id: ID!, input: JobInput!): Job!
    updateApplicantStatus(applicantId: ID!, status: String!): Applicant!
    saveJob(userEmail: String!, jobId: ID!): SaveJobResponse!
    deleteSavedJob(userEmail: String!, jobId: ID!): Boolean!
    deleteJob(id: ID!): Boolean!
    changePassword(email: String!, newPassword: String!): ResponseMessage!
  }
`;

// ---------------- Resolvers ----------------
const resolvers = {
  Query: {
    _empty: () => "API is running",
    getAdminProfile: async (_, { email }) => {
      try { return await getAdminProfile(email); }
      catch (err) { console.error("GetAdminProfile error:", err.message); throw new Error(err.message); }
    },
    getUserProfile: async (_, { email }) => {
      try { return await getUserProfile(email); }
      catch (err) { console.error("GetUserProfile error:", err.message); throw new Error(err.message); }
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
        const raw = await getApplicantsByJobId(jobId);
        return raw.map(a => ({
          ...a,
          appliedAt: a.appliedAt ? new Date(a.appliedAt).toISOString() : null,
        }));
      } catch (err) {
        console.error("getApplicants error:", err.message);
        throw new Error(err.message);
      }
    },
    getAppliedJobsByUser: async (_, { userEmail }) => {
      try {
        const db = await connectToDB();
        const applications = await db.collection("applications").find({ userEmail }).toArray();
        if (!applications.length) return [];
        const jobIds = applications.map(a => a.jobId);
        const jobs = await db.collection("jobs").find({ _id: { $in: jobIds } }).toArray();
        return jobs.map(job => {
          const application = applications.find(a => String(a.jobId) === String(job._id));
          return { ...job, application: { status: application?.status || "Pending" } };
        });
      } catch (err) {
        console.error("getAppliedJobsByUser error:", err.message);
        throw new Error(err.message);
      }
    },
    getSavedJobsByUser: async (_, { userEmail }) => {
      try {
        const db = await connectToDB();
        const saved = await db.collection("savedJobs").find({ userEmail }).toArray();
        const jobIds = saved.map(s => s.jobId);
        if (!jobIds.length) return [];
        return await db.collection("jobs").find({ _id: { $in: jobIds } }).toArray();
      } catch (err) {
        console.error("getSavedJobsByUser error:", err.message);
        throw new Error("Failed to fetch saved jobs.");
      }
    },
    getDashboardStats: async () => {
      try {
        const db = await connectToDB();
        const totalJobs = await db.collection("jobs").countDocuments();
        const totalUsers = await db.collection("users").countDocuments();
        const pendingApplications = await db.collection("applications").countDocuments({ status: "Pending" });
        return { totalJobs, totalUsers, pendingApplications };
      } catch (err) {
        console.error("getDashboardStats error:", err.message);
        throw new Error("Failed to fetch dashboard stats.");
      }
    },
  },

  Mutation: {
    signup: async (_, { input }) => {
      try { return await signupUser(input); }
      catch (err) { console.error("Signup error:", err.message); throw new Error(err.message); }
    },
    login: async (_, { input }) => {
      try { return await loginUser(input); }
      catch (err) { console.error("Login error:", err.message); throw new Error(err.message); }
    },
    saveAdminProfile: async (_, { input }) => {
      if (!input.email || !input.companyName) throw new Error("Email and company name are required.");
      try { return await saveAdminProfile(input); }
      catch (err) { console.error("SaveAdminProfile error:", err.message); throw new Error(err.message); }
    },
    saveUserProfile: async (_, { input }) => {
      if (!input.email) throw new Error("Email is required.");
      try { return await saveUserProfile(input); }
      catch (err) { console.error("SaveUserProfile error:", err.message); throw new Error("SaveUserProfile failed: " + err.message); }
    },
    updateUserProfile: async (_, { input }) => {
      if (!input.email) throw new Error("Email is required.");
      try { return await saveUserProfile(input); }
      catch (err) { console.error("UpdateUserProfile error:", err.message); throw new Error("UpdateUserProfile failed: " + err.message); }
    },
    createJob: async (_, { input }) => {
      try { return await createJob(input); }
      catch (err) { console.error("CreateJob error:", err.message); throw new Error(err.message); }
    },
    applyForJob: async (_, { input }) => {
      try { return await applyForJob(input); }
      catch (err) { console.error("applyForJob error:", err.message); throw new Error(err.message); }
    },
    updateJob: async (_, { id, input }) => {
      try { return await updateJob(id, input); }
      catch (err) { console.error("updateJob error:", err.message); throw new Error(err.message); }
    },
    updateApplicantStatus: async (_, { applicantId, status }) => {
      try { return await updateApplicantStatus(applicantId, status); }
      catch (err) { console.error("updateApplicantStatus error:", err.message); throw new Error(err.message); }
    },
    saveJob: async (_, { userEmail, jobId }) => {
      try {
        const db = await connectToDB();
        const jobObjectId = new ObjectId(jobId);
        const existing = await db.collection("savedJobs").findOne({ userEmail, jobId: jobObjectId });
        if (existing) return { success: false, message: "Job already saved." };
        await db.collection("savedJobs").insertOne({ userEmail, jobId: jobObjectId, savedAt: new Date() });
        return { success: true, message: "Job saved successfully." };
      } catch (err) {
        console.error("saveJob error:", err.message);
        throw new Error("Failed to save job.");
      }
    },
    deleteSavedJob: async (_, { userEmail, jobId }) => {
      try {
        const db = await connectToDB();
        const jobObjectId = new ObjectId(jobId);
        const result = await db.collection("savedJobs").deleteOne({ userEmail, jobId: jobObjectId });
        return result.deletedCount > 0;
      } catch (err) {
        console.error("deleteSavedJob error:", err.message);
        throw new Error("Failed to delete saved job.");
      }
    },
    deleteJob: async (_, { id }) => {
      try {
        const db = await connectToDB();
        const result = await db.collection("jobs").deleteOne({ _id: new ObjectId(id) });
        return result.deletedCount > 0;
      } catch (err) {
        console.error("deleteJob error:", err.message);
        throw new Error("Failed to delete job.");
      }
    },
    changePassword: async (_, { email, newPassword }) => {
      const bcrypt = require("bcrypt");
      const saltRounds = 10;
      const db = await connectToDB();
      try {
        const user = await db.collection("users").findOne({ email });
        if (!user) return { success: false, message: "User with this email does not exist." };
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
        const result = await db.collection("users").updateOne({ email }, { $set: { password: hashedPassword } });
        if (result.modifiedCount === 1) return { success: true, message: "Password changed successfully." };
        return { success: false, message: "Failed to change password. Try again." };
      } catch (error) {
        console.error("changePassword error:", error);
        return { success: false, message: "Error changing password." };
      }
    },
  },
};

// ---------------- Start server ----------------
async function startServer() {
  const app = express();

  app.use(
    cors({
      origin: "http://localhost:3000", 
      credentials: true,
    })
  );

  app.use(bodyParser.json({ limit: "50mb" }));
  app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

 
  app.use("/uploads", express.static(path.join(__dirname, "..", "public", "uploads")));
  app.use("/user_uploads", express.static(path.join(__dirname, "..", "public", "user_uploads")));

 
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
  });
  await server.start();
  app.options("/graphql", cors({ origin: "http://localhost:3000", credentials: true }));
  server.applyMiddleware({ app, path: "/graphql", cors: false });

 
  const db = await connectToDB();
  app.use("/", makeUploadRouter(db));

  const port = process.env.API_PORT || 5000;
  app.listen(port, () => {
    console.log(`Server ready at http://localhost:${port}${server.graphqlPath}`);
  });
}

startServer();
