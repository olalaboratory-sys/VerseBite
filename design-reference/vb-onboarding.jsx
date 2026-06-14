// vb-onboarding.jsx — VerseBite onboarding (Welcome → Language → Category → Notification)
// Exports: VBOnboarding
const { useState: useStateOb, useEffect: useEffectOb } = React;

function ObDots({ step, total }) {
  return (
    <div style={{ display:'flex', gap:7, justifyContent:'center' }}>
      {Array.from({ length:total }).map((_, i) => (
        <span key={i} style={{
          width: i===step?20:7, height:7, borderRadius:99,
          background: i===step ? 'var(--vb-gold)' : 'var(--vb-hair)', transition:'all .3s',
        }} />
      ))}
    </div>
  );
}

function SelectCard({ active, onClick, title, sub, accent }) {
  return (
    <button type="button" onClick={onClick} style={{
      width:'100%', textAlign:'left', display:'flex', alignItems:'center', gap:14, padding:'18px 18px',
      borderRadius:18, cursor:'pointer', WebkitTapHighlightColor:'transparent',
      background:'var(--vb-card)', transition:'all .2s',
      border: active ? '1.5px solid var(--vb-gold)' : '1.5px solid var(--vb-hair)',
      boxShadow: active ? '0 6px 18px color-mix(in srgb, var(--vb-gold) 26%, transparent)' : 'var(--vb-shadow-sm)',
    }}>
      <div style={{ flex:1 }}>
        <div style={{ font:'600 18px/1.2 var(--font-text)', letterSpacing:'-0.3px', color:'var(--label-primary)' }}>{title}</div>
        {sub && <div style={{ font:'400 14px/1.35 var(--font-text)', color:'var(--label-secondary)', marginTop:4 }}>{sub}</div>}
      </div>
      <span style={{
        width:26, height:26, borderRadius:99, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center',
        background: active ? 'var(--vb-gold)' : 'transparent', border: active ? 'none' : '1.5px solid var(--vb-hair)',
        color:'#fff',
      }}>{active && <VBIcon name="check" size={16} strokeWidth={2.4}/>}</span>
    </button>
  );
}

