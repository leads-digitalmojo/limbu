/* Limbu AI — Post Management (Auto Post, Manual Post, statuses, preview) */
(function(){
  window.Views = window.Views||{};
  const {fmt,pageHead,$,$$,toast,modal,closeModal,work,empty,confirmDialog} = UI;

  const PLATFORMS = [
    {k:'google',   name:'Google',    icon:'google',    color:'#4285F4'},
    {k:'facebook', name:'Facebook',  icon:'facebook',  color:'#1877F2'},
    {k:'instagram',name:'Instagram', icon:'instagram', color:'#E1306C'},
    {k:'pinterest',name:'Pinterest', icon:'pinterest', color:'#E60023'},
    {k:'linkedin', name:'LinkedIn',  icon:'linkedin',  color:'#0A66C2'},
    {k:'youtube',  name:'YouTube',   icon:'youtube',   color:'#FF0000'}
  ];
  const THEMES = {
    lemon:['#FACC15','#EAB308','#0F172B'], ocean:['#0EA5E9','#2563EB','#082F49'],
    sunset:['#F97316','#EC4899','#431407'], forest:['#10B981','#059669','#052E16'],
    mono:['#94A3B8','#475569','#0F172B']
  };
  const RATIOS=['1:1','4:5','16:9','9:16'];
  const TABS=[['all','All'],['pending','Pending'],['approved','Approved'],['rejected','Rejected'],['scheduled','Scheduled'],['posted','Posted'],['video','Videos']];

  const STATUS_BADGE = {posted:'badge-green',scheduled:'badge-blue',pending:'badge-amber',approved:'badge-green',rejected:'badge-red'};

  Views.posts = function(ctx){
    if(ctx.sub==='new') return composer();
    return list();
  };

  /* ================= LIST ================= */
  function list(){
    const S=Store.state;
    const html = pageHead({eyebrow:'AI content', title:'Post Management',
      sub:'Create, approve and publish marketing posts across Google and your social platforms.',
      actions:'<button class="btn btn-outline" id="pmSync">'+Icon('sync')+'Force sync</button>'+
              '<a class="btn btn-primary" href="#/posts/new">'+Icon('wand')+'New Magic Post</a>'})+
      '<div class="grid g-4 mb-16">'+
        UI.statCard({icon:'send',tone:'blue',value:fmt.n(S.posts.filter(p=>p.status==='posted').length),label:'Published posts',delta:22})+
        UI.statCard({icon:'clock',tone:'',value:fmt.n(S.posts.filter(p=>p.status==='scheduled').length),label:'Scheduled'})+
        UI.statCard({icon:'alert',tone:'orange',value:fmt.n(S.posts.filter(p=>p.status==='pending').length),label:'Pending approval'})+
        UI.statCard({icon:'eye',tone:'green',value:fmt.compact(S.posts.reduce((a,p)=>a+p.stats.views,0)),label:'Total post views',delta:37})+
      '</div>'+
      '<div class="tabs" id="pmTabs">'+TABS.map((t,i)=>{
        const n = t[0]==='all'?S.posts.length : t[0]==='video'?S.posts.filter(p=>p.type==='video').length : S.posts.filter(p=>p.status===t[0]).length;
        return '<div class="tab'+(i===0?' on':'')+'" data-t="'+t[0]+'">'+t[1]+'<span class="n">'+n+'</span></div>';
      }).join('')+'</div>'+
      '<div class="row-between mb-16"><div class="input-icon" style="max-width:320px;flex:1">'+Icon('search')+
        '<input class="input" id="pmSearch" placeholder="Search captions and keywords…"></div>'+
        '<div class="row"><select class="select" id="pmPlat" style="width:auto"><option value="">All platforms</option>'+
        PLATFORMS.map(p=>'<option value="'+p.k+'">'+p.name+'</option>').join('')+'</select></div></div>'+
      '<div class="grid g-auto-lg" id="pmGrid"></div>';

    return {html, mount(root){
      let tab='all', q='', plat='';
      const draw=()=>{
        let items=S.posts.filter(p=>{
          if(tab==='video') { if(p.type!=='video') return false; }
          else if(tab!=='all' && p.status!==tab) return false;
          if(plat && !p.platforms.includes(plat)) return false;
          if(q && !(p.caption+' '+p.keywords.join(' ')).toLowerCase().includes(q)) return false;
          return true;
        });
        const g=root.querySelector('#pmGrid');
        g.innerHTML = items.length ? items.map(card).join('')
          : empty('send','No posts here','Nothing matches this filter yet. Create a Magic Post to fill this space.',
              '<a class="btn btn-primary" href="#/posts/new">'+Icon('wand')+'New Magic Post</a>');
        LimbuNav.hydrateIcons(g);
        bindCards(root, draw);
      };
      $$('#pmTabs .tab',root).forEach(t=>t.onclick=()=>{
        $$('#pmTabs .tab',root).forEach(x=>x.classList.remove('on')); t.classList.add('on'); tab=t.dataset.t; draw();
      });
      root.querySelector('#pmSearch').oninput=e=>{q=e.target.value.toLowerCase().trim();draw();};
      root.querySelector('#pmPlat').onchange=e=>{plat=e.target.value;draw();};
      root.querySelector('#pmSync').onclick=e=>work(e.currentTarget,1200,()=>toast('Sync complete','Post statuses refreshed from all platforms','ok'));
      draw();
    }};
  }

  function card(p){
    const [c1,c2] = THEMES[p.theme]||THEMES.lemon;
    const ratioCls = {'1:1':'','4:5':'r-4-5','16:9':'r-16-9','9:16':'r-9-16'}[p.ratio]||'';
    return '<div class="card" data-post="'+p.id+'">'+
      '<div class="post-media '+ratioCls+'" style="background:linear-gradient(150deg,'+c1+' 0%,'+c2+' 60%,#0F172B 100%)">'+
        '<div class="glow"></div>'+
        (p.type==='video'?'<span style="position:absolute;top:11px;left:11px" class="badge badge-red">'+Icon('video')+'Video</span>':'')+
        '<div class="cap">'+fmt.esc(p.caption.split('.')[0])+'</div><span class="wm">Made with Limbu AI</span></div>'+
      '<div class="post-foot">'+
        '<div class="row-between" style="margin-bottom:8px">'+
          '<span class="badge '+(STATUS_BADGE[p.status]||'badge-slate')+'">'+p.status+'</span>'+
          '<span class="row" style="gap:5px">'+p.platforms.map(k=>{
            const pl=PLATFORMS.find(x=>x.k===k)||PLATFORMS[0];
            return '<span title="'+pl.name+'" style="width:20px;height:20px;border-radius:6px;background:'+pl.color+';color:#fff;display:grid;place-items:center">'+
              Icon(pl.icon).replace('<svg','<svg style="width:12px;height:12px"')+'</span>';}).join('')+'</span>'+
        '</div>'+
        '<p>'+fmt.esc(p.caption)+'</p>'+
        '<div class="row" style="gap:6px;margin:9px 0">'+p.keywords.slice(0,2).map(k=>'<span class="badge badge-slate">#'+fmt.esc(k.replace(/\s+/g,''))+'</span>').join('')+'</div>'+
        '<div class="row-between" style="border-top:1px solid var(--line-2);padding-top:9px">'+
          '<span class="small muted">'+Icon('eye').replace('<svg','<svg style="width:13px;height:13px;display:inline;vertical-align:-2px"')+' '+fmt.compact(p.stats.views)+' • '+fmt.ago(p.createdAt)+'</span>'+
          '<span class="row" style="gap:4px">'+
            (p.status==='pending'?'<button class="btn btn-sm btn-primary" data-approve="'+p.id+'">Approve</button><button class="btn btn-sm btn-ghost" data-reject="'+p.id+'">Reject</button>':
             '<button class="btn btn-sm btn-outline" data-view="'+p.id+'">View</button>')+
            '<button class="icon-btn" data-del="'+p.id+'" style="width:28px;height:28px">'+Icon('trash')+'</button>'+
          '</span>'+
        '</div></div></div>';
  }

  function bindCards(root, draw){
    $$('[data-approve]',root).forEach(b=>b.onclick=()=>{
      const p=Store.state.posts.find(x=>x.id===b.dataset.approve); p.status='approved'; Store.save();
      toast('Post approved','It will publish at the scheduled time','ok'); draw(); LimbuNav.renderNav();
    });
    $$('[data-reject]',root).forEach(b=>b.onclick=()=>{
      const p=Store.state.posts.find(x=>x.id===b.dataset.reject); p.status='rejected'; Store.save();
      toast('Post rejected','','err'); draw(); LimbuNav.renderNav();
    });
    $$('[data-del]',root).forEach(b=>b.onclick=()=>confirmDialog('Delete post?','This post will be removed from Limbu. Published copies stay live on the platform.',()=>{
      Store.set({posts:Store.state.posts.filter(x=>x.id!==b.dataset.del)}); toast('Post deleted','','ok'); draw(); LimbuNav.renderNav();
    },'Delete'));
    $$('[data-view]',root).forEach(b=>b.onclick=()=>{
      const p=Store.state.posts.find(x=>x.id===b.dataset.view);
      modal({title:'Post details', wide:true, body:
        '<div class="grid g-2"><div>'+card(p).replace(/<div class="row-between" style="border-top[\s\S]*?<\/div>\s*<\/div><\/div>$/,'</div></div>')+'</div>'+
        '<div><div class="field"><span class="label">Caption</span><div class="card card-pad small">'+fmt.esc(p.caption)+'</div></div>'+
        '<div class="grid g-2" style="gap:12px">'+
          metric('Views',fmt.n(p.stats.views))+metric('Likes',fmt.n(p.stats.likes))+
          metric('Clicks',fmt.n(p.stats.clicks))+metric('Ratio',p.ratio)+
          metric('Mode',p.mode==='auto'?'AI Auto Post':'Manual Post')+metric('Created',fmt.date(p.createdAt))+
        '</div></div></div>'});
      LimbuNav.hydrateIcons(document.getElementById('modalBody'));
    });
  }
  const metric=(l,v)=>'<div class="card card-pad" style="padding:12px"><div class="small muted">'+l+'</div><b style="font-size:15px">'+v+'</b></div>';

  /* ================= COMPOSER ================= */
  function composer(){
    const S=Store.state, B=S.brand;
    const draft = {mode:'auto', prompt:'', lang:'en', platforms:['google'], keywords:[],
      assets:{logo:true,character:false,product:true,uniform:false,background:true},
      theme:B.theme, ratio:B.ratio, caption:'', schedule:'now'};

    const html = pageHead({eyebrow:'Magic Post', eyebrowIcon:'wand', title:'Create a post',
      sub:'Describe your offer in one line — Limbu writes the caption, generates the image with your brand assets and publishes everywhere.',
      actions:'<a class="btn btn-ghost" href="#/posts">'+Icon('chevronR')+'Back to posts</a>'})+
      '<div class="grid" style="grid-template-columns:1.4fr 1fr" id="cmpCols">'+
      '<div class="stack">'+

        '<div class="card"><div class="card-head"><div><h3>1 · Platforms</h3><p>Where should this post go?</p></div></div>'+
        '<div class="card-body"><div class="row" id="platRow">'+PLATFORMS.map(p=>
          '<button class="chip'+(p.k==='google'?' on':'')+'" data-plat="'+p.k+'">'+Icon(p.icon)+p.name+'</button>').join('')+'</div></div></div>'+

        '<div class="card"><div class="card-head"><div><h3>2 · Content</h3><p>AI Auto Post or upload your own creative</p></div>'+
          '<div class="segment" id="modeSeg"><button class="on" data-m="auto">AI Auto Post</button><button data-m="manual">Manual Post</button></div></div>'+
        '<div class="card-body" id="modeBody"></div></div>'+

        '<div class="card"><div class="card-head"><div><h3>3 · Brand & style</h3><p>Pulled from your Assets Manager</p></div>'+
          '<a href="#/assets" class="btn btn-ghost btn-sm">Edit assets</a></div>'+
        '<div class="card-body">'+
          '<div class="field"><span class="label">Colour theme</span><div class="row" id="themeRow">'+
            Object.keys(THEMES).map(t=>'<button class="chip'+(t===B.theme?' on':'')+'" data-theme="'+t+'">'+
            '<i style="width:13px;height:13px;border-radius:4px;background:linear-gradient(135deg,'+THEMES[t][0]+','+THEMES[t][1]+');display:block"></i>'+t+'</button>').join('')+'</div></div>'+
          '<div class="field"><span class="label">Image ratio</span><div class="row" id="ratioRow">'+
            RATIOS.map(r=>'<button class="chip'+(r===B.ratio?' on':'')+'" data-ratio="'+r+'">'+r+'</button>').join('')+'</div></div>'+
          '<div class="field"><span class="label">Brand assets to include</span><div class="grid g-3" style="gap:9px" id="assetRow">'+
            [['logo','Logo'],['character','Character'],['product','Product'],['uniform','Uniform'],['background','Background']].map(([k,l])=>
            '<label class="check"><input type="checkbox" data-asset="'+k+'"'+(draft.assets[k]?' checked':'')+'><span><b style="font-size:12.5px">'+l+'</b>'+
            '<div class="small muted">'+(B.images[k]||0)+' uploaded</div></span></label>').join('')+'</div></div>'+
        '</div></div>'+

        '<div class="card"><div class="card-head"><div><h3>4 · Keywords</h3><p>Saved keywords from your Keyword Planner get woven into the caption</p></div>'+
          '<a href="#/keywords" class="btn btn-ghost btn-sm">Planner</a></div>'+
        '<div class="card-body"><div class="row" id="kwRow">'+
          (S.keywords.length? S.keywords.map(k=>'<button class="chip" data-kw="'+fmt.esc(k.kw)+'">'+Icon('key')+fmt.esc(k.kw)+
            '<span class="small muted">'+fmt.compact(k.vol)+'/mo</span></button>').join('')
           : '<span class="muted small">No saved keywords yet — <a href="#/keywords" style="color:var(--lemon-ink);font-weight:600">find some</a>.</span>')+
        '</div></div></div>'+

        '<div class="card"><div class="card-head"><div><h3>5 · Publish</h3></div></div><div class="card-body">'+
          '<div class="row" id="schedRow"><button class="chip on" data-s="now">'+Icon('zap')+'Publish now</button>'+
          '<button class="chip" data-s="schedule">'+Icon('calendar')+'Schedule</button>'+
          '<button class="chip" data-s="approval">'+Icon('shield')+'Send for approval</button></div>'+
          '<div id="schedWhen" style="display:none;margin-top:12px"><input type="datetime-local" class="input" id="schedInput"></div>'+
          '<div class="row" style="margin-top:16px"><button class="btn btn-primary btn-lg" id="deployBtn">'+Icon('rocket')+'Deploy post</button>'+
          '<span class="small muted">Costs <b>20 credits</b> per platform</span></div>'+
        '</div></div>'+
      '</div>'+

      '<div class="stack">'+
        '<div class="card" style="position:sticky;top:82px"><div class="card-head"><div><h3>AI preview</h3><p>Live preview of your creative</p></div>'+
          '<button class="icon-btn" id="regen" title="Regenerate">'+Icon('refresh')+'</button></div>'+
        '<div class="card-body"><div id="previewBox"></div>'+
          '<div class="divider"></div>'+
          '<div class="row-between small"><span class="muted">Credits after publish</span><b id="creditAfter">—</b></div>'+
        '</div></div>'+
      '</div></div>';

    return {html, mount(root){
      const pv = ()=>{
        const [c1,c2]=THEMES[draft.theme];
        const ratioCls={'1:1':'','4:5':'r-4-5','16:9':'r-16-9','9:16':'r-9-16'}[draft.ratio];
        const cap = draft.caption || draft.prompt || 'Your Magic Post headline appears here';
        root.querySelector('#previewBox').innerHTML =
          '<div class="post-preview"><div class="post-media '+ratioCls+'" style="background:linear-gradient(150deg,'+c1+' 0%,'+c2+' 60%,#0F172B 100%)">'+
          '<div class="glow"></div><div class="cap">'+fmt.esc(cap.split('.')[0].slice(0,70))+'</div>'+
          (draft.assets.logo?'<span style="position:absolute;top:12px;left:12px;background:#fff;color:#0F172B;font-family:var(--font-h);font-weight:800;font-size:12px;padding:4px 9px;border-radius:7px">'+fmt.initials(Store.biz.name)+'</span>':'')+
          '<span class="wm">Made with Limbu AI</span></div>'+
          '<div class="post-foot"><p>'+fmt.esc(draft.caption||'Caption will be generated by AI…')+'</p>'+
          '<div class="row" style="gap:5px;margin-top:9px">'+draft.keywords.map(k=>'<span class="badge badge-slate">#'+fmt.esc(k.replace(/\s+/g,''))+'</span>').join('')+'</div>'+
          '</div></div>';
        root.querySelector('#creditAfter').textContent = fmt.n(Math.max(0,Store.state.user.credits - draft.platforms.length*20));
      };

      const modeBody=()=>{
        root.querySelector('#modeBody').innerHTML = draft.mode==='auto'
          ? '<div class="field"><span class="label">What should this post be about? <span class="req">*</span></span>'+
            '<div style="position:relative"><textarea class="textarea" id="promptIn" placeholder="e.g. Monsoon offer — full dental check-up and cleaning at ₹499, valid till 30th">'+fmt.esc(draft.prompt)+'</textarea>'+
            '<button class="icon-btn" id="micBtn" title="Voice input" style="position:absolute;right:8px;bottom:8px">'+Icon('mic')+'</button></div>'+
            '<div class="hint">Tip: mention the offer, the audience and the deadline for the best results.</div></div>'+
            '<div class="row-between"><div class="segment" id="langSeg"><button class="on" data-l="en">English</button><button data-l="hi">हिन्दी</button></div>'+
            '<button class="btn btn-dark" id="genBtn">'+Icon('sparkles')+'Generate with AI</button></div>'+
            '<div id="genOut" style="margin-top:14px"></div>'
          : '<div class="grid g-2" style="gap:12px"><label class="check" style="flex-direction:column;align-items:center;padding:26px;text-align:center;cursor:pointer" id="upImg">'+
            Icon('image')+'<b style="font-size:13px;margin-top:8px">Upload image</b><span class="small muted">JPG / PNG up to 8MB</span></label>'+
            '<label class="check" style="flex-direction:column;align-items:center;padding:26px;text-align:center;cursor:pointer" id="upVid">'+
            Icon('video')+'<b style="font-size:13px;margin-top:8px">Upload video</b><span class="small muted">MP4 up to 60s</span></label></div>'+
            '<div class="field mt-16"><span class="label">Caption</span><textarea class="textarea" id="manualCap" placeholder="Write your caption…">'+fmt.esc(draft.caption)+'</textarea></div>';
        LimbuNav.hydrateIcons(root.querySelector('#modeBody'));
        const p=root.querySelector('#promptIn');
        if(p) p.oninput=e=>{draft.prompt=e.target.value;pv();};
        const mc=root.querySelector('#manualCap');
        if(mc) mc.oninput=e=>{draft.caption=e.target.value;pv();};
        const mic=root.querySelector('#micBtn');
        if(mic) mic.onclick=()=>toast('Listening…','Voice input captures your prompt in English or Hindi','');
        $$('#upImg,#upVid',root).forEach(el=>el.onclick=()=>toast('Upload ready','File picker opens here in the production build',''));
        const lg=root.querySelector('#langSeg');
        if(lg) $$('button',lg).forEach(b=>b.onclick=()=>{$$('button',lg).forEach(x=>x.classList.remove('on'));b.classList.add('on');draft.lang=b.dataset.l;});
        const gen=root.querySelector('#genBtn');
        if(gen) gen.onclick=e=>{
          if(!draft.prompt.trim()) return toast('Add a prompt first','Tell Limbu what the post is about','err');
          if(Store.state.user.credits < 30) return toast('Not enough credits','Recharge your wallet to generate','err');
          work(e.currentTarget, 1500, ()=>{
            Store.spend(30,'AI post generation');
            draft.caption = generateCaption(draft);
            root.querySelector('#genOut').innerHTML =
              '<div class="card card-pad" style="border-color:var(--lemon)"><div class="row-between mb-16">'+
              '<b style="font-size:13px">'+Icon('sparkles').replace('<svg','<svg style="width:14px;height:14px;display:inline;vertical-align:-2px;color:var(--lemon-hover)"')+' AI generated caption</b>'+
              '<button class="btn btn-sm btn-ghost" id="regenCap">Regenerate</button></div>'+
              '<textarea class="textarea" id="capEdit">'+fmt.esc(draft.caption)+'</textarea></div>';
            root.querySelector('#capEdit').oninput=ev=>{draft.caption=ev.target.value;pv();};
            root.querySelector('#regenCap').onclick=ev=>work(ev.currentTarget,900,()=>{
              draft.caption=generateCaption(draft); root.querySelector('#capEdit').value=draft.caption; pv(); });
            pv(); toast('Caption + image generated','30 credits used','ok'); LimbuNav.syncChrome();
          });
        };
      };

      $$('#platRow .chip',root).forEach(c=>c.onclick=()=>{
        c.classList.toggle('on');
        draft.platforms = $$('#platRow .chip.on',root).map(x=>x.dataset.plat); pv();
      });
      $$('#modeSeg button',root).forEach(b=>b.onclick=()=>{
        $$('#modeSeg button',root).forEach(x=>x.classList.remove('on')); b.classList.add('on'); draft.mode=b.dataset.m; modeBody(); pv();
      });
      $$('#themeRow .chip',root).forEach(c=>c.onclick=()=>{
        $$('#themeRow .chip',root).forEach(x=>x.classList.remove('on')); c.classList.add('on'); draft.theme=c.dataset.theme; pv();
      });
      $$('#ratioRow .chip',root).forEach(c=>c.onclick=()=>{
        $$('#ratioRow .chip',root).forEach(x=>x.classList.remove('on')); c.classList.add('on'); draft.ratio=c.dataset.ratio; pv();
      });
      $$('#assetRow input',root).forEach(i=>i.onchange=()=>{draft.assets[i.dataset.asset]=i.checked;pv();});
      $$('#kwRow .chip',root).forEach(c=>c.onclick=()=>{
        c.classList.toggle('on'); draft.keywords=$$('#kwRow .chip.on',root).map(x=>x.dataset.kw); pv();
      });
      $$('#schedRow .chip',root).forEach(c=>c.onclick=()=>{
        $$('#schedRow .chip',root).forEach(x=>x.classList.remove('on')); c.classList.add('on'); draft.schedule=c.dataset.s;
        root.querySelector('#schedWhen').style.display = c.dataset.s==='schedule'?'block':'none';
      });
      root.querySelector('#regen').onclick=e=>work(e.currentTarget,700,()=>{draft.caption=generateCaption(draft);pv();});

      root.querySelector('#deployBtn').onclick=e=>{
        if(!draft.platforms.length) return toast('Pick a platform','Select at least one destination','err');
        if(!draft.caption && !draft.prompt) return toast('Nothing to publish','Generate or write a caption first','err');
        const cost = draft.platforms.length*20;
        if(!Store.state.user.credits || Store.state.user.credits<cost) return toast('Not enough credits','Recharge your wallet','err');
        work(e.currentTarget, 1600, ()=>{
          Store.spend(cost,'Post publishing ×'+draft.platforms.length);
          Store.state.posts.unshift({
            id:Store.util.uid('post'), caption:draft.caption||draft.prompt, platforms:draft.platforms.slice(),
            status: draft.schedule==='now'?'posted':draft.schedule==='schedule'?'scheduled':'pending',
            type: draft.mode==='manual'?'image':'image', ratio:draft.ratio, theme:draft.theme,
            keywords:draft.keywords.slice(), mode:draft.mode, bizId:Store.state.activeBiz,
            createdAt:new Date().toISOString(), scheduledAt:new Date().toISOString(),
            stats:{views:0,likes:0,clicks:0}
          });
          Store.save(); LimbuNav.renderNav();
          toast(draft.schedule==='now'?'Post published 🎉':'Post queued', draft.platforms.join(', ')+' • '+cost+' credits used','ok');
          location.hash='#/posts';
        });
      };

      if(window.matchMedia('(max-width:1100px)').matches) root.querySelector('#cmpCols').style.gridTemplateColumns='1fr';
      modeBody(); pv(); LimbuNav.hydrateIcons(root);
    }};
  }

  function generateCaption(draft){
    const b=Store.biz, kw=draft.keywords[0]||'dentist near me';
    const openers=['✨','🦷','🔥','📍','💛'];
    const hi = draft.lang==='hi';
    const base = hi
      ? Store.util.pick([
          'अब '+b.loc.split(',')[0]+' में दर्द-रहित इलाज! आज ही अपॉइंटमेंट बुक करें।',
          'आपकी मुस्कान हमारी ज़िम्मेदारी — '+b.name+' पर विशेष ऑफर।',
          'सिर्फ इस हफ्ते: फुल डेंटल चेक-अप ₹499 में।'])
      : Store.util.pick(Store.seeds.CAPTIONS);
    const prompt = draft.prompt ? draft.prompt.trim().replace(/\.$/,'')+'. ' : '';
    return Store.util.pick(openers)+' '+prompt+base+
      '\n\n📍 '+b.name+', '+b.loc+'\n📞 '+b.phone+
      '\n\n#'+kw.replace(/\s+/g,'')+' #'+b.city+' #LimbuAI';
  }
})();
