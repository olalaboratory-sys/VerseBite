// vb-badges.jsx — Achievements: 20 MVP badges + progress engine derived from app state.
// Exports: VB_BADGES, vbBadgeProgress, AchievementsScreen

// Each badge: id, group, icon, target (n for progress), and i18n keys (name/desc) live in vb-i18n.
const VB_BADGES = [
  // Daily Rhythm
  { id:'first_light',   group:'rhythm', icon:'sun',     target:1 },
  { id:'morning',       group:'rhythm', icon:'sun',     target:3 },
  { id:'rhythm7',       group:'rhythm', icon:'calendar',target:7 },
  { id:'rhythm30',      group:'rhythm', icon:'calendar',target:30 },
  // Saved
  { id:'first_saved',   group:'saved',  icon:'bookmark',target:1 },
  { id:'treasure',      group:'saved',  icon:'bookmark',target:10 },
  { id:'keeper',        group:'saved',  icon:'bookmark',target:50 },
  { id:'hundred',       group:'saved',  icon:'bookmark',target:100 },
  // Reflection
  { id:'first_note',    group:'journal',icon:'note',    target:1 },
  { id:'thoughtful',    group:'journal',icon:'note',    target:10 },
  { id:'quiet_journal', group:'journal',icon:'note',    target:30 },
  // Study Guide
  { id:'first_study',   group:'study',  icon:'quote',   target:1 },
  { id:'context_seeker',group:'study',  icon:'quote',   target:10 },
  { id:'scripture',     group:'study',  icon:'quote',   target:50 },
  // Language
  { id:'first_word',    group:'learn',  icon:'globe',   target:1 },
  { id:'word_collector',group:'learn',  icon:'globe',   target:25 },
  { id:'bilingual',     group:'learn',  icon:'globe',   target:30 },
  // Sharing
  { id:'first_share',   group:'share',  icon:'share',   target:1 },
  { id:'messenger',     group:'share',  icon:'share',   target:10 },
  // Categories
  { id:'full_garden',   group:'category',icon:'sparkle',target:9 },
];

const VB_BADGE_GROUPS = ['rhythm','saved','journal','study','learn','share','category'];

// Compute current value for each badge from app state.
// state: { saved, words, journal, resonance, counts }
//   counts = { opens, studyOpens, shares, daysOpened (set), morningDays (set) }
function vbBadgeValue(badge, s) {
  const savedArr = Object.values(s.saved || {});
  const noteCount = savedArr.filter(v => v.note && v.note.trim()).length;
  const journalArr = Object.values(s.journal || {});
  const studyJournalCount = journalArr.filter(j => j.study && j.study.trim()).length;
  const reflectCount = journalArr.filter(j => j.reflection && j.reflection.trim()).length;
  const resoDays = Object.keys(s.resonance || {}).length;
  const c = s.counts || {};
  switch (badge.id) {
    case 'first_light': return Math.min((c.opens||0), 1) || ((c.daysOpened||[]).length?1:0);
    case 'morning':     return (c.morningDays||[]).length;
    case 'rhythm7':     return c.streak || 0;
    case 'rhythm30':    return c.streak || 0;
    case 'first_saved': return savedArr.length>=1?1:0;
    case 'treasure':    return savedArr.length;
    case 'keeper':      return savedArr.length;
    case 'hundred':     return savedArr.length;
    case 'first_note':  return (noteCount+reflectCount)>=1?1:0;
    case 'thoughtful':  return noteCount + reflectCount;
    case 'quiet_journal': return noteCount + reflectCount + studyJournalCount;
    case 'first_study': return (c.studyOpens||0)>=1?1:0;
    case 'context_seeker': return c.studyOpens||0;
    case 'scripture':   return c.studyOpens||0;
    case 'first_word':  return Object.keys(s.words||{}).length>=1?1:0;
    case 'word_collector': return Object.keys(s.words||{}).length;
    case 'bilingual':   return (c.bilingualDays||[]).length || resoDays;
    case 'first_share': return (c.shares||0)>=1?1:0;
    case 'messenger':   return c.shares||0;
    case 'full_garden': {
      const cats = new Set(savedArr.map(v => v.cat).filter(Boolean));
      // savedArr may not carry cat; recompute from verse ids
      const setCats = new Set();
      Object.keys(s.saved||{}).forEach(id => { const v = window.vbVerse && window.vbVerse(id); if (v) setCats.add(v.cat); });
      return setCats.size;
    }
    default: return 0;
  }
}

