// vb-app.jsx — VerseBite app shell: state, daily-verse logic, theming, tweaks.
const { useState: uS, useEffect: uE, useMemo: uM } = React;

// ── persistence ──
const LS = {
  get(k, d){ try { const v = localStorage.getItem(k); return v==null?d:JSON.parse(v); } catch(e){ return d; } },
  set(k, v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch(e){} },
};

// ── theming presets ──
const WARMTH = {
  ivory: { bg:'#F3EADB', card:'#FBF6EE', fill:'rgba(168,118,47,0.09)', hair:'rgba(58,47,40,0.12)' },
  sand:  { bg:'#ECDFCB', card:'#F7EFE0', fill:'rgba(150,110,50,0.11)', hair:'rgba(58,47,40,0.14)' },
  linen: { bg:'#F4F1E8', card:'#FCFAF4', fill:'rgba(120,108,78,0.08)', hair:'rgba(50,45,38,0.10)' },
};
const ACCENT = {
  antique: { gold:'#C9A45C', inkL:'#A8762F', inkD:'#D8B978' },
  amber:   { gold:'#D9B26F', inkL:'#B07E2E', inkD:'#E3C078' },
  bronze:  { gold:'#BE9560', inkL:'#8A6A3E', inkD:'#CDA86E' },
};
const DARK = { bg:'#171411', card:'#221C18', fill:'rgba(210,179,111,0.12)', hair:'rgba(244,233,216,0.13)' };

function buildVars({ serif, koType, accent, warmth, radius, dark }) {
  const ac = ACCENT[accent] || ACCENT.antique;
  const w = dark ? DARK : (WARMTH[warmth] || WARMTH.ivory);
  const gold = ac.gold;
  const goldInk = dark ? ac.inkD : ac.inkL;
  const labelP = dark ? '#F4E9D8' : '#25221F';
  const labelS = dark ? 'rgba(244,233,216,0.62)' : 'rgba(58,47,40,0.62)';
  const labelT = dark ? 'rgba(244,233,216,0.34)' : 'rgba(58,47,40,0.34)';
  const sep = dark ? 'rgba(244,233,216,0.13)' : 'rgba(58,47,40,0.12)';
  const koFam = koType === 'sans' ? "'Noto Sans KR'" : "'Noto Serif KR'";
  return {
    '--vb-serif': `'${serif}', Georgia, serif`,
    '--vb-serif-ko': `${koFam}, 'Noto Serif KR', serif`,
    '--vb-radius': radius + 'px',
    '--vb-gold': gold,
    '--vb-gold-ink': goldInk,
    '--vb-bg': w.bg, '--vb-card': w.card, '--vb-fill': w.fill, '--vb-hair': w.hair,
    '--vb-shadow': dark ? '0 14px 36px rgba(0,0,0,0.5)' : '0 14px 34px rgba(58,42,24,0.13), 0 3px 10px rgba(58,42,24,0.06)',
    '--vb-shadow-sm': dark ? '0 4px 14px rgba(0,0,0,0.4)' : '0 4px 14px rgba(58,42,24,0.08)',
    // DS token overrides → warm theme for composed iOS components
    '--tint': goldInk, '--text-on-tint': '#fff',
    '--label-primary': labelP, '--label-secondary': labelS, '--label-tertiary': labelT,
    '--separator': sep,
    '--bg-primary': w.card, '--bg-grouped-primary': w.bg, '--bg-grouped-secondary': w.card,
    '--fill-tertiary': w.fill, '--fill-primary': dark?'rgba(120,120,128,0.34)':'rgba(120,110,90,0.16)',
    background: w.bg, color: labelP,
  };
}

