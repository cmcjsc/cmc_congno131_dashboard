



/* ══════════════════════════════════════════════════════════════
   IN BÁO CÁO KIỂU SLIDE — chọn nội dung · bìa · mục lục ·
   trang ngăn mỗi mục · tiêu đề + số trang mỗi trang
   ══════════════════════════════════════════════════════════════ */
const PRINT={secs:null,cover:true,toc:true,divider:true,notes:true,land:true,
  fmt:'pdf', tCover:'a', tToc:'a', tDiv:'a', scale:2};
const printSel=()=>PRINT.secs||SECS.map(s=>s.k);

/* 6 mẫu slide — chọn riêng cho bìa / mục lục / trang ngăn */
const CVT=[
  ['a','Dải thương hiệu bên trái','Dải màu dọc + chữ căn trái — trang trọng, dễ đọc'],
  ['b','Nền đậm toàn trang','Nền navy đậm, chữ trắng — nổi bật khi trình chiếu'],
  ['c','Tối giản đường kẻ','Trắng, chỉ dùng đường kẻ mảnh — tinh gọn, hợp in đen trắng'],
  ['d','Khối màu góc trên','Khối màu lớn phía trên, nội dung phía dưới'],
  ['e','Viền khung cổ điển','Khung viền quanh trang — trang trọng kiểu báo cáo giấy'],
  ['f','Chia đôi trái – phải','Nửa trái màu thương hiệu, nửa phải nội dung']
];
const cvName=k=>(CVT.find(x=>x[0]===k)||CVT[0])[1];

function openPrint(){
  const sel=printSel();
  const rows=SECS.map(s=>{
    const on=sel.indexOf(s.k)>=0;
    const n=SECFN[s.k]().filter(h=>{
      const id=(h.match(/data-blk="([^"]+)"/)||[])[1];
      return id&&!(LAY[id]&&LAY[id].h);}).length;
    return `<label class="prow ${on?'on':''}" data-ps="${s.k}">
      <input type="checkbox" ${on?'checked':''}>
      <span class="pnm">${s.ico} ${esc(secT(s.k))}</span>
      <span class="pmeta">${esc(s.g)} · ${n} khối</span></label>`;
  }).join('');
  const tsel=(id,cur)=>`<select class="msel wsel" id="${id}">`+CVT.map(c=>
    `<option value="${c[0]}" ${c[0]===cur?'selected':''}>${esc(c[1])}</option>`).join('')+`</select>`;
  $('printBody').innerHTML=`
    <h2>🖨 Xuất báo cáo<button class="xclose" onclick="hide2('ovPrint')">×</button></h2>
    <div class="msub">Bản xuất được dàn thành từng trang như slide: bìa, mục lục, trang ngăn mỗi mục,
      tiêu đề và số trang ở mỗi trang.</div>
    <h4 class="phd">Định dạng xuất</h4>
    <div class="segs fmtseg">
      <button data-fmt="pdf"  class="${PRINT.fmt==='pdf'?'on':''}">📄 PDF · in trình duyệt</button>
      <button data-fmt="pptx" class="${PRINT.fmt==='pptx'?'on':''}">📊 PowerPoint (.pptx)</button>
    </div>
    <div class="psub" id="fmtNote" style="margin-top:6px"></div>
    <h4 class="phd">Chọn mục cần xuất</h4>
    <div class="prowbar">
      <button class="fpill" id="pAll">Chọn tất cả</button>
      <button class="fpill" id="pNone">Bỏ chọn tất cả</button>
      <span id="pCount" style="margin-left:auto;font-size:11.7px;color:var(--mut)"></span>
    </div>
    <div class="plist">${rows}</div>
    <h4 class="phd">Trang bìa · mục lục · trang ngăn</h4>
    <div class="popts">
      <label class="ckline"><input type="checkbox" id="pCover" ${PRINT.cover?'checked':''}> Trang bìa</label>
      <label class="ckline"><input type="checkbox" id="pToc" ${PRINT.toc?'checked':''}> Mục lục</label>
      <label class="ckline"><input type="checkbox" id="pDiv" ${PRINT.divider?'checked':''}> Trang ngăn trước mỗi mục</label>
    </div>
    <div class="tmap">
      <div class="tmrow"><span>Mẫu trang bìa</span>${tsel('pTC',PRINT.tCover)}</div>
      <div class="tmrow"><span>Mẫu trang mục lục</span>${tsel('pTT',PRINT.tToc)}</div>
      <div class="tmrow"><span>Mẫu trang ngăn mục</span>${tsel('pTD',PRINT.tDiv)}</div>
      <div class="psub" id="tmHint"></div>
    </div>
    <h4 class="phd">Tuỳ chọn khác</h4>
    <div class="popts">
      <label class="ckline"><input type="checkbox" id="pNotes" ${PRINT.notes?'checked':''}> Xuất cả dòng nhận xét dưới biểu đồ</label>
      <label class="ckline"><input type="checkbox" id="pLand" ${PRINT.land?'checked':''}> Khổ ngang (bỏ tick = khổ dọc)</label>
    </div>
    <div style="display:flex;gap:8px;margin-top:16px">
      <button class="btn" id="pGo">🖨 Tạo bản xuất</button>
      <button class="btn ghost" style="margin-left:auto" onclick="hide2('ovPrint')">Huỷ</button>
    </div>`;
  const upd=()=>{
    const n=$$('#printBody .prow input:checked').length;
    $('pCount').textContent=n+'/'+SECS.length+' mục được chọn';
    $$('#printBody .prow').forEach(r=>r.classList.toggle('on',r.querySelector('input').checked));
    $('fmtNote').innerHTML=(PRINT.fmt==='pptx')
      ? '📊 Tạo file <b>.pptx</b> mở thẳng bằng PowerPoint. Slide dàn <b>y hệt bản PDF</b> (cùng số trang, cùng bố cục) và mọi thứ đều <b>sửa được</b>: chữ là hộp văn bản, bảng là bảng PowerPoint, biểu đồ là biểu đồ PowerPoint có workbook nhúng (<b>Edit Data</b> sửa được số liệu). Không dán ảnh, một font duy nhất cho cả file.'
      : '📄 Mở hộp thoại in của trình duyệt — chọn <b>“Lưu thành PDF”</b>, đặt lề <b>None/Không</b> và bật <b>“Background graphics”</b> để giữ đúng màu.';
    $('tmHint').textContent=(CVT.find(x=>x[0]===$('pTC').value)||CVT[0])[2];
    $('pGo').textContent=(PRINT.fmt==='pptx')?'📊 Xuất PowerPoint':'📄 Tạo bản in PDF';
  };
  $$('#printBody .prow input').forEach(el=>el.onchange=upd);
  $$('#printBody [data-fmt]').forEach(b=>b.onclick=e=>{
    e.preventDefault(); PRINT.fmt=b.dataset.fmt;
    $$('#printBody [data-fmt]').forEach(x=>x.classList.toggle('on',x===b)); upd();});
  ['pTC','pTT','pTD'].forEach(id=>{$(id).onchange=upd;});
  $('pAll').onclick =e=>{e.preventDefault();$$('#printBody .prow input').forEach(i=>i.checked=true);upd();};
  $('pNone').onclick=e=>{e.preventDefault();$$('#printBody .prow input').forEach(i=>i.checked=false);upd();};
  $('pGo').onclick=()=>{
    PRINT.secs=$$('#printBody .prow').filter(r=>r.querySelector('input').checked).map(r=>r.dataset.ps);
    PRINT.cover=$('pCover').checked; PRINT.toc=$('pToc').checked;
    PRINT.divider=$('pDiv').checked; PRINT.notes=$('pNotes').checked; PRINT.land=$('pLand').checked;
    PRINT.tCover=$('pTC').value; PRINT.tToc=$('pTT').value; PRINT.tDiv=$('pTD').value;
    if(!PRINT.secs.length){alert('Chưa chọn mục nào để xuất.');return;}
    hide2('ovPrint'); buildPrint();
  };
  upd(); $('ovPrint').classList.add('show');
}

