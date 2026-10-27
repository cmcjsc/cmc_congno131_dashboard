



/* ══════════════════════ MỤC & KHỐI NỘI DUNG ══════════════════════ */
const BLOCKS=[];
const B=o=>BLOCKS.push(o);

/* ---------- dataset dùng lại ---------- */
function dsTHKHCK(k,opt){
  opt=opt||{};
  const m=state.m, L=MLAB.slice(0,m), out=[];
  out.push({type:'bar',label:'Thực hiện '+DATA.meta.y,data:cutM(k.th),backgroundColor:C.brand,
    borderRadius:5,maxBarThickness:34,order:3,
    datalabels:DL(v=>fmt(k,v))});
  if(state.prev&&k.cy.some(x=>!nul(x)))
    out.push({type:'bar',label:'Cùng kỳ '+(DATA.meta.y-1),data:cutM(k.cy),backgroundColor:C.ck,
      borderRadius:5,maxBarThickness:34,order:4,
      datalabels:DL(v=>fmt(k,v),{color:C.mut,font:{size:9,weight:'700'}})});
  if(k.kh.some(x=>!nul(x)))
    out.push({type:'line',label:'Kế hoạch',data:cutM(k.kh),borderColor:C.plan,borderWidth:2,
      borderDash:[6,4],pointRadius:0,pointHoverRadius:4,fill:false,tension:.25,order:1,
      datalabels:{display:false}});
  return {labels:L,datasets:out};
}
function chartKPI(id,k,h,opt){
  TTX={k:k,f:v=>fmt(k,v)};
  const d=dsTHKHCK(k,opt), tt=TT();
  return cbox(id,h||'h280',{type:'bar',data:d,options:baseOpt({
    plugins:{legend:baseOpt().plugins.legend,tooltip:tt,datalabels:{display:false}},
    scales:{x:{grid:{display:false},ticks:{color:C.mut,font:{size:10.5}}},
      y:{grace:'14%',grid:{color:C.grid},border:{display:false},
         ticks:{color:C.mut,font:{size:10.5},
           callback:v=>k.dvt==='%'?(v/pscale(k)*100).toFixed(0)+'%':nd(v,2)}}}
  })});
}
function lineMulti(id,series,h,fmtfn,opt){
  opt=opt||{};
  const cols=KCOL();
  return cbox(id,h||'h260',{type:'line',data:{labels:MLAB.slice(0,state.m),
    datasets:series.map((s,i)=>Object.assign({
      label:s.n,data:cutM(s.v),borderColor:s.c||cols[i%cols.length],
      backgroundColor:s.c||cols[i%cols.length],borderWidth:s.dash?2:2.4,
      borderDash:s.dash?[6,4]:undefined,pointRadius:s.dash?0:3,pointHoverRadius:5,
      tension:.3,fill:false,spanGaps:true,
      datalabels:s.dash?{display:false}:DL(fmtfn)},s.ex||{}))},
    options:baseOpt(Object.assign({plugins:{legend:baseOpt().plugins.legend,
      tooltip:Object.assign(TT(),{callbacks:{label:c=>' '+c.dataset.label+': '+(fmtfn?fmtfn(c.parsed.y):nd(c.parsed.y,2))}}),
      datalabels:{display:false}}},opt))});
}
function barH(id,rows,h,fmtfn,opt){
  opt=opt||{};
  const hasT=!!opt.target&&rows.some(r=>!nul(r.t));
  return cbox(id,h||'h320',{type:'bar',data:{labels:rows.map(r=>r.n),
    datasets:[{label:opt.lab||'Thực hiện',data:rows.map(r=>r.v),
      backgroundColor:rows.map(r=>r.c||C.brand),borderRadius:5,maxBarThickness:22,
      datalabels:DL(fmtfn,{anchor:'end',align:'right',offset:4})}]},
    options:baseOpt({indexAxis:'y',
      layout:{padding:{right:52,top:6,left:2,bottom:2}},
      plugins:{legend:{display:false},
        tmark:hasT?{values:rows.map(r=>nul(r.t)?null:r.t),color:C.plan}:{values:null},
        tooltip:Object.assign(TT(),{callbacks:{
          label:c=>' '+c.dataset.label+': '+(fmtfn?fmtfn(c.parsed.x):nd(c.parsed.x,2)),
          afterBody:it=>{if(!hasT||!it.length)return [];
            const r=rows[it[0].dataIndex]; if(nul(r.t))return [];
            const d=r.t?(r.v-r.t)/r.t:null;
            return ['─────────────',(opt.tlab||'Mục tiêu')+': '+(fmtfn?fmtfn(r.t):nd(r.t,2)),
                    'Chênh lệch: '+(nul(d)?'–':sg(d))];}}}),
        datalabels:{display:false}},
      scales:{x:{grace:'12%',grid:{color:C.grid},border:{display:false},ticks:{color:C.mut,font:{size:10}}},
              y:{grid:{display:false},ticks:{color:C.sub,font:{size:10.8},autoSkip:false,
                 callback:function(v){const t=this.getLabelForValue(v);
                   return t.length>44?t.slice(0,42)+'…':t;}}}}})});
}
/* ---------- nhận xét tự động ---------- */
function cmtKPI(k){
  const m=state.m, th=k.th[m-1];
  if(nul(th)){const lf=lastFilled(k.th,m);
    return `Chưa có số thực hiện T${m}${lf?` — số gần nhất là T${lf.m}: ${fmt(k,lf.v)} ${unitOf(k)}`:''}.`;}
  const r=rateKH(k,m), d=dl(th,k.cy[m-1]), p=dl(th,m>1?k.th[m-2]:null);
  const f=k.th.slice(0,m).filter(x=>!nul(x));
  const mx=Math.max.apply(null,f), mn=Math.min.apply(null,f);
  let s=`${esc(kname(k))} T${m} đạt <b>${fmt(k,th)}${unitOf(k)?' '+unitOf(k):''}</b>`;
  if(!nul(r))s+=` — ${pc(r)} kế hoạch tháng (${SEMTXT[semCls(r)].toLowerCase()})`;
  if(!nul(p))s+=`; ${p>0?'tăng':'giảm'} ${Math.abs(p*100).toFixed(1).replace('.',',')}% so T${m-1}`;
  if(!nul(d))s+=`; ${d>0?'tăng':'giảm'} ${Math.abs(d*100).toFixed(1).replace('.',',')}% so cùng kỳ`;
  const bq=avgPrev(k.th,m);
  if(!nul(bq)&&nul(r))s+=`; ${th>=bq?'cao':'thấp'} hơn bình quân ${m-1} tháng trước ${Math.abs(dl(th,bq)*100).toFixed(1).replace('.',',')}% (BQ ${fmt(k,bq)})`;
  if(th===mx&&f.length>2)s+=`. Đây là mức <b>cao nhất</b> ${f.length} tháng${k.pol===-1?' (chỉ tiêu nghịch — cần lưu ý)':''}`;
  else if(th===mn&&f.length>2)s+=`. Đây là mức <b>thấp nhất</b> ${f.length} tháng${k.pol===-1?' (chỉ tiêu nghịch — tích cực)':''}`;
  return s+'.';
}
/* Insight sửa được: mỗi gạch đầu dòng là 1 ô sửa tại chỗ, có nút xoá; lưu vào TXT
   theo khoá ins.<sec>.<index> nên vẫn giữ khi đổi tháng / nạp Excel mới. */
