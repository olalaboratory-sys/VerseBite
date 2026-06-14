// vb-daily.jsx — daily verse-set pipeline + login-date gating.
// Simulates a server pre-generating, per day per category, a fixed set of
// verse+image+study metadata. Free users see 1/category/day, paid see 5/category/day.
// Exports: VB_FREE_PER_CAT, VB_PAID_PER_CAT, vbDateKey, vbDailyForCat, vbDailyAll,
//          vbSignupDate, vbDaysList

const VB_FREE_PER_CAT = 1;
const VB_PAID_PER_CAT = 5;

// YYYY-MM-DD in local time
function vbDateKey(d = new Date()) {
  const y = d.getFullYear(), m = String(d.getMonth()+1).padStart(2,'0'), day = String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${day}`;
}

// deterministic hash from a string
function vbHash(str) {
  let h = 2166136261;
  for (let i=0;i<str.length;i++){ h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0);
}

// seeded shuffle (Fisher–Yates with a tiny LCG)
function vbSeededShuffle(arr, seed) {
  const a = arr.slice(); let s = seed >>> 0;
  for (let i=a.length-1;i>0;i--){ s = (Math.imul(s, 1664525) + 1013904223) >>> 0; const j = s % (i+1); const t=a[i]; a[i]=a[j]; a[j]=t; }
  return a;
}

// The pre-generated set for a given date + category (deterministic).
// Returns up to `count` verse ids, stable for that date.
function vbDailyForCat(dateKey, catId, count) {
  const pool = window.vbVersesByCat(catId);
  if (!pool.length) return [];
  const shuffled = vbSeededShuffle(pool, vbHash(dateKey + ':' + catId));
  const n = Math.min(count, shuffled.length);
  return shuffled.slice(0, n).map(v => v.id);
}

// The full day's set across all categories (free 1 / paid 5 each).
function vbDailyAll(dateKey, perCat) {
  return window.VB_CATEGORIES.map(c => ({ cat: c, verseIds: vbDailyForCat(dateKey, c.id, perCat) }));
}

// signup/login date — only days on/after this are viewable in the calendar
function vbSignupDate() {
  const s = localStorage.getItem('vb_signup');
  if (s) return s.replace(/"/g,'');
  // not recorded yet → install date is today; record it so it persists
  const today = vbDateKey();
  try { localStorage.setItem('vb_signup', JSON.stringify(today)); } catch(e){}
  return today;
}

Object.assign(window, { VB_FREE_PER_CAT, VB_PAID_PER_CAT, vbDateKey, vbHash, vbDailyForCat, vbDailyAll, vbSignupDate });
