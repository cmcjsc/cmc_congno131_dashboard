



/* ══════════════════════════════════════════════════════════════════════
   DỰNG SLIDE POWERPOINT GỐC (native) — KHÔNG dán ảnh.
   Mỗi slide gồm hộp chữ, bảng PowerPoint và biểu đồ PowerPoint thật:
   mở ra sửa chữ, đổi màu, sửa số liệu biểu đồ (Edit Data) đều được.
   Một font duy nhất cho toàn bộ file: PFONT.
   ══════════════════════════════════════════════════════════════════════ */
const PFONT='Arial';
const DC={ink:'101828',navy:'1F3864',brand:'8A5A32',brand2:'C08A5E',
  mut:'7B8794',sub:'44506B',soft:'F4F7FB',line:'D9E0EA',white:'FFFFFF',
  ok:'2E7D52',warn:'C9762F',bad:'B03A3A',plan:'5A6B7B',ck:'9AA4AE'};
const SEMHEX={g:DC.ok,y:DC.warn,r:DC.bad,n:DC.mut};

/* đổi mọi dạng màu CSS sang HEX 6 ký tự cho OOXML.
   QUAN TRỌNG: nhiều màu nền trong dashboard là màu TRONG SUỐT (color-mix / rgba).
   Phải trộn với nền trắng trước, nếu không nền pastel sẽ thành màu đặc chói. */
let _hxc=null;
function rgbaOf(c){
  try{
    if(!c)return null;
    if(!_hxc)_hxc=document.createElement('canvas').getContext('2d');
    _hxc.fillStyle='#000'; _hxc.fillStyle=c;
    const v=_hxc.fillStyle;
    if(/^#[0-9a-f]{6}$/i.test(v))
      return [parseInt(v.slice(1,3),16),parseInt(v.slice(3,5),16),parseInt(v.slice(5,7),16),1];
    const m=v.match(/rgba?\(([^)]+)\)/);
    if(m){const p=m[1].split(',').map(x=>parseFloat(x));
      return [p[0]|0,p[1]|0,p[2]|0,(p[3]===undefined||isNaN(p[3]))?1:p[3]];}
  }catch(e){}
  return null;
}
function alphaOf(c){const a=rgbaOf(c);return a?a[3]:0;}
function hxOver(c,bg){
  const a=rgbaOf(c); if(!a)return null;
  const b=rgbaOf(bg||'#FFFFFF')||[255,255,255,1];
  const f=Math.max(0,Math.min(1,a[3]));
  return [0,1,2].map(i=>Math.round(a[i]*f+b[i]*(1-f)).toString(16).padStart(2,'0'))
    .join('').toUpperCase();
}
function hx(c,fb){
  const a=rgbaOf(c);
  if(!a)return fb||DC.brand;
  return [0,1,2].map(i=>a[i].toString(16).padStart(2,'0')).join('').toUpperCase();
}

