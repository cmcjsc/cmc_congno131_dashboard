

/* ══════════════════════════════════════════════════════════════
   CMC · Lớp giao diện mở rộng (dùng chung Kênh Phân phối / Kênh Độc quyền)
   1. +20 MEN ĐẶC BIỆT: đổi cả màu nền, thẻ, vàng nhấn (không chỉ màu chủ đạo) → tổng 40 men
   2. HIỆU ỨNG: nền (8 kiểu) · thẻ (5 kiểu) · biểu đồ chuyển sắc
   3. SỬA MÀU TỪNG KHỐI: nền/viền/tiêu đề khối · màu từng chuỗi / từng cột biểu đồ · màu bảng
      Lưu trong LAY[id].col → đi theo "Lưu bản HTML" và "Xuất cấu hình bố cục".
   Khai báo SAU engine nên ghi đè applyTheme / flushCharts / bindEditor / buildDrawer / syncUI.
   ══════════════════════════════════════════════════════════════ */
const FAMX=[
  {k:'hkdem',    n:'Hoàng kim đêm',   h:44,  hs:28,  sat:62, bh:38,  bs:16, gold:'#E9C46A'},
  {k:'lbhg',     n:'Lục bảo hoàng gia',h:158, hs:44,  sat:46, bh:166, bs:30, gold:'#D9B45A'},
  {k:'saphia',   n:'Sa-phia',         h:220, hs:196, sat:62, bh:222, bs:42, gold:'#E0C072'},
  {k:'hongngoc', n:'Hồng ngọc',       h:350, hs:30,  sat:56, bh:348, bs:26, gold:'#E8B865'},
  {k:'thachanh', n:'Thạch anh tím',   h:272, hs:316, sat:46, bh:268, bs:26, gold:'#E2C27A'},
  {k:'dongco',   n:'Đồng cổ',         h:24,  hs:186, sat:52, bh:22,  bs:20, gold:'#D9A066'},
  {k:'bachkim',  n:'Bạch kim',        h:210, hs:40,  sat:12, bh:214, bs:8,  gold:'#D6DCE4'},
  {k:'thanchi',  n:'Than chì',        h:200, hs:160, sat:20, bh:210, bs:6,  gold:'#C9B98F'},
  {k:'daiduong', n:'Đại dương sâu',   h:194, hs:168, sat:58, bh:206, bs:56, gold:'#7FD8C8'},
  {k:'rungthong',n:'Rừng thông',      h:142, hs:92,  sat:34, bh:150, bs:28, gold:'#C8B86A'},
  {k:'hoanghon', n:'Hoàng hôn',       h:18,  hs:330, sat:64, bh:282, bs:24, gold:'#F2B266'},
  {k:'binhminh', n:'Bình minh',       h:38,  hs:200, sat:60, bh:216, bs:32, gold:'#F5C76E'},
  {k:'cucquang', n:'Cực quang',       h:160, hs:282, sat:58, bh:232, bs:42, gold:'#9BE7C4'},
  {k:'neon',     n:'Neon',            h:186, hs:312, sat:82, bh:242, bs:32, gold:'#F7E26B'},
  {k:'champagne',n:'Champagne',       h:40,  hs:20,  sat:36, bh:34,  bs:14, gold:'#EBD3A0'},
  {k:'gommenlam',n:'Gốm men lam',     h:214, hs:198, sat:58, bh:214, bs:30, gold:'#D7C38E'},
  {k:'sonmai',   n:'Sơn mài',         h:4,   hs:42,  sat:58, bh:2,   bs:36, gold:'#E3B04B'},
  {k:'traxanh',  n:'Trà xanh',        h:96,  hs:150, sat:36, bh:100, bs:18, gold:'#D8C680'},
  {k:'catsa',    n:'Cát sa mạc',      h:32,  hs:14,  sat:40, bh:34,  bs:20, gold:'#E2B87A'},
  {k:'camthach', n:'Cẩm thạch',       h:190, hs:330, sat:22, bh:200, bs:10, gold:'#CFC6B0'}
];
FAMX.forEach(f=>{
  PALS[f.k]={n:f.n,x:1,
    b :hsl2hex(f.h ,f.sat   ,68), d :hsl2hex(f.h ,f.sat+6 ,50), s :hsl2hex(f.hs,f.sat-6,64),
    lb:hsl2hex(f.h ,f.sat+12,40), ld:hsl2hex(f.h ,f.sat+18,26), ls:hsl2hex(f.hs,f.sat+4,40),
    sf:{d:{bg:hsl2hex(f.bh,f.bs,5.5),bg2:hsl2hex(f.bh,f.bs,7.2),card:hsl2hex(f.bh,Math.max(6,f.bs-4),10),card2:hsl2hex(f.bh,Math.max(6,f.bs-4),12.8),gold:f.gold,gold2:mix(f.gold,'#FFFFFF',.35)},
        l:{bg:hsl2hex(f.bh,Math.min(40,f.bs+8),96),bg2:hsl2hex(f.bh,Math.min(40,f.bs+8),93.5),card:hsl2hex(f.bh,Math.min(40,f.bs+10),99.3),card2:hsl2hex(f.bh,Math.min(40,f.bs+10),97),gold:mix(f.gold,'#3A2A08',.42),gold2:mix(f.gold,'#3A2A08',.6)}}};
});
const FXBG=[['glass','Kính tĩnh'],['liquid','Vệt màu trôi'],['aurora','Cực quang'],['mesh','Lưới chuyển sắc'],['grain','Hạt phim'],['grid','Lưới kỹ thuật'],['stars','Bụi sao'],['flat','Phẳng']];
const FXCARD=[['none','Chuẩn'],['glow','Viền phát sáng'],['lift','Nổi khối 3D'],['shimmer','Vệt sáng quét'],['neon','Viền neon']];
if(state.fx===undefined)state.fx='glass';
if(state.fxc===undefined)state.fxc='none';
if(state.cgrad===undefined)state.cgrad=false;

