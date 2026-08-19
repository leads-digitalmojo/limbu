/* Limbu AI — My Profile, Wallet, Settings, Subscription */
(function(){
  window.Views=window.Views||{};
  const {fmt,pageHead,$,$$,toast,work,modal,closeModal,statCard,donut,barChart,series,lastDays,empty,confirmDialog}=UI;

  /* ================= MY PROFILE ================= */
  Views.profile=function(){
    const S=Store.state,u=S.user;
    const stats={approved:S.posts.filter(p=>p.status==='approved').length,
      pending:S.posts.filter(p=>p.status==='pending').length,
      scheduled:S.posts.filter(p=>p.status==='scheduled').length,
      posted:S.posts.filter(p=>p.status==='posted').length};
    const imgs=S.posts.length*3+Store.util.rand(20,60);

    const html=pageHead({eyebrow:'Account',eyebrowIcon:'user',title:'My Profile',
      sub:'Your account, membership, credits and everything Limbu has created for you.',
      actions:'<button class="btn btn-outline" id="prEdit">'+Icon('edit')+'Edit profile</button>'+
              '<a class="btn btn-primary" href="#/wallet">'+Icon('coin')+'Recharge</a>'})+

      '<div class="grid" style="grid-template-columns:340px 1fr" id="prCols"><div class="stack">'+
        '<div class="card card-pad" style="text-align:center">'+
          '<div class="brand-mark" style="width:72px;height:72px;font-size:32px;border-radius:22px;margin:0 auto 14px">'+fmt.initials(u.name)+'</div>'+
          '<h3 style="font-size:17px">'+fmt.esc(u.name)+'</h3>'+
          '<div class="row" style="justify-content:center;margin:7px 0 12px">'+
            '<span class="badge badge-lemon">'+Icon('crown')+u.plan+'</span>'+
            (u.verified?'<span class="badge badge-green">'+Icon('checkCircle')+'Verified</span>':'')+'</div>'+
          '<div class="stack" style="gap:9px;text-align:left">'+
            [['mail',u.email],['phone',u.phone],['building',Store.biz.name],['calendar','Member since '+u.memberSince]].map(([i,v])=>
            '<div class="row" style="gap:9px;flex-wrap:nowrap"><span style="color:var(--muted);display:flex">'+
            Icon(i).replace('<svg','<svg style="width:15px;height:15px"')+'</span><span class="small">'+fmt.esc(v)+'</span></div>').join('')+
          '</div></div>'+

        '<div class="card"><div class="card-head"><div><h3>Credits</h3></div></div><div class="card-body" style="text-align:center">'+
          donut(u.credits,u.creditCap,'#EAB308','of '+fmt.n(u.creditCap))+
          '<a class="btn btn-primary btn-block mt-16" href="#/wallet">'+Icon('coin')+'Recharge wallet</a></div></div>'+

        '<div class="card"><div class="card-head"><div><h3>Membership</h3></div></div><div class="card-body stack" style="gap:11px">'+
          [['Plan',u.plan],['Billing cycle','Monthly'],['Renews on',u.renews],['Access expires',u.renews],['Locations',S.businesses.length+' of 5']].map(([k,v])=>
          '<div class="row-between"><span class="small muted">'+k+'</span><b class="small">'+fmt.esc(String(v))+'</b></div>').join('')+
          '<a class="btn btn-outline btn-block" href="#/pricing">'+Icon('crown')+'Upgrade plan</a></div></div>'+
      '</div>'+

      '<div class="stack">'+
        '<div class="grid g-4">'+
          statCard({icon:'checkCircle',tone:'green',value:stats.approved+stats.posted,label:'Approved & published'})+
          statCard({icon:'clock',value:stats.pending,label:'Pending approval'})+
          statCard({icon:'calendar',tone:'blue',value:stats.scheduled,label:'Scheduled'})+
          statCard({icon:'image',tone:'pink',value:fmt.n(imgs),label:'AI images generated',delta:46})+
        '</div>'+

        '<div class="card"><div class="card-head"><div><h3>Daily activity</h3><p>Your content output over the last 14 days</p></div></div>'+
        '<div class="card-body">'+barChart(series(14,4,4),lastDays(14).map(d=>d.split(' ')[0]),'#EAB308',200)+'</div></div>'+

        '<div class="card"><div class="card-head"><div><h3>Asset statistics</h3></div></div><div class="card-body">'+
          '<div class="grid g-4" style="gap:12px">'+
          [['Brand images',Object.values(S.brand.images).reduce((a,c)=>a+c,0),'image'],
           ['Products',S.brand.products.length,'tag'],
           ['Saved keywords',S.keywords.length,'key'],
           ['Saved audits',S.audits.length,'map']].map(([l,v,i])=>
          '<div class="card card-pad" style="text-align:center;padding:15px">'+
          '<span class="stat-icon" style="margin:0 auto 8px">'+Icon(i)+'</span>'+
          '<div style="font-family:var(--font-h);font-size:20px;font-weight:800">'+v+'</div>'+
          '<div class="small muted">'+l+'</div></div>').join('')+'</div></div></div>'+

        '<div class="card"><div class="card-head"><div><h3>Transaction history</h3></div></div>'+
        '<div class="table-wrap"><table class="tbl"><thead><tr><th>Description</th><th>Reference</th><th>Date</th><th style="text-align:right">Amount</th></tr></thead><tbody>'+
        S.transactions.slice(0,7).map(t=>'<tr><td><b style="font-size:12.5px">'+fmt.esc(t.label)+'</b></td>'+
        '<td class="small muted mono">'+t.ref+'</td><td class="small muted">'+fmt.date(t.at)+'</td>'+
        '<td style="text-align:right"><b class="num" style="color:'+(t.amount>0?'var(--emerald)':'var(--red)')+'">'+
        (t.amount>0?'+':'')+fmt.n(t.amount)+'</b></td></tr>').join('')+'</tbody></table></div>'+
        '<div class="card-foot"><a class="btn btn-ghost btn-sm" href="#/wallet">View all transactions '+Icon('chevronR')+'</a></div></div>'+
      '</div></div>';

    return {html,mount(root){
      root.querySelector('#prEdit').onclick=()=>{
        modal({title:'Edit profile',body:
          '<div class="field"><span class="label">Full name</span><input class="input" id="pfName" value="'+fmt.esc(u.name)+'"></div>'+
          '<div class="field"><span class="label">Email</span><input class="input" id="pfMail" value="'+fmt.esc(u.email)+'"></div>'+
          '<div class="field"><span class="label">Phone</span><input class="input" id="pfPhone" value="'+fmt.esc(u.phone)+'"></div>',
          foot:'<button class="btn btn-ghost" data-action="close-modal">Cancel</button><button class="btn btn-primary" id="pfSave">Save changes</button>'});
        $('#pfSave').onclick=()=>{
          u.name=$('#pfName').value;u.email=$('#pfMail').value;u.phone=$('#pfPhone').value;
          Store.save();closeModal();toast('Profile updated','','ok');location.hash='#/profile';};
      };
      if(window.matchMedia('(max-width:1000px)').matches) root.querySelector('#prCols').style.gridTemplateColumns='1fr';
      LimbuNav.hydrateIcons(root);
    }};
  };

  /* ================= WALLET ================= */
  const PACKS=[{amt:200,bonus:0},{amt:500,bonus:25},{amt:1000,bonus:100},{amt:2500,bonus:325},
               {amt:5000,bonus:750},{amt:10000,bonus:2000},{amt:25000,bonus:6250},{amt:50000,bonus:15000}];

  Views.wallet=function(){
    const S=Store.state,u=S.user;
    const html=pageHead({eyebrow:'Billing',eyebrowIcon:'wallet',title:'Wallet',
      sub:'Credits power AI generation, publishing, review replies and rank audits.',
      actions:'<button class="btn btn-outline" id="wlInvoice">'+Icon('file')+'Download invoices</button>'})+

      '<div class="grid" style="grid-template-columns:1fr 380px" id="wlCols"><div class="stack">'+
        '<div class="card"><div class="card-head"><div><h3>Recharge your wallet</h3><p>Bigger packs carry bigger bonuses</p></div></div>'+
        '<div class="card-body"><div class="grid g-4" style="gap:12px" id="wlPacks">'+
          PACKS.map((p,i)=>'<div class="card card-hover card-pad" data-amt="'+p.amt+'" data-bonus="'+p.bonus+'" style="text-align:center;position:relative'+(i===4?';border-color:var(--lemon)':'')+'">'+
            (p.bonus?'<span class="badge badge-lemon" style="position:absolute;top:-9px;left:50%;transform:translateX(-50%);font-size:9.5px">+'+fmt.n(p.bonus)+' bonus</span>':'')+
            '<div style="font-family:var(--font-h);font-size:20px;font-weight:800;margin-top:'+(p.bonus?'6px':'0')+'">'+fmt.inr(p.amt)+'</div>'+
            '<div class="small muted">'+fmt.n(p.amt+p.bonus)+' credits</div></div>').join('')+
        '</div>'+
        '<div class="divider"></div>'+
        '<div class="grid g-2" style="gap:14px">'+
          '<div class="field" style="margin:0"><span class="label">Custom amount</span>'+
          '<input class="input" id="wlCustom" type="number" min="100" placeholder="Enter amount (min ₹100)"></div>'+
          '<div class="field" style="margin:0"><span class="label">GST number (optional)</span>'+
          '<input class="input" id="wlGst" placeholder="27AABCU9603R1ZX"></div>'+
        '</div></div></div>'+

        '<div class="card"><div class="card-head"><div><h3>Transaction history</h3><p>All credits and debits on this account</p></div>'+
          '<div class="segment" id="wlFilter"><button class="on" data-f="">All</button><button data-f="credit">Credits</button><button data-f="debit">Debits</button></div></div>'+
        '<div class="table-wrap"><table class="tbl"><thead><tr><th>Description</th><th>Type</th><th>Reference</th><th>Date</th><th style="text-align:right">Amount</th></tr></thead>'+
        '<tbody id="wlBody"></tbody></table></div></div>'+
      '</div>'+

      '<div class="stack">'+
        '<div class="card" style="position:sticky;top:82px"><div class="card-head"><div><h3>Order summary</h3></div></div>'+
        '<div class="card-body">'+
          '<div class="credit-card" style="margin-bottom:16px"><div class="credit-label">Current balance</div>'+
          '<div class="credit-value">'+fmt.n(u.credits)+'</div>'+
          '<div class="small" style="color:#94A3B8">credits available</div></div>'+
          '<div class="stack" style="gap:9px">'+
            '<div class="row-between"><span class="small muted">Recharge amount</span><b class="small" id="sumAmt">₹0</b></div>'+
            '<div class="row-between"><span class="small muted">Bonus credits</span><b class="small" style="color:var(--emerald)" id="sumBonus">+0</b></div>'+
            '<div class="row-between"><span class="small muted">GST (18%)</span><b class="small" id="sumGst">₹0</b></div>'+
            '<div class="divider" style="margin:6px 0"></div>'+
            '<div class="row-between"><b>Total payable</b><b style="font-family:var(--font-h);font-size:19px" id="sumTotal">₹0</b></div>'+
            '<div class="row-between"><span class="small muted">Credits you receive</span><b class="small" id="sumCredits">0</b></div>'+
          '</div>'+
          '<button class="btn btn-primary btn-block btn-lg mt-16" id="wlPay">'+Icon('card')+'Pay with Razorpay</button>'+
          '<p class="small muted" style="text-align:center;margin:10px 0 0">'+Icon('lock').replace('<svg','<svg style="width:12px;height:12px;display:inline;vertical-align:-2px"')+' Secured by Razorpay • UPI, cards, netbanking</p>'+
        '</div></div>'+

        '<div class="card"><div class="card-head"><div><h3>What credits cost</h3></div></div><div class="card-body stack" style="gap:8px">'+
          [['AI post generation',30],['Publishing per platform',20],['AI review reply',5],
           ['Rank audit 5×5',350],['Website generation',500],['AI image',20]].map(([l,c])=>
          '<div class="row-between"><span class="small">'+l+'</span><b class="small mono">'+c+'</b></div>').join('')+
        '</div></div>'+
      '</div></div>';

    return {html,mount(root){
      let amt=0,bonus=0;
      const sum=()=>{
        const gst=Math.round(amt*0.18);
        root.querySelector('#sumAmt').textContent=fmt.inr(amt);
        root.querySelector('#sumBonus').textContent='+'+fmt.n(bonus);
        root.querySelector('#sumGst').textContent=fmt.inr(gst);
        root.querySelector('#sumTotal').textContent=fmt.inr(amt+gst);
        root.querySelector('#sumCredits').textContent=fmt.n(amt+bonus);
      };
      $$('#wlPacks [data-amt]',root).forEach(c=>c.onclick=()=>{
        $$('#wlPacks [data-amt]',root).forEach(x=>x.style.borderColor='');
        c.style.borderColor='var(--lemon)';amt=+c.dataset.amt;bonus=+c.dataset.bonus;
        root.querySelector('#wlCustom').value='';sum();});
      root.querySelector('#wlCustom').oninput=e=>{
        $$('#wlPacks [data-amt]',root).forEach(x=>x.style.borderColor='');
        amt=+e.target.value||0;bonus=Math.floor(amt*0.15);sum();};
      root.querySelector('#wlPay').onclick=e=>{
        if(amt<100) return toast('Choose an amount','Minimum recharge is ₹100','err');
        work(e.currentTarget,2000,()=>{
          Store.topup(amt,bonus,'Wallet recharge — Razorpay');
          toast('Payment successful 🎉',fmt.n(amt+bonus)+' credits added','ok');
          location.hash='#/wallet';});
      };
      let f='';
      const draw=()=>{
        const items=Store.state.transactions.filter(t=>!f||t.type===f);
        root.querySelector('#wlBody').innerHTML=items.length?items.map(t=>
          '<tr><td><b style="font-size:12.5px">'+fmt.esc(t.label)+'</b></td>'+
          '<td><span class="badge '+(t.type==='credit'?'badge-green':'badge-slate')+'">'+t.type+'</span></td>'+
          '<td class="small muted mono">'+t.ref+'</td><td class="small muted">'+fmt.date(t.at)+'</td>'+
          '<td style="text-align:right"><b class="num" style="color:'+(t.amount>0?'var(--emerald)':'var(--red)')+'">'+
          (t.amount>0?'+':'')+fmt.n(t.amount)+'</b></td></tr>').join('')
          :'<tr><td colspan="5">'+empty('card','No transactions','Recharge your wallet to see activity here.')+'</td></tr>';
      };
      $$('#wlFilter button',root).forEach(b=>b.onclick=()=>{
        $$('#wlFilter button',root).forEach(x=>x.classList.remove('on'));b.classList.add('on');f=b.dataset.f;draw();});
      root.querySelector('#wlInvoice').onclick=e=>work(e.currentTarget,900,()=>toast('Invoices downloaded','limbu-invoices.zip','ok'));
      if(window.matchMedia('(max-width:1050px)').matches) root.querySelector('#wlCols').style.gridTemplateColumns='1fr';
      draw();sum();LimbuNav.hydrateIcons(root);
    }};
  };

  /* ================= SETTINGS ================= */
  Views.settings=function(){
    const S=Store.state;
    const T=(k,t,d)=>'<div class="row-between" style="padding:13px 0;border-bottom:1px solid var(--line-2);flex-wrap:nowrap;gap:12px">'+
      '<div><b style="font-size:13px">'+t+'</b><div class="small muted">'+d+'</div></div>'+
      '<button class="switch'+(S.settings[k]?' on':'')+'" data-set="'+k+'"></button></div>';

    const html=pageHead({eyebrow:'Configuration',eyebrowIcon:'settings',title:'Settings',
      sub:'Control how Limbu behaves on your account.'})+
      '<div class="grid g-2" id="stCols">'+
        '<div class="stack">'+
          '<div class="card"><div class="card-head"><div><h3>Automation</h3></div></div><div class="card-body">'+
            T('autoPost','Auto Post','Limbu plans and publishes a weekly content calendar on its own')+
            T('autoReply','Auto-reply to reviews','AI drafts and posts replies to new Google reviews')+
            T('adminApproval','Admin approval','Content and replies wait for your approval before going live')+
          '</div></div>'+
          '<div class="card"><div class="card-head"><div><h3>Notifications</h3></div></div><div class="card-body">'+
            T('notifyEmail','Email notifications','Daily activity summary and lead alerts')+
            T('notifyWhatsapp','WhatsApp notifications','Instant alerts for new leads and reviews')+
          '</div></div>'+
          '<div class="card"><div class="card-head"><div><h3>Language</h3></div></div><div class="card-body">'+
            '<div class="field" style="margin:0"><span class="label">Content generation language</span>'+
            '<select class="select" id="stLang"><option value="en"'+(S.settings.lang==='en'?' selected':'')+'>English</option>'+
            '<option value="hi"'+(S.settings.lang==='hi'?' selected':'')+'>हिन्दी (Hindi)</option>'+
            '<option value="mr">मराठी (Marathi)</option><option value="ta">தமிழ் (Tamil)</option></select></div>'+
          '</div></div>'+
        '</div>'+
        '<div class="stack">'+
          '<div class="card"><div class="card-head"><div><h3>Security</h3></div></div><div class="card-body">'+
            T('passkey','Passkey authentication','Sign in with Face ID, Touch ID or a security key')+
            '<div class="row" style="margin-top:14px;gap:8px"><button class="btn btn-outline btn-sm" id="stPass">'+Icon('lock')+'Change password</button>'+
            '<button class="btn btn-outline btn-sm" id="stKey">'+Icon('key')+'Add passkey</button></div>'+
          '</div></div>'+
          '<div class="card"><div class="card-head"><div><h3>Appearance</h3></div></div><div class="card-body">'+
            '<div class="row-between"><div><b style="font-size:13px">Theme</b><div class="small muted">Light or dark interface</div></div>'+
            '<div class="segment" id="stTheme"><button data-t="light"'+(S.theme!=='dark'?' class="on"':'')+'>Light</button>'+
            '<button data-t="dark"'+(S.theme==='dark'?' class="on"':'')+'>Dark</button></div></div>'+
          '</div></div>'+
          '<div class="card"><div class="card-head"><div><h3>Data</h3></div></div><div class="card-body stack" style="gap:10px">'+
            '<button class="btn btn-outline btn-block" id="stExport">'+Icon('download')+'Export all my data</button>'+
            '<button class="btn btn-outline btn-block" id="stReset">'+Icon('refresh')+'Reset demo data</button>'+
            '<button class="btn btn-danger btn-block" id="stDel">'+Icon('trash')+'Delete account</button>'+
          '</div></div>'+
        '</div></div>';

    return {html,mount(root){
      $$('[data-set]',root).forEach(b=>b.onclick=()=>{
        const k=b.dataset.set;S.settings[k]=!S.settings[k];Store.save();b.classList.toggle('on',S.settings[k]);
        toast(S.settings[k]?'Enabled':'Disabled',k,'ok');});
      root.querySelector('#stLang').onchange=e=>{S.settings.lang=e.target.value;Store.save();toast('Language updated','','ok');};
      $$('#stTheme button',root).forEach(b=>b.onclick=()=>{
        document.querySelector('[data-action="toggle-theme"]').click();
        $$('#stTheme button',root).forEach(x=>x.classList.remove('on'));b.classList.add('on');});
      root.querySelector('#stPass').onclick=()=>modal({title:'Change password',body:
        '<div class="field"><span class="label">Current password</span><input class="input" type="password"></div>'+
        '<div class="field"><span class="label">New password</span><input class="input" type="password"></div>'+
        '<div class="field"><span class="label">Confirm new password</span><input class="input" type="password"></div>',
        foot:'<button class="btn btn-ghost" data-action="close-modal">Cancel</button><button class="btn btn-primary" data-action="close-modal">Update password</button>'});
      root.querySelector('#stKey').onclick=()=>toast('Passkey prompt','Your device will ask for Face ID or Touch ID','');
      root.querySelector('#stExport').onclick=e=>work(e.currentTarget,1200,()=>toast('Export ready','limbu-account-data.json','ok'));
      root.querySelector('#stReset').onclick=()=>confirmDialog('Reset demo data?','All posts, reviews, leads and settings return to their starting state.',()=>Store.reset(),'Reset');
      root.querySelector('#stDel').onclick=()=>confirmDialog('Delete your Limbu account?','This permanently removes your data, credits and connected profiles. This cannot be undone.',()=>toast('Request submitted','Our team will confirm within 24 hours','err'),'Delete account');
      LimbuNav.hydrateIcons(root);
    }};
  };

  /* ================= SUBSCRIPTION / PRICING ================= */
  const PLANS=[
    {name:'Basic',price:1499,tag:'For a single location getting started',
      features:['1 Google Business Profile','8 AI posts / month','AI review replies','Magic QR review collection','Keyword Planner','Email support']},
    {name:'Professional',price:3999,featured:true,tag:'Most popular for growing businesses',
      features:['Up to 3 locations','30 AI posts / month','Auto-reply to all reviews','Competitor rank audits (3×3)','Website Builder + lead inbox','Facebook, Instagram & LinkedIn publishing','Priority WhatsApp support']},
    {name:'Premium',price:8999,tag:'For multi-location brands and franchises',
      features:['Up to 10 locations','Unlimited AI posts','5×5 grid rank audits','AI video posts & Shorts','WhatsApp automation','Dedicated account manager','White-label reports']}
  ];
  const SERVICES=[
    {icon:'google',name:'GMB Setup & Verification',price:'₹4,999',desc:'We create, verify and fully optimise your Business Profile.'},
    {icon:'monitor',name:'Website Packages',price:'from ₹14,999',desc:'Custom multi-page website with hosting and lead forms.'},
    {icon:'trend',name:'SEO Packages',price:'from ₹9,999/mo',desc:'On-page, local citations, backlinks and monthly reporting.'},
    {icon:'target',name:'Ads Account Setup',price:'₹6,999',desc:'Google & Meta ads accounts, tracking and first campaign.'},
    {icon:'whatsapp',name:'WhatsApp Automation',price:'₹7,999',desc:'Official WABA, chatbot flows and lead routing.'},
    {icon:'rocket',name:'Done-for-you Growth',price:'Custom',desc:'A dedicated marketing team running everything for you.'}
  ];

  Views.pricing=function(){
    const cur=Store.state.user.plan;
    const html=pageHead({eyebrow:'Plans & services',eyebrowIcon:'crown',title:'Subscription',
      sub:'Simple pricing that costs about 1% of what a marketing agency charges.',
      actions:'<div class="segment" id="pcCycle"><button class="on" data-c="m">Monthly</button><button data-c="y">Yearly · save 20%</button></div>'})+
      '<div class="grid g-3 mb-16" id="pcPlans"></div>'+
      '<div class="card mb-16"><div class="card-head"><div><h3>Add-on services</h3><p>Done-for-you work by the Limbu team</p></div></div>'+
      '<div class="card-body"><div class="grid g-3" style="gap:14px">'+
        SERVICES.map(s=>'<div class="card card-pad card-hover"><div class="row-between" style="align-items:flex-start">'+
          '<span class="stat-icon">'+Icon(s.icon)+'</span><b class="small" style="color:var(--lemon-ink)">'+s.price+'</b></div>'+
          '<b style="display:block;margin-top:11px;font-size:13.5px">'+s.name+'</b>'+
          '<p class="small muted" style="margin:5px 0 12px">'+s.desc+'</p>'+
          '<button class="btn btn-outline btn-sm btn-block" data-svc="'+fmt.esc(s.name)+'">Request callback</button></div>').join('')+
      '</div></div></div>'+
      '<div class="card"><div class="card-head"><div><h3>Compare with the old way</h3></div></div>'+
      '<div class="table-wrap"><table class="tbl"><thead><tr><th></th><th>Old way — agency</th><th>With Limbu AI</th></tr></thead><tbody>'+
        [['Monthly cost','₹40,000 – ₹80,000','₹1,499 – ₹8,999'],
         ['Posts per month','8 – 12','Unlimited'],
         ['Review replies','Next-day, manual','Within minutes, AI'],
         ['Rank tracking','Quarterly spreadsheet','Live 5×5 map grid'],
         ['Website','₹50,000+ and 6 weeks','Generated in minutes'],
         ['Reporting','PDF once a month','Live dashboard 24×7']].map(r=>
        '<tr><td><b style="font-size:12.5px">'+r[0]+'</b></td>'+
        '<td class="small muted">'+r[1]+'</td>'+
        '<td><span class="badge badge-green">'+Icon('check')+r[2]+'</span></td></tr>').join('')+
      '</tbody></table></div></div>';

    return {html,mount(root){
      let yearly=false;
      const draw=()=>{
        root.querySelector('#pcPlans').innerHTML=PLANS.map(p=>{
          const price=yearly?Math.round(p.price*12*0.8):p.price;
          return '<div class="plan'+(p.featured?' featured':'')+'">'+
            (p.featured?'<span class="ribbon">Most popular</span>':'')+
            '<b style="font-family:var(--font-h);font-size:16px">'+p.name+'</b>'+
            '<p class="small muted" style="margin:4px 0 12px">'+p.tag+'</p>'+
            '<div class="price">₹'+fmt.n(price)+'<small>/'+(yearly?'year':'month')+'</small></div>'+
            (yearly?'<div class="small" style="color:var(--emerald);font-weight:600">Save ₹'+fmt.n(p.price*12-price)+' a year</div>':'')+
            '<ul>'+p.features.map(f=>'<li>'+Icon('check')+'<span>'+f+'</span></li>').join('')+'</ul>'+
            (p.name===cur?'<button class="btn btn-outline btn-block" disabled>'+Icon('checkCircle')+'Current plan</button>'
              :'<button class="btn '+(p.featured?'btn-primary':'btn-dark')+' btn-block" data-plan="'+p.name+'">'+
               (PLANS.findIndex(x=>x.name===p.name)>PLANS.findIndex(x=>x.name===cur)?'Upgrade to '+p.name:'Switch to '+p.name)+'</button>')+
            '</div>';
        }).join('');
        LimbuNav.hydrateIcons(root.querySelector('#pcPlans'));
        $$('[data-plan]',root).forEach(b=>b.onclick=()=>confirmDialog('Switch to '+b.dataset.plan+'?',
          'Your new plan starts immediately and is billed on your next cycle.',()=>{
            Store.state.user.plan=b.dataset.plan;Store.save();LimbuNav.syncChrome();
            toast('Plan updated','You are now on '+b.dataset.plan,'ok');location.hash='#/pricing';},'Confirm switch'));
      };
      $$('#pcCycle button',root).forEach(b=>b.onclick=()=>{
        $$('#pcCycle button',root).forEach(x=>x.classList.remove('on'));b.classList.add('on');yearly=b.dataset.c==='y';draw();});
      $$('[data-svc]',root).forEach(b=>b.onclick=()=>modal({title:'Request a callback',
        body:'<p class="small muted" style="margin-top:0">Our team will call you about <b>'+fmt.esc(b.dataset.svc)+'</b>.</p>'+
        '<div class="field"><span class="label">Phone</span><input class="input" value="'+fmt.esc(Store.state.user.phone)+'"></div>'+
        '<div class="field"><span class="label">Preferred time</span><select class="select"><option>Morning (10am–1pm)</option><option>Afternoon (1pm–5pm)</option><option>Evening (5pm–8pm)</option></select></div>',
        foot:'<button class="btn btn-ghost" data-action="close-modal">Cancel</button><button class="btn btn-primary" id="svcGo">Request callback</button>'})
        && ($('#svcGo').onclick=()=>{closeModal();toast('Callback requested','Our team will reach you today','ok');}));
      draw();LimbuNav.hydrateIcons(root);
    }};
  };
})();
