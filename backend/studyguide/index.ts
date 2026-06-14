// Supabase Edge Function (Deno) — AI study-guide generator + durable store.
// Produces the full bilingual study metadata for a verse via Anthropic Claude,
// stores it once in Supabase Storage, and returns the stored JSON thereafter.
// The app only calls this for PAID users (gating is enforced client-side too).
//
// Setup:
//   supabase functions deploy studyguide --no-verify-jwt
//   supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
//   # create a PUBLIC storage bucket named "study-guides"
//   # then: EXPO_PUBLIC_STUDY_ENDPOINT=https://<project>.functions.supabase.co/studyguide
//
// Request : { id, cat, refEn, refKo, en, ko }
// Response: full guide JSON (pRefEn/pRefKo/pEn/pKo/ctxEn/ctxKo/keyEn/keyKo/
//           reflectEn/reflectKo/applyEn/applyKo/journalEn/journalKo/prayerEn/prayerKo)

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY') ?? '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const MODEL = 'claude-sonnet-4-6';
const BUCKET = 'study-guides';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const publicUrl = (path: string) => `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  try {
    const { id, refEn, refKo, en, ko } = await req.json();
    const path = `${id}.json`;

    // 1) already stored? serve it (durable, shared, saved with the daily verse).
    const cached = await fetch(publicUrl(path));
    if (cached.ok) {
      const json = await cached.text();
      return new Response(json, { headers: { ...CORS, 'content-type': 'application/json' } });
    }

    // 2) generate with Claude.
    const prompt = `You are a careful, warm Bible-study writer for a bilingual (English/Korean) app.
For the verse ${refEn} (KO ${refKo}): EN "${en}" / KO "${ko}", produce a study guide.
Scripture must be faithful public-domain-style text (WEB for English, 개역 style for Korean).
Tone: gentle, non-denominational, encouraging. Korean must be natural, not machine-literal.
Return STRICT JSON ONLY with EXACTLY these keys:
{
 "pRefEn": "passage reference e.g. 'Proverbs 17:15–18'",
 "pRefKo": "동일 참조 한국어 표기",
 "pEn": "the surrounding passage (3–5 verses) in English",
 "pKo": "같은 본문의 한국어",
 "ctxEn": "2–3 sentence background/context in English",
 "ctxKo": "2~3문장 배경 설명 (한국어)",
 "keyEn": ["3 short key-message bullets (English)"],
 "keyKo": ["핵심 메시지 3개 (한국어)"],
 "reflectEn": ["3 open reflection questions (English)"],
 "reflectKo": ["묵상 질문 3개 (한국어)"],
 "applyEn": ["3 concrete application steps (English)"],
 "applyKo": ["적용 단계 3개 (한국어)"],
 "journalEn": "one journaling prompt (English)",
 "journalKo": "저널 프롬프트 한 문장 (한국어)",
 "prayerEn": "a 1–2 sentence prayer ending in Amen.",
 "prayerKo": "한두 문장 기도, 끝에 아멘."
}`;

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: MODEL, max_tokens: 2000, messages: [{ role: 'user', content: prompt }] }),
    });
    const data = await res.json();
    const text: string = data?.content?.[0]?.text ?? '{}';
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return new Response(JSON.stringify({ error: 'no json' }), { status: 502, headers: { ...CORS, 'content-type': 'application/json' } });
    const guide = JSON.parse(match[0]);

    // 3) store it so it's saved alongside the verse and re-served forever.
    await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${SERVICE_ROLE}`, 'content-type': 'application/json', 'x-upsert': 'true' },
      body: JSON.stringify(guide),
    });

    return new Response(JSON.stringify(guide), { headers: { ...CORS, 'content-type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...CORS, 'content-type': 'application/json' } });
  }
});