function ppHead(title,per){
  return `<header class="pph"><div class="phm">CMC</div>
    <div class="pht">${esc(title)}</div><div class="php">${esc(per)}</div></header>`;
}
function ppFoot(n){
  return `<footer class="ppf"><span>Công ty cổ phần CMC · Công nợ &amp; thu tiền TK 131</span>
    <span class="pgn">${n}</span></footer>`;
}
const wait=ms=>new Promise(r=>setTimeout(r,ms));
/* Chart.js giữ nguyên tooltip đang hiện trên canvas -> khi chụp sang bản in
   nó che mất biểu đồ. Phải xoá sạch trạng thái hover trước khi chụp. */
function clearTips(){
  (CH||[]).forEach(c=>{
    try{
      c.setActiveElements([]);
      if(c.tooltip&&c.tooltip.setActiveElements)c.tooltip.setActiveElements([],{x:0,y:0});
      if(c.getDatasetMeta)c.update('none');
    }catch(e){}
  });
}

async function buildPrint(){
  if(PRINT.fmt==='pptx')return buildDeck();      /* slide gốc — không dựng trang in HTML */
  const keep={sec:state.sec,anim:state.anim,mode:state.mode,edit:state.editing};
  state.anim=false; state.editing=false; document.body.classList.remove('editing');
  /* Bản xuất LUÔN dùng nền sáng: chữ đen trên giấy trắng. */
  state.mode='light'; applyTheme();
  document.documentElement.style.setProperty('--pgo',PRINT.land?'landscape':'portrait');

  const root=$('printRoot');
  root.className=PRINT.land?'land':'port';
  const secs=SECS.filter(s=>printSel().indexOf(s.k)>=0);
  const per=PER();
  let pages=[], n=0;
  const meta=[];   /* mô tả từng trang -> dùng lại khi xuất PowerPoint */

  if(PRINT.cover){
    n++;
    meta.push({kind:'cover',tpl:PRINT.tCover,per:per});
    pages.push(`<section class="pp cover" data-cv="${PRINT.tCover}">
      <div class="cvbar"></div>
      <div class="cvin">
        <div class="cvm">CMC</div>
        <div class="cvtitle">BÁO CÁO QUẢN TRỊ<br><b>CÔNG NỢ &amp; THU TIỀN</b></div>
        <div class="cvper">${esc(per)}</div>
        <div class="cvmeta">Công ty cổ phần CMC</div>
      </div>
    </section>`);
  }
  if(PRINT.toc){
    n++;
    let pg=n;
    const items=secs.map((s,i)=>{pg+=(PRINT.divider?1:0)+1;return {n:i+1,t:secT(s.k),p:pg};});
    meta.push({kind:'toc',tpl:PRINT.tToc,per:per,items:items,page:n});
    const toc=items.map(it=>
      `<li><span class="tcn">${String(it.n).padStart(2,'0')}</span>
        <span class="tct">${esc(it.t)}</span><span class="tcd"></span><span class="tcp">${it.p}</span></li>`).join('');
    pages.push(`<section class="pp toc" data-cv="${PRINT.tToc}"><div class="cvbar"></div>
      ${ppHead('MỤC LỤC',per)}
      <div class="ppb"><ol class="toc">${toc}</ol></div>${ppFoot(n)}</section>`);
  }

  for(let i=0;i<secs.length;i++){
    const s=secs[i];
    if(PRINT.divider){
      n++;
      meta.push({kind:'div',tpl:PRINT.tDiv,per:per,no:i+1,title:secT(s.k),sub:s.g,page:n});
      pages.push(`<section class="pp divider" data-cv="${PRINT.tDiv}"><div class="cvbar"></div>
        <div class="cvin">
          <div class="dvn">${String(i+1).padStart(2,'0')}</div>
          <div class="dvt">${esc(secT(s.k))}</div>
          <div class="dvs">${esc(s.g)} · ${esc(per)}</div>
        </div>${ppFoot(n)}</section>`);
    }
    state.sec=s.k; render({top:1});
    await wait(140);
    clearTips(); await wait(40);            /* xoá tooltip rồi mới chụp */
    const parts=splitPages(PRINT.land?640:980);
    parts.forEach((body,pi)=>{
      n++;
      meta.push({kind:'body',page:n});
      pages.push(`<section class="pp">
        ${ppHead(secT(s.k)+(parts.length>1?` (${pi+1}/${parts.length})`:''),per)}
        <div class="ppb">${body}</div>${ppFoot(n)}</section>`);
    });
  }

  root.innerHTML=pages.join('');
  document.body.classList.add('printing');
  window.scrollTo(0,0);
  await wait(60);
  fitKPInow(root);                         /* căn lại nhãn + cỡ số theo bề ngang trang giấy */
  fitPages(root);                          /* KHÔNG để trang nào bị cắt mất biểu đồ */

  const done=()=>{
    document.body.classList.remove('printing');
    root.innerHTML='';
    state.sec=keep.sec; state.anim=keep.anim; state.mode=keep.mode; state.editing=keep.edit;
    if(state.editing)document.body.classList.add('editing');
    applyTheme(); render({top:1}); syncUI();
    window.removeEventListener('afterprint',done);
  };

  window.addEventListener('afterprint',done);
  setTimeout(()=>{window.print();
    setTimeout(()=>{if(document.body.classList.contains('printing'))done();},1400);},300);
}

