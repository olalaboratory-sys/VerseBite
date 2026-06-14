// VerseBite — Firebase Cloud Functions (Gen 2). All AI runs on Gemini so a
// single GEMINI_API_KEY powers images (Imagen), reflection, and study guides.
// Generated images/guides are stored in Firebase Storage (generate-once,
// re-served forever) so past dates are re-viewable by any user/device.
//
// Functions:
//   image       — verse art (Imagen), stored + re-served
//   reflection  — one bilingual reflection question
//   studyguide  — full bilingual study metadata, stored + re-served (paid)
//   rcWebhook   — RevenueCat → Firestore + custom claim (subscription source of truth)
//   dailyReminder — scheduled FCM push to opted-in devices
//
// Setup:
//   cd backend/functions && npm i
//   firebase functions:secrets:set GEMINI_API_KEY
//   firebase deploy --only functions,storage,firestore

import { onRequest, Request } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { defineSecret } from 'firebase-functions/params';
import { setGlobalOptions } from 'firebase-functions/v2';
import * as logger from 'firebase-functions/logger';
import * as admin from 'firebase-admin';
import type { Response } from 'express';

admin.initializeApp();
setGlobalOptions({ region: 'us-central1', maxInstances: 10 });

const GEMINI_API_KEY = defineSecret('GEMINI_API_KEY');
const RC_WEBHOOK_SECRET = defineSecret('RC_WEBHOOK_SECRET');

const GLM = 'https://generativelanguage.googleapis.com/v1beta/models';
const TEXT_MODEL = 'gemini-2.5-flash';
const IMAGE_MODEL = 'imagen-3.0-generate-002';

// ── helpers ──────────────────────────────────────────────────────────────
function cors(res: Response) {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Headers', 'content-type, authorization');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
}
/** Returns true if the request was a handled preflight/invalid method. */
function gate(req: Request, res: Response): boolean {
  cors(res);
  if (req.method === 'OPTIONS') { res.status(204).send(''); return true; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'POST only' }); return true; }
  return false;
}

async function fetchJSON(url: string, init: RequestInit, ms = 30000): Promise<any> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    const r = await fetch(url, { ...init, signal: ctrl.signal });
    return await r.json();
  } finally {
    clearTimeout(timer);
  }
}

