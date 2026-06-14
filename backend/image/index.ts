// Supabase Edge Function (Deno) — verse image generator for VerseBite, via
// Google's Imagen (Generative Language API). The key stays on the server; the
// app sets EXPO_PUBLIC_IMAGE_ENDPOINT to this URL and calls it when a verse
// changes (daily pick / refresh).
//
// Deploy:
//   supabase functions deploy image --no-verify-jwt
//   supabase secrets set GEMINI_API_KEY=AIza...
//
// Request : { id, cat, ref, en, seed }
// Response: { image: "data:image/png;base64,..." }

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') ?? '';
const MODEL = 'imagen-3.0-generate-002';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Per-category cinematic scene (no people, no text). The seed rotates the
// variant so two verses never render the same picture.
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

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  try {
    const { cat, seed } = await req.json();
    const variants = SCENES[cat] ?? SCENES.hope;
    const scene = variants[(Number(seed) || 0) % variants.length];
    const prompt =
      `Cinematic, warm, photorealistic image: ${scene}. ` +
      `Soft golden hour light, shallow depth of field, serene and reverent mood, ivory and gold tones. ` +
      `No text, no words, no letters. No people's faces, no depiction of Jesus or religious figures. ` +
      `No violence. Tasteful, calm, devotional.`;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:predict?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ instances: [{ prompt }], parameters: { sampleCount: 1, aspectRatio: '3:4' } }),
    });
    const data = await res.json();
    const b64: string | undefined = data?.predictions?.[0]?.bytesBase64Encoded;
    if (!b64) return new Response(JSON.stringify({ error: 'no image' }), { status: 502, headers: { ...CORS, 'content-type': 'application/json' } });
    return new Response(JSON.stringify({ image: `data:image/png;base64,${b64}` }), { headers: { ...CORS, 'content-type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...CORS, 'content-type': 'application/json' } });
  }
});