/* Trang nào cao hơn khung giấy -> thu nhỏ đồng đều cho vừa, thay vì cắt mất phần dưới.
   Đây chính là nguyên nhân trước đây nhiều biểu đồ bị hiện thiếu khi in. */
function fitPages(root){
  root.querySelectorAll('.pp .ppb').forEach(box=>{
    const inner=box.firstElementChild; if(!inner)return;
    inner.style.transform=''; inner.style.width=''; inner.style.transformOrigin='top left';
    const avail=box.clientHeight-2; if(avail<=0)return;
    if(inner.scrollHeight<=avail)return;              /* đã vừa trang */
    let f=1;
    for(let i=0;i<5;i++){
      const h=inner.scrollHeight;                     /* chiều cao ở bề ngang hiện tại */
      const eff=h*f;
      if(eff<=avail)break;
      const nf=Math.max(.40,avail/h);
      if(Math.abs(nf-f)<0.004){f=nf;break;}
      f=nf;
      inner.style.width=(100/f).toFixed(3)+'%';
      inner.style.transform='scale('+f.toFixed(4)+')';
    }
    /* chốt an toàn: nếu vẫn còn dư thì ép nhỏ thêm một nhịp nữa */
    let g=0;
    while(inner.scrollHeight*f>avail&&g++<6&&f>.40){
      f=Math.max(.40,f*avail/(inner.scrollHeight*f));
      inner.style.width=(100/f).toFixed(3)+'%';
      inner.style.transform='scale('+f.toFixed(4)+')';
    }
  });
}

/* Chụp #grid thành các TRANG: canvas -> ảnh, rồi gom theo HÀNG của lưới
   sao cho mỗi trang không vượt ngân sách chiều cao (px ở khổ giấy). */
