



/* ══════════════════════ ỨNG DỤNG ══════════════════════ */
function saveCfg(){if(window.ONL&&state.editing)ONL.markPending('sửa bố cục / nội dung');try{localStorage.setItem(LSK,JSON.stringify({
  lay:LAY,txt:TXT,logo:LOGO,gal:GAL,cap:CAP,fit:FIT,mode:state.mode,pal:state.pal,labels:state.labels,
  prev:state.prev,anim:state.anim,toolbar:state.toolbar,sec:state.sec,u:state.u,lv:state.lv,fx:state.fx,fxc:state.fxc,cgrad:state.cgrad}));}catch(e){}}
function loadCfg(){try{const s=JSON.parse(localStorage.getItem(LSK)||'{}');
  if(s.lay)LAY=s.lay; if(s.txt)TXT=s.txt; if(s.logo)LOGO=s.logo; if(s.gal)GAL=s.gal; if(s.cap)CAP=s.cap; if(s.fit)FIT=s.fit;
  try{const u=JSON.parse(localStorage.getItem(LSK+'_img')||'{}');if(u&&typeof u==='object')IMGU=u;}catch(e){}
  ['mode','pal','sec'].forEach(k=>{if(s[k])state[k]=s[k];});
  ['labels','prev','anim','toolbar'].forEach(k=>{if(typeof s[k]==='boolean')state[k]=s[k];});
  if(!SECS.some(x=>x.k===state.sec))state.sec='tq';
  if(s.fx)state.fx=s.fx; if(s.fxc)state.fxc=s.fxc; if(s.cgrad!==undefined)state.cgrad=!!s.cgrad;
  if(s.u==='dt'||s.u==='sl')state.u=s.u; if(s.lv&&typeof s.lv==='object')state.lv=Object.assign({dt:2,sl:1},s.lv);
  if(!PALS[state.pal])state.pal='cham';
}catch(e){}}

/* ---------- RENDER ---------- */
/* render({top:1}) mới cuộn về đầu trang. Mọi thao tác trong chế độ chỉnh sửa
   đều gọi render() thường -> GIỮ NGUYÊN vị trí đang xem (hết hiện tượng vọt lên đầu). */
function render(opt){
  opt=opt||{};
  const sy=opt.top?0:(window.pageYOffset||document.documentElement.scrollTop||0);
  applyTheme();
  const sec=SECS.find(s=>s.k===state.sec)||SECS[0];
  KREG=[];DRS=[];
  const blocks=SECFN[sec.k]();
  const wrap=document.createElement('div');
  wrap.innerHTML=blocks.join('');
  const arr=Array.prototype.slice.call(wrap.children);
  /* áp cấu hình bố cục */
  arr.forEach(el=>{
    const id=el.getAttribute('data-blk'), L=LAY[id]||{};
    applyNotes(el,id);
    if(!LAY[id])return;
    if(L.h)el.setAttribute('data-hidden','1');
    if(L.s){el.className=el.className.replace(/\bs[1-6]\b/,'s'+L.s);}
    if(L.ht)el.querySelectorAll('.cbox').forEach(c=>{c.style.height=L.ht+'px';});
    if(L.na)el.querySelectorAll('.nauto').forEach(n=>n.remove());
    if(L.pr)el.querySelectorAll('.kpis').forEach(g=>{
      g.style.gridTemplateColumns='repeat('+L.pr+',minmax(0,1fr))';
      g.style.setProperty('--kf',String(KF[L.pr]||1));
    });
    if(L.tb)applyTb(el,L.tb);
  });
  const ord=(LAY['__ord_'+sec.k]||[]);
  if(ord.length)arr.sort((a,b)=>{
    const i=ord.indexOf(a.getAttribute('data-blk')), j=ord.indexOf(b.getAttribute('data-blk'));
    return (i<0?999:i)-(j<0?999:j);});
  const c=$('content');
  killCharts();   /* huỷ biểu đồ cũ trước khi thay nội dung */
  c.innerHTML=`<div class="sechd"><h2 data-tk="sec.${sec.k}">${esc(secT(sec.k))}</h2>
      <span class="sm">Công ty cổ phần CMC · Phân tích công nợ &amp; thu tiền TK 131 · ${esc(PER())} · ${esc(fLab())}</span>
      <button class="secrs" id="btnSecRs" title="Khôi phục toàn bộ mục này về mặc định">↺ Khôi phục mục này</button>
    </div>
    <div class="grid" id="grid"></div>`;
  const g=$('grid');
  arr.forEach(el=>{if(el.getAttribute('data-hidden')&&!state.editing)return; g.appendChild(el);});
  flushCharts();
  bindContent();
  if(state.editing)bindEditor();
  bindStory();
  syncNav();
  fitKPI();
  /* khôi phục vị trí cuộn — gọi nhiều nhịp vì chiều cao trang còn đổi sau khi vẽ biểu đồ */
  if(sy>0){
    const back=()=>window.scrollTo(0,sy);
    back(); requestAnimationFrame(back);
    setTimeout(back,50); setTimeout(back,180); setTimeout(back,420);
  }else if(opt.top){window.scrollTo(0,0);}
}

/* hệ số cỡ chữ theo số thẻ trên 1 hàng — càng nhiều thẻ, chữ càng nhỏ để vừa khung */
const KF={2:1.18,3:1.09,4:1,5:.93,6:.86,7:.8,8:.75,9:.71,10:.67};

