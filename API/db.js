// API/db.js
const { MongoClient, ObjectId } = require("mongodb");
const bcrypt = require("bcrypt");

const url = process.env.DB_URL;
const client = new MongoClient(url);
let db;

// Connect to MongoDB
async function connectToDB() {
  if (db) return db;
  try {
    await client.connect();
    db = client.db("CareerBridge");
    console.log("Connected to MongoDB:", db.databaseName);
    return db;
  } catch (error) {
    console.error("DB connection error:", error);
    throw new Error("Failed to connect to DB");
  }
}

// Signup User
async function signupUser({ email, password, name, role }) {
  const db = await connectToDB();
  const existingUser = await db.collection("users").findOne({ email });
  if (existingUser) throw new Error("Email already in use");

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = {
    email,
    password: hashedPassword,
    name,
    role,
    createdAt: new Date(),
  };

  const result = await db.collection("users").insertOne(user);
  if (!result.acknowledged) throw new Error("Failed to create user");
  return { _id: result.insertedId, email, name, role };
}

// Login User
async function loginUser({ email, password }) {
  const db = await connectToDB();
  const user = await db.collection("users").findOne({ email });
  if (!user) throw new Error("User not found");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid credentials");

  return { _id: user._id, email: user.email, name: user.name, role: user.role };
}

// Save Admin Profile
async function saveAdminProfile(input) {
  const db = await connectToDB();
  const { email } = input;
  if (!email) throw new Error("Email is required to save profile");

  await db.collection("admin_profiles").updateOne(
    { email },
    { $set: input },
    { upsert: true }
  );

  return await db.collection("admin_profiles").findOne({ email });
}

// Get Admin Profile
async function getAdminProfile(email) {
  const db = await connectToDB();
  return await db.collection("admin_profiles").findOne({ email });
}

// Save User Profile
async function saveUserProfile(input) {
  const db = await connectToDB();
  const { email } = input;
  if (!email) throw new Error("Email is required to save user profile");

  await db.collection("user_profiles").updateOne(
    { email },
    { $set: input },
    { upsert: true }
  );

  return await db.collection("user_profiles").findOne({ email });
}

// Get User Profile
async function getUserProfile(email) {
  const db = await connectToDB();
  return await db.collection("user_profiles").findOne({ email });
}

module.exports = {
  connectToDB,
  signupUser,
  loginUser,
  saveAdminProfile,
  getAdminProfile,
  saveUserProfile,
  getUserProfile,
};
