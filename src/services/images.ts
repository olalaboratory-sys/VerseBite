// Verse imagery.
//  • imageFor(verse)      — immediate fallback (static CDN if set, else Unsplash).
//  • generateImage(verse) — on-demand AI art via the Gemini proxy (server-side key).
// The card shows the fallback instantly, then swaps to the generated image when ready.
import { CONFIG } from '@/config';
import { Verse } from '@/data/content';

export function imageFor(verse: Verse): string {
  if (CONFIG.imageBase) return `${CONFIG.imageBase.replace(/\/$/, '')}/${verse.cat}/${verse.id}.jpg`;
  return verse.img;
}

/**
 * Ask the backend to generate a fresh cinematic image for this verse.
 * `seed` lets callers force a distinct image (so two verses never collide).
 * Returns an image URL / data-URI, or null when unconfigured or on error.
 */
export async function generateImage(verse: Verse, seed: number): Promise<string | null> {
  if (!CONFIG.imageEndpoint) return null;
  try {
    const res = await fetch(CONFIG.imageEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: verse.id, cat: verse.cat, ref: verse.refEn, en: verse.en, seed }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { image?: string; url?: string };
    return data.image || data.url || null;
  } catch {
    return null;
  }
}