/* Đo thật: nhãn tự rút gọn và cỡ số tự thu nhỏ cho vừa khung thẻ */
function fitKPInow(root){
  if(!root)return;
  /* nhãn “So KH / So CK” rút gọn rồi ẩn hẳn khi thẻ quá hẹp — không cắt cụt chữ */
  root.querySelectorAll('.chip.cc i').forEach(i=>{
    const f=i.getAttribute('data-full'), sh=i.getAttribute('data-short');
    if(!f)return;
    i.style.display=''; i.textContent=f;
    if(i.scrollWidth>i.clientWidth+1){i.textContent=sh;
      if(i.scrollWidth>i.clientWidth+1)i.style.display='none';}
  });
  root.querySelectorAll('.kpi').forEach(card=>{
    ['.kv','.klkv'].forEach(sel=>{
      const e=card.querySelector(sel); if(!e)return;
      e.style.fontSize='';
      const box=card.clientWidth-18; if(box<=0)return;
      let guard=0;
      while(e.scrollWidth>box&&guard++<14){
        const cur=parseFloat(getComputedStyle(e).fontSize);
        if(cur<=10)break;
        e.style.fontSize=(cur-1)+'px';
      }
    });
  });
}
function fitKPI(){
  const run=()=>fitKPInow($('grid'));
  requestAnimationFrame(run); setTimeout(run,120);
}
let fitT=null;
window.addEventListener('resize',()=>{clearTimeout(fitT);fitT=setTimeout(fitKPI,180);});

/* ── Dòng phân tích: gắn khoá sửa được + cảnh báo khi khác nội dung trong Excel ── */
function applyNotes(el,id){
  if(!id)return;
  let i=0;
  el.querySelectorAll('.cnote .psub').forEach(n=>{
    const key='n.'+id+'.'+(i++);
    n.setAttribute('data-tkh',key);
    const isX=n.classList.contains('nexcel');
    const tgt=n.querySelector('.ntx')||n;
    const orig=tgt.innerHTML;
    n.setAttribute('data-orig',orig);
    const v=TXT[key];
    if(v!==undefined&&v!==orig){
      tgt.innerHTML=v;
      n.classList.add('nedited');
      if(isX){
        const src=n.getAttribute('data-nsrc')||'Ô nguồn Excel';
        n.setAttribute('data-nsrc',src+' — ĐÃ SỬA, khác nội dung đang có trong Excel');
        n.insertAdjacentHTML('beforeend',' <b class="nwarn" title="Dòng này lấy từ ô Excel nhưng đã được sửa trên dashboard — nội dung hiện khác với file Excel gốc.">⚠</b>');
      }else{
        n.insertAdjacentHTML('beforeend',' <b class="nwarn ok" title="Dòng phân tích tự động đã được sửa tay.">✎</b>');
      }
    }
  });
}

/* ── Áp cấu hình BẢNG: căn lề, khớp nội dung/khung, độ rộng cột ── */
function applyTb(el,c){
  el.querySelectorAll('.tw').forEach((tw,ti)=>{
    tw.classList.toggle('fitc',c.fit==='content');
    tw.classList.toggle('fitf',c.fit==='frame');
    const t=tw.querySelector('table'); if(!t)return;
    if(c.ha)t.setAttribute('data-ha',c.ha); else t.removeAttribute('data-ha');
    if(c.ba)t.setAttribute('data-ba',c.ba); else t.removeAttribute('data-ba');
    const cw=c.cw&&c.cw[ti];
    const old=t.querySelector('colgroup'); if(old)old.remove();
    if(cw){
      const n=t.querySelectorAll('thead th').length;
      let h='<colgroup>';
      for(let i=0;i<n;i++)h+=cw[i]?`<col style="width:${cw[i]}px">`:'<col>';
      t.insertAdjacentHTML('afterbegin',h+'</colgroup>');
      t.style.tableLayout='fixed'; t.style.width='max-content'; t.style.minWidth='100%';
    }else{t.style.tableLayout='';t.style.width='';t.style.minWidth='';}
  });
}

