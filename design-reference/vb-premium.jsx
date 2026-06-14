// vb-premium.jsx — monetization layer: plans, paywall, pricing, premium share
// editor, AI reflection questions, language-learning notes, history, journal.
// Exports: VB_REFLECT, vbLearnNotes, PlusChip, ReflectionCard, LearnNotesCard,
//          PaywallSheet, PricingScreen, ShareEditorScreen, HistoryScreen, JournalScreen
const { useState: uSp } = React;

// per-category AI reflection question (gentle, bilingual)
const VB_REFLECT = {
  friendship:{ en:'Who has been a steady friend to you lately, and how can you thank them?', ko:'최근 당신 곁을 지켜준 친구는 누구였나요? 어떻게 감사를 전할 수 있을까요?' },
  love:      { en:'Where can you show patience and kindness to someone today?', ko:'오늘 누구에게 오래 참고 친절함을 보일 수 있을까요?' },
  family:    { en:'What is one small way to bring peace to your home today?', ko:'오늘 가정에 평안을 더할 작은 한 가지는 무엇일까요?' },
  motivation:{ en:'What is one step you can take again today, even a small one?', ko:'오늘 다시 내디딜 수 있는 작은 한 걸음은 무엇인가요?' },
  faith:     { en:'Where do you need to trust God even without seeing the way?', ko:'길이 보이지 않아도 하나님을 신뢰해야 할 곳은 어디인가요?' },
  forgiveness:{ en:'Is there something you can begin to release today?', ko:'오늘 내려놓기 시작할 수 있는 것이 있나요?' },
  gratitude: { en:'What small grace today do you not want to overlook?', ko:'오늘 무심코 지나치고 싶지 않은 작은 은혜는 무엇인가요?' },
  hope:      { en:'Where do you need to remember that your story is not over?', ko:'당신의 이야기가 끝나지 않았음을 기억해야 할 곳은 어디인가요?' },
  wisdom:    { en:'What choice today is asking for discernment?', ko:'오늘 분별이 필요한 선택은 무엇인가요?' },
};

// build 2–3 bilingual learning notes from the verse's English text
function vbLearnNotes(verse) {
  const toks = vbTokenize(verse.en, 'en').filter(t => t.word);
  const seen = new Set(); const out = [];
  for (const t of toks) {
    const k = t.text.toLowerCase().replace(/[^a-z']/g, '');
    if (seen.has(k)) continue;
    const e = VB_WORDS.en[k];
    if (e) { out.push({ en: t.text, ko: e.ko, def: e.def, pos: e.pos }); seen.add(k); }
    if (out.length >= 3) break;
  }
  return out;
}

// small PLUS lock chip
function PlusChip({ size = 'sm' }) {
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding: size==='sm'?'3px 9px':'5px 11px', borderRadius:99,
      background:'linear-gradient(135deg, var(--vb-gold), #8A6A3E)', color:'#fff', font:`700 ${size==='sm'?10:12}px/1 var(--font-text)`, letterSpacing:'0.6px' }}>
      <VBIcon name="sparkle" size={size==='sm'?11:13}/>{t('plusBadge')}
    </span>
  );
}

// ── Paid: AI reflection card (with free teaser) ──
function ReflectionCard({ verse, order, isPaid, answer, onAnswer, onUpgrade }) {
  const q = VB_REFLECT[verse.cat] || VB_REFLECT.hope;
  const primaryQ = order === 'ko' ? q.ko : q.en;
  const secondQ = order === 'ko' ? q.en : q.ko;
  return (
    <div style={{ background:'var(--vb-card)', borderRadius:18, border:'0.5px solid var(--vb-hair)', boxShadow:'var(--vb-shadow-sm)', overflow:'hidden' }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, padding:'15px 18px 0' }}>
        <span style={{ color:'var(--vb-gold-ink)' }}><VBIcon name="sparkle" size={17}/></span>
        <span style={{ font:'600 12px/1 var(--font-text)', letterSpacing:'1px', textTransform:'uppercase', color:'var(--vb-gold-ink)' }}>{t('card.reflection')}</span>
        {!isPaid && <span style={{ marginLeft:'auto' }}><PlusChip/></span>}
      </div>
      <div style={{ padding:'12px 18px 18px', position:'relative' }}>
        <p style={{ margin:0, fontFamily:'var(--vb-serif)', fontWeight:500, fontSize:18, lineHeight:1.4, color:'var(--label-primary)' }}>{primaryQ}</p>
        <p style={{ margin:'6px 0 0', font:'400 14px/1.45 var(--font-text)', color:'var(--label-secondary)' }}>{secondQ}</p>
        {isPaid ? (
          <textarea value={answer||''} onChange={e=>onAnswer(e.target.value)} placeholder={t('card.writeReflection')}
            style={{ width:'100%', marginTop:12, minHeight:74, boxSizing:'border-box', resize:'none', border:'0.5px solid var(--vb-hair)', borderRadius:12, padding:'12px', background:'var(--vb-bg)', font:'400 15px/1.5 var(--font-text)', color:'var(--label-primary)', outline:'none' }} />
        ) : (
          <button type="button" onClick={onUpgrade} style={{ marginTop:14, width:'100%', height:44, borderRadius:12, border:'none', cursor:'pointer', background:'var(--vb-fill)', color:'var(--vb-gold-ink)', font:'600 15px/1 var(--font-text)' }}>{t('card.unlockReflection')}</button>
        )}
      </div>
    </div>
  );
}

