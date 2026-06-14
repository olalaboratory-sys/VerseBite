// Supabase Edge Function (Deno) — AI reflection proxy for VerseBite.
// Keeps the Anthropic API key on the server; the app calls this endpoint and
// sets EXPO_PUBLIC_AI_ENDPOINT to its URL.
//
// Deploy:
//   supabase functions deploy reflection --no-verify-jwt
//   supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
//
// Request  body: { ref, en, ko, cat }
// Response body: { en: string, ko: string }

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY') ?? '';
// A short, gentle reflection question is a light task — Haiku keeps it cheap.
const MODEL = 'claude-haiku-4-5-20251001';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  try {
    const { ref, en, ko, cat } = await req.json();
    const prompt = `You are a gentle spiritual-reflection guide for a bilingual (English/Korean) daily Bible-verse app.
Write ONE short, open-ended reflection question (max 22 words) inviting the reader to apply this verse to their day.
Warm, non-prescriptive, no clichés. Theme: ${cat}.
Verse (${ref}): EN "${en}" / KO "${ko}".
Return STRICT JSON only: {"en":"<question in English>","ko":"<same question in natural Korean>"}`;

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({ model: MODEL, max_tokens: 300, messages: [{ role: 'user', content: prompt }] }),
    });
    const data = await res.json();
    const text: string = data?.content?.[0]?.text ?? '{}';
    const match = text.match(/\{[\s\S]*\}/);
    const parsed = match ? JSON.parse(match[0]) : { en: '', ko: '' };
    return new Response(JSON.stringify({ en: parsed.en ?? '', ko: parsed.ko ?? '' }), {
      headers: { ...CORS, 'content-type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...CORS, 'content-type': 'application/json' } });
  }
});
