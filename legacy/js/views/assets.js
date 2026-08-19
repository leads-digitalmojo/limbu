/* Limbu AI — Assets Management */
(function(){
  window.Views=window.Views||{};
  const {fmt,pageHead,$,$$,toast,work,modal,closeModal,statCard,confirmDialog}=UI;
  const THEMES={lemon:['#FACC15','#EAB308'],ocean:['#0EA5E9','#2563EB'],sunset:['#F97316','#EC4899'],forest:['#10B981','#059669'],mono:['#94A3B8','#475569']};
  const RATIOS=['1:1','4:5','16:9','9:16'];
  const SLOTS=[['logo','Logo','Your brand mark, watermarked on every creative'],
               ['character','Character','A recurring face/mascot for consistent posts'],
               ['uniform','Uniform','Staff uniform so AI people look like your team'],
               ['background','Background','Your actual premises used as scene backdrops']];

  Views.assets=function(){
    const B=Store.state.brand;
    const total=Object.values(B.images).reduce((a,c)=>a+c,0)+B.products.reduce((a,p)=>a+p.imgs,0);

    const html=pageHead({eyebrow:'Brand kit',eyebrowIcon:'palette',title:'Assets Management',
      sub:'Everything the AI uses to make posts look like they came from your business — not a stock library.',
      actions:'<button class="btn btn-outline" id="asCopy">'+Icon('copy')+'Copy settings to all locations</button>'+
              '<button class="btn btn-outline" id="asSync">'+Icon('sync')+'Force sync</button>'})+
      '<div class="grid g-4 mb-16">'+
        statCard({icon:'image',tone:'blue',value:fmt.n(total),label:'Brand assets stored'})+
        statCard({icon:'palette',value:B.theme,label:'Active colour theme'})+
        statCard({icon:'layout',tone:'indigo',value:B.ratio,label:'Default image ratio'})+
        statCard({icon:'tag',tone:'pink',value:fmt.n(B.products.length),label:'Products in gallery'})+
      '</div>'+
      '<div class="grid" style="grid-template-columns:1fr 340px" id="asCols"><div class="stack">'+

        '<div class="card"><div class="card-head"><div><h3>Brand style</h3><p>Sets the mood of every AI creative</p></div></div>'+
        '<div class="card-body">'+
          '<div class="field"><span class="label">Colour theme</span><div class="row" id="asTheme">'+
            Object.keys(THEMES).map(t=>'<button class="chip'+(t===B.theme?' on':'')+'" data-t="'+t+'">'+
            '<i style="width:14px;height:14px;border-radius:5px;background:linear-gradient(135deg,'+THEMES[t][0]+','+THEMES[t][1]+');display:block"></i>'+t+'</button>').join('')+
            '</div></div>'+
          '<div class="grid g-2" style="gap:16px">'+
            '<div class="field"><span class="label">Custom brand colour</span>'+
            '<div class="row" style="flex-wrap:nowrap"><input type="color" id="asColor" value="'+B.custom+'" style="width:52px;height:40px;border:1px solid var(--line);border-radius:10px;background:none;padding:3px;cursor:pointer">'+
            '<input class="input" id="asColorTxt" value="'+B.custom+'"></div></div>'+
            '<div class="field"><span class="label">Default image ratio</span><div class="row" id="asRatio">'+
            RATIOS.map(r=>'<button class="chip'+(r===B.ratio?' on':'')+'" data-r="'+r+'">'+r+'</button>').join('')+'</div></div>'+
          '</div>'+
          '<div class="field"><span class="label">Brand voice & style notes</span>'+
          '<textarea class="textarea" id="asStyle" style="min-height:80px">'+fmt.esc(B.style)+'</textarea>'+
          '<div class="hint">Written into every AI prompt so captions stay on-brand.</div></div>'+
          '<button class="btn btn-primary" id="asSave">'+Icon('check')+'Save brand style</button>'+
        '</div></div>'+

        '<div class="card"><div class="card-head"><div><h3>Brand images</h3><p>Upload once — reused across every generated post</p></div></div>'+
        '<div class="card-body"><div class="grid g-4" style="gap:12px">'+
          SLOTS.map(([k,label,desc])=>
            '<div class="card card-hover" data-slot="'+k+'">'+
            '<div class="post-media r-16-9" style="background:linear-gradient(150deg,'+THEMES[B.theme][0]+',#0F172B)">'+
              '<div class="glow"></div>'+
              '<div style="position:relative;color:#fff;text-align:center">'+Icon(k==='logo'?'zap':k==='character'?'user':k==='uniform'?'briefcase':'image')+
              '<div style="font-size:11px;font-weight:700;margin-top:6px">'+label.toUpperCase()+'</div></div></div>'+
            '<div class="post-foot"><div class="row-between"><b style="font-size:12.5px">'+label+'</b>'+
            '<span class="badge '+(B.images[k]?'badge-green':'badge-amber')+'">'+(B.images[k]||0)+'</span></div>'+
            '<p class="small muted" style="margin:5px 0 9px">'+desc+'</p>'+
            '<button class="btn btn-outline btn-sm btn-block" data-up="'+k+'">'+Icon('upload')+'Upload</button></div></div>').join('')+
        '</div></div></div>'+

        '<div class="card"><div class="card-head"><div><h3>Product gallery</h3><p>Services and products the AI can feature in posts</p></div>'+
          '<button class="btn btn-primary btn-sm" id="asAddProd">'+Icon('plus')+'Add product</button></div>'+
        '<div class="card-body"><div class="grid g-3" style="gap:12px" id="asProds"></div></div></div>'+
      '</div>'+

      '<div class="stack">'+
        '<div class="card" style="position:sticky;top:82px"><div class="card-head"><div><h3>Live preview</h3><p>How your next post will look</p></div></div>'+
        '<div class="card-body"><div id="asPreview"></div></div></div>'+
        '<div class="card card-pad"><div class="row" style="flex-wrap:nowrap"><div class="stat-icon">'+Icon('info')+'</div>'+
        '<div><b style="font-size:13px">Why assets matter</b><p class="small muted" style="margin:4px 0 0">'+
        'Businesses that upload a logo, character and background see roughly 3× more engagement on AI posts, because the creative looks like their real premises.</p></div></div></div>'+
      '</div></div>';

    return {html,mount(root){
      const B=Store.state.brand;
      const preview=()=>{
        const c=THEMES[B.theme]||[B.custom,B.custom];
        const cls={'1:1':'','4:5':'r-4-5','16:9':'r-16-9','9:16':'r-9-16'}[B.ratio];
        root.querySelector('#asPreview').innerHTML=
          '<div class="post-preview"><div class="post-media '+cls+'" style="background:linear-gradient(150deg,'+c[0]+','+c[1]+' 55%,#0F172B)">'+
          '<div class="glow"></div><div class="cap">'+fmt.esc(Store.biz.name)+'</div>'+
          '<span style="position:absolute;top:12px;left:12px;background:#fff;color:#0F172B;font-family:var(--font-h);font-weight:800;font-size:12px;padding:4px 9px;border-radius:7px">'+fmt.initials(Store.biz.name)+'</span>'+
          '<span class="wm">Made with Limbu AI</span></div>'+
          '<div class="post-foot"><p class="small muted">Theme <b>'+B.theme+'</b> • Ratio <b>'+B.ratio+'</b> • '+
          Object.values(B.images).reduce((a,x)=>a+x,0)+' brand images in use</p></div></div>';
      };
      const prods=()=>{
        root.querySelector('#asProds').innerHTML=B.products.map(p=>
          '<div class="card card-pad"><div class="row-between"><b style="font-size:13px">'+fmt.esc(p.name)+'</b>'+
          '<button class="icon-btn" data-delprod="'+p.id+'" style="width:26px;height:26px">'+Icon('trash')+'</button></div>'+
          '<div class="small muted">'+fmt.esc(p.price)+' • '+p.imgs+' image'+(p.imgs>1?'s':'')+'</div>'+
          '<button class="btn btn-outline btn-sm btn-block mt-16" data-produp="'+p.id+'">'+Icon('upload')+'Add images</button></div>').join('')
          || '<p class="muted small">No products yet.</p>';
        LimbuNav.hydrateIcons(root.querySelector('#asProds'));
        $$('[data-delprod]',root).forEach(b=>b.onclick=()=>confirmDialog('Remove product?','It will no longer appear in AI generated posts.',()=>{
          B.products=B.products.filter(x=>x.id!==b.dataset.delprod); Store.save(); prods(); toast('Product removed','','ok');},'Remove'));
        $$('[data-produp]',root).forEach(b=>b.onclick=()=>{
          const p=B.products.find(x=>x.id===b.dataset.produp); p.imgs++; Store.save(); prods(); toast('Image added',p.name,'ok');});
      };

      $$('#asTheme .chip',root).forEach(c=>c.onclick=()=>{
        $$('#asTheme .chip',root).forEach(x=>x.classList.remove('on'));c.classList.add('on');B.theme=c.dataset.t;Store.save();preview();});
      $$('#asRatio .chip',root).forEach(c=>c.onclick=()=>{
        $$('#asRatio .chip',root).forEach(x=>x.classList.remove('on'));c.classList.add('on');B.ratio=c.dataset.r;Store.save();preview();});
      root.querySelector('#asColor').oninput=e=>{B.custom=e.target.value;root.querySelector('#asColorTxt').value=e.target.value;Store.save();};
      root.querySelector('#asSave').onclick=e=>work(e.currentTarget,700,()=>{
        B.style=root.querySelector('#asStyle').value;Store.save();toast('Brand style saved','Applied to all future AI posts','ok');});
      $$('[data-up]',root).forEach(b=>b.onclick=()=>{
        B.images[b.dataset.up]=(B.images[b.dataset.up]||0)+1;Store.save();
        toast('Asset uploaded',b.dataset.up+' library now has '+B.images[b.dataset.up]+' image(s)','ok');location.hash='#/assets';});
      root.querySelector('#asAddProd').onclick=()=>{
        modal({title:'Add product',body:
          '<div class="field"><span class="label">Product / service name <span class="req">*</span></span><input class="input" id="pName" placeholder="e.g. Invisible Aligners"></div>'+
          '<div class="field"><span class="label">Price</span><input class="input" id="pPrice" placeholder="₹65,000"></div>'+
          '<div class="field"><span class="label">Images</span><div class="check" id="pUp" style="justify-content:center;padding:24px;cursor:pointer">'+Icon('upload')+' Upload product photos</div></div>',
          foot:'<button class="btn btn-ghost" data-action="close-modal">Cancel</button><button class="btn btn-primary" id="pSave">Add product</button>'});
        LimbuNav.hydrateIcons(document.getElementById('modalBody'));
        $('#pSave').onclick=()=>{
          const n=$('#pName').value.trim(); if(!n) return toast('Name required','','err');
          B.products.push({id:Store.util.uid('p'),name:n,price:$('#pPrice').value||'On request',imgs:1});
          Store.save();closeModal();prods();toast('Product added',n,'ok');};
      };
      root.querySelector('#asCopy').onclick=e=>work(e.currentTarget,900,()=>toast('Settings copied','Applied to all '+Store.state.businesses.length+' locations','ok'));
      root.querySelector('#asSync').onclick=e=>work(e.currentTarget,1200,()=>toast('Assets synced','','ok'));
      if(window.matchMedia('(max-width:1050px)').matches) root.querySelector('#asCols').style.gridTemplateColumns='1fr';
      preview();prods();
    }};
  };
})();
