// vb-shared.jsx — shared VerseBite UI primitives.
// Exports: VBImage, CatChip, VerseBody, VerseCard, ActionBar, ReflectionPrompt,
//          VBTabBar, VBToast, VBHeader, vbOrder
const { useState, useEffect } = React;

// language order helper → [primary, secondary] keyed for a verse
function vbOrder(verse, order) {
  const en = { lang:'en', text:verse.en, ref:verse.refEn };
  const ko = { lang:'ko', text:verse.ko, ref:verse.refKo };
  return order === 'ko' ? [ko, en] : [en, ko];
}

// ── Image with gradient fallback + fade-in (never looks broken) ──
function VBImage({ cat, src, style = {}, children, scrim = null, radius }) {
  const c = vbCategory(cat) || { grad:['#C9A45C','#8A6A3E'] };
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  return (
    <div style={{
      position:'relative', overflow:'hidden', borderRadius: radius,
      background:`linear-gradient(150deg, ${c.grad[0]}, ${c.grad[1]})`,
      ...style,
    }}>
      {!failed && (
        <img src={src} alt="" onLoad={() => setLoaded(true)} onError={() => setFailed(true)}
          style={{
            position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover',
            opacity: loaded ? 1 : 0, transition:'opacity .6s ease',
          }} />
      )}
      {/* subtle warm wash unifies stock photos with the brand */}
      <div style={{ position:'absolute', inset:0, background:'linear-gradient(160deg, rgba(201,164,92,0.10), rgba(58,47,40,0.06))', mixBlendMode:'multiply' }} />
      {scrim}
      {children}
    </div>
  );
}

// ── Category chip (pill) ──
function CatChip({ cat, onImage = false, size = 'md' }) {
  const c = vbCategory(cat);
  if (!c) return null;
  const pad = size === 'sm' ? '5px 11px' : '7px 14px';
  const fs = size === 'sm' ? 12 : 13;
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:7, padding:pad, borderRadius:999,
      font:`600 ${fs}px/1 var(--font-text)`, letterSpacing:'0.2px', whiteSpace:'nowrap',
      background: onImage ? 'rgba(255,255,255,0.18)' : 'color-mix(in srgb, '+c.tint+' 20%, var(--vb-card))',
      color: onImage ? '#fff' : 'color-mix(in srgb, '+c.tint+' 65%, #2A211A)',
      border: onImage ? '0.5px solid rgba(255,255,255,0.35)' : '0.5px solid color-mix(in srgb, '+c.tint+' 35%, transparent)',
      backdropFilter: onImage ? 'blur(8px)' : 'none', WebkitBackdropFilter: onImage ? 'blur(8px)' : 'none',
    }}>
      <span style={{ width:6, height:6, borderRadius:99, background: onImage ? '#fff' : c.tint, opacity: onImage?0.9:1 }} />
      {vbCatName(c)}
    </span>
  );
}

