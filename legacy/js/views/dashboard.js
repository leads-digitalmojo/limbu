/* Limbu AI — Dashboard */
(function(){
  window.Views = window.Views || {};
  const {fmt, statCard, pageHead, lineChart, sparkline, $, $$, toast, modal, closeModal, work, series, lastDays} = UI;

  const QUICK = [
    {id:'competitors', label:'Competitor Analysis', icon:'map',        tone:'blue',   desc:'Grid rank audit'},
    {id:'gmb-health',  label:'GMB Health',          icon:'stethoscope',tone:'green',  desc:'Profile score'},
    {id:'gmb-insights',label:'GMB Insights',        icon:'chart',      tone:'indigo', desc:'Views & calls'},
    {id:'magic-qr',    label:'Magic QR',            icon:'qr',         tone:'pink',   desc:'Collect reviews'},
    {id:'review-reply',label:'Review Reply',        icon:'reply',      tone:'orange', desc:'AI responses'},
    {id:'keywords',    label:'Keyword Planner',     icon:'key',        tone:'',       desc:'Local SEO'},
    {id:'website',     label:'Website Builder',     icon:'monitor',    tone:'blue',   desc:'From GMB data'},
    {id:'posts/new',   label:'Create Post',         icon:'wand',       tone:'',       desc:'Magic Post'}
  ];

  const PLATFORMS = [
    {k:'google',   name:'Google Business Profile', icon:'google',    color:'#4285F4'},
    {k:'facebook', name:'Facebook',                icon:'facebook',  color:'#1877F2'},
    {k:'instagram',name:'Instagram',               icon:'instagram', color:'#E1306C'},
    {k:'whatsapp', name:'WhatsApp',                icon:'whatsapp',  color:'#25D366'},
    {k:'linkedin', name:'LinkedIn',                icon:'linkedin',  color:'#0A66C2'},
    {k:'youtube',  name:'YouTube',                 icon:'youtube',   color:'#FF0000'},
    {k:'pinterest',name:'Pinterest',               icon:'pinterest', color:'#E60023'}
  ];

  Views.dashboard = function(){
    const S = Store.state, b = Store.biz;
    const firstPost = S.posts.length===0;
    const labels = lastDays(14);
    const views  = series(14, 280, 90);
    const calls  = series(14, 46, 22);
    const pending = S.posts.filter(p=>p.status==='pending').length;
    const noReply = S.reviews.filter(r=>!r.reply).length;
    const newLeads= S.leads.filter(l=>l.status==='new').length;

    const html =
      pageHead({eyebrow:'Live dashboard', eyebrowIcon:'zap',
        title:'Welcome back, '+S.user.name.split(' ')[0]+' 👋',
        sub:'Here is how '+b.name+' is performing on Google and social this fortnight.',
        actions:'<button class="btn btn-outline" id="dashRefresh">'+Icon('refresh')+'Refresh</button>'+
                '<a class="btn btn-primary" href="#/posts/new">'+Icon('wand')+'Create Magic Post</a>'})+

      (!S.gmbConnected ? connectBanner() : '')+

      (firstPost ? magicPostOnboarding() : '')+

      '<div class="grid g-4 mb-16">'+
        statCard({icon:'eye',   tone:'blue',  value:fmt.n(views.reduce((a,c)=>a+c,0)), label:'Profile views (14d)', delta:42, spark:views, sparkColor:'#3B82F6'})+
        statCard({icon:'phone', tone:'green', value:fmt.n(calls.reduce((a,c)=>a+c,0)), label:'Calls from Google',    delta:18, spark:calls, sparkColor:'#10B981'})+
        statCard({icon:'star',  tone:'',      value:b.rating.toFixed(1)+'★',           label:b.reviews+' Google reviews', delta:6, spark:series(14,4.3,.5).map(v=>v)})+
        statCard({icon:'inbox', tone:'pink',  value:fmt.n(S.leads.length),             label:'Website leads',        delta:-4, spark:series(14,6,4), sparkColor:'#EC4899'})+
      '</div>'+

      '<div class="grid" style="grid-template-columns:1.55fr 1fr" id="dashCols">'+
        '<div class="stack">'+
          '<div class="card"><div class="card-head"><div><h3>Growth this fortnight</h3><p>Profile views vs calls from your Google Business Profile</p></div>'+
            '<div class="segment" id="rangeSeg"><button class="on" data-r="14">14d</button><button data-r="30">30d</button><button data-r="90">90d</button></div></div>'+
            '<div class="card-body" id="growthChart">'+lineChart([
              {name:'Profile views', data:views, color:'#EAB308'},
              {name:'Calls',         data:calls, color:'#3B82F6'}], labels)+'</div></div>'+

          '<div class="card"><div class="card-head"><div><h3>Quick launch</h3><p>Jump straight into your most-used tools</p></div></div>'+
            '<div class="card-body"><div class="grid g-4" style="gap:12px">'+
              QUICK.map(q=>'<a class="card card-hover card-pad" href="#/'+q.id+'" style="text-align:center;padding:16px 10px">'+
                '<div class="stat-icon '+q.tone+'" style="margin:0 auto 9px">'+Icon(q.icon)+'</div>'+
                '<div style="font-size:12.5px;font-weight:600">'+q.label+'</div>'+
                '<div class="small muted">'+q.desc+'</div></a>').join('')+
            '</div></div></div>'+

          '<div class="card"><div class="card-head"><div><h3>Needs your attention</h3><p>Items waiting on an action from you</p></div></div>'+
            '<div class="card-body"><div class="grid g-3" style="gap:12px">'+
              todoCard('star','reviews', noReply, 'reviews without a reply', 'Reply with AI')+
              todoCard('send','posts', pending, 'posts pending approval', 'Review posts')+
              todoCard('inbox','leads', newLeads, 'new leads to contact', 'Open inbox')+
            '</div></div></div>'+
        '</div>'+

        '<div class="stack">'+
          '<div class="card"><div class="card-head"><div><h3>Live connections</h3><p>Platforms linked to Limbu</p></div>'+
            '<a href="#/social" class="btn btn-ghost btn-sm">Manage</a></div>'+
            '<div class="card-body stack" style="gap:10px">'+
              PLATFORMS.map(p=>{
                const on = p.k==='google' ? S.gmbConnected : S.social[p.k];
                return '<div class="row" style="gap:11px;flex-wrap:nowrap">'+
                  '<span class="conn-logo" style="width:32px;height:32px;flex:0 0 32px;background:'+p.color+'">'+Icon(p.icon)+'</span>'+
                  '<span style="flex:1;font-size:13px;font-weight:500">'+p.name+'</span>'+
                  (on?'<span class="badge badge-green"><span class="dot"></span>Live</span>'
                     :'<a href="#/social" class="badge badge-slate">Connect</a>')+'</div>';
              }).join('')+
            '</div></div>'+

          '<div class="hero"><h2>Rank higher on Google Maps</h2>'+
            '<p>Run a 5×5 grid audit to see exactly where you win — and where competitors beat you.</p>'+
            '<div class="row"><a class="btn btn-primary" href="#/competitors">'+Icon('target')+'Run rank audit</a>'+
            '<a class="btn btn-ghost" style="color:#fff" href="#/keywords">Plan keywords</a></div></div>'+

          '<div class="card"><div class="card-head"><div><h3>Recent activity</h3></div></div>'+
            '<div class="card-body stack" style="gap:13px">'+ activityFeed() +'</div></div>'+
        '</div>'+
      '</div>';

    return {html, mount(root){
      root.querySelector('#dashRefresh').onclick = e=> work(e.currentTarget, 1000, ()=>toast('Dashboard synced','Latest Google data pulled','ok'));
      $$('#rangeSeg button', root).forEach(btn=>btn.onclick=()=>{
        $$('#rangeSeg button', root).forEach(b=>b.classList.remove('on'));
        btn.classList.add('on');
        const n = +btn.dataset.r;
        root.querySelector('#growthChart').innerHTML = lineChart([
          {name:'Profile views', data:series(n, 280, 90), color:'#EAB308'},
          {name:'Calls',         data:series(n, 46, 22),  color:'#3B82F6'}], lastDays(n));
      });
      if(window.matchMedia('(max-width:1100px)').matches) root.querySelector('#dashCols').style.gridTemplateColumns='1fr';
      LimbuNav.hydrateIcons(root);
    }};
  };

  function todoCard(icon, route, n, label, cta){
    return '<a href="#/'+route+'" class="card card-hover card-pad" style="display:block">'+
      '<div class="row-between"><div class="stat-icon">'+Icon(icon)+'</div><span class="badge '+(n?'badge-amber':'badge-green')+'">'+(n?'Action needed':'All clear')+'</span></div>'+
      '<div class="stat-value" style="margin-top:11px">'+n+'</div>'+
      '<div class="stat-label">'+label+'</div>'+
      '<div class="row" style="margin-top:10px;color:var(--lemon-ink);font-size:12.5px;font-weight:600">'+cta+' '+Icon('chevronR')+'</div></a>';
  }

  function connectBanner(){
    return '<div class="card card-pad mb-16" style="border-color:var(--lemon);background:var(--lemon-soft)">'+
      '<div class="row-between"><div class="row" style="flex-wrap:nowrap">'+
      '<div class="stat-icon">'+Icon('google')+'</div>'+
      '<div><b>Connect your Google Business Profile</b><div class="small muted">Most Limbu features need a connected GMB location.</div></div></div>'+
      '<a class="btn btn-dark" href="#/gmb-connect">'+Icon('link')+'Connect now</a></div></div>';
  }

  function magicPostOnboarding(){
    return '<div class="hero mb-16"><h2>Make your first Magic Post ✨</h2>'+
      '<p>Give Limbu one line about your offer. It writes the caption, generates the image with your brand assets and publishes to Google, Facebook and Instagram.</p>'+
      '<div class="row"><a class="btn btn-primary btn-lg" href="#/posts/new">'+Icon('wand')+'Make your first Magic Post</a></div></div>';
  }

  function activityFeed(){
    const S=Store.state;
    const items=[];
    S.posts.slice(0,3).forEach(p=>items.push({icon:'send',t:'Post '+p.status,d:p.caption.slice(0,52)+'…',at:p.createdAt}));
    S.reviews.slice(0,2).forEach(r=>items.push({icon:'star',t:r.rating+'★ review from '+r.author,d:r.reply?'Replied automatically':'Awaiting reply',at:r.createdAt}));
    S.leads.slice(0,2).forEach(l=>items.push({icon:'inbox',t:'New lead — '+l.name,d:l.service+' • '+l.source,at:l.createdAt}));
    return items.sort((a,b)=>new Date(b.at)-new Date(a.at)).slice(0,6).map(i=>
      '<div class="row" style="gap:11px;flex-wrap:nowrap;align-items:flex-start">'+
      '<div class="stat-icon" style="width:30px;height:30px;flex:0 0 30px">'+Icon(i.icon)+'</div>'+
      '<div style="flex:1;min-width:0"><div style="font-size:12.5px;font-weight:600">'+fmt.esc(i.t)+'</div>'+
      '<div class="small muted" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+fmt.esc(i.d)+'</div></div>'+
      '<span class="small muted" style="white-space:nowrap">'+fmt.ago(i.at)+'</span></div>').join('');
  }
})();
