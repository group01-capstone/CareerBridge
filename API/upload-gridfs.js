const express = require("express");
const { Readable } = require("stream");
const multer = require("multer");
const { ObjectId } = require("mongodb");

module.exports = function makeUploadRouter(db) {
  const router = express.Router();
  const upload = multer({ storage: multer.memoryStorage() });
  const bucket = new (require("mongodb").GridFSBucket)(db, { bucketName: "uploads" });

  // POST /upload-gridfs (multipart/form-data with "file")
  router.post("/upload-gridfs", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        console.error("No file uploaded");
        return res.status(400).json({ error: "No file uploaded" });
      }

      const { originalname, mimetype, buffer } = req.file;
      const readable = Readable.from(buffer);

      const uploadStream = bucket.openUploadStream(originalname, {
        contentType: mimetype,
        metadata: { uploadedAt: new Date() },
      });

      readable.pipe(uploadStream)
        .on("error", (err) => {
          console.error("GridFS upload error:", err);
          res.status(500).json({ error: "Upload failed", message: err.message });
        })
        .on("finish", () => {
          console.log("File uploaded successfully!");
          res.json({
            fileId: uploadStream.id.toString(),
            filename: originalname,
            contentType: mimetype,
          });
        });
    } catch (e) {
      console.error("Upload error:", e.message);
      res.status(500).json({ error: "Upload failed", message: e.message });
    }
  });

  // GET /files/:id (serve file by ObjectId from GridFS)
  router.get("/files/:id", (req, res) => {
    const fileId = req.params.id;

    // Validate file ID
    if (!ObjectId.isValid(fileId)) {
      return res.status(400).json({ error: "Invalid file ID" });
    }

    try {
      // Create download stream from GridFS using new ObjectId()
      const downloadStream = bucket.openDownloadStream(new ObjectId(fileId));

      // Set appropriate content type and headers
      downloadStream.on("file", (file) => {
        res.setHeader("Content-Type", file.contentType || "application/octet-stream");
      });

      downloadStream.on("error", (err) => {
        console.error("Error fetching file:", err);
        res.status(500).json({ error: "Error fetching file", message: err.message });
      });

      // Pipe the download stream to the response
      downloadStream.pipe(res);
    } catch (err) {
      console.error("Error fetching file by ID:", err);
      res.status(500).json({ error: "Error fetching file", message: err.message });
    }
  });

  return router;
};
