



/* ══════════════ THÀNH PHẦN GIAO DIỆN DÙNG CHUNG ══════════════ */
let CH=[], PEND=[];
function hbox(h){
  if(typeof h==='number')return {cls:'',st:' style="height:'+h+'px"'};
  return {cls:(h||'h240'),st:''};
}
function cbox(id,h,cfg){
  PEND.push({id:id,cfg:cfg});
  const b=hbox(h);
  return `<div class="cbox ${b.cls}"${b.st}><canvas id="${id}"></canvas></div>`;
}
function emptyBox(msg,h){const b=hbox(h);
  return `<div class="cbox ${b.cls}"${b.st}><div class="empty">${msg}</div></div>`;}
function killCharts(){CH.forEach(c=>{try{c.destroy();}catch(e){}}); CH=[];}
function flushCharts(){
  killCharts();
  PEND.forEach(p=>{
    const el=$(p.id); if(!el)return;
    let cfg=p.cfg;
    try{ const b=el.closest('[data-blk]'); if(b) cfg=applyCT(cfg,ctOf(b.getAttribute('data-blk'))); }
    catch(e){ console.warn('ct',p.id,e); }
    try{ CH.push(new Chart(el.getContext('2d'),cfg)); }
    catch(e){ console.warn('chart',p.id,e); }
  });
  PEND=[];
}
let rsT=null;
window.addEventListener('resize',()=>{clearTimeout(rsT);rsT=setTimeout(()=>CH.forEach(c=>{try{c.resize();}catch(e){}}),160);});

/* ---------- cấu hình chart nền ---------- */
function baseOpt(o){
  o=o||{};
  return Object.assign({
    responsive:true, maintainAspectRatio:false,
    animation: state.anim?{duration:520}:false,
    layout:{padding:{top:22,right:4,left:2,bottom:2}},
    interaction:{mode:'index',intersect:false},
    plugins:{
      legend:{position:'bottom',labels:{color:C.sub,boxWidth:11,boxHeight:11,padding:11,
        font:{size:11,weight:'600'},usePointStyle:true,pointStyle:'rectRounded',
        sort:(a,b)=>a.datasetIndex-b.datasetIndex}},
      tooltip:TT(),
      datalabels:{display:false}
    },
    scales:{
      x:{grid:{display:false},ticks:{color:C.mut,font:{size:10.5}}},
      y:{grace:'12%',grid:{color:C.grid,drawBorder:false},ticks:{color:C.mut,font:{size:10.5}},
         border:{display:false}}
    }
  },o);
}
/* tooltip nâng cao — G1 */
let TTX=null;
function TT(){
  return {
    backgroundColor:'#0C1420', borderColor:'rgba(255,255,255,.16)', borderWidth:1,
    titleColor:'#fff', bodyColor:'#D5DEEA', padding:11, cornerRadius:9,
    titleFont:{size:12,weight:'700'}, bodyFont:{size:11.6}, displayColors:true, boxPadding:4,
    callbacks:{
      label:c=>{
        const v=c.parsed.y!==undefined?c.parsed.y:c.parsed.x;
        return ' '+c.dataset.label+': '+(TTX&&TTX.f?TTX.f(v):nd(v,2));
      },
      afterBody:items=>{
        if(!TTX||!TTX.k||!items.length)return [];
        const k=TTX.k, i=items[0].dataIndex, m=i+1;
        const th=k.th[i],kh=k.kh[i],cy=k.cy[i],pv=i>0?k.th[i-1]:null;
        const r=(nul(th)||nul(kh)||!kh)?null:(k.pol===-1?kh/th:th/kh);
        const L=[];
        L.push('─────────────');
        L.push('Thực hiện : '+fmt(k,th));
        if(!nul(kh))L.push('Kế hoạch  : '+fmt(k,kh));
        if(!nul(cy))L.push('Cùng kỳ   : '+fmt(k,cy));
        if(!nul(r))L.push('% đạt KH  : '+pc(r)+'  '+SHAPE[semCls(r)]+' '+SEMTXT[semCls(r)]);
        if(!nul(cy))L.push('vs cùng kỳ: '+arw(dl(th,cy)));
        L.push('vs tháng trước: '+arw(dl(th,pv))+(k.pol===-1?'  (thấp hơn là tốt)':''));
        L.push('Lũy kế đến T'+m+': '+fmt(k,cum(k,m)));
        return L;
      }
    }
  };
}
/* nhãn số trên chart — F1 */
function DL(fmtfn,opt){
  return Object.assign({
    display:()=>state.labels, color:C.ink, anchor:'end', align:'end', offset:2,
    font:{size:10,weight:'700'},
    backgroundColor:C.lblBg, borderRadius:4, padding:{top:2,bottom:1,left:3,right:3},
    formatter:v=>nul(v)?'':(fmtfn?fmtfn(v):nd(v,1))
  },opt||{});
}

