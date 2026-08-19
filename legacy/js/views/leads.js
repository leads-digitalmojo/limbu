/* Limbu AI — Website Leads */
(function(){
  window.Views=window.Views||{};
  const {fmt,pageHead,$,$$,toast,modal,closeModal,work,empty,statCard,confirmDialog}=UI;
  const STATUSES=[['all','All leads'],['new','New'],['contacted','Contacted'],['converted','Converted'],['spam','Spam']];
  const BADGE={new:'badge-blue',contacted:'badge-amber',converted:'badge-green',spam:'badge-slate'};

  Views.leads=function(){
    const S=Store.state;
    const count=s=>s==='all'?S.leads.length:S.leads.filter(l=>l.status===s).length;
    const conv=Math.round((count('converted')/Math.max(1,S.leads.length))*100);

    const html=pageHead({eyebrow:'Lead inbox',title:'Website Leads',
      sub:'Every enquiry submitted through your Limbu website, Magic QR and Google posts.',
      actions:'<button class="btn btn-outline" id="ldExport">'+Icon('download')+'Export CSV</button>'+
              '<a class="btn btn-primary" href="#/website">'+Icon('monitor')+'Open Website Builder</a>'})+
      '<div class="grid g-4 mb-16">'+
        statCard({icon:'inbox',tone:'blue',value:fmt.n(count('all')),label:'Total leads',delta:19})+
        statCard({icon:'zap',value:fmt.n(count('new')),label:'New — uncontacted'})+
        statCard({icon:'checkCircle',tone:'green',value:fmt.n(count('converted')),label:'Converted',delta:8})+
        statCard({icon:'percent',tone:'pink',value:conv+'%',label:'Conversion rate',delta:5})+
      '</div>'+
      '<div class="tabs" id="ldTabs">'+STATUSES.map((s,i)=>
        '<div class="tab'+(i===0?' on':'')+'" data-s="'+s[0]+'">'+s[1]+'<span class="n">'+count(s[0])+'</span></div>').join('')+'</div>'+
      '<div class="card"><div class="card-body" style="padding-bottom:0">'+
        '<div class="row-between" style="gap:10px;margin-bottom:16px">'+
          '<div class="input-icon" style="flex:1;max-width:380px">'+Icon('search')+
          '<input class="input" id="ldSearch" placeholder="Search by name, phone, email or service…"></div>'+
          '<select class="select" id="ldService" style="width:auto"><option value="">All services</option>'+
          Store.seeds.SERVICES.map(s=>'<option>'+s+'</option>').join('')+'</select></div></div>'+
        '<div class="table-wrap"><table class="tbl"><thead><tr>'+
        '<th>Lead</th><th>Contact</th><th>Service</th><th>Source</th><th>Received</th><th>Status</th><th></th>'+
        '</tr></thead><tbody id="ldBody"></tbody></table></div></div>';

    return {html,mount(root){
      let tab='all',q='',svc='';
      const draw=()=>{
        const items=Store.state.leads.filter(l=>{
          if(tab!=='all'&&l.status!==tab)return false;
          if(svc&&l.service!==svc)return false;
          if(q&&!(l.name+' '+l.phone+' '+l.email+' '+l.service).toLowerCase().includes(q))return false;
          return true;
        });
        const tb=root.querySelector('#ldBody');
        tb.innerHTML=items.length?items.map(row).join('')
          :'<tr><td colspan="7">'+empty('inbox','No leads here','Leads from your website form land in this inbox automatically.')+'</td></tr>';
        LimbuNav.hydrateIcons(tb); bind(tb,draw);
      };
      $$('#ldTabs .tab',root).forEach(t=>t.onclick=()=>{
        $$('#ldTabs .tab',root).forEach(x=>x.classList.remove('on'));t.classList.add('on');tab=t.dataset.s;draw();});
      root.querySelector('#ldSearch').oninput=e=>{q=e.target.value.toLowerCase().trim();draw();};
      root.querySelector('#ldService').onchange=e=>{svc=e.target.value;draw();};
      root.querySelector('#ldExport').onclick=e=>work(e.currentTarget,900,()=>toast('CSV exported',Store.state.leads.length+' leads downloaded','ok'));
      draw();
    }};
  };

  function row(l){
    return '<tr>'+
      '<td><div class="row" style="flex-wrap:nowrap"><div class="avatar-sm">'+fmt.initials(l.name)+'</div>'+
      '<div><b style="font-size:13px">'+fmt.esc(l.name)+'</b><div class="small muted">'+fmt.esc(l.message.slice(0,38))+'…</div></div></div></td>'+
      '<td><div class="small">'+fmt.esc(l.phone)+'</div><div class="small muted">'+fmt.esc(l.email)+'</div></td>'+
      '<td><span class="badge badge-slate">'+fmt.esc(l.service)+'</span></td>'+
      '<td class="small muted">'+fmt.esc(l.source)+'</td>'+
      '<td class="small muted">'+fmt.ago(l.createdAt)+'</td>'+
      '<td><select class="select" data-st="'+l.id+'" style="height:30px;font-size:12px;width:auto">'+
        ['new','contacted','converted','spam'].map(s=>'<option value="'+s+'"'+(l.status===s?' selected':'')+'>'+s+'</option>').join('')+'</select></td>'+
      '<td><div class="row" style="gap:2px;flex-wrap:nowrap">'+
        '<button class="icon-btn" data-call="'+l.id+'" title="Call" style="width:30px;height:30px">'+Icon('phone')+'</button>'+
        '<button class="icon-btn" data-wa="'+l.id+'" title="WhatsApp" style="width:30px;height:30px">'+Icon('whatsapp')+'</button>'+
        '<button class="icon-btn" data-open="'+l.id+'" title="Open" style="width:30px;height:30px">'+Icon('eye')+'</button>'+
      '</div></td></tr>';
  }

  function bind(root,draw){
    $$('[data-st]',root).forEach(s=>s.onchange=()=>{
      const l=Store.state.leads.find(x=>x.id===s.dataset.st); l.status=s.value; Store.save(); LimbuNav.renderNav();
      toast('Lead updated',l.name+' → '+s.value,'ok'); draw();
    });
    $$('[data-call]',root).forEach(b=>b.onclick=()=>{
      const l=Store.state.leads.find(x=>x.id===b.dataset.call); toast('Calling '+l.name, l.phone,'');
    });
    $$('[data-wa]',root).forEach(b=>b.onclick=()=>{
      const l=Store.state.leads.find(x=>x.id===b.dataset.wa); toast('WhatsApp opened', l.phone,'ok');
    });
    $$('[data-open]',root).forEach(b=>b.onclick=()=>{
      const l=Store.state.leads.find(x=>x.id===b.dataset.open);
      modal({title:'Lead — '+l.name, body:
        '<div class="grid g-2" style="gap:12px">'+
        kv('Phone',l.phone)+kv('Email',l.email)+kv('Service',l.service)+kv('Source',l.source)+
        kv('Received',fmt.date(l.createdAt))+kv('Status',l.status)+'</div>'+
        '<div class="field mt-16"><span class="label">Message</span><div class="card card-pad small">'+fmt.esc(l.message)+'</div></div>'+
        '<div class="field"><span class="label">Internal note</span><textarea class="textarea" placeholder="Add a note for your team…"></textarea></div>',
        foot:'<button class="btn btn-ghost" data-action="close-modal">Close</button>'+
             '<button class="btn btn-primary" id="ldSave">Save note</button>'});
      $('#ldSave').onclick=()=>{closeModal();toast('Note saved','','ok');};
    });
  }
  const kv=(k,v)=>'<div class="card card-pad" style="padding:12px"><div class="small muted">'+k+'</div><b style="font-size:13px">'+fmt.esc(v)+'</b></div>';
})();
