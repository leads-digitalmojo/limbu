/* Limbu AI — router, navigation, command palette, global chrome */
(function(){
  const {$,$$,fmt,toast,modal,closeModal} = UI;
  window.Views = window.Views || {};

  /* ---------- navigation model (the 7 product systems) ---------- */
  const NAV = [
    {group:'Overview', items:[
      {id:'dashboard', label:'Dashboard', icon:'grid', desc:'Business overview & quick launch'}
    ]},
    {group:'Google Business Profile', items:[
      {id:'gmb-connect',  label:'GMB Connection', icon:'google',       desc:'Connect your Google Business Profile'},
      {id:'gmb-health',   label:'GMB Health',     icon:'stethoscope',  desc:'Audit and optimise your profile'},
      {id:'gmb-insights', label:'GMB Insights',   icon:'chart',        desc:'Views, searches, calls, directions'},
      {id:'reviews',      label:'Reviews',        icon:'star',         desc:'Manage Google reviews'},
      {id:'review-reply', label:'Review Reply',   icon:'reply',        desc:'AI replies, approval & auto-reply'},
      {id:'magic-qr',     label:'Magic QR',       icon:'qr',           desc:'Collect reviews with a QR code'}
    ]},
    {group:'AI Content', items:[
      {id:'posts',   label:'Post Management', icon:'send',    desc:'Auto post, manual post, scheduling', tag:'AI'},
      {id:'assets',  label:'Assets Manager',  icon:'palette', desc:'Brand style, images & product gallery'}
    ]},
    {group:'Local SEO', items:[
      {id:'keywords',    label:'Keyword Planner',    icon:'key',    desc:'Search volume, difficulty, saved keywords'},
      {id:'competitors', label:'Competitor Analysis',icon:'map',    desc:'Google Maps grid rank tracking', tag:'PRO'}
    ]},
    {group:'Website & Leads', items:[
      {id:'website', label:'Website Builder', icon:'monitor', desc:'Generate a site from your GMB data'},
      {id:'leads',   label:'Website Leads',   icon:'inbox',   desc:'Lead inbox and pipeline'}
    ]},
    {group:'Account', items:[
      {id:'social',   label:'Social Connections', icon:'share',   desc:'Facebook, Instagram, LinkedIn, YouTube…'},
      {id:'profile',  label:'My Profile',         icon:'user',    desc:'Account, activity and usage'},
      {id:'wallet',   label:'Wallet',             icon:'wallet',  desc:'Credits, recharge and transactions'},
      {id:'pricing',  label:'Subscription',       icon:'crown',   desc:'Plans, services and packages'},
      {id:'settings', label:'Settings',           icon:'settings',desc:'Account & application settings'}
    ]}
  ];
  const FLAT = NAV.flatMap(g=>g.items.map(i=>Object.assign({group:g.group},i)));

  /* extra palette actions */
  const ACTIONS = [
    {id:'posts/new',       label:'Create a Magic Post',  icon:'wand',    desc:'AI generates caption + image', group:'Actions'},
    {id:'keywords',        label:'Research keywords',    icon:'search',  desc:'Find what customers search for', group:'Actions'},
    {id:'competitors',     label:'Run a rank audit',     icon:'target',  desc:'5×5 Google Maps grid', group:'Actions'},
    {id:'reviews',         label:'Reply to reviews',     icon:'reply',   desc:'Reviews without a reply', group:'Actions'},
    {id:'wallet',          label:'Recharge wallet',      icon:'coin',    desc:'Add credits via Razorpay', group:'Actions'},
    {id:'magic-qr',        label:'Download Magic QR',    icon:'qr',      desc:'Print-ready review QR', group:'Actions'}
  ];

  /* ---------- sidebar ---------- */
  function renderNav(){
    const S=Store.state;
    const counts = {
      reviews: S.reviews.filter(r=>!r.reply).length,
      leads:   S.leads.filter(l=>l.status==='new').length,
      posts:   S.posts.filter(p=>p.status==='pending').length
    };
    $('#nav').innerHTML = NAV.map(g=>
      '<div class="nav-group"><div class="nav-title">'+g.group+'</div>'+
      g.items.map(it=>{
        const c=counts[it.id];
        return '<a class="nav-item" href="#/'+it.id+'" data-nav="'+it.id+'">'+Icon(it.icon)+'<span>'+it.label+'</span>'+
          (it.tag?'<span class="tag">'+it.tag+'</span>':(c?'<span class="count">'+c+'</span>':''))+'</a>';
      }).join('')+'</div>').join('');
    syncChrome();
  }

  function syncChrome(){
    const S=Store.state, b=Store.biz;
    $('#bizName').textContent = b.name;
    $('#bizLoc').textContent  = b.loc;
    $('.biz-avatar').textContent = fmt.initials(b.name);
    $('#sideCredits').textContent = fmt.n(S.user.credits);
    $('#topCredits').textContent  = fmt.n(S.user.credits);
    $('#planBadge').textContent   = S.user.plan;
    $('#creditMeter').style.width = Math.min(100,(S.user.credits/S.user.creditCap)*100)+'%';
    $('#notifBtn').classList.toggle('has-dot', S.notifications.length>0);
  }

  /* ---------- router ---------- */
  function route(){
    const hash = location.hash.replace(/^#\/?/,'') || 'dashboard';
    const [id, ...rest] = hash.split('/');
    const view = Views[id] || Views.dashboard;
    const el = $('#view');
    el.innerHTML = '';
    const out = view({sub:rest[0], params:rest});
    el.innerHTML = typeof out === 'string' ? out : (out.html||'');
    if(typeof out === 'object' && out.mount) out.mount(el);
    $$('#nav .nav-item').forEach(a=>a.classList.toggle('active', a.dataset.nav===id));
    document.title = (FLAT.find(f=>f.id===id)?.label || 'Dashboard') + ' — Limbu AI';
    window.scrollTo(0,0);
    $('#app').classList.remove('nav-open');
    hydrateIcons(el);
  }

  function hydrateIcons(root){
    $$('[data-icon]', root||document).forEach(el=>{
      if(el.dataset.iconDone) return;
      el.insertAdjacentHTML('afterbegin', Icon(el.dataset.icon));
      el.dataset.iconDone='1';
    });
  }

  /* ---------- command palette ---------- */
  let pSel=0, pList=[];
  function openSearch(){
    $('#palette').hidden=false;
    $('#paletteInput').value='';
    renderPalette('');
    setTimeout(()=>$('#paletteInput').focus(),20);
  }
  function closeSearch(){ $('#palette').hidden=true; }
  function renderPalette(q){
    q=q.trim().toLowerCase();
    const pool = FLAT.concat(ACTIONS);
    pList = q ? pool.filter(i=>(i.label+' '+i.desc+' '+i.group).toLowerCase().includes(q)) : pool;
    pSel = 0;
    if(!pList.length){ $('#paletteResults').innerHTML='<div class="empty" style="padding:34px"><p>No matches for “'+fmt.esc(q)+'”</p></div>'; return; }
    const groups={};
    pList.forEach((i,idx)=>{ (groups[i.group]=groups[i.group]||[]).push([i,idx]); });
    $('#paletteResults').innerHTML = Object.keys(groups).map(g=>
      '<div class="p-group">'+g+'</div>'+groups[g].map(([i,idx])=>
        '<div class="p-item'+(idx===0?' sel':'')+'" data-idx="'+idx+'" data-go="'+i.id+'">'+Icon(i.icon)+
        '<div><div class="p-name">'+fmt.esc(i.label)+'</div><div class="p-desc">'+fmt.esc(i.desc)+'</div></div>'+
        '<span class="go">↵</span></div>').join('')).join('');
  }
  function moveSel(d){
    const items=$$('#paletteResults .p-item'); if(!items.length) return;
    pSel=(pSel+d+items.length)%items.length;
    items.forEach((el,i)=>el.classList.toggle('sel', i===pSel));
    items[pSel].scrollIntoView({block:'nearest'});
  }
  function goSel(){
    const el=$$('#paletteResults .p-item')[pSel]; if(!el) return;
    closeSearch(); location.hash='#/'+el.dataset.go;
  }

  /* ---------- theme ---------- */
  function applyTheme(t){
    document.documentElement.dataset.theme=t;
    const btn=$('#themeBtn'); btn.innerHTML=Icon(t==='dark'?'sun':'moon');
    Store.set({theme:t});
  }

  /* ---------- notifications ---------- */
  function openNotif(){
    const S=Store.state;
    modal({title:'Notifications', body:
      (S.notifications.length? '<div class="stack" style="gap:0">'+S.notifications.map(n=>
        '<div class="row" style="gap:12px;padding:13px 2px;border-bottom:1px solid var(--line-2);flex-wrap:nowrap;align-items:flex-start">'+
        '<div class="stat-icon" style="width:32px;height:32px;flex:0 0 32px">'+Icon(n.icon)+'</div>'+
        '<div style="flex:1"><b style="font-size:13px">'+fmt.esc(n.title)+'</b>'+
        '<div class="small muted">'+fmt.esc(n.desc)+'</div></div>'+
        '<span class="small muted" style="white-space:nowrap">'+fmt.ago(n.at)+'</span></div>').join('')+'</div>'
      : UI.empty('bell','All caught up','No new notifications right now.')),
      foot:'<button class="btn btn-ghost" id="clearNotif">Clear all</button><button class="btn btn-dark" data-action="close-modal">Done</button>'});
    const c=$('#clearNotif'); if(c) c.onclick=()=>{ Store.set({notifications:[]}); closeModal(); syncChrome(); toast('Notifications cleared','',''); };
  }

  /* ---------- business switcher ---------- */
  function openBiz(){
    const S=Store.state;
    modal({title:'Switch business location', body:
      '<div class="stack" style="gap:10px">'+S.businesses.map(b=>
        '<div class="conn-card" data-biz="'+b.id+'" style="cursor:pointer">'+
        '<div class="biz-avatar">'+fmt.initials(b.name)+'</div>'+
        '<div style="flex:1"><b style="font-size:13.5px">'+fmt.esc(b.name)+'</b>'+
        '<div class="small muted">'+fmt.esc(b.loc)+' • '+b.rating+'★ ('+b.reviews+')</div></div>'+
        (b.id===S.activeBiz?'<span class="badge badge-lemon">Active</span>':
          (b.verified?'<span class="badge badge-green">Verified</span>':'<span class="badge badge-amber">Unverified</span>'))+
        '</div>').join('')+'</div>'+
      '<a href="#/gmb-connect" class="btn btn-outline btn-block mt-16" data-action="close-modal">'+Icon('plus')+'Connect another location</a>',
      onMount(body){
        $$('[data-biz]',body).forEach(el=>el.onclick=()=>{
          Store.set({activeBiz:el.dataset.biz}); closeModal(); renderNav(); route();
          toast('Business switched', Store.biz.name, 'ok');
        });
      }});
  }

  /* ---------- global click handling ---------- */
  document.addEventListener('click', e=>{
    const t = e.target.closest('[data-action]');
    if(!t) return;
    const a = t.dataset.action;
    if(a==='toggle-sidebar') $('#app').classList.toggle('nav-open');
    if(a==='open-search'){ e.preventDefault(); openSearch(); }
    if(a==='close-search') closeSearch();
    if(a==='close-modal') closeModal();
    if(a==='toggle-theme') applyTheme(document.documentElement.dataset.theme==='dark'?'light':'dark');
    if(a==='open-notif') openNotif();
    if(a==='open-biz') openBiz();
    if(a==='open-profile') location.hash='#/profile';
  });

  document.addEventListener('keydown', e=>{
    if((e.metaKey||e.ctrlKey) && e.key.toLowerCase()==='k'){ e.preventDefault(); $('#palette').hidden?openSearch():closeSearch(); return; }
    if(e.key==='Escape'){ if(!$('#palette').hidden) closeSearch(); else if(!$('#modal').hidden) closeModal(); }
    if($('#palette').hidden) return;
    if(e.key==='ArrowDown'){ e.preventDefault(); moveSel(1); }
    if(e.key==='ArrowUp'){ e.preventDefault(); moveSel(-1); }
    if(e.key==='Enter'){ e.preventDefault(); goSel(); }
  });

  $('#paletteInput').addEventListener('input', e=>renderPalette(e.target.value));
  $('#paletteResults').addEventListener('click', e=>{
    const it=e.target.closest('.p-item'); if(!it) return;
    pSel=+it.dataset.idx; goSel();
  });

  /* ---------- boot ---------- */
  window.addEventListener('hashchange', route);
  Store.sub(syncChrome);
  window.LimbuNav = {NAV, FLAT, renderNav, hydrateIcons, syncChrome};

  document.getElementById('yr').textContent = new Date().getFullYear();
  applyTheme(Store.state.theme||'light');
  hydrateIcons();
  renderNav();
  route();
})();
