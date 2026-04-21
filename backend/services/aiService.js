import { queryHuggingFace } from "../config/huggingface.js";

export async function suggestTeam(task, teams) {
  const prompt = `
You are an AI assistant for a task management system.

Recommend the best team based ONLY on:
- skills
- past completed tasks
- success rate

Return STRICT JSON ONLY.

TASK:
${task.title}
${task.description}

TEAMS:
${JSON.stringify(teams)}

FORMAT:
{
  "recommended_team": "",
  "recommended_members": [],
  "confidence_score": 0,
  "reasoning": ""
}
`;

  const result = await queryHuggingFace(prompt);

  // Hugging Face returns raw text
  const text = result[0]?.generated_text || "";

  // Extract JSON safely
  const jsonStart = text.indexOf("{");
  const jsonEnd = text.lastIndexOf("}") + 1;

  const jsonString = text.slice(jsonStart, jsonEnd);

  return JSON.parse(jsonString);
}
export async function fetchTeamSuggestion(task, teams) {
    const res = await fetch("http://your-server/ai/suggest-team", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ task, teams })
    });
  
    return res.json();
  }