async function geminiText(key: string, prompt: string): Promise<string> {
  const data = await fetchJSON(`${GLM}/${TEXT_MODEL}:generateContent?key=${key}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  });
  return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}
function parseJson(text: string): any {
  const m = text.match(/\{[\s\S]*\}/);
  return m ? JSON.parse(m[0]) : null;
}
function avoidBlock(avoid: unknown): string {
  const list = Array.isArray(avoid) ? (avoid as string[]).filter((s) => typeof s === 'string').slice(-30) : [];
  if (!list.length) return '';
  const relax = list.length >= 30 ? ' (mild similarity is acceptable now)' : '';
  return `\nAvoid repeating or closely echoing these recent phrasings${relax}:\n- ${list.join('\n- ')}`;
}
/** Verify a Firebase ID token if present; returns the decoded token or null. */
async function authedUser(req: Request) {
  const h = req.header('authorization') || '';
  const m = h.match(/^Bearer (.+)$/);
  if (!m) return null;
  try { return await admin.auth().verifyIdToken(m[1]); } catch { return null; }
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
const safeId = (s: unknown) => String(s ?? '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40);
const safeCat = (s: unknown) => (Object.prototype.hasOwnProperty.call(SCENES, String(s)) ? String(s) : 'hope');

// ── image (Imagen) — generate once, store, re-serve ──────────────────────
export const image = onRequest({ secrets: [GEMINI_API_KEY], cors: true, memory: '512MiB', timeoutSeconds: 120 }, async (req, res) => {
  if (gate(req, res)) return;
  try {
    const id = safeId(req.body?.id);
    const cat = safeCat(req.body?.cat);
    const seed = Number(req.body?.seed) || 0;
    if (!id) { res.status(400).json({ error: 'id required' }); return; }

    const bucket = admin.storage().bucket();
    const path = `verse-images/${cat}/${id}.png`;
    const file = bucket.file(path);
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${path}`;

    const [exists] = await file.exists();
    if (exists) { res.set('Cache-Control', 'public, max-age=31536000, immutable'); res.json({ url: publicUrl }); return; }

    const variants = SCENES[cat];
    const scene = variants[seed % variants.length];
    const prompt =
      `Cinematic, warm, photorealistic image: ${scene}. Soft golden hour light, shallow depth of field, ` +
      `serene reverent mood, ivory and gold tones. No text, no words, no letters. ` +
      `No people's faces, no depiction of Jesus or religious figures. No violence.`;

    const data = await fetchJSON(`${GLM}/${IMAGE_MODEL}:predict?key=${GEMINI_API_KEY.value()}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ instances: [{ prompt }], parameters: { sampleCount: 1, aspectRatio: '3:4' } }),
    }, 90000);
    const b64: string | undefined = data?.predictions?.[0]?.bytesBase64Encoded;
    if (!b64) { logger.warn('image: empty prediction', { id, cat }); res.status(502).json({ error: 'no image' }); return; }

    await file.save(Buffer.from(b64, 'base64'), { contentType: 'image/png', resumable: false });
    await file.makePublic();
    res.set('Cache-Control', 'public, max-age=31536000, immutable');
    res.json({ url: publicUrl });
  } catch (e) {
    logger.error('image error', e);
    res.status(500).json({ error: 'generation failed' });
  }
});

// ── reflection (Gemini text) ─────────────────────────────────────────────
export const reflection = onRequest({ secrets: [GEMINI_API_KEY], cors: true, timeoutSeconds: 30 }, async (req, res) => {
  if (gate(req, res)) return;
  try {
    const { ref, en, ko, cat, avoid } = req.body || {};
    if (!en && !ko) { res.status(400).json({ error: 'verse required' }); return; }
    const prompt =
      `You are a gentle reflection guide for a bilingual (English/Korean) daily Bible-verse app.\n` +
      `Write ONE short, open-ended reflection question (max 22 words) applying this verse to today.\n` +
      `Warm, non-prescriptive, no clichés. Theme: ${cat}. Verse (${ref}): EN "${en}" / KO "${ko}".` +
      `${avoidBlock(avoid)}\nReturn STRICT JSON only: {"en":"...","ko":"natural Korean ..."}`;
    const parsed = parseJson(await geminiText(GEMINI_API_KEY.value(), prompt));
    res.json({ en: parsed?.en ?? '', ko: parsed?.ko ?? '' });
  } catch (e) {
    logger.error('reflection error', e);
    res.status(500).json({ error: 'generation failed' });
  }
});

// ── studyguide (Gemini text) — generate once, store, re-serve (paid) ─────
export const studyguide = onRequest({ secrets: [GEMINI_API_KEY], cors: true, timeoutSeconds: 60 }, async (req, res) => {
  if (gate(req, res)) return;
  try {
    // Soft paid-gate: if a token is sent it must be a paid user; the client
    // also paywalls the Study Guide and only calls this for paid users.
    const user = await authedUser(req);
    if (user && user.plan && user.plan === 'free') { res.status(403).json({ error: 'paid only' }); return; }

    const id = safeId(req.body?.id);
    const { refEn, refKo, en, ko, avoid } = req.body || {};
    if (!id || (!en && !ko)) { res.status(400).json({ error: 'verse required' }); return; }

    const bucket = admin.storage().bucket();
    const path = `study-guides/${id}.json`;
    const file = bucket.file(path);

    const [exists] = await file.exists();
    if (exists) {
      const [buf] = await file.download();
      res.set('Cache-Control', 'public, max-age=86400').set('content-type', 'application/json').send(buf.toString());
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
    logger.error('studyguide error', e);
    res.status(500).json({ error: 'generation failed' });
  }
});

// ── RevenueCat webhook → Firestore + custom claim (subscription truth) ────
export const rcWebhook = onRequest({ secrets: [RC_WEBHOOK_SECRET], cors: false }, async (req, res) => {
  if (req.method !== 'POST') { res.status(405).send('POST only'); return; }
  try {
    const auth = req.header('authorization') || '';
    if (RC_WEBHOOK_SECRET.value() && auth !== `Bearer ${RC_WEBHOOK_SECRET.value()}`) { res.status(401).send('unauthorized'); return; }
    const ev = req.body?.event || {};
    const uid: string | undefined = ev.app_user_id;
    if (!uid) { res.status(400).send('no app_user_id'); return; }
    const entitlements: string[] = ev.entitlement_ids || [];
    const type: string = ev.type || '';
    const active = !['CANCELLATION', 'EXPIRATION'].includes(type) && entitlements.length > 0;
    const plan = entitlements.some((e) => /life/i.test(e)) ? 'lifetime' : active ? 'plus' : 'free';

    await admin.firestore().doc(`users/${uid}`).set({ plan, updatedAt: Date.now() }, { merge: true });
    try { await admin.auth().setCustomUserClaims(uid, { plan }); } catch { /* uid may be anonymous */ }
    res.json({ ok: true, plan });
  } catch (e) {
    logger.error('rcWebhook error', e);
    res.status(500).send('error');
  }
});

// ── Daily reminder push (server-driven) ──────────────────────────────────
// Sends an FCM push to every device that opted in. Devices register their
// token + reminder hour under users/{uid}.pushTokens[]; runs hourly and sends
// to those whose chosen hour matches (UTC bucket — refine per-tz as needed).
export const dailyReminder = onSchedule({ schedule: '0 * * * *', timeZone: 'Etc/UTC' }, async () => {
  const hour = new Date().getUTCHours();
  const snap = await admin.firestore().collection('users').where('reminderHourUtc', '==', hour).where('notifications', '==', true).get();
  const tokens: string[] = [];
  snap.forEach((d) => { const t = d.get('pushToken'); if (typeof t === 'string') tokens.push(t); });
  if (!tokens.length) return;
  await admin.messaging().sendEachForMulticast({
    tokens,
    notification: { title: 'VerseBite', body: 'Your verse for today is ready — take a quiet moment.' },
  });
  logger.info(`dailyReminder sent to ${tokens.length} devices`);
});
