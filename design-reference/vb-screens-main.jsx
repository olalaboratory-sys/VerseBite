// vb-screens-main.jsx — Today, Categories, Category Detail
// Exports: TodayScreen, CategoriesScreen, CategoryDetailScreen, VerseRow

function BrandRow({ right }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'2px 20px 0' }}>
      <div style={{ display:'flex', alignItems:'center', gap:7, color:'var(--label-primary)' }}>
        <span style={{ color:'var(--vb-gold-ink)' }}><VBIcon name="quote" size={18}/></span>
        <span style={{ font:'600 14px/1 var(--font-text)', letterSpacing:'0.6px' }}>{t('brand')}</span>
      </div>
      {right}
    </div>
  );
}

// ── Today ──
function TodayScreen({ verse, order, layout, saved, learn, onWord, savedWords, isPaid, onUpgrade, onStudy, resonance, onResonance, streak, onRefresh, onSave, onNote, onShare, onOpenVerse, onPickCategory }) {
  if (!verse) return null;
  return (
    <div style={{ paddingBottom:30 }}>
      <BrandRow right={<span style={{ font:'500 13px/1 var(--font-text)', color:'var(--label-secondary)', letterSpacing:'0.2px', whiteSpace:'nowrap', flexShrink:0 }}>{vbFormatDateL()}</span>} />
      <div style={{ padding:'14px 20px 14px' }}>
        <h1 style={{ margin:0, fontFamily:'var(--vb-serif)', fontWeight:600, fontSize:33, lineHeight:1.06, letterSpacing:'0.2px', color:'var(--label-primary)' }}>{vbGreetingL()}.</h1>
        <p style={{ margin:'7px 0 0', font:'400 15px/1.4 var(--font-text)', color:'var(--label-secondary)' }}>{t('today.sub')}</p>
      </div>
      {/* category picker rail */}
      <div style={{ display:'flex', gap:8, overflowX:'auto', padding:'0 16px 16px' }}>
        {VB_CATEGORIES.map(c => {
          const on = c.id === verse.cat;
          return (
            <button key={c.id} type="button" onClick={() => onPickCategory(c.id)} style={{
              flexShrink:0, display:'flex', alignItems:'center', gap:7, padding:'8px 14px', borderRadius:999, cursor:'pointer', WebkitTapHighlightColor:'transparent', whiteSpace:'nowrap',
              font:`${on?600:500} 13px/1 var(--font-text)`, letterSpacing:'-0.1px', border:'0.5px solid var(--vb-hair)', transition:'all .15s',
              background: on ? 'color-mix(in srgb, '+c.tint+' 22%, var(--vb-card))' : 'var(--vb-card)',
              color: on ? 'color-mix(in srgb, '+c.tint+' 64%, #2A211A)' : 'var(--label-secondary)',
              borderColor: on ? c.tint : 'var(--vb-hair)',
            }}>
              <span style={{ width:7, height:7, borderRadius:99, background:c.tint, opacity:on?1:0.45 }} />{vbCatName(c)}
            </button>
          );
        })}
      </div>
      <div style={{ padding:'0 16px' }}>
        <div key={verse.id} className="vb-fade-in" onClick={() => onOpenVerse(verse)} role="button">
          <VerseCard verse={verse} layout={layout} order={order} learn={learn} onWord={onWord} savedWords={savedWords} />
        </div>
        <div style={{ marginTop:20 }}>
          <ActionBar saved={saved} isPaid={isPaid} onRefresh={onRefresh} onSave={onSave} onNote={onNote} onShare={onShare} />
        </div>
        <div style={{ marginTop:14 }}>
          <DailyResonance value={resonance} onPick={onResonance} streak={streak} />
        </div>
        <div style={{ marginTop:14 }}>
          <StudyGuideCard isPaid={isPaid} onOpen={()=>onStudy(verse)} onUpgrade={()=>onUpgrade(t('sg.reason'))} />
        </div>
        {!isPaid && (
          <button type="button" onClick={()=>onUpgrade(null)} style={{ marginTop:14, width:'100%', display:'flex', alignItems:'center', gap:10, padding:'12px 14px', borderRadius:14, border:'0.5px dashed var(--vb-hair)', background:'var(--vb-fill)', cursor:'pointer', textAlign:'left' }}>
            <span style={{ width:34, height:34, borderRadius:9, background:'var(--vb-card)', border:'0.5px solid var(--vb-hair)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--label-tertiary)', flexShrink:0 }}><VBIcon name="sparkle" size={16}/></span>
            <span style={{ flex:1 }}>
              <span style={{ display:'block', font:'600 13px/1.2 var(--font-text)', color:'var(--label-secondary)' }}>Sponsored</span>
              <span style={{ display:'block', font:'400 12px/1.3 var(--font-text)', color:'var(--label-tertiary)', marginTop:2 }}>{t('sub.tryPlus')}</span>
            </span>
            <span style={{ font:'600 12px/1 var(--font-text)', color:'var(--vb-gold-ink)', flexShrink:0 }}>Remove</span>
          </button>
        )}
      </div>
    </div>
  );
}