function VBOnboarding({ onDone, setStatusDark }) {
  const { Button } = window.IOSDesignSystem_b2fbca;
  const [step, setStep] = useStateOb(0);
  const [lang, setLang] = useStateOb('en');
  const [applang, setApplang] = useStateOb('en');
  const [notif, setNotif] = useStateOb(true);
  const [cats, setCats] = useStateOb(() => new Set(['hope','gratitude','faith']));
  window.VB_LANG = applang; // onboarding localizes live to the chosen app language
  const L = applang === 'ko';

  useEffectOb(() => { setStatusDark(step === 0); }, [step]);

  const toggleCat = (id) => {
    setCats(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };
  const finish = (plan) => onDone({
    appLang: applang,
    learningMode: lang,
    primaryLang: lang === 'off' ? 'both' : lang,
    order: lang === 'ko' ? 'ko' : 'en',
    verseOrder: 'auto',
    categories: Array.from(cats),
    notifications: notif,
    plan,
  });

  // ── Step 0 — Welcome (full-bleed cinematic) ──
  if (step === 0) {
    return (
      <div style={{ position:'absolute', inset:0 }}>
        <VBImage cat="hope" src={vbImg2('hope',1)} radius={0} style={{ position:'absolute', inset:0 }}
          scrim={<div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom, rgba(28,22,17,0.42) 0%, rgba(28,22,17,0.10) 38%, rgba(28,22,17,0.78) 100%)' }} />} />
        <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', justifyContent:'space-between', padding:'92px 28px 48px', zIndex:2 }}>
          <div style={{ display:'flex', alignItems:'center', gap:9, color:'rgba(255,255,255,0.92)' }}>
            <span style={{ color:'var(--vb-gold)' }}><VBIcon name="quote" size={22}/></span>
            <span style={{ font:'600 16px/1 var(--font-text)', letterSpacing:'1px' }}>{applang==='ko'?'말씀한입':'VerseBite'}</span>
          </div>
          <div>
            <div style={{ font:'600 13px/1 var(--font-text)', letterSpacing:'2px', textTransform:'uppercase', color:'var(--vb-gold)', marginBottom:18 }}>Daily Bilingual Devotion</div>
            <h1 style={{ margin:0, fontFamily:'var(--vb-serif)', fontWeight:600, fontSize:50, lineHeight:1.02, color:'#fff', letterSpacing:'0.5px' }}>A quiet word<br/>to begin<br/>your day.</h1>
            <p style={{ margin:'18px 0 0', font:'400 17px/1.5 var(--font-text)', color:'rgba(255,255,255,0.82)', maxWidth:300 }}>Daily Bible verses in English and Korean, paired with cinematic imagery to reflect and learn.</p>
            <div style={{ marginTop:30 }}>
              <Button variant="filled" size="lg" full onClick={() => setStep(1)} style={{ fontWeight:600 }}>Get Started</Button>
            </div>
            <p style={{ margin:'16px 0 0', textAlign:'center', font:'400 13px/1.4 var(--font-text)', color:'rgba(255,255,255,0.6)' }}>매일 영어와 한국어로 만나는 성경 한 구절</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Steps 1–3 share the ivory chrome ──
  const Frame = ({ children, footer }) => (
    <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', background:'var(--vb-bg)' }}>
      <div style={{ display:'flex', alignItems:'center', gap:16, padding:'66px 20px 12px' }}>
        <button type="button" onClick={() => setStep(s => s-1)} style={{ border:'none', background:'var(--vb-fill)', width:38, height:38, borderRadius:99, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'var(--label-secondary)' }}>
          <VBIcon name="back" size={20}/>
        </button>
        <div style={{ flex:1 }}><ObDots step={step-1} total={5} /></div>
        <div style={{ width:38 }} />
      </div>
      <div style={{ flex:1, overflowY:'auto', padding:'8px 24px 16px' }}>{children}</div>
      <div style={{ padding:'12px 24px', paddingBottom:46, background:'linear-gradient(to top, var(--vb-bg) 70%, transparent)' }}>{footer}</div>
    </div>
  );

  const Title = ({ t, s }) => (
    <div style={{ marginBottom:26 }}>
      <h1 style={{ margin:0, fontFamily:'var(--vb-serif)', fontWeight:600, fontSize:30, lineHeight:1.15, letterSpacing:'-0.2px', color:'var(--label-primary)' }}>{t}</h1>
      <p style={{ margin:'10px 0 0', font:'400 15px/1.45 var(--font-text)', color:'var(--label-secondary)' }}>{s}</p>
    </div>
  );

  // ── Step 1 — App Language ──
  if (step === 1) {
    return (
      <Frame footer={<Button variant="filled" size="lg" full onClick={() => setStep(2)}>{L?'계속':'Continue'}</Button>}>
        <Title t={L?'앱을 어떤 언어로 사용할까요?':'What language for the app?'} s={L?'메뉴, 버튼, 카테고리, 설정 등 앱 인터페이스 언어예요. 학습할 언어와는 별개입니다.':'Sets the interface — menus, buttons, settings. Separate from the language you learn.'} />
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <SelectCard active={applang==='en'} onClick={()=>setApplang('en')} title="English" sub="Use the app in English" />
          <SelectCard active={applang==='ko'} onClick={()=>setApplang('ko')} title="한국어" sub="앱을 한국어로 사용하기" />
        </div>
      </Frame>
    );
  }

  // ── Step 2 — Learning mode ──
  if (step === 2) {
    return (
      <Frame footer={<Button variant="filled" size="lg" full onClick={() => setStep(3)}>{L?'계속':'Continue'}</Button>}>
        <Title t={L?'언어 학습은 어떻게 할까요?':'How do you want to learn?'} s={L?'선택한 학습 언어가 카드 위쪽에 표시돼요. 말씀 속 단어를 눌러 뜻을 보고 저장할 수 있어요.':'Your learning language leads on each card. Tap words in the main verse to see their meaning and save them.'} />
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <SelectCard active={lang==='en'}  onClick={()=>setLang('en')}  title={L?'영어 학습':'Learn English'} sub="영어 단어와 표현을 한국어로 설명해드려요" />
          <SelectCard active={lang==='ko'}  onClick={()=>setLang('ko')}  title={L?'한국어 학습':'Learn Korean'} sub="Korean words explained in English · tap to learn" />
          <SelectCard active={lang==='off'} onClick={()=>setLang('off')} title={L?'학습 끄기':'Just reading'} sub={L?'학습 노트 없이 조용하게 말씀만 볼래요':'Show both languages, no word lookups'} />
        </div>
      </Frame>
    );
  }

  // ── Step 3 — Categories ──
  if (step === 3) {
    return (
      <Frame footer={
        <Button variant="filled" size="lg" full disabled={cats.size===0} onClick={() => setStep(4)}>
          {cats.size>0 ? (L?`계속 · ${cats.size}개 선택`:`Continue · ${cats.size} chosen`) : (L?'하나 이상 선택하세요':'Choose at least one')}
        </Button>}>
        <Title t={L?'어떤 말씀이 마음에 닿나요?':'What speaks to your heart?'} s={L?'받고 싶은 주제를 선택하세요. 모든 카테고리는 나중에 둘러볼 수 있어요.':"Choose the themes you'd like to receive. You can browse every category later."} />
        <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
          {VB_CATEGORIES.map(c => {
            const on = cats.has(c.id);
            return (
              <button key={c.id} type="button" onClick={() => toggleCat(c.id)} style={{
                display:'flex', alignItems:'center', gap:8, padding:'11px 15px', borderRadius:999, cursor:'pointer', WebkitTapHighlightColor:'transparent',
                font:'500 15px/1 var(--font-text)', letterSpacing:'-0.2px', transition:'all .18s',
                background: on ? 'color-mix(in srgb, '+c.tint+' 22%, var(--vb-card))' : 'var(--vb-card)',
                border: on ? '1.5px solid '+c.tint : '1.5px solid var(--vb-hair)',
                color: on ? 'color-mix(in srgb, '+c.tint+' 62%, #2A211A)' : 'var(--label-secondary)',
              }}>
                <span style={{ width:9, height:9, borderRadius:99, background:c.tint, opacity:on?1:0.4 }} />
                {vbCatName(c)}
                <span style={{ opacity:0.6, fontSize:13 }}>{vbCatSecondary(c)}</span>
              </button>
            );
          })}
        </div>
      </Frame>
    );
  }

  // ── Step 4 — Notification ──
  if (step === 4) {
  return (
    <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', background:'var(--vb-bg)' }}>
      <div style={{ display:'flex', alignItems:'center', gap:16, padding:'66px 20px 12px' }}>
        <button type="button" onClick={() => setStep(3)} style={{ border:'none', background:'var(--vb-fill)', width:38, height:38, borderRadius:99, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'var(--label-secondary)' }}><VBIcon name="back" size={20}/></button>
        <div style={{ flex:1 }}><ObDots step={3} total={5} /></div>
        <div style={{ width:38 }} />
      </div>
      <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', padding:'0 30px' }}>
        <div style={{ position:'relative', width:128, height:128, marginBottom:34 }}>
          <div style={{ position:'absolute', inset:0, borderRadius:'40px', background:'linear-gradient(150deg, var(--vb-gold), #8A6A3E)', boxShadow:'0 16px 40px color-mix(in srgb, var(--vb-gold) 40%, transparent)' }} />
          <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff' }}><VBIcon name="bell" size={56} strokeWidth={1.5}/></div>
          <div style={{ position:'absolute', top:-4, right:-2, width:30, height:30, borderRadius:99, background:'#fff', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 12px rgba(0,0,0,0.16)', font:'600 13px/1 var(--font-text)', color:'var(--vb-gold-ink)' }}>8</div>
        </div>
        <h1 style={{ margin:0, fontFamily:'var(--vb-serif)', fontWeight:600, fontSize:30, lineHeight:1.2, color:'var(--label-primary)', maxWidth:300 }}>{L?'아침을 말씀으로 시작해보세요':'Start your morning with a verse'}</h1>
        <p style={{ margin:'14px 0 0', font:'400 16px/1.5 var(--font-text)', color:'var(--label-secondary)', maxWidth:290 }}>{L?<>VerseBite가 매일 아침 <b style={{ color:'var(--label-primary)', fontWeight:600 }}>8:00</b>에 새로운 말씀을 전해드려요. 당신을 위한 조용한 시간이에요.</>:<>VerseBite refreshes your daily verse every morning at <b style={{ color:'var(--label-primary)', fontWeight:600 }}>8:00 AM</b>. A gentle moment, kept just for you.</>}</p>
      </div>
      <div style={{ padding:'12px 24px 46px', display:'flex', flexDirection:'column', gap:6 }}>
        <Button variant="filled" size="lg" full onClick={() => { setNotif(true); setStep(5); }}>{L?'매일 알림 켜기':'Enable Daily Reminder'}</Button>
        <Button variant="plain" size="lg" full onClick={() => { setNotif(false); setStep(5); }}>{L?'다음에 할게요':'Maybe later'}</Button>
      </div>
    </div>
  );
  }

  // ── Step 5 — Plan preview ──
  const planCards = [
    { id:'free', name:L?'무료':'Free', tag:L?'매일의 이중언어 말씀 카드, 저장, 메모, 기본 공유.':'A daily bilingual verse card, saving, notes & basic sharing.', price:'$0', cta:L?'무료로 시작':'Continue free' },
    { id:'plus', name:L?'말씀한입 플러스':'VerseBite Plus', tag:L?'광고 없이 · 무제한 새로고침 · AI 묵상 · 학습 노트 · 프리미엄 카드.':'Ad-free, unlimited refresh, AI reflection, learning notes & premium cards.', price:'$2.99/mo · $19.99/yr', cta:L?'플러스 시작':'Start Plus', hot:true },
    { id:'lifetime', name:L?'평생 이용':'Lifetime', tag:L?'한 번의 결제로 평생 조용한 말씀 경험을.':'One purchase. A lifetime of quiet daily verses.', price:'$29.99 once', cta:L?'평생 잠금 해제':'Unlock Lifetime' },
  ];
  return (
    <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', background:'var(--vb-bg)' }}>
      <div style={{ display:'flex', alignItems:'center', gap:16, padding:'66px 20px 12px' }}>
        <button type="button" onClick={() => setStep(4)} style={{ border:'none', background:'var(--vb-fill)', width:38, height:38, borderRadius:99, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'var(--label-secondary)' }}><VBIcon name="back" size={20}/></button>
        <div style={{ flex:1 }}><ObDots step={4} total={5} /></div>
        <div style={{ width:38 }} />
      </div>
      <div style={{ flex:1, overflowY:'auto', padding:'8px 22px 16px' }}>
        <h1 style={{ margin:0, fontFamily:'var(--vb-serif)', fontWeight:600, fontSize:29, lineHeight:1.15, letterSpacing:'-0.2px', color:'var(--label-primary)' }}>{L?'어떻게 시작할까요?':'Choose how you’ll begin'}</h1>
        <p style={{ margin:'9px 0 20px', font:'400 15px/1.45 var(--font-text)', color:'var(--label-secondary)' }}>{L?'무료로 시작하거나 Plus로 더 조용하고 깊게. 언제든 바꿀 수 있어요.':'Start free, or go quieter and deeper with Plus. You can change anytime.'}</p>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {planCards.map(p => (
            <button key={p.id} type="button" onClick={() => finish(p.id)} style={{ textAlign:'left', cursor:'pointer', borderRadius:18, padding:'18px', position:'relative', overflow:'hidden',
              border: p.hot ? 'none' : '1.5px solid var(--vb-hair)',
              background: p.hot ? 'linear-gradient(150deg, #2A2017, #4A3A26)' : 'var(--vb-card)',
              boxShadow: p.hot ? 'var(--vb-shadow)' : 'var(--vb-shadow-sm)' }}>
              {p.hot && <div style={{ position:'absolute', right:-24, top:-24, width:90, height:90, borderRadius:99, background:'radial-gradient(circle, rgba(201,164,92,0.45), transparent 70%)' }} />}
              <div style={{ position:'relative' }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ font:'700 17px/1 var(--font-text)', color: p.hot ? '#F4E9D8' : 'var(--label-primary)' }}>{p.name}</span>
                  {p.hot && <PlusChip/>}
                </div>
                <p style={{ margin:'8px 0 12px', font:'400 13px/1.45 var(--font-text)', color: p.hot ? 'rgba(244,233,216,0.72)' : 'var(--label-secondary)' }}>{p.tag}</p>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <span style={{ font:'600 14px/1 var(--font-text)', color: p.hot ? 'var(--vb-gold)' : 'var(--vb-gold-ink)' }}>{p.price}</span>
                  <span style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'9px 16px', borderRadius:11, font:'600 13px/1 var(--font-text)', background: p.hot ? 'var(--vb-gold)' : 'var(--vb-fill)', color: p.hot ? '#2A2017' : 'var(--vb-gold-ink)' }}>{p.cta}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
        <p style={{ textAlign:'center', font:'400 11px/1.4 var(--font-text)', color:'var(--label-tertiary)', padding:'16px 16px 0', margin:0 }}>You can start free and upgrade later from Profile.</p>
      </div>
    </div>
  );
}

// local alias to vbImg (not exported globally)
function vbImg2(cat, i){ const a = window.VB_IMAGES[cat] || window.VB_IMAGES.hope; return a[i % a.length]; }

window.VBOnboarding = VBOnboarding;