function splitPages(budget){
  const src=$('content'), grid=$('grid');
  const pageW=PRINT.land?1032:682;
  const k=pageW/Math.max(src.clientWidth,1);
  const clean=el=>{
    el.querySelectorAll('.lay,.srcb,.hlp,.ctbar,.ildel,.iladd,.inshint,.crs,.nwarn').forEach(e=>e.remove());
    if(!PRINT.notes)el.querySelectorAll('.cnote').forEach(e=>e.remove());
    el.querySelectorAll('.tw').forEach(e=>{e.style.maxHeight='none';e.style.overflow='visible';});
    /* Dải thẻ KPI trên giấy: chọn số cột cân đối nhất để không còn ô trống lẻ loi */
    el.querySelectorAll('.kpis').forEach(g=>{
      if(g.style.gridTemplateColumns)return;        /* tôn trọng số cột người dùng đã đặt */
      const n=g.children.length; if(n<2)return;
      let best=Math.min(n,6), sc=1e9;
      for(let c=3;c<=Math.min(n,6);c++){
        const rows=Math.ceil(n/c), s2=(rows*c-n)*10+rows;
        if(s2<sc){sc=s2;best=c;}
      }
      g.style.gridTemplateColumns='repeat('+best+',minmax(0,1fr))';
      g.style.setProperty('--kf',String(KF[best]||1));
    });
    el.querySelectorAll('[contenteditable]').forEach(e=>e.removeAttribute('contenteditable'));
    el.querySelectorAll('.kv,.klkv').forEach(e=>{e.style.fontSize='';});
    return el;
  };
  /* Giữ đúng tỉ lệ biểu đồ bằng aspect-ratio -> không bị méo, không bị hụt chiều cao */
  const canvasToImg=(orig,clone)=>{
    const cs=orig.querySelectorAll('canvas'), cc=clone.querySelectorAll('canvas');
    for(let i=0;i<cc.length;i++){
      let url=''; try{url=cs[i].toDataURL('image/png');}catch(e){}
      const r=cs[i].getBoundingClientRect();
      const w=Math.max(r.width,1), h=Math.max(r.height,1);
      const img=document.createElement('img');
      img.src=url; img.style.display='block'; img.style.width='100%';
      img.style.height='auto'; img.style.aspectRatio=w.toFixed(2)+' / '+h.toFixed(2);
      cc[i].parentNode.replaceChild(img,cc[i]);
    }
  };
  if(!grid){const cl=clean(src.cloneNode(true));canvasToImg(src,cl);return [cl.innerHTML];}

  /* Khối quá cao mà chỉ là 1 BẢNG dài -> cắt bảng theo hàng sang nhiều trang,
     thay vì thu nhỏ đến mức không đọc được. */
  const splitTall=(el,budget)=>{
    const t=el.querySelector('table'); if(!t)return null;
    const tb=t.querySelector('tbody'); if(!tb)return null;
    const trs=Array.prototype.slice.call(tb.children);
    if(trs.length<8)return null;
    const hBlk=el.getBoundingClientRect().height*k;
    if(hBlk<=budget-13)return null;
    const hTab=t.getBoundingClientRect().height*k;
    const thd=t.querySelector('thead');
    const hHead=thd?thd.getBoundingClientRect().height*k:0;
    const over=hBlk-hTab;
    const rowH=Math.max(8,(hTab-hHead)/trs.length);
    const cap=Math.max(3,Math.floor((budget-over-hHead-20)/rowH));
    if(cap>=trs.length)return null;
    const out=[];
    for(let i=0;i<trs.length;i+=cap){
      const cl=el.cloneNode(true);
      canvasToImg(el,cl);
      const tb2=cl.querySelector('tbody');
      Array.prototype.slice.call(tb2.children).forEach((tr,j)=>{if(j<i||j>=i+cap)tr.remove();});
      if(i>0){const h3=cl.querySelector('h3');
        if(h3)h3.textContent=h3.textContent+' (tiếp — hàng '+(i+1)+'–'+Math.min(i+cap,trs.length)+'/'+trs.length+')';}
      out.push({pre:cl,h:over+hHead+Math.min(cap,trs.length-i)*rowH+8});
    }
    return out;
  };

  const blks=Array.prototype.slice.call(grid.children);
  const rows=[];
  blks.forEach(b=>{
    const t=Math.round(b.offsetTop/8);
    const parts=splitTall(b,budget);
    if(parts){parts.forEach(pp=>rows.push({t:t,els:[{el:b,pre:pp.pre}],h:pp.h}));return;}
    let r=rows.find(x=>x.t===t&&!x.solo);
    if(!r){r={t:t,els:[],h:0};rows.push(r);}
    r.els.push({el:b});
    r.h=Math.max(r.h,b.getBoundingClientRect().height*k);
  });
  rows.sort((a,b)=>a.t-b.t);
  const pages=[], cur={rows:[],h:0};
  const flush=()=>{if(cur.rows.length){pages.push(cur.rows.slice());cur.rows.length=0;cur.h=0;}};
  rows.forEach(r=>{
    if(cur.rows.length&&cur.h+r.h+13>budget)flush();
    cur.rows.push(r); cur.h+=r.h+13;
  });
  flush();
  return pages.map(pg=>{
    const wrap=document.createElement('div');
    wrap.className='grid';
    pg.forEach(r=>r.els.forEach(it=>{
      let cl;
      if(it.pre){cl=it.pre;}
      else{cl=it.el.cloneNode(true); canvasToImg(it.el,cl);}
      clean(cl); wrap.appendChild(cl);
    }));
    return wrap.outerHTML;
  });
}

/* ══════════════════════════════════════════════════════════════
   XUẤT POWERPOINT — SLIDE GỐC, SỬA ĐƯỢC
   Không dán ảnh: chữ là text box, bảng là bảng PowerPoint,
   biểu đồ là biểu đồ PowerPoint có workbook nhúng (Edit Data).
   ══════════════════════════════════════════════════════════════ */
const PCOL={ink:'101828',navy:'1F3864',brand:'8A5A32',brand2:'C08A5E',
  mut:'8794A5',soft:'EEF2F9',line:'D9E0EA',white:'FFFFFF'};

