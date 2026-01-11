import express from "express";
import cors from "cors";

import uploadRoute from "./routes/upload.route.js";
import processRoute from "./routes/process.route.js";

const app = express();

app.use(express.json());
app.use(cors({ origin: "*" }));

app.use(uploadRoute);
app.use(processRoute);

export default app;
