import axios from "axios";
import FormData from "form-data";
import { ENV } from "../config/env.js";
import { formatSrtFile } from "../libs/format_srt_file.js";

const WHISPER_API_URL = "https://api.openai.com/v1/audio/transcriptions";

export async function whisperChunk(buffer, offsetSeconds) {
  const form = new FormData();

  form.append("file", buffer, {
    filename: "chunk.wav",
    contentType: "audio/wav",
  });
  form.append("model", "whisper-1");
  form.append("response_format", "srt");
  form.append("language", "vi");

  const res = await axios.post(WHISPER_API_URL, form, {
    headers: {
      Authorization: `Bearer ${ENV.OPENAI_API_KEY}`,
      ...form.getHeaders(),
    },
  });


  const formattedSrt = formatSrtFile(res.data, offsetSeconds);

  return formattedSrt;
}