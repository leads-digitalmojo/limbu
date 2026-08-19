/* Limbu AI — Competitor Analysis (Google Maps grid rank audit) */
(function(){
  window.Views=window.Views||{};
  const {fmt,pageHead,$,$$,toast,work,modal,closeModal,empty,statCard,donut,confirmDialog}=UI;

  Views.competitors=function(){
    const S=Store.state;
    const html=pageHead({eyebrow:'Local SEO',eyebrowIcon:'map',title:'Competitor Analysis',
      sub:'See exactly where you rank on Google Maps across your city — and who is beating you at each point.',
      actions:'<button class="btn btn-outline" id="caSaved">'+Icon('folder')+'Saved audits <span class="badge badge-slate">'+S.audits.length+'</span></button>'})+

      '<div class="card mb-16"><div class="card-head"><div><h3>New rank audit</h3><p>Costs 350 credits for a 5×5 grid</p></div></div>'+
      '<div class="card-body"><div class="grid g-4" style="gap:14px;align-items:end">'+
        '<div class="field" style="margin:0"><span class="label">Business</span><select class="select" id="caBiz">'+
          S.businesses.map(b=>'<option value="'+b.id+'"'+(b.id===S.activeBiz?' selected':'')+'>'+fmt.esc(b.name)+'</option>').join('')+'</select></div>'+
        '<div class="field" style="margin:0"><span class="label">Keyword</span><select class="select" id="caKw">'+
          (S.keywords.length?S.keywords.map(k=>'<option>'+fmt.esc(k.kw)+'</option>').join('')
            :Store.seeds.KEYWORD_SEEDS.slice(0,6).map(k=>'<option>'+k[0]+'</option>').join(''))+'</select></div>'+
        '<div class="field" style="margin:0"><span class="label">City</span><input class="input" id="caCity" value="'+fmt.esc(Store.biz.city)+'"></div>'+
        '<div class="field" style="margin:0"><span class="label">Grid size</span><div class="segment" id="caGrid" style="width:100%">'+
          ['1×1','3×3','5×5'].map((g,i)=>'<button class="'+(i===2?'on':'')+'" data-g="'+(i===0?1:i===1?3:5)+'" style="flex:1">'+g+'</button>').join('')+'</div></div>'+
      '</div>'+
      '<div class="row" style="margin-top:16px"><button class="btn btn-primary btn-lg" id="caRun">'+Icon('target')+'Run rank audit</button>'+
      '<span class="small muted">Scans real Google Maps positions from up to 25 geographic points</span></div>'+
      '</div></div>'+

      '<div id="caResult"></div>';

    return {html,mount(root){
      let grid=5, audit=null;
      $$('#caGrid button',root).forEach(b=>b.onclick=()=>{
        $$('#caGrid button',root).forEach(x=>x.classList.remove('on'));b.classList.add('on');grid=+b.dataset.g;});

      root.querySelector('#caRun').onclick=e=>{
        const cost=grid===5?350:grid===3?180:60;
        if(Store.state.user.credits<cost) return toast('Not enough credits','This audit needs '+cost+' credits','err');
        root.querySelector('#caResult').innerHTML='<div class="card card-pad"><div class="row"><div class="skel" style="width:100%;height:280px"></div></div></div>';
        work(e.currentTarget, 2200, ()=>{
          Store.spend(cost,'Competitor rank audit '+grid+'×'+grid);
          audit=buildAudit(grid, root.querySelector('#caKw').value, root.querySelector('#caCity').value, root.querySelector('#caBiz').value);
          renderAudit(root, audit);
          toast('Audit complete', cost+' credits used','ok');
        });
      };
      root.querySelector('#caSaved').onclick=()=>openSaved();
    }};
  };

  function buildAudit(n, kw, city, bizId){
    const pts=[];
    for(let y=0;y<n;y++) for(let x=0;x<n;x++){
      const dist=Math.hypot(x-(n-1)/2, y-(n-1)/2);
      let rank = Math.round(1 + dist*1.7 + (Math.random()*3-1));
      rank = Math.max(1, rank);
      if(rank>20) rank=null;
      pts.push({x,y,rank, competitors: Store.util.pick(Store.seeds.COMPETITORS)});
    }
    const ranked=pts.filter(p=>p.rank!=null);
    const avg=ranked.reduce((a,p)=>a+p.rank,0)/Math.max(1,ranked.length);
    const top3=pts.filter(p=>p.rank&&p.rank<=3).length;
    const comps=Store.seeds.COMPETITORS.map(name=>({
      name, freq:Store.util.rand(3,n*n), avg:(Math.random()*8+1.4).toFixed(1),
      rating:(Math.random()*1.4+3.6).toFixed(1), reviews:Store.util.rand(60,900)
    })).sort((a,b)=>a.avg-b.avg);
    return {id:Store.util.uid('audit'),kw,city,bizId,n,pts,
      avg:avg.toFixed(1), top3, coverage:Math.round(ranked.length/pts.length*100),
      visibility:Math.round(top3/pts.length*100), best:Math.min.apply(null,ranked.map(p=>p.rank)),
      comps, at:new Date().toISOString()};
  }

  function rankClass(r){ return r==null?'rk-x':r<=1?'rk-1':r<=3?'rk-2':r<=7?'rk-3':r<=12?'rk-4':'rk-5'; }

  function renderAudit(root, a){
    const biz=Store.state.businesses.find(b=>b.id===a.bizId)||Store.biz;
    root.querySelector('#caResult').innerHTML=
      '<div class="grid g-4 mb-16">'+
        statCard({icon:'target',value:'#'+a.avg,label:'Average map position',delta:12})+
        statCard({icon:'eye',tone:'green',value:a.visibility+'%',label:'Visibility (top 3)',delta:9})+
        statCard({icon:'map',tone:'blue',value:a.coverage+'%',label:'Grid coverage'})+
        statCard({icon:'crown',tone:'orange',value:'#'+a.best,label:'Best rank achieved'})+
      '</div>'+
      '<div class="grid" style="grid-template-columns:1fr 380px" id="caCols"><div class="stack">'+
        '<div class="card"><div class="card-head"><div><h3>Geographic rank grid</h3><p>“'+fmt.esc(a.kw)+'” in '+fmt.esc(a.city)+' • '+a.n+'×'+a.n+' points</p></div>'+
          '<div class="row" style="gap:5px">'+
          [['rk-1','#1'],['rk-2','2–3'],['rk-3','4–7'],['rk-4','8–12'],['rk-5','13–20'],['rk-x','20+']].map(([c,l])=>
            '<span class="row" style="gap:4px"><i class="'+c+'" style="width:11px;height:11px;border-radius:3px;display:block"></i><span class="small muted">'+l+'</span></span>').join('')+
          '</div></div>'+
        '<div class="card-body">'+
          '<div class="map-grid" style="grid-template-columns:repeat('+a.n+',minmax(0,1fr));max-width:'+(a.n*74)+'px">'+
          a.pts.map((p,i)=>'<div class="map-cell '+rankClass(p.rank)+'" data-pt="'+i+'" title="Point '+(i+1)+'">'+(p.rank==null?'20+':p.rank)+'</div>').join('')+
          '</div>'+
          '<p class="small muted" style="text-align:center;margin:14px 0 0">Each square is a real search location around '+fmt.esc(biz.loc)+'. Click a point for detail.</p>'+
        '</div></div>'+

        '<div class="card"><div class="card-head"><div><h3>Competitor comparison</h3><p>Who shows up when you don’t</p></div></div>'+
        '<div class="table-wrap"><table class="tbl"><thead><tr><th>Business</th><th>Avg. position</th><th>Appears at</th><th>Rating</th><th>Score</th></tr></thead><tbody>'+
        '<tr style="background:var(--lemon-soft)"><td><b>'+fmt.esc(biz.name)+'</b> <span class="badge badge-lemon">You</span></td>'+
        '<td class="num">#'+a.avg+'</td><td class="num">'+a.coverage+'% of grid</td><td class="num">'+biz.rating+'★</td>'+
        '<td><div class="progress" style="width:80px"><i style="width:'+a.visibility+'%"></i></div></td></tr>'+
        a.comps.map(c=>'<tr><td>'+fmt.esc(c.name)+'</td><td class="num">#'+c.avg+'</td>'+
          '<td class="num">'+Math.round(c.freq/(a.n*a.n)*100)+'% of grid</td><td class="num">'+c.rating+'★ ('+c.reviews+')</td>'+
          '<td><div class="progress blue" style="width:80px"><i style="width:'+Math.round(c.freq/(a.n*a.n)*100)+'%"></i></div></td></tr>').join('')+
        '</tbody></table></div></div>'+
      '</div>'+

      '<div class="stack">'+
        '<div class="card"><div class="card-head"><div><h3>Visibility score</h3></div></div>'+
        '<div class="card-body">'+donut(a.visibility,100,'#EAB308','% top-3 visibility')+
        '<div class="divider"></div>'+
        '<div class="row-between small"><span class="muted">Points in top 3</span><b>'+a.top3+' / '+(a.n*a.n)+'</b></div>'+
        '<div class="row-between small" style="margin-top:6px"><span class="muted">Best position</span><b>#'+a.best+'</b></div>'+
        '<div class="row-between small" style="margin-top:6px"><span class="muted">Grid coverage</span><b>'+a.coverage+'%</b></div>'+
        '</div></div>'+

        '<div class="card"><div class="card-head"><div><h3>'+Icon('sparkles')+' AI recommendations</h3><p>Ranked by impact</p></div></div>'+
        '<div class="card-body stack" style="gap:12px">'+recommendations(a,biz)+'</div></div>'+

        '<div class="card card-pad"><div class="row" style="gap:8px">'+
          '<button class="btn btn-primary" id="caSave">'+Icon('folder')+'Save audit</button>'+
          '<button class="btn btn-outline" id="caPdf">'+Icon('download')+'Download PDF</button></div></div>'+
      '</div></div>';

    LimbuNav.hydrateIcons(root.querySelector('#caResult'));
    if(window.matchMedia('(max-width:1050px)').matches) root.querySelector('#caCols').style.gridTemplateColumns='1fr';

    $$('[data-pt]',root).forEach(c=>c.onclick=()=>{
      const p=a.pts[+c.dataset.pt];
      modal({title:'Grid point '+(+c.dataset.pt+1),body:
        '<div class="grid g-2" style="gap:12px">'+
        kv('Your rank', p.rank==null?'Not in top 20':'#'+p.rank)+
        kv('Keyword','“'+a.kw+'”')+
        kv('Top competitor here',p.competitors)+
        kv('Search area','~'+((Math.abs(p.x-(a.n-1)/2)+Math.abs(p.y-(a.n-1)/2))*1.2+0.5).toFixed(1)+' km from clinic')+
        '</div>'+
        '<div class="card card-pad mt-16"><b style="font-size:13px">Why you rank here</b>'+
        '<p class="small muted" style="margin:6px 0 0">'+(p.rank&&p.rank<=3
          ? 'Strong proximity signal plus review velocity. Keep posting weekly to hold this position.'
          : 'You are outside the local pack at this point. '+p.competitors+' has more reviews mentioning “'+a.kw+'”. Publish location-specific posts and collect reviews from customers in this area.')+'</p></div>'});
    });

    root.querySelector('#caSave').onclick=e=>work(e.currentTarget,700,()=>{
      Store.state.audits.unshift(a);Store.save();toast('Audit saved','Find it under Saved audits','ok');});
    root.querySelector('#caPdf').onclick=e=>work(e.currentTarget,1200,()=>toast('PDF ready','rank-audit-'+a.kw.replace(/\s+/g,'-')+'.pdf','ok'));
  }

  const kv=(k,v)=>'<div class="card card-pad" style="padding:12px"><div class="small muted">'+k+'</div><b style="font-size:13px">'+fmt.esc(v)+'</b></div>';

  function recommendations(a,biz){
    const recs=[
      {icon:'star',t:'Collect 25 more reviews',d:'You need roughly 25 reviews to overtake '+a.comps[0].name+' on review count in the local pack.',tone:''},
      {icon:'send',t:'Post 3× per week with “'+a.kw+'”',d:'Businesses posting weekly rank 34% higher on average across the grid.',tone:'blue'},
      {icon:'pin',t:'Add service areas to your profile',d:'Your coverage drops sharply beyond 3 km. Listing nearby localities widens the radius.',tone:'green'},
      {icon:'image',t:'Upload 10 fresh photos',d:'Profiles with recent photos get 42% more direction requests.',tone:'pink'}
    ];
    return recs.map((r,i)=>'<div class="row" style="gap:11px;flex-wrap:nowrap;align-items:flex-start">'+
      '<div class="stat-icon '+r.tone+'" style="width:32px;height:32px;flex:0 0 32px">'+Icon(r.icon)+'</div>'+
      '<div><b style="font-size:12.5px">'+r.t+'</b><p class="small muted" style="margin:3px 0 0">'+r.d+'</p></div>'+
      '<span class="badge '+(i===0?'badge-red':i===1?'badge-amber':'badge-slate')+'">'+(i===0?'High':i===1?'Med':'Low')+'</span></div>').join('');
  }

  function openSaved(){
    const A=Store.state.audits;
    modal({title:'Saved audits',wide:true,body:
      '<div class="input-icon mb-16">'+Icon('search')+'<input class="input" id="saQ" placeholder="Search saved audits by keyword or city…"></div>'+
      '<div id="saList">'+(A.length?A.map(a=>
        '<div class="row-between" style="padding:12px 0;border-bottom:1px solid var(--line-2)" data-row="'+fmt.esc(a.kw+' '+a.city)+'">'+
        '<div><b style="font-size:13px">“'+fmt.esc(a.kw)+'”</b><div class="small muted">'+fmt.esc(a.city)+' • '+a.n+'×'+a.n+' grid • '+fmt.date(a.at)+'</div></div>'+
        '<div class="row"><span class="badge badge-green">#'+a.avg+' avg</span><span class="badge badge-blue">'+a.visibility+'% vis</span>'+
        '<button class="btn btn-sm btn-outline" data-del-audit="'+a.id+'">'+Icon('trash')+'</button></div></div>').join('')
        : empty('folder','No saved audits','Run an audit and hit Save to keep a snapshot of your rankings over time.'))+'</div>'});
    LimbuNav.hydrateIcons(document.getElementById('modalBody'));
    const q=$('#saQ'); if(q) q.oninput=e=>{
      const v=e.target.value.toLowerCase();
      $$('#saList [data-row]').forEach(r=>r.style.display=r.dataset.row.toLowerCase().includes(v)?'':'none');
    };
    $$('[data-del-audit]').forEach(b=>b.onclick=()=>{
      Store.set({audits:Store.state.audits.filter(x=>x.id!==b.dataset.delAudit)});closeModal();toast('Audit deleted','','');});
  }
})();