/* ───────────────── hình khối OOXML bổ sung ───────────────── */
function pxRound(id,x,y,w,h,fill,line,rad){
  return '<p:sp><p:nvSpPr><p:cNvPr id="'+id+'" name="card'+id+'"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>'
    +'<p:spPr><a:xfrm><a:off x="'+x+'" y="'+y+'"/><a:ext cx="'+w+'" cy="'+h+'"/></a:xfrm>'
    +'<a:prstGeom prst="roundRect"><a:avLst><a:gd name="adj" fmla="val '+(rad||6000)+'"/></a:avLst></a:prstGeom>'
    +(fill?'<a:solidFill><a:srgbClr val="'+fill+'"/></a:solidFill>':'<a:noFill/>')
    +(line?'<a:ln w="9525"><a:solidFill><a:srgbClr val="'+line+'"/></a:solidFill></a:ln>':'<a:ln><a:noFill/></a:ln>')
    +'</p:spPr><p:txBody><a:bodyPr/><a:lstStyle/><a:p><a:endParaRPr lang="vi-VN"/></a:p></p:txBody></p:sp>';
}
/* BẢNG PowerPoint thật */
function pxTable(id,x,y,w,cols,rows,opt){
  opt=opt||{};
  const hR=opt.hRow||Math.round(EMU(6.2)), hH=opt.hHead||Math.round(EMU(7.2));
  const sz=opt.sz||900;
  const cell=(c,head,r)=>{
    const al=c.al||(head?'ctr':(c.num?'r':'l'));
    const col=c.c||(head?DC.sub:DC.ink);
    const bg=head?DC.soft:(c.bg||(r%2?'FFFFFF':'FBFCFE'));
    return '<a:tc><a:txBody><a:bodyPr lIns="45720" rIns="45720" tIns="27432" bIns="27432" anchor="ctr"/><a:lstStyle/>'
      +'<a:p><a:pPr algn="'+al+'"/><a:r><a:rPr lang="vi-VN" sz="'+(head?sz-50:sz)+'"'
      +((head||c.b)?' b="1"':'')+'><a:solidFill><a:srgbClr val="'+col+'"/></a:solidFill>'
      +'<a:latin typeface="'+PFONT+'"/></a:rPr><a:t xml:space="preserve">'+XE(c.t)+'</a:t></a:r></a:p></a:txBody>'
      +'<a:tcPr marL="0" marR="0"><a:lnB w="6350"><a:solidFill><a:srgbClr val="'+DC.line+'"/></a:solidFill></a:lnB>'
      +'<a:solidFill><a:srgbClr val="'+bg+'"/></a:solidFill></a:tcPr></a:tc>';
  };
  let h='<a:tbl><a:tblPr firstRow="1" bandRow="0"/><a:tblGrid>'
    +cols.map(c=>'<a:gridCol w="'+c+'"/>').join('')+'</a:tblGrid>';
  rows.forEach((r,i)=>{
    const head=(i===0);
    h+='<a:tr h="'+(head?hH:hR)+'">'+r.map(c=>cell(c,head,i)).join('')+'</a:tr>';
  });
  h+='</a:tbl>';
  const cy=hH+hR*(rows.length-1);
  return '<p:graphicFrame><p:nvGraphicFramePr><p:cNvPr id="'+id+'" name="tbl'+id+'"/>'
    +'<p:cNvGraphicFramePr><a:graphicFrameLocks noGrp="1"/></p:cNvGraphicFramePr><p:nvPr/></p:nvGraphicFramePr>'
    +'<p:xfrm><a:off x="'+x+'" y="'+y+'"/><a:ext cx="'+w+'" cy="'+cy+'"/></p:xfrm>'
    +'<a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/table">'
    +h+'</a:graphicData></a:graphic></p:graphicFrame>';
}
/* KHUNG BIỂU ĐỒ trỏ tới chartN.xml */
function pxChartFrame(id,rid,x,y,w,h){
  return '<p:graphicFrame><p:nvGraphicFramePr><p:cNvPr id="'+id+'" name="chart'+id+'"/>'
    +'<p:cNvGraphicFramePr/><p:nvPr/></p:nvGraphicFramePr>'
    +'<p:xfrm><a:off x="'+x+'" y="'+y+'"/><a:ext cx="'+w+'" cy="'+h+'"/></p:xfrm>'
    +'<a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/chart">'
    +'<c:chart xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart" '
    +'xmlns:r="'+NSR+'" r:id="'+rid+'"/></a:graphicData></a:graphic></p:graphicFrame>';
}

/* ───────────────── BIỂU ĐỒ PowerPoint (c:chartSpace) ───────────────── */
const CL=n=>{let s='';n++;while(n>0){const m=(n-1)%26;s=String.fromCharCode(65+m)+s;n=Math.floor((n-1)/26);}return s;};
const NUMV=v=>(v===null||v===undefined||v===''||isNaN(v))?null:Number(v);

