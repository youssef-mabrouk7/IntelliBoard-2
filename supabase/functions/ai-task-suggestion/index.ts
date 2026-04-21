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
    subtasks: [
      `Define objective and expected outcome for "${baseTitle}"`,
      'Break work into 3-5 actionable steps',
      'Assign owner and deadline for each step',
      'Review progress and mark completion criteria',
    ],
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
            temperature: 0.3,
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
        ? parsed.subtasks.map((s) => String(s).trim()).filter(Boolean).slice(0, 8)
        : [],
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
