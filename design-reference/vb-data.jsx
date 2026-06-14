// vb-data.jsx — VerseBite content model, palette, imagery, icons.
// Exports to window: VB_CATEGORIES, VB_VERSES, VB_IMAGES, VBIcon, vbVersesByCat,
//                    vbVerse, vbCategory, vbGreeting, vbFormatDate

// ─────────────────────────────────────────────────────────────
// Categories — nine non-overlapping emotional themes.
// tint = decorative category accent; grad = gradient fallback under photos.
// ─────────────────────────────────────────────────────────────
const VB_CATEGORIES = [
  { id:'friendship', label:'Friendship', ko:'우정',     msg:'You are not alone.',                       koMsg:'당신은 혼자가 아닙니다.',          tint:'#B98C57', grad:['#C9A45C','#8A6A3E'] },
  { id:'love',       label:'Love',       ko:'사랑',     msg:'Love with patience and kindness.',         koMsg:'오래 참고 친절하게 사랑하세요.',    tint:'#CFA6A0', grad:['#D9B0A6','#A97268'] },
  { id:'family',     label:'Family',     ko:'가족',     msg:'Home is a place of care and guidance.',    koMsg:'가정은 돌봄과 가르침이 자라는 곳입니다.', tint:'#A97C5B', grad:['#C49A74','#7E5839'] },
  { id:'motivation', label:'Motivation', ko:'동기부여', msg:'You can rise again today.',                koMsg:'오늘 다시 일어설 수 있습니다.',     tint:'#D9963F', grad:['#E3A95A','#A45E1E'] },
  { id:'faith',      label:'Faith',      ko:'믿음',     msg:'Trust God even when you cannot see the way.', koMsg:'길이 보이지 않아도 하나님을 신뢰하세요.', tint:'#8FA1B3', grad:['#A8B7C7','#6E8095'] },
  { id:'forgiveness',label:'Forgiveness',ko:'용서',     msg:'Let go and move toward healing.',          koMsg:'내려놓고 회복을 향해 나아가세요.',   tint:'#9FAF98', grad:['#AEBEA2','#74896C'] },
  { id:'gratitude',  label:'Gratitude',  ko:'감사',     msg:'Notice the grace already given.',          koMsg:'이미 주어진 은혜를 알아차리세요.',   tint:'#C9A45C', grad:['#E0C079','#A07C36'] },
  { id:'hope',       label:'Hope',       ko:'소망',     msg:'The story is not over yet.',               koMsg:'아직 이야기는 끝나지 않았습니다.',   tint:'#D8A765', grad:['#EBC487','#B97E45'] },
  { id:'wisdom',     label:'Wisdom',     ko:'지혜',     msg:'Choose with discernment.',                 koMsg:'분별력 있게 선택하세요.',          tint:'#A88C5A', grad:['#BFA56E','#7C6438'] },
];

