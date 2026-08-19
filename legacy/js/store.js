/* Limbu AI — application state, mock data, persistence */
(function(){
  const KEY = 'limbu.ai.state.v1';

  const rand = (a,b)=>Math.floor(Math.random()*(b-a+1))+a;
  const pick = a => a[Math.floor(Math.random()*a.length)];
  const uid  = p => (p||'id')+'_'+Math.random().toString(36).slice(2,9);
  const days = n => { const d=new Date(); d.setDate(d.getDate()-n); return d.toISOString(); };

  /* ---------- seed data ---------- */
  const BUSINESSES = [
    {id:'b1',name:'Sunrise Dental Care',cat:'Dental clinic',loc:'Andheri West, Mumbai',city:'Mumbai',rating:4.6,reviews:284,
     phone:'+91 98200 41120',site:'sunrisedental.in',verified:true,
     hours:'Mon–Sat 09:00–20:00',lat:19.136,lng:72.826},
    {id:'b2',name:'Sunrise Dental — Bandra',cat:'Dental clinic',loc:'Bandra West, Mumbai',city:'Mumbai',rating:4.4,reviews:151,
     phone:'+91 98200 41121',site:'sunrisedental.in',verified:true,hours:'Mon–Sat 10:00–21:00',lat:19.06,lng:72.83},
    {id:'b3',name:'Sunrise Smile Studio',cat:'Cosmetic dentist',loc:'Powai, Mumbai',city:'Mumbai',rating:4.8,reviews:96,
     phone:'+91 98200 41122',site:'sunrisedental.in',verified:false,hours:'Tue–Sun 11:00–20:00',lat:19.117,lng:72.905}
  ];

  const CAPTIONS = [
    'Painless root canals, done in a single sitting ✨ Book your slot today.',
    'Your smile deserves the best care in Mumbai. Walk in this week for a free consult.',
    'Invisible aligners now at Sunrise Dental — straighten teeth without anyone noticing.',
    'Kids dental check-ups every Saturday. Gentle, fun and completely painless.',
    'Teeth whitening in 60 minutes. Real results, no sensitivity.',
    'Monsoon offer: full dental check-up + cleaning at ₹499 only.'
  ];
  const REVIEW_TEXT = [
    ['Dr. Mehta was incredibly gentle. Root canal done in one sitting, zero pain.',5],
    ['Clean clinic, on-time appointments and transparent pricing. Highly recommend.',5],
    ['Good treatment but the waiting time was almost 40 minutes on a weekday.',3],
    ['Best dental experience in Andheri. Staff explained everything before starting.',5],
    ['Charges felt a bit on the higher side, though the work quality is very good.',4],
    ['Booked for whitening, results were visible the same day. Very happy!',5],
    ['Reception did not pick up calls twice. Treatment itself was fine.',2],
    ['My kid actually enjoyed the visit. That says everything.',5],
    ['Great hygiene standards, modern equipment and friendly doctors.',5],
    ['Appointment got rescheduled last minute without informing me.',2]
  ];
  const NAMES = ['Rahul Sharma','Priya Nair','Aditya Kulkarni','Sneha Patil','Vikram Shetty','Meera Iyer','Arjun Desai','Fatima Shaikh','Rohit Gupta','Ananya Rao','Karan Malhotra','Divya Menon'];
  const SERVICES = ['Root Canal','Teeth Whitening','Invisible Aligners','Dental Implants','Kids Dentistry','Full Check-up'];

  const KEYWORD_SEEDS = [
    ['dentist near me',18100,68],['dental clinic in andheri',3600,42],['root canal cost mumbai',2900,55],
    ['best dentist mumbai',5400,74],['teeth whitening andheri',880,31],['invisible aligners india',1900,61],
    ['dental implants cost',4400,66],['emergency dentist mumbai',1300,38],['kids dentist near me',2400,44],
    ['painless root canal',720,26],['orthodontist andheri west',590,29],['smile makeover mumbai',480,47],
    ['24 hour dental clinic',390,33],['dental checkup offer',260,19],['braces cost in mumbai',3300,58]
  ];

  const COMPETITORS = ['Perfect Smile Dental','City Dental Hub','Dr. Kapoor Dental','Bright Teeth Clinic','Elite Dental Studio','Smile Zone Mumbai'];

  function seedPosts(){
    const st = ['posted','posted','scheduled','pending','approved','rejected','posted','pending'];
    const pl = [['google'],['google','facebook'],['instagram'],['facebook','instagram'],['google','instagram','facebook'],['linkedin'],['youtube'],['pinterest']];
    return Array.from({length:14},(_,i)=>({
      id:uid('post'), caption:pick(CAPTIONS), status:pick(st), platforms:pick(pl),
      type: i%7===0?'video':'image', ratio:pick(['1:1','4:5','16:9','9:16']),
      theme:pick(['lemon','ocean','sunset','forest','mono']),
      keywords:[pick(KEYWORD_SEEDS)[0],pick(KEYWORD_SEEDS)[0]],
      mode: i%3===0?'manual':'auto', bizId:pick(['b1','b1','b2','b3']),
      createdAt: days(rand(0,30)), scheduledAt: days(-rand(1,14)),
      stats:{views:rand(120,4200),likes:rand(8,320),clicks:rand(3,180)}
    }));
  }

  function seedReviews(){
    return Array.from({length:16},(_,i)=>{
      const [text,rating]=REVIEW_TEXT[i%REVIEW_TEXT.length];
      const replied = Math.random()>0.45;
      return {id:uid('rev'),author:NAMES[i%NAMES.length],rating,text,bizId:pick(['b1','b1','b2','b3']),
        createdAt:days(rand(0,60)),
        reply: replied ? 'Thank you so much for your kind words! We look forward to seeing you again at Sunrise Dental. 🦷' : null,
        replyAuto: replied && Math.random()>0.5, source:'google'};
    });
  }

  function seedLeads(){
    const st=['new','new','contacted','converted','spam','contacted','converted','new'];
    return Array.from({length:18},(_,i)=>({
      id:uid('lead'),name:NAMES[i%NAMES.length],
      phone:'+91 9'+rand(100000000,999999999),
      email:NAMES[i%NAMES.length].split(' ')[0].toLowerCase()+rand(10,99)+'@gmail.com',
      service:pick(SERVICES),status:pick(st),source:pick(['Website form','Magic QR','Google post','WhatsApp']),
      message:pick(['Need an appointment this weekend.','What is the cost of aligners?','Do you accept insurance?','Please call me back after 6pm.']),
      createdAt:days(rand(0,25))
    }));
  }

  function seedKeywords(){
    return KEYWORD_SEEDS.slice(0,6).map(([kw,vol,diff])=>({id:uid('kw'),kw,vol,diff,cpc:(Math.random()*3+.4).toFixed(2),saved:true}));
  }

  function seedTx(){
    const items=[
      ['credit','Wallet recharge — Razorpay',5000],['debit','AI image generation ×12',-240],
      ['debit','Auto post publishing ×8',-160],['credit','Bonus credits — Professional plan',750],
      ['debit','Competitor rank audit 5×5',-350],['debit','AI review replies ×22',-110],
      ['credit','Wallet recharge — Razorpay',2000],['debit','Website builder generation',-500]
    ];
    return items.map((t,i)=>({id:uid('tx'),type:t[0],label:t[1],amount:t[2],at:days(i*3+1),
      ref:'LMB'+rand(100000,999999)}));
  }

  const DEFAULTS = {
    user:{name:'Rajesh Kumar',email:'rajesh@sunrisedental.in',phone:'+91 98200 41120',
      plan:'Professional',verified:true,memberSince:'12 Jan 2025',renews:'12 Sep 2026',
      credits:4820,creditCap:7500},
    theme:'light',
    activeBiz:'b1',
    businesses:BUSINESSES,
    gmbConnected:true,
    posts:seedPosts(),
    reviews:seedReviews(),
    leads:seedLeads(),
    keywords:seedKeywords(),
    audits:[],
    transactions:seedTx(),
    websites:[{id:uid('site'),name:'Sunrise Dental Care',template:'Medical Pro',domain:'sunrisedental.limbu.site',
      status:'live',pages:6,leads:34,createdAt:days(21)}],
    social:{google:true,facebook:true,instagram:true,linkedin:false,youtube:false,pinterest:false,whatsapp:true},
    brand:{
      theme:'lemon',custom:'#FACC15',ratio:'1:1',
      style:'Modern, clean, trustworthy healthcare tone',
      images:{logo:1,character:2,uniform:1,background:3},
      products:[
        {id:uid('p'),name:'Invisible Aligners',price:'₹65,000',imgs:3},
        {id:uid('p'),name:'Zoom Teeth Whitening',price:'₹8,999',imgs:2},
        {id:uid('p'),name:'Single Sitting RCT',price:'₹4,500',imgs:1}
      ]
    },
    settings:{autoReply:true,autoPost:true,passkey:false,adminApproval:true,
      lang:'en',notifyEmail:true,notifyWhatsapp:true},
    qr:{slug:'sunrise-dental',scans:412,reviewsCollected:96,threshold:4},
    notifications:[
      {id:uid('n'),icon:'star',title:'3 new Google reviews',desc:'2 are waiting for a reply',at:days(0)},
      {id:uid('n'),icon:'send',title:'Post published to Google',desc:'"Painless root canals…" is live',at:days(0)},
      {id:uid('n'),icon:'inbox',title:'2 new website leads',desc:'From sunrisedental.limbu.site',at:days(1)},
      {id:uid('n'),icon:'coin',title:'Credits running low',desc:'You have 4,820 credits left',at:days(2)}
    ]
  };

  /* ---------- store ---------- */
  let state;
  try{
    const saved = localStorage.getItem(KEY);
    state = saved ? Object.assign({},DEFAULTS,JSON.parse(saved)) : DEFAULTS;
  }catch(e){ state = DEFAULTS; }

  const subs = [];
  const Store = {
    get state(){ return state; },
    get biz(){ return state.businesses.find(b=>b.id===state.activeBiz) || state.businesses[0]; },
    save(){
      try{ localStorage.setItem(KEY, JSON.stringify(state)); }catch(e){}
      subs.forEach(fn=>fn(state));
    },
    set(patch){ Object.assign(state,patch); this.save(); },
    sub(fn){ subs.push(fn); },
    reset(){ localStorage.removeItem(KEY); location.reload(); },
    spend(n,label){
      if(state.user.credits < n) return false;
      state.user.credits -= n;
      state.transactions.unshift({id:uid('tx'),type:'debit',label:label,amount:-n,at:new Date().toISOString(),ref:'LMB'+rand(100000,999999)});
      this.save(); return true;
    },
    topup(n,bonus,label){
      state.user.credits += n + (bonus||0);
      state.transactions.unshift({id:uid('tx'),type:'credit',label:label||'Wallet recharge — Razorpay',amount:n+(bonus||0),at:new Date().toISOString(),ref:'LMB'+rand(100000,999999)});
      this.save();
    },
    util:{rand,pick,uid,days},
    seeds:{KEYWORD_SEEDS,COMPETITORS,CAPTIONS,SERVICES,NAMES}
  };
  window.Store = Store;
})();
