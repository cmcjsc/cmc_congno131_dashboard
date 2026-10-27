



/* ══════════════════════════════════════════════════════════════
   XUẤT POWERPOINT (.pptx) — không dùng thư viện ngoài, không cần mạng.
   Gồm 3 phần: (1) nén ZIP tối giản, (2) khung XML của file PPTX,
   (3) dựng ảnh trang từ chính bản in đang xem.
   ══════════════════════════════════════════════════════════════ */

/* ---------- 1. ZIP (lưu thô — PowerPoint chấp nhận) ---------- */
const CRCT=(function(){const t=new Uint32Array(256);
  for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=(c&1)?(0xEDB88320^(c>>>1)):(c>>>1);t[n]=c>>>0;}
  return t;})();
function crc32(b){let c=0xFFFFFFFF;for(let i=0;i<b.length;i++)c=CRCT[(c^b[i])&0xFF]^(c>>>8);return (c^0xFFFFFFFF)>>>0;}
const UTF8=s=>new TextEncoder().encode(s);
function b64bytes(b64){
  const s=atob(b64), a=new Uint8Array(s.length);
  for(let i=0;i<s.length;i++)a[i]=s.charCodeAt(i);
  return a;
}
function zipMake(files){
  const enc=[], cen=[]; let off=0;
  const u16=v=>[v&255,(v>>8)&255];
  const u32=v=>[v&255,(v>>8)&255,(v>>16)&255,(v>>24)&255];
  /* ngày giờ kiểu MS-DOS — để 0 sẽ thành ngày 0/0/1980 không hợp lệ, Office từ chối mở */
  const d=new Date();
  const dTime=((d.getHours()&31)<<11)|((d.getMinutes()&63)<<5)|((d.getSeconds()>>1)&31);
  const dDate=(((d.getFullYear()-1980)&127)<<9)|(((d.getMonth()+1)&15)<<5)|(d.getDate()&31);
  files.forEach(f=>{
    const nm=UTF8(f.name), d=f.data, c=crc32(d);
    const lh=[].concat([80,75,3,4],u16(20),u16(2048),u16(0),u16(dTime),u16(dDate),
      u32(c),u32(d.length),u32(d.length),u16(nm.length),u16(0));
    const head=new Uint8Array(lh);
    enc.push(head,nm,d);
    cen.push({nm:nm,c:c,len:d.length,off:off});
    off+=head.length+nm.length+d.length;
  });
  const cd=[];
  cen.forEach(e=>{
    const ch=[].concat([80,75,1,2],u16(20),u16(20),u16(2048),u16(0),u16(dTime),u16(dDate),
      u32(e.c),u32(e.len),u32(e.len),u16(e.nm.length),u16(0),u16(0),u16(0),u16(0),u32(0),u32(e.off));
    cd.push(new Uint8Array(ch),e.nm);
  });
  let cdLen=0; cd.forEach(x=>cdLen+=x.length);
  const eocd=new Uint8Array([].concat([80,75,5,6],u16(0),u16(0),
    u16(cen.length),u16(cen.length),u32(cdLen),u32(off),u16(0)));
  const all=enc.concat(cd,[eocd]);
  let tot=0; all.forEach(x=>tot+=x.length);
  const out=new Uint8Array(tot); let p=0;
  all.forEach(x=>{out.set(x,p);p+=x.length;});
  return out;
}

/* ---------- 2. Khung XML ---------- */
const XE=s=>String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;')
  .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const XH='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
const NSA='http://schemas.openxmlformats.org/drawingml/2006/main';
const NSP='http://schemas.openxmlformats.org/presentationml/2006/main';
const NSR='http://schemas.openxmlformats.org/officeDocument/2006/relationships';
const EMU=mm=>Math.round(mm*36000);

