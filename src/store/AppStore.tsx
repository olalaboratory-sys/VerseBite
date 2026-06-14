import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Lang } from '@/i18n/dict';
import { VERSES, Verse, vbVerse, vbVersesByCat } from '@/data/content';
import { dateKey, pickDaily, shortDate } from '@/data/daily';
import { lookup } from '@/data/words';
import { scheduleDailyReminder, cancelDailyReminder } from '@/utils/notifications';

export type Plan = 'free' | 'plus' | 'lifetime';
export type Learn = 'en' | 'ko' | 'off';
export type Order = 'en' | 'ko';

export type Prefs = {
  appLang: Lang;
  primaryLang: string;
  order: string;
  verseOrder: 'auto' | 'en' | 'ko';
  learningMode: Learn;
  notifications: boolean;
  categories: string[];
  reminderHour: number;
  reminderMinute: number;
};

export type SavedEntry = { note: string; savedAt: string; ts: number; guide?: boolean; cat?: string };
export type WordEntry = { key: string; headword: string; lang: 'en' | 'ko'; def: string; trans: string; roman: string | null; savedAt?: string; ts?: number };
export type JournalEntry = { reflection?: string; study?: string; gratitude?: string; ts?: number; date?: string };
export type Counts = { opens: number; studyOpens: number; shares: number; refreshes: number; daysOpened: string[]; morningDays: string[]; bilingualDays: string[]; streak: number };
export type Toast = { text: string; icon?: string } | null;

export type Overlay =
  | { type: 'cat'; cat: string }
  | { type: 'verse'; verse: Verse }
  | { type: 'study'; verse: Verse }
  | { type: 'editor'; verse: Verse }
  | { type: 'pricing' }
  | { type: 'history' }
  | { type: 'journal' }
  | null;

export type Sheet =
  | { type: 'note'; verse: Verse }
  | { type: 'share'; verse: Verse }
  | { type: 'word'; token: string; lang: 'en' | 'ko' }
  | { type: 'paywall'; reason: string | null }
  | { type: 'unsave'; id: string }
  | null;

const DEFAULT_PREFS: Prefs = {
  appLang: 'en', primaryLang: 'both', order: 'en', verseOrder: 'auto', learningMode: 'en', notifications: true, categories: ['hope', 'gratitude', 'faith'], reminderHour: 8, reminderMinute: 0,
};
const DEFAULT_COUNTS: Counts = { opens: 0, studyOpens: 0, shares: 0, refreshes: 0, daysOpened: [], morningDays: [], bilingualDays: [], streak: 0 };

const K = {
  onboarded: 'vb_onboarded', prefs: 'vb_prefs', saved: 'vb_saved', words: 'vb_words', plan: 'vb_plan',
  journal: 'vb_journal', resonance: 'vb_resonance', history: 'vb_history', counts: 'vb_counts',
  today: 'vb_today', signup: 'vb_signup', dark: 'vb_dark',
};

async function load<T>(key: string, fallback: T): Promise<T> {
  try {
    const v = await AsyncStorage.getItem(key);
    return v == null ? fallback : (JSON.parse(v) as T);
  } catch {
    return fallback;
  }
}
function save(key: string, value: unknown) {
  AsyncStorage.setItem(key, JSON.stringify(value)).catch(() => {});
}

export type StoreValue = ReturnType<typeof useStoreValue>;
const StoreContext = createContext<StoreValue | null>(null);