// ─────────────────────────────────────────────────────────────
// Imagery — warm cinematic stand-ins (Unsplash) per category.
// A gradient fallback (category grad) always sits beneath, so a slow
// or failed photo never reads as broken. Swap for real AI images later.
// ─────────────────────────────────────────────────────────────
const U = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=900&q=80`;
const VB_IMAGES = {
  friendship: [U('1539635278303-d4002c07eae3'), U('1488161628813-04466f872be2')],
  love:       [U('1518621736915-f3b1c41bfd00'), U('1494774157365-9e04c6720e47')],
  family:     [U('1511895426328-dc8714191300'), U('1543342384-1f1350e27861')],
  motivation: [U('1502224562085-639556652f33'), U('1538805060514-97d9cc17730c')],
  faith:      [U('1438761681033-6461ffad8d80'), U('1470115636492-6d2b56f9146d')],
  forgiveness:[U('1499002238440-d264edd596ec'), U('1447752875215-b2761acb3c5d')],
  gratitude:  [U('1490750967868-88aa4486c946'), U('1504384308090-c894fdcc538d')],
  hope:       [U('1470071459604-3b5ec3a7fe05'), U('1444703686981-a3abbc4d4fe3')],
  wisdom:     [U('1457369804613-52c61a468e7d'), U('1481627834876-b7833e8f5570')],
};
const vbImg = (cat, i = 0) => (VB_IMAGES[cat] || VB_IMAGES.hope)[i % (VB_IMAGES[cat] || VB_IMAGES.hope).length];

// ─────────────────────────────────────────────────────────────
// Verses — 3 per category. English public-domain (KJV/WEB style),
// Korean parallel text. angle = internal message_angle (non-overlap).
// ─────────────────────────────────────────────────────────────
const VB_VERSES = [
  // Friendship
  { id:'v01', cat:'friendship', refEn:'Proverbs 17:17', refKo:'잠언 17:17', angle:'loyalty',
    en:'A friend loves at all times, and a brother is born for a time of adversity.',
    ko:'친구는 사랑이 끊이지 아니하고 형제는 위급한 때를 위하여 났느니라.', img:vbImg('friendship',0) },
  { id:'v02', cat:'friendship', refEn:'Proverbs 27:17', refKo:'잠언 27:17', angle:'mutual_support',
    en:'As iron sharpens iron, so one person sharpens another.',
    ko:'철이 철을 날카롭게 하는 것 같이 사람이 그의 친구의 얼굴을 빛나게 하느니라.', img:vbImg('friendship',1) },
  { id:'v03', cat:'friendship', refEn:'Ecclesiastes 4:9', refKo:'전도서 4:9', angle:'companionship',
    en:'Two are better than one, because they have a good reward for their toil.',
    ko:'두 사람이 한 사람보다 나음은 그들이 수고함으로 좋은 상을 얻을 것임이라.', img:vbImg('friendship',0) },
  // Love
  { id:'v04', cat:'love', refEn:'1 Corinthians 13:4', refKo:'고린도전서 13:4', angle:'patience',
    en:'Love is patient, love is kind. It does not envy, it does not boast, it is not proud.',
    ko:'사랑은 오래 참고 사랑은 온유하며 시기하지 아니하며 자랑하지 아니하며 교만하지 아니하며.', img:vbImg('love',0) },
  { id:'v05', cat:'love', refEn:'1 John 4:7', refKo:'요한일서 4:7', angle:'loving_others',
    en:'Beloved, let us love one another, for love is from God.',
    ko:'사랑하는 자들아 우리가 서로 사랑하자 사랑은 하나님께 속한 것이니.', img:vbImg('love',1) },
  { id:'v06', cat:'love', refEn:'Colossians 3:14', refKo:'골로새서 3:14', angle:'selfless_care',
    en:'And over all these virtues put on love, which binds them all together in perfect unity.',
    ko:'이 모든 것 위에 사랑을 더하라 이는 온전하게 매는 띠니라.', img:vbImg('love',0) },
  // Family
  { id:'v07', cat:'family', refEn:'Joshua 24:15', refKo:'여호수아 24:15', angle:'household_peace',
    en:'But as for me and my household, we will serve the Lord.',
    ko:'오직 나와 내 집은 여호와를 섬기겠노라.', img:vbImg('family',0) },
  { id:'v08', cat:'family', refEn:'Proverbs 22:6', refKo:'잠언 22:6', angle:'guidance_at_home',
    en:'Train up a child in the way he should go, and when he is old he will not depart from it.',
    ko:'마땅히 행할 길을 아이에게 가르치라 그리하면 늙어도 그것을 떠나지 아니하리라.', img:vbImg('family',1) },
  { id:'v09', cat:'family', refEn:'Psalm 127:3', refKo:'시편 127:3', angle:'generational_blessing',
    en:'Children are a heritage from the Lord, offspring a reward from him.',
    ko:'보라 자식들은 여호와의 기업이요 태의 열매는 그의 상급이로다.', img:vbImg('family',0) },
  // Motivation
  { id:'v10', cat:'motivation', refEn:'Isaiah 40:31', refKo:'이사야 40:31', angle:'renewed_strength',
    en:'But those who hope in the Lord will renew their strength. They will soar on wings like eagles.',
    ko:'오직 여호와를 앙망하는 자는 새 힘을 얻으리니 독수리가 날개치며 올라감 같을 것이요.', img:vbImg('motivation',0) },
  { id:'v11', cat:'motivation', refEn:'Philippians 4:13', refKo:'빌립보서 4:13', angle:'courage',
    en:'I can do all things through Christ who strengthens me.',
    ko:'내게 능력 주시는 자 안에서 내가 모든 것을 할 수 있느니라.', img:vbImg('motivation',1) },
  { id:'v12', cat:'motivation', refEn:'Joshua 1:9', refKo:'여호수아 1:9', angle:'not_giving_up',
    en:'Be strong and courageous. Do not be afraid; do not be discouraged.',
    ko:'강하고 담대하라 두려워하지 말며 놀라지 말라.', img:vbImg('motivation',0) },
  // Faith
  { id:'v13', cat:'faith', refEn:'Proverbs 3:5', refKo:'잠언 3:5', angle:'trust_in_God',
    en:'Trust in the Lord with all your heart, and lean not on your own understanding.',
    ko:'너는 마음을 다하여 여호와를 신뢰하고 네 명철을 의지하지 말라.', img:vbImg('faith',0) },
  { id:'v14', cat:'faith', refEn:'Hebrews 11:1', refKo:'히브리서 11:1', angle:'unseen_belief',
    en:'Now faith is the substance of things hoped for, the evidence of things not seen.',
    ko:'믿음은 바라는 것들의 실상이요 보이지 않는 것들의 증거니.', img:vbImg('faith',1) },
  { id:'v15', cat:'faith', refEn:'2 Corinthians 5:7', refKo:'고린도후서 5:7', angle:'spiritual_confidence',
    en:'For we walk by faith, not by sight.',
    ko:'이는 우리가 믿음으로 행하고 보는 것으로 하지 아니함이로라.', img:vbImg('faith',0) },
  // Forgiveness
  { id:'v16', cat:'forgiveness', refEn:'Colossians 3:13', refKo:'골로새서 3:13', angle:'grace_toward_others',
    en:'Bear with each other and forgive one another, just as the Lord forgave you.',
    ko:'서로 용납하여 피차 용서하되 주께서 너희를 용서하신 것 같이 너희도 그리하고.', img:vbImg('forgiveness',0) },
  { id:'v17', cat:'forgiveness', refEn:'Ephesians 4:32', refKo:'에베소서 4:32', angle:'mercy',
    en:'Be kind and compassionate to one another, forgiving each other.',
    ko:'서로 친절하게 하며 불쌍히 여기며 서로 용서하기를 하나님이 너희를 용서하심과 같이 하라.', img:vbImg('forgiveness',1) },
  { id:'v18', cat:'forgiveness', refEn:'Matthew 6:14', refKo:'마태복음 6:14', angle:'releasing_anger',
    en:'For if you forgive other people when they sin against you, your Father will also forgive you.',
    ko:'너희가 사람의 잘못을 용서하면 너희 하늘 아버지께서도 너희 잘못을 용서하시려니와.', img:vbImg('forgiveness',0) },
  // Gratitude
  { id:'v19', cat:'gratitude', refEn:'1 Thessalonians 5:18', refKo:'데살로니가전서 5:18', angle:'thankfulness',
    en:'Give thanks in all circumstances; for this is the will of God for you.',
    ko:'범사에 감사하라 이것이 그리스도 예수 안에서 너희를 향하신 하나님의 뜻이니라.', img:vbImg('gratitude',0) },
  { id:'v20', cat:'gratitude', refEn:'Psalm 118:24', refKo:'시편 118:24', angle:'everyday_grace',
    en:'This is the day that the Lord has made; let us rejoice and be glad in it.',
    ko:'이 날은 여호와께서 정하신 것이라 이 날에 우리가 즐거워하고 기뻐하리로다.', img:vbImg('gratitude',1) },
  { id:'v21', cat:'gratitude', refEn:'Psalm 100:4', refKo:'시편 100:4', angle:'praise',
    en:'Enter his gates with thanksgiving and his courts with praise; give thanks to him.',
    ko:'감사함으로 그의 문에 들어가며 찬송함으로 그의 궁정에 들어가서 그에게 감사하며 그의 이름을 송축할지어다.', img:vbImg('gratitude',0) },
  // Hope
  { id:'v22', cat:'hope', refEn:'Jeremiah 29:11', refKo:'예레미야 29:11', angle:'future_promise',
    en:'For I know the plans I have for you, plans to prosper you and to give you hope and a future.',
    ko:'너희를 향한 나의 생각을 내가 아나니 평안이요 재앙이 아니니라 너희에게 미래와 희망을 주는 것이니라.', img:vbImg('hope',0) },
  { id:'v23', cat:'hope', refEn:'Romans 15:13', refKo:'로마서 15:13', angle:'restoration',
    en:'May the God of hope fill you with all joy and peace as you trust in him.',
    ko:'소망의 하나님이 모든 기쁨과 평강을 믿음 안에서 너희에게 충만하게 하시기를 원하노라.', img:vbImg('hope',1) },
  { id:'v24', cat:'hope', refEn:'Romans 8:28', refKo:'로마서 8:28', angle:'light_after_darkness',
    en:'And we know that in all things God works for the good of those who love him.',
    ko:'우리가 알거니와 하나님을 사랑하는 자에게는 모든 것이 합력하여 선을 이루느니라.', img:vbImg('hope',0) },
  // Wisdom
  { id:'v25', cat:'wisdom', refEn:'Proverbs 3:6', refKo:'잠언 3:6', angle:'guidance',
    en:'In all your ways submit to him, and he will make your paths straight.',
    ko:'너는 범사에 그를 인정하라 그리하면 네 길을 지도하시리라.', img:vbImg('wisdom',0) },
  { id:'v26', cat:'wisdom', refEn:'James 1:5', refKo:'야고보서 1:5', angle:'discernment',
    en:'If any of you lacks wisdom, you should ask God, who gives generously to all.',
    ko:'너희 중에 누구든지 지혜가 부족하거든 모든 사람에게 후히 주시는 하나님께 구하라 그리하면 주시리라.', img:vbImg('wisdom',1) },
  { id:'v27', cat:'wisdom', refEn:'Proverbs 4:7', refKo:'잠언 4:7', angle:'wise_speech',
    en:'The beginning of wisdom is this: Get wisdom. Though it cost all you have, get understanding.',
    ko:'지혜가 제일이니 지혜를 얻으라 네가 얻은 모든 것을 가지고 명철을 얻을지니라.', img:vbImg('wisdom',0) },
  // ── extended pool: 2 more per category (5 total each) ──
  { id:'v28', cat:'friendship', refEn:'John 15:13', refKo:'요한복음 15:13', angle:'sacrificial',
    en:'Greater love has no one than this: to lay down one’s life for one’s friends.',
    ko:'사람이 친구를 위하여 자기 목숨을 버리면 이보다 더 큰 사랑이 없나니.', img:vbImg('friendship',1) },
  { id:'v29', cat:'friendship', refEn:'Proverbs 18:24', refKo:'잠언 18:24', angle:'trustworthy_presence',
    en:'One who has unreliable friends soon comes to ruin, but there is a friend who sticks closer than a brother.',
    ko:'많은 친구를 얻는 자는 해를 당하게 되거니와 어떤 친구는 형제보다 친밀하니라.', img:vbImg('friendship',0) },
  { id:'v30', cat:'love', refEn:'1 John 4:19', refKo:'요한일서 4:19', angle:'unconditional_love',
    en:'We love because he first loved us.',
    ko:'우리가 사랑함은 그가 먼저 우리를 사랑하셨음이라.', img:vbImg('love',1) },
  { id:'v31', cat:'love', refEn:'Romans 12:10', refKo:'로마서 12:10', angle:'kindness',
    en:'Be devoted to one another in love. Honor one another above yourselves.',
    ko:'형제를 사랑하여 서로 우애하고 존경하기를 서로 먼저 하며.', img:vbImg('love',0) },
  { id:'v32', cat:'family', refEn:'Exodus 20:12', refKo:'출애굽기 20:12', angle:'honoring_parents',
    en:'Honor your father and your mother, so that you may live long in the land.',
    ko:'네 부모를 공경하라 그리하면 네 생명이 길리라.', img:vbImg('family',1) },
  { id:'v33', cat:'family', refEn:'Deuteronomy 6:6-7', refKo:'신명기 6:6-7', angle:'guidance_at_home',
    en:'These commandments are to be on your hearts. Impress them on your children.',
    ko:'오늘 내가 네게 명하는 이 말씀을 너는 마음에 새기고 네 자녀에게 부지런히 가르치며.', img:vbImg('family',0) },
  { id:'v34', cat:'motivation', refEn:'Galatians 6:9', refKo:'갈라디아서 6:9', angle:'not_giving_up',
    en:'Let us not become weary in doing good, for at the proper time we will reap a harvest.',
    ko:'우리가 선을 행하되 낙심하지 말지니 포기하지 아니하면 때가 이르매 거두리라.', img:vbImg('motivation',1) },
  { id:'v35', cat:'motivation', refEn:'1 Corinthians 15:58', refKo:'고린도전서 15:58', angle:'diligence',
    en:'Always give yourselves fully to the work of the Lord, because your labor is not in vain.',
    ko:'견고하며 흔들리지 말고 항상 주의 일에 더욱 힘쓰라 너희 수고가 헛되지 않은 줄 앎이라.', img:vbImg('motivation',0) },
  { id:'v36', cat:'faith', refEn:'Mark 11:24', refKo:'마가복음 11:24', angle:'prayer',
    en:'Whatever you ask for in prayer, believe that you have received it, and it will be yours.',
    ko:'무엇이든지 기도하고 구하는 것은 받은 줄로 믿으라 그리하면 너희에게 그대로 되리라.', img:vbImg('faith',1) },
  { id:'v37', cat:'faith', refEn:'Matthew 17:20', refKo:'마태복음 17:20', angle:'unseen_belief',
    en:'If you have faith as small as a mustard seed, nothing will be impossible for you.',
    ko:'너희가 믿음이 겨자씨 한 알만큼만 있어도 너희가 못할 것이 없으리라.', img:vbImg('faith',0) },
  { id:'v38', cat:'forgiveness', refEn:'1 John 1:9', refKo:'요한일서 1:9', angle:'inner_healing',
    en:'If we confess our sins, he is faithful and just to forgive us and cleanse us.',
    ko:'만일 우리가 우리 죄를 자백하면 그는 미쁘시고 의로우사 우리 죄를 사하시며 깨끗하게 하실 것이요.', img:vbImg('forgiveness',1) },
  { id:'v39', cat:'forgiveness', refEn:'Luke 6:37', refKo:'누가복음 6:37', angle:'grace_toward_others',
    en:'Do not judge, and you will not be judged. Forgive, and you will be forgiven.',
    ko:'비판하지 말라 그리하면 너희가 비판을 받지 않을 것이요 용서하라 그리하면 너희가 용서를 받을 것이요.', img:vbImg('forgiveness',0) },
  { id:'v40', cat:'gratitude', refEn:'Colossians 3:15', refKo:'골로새서 3:15', angle:'contentment',
    en:'Let the peace of Christ rule in your hearts. And be thankful.',
    ko:'그리스도의 평강이 너희 마음을 주장하게 하라 너희는 또한 감사하는 자가 되라.', img:vbImg('gratitude',1) },
  { id:'v41', cat:'gratitude', refEn:'Ephesians 5:20', refKo:'에베소서 5:20', angle:'remembering_blessings',
    en:'Always giving thanks to God the Father for everything, in the name of our Lord Jesus Christ.',
    ko:'범사에 우리 주 예수 그리스도의 이름으로 항상 아버지 하나님께 감사하며.', img:vbImg('gratitude',0) },
  { id:'v42', cat:'hope', refEn:'Lamentations 3:22-23', refKo:'예레미야애가 3:22-23', angle:'new_beginning',
    en:'His mercies are new every morning; great is your faithfulness.',
    ko:'여호와의 자비와 긍휼이 무궁하시므로 아침마다 새로우니 주의 성실하심이 크시도소이다.', img:vbImg('hope',1) },
  { id:'v43', cat:'hope', refEn:'Psalm 39:7', refKo:'시편 39:7', angle:'waiting',
    en:'But now, Lord, what do I look for? My hope is in you.',
    ko:'주여 이제 내가 무엇을 바라리요 나의 소망은 주께 있나이다.', img:vbImg('hope',0) },
  { id:'v44', cat:'wisdom', refEn:'Proverbs 2:6', refKo:'잠언 2:6', angle:'humility',
    en:'For the Lord gives wisdom; from his mouth come knowledge and understanding.',
    ko:'대저 여호와는 지혜를 주시며 지식과 명철을 그 입에서 내심이며.', img:vbImg('wisdom',1) },
  { id:'v45', cat:'wisdom', refEn:'James 3:17', refKo:'야고보서 3:17', angle:'self_control',
    en:'The wisdom from above is first pure, then peace-loving, considerate, and full of mercy.',
    ko:'위로부터 난 지혜는 첫째 성결하고 다음에 화평하고 관용하고 양순하며 긍휼이 가득하니라.', img:vbImg('wisdom',0) },
];

// helpers
const vbCategory   = (id) => VB_CATEGORIES.find(c => c.id === id);
const vbVerse      = (id) => VB_VERSES.find(v => v.id === id);
const vbVersesByCat= (id) => VB_VERSES.filter(v => v.cat === id);
function vbGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}
function vbFormatDate(d = new Date()) {
  return d.toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' });
}

// ─────────────────────────────────────────────────────────────
// Icons — thin rounded stroke set. <VBIcon name size/> inherits currentColor.
// ─────────────────────────────────────────────────────────────
function VBIcon({ name, size = 22, fill = false, style = {}, strokeWidth = 1.7 }) {
  const p = { fill:'none', stroke:'currentColor', strokeWidth, strokeLinecap:'round', strokeLinejoin:'round' };
  const paths = {
    today:   <><circle cx="12" cy="13" r="4" {...p}/><path d="M12 3v2M12 21v0M4.5 13H3M21 13h-1.5M6 7L5 6M18 7l1-1" {...p}/></>,
    grid:    <><rect x="4" y="4" width="6.5" height="6.5" rx="2" {...p}/><rect x="13.5" y="4" width="6.5" height="6.5" rx="2" {...p}/><rect x="4" y="13.5" width="6.5" height="6.5" rx="2" {...p}/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="2" {...p}/></>,
    bookmark: fill
      ? <path d="M6 4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21l-6-3.6L6 21z" fill="currentColor" stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="round"/>
      : <path d="M6 4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21l-6-3.6L6 21z" {...p}/>,
    person:  <><circle cx="12" cy="8" r="4" {...p}/><path d="M4.5 20a7.5 7.5 0 0 1 15 0" {...p}/></>,
    refresh: <><path d="M4 12a8 8 0 0 1 13.7-5.6L20 8.5M20 4v4.5h-4.5" {...p}/><path d="M20 12a8 8 0 0 1-13.7 5.6L4 15.5M4 20v-4.5h4.5" {...p}/></>,
    note:    <><path d="M5 19l-1 1 1-4L16 5a2 2 0 0 1 3 3L8 19z" {...p}/><path d="M14 7l3 3" {...p}/></>,
    share:   <><path d="M12 15V4M12 4L8.5 7.5M12 4l3.5 3.5" {...p}/><path d="M6 11H5a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7a1 1 0 0 0-1-1h-1" {...p}/></>,
    search:  <><circle cx="11" cy="11" r="7" {...p}/><path d="M16 16l4 4" {...p}/></>,
    calendar: <><rect x="3.5" y="5" width="17" height="15.5" rx="2.5" {...p}/><path d="M3.5 9.5h17M8 3.5v3M16 3.5v3" {...p}/></>,
    award: <><circle cx="12" cy="9" r="5.5" {...p}/><path d="M9 13.5L7.5 21l4.5-2.5L16.5 21 15 13.5" {...p}/></>,
    gear:    <><circle cx="12" cy="12" r="3.2" {...p}/><path d="M12 3.5v2.2M12 18.3v2.2M20.5 12h-2.2M5.7 12H3.5M18 6l-1.6 1.6M7.6 16.4 6 18M18 18l-1.6-1.6M7.6 7.6 6 6" {...p}/></>,
    bell:    <><path d="M6 10a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" {...p}/><path d="M10.5 20a1.5 1.5 0 0 0 3 0" {...p}/></>,
    globe:   <><circle cx="12" cy="12" r="8.5" {...p}/><path d="M3.5 12h17M12 3.5c2.5 2.4 2.5 14.6 0 17M12 3.5c-2.5 2.4-2.5 14.6 0 17" {...p}/></>,
    heart:   fill
      ? <path d="M12 20s-7-4.6-9.2-9C1.3 8 3 4.5 6.3 4.5c1.9 0 3.2 1.1 3.7 2.2.5-1.1 1.8-2.2 3.7-2.2 3.3 0 5 3.5 3.5 6.5C19 15.4 12 20 12 20Z" fill="currentColor" stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="round"/>
      : <path d="M12 20s-7-4.6-9.2-9C1.3 8 3 4.5 6.3 4.5c1.9 0 3.2 1.1 3.7 2.2.5-1.1 1.8-2.2 3.7-2.2 3.3 0 5 3.5 3.5 6.5C19 15.4 12 20 12 20Z" {...p}/>,
    chevron: <path d="M9 5l7 7-7 7" {...p}/>,
    back:    <path d="M15 5l-7 7 7 7" {...p}/>,
    plus:    <path d="M12 5v14M5 12h14" {...p}/>,
    close:   <path d="M6 6l12 12M18 6L6 18" {...p}/>,
    check:   <path d="M5 12.5l4.5 4.5L19 6.5" {...p}/>,
    trash:   <><path d="M5 7h14M10 7V5h4v2M6.5 7l.8 12a1.5 1.5 0 0 0 1.5 1.4h6.4a1.5 1.5 0 0 0 1.5-1.4L18 7" {...p}/></>,
    sun:     <><circle cx="12" cy="12" r="4" {...p}/><path d="M12 2.5v2M12 19.5v2M21.5 12h-2M4.5 12h-2M18.4 5.6 17 7M7 17l-1.4 1.4M18.4 18.4 17 17M7 7 5.6 5.6" {...p}/></>,
    moon:    <path d="M20 14.5A8 8 0 0 1 9.5 4 7 7 0 1 0 20 14.5Z" {...p}/>,
    sliders: <><path d="M4 8h10M18 8h2M4 16h2M10 16h10" {...p}/><circle cx="16" cy="8" r="2.2" {...p}/><circle cx="8" cy="16" r="2.2" {...p}/></>,
    sparkle: <path d="M12 4l1.6 4.8L18.5 10l-4.9 1.2L12 16l-1.6-4.8L5.5 10l4.9-1.2z" {...p}/>,
    quote:   <><path d="M9 7c-2.2 0-4 1.8-4 4v6h5v-5H7c0-1.7 1-2.5 2-2.7zM19 7c-2.2 0-4 1.8-4 4v6h5v-5h-3c0-1.7 1-2.5 2-2.7z" fill="currentColor" stroke="none"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={style} aria-hidden="true">
      {paths[name] || null}
    </svg>
  );
}

Object.assign(window, {
  VB_CATEGORIES, VB_VERSES, VB_IMAGES, VBIcon,
  vbCategory, vbVerse, vbVersesByCat, vbGreeting, vbFormatDate,
});
