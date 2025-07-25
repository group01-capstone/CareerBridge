const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs"); 
const router = express.Router();

/* ------------------------- Helpers ------------------------- */
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true }); 
  }
}

/* --------------------- Folder Paths ------------------------ */
const defaultUploadDir = path.join(__dirname, "..", "public", "uploads");    
const userDashboardDir = path.join(__dirname, "..", "public","user_uploads");          

ensureDir(defaultUploadDir);
ensureDir(userDashboardDir);

/* ------------------- Multer Storages ----------------------- */

// Default storage (for generic uploads to public/uploads)
const storageDefault = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, defaultUploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

//  New storage (for UserDashboard uploads to user_uploads)
const storageUserDashboard = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, userDashboardDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const uploadDefault = multer({ storage: storageDefault });
const uploadUserDashboard = multer({ storage: storageUserDashboard });

/* ------------------------ Routes --------------------------- */


router.post("/", uploadDefault.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  return res.json({ filename: `/uploads/${req.file.filename}` });
});

//  New route → uploads from UserDashboard go to user_uploads/
router.post(
  "/user-dashboard",
  uploadUserDashboard.fields([
    { name: "resume", maxCount: 1 },
    { name: "coverLetter", maxCount: 1 },
    { name: "file", maxCount: 10 }, 
  ]),
  (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const result = {};

    if (req.files.resume) {
      result.resume = `/user_uploads/${req.files.resume[0].filename}`;
    }

    if (req.files.coverLetter) {
      result.coverLetter = `/user_uploads/${req.files.coverLetter[0].filename}`;
    }

    if (req.files.file) {
      result.files = req.files.file.map((f) => `/user_uploads/${f.filename}`);
    }

    return res.json(result); 
  }
);

module.exports = router;