function resetSec(k){
  const ids=SECFN[k]().map(h=>(h.match(/data-blk="([^"]+)"/)||[])[1]).filter(Boolean);
  ids.forEach(id=>delete LAY[id]);
  delete LAY['__ord_'+k];
  delete TXT['ins.'+k]; delete TXT['inst.'+k]; delete TXT['hh.'+k];
  const pre={tfl:['tflT','tflF','tflL'],ph:['ph','next']}[k]||[];
  Object.keys(TXT).forEach(x=>{pre.forEach(p=>{if(x.indexOf('ins.'+p)===0||x.indexOf('inst.'+p)===0)delete TXT[x];});});
  ids.forEach(id=>{delete TXT['t.'+id];delete TXT['s.'+id];
    Object.keys(TXT).forEach(x=>{if(x.indexOf('n.'+id+'.')===0)delete TXT[x];});});
  saveCfg(); render(); toast('Đã khôi phục mục “'+secT(k)+'” về mặc định.');
}
function bindContent(){
  const rs=$('btnSecRs'); if(rs)rs.onclick=()=>resetSec(state.sec);
  $$('#grid [data-drill]').forEach(el=>el.onclick=e=>{
    if(e.target.closest('[data-src]'))return; drillOpen(el.dataset.drill);});
  $$('#grid [data-src]').forEach(el=>el.onclick=e=>{e.stopPropagation();srcOpen(el.dataset.src);});
  $$('#grid td[data-cell]').forEach(el=>el.onclick=()=>{
    const p=el.dataset.cell.split(':'); srcOpen(p[0],+p[1]);});
  $$('#grid td[data-goto]').forEach(el=>el.onclick=()=>{go(el.dataset.goto);});
  $$('#grid [data-dcm]').forEach(el=>el.onclick=e=>{e.stopPropagation();state.dcm=+el.dataset.dcm;render();toast('Bảng B, C đang hiện lũy kế đến tháng '+state.dcm+'.');});
}
function go(k){state.sec=k;saveCfg();render({top:1});}

/* ---------- SIDEBAR · BREADCRUMBS · TOOLBAR ---------- */
function buildNav(){
  let h='', g='';
  SECS.forEach(x=>{
    if(x.g!==g){ g=x.g; h+=`<div class="navsec">${esc(g)}</div>`; }
    let cnt='';
    if(x.k==='dq'){
      const a=DATA.dq||[], r=a.filter(d=>d.sev==='r').length;
      if(a.length) cnt=`<span class="cnt ${r?'':'n'}">${a.length}</span>`;
    }else if(BPN[x.k]&&x.k!=='tq'){
      const a=(DATA.dq||[]).filter(d=>d.bp===x.k), r=a.filter(d=>d.sev==='r').length;
      cnt=r?`<span class="cnt" title="${r} điểm đỏ">${r}</span>`:(a.length?`<span class="cnt y" title="${a.length} điểm vàng">${a.length}</span>`:'<span class="okd" title="Số liệu đủ">●</span>');
    }
    h+=`<div class="nitem ${state.sec===x.k?'on':''}" data-sec="${x.k}">
      <span class="ico">${x.ico}</span><span class="nt" title="${esc(secT(x.k))}">${esc(TXT['sec.'+x.k]!==undefined?secT(x.k):(x.n||secT(x.k)))}</span>${cnt}</div>`;
  });
  $('nav').innerHTML=h;
  navInd();
  $$('#nav .nitem').forEach(el=>el.onclick=()=>{
    document.body.classList.remove('sbshow'); go(el.dataset.sec);});
  let ft='Trích ngày '+DATA.meta.gen.split('-').reverse().join('/')+
    '<br>Đang xem T'+state.m+'/'+DATA.meta.y+' · '+DATA.reg.length+' vùng · '+DATA.cust.length+' NPP'+
    '<br>IN_DATA đến T'+DATA.meta.mE+' · W_Vung đến T'+DATA.meta.mS;
  if(window.__SAVEDAT__){
    const d=new Date(window.__SAVEDAT__);
    ft+='<br><span style="color:var(--brand)">💾 Bản lưu '+d.toLocaleDateString('vi-VN')+
        ' '+d.toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'})+'</span>';
  }
  $('fUpd').innerHTML=ft;
}
/* chỉ báo "giọt kính" trượt theo mục đang chọn — hiệu ứng liquid */
function navInd(){
  const on=$('nav').querySelector('.nitem.on'), ind=$('navInd'); if(!ind)return;
  if(!on){ind.style.opacity=0;return;}
  ind.style.opacity=1; ind.style.height=on.offsetHeight+'px'; ind.style.transform='translateY('+on.offsetTop+'px)';
}
function applyIcons(){
  const M={btnSb:'menu',btnFind:'search',btnGear:'sliders',btnPresent:'play',btnPrint:'print',btnEdit:'edit',btnMore:'more',pPrev:'left',pNext:'right',pExit:'x'};
  Object.keys(M).forEach(k=>{const e=$(k);if(e)e.innerHTML=ic(M[k]);});
  const MI={import:'folder',html:'save',print:'print',csv:'download',expcfg:'download',impcfg:'upload',reset:'reset',lock:'lock',help:'help'};
  $$('#moreMenu .mi').forEach(el=>{const a=el.dataset.a; if(!MI[a]||el.querySelector('svg'))return;
    const t=el.innerHTML.replace(/^\s*(?:[\u2190-\u2BFF\u2300-\u23FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|\uD83E[\uDD00-\uDFFF]|\uFE0F|\s)+/,'');
    el.innerHTML=ic(MI[a])+'<span class="mt">'+t+'</span>';});
  const lb=$('ovImg'); if(lb&&!lb.querySelector('.lbnav')){
    lb.insertAdjacentHTML('beforeend',`<button class="lbnav prev" title="Ảnh trước (←)">${ic('left')}</button><button class="lbnav next" title="Ảnh sau (→)">${ic('right')}</button>`);
    lb.querySelector('.prev').onclick=e=>{e.stopPropagation();lbMove(-1);}; lb.querySelector('.next').onclick=e=>{e.stopPropagation();lbMove(1);};}
}
function syncNav(){
  buildNav();
  const s0=SECS.find(x=>x.k===state.sec)||SECS[0];
  $('crumbs').innerHTML=
    `<span class="lk hidesm" data-go="tq">Kênh Phân phối</span><span class="sep hidesm">›</span>`+
    `<b>${esc(secT(s0.k))}</b><span class="sep">·</span>`+
    `<span class="hidesm">Báo cáo tồn kho · ${PER()}</span>`;
  const lk=$('crumbs').querySelector('[data-go]');
  if(lk)lk.onclick=()=>go('tq');
  const it=$('nav').querySelector('.nitem.on');
  if(it)it.scrollIntoView({block:'nearest'});
}
function toggleSb(){
  if(window.innerWidth<=1020) document.body.classList.toggle('sbshow');
  else document.body.classList.toggle('sbhide');
  setTimeout(()=>CH.forEach(c=>{try{c.resize();}catch(e){}}),280);
}
function setToolbar(on){
  state.toolbar=on; $('tools').classList.toggle('collapsed',!on);
  const b=$('btnMore'); b.setAttribute('aria-expanded',on?'true':'false');
  saveCfg();
}
function buildMonths(){
  let h='';
  for(let i=1;i<=12;i++)h+=`<option value="${i}"${i===state.m?' selected':''}>Tháng ${i}</option>`;
  $('fMonth').innerHTML=h;
}
function openMenu(){
  const m=$('moreMenu'); m.classList.toggle('show');
  $('miLockT').textContent=state.unlocked?'Khoá lại':'Mở khoá quản trị';
}

/* ---------- TRUY VẾT Ô NGUỒN (G3) ---------- */
function srcOpen(key,mi){
  const m=(mi===undefined?state.m-1:mi)+1;
  const k=KPI[+key]; if(!k)return;
  const ckt={sum:'Cộng dồn T1..T'+m,avg:'Bình quân số học các tháng có số T1..T'+m,
    last:'Lấy giá trị tháng gần nhất có số (chỉ tiêu tồn / quy mô)',ratio:'Σ tử số ÷ Σ mẫu số T1..T'+m+' (không bình quân các tỷ lệ)'}[k.ck]||k.ck;
  const parts=(k.parts||[]).map(i=>KPI[i]).filter(Boolean);
  const chk=(()=>{ if(!parts.length||k.ck==='avg')return null;
    const s=parts.reduce((a,x)=>a+(nul(x.th[m-1])?0:x.th[m-1]),0);
    return {t:parts.map(x=>gshort(x.nhom)+' '+fmt(x,x.th[m-1])).join(' + ')+' = '+n0(s),ok:Math.abs(s-(k.th[m-1]||0))<0.5};})();
  const h=`<h2>🔎 Truy vết ô nguồn<button class="xclose" onclick="hide2('ovSrc')">×</button></h2>
    <div class="msub">${esc(kname(k))} · ${esc(BPN[k.bp]||'')} · Tháng ${m}/${DATA.meta.y}</div>
    <div class="srcrow">
      <b>File nguồn</b><span>${esc(DATA.meta.file||'BC_MKT_2026.xlsx')}</span>
      ${k.src.th?`<b>Ô thực hiện</b><span><code>${esc(cellOf(k,m-1))}</code> → ${fmt(k,k.th[m-1])} ${esc(unitOf(k))}</span>`
        :`<b>Công thức</b><span>${esc(k.calc||'Tự tính')}</span>`}
      ${k.note?`<b>Ghi chú Excel</b><span>${esc(k.note)}</span>`:''}
      <b>Chiều chỉ tiêu</b><span>${k.pol===-1?'Nghịch chiều — càng THẤP càng tốt':'Thuận chiều — càng cao càng tốt'}</span>
      <b>So tháng trước</b><span class="${trendCls(dl(k.th[m-1],m>1?k.th[m-2]:null),k.pol)}">${arw(dl(k.th[m-1],m>1?k.th[m-2]:null))}</span>
      <b>Quy tắc lũy kế</b><span>${esc(ckt)}</span>
      <b>Lũy kế / BQ đến T${m}</b><span>${fmt(k,cum(k,m))} ${esc(unitOf(k))}</span>
    </div>
    ${chk?`<div class="dqi ${chk.ok?'':'r'}" style="margin-top:12px"><div class="ic">${chk.ok?'✅':'⚠️'}</div>
      <div class="bd"><b>Đối chiếu cấu phần</b><p>${esc(chk.t)} — ${chk.ok?'khớp':'<b>LỆCH</b>'}</p></div></div>`:''}
    <div class="tw" style="margin-top:12px"><table><thead><tr><th>Tháng</th><th>Ô Excel</th><th>Thực hiện</th><th>vs tháng trước</th><th>Lũy kế / BQ</th></tr></thead><tbody>
    ${MLAB.slice(0,state.m).map((L,i)=>`<tr${i===m-1?' class="sum"':''}><td>${L}</td>
      <td class="mu">${esc(cellOf(k,i)||'tự tính')}</td><td>${fmt(k,k.th[i])}</td>
      <td class="${trendCls(dl(k.th[i],i?k.th[i-1]:null),k.pol)}">${arw(dl(k.th[i],i?k.th[i-1]:null))}</td><td>${fmt(k,cum(k,i+1))}</td></tr>`).join('')}</tbody></table></div>
    <div style="display:flex;gap:8px;margin-top:14px">
      <button class="btn ghost" onclick="csvKPI(${k.i})">⬇ Xuất CSV bảng truy vết</button>
      <button class="btn ghost" onclick="hide2('ovSrc');drillOpen(${k.i})">📊 Xem diễn biến 12 tháng</button></div>`;
  $('srcBody').innerHTML=h; $('ovSrc').classList.add('show');
}
function dlCSV(name,rows){
  const csv='﻿'+rows.map(r=>r.map(c=>'"'+String(c===null||c===undefined?'':c).replace(/"/g,'""')+'"').join(';')).join('\n');
  const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));
  a.download=name; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),1500);
}
function csvKPI(i){
  const k=KPI[i], R=[['Chỉ tiêu',kname(k)],['Mục',BPN[k.bp]],['ĐVT',k.dvt||''],
    ['Chiều',k.pol===-1?'Nghịch chiều':'Thuận chiều'],['Quy tắc lũy kế',k.ck],['Ghi chú Excel',k.note||k.calc||''],[],
    ['Tháng','Ô Excel','Thực hiện','Lũy kế / BQ']];
  for(let m=0;m<12;m++)R.push([MLAB[m],cellOf(k,m)||'tự tính',k.th[m],cum(k,m+1)]);
  dlCSV('truyvet_'+k.ct.replace(/[^\wÀ-ỹ]+/g,'_')+'.csv',R);
}

/* ---------- DRILL-DOWN 3 CẤP (G2) ---------- */
function drillOpen(key,lvl,mm){
  const k=KPI[+key], m=mm||state.m;
  lvl=lvl||2;
  PEND=[];
  let h=`<h2>${lvl===2?'📈 Diễn biến 12 tháng':'🔍 Phân rã tháng '+m}
      <button class="xclose" onclick="hide2('ovDrill')">×</button></h2>
    <div class="msub"><span style="cursor:pointer;color:var(--brand)" onclick="hide2('ovDrill')">${esc(BPN[k.bp])}</span>
      › ${lvl===3?`<span style="cursor:pointer;color:var(--brand)" onclick="drillOpen(${k.i},2)">${esc(kname(k))}</span> › Tháng ${m}`:esc(kname(k))}
      &nbsp;·&nbsp; <span class="kbd">Backspace</span> lùi 1 cấp</div>`;
  if(lvl===2){
    h+=cbox('dz1','h320',null); /* thay bằng cfg bên dưới */
    PEND=[];
    TTX={k:k,f:v=>fmt(k,v)};
    h=h.replace('<canvas id="dz1"></canvas>','<canvas id="dz1"></canvas>');
    PEND.push({id:'dz1',cfg:{type:'bar',data:dsTHKHCK(k),options:baseOpt({
      onClick:(e,el)=>{if(el.length)drillOpen(k.i,3,el[0].index+1);},
      plugins:{legend:baseOpt().plugins.legend,tooltip:TT(),datalabels:{display:false}},
      scales:{x:{grid:{display:false},ticks:{color:C.mut,font:{size:10.5}}},
        y:{grace:'14%',grid:{color:C.grid},border:{display:false},
           ticks:{color:C.mut,font:{size:10.5},callback:v=>k.dvt==='%'?(v/pscale(k)*100).toFixed(0)+'%':nd(v,2)}}}})}});
    h+=`<div class="psub" style="margin-top:10px">📌 ${cmtKPI(k)} <b>Bấm vào cột bất kỳ</b> để xem phân rã tháng đó.</div>`;
    h+=`<div class="tw" style="margin-top:12px"><table><thead><tr><th>Tháng</th><th>Thực hiện</th><th>vs tháng trước</th><th>vs BQ các tháng trước</th><th>Lũy kế / BQ</th></tr></thead><tbody>
      ${MLAB.slice(0,state.m).map((L,i)=>{const pv=i?k.th[i-1]:null,bq=avgPrev(k.th,i+1);
        return `<tr><td>${L}</td><td><b>${fmt(k,k.th[i])}</b></td>
          <td class="${trendCls(dl(k.th[i],pv),k.pol)}">${arw(dl(k.th[i],pv))}</td>
          <td class="${trendCls(dl(k.th[i],bq),k.pol)}">${arw(dl(k.th[i],bq))}</td>
          <td>${fmt(k,cum(k,i+1))}</td></tr>`;}).join('')}</tbody></table></div>`;
  }else{
    const th=k.th[m-1],kh=k.kh[m-1],cy=k.cy[m-1],pv=m>1?k.th[m-2]:null,r=rateKH(k,m);
    h+=`<div class="kpis" style="margin-bottom:12px">
      ${[['Thực hiện T'+m,fmt(k,th),'n'],['Tháng trước',fmt(k,pv),'n'],
         ['vs tháng trước',arw(dl(th,pv)),trendCls(dl(th,pv),k.pol)],
         ['BQ các tháng trước',fmt(k,avgPrev(k.th,m)),'n'],['vs BQ',arw(dl(th,avgPrev(k.th,m))),trendCls(dl(th,avgPrev(k.th,m)),k.pol)],
         [k.ck==='sum'?'Lũy kế T1–T'+m:'Lũy kế / BQ',fmt(k,cum(k,m)),'n']]
        .map(x=>`<div class="kpi ${x[2]}" style="cursor:default"><div class="kl"><b>${x[0]}</b></div>
          <div class="kv" style="font-size:19px">${x[1]}</div></div>`).join('')}</div>`;
    const nx=k.nx[m-1]||k.note;
    if(nx)h+=`<div class="dqi"><div class="ic">📝</div><div class="bd"><b>Ghi chú của bộ phận</b><p>${esc(nx)}</p></div></div>`;
    /* cấu phần nếu có */
    const comp=drillParts(k,m);
    if(comp)h+='<div style="margin-top:12px">'+comp+'</div>';
    h+=`<div style="display:flex;gap:8px;margin-top:14px">
      <button class="btn ghost" onclick="drillOpen(${k.i},2)">← Về diễn biến 12 tháng</button>
      <button class="btn ghost" onclick="hide2('ovDrill');srcOpen(${k.i},${m-1})">🔎 Truy vết ô nguồn</button></div>`;
  }
  $('drillBody').innerHTML=h; $('ovDrill').classList.add('show');
  state.drill={k:k.i,lvl:lvl,m:m};
  const pend=PEND.slice(); PEND=[];
  pend.forEach(p=>{const el=$(p.id);if(el&&p.cfg){try{CH.push(new Chart(el.getContext('2d'),p.cfg));}catch(e){}}});
}
function drillParts(k,m){
  const parts=(k.parts||[]).map(i=>KPI[i]).filter(Boolean);
  if(parts.length){const tot=parts.reduce((a,x)=>a+(nul(x.th[m-1])?0:x.th[m-1]),0);
    return `<h3 style="font-size:12.6px;margin-bottom:7px">Cấu phần — ${esc(k.calc||'')}</h3>
      <div class="tw"><table><thead><tr><th>Thành phần</th><th>T${m}</th><th>Tỷ trọng</th><th>vs tháng trước</th></tr></thead><tbody>
      ${parts.map(x=>`<tr><td>${esc(kname(x))}</td><td>${fmt(x,x.th[m-1])}</td><td>${tot&&!nul(x.th[m-1])?pc(x.th[m-1]/tot):'–'}</td><td class="${trendCls(dl(x.th[m-1],x.th[m-2]),x.pol)}">${arw(dl(x.th[m-1],x.th[m-2]))}</td></tr>`).join('')}
      <tr class="sum"><td>TỔNG</td><td>${n0(tot)}</td><td>${nul(k.th[m-1])?'–':(Math.abs(tot-k.th[m-1])<0.5?'✅ khớp':'⚠️ lệch '+nd(k.th[m-1]-tot,2))}</td><td></td></tr></tbody></table></div>`;}
  const L=KPI.filter(x=>x.bp===k.bp&&x.nhom===k.nhom&&x.i!==k.i);
  if(!L.length)return null;
  return `<h3 style="font-size:12.6px;margin-bottom:7px">Các chỉ tiêu khác cùng nhóm “${esc(k.nhom)}” — T${m}</h3>
    <div class="tw"><table><thead><tr><th>Chỉ tiêu</th><th>T${m}</th><th>T${m-1}</th><th>vs tháng trước</th></tr></thead><tbody>
    ${L.map(x=>`<tr><td>${esc(x.ct)}</td><td>${fmt(x,x.th[m-1])}</td><td class="mu">${fmt(x,x.th[m-2])}</td>
      <td class="${trendCls(dl(x.th[m-1],x.th[m-2]),x.pol)}">${arw(dl(x.th[m-1],x.th[m-2]))}</td></tr>`).join('')}</tbody></table></div>`;
}

/* ---------- DRAWER CÀI ĐẶT ---------- */
function buildDrawer(){
  $('palrow').innerHTML=Object.keys(PALS).map(k=>{
    const p=PALS[k];
    return `<button class="pchip" data-pal="${k}" title="${esc(p.n)}">
      <i style="background:linear-gradient(135deg,${p.b},${p.d} 62%,${p.s})"></i><span>${esc(p.n)}</span></button>`;
  }).join('');
  $$('#palrow [data-pal]').forEach(b=>b.onclick=()=>{state.pal=b.dataset.pal;saveCfg();render();syncUI();});
  const sec=SECS.find(s=>s.k===state.sec);
  const blks=SECFN[sec.k]().map(h=>{
    const id=(h.match(/data-blk="([^"]+)"/)||[])[1];
    const t=(h.match(/data-name="([^"]*)"/)||[])[1]||id;
    return {id:id,t:t};}).filter(x=>x.id);
  $('blkToggles').innerHTML=blks.length?blks.map(b=>
    `<label class="ckline"><input type="checkbox" data-blk-t="${b.id}" ${(LAY[b.id]&&LAY[b.id].h)?'':'checked'}>
      ${esc(b.t.slice(0,54))}</label>`).join(''):'<div class="psub">Mục này không có khối tuỳ chọn.</div>';
  $$('#blkToggles [data-blk-t]').forEach(c=>c.onchange=()=>{
    const id=c.dataset.blkT; LAY[id]=LAY[id]||{}; LAY[id].h=!c.checked; saveCfg(); render();});
}
function syncUI(){
  $$('#palrow [data-pal]').forEach(b=>b.classList.toggle('on',b.dataset.pal===state.pal));
  $$('[data-mode-set]').forEach(b=>b.classList.toggle('on',b.dataset.modeSet===state.mode));
  const cb=[['ckLabels','labels'],['ckPrev','prev'],['ckAnim','anim']];
  cb.forEach(x=>{const e=$(x[0]);if(e)e.checked=state[x[1]];});
  $('btnLock').innerHTML=ic(state.unlocked?'unlock':'lock');
  $('btnMode').innerHTML=ic(state.mode==='dark'?'sun':'moon');
  $('btnMode').title=state.mode==='dark'?'Chuyển nền sáng (in / gửi mail)':'Chuyển nền tối (trình chiếu)';
  $('btnEdit').style.display=state.unlocked?'':'none';
  $('btnEdit').classList.toggle('on',state.editing);
  $('curPal').textContent=PALS[state.pal].n+' · '+(state.mode==='dark'?'Tối':'Sáng');
}
function openDrawer(){buildDrawer();syncUI();$('drawer').classList.add('show');}
const hide2=id=>{$(id).classList.remove('show');if(id==='ovDrill')state.drill=null;};

/* ---------- TRÌNH CHIẾU ---------- */
function togglePresent(on){
  const v=(on===undefined)?!document.body.classList.contains('present'):on;
  document.body.classList.toggle('present',v); state.present=v;
  if(v){try{document.documentElement.requestFullscreen&&document.documentElement.requestFullscreen();}catch(e){}}
  else{try{document.fullscreenElement&&document.exitFullscreen();}catch(e){}}
  setTimeout(()=>CH.forEach(c=>{try{c.resize();}catch(e){}}),260);
}
function moveSec(d){
  const i=SECS.findIndex(s=>s.k===state.sec);
  go(SECS[(i+d+SECS.length)%SECS.length].k);
}

/* ---------- COMMAND PALETTE ---------- */
let palF=[],palSel=0;
function palItems(){
  const L=SECS.map(s=>({t:secT(s.k),s:'Mục · '+s.g,go:()=>go(s.k),i:s.ico}));
  KPI.forEach(k=>L.push({t:kname(k),s:'Chỉ tiêu · '+BPN[k.bp],go:()=>{go(k.bp);setTimeout(()=>drillOpen(k.i),260);},i:'📊'}));
  Object.keys(PALS).forEach(p=>L.push({t:'Men '+PALS[p].n,s:'Đổi màu giao diện',go:()=>{state.pal=p;saveCfg();render();syncUI();},i:'🎨'}));
  for(let i=1;i<=12;i++)L.push({t:'Xem tháng '+i,s:'Đổi kỳ báo cáo',go:()=>{state.m=i;$('fMonth').value=i;saveCfg();render();},i:'📅'});
  L.push({t:'Chế độ '+(state.mode==='dark'?'Sáng':'Tối'),s:'Đổi nền',go:()=>{state.mode=state.mode==='dark'?'light':'dark';saveCfg();render();syncUI();},i:'◐'});
  L.push({t:'Xem theo Doanh thu',s:'Phím U',go:()=>setUnit('dt'),i:'💰'});
  L.push({t:'Xem theo Sản lượng',s:'Phím U',go:()=>setUnit('sl'),i:'📐'});
  L.push({t:'Trình chiếu toàn màn hình',s:'Phím F',go:()=>togglePresent(true),i:'▶'});
  L.push({t:'In báo cáo',s:'Chọn nội dung, xuất PDF slide',go:()=>openPrint(),i:'🖨'});
  L.push({t:'Lưu bản HTML hiện tại',s:'Đóng gói số liệu + bố cục thành 1 file',go:()=>saveHTML(),i:'💾'});
  L.push({t:'Xuất CSV toàn bộ chỉ tiêu',s:'Mở bằng Excel',go:()=>csvAll(),i:'⤓'});
  L.push({t:'Nạp file Excel mới',s:'Cập nhật số liệu',go:()=>$('fileIn').click(),i:'📂'});
  return L;
}
function palRender(q){
  const all=palItems(); q=(q||'').toLowerCase().trim();
  palF=q?all.filter(x=>(x.t+' '+x.s).toLowerCase().indexOf(q)>=0):all;
  palF=palF.slice(0,40); palSel=Math.min(palSel,palF.length-1); if(palSel<0)palSel=0;
  $('palList').innerHTML=palF.length?palF.map((x,i)=>
    `<div class="pgo ${i===palSel?'on':''}" data-pi="${i}"><span>${x.i}</span>
      <span><b>${esc(x.t)}</b></span><span class="k">${esc(x.s)}</span></div>`).join('')
    :'<div class="psub" style="padding:12px">Không tìm thấy.</div>';
  $$('#palList [data-pi]').forEach(e=>e.onclick=()=>palGo(+e.dataset.pi));
}
function palOpen(){palSel=0;$('palIn').value='';palRender('');$('ovPal').classList.add('show');setTimeout(()=>$('palIn').focus(),60);}
function palGo(i){const x=palF[i];if(!x)return;hide2('ovPal');x.go();}

/* ---------- KHOÁ QUẢN TRỊ & EDITOR ---------- */
function tryUnlock(){
  const v=$('pwdIn').value;
  if(v===PWK.map(c=>String.fromCharCode(c)).join('')){
    state.unlocked=true; hide2('ovPwd'); $('pwdIn').value=''; $('pwdErr').style.display='none';
    syncUI(); toast('Đã mở khoá chỉnh sửa bố cục và nội dung.');
  }else{$('pwdErr').style.display='';}
}
function toggleEdit(on){
  if(!state.unlocked){$('ovPwd').classList.add('show');setTimeout(()=>$('pwdIn').focus(),60);return;}
  state.editing=(on===undefined)?!state.editing:on;
  document.body.classList.toggle('editing',state.editing);
  syncUI(); render();
  if(state.editing)toast('Chế độ chỉnh sửa — ảnh: ＋ thêm · ◄► thứ tự · ✎ chú thích · ✕ bỏ. Trên mỗi khối: ◄► độ rộng · ⌄⌃ chiều cao biểu đồ · ▲▼ thứ tự · ▦ số thẻ trên 1 hàng · 📌 phân tích tự động · 🎨 màu khối (nền, viền, từng chuỗi biểu đồ, bảng) · ↺ khôi phục · ✕ ẩn. Bấm vào bất kỳ dòng phân tích nào (kể cả 📌 tự động và 📝 lấy từ Excel) để sửa. Bảng có thanh căn lề / khớp khung, kéo mép phải ô tiêu đề để chỉnh độ rộng cột. Màn hình GIỮ NGUYÊN vị trí sau mỗi thao tác.');
}
let DRAG=null;
function bindEditor(){
  $$('#grid .panel').forEach(el=>{
    const id=el.getAttribute('data-blk');
    el.style.opacity=(LAY[id]&&LAY[id].h)?'.42':'';
    el.setAttribute('draggable','true');
    el.ondragstart=e=>{DRAG=el;el.classList.add('drag');try{e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text','x');}catch(_){}};
    el.ondragend=()=>{el.classList.remove('drag');$$('#grid .panel').forEach(x=>x.classList.remove('over'));persistOrder();};
    el.ondragover=e=>{e.preventDefault();if(DRAG&&DRAG!==el)el.classList.add('over');};
    el.ondragleave=()=>el.classList.remove('over');
    el.ondrop=e=>{e.preventDefault();el.classList.remove('over');
      if(!DRAG||DRAG===el)return;
      const g=$('grid'), a=Array.prototype.slice.call(g.children);
      if(a.indexOf(DRAG)<a.indexOf(el))g.insertBefore(DRAG,el.nextSibling);else g.insertBefore(DRAG,el);
      persistOrder();};
    el.querySelectorAll('.lay button').forEach(b=>b.onclick=ev=>{
      ev.stopPropagation();
      const a=b.dataset.ly; LAY[id]=LAY[id]||{};
      const cur=+(el.className.match(/\bs([1-6])\b/)||[0,6])[1];
      const box=el.querySelector('.cbox');
      const curH=LAY[id].ht||(box?Math.round(box.getBoundingClientRect().height):260);
      if(a==='l')LAY[id].s=Math.max(2,cur-1);
      if(a==='r')LAY[id].s=Math.min(6,cur+1);
      if(a==='hm')LAY[id].ht=Math.max(150,curH-40);
      if(a==='hp')LAY[id].ht=Math.min(760,curH+40);
      if(a==='pr'){const seq=[0,2,3,4,5,6,7,8];
        const i=seq.indexOf(LAY[id].pr||0);
        const nx=seq[(i+1)%seq.length];
        if(nx)LAY[id].pr=nx; else delete LAY[id].pr;
        toast(nx?('Dải thẻ: '+nx+' thẻ / hàng — cỡ chữ tự căn lại cho vừa khung.'):'Dải thẻ: tự động chia cột theo bề ngang màn hình.');}
      if(a==='na'){if(LAY[id].na)delete LAY[id].na;else LAY[id].na=1;}
      if(a==='rs'){delete LAY[id];
        Object.keys(TXT).forEach(x=>{if(x.indexOf('n.'+id+'.')===0)delete TXT[x];});
        delete TXT['t.'+id]; delete TXT['s.'+id];}
      if(a==='h')LAY[id].h=true;
      if(a==='u'||a==='d'){const g=$('grid'),arr=Array.prototype.slice.call(g.children),i=arr.indexOf(el);
        const j=i+(a==='u'?-1:1); if(j>=0&&j<arr.length){a==='u'?g.insertBefore(el,arr[j]):g.insertBefore(arr[j],el);}
        persistOrder();}
      saveCfg(); render();});
  });
  $$('#grid [data-tk]').forEach(el=>{
    el.setAttribute('contenteditable','true');
    el.onblur=()=>{TXT[el.dataset.tk]=el.textContent.trim();saveCfg();};
    el.onkeydown=e=>{if(e.key==='Escape'||e.key==='Enter'){e.preventDefault();el.blur();}};
  });
  /* ---- sửa / xoá / thêm dòng insight ---- */
  $$('#grid [data-ins]').forEach(box=>{
    const sec=box.dataset.ins;
    const cur=()=>Array.prototype.slice.call(box.querySelectorAll('.iltx')).map(x=>x.innerHTML.trim());
    const put=arr=>{TXT[insKey(sec)]=arr.filter(x=>x!=='');saveCfg();render();};
    box.querySelectorAll('.iltx').forEach(el=>{
      el.setAttribute('contenteditable','true'); el.classList.add('tkedit');
      el.onblur=()=>put(cur());
      el.onkeydown=e=>{if(e.key==='Escape'){e.preventDefault();el.blur();}};
    });
    box.querySelectorAll('[data-ildel]').forEach(b=>b.onclick=e=>{
      e.preventDefault(); const i=+b.dataset.ildel;
      const a=cur(); a.splice(i,1); put(a);});
    const add=box.querySelector('[data-iladd]');
    if(add)add.onclick=e=>{e.preventDefault();const a=cur();a.push('Nội dung mới…');put(a);};
  });
  /* ---- đổi dạng biểu đồ ---- */
  $$('#grid [data-ct]').forEach(b=>b.onclick=e=>{
    e.preventDefault(); e.stopPropagation();
    const p=b.dataset.ct.split(':'), id=p[0], k=p[1];
    LAY[id]=LAY[id]||{}; if(k==='def')delete LAY[id].ct; else LAY[id].ct=k;
    saveCfg(); render();
  });
  /* ---- sửa DÒNG PHÂN TÍCH: cả tự động (📌 📈) lẫn nhận xét lấy từ Excel (📝) ---- */
  $$('#grid [data-tkh]').forEach(n=>{
    const key=n.dataset.tkh;
    const isX=n.classList.contains('nexcel');
    const tgt=n.querySelector('.ntx')||n;
    tgt.setAttribute('contenteditable','true');
    tgt.classList.add('tkedit');
    tgt.onfocus=()=>{const w=n.querySelector('.nwarn'); if(w)w.remove();};
    tgt.onblur=()=>{
      const v=tgt.innerHTML.trim(), o=n.getAttribute('data-orig')||'';
      if(v===o||v==='')delete TXT[key]; else TXT[key]=v;
      saveCfg(); render();
    };
    tgt.onkeydown=e=>{if(e.key==='Escape'){e.preventDefault();tgt.innerHTML=n.getAttribute('data-orig')||'';tgt.blur();}};
  });
  /* ---- chỉnh BẢNG: căn lề, khớp nội dung / khớp khung ---- */
  $$('#grid [data-tb]').forEach(b=>b.onclick=e=>{
    e.preventDefault(); e.stopPropagation();
    const p=b.dataset.tb.split(':'), id=p[0], key=p[1], val=p[2];
    LAY[id]=LAY[id]||{}; LAY[id].tb=LAY[id].tb||{};
    if(key==='cwrs'){delete LAY[id].tb.cw;}
    else if(!val||LAY[id].tb[key]===val)delete LAY[id].tb[key];
    else LAY[id].tb[key]=val;
    if(!Object.keys(LAY[id].tb).length)delete LAY[id].tb;
    saveCfg(); render();
  });
  /* ---- kéo mép phải ô tiêu đề để chỉnh độ rộng cột ---- */
  $$('#grid .panel').forEach(el=>{
    const id=el.getAttribute('data-blk');
    el.querySelectorAll('.tw').forEach((tw,ti)=>{
      const t=tw.querySelector('table'); if(!t)return;
      t.querySelectorAll('thead th').forEach((th,ci)=>{
        if(th.querySelector('.crs'))return;
        const h=document.createElement('span'); h.className='crs'; th.appendChild(h);
        h.onmousedown=ev=>{
          ev.preventDefault(); ev.stopPropagation();
          const x0=ev.clientX, w0=th.getBoundingClientRect().width;
          const mv=e2=>{
            const w=Math.max(46,Math.round(w0+(e2.clientX-x0)));
            LAY[id]=LAY[id]||{}; LAY[id].tb=LAY[id].tb||{}; LAY[id].tb.cw=LAY[id].tb.cw||{};
            LAY[id].tb.cw[ti]=LAY[id].tb.cw[ti]||{};
            LAY[id].tb.cw[ti][ci]=w;
            applyTb(el,LAY[id].tb);
          };
          const up=()=>{document.removeEventListener('mousemove',mv);
            document.removeEventListener('mouseup',up); saveCfg();};
          document.addEventListener('mousemove',mv); document.addEventListener('mouseup',up);
        };
      });
    });
  });
}
function persistOrder(){
  LAY['__ord_'+state.sec]=Array.prototype.slice.call($('grid').children).map(x=>x.getAttribute('data-blk'));
  saveCfg();
}
function resetScope(sc){
  if(sc==='layout'){Object.keys(LAY).forEach(k=>delete LAY[k]);}
  if(sc==='text'){TXT={};}
  if(sc==='ins'){Object.keys(TXT).forEach(k=>{if(k.indexOf('ins.')===0||k.indexOf('inst.')===0||k.indexOf('n.')===0)delete TXT[k];});}
  if(sc==='logo'){LOGO=null;}
  if(sc==='gal'){GAL={};CAP={};FIT={};Object.keys(LAY).forEach(k=>{if(LAY[k]&&LAY[k].im)delete LAY[k].im;});}
  if(sc==='view'){state.mode='dark';state.pal='cham';state.labels=true;state.prev=true;state.anim=true;}
  if(sc==='all'){LAY={};TXT={};LOGO=null;GAL={};CAP={};state.mode='dark';state.pal='cham';state.u='dt';state.lv={dt:2,sl:1};
    state.labels=true;state.prev=true;state.anim=true;state.sec='tq';}
  saveCfg(); hide2('ovReset'); applyLogo(); render(); syncUI(); toast('Đã khôi phục mặc định.');
}
function applyLogo(){
  const e=$('brandLogo');
  if(LOGO){e.outerHTML=`<img id="brandLogo" class="blogo" src="${LOGO}" alt="logo">`;}
  else{e.outerHTML=`<div id="brandLogo" class="blogo">CMC</div>`;}
}
let toastT=null;
function toast(t){
  let e=$('toast');
  if(!e){e=document.createElement('div');e.id='toast';
    e.style.cssText='position:fixed;left:50%;bottom:22px;transform:translateX(-50%);z-index:400;'+
      'background:#0C1420;color:#fff;padding:11px 16px;border-radius:11px;font-size:12.6px;max-width:88vw;'+
      'box-shadow:0 16px 44px -14px rgba(0,0,0,.7);border:1px solid rgba(255,255,255,.14);opacity:0;transition:.2s';
    document.body.appendChild(e);}
  e.textContent=t; e.style.opacity='1';
  clearTimeout(toastT); toastT=setTimeout(()=>e.style.opacity='0',4200);
}




