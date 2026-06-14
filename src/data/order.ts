import { Verse } from './content';

export type Line = { lang: 'en' | 'ko'; text: string; ref: string };

/** Returns [primary, secondary] verse lines for the chosen display order. */
export function vbOrder(verse: Verse, order: 'en' | 'ko'): [Line, Line] {
  const en: Line = { lang: 'en', text: verse.en, ref: verse.refEn };
  const ko: Line = { lang: 'ko', text: verse.ko, ref: verse.refKo };
  return order === 'ko' ? [ko, en] : [en, ko];
}
