const express = require("express");
const cors = require("cors");
require("dotenv").config({ path: "api.env" });

const { ApolloServer, gql } = require("apollo-server-express");
const {
  connectToDB,
  signupUser,
  loginUser,
  createAdminProfile,
  updateAdminProfile,
  getAdminProfile,
} = require("./db");

// GraphQL schema
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

  type Query {
    _empty: String
    getAdminProfile(email: String!): AdminProfile
  }

  type Mutation {
    signup(input: SignupInput!): User!
    login(input: LoginInput!): User!
    createAdminProfile(input: AdminProfileInput!): AdminProfile!
    updateAdminProfile(input: AdminProfileInput!): AdminProfile!
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
    createAdminProfile: async (_, { input }) => {
      if (!input.email || !input.companyName) {
        throw new Error("Email and company name are required.");
      }
      try {
        return await createAdminProfile(input);
      } catch (err) {
        console.error("CreateAdminProfile error:", err.message);
        throw new Error(err.message);
      }
    },
    updateAdminProfile: async (_, { input }) => {
      if (!input.email || !input.companyName) {
        throw new Error("Email and company name are required.");
      }
      try {
        return await updateAdminProfile(input);
      } catch (err) {
        console.error("UpdateAdminProfile error:", err.message);
        throw new Error(err.message);
      }
    },
  },
};

// Start server
async function startServer() {
  const app = express();
  app.use(cors());

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