function cTx(sz,color,b){
  return '<c:txPr><a:bodyPr/><a:lstStyle/><a:p><a:pPr><a:defRPr sz="'+sz+'"'+(b?' b="1"':'')
    +'><a:solidFill><a:srgbClr val="'+(color||DC.mut)+'"/></a:solidFill>'
    +'<a:latin typeface="'+PFONT+'"/></a:defRPr></a:pPr><a:endParaRPr lang="vi-VN"/></a:p></c:txPr>';
}
function cSer(i,s,cats,hbar){
  const colIdx=CL(i+1);
  const n=cats.length;
  const line=(s.type==='line');
  const fill=line
    ? '<c:spPr><a:ln w="'+(s.dash?19050:25400)+'" cap="rnd"><a:solidFill><a:srgbClr val="'+s.color+'"/></a:solidFill>'
      +(s.dash?'<a:prstDash val="dash"/>':'<a:prstDash val="solid"/>')+'</a:ln><a:effectLst/></c:spPr>'
    : '<c:spPr><a:solidFill><a:srgbClr val="'+s.color+'"/></a:solidFill><a:ln><a:noFill/></a:ln></c:spPr>';
  let dPt='';
  if(!line&&s.colors&&s.colors.length)
    dPt=s.colors.map((c,j)=>'<c:dPt><c:idx val="'+j+'"/><c:invertIfNegative val="0"/><c:bubble3D val="0"/>'
      +'<c:spPr><a:solidFill><a:srgbClr val="'+c+'"/></a:solidFill><a:ln><a:noFill/></a:ln></c:spPr></c:dPt>').join('');
  const dLbls=s.labels?('<c:dLbls><c:numFmt formatCode="'+(s.fmt||'General')+'" sourceLinked="0"/>'
      +'<c:spPr><a:noFill/><a:ln><a:noFill/></a:ln></c:spPr>'+cTx(750,DC.sub,1)
      +'<c:dLblPos val="'+(line?'t':(hbar?'outEnd':'outEnd'))+'"/>'
      +'<c:showLegendKey val="0"/><c:showVal val="1"/><c:showCatName val="0"/>'
      +'<c:showSerName val="0"/><c:showPercent val="0"/><c:showBubbleSize val="0"/></c:dLbls>')
    :'<c:dLbls><c:showLegendKey val="0"/><c:showVal val="0"/><c:showCatName val="0"/>'
      +'<c:showSerName val="0"/><c:showPercent val="0"/><c:showBubbleSize val="0"/></c:dLbls>';
  const marker=line?('<c:marker><c:symbol val="'+(s.dash?'none':'circle')+'"/><c:size val="5"/>'
      +'<c:spPr><a:solidFill><a:srgbClr val="'+s.color+'"/></a:solidFill></c:spPr></c:marker>'):'';
  const tx='<c:tx><c:strRef><c:f>Sheet1!$'+colIdx+'$1</c:f><c:strCache><c:ptCount val="1"/>'
    +'<c:pt idx="0"><c:v>'+XE(s.name)+'</c:v></c:pt></c:strCache></c:strRef></c:tx>';
  const cat='<c:cat><c:strRef><c:f>Sheet1!$A$2:$A$'+(n+1)+'</c:f><c:strCache><c:ptCount val="'+n+'"/>'
    +cats.map((c,j)=>'<c:pt idx="'+j+'"><c:v>'+XE(c)+'</c:v></c:pt>').join('')+'</c:strCache></c:strRef></c:cat>';
  let pts='';
  s.data.forEach((v,j)=>{const x=NUMV(v); if(x!==null)pts+='<c:pt idx="'+j+'"><c:v>'+x+'</c:v></c:pt>';});
  const val='<c:val><c:numRef><c:f>Sheet1!$'+colIdx+'$2:$'+colIdx+'$'+(n+1)+'</c:f>'
    +'<c:numCache><c:formatCode>'+(s.fmt||'General')+'</c:formatCode><c:ptCount val="'+n+'"/>'+pts+'</c:numCache></c:numRef></c:val>';
  return '<c:ser><c:idx val="'+i+'"/><c:order val="'+i+'"/>'+tx+fill
    +(line?marker:'<c:invertIfNegative val="0"/>')+dPt+dLbls+cat+val+(line?'<c:smooth val="0"/>':'')+'</c:ser>';
}
function cAx(id,cross,pos,isCat,fmt,opt){
  opt=opt||{};
  const common='<c:delete val="'+(opt.hide?1:0)+'"/><c:axPos val="'+pos+'"/>';
  const gl=(isCat||opt.nogrid)?'':'<c:majorGridlines><c:spPr><a:ln w="9525"><a:solidFill><a:srgbClr val="EDF1F6"/></a:solidFill></a:ln></c:spPr></c:majorGridlines>';
  const sp='<c:spPr><a:ln w="9525"><a:solidFill><a:srgbClr val="'+DC.line+'"/></a:solidFill></a:ln></c:spPr>';
  const sc='<c:scaling><c:orientation val="minMax"/></c:scaling>';
  if(isCat)
    return '<c:catAx><c:axId val="'+id+'"/>'+sc+common+gl
      +'<c:numFmt formatCode="General" sourceLinked="0"/><c:majorTickMark val="none"/><c:minorTickMark val="none"/>'
      +'<c:tickLblPos val="'+(opt.hide?'none':'nextTo')+'"/>'+sp+cTx(850,DC.mut)
      +'<c:crossAx val="'+cross+'"/><c:crosses val="autoZero"/><c:auto val="1"/>'
      +'<c:lblAlgn val="ctr"/><c:lblOffset val="100"/><c:noMultiLvlLbl val="0"/></c:catAx>';
  return '<c:valAx><c:axId val="'+id+'"/>'+sc+common+gl
    +'<c:numFmt formatCode="'+(fmt||'General')+'" sourceLinked="0"/><c:majorTickMark val="none"/>'
    +'<c:minorTickMark val="none"/><c:tickLblPos val="'+(opt.hide?'none':'nextTo')+'"/>'+sp+cTx(850,DC.mut)
    +'<c:crossAx val="'+cross+'"/><c:crosses val="'+(opt.max?'max':'autoZero')+'"/>'
    +'<c:crossBetween val="between"/></c:valAx>';
}
function chartXML(sp,rid){
  const AX1=111111111, AX2=222222222;
  const cats=sp.cats, sers=sp.sers;
  let plot='';
  if(sp.kind==='pie'){
    const s=sers[0];
    let dPt='';
    (s.colors||[]).forEach((c,j)=>{dPt+='<c:dPt><c:idx val="'+j+'"/><c:bubble3D val="0"/>'
      +'<c:spPr><a:solidFill><a:srgbClr val="'+c+'"/></a:solidFill>'
      +'<a:ln w="19050"><a:solidFill><a:srgbClr val="FFFFFF"/></a:solidFill></a:ln></c:spPr></c:dPt>';});
    let pts='';
    s.data.forEach((v,j)=>{const x=NUMV(v); if(x!==null)pts+='<c:pt idx="'+j+'"><c:v>'+x+'</c:v></c:pt>';});
    plot='<c:doughnutChart><c:varyColors val="1"/><c:ser><c:idx val="0"/><c:order val="0"/>'
      +'<c:tx><c:strRef><c:f>Sheet1!$B$1</c:f><c:strCache><c:ptCount val="1"/>'
      +'<c:pt idx="0"><c:v>'+XE(s.name)+'</c:v></c:pt></c:strCache></c:strRef></c:tx>'
      +dPt
      +'<c:dLbls>'+cTx(800,DC.sub,1)+'<c:showLegendKey val="0"/><c:showVal val="1"/>'
      +'<c:showCatName val="0"/><c:showSerName val="0"/><c:showPercent val="0"/><c:showBubbleSize val="0"/></c:dLbls>'
      +'<c:cat><c:strRef><c:f>Sheet1!$A$2:$A$'+(cats.length+1)+'</c:f><c:strCache><c:ptCount val="'+cats.length+'"/>'
      +cats.map((c,j)=>'<c:pt idx="'+j+'"><c:v>'+XE(c)+'</c:v></c:pt>').join('')+'</c:strCache></c:strRef></c:cat>'
      +'<c:val><c:numRef><c:f>Sheet1!$B$2:$B$'+(cats.length+1)+'</c:f><c:numCache>'
      +'<c:formatCode>General</c:formatCode><c:ptCount val="'+cats.length+'"/>'+pts+'</c:numCache></c:numRef></c:val>'
      +'</c:ser><c:dLbls><c:showLegendKey val="0"/><c:showVal val="1"/><c:showCatName val="0"/>'
      +'<c:showSerName val="0"/><c:showPercent val="0"/><c:showBubbleSize val="0"/></c:dLbls>'
      +'<c:firstSliceAng val="0"/><c:holeSize val="52"/></c:doughnutChart>';
  }else{
    const hbar=(sp.kind==='hbar');
    const AX3=333333333, AX4=444444444;
    const hasSec=sers.some(x=>x.sec);
    const grp=(list,a1,a2)=>{
      let h='';
      const bars=list.filter(x=>x.type!=='line'), lines=list.filter(x=>x.type==='line');
      if(bars.length)
        h+='<c:barChart><c:barDir val="'+(hbar?'bar':'col')+'"/><c:grouping val="clustered"/>'
          +'<c:varyColors val="0"/>'+bars.map(x=>cSer(sers.indexOf(x),x,cats,hbar)).join('')
          +'<c:gapWidth val="'+(hbar?60:55)+'"/><c:overlap val="-20"/>'
          +'<c:axId val="'+a1+'"/><c:axId val="'+a2+'"/></c:barChart>';
      if(lines.length)
        h+='<c:lineChart><c:grouping val="standard"/><c:varyColors val="0"/>'
          +lines.map(x=>cSer(sers.indexOf(x),x,cats,hbar)).join('')
          +'<c:marker val="1"/><c:axId val="'+a1+'"/><c:axId val="'+a2+'"/></c:lineChart>';
      return h;
    };
    plot+=grp(sers.filter(x=>!x.sec),AX1,AX2);
    if(hasSec)plot+=grp(sers.filter(x=>x.sec),AX3,AX4);
    plot+=cAx(AX1,AX2,hbar?'l':'b',true,null,{})
        + cAx(AX2,AX1,hbar?'b':'l',false,sp.fmt,{});
    if(hasSec)
      plot+=cAx(AX4,AX3,hbar?'t':'r',false,sp.fmt2||sp.fmt,{max:1,nogrid:1})
          + cAx(AX3,AX4,hbar?'r':'t',true,null,{hide:1});
  }
  const legend=(sers.length>1||sp.kind==='pie')
    ? '<c:legend><c:legendPos val="b"/><c:overlay val="0"/>'+cTx(850,DC.sub)+'</c:legend>' : '';
  return XH+'<c:chartSpace xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart" '
    +'xmlns:a="'+NSA+'" xmlns:r="'+NSR+'">'
    +'<c:date1904 val="0"/><c:lang val="vi-VN"/><c:roundedCorners val="0"/>'
    +'<c:chart><c:autoTitleDeleted val="1"/><c:plotArea><c:layout/>'+plot
    +'<c:spPr><a:noFill/><a:ln><a:noFill/></a:ln></c:spPr></c:plotArea>'
    +legend+'<c:plotVisOnly val="1"/><c:dispBlanksAs val="gap"/></c:chart>'
    +'<c:spPr><a:noFill/><a:ln><a:noFill/></a:ln></c:spPr>'+cTx(900,DC.sub)
    +'<c:externalData r:id="'+rid+'"><c:autoUpdate val="0"/></c:externalData></c:chartSpace>';
}
/* workbook nhúng -> PowerPoint bấm “Edit Data” sửa được số liệu */
function chartBook(sp){
  const aoa=[['Hạng mục'].concat(sp.sers.map(s=>s.name))];
  sp.cats.forEach((c,i)=>aoa.push([c].concat(sp.sers.map(s=>NUMV(s.data[i])))));
  const ws=XLSX.utils.aoa_to_sheet(aoa);
  const wb=XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb,ws,'Sheet1');
  return new Uint8Array(XLSX.write(wb,{bookType:'xlsx',type:'array'}));
}