// ── Verse text block (EN + KO in chosen order) ──
function VerseBody({ verse, order = 'en', light = false, size = 'lg', align = 'left', learn = 'off', onWord, savedWords }) {
  const [a, b] = vbOrder(verse, order);
  const enSize = size === 'lg' ? 25 : size === 'md' ? 21 : 18;
  const koSize = size === 'lg' ? 18 : size === 'md' ? 16 : 15;
  const sz = (l) => (l === 'en' ? enSize : koSize);
  const fam = (l) => (l === 'en' ? 'var(--vb-serif)' : 'var(--vb-serif-ko)');
  const primary = light ? 'rgba(255,255,255,0.96)' : 'var(--label-primary)';
  const secondary = light ? 'rgba(255,255,255,0.74)' : 'var(--label-secondary)';
  const gold = light ? 'rgba(255,255,255,0.82)' : 'var(--vb-gold-ink)';
  const Ref = ({ children }) => (
    <div style={{ font:'600 12px/1 var(--font-text)', letterSpacing:'1.4px', textTransform:'uppercase', color:gold, marginTop:9 }}>{children}</div>
  );
  const renderText = (item, isPrimary) => {
    const tappable = learn && learn !== 'off' && item.lang === learn && onWord;
    if (!tappable) return item.text;
    return vbTokenize(item.text, item.lang).map((tok, i) => {
      if (!tok.word) return <React.Fragment key={i}>{tok.text}</React.Fragment>;
      const hit = vbLookup(tok.text, item.lang);
      const key = hit ? item.lang + ':' + hit.headword : null;
      const isSaved = key && savedWords && savedWords.has(key);
      return (
        <span key={i} className={'vb-word' + (light ? ' vb-word-light' : '')}
          data-known={hit ? 1 : undefined} data-saved={isSaved ? 1 : undefined}
          onClick={(e) => { e.stopPropagation(); onWord(tok.text, item.lang); }}>{tok.text}</span>
      );
    });
  };
  const Line = ({ item, isPrimary }) => (
    <div>
      <p style={{
        margin:0, fontFamily:fam(item.lang), fontWeight: item.lang==='en'?500:500,
        fontSize:sz(item.lang), lineHeight: item.lang==='en'?1.34:1.5,
        letterSpacing: item.lang==='en'?'0.1px':'-0.1px',
        color: isPrimary ? primary : secondary, textWrap:'pretty', textAlign:align,
      }}>{renderText(item, isPrimary)}</p>
      <Ref>{item.ref}</Ref>
    </div>
  );
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
      <Line item={a} isPrimary={true} />
      <div style={{ height:0.5, background: light?'rgba(255,255,255,0.22)':'var(--separator)', width: align==='center'?48:'100%', margin: align==='center'?'2px auto':0 }} />
      <Line item={b} isPrimary={false} />
    </div>
  );
}

// ── The signature verse card — three layouts ──
function VerseCard({ verse, layout = 'editorial', order = 'en', onImageTap, learn = 'off', onWord, savedWords }) {
  const c = vbCategory(verse.cat);
  const radius = 'var(--vb-radius)';
  const bodyProps = { learn, onWord, savedWords };

  if (layout === 'fullbleed') {
    return (
      <div style={{ borderRadius:radius, boxShadow:'var(--vb-shadow)', overflow:'hidden' }}>
        <VBImage cat={verse.cat} src={verse.img} radius={radius}
          style={{ minHeight:476 }}
          scrim={<div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(28,22,17,0.82) 4%, rgba(28,22,17,0.30) 42%, rgba(28,22,17,0.04) 70%)' }} />}>
          <div style={{ position:'absolute', top:16, left:16 }}><CatChip cat={verse.cat} onImage /></div>
          <div style={{ position:'absolute', left:0, right:0, bottom:0, padding:'0 22px 24px' }}>
            <VerseBody verse={verse} order={order} light size="lg" {...bodyProps} />
          </div>
        </VBImage>
      </div>
    );
  }

  if (layout === 'stacked') {
    return (
      <div style={{ position:'relative', paddingBottom:2 }}>
        <VBImage cat={verse.cat} src={verse.img} radius={radius} style={{ height:286, boxShadow:'var(--vb-shadow)' }}
          scrim={<div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom, rgba(28,22,17,0.18), transparent 36%)' }} />} >
          <div style={{ position:'absolute', top:16, left:16 }}><CatChip cat={verse.cat} onImage /></div>
        </VBImage>
        <div style={{
          margin:'-46px 14px 0', position:'relative', background:'var(--vb-card)', borderRadius:'calc(var(--vb-radius) - 4px)',
          padding:'26px 22px 24px', boxShadow:'var(--vb-shadow)', border:'0.5px solid var(--vb-hair)',
        }}>
          <VerseBody verse={verse} order={order} size="md" {...bodyProps} />
        </div>
      </div>
    );
  }

  // editorial (default)
  return (
    <div style={{ background:'var(--vb-card)', borderRadius:radius, overflow:'hidden', boxShadow:'var(--vb-shadow)', border:'0.5px solid var(--vb-hair)' }}>
      <VBImage cat={verse.cat} src={verse.img} style={{ height:214 }} />
      <div style={{ padding:'18px 20px 22px' }}>
        <div style={{ marginBottom:16 }}><CatChip cat={verse.cat} /></div>
        <VerseBody verse={verse} order={order} size="md" {...bodyProps} />
      </div>
    </div>
  );
}

