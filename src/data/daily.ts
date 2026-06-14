// Daily verse-set pipeline + signup-date gating. Ported from vb-daily.jsx.
import { CATEGORIES, vbVersesByCat } from './content';

export const FREE_PER_CAT = 1;
export const PAID_PER_CAT = 5;

export function dateKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const a = arr.slice();
  let s = seed >>> 0;
  for (let i = a.length - 1; i > 0; i--) {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    const j = s % (i + 1);
    const t = a[i];
    a[i] = a[j];
    a[j] = t;
  }
  return a;
}

export function dailyForCat(key: string, catId: string, count: number): string[] {
  const pool = vbVersesByCat(catId);
  if (!pool.length) return [];
  const shuffled = seededShuffle(pool, hash(key + ':' + catId));
  const n = Math.min(count, shuffled.length);
  return shuffled.slice(0, n).map((v) => v.id);
}

export function dailyAll(key: string, perCat: number) {
  return CATEGORIES.map((c) => ({ cat: c, verseIds: dailyForCat(key, c.id, perCat) }));
}

// deterministic daily pick from preferred categories (matches pickDaily in vb-app.jsx)
export function pickDaily(prefCats?: string[]): string {
  const { VERSES } = require('./content') as typeof import('./content');
  const pool = prefCats && prefCats.length ? VERSES.filter((v) => prefCats.includes(v.cat)) : VERSES;
  const arr = pool.length ? pool : VERSES;
  const day = Math.floor(Date.now() / 86400000);
  return arr[day % arr.length].id;
}

export function shortDate(d: Date = new Date()): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
