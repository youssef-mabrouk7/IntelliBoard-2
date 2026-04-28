export async function queryHuggingFace(prompt) {
  const apiKey = process.env.HF_API_KEY;
  if (!apiKey) {
    throw new Error('Missing HF_API_KEY in backend environment.');
  }

  const response = await fetch(
    'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
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

  const data = await response.json();
  if (!response.ok) {
    const details = typeof data === 'string' ? data : JSON.stringify(data);
    throw new Error(`Hugging Face request failed (${response.status}): ${details}`);
  }
  return data;
}
