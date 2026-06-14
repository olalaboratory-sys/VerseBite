// vb-screens-lib.jsx — Saved, Profile, Verse Detail, Note sheet, Share sheet
// Exports: SavedScreen, ProfileScreen, VerseDetailScreen, VBSheet, NoteSheet, ShareSheet
const { useState: useStateL } = React;

// ── Generic bottom sheet ──
function VBSheet({ children, onClose, maxH = '88%' }) {
  return (
    <div style={{ position:'absolute', inset:0, zIndex:80, display:'flex', flexDirection:'column', justifyContent:'flex-end' }}>
      <div onClick={onClose} style={{ position:'absolute', inset:0, background:'rgba(28,22,17,0.42)', animation:'vbFade .25s ease' }} />
      <div style={{ position:'relative', background:'var(--vb-bg)', borderRadius:'26px 26px 0 0', maxHeight:maxH, display:'flex', flexDirection:'column', boxShadow:'0 -10px 40px rgba(0,0,0,0.22)', animation:'vbSheet .34s cubic-bezier(0.2,0.85,0.25,1)', paddingBottom:34 }}>
        <div style={{ display:'flex', justifyContent:'center', paddingTop:10 }}>
          <div style={{ width:40, height:5, borderRadius:99, background:'var(--vb-hair)' }} />
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Saved (Verses + Words) ──
function SavedScreen({ savedList, savedWordsList = [], order, learn, onOpenVerse, onToggleSave, onRemoveWord }) {
  const { SegmentedControl } = window.IOSDesignSystem_b2fbca;
  const [view, setView] = useStateL('verses');
  const [q, setQ] = useStateL('');
  const [filter, setFilter] = useStateL('all');

  let list = savedList;
  if (filter !== 'all') list = list.filter(s => s.verse.cat === filter);
  if (q.trim()) {
    const qq = q.toLowerCase();
    list = list.filter(s => (s.verse.en+s.verse.ko+s.verse.refEn+s.verse.refKo+(s.note||'')+(s.savedAt||'')).toLowerCase().includes(qq));
  }
  let wordList = savedWordsList;
  if (q.trim()) {
    const qq = q.toLowerCase();
    wordList = wordList.filter(w => ((w.headword||'')+(w.trans||'')+(w.def||'')+(w.roman||'')+(w.savedAt||'')).toLowerCase().includes(qq));
  }
  const catsWithSaved = VB_CATEGORIES.filter(c => savedList.some(s => s.verse.cat === c.id));
  const filters = [{ id:'all', label:t('saved.all') }, ...catsWithSaved.map(c => ({ id:c.id, label:vbCatName(c) }))];
  const groups = catsWithSaved
    .filter(c => filter === 'all' || filter === c.id)
    .map(c => ({ cat:c, items: list.filter(s => s.verse.cat === c.id) }))
    .filter(g => g.items.length);

  const EmptyVerses = (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center', padding:'60px 40px 0' }}>
      <div style={{ width:78, height:78, borderRadius:24, background:'var(--vb-fill)', border:'0.5px solid var(--vb-hair)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--vb-gold-ink)', marginBottom:20 }}><VBIcon name="bookmark" size={34}/></div>
      <h2 style={{ margin:0, fontFamily:'var(--vb-serif)', fontWeight:600, fontSize:23, color:'var(--label-primary)' }}>{t('saved.noVerses')}</h2>
      <p style={{ margin:'9px 0 0', font:'400 15px/1.5 var(--font-text)', color:'var(--label-secondary)', maxWidth:250 }}>{t('saved.noVersesSub')}</p>
    </div>
  );
  const EmptyWords = (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center', padding:'60px 40px 0' }}>
      <div style={{ width:78, height:78, borderRadius:24, background:'var(--vb-fill)', border:'0.5px solid var(--vb-hair)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--vb-gold-ink)', marginBottom:20 }}><VBIcon name="globe" size={34}/></div>
      <h2 style={{ margin:0, fontFamily:'var(--vb-serif)', fontWeight:600, fontSize:23, color:'var(--label-primary)' }}>{t('saved.noWords')}</h2>
      <p style={{ margin:'9px 0 0', font:'400 15px/1.5 var(--font-text)', color:'var(--label-secondary)', maxWidth:260 }}>{learn && learn !== 'off' ? t('saved.noWordsSub') : t('saved.noWordsOff')}</p>
    </div>
  );

  return (
    <div style={{ paddingBottom:30 }}>
      <VBHeader title={t('h.saved')} subtitle={`${savedList.length} ${savedList.length===1?t('count.verse'):t('count.verses')} · ${savedWordsList.length} ${savedWordsList.length===1?t('count.word'):t('count.words')}`} />
      <div style={{ padding:'6px 16px 12px' }}>
        <SegmentedControl value={view} onChange={setView} options={[{value:'verses',label:t('saved.verses')},{value:'words',label:t('saved.words')}]} />
      </div>

      {view === 'verses' ? (
        savedList.length === 0 ? EmptyVerses : (
          <>
            <div style={{ padding:'2px 16px 4px' }}>
              <SearchFieldWarm value={q} onChange={setQ} placeholder={t('saved.searchDate')} />
            </div>
            <div style={{ display:'flex', gap:8, overflowX:'auto', padding:'10px 16px 12px' }}>
              {filters.map(f => {
                const on = filter === f.id;
                return (
                  <button key={f.id} type="button" onClick={() => setFilter(f.id)} style={{
                    flexShrink:0, padding:'8px 15px', borderRadius:999, cursor:'pointer', WebkitTapHighlightColor:'transparent',
                    font:`${on?600:500} 13px/1 var(--font-text)`, letterSpacing:'-0.1px', border:'0.5px solid var(--vb-hair)',
                    background: on ? 'var(--vb-gold-ink)' : 'var(--vb-card)', color: on ? '#fff' : 'var(--label-secondary)',
                  }}>{f.label}</button>
                );
              })}
            </div>
            <div style={{ padding:'0 16px' }}>
              {list.length === 0 && <p style={{ textAlign:'center', color:'var(--label-tertiary)', font:'400 15px/1.4 var(--font-text)', padding:'40px 0' }}>{t('saved.noMatches')}</p>}
              {list.length > 0 && (
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  {list.map((s) => (
                    <div key={s.verse.id} style={{ borderRadius:18, overflow:'hidden', border:'0.5px solid var(--vb-hair)', boxShadow:'var(--vb-shadow-sm)' }}>
                      <VerseRow verse={s.verse} order={order} saved note={s.note} savedDate={s.savedAt} guide={s.guide} onOpen={() => onOpenVerse(s.verse)} onToggleSave={onToggleSave} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )
      ) : (
        savedWordsList.length === 0 ? EmptyWords : (
          <>
          <div style={{ padding:'2px 16px 12px' }}>
            <SearchFieldWarm value={q} onChange={setQ} placeholder={t('saved.searchDate')} />
          </div>
          <div style={{ padding:'0 16px', display:'flex', flexDirection:'column', gap:10 }}>
            {wordList.length===0 && <p style={{ textAlign:'center', color:'var(--label-tertiary)', font:'400 15px/1.4 var(--font-text)', padding:'30px 0' }}>{t('saved.noMatches')}</p>}
            {wordList.map(w => (
              <div key={w.key} style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 16px', background:'var(--vb-card)', borderRadius:16, border:'0.5px solid var(--vb-hair)', boxShadow:'var(--vb-shadow-sm)' }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'baseline', gap:8, flexWrap:'wrap' }}>
                    <span style={{ fontFamily: w.lang==='ko'?'var(--vb-serif-ko)':'var(--vb-serif)', fontWeight:600, fontSize:21, color:'var(--label-primary)', letterSpacing:'-0.2px' }}>{w.headword}</span>
                    {w.roman && <span style={{ font:'400 12px/1 var(--font-text)', color:'var(--label-tertiary)', fontStyle:'italic' }}>{w.roman}</span>}
                    <span style={{ marginLeft:'auto', font:'600 13px/1 var(--font-text)', color:'var(--vb-gold-ink)' }}>{w.trans || '—'}</span>
                  </div>
                  {w.def && w.def!==w.trans && <div style={{ font:'400 13.5px/1.4 var(--font-text)', color:'var(--label-secondary)', marginTop:6 }}>{w.def}</div>}
                  {w.savedAt && <div style={{ font:'500 11px/1 var(--font-text)', color:'var(--label-tertiary)', marginTop:8 }}>{t('saved.savedOn')} {w.savedAt}</div>}
                </div>
                <button type="button" onClick={() => onRemoveWord(w.key)} style={{ flexShrink:0, border:'none', background:'var(--vb-fill)', width:32, height:32, borderRadius:99, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'var(--label-tertiary)' }}><VBIcon name="close" size={16}/></button>
              </div>
            ))}
          </div>
          </>
        )
      )}
    </div>
  );
}

function SearchFieldWarm({ value, onChange, placeholder }) {
  const onPick = (e) => { const v = e.target.value; if (!v) return; const [y,m,d] = v.split('-').map(Number); onChange(new Date(y, m-1, d).toLocaleDateString('en-US', { month:'short', day:'numeric' })); };
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8, height:38, padding:'0 12px', borderRadius:12, background:'var(--vb-fill)', border:'0.5px solid var(--vb-hair)', position:'relative' }}>
      <span style={{ color:'var(--label-tertiary)' }}><VBIcon name="search" size={17}/></span>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ flex:1, minWidth:0, border:'none', outline:'none', background:'transparent', font:'400 16px/1 var(--font-text)', letterSpacing:'-0.2px', color:'var(--label-primary)' }} />
      {value && <button type="button" onClick={() => onChange('')} style={{ border:'none', background:'none', color:'var(--label-tertiary)', cursor:'pointer', padding:2, flexShrink:0 }}><VBIcon name="close" size={16}/></button>}
      {/* calendar icon with a transparent native date input layered on top — tapping opens the date picker */}
      <span style={{ position:'relative', flexShrink:0, width:24, height:24, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--vb-gold-ink)' }} title="날짜로 검색">
        <VBIcon name="calendar" size={17}/>
        <input type="date" onChange={onPick} aria-label="날짜로 검색"
          style={{ position:'absolute', inset:0, width:'100%', height:'100%', opacity:0, border:'none', padding:0, margin:0, cursor:'pointer' }} />
      </span>
    </div>
  );
}

// ── Verse Detail (pushed page) ──
function VerseDetailScreen({ verse, order, saved, note, learn, onWord, savedWords, isPaid, reflectAnswer, onReflect, onUpgrade, onStudy, onBack, onSave, onNote, onShare }) {
  const c = vbCategory(verse.cat);
  return (
    <div style={{ position:'absolute', top:0, left:0, right:0, bottom:84, background:'var(--vb-bg)', display:'flex', flexDirection:'column', animation:'vbPush .32s cubic-bezier(0.2,0.8,0.2,1)', zIndex:50 }}>
      <div style={{ flex:1, overflowY:'auto' }}>
        <VBImage cat={verse.cat} src={verse.img} radius={0} style={{ height:340 }}
          scrim={<div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, var(--vb-bg) 1%, rgba(28,22,17,0.10) 44%, rgba(28,22,17,0.34))' }} />}>
          <div style={{ position:'absolute', top:58, left:16 }}>
            <button type="button" onClick={onBack} style={{ border:'none', width:40, height:40, borderRadius:99, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#fff', background:'rgba(255,255,255,0.18)', backdropFilter:'blur(10px)', WebkitBackdropFilter:'blur(10px)' }}><VBIcon name="back" size={20}/></button>
          </div>
          <div style={{ position:'absolute', top:58, right:16 }}>
            <CatChip cat={verse.cat} onImage />
          </div>
        </VBImage>
        <div style={{ padding:'4px 24px 0', marginTop:-6 }}>
          <VerseBody verse={verse} order={order} size="lg" learn={learn} onWord={onWord} savedWords={savedWords} />
        </div>
        <div style={{ padding:'24px 20px 0' }}>
          <ActionBar saved={saved} isPaid={isPaid} onRefresh={null} onSave={onSave} onNote={onNote} onShare={onShare} />
        </div>
        <div style={{ padding:'18px 20px 0' }}>
          <StudyGuideCard isPaid={isPaid} onOpen={()=>onStudy(verse)} onUpgrade={()=>onUpgrade(t('sg.reason'))} />
        </div>
        {note != null && note !== '' && (
          <div style={{ padding:'18px 24px 0' }}>
            <div style={{ font:'600 12px/1 var(--font-text)', letterSpacing:'1.2px', textTransform:'uppercase', color:'var(--vb-gold-ink)', marginBottom:10 }}>Your note</div>
            <button type="button" onClick={onNote} style={{ width:'100%', textAlign:'left', display:'flex', gap:12, alignItems:'flex-start', padding:'16px 18px', borderRadius:18, background:'var(--vb-card)', border:'0.5px solid var(--vb-hair)', cursor:'pointer', boxShadow:'var(--vb-shadow-sm)' }}>
              <span style={{ color:'var(--vb-gold-ink)', flexShrink:0, marginTop:1 }}><VBIcon name="note" size={18}/></span>
              <span style={{ flex:1, font:'400 15px/1.5 var(--font-text)', color:'var(--label-primary)', fontStyle:'italic' }}>{note}</span>
              <span style={{ color:'var(--label-tertiary)', flexShrink:0 }}><VBIcon name="chevron" size={16}/></span>
            </button>
          </div>
        )}
        <div style={{ padding:'22px 24px 40px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, color:'var(--label-tertiary)' }}>
            <div style={{ flex:1, height:0.5, background:'var(--separator)' }} />
            <span style={{ font:'400 12px/1 var(--font-text)', letterSpacing:'0.4px' }}>Public domain translation · WEB / 개역</span>
            <div style={{ flex:1, height:0.5, background:'var(--separator)' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Note sheet ──
function NoteSheet({ verse, order, initial = '', onCancel, onSave }) {
  const { Button } = window.IOSDesignSystem_b2fbca;
  const [text, setText] = useStateL(initial);
  const [a] = vbOrder(verse, order);
  return (
    <VBSheet onClose={onCancel} maxH="90%">
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 20px 14px' }}>
        <button type="button" onClick={onCancel} style={{ border:'none', background:'none', cursor:'pointer', font:'400 17px/1 var(--font-text)', color:'var(--vb-gold-ink)' }}>Cancel</button>
        <span style={{ font:'600 17px/1 var(--font-text)', color:'var(--label-primary)' }}>{initial ? 'Edit Note' : 'Add Note'}</span>
        <button type="button" onClick={() => onSave(text)} style={{ border:'none', background:'none', cursor:'pointer', font:'600 17px/1 var(--font-text)', color:'var(--vb-gold-ink)' }}>Save</button>
      </div>
      <div style={{ padding:'0 20px' }}>
        <div style={{ display:'flex', gap:12, padding:'12px', background:'var(--vb-card)', borderRadius:16, border:'0.5px solid var(--vb-hair)', marginBottom:16 }}>
          <VBImage cat={verse.cat} src={verse.img} radius={11} style={{ width:50, height:50, flexShrink:0 }} />
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ font:'600 10px/1 var(--font-text)', letterSpacing:'1px', textTransform:'uppercase', color:'var(--vb-gold-ink)' }}>{a.ref}</div>
            <p style={{ margin:'5px 0 0', fontFamily:a.lang==='en'?'var(--vb-serif)':'var(--vb-serif-ko)', fontSize:14, lineHeight:1.35, color:'var(--label-secondary)', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{a.text}</p>
          </div>
        </div>
        <textarea autoFocus value={text} onChange={e => setText(e.target.value)} placeholder="Write your reflection, prayer, or language note…"
          style={{ width:'100%', minHeight:150, boxSizing:'border-box', resize:'none', border:'0.5px solid var(--vb-hair)', borderRadius:16, padding:'16px', background:'var(--vb-card)', font:'400 16px/1.5 var(--font-text)', color:'var(--label-primary)', outline:'none' }} />
        <div style={{ display:'flex', gap:7, flexWrap:'wrap', marginTop:12 }}>
          {['adversity = 역경', '오늘 나에게 필요한 말', 'Remember this'].map(s => (
            <button key={s} type="button" onClick={() => setText(t => t ? t : s)} style={{ padding:'7px 12px', borderRadius:99, border:'0.5px dashed var(--vb-hair)', background:'transparent', cursor:'pointer', font:'400 13px/1 var(--font-text)', color:'var(--label-tertiary)' }}>{s}</button>
          ))}
        </div>
      </div>
    </VBSheet>
  );
}

// ── Share sheet ──
function ShareSheet({ verse, order, isPaid, onEditor, onClose, onToast }) {
  const [a, b] = vbOrder(verse, order);
  const c = vbCategory(verse.cat);
  const opts = [
    { id:'image', label:'Save Image', icon:'share' },
    { id:'story', label:'Story',      icon:'sparkle' },
    { id:'link',  label:'Copy Link',  icon:'quote' },
    { id:'more',  label:'More',       icon:'grid' },
  ];
  return (
    <VBSheet onClose={onClose} maxH="92%">
      <div style={{ padding:'14px 20px 4px', textAlign:'center', font:'600 17px/1 var(--font-text)', color:'var(--label-primary)' }}>Share Verse Card</div>
      {/* mini share-card preview (9:16) */}
      <div style={{ padding:'16px 44px 8px' }}>
        <div style={{ borderRadius:18, overflow:'hidden', boxShadow:'var(--vb-shadow)', aspectRatio:'9 / 16' }}>
          <VBImage cat={verse.cat} src={verse.img} radius={18} style={{ width:'100%', height:'100%' }}
            scrim={<div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(28,22,17,0.86) 6%, rgba(28,22,17,0.10) 50%, rgba(28,22,17,0.42))' }} />}>
            <div style={{ position:'absolute', top:14, left:0, right:0, textAlign:'center', color:'rgba(255,255,255,0.92)' }}>
              <span style={{ display:'inline-flex', alignItems:'center', gap:6, font:'600 11px/1 var(--font-text)', letterSpacing:'1.4px', textTransform:'uppercase' }}><span style={{ color:'var(--vb-gold)' }}><VBIcon name="quote" size={13}/></span>{t('brand')}</span>
            </div>
            <div style={{ position:'absolute', left:18, right:18, bottom:20, textAlign:'center' }}>
              <div style={{ font:'600 9px/1 var(--font-text)', letterSpacing:'1.6px', textTransform:'uppercase', color:'var(--vb-gold)' }}>{c.label} · {c.ko}</div>
              <p style={{ margin:'9px 0 0', fontFamily:a.lang==='en'?'var(--vb-serif)':'var(--vb-serif-ko)', fontWeight:500, fontSize:16, lineHeight:1.32, color:'#fff' }}>{a.text}</p>
              <p style={{ margin:'8px 0 0', fontFamily:b.lang==='en'?'var(--vb-serif)':'var(--vb-serif-ko)', fontSize:12, lineHeight:1.4, color:'rgba(255,255,255,0.8)' }}>{b.text}</p>
              <div style={{ margin:'12px auto 0', width:30, height:0.5, background:'rgba(255,255,255,0.5)' }} />
              <div style={{ marginTop:9, font:'500 10px/1 var(--font-text)', letterSpacing:'1px', color:'rgba(255,255,255,0.78)' }}>{a.ref}</div>
            </div>
          </VBImage>
        </div>
      </div>
      <div style={{ padding:'4px 20px 0' }}>
        <button type="button" onClick={onEditor} style={{ width:'100%', height:50, borderRadius:14, border:'none', cursor:'pointer', background:'var(--vb-gold-ink)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', gap:9, font:'600 15px/1 var(--font-text)' }}>
          <VBIcon name="sparkle" size={17}/>{isPaid ? 'Premium card editor' : 'Premium card · add a message'}
        </button>
        <p style={{ textAlign:'center', margin:'8px 0 0', font:'400 12px/1.3 var(--font-text)', color:'var(--label-tertiary)' }}>Send the verse with your heart · 말씀에 마음을 담아 보내세요</p>
      </div>
      <div style={{ display:'flex', gap:10, padding:'12px 20px 8px' }}>
        {opts.map(o => (
          <button key={o.id} type="button" onClick={() => { onClose(); onToast({ text:o.id==='link'?'Link copied':o.id==='image'?'Saved to Photos':'Shared', icon:'check' }); }}
            style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:7, padding:'4px 0', border:'none', background:'none', cursor:'pointer', WebkitTapHighlightColor:'transparent' }}>
            <span style={{ width:52, height:52, borderRadius:18, background:'var(--vb-fill)', border:'0.5px solid var(--vb-hair)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--vb-gold-ink)' }}><VBIcon name={o.icon} size={22}/></span>
            <span style={{ font:'500 11px/1 var(--font-text)', color:'var(--label-secondary)' }}>{o.label}</span>
          </button>
        ))}
      </div>
      <div style={{ padding:'8px 20px 0' }}>
        <button type="button" onClick={onClose} style={{ width:'100%', height:50, borderRadius:14, border:'none', background:'var(--vb-card)', boxShadow:'var(--vb-shadow-sm)', cursor:'pointer', font:'600 17px/1 var(--font-text)', color:'var(--vb-gold-ink)' }}>Cancel</button>
      </div>
    </VBSheet>
  );
}

// ── Donate panel (choose any amount) ──
function DonatePanel({ onBack, onToast }) {
  const [amt, setAmt] = useStateL('5');
  const presets = ['3','5','10','20'];
  const valid = parseFloat(amt) > 0;
  return (
    <div style={{ position:'absolute', top:0, left:0, right:0, bottom:84, background:'var(--vb-bg)', display:'flex', flexDirection:'column', animation:'vbPush .32s cubic-bezier(0.2,0.8,0.2,1)', zIndex:58 }}>
      <div style={{ display:'flex', alignItems:'center', gap:14, padding:'58px 16px 10px' }}>
        <button type="button" onClick={onBack} style={{ border:'none', background:'var(--vb-fill)', width:38, height:38, borderRadius:99, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'var(--label-secondary)' }}><VBIcon name="back" size={20}/></button>
        <h1 style={{ margin:0, fontFamily:'var(--vb-serif)', fontWeight:600, fontSize:24, color:'var(--label-primary)' }}>{t('donate.title')}</h1>
      </div>
      <div style={{ flex:1, overflowY:'auto', padding:'10px 20px 36px' }}>
        <div style={{ display:'flex', justifyContent:'center', margin:'8px 0 18px' }}>
          <span style={{ width:64, height:64, borderRadius:19, background:'linear-gradient(135deg, var(--vb-gold), #8A6A3E)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff' }}><VBIcon name="heart" size={32} fill /></span>
        </div>
        <p style={{ margin:'0 0 22px', textAlign:'center', font:'400 14.5px/1.55 var(--font-text)', color:'var(--label-secondary)' }}>{t('donate.body')}</p>

        <div style={{ font:'600 12px/1 var(--font-text)', letterSpacing:'0.4px', textTransform:'uppercase', color:'var(--label-secondary)', marginBottom:10 }}>{t('donate.choose')}</div>
        <div style={{ display:'flex', gap:8, marginBottom:12 }}>
          {presets.map(a => {
            const on = amt === a;
            return (
              <button key={a} type="button" onClick={()=>setAmt(a)} style={{ flex:1, height:50, borderRadius:13, cursor:'pointer', font:'600 17px/1 var(--font-text)', WebkitTapHighlightColor:'transparent',
                background: on ? 'var(--vb-gold-ink)' : 'var(--vb-card)', color: on ? '#fff' : 'var(--vb-gold-ink)',
                border: on ? 'none' : '1px solid color-mix(in srgb, var(--vb-gold) 40%, transparent)' }}>${a}</button>
            );
          })}
        </div>
        {/* custom amount */}
        <div style={{ display:'flex', alignItems:'center', gap:8, height:52, padding:'0 16px', borderRadius:13, background:'var(--vb-card)', border:'1px solid var(--vb-hair)', marginBottom:22 }}>
          <span style={{ font:'600 19px/1 var(--font-text)', color:'var(--label-secondary)' }}>$</span>
          <input value={amt} onChange={e=>setAmt(e.target.value.replace(/[^0-9.]/g,''))} inputMode="decimal" placeholder={t('donate.custom')}
            style={{ flex:1, minWidth:0, border:'none', outline:'none', background:'transparent', font:'600 19px/1 var(--font-text)', color:'var(--label-primary)' }} />
        </div>

        <button type="button" disabled={!valid} onClick={()=>{ onBack(); onToast({ text:t('donate.thanks'), icon:'heart' }); }} style={{ width:'100%', height:52, borderRadius:14, border:'none', cursor: valid?'pointer':'default', opacity: valid?1:0.5, background:'var(--vb-gold-ink)', color:'#fff', font:'600 16px/1 var(--font-text)', display:'flex', alignItems:'center', justifyContent:'center', gap:9, WebkitTapHighlightColor:'transparent' }}>
          <VBIcon name="heart" size={18} fill />{valid ? t('donate.give').replace('{amt}', '$'+amt) : t('donate.cta')}
        </button>
        <p style={{ margin:'14px 0 0', textAlign:'center', font:'400 11.5px/1.4 var(--font-text)', color:'var(--label-tertiary)' }}>{t('donate.onetime')}</p>
      </div>
    </div>
  );
}

// ── Profile ──
function ProfileScreen({ prefs, setPrefs, dark, setDark, savedCount, wordCount = 0, learn, setLearn, appLang = 'en', setAppLang, verseOrderPref = 'auto', setVerseOrder, plan = 'free', onUpgrade, onPricing, onHistory, onJournal, onReplayOnboarding, onToast }) {
  const { ListSection, ListRow, Switch, SegmentedControl } = window.IOSDesignSystem_b2fbca;
  const learnLabel = t(VB_LEARN_LABEL[learn] || 'learn.en');
  const appLangLabel = appLang === 'ko' ? '한국어' : 'English';
  const [panel, setPanel] = useStateL(null); // null | 'applang' | 'learn'
  const tile = (name, bg) => (<span style={{ display:'flex', alignItems:'center', justifyContent:'center', color:'#fff' }}><VBIcon name={name} size={17}/></span>);

  // drill-in picker overlay
  const PickerPanel = ({ title, options, value, onPick }) => (
    <div style={{ position:'absolute', top:0, left:0, right:0, bottom:84, background:'var(--vb-bg)', display:'flex', flexDirection:'column', animation:'vbPush .32s cubic-bezier(0.2,0.8,0.2,1)', zIndex:58 }}>
      <div style={{ display:'flex', alignItems:'center', gap:14, padding:'58px 16px 10px' }}>
        <button type="button" onClick={()=>setPanel(null)} style={{ border:'none', background:'var(--vb-fill)', width:38, height:38, borderRadius:99, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'var(--label-secondary)' }}><VBIcon name="back" size={20}/></button>
        <h1 style={{ margin:0, fontFamily:'var(--vb-serif)', fontWeight:600, fontSize:24, color:'var(--label-primary)' }}>{title}</h1>
      </div>
      <div style={{ flex:1, overflowY:'auto', padding:'12px 16px 36px' }}>
        <ListSection>
          {options.map(o => (
            <ListRow key={o.id} icon={tile('sparkle')} iconBg={vbCategory('faith').tint}
              title={o.title} subtitle={o.sub}
              accessory={value === o.id ? 'check' : 'none'}
              onClick={() => { onPick(o.id); }} />
          ))}
        </ListSection>
      </div>
    </div>
  );

  if (panel === 'applang') return (
    <PickerPanel title={t('lang.pick')} value={appLang} onPick={(v)=>{ setAppLang(v); setPanel(null); }}
      options={[{ id:'en', title:'English', sub:t('lang.en.sub') }, { id:'ko', title:'한국어', sub:t('lang.ko.sub') }]} />
  );
  if (panel === 'learn') return (
    <PickerPanel title={t('learn.pick')} value={learn} onPick={(v)=>{ setLearn(v); setPanel(null); }}
      options={[
        { id:'en', title:t('learn.en'), sub:t('learn.en.sub') },
        { id:'ko', title:t('learn.ko'), sub:t('learn.ko.sub') },
        { id:'off', title:t('learn.off'), sub:t('learn.off.sub') },
      ]} />
  );
  if (panel === 'donate') return <DonatePanel onBack={()=>setPanel(null)} onToast={onToast} />;

  return (
    <div style={{ paddingBottom:30 }}>
      <VBHeader title={t('h.profile')} />
      {/* user card */}
      <div style={{ padding:'8px 16px 22px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:16, padding:'18px', background:'var(--vb-card)', borderRadius:20, border:'0.5px solid var(--vb-hair)', boxShadow:'var(--vb-shadow-sm)' }}>
          <div style={{ width:60, height:60, borderRadius:99, background:'linear-gradient(150deg, var(--vb-gold), #8A6A3E)', display:'flex', alignItems:'center', justifyContent:'center', font:'600 24px/1 var(--vb-serif)', color:'#fff', flexShrink:0 }}>은</div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ font:'600 19px/1.1 var(--font-text)', letterSpacing:'-0.3px', color:'var(--label-primary)' }}>Grace Eun</div>
            <div style={{ font:'400 14px/1.3 var(--font-text)', color:'var(--label-secondary)', marginTop:3 }}>{learnLabel}</div>
          </div>
          <div style={{ display:'flex', gap:14, flexShrink:0, paddingLeft:12, borderLeft:'0.5px solid var(--vb-hair)' }}>
            <div style={{ textAlign:'center' }}>
              <div style={{ font:'600 22px/1 var(--vb-serif)', color:'var(--vb-gold-ink)' }}>{savedCount}</div>
              <div style={{ font:'500 10px/1 var(--font-text)', color:'var(--label-tertiary)', marginTop:4 }}>{t('unit.verses')}</div>
            </div>
            <div style={{ textAlign:'center' }}>
              <div style={{ font:'600 22px/1 var(--vb-serif)', color:'var(--vb-gold-ink)' }}>{wordCount}</div>
              <div style={{ font:'500 10px/1 var(--font-text)', color:'var(--label-tertiary)', marginTop:4 }}>{t('unit.words')}</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding:'0 16px' }}>
        {/* subscription */}
        {plan === 'free' ? (
          <div onClick={()=>onUpgrade(null)} role="button" style={{ cursor:'pointer', borderRadius:20, padding:'20px', marginBottom:22, position:'relative', overflow:'hidden', background:'linear-gradient(150deg, #2A2017, #4A3A26)', boxShadow:'var(--vb-shadow)' }}>
            <div style={{ position:'absolute', right:-24, top:-24, width:96, height:96, borderRadius:99, background:'radial-gradient(circle, rgba(201,164,92,0.5), transparent 70%)' }} />
            <div style={{ position:'relative' }}>
              <PlusChip size="md" />
              <h3 style={{ margin:'12px 0 0', fontFamily:'var(--vb-serif)', fontWeight:600, fontSize:21, lineHeight:1.2, color:'#F4E9D8' }}>{t('sub.quietDeep')}</h3>
              <p style={{ margin:'7px 0 14px', font:'400 13.5px/1.45 var(--font-text)', color:'rgba(244,233,216,0.7)' }}>{t('sub.quietDeepSub')}</p>
              <span style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'10px 18px', borderRadius:12, background:'var(--vb-gold)', color:'#2A2017', font:'600 14px/1 var(--font-text)', whiteSpace:'nowrap' }}>{t('sub.tryPlus')}</span>
            </div>
          </div>
        ) : (
          <div style={{ display:'flex', alignItems:'center', gap:14, padding:'16px 18px', marginBottom:22, borderRadius:20, background:'var(--vb-card)', border:'1px solid var(--vb-gold)', boxShadow:'var(--vb-shadow-sm)' }}>
            <span style={{ width:44, height:44, borderRadius:13, background:'linear-gradient(135deg, var(--vb-gold), #8A6A3E)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', flexShrink:0 }}><VBIcon name="sparkle" size={22}/></span>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ font:'600 16px/1.1 var(--font-text)', color:'var(--label-primary)' }}>{plan==='lifetime' ? t('brandLifetime') : t('brandPlus')}</div>
              <div style={{ font:'400 13px/1.3 var(--font-text)', color:'var(--label-secondary)', marginTop:3 }}>{plan==='lifetime' ? t('sub.lifetime') : t('sub.active')}</div>
            </div>
            <button type="button" onClick={()=>onToast({text:t('row.manage'),icon:'gear'})} style={{ border:'none', background:'var(--vb-fill)', borderRadius:99, padding:'9px 14px', cursor:'pointer', font:'600 13px/1 var(--font-text)', color:'var(--vb-gold-ink)' }}>{t('row.manage')}</button>
          </div>
        )}

        <ListSection header={t('sec.language')} footer={t('language.footer')}>
          <ListRow icon={tile('globe')} iconBg="var(--vb-gold-ink)" title={t('row.appLanguage')}
            value={appLangLabel} accessory="chevron" onClick={()=>setPanel('applang')} />
          <ListRow icon={tile('sparkle')} iconBg={vbCategory('faith').tint} title={t('row.learningMode')}
            value={learnLabel} accessory="chevron" onClick={()=>setPanel('learn')} />
        </ListSection>

        <ListSection header={t('sec.reminder')} footer={t('reminder.footer')}>
          <ListRow icon={tile('bell')} iconBg={vbCategory('motivation').tint} title={t('row.dailyReminder')}
            trailing={<Switch checked={prefs.notifications} onChange={v => setPrefs(p=>({...p, notifications:v}))} tint="var(--vb-gold-ink)" />} />
          <ListRow icon={tile('today')} iconBg={vbCategory('hope').tint} title={t('row.reminderTime')} value="8:00 AM" accessory="chevron" onClick={() => onToast({ text:'8:00 AM', icon:'today' })} />
        </ListSection>

        <ListSection header={t('sec.about')} footer={t('brand')+' v2'}>
          <ListRow icon={tile('sparkle')} iconBg={vbCategory('gratitude').tint} title={t('row.about')} accessory="chevron" onClick={() => onToast({ text:t('brand'), icon:'sparkle' })} />
          <ListRow icon={tile('check')} iconBg={vbCategory('forgiveness').tint} title={t('row.terms')} accessory="chevron" onClick={() => onToast({ text:t('row.terms'), icon:'check' })} />
        </ListSection>

        {/* Donate to developer — compact */}
        <button type="button" onClick={()=>setPanel('donate')} style={{ width:'100%', display:'flex', alignItems:'center', gap:12, margin:'4px 0', padding:'14px 16px', borderRadius:16, cursor:'pointer', textAlign:'left', background:'var(--vb-card)', border:'0.5px solid var(--vb-hair)', boxShadow:'var(--vb-shadow-sm)', WebkitTapHighlightColor:'transparent' }}>
          <span style={{ width:34, height:34, borderRadius:10, background:'linear-gradient(135deg, var(--vb-gold), #8A6A3E)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', flexShrink:0 }}><VBIcon name="heart" size={17} fill /></span>
          <span style={{ flex:1, minWidth:0 }}>
            <span style={{ display:'block', font:'600 15px/1.2 var(--font-text)', color:'var(--label-primary)' }}>{t('donate.title')}</span>
            <span style={{ display:'block', font:'400 12.5px/1.35 var(--font-text)', color:'var(--label-secondary)', marginTop:2 }}>{t('donate.short')}</span>
          </span>
          <svg width="8" height="13" viewBox="0 0 8 13" fill="none" style={{ flexShrink:0 }}><path d="M1.5 1.5 6.5 6.5 1.5 11.5" stroke="var(--label-tertiary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </div>
    </div>
  );
}

// ── Word sheet (definition popover) ──
function WordSheet({ token, lang, saved, onToggleSave, onClose }) {
  const hit = vbLookup(token, lang);
  const headword = hit ? hit.headword : token.replace(/[^A-Za-z'\uAC00-\uD7A3]/g, '');
  const wordObj = {
    key: lang + ':' + headword, headword, lang,
    def: hit ? hit.def : '', trans: hit ? hit.trans : '', roman: hit ? hit.roman : null,
  };
  const targetFam = lang === 'ko' ? 'var(--vb-serif-ko)' : 'var(--vb-serif)';
  return (
    <VBSheet onClose={onClose} maxH="72%">
      <div style={{ padding:'10px 24px 28px' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
          <span style={{ font:'600 11px/1 var(--font-text)', letterSpacing:'1.4px', textTransform:'uppercase', color:'var(--vb-gold-ink)', whiteSpace:'nowrap' }}>{lang==='ko'?t('word.koWord'):t('word.enWord')}</span>
          <button type="button" onClick={onClose} style={{ border:'none', background:'var(--vb-fill)', width:32, height:32, borderRadius:99, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'var(--label-secondary)' }}><VBIcon name="close" size={16}/></button>
        </div>

        <div style={{ lineHeight:1.1 }}>
          <span style={{ fontFamily:targetFam, fontWeight:600, fontSize:40, color:'var(--label-primary)', letterSpacing:'-0.5px', verticalAlign:'middle' }}>{headword}</span>
          {hit && hit.roman && <span style={{ marginLeft:11, font:'400 16px/1 var(--font-text)', color:'var(--label-tertiary)', fontStyle:'italic', verticalAlign:'middle' }}>{hit.roman}</span>}
          {hit && hit.pos && <span style={{ marginLeft:11, display:'inline-block', font:'500 12px/1 var(--font-text)', color:'var(--label-secondary)', padding:'5px 10px', borderRadius:99, background:'var(--vb-fill)', verticalAlign:'middle' }}>{hit.pos}</span>}
        </div>

        {hit ? (
          <>
            <div style={{ display:'flex', alignItems:'center', gap:10, margin:'18px 0 14px' }}>
              <span style={{ font:'500 13px/1 var(--font-text)', letterSpacing:'0.5px', textTransform:'uppercase', color:'var(--label-tertiary)' }}>{lang==='ko'?'English':'한국어'}</span>
              <span style={{ fontFamily: lang==='ko'?'var(--vb-serif)':'var(--vb-serif-ko)', fontWeight:600, fontSize:22, color:'var(--vb-gold-ink)', whiteSpace:'nowrap' }}>{hit.trans}</span>
            </div>
            {hit.def && hit.def !== hit.trans && <p style={{ margin:0, font:'400 16px/1.5 var(--font-text)', color:'var(--label-secondary)' }}>{hit.def}</p>}
          </>
        ) : (
          <p style={{ margin:'18px 0 0', font:'400 15px/1.5 var(--font-text)', color:'var(--label-secondary)' }}>{t('word.noDef')}</p>
        )}

        <div style={{ marginTop:26 }}>
          <button type="button" onClick={() => onToggleSave(wordObj)} style={{
            width:'100%', height:52, borderRadius:14, border:'none', cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center', gap:9,
            font:'600 16px/1 var(--font-text)', WebkitTapHighlightColor:'transparent',
            background: saved ? 'var(--vb-fill)' : 'var(--vb-gold-ink)', color: saved ? 'var(--vb-gold-ink)' : '#fff',
            border: saved ? '0.5px solid var(--vb-hair)' : 'none',
          }}>
            <VBIcon name={saved?'check':'plus'} size={19}/>{saved ? t('word.saved') : t('word.save')}
          </button>
        </div>
      </div>
    </VBSheet>
  );
}

Object.assign(window, { SavedScreen, ProfileScreen, VerseDetailScreen, VBSheet, NoteSheet, ShareSheet, WordSheet });