function pxTheme(){
  const f='<a:latin typeface="'+PFONT+'"/><a:ea typeface="'+PFONT+'"/><a:cs typeface="'+PFONT+'"/>';
  const fill='<a:solidFill><a:schemeClr val="phClr"/></a:solidFill>';
  const ln='<a:ln w="9525" cap="flat" cmpd="sng" algn="ctr">'+fill+'<a:prstDash val="solid"/></a:ln>';
  let c='';
  [['dk1','000000'],['lt1','FFFFFF'],['dk2','1F3864'],['lt2','EEF2F9'],
   ['accent1','8A5A32'],['accent2','C08A5E'],['accent3','1F3864'],['accent4','3E8E5A'],
   ['accent5','C9762F'],['accent6','B03A3A'],['hlink','1F6FEB'],['folHlink','7A4FB5']]
   .forEach(x=>{c+='<a:'+x[0]+'><a:srgbClr val="'+x[1]+'"/></a:'+x[0]+'>';});
  return XH+'<a:theme xmlns:a="'+NSA+'" name="CMC"><a:themeElements>'
    +'<a:clrScheme name="CMC">'+c+'</a:clrScheme>'
    +'<a:fontScheme name="CMC"><a:majorFont>'+f+'</a:majorFont><a:minorFont>'+f+'</a:minorFont></a:fontScheme>'
    +'<a:fmtScheme name="CMC">'
    +'<a:fillStyleLst>'+fill+fill+fill+'</a:fillStyleLst>'
    +'<a:lnStyleLst>'+ln+ln+ln+'</a:lnStyleLst>'
    +'<a:effectStyleLst><a:effectStyle><a:effectLst/></a:effectStyle>'
    +'<a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst/></a:effectStyle></a:effectStyleLst>'
    +'<a:bgFillStyleLst>'+fill+fill+fill+'</a:bgFillStyleLst>'
    +'</a:fmtScheme></a:themeElements><a:objectDefaults/><a:extraClrSchemeLst/></a:theme>';
}
function pxMaster(){
  return XH+'<p:sldMaster xmlns:a="'+NSA+'" xmlns:r="'+NSR+'" xmlns:p="'+NSP+'">'
    +'<p:cSld><p:bg><p:bgPr><a:solidFill><a:schemeClr val="lt1"/></a:solidFill><a:effectLst/></p:bgPr></p:bg>'
    +'<p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>'
    +'<p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/>'
    +'<a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr></p:spTree></p:cSld>'
    +'<p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2"'
    +' accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/>'
    +'<p:sldLayoutIdLst><p:sldLayoutId id="2147483649" r:id="rId1"/></p:sldLayoutIdLst>'
    +'<p:txStyles><p:titleStyle><a:lvl1pPr><a:defRPr sz="1800"><a:latin typeface="'+PFONT+'"/></a:defRPr></a:lvl1pPr></p:titleStyle>'
    +'<p:bodyStyle><a:lvl1pPr><a:defRPr sz="1200"><a:latin typeface="'+PFONT+'"/></a:defRPr></a:lvl1pPr></p:bodyStyle>'
    +'<p:otherStyle><a:lvl1pPr><a:defRPr sz="1200"><a:latin typeface="'+PFONT+'"/></a:defRPr></a:lvl1pPr></p:otherStyle>'
    +'</p:txStyles></p:sldMaster>';
}
function pxLayout(){
  return XH+'<p:sldLayout xmlns:a="'+NSA+'" xmlns:r="'+NSR+'" xmlns:p="'+NSP+'" type="blank" preserve="1">'
    +'<p:cSld name="Trống"><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>'
    +'<p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/>'
    +'<a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr></p:spTree></p:cSld>'
    +'<p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sldLayout>';
}
function pxRels(list){
  return XH+'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
    +list.map((r,i)=>'<Relationship Id="rId'+(i+1)+'" Type="'+r[0]+'" Target="'+r[1]+'"/>').join('')
    +'</Relationships>';
}
const RT=t=>'http://schemas.openxmlformats.org/officeDocument/2006/relationships/'+t;
const RTP=t=>'http://schemas.openxmlformats.org/package/2006/relationships/metadata/'+t;

