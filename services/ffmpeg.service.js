import axios from "axios";
import { spawn } from "child_process";
import path from "path";

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

export function generateTempMp4(cloudUrl, assPath, outputPath) {
  return new Promise((resolve, reject) => {
    const fontsDir = path.join(process.cwd(), "public", "fonts");

    const ffmpeg = spawn("ffmpeg", [
      "-i",
      cloudUrl,
      "-vf",
      `ass=${assPath}:fontsdir=${fontsDir}`,
      "-c:v",
      "libx264",
      "-preset",
      "veryfast",
      "-crf",
      "21",
      "-pix_fmt",
      "yuv420p",
      "-c:a",
      "aac",
      "-b:a",
      "192k",
      "-movflags",
      "+faststart",
      outputPath,
    ]);

    ffmpeg.stderr.on("data", (d) => console.log("[ffmpeg]", d.toString()));

    ffmpeg.on("error", reject);
    ffmpeg.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg exited with code ${code}`));
    });
  });
}