// ── Action bar (refresh / save / note / share) ──
function ActionBar({ saved, isPaid = true, onRefresh, onSave, onNote, onShare }) {
  const Btn = ({ icon, label, active, locked, onClick }) => (
    <button type="button" onClick={onClick} style={{
      flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:6, padding:'10px 0',
      border:'none', background:'none', cursor:'pointer', WebkitTapHighlightColor:'transparent',
      color: active ? 'var(--vb-gold-ink)' : 'var(--label-secondary)',
    }}
      onPointerDown={(e)=>e.currentTarget.style.opacity='.55'} onPointerUp={(e)=>e.currentTarget.style.opacity='1'} onPointerLeave={(e)=>e.currentTarget.style.opacity='1'}>
      <span style={{
        position:'relative', width:46, height:46, borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center',
        background: active ? 'color-mix(in srgb, var(--vb-gold) 24%, var(--vb-card))' : 'var(--vb-fill)',
        border:'0.5px solid var(--vb-hair)', transition:'background .2s',
      }}>{icon}
        {locked && <span style={{ position:'absolute', top:-4, right:-4, width:18, height:18, borderRadius:99, background:'var(--vb-gold-ink)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center' }}><VBIcon name="sparkle" size={10}/></span>}
      </span>
      <span style={{ font:'500 11px/1 var(--font-text)', letterSpacing:'0.2px' }}>{label}</span>
    </button>
  );
  return (
    <div style={{ display:'flex', gap:4 }}>
      {onRefresh && <Btn icon={<VBIcon name="refresh" size={22}/>} label={t('act.refresh')} locked={!isPaid} onClick={onRefresh} />}
      <Btn icon={<VBIcon name="bookmark" size={22} fill={saved}/>} label={saved?t('act.saved'):t('act.save')} active={saved} onClick={onSave} />
      <Btn icon={<VBIcon name="note" size={22}/>} label={t('act.note')} onClick={onNote} />
      <Btn icon={<VBIcon name="share" size={22}/>} label={t('act.share')} onClick={onShare} />
    </div>
  );
}

