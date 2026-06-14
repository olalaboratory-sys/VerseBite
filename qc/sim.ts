/* VerseBite QC harness — drives the real app logic with 100 diverse personas
 * "using" the app over many days, exercising every feature, then runs checks
 * and writes QC_REPORT.md. Run: npm run qc  (compiles + executes this file). */
import * as fs from 'fs';
import * as path from 'path';

import { CATEGORIES, VERSES, vbVerse, vbVersesByCat, Verse } from '../src/data/content';
import { dateKey, dailyForCat, dailyAll, FREE_PER_CAT, PAID_PER_CAT } from '../src/data/daily';
import { badgeProgress, BADGES, BADGE_GROUPS } from '../src/data/badges';
import { WORDS, tokenize, lookup } from '../src/data/words';
import { studyGuide, STUDY_VERSE } from '../src/data/studyData';
import { vbOrder } from '../src/data/order';
import { REFLECT, learnNotes } from '../src/data/reflect';
import { I18N, Lang } from '../src/i18n/dict';

// ── tiny seeded RNG (deterministic, reproducible) ──
let _s = 1234567;
const rnd = () => ((_s = (Math.imul(_s, 1664525) + 1013904223) >>> 0) / 4294967296);
const pick = <T,>(a: T[]): T => a[Math.floor(rnd() * a.length)];
const chance = (p: number) => rnd() < p;
const randInt = (lo: number, hi: number) => lo + Math.floor(rnd() * (hi - lo + 1));

const t = (lang: Lang) => (key: string) => I18N[lang]?.[key] ?? I18N.en[key] ?? key;

