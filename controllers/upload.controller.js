import { uploadToS3 } from "../services/s3.service.js";

export async function uploadVideo(req, res) {
  const file = req.file;
  if (!file) return res.status(400).json({ error: "No file" });

  const result = await uploadToS3(file);
  res.json({ ok: true, ...result, size: file.size });
}
