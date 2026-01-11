import {
  extractAudioBuffer,
  chunkAudioBuffer,
} from "../services/ffmpeg.service.js";
import { whisperChunk } from "../services/whisper.service.js";
import { srtToSecondsTimestamp } from "../libs/srt_to_second.js";

export async function processVideo(req, res) {
  const { videoUrl } = req.body;
  if (!videoUrl) return res.status(400).json({ error: "Missing videoUrl" });

  const audioBuffer = await extractAudioBuffer(videoUrl);
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

  res.json({ ok: true, segments });
}
