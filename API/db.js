const { MongoClient, ObjectId } = require("mongodb");
const bcrypt = require("bcrypt");

const url = process.env.DB_URL;
const client = new MongoClient(url);
let db;

async function connectToDB() {
  if (db) return db;
  try {
    await client.connect();
    db = client.db("CareerBridge");
    console.log(" Connected to MongoDB:", db.databaseName);
    return db;
  } catch (error) {
    console.error(" DB connection error:", error);
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

// Admin Profile
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

async function getAdminProfile(email) {
  const db = await connectToDB();
  return await db.collection("admin_profiles").findOne({ email });
}

// User Profile
async function saveUserProfile(input) {
  const db = await connectToDB();
  const { email } = input;
  if (!email) throw new Error("Email is required to save user profile");

  const updateResult = await db.collection("user_profiles").updateOne(
    { email },
    { $set: { ...input, updatedAt: new Date() } },
    { upsert: true }
  );

  const saved = await db.collection("user_profiles").findOne({ email });
  if (!saved || !saved._id) throw new Error("Failed to retrieve saved profile");

  return {
    _id: saved._id,
    firstName: saved.firstName || "",
    lastName: saved.lastName || "",
    email: saved.email,
    gender: saved.gender || "",
    mobile: saved.mobile || "",
    city: saved.city || "",
    country: saved.country || "",
    experienceLevel: saved.experienceLevel || "",
    educationLevel: saved.educationLevel || "",
    customEducation: saved.customEducation || "",
    customSkills: saved.customSkills || "",
    customJobs: saved.customJobs || "",
    linkedin: saved.linkedin || "",
    github: saved.github || "",
    resumeFile: saved.resumeFile || "",
    coverLetterFile: saved.coverLetterFile || "",
    profilePhoto: saved.profilePhoto || "",
    selfIntroVideo: saved.selfIntroVideo || ""
  };
}

async function getUserProfile(email) {
  const db = await connectToDB();
  return await db.collection("user_profiles").findOne({ email });
}

// Create Job
async function createJob(input) {
  const db = await connectToDB();
  const adminProfile = await db.collection("admin_profiles").findOne({ email: input.email });
  if (!adminProfile || !adminProfile.companyName) {
    throw new Error("Admin profile or company name not found");
  }

  const job = {
    ...input,
    companyName: adminProfile.companyName,
    createdAt: new Date().toISOString(),
  };

  const result = await db.collection("jobs").insertOne(job);
  if (!result.acknowledged) throw new Error("Failed to create job");

  return { _id: result.insertedId, ...job };
}

// Update Job
async function updateJob(id, input) {
  const db = await connectToDB();

  let jobId;
  if (/^[a-fA-F0-9]{24}$/.test(id)) {
    jobId = new ObjectId(id);
  } else {
    jobId = id;
  }

  const updateResult = await db.collection("jobs").updateOne(
    { _id: jobId },
    { $set: input }
  );

  if (updateResult.matchedCount === 0) {
    throw new Error("Job not found");
  }

  const updatedJob = await db.collection("jobs").findOne({ _id: jobId });
  return updatedJob;
}

// Apply for a Job
async function applyForJob({ userEmail, jobId, resume, coverLetter }) {
  const db = await connectToDB();

  const job = await db.collection("jobs").findOne({ _id: new ObjectId(jobId) });
  if (!job) throw new Error("Job not found");

  const userProfile = await db.collection("user_profiles").findOne({ email: userEmail });
  if (!userProfile) throw new Error("User profile not found");

  const existing = await db.collection("applications").findOne({ jobId: new ObjectId(jobId), userEmail });
  if (existing) throw new Error("You have already applied for this job");

  const application = {
    jobId: new ObjectId(jobId),
    userEmail,
    userProfile,
    resumeFile: resume || null,             
    coverLetterFile: coverLetter || null,   
    appliedAt: new Date(),
    status: "Pending"
  };

  await db.collection("applications").insertOne(application);
  return application;
}


// Get applicants for a job

async function getApplicantsByJobId(jobId) {
  const db = await connectToDB();

  const applicants = await db.collection("applications")
    .find({ jobId: new ObjectId(jobId) })
    .project({
      userEmail: 1,
      resumeFile: 1,          
      coverLetterFile: 1,    
      userProfile: {
        firstName: 1,
        lastName: 1,
        email: 1,
        mobile: 1,
        city: 1,
        country: 1,
        educationLevel: 1,
      },
      appliedAt: 1,
      status: 1,
    })
    .toArray();

  return applicants;
}

// Get jobs a user has applied for
async function getAppliedJobsByUser(userEmail) {
  const db = await connectToDB();

  const applications = await db.collection("applications").find({ userEmail }).toArray();
  const jobIds = applications.map(app => app.jobId);

  if (jobIds.length === 0) return [];

  const jobs = await db.collection("jobs")
    .find({ _id: { $in: jobIds.filter(id => ObjectId.isValid(id)) } })
    .toArray();

  return jobs;
}

// Update applicant status
async function updateApplicantStatus(applicantId, status) {
  const db = await connectToDB();
  const result = await db.collection("applications").updateOne(
    { _id: new ObjectId(applicantId) },
    { $set: { status } }
  );
  if (result.matchedCount === 0) throw new Error("Applicant not found");
  return await db.collection("applications").findOne({ _id: new ObjectId(applicantId) });
}

module.exports = {
  connectToDB,
  signupUser,
  loginUser,
  saveAdminProfile,
  getAdminProfile,
  saveUserProfile,
  getUserProfile,
  createJob,
  updateJob,
  applyForJob,
  getApplicantsByJobId,
  getAppliedJobsByUser,
  updateApplicantStatus
};