function applyTheme(){
  const p=PALS[state.pal]||PALS.lam, dark=state.mode==='dark';
  const r=document.documentElement;
  r.setAttribute('data-mode',state.mode);
  r.setAttribute('data-fx',state.fx||'glass');
  r.setAttribute('data-fxc',state.fxc||'none');
  r.style.setProperty('--brand',  dark?p.b:p.lb);
  r.style.setProperty('--deep',   dark?p.d:p.ld);
  r.style.setProperty('--support',dark?p.s:p.ls);
  ['bg','bg2','card','card2','gold','gold2'].forEach(k=>r.style.removeProperty('--'+k));
  if(p.sf){const s=dark?p.sf.d:p.sf.l;Object.keys(s).forEach(k=>r.style.setProperty('--'+k,s[k]));}
  const cs=getComputedStyle(r);
  ['brand','deep','support','muted','ok','warn','bad','ink','sub','mut','line','line2','plan','gold','gold2','card','card2','bg']
    .forEach(k=>C[k]=cs.getPropertyValue('--'+k).trim());
  C.grid  = dark?'rgba(255,255,255,.07)':'rgba(16,24,40,.08)';
  C.lblBg = dark?'rgba(10,14,21,.74)':'rgba(255,255,255,.80)';
  C.ck    = '#9AA4AE';
}