/* ───────── đọc biểu đồ đang vẽ trên màn hình -> spec PowerPoint ───────── */
function specFromChart(ch){
  if(!ch||!ch.data)return null;
  const t=ch.config.type, hb=!!(ch.options&&ch.options.indexAxis==='y');
  const cats=(ch.data.labels||[]).map(x=>String(x));
  const cols=KCOL().map(c=>hx(c));
  if(t==='doughnut'||t==='pie'){
    const d=ch.data.datasets[0]||{data:[]};
    return {kind:'pie',cats:cats,fmt:'#,##0.0',sers:[{name:d.label||'Tỷ trọng',data:d.data||[],fmt:'#,##0.0',
      color:DC.brand,colors:(Array.isArray(d.backgroundColor)?d.backgroundColor.map((c,i)=>hx(c,cols[i%cols.length])):cats.map((_,i)=>cols[i%cols.length]))}]};
  }
  const sers=(ch.data.datasets||[]).filter(d=>d&&d.data&&d.data.length).map((d,i)=>{
    const isLine=(d.type==='line')||(t==='line'&&d.type!=='bar');
    const base=isLine?(d.borderColor||d.backgroundColor):(d.backgroundColor||d.borderColor);
    return {name:d.label||('Chuỗi '+(i+1)),
      data:d.data.map(v=>(v&&typeof v==='object')?(v.y!==undefined?v.y:v.x):v),
      type:isLine?'line':'bar',
      dash:!!(d.borderDash&&d.borderDash.length),
      sec:(d.yAxisID&&d.yAxisID!=='y'),
      color:hx(Array.isArray(base)?base[0]:base,cols[i%cols.length]),
      colors:Array.isArray(base)?base.map((c,j)=>hx(c,cols[j%cols.length])):null,
      labels:!!state.labels&&!isLine};
  });
  if(!sers.length)return null;
  /* định dạng số theo độ lớn -> nhãn gọn, không tràn thành 2 dòng */
  let mx=0;
  sers.forEach(x=>x.data.forEach(v=>{const n=NUMV(v); if(n!==null)mx=Math.max(mx,Math.abs(n));}));
  const F=v=>v<10?'#,##0.00':(v<1000?'#,##0.0':'#,##0');
  let m2=0;
  sers.forEach(x=>{if(x.sec)x.data.forEach(v=>{const n=NUMV(v);if(n!==null)m2=Math.max(m2,Math.abs(n));});});
  const fmt=F(mx), fmt2=m2?F(m2):fmt;
  sers.forEach(x=>{x.fmt=x.sec?fmt2:fmt;});
  return {kind:hb?'hbar':(t==='line'?'line':'bar'),cats:cats,sers:sers,fmt:fmt,fmt2:fmt2};
}