/* --- các hình khối dựng sẵn trong slide --- */
function pxSp(id,x,y,w,h,paras,opt){
  opt=opt||{};
  const fill=opt.fill?'<a:solidFill><a:srgbClr val="'+opt.fill+'"/></a:solidFill>':'<a:noFill/>';
  const anchor=opt.anchor||'t';
  const body=paras.map(pa=>{
    const runs=(pa.r||[]).map(r=>
      '<a:r><a:rPr lang="vi-VN" sz="'+Math.round((r.sz||18)*100)+'"'
      +(r.b?' b="1"':'')+' dirty="0"><a:solidFill><a:srgbClr val="'+(r.c||'101828')+'"/></a:solidFill>'
      +'<a:latin typeface="'+PFONT+'"/><a:cs typeface="'+PFONT+'"/></a:rPr>'
      +'<a:t xml:space="preserve">'+XE(r.t)+'</a:t></a:r>').join('');
    return '<a:p><a:pPr algn="'+(pa.al||'l')+'"'+(pa.sp?' ':'')+'>'
      +(pa.ln?'<a:lnSpc><a:spcPct val="'+Math.round(pa.ln*1000)+'"/></a:lnSpc>':'')
      +(pa.before?'<a:spcBef><a:spcPts val="'+Math.round(pa.before*100)+'"/></a:spcBef>':'')
      +'</a:pPr>'+(runs||'<a:endParaRPr lang="vi-VN"/>')+'</a:p>';
  }).join('');
  return '<p:sp><p:nvSpPr><p:cNvPr id="'+id+'" name="tx'+id+'"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr>'
    +'<p:spPr><a:xfrm><a:off x="'+x+'" y="'+y+'"/><a:ext cx="'+w+'" cy="'+h+'"/></a:xfrm>'
    +'<a:prstGeom prst="rect"><a:avLst/></a:prstGeom>'+fill+'</p:spPr>'
    +'<p:txBody><a:bodyPr wrap="square" anchor="'+anchor+'" lIns="0" tIns="0" rIns="0" bIns="0">'
    +(opt.fit?'<a:normAutofit/>':'')+'</a:bodyPr><a:lstStyle/>'+body+'</p:txBody></p:sp>';
}
function pxRect(id,x,y,w,h,color){
  return '<p:sp><p:nvSpPr><p:cNvPr id="'+id+'" name="r'+id+'"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>'
    +'<p:spPr><a:xfrm><a:off x="'+x+'" y="'+y+'"/><a:ext cx="'+w+'" cy="'+h+'"/></a:xfrm>'
    +'<a:prstGeom prst="rect"><a:avLst/></a:prstGeom>'
    +'<a:solidFill><a:srgbClr val="'+color+'"/></a:solidFill><a:ln><a:noFill/></a:ln></p:spPr>'
    +'<p:txBody><a:bodyPr/><a:lstStyle/><a:p><a:endParaRPr lang="vi-VN"/></a:p></p:txBody></p:sp>';
}
function pxPic(id,rid,x,y,w,h,crop){
  return '<p:pic><p:nvPicPr><p:cNvPr id="'+id+'" name="img'+id+'"/><p:cNvPicPr><a:picLocks noChangeAspect="1"/></p:cNvPicPr><p:nvPr/></p:nvPicPr>'
    +'<p:blipFill><a:blip r:embed="'+rid+'"/>'+(crop?'<a:srcRect l="'+crop.l+'" t="'+crop.t+'" r="'+crop.r+'" b="'+crop.b+'"/>':'')+'<a:stretch><a:fillRect/></a:stretch></p:blipFill>'
    +'<p:spPr><a:xfrm><a:off x="'+x+'" y="'+y+'"/><a:ext cx="'+w+'" cy="'+h+'"/></a:xfrm>'
    +'<a:prstGeom prst="rect"><a:avLst/></a:prstGeom></p:spPr></p:pic>';
}
function pxSlide(shapes,bg){
  return XH+'<p:sld xmlns:a="'+NSA+'" xmlns:r="'+NSR+'" xmlns:p="'+NSP+'"><p:cSld>'
    +(bg?'<p:bg><p:bgPr><a:solidFill><a:srgbClr val="'+bg+'"/></a:solidFill><a:effectLst/></p:bgPr></p:bg>':'')
    +'<p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>'
    +'<p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/>'
    +'<a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>'
    +shapes.join('')+'</p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sld>';
}

/* ---------- 3. Dựng ảnh 1 trang in ---------- */
/* Dùng SVG foreignObject: gói nguyên trang + CSS vào ảnh, không cần thư viện. */
function rasterPage(node,wpx,hpx,scale){
  return new Promise((res,rej)=>{
    let css='';
    document.querySelectorAll('style').forEach(s=>{css+=s.textContent+'\n';});
    /* Ảnh SVG không có <html> nên mọi biến màu đặt ở :root sẽ mất -> chép lại
       toàn bộ token màu đang dùng (bản SÁNG) vào thẻ bọc, nếu không trang sẽ ra nền tối. */
    const cs=getComputedStyle(document.documentElement);
    const names={}; (css.match(/--[a-zA-Z0-9_-]+/g)||[]).forEach(n=>{names[n]=1;});
    let vars='';
    Object.keys(names).forEach(n=>{
      const v=cs.getPropertyValue(n);
      if(v&&v.trim())vars+=n+':'+v.trim()+';';
    });
    const cl=node.cloneNode(true);
    cl.style.width=wpx+'px'; cl.style.height=hpx+'px'; cl.style.margin='0';
    cl.style.border='none'; cl.style.boxShadow='none';
    let inner='';
    try{inner=new XMLSerializer().serializeToString(cl);}catch(e){rej(e);return;}
    const svg='<svg xmlns="http://www.w3.org/2000/svg" width="'+wpx+'" height="'+hpx+'">'
      +'<foreignObject x="0" y="0" width="'+wpx+'" height="'+hpx+'">'
      +'<div xmlns="http://www.w3.org/1999/xhtml" data-mode="light" class="printing" '
      +'style="'+vars+'width:'+wpx+'px;height:'+hpx+'px;background:#fff;color:#101828">'
      +'<style><![CDATA['+css+']]></style>'+inner+'</div></foreignObject></svg>';
    const img=new Image();
    img.onload=()=>{
      try{
        const c=document.createElement('canvas');
        c.width=Math.round(wpx*scale); c.height=Math.round(hpx*scale);
        const g=c.getContext('2d');
        g.fillStyle='#fff'; g.fillRect(0,0,c.width,c.height);
        g.drawImage(img,0,0,c.width,c.height);
        res(c.toDataURL('image/png'));
      }catch(e){rej(e);}
    };
    img.onerror=()=>rej(new Error('Trình duyệt không dựng được ảnh của trang'));
    img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
  });
}




