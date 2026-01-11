import dotenv from "dotenv";
dotenv.config({
  path: ".env.local",
});

export const ENV = {
  PORT: process.env.PORT || 8000,

  AWS_REGION: process.env.AWS_REGION,
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  AWS_S3_BUCKET: process.env.AWS_S3_BUCKET,

  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
};
