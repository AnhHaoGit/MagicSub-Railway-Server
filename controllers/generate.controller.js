import fs from "fs/promises";
import path from "path";
import os from "os";
import { ObjectId } from "mongodb";
import { v4 as uuidv4 } from "uuid";

import { generateASS } from "../services/ass.service.js";
import { generateTempMp4 } from "../services/ffmpeg.service.js";
import { multipartUpload } from "../services/s3Multipart.service.js";
import { connectDB } from "../services/mongodb.service.js";
import { ENV } from "../config/env.js";

export async function generateVideoController(req, res) {
  let assPath = null;
  let tempMp4 = null;

  try {
    const { subtitle, customize, cloudUrl, videoId, userId } = req.body;

    if (!subtitle || !customize || !cloudUrl || !videoId || !userId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const id = uuidv4();
    const key = `generated_videos/${videoId}/${id}`;

    const assContent = generateASS(subtitle, customize);
    assPath = path.join(os.tmpdir(), `sub_${id}.ass`);
    await fs.writeFile(assPath, assContent, "utf8");

    tempMp4 = path.join(os.tmpdir(), `video_${id}.mp4`);
    await generateTempMp4(cloudUrl, assPath, tempMp4);

    await multipartUpload(tempMp4, ENV.AWS_S3_BUCKET, key);

    const videoUrl = `https://${ENV.AWS_S3_BUCKET}.s3.${ENV.AWS_REGION}.amazonaws.com/${key}`;

    const date = new Date();

    const db = await connectDB();
    await db.collection("videos").updateOne(
      { _id: new ObjectId(videoId), userId: new ObjectId(userId) },
      {
        $push: {
          cloudUrls: {
            id,
            url: videoUrl,
            key,
            createdAt: date.toISOString(),
          },
        },
      }
    );

    res.json({
      ok: true,
      url: videoUrl,
      id,
      key,
      createdAt: date.toISOString(),
    });
  } catch (err) {
    console.error("Generate video error:", err);
    res.status(500).json({ error: err.message });
  } finally {
    if (assPath) await fs.unlink(assPath).catch(() => {});
    if (tempMp4) await fs.unlink(tempMp4).catch(() => {});
  }
}