/* ───────────────── gom nội dung 1 mục thành các slide ───────────────── */
function txt(el){return el?el.textContent.replace(/\s+/g,' ').trim():'';}
/* chữ hiển thị thật: bỏ nút ✕, +, ⚠ … của chế độ chỉnh sửa */
function txtVis(el){
  if(!el)return '';
  let out='';
  const walk=n=>{
    if(n.nodeType===3){out+=n.nodeValue;return;}
    if(n.nodeType!==1)return;
    if(n.tagName==='BUTTON'||n.tagName==='INPUT'||n.tagName==='SELECT')return;
    for(const c of SKIPCLS)if(n.classList&&n.classList.contains(c))return;
    try{const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return;}catch(e){}
    Array.prototype.forEach.call(n.childNodes,walk);
  };
  Array.prototype.forEach.call(el.childNodes,walk);
  return out.replace(/\s+/g,' ').trim();
}

/* ══════════════════════════════════════════════════════════════════════
   RENDER SLIDE THEO ĐÚNG BỐ CỤC BẢN PDF
   Đọc vị trí thật của từng phần tử trên dashboard rồi vẽ lại bằng
   đối tượng PowerPoint gốc ở đúng toạ độ — nên slide giống hệt trang PDF.
   ══════════════════════════════════════════════════════════════════════ */