// ── Categories ──
function CategoriesScreen({ gridStyle = 'cards', onOpenCategory }) {
  return (
    <div style={{ paddingBottom:30 }}>
      <VBHeader kicker={t('h.explore')} title={t('h.byTheme')} subtitle={t('h.exploreSub')} />
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, padding:'8px 16px 0' }}>
        {VB_CATEGORIES.map(c => {
          const count = vbVersesByCat(c.id).length;
          if (gridStyle === 'tiles') {
            return (
              <button key={c.id} type="button" onClick={() => onOpenCategory(c.id)} style={cellBtn}>
                <VBImage cat={c.id} src={vbImgM(c.id,0)} radius={20} style={{ height:148 }}
                  scrim={<div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(28,22,17,0.80), rgba(28,22,17,0.05) 64%)' }} />}>
                  <div style={{ position:'absolute', top:10, right:10 }}>
                    <span style={countChipImg}>{count}</span>
                  </div>
                  <div style={{ position:'absolute', left:13, right:13, bottom:12 }}>
                    <div style={{ font:'700 17px/1.1 var(--font-text)', color:'#fff', letterSpacing:'-0.2px' }}>{vbCatName(c)}</div>
                    <div style={{ font:'500 13px/1.2 var(--font-text)', color:'rgba(255,255,255,0.78)', marginTop:3 }}>{vbCatSecondary(c)} · {window.VB_LANG==='ko'?c.koMsg:c.msg}</div>
                  </div>
                </VBImage>
              </button>
            );
          }
          if (gridStyle === 'blocks') {
            return (
              <button key={c.id} type="button" onClick={() => onOpenCategory(c.id)} style={{ ...cellBtn, borderRadius:20, padding:'16px 15px 15px', minHeight:150, position:'relative', overflow:'hidden', display:'flex', flexDirection:'column', justifyContent:'space-between', textAlign:'left', background:`linear-gradient(150deg, ${c.grad[0]}, ${c.grad[1]})`, boxShadow:'var(--vb-shadow-sm)' }}>
                <div style={{ position:'absolute', right:-18, top:-18, width:84, height:84, borderRadius:99, background:'rgba(255,255,255,0.14)' }} />
                <div style={{ position:'relative', color:'rgba(255,255,255,0.92)' }}><VBIcon name={catIcon(c.id)} size={22}/></div>
                <div style={{ position:'relative' }}>
                  <div style={{ font:'700 18px/1.1 var(--font-text)', color:'#fff' }}>{vbCatName(c)}</div>
                  <div style={{ fontFamily:'var(--vb-serif-ko)', fontWeight:500, fontSize:14, color:'rgba(255,255,255,0.86)', marginTop:2 }}>{vbCatSecondary(c)}</div>
                  <div style={{ font:'500 12px/1.35 var(--font-text)', color:'rgba(255,255,255,0.82)', marginTop:7 }}>{window.VB_LANG==='ko'?c.koMsg:c.msg}</div>
                </div>
              </button>
            );
          }
          // 'cards' — thumbnail card (default)
          return (
            <button key={c.id} type="button" onClick={() => onOpenCategory(c.id)} style={{ ...cellBtn, background:'var(--vb-card)', borderRadius:20, border:'0.5px solid var(--vb-hair)', boxShadow:'var(--vb-shadow-sm)', overflow:'hidden', textAlign:'left' }}>
              <VBImage cat={c.id} src={vbImgM(c.id,0)} style={{ height:84 }} />
              <div style={{ padding:'12px 14px 14px' }}>
                <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', gap:6 }}>
                  <div style={{ font:'700 16px/1.1 var(--font-text)', color:'var(--label-primary)', letterSpacing:'-0.2px' }}>{vbCatName(c)}</div>
                  <div style={{ font:'500 12px/1 var(--font-text)', color:'var(--vb-gold-ink)' }}>{vbCatSecondary(c)}</div>
                </div>
                <div style={{ font:'400 12.5px/1.35 var(--font-text)', color:'var(--label-secondary)', marginTop:6, minHeight:34 }}>{window.VB_LANG==='ko'?c.koMsg:c.msg}</div>
                <div style={{ display:'flex', alignItems:'center', gap:5, marginTop:8, font:'500 11px/1 var(--font-text)', color:'var(--label-tertiary)' }}>
                  <span style={{ width:5, height:5, borderRadius:99, background:c.tint }} />{count} {t('unit.verses')}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Compact verse row (used in category detail + saved) ──
function VerseRow({ verse, order = 'en', saved, note, savedDate, guide, onOpen, onToggleSave }) {
  const [a, b] = vbOrder(verse, order);
  return (
    <button type="button" onClick={onOpen} style={{
      width:'100%', display:'flex', gap:14, padding:'14px 16px', textAlign:'left', cursor:'pointer',
      background:'var(--vb-card)', border:'none', WebkitTapHighlightColor:'transparent',
    }}>
      <VBImage cat={verse.cat} src={verse.img} radius={14} style={{ width:66, height:66, flexShrink:0 }} />
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:7 }}>
          <CatChip cat={verse.cat} size="sm" />
          <span style={{ font:'600 11px/1 var(--font-text)', letterSpacing:'0.8px', textTransform:'uppercase', color:'var(--vb-gold-ink)' }}>{window.VB_LANG==='ko'?verse.refKo:verse.refEn}</span>
        </div>
        <p style={{ margin:'6px 0 0', fontFamily:a.lang==='en'?'var(--vb-serif)':'var(--vb-serif-ko)', fontWeight:500, fontSize:15, lineHeight:1.34, color:'var(--label-primary)', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{a.text}</p>
        <p style={{ margin:'5px 0 0', fontFamily:b.lang==='en'?'var(--vb-serif)':'var(--vb-serif-ko)', fontSize:13, lineHeight:1.4, color:'var(--label-secondary)', display:'-webkit-box', WebkitLineClamp:1, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{b.text}</p>
        {note && <div style={{ marginTop:8, display:'flex', gap:7, alignItems:'flex-start', padding:'7px 10px', background:'var(--vb-fill)', borderRadius:10, border:'0.5px solid var(--vb-hair)' }}>
          <span style={{ color:'var(--vb-gold-ink)', flexShrink:0, marginTop:1 }}><VBIcon name="note" size={13}/></span>
          <span style={{ font:'400 12.5px/1.4 var(--font-text)', color:'var(--label-secondary)', fontStyle:'italic', display:'-webkit-box', WebkitLineClamp:1, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{note}</span>
        </div>}
        {guide && <div style={{ marginTop:8, display:'inline-flex', alignItems:'center', gap:5, padding:'4px 9px', borderRadius:99, background:'color-mix(in srgb, var(--vb-gold) 16%, var(--vb-card))', border:'0.5px solid color-mix(in srgb, var(--vb-gold) 30%, transparent)' }}><span style={{ color:'var(--vb-gold-ink)', display:'inline-flex' }}><VBIcon name="quote" size={11}/></span><span style={{ font:'600 10.5px/1 var(--font-text)', color:'var(--vb-gold-ink)' }}>{t('sg.includesGuide')}</span></div>}
        {savedDate && <div style={{ marginTop:7, font:'500 11px/1 var(--font-text)', color:'var(--label-tertiary)' }}>{t('saved.savedOn')} {savedDate}</div>}
      </div>
      {onToggleSave && (
        <span role="button" onClick={(e)=>{ e.stopPropagation(); onToggleSave(verse.id); }} style={{ flexShrink:0, padding:4, color: saved ? 'var(--vb-gold-ink)' : 'var(--label-tertiary)', alignSelf:'flex-start' }}>
          <VBIcon name="bookmark" size={21} fill={saved}/>
        </span>
      )}
    </button>
  );
}

// ── Category Detail ──
function CategoryDetailScreen({ cat, order, savedSet, notes, onBack, onOpenVerse, onToggleSave }) {
  const { SegmentedControl } = window.IOSDesignSystem_b2fbca;
  const c = vbCategory(cat);
  const [sort, setSort] = React.useState('recent');
  let verses = vbVersesByCat(cat);
  if (sort === 'random') verses = [...verses].sort(() => Math.random() - 0.5);
  if (sort === 'saved')  verses = [...verses].sort((x,y) => (savedSet.has(y.id)?1:0) - (savedSet.has(x.id)?1:0));

  return (
    <div style={{ position:'absolute', top:0, left:0, right:0, bottom:84, background:'var(--vb-bg)', display:'flex', flexDirection:'column', animation:'vbPush .32s cubic-bezier(0.2,0.8,0.2,1)', zIndex:40 }}>
      <div style={{ flex:1, overflowY:'auto' }}>
        {/* banner */}
        <VBImage cat={cat} src={vbImgM(cat,1)} radius={0} style={{ height:248 }}
          scrim={<div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(28,22,17,0.86), rgba(28,22,17,0.18) 62%, rgba(28,22,17,0.42))' }} />}>
          <div style={{ position:'absolute', top:58, left:16 }}>
            <button type="button" onClick={onBack} style={glassBack}><VBIcon name="back" size={20}/></button>
          </div>
          <div style={{ position:'absolute', left:22, right:22, bottom:20 }}>
            <div style={{ fontFamily:'var(--vb-serif-ko)', fontWeight:500, fontSize:15, color:'var(--vb-gold)', letterSpacing:'1px' }}>{vbCatSecondary(c)}</div>
            <h1 style={{ margin:'4px 0 0', fontFamily:'var(--vb-serif)', fontWeight:600, fontSize:36, lineHeight:1, color:'#fff', letterSpacing:'0.3px' }}>{vbCatName(c)}</h1>
            <p style={{ margin:'10px 0 0', font:'400 15px/1.4 var(--font-text)', color:'rgba(255,255,255,0.84)', maxWidth:300 }}>{window.VB_LANG==='ko'?c.koMsg:c.msg}</p>
          </div>
        </VBImage>
        {/* sort */}
        <div style={{ padding:'16px 16px 6px' }}>
          <SegmentedControl value={sort} onChange={setSort} options={[{value:'recent',label:t('cat.recent')},{value:'saved',label:t('cat.mostSaved')},{value:'random',label:t('cat.random')}]} />
        </div>
        {/* list */}
        <div style={{ padding:'8px 16px 36px' }}>
          <div style={{ background:'var(--vb-card)', borderRadius:18, overflow:'hidden', border:'0.5px solid var(--vb-hair)', boxShadow:'var(--vb-shadow-sm)' }}>
            {verses.map((v, i) => (
              <React.Fragment key={v.id}>
                {i>0 && <div style={{ height:0.5, background:'var(--separator)', marginLeft:96 }} />}
                <VerseRow verse={v} order={order} saved={savedSet.has(v.id)} note={notes[v.id]} onOpen={() => onOpenVerse(v)} onToggleSave={onToggleSave} />
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// shared style atoms
const cellBtn = { border:'none', padding:0, cursor:'pointer', WebkitTapHighlightColor:'transparent', background:'transparent', display:'block' };
const countChipImg = { display:'inline-flex', alignItems:'center', justifyContent:'center', minWidth:24, height:24, padding:'0 8px', borderRadius:99, background:'rgba(255,255,255,0.22)', backdropFilter:'blur(8px)', color:'#fff', font:'600 12px/1 var(--font-text)', border:'0.5px solid rgba(255,255,255,0.35)' };
const glassBack = { border:'none', width:40, height:40, borderRadius:99, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#fff', background:'rgba(255,255,255,0.18)', backdropFilter:'blur(10px)', WebkitBackdropFilter:'blur(10px)' };
function vbImgM(cat, i){ const a = window.VB_IMAGES[cat] || window.VB_IMAGES.hope; return a[i % a.length]; }
function catIcon(id){ return ({ friendship:'heart', love:'heart', family:'today', motivation:'sun', faith:'sparkle', forgiveness:'check', gratitude:'sparkle', hope:'sun', wisdom:'quote' })[id] || 'sparkle'; }

Object.assign(window, { TodayScreen, CategoriesScreen, CategoryDetailScreen, VerseRow });
