/* Limbu AI — Website Builder */
(function(){
  window.Views=window.Views||{};
  const {fmt,pageHead,$,$$,toast,work,modal,closeModal,statCard,empty}=UI;

  const TEMPLATES=[
    {id:'medical',name:'Medical Pro',desc:'Clinics, dentists, diagnostics',c:['#0EA5E9','#0F172B']},
    {id:'salon',  name:'Glow Studio', desc:'Salons, spas, wellness',      c:['#EC4899','#431407']},
    {id:'food',   name:'Savour',      desc:'Restaurants and cafés',        c:['#F97316','#431407']},
    {id:'fitness',name:'Iron',        desc:'Gyms and fitness studios',     c:['#10B981','#052E16']},
    {id:'retail', name:'Storefront',  desc:'Shops and showrooms',          c:['#6366F1','#1E1B4B']},
    {id:'service',name:'Trade Pro',   desc:'Services and contractors',     c:['#EAB308','#0F172B']}
  ];
  const SECTIONS=[['building','Business information','Name, category, about'],
    ['tag','Services','Pulled from your GMB services list'],
    ['image','Photo gallery','Every photo on your Business Profile'],
    ['clock','Business hours','Live hours, including holidays'],
    ['star','Reviews wall','Your best Google reviews, auto-updating'],
    ['phone','Contact & map','Click-to-call, WhatsApp, directions'],
    ['inbox','Lead capture form','Feeds straight into Website Leads'],
    ['key','SEO pages','A page per service × locality from your keywords']];

  Views.website=function(){
    const S=Store.state, b=Store.biz;
    const site=S.websites[0];

    const html=pageHead({eyebrow:'Website & leads',eyebrowIcon:'monitor',title:'Website Builder',
      sub:'Generate a complete, SEO-ready website from your Google Business Profile — no designer, no developer.',
      actions:'<button class="btn btn-outline" id="wsPreview">'+Icon('eye')+'Preview</button>'+
              '<button class="btn btn-primary" id="wsBuild">'+Icon('wand')+'Generate website</button>'})+

      (site?'<div class="card mb-16"><div class="card-body"><div class="row-between">'+
        '<div class="row" style="flex-wrap:nowrap"><span class="stat-icon green">'+Icon('globe')+'</span>'+
        '<div><b style="font-size:14px">'+fmt.esc(site.domain)+'</b>'+
        '<div class="small muted">'+fmt.esc(site.template)+' template • '+site.pages+' pages • published '+fmt.ago(site.createdAt)+'</div></div></div>'+
        '<div class="row"><span class="badge badge-green"><span class="dot"></span>Live</span>'+
        '<a class="btn btn-sm btn-outline" href="#/leads">'+Icon('inbox')+site.leads+' leads</a>'+
        '<button class="btn btn-sm btn-outline" id="wsEdit">'+Icon('edit')+'Edit</button></div>'+
      '</div></div></div>':'')+

      '<div class="grid g-4 mb-16">'+
        statCard({icon:'globe',tone:'blue',value:S.websites.length,label:'Live websites'})+
        statCard({icon:'eye',value:fmt.compact(2840),label:'Website visitors (30d)',delta:64})+
        statCard({icon:'inbox',tone:'pink',value:fmt.n(S.leads.length),label:'Leads captured',delta:19})+
        statCard({icon:'zap',tone:'green',value:'98',label:'PageSpeed score'})+
      '</div>'+

      '<div class="grid" style="grid-template-columns:1fr 340px" id="wsCols"><div class="stack">'+
        '<div class="card"><div class="card-head"><div><h3>1 · Choose a template</h3><p>Every template is mobile-first and SEO-ready</p></div></div>'+
        '<div class="card-body"><div class="grid g-3" style="gap:12px" id="wsTpl">'+
          TEMPLATES.map((t,i)=>'<div class="card card-hover'+(i===0?' on':'')+'" data-tpl="'+t.id+'"'+(i===0?' style="border-color:var(--lemon)"':'')+'>'+
            '<div class="post-media r-16-9" style="background:linear-gradient(150deg,'+t.c[0]+','+t.c[1]+')">'+
              '<div class="glow"></div><div style="position:relative;text-align:center;color:#fff">'+
              '<div style="width:60%;height:5px;background:rgba(255,255,255,.85);border-radius:9px;margin:0 auto 6px"></div>'+
              '<div style="width:40%;height:4px;background:rgba(255,255,255,.5);border-radius:9px;margin:0 auto 10px"></div>'+
              '<div style="font-family:var(--font-h);font-weight:800;font-size:13px">'+t.name+'</div></div></div>'+
            '<div class="post-foot"><b style="font-size:12.5px">'+t.name+'</b><div class="small muted">'+t.desc+'</div></div></div>').join('')+
        '</div></div></div>'+

        '<div class="card"><div class="card-head"><div><h3>2 · Data imported from your Google Business Profile</h3>'+
          '<p>Nothing to type — Limbu reads it straight from Google</p></div>'+
          '<button class="btn btn-outline btn-sm" id="wsReimport">'+Icon('sync')+'Re-import</button></div>'+
        '<div class="card-body"><div class="grid g-2" style="gap:12px">'+
          [['Business name',b.name],['Category',b.cat],['Address',b.loc],['Phone',b.phone],
           ['Hours',b.hours],['Rating',b.rating+'★ from '+b.reviews+' reviews'],
           ['Services',Store.state.brand.products.length+' services imported'],['Photos','11 photos imported']].map(([k,v])=>
          '<div class="card card-pad" style="padding:12px"><div class="small muted">'+k+'</div>'+
          '<b style="font-size:13px">'+fmt.esc(String(v))+'</b></div>').join('')+
        '</div></div></div>'+

        '<div class="card"><div class="card-head"><div><h3>3 · Sections to include</h3></div></div>'+
        '<div class="card-body"><div class="grid g-2" style="gap:10px">'+
          SECTIONS.map(([i,t,d],idx)=>'<label class="check"><input type="checkbox" checked>'+
          '<span><b style="font-size:12.5px">'+t+'</b><div class="small muted">'+d+'</div></span></label>').join('')+
        '</div></div></div>'+
      '</div>'+

      '<div class="stack">'+
        '<div class="card" style="position:sticky;top:82px"><div class="card-head"><div><h3>Live preview</h3></div></div>'+
        '<div class="card-body"><div id="wsFrame"></div>'+
        '<div class="field mt-16"><span class="label">Domain</span>'+
        '<input class="input" id="wsDomain" value="'+fmt.esc(site?site.domain:'sunrisedental.limbu.site')+'">'+
        '<div class="hint">Free limbu.site subdomain, or connect your own domain.</div></div>'+
        '<button class="btn btn-primary btn-block" id="wsPublish">'+Icon('rocket')+'Publish website</button>'+
        '</div></div></div></div>';

    return {html,mount(root){
      let tpl=TEMPLATES[0];
      const frame=()=>{
        root.querySelector('#wsFrame').innerHTML=
          '<div style="border:1px solid var(--line);border-radius:12px;overflow:hidden;background:var(--surface)">'+
          '<div class="row" style="gap:5px;padding:8px 11px;background:var(--surface-3);flex-wrap:nowrap">'+
            '<i style="width:8px;height:8px;border-radius:99px;background:#EF4444;display:block"></i>'+
            '<i style="width:8px;height:8px;border-radius:99px;background:#EAB308;display:block"></i>'+
            '<i style="width:8px;height:8px;border-radius:99px;background:#10B981;display:block"></i>'+
            '<span class="small muted" style="margin-left:8px;font-size:10px">'+fmt.esc(root.querySelector('#wsDomain').value)+'</span></div>'+
          '<div style="background:linear-gradient(160deg,'+tpl.c[0]+','+tpl.c[1]+');padding:22px 16px;color:#fff">'+
            '<div style="font-size:10px;letter-spacing:.1em;opacity:.8;text-transform:uppercase">'+fmt.esc(Store.biz.cat)+'</div>'+
            '<div style="font-family:var(--font-h);font-weight:800;font-size:17px;margin:5px 0 7px">'+fmt.esc(Store.biz.name)+'</div>'+
            '<div style="font-size:11px;opacity:.85">'+fmt.esc(Store.biz.loc)+' • '+Store.biz.rating+'★</div>'+
            '<div style="margin-top:12px;display:inline-block;background:#FACC15;color:#0F172B;font-size:11px;font-weight:700;padding:6px 12px;border-radius:8px">Book appointment</div></div>'+
          '<div style="padding:14px">'+
            '<div class="grid g-3" style="gap:7px">'+[1,2,3].map(()=>'<div class="skel" style="height:40px"></div>').join('')+'</div>'+
            '<div class="skel" style="height:9px;margin-top:12px"></div><div class="skel" style="height:9px;width:70%;margin-top:6px"></div>'+
            '<div class="row" style="margin-top:12px;gap:6px">'+Store.state.brand.products.slice(0,3).map(p=>
              '<span class="badge badge-slate" style="font-size:9.5px">'+fmt.esc(p.name)+'</span>').join('')+'</div>'+
          '</div></div>';
      };
      $$('#wsTpl [data-tpl]',root).forEach(c=>c.onclick=()=>{
        $$('#wsTpl [data-tpl]',root).forEach(x=>x.style.borderColor='');
        c.style.borderColor='var(--lemon)'; tpl=TEMPLATES.find(t=>t.id===c.dataset.tpl); frame();});
      root.querySelector('#wsDomain').oninput=frame;
      root.querySelector('#wsReimport').onclick=e=>work(e.currentTarget,1300,()=>toast('Re-imported','Latest GMB data pulled into your site','ok'));
      root.querySelector('#wsPreview').onclick=()=>{modal({title:'Website preview',wide:true,
        body:'<div id="mFrame"></div>'});document.getElementById('mFrame').innerHTML=root.querySelector('#wsFrame').innerHTML;};
      const build=e=>{
        if(Store.state.user.credits<500) return toast('Not enough credits','Website generation needs 500 credits','err');
        work(e.currentTarget,2400,()=>{
          Store.spend(500,'Website builder generation');
          const d=root.querySelector('#wsDomain').value.trim();
          Store.state.websites=[{id:Store.util.uid('site'),name:Store.biz.name,template:tpl.name,domain:d,
            status:'live',pages:8,leads:Store.state.leads.length,createdAt:new Date().toISOString()}];
          Store.save();toast('Website published 🎉',d+' is live','ok');location.hash='#/website';
        });
      };
      root.querySelector('#wsBuild').onclick=build;
      root.querySelector('#wsPublish').onclick=build;
      const ed=root.querySelector('#wsEdit'); if(ed) ed.onclick=()=>toast('Editor opening','Drag-and-drop editor loads here','');
      if(window.matchMedia('(max-width:1050px)').matches) root.querySelector('#wsCols').style.gridTemplateColumns='1fr';
      frame();LimbuNav.hydrateIcons(root);
    }};
  };
})();
