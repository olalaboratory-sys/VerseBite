// vb-calendar.jsx — Calendar tab: pick a date, see that day's pre-generated verses.
// Days before the user's signup date (and future days) are locked.
// Exports: CalendarScreen
const { useState: uSc } = React;

function CalendarScreen({ order, plan, savedSet, daysOpened = [], onOpenVerse, onToggleSave, onUpgrade }) {
  const perCat = VB_FREE_PER_CAT; // one verse per category per day, for everyone
  const todayKey = vbDateKey();
  const signup = vbSignupDate();
  const [sel, setSel] = uSc(todayKey);
  const [cursor, setCursor] = uSc(() => { const d = new Date(); return { y:d.getFullYear(), m:d.getMonth() }; });

  const ko = window.VB_LANG === 'ko';
  const monthLabel = new Date(cursor.y, cursor.m, 1).toLocaleDateString(ko?'ko-KR':'en-US', { month:'long', year:'numeric' });
  const dow = ko ? ['일','월','화','수','목','금','토'] : ['S','M','T','W','T','F','S'];
  const first = new Date(cursor.y, cursor.m, 1);
  const startDow = first.getDay();
  const daysInMonth = new Date(cursor.y, cursor.m+1, 0).getDate();
  const cells = [];
  for (let i=0;i<startDow;i++) cells.push(null);
  for (let d=1; d<=daysInMonth; d++) cells.push(d);

  const keyFor = (d) => vbDateKey(new Date(cursor.y, cursor.m, d));
  const locked = (k) => k < signup || k > todayKey;
  const visitedSet = new Set(daysOpened);
  const isStart = (k) => k === signup;

  const prevMonth = () => setCursor(c => c.m===0 ? {y:c.y-1,m:11} : {y:c.y,m:c.m-1});
  const nextMonth = () => setCursor(c => c.m===11 ? {y:c.y+1,m:0} : {y:c.y,m:c.m+1});

  // selected day's set
  const selLocked = locked(sel);
  const sets = selLocked ? [] : vbDailyAll(sel, perCat).filter(s => s.verseIds.length);
  const selDate = (() => { const [y,m,d]=sel.split('-').map(Number); return new Date(y,m-1,d); })();
  const selLabel = selDate.toLocaleDateString(ko?'ko-KR':'en-US', { weekday:'long', month:'long', day:'numeric' });

  return (
    <div style={{ paddingBottom:30 }}>
      <VBHeader kicker={t('cal.kicker')} title={t('cal.title')} subtitle={t('cal.attendance').replace('{n}', visitedSet.size)} />

      {/* month grid */}
      <div style={{ margin:'8px 16px 0', background:'var(--vb-card)', borderRadius:20, border:'0.5px solid var(--vb-hair)', boxShadow:'var(--vb-shadow-sm)', padding:'14px 14px 16px' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
          <button type="button" onClick={prevMonth} style={navBtn}><VBIcon name="back" size={18}/></button>
          <span style={{ font:'600 16px/1 var(--font-text)', color:'var(--label-primary)' }}>{monthLabel}</span>
          <button type="button" onClick={nextMonth} style={{ ...navBtn, transform:'scaleX(-1)' }}><VBIcon name="back" size={18}/></button>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2, marginBottom:4 }}>
          {dow.map((w,i)=>(<div key={i} style={{ textAlign:'center', font:'600 11px/1 var(--font-text)', color:'var(--label-tertiary)', padding:'4px 0' }}>{w}</div>))}
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2 }}>
          {cells.map((d,i) => {
            if (d===null) return <div key={i} />;
            const k = keyFor(d);
            const isLocked = locked(k);
            const isSel = k===sel;
            const isToday = k===todayKey;
            const start = isStart(k);
            const visited = visitedSet.has(k);
            return (
              <button key={i} type="button" disabled={isLocked} onClick={()=>setSel(k)} style={{
                aspectRatio:'1', borderRadius:11, border: isSel?'none':(start?'1.5px solid var(--vb-gold-ink)':'none'), cursor: isLocked?'default':'pointer', WebkitTapHighlightColor:'transparent',
                display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:2, position:'relative',
                background: isSel ? 'var(--vb-gold-ink)' : (visited && !isLocked ? 'color-mix(in srgb, var(--vb-gold) 16%, transparent)' : 'transparent'),
                color: isSel ? '#fff' : isLocked ? 'var(--label-tertiary)' : 'var(--label-primary)',
                opacity: isLocked ? 0.32 : 1,
                font:`${isSel||isToday||start?600:400} 14px/1 var(--font-text)`,
              }}>
                {start
                  ? <><span style={{ fontSize:13 }}>{d}</span><span style={{ position:'absolute', bottom:3, fontSize:7.5, fontWeight:700, letterSpacing:'0.2px', color: isSel?'rgba(255,255,255,0.9)':'var(--vb-gold-ink)', whiteSpace:'nowrap' }}>{t('cal.start')}</span></>
                  : <>{d}{visited && !isSel && <span style={{ position:'absolute', bottom:4, color:'var(--vb-gold-ink)', display:'flex' }}><VBIcon name="check" size={9} strokeWidth={3}/></span>}</>}
                {isToday && !isSel && !visited && !start && <span style={{ position:'absolute', bottom:5, width:4, height:4, borderRadius:99, background:'var(--vb-gold-ink)' }} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* selected day's verses */}
      <div style={{ padding:'18px 16px 0' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
          <span style={{ color:'var(--vb-gold-ink)' }}><VBIcon name="calendar" size={16}/></span>
          <span style={{ font:'600 14px/1 var(--font-text)', color:'var(--label-primary)' }}>{selLabel}</span>
        </div>

        {selLocked ? (
          <div style={{ textAlign:'center', padding:'40px 30px', color:'var(--label-tertiary)' }}>
            <div style={{ marginBottom:12, opacity:0.6 }}><VBIcon name="calendar" size={30}/></div>
            <p style={{ margin:0, font:'400 14.5px/1.5 var(--font-text)' }}>{sel>todayKey ? t('cal.future') : t('cal.beforeSignup')}</p>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {sets.flatMap(s => s.verseIds).map((id) => {
              const v = vbVerse(id); if (!v) return null;
              return (
                <div key={id} style={{ borderRadius:18, overflow:'hidden', border:'0.5px solid var(--vb-hair)', boxShadow:'var(--vb-shadow-sm)' }}>
                  <VerseRow verse={v} order={order} saved={savedSet.has(id)} onOpen={()=>onOpenVerse(v)} onToggleSave={onToggleSave} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
const navBtn = { border:'none', background:'var(--vb-fill)', width:34, height:34, borderRadius:99, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'var(--label-secondary)' };

window.CalendarScreen = CalendarScreen;
