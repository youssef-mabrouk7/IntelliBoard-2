import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import aiRoutes from "./routes/airoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
try {
  const dotenv = await import("dotenv");
  dotenv.default.config({ path: path.resolve(__dirname, "../.env") });
  dotenv.default.config();
} catch {
  // dotenv is optional; environment variables can be provided by the host.
}

const app = express();

app.use(express.json());
app.use("/api/ai", aiRoutes);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});