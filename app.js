import express from "express";
import cors from "cors";

import uploadRoute from "./routes/upload.route.js";
import processRoute from "./routes/process.route.js";
import generateRoute from "./routes/generate.route.js";


const app = express();

app.use(express.json());
app.use(cors({ origin: "*" }));

app.use(uploadRoute);
app.use(processRoute);
app.use(generateRoute);

export default app;
