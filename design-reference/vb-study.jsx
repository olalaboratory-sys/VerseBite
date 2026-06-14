// vb-study.jsx — Study Guide (스터디 가이드): StudyGuideCard (collapsed) + StudyGuideScreen (overlay).
// Exports: StudyGuideCard, StudyGuideScreen, vbStudyNotes
const { useState: uSs } = React;

// Language & Meaning notes for the study guide, learn-mode aware.
// Learn English → English terms explained in Korean.
// Learn Korean → Korean terms explained in English.
// Off → null (study guide shows a short meaning note instead).
function vbStudyNotes(verse, learn) {
  if (!verse) return [];
  if (learn === 'en') {
    const toks = vbTokenize(verse.en, 'en').filter(t => t.word);
    const seen = new Set(); const out = [];
    for (const tk of toks) {
      const k = tk.text.toLowerCase().replace(/[^a-z']/g, '');
      if (seen.has(k)) continue; seen.add(k);
      const hit = vbLookup(tk.text, 'en');
      if (hit) out.push({ term: tk.text, gloss: hit.trans, explain: hit.def });
      if (out.length >= 4) break;
    }
    return out;
  }
  if (learn === 'ko') {
    const toks = vbTokenize(verse.ko, 'ko').filter(t => t.word);
    const seen = new Set(); const out = [];
    for (const tk of toks) {
      const hit = vbLookup(tk.text, 'ko');
      if (!hit || seen.has(hit.headword)) continue; seen.add(hit.headword);
      out.push({ term: hit.headword, gloss: hit.trans, explain: hit.def, roman: hit.roman });
      if (out.length >= 4) break;
    }
    return out;
  }
  return [];
}

// ── Collapsed entry card (below the verse). Locked for free users. ──
function StudyGuideCard({ isPaid, onOpen, onUpgrade }) {
  return (
    <div style={{ background:'var(--vb-card)', borderRadius:18, border:'0.5px solid var(--vb-hair)', boxShadow:'var(--vb-shadow-sm)', overflow:'hidden' }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, padding:'16px 18px 12px' }}>
        <span style={{ width:40, height:40, borderRadius:12, flexShrink:0, background:'linear-gradient(150deg, var(--vb-gold), #8A6A3E)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff' }}><VBIcon name="quote" size={20}/></span>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:7 }}>
            <span style={{ font:'700 16px/1.1 var(--font-text)', color:'var(--label-primary)', letterSpacing:'-0.2px' }}>{t('sg.title')}</span>
            {!isPaid && <PlusChip/>}
          </div>
          <div style={{ font:'400 12.5px/1.4 var(--font-text)', color:'var(--label-secondary)', marginTop:4 }}>{isPaid ? t('sg.subPlus') : t('sg.subFree')}</div>
        </div>
      </div>
      <button type="button" onClick={isPaid ? onOpen : onUpgrade} style={{
        width:'100%', height:48, border:'none', borderTop:'0.5px solid var(--vb-hair)', cursor:'pointer',
        display:'flex', alignItems:'center', justifyContent:'center', gap:8, WebkitTapHighlightColor:'transparent',
        background: isPaid ? 'var(--vb-gold-ink)' : 'var(--vb-fill)', color: isPaid ? '#fff' : 'var(--vb-gold-ink)',
        font:'600 15px/1 var(--font-text)',
      }}>
        <VBIcon name={isPaid ? 'quote' : 'sparkle'} size={17}/>{isPaid ? t('sg.ctaPlus') : t('sg.ctaFree')}
      </button>
    </div>
  );
}

// ── Section shell with expand/collapse ──
function SGSection({ icon, label, children, defaultOpen = true, accent }) {
  const [open, setOpen] = uSs(defaultOpen);
  return (
    <div style={{ background:'var(--vb-card)', borderRadius:18, border:'0.5px solid var(--vb-hair)', boxShadow:'var(--vb-shadow-sm)', overflow:'hidden' }}>
      <button type="button" onClick={() => setOpen(o=>!o)} style={{ width:'100%', display:'flex', alignItems:'center', gap:11, padding:'15px 18px', border:'none', background:'none', cursor:'pointer', WebkitTapHighlightColor:'transparent', textAlign:'left' }}>
        <span style={{ width:30, height:30, borderRadius:9, flexShrink:0, background: accent || 'var(--vb-gold-ink)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff' }}><VBIcon name={icon} size={16}/></span>
        <span style={{ flex:1, font:'600 15px/1.2 var(--font-text)', color:'var(--label-primary)' }}>{label}</span>
        <span style={{ color:'var(--label-tertiary)', transform: open?'rotate(90deg)':'none', transition:'transform .2s' }}><VBIcon name="chevron" size={16}/></span>
      </button>
      {open && <div style={{ padding:'0 18px 18px' }}>{children}</div>}
    </div>
  );
}

