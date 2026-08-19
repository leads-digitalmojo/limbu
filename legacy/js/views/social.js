/* Limbu AI — Social Connections */
(function(){
  window.Views=window.Views||{};
  const {fmt,pageHead,$,$$,toast,work,modal,closeModal,statCard}=UI;

  const NETS=[
    {k:'google',   name:'Google Business Profile', icon:'google',    color:'#4285F4', desc:'Posts, reviews, insights and Q&A', actions:['Business Profile']},
    {k:'facebook', name:'Facebook',                icon:'facebook',  color:'#1877F2', desc:'Publish to your Facebook Page',    actions:['Connect Page']},
    {k:'instagram',name:'Instagram',               icon:'instagram', color:'#E1306C', desc:'Feed posts, reels and stories',    actions:['Connect Business Account']},
    {k:'linkedin', name:'LinkedIn',                icon:'linkedin',  color:'#0A66C2', desc:'Company page or personal profile', actions:['Connect Page','Connect Profile']},
    {k:'youtube',  name:'YouTube',                 icon:'youtube',   color:'#FF0000', desc:'Publish shorts and long-form video',actions:['Add Channel']},
    {k:'pinterest',name:'Pinterest',               icon:'pinterest', color:'#E60023', desc:'Pin products and service boards',  actions:['Add Profile']},
    {k:'whatsapp', name:'WhatsApp Business',       icon:'whatsapp',  color:'#25D366', desc:'Automated replies and lead alerts',actions:['Connect WhatsApp automation']}
  ];

  Views.social=function(){
    const S=Store.state;
    const on=NETS.filter(n=>n.k==='google'?S.gmbConnected:S.social[n.k]).length;

    const html=pageHead({eyebrow:'Connections',eyebrowIcon:'share',title:'Social Connections',
      sub:'Connect once — then publish everywhere from a single Magic Post.',
      actions:'<a class="btn btn-primary" href="#/posts/new">'+Icon('wand')+'Create a post</a>'})+
      '<div class="grid g-4 mb-16">'+
        statCard({icon:'link',tone:'green',value:on+' / '+NETS.length,label:'Platforms connected'})+
        statCard({icon:'send',tone:'blue',value:fmt.n(S.posts.filter(p=>p.status==='posted').length),label:'Cross-posted this month',delta:28})+
        statCard({icon:'users',tone:'pink',value:fmt.compact(18400),label:'Combined audience',delta:87})+
        statCard({icon:'activity',value:fmt.compact(S.posts.reduce((a,p)=>a+p.stats.views,0)),label:'Total reach',delta:37})+
      '</div>'+
      '<div class="grid g-2" id="soGrid">'+NETS.map(n=>{
        const conn = n.k==='google'?S.gmbConnected:S.social[n.k];
        return '<div class="card card-pad"><div class="row-between" style="align-items:flex-start">'+
          '<div class="row" style="flex-wrap:nowrap"><span class="conn-logo" style="background:'+n.color+'">'+Icon(n.icon)+'</span>'+
          '<div><b style="font-size:14px">'+n.name+'</b><div class="small muted">'+n.desc+'</div></div></div>'+
          (conn?'<span class="badge badge-green"><span class="dot"></span>Connected</span>':'<span class="badge badge-slate">Not connected</span>')+
          '</div>'+
          (conn?'<div class="row-between" style="margin-top:14px;padding-top:13px;border-top:1px solid var(--line-2)">'+
            '<div class="small muted">'+fmt.esc(Store.biz.name)+' • synced '+fmt.ago(Store.util.days(0))+'</div>'+
            '<button class="btn btn-sm btn-ghost" data-disc="'+n.k+'">Disconnect</button></div>'
           :'<div class="row" style="margin-top:14px;gap:8px">'+n.actions.map(a=>
             '<button class="btn btn-sm btn-outline" data-conn="'+n.k+'">'+Icon('link')+a+'</button>').join('')+'</div>')+
          '</div>';
      }).join('')+'</div>'+
      '<div class="hero mt-24"><h2>One post. Every platform.</h2>'+
      '<p>Limbu adapts the caption, hashtags and image ratio for each network automatically — square for Instagram, 16:9 for Google, vertical for Shorts.</p>'+
      '<div class="row"><a class="btn btn-primary" href="#/posts/new">'+Icon('wand')+'Try a Magic Post</a></div></div>';

    return {html,mount(root){
      $$('[data-conn]',root).forEach(b=>b.onclick=e=>work(e.currentTarget,1500,()=>{
        const k=b.dataset.conn;
        if(k==='google') Store.set({gmbConnected:true});
        else {Store.state.social[k]=true;Store.save();}
        toast('Connected',NETS.find(n=>n.k===k).name+' is now linked','ok');location.hash='#/social';}));
      $$('[data-disc]',root).forEach(b=>b.onclick=()=>UI.confirmDialog('Disconnect '+NETS.find(n=>n.k===b.dataset.disc).name+'?',
        'Scheduled posts to this platform will stop publishing.',()=>{
          const k=b.dataset.disc;
          if(k==='google') Store.set({gmbConnected:false}); else {Store.state.social[k]=false;Store.save();}
          toast('Disconnected','','err');location.hash='#/social';},'Disconnect'));
      LimbuNav.hydrateIcons(root);
    }};
  };
})();