/* px trên màn hình -> point trên slide, theo đúng tỉ lệ thu nhỏ của trang */
function ptOf(px,k){return Math.max(4,Math.round(px*(k/36000)*2.83465*10)/10);}
function alphaOf(c){const m=String(c).match(/rgba?\(([^)]+)\)/);
  if(!m)return 1; const a=m[1].split(',')[3]; return a===undefined?1:parseFloat(a);}
function alignOf(t){return t==='center'?'ctr':(t==='right'?'r':'l');}

/* gom khối theo HÀNG của lưới — cùng quy tắc với bản in PDF */
function packRows(grid){
  const rows=[];
  Array.prototype.slice.call(grid.children).forEach(b=>{
    if(b.getAttribute('data-hidden'))return;
    const t=Math.round(b.offsetTop/8);
    let r=rows.find(x=>x.t===t);
    if(!r){r={t:t,els:[],h:0};rows.push(r);}
    r.els.push(b);
    r.h=Math.max(r.h,b.getBoundingClientRect().height);
  });
  rows.sort((a,b)=>a.t-b.t);
  return rows;
}
/* dàn 1 mục thành các trang — khối bảng quá dài thì cắt theo hàng */
function pageSplit(grid,budget){
  const out=[];
  packRows(grid).forEach(r=>{
    if(r.els.length===1){
      const tb=r.els[0].querySelector('table');
      const body=tb?tb.querySelector('tbody'):null;
      const trs=body?body.children.length:0;
      if(tb&&trs>8&&r.h>budget-13){
        const rh=body.children[0].getBoundingClientRect().height||18;
        const thd=tb.querySelector('thead');
        const over=r.h-tb.getBoundingClientRect().height
          +(thd?thd.getBoundingClientRect().height:0);
        const cap=Math.max(4,Math.floor((budget-over-20)/rh));
        if(cap<trs){
          for(let i=0;i<trs;i+=cap)
            out.push({t:r.t,els:r.els,h:over+Math.min(cap,trs-i)*rh+8,
              slice:[i,Math.min(i+cap,trs)]});
          return;
        }
      }
    }
    out.push(r);
  });
  return packPages(out,budget);
}
function packPages(rows,budget){
  const pages=[], cur={rows:[],h:0};
  const flush=()=>{if(cur.rows.length){pages.push(cur.rows.slice());cur.rows.length=0;cur.h=0;}};
  rows.forEach(r=>{
    if(cur.rows.length&&cur.h+r.h+13>budget)flush();
    cur.rows.push(r); cur.h+=r.h+13;
  });
  flush();
  return pages;
}

