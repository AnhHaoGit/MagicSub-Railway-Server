import express from "express";
import { generateVideoController } from "../controllers/generate.controller.js";

const router = express.Router();

router.post("/generate-video", generateVideoController);

export default router;
