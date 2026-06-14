// AI study-guide generation. Calls a server proxy that produces the full
// bilingual study metadata for a verse and stores it durably. Returns null
// when unconfigured or on error, so the UI falls back to the authored guide.
import { CONFIG } from '@/config';
import { Verse } from '@/data/content';
import { StudyVerse, StudyCat } from '@/data/studyData';

export type GeneratedGuide = StudyVerse & StudyCat;

const REQUIRED: (keyof GeneratedGuide)[] = ['pEn', 'pKo', 'ctxEn', 'ctxKo', 'keyEn', 'keyKo', 'reflectEn', 'reflectKo', 'applyEn', 'applyKo', 'prayerEn', 'prayerKo'];

export async function fetchStudyGuide(verse: Verse, avoid: string[] = []): Promise<GeneratedGuide | null> {
  if (!CONFIG.studyEndpoint) return null;
  try {
    const res = await fetch(CONFIG.studyEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: verse.id, cat: verse.cat, refEn: verse.refEn, refKo: verse.refKo, en: verse.en, ko: verse.ko, avoid }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as Partial<GeneratedGuide>;
    if (!REQUIRED.every((k) => data[k] != null)) return null;
    return data as GeneratedGuide;
  } catch {
    return null;
  }
}