/* ---------- bộ màu nhanh cho biểu đồ ---------- */
const SCHEMES={
  men:   {n:'Theo men',   f:()=>KCOL()},
  mono:  {n:'Đơn sắc',    f:()=>[0,1,2,3,4,5,6,7,8,9].map(i=>mix(C.brand,state.mode==='dark'?'#0B1018':'#FFFFFF',i*.075))},
  tuong: {n:'Tương phản', f:()=>['#2F80ED','#F2994A','#27AE60','#EB5757','#9B51E0','#00B8D9','#F2C94C','#6FCF97','#BB6BD9','#56CCF2']},
  pastel:{n:'Pastel',     f:()=>['#8EC5FC','#F7B7A3','#B5EAD7','#FFDAC1','#C7CEEA','#E2F0CB','#FFB7B2','#A0E7E5','#D5AAFF','#FBE7C6']},
  am:    {n:'Ấm',         f:()=>['#E9C46A','#F4A261','#E76F51','#D4A373','#C8553D','#F2CC8F','#BC6C25','#DDA15E','#9C6644','#E07A5F']},
  lanh:  {n:'Lạnh',       f:()=>['#48CAE4','#0096C7','#90E0EF','#5E60CE','#64DFDF','#4EA8DE','#7400B8','#80FFDB','#6930C3','#56CFE1']},
  dat:   {n:'Đất & gốm',  f:()=>['#A68A64','#7F5539','#B08968','#936639','#C9ADA7','#656D4A','#B6AD90','#582F0E','#A4AC86','#DDB892']},
  kim:   {n:'Kim loại',   f:()=>['#D4AF37','#C0C0C0','#B87333','#E5E4E2','#CD7F32','#8C7853','#A8A9AD','#FFD700','#996515','#71706E']},
  neon:  {n:'Neon',       f:()=>['#00F5D4','#F15BB5','#FEE440','#00BBF9','#9B5DE5','#7CFF6B','#FF8FAB','#4CC9F0','#FF9F1C','#B9FBC0']}
};
function colOfBlk(id){return (LAY[id]&&LAY[id].col)||null;}
/* áp màu khối vào cấu hình biểu đồ (sau khi đổi dạng) */
function applyCol(cfg,col,cid){
  if(!col||!cfg||!cfg.data||!cfg.data.datasets)return cfg;
  const ds=cfg.data.datasets, sch=col.sch&&SCHEMES[col.sch]?SCHEMES[col.sch].f():null, ov=(col.ser&&col.ser[cid])||{};
  const multi=ds.length===1&&Array.isArray(ds[0].backgroundColor);
  if(multi){
    const d=ds[0], n=(cfg.data.labels||d.data||[]).length;
    if(sch)d.backgroundColor=d.backgroundColor.map((c,i)=>sch[i%sch.length]);
    Object.keys(ov).forEach(i=>{if(d.backgroundColor[+i]!==undefined)d.backgroundColor[+i]=ov[i];});
    if(Array.isArray(d.borderColor)&&cfg.type!=='doughnut'&&cfg.type!=='pie')d.borderColor=d.backgroundColor.slice();
    return cfg;
  }
  let j=0;
  ds.forEach((d,i)=>{
    let c=null;
    if(sch&&!(d.borderDash&&d.borderDash.length))c=sch[j++%sch.length];   /* đường nét đứt (kế hoạch, KPI, cùng kỳ) giữ màu gốc */
    if(ov[i])c=ov[i];
    if(!c)return;
    const isLine=d.type==='line'||(cfg.type==='line'&&d.type!=='bar');
    if(isLine){d.borderColor=c;if(d.fill&&d.fill!==false)d.backgroundColor=c+'33';else d.backgroundColor=c;if(d.pointBackgroundColor)d.pointBackgroundColor=c;}
    else{d.backgroundColor=Array.isArray(d.backgroundColor)?d.backgroundColor.map(()=>c):c;d.borderColor=c;}
  });
  return cfg;
}
/* tô chuyển sắc cho cột (giữ màu gốc trong _bg để xuất PowerPoint) */
function gradPlugin(){return {id:'cgrad',beforeDatasetsDraw(ch){
  if(!state.cgrad)return;
  const a=ch.chartArea; if(!a)return; const hz=ch.options&&ch.options.indexAxis==='y';
  ch.data.datasets.forEach((d,i)=>{
    const isBar=(d.type||ch.config.type)==='bar'; if(!isBar)return;
    const base=d._bg!==undefined?d._bg:d.backgroundColor; if(d._bg===undefined)d._bg=base;
    const mk=c=>{if(typeof c!=='string'||!/^#[0-9a-f]{6}$/i.test(c))return c;
      const g=hz?ch.ctx.createLinearGradient(a.left,0,a.right,0):ch.ctx.createLinearGradient(0,a.bottom,0,a.top);
      g.addColorStop(0,c+'55');g.addColorStop(1,c);return g;};
    const nb=Array.isArray(base)?base.map(mk):mk(base);
    const meta=ch.getDatasetMeta(i);
    (meta.data||[]).forEach((el,j)=>{if(el&&el.options)el.options.backgroundColor=Array.isArray(nb)?nb[j%nb.length]:nb;});
  });}};}
function flushCharts(){
  killCharts();
  PEND.forEach(p=>{
    const el=$(p.id); if(!el)return;
    let cfg=p.cfg; const b=el.closest('[data-blk]'), bid=b?b.getAttribute('data-blk'):null;
    try{ if(bid) cfg=applyCT(cfg,ctOf(bid)); }catch(e){ console.warn('ct',p.id,e); }
    try{ if(bid) cfg=applyCol(cfg,colOfBlk(bid),p.id); }catch(e){ console.warn('col',p.id,e); }
    try{ cfg.plugins=(cfg.plugins||[]).concat([gradPlugin()]); CH.push(new Chart(el.getContext('2d'),cfg)); }
    catch(e){ console.warn('chart',p.id,e); }
  });
  PEND=[];
  applyBlkCss();
}
/* màu nền / viền / tiêu đề khối và màu bảng */
const PCV=[['bg','--pbg','pc-bg'],['bd','--pbd','pc-bd'],['tt','--ptt','pc-tt'],['thbg','--thbg','pc-thbg'],['thfg','--thfg','pc-thfg'],['td','--ptd','pc-td'],['c1','--pc1','pc-c1']];
function applyBlkCss(){
  $$('#grid .panel').forEach(el=>{
    const col=colOfBlk(el.getAttribute('data-blk'));
    PCV.forEach(x=>{el.classList.remove(x[2]);el.style.removeProperty(x[1]);});
    el.classList.remove('pc-strip');el.style.removeProperty('--pfs');el.classList.remove('pc-fs');
    if(!col)return;
    PCV.forEach(x=>{if(col[x[0]]){el.classList.add(x[2]);el.style.setProperty(x[1],col[x[0]]);}});
    if(col.strip)el.classList.add('pc-strip');
    if(col.fs){el.classList.add('pc-fs');el.style.setProperty('--pfs',col.fs+'px');}
  });
}
/* ---------- bảng chỉnh màu khối ---------- */
let COLBLK=null;
function colOpen(id){colEl();COLBLK=id;colDraw();$('colPop').classList.add('show');}
function colClose(){COLBLK=null;const d=$('colPop');if(d)d.classList.remove('show');}
function colSet(fn){const id=COLBLK;if(!id)return;LAY[id]=LAY[id]||{};LAY[id].col=LAY[id].col||{};fn(LAY[id].col);
  Object.keys(LAY[id].col).forEach(k=>{const v=LAY[id].col[k];if(v===''||v===null||v===undefined||(typeof v==='object'&&!Object.keys(v).length))delete LAY[id].col[k];});
  if(!Object.keys(LAY[id].col).length)delete LAY[id].col; if(!Object.keys(LAY[id]).length)delete LAY[id];
  saveCfg();render();colDraw();}
const toHex=c=>{try{const a=rgbaOf(c);if(!a)return '#888888';return '#'+[0,1,2].map(i=>a[i].toString(16).padStart(2,'0')).join('');}catch(e){return '#888888';}};
function colDraw(){
  const id=COLBLK, el=document.querySelector(`#grid .panel[data-blk="${id}"]`), box=$('colBody'); if(!box)return;
  if(!el){box.innerHTML='<div class="empty sm">Khối không còn trên màn hình.</div>';return;}
  const col=colOfBlk(id)||{}, nm=el.getAttribute('data-name')||id;
  const inp=(k,lab,def)=>`<label class="cpi"><span>${lab}</span><input type="color" value="${col[k]||def}" onchange="colSet(c=>{c['${k}']=this.value})">${col[k]?`<button class="cpx" title="Bỏ" onclick="colSet(c=>{delete c['${k}']})">×</button>`:''}</label>`;
  let h=`<div class="cph"><b>🎨 Màu khối</b><span>${esc(nm)}</span><button class="xclose" onclick="colClose()">×</button></div>
    <div class="cps"><h5>Khung khối</h5>${inp('bg','Nền khối',toHex(C.card))}${inp('bd','Viền',toHex(C.brand))}${inp('tt','Tiêu đề',toHex(C.ink))}</div>`;
  const charts=CH.filter(c=>c.canvas&&el.contains(c.canvas));
  if(charts.length){
    h+=`<div class="cps"><h5>Biểu đồ — bộ màu nhanh</h5><div class="cpsch">${Object.keys(SCHEMES).map(k=>{const L=SCHEMES[k].f().slice(0,5);
      return `<button class="${(col.sch||'')===k||(!col.sch&&k==='men')?'on':''}" onclick="colSet(c=>{${k==='men'?"delete c.sch":"c.sch='"+k+"'"};delete c.ser})"><i>${L.map(x=>`<s style="background:${x}"></s>`).join('')}</i>${SCHEMES[k].n}</button>`;}).join('')}</div></div>`;
    charts.forEach((ch,ci)=>{
      const cid=ch.canvas.id, ds=ch.data.datasets, multi=ds.length===1&&Array.isArray(ds[0]._bg!==undefined?ds[0]._bg:ds[0].backgroundColor);
      const items=multi?(ch.data.labels||[]).map((l,i)=>({k:i,n:String(l),c:(ds[0]._bg||ds[0].backgroundColor)[i]})):ds.map((d,i)=>({k:i,n:d.label||('Chuỗi '+(i+1)),c:(d.type==='line'||ch.config.type==='line')?d.borderColor:(d._bg!==undefined?d._bg:d.backgroundColor)}));
      h+=`<div class="cps"><h5>${charts.length>1?'Biểu đồ '+(ci+1)+' — ':''}${multi?'màu từng cột / lát':'màu từng chuỗi'}</h5><div class="cpl">${items.slice(0,40).map(x=>{const cur=Array.isArray(x.c)?x.c[0]:x.c;const has=col.ser&&col.ser[cid]&&col.ser[cid][x.k];
        return `<label class="cpi"><span title="${esc(x.n)}">${esc(x.n.length>28?x.n.slice(0,27)+'…':x.n)}</span><input type="color" value="${toHex(cur)}" onchange="colSet(c=>{c.ser=c.ser||{};c.ser['${cid}']=c.ser['${cid}']||{};c.ser['${cid}']['${x.k}']=this.value})">${has?`<button class="cpx" title="Bỏ" onclick="colSet(c=>{delete c.ser['${cid}']['${x.k}'];if(!Object.keys(c.ser['${cid}']).length)delete c.ser['${cid}']})">×</button>`:''}</label>`;}).join('')}</div></div>`;
    });
  }
  if(el.querySelector('table')){
    h+=`<div class="cps"><h5>Bảng</h5>${inp('thbg','Nền tiêu đề cột',toHex(C.card2))}${inp('thfg','Chữ tiêu đề cột',toHex(C.mut))}${inp('td','Chữ số liệu',toHex(C.ink))}${inp('c1','Chữ cột đầu',toHex(C.ink))}
      <label class="cpi"><span>Kẻ sọc xen kẽ</span><input type="checkbox" ${col.strip?'checked':''} onchange="colSet(c=>{if(this.checked)c.strip=1;else delete c.strip})"></label>
      <label class="cpi"><span>Cỡ chữ bảng</span><span class="cpfs"><button onclick="colSet(c=>{c.fs=Math.max(9,(c.fs||12)-1)})">A−</button><b>${col.fs||12}px</b><button onclick="colSet(c=>{c.fs=Math.min(18,(c.fs||12)+1)})">A+</button></span></label></div>`;
  }
  h+=`<div class="cpf"><button class="btn ghost" onclick="colSet(c=>{Object.keys(c).forEach(k=>delete c[k])})">↺ Màu mặc định khối này</button></div>`;
  box.innerHTML=h;
}
/* gắn nút 🎨 vào thanh chỉnh khối */
const _bindEditor0=bindEditor;
bindEditor=function(){
  _bindEditor0();
  $$('#grid .panel').forEach(el=>{
    const id=el.getAttribute('data-blk'), lay=el.querySelector('.lay'); if(!lay||lay.querySelector('[data-ly="col"]'))return;
    const b=document.createElement('button'); b.setAttribute('data-ly','col'); b.title='Màu khối: nền, viền, tiêu đề, từng chuỗi biểu đồ, bảng';
    b.className=colOfBlk(id)?'on':''; b.textContent='🎨';
    b.onclick=ev=>{ev.stopPropagation();colOpen(id);};
    const rs=lay.querySelector('[data-ly="rs"]'); lay.insertBefore(b,rs||null);
  });
  if(COLBLK)colDraw();
};
/* ---------- ngăn kéo cài đặt: 40 men chia 2 nhóm + hiệu ứng ---------- */
const _buildDrawer0=buildDrawer;
buildDrawer=function(){
  const _pp=PEND.slice(), _kr=KREG.length; _buildDrawer0(); PEND=_pp; KREG.length=_kr;   /* liệt kê khối không được để lại biểu đồ chờ vẽ */
  const chip=k=>{const p=PALS[k];const bg=p.sf?(state.mode==='dark'?p.sf.d.bg:p.sf.l.bg):null;
    return `<button class="pchip${p.x?' px':''}" data-pal="${k}" title="${esc(p.n)}"><i style="background:${bg?`linear-gradient(135deg,${bg} 0 34%,${p.b} 34% 70%,${p.sf?(state.mode==='dark'?p.sf.d.gold:p.sf.l.gold):p.s})`:`linear-gradient(135deg,${p.b},${p.d} 62%,${p.s})`}"></i><span>${esc(p.n)}</span></button>`;};
  const K=Object.keys(PALS), A=K.filter(k=>!PALS[k].x), B=K.filter(k=>PALS[k].x);
  $('palrow').innerHTML=`<div class="palgrp">Men chuẩn · ${A.length}</div>`+A.map(chip).join('')+`<div class="palgrp">Men đặc biệt · ${B.length} — đổi cả nền, thẻ và màu vàng nhấn</div>`+B.map(chip).join('');
  $$('#palrow [data-pal]').forEach(b=>b.onclick=()=>{state.pal=b.dataset.pal;saveCfg();render();syncUI();});
  const sel=(arr,key)=>arr.map(x=>`<button data-fxset="${key}:${x[0]}" class="${(state[key]||arr[0][0])===x[0]?'on':''}">${x[1]}</button>`).join('');
  let fx=$('fxSec');
  if(!fx){fx=document.createElement('div');fx.className='dsec';fx.id='fxSec';const ref=$('palrow').closest('.dsec');ref.parentNode.insertBefore(fx,ref.nextSibling);}
  fx.innerHTML=`<h4>Hiệu ứng</h4><div class="psub" style="margin:2px 0 6px">Nền trang</div><div class="fxrow">${sel(FXBG,'fx')}</div>
    <div class="psub" style="margin:10px 0 6px">Thẻ & khối</div><div class="fxrow">${sel(FXCARD,'fxc')}</div>
    <label class="ckline" style="margin-top:10px"><input type="checkbox" id="ckGrad" ${state.cgrad?'checked':''}> Cột biểu đồ tô chuyển sắc</label>
    <div class="psub" style="margin-top:6px">Sửa màu từng khối: mở khoá 🔒 → bật ✎ → bấm 🎨 trên khối.</div>`;
  $$('#fxSec [data-fxset]').forEach(b=>b.onclick=()=>{const p=b.dataset.fxset.split(':');state[p[0]]=p[1];saveCfg();applyTheme();buildDrawer();syncUI();});
  $('ckGrad').onchange=e=>{state.cgrad=e.target.checked;saveCfg();render();};
};
/* xuất PowerPoint: đọc màu gốc khi cột đang tô chuyển sắc */
if(typeof specFromChart==='function'){const _sfc=specFromChart;specFromChart=function(ch){
  const sv=[];try{(ch.data.datasets||[]).forEach(d=>{if(d._bg!==undefined){sv.push([d,d.backgroundColor]);d.backgroundColor=d._bg;}});return _sfc(ch);}finally{sv.forEach(x=>{x[0].backgroundColor=x[1];});}};}

function colEl(){let d=document.getElementById('colPop');if(!d){d=document.createElement('div');d.className='colpop';d.id='colPop';d.innerHTML='<div id="colBody"></div>';document.body.appendChild(d);}return d;}
document.addEventListener('DOMContentLoaded',()=>{document.querySelectorAll('#colPop').forEach((e,i)=>{if(i)e.remove();});colEl();});
if(typeof saveHTML==='function'){const _sh=saveHTML;saveHTML=function(){colClose();const d=document.getElementById('colPop'),par=d&&d.parentNode;if(d)d.remove();try{return _sh.apply(this,arguments);}finally{if(d&&par)par.appendChild(d);}};}


