/* Limbu AI — GMB Connection, GMB Health, GMB Insights */
(function(){
  window.Views=window.Views||{};
  const {fmt,pageHead,$,$$,toast,work,modal,closeModal,statCard,donut,lineChart,barChart,series,lastDays,empty}=UI;

  /* ================= GMB CONNECTION ================= */
  Views['gmb-connect']=function(){
    const S=Store.state;
    const html=pageHead({eyebrow:'Core connection',eyebrowIcon:'google',title:'GMB Connection',
      sub:'Connect your Google Business Profile. Reviews, insights, posting, health checks and the website builder all depend on it.'})+
      '<div class="grid" style="grid-template-columns:1fr 340px" id="gcCols"><div class="stack">'+
        '<div class="card"><div class="card-head"><div><h3>Connected locations</h3><p>'+S.businesses.length+' location'+(S.businesses.length>1?'s':'')+' linked to this account</p></div>'+
          '<button class="btn btn-primary btn-sm" id="gcAdd">'+Icon('plus')+'Connect location</button></div>'+
        '<div class="card-body stack" style="gap:12px">'+
          S.businesses.map(b=>'<div class="conn-card">'+
            '<div class="biz-avatar" style="width:40px;height:40px;flex:0 0 40px">'+fmt.initials(b.name)+'</div>'+
            '<div style="flex:1"><b style="font-size:13.5px">'+fmt.esc(b.name)+'</b>'+
            '<div class="small muted">'+fmt.esc(b.cat)+' • '+fmt.esc(b.loc)+'</div>'+
            '<div class="small muted">'+b.rating+'★ ('+b.reviews+' reviews) • '+fmt.esc(b.phone)+'</div></div>'+
            '<div class="row" style="gap:6px">'+
            (b.verified?'<span class="badge badge-green">'+Icon('checkCircle')+'Verified</span>':'<span class="badge badge-amber">'+Icon('alert')+'Unverified</span>')+
            (b.id===S.activeBiz?'<span class="badge badge-lemon">Active</span>':'<button class="btn btn-sm btn-outline" data-use="'+b.id+'">Use</button>')+
            '</div></div>').join('')+
        '</div></div>'+

        '<div class="card"><div class="card-head"><div><h3>Permissions granted</h3><p>What Limbu can do on your behalf</p></div></div>'+
        '<div class="card-body stack" style="gap:11px">'+
          [['business.manage','Read and manage your Business Profile, posts and reviews',true],
           ['reviews.reply','Publish replies to customer reviews',true],
           ['insights.read','Read performance metrics (views, calls, directions)',true],
           ['media.upload','Upload photos and videos to your profile',true]].map(([s,d,on])=>
            '<div class="row" style="gap:11px;flex-wrap:nowrap">'+
            '<span class="stat-icon '+(on?'green':'')+'" style="width:30px;height:30px;flex:0 0 30px">'+Icon(on?'checkCircle':'lock')+'</span>'+
            '<div style="flex:1"><code style="font-size:12px;font-weight:700;color:var(--emerald)">'+s+'</code>'+
            '<div class="small muted">'+d+'</div></div></div>').join('')+
        '</div></div>'+
      '</div>'+

      '<div class="stack">'+
        '<div class="card card-pad" style="text-align:center">'+
          '<div class="conn-logo" style="width:56px;height:56px;background:#fff;border:1px solid var(--line);color:#4285F4;margin:0 auto 14px">'+Icon('google').replace('<svg','<svg style="width:30px;height:30px"')+'</div>'+
          '<h3 style="font-size:16px">'+(S.gmbConnected?'Google account connected':'Connect with Google')+'</h3>'+
          '<p class="small muted">'+(S.gmbConnected?fmt.esc(S.user.email):'Sign in with the Google account that owns your Business Profile.')+'</p>'+
          (S.gmbConnected
            ? '<button class="btn btn-outline btn-block mt-16" id="gcDisc">'+Icon('logout')+'Disconnect</button>'
            : '<button class="btn btn-primary btn-block btn-lg mt-16" id="gcConn">'+Icon('google')+'Continue with Google</button>')+
        '</div>'+
        '<div class="card card-pad"><b style="font-size:13px">Depends on this connection</b>'+
        '<div class="stack" style="gap:8px;margin-top:10px">'+
          [['stethoscope','GMB Health','gmb-health'],['chart','GMB Insights','gmb-insights'],['star','Reviews','reviews'],
           ['send','Google posting','posts'],['monitor','Website Builder','website'],['map','Rank tracking','competitors']].map(([i,l,r])=>
          '<a class="row" href="#/'+r+'" style="gap:9px;flex-wrap:nowrap;font-size:12.5px">'+
          '<span style="color:var(--lemon-hover);display:flex">'+Icon(i).replace('<svg','<svg style="width:15px;height:15px"')+'</span>'+l+'</a>').join('')+
        '</div></div>'+
      '</div></div>';

    return {html,mount(root){
      const c=root.querySelector('#gcConn');
      if(c) c.onclick=e=>work(e.currentTarget,1800,()=>{Store.set({gmbConnected:true});toast('Google Business Profile connected','','ok');location.hash='#/dashboard';});
      const d=root.querySelector('#gcDisc');
      if(d) d.onclick=()=>UI.confirmDialog('Disconnect Google?','Posting, reviews, insights and health checks will stop working until you reconnect.',
        ()=>{Store.set({gmbConnected:false});toast('Disconnected','','err');location.hash='#/gmb-connect';},'Disconnect');
      root.querySelector('#gcAdd').onclick=e=>work(e.currentTarget,1400,()=>{
        modal({title:'Select a location to connect',body:
          '<p class="small muted" style="margin-top:0">These Business Profiles are available on '+fmt.esc(Store.state.user.email)+'.</p>'+
          ['Sunrise Dental — Thane','Sunrise Ortho Centre','Sunrise Dental — Pune'].map((n,i)=>
            '<label class="check" style="margin-bottom:9px"><input type="radio" name="loc" '+(i===0?'checked':'')+'>'+
            '<span><b style="font-size:13px">'+n+'</b><div class="small muted">Dental clinic • Unverified</div></span></label>').join(''),
          foot:'<button class="btn btn-ghost" data-action="close-modal">Cancel</button><button class="btn btn-primary" id="gcPick">Connect location</button>'});
        $('#gcPick').onclick=()=>{closeModal();toast('Location connected','Syncing reviews and insights…','ok');};
      });
      $$('[data-use]',root).forEach(b=>b.onclick=()=>{Store.set({activeBiz:b.dataset.use});LimbuNav.renderNav();toast('Switched business',Store.biz.name,'ok');location.hash='#/gmb-connect';});
      if(window.matchMedia('(max-width:1000px)').matches) root.querySelector('#gcCols').style.gridTemplateColumns='1fr';
    }};
  };

  /* ================= GMB HEALTH ================= */
  const CHECKS=[
    {k:'name',label:'Business name & category',w:10,score:100,note:'Primary category “Dental clinic” matches your services.'},
    {k:'categories',label:'Secondary categories',w:8,score:60,note:'Add “Cosmetic dentist” and “Orthodontist” to appear in more searches.'},
    {k:'hours',label:'Business hours',w:9,score:100,note:'Complete, including special holiday hours.'},
    {k:'photos',label:'Photos & videos',w:14,score:45,note:'Only 11 photos. Profiles with 30+ get 42% more direction requests.'},
    {k:'services',label:'Services & pricing',w:12,score:70,note:'6 of 11 services listed. Add prices to improve conversions.'},
    {k:'description',label:'Business description',w:8,score:80,note:'Good, but missing your top keyword “dentist near me”.'},
    {k:'posts',label:'Post frequency',w:14,score:55,note:'Last post 9 days ago. Weekly posting is the ranking sweet spot.'},
    {k:'reviews',label:'Reviews & replies',w:15,score:78,note:'7 reviews are still waiting for a reply.'},
    {k:'attributes',label:'Attributes & amenities',w:5,score:40,note:'Add wheelchair access, parking and payment options.'},
    {k:'website',label:'Website & booking link',w:5,score:100,note:'Website and appointment link are both live.'}
  ];

  Views['gmb-health']=function(){
    const b=Store.biz;
    const score=Math.round(CHECKS.reduce((a,c)=>a+c.score*c.w,0)/CHECKS.reduce((a,c)=>a+c.w,0));
    const missing=CHECKS.filter(c=>c.score<80);

    const html=pageHead({eyebrow:'Profile audit',eyebrowIcon:'stethoscope',title:'GMB Health',
      sub:'A full audit of '+b.name+' against the 10 signals Google weighs most for local ranking.',
      actions:'<select class="select" id="ghLoc" style="width:auto">'+Store.state.businesses.map(x=>
        '<option value="'+x.id+'"'+(x.id===Store.state.activeBiz?' selected':'')+'>'+fmt.esc(x.name)+'</option>').join('')+'</select>'+
        '<button class="btn btn-primary" id="ghRun">'+Icon('refresh')+'Run health check</button>'})+

      '<div class="grid" style="grid-template-columns:320px 1fr" id="ghCols">'+
        '<div class="stack">'+
          '<div class="card card-pad" style="text-align:center">'+
            donut(score,100,score>=80?'#10B981':score>=60?'#EAB308':'#EF4444','Health score')+
            '<div class="badge '+(score>=80?'badge-green':score>=60?'badge-amber':'badge-red')+'" style="margin-top:12px">'+
            (score>=80?'Strong profile':score>=60?'Needs work':'Critical issues')+'</div>'+
            '<p class="small muted" style="margin:10px 0 0">Fixing the '+missing.length+' items below could lift you an estimated <b>+'+(100-score)+' points</b>.</p>'+
          '</div>'+
          '<div class="card"><div class="card-head"><div><h3>Missing information</h3></div></div>'+
          '<div class="card-body stack" style="gap:10px">'+missing.map(c=>
            '<div class="row" style="gap:9px;flex-wrap:nowrap"><span style="color:var(--red);display:flex">'+
            Icon('alert').replace('<svg','<svg style="width:15px;height:15px"')+'</span>'+
            '<span style="font-size:12.5px">'+c.label+'</span>'+
            '<span class="badge badge-red" style="margin-left:auto">'+c.score+'%</span></div>').join('')+
          '</div></div>'+
        '</div>'+

        '<div class="stack">'+
          '<div class="card"><div class="card-head"><div><h3>Profile audit</h3><p>Weighted by ranking impact</p></div></div>'+
          '<div class="card-body stack" style="gap:16px">'+CHECKS.map(c=>
            '<div><div class="row-between" style="margin-bottom:6px">'+
            '<div class="row" style="gap:8px"><span style="color:'+(c.score>=80?'var(--emerald)':c.score>=60?'var(--lemon-hover)':'var(--red)')+';display:flex">'+
            Icon(c.score>=80?'checkCircle':'alert').replace('<svg','<svg style="width:16px;height:16px"')+'</span>'+
            '<b style="font-size:13px">'+c.label+'</b><span class="badge badge-slate">weight '+c.w+'</span></div>'+
            '<b class="small">'+c.score+'%</b></div>'+
            '<div class="progress '+(c.score>=80?'green':c.score>=60?'':'red')+'"><i style="width:'+c.score+'%"></i></div>'+
            '<p class="small muted" style="margin:6px 0 0">'+c.note+'</p></div>').join('')+
          '</div></div>'+

          '<div class="card"><div class="card-head"><div><h3>'+Icon('sparkles')+' Optimisation plan</h3><p>Do these in order for the fastest gain</p></div></div>'+
          '<div class="card-body stack" style="gap:12px">'+
            [['image','Upload 19 more photos','+14 pts','#/assets'],
             ['send','Publish 4 posts this month','+13 pts','#/posts/new'],
             ['reply','Reply to 7 pending reviews','+9 pts','#/review-reply'],
             ['tag','Add 5 missing services','+7 pts','#/gmb-health'],
             ['key','Add “dentist near me” to your description','+5 pts','#/keywords']].map(([i,t,g,href])=>
            '<a class="row-between" href="'+href+'" style="padding:11px;border:1px solid var(--line);border-radius:10px">'+
            '<div class="row" style="flex-wrap:nowrap"><span class="stat-icon" style="width:30px;height:30px;flex:0 0 30px">'+Icon(i)+'</span>'+
            '<span style="font-size:13px;font-weight:600">'+t+'</span></div>'+
            '<span class="row"><span class="badge badge-green">'+g+'</span>'+Icon('chevronR')+'</span></a>').join('')+
          '</div></div>'+
        '</div></div>';

    return {html,mount(root){
      root.querySelector('#ghRun').onclick=e=>work(e.currentTarget,1800,()=>toast('Health check complete','Audited 10 profile signals','ok'));
      root.querySelector('#ghLoc').onchange=e=>{Store.set({activeBiz:e.target.value});LimbuNav.renderNav();location.hash='#/gmb-health';};
      if(window.matchMedia('(max-width:1000px)').matches) root.querySelector('#ghCols').style.gridTemplateColumns='1fr';
      LimbuNav.hydrateIcons(root);
    }};
  };

  /* ================= GMB INSIGHTS ================= */
  Views['gmb-insights']=function(){
    const b=Store.biz;
    const n=30, labels=lastDays(n);
    const views=series(n,320,110), searches=series(n,540,180), calls=series(n,52,20), dirs=series(n,88,34);
    const sum=a=>a.reduce((x,y)=>x+y,0);

    const html=pageHead({eyebrow:'Performance',eyebrowIcon:'chart',title:'GMB Insights',
      sub:'How customers find and interact with '+b.name+' on Google Search and Maps.',
      actions:'<select class="select" id="giRange" style="width:auto">'+
        ['Last 7 days','Last 30 days','Last 90 days','This year'].map((r,i)=>'<option'+(i===1?' selected':'')+'>'+r+'</option>').join('')+'</select>'+
        '<button class="btn btn-outline" id="giExport">'+Icon('download')+'Export</button>'})+

      '<div class="grid g-4 mb-16">'+
        statCard({icon:'eye',tone:'blue',value:fmt.compact(sum(views)),label:'Profile views',delta:442,spark:views,sparkColor:'#3B82F6'})+
        statCard({icon:'search',value:fmt.compact(sum(searches)),label:'Search impressions',delta:85,spark:searches,sparkColor:'#EAB308'})+
        statCard({icon:'phone',tone:'green',value:fmt.n(sum(calls)),label:'Calls',delta:31,spark:calls,sparkColor:'#10B981'})+
        statCard({icon:'navigation',tone:'pink',value:fmt.n(sum(dirs)),label:'Direction requests',delta:19,spark:dirs,sparkColor:'#EC4899'})+
      '</div>'+

      '<div class="stack">'+
        '<div class="card"><div class="card-head"><div><h3>Discovery over time</h3><p>Views vs search impressions</p></div></div>'+
        '<div class="card-body" id="giChart">'+lineChart([
          {name:'Profile views',data:views,color:'#EAB308'},
          {name:'Search impressions',data:searches,color:'#3B82F6'}],labels,{height:250})+'</div></div>'+

        '<div class="grid g-2">'+
          '<div class="card"><div class="card-head"><div><h3>Customer actions</h3><p>What people did after finding you</p></div></div>'+
          '<div class="card-body">'+barChart([sum(calls),sum(dirs),Math.round(sum(views)*0.08),Math.round(sum(views)*0.03)],
            ['Calls','Directions','Website','Bookings'],'#EAB308',200)+'</div></div>'+

          '<div class="card"><div class="card-head"><div><h3>How customers search</h3></div></div>'+
          '<div class="card-body stack" style="gap:14px">'+
            [['Discovery — searched a category or service',68,'blue'],
             ['Direct — searched your business name',24,'green'],
             ['Branded — searched a brand you carry',8,'']].map(([l,v,t])=>
            '<div><div class="row-between" style="margin-bottom:6px"><span class="small">'+l+'</span><b class="small">'+v+'%</b></div>'+
            '<div class="progress '+(t==='blue'?'blue':t==='green'?'green':'')+'"><i style="width:'+v+'%"></i></div></div>').join('')+
            '<div class="divider"></div>'+
            '<b style="font-size:13px">Top search queries</b>'+
            Store.seeds.KEYWORD_SEEDS.slice(0,5).map(([kw,vol])=>
            '<div class="row-between"><span class="small">'+kw+'</span><span class="small muted mono">'+fmt.n(Math.round(vol/28))+' views</span></div>').join('')+
          '</div></div>'+
        '</div>'+

        '<div class="grid g-3">'+
          insightTile('Where people see you','Google Maps','62%','Google Search','38%','map')+
          insightTile('Peak day','Saturday','214 views','Quietest: Sunday','48 views','calendar')+
          insightTile('Peak time','6 – 8 PM','31% of calls','Slowest: 2 – 4 PM','','clock')+
        '</div>'+
      '</div>';

    return {html,mount(root){
      root.querySelector('#giRange').onchange=e=>{
        const n2={'Last 7 days':7,'Last 30 days':30,'Last 90 days':90,'This year':52}[e.target.value]||30;
        root.querySelector('#giChart').innerHTML=lineChart([
          {name:'Profile views',data:series(n2,320,110),color:'#EAB308'},
          {name:'Search impressions',data:series(n2,540,180),color:'#3B82F6'}],lastDays(n2),{height:250});
        toast('Range updated',e.target.value,'');
      };
      root.querySelector('#giExport').onclick=e=>work(e.currentTarget,900,()=>toast('Exported','gmb-insights.csv','ok'));
      LimbuNav.hydrateIcons(root);
    }};
  };

  function insightTile(title,a,av,b2,bv,icon){
    return '<div class="card card-pad"><div class="row-between"><b style="font-size:13px">'+title+'</b>'+
      '<span class="stat-icon" style="width:30px;height:30px">'+Icon(icon)+'</span></div>'+
      '<div class="stat-value" style="margin-top:12px;font-size:22px">'+a+'</div>'+
      '<div class="stat-label">'+av+'</div>'+
      '<div class="divider" style="margin:12px 0"></div>'+
      '<div class="small muted">'+b2+(bv?' — <b>'+bv+'</b>':'')+'</div></div>';
  }
})();
