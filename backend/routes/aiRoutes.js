import express from "express";
import { suggestTeam, suggestTaskSuggestion } from "../services/aiService.js";

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

router.post("/suggest-task", async (req, res) => {
  try {
    const result = await suggestTaskSuggestion(req.body ?? {});
    res.json(result);
  } catch (err) {
    res.status(500).json({
      error: "Task suggestion failed",
      details: err instanceof Error ? err.message : "Unknown error",
    });
  }
});

export default router;