// returns [{badge, value, target, unlocked, pct}]
function vbBadgeProgress(state) {
  return VB_BADGES.map(b => {
    const value = Math.min(vbBadgeValue(b, state), b.target);
    const unlocked = value >= b.target;
    return { badge:b, value, target:b.target, unlocked, pct: Math.round((value/b.target)*100) };
  });
}

// ── Achievements screen ──
function AchievementsScreen({ state }) {
  const prog = vbBadgeProgress(state);
  const byId = Object.fromEntries(prog.map(p => [p.badge.id, p]));
  const unlockedCount = prog.filter(p => p.unlocked).length;
  const total = VB_BADGES.length;
  const overallPct = Math.round((unlockedCount/total)*100);
  // in-progress: locked badges with the most progress (and any started), top 3
  const inProgress = prog.filter(p => !p.unlocked).sort((a,b) => b.pct - a.pct).slice(0, 3);

  // big circular progress ring for the hero
  const Ring = ({ pct, size=72, stroke=7 }) => {
    const r = (size-stroke)/2, circ = 2*Math.PI*r;
    return (
      <svg width={size} height={size} style={{ transform:'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--vb-hair)" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--vb-gold-ink)" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={circ*(1-pct/100)} style={{ transition:'stroke-dashoffset .6s ease' }} />
      </svg>
    );
  };

  // a badge medallion (used in rows + hero recent)
  const Medallion = ({ b, u, size=46 }) => (
    <div style={{ position:'relative', width:size, height:size, borderRadius:99, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center',
      background: u ? 'linear-gradient(150deg, var(--vb-gold), #8A6A3E)' : 'var(--vb-fill)',
      border: u ? 'none' : '1px solid var(--vb-hair)',
      boxShadow: u ? '0 3px 12px color-mix(in srgb, var(--vb-gold) 34%, transparent)' : 'none',
      color: u ? '#fff' : 'var(--label-tertiary)' }}>
      <VBIcon name={b.icon} size={Math.round(size*0.44)} strokeWidth={1.8} fill={u && b.icon==='bookmark'} />
    </div>
  );

  // full-width achievement row (list style, like real achievement pages)
  const Row = ({ p, last }) => {
    const b = p.badge, u = p.unlocked;
    return (
      <div style={{ display:'flex', alignItems:'center', gap:14, padding:'13px 16px', borderBottom: last?'none':'0.5px solid var(--separator)' }}>
        <Medallion b={b} u={u} />
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ font:`${u?600:600} 15px/1.2 var(--font-text)`, color: u?'var(--label-primary)':'var(--label-secondary)' }}>{t('badge.'+b.id+'.name')}</div>
          <div style={{ font:'400 12.5px/1.35 var(--font-text)', color:'var(--label-tertiary)', marginTop:3 }}>{t('badge.'+b.id+'.desc')}</div>
          {!u && p.target>1 && (
            <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:8 }}>
              <div style={{ flex:1, height:5, borderRadius:99, background:'var(--vb-hair)', overflow:'hidden' }}>
                <div style={{ width:Math.max(p.pct,3)+'%', height:'100%', background:'var(--vb-gold-ink)', borderRadius:99 }} />
              </div>
              <span style={{ font:'600 11px/1 var(--font-text)', color:'var(--label-tertiary)', flexShrink:0, fontVariantNumeric:'tabular-nums' }}>{p.value}/{p.target}</span>
            </div>
          )}
        </div>
        {u && <span style={{ flexShrink:0, width:24, height:24, borderRadius:99, background:'color-mix(in srgb, var(--vb-gold) 20%, var(--vb-card))', color:'var(--vb-gold-ink)', display:'flex', alignItems:'center', justifyContent:'center' }}><VBIcon name="check" size={15} strokeWidth={2.6}/></span>}
      </div>
    );
  };

  const groups = [
    { id:'rhythm', ids:['first_light','morning','rhythm7','rhythm30'] },
    { id:'saved', ids:['first_saved','treasure','keeper','hundred'] },
    { id:'journal', ids:['first_note','thoughtful','quiet_journal'] },
    { id:'study', ids:['first_study','context_seeker','scripture'] },
    { id:'learn', ids:['first_word','word_collector','bilingual'] },
    { id:'share', ids:['first_share','messenger'] },
    { id:'category', ids:['full_garden'] },
  ];

  return (
    <div style={{ paddingBottom:30 }}>
      <VBHeader kicker={t('badge.kicker')} title={t('badge.title')} />

      {/* hero summary */}
      <div style={{ padding:'4px 16px 20px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:18, padding:'20px', borderRadius:22, background:'linear-gradient(150deg, color-mix(in srgb, var(--vb-gold) 16%, var(--vb-card)), var(--vb-card))', border:'0.5px solid var(--vb-hair)', boxShadow:'var(--vb-shadow-sm)' }}>
          <div style={{ position:'relative', width:72, height:72, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Ring pct={overallPct} />
            <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
              <span style={{ font:'700 22px/1 var(--font-text)', color:'var(--label-primary)', fontVariantNumeric:'tabular-nums' }}>{unlockedCount}</span>
              <span style={{ font:'500 10px/1 var(--font-text)', color:'var(--label-tertiary)', marginTop:2 }}>/ {total}</span>
            </div>
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontFamily:'var(--vb-serif)', fontWeight:600, fontSize:21, lineHeight:1.2, color:'var(--label-primary)' }}>{t('badge.count').replace('{n}', unlockedCount).replace('{total}', total)}</div>
            <div style={{ font:'400 13px/1.4 var(--font-text)', color:'var(--label-secondary)', marginTop:5 }}>{overallPct}%</div>
          </div>
        </div>
      </div>

      {/* in progress */}
      {inProgress.length>0 && (
        <div style={{ padding:'0 16px 22px' }}>
          <div style={{ font:'600 12px/1 var(--font-text)', letterSpacing:'0.5px', textTransform:'uppercase', color:'var(--vb-gold-ink)', margin:'0 4px 11px' }}>{t('badge.inprogress')}</div>
          <div style={{ background:'var(--vb-card)', borderRadius:18, overflow:'hidden', border:'0.5px solid var(--vb-hair)', boxShadow:'var(--vb-shadow-sm)' }}>
            {inProgress.map((p,i) => <Row key={p.badge.id} p={p} last={i===inProgress.length-1} />)}
          </div>
        </div>
      )}

      {/* all badges by group */}
      <div style={{ padding:'0 16px' }}>
        {groups.map(g => {
          const earned = g.ids.filter(id => byId[id].unlocked).length;
          return (
            <div key={g.id} style={{ marginBottom:22 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 4px 10px' }}>
                <span style={{ font:'600 14px/1 var(--font-text)', color:'var(--label-primary)' }}>{t('badge.group.'+g.id)}</span>
                <span style={{ font:'500 12px/1 var(--font-text)', color:'var(--label-tertiary)', fontVariantNumeric:'tabular-nums' }}>{earned}/{g.ids.length}</span>
              </div>
              <div style={{ background:'var(--vb-card)', borderRadius:18, overflow:'hidden', border:'0.5px solid var(--vb-hair)', boxShadow:'var(--vb-shadow-sm)' }}>
                {g.ids.map((id,i) => <Row key={id} p={byId[id]} last={i===g.ids.length-1} />)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

Object.assign(window, { VB_BADGES, VB_BADGE_GROUPS, vbBadgeProgress, AchievementsScreen });