/* vẽ vạch mục tiêu trên biểu đồ cột ngang */
const TMARK={id:'tmark',afterDatasetsDraw(ch,a,o){
  if(!o||!o.values)return;
  const meta=ch.getDatasetMeta(0), x=ch.scales.x; if(!meta||!x)return;
  const g=ch.ctx; g.save(); g.strokeStyle=o.color||'#888'; g.lineWidth=2.2; g.setLineDash([4,3]);
  meta.data.forEach((bar,i)=>{
    const t=o.values[i]; if(t===null||t===undefined||!isFinite(t))return;
    const px=x.getPixelForValue(t), hh=(bar.height||16)/2+2;
    g.beginPath(); g.moveTo(px,bar.y-hh); g.lineTo(px,bar.y+hh); g.stroke();
  });
  g.restore();
}};
try{Chart.register(TMARK);}catch(e){}

/* ---------- KPI CARD ---------- */
function spark(a,m){
  const v=a.slice(0,m).map(x=>nul(x)?null:x), f=v.filter(x=>x!==null);
  if(f.length<2)return '';
  const mn=Math.min.apply(null,f), mx=Math.max.apply(null,f), r=(mx-mn)||1;
  const W=64,H=26, n=v.length;
  let d='',first=true;
  v.forEach((y,i)=>{ if(y===null)return;
    const px=(i/(n-1||1))*(W-2)+1, py=H-2-((y-mn)/r)*(H-6);
    d+=(first?'M':'L')+px.toFixed(1)+','+py.toFixed(1); first=false; });
  return `<svg class="spk" viewBox="0 0 ${W} ${H}"><path d="${d}" fill="none" stroke="var(--brand)" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"/></svg>`;
}
function kcard(k,opt){
  opt=opt||{};
  const m=state.m, th=k.th[m-1], r=rateKH(k,m), cls=nul(th)?'n':semCls(r);
  const lf=nul(th)?lastFilled(k.th,m):null;
  const src=`<button class="srcb" data-src="${k.i}" title="Truy vết ô nguồn">${ic('scan')}</button>`;
  const nm=opt.name||kname(k);
  const head=`<div class="kl"><b title="${esc(nm)}">${esc(nm)}</b>${src}</div>
    <div class="kv">${fmt(k,th)}<small>${esc(unitOf(k))}</small></div>
    <div class="kmo">Tháng ${m}</div>`;

  if(k.bad) return `<div class="kpi y" data-drill="${k.i}">${head}
    <div class="kc"><span class="chip nd">⚠ Đơn vị chưa đồng nhất</span></div></div>`;

  /* ô so sánh nằm NGANG: [So KH] [So CK] — tối ưu diện tích, bỏ khoảng trống dọc */
  const cell=(lab,val,c)=>`<span class="chip cc ${c||''}" title="${esc(lab)} ${esc(String(val).replace(/<[^>]+>/g,''))}"><i data-full="${esc(lab)}" data-short="${esc(lab.replace(/^So /,''))}">${lab}</i><em>${val}</em></span>`;
  let mrow='';
  if(nul(th)){
    mrow=`<div class="kc">`+
      `<span class="chip nd">⚠ Chưa nhập trong Excel</span>`+
      (lf?`<span class="chip">gần nhất T${lf.m}: ${fmt(k,lf.v)}</span>`:'')+`</div>`;
  }else{
    const d=dl(th,k.cy[m-1]), cs=[];
    if(!nul(r))cs.push(cell('So KH',SHAPE[cls]+' '+pc(r,0),cls));
    if(!nul(d))cs.push(cell('So CK',arw(d),trendCls(d,k.pol)));
    /* không có KH/cùng kỳ → so với tháng trước và bình quân các tháng trước */
    if(!cs.length){const pv=m>1?k.th[m-2]:null, bq=avgPrev(k.th,m);
      if(!nul(pv))cs.push(cell('So T'+(m-1),arw(dl(th,pv)),trendCls(dl(th,pv),k.pol)));
      if(!nul(bq))cs.push(cell('So BQ',arw(dl(th,bq)),trendCls(dl(th,bq),k.pol)));}
    if(cs.length)mrow=`<div class="kc krow n${cs.length}">${cs.join('')}</div>`;
  }

  /* --- khối LŨY KẾ đến tháng báo cáo --- */
  const lk=cum(k,m), lkh=cumKH(k,m), lcy=cumCY(k,m), rl=rateLK(k,m);
  const lcs=[];
  if(!nul(lkh)) lcs.push(cell('So KH',SHAPE[semCls(rl)]+' '+pc(rl,0),semCls(rl)));
  if(!nul(lcy)) lcs.push(cell('So CK',arw(dl(lk,lcy)),trendCls(dl(lk,lcy),k.pol)));
  let nam='';
  if(!nul(k.khn)){const rn=rateNam(k,m);
    if(!nul(rn))nam=`<span class="klkn ${semCls(rn/(m/12))}" title="Lũy kế so với kế hoạch cả năm ${fmt(k,k.khn)}">KH năm ${pc(rn,0)}</span>`;}
  const lkBox=(nul(lk)||k.ck==='last'||opt.nolk)?'':`<div class="klk">
      <div class="klkrow"><span class="klkl">${k.ck==='sum'?'Lũy kế':'BQ'} T1–T${m}:</span><b class="klkv">${fmt(k,lk)}${unitOf(k)?' <small>'+esc(unitOf(k))+'</small>':''}</b>${!nul(lkh)?`<span class="klkp">/ KH ${fmt(k,lkh)}</span>`:''}${nam}</div>
      ${lcs.length?`<div class="kc krow n${lcs.length}">${lcs.join('')}</div>`:''}
    </div>`;

  /* không có KH → màu vạch thẻ theo xu hướng so tháng trước (không giả lập "đạt/không đạt") */
  let cc=cls;
  if(cls==='n'&&!nul(th)){const pv=m>1?k.th[m-2]:null, d=dl(th,pv);
    cc=(nul(d)||Math.abs(d)<0.02)?'n':(trendCls(d,k.pol)==='g'?'tg':'tr');}
  return `<div class="kpi ${cc}" data-drill="${k.i}">${head}
    ${mrow}${lkBox}${spark(k.th,m)}</div>`;
}
function avgPrev(a,m){const v=a.slice(0,m-1).filter(x=>!nul(x));return v.length?v.reduce((x,y)=>x+y,0)/v.length:null;}
function kpiRow(list,opt){
  /* số cột mặc định cân đối theo số thẻ (6→6, 8→4, 10→5) — người dùng vẫn đổi được bằng ▦ */
  const n=list.length, c={4:4,5:5,6:6,7:4,8:4,9:5,10:5,12:6}[n];
  const st=c?` style="grid-template-columns:repeat(${c},minmax(0,1fr));--kf:${KF[c]||1}"`:'';
  return `<div class="kpis"${st}>${list.map(k=>kcard(k,opt)).join('')}</div>`;}