// tweak label→value maps
const LAYOUT_OPTS = [{value:'editorial',label:'Editorial'},{value:'fullbleed',label:'Full-bleed'},{value:'stacked',label:'Stacked'}];
const GRID_OPTS   = [{value:'cards',label:'Thumbnail cards'},{value:'tiles',label:'Photo tiles'},{value:'blocks',label:'Color blocks'}];
const KO_OPTS     = [{value:'serif',label:'Serif'},{value:'sans',label:'Sans'}];
const ACCENT_OPTS = [{value:'antique',label:'Antique'},{value:'amber',label:'Amber'},{value:'bronze',label:'Bronze'}];
const WARMTH_OPTS = [{value:'ivory',label:'Ivory'},{value:'sand',label:'Sand'},{value:'linen',label:'Linen'}];
const SERIF_OPTS  = ['Cormorant Garamond','Playfair Display','Georgia'];

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "todayLayout": "editorial",
  "gridStyle": "cards",
  "serif": "Cormorant Garamond",
  "koType": "serif",
  "accent": "antique",
  "warmth": "ivory",
  "radius": 24,
  "dark": false
}/*EDITMODE-END*/;

// daily verse pick (deterministic per day, from preferred categories)
function pickDaily(prefCats) {
  const pool = prefCats && prefCats.length ? VB_VERSES.filter(v => prefCats.includes(v.cat)) : VB_VERSES;
  const arr = pool.length ? pool : VB_VERSES;
  const day = Math.floor(Date.now() / 86400000);
  return arr[day % arr.length].id;
}