/* Bìa / mục lục / trang ngăn — chữ thật, theo mẫu slide người dùng chọn */
function pptCoverShapes(tpl,W,H,lines,kind,items){
  const sh=[]; let id=10;
  const dark=(tpl==='b');
  const ink=dark?PCOL.white:PCOL.navy;
  const sub=dark?'C9D3E4':PCOL.mut;
  const M=EMU(PRINT.land?22:18);
  let x=M, w=W-M*2, y=Math.round(H*0.30);

  if(tpl==='a'){ sh.push(pxRect(id++,0,0,EMU(11),H,PCOL.brand)); x=M+EMU(14); w=W-x-M; }
  if(tpl==='c'){ sh.push(pxRect(id++,x,Math.round(H*0.24),w,EMU(1),PCOL.line));
                 sh.push(pxRect(id++,x,Math.round(H*0.80),w,EMU(1),PCOL.line)); }
  if(tpl==='d'){ sh.push(pxRect(id++,0,0,W,Math.round(H*0.34),PCOL.navy));
                 sh.push(pxRect(id++,0,Math.round(H*0.34),W,EMU(3),PCOL.brand2)); y=Math.round(H*0.46); }
  if(tpl==='e'){ const t=EMU(2.4), g=EMU(9);
                 sh.push(pxRect(id++,g,g,W-g*2,t,PCOL.brand));
                 sh.push(pxRect(id++,g,H-g-t,W-g*2,t,PCOL.brand));
                 sh.push(pxRect(id++,g,g,t,H-g*2,PCOL.brand));
                 sh.push(pxRect(id++,W-g-t,g,t,H-g*2,PCOL.brand)); }
  if(tpl==='f'){ sh.push(pxRect(id++,0,0,Math.round(W*0.38),H,PCOL.navy));
                 x=Math.round(W*0.38)+M; w=W-x-M; }

  if(kind==='toc'){
    sh.push(pxSp(id++,x,EMU(16),w,EMU(14),[{al:'l',r:[{t:'MỤC LỤC',sz:24,b:1,c:ink}]}]));
    const rows=(items||[]).map(it=>({al:'l',before:7,
      r:[{t:String(it.n).padStart(2,'0')+'   ',sz:12,b:1,c:PCOL.brand},
         {t:it.t,sz:13,b:1,c:dark?PCOL.white:PCOL.ink},
         {t:'   ·  trang '+it.p,sz:11,c:sub}]}));
    sh.push(pxSp(id++,x,EMU(34),w,H-EMU(48),rows,{fit:1}));
    return sh;
  }
  if(kind==='div'){
    sh.push(pxSp(id++,x,y-EMU(26),w,EMU(26),[{al:'l',r:[{t:lines.no,sz:52,b:1,c:dark?'3E5680':'E6EBF3'}]}]));
    sh.push(pxSp(id++,x,y+EMU(2),w,EMU(22),[{al:'l',r:[{t:lines.title,sz:28,b:1,c:ink}]}],{fit:1}));
    sh.push(pxSp(id++,x,y+EMU(26),w,EMU(10),[{al:'l',r:[{t:lines.sub,sz:12,b:1,c:sub}]}]));
    return sh;
  }
  const al=(tpl==='c'||tpl==='e')?'ctr':'l';
  const cx=(al==='ctr')?M:x, cw=(al==='ctr')?(W-M*2):w;
  sh.push(pxSp(id++,cx,y-EMU(16),cw,EMU(12),[{al:al,r:[{t:'BÁO CÁO QUẢN TRỊ',sz:17,b:1,c:sub}]}]));
  sh.push(pxSp(id++,cx,y,cw,EMU(26),[{al:al,r:[{t:'CÔNG NỢ & THU TIỀN',sz:40,b:1,c:ink}]}],{fit:1}));
  sh.push(pxSp(id++,cx,y+EMU(28),cw,EMU(12),[{al:al,r:[{t:lines.per,sz:18,b:1,c:dark?PCOL.brand2:PCOL.brand}]}]));
  sh.push(pxSp(id++,cx,H-EMU(24),cw,EMU(10),[{al:al,r:[{t:'Công ty cổ phần CMC',sz:12,c:sub}]}]));
  return sh;
}