function insKey(sec){return 'ins.'+sec;}
function insLines(sec,def){
  const saved=TXT[insKey(sec)];
  if(saved!==undefined) return (Array.isArray(saved)?saved:String(saved).split('\u0001')).filter(x=>x!=='');
  return def;
}
/* Nhận xét tự động về LŨY KẾ đến tháng báo cáo */
function cmtLK(k){
  const m=state.m, lk=cum(k,m);
  if(nul(lk))return null;
  const lkh=cumKH(k,m), lcy=cumCY(k,m), rl=rateLK(k,m), u=unitOf(k);
  if(k.ck==='last')return null;
  let s=`${k.ck==='sum'?'Lũy kế':(k.ck==='ratio'?'Tỷ lệ lũy kế':'Bình quân')} T1–T${m}: <b>${fmt(k,lk)}${u?' '+u:''}</b>`;
  if(!nul(lkh))s+=` / kế hoạch lũy kế ${fmt(k,lkh)} — đạt ${pc(rl)} (${SEMTXT[semCls(rl)].toLowerCase()})`;
  if(!nul(lcy)){const d=dl(lk,lcy);
    s+=`; ${nul(d)?'–':(d>0?'tăng':'giảm')+' '+Math.abs(d*100).toFixed(1).replace('.',',')+'%'} so lũy kế cùng kỳ ${DATA.meta.y-1} (${fmt(k,lcy)})`;}
  if(!nul(k.khn)){
    const rn=rateNam(k,m), con=(k.pol===-1?null:k.khn-lk);
    s+=`. Kế hoạch năm ${fmt(k,k.khn)} — đạt ${pc(rn)}`;
    if(!nul(con)&&con>0&&m<12)s+=`, còn <b>${fmt(k,con)}${u?' '+u:''}</b> trong ${12-m} tháng (bình quân ${fmt(k,con/(12-m))}/tháng)`;
  }
  return s+'.';
}
function insBox(sec,title,def){
  const L=insLines(sec,def);
  return `<div class="ins" data-ins="${sec}">
    <h4>${ic('bulb')} <span data-tk="inst.${sec}">${esc(T('inst.'+sec,title))}</span></h4>
    <ul>${L.map((x,i)=>`<li data-il="${i}"><span class="iltx">${x}</span>
      <button class="ildel" data-ildel="${i}" title="Xoá dòng này">✕</button></li>`).join('')}</ul>
    <button class="iladd" data-iladd="1">+ Thêm dòng</button>
    <div class="inshint">Mở khoá 🔒 rồi bật ✎ để sửa, xoá hoặc thêm dòng insight.</div>
  </div>`;
}
function panel(id,title,sub,body,hint,span,cls){
  const nm=title||BLKNAME[id]||id;
  const hasK=body.indexOf('class="kpis"')>=0;
  const hasT=body.indexOf('<table')>=0;
  const L=LAY[id]||{};
  return `<section class="panel ${cls||''} s${span||6}" data-blk="${id}" data-name="${esc(nm)}">
    ${hint?`<span class="hlp" tabindex="0" data-hint="${esc(hint)}">?</span>`:''}
    <div class="lay">
      <button data-ly="l"  title="Hẹp lại">◄</button><button data-ly="r" title="Rộng ra">►</button>
      <button data-ly="hm" title="Thấp xuống">⌄</button><button data-ly="hp" title="Cao lên">⌃</button>
      <button data-ly="u"  title="Lên">▲</button><button data-ly="d" title="Xuống">▼</button>
      ${hasK?`<button data-ly="pr" class="${L.pr?'on':''}" title="Số thẻ trên 1 hàng — đang: ${L.pr?L.pr+' thẻ':'tự động'} (bấm để đổi)">▦<sup>${L.pr||'A'}</sup></button>`:''}
      <button data-ly="na" class="${L.na?'':'on'}" title="Ẩn/hiện dòng phân tích tự động">${ic('spark')}</button>
      <button data-ly="rs" title="Khôi phục khối này về mặc định">↺</button>
      <button data-ly="h"  title="Ẩn khối">✕</button></div>
    ${title?`<h3 data-tk="t.${id}">${esc(T('t.'+id,title))}</h3>`:''}
    ${sub?`<div class="psub" data-tk="s.${id}">${T('s.'+id,sub)}</div>`:''}
    ${body.indexOf('<canvas')>=0?ctBar(id):''}
    ${hasT?tbBar(id):''}
    ${body}</section>`;
}
/* ── Thanh chỉnh BẢNG (chỉ hiện khi bật chế độ chỉnh sửa) ── */
function tbBar(id){
  const c=(LAY[id]&&LAY[id].tb)||{};
  const g=(key,list,cur)=>list.map(x=>
    `<button class="ctb ${(cur||'')===x[0]?'on':''}" data-tb="${id}:${key}:${x[0]}" title="${esc(x[2]||x[1])}">${x[1]}</button>`).join('');
  return `<div class="ctbar tbbar">
    <span class="ctlb">Tiêu đề</span>${g('ha',[['l','⬅','Căn trái'],['c','↔','Căn giữa'],['r','➡','Căn phải']],c.ha)}
    <span class="ctlb">Số liệu</span>${g('ba',[['l','⬅','Căn trái'],['c','↔','Căn giữa'],['r','➡','Căn phải']],c.ba)}
    <span class="ctlb">Bề ngang</span>${g('fit',[['','Mặc định','Giữ như mặc định'],['content','Khớp nội dung','Cột rộng vừa đủ nội dung, bảng có thể cuộn ngang'],['frame','Khớp khung','Ép bảng vừa khung, chữ tự xuống dòng']],c.fit||'')}
    <button class="ctb" data-tb="${id}:cwrs:1" title="Xoá độ rộng cột đã kéo, trả về tự động">↺ Cột</button>
    <span class="ctlb dim">Kéo mép phải ô tiêu đề để chỉnh độ rộng cột</span>
  </div>`;
}

