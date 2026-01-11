import { Router } from "express";
import { processVideo } from "../controllers/process.controller.js";

const router = Router();
router.post("/process-video", processVideo);

export default router;
