import { queryHuggingFace } from "../config/huggingface.js";

function randomFutureDate(minDays = 1, maxDays = 21) {
  const span = Math.max(maxDays - minDays + 1, 1);
  const days = minDays + Math.floor(Math.random() * span);
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function inferPriority(title, description, fallback = "medium") {
  const text = `${title} ${description}`.toLowerCase();
  if (/(urgent|asap|critical|blocker|production|outage|hotfix)/.test(text)) return "high";
  if (/(later|someday|backlog|nice to have|optional)/.test(text)) return "low";
  return ["high", "medium", "low"].includes(fallback) ? fallback : "medium";
}

function inferCategory(title, description, fallback = "") {
  const text = `${title} ${description}`.toLowerCase();
  if (/(ui|ux|design|prototype|figma|wireframe)/.test(text)) return "Design";
  if (/(api|backend|frontend|code|feature|implement|bug|fix)/.test(text)) return "Development";
  if (/(test|qa|automation|regression)/.test(text)) return "Testing";
  if (/(research|investigate|analysis|benchmark|spike)/.test(text)) return "Research";
  if (/(docs|documentation|readme|guide)/.test(text)) return "Documentation";
  if (fallback.trim()) return fallback.trim();
  return "Planning";
}

function buildDynamicSubtasks(title, description) {
  const subject = title.trim() || "the task";
  const text = `${title} ${description}`.toLowerCase();
  const keywords = uniqueSubtasks(
    text
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length >= 4 && !["with", "that", "this", "from", "into", "have", "will", "task"].includes(w))
      .slice(0, 8)
  );
  const focus = keywords.length ? keywords[Math.floor(Math.random() * keywords.length)] : "scope";

  const phases = ["discovery", "planning", "execution", "validation", "handoff"];
  const actions = ["draft", "map", "prioritize", "implement", "validate", "review", "finalize", "document"];
  const objects = [
    `deliverables for "${subject}"`,
    `risks and dependencies for "${subject}"`,
    `acceptance criteria for "${subject}"`,
    `test scenarios for "${subject}"`,
    `handoff notes for "${subject}"`,
    `timeline checkpoints for "${subject}"`,
    `feedback loop for "${subject}"`,
  ];
  const connectors = ["before", "after", "while", "during"];
  const owners = ["assignee", "team lead", "reviewer", "stakeholder"];
  const pick = (items) => items[Math.floor(Math.random() * items.length)];

  const pool = [];
  for (let i = 0; i < 12; i += 1) {
    const action = pick(actions);
    const object = pick(objects);
    const phase = pick(phases);
    const owner = pick(owners);
    const connector = pick(connectors);
    const variant = i % 3;
    if (variant === 0) {
      pool.push(`${action[0].toUpperCase() + action.slice(1)} ${object} during ${phase}`);
    } else if (variant === 1) {
      pool.push(`${action[0].toUpperCase() + action.slice(1)} ${object} ${connector} ${focus} review`);
    } else {
      pool.push(`Assign ${owner} to ${action} ${object}`);
    }
  }

  const count = 5 + Math.floor(Math.random() * 3); // 5-7 subtasks
  return shuffle(uniqueSubtasks(pool)).slice(0, count);
}

function uniqueSubtasks(subtasks) {
  const seen = new Set();
  const normalized = [];
  for (const item of subtasks || []) {
    const value = String(item ?? "").trim();
    if (!value) continue;
    const key = value.toLowerCase().replace(/\s+/g, " ");
    if (seen.has(key)) continue;
    seen.add(key);
    normalized.push(value);
  }
  return normalized;
}

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

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

export async function suggestTaskSuggestion(input) {
  const title = String(input?.title ?? "").trim();
  const description = String(input?.description ?? "").trim();
  const category = String(input?.category ?? "").trim();
  const priority = String(input?.priority ?? "medium").trim().toLowerCase();

  if (!title && !description) {
    throw new Error("title or description is required");
  }

  const prompt = [
    "You are an assistant that improves task planning.",
    "Return ONLY valid JSON with keys: dueDate, priority, category, subtasks.",
    "dueDate must be YYYY-MM-DD between tomorrow and +21 days.",
    "priority must be one of: high, medium, low.",
    "category must be a short label.",
    "subtasks must be an array of short strings with no duplicates.",
    "Subtasks must be specific to the provided task title and description, not generic templates.",
    "Subtasks must be different from each other and dynamic on each request.",
    "",
    `Input title: ${title || "(empty)"}`,
    `Input description: ${description || "(empty)"}`,
    `Category: ${category || "(none)"}`,
    `Priority: ${priority || "medium"}`,
  ].join("\n");

  const result = await queryHuggingFace(prompt);
  const text = Array.isArray(result)
    ? String(result[0]?.generated_text ?? "")
    : String(result?.generated_text ?? "");

  const jsonStart = text.indexOf("{");
  const jsonEnd = text.lastIndexOf("}") + 1;
  const parsedText = jsonStart >= 0 && jsonEnd > jsonStart ? text.slice(jsonStart, jsonEnd) : "{}";
  let parsed = {};
  try {
    parsed = JSON.parse(parsedText);
  } catch {
    parsed = {};
  }

  const safeDate = /^\d{4}-\d{2}-\d{2}$/.test(String(parsed?.dueDate ?? ""))
    ? String(parsed.dueDate)
    : randomFutureDate();
  const safePriority = ["high", "medium", "low"].includes(String(parsed?.priority ?? "").toLowerCase())
    ? String(parsed.priority).toLowerCase()
    : inferPriority(title, description, priority);
  const safeCategoryFromModel = String(parsed?.category ?? "").trim();
  const safeCategory = safeCategoryFromModel || inferCategory(title, description, category);
  const safeSubtasksFromModel = Array.isArray(parsed?.subtasks)
    ? uniqueSubtasks(parsed.subtasks).slice(0, 8)
    : [];
  const randomizedFallback = buildDynamicSubtasks(title, description);
  const safeSubtasks = safeSubtasksFromModel.length > 0
    ? uniqueSubtasks([
        ...shuffle(safeSubtasksFromModel).slice(0, 3),
        ...shuffle(randomizedFallback).slice(0, 3),
      ]).slice(0, 6)
    : randomizedFallback;

  return {
    dueDate: safeDate,
    priority: safePriority,
    category: safeCategory,
    subtasks: safeSubtasks,
  };
}