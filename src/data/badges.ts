// Achievements: 20 MVP badges + progress engine. Ported from vb-badges.jsx.
import { vbVerse } from './content';

export type Badge = { id: string; group: string; icon: string; target: number };

export const BADGES: Badge[] = [
  { id: 'first_light', group: 'rhythm', icon: 'sun', target: 1 },
  { id: 'morning', group: 'rhythm', icon: 'sun', target: 3 },
  { id: 'rhythm7', group: 'rhythm', icon: 'calendar', target: 7 },
  { id: 'rhythm30', group: 'rhythm', icon: 'calendar', target: 30 },
  { id: 'first_saved', group: 'saved', icon: 'bookmark', target: 1 },
  { id: 'treasure', group: 'saved', icon: 'bookmark', target: 10 },
  { id: 'keeper', group: 'saved', icon: 'bookmark', target: 50 },
  { id: 'hundred', group: 'saved', icon: 'bookmark', target: 100 },
  { id: 'first_note', group: 'journal', icon: 'note', target: 1 },
  { id: 'thoughtful', group: 'journal', icon: 'note', target: 10 },
  { id: 'quiet_journal', group: 'journal', icon: 'note', target: 30 },
  { id: 'first_study', group: 'study', icon: 'quote', target: 1 },
  { id: 'context_seeker', group: 'study', icon: 'quote', target: 10 },
  { id: 'scripture', group: 'study', icon: 'quote', target: 50 },
  { id: 'first_word', group: 'learn', icon: 'globe', target: 1 },
  { id: 'word_collector', group: 'learn', icon: 'globe', target: 25 },
  { id: 'bilingual', group: 'learn', icon: 'globe', target: 30 },
  { id: 'first_share', group: 'share', icon: 'share', target: 1 },
  { id: 'messenger', group: 'share', icon: 'share', target: 10 },
  { id: 'full_garden', group: 'category', icon: 'sparkle', target: 9 },
];

export type BadgeState = {
  saved: Record<string, { note?: string; cat?: string }>;
  words: Record<string, unknown>;
  journal: Record<string, { reflection?: string; study?: string; gratitude?: string }>;
  resonance: Record<string, string>;
  counts: { opens?: number; studyOpens?: number; shares?: number; daysOpened?: string[]; morningDays?: string[]; bilingualDays?: string[]; streak?: number };
};

function badgeValue(badge: Badge, s: BadgeState): number {
  const savedArr = Object.values(s.saved || {});
  const noteCount = savedArr.filter((v) => v.note && v.note.trim()).length;
  const journalArr = Object.values(s.journal || {});
  const studyJournalCount = journalArr.filter((j) => j.study && j.study.trim()).length;
  const reflectCount = journalArr.filter((j) => j.reflection && j.reflection.trim()).length;
  const resoDays = Object.keys(s.resonance || {}).length;
  const c = s.counts || {};
  switch (badge.id) {
    case 'first_light': return Math.min(c.opens || 0, 1) || ((c.daysOpened || []).length ? 1 : 0);
    case 'morning': return (c.morningDays || []).length;
    case 'rhythm7': return c.streak || 0;
    case 'rhythm30': return c.streak || 0;
    case 'first_saved': return savedArr.length >= 1 ? 1 : 0;
    case 'treasure': return savedArr.length;
    case 'keeper': return savedArr.length;
    case 'hundred': return savedArr.length;
    case 'first_note': return noteCount + reflectCount >= 1 ? 1 : 0;
    case 'thoughtful': return noteCount + reflectCount;
    case 'quiet_journal': return noteCount + reflectCount + studyJournalCount;
    case 'first_study': return (c.studyOpens || 0) >= 1 ? 1 : 0;
    case 'context_seeker': return c.studyOpens || 0;
    case 'scripture': return c.studyOpens || 0;
    case 'first_word': return Object.keys(s.words || {}).length >= 1 ? 1 : 0;
    case 'word_collector': return Object.keys(s.words || {}).length;
    case 'bilingual': return (c.bilingualDays || []).length || resoDays;
    case 'first_share': return (c.shares || 0) >= 1 ? 1 : 0;
    case 'messenger': return c.shares || 0;
    case 'full_garden': {
      const setCats = new Set<string>();
      Object.keys(s.saved || {}).forEach((id) => {
        const v = vbVerse(id);
        if (v) setCats.add(v.cat);
      });
      return setCats.size;
    }
    default: return 0;
  }
}

export type BadgeProgress = { badge: Badge; value: number; target: number; unlocked: boolean; pct: number };

export function badgeProgress(state: BadgeState): BadgeProgress[] {
  return BADGES.map((b) => {
    const value = Math.min(badgeValue(b, state), b.target);
    const unlocked = value >= b.target;
    return { badge: b, value, target: b.target, unlocked, pct: Math.round((value / b.target) * 100) };
  });
}

export const BADGE_GROUPS = [
  { id: 'rhythm', ids: ['first_light', 'morning', 'rhythm7', 'rhythm30'] },
  { id: 'saved', ids: ['first_saved', 'treasure', 'keeper', 'hundred'] },
  { id: 'journal', ids: ['first_note', 'thoughtful', 'quiet_journal'] },
  { id: 'study', ids: ['first_study', 'context_seeker', 'scripture'] },
  { id: 'learn', ids: ['first_word', 'word_collector', 'bilingual'] },
  { id: 'share', ids: ['first_share', 'messenger'] },
  { id: 'category', ids: ['full_garden'] },
];
