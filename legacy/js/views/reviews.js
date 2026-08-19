/* Limbu AI — Review Management + Review Reply */
(function(){
  window.Views=window.Views||{};
  const {fmt,pageHead,$,$$,toast,modal,closeModal,work,empty,stars,statCard} = UI;

  Views.reviews = function(){ return page(false); };
  Views['review-reply'] = function(){ return page(true); };

  function page(replyMode){
    const S=Store.state;
    const dist=[5,4,3,2,1].map(r=>S.reviews.filter(x=>x.rating===r).length);
    const total=S.reviews.length;
    const avg=(S.reviews.reduce((a,r)=>a+r.rating,0)/Math.max(1,total)).toFixed(1);
    const noReply=S.reviews.filter(r=>!r.reply).length;

    const html = pageHead({eyebrow: replyMode?'AI review reply':'Reputation',
      title: replyMode?'Review Reply':'Review Management',
      sub: replyMode?'Generate on-brand replies with AI, approve them, or let Limbu auto-reply for you.'
                    :'Every Google review across your locations, in one inbox.',
      actions:'<button class="btn btn-outline" id="rvRefresh">'+Icon('refresh')+'Refresh</button>'+
              '<button class="btn btn-outline" id="rvSync">'+Icon('sync')+'Force sync</button>'+
              '<button class="btn btn-primary" id="rvBulk">'+Icon('sparkles')+'AI reply to all pending</button>'})+

      '<div class="grid g-4 mb-16">'+
        statCard({icon:'star',value:avg+'★',label:'Average rating',delta:4})+
        statCard({icon:'message',tone:'blue',value:fmt.n(total),label:'Total reviews',delta:12})+
        statCard({icon:'reply',tone:'green',value:Math.round(((total-noReply)/Math.max(1,total))*100)+'%',label:'Reply rate',delta:26})+
        statCard({icon:'alert',tone:'orange',value:fmt.n(noReply),label:'Without reply'})+
      '</div>'+

      '<div class="grid" style="grid-template-columns:1fr 320px" id="rvCols"><div class="stack">'+
        '<div class="card"><div class="card-body">'+
          '<div class="row-between" style="gap:10px">'+
            '<div class="input-icon" style="flex:1;min-width:200px">'+Icon('search')+'<input class="input" id="rvSearch" placeholder="Search reviews and reviewers…"></div>'+
            '<select class="select" id="rvLoc" style="width:auto">'+
              '<option value="">All locations</option>'+S.businesses.map(b=>'<option value="'+b.id+'">'+fmt.esc(b.name)+'</option>').join('')+'</select>'+
            '<select class="select" id="rvRate" style="width:auto"><option value="">All ratings</option>'+
              [5,4,3,2,1].map(r=>'<option value="'+r+'">'+r+' star</option>').join('')+'</select>'+
            '<button class="chip'+(replyMode?' on':'')+'" id="rvNoReply">'+Icon('filter')+'Without reply</button>'+
          '</div></div></div>'+
        '<div class="stack" id="rvList" style="gap:12px"></div>'+
      '</div>'+

      '<div class="stack">'+
        '<div class="card"><div class="card-head"><div><h3>Rating breakdown</h3></div></div><div class="card-body">'+
          [5,4,3,2,1].map((r,i)=>'<div class="row" style="gap:9px;flex-wrap:nowrap;margin-bottom:9px">'+
            '<span class="small" style="width:34px">'+r+'★</span>'+
            '<div class="progress" style="flex:1"><i style="width:'+((dist[i]/Math.max(1,total))*100)+'%"></i></div>'+
            '<span class="small muted" style="width:22px;text-align:right">'+dist[i]+'</span></div>').join('')+
        '</div></div>'+

        '<div class="card"><div class="card-head"><div><h3>Auto-reply</h3><p>Let Limbu reply within minutes</p></div></div>'+
        '<div class="card-body">'+
          toggleRow('autoReply','Auto-reply to new reviews','AI drafts and posts replies automatically')+
          toggleRow('adminApproval','Require approval first','Replies wait for your approval')+
          '<div class="divider"></div>'+
          '<div class="field"><span class="label">Reply tone</span><select class="select" id="rvTone">'+
          ['Warm & professional','Short & friendly','Formal','Playful'].map(t=>'<option>'+t+'</option>').join('')+'</select></div>'+
          '<div class="hint">Every reply costs 5 credits.</div>'+
        '</div></div>'+

        '<div class="card"><div class="card-head"><div><h3>Get more reviews</h3></div></div><div class="card-body">'+
          '<p class="small muted" style="margin-top:0">Print your Magic QR at the reception desk — customers scan and leave a Google review in seconds.</p>'+
          '<a class="btn btn-primary btn-block" href="#/magic-qr">'+Icon('qr')+'Open Magic QR</a></div></div>'+
      '</div></div>';

    return {html, mount(root){
      let q='', loc='', rate='', only=replyMode;
      const draw=()=>{
        const items=Store.state.reviews.filter(r=>{
          if(only && r.reply) return false;
          if(loc && r.bizId!==loc) return false;
          if(rate && r.rating!==+rate) return false;
          if(q && !(r.author+' '+r.text).toLowerCase().includes(q)) return false;
          return true;
        });
        const list=root.querySelector('#rvList');
        list.innerHTML = items.length ? items.map(reviewCard).join('')
          : empty('star','No reviews match','Try clearing the filters, or force sync to pull the latest from Google.');
        LimbuNav.hydrateIcons(list);
        bind(list, draw);
      };
      root.querySelector('#rvSearch').oninput=e=>{q=e.target.value.toLowerCase().trim();draw();};
      root.querySelector('#rvLoc').onchange=e=>{loc=e.target.value;draw();};
      root.querySelector('#rvRate').onchange=e=>{rate=e.target.value;draw();};
      root.querySelector('#rvNoReply').onclick=e=>{only=!only;e.currentTarget.classList.toggle('on',only);draw();};
      root.querySelector('#rvRefresh').onclick=e=>work(e.currentTarget,800,()=>{draw();toast('Reviews refreshed','','ok');});
      root.querySelector('#rvSync').onclick=e=>work(e.currentTarget,1600,()=>toast('Force sync complete','Pulled all reviews from Google Business Profile','ok'));
      root.querySelector('#rvBulk').onclick=e=>{
        const pending=Store.state.reviews.filter(r=>!r.reply);
        if(!pending.length) return toast('Nothing pending','Every review already has a reply','ok');
        const cost=pending.length*5;
        if(Store.state.user.credits<cost) return toast('Not enough credits','Need '+cost+' credits','err');
        work(e.currentTarget, 1800, ()=>{
          pending.forEach(r=>{ r.reply=aiReply(r); r.replyAuto=true; });
          Store.spend(cost,'AI review replies ×'+pending.length);
          Store.save(); LimbuNav.renderNav(); draw();
          toast('Replied to '+pending.length+' reviews', cost+' credits used','ok');
        });
      };
      $$('[data-toggle]',root).forEach(t=>t.onclick=()=>{
        const k=t.dataset.toggle; Store.state.settings[k]=!Store.state.settings[k]; Store.save();
        t.classList.toggle('on',Store.state.settings[k]);
        toast(Store.state.settings[k]?'Enabled':'Disabled', k==='autoReply'?'Auto-reply':'Approval required','ok');
      });
      if(window.matchMedia('(max-width:1100px)').matches) root.querySelector('#rvCols').style.gridTemplateColumns='1fr';
      draw();
    }};
  }

  function toggleRow(key,title,desc){
    const on=Store.state.settings[key];
    return '<div class="row-between" style="margin-bottom:13px;flex-wrap:nowrap;gap:10px">'+
      '<div><b style="font-size:12.5px">'+title+'</b><div class="small muted">'+desc+'</div></div>'+
      '<button class="switch'+(on?' on':'')+'" data-toggle="'+key+'"></button></div>';
  }

  function reviewCard(r){
    const b=Store.state.businesses.find(x=>x.id===r.bizId)||{name:''};
    return '<div class="card card-pad" data-rev="'+r.id+'">'+
      '<div class="row-between" style="align-items:flex-start">'+
        '<div class="row" style="flex-wrap:nowrap"><div class="avatar-sm">'+fmt.initials(r.author)+'</div>'+
        '<div><b style="font-size:13.5px">'+fmt.esc(r.author)+'</b>'+
        '<div class="row" style="gap:8px">'+stars(r.rating)+'<span class="small muted">'+fmt.ago(r.createdAt)+' • '+fmt.esc(b.name)+'</span></div></div></div>'+
        (r.reply?'<span class="badge badge-green">'+Icon('checkCircle')+(r.replyAuto?'Auto-replied':'Replied')+'</span>'
                :'<span class="badge badge-amber">Needs reply</span>')+
      '</div>'+
      '<p style="margin:12px 0 0;color:var(--text-2);font-size:13.5px">'+fmt.esc(r.text)+'</p>'+
      (r.reply
        ? '<div style="margin-top:13px;padding:12px;background:var(--surface-2);border-left:3px solid var(--lemon-hover);border-radius:0 10px 10px 0">'+
          '<div class="small" style="font-weight:700;margin-bottom:4px">'+Icon('reply').replace('<svg','<svg style="width:13px;height:13px;display:inline;vertical-align:-2px"')+' Owner reply</div>'+
          '<div class="small" style="color:var(--text-2)">'+fmt.esc(r.reply)+'</div>'+
          '<div class="row" style="margin-top:9px"><button class="btn btn-sm btn-ghost" data-edit="'+r.id+'">'+Icon('edit')+'Edit</button>'+
          '<button class="btn btn-sm btn-ghost" data-unreply="'+r.id+'">'+Icon('trash')+'Remove reply</button></div></div>'
        : '<div class="row" style="margin-top:13px"><button class="btn btn-primary btn-sm" data-ai="'+r.id+'">'+Icon('sparkles')+'Generate AI reply</button>'+
          '<button class="btn btn-outline btn-sm" data-manual="'+r.id+'">'+Icon('edit')+'Write manually</button></div>')+
      '</div>';
  }

  function bind(root, draw){
    $$('[data-ai]',root).forEach(b=>b.onclick=e=>{
      const r=Store.state.reviews.find(x=>x.id===b.dataset.ai);
      if(Store.state.user.credits<5) return toast('Not enough credits','','err');
      work(e.currentTarget, 1100, ()=>{
        const text=aiReply(r);
        openReplyModal(r, text, draw, true);
      });
    });
    $$('[data-manual]',root).forEach(b=>b.onclick=()=>{
      const r=Store.state.reviews.find(x=>x.id===b.dataset.manual);
      openReplyModal(r,'',draw,false);
    });
    $$('[data-edit]',root).forEach(b=>b.onclick=()=>{
      const r=Store.state.reviews.find(x=>x.id===b.dataset.edit);
      openReplyModal(r,r.reply,draw,false);
    });
    $$('[data-unreply]',root).forEach(b=>b.onclick=()=>{
      const r=Store.state.reviews.find(x=>x.id===b.dataset.unreply);
      r.reply=null; Store.save(); LimbuNav.renderNav(); draw(); toast('Reply removed','','');
    });
  }

  function openReplyModal(r, text, draw, charge){
    modal({title:'Reply to '+r.author, body:
      '<div class="card card-pad" style="background:var(--surface-2);margin-bottom:14px">'+
      '<div class="row" style="gap:8px">'+stars(r.rating)+'<span class="small muted">'+fmt.ago(r.createdAt)+'</span></div>'+
      '<p class="small" style="margin:8px 0 0;color:var(--text-2)">'+fmt.esc(r.text)+'</p></div>'+
      '<div class="field"><span class="label">Your reply</span><textarea class="textarea" id="replyTxt">'+fmt.esc(text)+'</textarea>'+
      '<div class="hint">Replies post publicly on your Google Business Profile.</div></div>'+
      '<button class="btn btn-outline btn-sm" id="regenReply">'+Icon('refresh')+'Regenerate with AI</button>',
      foot:'<button class="btn btn-ghost" data-action="close-modal">Cancel</button>'+
           '<button class="btn btn-primary" id="postReply">'+Icon('send')+'Post reply</button>'});
    LimbuNav.hydrateIcons(document.getElementById('modalBody'));
    $('#regenReply').onclick=e=>work(e.currentTarget,800,()=>{ $('#replyTxt').value=aiReply(r); });
    $('#postReply').onclick=()=>{
      const v=$('#replyTxt').value.trim();
      if(!v) return toast('Reply is empty','','err');
      r.reply=v; r.replyAuto=charge;
      if(charge) Store.spend(5,'AI review reply'); else Store.save();
      LimbuNav.renderNav(); closeModal(); draw();
      toast('Reply posted','Published to Google Business Profile','ok');
    };
  }

  function aiReply(r){
    const b=Store.biz, name=r.author.split(' ')[0];
    if(r.rating>=4) return Store.util.pick([
      'Thank you so much, '+name+'! 💛 We are delighted you had a great experience at '+b.name+'. Our team looks forward to welcoming you again.',
      'This made our day, '+name+'! Thanks for trusting '+b.name+' with your care. See you at your next visit!',
      'Really appreciate the kind words, '+name+'. Reviews like yours keep our team going. Thank you for choosing '+b.name+'!'
    ]);
    if(r.rating===3) return 'Thank you for the honest feedback, '+name+'. We are sorry the wait was longer than expected — we have added extra slots to reduce waiting time. Please call us at '+b.phone+' so we can make your next visit smoother.';
    return 'We are truly sorry about this experience, '+name+'. This is not the standard we hold ourselves to at '+b.name+'. Please reach us directly at '+b.phone+' — we would like to understand what happened and set it right.';
  }
})();
