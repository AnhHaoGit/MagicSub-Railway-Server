import dotenv from "dotenv";
dotenv.config({
  path: ".env.local",
});

import express from "express";
import multer from "multer";
import cors from "cors";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: false,
  })
);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 1024 * 1024 * 500,
  },
});

// AWS S3
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

app.get("/", (_, res) => {
  res.send("Upload worker is running");
});

app.post("/upload-video", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;

    console.log("Received file:", file ? file.originalname : "No file");

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const key = `uploads/${uuidv4()}`;

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      })
    );

    const fileUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    res.json({
      ok: true,
      fileUrl,
      key,
      size: file.size,
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Upload failed" });
  }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Upload worker running on port ${PORT}`);
});
