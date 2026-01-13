import {
  extractAudioBuffer,
  chunkAudioBuffer,
} from "../services/ffmpeg.service.js";
import { whisperChunk } from "../services/whisper.service.js";
import { srtToSecondsTimestamp } from "../libs/srt_to_second.js";
import { connectDB } from "../services/mongodb.service.js";
import {ObjectId} from "mongodb";

export async function processVideo(req, res) {
  const { userId, cloudUrl, uploadKey, title, size, duration, customize } =
    req.body;

  const audioBuffer = await extractAudioBuffer(cloudUrl);
  const chunks = chunkAudioBuffer(audioBuffer);

  let offset = 0;
  const segments = [];

  for (const chunk of chunks) {
    const s = await whisperChunk(chunk, offset);
    if (s.length) {
      offset = srtToSecondsTimestamp(s[s.length - 1].end);
      segments.push(...s);
    }
  }

  const date = new Date();

  const db = await connectDB();

  const result = await db.collection("videos").insertOne({
    userId: new ObjectId(userId),
    title,
    size,
    duration,
    cloudUrl,
    uploadKey,
    customize,
    transcript: segments,
    createdAt: date.toISOString(),
  });

  res.json({
    ok: true,
    _id: result.insertedId,
    transcript: segments,
    createdAt: date.toISOString(),
  });
}