// ── Daily resonance (one-tap "how does this verse meet you today?") ──
function DailyResonance({ value, onPick, streak = 0 }) {
  const feelings = [
    { id:'comfort',   icon:'heart',   label:t('pulse.comfort') },
    { id:'courage',   icon:'sun',     label:t('pulse.courage') },
    { id:'gratitude', icon:'sparkle', label:t('pulse.gratitude') },
    { id:'peace',     icon:'moon',    label:t('pulse.peace') },
    { id:'challenge', icon:'check',   label:t('pulse.challenge') },
  ];
  const picked = !!value;
  return (
    <div style={{ padding:'15px 16px 14px', background:'var(--vb-fill)', borderRadius:18, border:'0.5px solid var(--vb-hair)' }}>
      <div style={{ display:'flex', alignItems:'center', gap:9, marginBottom:13 }}>
        <span style={{ color:'var(--vb-gold-ink)', flexShrink:0, opacity:.9 }}><VBIcon name={picked?'check':'sparkle'} size={18}/></span>
        <span style={{ flex:1, font:'500 14.5px/1.35 var(--font-text)', color:'var(--label-secondary)', letterSpacing:'-0.1px' }}>{picked ? t('pulse.done') : t('pulse.q')}</span>
        {streak > 0 && (
          <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'5px 10px', borderRadius:999, background:'color-mix(in srgb, var(--vb-gold) 18%, var(--vb-card))', color:'var(--vb-gold-ink)', font:'600 12px/1 var(--font-text)', whiteSpace:'nowrap' }}>
            <VBIcon name="sun" size={13}/>{streak} {streak===1?t('pulse.streak1'):t('pulse.streakN')}
          </span>
        )}
      </div>
      <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
        {feelings.map(f => {
          const on = value === f.id;
          return (
            <button key={f.id} type="button" onClick={() => onPick(f.id)} style={{
              flex:'1 1 0', minWidth:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:5,
              height:60, padding:'0 4px', borderRadius:14, cursor:'pointer', WebkitTapHighlightColor:'transparent', transition:'all .15s',
              background: on ? 'var(--vb-gold-ink)' : 'var(--vb-card)',
              border: on ? '1.5px solid var(--vb-gold-ink)' : '1px solid var(--vb-hair)',
              color: on ? '#fff' : 'var(--label-secondary)',
              boxShadow: on ? '0 4px 12px color-mix(in srgb, var(--vb-gold) 26%, transparent)' : 'none',
            }}>
              <VBIcon name={f.icon} size={19} strokeWidth={on?2:1.7}/>
              <span style={{ font:`${on?600:500} 11.5px/1 var(--font-text)`, letterSpacing:'-0.2px', whiteSpace:'nowrap' }}>{f.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Custom warm tab bar (sits above iOS home indicator) ──
function VBTabBar({ active, onChange }) {
  const tabs = [
    { id:'today', label:t('tab.today'), icon:'today' },
    { id:'calendar', label:t('tab.calendar'), icon:'calendar' },
    { id:'badges', label:t('tab.badges'), icon:'award' },
    { id:'saved', label:t('tab.saved'), icon:'bookmark' },
    { id:'profile', label:t('tab.profile'), icon:'person' },
  ];
  return (
    <div style={{
      paddingBottom:34, background:'color-mix(in srgb, var(--vb-card) 86%, transparent)',
      backdropFilter:'blur(18px) saturate(160%)', WebkitBackdropFilter:'blur(18px) saturate(160%)',
      borderTop:'0.5px solid var(--vb-hair)',
    }}>
      <div style={{ height:50, display:'flex' }}>
        {tabs.map(t => {
          const on = t.id === active;
          return (
            <button key={t.id} type="button" onClick={() => onChange(t.id)} style={{
              flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:3.5,
              border:'none', background:'none', cursor:'pointer', WebkitTapHighlightColor:'transparent',
              color: on ? 'var(--vb-gold-ink)' : 'var(--label-tertiary)',
            }}>
              <VBIcon name={t.icon} size={25} fill={on && t.id==='saved'} strokeWidth={on?1.9:1.7}/>
              <span style={{ font:`${on?600:500} 10px/1 var(--font-text)`, letterSpacing:'0.1px' }}>{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Toast ──
function VBToast({ toast }) {
  if (!toast) return null;
  return (
    <div style={{
      position:'absolute', left:'50%', bottom:104, transform:'translateX(-50%)', zIndex:90,
      display:'flex', alignItems:'center', gap:9, padding:'11px 18px', borderRadius:999, whiteSpace:'nowrap',
      background:'rgba(37,34,31,0.92)', color:'#F8F2E8', backdropFilter:'blur(8px)',
      font:'500 14px/1 var(--font-text)', letterSpacing:'-0.1px', boxShadow:'0 8px 24px rgba(0,0,0,0.22)',
      animation:'vbToast .3s cubic-bezier(0.2,0.9,0.3,1)',
    }}>
      {toast.icon && <span style={{ color:'var(--vb-gold)' }}><VBIcon name={toast.icon} size={17}/></span>}
      {toast.text}
    </div>
  );
}

// ── Large-title screen header (warm, replaces iOS NavBar for tabs) ──
function VBHeader({ kicker, title, subtitle, right }) {
  return (
    <div style={{ padding:'8px 20px 10px' }}>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12 }}>
        <div style={{ flex:1, minWidth:0 }}>
          {kicker && <div style={{ font:'600 12px/1 var(--font-text)', letterSpacing:'1.6px', textTransform:'uppercase', color:'var(--vb-gold-ink)', marginBottom:8 }}>{kicker}</div>}
          <h1 style={{ margin:0, fontFamily:'var(--vb-serif)', fontWeight:600, fontSize:34, lineHeight:1.05, letterSpacing:'0.2px', color:'var(--label-primary)' }}>{title}</h1>
          {subtitle && <p style={{ margin:'7px 0 0', font:'400 15px/1.4 var(--font-text)', color:'var(--label-secondary)', letterSpacing:'-0.2px' }}>{subtitle}</p>}
        </div>
        {right && <div style={{ flexShrink:0, paddingTop:2 }}>{right}</div>}
      </div>
    </div>
  );
}

Object.assign(window, { vbOrder, VBImage, CatChip, VerseBody, VerseCard, ActionBar, DailyResonance, VBTabBar, VBToast, VBHeader });
