/* ══════════════════════════════════════════════════════════════
   CMC · CÔNG NỢ TK 131 — XUẤT BÁO CÁO THU TIỀN NGÀY RA WORD (.docx)
   Tự dựng file .docx trong trình duyệt (không thư viện ngoài, không cần mạng):
   văn bản + bảng Word thật (sửa được) + biểu đồ ảnh PNG độ phân giải cao.
   Font Times New Roman · khổ A4 dọc · số trang ở chân trang.
   ══════════════════════════════════════════════════════════════ */
const WX=s=>String(s===null||s===undefined?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const WCOL={hd:'4A3B22',hdT:'FFFFFF',sum:'EFE4CC',g1:'F7F1E4',g2:'FBF8F1',line:'BFB39A',acc:'7A5C1E',red:'B42318',grn:'1E7B3A',mut:'6B6B6B'};
const WPAL=['#8C6A2A','#1F4E79','#4E8B57','#B5523B','#6B5B95','#2E86AB','#8C8C8C'];
const TW=9638; /* bề rộng vùng in (twips) — A4, lề 2 cm */

/* ---------- XML Word ---------- */
function wR(t,o){o=o||{};const rp=(o.b?'<w:b/>':'')+(o.i?'<w:i/>':'')+(o.u?'<w:u w:val="single"/>':'')+(o.c?`<w:color w:val="${o.c}"/>`:'')+(o.sz?`<w:sz w:val="${o.sz}"/><w:szCs w:val="${o.sz}"/>`:'')+(o.caps?'<w:caps/>':'');
  return String(t).split('\n').map((x,k)=>(k?'<w:r><w:br/></w:r>':'')+`<w:r>${rp?'<w:rPr>'+rp+'</w:rPr>':''}<w:t xml:space="preserve">${WX(x)}</w:t></w:r>`).join('');}
function wP(runs,o){o=o||{};const pp=(o.st?`<w:pStyle w:val="${o.st}"/>`:'')+(o.kn?'<w:keepNext/>':'')+(o.pb?'<w:pageBreakBefore/>':'')+
  `<w:spacing w:before="${o.bf||0}" w:after="${o.af===undefined?80:o.af}" w:line="${o.ln||276}" w:lineRule="auto"/>`+(o.ind?`<w:ind w:left="${o.ind}" w:hanging="${o.hg||0}"/>`:'')+(o.jc?`<w:jc w:val="${o.jc}"/>`:'')+(o.shd?`<w:shd w:val="clear" w:color="auto" w:fill="${o.shd}"/>`:'')+(o.bd?`<w:pBdr><w:left w:val="single" w:sz="18" w:space="6" w:color="${o.bd}"/></w:pBdr>`:'');
  return `<w:p><w:pPr>${pp}</w:pPr>${runs||''}</w:p>`;}
/* chuỗi có **đậm** → runs */
function wRich(s,base){base=base||{};return String(s).split(/(\*\*[^*]+\*\*)/).filter(x=>x).map(x=>/^\*\*/.test(x)?wR(x.slice(2,-2),Object.assign({},base,{b:1})):wR(x,base)).join('');}
const wH1=(t)=>wP(wR(t,{b:1,sz:26,c:WCOL.acc}),{kn:1,bf:240,af:100,bd:WCOL.acc});
const wH2=(t)=>wP(wR(t,{b:1,i:1,sz:24}),{kn:1,bf:140,af:60});
const wTx=(t)=>wP(wRich(t),{jc:'both',af:80});
const wBul=(t)=>wP(wR('–  ')+wRich(t),{jc:'both',af:60,ind:360,hg:220});
const wUnit=(t)=>wP(wR(t,{i:1,sz:19,c:WCOL.mut}),{jc:'right',af:20,kn:1});
const wCap=(t)=>wP(wR(t,{i:1,sz:20,c:WCOL.mut}),{jc:'center',af:160});
/* bảng: cols [{w,al}] · head [[cell]] · rows [{c:[cell],k:'sum'|'g1'|'g2'}] · cell = chuỗi | {t,al,b,c,span} */
function wTbl(cols,head,rows,o){o=o||{};const fs=o.fs||20,tot=cols.reduce((s,c)=>s+c.w,0),sc=TW/tot;const W=cols.map(c=>Math.round(c.w*sc));
  const tc=(cell,ci,isH,k)=>{const x=(cell&&typeof cell==='object')?cell:{t:cell};const sp=x.span||1;let w=0;for(let q=ci;q<ci+sp&&q<W.length;q++)w+=W[q];
    const al=isH?'center':(x.al||cols[ci].al||'left');const fill=isH?WCOL.hd:(k==='sum'?WCOL.sum:k==='g1'?WCOL.g1:k==='g2'?WCOL.g2:null);
    const rp={b:isH||x.b||k==='sum'||k==='g1',c:isH?WCOL.hdT:x.c,sz:x.sz||fs,i:x.i};
    return `<w:tc><w:tcPr><w:tcW w:w="${w}" w:type="dxa"/>${sp>1?`<w:gridSpan w:val="${sp}"/>`:''}${fill?`<w:shd w:val="clear" w:color="auto" w:fill="${fill}"/>`:''}<w:vAlign w:val="center"/></w:tcPr>`+
      `<w:p><w:pPr><w:spacing w:before="24" w:after="24" w:line="240" w:lineRule="auto"/>${x.ind?`<w:ind w:left="${x.ind}"/>`:''}<w:jc w:val="${al==='right'?'right':al==='center'?'center':'left'}"/></w:pPr>${wR(x.t===null||x.t===undefined?'':x.t,rp)}</w:p></w:tc>`;};
  const tr=(cells,isH,k)=>{let h=`<w:tr><w:trPr><w:cantSplit/>${isH?'<w:tblHeader/>':''}</w:trPr>`,ci=0;cells.forEach(c=>{h+=tc(c,ci,isH,k);ci+=(c&&c.span)||1;});return h+'</w:tr>';};
  const b=`<w:top w:val="single" w:sz="4" w:color="${WCOL.line}"/><w:left w:val="single" w:sz="4" w:color="${WCOL.line}"/><w:bottom w:val="single" w:sz="4" w:color="${WCOL.line}"/><w:right w:val="single" w:sz="4" w:color="${WCOL.line}"/><w:insideH w:val="single" w:sz="4" w:color="${WCOL.line}"/><w:insideV w:val="single" w:sz="4" w:color="${WCOL.line}"/>`;
  return `<w:tbl><w:tblPr><w:tblW w:w="${TW}" w:type="dxa"/><w:jc w:val="center"/><w:tblBorders>${b}</w:tblBorders><w:tblLayout w:type="fixed"/><w:tblCellMar><w:left w:w="70" w:type="dxa"/><w:right w:w="70" w:type="dxa"/></w:tblCellMar></w:tblPr>`+
    `<w:tblGrid>${W.map(w=>`<w:gridCol w:w="${w}"/>`).join('')}</w:tblGrid>`+head.map(r=>tr(r,true)).join('')+rows.map(r=>tr(r.c,false,r.k)).join('')+'</w:tbl>'+wP('',{af:60,ln:200});}
function wImg(n,rid,wPx,hPx,name){const cx=Math.round(TW*635),cy=Math.round(cx*hPx/wPx);
  return `<w:p><w:pPr><w:keepNext/><w:spacing w:before="60" w:after="20"/><w:jc w:val="center"/></w:pPr><w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="${cx}" cy="${cy}"/><wp:docPr id="${n}" name="${WX(name)}"/><wp:cNvGraphicFramePr><a:graphicFrameLocks noChangeAspect="1"/></wp:cNvGraphicFramePr>`+
    `<a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic><pic:nvPicPr><pic:cNvPr id="${n}" name="bieudo${n}.png"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="${rid}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>`+
    `<pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>`;}
function docxPack(body,imgs,foot,title){
  const NS='xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"';
  const sect=`<w:sectPr><w:footerReference w:type="default" r:id="rIdF1"/><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134" w:header="567" w:footer="510" w:gutter="0"/></w:sectPr>`;
  const doc=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<w:document ${NS}><w:body>${body}${sect}</w:body></w:document>`;
  const fld=(c)=>`<w:r><w:rPr><w:sz w:val="18"/></w:rPr><w:fldChar w:fldCharType="begin"/></w:r><w:r><w:rPr><w:sz w:val="18"/></w:rPr><w:instrText xml:space="preserve"> ${c} </w:instrText></w:r><w:r><w:rPr><w:sz w:val="18"/></w:rPr><w:fldChar w:fldCharType="separate"/></w:r><w:r><w:rPr><w:sz w:val="18"/></w:rPr><w:t>1</w:t></w:r><w:r><w:rPr><w:sz w:val="18"/></w:rPr><w:fldChar w:fldCharType="end"/></w:r>`;
  const footer=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<w:ftr ${NS}><w:p><w:pPr><w:pBdr><w:top w:val="single" w:sz="4" w:space="4" w:color="${WCOL.line}"/></w:pBdr><w:tabs><w:tab w:val="right" w:pos="${TW}"/></w:tabs><w:spacing w:after="0"/></w:pPr>${wR(foot,{sz:18,i:1,c:WCOL.mut})}<w:r><w:rPr><w:sz w:val="18"/></w:rPr><w:tab/><w:t xml:space="preserve">Trang </w:t></w:r>${fld('PAGE')}<w:r><w:rPr><w:sz w:val="18"/></w:rPr><w:t xml:space="preserve">/</w:t></w:r>${fld('NUMPAGES')}</w:p></w:ftr>`;
  const styles=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:eastAsia="Times New Roman" w:cs="Times New Roman"/><w:sz w:val="24"/><w:szCs w:val="24"/><w:lang w:val="vi-VN" w:eastAsia="en-US" w:bidi="ar-SA"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="80" w:line="276" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults>`+
    `<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/></w:style><w:style w:type="table" w:default="1" w:styleId="TableNormal"><w:name w:val="Normal Table"/><w:tblPr><w:tblInd w:w="0" w:type="dxa"/><w:tblCellMar><w:top w:w="0" w:type="dxa"/><w:left w:w="108" w:type="dxa"/><w:bottom w:w="0" w:type="dxa"/><w:right w:w="108" w:type="dxa"/></w:tblCellMar></w:tblPr></w:style></w:styles>`;
  const settings=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<w:settings xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:zoom w:percent="100"/><w:defaultTabStop w:val="720"/><w:characterSpacingControl w:val="doNotCompress"/><w:compat><w:compatSetting w:name="compatibilityMode" w:uri="http://schemas.microsoft.com/office/word" w:val="15"/></w:compat></w:settings>`;
  const ct=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/>`+
    `<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/word/settings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml"/><Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/></Types>`;
  const rels=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/></Relationships>`;
  const drels=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rIdS" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/><Relationship Id="rIdT" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/settings" Target="settings.xml"/><Relationship Id="rIdF1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/>`+
    imgs.map(m=>`<Relationship Id="${m.rid}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/${m.name}"/>`).join('')+'</Relationships>';
  const now=new Date().toISOString().replace(/\.\d+Z$/,'Z');
  const core=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>${WX(title)}</dc:title><dc:creator>Phòng Tài chính Kế toán — CMC</dc:creator><dcterms:created xsi:type="dcterms:W3CDTF">${now}</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">${now}</dcterms:modified></cp:coreProperties>`;
  const F=[{name:'[Content_Types].xml',data:UTF8(ct)},{name:'_rels/.rels',data:UTF8(rels)},{name:'docProps/core.xml',data:UTF8(core)},{name:'word/document.xml',data:UTF8(doc)},{name:'word/styles.xml',data:UTF8(styles)},{name:'word/settings.xml',data:UTF8(settings)},
    {name:'word/footer1.xml',data:UTF8(footer)},{name:'word/_rels/document.xml.rels',data:UTF8(drels)}].concat(imgs.map(m=>({name:'word/media/'+m.name,data:m.data})));
  return zipMake(F);
}

/* ---------- biểu đồ in (nền trắng, Times New Roman) → PNG ---------- */
const WCW=760,WCH=330;
function wChart(cfg,h){
  const box=document.createElement('div');box.style.cssText='position:fixed;left:-30000px;top:0;width:'+WCW+'px;height:'+(h||WCH)+'px;';
  const cv=document.createElement('canvas');cv.width=WCW;cv.height=h||WCH;cv.style.width=WCW+'px';cv.style.height=(h||WCH)+'px';box.appendChild(cv);document.body.appendChild(box);
  const bg={id:'wbg',beforeDraw(c){const g=c.ctx;g.save();g.globalCompositeOperation='destination-over';g.fillStyle='#fff';g.fillRect(0,0,c.width,c.height);g.restore();}};
  const o=cfg.options=cfg.options||{};o.responsive=false;o.maintainAspectRatio=false;o.animation=false;o.devicePixelRatio=2.6;o.events=[];
  o.font={family:'"Times New Roman", Times, serif',size:13};o.color='#2b2b2b';
  o.plugins=Object.assign({legend:{position:'bottom',labels:{color:'#2b2b2b',boxWidth:12,font:{family:'"Times New Roman", Times, serif',size:12.5}}},tooltip:{enabled:false},datalabels:{display:false},pband:{},title:{display:false}},o.plugins||{});
  const sx=o.scales||{};Object.keys(sx).forEach(k=>{const a=sx[k];a.ticks=Object.assign({color:'#3a3a3a',font:{family:'"Times New Roman", Times, serif',size:12}},a.ticks||{});a.grid=Object.assign({color:'#e6e2d8'},a.grid||{});a.border=Object.assign({color:'#bdb6a6'},a.border||{});if(a.title)a.title=Object.assign({color:'#3a3a3a',font:{family:'"Times New Roman", Times, serif',size:12,style:'italic'}},a.title);});
  cfg.plugins=(cfg.plugins||[]).concat([bg]);
  let png=null;try{const ch=new Chart(cv.getContext('2d'),cfg);ch.draw();png=b64bytes(cv.toDataURL('image/png').split(',')[1]);ch.destroy();}catch(e){console.warn('wChart',e);}
  box.remove();return png?{data:png,w:WCW,h:h||WCH}:null;
}

/* ---------- số liệu báo cáo ---------- */
function wordData(D){
  const mask=MASK(),Lx=LL(),ym=AR.ymOf(D),mf=AR.ymStart(ym),me=AR.ymEnd(ym);
  const pW=shiftWin({f:mf,t:D},1),yW=shiftWin({f:mf,t:D},12),hasY=yW.f>=X.P.meta.dmin;
  const bank=j=>Lx.b[j]>=0?X.P.dic.bank[Lx.b[j]]:'(Không rõ)';
  const S=SNAP(D);
  /* ngày */
  const dR=COLROWS(D,D),dK={},dBk={},dV={},dKn={};let dTot=0;
  dR.forEach(j=>{const i=Lx.k[j],a=-Lx.a[j];dTot+=a;(dK[i]=dK[i]||{a:0,bk:{}}).a+=a;dK[i].bk[bank(j)]=(dK[i].bk[bank(j)]||0)+a;dBk[bank(j)]=(dBk[bank(j)]||0)+a;
    const kv=X.kenh[i]+'|'+X.vung[i];(dV[kv]=dV[kv]||{a:0,n:new Set()}).a+=a;dV[kv].n.add(i);dKn[X.kenh[i]]=(dKn[X.kenh[i]]||0)+a;});
  /* lũy kế tháng */
  const mR=COLROWS(mf,D),mK={},mBk={},mV={},mKn={},nPay={};let mtd=0;
  mR.forEach(j=>{const i=Lx.k[j],a=-Lx.a[j];mtd+=a;mK[i]=(mK[i]||0)+a;if(a>0)nPay[i]=(nPay[i]||0)+1;mBk[bank(j)]=(mBk[bank(j)]||0)+a;const kv=X.kenh[i]+'|'+X.vung[i];mV[kv]=(mV[kv]||0)+a;mKn[X.kenh[i]]=(mKn[X.kenh[i]]||0)+a;});
  const sumBy=(rows,fn)=>{const o={};rows.forEach(j=>{const k=fn(Lx.k[j]);o[k]=(o[k]||0)-Lx.a[j];});return o;};
  const pV=sumBy(COLROWS(pW.f,pW.t),i=>X.kenh[i]+'|'+X.vung[i]),yV=hasY?sumBy(COLROWS(yW.f,yW.t),i=>X.kenh[i]+'|'+X.vung[i]):{};
  const mtdP=Object.values(pV).reduce((a,b)=>a+b,0),mtdY=hasY?Object.values(yV).reduce((a,b)=>a+b,0):null;
  /* doanh số ghi nợ lũy kế theo vùng */
  const FB=FW(mf,D),bV={};let bMTD=0;for(let i=0;i<X.nC;i++){if(!mask[i])continue;const b=FB[i*X.NL]+FB[i*X.NL+1]+FB[i*X.NL+2]+FB[i*X.NL+3];if(!b)continue;const kv=X.kenh[i]+'|'+X.vung[i];bV[kv]=(bV[kv]||0)+b;bMTD+=b;}
  /* theo ngày trong tháng × kênh */
  const nd=D-mf+1,ks=KORDER.filter(k=>mKn[k]||dKn[k]);const dayK=ks.map(k=>Array.from(dailyArr(mf,D,maskOf(i=>X.kenh[i]===k))));
  const dTotA=Array.from(dailyArr(mf,D)),pA=Array.from(dailyArr(pW.f,pW.t));
  const pFull=Array.from(dailyArr(AR.ymStart(AR.ymOf(pW.f)),AR.ymEnd(AR.ymOf(pW.f))));
  /* xu hướng 12 tháng */
  const mi=mOf(D),T=[];for(let m=Math.max(0,mi-11);m<=mi;m++){const f=AR.ymStart(X.MS[m]),t=Math.min(X.ME[m],D);const F=FS(f,t);T.push({m,lab:'T'+(X.MS[m]%100)+'/'+String(Math.floor(X.MS[m]/100)).slice(2)+(t<AR.ymEnd(X.MS[m])?'*':''),c:COLL(F),b:BILL(F)});}
  const F=fcAll(D),g=AG(S),wdDone=workDays(mf,D),wdRest=workDays(D+1,me);
  /* khách cần đôn đốc: quá hạn lớn, chưa nộp tiền trong tháng */
  const W=[];for(let i=0;i<X.nC;i++){if(!mask[i])continue;const ov=OVA(S,i);if(ov<5e7||mK[i]>0.5)continue;const lp=lastPayAt(i,D);W.push({i,dr:Math.max(0,S.net[i]),ov,lp,gap:lp?D-lp:null});}
  W.sort((a,b)=>b.ov-a.ov);
  return {D,ym,mf,me,pW,yW,hasY,dTot,dK,dBk,dV,dKn,mtd,mK,mBk,mV,mKn,nPay,pV,yV,mtdP,mtdY,bV,bMTD,nd,ks,dayK,dTotA,pA,pFull,T,F,g,S,wdDone,wdRest,W};
}

/* ---------- dựng văn bản ---------- */
async function exportWord(opt){
  opt=opt||{};const D=opt.D||tdDay(),U=opt.u||'ty',detail=opt.detail||'all';
  busy('Đang tổng hợp số liệu thu tiền ngày '+dStr(D)+'…');await tick();
  const R=wordData(D);
  const dv=U==='tr'?1e6:1e9,un=U==='tr'?'triệu đồng':'tỷ đồng',dp=U==='tr'?0:2;
  const NFX=new Intl.NumberFormat('vi-VN',{minimumFractionDigits:dp,maximumFractionDigits:dp}),NP1=new Intl.NumberFormat('vi-VN',{minimumFractionDigits:1,maximumFractionDigits:1});
  const nf=v=>{if(nul(v))return '–';if(Math.abs(v)<0.5)return '–';const x=v/dv;if(U==='ty'&&Math.abs(x)<0.005)return x<0?'>−0,01':'<0,01';return nz(NFX.format(x)).replace(/^-/,'−');};
  const pcs=v=>nul(v)||!isFinite(v)?'–':NP1.format(v*100)+'%';
  const dlt=(a,b)=>(!b||nul(a)||nul(b))?'–':((a>=b?'+':'−')+NP1.format(Math.abs(a/b-1)*100)+'%');
  const dc=(a,b)=>(!b||nul(a)||nul(b))?null:(a>=b?WCOL.grn:WCOL.red);
  const ml='tháng '+(R.ym%100)+'/'+Math.floor(R.ym/100), dd=dStr(D), dds=dS(D), wdn=['Chủ nhật','Thứ hai','Thứ ba','Thứ tư','Thứ năm','Thứ sáu','Thứ bảy'][wday(D)];
  const kn=k=>String(k).replace(/^\d\.\s*/,'');
  let B='',imgs=[],nImg=0,nTb=0;const tb=t=>'Bảng '+(++nTb)+'. '+t;
  const addImg=(c,cap)=>{if(!c)return '';nImg++;const rid='rIdImg'+nImg;imgs.push({rid,name:'bieudo'+nImg+'.png',data:c.data});return wImg(100+nImg,rid,c.w,c.h,cap)+wCap('Biểu đồ '+nImg+'. '+cap);};

  /* — đầu văn bản — */
  B+=`<w:tbl><w:tblPr><w:tblW w:w="${TW}" w:type="dxa"/><w:tblLayout w:type="fixed"/><w:tblBorders><w:top w:val="nil"/><w:left w:val="nil"/><w:bottom w:val="nil"/><w:right w:val="nil"/><w:insideH w:val="nil"/><w:insideV w:val="nil"/></w:tblBorders></w:tblPr><w:tblGrid><w:gridCol w:w="4400"/><w:gridCol w:w="${TW-4400}"/></w:tblGrid><w:tr>`+
    `<w:tc><w:tcPr><w:tcW w:w="4400" w:type="dxa"/></w:tcPr>${wP(wR('CÔNG TY CỔ PHẦN CMC',{b:1,sz:24}),{jc:'center',af:0})}${wP(wR('PHÒNG TÀI CHÍNH KẾ TOÁN',{b:1,sz:22}),{jc:'center',af:0})}${wP(wR('———————',{sz:18}),{jc:'center',af:0})}</w:tc>`+
    `<w:tc><w:tcPr><w:tcW w:w="${TW-4400}" w:type="dxa"/></w:tcPr>${wP(wR('Phạm vi: '+fLab(),{i:1,sz:21}),{jc:'right',af:0})}${wP(wR('Đơn vị tính: '+un,{i:1,sz:21}),{jc:'right',af:0})}${wP(wR('Dữ liệu chốt đến: '+dStr(X.dmax),{i:1,sz:21}),{jc:'right',af:0})}</w:tc></w:tr></w:tbl>`;
  B+=wP(wR('BÁO CÁO THU TIỀN NGÀY '+dd,{b:1,sz:32,c:WCOL.acc}),{jc:'center',bf:300,af:40});
  B+=wP(wR(wdn+', '+dd+' · Lũy kế '+ml+' đến ngày '+dds,{i:1,sz:23}),{jc:'center',af:220});

  /* — I. TÓM TẮT — */
  const F=R.F,remain=Math.max(0,F.fin-R.mtd),avgD=R.wdDone?R.mtd/R.wdDone:null,nKd=Object.keys(R.dK).length;
  const topD=Object.keys(R.dK).map(Number).sort((a,b)=>R.dK[b].a-R.dK[a].a);
  B+=wH1('I. TÓM TẮT ĐIỀU HÀNH');
  B+=wUnit('Đơn vị: '+un);
  B+=wTbl([{w:34,al:'left'},{w:16,al:'right'},{w:50,al:'left'}],[['Chỉ tiêu','Giá trị','So sánh / ghi chú']],[
    {c:[{t:'Tiền thu ngày '+dds,b:1},{t:nf(R.dTot),b:1},nKd+' khách hàng · '+(avgD?(R.dTot>=avgD?'cao hơn':'thấp hơn')+' bình quân ngày làm việc của tháng ('+nf(avgD)+') '+dlt(R.dTot,avgD):'')]},
    {c:[{t:'Lũy kế '+ml+' đến '+dds,b:1},{t:nf(R.mtd),b:1},{t:'Cùng kỳ tháng trước '+nf(R.mtdP)+' ('+dlt(R.mtd,R.mtdP)+')'+(R.hasY?' · cùng kỳ năm trước '+nf(R.mtdY)+' ('+dlt(R.mtd,R.mtdY)+')':''),c:dc(R.mtd,R.mtdP)}]},
    {c:['Doanh số ghi nợ lũy kế tháng',nf(R.bMTD),'Tiền thu / doanh số ghi nợ: '+pcs(R.bMTD?R.mtd/R.bMTD:null)+' → dư nợ '+(R.mtd>=R.bMTD?'giảm ':'tăng ')+nf(Math.abs(R.bMTD-R.mtd))]},
    {c:[{t:'Dự báo thu cả '+ml,b:1},{t:nf(F.fin),b:1},'Khoảng '+nf(F.lo)+' – '+nf(F.hi)+' · đã đạt '+pcs(F.fin?R.mtd/F.fin:null)]},
    {c:['Còn phải thu đến cuối tháng',nf(remain),R.wdRest+' ngày làm việc còn lại → bình quân '+nf(R.wdRest?remain/R.wdRest:null)+'/ngày']},
    {c:['Dư nợ phải thu tại '+dds,nf(R.g.dr),{t:'Quá hạn '+nf(R.g.ov)+' ('+pcs(R.g.open?R.g.ov/R.g.open:null)+' nợ mở) · nợ quá hạn > 90 ngày '+nf(R.g.ov90),c:R.g.open&&R.g.ov/R.g.open>0.2?WCOL.red:null}]}],{fs:21});
  /* nhận định tự động */
  const knD=R.ks.map(k=>({k,a:R.mKn[k]||0,p:Object.keys(R.pV).filter(x=>x.split('|')[0]===k).reduce((s,x)=>s+R.pV[x],0)})).map(o=>Object.assign(o,{d:o.a-o.p}));
  const up=knD.slice().sort((a,b)=>b.d-a.d)[0],dn=knD.slice().sort((a,b)=>a.d-b.d)[0];
  const t3=topD.slice(0,3),sh3=R.dTot?t3.reduce((s,i)=>s+R.dK[i].a,0)/R.dTot:0;
  const wl=R.W.slice(0,5);
  B+=wP(wR('Nhận định',{b:1}),{kn:1,bf:80,af:40});
  B+=wBul(`Ngày ${dds} thu **${nf(R.dTot)} ${un}** từ ${nKd} khách hàng`+(t3.length?`; ${t3.length>1?t3.length+' khách nộp lớn nhất':'khách nộp lớn nhất'} (${t3.map(i=>cShort(i)).join(', ')}) chiếm ${pcs(sh3)} tiền về trong ngày.`:'.'));
  B+=wBul(`Lũy kế ${ml} đạt **${nf(R.mtd)} ${un}**, ${R.mtd>=R.mtdP?'cao hơn':'thấp hơn'} cùng kỳ tháng trước ${nf(Math.abs(R.mtd-R.mtdP))} (${dlt(R.mtd,R.mtdP)})`+(up&&up.d>0?`; tăng mạnh nhất ở kênh ${kn(up.k)} (+${nf(up.d)})`:'')+(dn&&dn.d<0?`; giảm nhiều nhất ở kênh ${kn(dn.k)} (−${nf(-dn.d)})`:'')+'.');
  B+=wBul(`Tiền thu lũy kế bằng ${pcs(R.bMTD?R.mtd/R.bMTD:null)} doanh số ghi nợ cùng kỳ — ${R.bMTD&&R.mtd/R.bMTD<0.9?'thu chưa theo kịp bán hàng, dư nợ đang tăng':'thu theo kịp bán hàng'}.`);
  B+=wBul(`Dự báo thu cả tháng **${nf(F.fin)} ${un}**; để đạt cần thu thêm ${nf(remain)} trong ${R.wdRest} ngày làm việc (≈ ${nf(R.wdRest?remain/R.wdRest:null)}/ngày, so với bình quân thực tế ${nf(avgD)}/ngày).`+(F.bt&&!nul(F.bt.mFI)?` Sai số kiểm định 6 tháng gần nhất ±${pcs(F.bt.mFI)}.`:''));
  if(wl.length)B+=wBul(`${R.W.length} khách hàng có nợ quá hạn ≥ 50 triệu nhưng **chưa nộp tiền trong tháng**, tổng quá hạn ${nf(R.W.reduce((s,o)=>s+o.ov,0))}; lớn nhất: ${wl.map(o=>cShort(o.i)+' '+nf(o.ov)).join('; ')} — đề nghị KD vùng đôn đốc ngay (chi tiết mục V).`);

  /* — II. TIỀN THU NGÀY — */
  B+=wH1('II. TIỀN THU NGÀY '+dd);
  B+=wH2('1. Theo kênh và vùng');B+=wUnit(tb('Tiền thu ngày '+dds+' theo kênh, vùng')+' · đơn vị: '+un);
  const vRows=(fnRow)=>{const out=[];KORDER.forEach(k=>{const vs=Object.keys(Object.assign({},R.dV,R.mV,R.pV)).filter(x=>x.split('|')[0]===k).sort((a,b)=>vOrd(a.split('|')[1])-vOrd(b.split('|')[1]));if(!vs.length)return;
    const r0=fnRow(vs,k,true);if(!r0)return;out.push({c:r0,k:'g1'});vs.forEach(v=>{const r=fnRow([v],v.split('|')[1],false);if(r&&v.split('|')[1]!==kn(k))out.push({c:r});});});return out;};
  const sumV=(o,vs)=>vs.reduce((s,v)=>s+((o[v]&&o[v].a!==undefined)?o[v].a:(o[v]||0)),0);
  const r1=vRows((vs,lab,g)=>{const a=sumV(R.dV,vs),m=sumV(R.mV,vs);if(!a&&!m)return null;const n=vs.reduce((s,v)=>s+(R.dV[v]?R.dV[v].n.size:0),0);return [{t:g?lab:lab,ind:g?0:240},nf(a),n||'–',pcs(R.dTot?a/R.dTot:null),nf(m),pcs(R.mtd?m/R.mtd:null)];});
  r1.push({c:['Tổng cộng',nf(R.dTot),nKd,'100%',nf(R.mtd),'100%'],k:'sum'});
  B+=wTbl([{w:30,al:'left'},{w:14,al:'right'},{w:10,al:'right'},{w:12,al:'right'},{w:18,al:'right'},{w:14,al:'right'}],[['Kênh / vùng','Thu ngày '+dds,'Số KH','Tỷ trọng','Lũy kế tháng','Tỷ trọng LK']],r1);
  B+=wH2('2. Chi tiết khách hàng nộp tiền ngày '+dds);
  if(!topD.length)B+=wTx('Không có tiền về trong ngày.');
  else{const ids=topD.slice().sort((a,b)=>kOrd(X.kenh[a])-kOrd(X.kenh[b])||vOrd(X.vung[a])-vOrd(X.vung[b])||R.dK[b].a-R.dK[a].a);
    const lim=detail==='top'?ids.filter(i=>topD.indexOf(i)<30):ids;
    B+=wUnit(tb('Khách hàng nộp tiền ngày '+dds+(detail==='top'&&ids.length>30?' (30 khách lớn nhất / '+ids.length+')':''))+' · đơn vị: '+un);
    const rows=[];let ck='',n=0;lim.forEach(i=>{if(X.kenh[i]!==ck){ck=X.kenh[i];const a=ids.filter(x=>X.kenh[x]===ck).reduce((s,x)=>s+R.dK[x].a,0);rows.push({c:[{t:kn(ck)+' ('+ids.filter(x=>X.kenh[x]===ck).length+' KH)',span:4},nf(a),'',''],k:'g1'});}
      const bk=Object.keys(R.dK[i].bk).sort((a,b)=>R.dK[i].bk[b]-R.dK[i].bk[a]);
      rows.push({c:[String(++n),X.P.cid[i],cName(i),X.vung[i],{t:nf(R.dK[i].a),b:1},bk.join(', '),nf(Math.max(0,R.S.net[i]))]});});
    if(detail==='top'&&ids.length>lim.length){const rest=ids.filter(i=>lim.indexOf(i)<0);rows.push({c:[{t:'Các khách hàng khác ('+rest.length+' KH)',span:4,i:1},nf(rest.reduce((s,i)=>s+R.dK[i].a,0)),'',''],k:'g2'});}
    rows.push({c:[{t:'Tổng cộng ('+ids.length+' khách hàng)',span:4},nf(R.dTot),'',''],k:'sum'});
    B+=wTbl([{w:5,al:'right'},{w:11,al:'left'},{w:33,al:'left'},{w:12,al:'left'},{w:12,al:'right'},{w:14,al:'left'},{w:13,al:'right'}],[['STT','Mã KH','Tên khách hàng','Vùng','Số tiền','Ngân hàng nhận','Dư nợ còn lại']],rows,{fs:19});}
  B+=wH2('3. Theo ngân hàng nhận tiền');B+=wUnit(tb('Tiền về theo ngân hàng')+' · đơn vị: '+un);
  const bks=Object.keys(Object.assign({},R.dBk,R.mBk)).sort((a,b)=>(R.mBk[b]||0)-(R.mBk[a]||0));
  B+=wTbl([{w:34,al:'left'},{w:16,al:'right'},{w:14,al:'right'},{w:20,al:'right'},{w:16,al:'right'}],[['Ngân hàng','Thu ngày '+dds,'Tỷ trọng','Lũy kế tháng','Tỷ trọng LK']],
    bks.map(b=>({c:[b,nf(R.dBk[b]||0),pcs(R.dTot?(R.dBk[b]||0)/R.dTot:null),nf(R.mBk[b]||0),pcs(R.mtd?(R.mBk[b]||0)/R.mtd:null)]})).concat([{c:['Tổng cộng',nf(R.dTot),'100%',nf(R.mtd),'100%'],k:'sum'}]));

  /* — III. LŨY KẾ THÁNG — */
  busy('Đang vẽ biểu đồ cho file Word…');await tick();
  B+=wH1('III. LŨY KẾ '+ml.toUpperCase()+' ĐẾN NGÀY '+dds);
  const labs=[];for(let q=0;q<R.nd;q++)labs.push(String(q+1));
  let cA=0,cP=0;const cumA=R.dTotA.map(v=>cA+=v),cumP=[];for(let q=0;q<R.nd;q++){cP+=R.pFull[q]||0;cumP.push(cP);}
  const c1=wChart({type:'bar',data:{labels:labs,datasets:R.ks.map((k,x)=>({label:kn(k),data:R.dayK[x].map(v=>v/dv),backgroundColor:WPAL[x%WPAL.length],stack:'s',yAxisID:'y',order:2}))
    .concat([{type:'line',label:'Lũy kế tháng này',data:cumA.map(v=>v/dv),borderColor:'#7A5C1E',backgroundColor:'#7A5C1E',borderWidth:2.6,pointRadius:2.5,yAxisID:'y1',order:1},
             {type:'line',label:'Lũy kế cùng kỳ tháng trước',data:cumP.map(v=>v/dv),borderColor:'#9a9a9a',backgroundColor:'#9a9a9a',borderDash:[6,4],borderWidth:2,pointRadius:0,yAxisID:'y1',order:1}])},
    options:{scales:{x:{stacked:true,grid:{display:false},title:{display:true,text:'Ngày trong tháng'}},y:{stacked:true,beginAtZero:true,title:{display:true,text:'Thu trong ngày ('+un+')'}},y1:{position:'right',beginAtZero:true,grid:{display:false},title:{display:true,text:'Lũy kế ('+un+')'}}}}},350);
  B+=addImg(c1,'Tiền thu theo ngày (cột, theo kênh) và lũy kế '+ml+' so cùng kỳ tháng trước');
  B+=wTx(`Đến ngày ${dds}, lũy kế ${nf(R.mtd)} so ${nf(cumP[R.nd-1])} cùng thời điểm tháng trước (${dlt(R.mtd,cumP[R.nd-1])}). Ngày thu cao nhất trong tháng: ${(()=>{let mx=0,mi=0;R.dTotA.forEach((v,q)=>{if(v>mx){mx=v;mi=q;}});return dS(R.mf+mi)+' ('+nf(mx)+')';})()}.`);
  B+=wH2('1. Theo kênh và vùng — so sánh cùng kỳ');B+=wUnit(tb('Lũy kế tiền thu theo kênh, vùng')+' · đơn vị: '+un);
  const r3=vRows((vs,lab,g)=>{const m=sumV(R.mV,vs),p=sumV(R.pV,vs),y=sumV(R.yV,vs),b=sumV(R.bV,vs);if(!m&&!p&&!b)return null;
    return [{t:lab,ind:g?0:240},nf(m),nf(p),{t:dlt(m,p),c:dc(m,p)},R.hasY?nf(y):'–',R.hasY?{t:dlt(m,y),c:dc(m,y)}:'–',nf(b),pcs(b?m/b:null),pcs(R.mtd?m/R.mtd:null)];});
  r3.push({c:['Tổng cộng',nf(R.mtd),nf(R.mtdP),{t:dlt(R.mtd,R.mtdP)},R.hasY?nf(R.mtdY):'–',R.hasY?dlt(R.mtd,R.mtdY):'–',nf(R.bMTD),pcs(R.bMTD?R.mtd/R.bMTD:null),'100%'],k:'sum'});
  B+=wTbl([{w:19,al:'left'},{w:10.5,al:'right'},{w:10.5,al:'right'},{w:9.5,al:'right'},{w:10.5,al:'right'},{w:9.5,al:'right'},{w:11,al:'right'},{w:9,al:'right'},{w:9,al:'right'}],
    [['Kênh / vùng','Lũy kế tháng','Cùng kỳ T-1','Δ%','Cùng kỳ năm trước','Δ%','Doanh số ghi nợ','Thu / DS','Tỷ trọng']],r3,{fs:18});
  const vv=Object.keys(Object.assign({},R.mV,R.pV)).filter(v=>(R.mV[v]||0)+(R.pV[v]||0)>0.5).sort((a,b)=>(R.mV[b]||0)-(R.mV[a]||0)).slice(0,12);
  const c2=wChart({type:'bar',data:{labels:vv.map(v=>v.split('|')[1]),datasets:[{label:'Lũy kế '+ml,data:vv.map(v=>(R.mV[v]||0)/dv),backgroundColor:'#8C6A2A',datalabels:{display:true,anchor:'end',align:'end',color:'#2b2b2b',font:{size:11,weight:'bold'},formatter:v=>nfd(U==='tr'?0:1).format(v)}},
    {label:'Cùng kỳ tháng trước',data:vv.map(v=>(R.pV[v]||0)/dv),backgroundColor:'#C9C2B2'}]},
    options:{indexAxis:'y',plugins:{datalabels:{display:false}},scales:{x:{beginAtZero:true,grace:'10%',title:{display:true,text:un}},y:{grid:{display:false}}}}},Math.max(260,40+vv.length*30));
  B+=addImg(c2,'Lũy kế tiền thu theo vùng so cùng kỳ tháng trước');
  const vUp=vv.map(v=>({v,d:(R.mV[v]||0)-(R.pV[v]||0)})).sort((a,b)=>a.d-b.d);
  if(vUp.length)B+=wTx(`Vùng giảm nhiều nhất so cùng kỳ: **${vUp[0].v.split('|')[1]}** (${vUp[0].d<0?'−':'+'}${nf(Math.abs(vUp[0].d))}); vùng tăng nhiều nhất: **${vUp[vUp.length-1].v.split('|')[1]}** (${vUp[vUp.length-1].d<0?'−':'+'}${nf(Math.abs(vUp[vUp.length-1].d))}).`);
  /* bảng theo ngày */
  B+=wH2('2. Tiền thu từng ngày trong tháng');B+=wUnit(tb('Tiền thu theo ngày và kênh, '+ml)+' · đơn vị: '+un);
  const dRows=[];let ca=0,cp=0;for(let q=0;q<R.nd;q++){const d=R.mf+q;ca+=R.dTotA[q];cp+=R.pFull[q]||0;if(R.dTotA[q]<0.5&&!isWork(d))continue;
    dRows.push({c:[dS(d),WDN[wday(d)]].concat(R.ks.map((k,x)=>nf(R.dayK[x][q]))).concat([{t:nf(R.dTotA[q]),b:1},nf(ca),nf(cp)]),k:d===D?'g1':undefined});}
  dRows.push({c:[{t:'Cộng',span:2}].concat(R.ks.map((k,x)=>nf(R.dayK[x].reduce((a,b)=>a+b,0)))).concat([nf(R.mtd),nf(R.mtd),nf(cp)]),k:'sum'});
  B+=wTbl([{w:9,al:'center'},{w:6,al:'center'}].concat(R.ks.map(()=>({w:Math.max(8,46/R.ks.length),al:'right'}))).concat([{w:11,al:'right'},{w:12,al:'right'},{w:12,al:'right'}]),
    [['Ngày','Thứ'].concat(R.ks.map(kn)).concat(['Tổng ngày','Lũy kế','Lũy kế T-1'])],dRows,{fs:18});
  /* top khách lũy kế */
  B+=wH2('3. Khách hàng nộp tiền lớn nhất lũy kế tháng');B+=wUnit(tb('15 khách hàng nộp tiền lớn nhất '+ml)+' · đơn vị: '+un);
  const tk=Object.keys(R.mK).map(Number).filter(i=>R.mK[i]>0.5).sort((a,b)=>R.mK[b]-R.mK[a]);const t15=tk.slice(0,15);
  B+=wTbl([{w:5,al:'right'},{w:35,al:'left'},{w:13,al:'left'},{w:12,al:'right'},{w:8,al:'right'},{w:9,al:'right'},{w:9,al:'right'},{w:9,al:'right'}],[['STT','Khách hàng','Vùng','Lũy kế tháng','Số lần nộp','Tỷ trọng','Dư nợ','Quá hạn']],
    t15.map((i,x)=>({c:[String(x+1),cName(i),X.vung[i],{t:nf(R.mK[i]),b:1},String(R.nPay[i]||0),pcs(R.mtd?R.mK[i]/R.mtd:null),nf(Math.max(0,R.S.net[i])),{t:nf(OVA(R.S,i)),c:OVA(R.S,i)>0.5?WCOL.red:null}]})).concat([
      {c:[{t:'15 khách lớn nhất',span:3},nf(t15.reduce((s,i)=>s+R.mK[i],0)),'',pcs(R.mtd?t15.reduce((s,i)=>s+R.mK[i],0)/R.mtd:null),'',''],k:'sum'}]),{fs:19});
  B+=wTx(`Tháng có ${tk.length} khách hàng nộp tiền; 15 khách lớn nhất chiếm ${pcs(R.mtd?t15.reduce((s,i)=>s+R.mK[i],0)/R.mtd:null)} tiền thu lũy kế.`);
  /* ngân hàng */
  const bk2=Object.keys(R.mBk).sort((a,b)=>R.mBk[b]-R.mBk[a]);
  const c3=wChart({type:'bar',data:{labels:bk2,datasets:[{label:'Lũy kế tháng',data:bk2.map(b=>R.mBk[b]/dv),backgroundColor:bk2.map((b,x)=>WPAL[x%WPAL.length]),datalabels:{display:true,anchor:'end',align:'end',color:'#2b2b2b',font:{size:11.5,weight:'bold'},formatter:(v,c)=>nfd(U==='tr'?0:1).format(v)+' · '+pcs(R.mtd?bk2.map(b=>R.mBk[b])[c.dataIndex]/R.mtd:null)}}]},
    options:{indexAxis:'y',plugins:{legend:{display:false}},scales:{x:{beginAtZero:true,grace:'18%',title:{display:true,text:un}},y:{grid:{display:false}}}}},Math.max(200,40+bk2.length*30));
  B+=addImg(c3,'Cơ cấu tiền về theo ngân hàng — lũy kế '+ml);

  /* — IV. XU HƯỚNG & DỰ BÁO — */
  B+=wH1('IV. XU HƯỚNG 12 THÁNG VÀ DỰ BÁO THU TIỀN');
  const c4=wChart({type:'bar',data:{labels:R.T.map(o=>o.lab),datasets:[{label:'Tiền thu',data:R.T.map(o=>o.c/dv),backgroundColor:'#8C6A2A',yAxisID:'y',order:2},{label:'Doanh số ghi nợ',data:R.T.map(o=>o.b/dv),backgroundColor:'#C9C2B2',yAxisID:'y',order:2},
    {type:'line',label:'Thu / doanh số (%)',data:R.T.map(o=>o.b?o.c/o.b*100:null),borderColor:'#1F4E79',backgroundColor:'#1F4E79',borderWidth:2.4,pointRadius:3,yAxisID:'y1',order:1,datalabels:{display:true,align:'top',color:'#1F4E79',font:{size:10.5,weight:'bold'},formatter:v=>nul(v)?'':nfd(0).format(v)+'%'}}]},
    options:{plugins:{datalabels:{display:false}},scales:{x:{grid:{display:false}},y:{beginAtZero:true,title:{display:true,text:un}},y1:{position:'right',beginAtZero:true,grace:'15%',grid:{display:false},ticks:{callback:v=>v+'%'}}}}},340);
  B+=addImg(c4,'Tiền thu và doanh số ghi nợ 12 tháng (* tháng chưa trọn, tính đến '+dds+')');
  const last=R.T.slice(0,-1).filter(o=>o.c>0),avgC=last.length?last.reduce((s,o)=>s+o.c,0)/last.length:null;
  B+=wTx(`Bình quân tiền thu ${last.length} tháng trọn gần nhất: ${nf(avgC)}/tháng; dự báo ${ml} ${nf(F.fin)} (${dlt(F.fin,avgC)} so bình quân).`);
  B+=wUnit(tb('Dự báo thu tiền '+ml)+' · đơn vị: '+un);
  B+=wTbl([{w:46,al:'left'},{w:18,al:'right'},{w:36,al:'left'}],[['Chỉ tiêu','Giá trị','Cách tính']],[
    {c:['Đã thu đến '+dds,nf(R.mtd),R.wdDone+' ngày làm việc']},
    {c:['Dự báo theo lịch sử thu theo ngày',nf(F.prof),'Lũy kế ÷ tỷ trọng thu bình quân đến ngày '+F.dd+' (12 tháng)']},
    {c:['Dự báo từ dưới lên (nợ hiện có + bán mới)',nf(F.buc),'Nợ mở × xác suất thu theo tuổi + doanh số còn lại × tỷ lệ thu cùng tháng']},
    {c:[{t:'Dự báo kết hợp',b:1},{t:nf(F.fin),b:1},'Bình quân hai phương pháp · khoảng '+nf(F.lo)+' – '+nf(F.hi)],k:'g1'},
    {c:['Còn phải thu',nf(remain),R.wdRest+' ngày làm việc → '+nf(R.wdRest?remain/R.wdRest:null)+'/ngày']},
    {c:['Sai số kiểm định 6 tháng gần nhất',pcs(F.bt?F.bt.mFI:null),'Sai lệch tuyệt đối bình quân giữa dự báo và thực tế']}],{fs:20});

  /* — V. KHÁCH CẦN ĐÔN ĐỐC — */
  B+=wH1('V. KHÁCH HÀNG CẦN ĐÔN ĐỐC THU NỢ');
  if(!R.W.length)B+=wTx('Không có khách hàng quá hạn ≥ 50 triệu mà chưa nộp tiền trong tháng.');
  else{const w15=R.W.slice(0,15);B+=wTx(`Khách hàng có nợ quá hạn từ 50 triệu đồng trở lên nhưng **chưa có tiền về trong ${ml}**: ${R.W.length} khách, tổng quá hạn ${nf(R.W.reduce((s,o)=>s+o.ov,0))} ${un}. Danh sách ${w15.length} khách lớn nhất:`);
    B+=wUnit(tb('Khách hàng quá hạn chưa nộp tiền trong tháng')+' · đơn vị: '+un);
    B+=wTbl([{w:5,al:'right'},{w:35,al:'left'},{w:14,al:'left'},{w:11,al:'right'},{w:11,al:'right'},{w:12,al:'center'},{w:12,al:'right'}],[['STT','Khách hàng','Vùng','Dư nợ','Quá hạn','Lần thu cuối','Số ngày chưa thu']],
      w15.map((o,x)=>({c:[String(x+1),cName(o.i),X.vung[o.i],nf(o.dr),{t:nf(o.ov),c:WCOL.red,b:1},o.lp?dStr(o.lp):'Chưa từng thu',o.gap===null?'–':String(o.gap)]})).concat([{c:[{t:'Cộng '+w15.length+' khách',span:3},nf(w15.reduce((s,o)=>s+o.dr,0)),nf(w15.reduce((s,o)=>s+o.ov,0)),'',''],k:'sum'}]),{fs:19});}
  B+=wP(wR('Ghi chú: ',{b:1,i:1,sz:20})+wR('Tiền thu = phát sinh Có TK 131 loại “Thu tiền” theo bảng phân loại W_Tên phân tích (khớp sheet OUT_BC thu tiền 1 & 2). Doanh số ghi nợ = Bán hàng + VAT + Bán khác + Bán đầu tư. Quá hạn tính sau bảo lãnh'+(state.a0?'; khách chưa có nguyên tắc nợ tạm tính hạn 30 ngày.':'.')+' Nguồn: '+(X.P.meta.file||'')+'.',{i:1,sz:20,c:WCOL.mut}),{jc:'both',bf:160});
  /* chữ ký */
  B+=`<w:tbl><w:tblPr><w:tblW w:w="${TW}" w:type="dxa"/><w:tblLayout w:type="fixed"/><w:tblBorders><w:top w:val="nil"/><w:left w:val="nil"/><w:bottom w:val="nil"/><w:right w:val="nil"/><w:insideH w:val="nil"/><w:insideV w:val="nil"/></w:tblBorders></w:tblPr><w:tblGrid><w:gridCol w:w="${TW/2}"/><w:gridCol w:w="${TW/2}"/></w:tblGrid><w:tr><w:trPr><w:cantSplit/></w:trPr>`+
    [['NGƯỜI LẬP',''],['TRƯỞNG PHÒNG TÀI CHÍNH KẾ TOÁN','']].map(x=>`<w:tc><w:tcPr><w:tcW w:w="${TW/2}" w:type="dxa"/></w:tcPr>${wP(wR(x[0],{b:1,sz:23}),{jc:'center',bf:240,af:0})}${wP(wR('(Ký, ghi rõ họ tên)',{i:1,sz:20}),{jc:'center',af:1100})}</w:tc>`).join('')+'</w:tr></w:tbl>';

  busy('Đang đóng gói file Word…');await tick();
  const title='Báo cáo thu tiền ngày '+dd;
  const bin=docxPack(B,imgs,'CMC · Báo cáo thu tiền ngày '+dd+' · '+fLab(),title);
  const name=stamp()+'_CMC_BaoCaoThuTien_'+dd.replace(/\//g,'')+'.docx';
  dlBlob(new Blob([bin],{type:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'}),name);
  busy(false);toast('📄 Đã xuất '+name);
  return {name,bytes:bin.length,charts:imgs.length,tables:nTb};
}
/* hộp chọn trước khi xuất */
function openWordDlg(){
  const D=tdDay();const days=[];for(let d=X.dmax;d>=Math.max(X.P.meta.dmin,X.dmax-120);d--)days.push(d);
  $('helpBody').innerHTML=`<h2>${ic('note')} Xuất báo cáo thu tiền ra Word<button class="xclose" id="wdX">×</button></h2>
    <div class="msub">File .docx (Times New Roman, A4) mở và sửa trực tiếp bằng Word: tóm tắt điều hành, tiền thu tại ngày báo cáo, lũy kế tháng đến ngày báo cáo, 4 biểu đồ và các bảng phân tích. Phạm vi theo bộ lọc đang chọn: <b>${esc(fLab())}</b>.</div>
    <div class="phd">Ngày báo cáo</div><div class="perrow"><select class="msel wsel" id="wdD">${days.map(d=>`<option value="${d}"${d===D?' selected':''}>${dStr(d)} · ${WDN[wday(d)]}</option>`).join('')}</select></div>
    <div class="phd">Đơn vị tính</div><div class="segs" id="wdU"><button data-wu="ty" class="${state.u!=='tr'?'on':''}">Tỷ đồng</button><button data-wu="tr" class="${state.u==='tr'?'on':''}">Triệu đồng</button></div>
    <div class="phd">Chi tiết khách hàng nộp tiền trong ngày</div><div class="segs" id="wdK"><button data-wk="all" class="on">Tất cả khách hàng</button><button data-wk="top">30 khách lớn nhất</button></div>
    <div style="display:flex;gap:8px;margin-top:16px"><button class="btn" id="wdGo" style="flex:1">${ic('download')} Tạo file Word</button><button class="btn ghost" id="wdNo">Huỷ</button></div>`;
  let u=state.u==='tr'?'tr':'ty',k='all';
  $$('#wdU [data-wu]').forEach(b=>b.onclick=()=>{u=b.dataset.wu;$$('#wdU [data-wu]').forEach(x=>x.classList.toggle('on',x===b));});
  $$('#wdK [data-wk]').forEach(b=>b.onclick=()=>{k=b.dataset.wk;$$('#wdK [data-wk]').forEach(x=>x.classList.toggle('on',x===b));});
  const close=()=>$('ovHelp').classList.remove('show');$('wdX').onclick=close;$('wdNo').onclick=close;
  $('wdGo').onclick=async()=>{const d=+$('wdD').value;close();try{await exportWord({D:d,u,detail:k});}catch(e){busy(false);console.error(e);alert('❌ Không tạo được file Word: '+e.message);}};
  $('ovHelp').classList.add('show');
}