function App() {
  const { TweaksPanel, TweakSection, TweakRadio, TweakSelect, TweakSlider, TweakToggle, TweakColor } = window;
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // data state
  const [onboarded, setOnboarded] = uS(() => LS.get('vb_onboarded', false));
  const [prefs, setPrefs] = uS(() => LS.get('vb_prefs', { appLang:'en', primaryLang:'both', order:'en', verseOrder:'auto', learningMode:'en', notifications:true, categories:['hope','gratitude','faith'] }));
  const [saved, setSaved] = uS(() => LS.get('vb_saved', {})); // id -> {note, savedAt, ts}
  const [words, setWords] = uS(() => LS.get('vb_words', {})); // key -> wordObj
  const [plan, setPlan] = uS(() => LS.get('vb_plan', 'free')); // free | plus | lifetime
  const [journal, setJournal] = uS(() => LS.get('vb_journal', {})); // id -> {reflection, ts, date}
  const [resonance, setResonance] = uS(() => LS.get('vb_resonance', {})); // dateStr -> feeling id
  const [history, setHistory] = uS(() => LS.get('vb_history', [])); // [{id, ts, date, source}]
  const [counts, setCounts] = uS(() => LS.get('vb_counts', { opens:0, studyOpens:0, shares:0, refreshes:0, daysOpened:[], morningDays:[], bilingualDays:[], streak:0 }));
  const [todayId, setTodayId] = uS(() => {
    const stored = LS.get('vb_today', null);
    const today = new Date().toDateString();
    if (stored && stored.date === today) return stored.id;
    const id = pickDaily(LS.get('vb_prefs', {categories:['hope','gratitude','faith']}).categories);
    return id;
  });

  // nav state
  const [tab, setTab] = uS('today');
  const [openCat, setOpenCat] = uS(null);
  const [openVerse, setOpenVerse] = uS(null);
  const [sheet, setSheet] = uS(null);       // {type:'note'|'share', verse}
  const [wordSheet, setWordSheet] = uS(null); // {token, lang}
  const [paywall, setPaywall] = uS(null);     // {reason}
  const [editorVerse, setEditorVerse] = uS(null);
  const [overlay, setOverlay] = uS(null);     // 'pricing' | 'history' | 'journal'
  const [studyVerse, setStudyVerse] = uS(null);
  const [unsaveId, setUnsaveId] = uS(null);
  const [toast, setToast] = uS(null);
  const [statusDark, setStatusDark] = uS(false);

  // persistence
  uE(() => LS.set('vb_prefs', prefs), [prefs]);
  uE(() => LS.set('vb_saved', saved), [saved]);
  uE(() => LS.set('vb_words', words), [words]);
  uE(() => LS.set('vb_plan', plan), [plan]);
  uE(() => LS.set('vb_journal', journal), [journal]);
  uE(() => LS.set('vb_resonance', resonance), [resonance]);
  uE(() => LS.set('vb_history', history), [history]);
  uE(() => LS.set('vb_counts', counts), [counts]);
  // track app open (once per mount): day set, morning flag, consecutive streak
  uE(() => {
    if (!onboarded) return;
    const k = vbDateKey();
    setCounts(prev => {
      if ((prev.daysOpened||[]).includes(k)) return prev;
      const days = [...(prev.daysOpened||[]), k];
      const isMorning = new Date().getHours() < 10;
      const morningDays = isMorning && !(prev.morningDays||[]).includes(k) ? [...(prev.morningDays||[]), k] : (prev.morningDays||[]);
      const bilingualDays = (prefs.learningMode && prefs.learningMode!=='off') && !(prev.bilingualDays||[]).includes(k) ? [...(prev.bilingualDays||[]), k] : (prev.bilingualDays||[]);
      // streak: consecutive days ending today
      const set = new Set(days); let st = 0; const d = new Date();
      for (;;) { const kk = vbDateKey(d); if (set.has(kk)) { st++; d.setDate(d.getDate()-1); } else break; }
      return { ...prev, opens:(prev.opens||0)+1, daysOpened:days, morningDays, bilingualDays, streak:st };
    });
  }, [onboarded]);
  // track the daily/selected verse into history
  uE(() => {
    if (!onboarded || !todayId) return;
    setHistory(prev => (prev[0] && prev[0].id === todayId) ? prev : [{ id:todayId, ts:Date.now(), date:vbShortDate(), source:'daily' }, ...prev].slice(0, 60));
  }, [todayId, onboarded]);
  uE(() => LS.set('vb_onboarded', onboarded), [onboarded]);
  uE(() => LS.set('vb_today', { date:new Date().toDateString(), id:todayId }), [todayId]);

  // status bar color
  uE(() => {
    if (onboarded) setStatusDark(t.dark ? true : !!(openVerse || openCat || overlay || editorVerse || studyVerse));
  }, [onboarded, openVerse, openCat, overlay, editorVerse, studyVerse, t.dark, tab]);

  const showToast = (toastObj) => { setToast(toastObj); clearTimeout(window.__vbT); window.__vbT = setTimeout(() => setToast(null), 1800); };

  // derived
  const savedSet = uM(() => new Set(Object.keys(saved)), [saved]);
  const notesMap = uM(() => Object.fromEntries(Object.entries(saved).map(([id,s]) => [id, s.note])), [saved]);
  const savedList = uM(() => Object.entries(saved)
    .sort((a,b) => b[1].ts - a[1].ts)
    .map(([id,s]) => ({ verse: vbVerse(id), note: s.note, savedAt: s.savedAt, ts: s.ts, guide: !!s.guide }))
    .filter(x => x.verse), [saved]);
  const todayVerse = vbVerse(todayId);
  const learn = prefs.learningMode || 'en';
  const appLang = prefs.appLang || 'en';
  window.VB_LANG = appLang; // App Language drives the UI t() lookups
  const order = (prefs.verseOrder === 'en' || prefs.verseOrder === 'ko') ? prefs.verseOrder : (learn === 'ko' ? 'ko' : 'en'); // 'auto'/unset → follow learning mode
  const layout = t.todayLayout, gridStyle = t.gridStyle;

  // saved words derived
  const savedWordSet = uM(() => new Set(Object.keys(words)), [words]);
  const savedWordsList = uM(() => Object.entries(words)
    .sort((a,b) => b[1].ts - a[1].ts)
    .map(([key,w]) => ({ ...w, key })), [words]);

  // monetization derived
  const isPaid = plan !== 'free';
  const badgeState = { saved, words, journal, resonance, counts };
  const journalEntries = uM(() => {
    const out = [];
    Object.entries(journal).forEach(([id,j]) => { if (j.reflection) out.push({ id, kind:'reflection', text:j.reflection, date:j.date, ts:j.ts }); });
    Object.entries(journal).forEach(([id,j]) => { if (j.study) out.push({ id, kind:'study', text:j.study, date:j.date, ts:(j.ts||0)+1 }); });
    Object.entries(journal).forEach(([id,j]) => { if (j.gratitude) out.push({ id, kind:'gratitude', text:j.gratitude, date:j.date, ts:(j.ts||0)+2 }); });
    Object.entries(saved).forEach(([id,s]) => { if (s.note) out.push({ id, kind:'note', text:s.note, date:s.savedAt, ts:s.ts }); });
    return out.sort((a,b) => b.ts - a.ts);
  }, [journal, saved]);

  // actions
  const toggleSave = (id, note) => {
    if (note === undefined && saved[id]) { setUnsaveId(id); return; } // confirm before removing
    setSaved(prev => {
      const n = { ...prev };
      const existing = n[id] || {};
      n[id] = { note: note !== undefined ? note : (existing.note || ''), savedAt: existing.savedAt || vbShortDate(), ts: existing.ts || Date.now(), guide: existing.guide || false };
      if (note === undefined) showToast({ text:window.t('t.savedVerse'), icon:'check' });
      return n;
    });
  };
  const confirmUnsave = () => {
    const id = unsaveId; if (!id) return;
    setSaved(prev => { const n = { ...prev }; delete n[id]; return n; });
    setUnsaveId(null);
    showToast({ text:window.t('t.removedVerse'), icon:'bookmark' });
  };
  const saveNote = (id, note) => {
    setSaved(prev => ({ ...prev, [id]: { note, savedAt:(prev[id]&&prev[id].savedAt)||vbShortDate(), ts:(prev[id]&&prev[id].ts)||Date.now() } }));
    showToast({ text: note ? window.t('t.noteSaved') : 'Note cleared', icon:'note' });
  };
  const refresh = () => {
    setCounts(p=>({ ...p, refreshes:(p.refreshes||0)+1 }));
    const cur = vbVerse(todayId);
    let cands = vbVersesByCat(cur.cat).filter(v => v.id !== todayId);
    if (!cands.length) cands = VB_VERSES.filter(v => (prefs.categories.includes(v.cat)) && v.id !== todayId);
    if (!cands.length) cands = VB_VERSES.filter(v => v.id !== todayId);
    const next = cands[Math.floor(Math.random()*cands.length)];
    setTodayId(next.id);
  };
  // pick today's verse from a chosen category
  const pickCategory = (catId) => {
    const cur = vbVerse(todayId);
    if (cur && cur.cat === catId) return;
    const pool = vbVersesByCat(catId);
    const next = pool[Math.floor(Math.random()*pool.length)];
    if (next) setTodayId(next.id);
  };
  // word actions
  const toggleSaveWord = (wordObj) => {
    setWords(prev => {
      const n = { ...prev };
      if (n[wordObj.key]) { delete n[wordObj.key]; showToast({ text:'Removed from words', icon:'globe' }); }
      else { n[wordObj.key] = { ...wordObj, savedAt: vbShortDate(), ts: Date.now() }; showToast({ text:window.t('t.savedWord'), icon:'check' }); }
      return n;
    });
  };
  const removeWord = (key) => setWords(prev => { const n = { ...prev }; delete n[key]; return n; });
  const setLearn = (v) => setPrefs(p => ({ ...p, learningMode:v }));
  const setAppLang = (v) => setPrefs(p => ({ ...p, appLang:v }));
  const setVerseOrder = (v) => setPrefs(p => ({ ...p, verseOrder:v }));
  // monetization actions
  const openPaywall = (reason) => setPaywall({ reason });
  const requirePaid = (reason, fn) => { if (isPaid) fn(); else openPaywall(reason); };
  const choosePlan = (type) => { setPlan(type); setPaywall(null); showToast({ text: type==='lifetime' ? window.t('t.lifeUnlocked') : window.t('t.plusActive'), icon:'sparkle' }); };
  const saveReflection = (id, text) => setJournal(prev => ({ ...prev, [id]: { reflection:text, ts:(prev[id]&&prev[id].ts)||Date.now(), date:(prev[id]&&prev[id].date)||vbShortDate() } }));
  const openEditor = (verse) => requirePaid(window.t('pw.reasonShare'), () => setEditorVerse(verse));
  const openStudy = (verse) => requirePaid(window.t('sg.reason'), () => { setStudyVerse(verse); setCounts(p=>({ ...p, studyOpens:(p.studyOpens||0)+1 })); });
  const bumpShare = () => setCounts(p=>({ ...p, shares:(p.shares||0)+1 }));
  const saveStudyJournal = (id, text) => setJournal(prev => ({ ...prev, [id]: { ...(prev[id]||{}), study:text, ts:(prev[id]&&prev[id].ts)||Date.now(), date:(prev[id]&&prev[id].date)||vbShortDate() } }));
  const saveGratitude = (id, text) => setJournal(prev => ({ ...prev, [id]: { ...(prev[id]||{}), gratitude:text, ts:(prev[id]&&prev[id].ts)||Date.now(), date:(prev[id]&&prev[id].date)||vbShortDate() } }));
  const saveStudyGuide = (id) => setSaved(prev => {
    const ex = prev[id] || {};
    const on = !ex.guide;
    showToast({ text: on ? window.t('t.studySaved') : window.t('t.studyUnsaved'), icon: on ? 'check' : 'bookmark' });
    return { ...prev, [id]: { note: ex.note||'', savedAt: ex.savedAt||vbShortDate(), ts: ex.ts||Date.now(), guide: on } };
  });
  // daily resonance one-tap check-in + streak
  const todayKey = new Date().toISOString().slice(0,10);
  const pickResonance = (feeling) => setResonance(prev => ({ ...prev, [todayKey]: feeling }));
  const resonanceStreak = uM(() => {
    let n = 0; const d = new Date();
    for (;;) { const k = d.toISOString().slice(0,10); if (resonance[k]) { n++; d.setDate(d.getDate()-1); } else break; }
    return n;
  }, [resonance]);

  const finishOnboarding = (p) => {
    const np = { appLang:p.appLang, primaryLang:p.primaryLang, order:p.order, verseOrder:p.verseOrder || 'auto', learningMode:p.learningMode, notifications:p.notifications, categories:p.categories };
    setPrefs(np);
    if (p.plan && p.plan !== 'free') setPlan(p.plan);
    if (!localStorage.getItem('vb_signup')) localStorage.setItem('vb_signup', JSON.stringify(vbDateKey()));
    setTodayId(pickDaily(p.categories));
    setOnboarded(true);
    setStatusDark(false);
  };

  // sheet helpers
  const openNote  = (verse) => setSheet({ type:'note', verse });
  const openShare = (verse) => setSheet({ type:'share', verse });
  const onWord = (token, lang) => setWordSheet({ token, lang });

  const vars = buildVars(t);

  // ── render ──
  const content = !onboarded
    ? <VBOnboarding onDone={finishOnboarding} setStatusDark={setStatusDark} />
    : (
      <>
        {/* tab base */}
        <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column' }}>
          {/* opaque status-bar backdrop — keeps the clock/battery legible as content scrolls under it */}
          <div style={{ position:'absolute', top:0, left:0, right:0, height:54, zIndex:6, pointerEvents:'none',
            background:'linear-gradient(to bottom, var(--vb-bg) 0%, var(--vb-bg) 74%, transparent 100%)' }} />
          <div style={{ flex:1, overflowY:'auto', paddingTop:62 }}>
            {tab==='today' && <TodayScreen verse={todayVerse} order={order} layout={layout} saved={savedSet.has(todayId)}
              learn={learn} onWord={onWord} savedWords={savedWordSet} onPickCategory={pickCategory}
              isPaid={isPaid} reflectAnswer={(journal[todayId]||{}).reflection} onReflect={(txt)=>saveReflection(todayId,txt)} onUpgrade={openPaywall} onStudy={openStudy}
              resonance={resonance[todayKey]} onResonance={pickResonance} streak={resonanceStreak}
              onRefresh={() => requirePaid(window.t('pw.reasonRefresh'), refresh)} onSave={() => toggleSave(todayId)} onNote={() => openNote(todayVerse)} onShare={() => openShare(todayVerse)} onOpenVerse={setOpenVerse} />}
            {tab==='calendar' && <CalendarScreen order={order} plan={plan} savedSet={savedSet} daysOpened={counts.daysOpened||[]} onOpenVerse={setOpenVerse} onToggleSave={toggleSave} onUpgrade={openPaywall} />}
            {tab==='badges' && <AchievementsScreen state={badgeState} />}
            {tab==='saved' && <SavedScreen savedList={savedList} savedWordsList={savedWordsList} order={order} learn={learn} onOpenVerse={setOpenVerse} onToggleSave={toggleSave} onRemoveWord={removeWord} />}
            {tab==='profile' && <ProfileScreen prefs={prefs} setPrefs={setPrefs} dark={t.dark} setDark={(v)=>setTweak('dark',v)} savedCount={savedList.length} wordCount={savedWordsList.length} learn={learn} setLearn={setLearn} appLang={appLang} setAppLang={setAppLang} verseOrder={order} setVerseOrder={setVerseOrder}
              plan={plan} onUpgrade={openPaywall} verseOrderPref={prefs.verseOrder || 'auto'} onPricing={()=>setOverlay('pricing')} onHistory={()=>requirePaid(window.t('pw.reasonHistory'),()=>setOverlay('history'))} onJournal={()=>requirePaid(window.t('pw.reasonJournal'),()=>setOverlay('journal'))}
              onReplayOnboarding={() => { setOnboarded(false); setTab('today'); }} onToast={showToast} />}
          </div>
          <VBTabBar active={tab} onChange={(id)=>{ setOpenVerse(null); setOpenCat(null); setStudyVerse(null); setEditorVerse(null); setOverlay(null); setSheet(null); setWordSheet(null); setTab(id); }} />
        </div>

        {/* overlays */}
        {openCat && <CategoryDetailScreen cat={openCat} order={order} savedSet={savedSet} notes={notesMap}
          onBack={() => setOpenCat(null)} onOpenVerse={setOpenVerse} onToggleSave={toggleSave} />}
        {openVerse && <VerseDetailScreen verse={openVerse} order={order} saved={savedSet.has(openVerse.id)} note={notesMap[openVerse.id]}
          learn={learn} onWord={onWord} savedWords={savedWordSet}
          isPaid={isPaid} reflectAnswer={(journal[openVerse.id]||{}).reflection} onReflect={(txt)=>saveReflection(openVerse.id,txt)} onUpgrade={openPaywall} onStudy={openStudy}
          onBack={() => setOpenVerse(null)} onSave={() => toggleSave(openVerse.id)} onNote={() => openNote(openVerse)} onShare={() => openShare(openVerse)} />}

        {/* premium full-screen overlays */}
        {overlay==='pricing' && <PricingScreen plan={plan} onBack={()=>setOverlay(null)} onOpenPaywall={()=>{ setOverlay(null); openPaywall(null); }} />}
        {overlay==='history' && <HistoryScreen history={history} order={order} onBack={()=>setOverlay(null)} onOpenVerse={(v)=>{ setOverlay(null); setOpenVerse(v); }} />}
        {overlay==='journal' && <JournalScreen entries={journalEntries} order={order} onBack={()=>setOverlay(null)} onOpenVerse={(v)=>{ setOverlay(null); setOpenVerse(v); }} />}
        {editorVerse && <ShareEditorScreen verse={editorVerse} order={order} onBack={()=>setEditorVerse(null)} onToast={showToast} />}
        {studyVerse && <StudyGuideScreen verse={studyVerse} order={order} learn={learn} isPaid={isPaid}
          journalText={(journal[studyVerse.id]||{}).study} onSaveJournal={(txt)=>saveStudyJournal(studyVerse.id,txt)}
          gratitudeText={(journal[studyVerse.id]||{}).gratitude} onSaveGratitude={(txt)=>saveGratitude(studyVerse.id,txt)}
          studySaved={(saved[studyVerse.id]||{}).guide} onSaveStudyGuide={()=>saveStudyGuide(studyVerse.id)}
          onWord={onWord} onBack={()=>setStudyVerse(null)} onToast={showToast} />}

        {/* sheets */}
        {sheet && sheet.type==='note' && <NoteSheet verse={sheet.verse} order={order} initial={notesMap[sheet.verse.id] || ''}
          onCancel={() => setSheet(null)} onSave={(text) => { saveNote(sheet.verse.id, text); setSheet(null); }} />}
        {sheet && sheet.type==='share' && <ShareSheet verse={sheet.verse} order={order} isPaid={isPaid} onEditor={()=>{ setSheet(null); openEditor(sheet.verse); }} onClose={() => setSheet(null)} onToast={showToast} />}
        {wordSheet && <WordSheet token={wordSheet.token} lang={wordSheet.lang}
          saved={(()=>{ const h=vbLookup(wordSheet.token, wordSheet.lang); const hw=h?h.headword:wordSheet.token.replace(/[^A-Za-z'\uAC00-\uD7A3]/g,''); return savedWordSet.has(wordSheet.lang+':'+hw); })()}
          onToggleSave={(w)=>toggleSaveWord(w)} onClose={() => setWordSheet(null)} />}
        {paywall && <PaywallSheet reason={paywall.reason} onChoose={choosePlan} onClose={()=>setPaywall(null)} onToast={showToast} />}
        {unsaveId && <VBSheet onClose={()=>setUnsaveId(null)} maxH="auto">
          <div style={{ padding:'18px 24px 8px', textAlign:'center' }}>
            <div style={{ width:52, height:52, borderRadius:16, margin:'0 auto 14px', background:'var(--vb-fill)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--vb-gold-ink)' }}><VBIcon name="trash" size={24}/></div>
            <h2 style={{ margin:0, fontFamily:'var(--vb-serif)', fontWeight:600, fontSize:21, color:'var(--label-primary)' }}>{window.t('nudge.unsaveTitle')}</h2>
            <p style={{ margin:'8px 0 0', font:'400 14.5px/1.5 var(--font-text)', color:'var(--label-secondary)' }}>{window.t('nudge.unsaveBody')}</p>
          </div>
          <div style={{ padding:'16px 24px 8px', display:'flex', flexDirection:'column', gap:8 }}>
            <button type="button" onClick={confirmUnsave} style={{ width:'100%', height:50, borderRadius:14, border:'none', cursor:'pointer', background:'var(--sys-red, #D64541)', color:'#fff', font:'600 16px/1 var(--font-text)' }}>{window.t('nudge.remove')}</button>
            <button type="button" onClick={()=>setUnsaveId(null)} style={{ width:'100%', height:50, borderRadius:14, border:'none', cursor:'pointer', background:'var(--vb-card)', boxShadow:'var(--vb-shadow-sm)', color:'var(--vb-gold-ink)', font:'600 16px/1 var(--font-text)' }}>{window.t('nudge.keep')}</button>
          </div>
        </VBSheet>}

        <VBToast toast={toast} />
      </>
    );

  return (
    <div style={{ height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#E7E2DA', overflow:'hidden' }}>
      <div id="device" style={{ width:402, height:874, flexShrink:0 }}>
      <IOSDevice dark={statusDark}>
        <div className="vb-root" data-vbdark={t.dark ? '1' : undefined} style={{ position:'absolute', inset:0, overflow:'hidden', ...vars }}>
          {content}
        </div>
      </IOSDevice>
      </div>

      <TweaksPanel>
        <TweakSection label="The Today card" />
        <TweakRadio label="Layout" value={t.todayLayout} options={LAYOUT_OPTS} onChange={v=>setTweak('todayLayout',v)} />
        <TweakSection label="Visual mood" />
        <TweakSelect label="English serif" value={t.serif} options={SERIF_OPTS} onChange={v=>setTweak('serif',v)} />
        <TweakRadio label="Korean type" value={t.koType} options={KO_OPTS} onChange={v=>setTweak('koType',v)} />
        <TweakRadio label="Accent gold" value={t.accent} options={ACCENT_OPTS} onChange={v=>setTweak('accent',v)} />
        <TweakRadio label="Warmth" value={t.warmth} options={WARMTH_OPTS} onChange={v=>setTweak('warmth',v)} />
        <TweakSection label="Categories grid" />
        <TweakRadio label="Treatment" value={t.gridStyle} options={GRID_OPTS} onChange={v=>setTweak('gridStyle',v)} />
        <TweakSection label="Display" />
        <TweakSlider label="Card corners" value={t.radius} min={14} max={30} step={1} unit="px" onChange={v=>setTweak('radius',v)} />
        <TweakToggle label="Dark theme" value={t.dark} onChange={v=>setTweak('dark',v)} />
      </TweaksPanel>
    </div>
  );
}

function vbShortDate(){ return new Date().toLocaleDateString('en-US',{month:'short',day:'numeric'}); }

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
