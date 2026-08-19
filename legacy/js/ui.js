/* Limbu AI — UI primitives: toast, modal, charts, formatters */
(function(){
  const $  = (s,r)=> (r||document).querySelector(s);
  const $$ = (s,r)=> Array.from((r||document).querySelectorAll(s));

  const fmt = {
    n(v){ return (v||0).toLocaleString('en-IN'); },
    inr(v){ return '₹'+(v||0).toLocaleString('en-IN'); },
    compact(v){ v=v||0; if(v>=1e7)return (v/1e7).toFixed(1)+'Cr'; if(v>=1e5)return (v/1e5).toFixed(1)+'L'; if(v>=1000)return (v/1000).toFixed(1)+'k'; return String(v); },
    date(iso){ const d=new Date(iso); return d.toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}); },
    ago(iso){
      const s=(Date.now()-new Date(iso))/1000;
      if(s<60) return 'just now';
      if(s<3600) return Math.floor(s/60)+'m ago';
      if(s<86400) return Math.floor(s/3600)+'h ago';
      if(s<604800) return Math.floor(s/86400)+'d ago';
      return fmt.date(iso);
    },
    esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); },
    initials(s){ return String(s||'?').split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase(); }
  };

  /* ---------- toast ---------- */
  function toast(title, desc, kind){
    const el = document.createElement('div');
    el.className = 'toast '+(kind||'info');
    const ico = kind==='ok'?'checkCircle':kind==='err'?'alert':'info';
    el.innerHTML = Icon(ico)+'<div><b>'+fmt.esc(title)+'</b>'+(desc?'<span>'+fmt.esc(desc)+'</span>':'')+'</div>';
    $('#toasts').appendChild(el);
    setTimeout(()=>{ el.classList.add('out'); setTimeout(()=>el.remove(),200); }, 3400);
  }

  /* ---------- modal ---------- */
  function modal(opts){
    const wrap=$('#modal');
    $('#modalTitle').textContent = opts.title||'';
    $('#modalBody').innerHTML = opts.body||'';
    $('#modalFoot').innerHTML = opts.foot||'';
    $('.modal',wrap).classList.toggle('wide', !!opts.wide);
    wrap.hidden=false;
    if(opts.onMount) opts.onMount($('#modalBody'));
    return wrap;
  }
  function closeModal(){ $('#modal').hidden=true; }

  function confirmDialog(title,msg,onYes,yesLabel){
    modal({title:title,body:'<p style="margin:0;color:var(--text-2)">'+fmt.esc(msg)+'</p>',
      foot:'<button class="btn btn-ghost" data-action="close-modal">Cancel</button>'+
           '<button class="btn btn-danger" id="cfmYes">'+(yesLabel||'Confirm')+'</button>'});
    $('#cfmYes').onclick=()=>{ closeModal(); onYes(); };
  }

  /* ---------- charts (hand-rolled SVG) ---------- */
  function sparkline(data, color, h){
    h = h||46;
    const w=140, max=Math.max.apply(null,data), min=Math.min.apply(null,data), span=(max-min)||1;
    const pts = data.map((v,i)=>[i*(w/(data.length-1)), h-((v-min)/span)*(h-8)-4]);
    const d = pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' ');
    const area = d+' L'+w+' '+h+' L0 '+h+' Z';
    const id='g'+Math.random().toString(36).slice(2,7);
    return '<svg viewBox="0 0 '+w+' '+h+'" preserveAspectRatio="none" style="width:100%;height:'+h+'px">'+
      '<defs><linearGradient id="'+id+'" x1="0" y1="0" x2="0" y2="1">'+
      '<stop offset="0%" stop-color="'+color+'" stop-opacity=".28"/><stop offset="100%" stop-color="'+color+'" stop-opacity="0"/></linearGradient></defs>'+
      '<path d="'+area+'" fill="url(#'+id+')"/>'+
      '<path d="'+d+'" fill="none" stroke="'+color+'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }

  function lineChart(series, labels, opts){
    opts=opts||{};
    const w=760,h=opts.height||230,pl=44,pr=14,pt=16,pb=30;
    const all=series.reduce((a,s)=>a.concat(s.data),[]);
    const max=Math.max.apply(null,all)*1.12||10, min=0;
    const iw=w-pl-pr, ih=h-pt-pb;
    const x=i=>pl+(i*(iw/Math.max(1,labels.length-1)));
    const y=v=>pt+ih-((v-min)/(max-min))*ih;
    let g='';
    for(let i=0;i<=4;i++){ const yy=pt+ih-(i/4)*ih;
      g+='<line x1="'+pl+'" x2="'+(w-pr)+'" y1="'+yy+'" y2="'+yy+'" stroke="var(--line)" stroke-dasharray="3 4"/>'+
         '<text x="'+(pl-9)+'" y="'+(yy+4)+'" text-anchor="end" font-size="10" fill="var(--muted)">'+fmt.compact(Math.round(max*i/4))+'</text>';
    }
    labels.forEach((l,i)=>{ if(labels.length>12 && i%Math.ceil(labels.length/8)) return;
      g+='<text x="'+x(i)+'" y="'+(h-9)+'" text-anchor="middle" font-size="10" fill="var(--muted)">'+fmt.esc(l)+'</text>'; });
    series.forEach(s=>{
      const d=s.data.map((v,i)=>(i?'L':'M')+x(i).toFixed(1)+' '+y(v).toFixed(1)).join(' ');
      const id='ar'+Math.random().toString(36).slice(2,7);
      if(s.area!==false) g+='<defs><linearGradient id="'+id+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="'+s.color+'" stop-opacity=".22"/><stop offset="100%" stop-color="'+s.color+'" stop-opacity="0"/></linearGradient></defs>'+
        '<path d="'+d+' L'+x(s.data.length-1)+' '+(pt+ih)+' L'+pl+' '+(pt+ih)+' Z" fill="url(#'+id+')"/>';
      g+='<path d="'+d+'" fill="none" stroke="'+s.color+'" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>';
      s.data.forEach((v,i)=>{ g+='<circle cx="'+x(i)+'" cy="'+y(v)+'" r="3" fill="var(--surface)" stroke="'+s.color+'" stroke-width="2"><title>'+fmt.esc(labels[i])+': '+fmt.n(v)+'</title></circle>'; });
    });
    const legend=series.map(s=>'<span class="row" style="gap:6px"><i style="width:9px;height:9px;border-radius:3px;background:'+s.color+';display:block"></i><span class="small muted">'+fmt.esc(s.name)+'</span></span>').join('');
    return '<div class="row" style="gap:18px;margin-bottom:6px">'+legend+'</div>'+
      '<svg viewBox="0 0 '+w+' '+h+'" style="width:100%;height:auto">'+g+'</svg>';
  }

  function barChart(data, labels, color, height){
    const w=760,h=height||210,pl=40,pr=10,pt=12,pb=28;
    const max=Math.max.apply(null,data)*1.15||10, iw=w-pl-pr, ih=h-pt-pb;
    const bw=Math.min(46,(iw/data.length)*0.6);
    let g='';
    for(let i=0;i<=3;i++){ const yy=pt+ih-(i/3)*ih;
      g+='<line x1="'+pl+'" x2="'+(w-pr)+'" y1="'+yy+'" y2="'+yy+'" stroke="var(--line)" stroke-dasharray="3 4"/>'+
         '<text x="'+(pl-8)+'" y="'+(yy+4)+'" text-anchor="end" font-size="10" fill="var(--muted)">'+fmt.compact(Math.round(max*i/3))+'</text>'; }
    data.forEach((v,i)=>{
      const cx=pl+(i+0.5)*(iw/data.length), bh=(v/max)*ih;
      g+='<rect x="'+(cx-bw/2)+'" y="'+(pt+ih-bh)+'" width="'+bw+'" height="'+Math.max(2,bh)+'" rx="5" fill="'+color+'"><title>'+fmt.esc(labels[i])+': '+fmt.n(v)+'</title></rect>'+
         '<text x="'+cx+'" y="'+(h-8)+'" text-anchor="middle" font-size="10" fill="var(--muted)">'+fmt.esc(labels[i])+'</text>';
    });
    return '<svg viewBox="0 0 '+w+' '+h+'" style="width:100%;height:auto">'+g+'</svg>';
  }

  function donut(value, max, color, label){
    const r=52,c=2*Math.PI*r, pct=Math.min(1,value/max);
    return '<div style="position:relative;width:140px;height:140px;margin:0 auto">'+
      '<svg viewBox="0 0 140 140" style="width:140px;height:140px;transform:rotate(-90deg)">'+
      '<circle cx="70" cy="70" r="'+r+'" fill="none" stroke="var(--surface-3)" stroke-width="14"/>'+
      '<circle cx="70" cy="70" r="'+r+'" fill="none" stroke="'+color+'" stroke-width="14" stroke-linecap="round" '+
      'stroke-dasharray="'+(c*pct).toFixed(1)+' '+c.toFixed(1)+'"/></svg>'+
      '<div style="position:absolute;inset:0;display:grid;place-items:center;text-align:center">'+
      '<div><div style="font-family:var(--font-h);font-size:26px;font-weight:800;line-height:1">'+value+'</div>'+
      '<div class="small muted">'+fmt.esc(label||'')+'</div></div></div></div>';
  }

  function stars(n){
    let s='<span class="stars">';
    for(let i=1;i<=5;i++) s+=Icon('star', i<=n?'':'off');
    return s+'</span>';
  }
  /* fill stars visually */
  function starRow(n){
    let s='<span class="stars">';
    for(let i=1;i<=5;i++) s+='<span style="color:'+(i<=n?'var(--lemon-hover)':'var(--line)')+';fill:currentColor">'+Icon('star')+'</span>';
    return s+'</span>';
  }

  function statCard(o){
    return '<div class="stat">'+
      '<div class="stat-top"><div class="stat-icon '+(o.tone||'')+'">'+Icon(o.icon)+'</div>'+
      (o.delta!=null?'<span class="delta '+(o.delta>0?'up':o.delta<0?'down':'flat')+'">'+
        Icon(o.delta>=0?'trend':'trendDown')+(o.delta>0?'+':'')+o.delta+'%</span>':'')+'</div>'+
      '<div class="stat-value">'+o.value+'</div><div class="stat-label">'+fmt.esc(o.label)+'</div>'+
      (o.spark?'<div style="margin-top:10px">'+sparkline(o.spark,o.sparkColor||'#EAB308')+'</div>':'')+
      '</div>';
  }

  function pageHead(o){
    return '<div class="page-head"><div>'+
      (o.eyebrow?'<span class="eyebrow">'+Icon(o.eyebrowIcon||'sparkles')+fmt.esc(o.eyebrow)+'</span>':'')+
      '<h1>'+fmt.esc(o.title)+'</h1>'+(o.sub?'<p>'+fmt.esc(o.sub)+'</p>':'')+
      '</div>'+(o.actions?'<div class="page-actions">'+o.actions+'</div>':'')+'</div>';
  }

  function empty(icon,title,desc,action){
    return '<div class="empty"><div class="empty-ico">'+Icon(icon)+'</div><h4>'+fmt.esc(title)+'</h4><p>'+fmt.esc(desc)+'</p>'+(action||'')+'</div>';
  }

  function series(n, base, jitter){
    let v=base; return Array.from({length:n},()=>{ v = Math.max(2, v + (Math.random()-0.42)*jitter); return Math.round(v); });
  }
  function lastDays(n){
    return Array.from({length:n},(_,i)=>{ const d=new Date(); d.setDate(d.getDate()-(n-1-i));
      return d.toLocaleDateString('en-IN',{day:'numeric',month:'short'}); });
  }

  /* simulate async work with a button spinner */
  function work(btn, ms, done){
    const html = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = Icon('refresh','spin')+'<span>Working…</span>';
    setTimeout(()=>{ btn.disabled=false; btn.innerHTML=html; done && done(); }, ms||900);
  }

  window.UI = {$,$$,fmt,toast,modal,closeModal,confirmDialog,sparkline,lineChart,barChart,donut,
    stars:starRow,statCard,pageHead,empty,series,lastDays,work};
})();
