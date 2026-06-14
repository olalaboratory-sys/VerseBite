// VerseBite — Firebase Cloud Functions (Gen 2). All AI runs on Gemini so a
// single GEMINI_API_KEY powers images (Imagen), reflection, and study guides.
// Generated images/guides are stored in Firebase Storage (generate-once,
// re-served forever) so past dates are re-viewable by any user/device.
//
// Setup:
//   cd backend/functions && npm i
//   firebase functions:secrets:set GEMINI_API_KEY
//   firebase deploy --only functions
// Then point the app at the deployed URLs:
//   EXPO_PUBLIC_IMAGE_ENDPOINT  = https://<region>-<project>.cloudfunctions.net/image
//   EXPO_PUBLIC_AI_ENDPOINT     = https://<region>-<project>.cloudfunctions.net/reflection
//   EXPO_PUBLIC_STUDY_ENDPOINT  = https://<region>-<project>.cloudfunctions.net/studyguide

import { onRequest, Request } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import { setGlobalOptions } from 'firebase-functions/v2';
import * as admin from 'firebase-admin';
import type { Response } from 'express';

admin.initializeApp();
setGlobalOptions({ region: 'us-central1', maxInstances: 10 });
const GEMINI_API_KEY = defineSecret('GEMINI_API_KEY');

const GLM = 'https://generativelanguage.googleapis.com/v1beta/models';
const TEXT_MODEL = 'gemini-2.5-flash';
const IMAGE_MODEL = 'imagen-3.0-generate-002';

function cors(res: Response) {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Headers', 'content-type');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
}
const handlePreflight = (req: Request, res: Response) => {
  if (req.method === 'OPTIONS') { cors(res); res.status(204).send(''); return true; }
  cors(res);
  return false;
};

async function geminiText(key: string, prompt: string): Promise<string> {
  const r = await fetch(`${GLM}/${TEXT_MODEL}:generateContent?key=${key}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  });
  const data: any = await r.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}
function parseJson(text: string): any {
  const m = text.match(/\{[\s\S]*\}/);
  return m ? JSON.parse(m[0]) : null;
}
function avoidBlock(avoid: unknown): string {
  const list = Array.isArray(avoid) ? (avoid as string[]) : [];
  if (!list.length) return '';
  const relax = list.length >= 30 ? ' (mild similarity is acceptable now)' : '';
  return `\nAvoid repeating or closely echoing these recent phrasings${relax}:\n- ${list.join('\n- ')}`;
}

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

// ── Verse image (Imagen) — generate once, store, re-serve ──
export const image = onRequest({ secrets: [GEMINI_API_KEY], cors: true }, async (req, res) => {
  if (handlePreflight(req, res)) return;
  try {
    const { id, cat, seed } = req.body || {};
    const bucket = admin.storage().bucket();
    const path = `verse-images/${cat}/${id}.png`;
    const file = bucket.file(path);
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${path}`;

    const [exists] = await file.exists();
    if (exists) { res.json({ url: publicUrl }); return; }

    const variants = SCENES[cat] ?? SCENES.hope;
    const scene = variants[(Number(seed) || 0) % variants.length];
    const prompt =
      `Cinematic, warm, photorealistic image: ${scene}. Soft golden hour light, shallow depth of field, ` +
      `serene reverent mood, ivory and gold tones. No text, no words, no letters. ` +
      `No people's faces, no depiction of Jesus or religious figures. No violence.`;

    const r = await fetch(`${GLM}/${IMAGE_MODEL}:predict?key=${GEMINI_API_KEY.value()}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ instances: [{ prompt }], parameters: { sampleCount: 1, aspectRatio: '3:4' } }),
    });
    const data: any = await r.json();
    const b64: string | undefined = data?.predictions?.[0]?.bytesBase64Encoded;
    if (!b64) { res.status(502).json({ error: 'no image' }); return; }

    await file.save(Buffer.from(b64, 'base64'), { contentType: 'image/png', resumable: false });
    await file.makePublic();
    res.json({ url: publicUrl });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// ── Reflection question (Gemini text) ──
export const reflection = onRequest({ secrets: [GEMINI_API_KEY], cors: true }, async (req, res) => {
  if (handlePreflight(req, res)) return;
  try {
    const { ref, en, ko, cat, avoid } = req.body || {};
    const prompt =
      `You are a gentle reflection guide for a bilingual (English/Korean) daily Bible-verse app.\n` +
      `Write ONE short, open-ended reflection question (max 22 words) applying this verse to today.\n` +
      `Warm, non-prescriptive, no clichés. Theme: ${cat}. Verse (${ref}): EN "${en}" / KO "${ko}".` +
      `${avoidBlock(avoid)}\nReturn STRICT JSON only: {"en":"...","ko":"natural Korean ..."}`;
    const parsed = parseJson(await geminiText(GEMINI_API_KEY.value(), prompt));
    res.json({ en: parsed?.en ?? '', ko: parsed?.ko ?? '' });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// ── Study guide (Gemini text) — generate once, store, re-serve (paid) ──
export const studyguide = onRequest({ secrets: [GEMINI_API_KEY], cors: true }, async (req, res) => {
  if (handlePreflight(req, res)) return;
  try {
    const { id, refEn, refKo, en, ko, avoid } = req.body || {};
    const bucket = admin.storage().bucket();
    const path = `study-guides/${id}.json`;
    const file = bucket.file(path);

    const [exists] = await file.exists();
    if (exists) {
      const [buf] = await file.download();
      res.set('content-type', 'application/json').send(buf.toString());
      return;
    }

    const prompt =
      `You are a careful, warm Bible-study writer for a bilingual (English/Korean) app.\n` +
      `For ${refEn} (KO ${refKo}): EN "${en}" / KO "${ko}", write a study guide. Faithful public-domain-style ` +
      `text (WEB / 개역). Gentle, non-denominational. Korean must be natural.${avoidBlock(avoid)}\n` +
      `Return STRICT JSON ONLY with EXACTLY: {"pRefEn","pRefKo","pEn","pKo","ctxEn","ctxKo",` +
      `"keyEn":[3],"keyKo":[3],"reflectEn":[3],"reflectKo":[3],"applyEn":[3],"applyKo":[3],` +
      `"journalEn","journalKo","prayerEn","prayerKo"}`;
    const guide = parseJson(await geminiText(GEMINI_API_KEY.value(), prompt));
    if (!guide) { res.status(502).json({ error: 'no json' }); return; }

    await file.save(JSON.stringify(guide), { contentType: 'application/json', resumable: false });
    res.json(guide);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});
