/* Limbu AI — Keyword Planner */
(function(){
  window.Views=window.Views||{};
  const {fmt,pageHead,$,$$,toast,work,modal,closeModal,empty,statCard,barChart}=UI;

  Views.keywords=function(){
    const S=Store.state;
    const html=pageHead({eyebrow:'Local SEO',eyebrowIcon:'key',title:'Keyword Planner',
      sub:'Find what customers actually type into Google near you, then reuse those keywords in every AI post.',
      actions:'<button class="btn btn-outline" id="kwImport">'+Icon('excel')+'Import Excel</button>'+
              '<button class="btn btn-outline" id="kwPdf">'+Icon('file')+'PDF report</button>'+
              '<button class="btn btn-primary" id="kwWa">'+Icon('whatsapp')+'WhatsApp report</button>'})+

      '<div class="card mb-16"><div class="card-body">'+
        '<div class="row" style="gap:10px">'+
          '<div class="input-icon" style="flex:1;min-width:240px">'+Icon('search')+
          '<input class="input" id="kwQ" placeholder="Enter a service or business type — e.g. dental clinic"></div>'+
          '<input class="input" id="kwCity" value="'+fmt.esc(Store.biz.city)+'" style="width:150px" placeholder="City">'+
          '<button class="btn btn-primary" id="kwGo">'+Icon('sparkles')+'Find keywords</button>'+
        '</div>'+
        '<div class="row" style="margin-top:12px"><span class="small muted">Try:</span>'+
        ['dentist near me','teeth whitening','dental implants','braces cost'].map(s=>'<button class="chip" data-seed="'+s+'">'+s+'</button>').join('')+
        '</div></div></div>'+

      '<div class="grid g-4 mb-16">'+
        statCard({icon:'key',value:fmt.n(S.keywords.length),label:'Saved keywords'})+
        statCard({icon:'trend',tone:'green',value:fmt.compact(S.keywords.reduce((a,k)=>a+k.vol,0)),label:'Combined monthly volume',delta:14})+
        statCard({icon:'target',tone:'blue',value:Math.round(S.keywords.reduce((a,k)=>a+k.diff,0)/Math.max(1,S.keywords.length))||0,label:'Avg. difficulty'})+
        statCard({icon:'send',tone:'pink',value:fmt.n(S.posts.filter(p=>p.keywords.length).length),label:'Posts using keywords'})+
      '</div>'+

      '<div class="grid" style="grid-template-columns:1fr 360px" id="kwCols">'+
        '<div class="card"><div class="card-head"><div><h3>Keyword ideas</h3><p id="kwCount">Search to see ideas for your area</p></div></div>'+
        '<div class="table-wrap"><table class="tbl"><thead><tr><th>Keyword</th><th>Volume / mo</th><th>Difficulty</th><th>CPC</th><th></th></tr></thead>'+
        '<tbody id="kwBody"><tr><td colspan="5">'+empty('search','Start a search','Enter a service above to see the keywords customers use near you.')+'</td></tr></tbody></table></div></div>'+

        '<div class="stack">'+
          '<div class="card"><div class="card-head"><div><h3>Saved keywords</h3><p>Shared with Post Management</p></div></div>'+
          '<div class="card-body"><div class="row" id="kwSaved" style="gap:7px"></div></div>'+
          '<div class="card-foot"><a class="btn btn-primary btn-block btn-sm" href="#/posts/new">'+Icon('wand')+'Use in a Magic Post</a></div></div>'+
          '<div class="card"><div class="card-head"><div><h3>Volume comparison</h3></div></div>'+
          '<div class="card-body" id="kwChart"></div></div>'+
        '</div></div>';

    return {html,mount(root){
      let results=[];
      const drawSaved=()=>{
        const S=Store.state;
        root.querySelector('#kwSaved').innerHTML = S.keywords.length
          ? S.keywords.map(k=>'<span class="chip on" data-rm="'+k.id+'">'+fmt.esc(k.kw)+
              '<span class="rm">'+Icon('x')+'</span></span>').join('')
          : '<span class="muted small">No saved keywords yet.</span>';
        LimbuNav.hydrateIcons(root.querySelector('#kwSaved'));
        $$('[data-rm]',root).forEach(c=>c.onclick=()=>{
          Store.set({keywords:Store.state.keywords.filter(x=>x.id!==c.dataset.rm)});
          drawSaved();drawChart();toast('Keyword removed','','');});
        root.querySelector('#kwChart').innerHTML = S.keywords.length
          ? barChart(S.keywords.slice(0,6).map(k=>k.vol), S.keywords.slice(0,6).map(k=>k.kw.split(' ')[0]), '#EAB308', 190)
          : '<p class="muted small" style="margin:0">Save keywords to compare their search volume.</p>';
      };
      const drawChart=drawSaved;

      const drawResults=()=>{
        const tb=root.querySelector('#kwBody');
        tb.innerHTML=results.map(r=>{
          const saved=Store.state.keywords.some(k=>k.kw===r.kw);
          const diffTone=r.diff<35?'green':r.diff<60?'amber':'red';
          return '<tr><td><b style="font-size:13px">'+fmt.esc(r.kw)+'</b></td>'+
            '<td class="num">'+fmt.n(r.vol)+'</td>'+
            '<td><div class="row" style="flex-wrap:nowrap;gap:8px"><div class="progress '+(diffTone==='green'?'green':diffTone==='red'?'red':'')+'" style="width:70px"><i style="width:'+r.diff+'%"></i></div>'+
            '<span class="small">'+r.diff+'</span></div></td>'+
            '<td class="num">₹'+r.cpc+'</td>'+
            '<td><button class="btn btn-sm '+(saved?'btn-outline':'btn-primary')+'" data-save="'+fmt.esc(r.kw)+'"'+(saved?' disabled':'')+'>'+
            (saved?Icon('check')+'Saved':Icon('plus')+'Save')+'</button></td></tr>';
        }).join('');
        LimbuNav.hydrateIcons(tb);
        $$('[data-save]',tb).forEach(b=>b.onclick=()=>{
          const r=results.find(x=>x.kw===b.dataset.save);
          Store.state.keywords.push({id:Store.util.uid('kw'),kw:r.kw,vol:r.vol,diff:r.diff,cpc:r.cpc,saved:true});
          Store.save();drawResults();drawSaved();toast('Keyword saved',r.kw+' is now available in Post Management','ok');});
        root.querySelector('#kwCount').textContent=results.length+' ideas for “'+lastQ+'” in '+root.querySelector('#kwCity').value;
      };

      let lastQ='';
      const search=(seed,btn)=>{
        lastQ=seed||root.querySelector('#kwQ').value.trim();
        if(!lastQ) return toast('Enter a service','e.g. dental clinic','err');
        const run=()=>{
          const city=root.querySelector('#kwCity').value||'Mumbai';
          const base=Store.seeds.KEYWORD_SEEDS.map(([kw,vol,diff])=>({kw,vol,diff,cpc:(Math.random()*3+.4).toFixed(2)}));
          const extra=[lastQ+' near me',lastQ+' in '+city.toLowerCase(),'best '+lastQ,'affordable '+lastQ,lastQ+' price',lastQ+' reviews','24x7 '+lastQ,'top rated '+lastQ]
            .map(kw=>({kw,vol:Store.util.rand(140,9600),diff:Store.util.rand(12,82),cpc:(Math.random()*3+.4).toFixed(2)}));
          results=extra.concat(base).sort((a,b)=>b.vol-a.vol).slice(0,16);
          drawResults();
          toast('Found '+results.length+' keywords','Ranked by monthly search volume','ok');
        };
        btn ? work(btn,1300,run) : run();
      };
      root.querySelector('#kwGo').onclick=e=>search(null,e.currentTarget);
      root.querySelector('#kwQ').onkeydown=e=>{ if(e.key==='Enter') search(null,root.querySelector('#kwGo')); };
      $$('[data-seed]',root).forEach(c=>c.onclick=()=>{root.querySelector('#kwQ').value=c.dataset.seed;search(c.dataset.seed,root.querySelector('#kwGo'));});
      root.querySelector('#kwImport').onclick=()=>modal({title:'Import keywords from Excel',
        body:'<div class="check" style="justify-content:center;padding:36px;text-align:center;flex-direction:column">'+Icon('excel')+
        '<b style="margin-top:10px">Drop your .xlsx or .csv here</b><span class="small muted">One keyword per row. Volume and difficulty are optional.</span></div>'+
        '<div class="hint">Limbu will fetch fresh volume and difficulty for every imported keyword.</div>',
        foot:'<button class="btn btn-ghost" data-action="close-modal">Cancel</button><button class="btn btn-primary" id="impGo">Import</button>'})
        && (LimbuNav.hydrateIcons(document.getElementById('modalBody')), $('#impGo').onclick=()=>{closeModal();toast('Import queued','We will email you when processing finishes','ok');});
      root.querySelector('#kwPdf').onclick=e=>work(e.currentTarget,1100,()=>toast('PDF ready','keyword-report-'+Store.biz.city.toLowerCase()+'.pdf','ok'));
      root.querySelector('#kwWa').onclick=e=>work(e.currentTarget,900,()=>toast('Sent on WhatsApp','Report delivered to '+Store.state.user.phone,'ok'));
      if(window.matchMedia('(max-width:1050px)').matches) root.querySelector('#kwCols').style.gridTemplateColumns='1fr';
      drawSaved();
    }};
  };
})();
