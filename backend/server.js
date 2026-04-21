import express from "express";
import aiRoutes from "./routes/airoutes.js";

const app = express();

app.use(express.json());
app.use("/api/ai", aiRoutes);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});