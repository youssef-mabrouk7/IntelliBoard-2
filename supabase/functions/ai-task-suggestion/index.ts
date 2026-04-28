import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

type SuggestionRequest = {
  title?: string;
  description?: string;
  category?: string;
  priority?: string;
};

const PRIORITY_VALUES = ['high', 'medium', 'low'] as const;
const CATEGORY_VALUES = ['Design', 'Development', 'Research', 'Testing', 'Planning', 'Documentation'] as const;

function pickRandom<T>(items: readonly T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

function randomFutureDate(minDays = 1, maxDays = 21) {
  const span = Math.max(maxDays - minDays + 1, 1);
  const days = minDays + Math.floor(Math.random() * span);
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function uniqueSubtasks(subtasks: unknown[]): string[] {
  const seen = new Set<string>();
  const output: string[] = [];
  for (const item of subtasks) {
    const value = String(item ?? '').trim();
    if (!value) continue;
    const key = value.toLowerCase().replace(/\s+/g, ' ');
    if (seen.has(key)) continue;
    seen.add(key);
    output.push(value);
  }
  return output;
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildDynamicSubtasks(subjectRaw: string, contextRaw: string): string[] {
  const subject = subjectRaw.trim() || 'the task';
  const hasContext = Boolean(contextRaw.trim());
  const pick = <T>(items: readonly T[]) => items[Math.floor(Math.random() * items.length)];

  const scopeChoices = [
    hasContext
      ? `Clarify scope and success criteria for "${subject}" using the provided context`
      : `Clarify scope and success criteria for "${subject}"`,
    `Define concrete deliverables for "${subject}"`,
    `Align expected outcome and constraints for "${subject}"`,
  ];
  const planningChoices = [
    `Break "${subject}" into milestone-based action items`,
    `List dependencies and prerequisites for "${subject}"`,
    `Estimate effort and timeline slices for "${subject}"`,
  ];
  const executionChoices = [
    `Execute the core work required for "${subject}"`,
    `Implement and validate the primary deliverable for "${subject}"`,
    `Coordinate implementation handoff items for "${subject}"`,
  ];
  const reviewChoices = [
    `Review quality and acceptance criteria for "${subject}"`,
    `Document final outcomes and unresolved follow-ups for "${subject}"`,
    `Collect feedback and refine "${subject}" based on findings`,
  ];

  const pool = [
    pick(scopeChoices),
    pick(planningChoices),
    pick(executionChoices),
    pick(reviewChoices),
    `Set a final verification checkpoint for "${subject}"`,
    `Share a concise status and risk update for "${subject}"`,
  ];
  const count = 4 + Math.floor(Math.random() * 3); // 4-6
  return uniqueSubtasks(pool).slice(0, count);
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function buildLocalSuggestion(input: {
  title: string;
  description: string;
  category: string;
  priority: string;
}) {
  const baseTitle = input.title || 'New task';
  const baseDescription =
    input.description ||
    `Complete "${baseTitle}" with clear acceptance criteria, owner, and due date.`;
  const categoryHint = input.category ? ` in ${input.category}` : '';

  return {
    title: baseTitle,
    description: `${baseDescription}\n\nPriority: ${input.priority}.${categoryHint}`.slice(0, 2000),
    dueDate: randomFutureDate(),
    priority: pickRandom(PRIORITY_VALUES),
    category: pickRandom(CATEGORY_VALUES),
    subtasks: buildDynamicSubtasks(baseTitle, input.description),
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const hfApiKey = Deno.env.get('HF_API_KEY');
    if (!hfApiKey) {
      return new Response(
        JSON.stringify({ error: 'Missing HF_API_KEY secret in Supabase Edge Functions.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const body = (await req.json()) as SuggestionRequest;
    const title = (body.title ?? '').trim();
    const description = (body.description ?? '').trim();
    const category = (body.category ?? '').trim();
    const priority = (body.priority ?? 'medium').trim();

    if (!title && !description) {
      return new Response(JSON.stringify({ error: 'title or description is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const prompt = [
      'You are an assistant that improves task planning.',
      'Return ONLY valid JSON with keys: title, description, dueDate, priority, category, subtasks.',
      'dueDate must be YYYY-MM-DD and between tomorrow and +21 days.',
      'priority must be one of: high, medium, low.',
      'category must be a short label.',
      'subtasks must be an array of short strings.',
      'subtasks must not contain duplicates.',
      'subtasks must be dynamic and different from one another.',
      'Generate varied/randomized output on each call while staying realistic.',
      '',
      `Input title: ${title || '(empty)'}`,
      `Input description: ${description || '(empty)'}`,
      `Category: ${category || '(none)'}`,
      `Priority: ${priority}`,
    ].join('\n');

    const hfResponse = await fetch(
      'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${hfApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 220,
            temperature: 0.75,
            return_full_text: false,
          },
        }),
      },
    );

    if (!hfResponse.ok) {
      const errText = await hfResponse.text();
      const fallback = buildLocalSuggestion({ title, description, category, priority });
      return new Response(
        JSON.stringify({
          ...fallback,
          providerError: `Hugging Face error: ${errText}`.slice(0, 700),
          fallback: true,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    const hfData = await hfResponse.json();
    const generatedText = Array.isArray(hfData)
      ? String(hfData[0]?.generated_text ?? '')
      : String((hfData as any)?.generated_text ?? '');

    let parsed: {
      title?: string;
      description?: string;
      dueDate?: string;
      priority?: string;
      category?: string;
      subtasks?: string[];
    } = {};
    try {
      const jsonStart = generatedText.indexOf('{');
      const jsonEnd = generatedText.lastIndexOf('}');
      if (jsonStart >= 0 && jsonEnd > jsonStart) {
        const jsonSlice = generatedText.slice(jsonStart, jsonEnd + 1);
        parsed = JSON.parse(jsonSlice);
      }
    } catch {
      // Fallback below if model returns non-JSON text.
    }

    const fallbackDescription =
      description ||
      generatedText.slice(0, 400) ||
      'Refine this task with clear expected outcome, owner, and due-date criteria.';

    const result = {
      title: (parsed.title ?? title).toString().slice(0, 200),
      description: (parsed.description ?? fallbackDescription).toString().slice(0, 2000),
      dueDate: /^\d{4}-\d{2}-\d{2}$/.test(String(parsed.dueDate ?? ''))
        ? String(parsed.dueDate)
        : randomFutureDate(),
      priority: PRIORITY_VALUES.includes(String(parsed.priority ?? '').toLowerCase() as any)
        ? String(parsed.priority).toLowerCase()
        : pickRandom(PRIORITY_VALUES),
      category: String(parsed.category ?? pickRandom(CATEGORY_VALUES)).slice(0, 40),
      subtasks: Array.isArray(parsed.subtasks)
        ? uniqueSubtasks([
            ...shuffle(uniqueSubtasks(parsed.subtasks)).slice(0, 3),
            ...shuffle(buildDynamicSubtasks(title, description)).slice(0, 3),
          ]).slice(0, 6)
        : buildDynamicSubtasks(title, description),
    };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error in AI suggestion function',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