function useStoreValue() {
  const [hydrated, setHydrated] = useState(false);
  const [onboarded, setOnboarded] = useState(false);
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [saved, setSaved] = useState<Record<string, SavedEntry>>({});
  const [words, setWords] = useState<Record<string, WordEntry>>({});
  const [plan, setPlan] = useState<Plan>('free');
  const [journal, setJournal] = useState<Record<string, JournalEntry>>({});
  const [resonance, setResonance] = useState<Record<string, string>>({});
  const [history, setHistory] = useState<{ id: string; ts: number; date: string; source: string }[]>([]);
  const [counts, setCounts] = useState<Counts>(DEFAULT_COUNTS);
  const [todayId, setTodayId] = useState<string>('v22');
  const [dark, setDark] = useState(false);
  const signupRef = useRef<string>(dateKey());

  // navigation (not persisted)
  const [tab, setTab] = useState<'today' | 'calendar' | 'badges' | 'saved' | 'profile'>('today');
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [sheet, setSheet] = useState<Sheet>(null);
  const [toast, setToast] = useState<Toast>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── hydrate ──
  useEffect(() => {
    (async () => {
      const [ob, pr, sv, wd, pl, jr, rs, hi, ct, td, su, dk] = await Promise.all([
        load(K.onboarded, false), load<Prefs>(K.prefs, DEFAULT_PREFS), load<Record<string, SavedEntry>>(K.saved, {}),
        load<Record<string, WordEntry>>(K.words, {}), load<Plan>(K.plan, 'free'), load<Record<string, JournalEntry>>(K.journal, {}),
        load<Record<string, string>>(K.resonance, {}), load<typeof history>(K.history, []), load<Counts>(K.counts, DEFAULT_COUNTS),
        load<{ date: string; id: string } | null>(K.today, null), load<string | null>(K.signup, null), load(K.dark, false),
      ]);
      setOnboarded(ob);
      setPrefs({ ...DEFAULT_PREFS, ...pr });
      setSaved(sv); setWords(wd); setPlan(pl); setJournal(jr); setResonance(rs); setHistory(hi);
      setCounts({ ...DEFAULT_COUNTS, ...ct });
      setDark(dk);
      const todayStr = new Date().toDateString();
      setTodayId(td && td.date === todayStr ? td.id : pickDaily(pr.categories));
      signupRef.current = su || dateKey();
      if (!su) save(K.signup, dateKey());
      setHydrated(true);
    })();
  }, []);

  // ── persistence ──
  useEffect(() => { if (hydrated) save(K.prefs, prefs); }, [prefs, hydrated]);
  useEffect(() => { if (hydrated) save(K.saved, saved); }, [saved, hydrated]);
  useEffect(() => { if (hydrated) save(K.words, words); }, [words, hydrated]);
  useEffect(() => { if (hydrated) save(K.plan, plan); }, [plan, hydrated]);
  useEffect(() => { if (hydrated) save(K.journal, journal); }, [journal, hydrated]);
  useEffect(() => { if (hydrated) save(K.resonance, resonance); }, [resonance, hydrated]);
  useEffect(() => { if (hydrated) save(K.history, history); }, [history, hydrated]);
  useEffect(() => { if (hydrated) save(K.counts, counts); }, [counts, hydrated]);
  useEffect(() => { if (hydrated) save(K.onboarded, onboarded); }, [onboarded, hydrated]);
  useEffect(() => { if (hydrated) save(K.dark, dark); }, [dark, hydrated]);
  useEffect(() => { if (hydrated) save(K.today, { date: new Date().toDateString(), id: todayId }); }, [todayId, hydrated]);

  // ── track app open (once) ──
  useEffect(() => {
    if (!hydrated || !onboarded) return;
    const k = dateKey();
    setCounts((prev) => {
      if ((prev.daysOpened || []).includes(k)) return prev;
      const days = [...(prev.daysOpened || []), k];
      const isMorning = new Date().getHours() < 10;
      const morningDays = isMorning && !(prev.morningDays || []).includes(k) ? [...(prev.morningDays || []), k] : prev.morningDays || [];
      const bilingualDays = prefs.learningMode && prefs.learningMode !== 'off' && !(prev.bilingualDays || []).includes(k) ? [...(prev.bilingualDays || []), k] : prev.bilingualDays || [];
      const set = new Set(days);
      let st = 0;
      const d = new Date();
      for (;;) { const kk = dateKey(d); if (set.has(kk)) { st++; d.setDate(d.getDate() - 1); } else break; }
      return { ...prev, opens: (prev.opens || 0) + 1, daysOpened: days, morningDays, bilingualDays, streak: st };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onboarded, hydrated]);

  // ── track daily verse into history ──
  useEffect(() => {
    if (!hydrated || !onboarded || !todayId) return;
    setHistory((prev) => (prev[0] && prev[0].id === todayId ? prev : [{ id: todayId, ts: Date.now(), date: shortDate(), source: 'daily' }, ...prev].slice(0, 60)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todayId, onboarded, hydrated]);

  // ── daily reminder scheduling ──
  useEffect(() => {
    if (!hydrated || !onboarded) return;
    if (prefs.notifications) {
      scheduleDailyReminder(prefs.reminderHour ?? 8, prefs.reminderMinute ?? 0, prefs.appLang || 'en');
    } else {
      cancelDailyReminder();
    }
  }, [hydrated, onboarded, prefs.notifications, prefs.reminderHour, prefs.reminderMinute, prefs.appLang]);

  const showToast = useCallback((tObj: Toast) => {
    setToast(tObj);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 1800);
  }, []);

  // ── derived ──
  const appLang = (prefs.appLang || 'en') as Lang;
  const learn = (prefs.learningMode || 'en') as Learn;
  const order: Order = prefs.verseOrder === 'en' || prefs.verseOrder === 'ko' ? prefs.verseOrder : learn === 'ko' ? 'ko' : 'en';
  const isPaid = plan !== 'free';
  const savedSet = useMemo(() => new Set(Object.keys(saved)), [saved]);
  const savedWordSet = useMemo(() => new Set(Object.keys(words)), [words]);
  const notesMap = useMemo(() => Object.fromEntries(Object.entries(saved).map(([id, s]) => [id, s.note])), [saved]);
  const savedList = useMemo(
    () => Object.entries(saved).sort((a, b) => b[1].ts - a[1].ts).map(([id, s]) => ({ verse: vbVerse(id)!, note: s.note, savedAt: s.savedAt, ts: s.ts, guide: !!s.guide })).filter((x) => x.verse),
    [saved],
  );
  const savedWordsList = useMemo(() => Object.entries(words).sort((a, b) => (b[1].ts || 0) - (a[1].ts || 0)).map(([key, w]) => ({ ...w, key })), [words]);
  const journalEntries = useMemo(() => {
    const out: { id: string; kind: string; text: string; date?: string; ts: number }[] = [];
    Object.entries(journal).forEach(([id, j]) => { if (j.reflection) out.push({ id, kind: 'reflection', text: j.reflection, date: j.date, ts: j.ts || 0 }); });
    Object.entries(journal).forEach(([id, j]) => { if (j.study) out.push({ id, kind: 'study', text: j.study, date: j.date, ts: (j.ts || 0) + 1 }); });
    Object.entries(journal).forEach(([id, j]) => { if (j.gratitude) out.push({ id, kind: 'gratitude', text: j.gratitude, date: j.date, ts: (j.ts || 0) + 2 }); });
    Object.entries(saved).forEach(([id, s]) => { if (s.note) out.push({ id, kind: 'note', text: s.note, date: s.savedAt, ts: s.ts }); });
    return out.sort((a, b) => b.ts - a.ts);
  }, [journal, saved]);
  const todayKey = new Date().toISOString().slice(0, 10);
  const resonanceStreak = useMemo(() => {
    let n = 0;
    const d = new Date();
    for (;;) { const kk = d.toISOString().slice(0, 10); if (resonance[kk]) { n++; d.setDate(d.getDate() - 1); } else break; }
    return n;
  }, [resonance]);

  // ── actions ──
  const toggleSave = useCallback((id: string, note?: string) => {
    if (note === undefined && saved[id]) { setSheet({ type: 'unsave', id }); return; }
    setSaved((prev) => {
      const n = { ...prev };
      const ex = n[id] || ({} as SavedEntry);
      n[id] = { note: note !== undefined ? note : ex.note || '', savedAt: ex.savedAt || shortDate(), ts: ex.ts || Date.now(), guide: ex.guide || false };
      if (note === undefined) showToast({ text: 't.savedVerse', icon: 'check' });
      return n;
    });
  }, [saved, showToast]);

  const confirmUnsave = useCallback((id: string) => {
    setSaved((prev) => { const n = { ...prev }; delete n[id]; return n; });
    setSheet(null);
    showToast({ text: 't.removedVerse', icon: 'bookmark' });
  }, [showToast]);

  const saveNote = useCallback((id: string, note: string) => {
    setSaved((prev) => ({ ...prev, [id]: { note, savedAt: (prev[id] && prev[id].savedAt) || shortDate(), ts: (prev[id] && prev[id].ts) || Date.now() } }));
    showToast({ text: note ? 't.noteSaved' : 't.noteCleared', icon: 'note' });
  }, [showToast]);

  const refresh = useCallback(() => {
    setCounts((p) => ({ ...p, refreshes: (p.refreshes || 0) + 1 }));
    setTodayId((cur) => {
      const v = vbVerse(cur)!;
      let cands = vbVersesByCat(v.cat).filter((x) => x.id !== cur);
      if (!cands.length) cands = VERSES.filter((x) => prefs.categories.includes(x.cat) && x.id !== cur);
      if (!cands.length) cands = VERSES.filter((x) => x.id !== cur);
      return cands[Math.floor(Math.random() * cands.length)].id;
    });
  }, [prefs.categories]);

  const pickCategory = useCallback((catId: string) => {
    setTodayId((cur) => {
      const v = vbVerse(cur);
      if (v && v.cat === catId) return cur;
      const pool = vbVersesByCat(catId);
      const next = pool[Math.floor(Math.random() * pool.length)];
      return next ? next.id : cur;
    });
  }, []);

  const toggleSaveWord = useCallback((wordObj: WordEntry) => {
    setWords((prev) => {
      const n = { ...prev };
      if (n[wordObj.key]) { delete n[wordObj.key]; showToast({ text: 't.removedWord', icon: 'globe' }); }
      else { n[wordObj.key] = { ...wordObj, savedAt: shortDate(), ts: Date.now() }; showToast({ text: 't.savedWord', icon: 'check' }); }
      return n;
    });
  }, [showToast]);

  const removeWord = useCallback((key: string) => setWords((prev) => { const n = { ...prev }; delete n[key]; return n; }), []);
  const setLearn = useCallback((v: Learn) => setPrefs((p) => ({ ...p, learningMode: v })), []);
  const setAppLang = useCallback((v: Lang) => setPrefs((p) => ({ ...p, appLang: v })), []);
  const setVerseOrder = useCallback((v: Prefs['verseOrder']) => setPrefs((p) => ({ ...p, verseOrder: v })), []);

  const openPaywall = useCallback((reason: string | null) => setSheet({ type: 'paywall', reason }), []);
  const requirePaid = useCallback((reason: string, fn: () => void) => { if (plan !== 'free') fn(); else openPaywall(reason); }, [plan, openPaywall]);
  const choosePlan = useCallback((type: Plan) => { setPlan(type); setSheet(null); showToast({ text: type === 'lifetime' ? 't.lifeUnlocked' : 't.plusActive', icon: 'sparkle' }); }, [showToast]);

  const saveReflection = useCallback((id: string, text: string) => setJournal((prev) => ({ ...prev, [id]: { ...(prev[id] || {}), reflection: text, ts: (prev[id] && prev[id].ts) || Date.now(), date: (prev[id] && prev[id].date) || shortDate() } })), []);
  const saveStudyJournal = useCallback((id: string, text: string) => setJournal((prev) => ({ ...prev, [id]: { ...(prev[id] || {}), study: text, ts: (prev[id] && prev[id].ts) || Date.now(), date: (prev[id] && prev[id].date) || shortDate() } })), []);
  const saveGratitude = useCallback((id: string, text: string) => setJournal((prev) => ({ ...prev, [id]: { ...(prev[id] || {}), gratitude: text, ts: (prev[id] && prev[id].ts) || Date.now(), date: (prev[id] && prev[id].date) || shortDate() } })), []);

  const openEditor = useCallback((verse: Verse) => requirePaid('pw.reasonShare', () => setOverlay({ type: 'editor', verse })), [requirePaid]);
  const openStudy = useCallback((verse: Verse) => requirePaid('sg.reason', () => { setOverlay({ type: 'study', verse }); setCounts((p) => ({ ...p, studyOpens: (p.studyOpens || 0) + 1 })); }), [requirePaid]);
  const bumpShare = useCallback(() => setCounts((p) => ({ ...p, shares: (p.shares || 0) + 1 })), []);

  const saveStudyGuide = useCallback((id: string) => {
    setSaved((prev) => {
      const ex = prev[id] || ({} as SavedEntry);
      const on = !ex.guide;
      showToast({ text: on ? 't.studySaved' : 't.studyUnsaved', icon: on ? 'check' : 'bookmark' });
      return { ...prev, [id]: { note: ex.note || '', savedAt: ex.savedAt || shortDate(), ts: ex.ts || Date.now(), guide: on } };
    });
  }, [showToast]);

  const pickResonance = useCallback((feeling: string) => setResonance((prev) => ({ ...prev, [todayKey]: feeling })), [todayKey]);

  const finishOnboarding = useCallback((p: { appLang: Lang; learningMode: Learn; primaryLang: string; order: string; verseOrder: Prefs['verseOrder']; categories: string[]; notifications: boolean; plan: Plan }) => {
    setPrefs((prev) => ({ ...prev, appLang: p.appLang, primaryLang: p.primaryLang, order: p.order, verseOrder: p.verseOrder || 'auto', learningMode: p.learningMode, notifications: p.notifications, categories: p.categories }));
    if (p.plan && p.plan !== 'free') setPlan(p.plan);
    save(K.signup, signupRef.current || dateKey());
    setTodayId(pickDaily(p.categories));
    setOnboarded(true);
  }, []);

  // helpers for tabs / overlays
  const switchTab = useCallback((id: typeof tab) => { setOverlay(null); setSheet(null); setTab(id); }, []);
  const closeOverlay = useCallback(() => setOverlay(null), []);
  const openVerse = useCallback((verse: Verse) => setOverlay({ type: 'verse', verse }), []);
  const openCat = useCallback((cat: string) => setOverlay({ type: 'cat', cat }), []);
  const openNote = useCallback((verse: Verse) => setSheet({ type: 'note', verse }), []);
  const openShare = useCallback((verse: Verse) => setSheet({ type: 'share', verse }), []);
  const onWord = useCallback((token: string, lang: 'en' | 'ko') => setSheet({ type: 'word', token, lang }), []);
  const replayOnboarding = useCallback(() => { setOnboarded(false); setTab('today'); }, []);

  const wordIsSaved = useCallback((token: string, lang: 'en' | 'ko') => {
    const h = lookup(token, lang);
    const hw = h ? h.headword : token.replace(/[^A-Za-z'가-힣]/g, '');
    return savedWordSet.has(lang + ':' + hw);
  }, [savedWordSet]);

  return {
    hydrated, onboarded, prefs, saved, words, plan, journal, resonance, history, counts, todayId, dark, setDark,
    tab, overlay, sheet, toast, signup: signupRef.current,
    appLang, learn, order, isPaid, savedSet, savedWordSet, notesMap, savedList, savedWordsList, journalEntries, todayKey, resonanceStreak,
    setTab: switchTab, setOverlay, setSheet, closeOverlay, openVerse, openCat, openNote, openShare, onWord, replayOnboarding,
    toggleSave, confirmUnsave, saveNote, refresh, pickCategory, toggleSaveWord, removeWord, wordIsSaved,
    setLearn, setAppLang, setVerseOrder, setPrefs, openPaywall, requirePaid, choosePlan,
    saveReflection, saveStudyJournal, saveGratitude, openEditor, openStudy, bumpShare, saveStudyGuide, pickResonance,
    finishOnboarding, showToast,
  };
}

export function AppStoreProvider({ children }: { children: (v: StoreValue) => React.ReactNode }) {
  const value = useStoreValue();
  return <StoreContext.Provider value={value}>{children(value)}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within AppStoreProvider');
  return ctx;
}
