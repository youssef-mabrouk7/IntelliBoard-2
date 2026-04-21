import express from "express";
import { suggestTeam } from "../services/aiService.js";

const router = express.Router();

router.post("/suggest-team", async (req, res) => {
  try {
    const { task, teams } = req.body;

    const result = await suggestTeam(task, teams);

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "AI failed" });
  }
});

export default router;