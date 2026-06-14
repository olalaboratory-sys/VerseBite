// AI reflection generation. Calls a Firebase Function (Gemini) so the key stays
// server-side. Returns null when unconfigured or on any error, so the UI falls
// back to the authored static question.
import { CONFIG } from '@/config';
import { Verse } from '@/data/content';

export type Reflection = { en: string; ko: string };

export async function fetchReflection(verse: Verse, avoid: string[] = []): Promise<Reflection | null> {
  if (!CONFIG.aiEndpoint) return null;
  try {
    const res = await fetch(CONFIG.aiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ref: verse.refEn, en: verse.en, ko: verse.ko, cat: verse.cat, avoid }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as Partial<Reflection>;
    if (!data.en && !data.ko) return null;
    return { en: data.en ?? '', ko: data.ko ?? '' };
  } catch {
    return null;
  }
}