/* ── Nhận xét dưới biểu đồ — 2 tầng bắt buộc (CFO chốt 06/09/2026):
   ① 📌 nhận xét hệ thống tự tính  ② 📝 nhận xét bộ phận nhập trong Excel ── */
function note(auto,k,lkTxt){
  const list=Array.isArray(k)?k:(k?[k]:[]);
  const lk=(lkTxt!==undefined)?lkTxt:(list.length?cmtLK(list[0]):null);
  let h=`<div class="cnote">`
    +`<div class="psub nauto"><i class="ni">${ic('spark')}</i><span class="ntx">${auto}</span></div>`
    +(lk?`<div class="psub nauto nlk"><i class="ni">${ic('trend')}</i><span class="ntx">${lk}</span></div>`:'');
  list.forEach(x=>{
    if(!x)return;
    /* Form Marketing chỉ có 1 cột "Ghi chú" / chỉ tiêu (không theo tháng) → hiện nếu có */
    const t=(x.nx&&x.nx[state.m-1])||x.note||null;
    if(!t)return;
    const src=x.src&&x.src.th?x.src.th[0]+'!'+colL((x.src.c0||0)+14)+x.src.th[1]:null;
    h+=`<div class="psub nexcel"${src?` data-nsrc="Ô nguồn: ${esc(src)}"`:''} data-nraw="${esc(t)}"><i class="ni">${ic('note')}</i><b>${esc(kname(x))}</b> — <span class="ntx">${esc(t)}</span></div>`;
  });
  return h+'</div>';
}