/* ── vẽ 1 phần tử DOM thành shape PowerPoint ── */
function deckCtx(o){
  /* o: {sh, idr, gx, gy, k, ox, oy, charts, rels, W} */
  const X=r=>Math.round(o.ox+(r.left-o.gx)*o.k);
  const Y=r=>Math.round(o.oy+(r.top -o.gy)*o.k);
  const Wd=r=>Math.max(1,Math.round(r.width*o.k));
  const Ht=r=>Math.max(1,Math.round(r.height*o.k));

  const deco=(el,st,r)=>{
    const bg=st.backgroundColor, bw=parseFloat(st.borderTopWidth)||0;
    const bc=st.borderTopColor;
    const hasBg=bg&&bg!=='transparent'&&alphaOf(bg)>0.04;
    const hasLn=bw>0.4&&bc&&alphaOf(bc)>0.08;
    if(!hasBg&&!hasLn)return;
    const rad=parseFloat(st.borderTopLeftRadius)||0;
    o.sh.push(pxRound(o.idr.n++,X(r),Y(r),Wd(r),Ht(r),
      hasBg?(hxOver(bg,'#FFFFFF')||'FFFFFF'):null,
      hasLn?(hxOver(bc,'#FFFFFF')||DC.line):null,
      rad>1?Math.min(28000,Math.round(rad*2600)):1000));
    /* vạch màu trái của thẻ KPI (::before) — dựng lại bằng 1 thanh mảnh */
    if(el.classList&&el.classList.contains('kpi')){
      const sem=el.classList.contains('g')?DC.ok:el.classList.contains('y')?DC.warn
        :el.classList.contains('r')?DC.bad:DC.mut;
      o.sh.push(pxRect(o.idr.n++,X(r),Y(r)+EMU(1),Math.max(EMU(0.9),Math.round(3*o.k)),
        Ht(r)-EMU(2),sem));
    }
  };
  const text=(el,t,st,r)=>{
    const w=parseInt(st.fontWeight,10)||400;
    const lh=parseFloat(st.lineHeight)||0, fs=parseFloat(st.fontSize)||12;
    o.sh.push(pxSp(o.idr.n++,X(r),Y(r),Wd(r),Ht(r),
      [{al:alignOf(st.textAlign),ln:(lh&&fs)?Math.round(lh/fs*100):0,
        r:[{t:t,sz:ptOf(fs,o.k),b:w>=600,c:hxOver(st.color,'#FFFFFF')||DC.ink}]}],
      {fit:1,anchor:'ctr'}));
  };
  const chart=(cv,r)=>{
    const ch=CH.find(c=>c.canvas===cv);
    const spec=specFromChart(ch);
    if(!spec)return;
    const n=o.charts.length+1;
    o.charts.push({xml:chartXML(spec,'rId1'),book:chartBook(spec),n:n});
    o.rels.push([RT('chart'),'../charts/chart'+n+'.xml']);
    o.sh.push(pxChartFrame(o.idr.n++,'rId'+o.rels.length,X(r),Y(r),Wd(r),Ht(r)));
  };
  const table=(tb,r,slice)=>{
    const ths=Array.prototype.slice.call(tb.querySelectorAll('thead th'));
    let trs=Array.prototype.slice.call(tb.querySelectorAll('tbody tr'));
    if(slice)trs=trs.slice(slice[0],slice[1]);
    if(!ths.length||!trs.length)return;
    /* độ rộng cột lấy đúng như đang hiển thị, ép vừa bề ngang khung */
    let cw=ths.map(t=>t.getBoundingClientRect().width);
    const tot=cw.reduce((a,b)=>a+b,0)||1;
    const panelW=r.width;
    cw=cw.map(x=>Math.max(EMU(9),Math.round(x/tot*panelW*o.k)));
    const sum=cw.reduce((a,b)=>a+b,0);
    cw[0]+=Math.round(panelW*o.k)-sum;
    const fs=parseFloat(getComputedStyle(trs[0].children[0]||ths[0]).fontSize)||12;
    const szPt=Math.round(ptOf(fs,o.k)*100);
    const hRow=Math.max(EMU(4),Math.round(trs[0].getBoundingClientRect().height*o.k));
    const hHead=Math.max(EMU(5),Math.round(ths[0].getBoundingClientRect().height*o.k));
    const hdr=ths.map(t=>({t:txt(t),al:'ctr'}));
    const rows=[hdr].concat(trs.map(tr=>
      Array.prototype.slice.call(tr.children).map(td=>{
        const cs=getComputedStyle(td);
        return {t:txt(td),al:alignOf(cs.textAlign),
          b:(parseInt(cs.fontWeight,10)||400)>=650,
          c:hxOver(cs.color,'#FFFFFF')||DC.ink};})));
    o.sh.push(pxTable(o.idr.n++,X(r),Y(r),Math.round(panelW*o.k),cw,rows,
      {sz:szPt,hRow:hRow,hHead:hHead}));
  };
  /* ẢNH (thư viện ảnh minh chứng) → ảnh PowerPoint thật, cắt khung đúng như object-fit:cover */
  const pic=(im,r)=>{
    const src=im.getAttribute('src')||''; const mm=src.match(/^data:image\/(png|jpe?g);base64,(.+)$/i); if(!mm)return;
    const ext=mm[1].toLowerCase()==='png'?'png':'jpeg';
    const n=(o.media.length+1)+'_'+o.media.length; const nm='image'+(o.media.length+1)+'.'+ext;
    o.media.push({name:nm,data:b64bytes(mm[2]),ext:ext});
    o.rels.push([RT('image'),'../media/'+nm]);
    let crop=null; const nw=im.naturalWidth||0, nh=im.naturalHeight||0;
    if(nw&&nh&&r.width&&r.height){const a0=nw/nh,a1=r.width/r.height;
      if(a0>a1){const c=Math.round((1-a1/a0)/2*100000);crop={l:c,r:c,t:0,b:0};}
      else if(a0<a1){const c=Math.round((1-a0/a1)/2*100000);crop={l:0,r:0,t:c,b:c};}}
    o.sh.push(pxPic(o.idr.n++,'rId'+o.rels.length,X(r),Y(r),Wd(r),Ht(r),crop));
  };
  return {X:X,Y:Y,W:Wd,H:Ht,deco:deco,text:text,chart:chart,table:table,pic:pic};
}
const SKIPCLS=['lay','ctbar','tbbar','srcb','hlp','spk','crs','ildel','iladd','inshint','nwarn','secrs','gtools','galadd','galmore'];
function emitNode(el,ctx,o,slice){
  if(!el||el.nodeType!==1)return;
  if(el.tagName==='BUTTON'||el.tagName==='INPUT'||el.tagName==='SELECT')return;
  for(const c of SKIPCLS)if(el.classList&&el.classList.contains(c))return;
  const st=getComputedStyle(el);
  if(st.display==='none'||st.visibility==='hidden'||parseFloat(st.opacity)<0.05)return;
  const r=el.getBoundingClientRect();
  if(r.width<2||r.height<2)return;
  if(el.tagName==='CANVAS'){ctx.chart(el,r);return;}
  if(el.tagName==='IMG'){if(ctx.pic)ctx.pic(el,r);return;}
  if(el.tagName==='TABLE'){ctx.table(el,r,slice);return;}
  if(el.tagName==='SVG'||el.tagName==='svg')return;
  ctx.deco(el,st,r);
  const kids=Array.prototype.slice.call(el.children).filter(c=>{
    if(c.nodeType!==1)return false;
    const cs=getComputedStyle(c);
    return cs.display!=='none'&&cs.visibility!=='hidden';
  });
  /* con nào là khối riêng (block/flex/grid/table/canvas) thì đi tiếp,
     còn lại coi cả phần tử này là 1 đoạn chữ */
  const blocky=kids.filter(c=>{
    const cs=getComputedStyle(c);
    return c.tagName==='CANVAS'||c.tagName==='TABLE'||
      cs.display.indexOf('inline')!==0;
  });
  const ownTxt=Array.prototype.filter.call(el.childNodes,
    n=>n.nodeType===3&&n.nodeValue.trim()!=='').length>0;
  const hasCT=el.querySelector&&(el.querySelector('canvas')||el.querySelector('table'));
  if(blocky.length&&(!ownTxt||hasCT)){blocky.forEach(c=>emitNode(c,ctx,o,slice));return;}
  const t=txtVis(el);
  if(t)ctx.text(el,t,st,r);
}

