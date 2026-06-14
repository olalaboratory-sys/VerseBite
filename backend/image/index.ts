// Supabase Edge Function (Deno) — verse image generator + durable store.
// Generates a cinematic image per verse via Google's Imagen, then UPLOADS it to
// Supabase Storage and returns a stable public URL. On later requests (any user,
// any device, any past date) it returns the already-stored image instead of
// regenerating — so the archive is permanent and shared.
//
// Setup:
//   supabase functions deploy image --no-verify-jwt
//   supabase secrets set GEMINI_API_KEY=AIza...
//   # create a PUBLIC storage bucket named "verse-images"
//
// Request : { id, cat, ref, en, seed }
// Response: { url: "https://<project>.supabase.co/storage/v1/object/public/verse-images/<cat>/<id>.png" }

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') ?? '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const MODEL = 'imagen-3.0-generate-002';
const BUCKET = 'verse-images';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const SCENES: Record<string, string[]> = {
  friendship: ['two empty chairs by a warm window at golden hour', 'two coffee cups on a sunlit wooden table'],
  love: ['soft peonies in warm morning light', 'two intertwined wildflower stems at sunrise'],
  family: ['a cozy lamplit living room at dusk', 'a worn family dining table by an open window'],
  motivation: ['a mountain ridge under a breaking dawn', 'an open road into golden hills'],
  faith: ['sunlight breaking through misty forest pines', 'a calm sea under a vast soft sky'],
  forgiveness: ['gentle rain clearing to warm light on still water', 'an open hand of calm water at sunrise'],
  gratitude: ['a harvest table with autumn light', 'a field of wheat glowing at golden hour'],
  hope: ['first light over a quiet horizon', 'a single sunrise through soft clouds'],
  wisdom: ['an old open book in warm window light', 'a quiet candlelit desk at dawn'],
};

const publicUrl = (path: string) => `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;

function b64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  try {
    const { id, cat, seed } = await req.json();
    const path = `${cat}/${id}.png`;
    const url = publicUrl(path);

    // 1) already stored? return it (durable archive, shared across users).
    const head = await fetch(url, { method: 'HEAD' });
    if (head.ok) return new Response(JSON.stringify({ url }), { headers: { ...CORS, 'content-type': 'application/json' } });

    // 2) generate.
    const variants = SCENES[cat] ?? SCENES.hope;
    const scene = variants[(Number(seed) || 0) % variants.length];
    const prompt =
      `Cinematic, warm, photorealistic image: ${scene}. ` +
      `Soft golden hour light, shallow depth of field, serene reverent mood, ivory and gold tones. ` +
      `No text, no words, no letters. No people's faces, no depiction of Jesus or religious figures. No violence.`;

    const gen = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:predict?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ instances: [{ prompt }], parameters: { sampleCount: 1, aspectRatio: '3:4' } }),
    });
    const data = await gen.json();
    const b64: string | undefined = data?.predictions?.[0]?.bytesBase64Encoded;
    if (!b64) return new Response(JSON.stringify({ error: 'no image' }), { status: 502, headers: { ...CORS, 'content-type': 'application/json' } });

    // 3) upload to Storage (upsert) so it persists and is re-viewable forever.
    await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${SERVICE_ROLE}`, 'content-type': 'image/png', 'x-upsert': 'true' },
      body: b64ToBytes(b64),
    });

    return new Response(JSON.stringify({ url }), { headers: { ...CORS, 'content-type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...CORS, 'content-type': 'application/json' } });
  }
});