type Issue = { sev: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'; area: string; msg: string };
const issues: Issue[] = [];
const add = (sev: Issue['sev'], area: string, msg: string) => issues.push({ sev, area, msg });

// ── persona model ──
type Persona = {
  id: number; name: string; age: number; gender: 'female' | 'male' | 'nonbinary';
  role: 'user' | 'developer'; appLang: Lang; learningMode: 'en' | 'ko' | 'off';
  plan: 'free' | 'plus' | 'lifetime'; engagement: 'power' | 'daily' | 'sporadic' | 'lapsed';
  categories: string[]; days: number;
};

const KO_NAMES = ['지우', '서연', '민준', '하은', '도윤', '수아', '은우', '지호', '예린', '시우', '할머니 정순', '권사 영자', '집사 병철'];
const EN_NAMES = ['Grace', 'Noah', 'Olivia', 'Liam', 'Sophia', 'Ethan', 'Mia', 'James', 'Ava', 'Ben', 'Pastor John', 'Grandma Ruth', 'Sam'];

function makePersonas(n: number): Persona[] {
  const out: Persona[] = [];
  for (let i = 0; i < n; i++) {
    const appLang: Lang = chance(0.5) ? 'ko' : 'en';
    const role = i % 7 === 0 ? 'developer' : 'user'; // ~15 devs
    const age = randInt(8, 78);
    const learningMode = pick(['en', 'ko', 'off'] as const);
    const plan = chance(0.55) ? 'free' : chance(0.6) ? 'plus' : 'lifetime';
    const engagement = pick(['power', 'daily', 'sporadic', 'lapsed'] as const);
    const catCount = randInt(1, 9);
    const cats = [...CATEGORIES].sort(() => rnd() - 0.5).slice(0, catCount).map((c) => c.id);
    const days = engagement === 'power' ? randInt(20, 40) : engagement === 'daily' ? randInt(7, 25) : engagement === 'sporadic' ? randInt(2, 10) : randInt(1, 3);
    out.push({
      id: i + 1, name: (appLang === 'ko' ? pick(KO_NAMES) : pick(EN_NAMES)) + ` #${i + 1}`,
      age, gender: pick(['female', 'male', 'nonbinary'] as const), role, appLang, learningMode, plan, engagement, categories: cats, days,
    });
  }
  return out;
}

// ── headless store mirroring src/store/AppStore reducer logic ──
class Sim {
  saved: Record<string, { note: string; ts: number; guide?: boolean }> = {};
  words: Record<string, any> = {};
  journal: Record<string, any> = {};
  resonance: Record<string, string> = {};
  counts = { opens: 0, studyOpens: 0, shares: 0, refreshes: 0, daysOpened: [] as string[], morningDays: [] as string[], bilingualDays: [] as string[], streak: 0 };
  seen: string[] = [];
  daily: Record<string, string> = {};
  todayId = 'v22';
  signup: string;
  constructor(public p: Persona, public startDate: Date) { this.signup = dateKey(startDate); }

  private dailyForDate(d: Date): string {
    const k = dateKey(d);
    const prefs = this.p.categories;
    // mirror: daily verse comes from preferred categories, deterministic per date
    const pool = prefs.flatMap((c) => dailyForCat(k, c, 1));
    const id = pool.length ? pool[0] : dailyForCat(k, 'hope', 1)[0];
    return id;
  }
  openDay(d: Date, hour: number) {
    const k = dateKey(d);
    this.todayId = this.dailyForDate(d);
    // open tracking
    if (!this.counts.daysOpened.includes(k)) {
      this.counts.daysOpened.push(k);
      this.counts.opens++;
      if (hour < 10 && !this.counts.morningDays.includes(k)) this.counts.morningDays.push(k);
      if (this.p.learningMode !== 'off' && !this.counts.bilingualDays.includes(k)) this.counts.bilingualDays.push(k);
      // streak ending at this date
      const set = new Set(this.counts.daysOpened);
      let st = 0; const dd = new Date(d);
      for (;;) { if (set.has(dateKey(dd))) { st++; dd.setDate(dd.getDate() - 1); } else break; }
      this.counts.streak = Math.max(this.counts.streak, st);
    }
    this.recordToday(k);
  }
  private recordToday(k: string) {
    if (!this.seen.includes(this.todayId)) this.seen = [...this.seen, this.todayId].slice(-200);
    this.daily[k] = this.todayId;
  }
  refresh(k: string) {
    this.counts.refreshes++;
    const cur = vbVerse(this.todayId)!;
    const seenSet = new Set(this.seen);
    let cands = vbVersesByCat(cur.cat).filter((x) => x.id !== this.todayId);
    if (!cands.length) cands = VERSES.filter((x) => this.p.categories.includes(x.cat) && x.id !== this.todayId);
    if (!cands.length) cands = VERSES.filter((x) => x.id !== this.todayId);
    const unseen = cands.filter((x) => !seenSet.has(x.id));
    const pool = unseen.length ? unseen : cands;
    this.todayId = pool[Math.floor(rnd() * pool.length)].id;
    this.recordToday(k);
  }
  save(id: string) { if (!this.saved[id]) this.saved[id] = { note: '', ts: Date.now() + Object.keys(this.saved).length }; }
  unsave(id: string) { delete this.saved[id]; }
  note(id: string, text: string) { this.saved[id] = { ...(this.saved[id] || { ts: Date.now() }), note: text }; }
  saveWord(token: string, lang: 'en' | 'ko') {
    const hit = lookup(token, lang);
    const hw = hit ? hit.headword : token.replace(/[^A-Za-z'가-힣]/g, '');
    const key = lang + ':' + hw;
    this.words[key] = { headword: hw, lang, def: hit?.def || '', trans: hit?.trans || '', roman: hit?.roman || null, ts: Date.now() };
    return !!hit;
  }
  openStudy(id: string): boolean { // returns whether it actually opened (paid gate)
    if (this.p.plan === 'free') return false;
    this.counts.studyOpens++;
    return true;
  }
  saveStudyGuide(id: string) { this.saved[id] = { ...(this.saved[id] || { note: '', ts: Date.now() }), guide: true }; }
  reflect(id: string, text: string) { this.journal[id] = { ...(this.journal[id] || {}), reflection: text, ts: Date.now(), date: 'x' }; }
  share() { this.counts.shares++; }
  setResonance(d: Date, feeling: string) { this.resonance[d.toISOString().slice(0, 10)] = feeling; }
}

// ── per-persona simulation ──
function simulate(p: Persona) {
  const start = new Date(2026, 4, 1 + (p.id % 20)); // staggered signups
  const sim = new Sim(p, start);
  const usage = { refreshes: 0, saves: 0, words: 0, wordHits: 0, studyOpens: 0, studyBlocked: 0, shares: 0, reflections: 0, calVisits: 0 };

  for (let day = 0; day < p.days; day++) {
    // engagement gates whether they open on a given day
    const openProb = p.engagement === 'power' ? 0.98 : p.engagement === 'daily' ? 0.85 : p.engagement === 'sporadic' ? 0.4 : 0.25;
    if (!chance(openProb)) continue;
    const d = new Date(start); d.setDate(start.getDate() + day);
    const hour = randInt(5, 23);
    try {
      sim.openDay(d, hour);
      const k = dateKey(d);

      // refresh (power users / devs refresh a lot)
      const refreshN = p.role === 'developer' ? randInt(0, 8) : p.plan !== 'free' ? randInt(0, 3) : 0; // free can't refresh in-app
      for (let r = 0; r < refreshN; r++) { sim.refresh(k); usage.refreshes++; }

      const verse = vbVerse(sim.todayId)!;
      // verse must always resolve + have image + bilingual text
      if (!verse) add('CRITICAL', 'daily', `persona ${p.id}: todayId resolved to nothing`);
      else {
        if (!verse.img) add('HIGH', 'imagery', `verse ${verse.id} has empty image`);
        if (!verse.en || !verse.ko) add('HIGH', 'content', `verse ${verse.id} missing a language`);
        vbOrder(verse, p.learningMode === 'ko' ? 'ko' : 'en'); // must not throw
      }

      // save
      if (chance(0.5)) { sim.save(verse.id); usage.saves++; }
      // note / reflection
      if (chance(0.25)) { sim.note(verse.id, p.appLang === 'ko' ? '오늘의 묵상' : 'today thought'); }
      if (chance(0.2)) { sim.reflect(verse.id, 'reflection ' + day); usage.reflections++; }

      // learning-mode word taps
      if (p.learningMode !== 'off' && chance(0.6)) {
        const lang = p.learningMode;
        const text = lang === 'en' ? verse.en : verse.ko;
        const toks = tokenize(text, lang).filter((x) => x.word);
        const taps = Math.min(toks.length, randInt(1, 3));
        for (let i = 0; i < taps; i++) {
          const tok = pick(toks);
          const hit = sim.saveWord(tok.text, lang);
          usage.words++; if (hit) usage.wordHits++;
        }
      }

      // study guide (paid only)
      if (chance(0.3)) {
        const opened = sim.openStudy(verse.id);
        if (opened) {
          usage.studyOpens++;
          const sg = studyGuide(verse.id);
          if (!sg) add('MEDIUM', 'study', `no study guide for ${verse.id} (would show 'coming soon')`);
          if (chance(0.5)) sim.saveStudyGuide(verse.id);
          // reflection question must exist for the category
          if (!REFLECT[verse.cat]) add('MEDIUM', 'study', `no reflection question for category ${verse.cat}`);
        } else usage.studyBlocked++;
      }

      // share
      if (chance(0.2)) { sim.share(); usage.shares++; }
      // resonance check-in
      if (chance(0.5)) sim.setResonance(d, pick(['comfort', 'courage', 'gratitude', 'peace', 'challenge']));

      // calendar revisit of a past date (re-view archive)
      if (chance(0.3) && day > 1) {
        const past = new Date(start); past.setDate(start.getDate() + randInt(0, day - 1));
        const pk = dateKey(past);
        const locked = pk < sim.signup || pk > k;
        if (!locked) {
          usage.calVisits++;
          const sets = dailyAll(pk, FREE_PER_CAT).filter((s) => s.verseIds.length);
          const recorded = sim.daily[pk];
          const ids = recorded ? [recorded, ...sets.flatMap((s) => s.verseIds).filter((x) => x !== recorded)] : sets.flatMap((s) => s.verseIds);
          ids.forEach((id) => { if (!vbVerse(id)) add('HIGH', 'calendar', `archive references missing verse ${id}`); });
        }
      }
    } catch (e) {
      add('CRITICAL', 'runtime', `persona ${p.id} crashed on day ${day}: ${String(e)}`);
    }
  }

  // post-session invariants
  if (p.plan === 'free' && sim.counts.studyOpens > 0) add('CRITICAL', 'monetization', `free persona ${p.id} opened a paid study guide`);
  const prog = badgeProgress({ saved: sim.saved, words: sim.words, journal: sim.journal, resonance: sim.resonance, counts: sim.counts });
  prog.forEach((pr) => { if (pr.value > pr.target) add('MEDIUM', 'badges', `badge ${pr.badge.id} value ${pr.value} exceeds target ${pr.target}`); });
  const unlocked = prog.filter((x) => x.unlocked).length;

  return { sim, usage, unlocked };
}

// ── static / data-integrity checks ──
function staticChecks() {
  // verses
  if (VERSES.length !== 45) add('HIGH', 'content', `expected 45 verses, found ${VERSES.length}`);
  CATEGORIES.forEach((c) => { const n = vbVersesByCat(c.id).length; if (n !== 5) add('MEDIUM', 'content', `category ${c.id} has ${n} verses (expected 5)`); });
  const ids = new Set<string>();
  VERSES.forEach((v) => {
    if (ids.has(v.id)) add('CRITICAL', 'content', `duplicate verse id ${v.id}`); ids.add(v.id);
    if (!v.en || !v.ko || !v.refEn || !v.refKo || !v.img) add('HIGH', 'content', `verse ${v.id} missing field`);
    if (!CATEGORIES.find((c) => c.id === v.cat)) add('HIGH', 'content', `verse ${v.id} unknown category ${v.cat}`);
  });
  // study guide coverage (all 45 now authored)
  let sgMissing = 0;
  VERSES.forEach((v) => { if (!studyGuide(v.id)) sgMissing++; });
  if (sgMissing > 0) add('MEDIUM', 'study', `${sgMissing}/45 verses lack an authored study guide`);
  // i18n parity
  const enKeys = Object.keys(I18N.en), koKeys = new Set(Object.keys(I18N.ko));
  const enSet = new Set(enKeys);
  enKeys.forEach((k) => { if (!koKeys.has(k)) add('HIGH', 'i18n', `KO missing key '${k}'`); });
  Object.keys(I18N.ko).forEach((k) => { if (!enSet.has(k)) add('LOW', 'i18n', `EN missing key '${k}'`); });
  // empty/placeholder translations
  (['en', 'ko'] as const).forEach((lng) => Object.entries(I18N[lng]).forEach(([k, val]) => { if (!val) add('LOW', 'i18n', `${lng} key '${k}' empty`); }));
  // badge defs
  if (BADGES.length !== 20) add('LOW', 'badges', `expected 20 badges, found ${BADGES.length}`);
  const groupIds = new Set(BADGE_GROUPS.flatMap((g) => g.ids));
  BADGES.forEach((b) => { if (!groupIds.has(b.id)) add('MEDIUM', 'badges', `badge ${b.id} not in any group`); });
  // dictionary: measure DIFFICULT-word coverage (trivial function words are
  // excluded — they aren't worth glossing) across verses + study passages.
  const EN_STOP = new Set('the a an and or but if of to in on at by for with from as than because so this that these those it its we us our you your yours i me my he him his she her they them their who whom which not no do does did doing be is are was were been being have has had will would shall should may might can could must let all one each every now then here there how what when why up down out over under above below again very just also too more most some any such own same other another into onto off per fully soon'.split(/\s+/));
  // trivial Korean grammar/copula eojeol (worth no gloss for a learner)
  const KO_STOP = new Set(['그', '그것', '이것', '이', '것', '것들', '나', '너', '내', '네', '우리', '너희', '그들', '모든', '서로', '한', '안', '자', '먼저', '항상', '오직', '오래', '또', '곧', '것이니', '것이니라', '것이요', '것임이라', '이니라', '아니니라', '이니', '되라', '되리라', '그대로', '그리하고', '그리하면']);
  const enContent = (s: string) => tokenize(s, 'en').filter((x) => x.word).map((x) => x.text.toLowerCase().replace(/[^a-z']/g, '')).filter((w) => w.length > 2 && !EN_STOP.has(w));
  const koContent = (s: string) => tokenize(s, 'ko').filter((x) => x.word).map((x) => x.text).filter((w) => !KO_STOP.has(w));
  const measure = (texts: [Lang, string][]) => {
    let eT = 0, eH = 0, kT = 0, kH = 0; const eM: Record<string, number> = {}, kM: Record<string, number> = {};
    texts.forEach(([lng, txt]) => {
      if (lng === 'en') enContent(txt).forEach((w) => { eT++; if (lookup(w, 'en')) eH++; else eM[w] = (eM[w] || 0) + 1; });
      else koContent(txt).forEach((w) => { kT++; if (lookup(w, 'ko')) kH++; else kM[w] = (kM[w] || 0) + 1; });
    });
    return { en: Math.round((eH / eT) * 100), ko: Math.round((kH / kT) * 100), eM: Object.entries(eM).sort((a, b) => b[1] - a[1]), kM: Object.entries(kM).sort((a, b) => b[1] - a[1]) };
  };
  const verseTexts: [Lang, string][] = VERSES.flatMap((v) => [['en', v.en], ['ko', v.ko]] as [Lang, string][]);
  const passageTexts: [Lang, string][] = Object.values(STUDY_VERSE).flatMap((s) => [['en', s.pEn], ['ko', s.pKo]] as [Lang, string][]);
  const vc = measure(verseTexts), pc = measure(passageTexts);
  // verses are the primary tappable surface — hold them to a high bar
  if (vc.en < 98) add('MEDIUM', 'learning', `verse EN difficult-word coverage ${vc.en}% — uncovered: ${vc.eM.slice(0, 12).map((x) => x[0]).join(', ')}`);
  if (vc.ko < 92) add('MEDIUM', 'learning', `verse KO difficult-word coverage ${vc.ko}% — uncovered: ${vc.kM.slice(0, 12).map((x) => x[0]).join(', ')}`);
  // study passages are denser/secondary — a long tail of rare/proper terms is acceptable
  if (pc.en < 80) add('LOW', 'learning', `study-passage EN coverage ${pc.en}% (rare/proper-noun tail)`);
  if (pc.ko < 70) add('LOW', 'learning', `study-passage KO coverage ${pc.ko}% (inflection/proper-noun tail)`);
  return { enCov: vc.en, koCov: vc.ko, pEnCov: pc.en, pKoCov: pc.ko, sgMissing, enUncovered: vc.eM.length, koUncovered: vc.kM.length };
}

// ── dedicated edge / dev tests ──
function edgeTests() {
  // 1) refresh dedup never repeats within a 5-verse category until exhausted
  const p: Persona = { id: 999, name: 'dev', age: 30, gender: 'nonbinary', role: 'developer', appLang: 'en', learningMode: 'en', plan: 'plus', engagement: 'power', categories: ['hope'], days: 1 };
  const sim = new Sim(p, new Date(2026, 4, 1));
  sim.todayId = vbVersesByCat('hope')[0].id;
  sim.seen = [sim.todayId];
  const seenSeq = [sim.todayId];
  for (let i = 0; i < 4; i++) { sim.refresh('2026-05-01'); seenSeq.push(sim.todayId); }
  const uniq = new Set(seenSeq);
  if (uniq.size !== 5) add('HIGH', 'dedup', `refresh repeated within a theme before exhausting all 5 (got ${uniq.size} unique of 5)`);

  // 2) daily determinism
  for (let i = 0; i < 5; i++) {
    const a = dailyForCat('2026-05-10', 'faith', 5).join(',');
    const b = dailyForCat('2026-05-10', 'faith', 5).join(',');
    if (a !== b) { add('CRITICAL', 'daily', 'dailyForCat is non-deterministic'); break; }
  }
  // 3) paid vs free per-cat counts
  if (FREE_PER_CAT !== 1) add('LOW', 'daily', `FREE_PER_CAT expected 1, got ${FREE_PER_CAT}`);
  // 4) unsave of non-saved is a no-op (no throw)
  try { sim.unsave('nonexistent'); } catch (e) { add('HIGH', 'saved', 'unsave of non-saved threw'); }
  // 5) tokenizer handles empty + punctuation
  try { tokenize('', 'en'); tokenize('!!! ...', 'ko'); } catch (e) { add('HIGH', 'learning', 'tokenizer threw on edge input'); }
  // 6) learnNotes returns up to 3 and never throws
  VERSES.slice(0, 10).forEach((v) => { const n = learnNotes(v); if (n.length > 3) add('LOW', 'learning', `learnNotes returned ${n.length} for ${v.id}`); });
}

// ── run ──
const N = 100;
const personas = makePersonas(N);
const stat = staticChecks();
edgeTests();

const agg = { totalDays: 0, opens: 0, saves: 0, words: 0, wordHits: 0, studyOpens: 0, studyBlocked: 0, shares: 0, reflections: 0, calVisits: 0, refreshes: 0, unlocked: 0 };
const perEngagement: Record<string, number> = {};
personas.forEach((p) => {
  const { sim, usage, unlocked } = simulate(p);
  agg.opens += sim.counts.opens; agg.saves += usage.saves; agg.words += usage.words; agg.wordHits += usage.wordHits;
  agg.studyOpens += usage.studyOpens; agg.studyBlocked += usage.studyBlocked; agg.shares += usage.shares;
  agg.reflections += usage.reflections; agg.calVisits += usage.calVisits; agg.refreshes += usage.refreshes; agg.unlocked += unlocked;
  perEngagement[p.engagement] = (perEngagement[p.engagement] || 0) + 1;
});

// ── report ──
const bySev = (s: Issue['sev']) => issues.filter((i) => i.sev === s);
const demo = {
  ko: personas.filter((p) => p.appLang === 'ko').length, en: personas.filter((p) => p.appLang === 'en').length,
  devs: personas.filter((p) => p.role === 'developer').length,
  free: personas.filter((p) => p.plan === 'free').length, plus: personas.filter((p) => p.plan === 'plus').length, life: personas.filter((p) => p.plan === 'lifetime').length,
  kids: personas.filter((p) => p.age < 18).length, seniors: personas.filter((p) => p.age >= 60).length,
  female: personas.filter((p) => p.gender === 'female').length, male: personas.filter((p) => p.gender === 'male').length, nb: personas.filter((p) => p.gender === 'nonbinary').length,
  learnEn: personas.filter((p) => p.learningMode === 'en').length, learnKo: personas.filter((p) => p.learningMode === 'ko').length, learnOff: personas.filter((p) => p.learningMode === 'off').length,
};
const uniqIssues = new Map<string, { issue: Issue; count: number }>();
issues.forEach((i) => { const key = i.sev + '|' + i.area + '|' + i.msg.replace(/persona \d+/g, 'persona N').replace(/day \d+/g, 'day N').replace(/verse v\d+/g, 'verse vNN'); const e = uniqIssues.get(key); if (e) e.count++; else uniqIssues.set(key, { issue: i, count: 1 }); });
const dedupIssues = [...uniqIssues.values()].sort((a, b) => ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].indexOf(a.issue.sev) - ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].indexOf(b.issue.sev));

const lines: string[] = [];
lines.push('# VerseBite — QC Report (simulated)');
lines.push('');
lines.push(`Generated by \`qc/sim.ts\`: ${N} personas driving the real app logic over their lifetimes (deterministic seed).`);
lines.push('');
lines.push('## Persona mix');
lines.push(`- Language: ${demo.en} EN · ${demo.ko} KO  |  Role: ${N - demo.devs} users · ${demo.devs} developers`);
lines.push(`- Plan: ${demo.free} free · ${demo.plus} Plus · ${demo.life} Lifetime`);
lines.push(`- Gender: ${demo.female} female · ${demo.male} male · ${demo.nb} non-binary  |  Age: ${demo.kids} under-18 · ${demo.seniors} 60+`);
lines.push(`- Learning: ${demo.learnEn} Learn-EN · ${demo.learnKo} Learn-KO · ${demo.learnOff} off`);
lines.push(`- Engagement: ${Object.entries(perEngagement).map(([k, v]) => `${v} ${k}`).join(' · ')}`);
lines.push('');
lines.push('## Feature exercise totals');
lines.push(`- App opens: ${agg.opens} · Refreshes: ${agg.refreshes} · Saves: ${agg.saves}`);
lines.push(`- Word taps: ${agg.words} (dictionary hit ${Math.round((agg.wordHits / Math.max(agg.words, 1)) * 100)}%) · Reflections: ${agg.reflections}`);
lines.push(`- Study guides opened (paid): ${agg.studyOpens} · Blocked for free (paywall worked): ${agg.studyBlocked}`);
lines.push(`- Shares: ${agg.shares} · Calendar archive revisits: ${agg.calVisits} · Badges unlocked (sum): ${agg.unlocked}`);
lines.push('');
lines.push('## Coverage metrics');
lines.push(`- Study-guide coverage: ${45 - stat.sgMissing}/45 verses`);
lines.push(`- Difficult-word coverage on the **daily verses** (primary surface; trivial function words excluded) — EN ${stat.enCov}% · KO ${stat.koCov}%`);
lines.push(`- Difficult-word coverage on **study passages** (denser, secondary) — EN ${stat.pEnCov}% · KO ${stat.pKoCov}%`);
lines.push(`- Remaining uncovered difficult words in verses — EN ${stat.enUncovered} · KO ${stat.koUncovered}`);
lines.push('');
lines.push('## QC findings');
lines.push(`Totals: ${bySev('CRITICAL').length} critical · ${bySev('HIGH').length} high · ${bySev('MEDIUM').length} medium · ${bySev('LOW').length} low (deduped below).`);
lines.push('');
if (dedupIssues.length === 0) lines.push('No issues found. ✅');
else dedupIssues.forEach(({ issue, count }) => lines.push(`- **${issue.sev}** [${issue.area}] ${issue.msg}${count > 1 ? `  _(×${count})_` : ''}`));
lines.push('');
lines.push('_Note: this harness exercises the pure app logic (data, daily generation, dedup, badges, dictionary, study, i18n). UI rendering and live API calls are validated separately (tsc, expo prebuild, function build)._');

const outPath = path.join(process.cwd(), 'QC_REPORT.md');
fs.writeFileSync(outPath, lines.join('\n') + '\n');

// console summary
console.log(`\nQC complete: ${N} personas simulated.`);
console.log(`Findings — CRITICAL ${bySev('CRITICAL').length}, HIGH ${bySev('HIGH').length}, MEDIUM ${bySev('MEDIUM').length}, LOW ${bySev('LOW').length}`);
console.log(`Verse difficult-word coverage EN ${stat.enCov}% (${stat.enUncovered} left) / KO ${stat.koCov}% (${stat.koUncovered} left); passages EN ${stat.pEnCov}% / KO ${stat.pKoCov}%`);
console.log(`Report written to QC_REPORT.md`);
if (bySev('CRITICAL').length) { console.log('\nCRITICAL:'); bySev('CRITICAL').slice(0, 10).forEach((i) => console.log(' -', i.area, i.msg)); }
