import { Router } from "express";
import { upload } from "../middlewares/upload.middleware.js";
import { uploadVideo } from "../controllers/upload.controller.js";

const router = Router();

router.post("/upload-video", upload.single("file"), uploadVideo);

export default router;
