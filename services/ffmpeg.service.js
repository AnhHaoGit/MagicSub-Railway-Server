import axios from "axios";
import { spawn } from "child_process";

export async function extractAudioBuffer(videoUrl) {
  return new Promise(async (resolve, reject) => {
    try {
      const videoStream = await axios.get(videoUrl, {
        responseType: "stream",
      });

      const ffmpeg = spawn("ffmpeg", [
        "-i",
        "pipe:0",
        "-f",
        "wav",
        "-ac",
        "1",
        "-ar",
        "16000",
        "pipe:1",
      ]);

      const chunks = [];
      ffmpeg.stdout.on("data", (c) => chunks.push(c));
      ffmpeg.on("close", () => resolve(Buffer.concat(chunks)));
      ffmpeg.on("error", reject);

      videoStream.data.pipe(ffmpeg.stdin);
    } catch (err) {
      reject(err);
    }
  });
}

export function chunkAudioBuffer(buffer, chunkSizeMB = 24) {
  const size = chunkSizeMB * 1024 * 1024;
  const chunks = [];

  for (let i = 0; i < buffer.length; i += size) {
    chunks.push(buffer.slice(i, i + size));
  }
  return chunks;
}
