/* Limbu AI — Magic QR */
(function(){
  window.Views=window.Views||{};
  const {fmt,pageHead,$,$$,toast,work,statCard,stars,modal,closeModal}=UI;

  Views['magic-qr']=function(){
    const S=Store.state,b=Store.biz;
    const url='https://limbu.link/r/'+S.qr.slug;

    const html=pageHead({eyebrow:'Review collection',eyebrowIcon:'qr',title:'Magic QR',
      sub:'Print one QR code. Happy customers go straight to Google, unhappy ones reach you privately first.',
      actions:'<button class="btn btn-outline" id="qrCopy">'+Icon('copy')+'Copy link</button>'+
              '<button class="btn btn-primary" id="qrDl">'+Icon('download')+'Download QR</button>'})+
      '<div class="grid g-4 mb-16">'+
        statCard({icon:'qr',value:fmt.n(S.qr.scans),label:'Total scans',delta:31})+
        statCard({icon:'star',tone:'green',value:fmt.n(S.qr.reviewsCollected),label:'Reviews collected',delta:24})+
        statCard({icon:'percent',tone:'blue',value:Math.round(S.qr.reviewsCollected/Math.max(1,S.qr.scans)*100)+'%',label:'Scan → review rate'})+
        statCard({icon:'shield',tone:'orange',value:fmt.n(Math.round(S.qr.scans*0.09)),label:'Negative feedback caught privately'})+
      '</div>'+
      '<div class="grid" style="grid-template-columns:360px 1fr" id="qrCols">'+
        '<div class="card"><div class="card-head"><div><h3>Your Magic QR</h3><p>'+fmt.esc(b.name)+'</p></div></div>'+
        '<div class="card-body" style="text-align:center">'+
          '<div id="qrBox" style="display:inline-block;padding:16px;background:#fff;border-radius:18px;border:1px solid var(--line)">'+qrSvg(url)+'</div>'+
          '<div class="small muted" style="margin-top:12px;word-break:break-all">'+url+'</div>'+
          '<div class="row" style="justify-content:center;margin-top:14px">'+
            '<button class="btn btn-outline btn-sm" id="qrPrint">'+Icon('file')+'Print poster</button>'+
            '<button class="btn btn-outline btn-sm" id="qrShare">'+Icon('share')+'Share</button></div>'+
        '</div></div>'+

        '<div class="stack">'+
          '<div class="card"><div class="card-head"><div><h3>Review routing</h3><p>How Limbu handles each rating</p></div></div>'+
          '<div class="card-body">'+
            '<div class="grid g-2" style="gap:14px">'+
              flow('star','Rated '+S.qr.threshold+'★ or above','Customer is sent straight to your Google review page to publish it.','green')+
              flow('shield','Rated below '+S.qr.threshold+'★','Feedback comes to you privately as a lead — no public damage.','orange')+
            '</div>'+
            '<div class="field mt-24"><span class="label">Google review threshold</span>'+
            '<input type="range" class="range" id="qrThresh" min="3" max="5" value="'+S.qr.threshold+'">'+
            '<div class="hint">Currently routing <b id="threshLbl">'+S.qr.threshold+'★ and above</b> to Google.</div></div>'+
            '<div class="field"><span class="label">QR link slug</span>'+
            '<input class="input" id="qrSlug" value="'+fmt.esc(S.qr.slug)+'"><div class="hint">limbu.link/r/<b>'+fmt.esc(S.qr.slug)+'</b></div></div>'+
            '<button class="btn btn-primary" id="qrSave">'+Icon('check')+'Save settings</button>'+
          '</div></div>'+

          '<div class="card"><div class="card-head"><div><h3>Customer reviews via QR</h3><p>Latest feedback collected through the code</p></div></div>'+
          '<div class="card-body stack" style="gap:12px">'+
            Store.state.reviews.slice(0,4).map(r=>'<div class="row" style="gap:11px;flex-wrap:nowrap;align-items:flex-start">'+
              '<div class="avatar-sm">'+fmt.initials(r.author)+'</div><div style="flex:1">'+
              '<div class="row" style="gap:8px"><b style="font-size:13px">'+fmt.esc(r.author)+'</b>'+stars(r.rating)+'</div>'+
              '<div class="small muted">'+fmt.esc(r.text.slice(0,88))+'…</div></div>'+
              '<span class="badge '+(r.rating>=4?'badge-green':'badge-amber')+'">'+(r.rating>=4?'→ Google':'→ Private')+'</span></div>').join('')+
          '</div></div>'+
        '</div></div>';

    return {html,mount(root){
      root.querySelector('#qrThresh').oninput=e=>root.querySelector('#threshLbl').textContent=e.target.value+'★ and above';
      root.querySelector('#qrSave').onclick=e=>work(e.currentTarget,700,()=>{
        Store.state.qr.threshold=+root.querySelector('#qrThresh').value;
        Store.state.qr.slug=root.querySelector('#qrSlug').value.trim()||Store.state.qr.slug;
        Store.save(); toast('Magic QR updated','','ok'); location.hash='#/magic-qr';
      });
      root.querySelector('#qrCopy').onclick=()=>{ navigator.clipboard&&navigator.clipboard.writeText(url); toast('Link copied',url,'ok'); };
      root.querySelector('#qrDl').onclick=e=>work(e.currentTarget,800,()=>toast('QR downloaded','magic-qr-'+Store.state.qr.slug+'.png','ok'));
      root.querySelector('#qrPrint').onclick=()=>window.print();
      root.querySelector('#qrShare').onclick=()=>toast('Share sheet','Send the QR to your team on WhatsApp','');
      if(window.matchMedia('(max-width:1000px)').matches) root.querySelector('#qrCols').style.gridTemplateColumns='1fr';
    }};
  };

  function flow(icon,title,desc,tone){
    return '<div class="card card-pad"><div class="stat-icon '+tone+'">'+Icon(icon)+'</div>'+
      '<b style="display:block;margin-top:10px;font-size:13.5px">'+title+'</b>'+
      '<p class="small muted" style="margin:5px 0 0">'+desc+'</p></div>';
  }

  /* deterministic pseudo-QR rendering (visual placeholder) */
  function qrSvg(seed){
    const N=25, cells=[];
    let h=0; for(let i=0;i<seed.length;i++) h=(h*31+seed.charCodeAt(i))>>>0;
    const rnd=()=>{ h^=h<<13; h>>>=0; h^=h>>17; h^=h<<5; h>>>=0; return h/4294967295; };
    for(let y=0;y<N;y++) for(let x=0;x<N;x++){
      const finder=(x<7&&y<7)||(x>=N-7&&y<7)||(x<7&&y>=N-7);
      if(finder) continue;
      if(rnd()>0.55) cells.push('<rect x="'+x+'" y="'+y+'" width="1" height="1"/>');
    }
    const eye=(x,y)=>'<rect x="'+x+'" y="'+y+'" width="7" height="7" rx="2" fill="none" stroke="#0F172B" stroke-width="1"/>'+
      '<rect x="'+(x+2)+'" y="'+(y+2)+'" width="3" height="3" rx=".8" fill="#0F172B"/>';
    return '<svg viewBox="-1 -1 '+(N+2)+' '+(N+2)+'" style="width:210px;height:210px">'+
      '<g fill="#0F172B">'+cells.join('')+'</g>'+eye(0,0)+eye(N-7,0)+eye(0,N-7)+
      '<rect x="'+((N-7)/2)+'" y="'+((N-7)/2)+'" width="7" height="7" rx="2" fill="#FACC15"/>'+
      '<text x="'+(N/2)+'" y="'+(N/2+1.6)+'" text-anchor="middle" font-size="4.6" font-weight="800" font-family="Montserrat,Arial" fill="#0F172B">L</text></svg>';
  }
})();