async function buildDeck(){
  const keep={sec:state.sec,anim:state.anim,mode:state.mode,edit:state.editing};
  state.anim=false; state.editing=false; document.body.classList.remove('editing');
  state.mode='light'; applyTheme();

  const pgW=PRINT.land?297:210, pgH=PRINT.land?210:297;
  const W=EMU(pgW), H=EMU(pgH);
  const M=EMU(14), TOP=EMU(24), BOT=H-EMU(16);
  const usableW=W-M*2, usableH=BOT-TOP;
  const secs=SECS.filter(s=>printSel().indexOf(s.k)>=0);
  const per=PER();
  const LAYREL=[RT('slideLayout'),'../slideLayouts/slideLayout1.xml'];

  toast('📊 Đang dựng slide PowerPoint theo đúng bố cục bản in…');
  await wait(40);

  /* ── 1 & 2. đếm số trang mỗi mục (để đánh số mục lục) ── */
  const nPages=[];
  for(const s of secs){
    state.sec=s.k; render({top:1});
    await wait(140); clearTips(); await wait(30);
    const grid=$('grid'), gr=grid.getBoundingClientRect();
    const kx=usableW/Math.max(gr.width,1);
    nPages.push(pageSplit(grid,usableH/kx).length);
  }
  let pg=(PRINT.cover?1:0)+(PRINT.toc?1:0);
  const toc=[];
  secs.forEach((s,i)=>{pg+=PRINT.divider?1:0; toc.push({n:i+1,t:secT(s.k),p:pg+1}); pg+=nPages[i];});

  /* ── 3. dựng slide ── */
  const slides=[], charts=[], media=[]; let no=0;
  /* màu thương hiệu slide theo men đang chọn */
  try{const P=PALS[state.pal]||PALS.lam; DC.brand=P.lb.replace('#','').toUpperCase(); DC.brand2=P.b.replace('#','').toUpperCase();
    PCOL.brand=DC.brand; PCOL.brand2=DC.brand2;}catch(e){}
  /* MỌI slide BẮT BUỘC có quan hệ tới slideLayout, nếu thiếu PowerPoint từ chối mở cả file */
  const push=(shapes,rels,bg)=>{
    let rl=(rels&&rels.length)?rels.slice():[];
    if(!rl.some(r=>r[0]===RT('slideLayout')))rl.unshift(LAYREL);
    slides.push({xml:pxSlide(shapes,bg),rels:rl});
  };

  if(PRINT.cover){no++;push(pptCoverShapes(PRINT.tCover,W,H,{per:per},'cover',null),[],
    PRINT.tCover==='b'?PCOL.navy:null);}
  if(PRINT.toc){no++;push(pptCoverShapes(PRINT.tToc,W,H,{per:per},'toc',toc),[],
    PRINT.tToc==='b'?PCOL.navy:null);}

  for(let i=0;i<secs.length;i++){
    const sec=secs[i];
    if(PRINT.divider){
      no++;
      push(pptCoverShapes(PRINT.tDiv,W,H,
        {no:String(i+1).padStart(2,'0'),title:secT(sec.k),sub:sec.g+' · '+per},'div',null),[],
        PRINT.tDiv==='b'?PCOL.navy:null);
    }
    /* render đúng mục này rồi đọc toạ độ THẬT của từng khối */
    state.sec=sec.k; render({top:1});
    await wait(140); clearTips(); await wait(40);
    const grid=$('grid'), gr=grid.getBoundingClientRect();
    const kx=usableW/Math.max(gr.width,1);
    const pages=pageSplit(grid,usableH/kx);

    pages.forEach((page,pi)=>{
      no++;
      const idr={n:40}, sh=[], rels=[LAYREL];
      const ttl=secT(sec.k)+(pages.length>1?` (${pi+1}/${pages.length})`:'');
      deckHead(sh,idr,W,ttl,per,no);

      /* chiều cao thực của trang -> thu nhỏ đều nếu vượt khung */
      let top0=1e9, bot0=-1e9;
      page.forEach(r=>r.els.forEach(el=>{
        const q=el.getBoundingClientRect();
        top0=Math.min(top0,q.top);
        bot0=Math.max(bot0,q.top+(r.slice?r.h:q.height));
      }));
      const needH=(bot0-top0)*kx;
      const f=needH>usableH?Math.max(0.45,usableH/needH):1;
      const k=kx*f;
      const ox=M+Math.max(0,Math.round((usableW-gr.width*k)/2));
      const o={sh:sh,idr:idr,gx:gr.left,gy:top0,k:k,f:f,ox:ox,oy:TOP,
               charts:charts,rels:rels,W:W,media:media};
      const ctx=deckCtx(o);
      page.forEach(r=>r.els.forEach(el=>emitNode(el,ctx,o,r.slice)));
      deckFoot(sh,idr,W,H,no);
      push(sh,rels,null);
    });
  }

  /* ── 4. đóng gói .pptx ── */
  const files=[];
  const add=(n,t)=>files.push({name:n,data:(typeof t==='string')?UTF8(t):t});
  let ct=XH+'<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
    +'<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
    +'<Default Extension="xml" ContentType="application/xml"/>'
    +'<Default Extension="xlsx" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"/>'
    +'<Default Extension="jpeg" ContentType="image/jpeg"/><Default Extension="png" ContentType="image/png"/>'
    +'<Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>'
    +'<Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/>'
    +'<Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>'
    +'<Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>'
    +'<Override PartName="/ppt/tableStyles.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.tableStyles+xml"/>'
    +'<Override PartName="/ppt/presProps.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presProps+xml"/>'
    +'<Override PartName="/ppt/viewProps.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.viewProps+xml"/>'
    +'<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>'
    +'<Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>';
  slides.forEach((_,i)=>{ct+='<Override PartName="/ppt/slides/slide'+(i+1)+'.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>';});
  charts.forEach(c=>{ct+='<Override PartName="/ppt/charts/chart'+c.n+'.xml" ContentType="application/vnd.openxmlformats-officedocument.drawingml.chart+xml"/>';});
  ct+='</Types>';
  add('[Content_Types].xml',ct);
  add('_rels/.rels',pxRels([[RT('officeDocument'),'ppt/presentation.xml'],
    [RTP('core-properties'),'docProps/core.xml'],
    [RT('extended-properties'),'docProps/app.xml']]));
  const iso=new Date().toISOString().replace(/\.\d+Z$/,'Z');
  add('docProps/core.xml',XH+'<cp:coreProperties '
    +'xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" '
    +'xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" '
    +'xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">'
    +'<dc:title>Phân tích công nợ TK 131 CMC — '+XE(per)+'</dc:title>'
    +'<dc:creator>Công ty cổ phần CMC</dc:creator>'
    +'<cp:lastModifiedBy>Công ty cổ phần CMC</cp:lastModifiedBy>'
    +'<dcterms:created xsi:type="dcterms:W3CDTF">'+iso+'</dcterms:created>'
    +'<dcterms:modified xsi:type="dcterms:W3CDTF">'+iso+'</dcterms:modified>'
    +'</cp:coreProperties>');
  add('docProps/app.xml',XH+'<Properties '
    +'xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" '
    +'xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">'
    +'<Application>Microsoft Office PowerPoint</Application>'
    +'<Slides>'+slides.length+'</Slides><Company>Công ty cổ phần CMC</Company>'
    +'<AppVersion>16.0000</AppVersion></Properties>');
  add('ppt/presProps.xml',XH+'<p:presentationPr xmlns:a="'+NSA+'" xmlns:r="'+NSR+'" xmlns:p="'+NSP+'"/>');
  add('ppt/viewProps.xml',XH+'<p:viewPr xmlns:a="'+NSA+'" xmlns:r="'+NSR+'" xmlns:p="'+NSP+'"/>');
  add('ppt/theme/theme1.xml',pxTheme());
  add('ppt/tableStyles.xml',XH+'<a:tblStyleLst xmlns:a="'+NSA+'" def="{5C22544A-7EE6-4342-B048-85BDC9FD1C3A}"/>');
  add('ppt/slideMasters/slideMaster1.xml',pxMaster());
  add('ppt/slideMasters/_rels/slideMaster1.xml.rels',
      pxRels([[RT('slideLayout'),'../slideLayouts/slideLayout1.xml'],[RT('theme'),'../theme/theme1.xml']]));
  add('ppt/slideLayouts/slideLayout1.xml',pxLayout());
  add('ppt/slideLayouts/_rels/slideLayout1.xml.rels',
      pxRels([[RT('slideMaster'),'../slideMasters/slideMaster1.xml']]));

  const prRels=[[RT('slideMaster'),'slideMasters/slideMaster1.xml']];
  slides.forEach((_,i)=>prRels.push([RT('slide'),'slides/slide'+(i+1)+'.xml']));
  prRels.push([RT('presProps'),'presProps.xml']);
  prRels.push([RT('viewProps'),'viewProps.xml']);
  prRels.push([RT('theme'),'theme/theme1.xml']);
  prRels.push([RT('tableStyles'),'tableStyles.xml']);
  add('ppt/_rels/presentation.xml.rels',pxRels(prRels));

  let sldIds='';
  slides.forEach((_,i)=>{sldIds+='<p:sldId id="'+(256+i)+'" r:id="rId'+(i+2)+'"/>';});
  add('ppt/presentation.xml',XH+'<p:presentation xmlns:a="'+NSA+'" xmlns:r="'+NSR+'" xmlns:p="'+NSP+'" saveSubsetFonts="1">'
    +'<p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId1"/></p:sldMasterIdLst>'
    +'<p:sldIdLst>'+sldIds+'</p:sldIdLst>'
    +'<p:sldSz cx="'+W+'" cy="'+H+'"/><p:notesSz cx="6858000" cy="9144000"/>'
    +'<p:defaultTextStyle><a:defPPr><a:defRPr lang="vi-VN"/></a:defPPr></p:defaultTextStyle></p:presentation>');

  slides.forEach((s,i)=>{
    add('ppt/slides/slide'+(i+1)+'.xml',s.xml);
    add('ppt/slides/_rels/slide'+(i+1)+'.xml.rels',pxRels(s.rels));
  });
  charts.forEach(c=>{
    add('ppt/charts/chart'+c.n+'.xml',c.xml);
    add('ppt/charts/_rels/chart'+c.n+'.xml.rels',
        pxRels([[RT('package'),'../embeddings/Data'+c.n+'.xlsx']]));
    add('ppt/embeddings/Data'+c.n+'.xlsx',c.book);
  });

  media.forEach(x=>add('ppt/media/'+x.name,x.data));
  const bin=zipMake(files);
  const name=stamp()+'_CMC_CongNo131_'+dStr(X.dmax).replace(/\//g,'')+'.pptx';
  dlBlob(new Blob([bin],{type:'application/vnd.openxmlformats-officedocument.presentationml.presentation'}),name);

  state.sec=keep.sec; state.anim=keep.anim; state.mode=keep.mode; state.editing=keep.edit;
  if(state.editing)document.body.classList.add('editing');
  applyTheme(); render({top:1}); syncUI();
  toast('📊 Đã xuất '+name+' — '+slides.length+' slide (đúng bố cục bản in), '
    +charts.length+' biểu đồ PowerPoint sửa được, '+media.length+' ảnh.');
}

/* ══════════════ LƯU BẢN HTML HIỆN TẠI ══════════════
   Đóng gói NGUYÊN TRẠNG đang xem thành 1 file .html chạy độc lập:
   số liệu đang dùng (kể cả file Excel vừa nạp), bố cục đã sửa, chữ đã sửa,
   logo, men màu, nền sáng/tối, kỳ báo cáo và mục đang mở.
   Người nhận chỉ cần mở file — không cần Excel, không cần mạng. */
function stamp(){
  const d=new Date();
  return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2);
}
function dlBlob(blob,name){
  const a=document.createElement('a'), u=URL.createObjectURL(blob);
  a.href=u; a.download=name; document.body.appendChild(a); a.click();
  setTimeout(()=>{URL.revokeObjectURL(u);a.remove();},600);
}
function saveHTML(){
  try{
    const c=document.documentElement.cloneNode(true);
    /* dọn phần động: khi mở lại, trang tự dựng lại từ đầu -> file gọn và không lệch trạng thái */
    ['content','grid','nav','crumbs','printRoot','palList','srcBody','drillBody','helpBody','printBody','blkToggles','palrow']
      .forEach(id=>{const e=c.querySelector('#'+id); if(e)e.innerHTML='';});
    const b=c.querySelector('body');
    b.className=''; b.removeAttribute('style');
    c.querySelectorAll('.ov.show,.drawer.show,.menu.show').forEach(e=>e.classList.remove('show'));
    c.querySelectorAll('[contenteditable]').forEach(e=>e.removeAttribute('contenteditable'));
    c.querySelectorAll('#injectState').forEach(e=>e.remove());
    {const di=c.querySelector('#dataInit'); if(di){di.removeAttribute('src');di.textContent='var DATA='+JSON.stringify(DATA).replace(/</g,'\\u003c')+';';}}
    /* KHÔNG lưu trạng thái đã mở khoá — file gửi đi vẫn phải nhập mật khẩu mới sửa được */
    const st=document.createElement('script'); st.id='injectState';
    st.textContent='window.__SAVED__='+JSON.stringify({
      LAY:LAY, TXT:TXT, LOGO:LOGO, GAL:GAL, CAP:CAP, FIT:FIT, IMGU:IMGU, KHID:KHID, KORD:KORD,
      view:{mode:state.mode,pal:state.pal,labels:state.labels,prev:state.prev,
            anim:state.anim,toolbar:state.toolbar,m:state.m,sec:state.sec,u:state.u,lv:state.lv,fx:state.fx,fxc:state.fxc,cgrad:state.cgrad,ly:state.ly,fk:state.fk,fv:state.fv,mi:state.mi,pm:state.pm,cmp:state.cmp,a0:state.a0,dcut:state.dcut,cf:state.cf,ct:state.ct,ksort:state.ksort},
      savedAt:new Date().toISOString()
    }).replace(/</g,'\\u003c')+';';
    b.appendChild(st);
    const name=stamp()+'_CMC_CongNo131_Dashboard_'+dStr(X.dmax).replace(/\//g,'')+'.html';
    dlBlob(new Blob(['<!DOCTYPE html>\n'+c.outerHTML],{type:'text/html;charset=utf-8'}),name);
    toast('💾 Đã lưu '+name+' — file chạy độc lập, giữ nguyên số liệu, bố cục và men màu đang xem.');
  }catch(e){
    console.error(e);
    alert('❌ Không lưu được bản HTML: '+e.message);
  }
}

/* ---------- xuất / nạp cấu hình bố cục ---------- */
function expCfg(){
  const blob=new Blob([JSON.stringify({lay:LAY,txt:TXT,logo:LOGO,gal:GAL,cap:CAP,fit:FIT,khid:KHID,kord:KORD,mode:state.mode,pal:state.pal},null,1)],
    {type:'application/json'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download='CMC_CongNo131_cauhinh_bocuc.json'; a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href),1500);
}
function impCfg(ev){
  const f=ev.target.files&&ev.target.files[0]; if(!f)return;
  const r=new FileReader();
  r.onload=e=>{
    try{
      const o=JSON.parse(e.target.result);
      if(o.lay)LAY=o.lay; if(o.khid&&typeof o.khid==='object')KHID=o.khid; if(o.kord&&typeof o.kord==='object')KORD=o.kord; if(o.txt)TXT=o.txt; if(o.logo)LOGO=o.logo; if(o.gal)GAL=o.gal; if(o.cap)CAP=o.cap; if(o.fit)FIT=o.fit;
      if(o.mode)state.mode=o.mode; if(o.pal&&PALS[o.pal])state.pal=o.pal;
      saveCfg(); applyLogo(); render(); syncUI(); toast('Đã nạp cấu hình bố cục.');
    }catch(err){alert('❌ File cấu hình không đọc được: '+err.message);}
    ev.target.value='';
  };
  r.readAsText(f);
}
function csvAll(){
  const m=state.m;
  const R=[['Báo cáo quản trị Kênh Phân phối — tháng '+m+'/'+DATA.meta.y],
    ['Nguồn',(DATA.meta.file||'BC_MKT_2026.xlsx')+' — đọc trực tiếp các sheet IN_01..IN_08'],[],
    ['Mục','Nhóm','Chỉ tiêu','ĐVT','Chiều','Ô nguồn T'+m].concat(MLAB.slice(0,m)).concat(['Lũy kế / BQ','vs T'+(m-1),'Ghi chú / công thức'])];
  KPI.forEach(k=>{
    const row=[BPN[k.bp],k.nhom,k.ct,k.dvt||'',k.pol===-1?'Nghịch chiều':'Thuận chiều',cellOf(k,m-1)||'tự tính'];
    for(let i=0;i<m;i++)row.push(k.th[i]);
    row.push(cum(k,m),dl(k.th[m-1],m>1?k.th[m-2]:null),k.note||k.calc||'');
    R.push(row);
  });
  R.push([]);R.push(['TRADE — tháng '+m]);R.push(['Kết quả chính','Hành động','Tình trạng','ĐVT','Lũy kế','Chỉ tiêu năm','% hoàn thành','Ô nguồn']);
  (DATA.trade||[]).filter(t=>t.m===m).forEach(t=>R.push([t.kq,t.hd,t.tt,t.dvt,t.lk,t.ct,t.pct,sheetN('trade')+'!G'+t.row]));
  dlCSV('CMC_Marketing_chitieu_T'+m+'.csv',R);
}