// ── Paid: language learning notes (with free teaser) ──
function LearnNotesCard({ verse, isPaid, onWord, onUpgrade }) {
  const notes = vbLearnNotes(verse);
  if (!notes.length) return null;
  return (
    <div style={{ background:'var(--vb-card)', borderRadius:18, border:'0.5px solid var(--vb-hair)', boxShadow:'var(--vb-shadow-sm)', overflow:'hidden' }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, padding:'15px 18px 12px' }}>
        <span style={{ color:'var(--vb-gold-ink)' }}><VBIcon name="globe" size={17}/></span>
        <span style={{ font:'600 12px/1 var(--font-text)', letterSpacing:'1px', textTransform:'uppercase', color:'var(--vb-gold-ink)' }}>{t('card.learningNotes')}</span>
        {!isPaid && <span style={{ marginLeft:'auto' }}><PlusChip/></span>}
      </div>
      <div style={{ position:'relative' }}>
        <div style={{ filter: isPaid?'none':'blur(5px)', pointerEvents: isPaid?'auto':'none', padding:'0 18px 16px', display:'flex', flexDirection:'column', gap:10 }}>
          {notes.map((n,i) => (
            <div key={i} style={{ display:'flex', alignItems:'baseline', gap:10, paddingBottom:10, borderBottom: i<notes.length-1?'0.5px solid var(--separator)':'none' }}>
              <span onClick={()=> isPaid && onWord && onWord(n.en,'en')} style={{ fontFamily:'var(--vb-serif)', fontWeight:600, fontSize:17, color:'var(--label-primary)', cursor:isPaid?'pointer':'default' }}>{n.en}</span>
              <span style={{ font:'600 14px/1 var(--vb-serif-ko)', color:'var(--vb-gold-ink)' }}>{n.ko}</span>
              <span style={{ marginLeft:'auto', font:'400 13px/1.35 var(--font-text)', color:'var(--label-secondary)', textAlign:'right', maxWidth:170 }}>{n.def}</span>
            </div>
          ))}
        </div>
        {!isPaid && (
          <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <button type="button" onClick={onUpgrade} style={{ height:44, padding:'0 20px', borderRadius:12, border:'none', cursor:'pointer', background:'var(--vb-gold-ink)', color:'#fff', font:'600 15px/1 var(--font-text)' }}>{t('card.learnEveryVerse')}</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Paywall (tall sheet) ──
function PaywallSheet({ reason, onChoose, onClose, onToast }) {
  const { Button } = window.IOSDesignSystem_b2fbca;
  const [sel, setSel] = uSp('yearly');
  const KL = (en, ko) => window.VB_LANG==='ko' ? ko : en;
  const feats = [
    { icon:'sparkle', t:KL('No ads','광고 없이'), s:KL('Read without interruption.','방해 없이 읽어요.') },
    { icon:'refresh', t:KL('Unlimited refresh','무제한 새로고침'), s:KL('Find the verse your heart needs.','마음에 필요한 말씀을 찾아요.') },
    { icon:'quote',   t:t('sg.title'), s:KL('Full passage, context & key message.','전체 문맥·배경·핵심 메시지.') },
    { icon:'note',    t:KL('Reflection & application','묵상·적용 가이드'), s:KL('Guided questions and meaning notes.','묵상 질문과 의미 노트까지.') },
    { icon:'share',   t:KL('Premium share cards','프리미엄 공유 카드'), s:KL('Send the verse with your heart.','말씀에 마음을 담아 보내요.') },
    { icon:'today',   t:KL('History & journal','지난 말씀·저널'), s:KL('Keep the verses that shaped your days.','당신의 하루를 빚은 말씀을 보관해요.') },
  ];
  const plans = [
    { id:'monthly', label:t('c.plus')+' · '+(window.VB_LANG==='ko'?'월간':'Monthly'), price:'$2.99', per:'/mo', sub:'₩3,900 / 월' },
    { id:'yearly',  label:t('c.plus')+' · '+(window.VB_LANG==='ko'?'연간':'Yearly'),  price:'$19.99', per:'/yr', sub:'₩25,000 / 년 · '+(window.VB_LANG==='ko'?'44% 할인':'save 44%'), badge:window.VB_LANG==='ko'?'추천':'Best value' },
    { id:'lifetime',label:t('c.lifetime'),       price:'$29.99', per:window.VB_LANG==='ko'?' 한 번':' once', sub:'₩39,000 · '+(window.VB_LANG==='ko'?'얼리버드':'early supporter'), badge:window.VB_LANG==='ko'?'영구':'Forever' },
  ];
  const choose = () => { onChoose(sel === 'lifetime' ? 'lifetime' : 'plus', sel); };
  return (
    <VBSheet onClose={onClose} maxH="94%">
      <div style={{ overflowY:'auto' }}>
        <div style={{ padding:'10px 24px 8px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <PlusChip size="md" />
          <button type="button" onClick={onClose} style={{ border:'none', background:'var(--vb-fill)', width:32, height:32, borderRadius:99, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'var(--label-secondary)' }}><VBIcon name="close" size={16}/></button>
        </div>
        <div style={{ padding:'4px 24px 0' }}>
          {reason && <div style={{ font:'500 13px/1.3 var(--font-text)', color:'var(--vb-gold-ink)', marginBottom:8 }}>{reason}</div>}
          <h1 style={{ margin:0, fontFamily:'var(--vb-serif)', fontWeight:600, fontSize:30, lineHeight:1.12, letterSpacing:'-0.3px', color:'var(--label-primary)' }}>{t('pw.title')}</h1>
          <p style={{ margin:'10px 0 0', font:'400 15px/1.5 var(--font-text)', color:'var(--label-secondary)' }}>{t('pw.sub')}</p>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, padding:'20px 24px 8px' }}>
          {feats.map((f,i) => (
            <div key={i} style={{ background:'var(--vb-card)', borderRadius:14, border:'0.5px solid var(--vb-hair)', padding:'13px 13px' }}>
              <span style={{ color:'var(--vb-gold-ink)' }}><VBIcon name={f.icon} size={20}/></span>
              <div style={{ font:'600 14px/1.2 var(--font-text)', color:'var(--label-primary)', marginTop:8 }}>{f.t}</div>
              <div style={{ font:'400 12px/1.35 var(--font-text)', color:'var(--label-secondary)', marginTop:3 }}>{f.s}</div>
            </div>
          ))}
        </div>
        <div style={{ padding:'10px 24px 0', display:'flex', flexDirection:'column', gap:10 }}>
          {plans.map(p => {
            const on = sel === p.id;
            return (
              <button key={p.id} type="button" onClick={()=>setSel(p.id)} style={{ display:'grid', gridTemplateColumns:'22px 1fr auto', alignItems:'center', gap:12, padding:'15px 16px', borderRadius:16, cursor:'pointer', textAlign:'left', background:'var(--vb-card)', border: on?'1.5px solid var(--vb-gold)':'1.5px solid var(--vb-hair)', boxShadow: on?'0 6px 16px color-mix(in srgb, var(--vb-gold) 24%, transparent)':'none' }}>
                <span style={{ width:22, height:22, borderRadius:99, flexShrink:0, border: on?'none':'1.5px solid var(--vb-hair)', background: on?'var(--vb-gold-ink)':'transparent', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff' }}>{on && <VBIcon name="check" size={13} strokeWidth={2.6}/>}</span>
                <div style={{ minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ font:'600 15px/1.1 var(--font-text)', color:'var(--label-primary)', whiteSpace:'nowrap' }}>{p.label}</span>
                    {p.badge && <span style={{ font:'600 9px/1 var(--font-text)', letterSpacing:'0.4px', color:'var(--vb-gold-ink)', background:'var(--vb-fill)', padding:'3px 6px', borderRadius:99, whiteSpace:'nowrap', flexShrink:0 }}>{p.badge}</span>}
                  </div>
                  <div style={{ font:'400 12px/1.3 var(--font-text)', color:'var(--label-secondary)', marginTop:3, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{p.sub}</div>
                </div>
                <div style={{ textAlign:'right', whiteSpace:'nowrap' }}>
                  <span style={{ font:'700 17px/1 var(--font-text)', color:'var(--label-primary)' }}>{p.price}</span>
                  <span style={{ font:'400 12px/1 var(--font-text)', color:'var(--label-tertiary)' }}>{p.per}</span>
                </div>
              </button>
            );
          })}
        </div>
        <div style={{ padding:'16px 24px 8px' }}>
          <Button variant="filled" size="lg" full onClick={choose}>{sel==='lifetime'?t('pw.unlockLife'):t('pw.startPlus')}</Button>
        </div>
        <div style={{ display:'flex', justifyContent:'center', gap:18, padding:'4px 24px 6px' }}>
          <button type="button" onClick={()=>onToast({text:t('pw.restore')+' ✓',icon:'check'})} style={{ border:'none', background:'none', cursor:'pointer', font:'500 13px/1 var(--font-text)', color:'var(--vb-gold-ink)' }}>{t('pw.restore')}</button>
          <span style={{ color:'var(--vb-hair)' }}>·</span>
          <button type="button" onClick={()=>onToast({text:t('pw.terms'),icon:'check'})} style={{ border:'none', background:'none', cursor:'pointer', font:'500 13px/1 var(--font-text)', color:'var(--label-tertiary)' }}>{t('pw.terms')}</button>
        </div>
        <p style={{ textAlign:'center', font:'400 11px/1.4 var(--font-text)', color:'var(--label-tertiary)', padding:'0 30px 18px', margin:0 }}>Lifetime includes all core premium features. Some future AI-cost-heavy features may have fair-use limits.</p>
      </div>
    </VBSheet>
  );
}

// ── Pricing page (full overlay) ──
function PricingScreen({ plan, onBack, onOpenPaywall }) {
  const KL = (en, ko) => window.VB_LANG==='ko' ? ko : en;
  const rows = [
    [KL('Daily verse · EN + KO','매일 말씀 · 영/한'), true, true, true],
    [KL('AI cinematic image','AI 시네마틱 이미지'), true, true, true],
    [KL('Save · notes · share','저장 · 메모 · 공유'), true, true, true],
    [KL('Ads','광고'), '—', KL('None','없음'), KL('None','없음')],
    [KL('Unlimited refresh','무제한 새로고침'), false, true, true],
    [t('sg.title'), false, true, true],
    [KL('Context & key message','배경·핵심 메시지'), false, true, true],
    [KL('Reflection & application','묵상·적용 가이드'), false, true, true],
    [KL('Bilingual meaning notes','영·한 의미 노트'), false, true, true],
    [KL('Premium share cards','프리미엄 공유 카드'), false, true, true],
    [KL('History & journal','지난 말씀·저널'), KL('Recent','최근'), true, true],
  ];
  const cell = (v) => v === true ? <VBIcon name="check" size={15} strokeWidth={2.4}/> : v === false ? <span style={{ color:'var(--label-tertiary)' }}>—</span> : <span style={{ font:'500 11px/1.2 var(--font-text)' }}>{v}</span>;
  return (
    <div style={{ position:'absolute', top:0, left:0, right:0, bottom:84, background:'var(--vb-bg)', display:'flex', flexDirection:'column', animation:'vbPush .32s cubic-bezier(0.2,0.8,0.2,1)', zIndex:55 }}>
      <div style={{ display:'flex', alignItems:'center', gap:14, padding:'58px 16px 10px' }}>
        <button type="button" onClick={onBack} style={{ border:'none', background:'var(--vb-fill)', width:38, height:38, borderRadius:99, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'var(--label-secondary)' }}><VBIcon name="back" size={20}/></button>
        <h1 style={{ margin:0, fontFamily:'var(--vb-serif)', fontWeight:600, fontSize:26, color:'var(--label-primary)' }}>Plans</h1>
      </div>
      <div style={{ flex:1, overflowY:'auto', padding:'8px 16px 36px' }}>
        <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:24 }}>
          {[
            { id:'free', name:t('c.free'), tag:'Start each day with a bilingual verse card.', price:'$0' },
            { id:'plus', name:t('brandPlus'), tag:'Ad-free, unlimited refresh, reflection, premium sharing.', price:'$2.99/mo · $19.99/yr', hot:true },
            { id:'lifetime', name:t('brandLifetime'), tag:'One purchase. A lifetime of quiet daily verses.', price:'$29.99 once' },
          ].map(p => (
            <div key={p.id} style={{ background:'var(--vb-card)', borderRadius:18, border: plan===p.id?'1.5px solid var(--vb-gold)':'0.5px solid var(--vb-hair)', boxShadow:'var(--vb-shadow-sm)', padding:'18px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ font:'700 18px/1 var(--font-text)', color:'var(--label-primary)' }}>{p.name}</span>
                {p.hot && <PlusChip/>}
                {plan===p.id && <span style={{ marginLeft:'auto', font:'600 11px/1 var(--font-text)', color:'var(--vb-gold-ink)' }}>Current</span>}
              </div>
              <div style={{ font:'400 13.5px/1.45 var(--font-text)', color:'var(--label-secondary)', margin:'8px 0 12px' }}>{p.tag}</div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <span style={{ font:'600 15px/1 var(--font-text)', color:'var(--vb-gold-ink)' }}>{p.price}</span>
                {p.id!=='free' && plan==='free' && <button type="button" onClick={onOpenPaywall} style={{ border:'none', borderRadius:10, padding:'9px 16px', cursor:'pointer', background:'var(--vb-gold-ink)', color:'#fff', font:'600 14px/1 var(--font-text)' }}>Choose</button>}
              </div>
            </div>
          ))}
        </div>
        <div style={{ background:'var(--vb-card)', borderRadius:18, border:'0.5px solid var(--vb-hair)', overflow:'hidden' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1.6fr 0.8fr 0.8fr 0.8fr', padding:'12px 14px', borderBottom:'0.5px solid var(--separator)', font:'600 11px/1.2 var(--font-text)', color:'var(--label-secondary)', textAlign:'center' }}>
            <span style={{ textAlign:'left' }}>Feature</span><span>{t('c.free')}</span><span>{t('c.plus')}</span><span>{t('c.lifetime')}</span>
          </div>
          {rows.map((r,i)=>(
            <div key={i} style={{ display:'grid', gridTemplateColumns:'1.6fr 0.8fr 0.8fr 0.8fr', alignItems:'center', padding:'11px 14px', borderBottom: i<rows.length-1?'0.5px solid var(--separator)':'none', font:'400 13px/1.3 var(--font-text)', color:'var(--label-primary)', textAlign:'center' }}>
              <span style={{ textAlign:'left', color:'var(--label-secondary)' }}>{r[0]}</span>
              <span style={{ color:'var(--vb-gold-ink)', display:'flex', justifyContent:'center' }}>{cell(r[1])}</span>
              <span style={{ color:'var(--vb-gold-ink)', display:'flex', justifyContent:'center' }}>{cell(r[2])}</span>
              <span style={{ color:'var(--vb-gold-ink)', display:'flex', justifyContent:'center' }}>{cell(r[3])}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Premium share card editor (full overlay) ──
function ShareEditorScreen({ verse, order, onBack, onToast }) {
  const c = vbCategory(verse.cat);
  const [tpl, setTpl] = uSp('cinematic');
  const [ctx, setCtx] = uSp('friend');
  const [lang, setLang] = uSp('both');
  const [size, setSize] = uSp('story');
  const [msg, setMsg] = uSp('');
  const templates = [{id:'minimal',n:'Minimal'},{id:'cinematic',n:'Cinematic'},{id:'letter',n:'Letter'},{id:'prayer',n:'Prayer'},{id:'bilingual',n:'Bilingual'}];
  const ctxs = [['friend','Friend'],['family','Family'],['partner','Partner'],['hard','Having a hard time'],['thankful','Thankful for'],['myself','Myself']];
  const suggestions = {
    friend:{en:'I thought of you when I read this verse.',ko:'네가 생각나서 이 구절을 보내.'},
    family:{en:'Sending you a little peace today.',ko:'오늘 작은 평안을 보내.'},
    partner:{en:'Grateful to walk through life with you.',ko:'함께 걸어가 줘서 고마워.'},
    hard:{en:'I hope this gives you strength today.',ko:'오늘 너에게 작은 힘이 되길 바라.'},
    thankful:{en:'I’m thankful for you — this reminded me of that.',ko:'네게 고마워서, 이 말씀이 떠올랐어.'},
    myself:{en:'A word to hold onto today.',ko:'오늘 마음에 새길 한 마디.'},
  };
  const suggest = () => { const s = suggestions[ctx]; setMsg(order==='ko'?s.ko:s.en); };
  const [a,b] = vbOrder(verse, order);
  const showLines = lang==='en' ? [verse.en] : lang==='ko' ? [verse.ko] : [a.text, b.text];
  const dims = { story:{r:'9 / 16',label:'Story 1080×1920'}, square:{r:'1 / 1',label:'Square 1080×1080'}, card:{r:'4 / 5',label:'Card 1080×1350'} }[size];

  const isLetter = tpl==='letter' || tpl==='prayer';
  return (
    <div style={{ position:'absolute', top:0, left:0, right:0, bottom:84, background:'var(--vb-bg)', display:'flex', flexDirection:'column', animation:'vbPush .32s cubic-bezier(0.2,0.8,0.2,1)', zIndex:60 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'58px 16px 8px' }}>
        <button type="button" onClick={onBack} style={{ border:'none', background:'var(--vb-fill)', width:38, height:38, borderRadius:99, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'var(--label-secondary)' }}><VBIcon name="back" size={20}/></button>
        <span style={{ font:'600 16px/1 var(--font-text)', color:'var(--label-primary)', display:'flex', alignItems:'center', gap:7 }}>Share editor <PlusChip/></span>
        <div style={{ width:38 }} />
      </div>
      <div style={{ flex:1, overflowY:'auto', padding:'8px 16px 36px' }}>
        {/* preview */}
        <div style={{ display:'flex', justifyContent:'center', padding:'4px 0 16px' }}>
          <div style={{ width: size==='story'?186:size==='square'?280:236, aspectRatio:dims.r, borderRadius:16, overflow:'hidden', boxShadow:'var(--vb-shadow)' }}>
            {isLetter ? (
              <div style={{ width:'100%', height:'100%', background: tpl==='prayer'?'linear-gradient(160deg,#F4ECDD,#E7D8BE)':'#FBF6EE', padding:'20px 18px', display:'flex', flexDirection:'column', justifyContent:'center', gap:12 }}>
                <CatChip cat={verse.cat} size="sm" />
                {showLines.map((t,i)=><p key={i} style={{ margin:0, fontFamily: (lang==='ko'||(i===1&&lang==='both'))?'var(--vb-serif-ko)':'var(--vb-serif)', fontWeight:500, fontSize: i===0?16:13, lineHeight:1.4, color: i===0?'var(--label-primary)':'var(--label-secondary)' }}>{t}</p>)}
                <div style={{ height:0.5, background:'var(--separator)' }} />
                <p style={{ margin:0, font:'400 13px/1.5 var(--font-text)', fontStyle:'italic', color:'var(--label-secondary)' }}>{msg || (tpl==='prayer'?'Praying this brings you peace.':'Your message appears here…')}</p>
                <div style={{ font:'600 9px/1 var(--font-text)', letterSpacing:'1px', textTransform:'uppercase', color:'var(--vb-gold-ink)' }}>{a.ref} · {t('brand')}</div>
              </div>
            ) : (
              <VBImage cat={verse.cat} src={verse.img} radius={16} style={{ width:'100%', height:'100%' }}
                scrim={<div style={{ position:'absolute', inset:0, background: tpl==='minimal'?'linear-gradient(to top, rgba(28,22,17,0.55), rgba(28,22,17,0.05))':'linear-gradient(to top, rgba(28,22,17,0.85) 8%, rgba(28,22,17,0.10) 55%, rgba(28,22,17,0.4))' }} />}>
                <div style={{ position:'absolute', left:14, right:14, bottom:14, textAlign: tpl==='minimal'?'left':'center' }}>
                  {tpl!=='minimal' && <div style={{ font:'600 8px/1 var(--font-text)', letterSpacing:'1.4px', textTransform:'uppercase', color:'var(--vb-gold)' }}>{c.label} · {c.ko}</div>}
                  {showLines.map((t,i)=><p key={i} style={{ margin:'7px 0 0', fontFamily:(lang==='ko'||(i===1&&lang==='both'))?'var(--vb-serif-ko)':'var(--vb-serif)', fontWeight:500, fontSize:i===0?14:11, lineHeight:1.32, color: i===0?'#fff':'rgba(255,255,255,0.8)' }}>{t}</p>)}
                  {msg && <p style={{ margin:'9px 0 0', font:'400 11px/1.4 var(--font-text)', fontStyle:'italic', color:'rgba(255,255,255,0.9)' }}>“{msg}”</p>}
                  <div style={{ marginTop:9, font:'500 8px/1 var(--font-text)', letterSpacing:'1px', color:'rgba(255,255,255,0.75)' }}>{a.ref} · {t('brand')}</div>
                </div>
              </VBImage>
            )}
          </div>
        </div>

        {/* template */}
        <Section label="Template" />
        <Rail items={templates.map(t=>[t.id,t.n])} value={tpl} onChange={setTpl} />
        {/* recipient */}
        <Section label="Who is this for?" />
        <Rail items={ctxs} value={ctx} onChange={setCtx} />
        {/* message */}
        <Section label="Your message" right={<button type="button" onClick={suggest} style={{ border:'none', background:'var(--vb-fill)', color:'var(--vb-gold-ink)', borderRadius:99, padding:'6px 12px', cursor:'pointer', font:'600 12px/1 var(--font-text)', display:'flex', alignItems:'center', gap:5 }}><VBIcon name="sparkle" size={13}/>Suggest</button>} />
        <textarea value={msg} onChange={e=>setMsg(e.target.value)} maxLength={180} placeholder="Write 1–3 short sentences…"
          style={{ width:'100%', minHeight:64, boxSizing:'border-box', resize:'none', border:'0.5px solid var(--vb-hair)', borderRadius:14, padding:'13px', background:'var(--vb-card)', font:'400 15px/1.5 var(--font-text)', color:'var(--label-primary)', outline:'none' }} />
        {/* language + size */}
        <Section label="Languages" />
        <Rail items={[['en','English'],['ko','한국어'],['both','Bilingual']]} value={lang} onChange={setLang} />
        <Section label="Export size" />
        <Rail items={[['story','Story'],['square','Square'],['card','Card']]} value={size} onChange={setSize} />

        <div style={{ marginTop:18 }}>
          <button type="button" onClick={()=>{ onBack(); onToast({text:'Shared · '+dims.label,icon:'share'}); }} style={{ width:'100%', height:52, borderRadius:14, border:'none', cursor:'pointer', background:'var(--vb-gold-ink)', color:'#fff', font:'600 16px/1 var(--font-text)', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}><VBIcon name="share" size={19}/>Share verse card</button>
        </div>
      </div>
    </div>
  );
}
function Section({ label, right }) {
  return <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', margin:'18px 0 9px' }}>
    <span style={{ font:'600 12px/1 var(--font-text)', letterSpacing:'0.6px', textTransform:'uppercase', color:'var(--label-secondary)' }}>{label}</span>{right}
  </div>;
}
function Rail({ items, value, onChange }) {
  return <div style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:2 }}>
    {items.map(([id,n]) => { const on=value===id; return (
      <button key={id} type="button" onClick={()=>onChange(id)} style={{ flexShrink:0, padding:'9px 15px', borderRadius:999, cursor:'pointer', font:`${on?600:500} 13px/1 var(--font-text)`, border:'0.5px solid var(--vb-hair)', background: on?'var(--vb-gold-ink)':'var(--vb-card)', color: on?'#fff':'var(--label-secondary)' }}>{n}</button>
    ); })}
  </div>;
}

// ── Verse history (full overlay) ──
function HistoryScreen({ history, order, onBack, onOpenVerse }) {
  return (
    <div style={{ position:'absolute', top:0, left:0, right:0, bottom:84, background:'var(--vb-bg)', display:'flex', flexDirection:'column', animation:'vbPush .32s cubic-bezier(0.2,0.8,0.2,1)', zIndex:55 }}>
      <div style={{ display:'flex', alignItems:'center', gap:14, padding:'58px 16px 10px' }}>
        <button type="button" onClick={onBack} style={{ border:'none', background:'var(--vb-fill)', width:38, height:38, borderRadius:99, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'var(--label-secondary)' }}><VBIcon name="back" size={20}/></button>
        <h1 style={{ margin:0, fontFamily:'var(--vb-serif)', fontWeight:600, fontSize:26, color:'var(--label-primary)' }}>Verse History</h1>
      </div>
      <div style={{ flex:1, overflowY:'auto', padding:'8px 16px 36px' }}>
        {history.length===0 ? <p style={{ textAlign:'center', color:'var(--label-tertiary)', font:'400 15px/1.5 var(--font-text)', padding:'60px 30px' }}>Verses you read will appear here as your personal archive.</p> :
        <div style={{ background:'var(--vb-card)', borderRadius:18, overflow:'hidden', border:'0.5px solid var(--vb-hair)', boxShadow:'var(--vb-shadow-sm)' }}>
          {history.map((h,i) => { const v=vbVerse(h.id); if(!v) return null; return (
            <React.Fragment key={h.ts}>
              {i>0 && <div style={{ height:0.5, background:'var(--separator)', marginLeft:96 }} />}
              <VerseRow verse={v} order={order} savedDate={h.date} onOpen={()=>onOpenVerse(v)} />
            </React.Fragment>
          ); })}
        </div>}
      </div>
    </div>
  );
}

// ── Reflection journal (full overlay) ──
function JournalScreen({ entries, order, onBack, onOpenVerse }) {
  return (
    <div style={{ position:'absolute', top:0, left:0, right:0, bottom:84, background:'var(--vb-bg)', display:'flex', flexDirection:'column', animation:'vbPush .32s cubic-bezier(0.2,0.8,0.2,1)', zIndex:55 }}>
      <div style={{ display:'flex', alignItems:'center', gap:14, padding:'58px 16px 10px' }}>
        <button type="button" onClick={onBack} style={{ border:'none', background:'var(--vb-fill)', width:38, height:38, borderRadius:99, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'var(--label-secondary)' }}><VBIcon name="back" size={20}/></button>
        <h1 style={{ margin:0, fontFamily:'var(--vb-serif)', fontWeight:600, fontSize:26, color:'var(--label-primary)' }}>Journal</h1>
      </div>
      <div style={{ flex:1, overflowY:'auto', padding:'8px 16px 36px' }}>
        {entries.length===0 ? <p style={{ textAlign:'center', color:'var(--label-tertiary)', font:'400 15px/1.5 var(--font-text)', padding:'60px 30px' }}>Your reflection journal is empty.<br/>Start with one small thought today.<br/><span style={{ fontFamily:'var(--vb-serif-ko)' }}>오늘의 작은 생각부터 남겨보세요.</span></p> :
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {entries.map(e => { const v=vbVerse(e.id); if(!v) return null; const [a]=vbOrder(v,order); return (
            <button key={e.id+e.kind} type="button" onClick={()=>onOpenVerse(v)} style={{ textAlign:'left', cursor:'pointer', background:'var(--vb-card)', borderRadius:16, border:'0.5px solid var(--vb-hair)', boxShadow:'var(--vb-shadow-sm)', padding:'15px 16px', display:'flex', gap:12 }}>
              <VBImage cat={v.cat} src={v.img} radius={12} style={{ width:48, height:48, flexShrink:0 }} />
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ font:'600 10px/1 var(--font-text)', letterSpacing:'1px', textTransform:'uppercase', color:'var(--vb-gold-ink)' }}>{a.ref}</span>
                  <span style={{ font:'500 10px/1 var(--font-text)', color:'var(--label-tertiary)' }}>{e.kind==='reflection'?t('card.reflection'):e.kind==='study'?t('sg.myNote'):e.kind==='gratitude'?t('sg.gratitudeNote'):t('act.note')}</span>
                  <span style={{ marginLeft:'auto', font:'500 11px/1 var(--font-text)', color:'var(--label-tertiary)' }}>{e.date}</span>
                </div>
                <p style={{ margin:'7px 0 0', font:'400 14px/1.5 var(--font-text)', color:'var(--label-primary)', fontStyle:'italic', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{e.text}</p>
              </div>
            </button>
          ); })}
        </div>}
      </div>
    </div>
  );
}

Object.assign(window, { VB_REFLECT, vbLearnNotes, PlusChip, ReflectionCard, LearnNotesCard, PaywallSheet, PricingScreen, ShareEditorScreen, HistoryScreen, JournalScreen });