const sgBilingual = (en, ko, order) => order === 'ko' ? [ko, en] : [en, ko];

// Underline definable words in a passage + build a storybook-style glossary list.
function vbPassageGloss(text, lang) {
  const toks = vbTokenize(text, lang);
  const glossary = []; const seen = new Set();
  const rendered = toks.map((tk, i) => {
    if (!tk.word) return { k:i, text:tk.text, def:false };
    const hit = vbLookup(tk.text, lang);
    if (hit && !seen.has(hit.headword)) {
      seen.add(hit.headword);
      const explain = (hit.def && hit.def !== hit.trans) ? hit.def : '';
      glossary.push({ term: lang==='ko' ? hit.headword : tk.text.replace(/[^A-Za-z'\-]/g,''), gloss: hit.trans, explain, roman: hit.roman });
    }
    return { k:i, text:tk.text, def: !!hit };
  });
  return { rendered, glossary };
}

// ── Full Study Guide overlay ──
function StudyGuideScreen({ verse, order, learn, isPaid, journalText, onSaveJournal, gratitudeText, onSaveGratitude, studySaved, onSaveStudyGuide, onWord, onBack, onToast }) {
  const sg = vbStudyGuide(verse.id);
  const c = vbCategory(verse.cat);
  if (!sg) { return (
    <div style={{ position:'absolute', top:0, left:0, right:0, bottom:84, background:'var(--vb-bg)', zIndex:62, display:'flex', alignItems:'center', justifyContent:'center', padding:30 }}>
      <button type="button" onClick={onBack} style={{ position:'absolute', top:58, left:16, border:'none', background:'var(--vb-fill)', width:38, height:38, borderRadius:99, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'var(--label-secondary)' }}><VBIcon name="back" size={20}/></button>
      <p style={{ color:'var(--label-tertiary)', font:'400 15px/1.5 var(--font-text)', textAlign:'center' }}>{window.VB_LANG==='ko'?'이 말씀의 스터디 가이드는 곧 제공돼요.':'Study guide coming soon for this verse.'}</p>
    </div>
  ); }

  const notes = vbStudyNotes(verse, learn);
  // Scripture (verse + passage) follows the verse display order.
  // Explanatory prose follows the App Language, so the copy matches the interface.
  const pri = window.VB_LANG === 'ko' ? 'ko' : 'en';
  const [vA, vB] = sgBilingual(verse.en, verse.ko, order);
  const [rA, rB] = sgBilingual(verse.refEn, verse.refKo, order);
  const [pRefA] = sgBilingual(sg.pRefEn, sg.pRefKo, order);
  const [pA, pB] = sgBilingual(sg.pEn, sg.pKo, order);
  const ctx = sgBilingual(sg.ctxEn, sg.ctxKo, pri);
  const keys = pri === 'ko' ? sg.keyKo : sg.keyEn;
  const keysAlt = pri === 'ko' ? sg.keyEn : sg.keyKo;
  const reflects = pri === 'ko' ? sg.reflectKo : sg.reflectEn;
  const applies = pri === 'ko' ? sg.applyKo : sg.applyEn;
  const journalPrompt = pri === 'ko' ? sg.journalKo : sg.journalEn;
  const prayer = pri === 'ko' ? sg.prayerKo : sg.prayerEn;
  const fam = (txt) => /[\uAC00-\uD7A3]/.test(txt) ? 'var(--vb-serif-ko)' : 'var(--vb-serif)';
  const tintC = c ? c.tint : 'var(--vb-gold-ink)';
  // Full-passage language learning: both languages shown, learn-target line underlined + glossary.
  const passages = order === 'ko'
    ? [{ lang:'ko', text:sg.pKo }, { lang:'en', text:sg.pEn }]
    : [{ lang:'en', text:sg.pEn }, { lang:'ko', text:sg.pKo }];
  const pGloss = (learn !== 'off') ? vbPassageGloss(learn === 'en' ? sg.pEn : sg.pKo, learn) : null;
  const [showGloss, setShowGloss] = uSs(false);

  return (
    <div style={{ position:'absolute', top:0, left:0, right:0, bottom:84, background:'var(--vb-bg)', display:'flex', flexDirection:'column', animation:'vbPush .32s cubic-bezier(0.2,0.8,0.2,1)', zIndex:62 }}>
      {/* header */}
      <div style={{ display:'flex', alignItems:'center', gap:12, padding:'58px 16px 10px', borderBottom:'0.5px solid var(--vb-hair)', background:'var(--vb-bg)' }}>
        <button type="button" onClick={onBack} style={{ border:'none', background:'var(--vb-fill)', width:38, height:38, borderRadius:99, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'var(--label-secondary)', flexShrink:0 }}><VBIcon name="back" size={20}/></button>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:7 }}>
            <span style={{ font:'700 18px/1.1 var(--font-text)', color:'var(--label-primary)', whiteSpace:'nowrap' }}>{t('sg.title')}</span>
            <PlusChip/>
          </div>
          <div style={{ font:'500 12px/1 var(--font-text)', color:'var(--vb-gold-ink)', marginTop:3, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{vbCatName(c)} · {rA}</div>
        </div>
      </div>

      <div style={{ flex:1, overflowY:'auto' }}>
        <div style={{ padding:'16px 16px 40px', display:'flex', flexDirection:'column', gap:12 }}>
        {/* Selected Verse */}
        <div style={{ borderRadius:18, overflow:'hidden', boxShadow:'var(--vb-shadow-sm)', flexShrink:0 }}>
          <VBImage cat={verse.cat} src={verse.img} radius={18} style={{ minHeight:172 }}
            scrim={<div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(28,22,17,0.88) 8%, rgba(28,22,17,0.20) 64%, rgba(28,22,17,0.45))' }} />}>
            <div style={{ position:'absolute', top:12, left:12 }}><span style={{ font:'600 10px/1 var(--font-text)', letterSpacing:'1.2px', textTransform:'uppercase', color:'rgba(255,255,255,0.9)', whiteSpace:'nowrap' }}>{t('sg.selectedVerse')}</span></div>
            <div style={{ position:'absolute', left:16, right:16, bottom:14 }}>
              <p style={{ margin:0, fontFamily:fam(vA), fontWeight:500, fontSize:17, lineHeight:1.32, color:'#fff' }}>{vA}</p>
              <p style={{ margin:'6px 0 0', fontFamily:fam(vB), fontSize:13, lineHeight:1.4, color:'rgba(255,255,255,0.78)' }}>{vB}</p>
              <div style={{ marginTop:8, font:'600 10px/1 var(--font-text)', letterSpacing:'1px', textTransform:'uppercase', color:'var(--vb-gold)' }}>{rA} · {rB}</div>
            </div>
          </VBImage>
        </div>

        {/* Full Passage — bilingual + storybook glossary (language learning) */}
        <SGSection icon="quote" label={t('sg.fullPassage')} accent={tintC} defaultOpen={true}>
          <div style={{ font:'600 11px/1 var(--font-text)', letterSpacing:'0.8px', textTransform:'uppercase', color:'var(--vb-gold-ink)', marginBottom:10 }}>{pRefA}</div>
          {passages.map((p, idx) => (
            <React.Fragment key={p.lang}>
              {idx>0 && <div style={{ height:0.5, background:'var(--separator)', margin:'14px 0' }} />}
              <p style={{ margin:0, fontFamily:fam(p.text), fontWeight: idx===0?500:400, fontSize: idx===0?16:14.5, lineHeight: idx===0?1.6:1.65, color: idx===0?'var(--label-primary)':'var(--label-secondary)', textWrap:'pretty' }}>
                {(pGloss && p.lang===learn)
                  ? pGloss.rendered.map(tok => tok.def
                      ? <span key={tok.k} style={{ borderBottom:'1.5px solid color-mix(in srgb, var(--vb-gold-ink) 60%, transparent)', paddingBottom:1 }}>{tok.text}</span>
                      : <React.Fragment key={tok.k}>{tok.text}</React.Fragment>)
                  : p.text}
              </p>
            </React.Fragment>
          ))}
          {pGloss && pGloss.glossary.length>0 && (
            <div style={{ marginTop:15, paddingTop:13, borderTop:'0.5px solid var(--separator)' }}>
              <button type="button" onClick={()=>setShowGloss(s=>!s)} style={{ width:'100%', display:'flex', alignItems:'center', gap:8, border:'none', background:'none', cursor:'pointer', padding:0, WebkitTapHighlightColor:'transparent' }}>
                <span style={{ color:'var(--vb-gold-ink)' }}><VBIcon name="globe" size={14}/></span>
                <span style={{ font:'600 12px/1 var(--font-text)', letterSpacing:'0.3px', color:'var(--label-secondary)', whiteSpace:'nowrap' }}>{t('sg.notes')}</span>
                <span style={{ marginLeft:'auto', display:'inline-flex', alignItems:'center', gap:4, color:'var(--vb-gold-ink)', font:'600 12.5px/1 var(--font-text)', whiteSpace:'nowrap', flexShrink:0 }}>
                  {showGloss ? t('sg.hideWords') : t('sg.showWords')}
                  <span style={{ display:'inline-flex', transform: showGloss?'rotate(90deg)':'none', transition:'transform .2s' }}><VBIcon name="chevron" size={13}/></span>
                </span>
              </button>
              {showGloss && (
                <div style={{ display:'flex', flexDirection:'column', gap:11, marginTop:13 }}>
                  {pGloss.glossary.map((g, i) => (
                    <div key={i} style={{ display:'flex', gap:11, alignItems:'baseline', paddingBottom: i<pGloss.glossary.length-1?11:0, borderBottom: i<pGloss.glossary.length-1?'0.5px solid var(--separator)':'none' }}>
                      <span style={{ fontFamily: learn==='ko'?'var(--vb-serif-ko)':'var(--vb-serif)', fontWeight:600, fontSize:15.5, color:'var(--label-primary)', flexShrink:0, minWidth:84 }}>{g.term}</span>
                      <span style={{ flex:1, font:'400 14px/1.5 var(--font-text)', fontWeight:600, color:'var(--vb-gold-ink)' }}>{g.gloss}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </SGSection>

        {/* Context — single (app) language */}
        <SGSection icon="search" label={t('sg.context')} accent={tintC}>
          <p style={{ margin:0, font:'400 15px/1.6 var(--font-text)', color:'var(--label-primary)', textWrap:'pretty' }}>{ctx[0]}</p>
        </SGSection>

        {/* Key Message */}
        <SGSection icon="sparkle" label={t('sg.keyMessage')} accent={tintC}>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {keys.map((k, i) => (
              <div key={i} style={{ display:'flex', gap:11 }}>
                <span style={{ width:22, height:22, borderRadius:99, flexShrink:0, background:'color-mix(in srgb, '+tintC+' 18%, var(--vb-card))', color:'var(--vb-gold-ink)', display:'flex', alignItems:'center', justifyContent:'center', font:'700 12px/1 var(--font-text)' }}>{i+1}</span>
                <div style={{ flex:1 }}>
                  <p style={{ margin:0, fontFamily:fam(k), fontWeight:500, fontSize:15.5, lineHeight:1.4, color:'var(--label-primary)' }}>{k}</p>
                  <p style={{ margin:'3px 0 0', fontFamily:fam(keysAlt[i]||''), fontSize:12.5, lineHeight:1.4, color:'var(--label-tertiary)' }}>{keysAlt[i]}</p>
                </div>
              </div>
            ))}
          </div>
        </SGSection>

        {/* Reflection Questions + note */}
        <SGSection icon="note" label={t('sg.reflection')} accent={tintC}>
          <div style={{ display:'flex', flexDirection:'column', gap:13 }}>
            {reflects.map((q, i) => (
              <div key={i} style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                <span style={{ color:'var(--vb-gold-ink)', flexShrink:0, marginTop:2 }}><VBIcon name="sparkle" size={15}/></span>
                <p style={{ margin:0, fontFamily:fam(q), fontWeight:500, fontSize:15.5, lineHeight:1.45, color:'var(--label-primary)', textWrap:'pretty' }}>{q}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop:15, paddingTop:15, borderTop:'0.5px solid var(--separator)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:9 }}>
              <span style={{ color:'var(--vb-gold-ink)' }}><VBIcon name="note" size={14}/></span>
              <span style={{ font:'600 12px/1 var(--font-text)', letterSpacing:'0.3px', color:'var(--label-secondary)' }}>{t('sg.myNote')}</span>
            </div>
            <textarea value={journalText||''} onChange={e=>onSaveJournal(e.target.value)} placeholder={t('card.writeReflection')}
              style={{ width:'100%', minHeight:96, boxSizing:'border-box', resize:'none', border:'0.5px solid var(--vb-hair)', borderRadius:12, padding:'12px', background:'var(--vb-bg)', font:'400 15px/1.5 var(--font-text)', color:'var(--label-primary)', outline:'none' }} />
          </div>
        </SGSection>

        {/* Application Guide */}
        <SGSection icon="check" label={t('sg.application')} accent={tintC}>
          <div style={{ display:'flex', flexDirection:'column', gap:11 }}>
            {applies.map((a, i) => (
              <div key={i} style={{ display:'flex', gap:11, alignItems:'flex-start', padding:'11px 13px', background:'var(--vb-fill)', borderRadius:12, border:'0.5px solid var(--vb-hair)' }}>
                <span style={{ width:20, height:20, borderRadius:6, flexShrink:0, background:'var(--vb-card)', border:'0.5px solid var(--vb-hair)', color:'var(--vb-gold-ink)', display:'flex', alignItems:'center', justifyContent:'center', marginTop:1 }}><VBIcon name="check" size={13} strokeWidth={2.2}/></span>
                <p style={{ margin:0, fontFamily:fam(a), fontSize:14.5, lineHeight:1.45, color:'var(--label-primary)', textWrap:'pretty' }}>{a}</p>
              </div>
            ))}
          </div>
        </SGSection>

        {/* Gratitude note */}
        <SGSection icon="sparkle" label={t('sg.gratitudeNote')} accent={tintC} defaultOpen={false}>
          <p style={{ margin:'0 0 10px', font:'400 14.5px/1.45 var(--font-text)', fontStyle:'italic', color:'var(--label-secondary)' }}>{t('sg.gratitudePrompt')}</p>
          <textarea value={gratitudeText||''} onChange={e=>onSaveGratitude(e.target.value)} placeholder={t('sg.gratitudePrompt')}
            style={{ width:'100%', minHeight:88, boxSizing:'border-box', resize:'none', border:'0.5px solid var(--vb-hair)', borderRadius:12, padding:'12px', background:'var(--vb-bg)', font:'400 15px/1.5 var(--font-text)', color:'var(--label-primary)', outline:'none' }} />
        </SGSection>

        {/* Optional Prayer */}
        <SGSection icon="heart" label={t('sg.prayer')} accent={tintC} defaultOpen={false}>
          <div style={{ padding:'14px 16px', background:'linear-gradient(150deg, color-mix(in srgb, '+tintC+' 12%, var(--vb-bg)), var(--vb-bg))', borderRadius:14, border:'0.5px solid var(--vb-hair)' }}>
            <p style={{ margin:0, fontFamily:fam(prayer), fontWeight:500, fontSize:15.5, lineHeight:1.6, fontStyle:'italic', color:'var(--label-primary)', textWrap:'pretty' }}>{prayer}</p>
          </div>
        </SGSection>

        <div style={{ paddingTop:4 }}>
          <button type="button" onClick={onSaveStudyGuide} style={{
            width:'100%', height:52, borderRadius:14, border:'none', cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center', gap:9, WebkitTapHighlightColor:'transparent',
            font:'600 16px/1 var(--font-text)',
            background: studySaved ? 'var(--vb-fill)' : 'var(--vb-gold-ink)', color: studySaved ? 'var(--vb-gold-ink)' : '#fff',
            boxShadow: studySaved ? 'none' : '0 6px 16px color-mix(in srgb, var(--vb-gold) 26%, transparent)',
          }}>
            <VBIcon name="bookmark" size={18} fill={studySaved}/>{studySaved ? t('sg.savedState') : t('sg.save')}
          </button>
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:10, color:'var(--label-tertiary)', padding:'8px 4px 0' }}>
          <div style={{ flex:1, height:0.5, background:'var(--separator)' }} />
          <span style={{ font:'400 11px/1 var(--font-text)', letterSpacing:'0.4px' }}>{t('brand')} · {pri==='ko'?'개역 · WEB':'WEB · 개역'}</span>
          <div style={{ flex:1, height:0.5, background:'var(--separator)' }} />
        </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { StudyGuideCard, StudyGuideScreen, vbStudyNotes });