/* ── Bộ đổi dạng biểu đồ (chỉ hiện khi mở chế độ chỉnh sửa) ── */
const CT_LABEL={def:'Mặc định',bar:'Cột',hbar:'Cột ngang',line:'Đường',area:'Vùng',pie:'Tròn'};
function ctOf(id){return (LAY[id]&&LAY[id].ct)||'def';}
/* Áp kiểu người dùng chọn lên cấu hình Chart.js đã dựng sẵn */
function applyCT(cfg,ct){
  if(!ct||ct==='def'||!cfg||!cfg.data)return cfg;
  const ds=cfg.data.datasets||[];
  if(ct==='pie'){
    const d0=ds.find(x=>x.type!=='line')||ds[0]; if(!d0)return cfg;
    const cols=KCOL();
    return {type:'doughnut',
      data:{labels:cfg.data.labels,datasets:[{data:d0.data,
        backgroundColor:cfg.data.labels.map((_,i)=>cols[i%cols.length]),
        borderWidth:2,borderColor:C.card,
        datalabels:DL(null,{anchor:'center',align:'center',color:'#fff',backgroundColor:'rgba(0,0,0,.28)'})}]},
      options:{responsive:true,maintainAspectRatio:false,cutout:'56%',
        animation:state.anim?{duration:520}:false,
        plugins:{legend:{position:'bottom',labels:{color:C.sub,font:{size:11},usePointStyle:true,boxWidth:10,padding:9}},
          tooltip:TT(),datalabels:{display:false}}}};
  }
  cfg=JSON.parse(JSON.stringify({t:1})) && cfg;   // giữ nguyên tham chiếu, chỉ sửa tại chỗ
  cfg.options=cfg.options||{};
  if(ct==='hbar'){
    cfg.options.indexAxis='y';
    ds.forEach(d=>{if(d.type==='line'){d.type='bar';}d.type='bar';d.maxBarThickness=18;});
    cfg.type='bar';
    if(cfg.options.scales&&cfg.options.scales.y1)delete cfg.options.scales.y1;
    ds.forEach(d=>{delete d.yAxisID;});
  }else{
    cfg.options.indexAxis='x';
    ds.forEach(d=>{
      if(ct==='bar'){d.type='bar';d.fill=false;}
      else if(ct==='line'||ct==='area'){
        d.type='line'; d.fill=(ct==='area'?'origin':false); d.tension=.3;
        d.pointRadius=d.borderDash?0:3; d.borderWidth=d.borderWidth||2.4;
        if(!d.borderColor)d.borderColor=d.backgroundColor;
        if(ct==='area')d.backgroundColor=mix(String(d.borderColor||C.brand),C.card,.72);
      }
    });
    cfg.type=(ct==='bar')?'bar':'line';
  }
  return cfg;
}
function ctBar(id){
  const cur=ctOf(id);
  return `<div class="ctbar">`+Object.keys(CT_LABEL).map(k=>
    `<button class="ctb ${k===cur?'on':''}" data-ct="${id}:${k}">${CT_LABEL[k]}</button>`).join('')+`</div>`;
}




