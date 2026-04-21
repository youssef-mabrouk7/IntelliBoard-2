import { suggestTeam } from "../services/aiService.js";

export async function getSuggestion(req, res) {
  try {
    const { task, teams } = req.body;

    const result = await suggestTeam(task, teams);

    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: "AI suggestion failed"
    });
  }
}