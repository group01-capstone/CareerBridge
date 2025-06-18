// API/main.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");
require("dotenv").config({ path: "api.env" });

const uploadRoute = require("./upload");

const { ApolloServer, gql } = require("apollo-server-express");
const {
  connectToDB,
  signupUser,
  loginUser,
  saveAdminProfile,
  getAdminProfile,
  saveUserProfile,
  getUserProfile,
} = require("./db");

// Ensure uploads folder exists
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
    username: String
    email: String!
    gender: String
    status: String
    mobile: String
    city: String
    country: String
    educationLevel: String
    customEducation: String
    customSkills: String
    customJobs: String
    linkedin: String
    github: String
    resumeFile: String
    profilePhoto: String
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
    username: String
    email: String!
    gender: String
    status: String
    mobile: String
    city: String
    country: String
    educationLevel: String
    customEducation: String
    customSkills: String
    customJobs: String
    linkedin: String
    github: String
    resumeFile: String
    profilePhoto: String
  }

  type Query {
    _empty: String
    getAdminProfile(email: String!): AdminProfile
    getUserProfile(email: String!): UserProfile
  }

  type Mutation {
    signup(input: SignupInput!): User!
    login(input: LoginInput!): User!
    saveAdminProfile(input: AdminProfileInput!): AdminProfile!
    saveUserProfile(input: UserProfileInput!): UserProfile!
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
        throw new Error(err.message);
      }
    },
  },
};

// Start Server
async function startServer() {
  const app = express();

  app.use(cors());
  app.use(bodyParser.json({ limit: "50mb" }));
  app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

  // Upload route and static file serving
  app.use("/upload", uploadRoute);
  app.use("/uploads", express.static(path.join(__dirname, "..", "public", "uploads")));

  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();
  server.applyMiddleware({ app, path: "/graphql" });

  await connectToDB();

  const port = process.env.API_PORT || 5000;
  app.listen(port, () =>
    console.log(`Server ready at http://localhost:${port}${server.graphqlPath}`)
  );
}

startServer();
