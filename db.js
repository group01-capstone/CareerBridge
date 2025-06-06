const { MongoClient, ObjectId } = require("mongodb");
const bcrypt = require("bcrypt");

const url = process.env.DB_URL;
const client = new MongoClient(url);
let db;

// Connect to MongoDB
async function connectToDB() {
  if (db) return;
  try {
    await client.connect();
    db = client.db("CareerBridge"); // Set your DB name here
    console.log("Connected to MongoDB:", db.databaseName);
  } catch (error) {
    console.error("DB connection error:", error);
    throw new Error("Failed to connect to DB");
  }
}

// User Signup
async function signupUser({ email, password, name, role }) {
  if (!db) await connectToDB();

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

// User Login
async function loginUser({ email, password }) {
  if (!db) await connectToDB();

  const user = await db.collection("users").findOne({ email });
  if (!user) throw new Error("User not found");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid credentials");

  return { _id: user._id, email: user.email, name: user.name, role: user.role };
}

// Admin Profile Creation
async function createAdminProfile(input) {
  if (!db) await connectToDB();
  const existing = await db.collection("admin_profiles").findOne({ email: input.email });
  if (existing) throw new Error("Admin profile already exists");

  const result = await db.collection("admin_profiles").insertOne(input);
  return await db.collection("admin_profiles").findOne({ _id: result.insertedId });
}

// Admin Profile Update
async function updateAdminProfile(input) {
  if (!db) await connectToDB();
  const existing = await db.collection("admin_profiles").findOne({ email: input.email });
  if (!existing) throw new Error("Admin profile not found");

  await db.collection("admin_profiles").updateOne({ email: input.email }, { $set: input });
  return await db.collection("admin_profiles").findOne({ email: input.email });
}

// Get Admin Profile
async function getAdminProfile(email) {
  if (!db) await connectToDB();
  return await db.collection("admin_profiles").findOne({ email });
}

// Export functions
module.exports = {
  connectToDB,
  signupUser,
  loginUser,
  createAdminProfile,
  updateAdminProfile,
  getAdminProfile,
};