/* đơn vị hiển thị — bỏ '%' vì fmt() đã kèm dấu % */
function unitOf(k){if(k.dvt==='U')return UL(k.fu||state.u).ax;return (k.dvt==='%')?'':(k.dvt||'');}

/* ---------- BẢNG 12 THÁNG ---------- */
function tbl12(list,opt){
  const m=state.m;
  let h='<div class="tw"><table><thead><tr><th>Chỉ tiêu</th><th>ĐVT</th>';
  for(let i=0;i<m;i++)h+=`<th>${MLAB[i]}</th>`;
  h+='<th>Lũy kế / BQ</th><th>vs T'+(m-1)+'</th><th>Xu hướng</th></tr></thead><tbody>';
  let g0=null;
  list.forEach(k=>{
    if(opt&&opt.grp&&k.nhom!==g0){g0=k.nhom;h+=`<tr class="grp"><td colspan="${m+5}">${esc(k.nhom)}</td></tr>`;}
    const th=k.th[m-1], pv=m>1?k.th[m-2]:null, d=dl(th,pv), c=trendCls(d,k.pol);
    h+=`<tr><td>${esc(opt&&opt.grp?k.ct:kname(k))}${k.pol===-1?' <span class="mu" title="Thấp hơn là tốt">↓</span>':''}${k.bad?' <span class="tag y">⚠ đơn vị</span>':''}</td><td class="mu">${esc(k.dvt||'')}</td>`;
    for(let i=0;i<m;i++){
      const v=k.th[i];
      h+=`<td class="n ${nul(v)?'mu':''}" data-cell="${k.i}:${i}">${fmt(k,v)}</td>`;
    }
    h+=`<td><b>${fmt(k,cum(k,m))}</b></td><td class="${c}">${arw(d)}</td>
        <td class="spkc">${spark(k.th,m)}</td></tr>`;
  });
  return h+'</tbody></table></div>';
}
/* ---------- BẢNG ĐIỀU HÀNH ---------- */
function tblDH(list){
  const m=state.m;
  let h=`<div class="tw"><table><thead><tr><th>Chỉ tiêu</th><th>Bộ phận</th><th>ĐVT</th>
    <th>TH T${m}</th><th>KH T${m}</th><th>%KH</th><th>CK 2025</th><th>%vs CK</th>
    <th>Lũy kế</th><th>KH năm</th><th>%KH năm</th><th>Tình trạng</th></tr></thead><tbody>`;
  list.forEach(k=>{
    const th=k.th[m-1], r=rateKH(k,m), c=nul(th)?'n':semCls(r);
    const d=dl(th,k.cy[m-1]), rn=rateNam(k,m);
    h+=`<tr><td>${esc(k.ct)}</td><td class="mu">${esc(BPN[k.bp])}</td><td class="mu">${esc(k.dvt||'')}</td>
      <td class="n" data-cell="${k.i}:${m-1}"><b>${fmt(k,th)}</b></td>
      <td>${fmt(k,k.kh[m-1])}</td><td class="${c}"><b>${pc(r)}</b></td>
      <td class="mu">${fmt(k,k.cy[m-1])}</td><td class="${trendCls(d,k.pol)}">${arw(d)}</td>
      <td>${fmt(k,cum(k,m))}</td><td class="mu">${nul(k.khn)?'–':fmt(k,k.khn)}</td>
      <td>${pc(rn)}</td><td><span class="tag ${c}">${SHAPE[c]} ${SEMTXT[c]}</span></td></tr>`;
  });
  return h+'</tbody></table></div>';
}
/* ---------- BẢNG MA TRẬN (WIDE) ---------- */
function tblWide(w){
  const m=state.m, dec=w.title.indexOf('KAIZEN')>=0?2:2;
  let h='<div class="tw"><table><thead><tr><th>'+esc(w.tlab?'Hạng mục':'Hạng mục')+'</th>';
  if(w.rows.some(r=>!nul(r.target)))h+=`<th>${esc(w.tlab||'Mục tiêu')}</th>`;
  for(let i=0;i<m;i++)h+=`<th>${MLAB[i]}</th>`;
  h+='<th>vs mục tiêu</th></tr></thead><tbody>';
  const hasT=w.rows.some(r=>!nul(r.target));
  w.rows.forEach(r=>{
    const v=r.v[m-1], d=(!nul(v)&&!nul(r.target)&&r.target)?(v-r.target)/r.target:null;
    const bad=w.lowGood!==false;
    const cls=nul(d)?'n':(bad?(d<=0?'g':(d<=.05?'y':'r')):(d>=0?'g':(d>=-.05?'y':'r')));
    h+=`<tr><td>${esc(r.lab)}</td>`;
    if(hasT)h+=`<td class="mu">${nul(r.target)?'–':nd(r.target,2)}</td>`;
    for(let i=0;i<m;i++)h+=`<td class="${nul(r.v[i])?'mu':''}">${nul(r.v[i])?'–':nd(r.v[i],dec)}</td>`;
    h+=`<td class="${cls}">${nul(d)?'–':sg(d)}</td></tr>`;
  });
  if(w.agg){
    h+=`<tr class="sum"><td>${esc(w.agg.lab)}</td>`;
    if(hasT)h+=`<td>${nul(w.agg.target)?'–':nd(w.agg.target,2)}</td>`;
    for(let i=0;i<m;i++)h+=`<td>${nul(w.agg.v[i])?'–':nd(w.agg.v[i],dec)}</td>`;
    const v=w.agg.v[m-1],t=w.agg.target,d=(!nul(v)&&!nul(t)&&t)?(v-t)/t:null;
    h+=`<td>${nul(d)?'–':sg(d)}</td></tr>`;
  }
  return h+'</tbody></table></div>';
}
/* ---------- BẢNG CHI TIẾT (DETAIL) ---------- */
function tblDetail(d,m){
  const rows=d.bym?d.rows.filter(r=>r.m===m):d.rows;
  if(!rows.length){
    const has=Array.from(new Set(d.rows.map(r=>r.m).filter(x=>x))).sort((a,b)=>a-b);
    return `<div class="empty">Chưa nhập số cho tháng ${m}.${has.length?' Bảng này mới có dữ liệu tháng '+has.join(', ')+'.':''}</div>`;
  }
  const isn=v=>v!==null&&v!==undefined&&String(v).trim()!==''&&!isNaN(Number(String(v).replace(',','.')));
  let h='<div class="tw"><table><thead><tr>'+d.hdr.map(x=>`<th>${esc(x)}</th>`).join('')+'</tr></thead><tbody>';
  rows.forEach(r=>{h+='<tr>'+d.hdr.map((_,i)=>{
    const v=r.c[i];
    return isn(v)?`<td>${nd(Number(String(v).replace(',','.')),2)}</td>`
                 :`<td style="text-align:left;white-space:normal;min-width:150px">${esc(v===null||v===undefined?'–':v)}</td>`;
  }).join('')+'</tr>';});
  return h+'</tbody></table></div>';
}