function deckHead(sh,idr,W,title,per,pageNo){
  sh.push(pxRect(idr.n++,0,0,W,EMU(1.6),DC.brand));
  sh.push(pxSp(idr.n++,EMU(14),EMU(7),W-EMU(70),EMU(11),
    [{al:'l',r:[{t:title,sz:17,b:1,c:DC.navy}]}],{fit:1,anchor:'ctr'}));
  sh.push(pxSp(idr.n++,W-EMU(60),EMU(7),EMU(46),EMU(11),
    [{al:'r',r:[{t:per,sz:10,b:1,c:DC.mut}]}],{anchor:'ctr'}));
  sh.push(pxRect(idr.n++,EMU(14),EMU(19.4),W-EMU(28),EMU(0.4),DC.line));
}
function deckFoot(sh,idr,W,H,pageNo){
  sh.push(pxRect(idr.n++,EMU(14),H-EMU(14),W-EMU(28),EMU(0.4),DC.line));
  sh.push(pxSp(idr.n++,EMU(14),H-EMU(12),W-EMU(40),EMU(7),
    [{al:'l',r:[{t:'Công ty cổ phần CMC · Công nợ & thu tiền TK 131',sz:8.5,c:DC.mut}]}]));
  sh.push(pxSp(idr.n++,W-EMU(30),H-EMU(12),EMU(16),EMU(7),
    [{al:'r',r:[{t:String(pageNo),sz:9,b:1,c:DC.navy}]}]));
}




