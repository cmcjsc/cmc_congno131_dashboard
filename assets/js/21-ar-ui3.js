/* ══════════════════════════════════════════════════════════════
   CMC · CÔNG NỢ TK 131 — cảnh báo, kỳ phân tích, điều hướng, nạp Excel, khởi tạo
   ══════════════════════════════════════════════════════════════ */

/* ═════════════ CẢNH BÁO TỰ ĐỘNG ═════════════ */
function vDSO(D){const mask=MASK(),f=AR.ymStart(AR.ymAdd(AR.ymOf(D),-2)),F=FW(f,D),S=SNAP(D),o={},b={};
  for(let i=0;i<X.nC;i++){if(!mask[i])continue;const v=X.vung[i];o[v]=(o[v]||0)+(S.net[i]>0?S.net[i]:0);b[v]=(b[v]||0)+F[i*X.NL]+F[i*X.NL+1]+F[i*X.NL+2]+F[i*X.NL+3];}
  const r={};Object.keys(o).forEach(v=>r[v]=b[v]>0?o[v]/b[v]*(D-f+1):null);return r;}
function ALERTS(){
  Z(); if(ALERTS._k===Z._k&&ALERTS._a)return ALERTS._a;
  const z=Z(), out=[], A_=o=>out.push(o), g=z.gA, gB=z.gB, S=z.SA, mask=MASK(), D=z.A.t;
  const ovr=g.open?g.ov/g.open:0, ovrB=gB.open?gB.ov/gB.open:0;
  if(ovr>0.1)A_({lv:ovr>0.2?'r':'y',sec:'qh',grp:'Chất lượng nợ',t:`Quá hạn sau bảo lãnh ${pc(ovr)} dư nợ (${fTy(g.ov)} tỷ)`,d:`Kỳ so sánh ${pc(ovrB)} · quá hạn > 90 ngày ${fTy(g.ov90)} tỷ · ${g.nOv} khách hàng.`,own:'TCKT · KD các kênh',act:'Giao chỉ tiêu thu nợ quá hạn theo vùng trong họp công nợ tuần; chặn bán chịu khách quá hạn > 90 ngày.',go:"go('qh')"});
  const dA=DSOat(D),dB=DSOat(z.B.t);
  if(!nul(dA)&&!nul(dB)&&dA-dB>3)A_({lv:dA-dB>7?'r':'y',sec:'xh',grp:'Vòng quay công nợ',t:`DSO tăng ${sgD(dA-dB)} ngày (${fDay(dB)} → ${fDay(dA)})`,d:`Dư nợ ${arw(dPct(g.dr,gB.dr))}, doanh số ghi nợ ${arw(dPct(BILL(z.FA),BILL(z.FB)))} so kỳ so sánh.`,own:'TCKT',act:'Xác định vùng / khách làm DSO tăng ở mục Kênh & vùng; kiểm tra đẩy hàng cuối kỳ.',go:"go('kv')"});
  /* vùng */
  const VA=vDSO(D),VB=vDSO(z.B.t);
  GRP('vung',D,z.A).forEach(o=>{const r=o.open?o.ov/o.open:0;const k=kenhOfV(o.g),own=(OWN[k]||'Kế toán công nợ')+(k==='2. Phân phối'?' · '+o.g:'');
    if(r>0.15&&o.ov>=5e8)A_({lv:r>0.25&&o.ov>=1e9?'r':'y',sec:'kv',grp:'Vùng',t:`${esc(o.g)}: quá hạn ${pc(r)} (${fTy(o.ov)} tỷ)`,d:`Dư nợ ${fTy(o.dr)} tỷ · quá hạn > 90 ngày ${fTy(o.ov90)} tỷ · ${o.nOv} khách quá hạn · DSO ${fDay(VA[o.g])} ngày.`,own,act:'Lập kế hoạch thu theo từng khách quá hạn, báo cáo tiến độ tuần.',go:`state.fv='${esc(o.g)}';state.fk='';MASK._k=null;go('qh')`});
    if(!nul(VA[o.g])&&!nul(VB[o.g])&&VA[o.g]-VB[o.g]>10&&o.dr>=2e9)A_({lv:'y',sec:'kv',grp:'Vùng',t:`${esc(o.g)}: DSO ${fDay(VB[o.g])} → ${fDay(VA[o.g])} ngày`,d:`Dư nợ ${fTy(o.dr)} tỷ; thu kỳ ${fTy(COLL(o.f))} tỷ / doanh số ${fTy(BILL(o.f))} tỷ.`,own,act:'Rà soát chính sách bán chịu & chiết khấu thanh toán của vùng.',go:"go('kv')"});});
  /* khách hàng */
  const K=GRP('cust',D,z.A);
  const q90=K.filter(o=>o.ov90>=5e8).sort((a,b)=>b.ov90-a.ov90);
  q90.slice(0,8).forEach(o=>{const i=o.g;A_({lv:'r',sec:'qh',grp:'Khách hàng quá hạn',t:`${esc(cShort(i))}: quá hạn > 90 ngày ${fTy(o.ov90)} tỷ`,d:`${esc(X.vung[i])} · dư nợ ${fTy(o.dr)} tỷ · quá hạn ${fTy(o.ov)} tỷ · lâu nhất ${fDay(o.maxQ)} ngày · lần thu cuối ${(()=>{const lp=lastPayAt(i,D);return lp?dStr(lp):'—';})()}.`,own:ownOf(i),act:o.maxQ>365?'Gửi thư đòi nợ, chuyển pháp chế; đánh giá dự phòng.':'Đối chiếu xác nhận công nợ, cam kết lịch trả; chặn xuất hàng đến khi thu.',go:`custOpen(${i})`});});
  if(q90.length>8)A_({lv:'y',sec:'qh',grp:'Khách hàng quá hạn',t:`Thêm ${q90.length-8} khách quá hạn > 90 ngày từ 500 triệu`,d:`Tổng ${fTy(q90.slice(8).reduce((s,o)=>s+o.ov90,0))} tỷ.`,own:'Kế toán công nợ',act:'Xem danh sách đầy đủ ở mục Quá hạn.',go:"go('qh')"});
  const old=K.filter(o=>o.b[6]+o.b[7]+o.b[8]>=1e9).sort((a,b)=>(b.b[6]+b.b[7]+b.b[8])-(a.b[6]+a.b[7]+a.b[8]));
  old.slice(0,5).forEach(o=>{const i=o.g;A_({lv:'r',sec:'tn',grp:'Nợ lâu năm',t:`${esc(cShort(i))}: ${fTy(o.b[6]+o.b[7]+o.b[8])} tỷ nợ ≥ 1 năm tuổi`,d:`Tuổi lớn nhất ${fDay(S.maxAge[i])} ngày · dự phòng theo tuổi ${fTy(o.dp)} tỷ${X.layer[i]?' · Ngoài HĐKD: '+esc(X.lyWhy[i]):''}.`,own:X.layer[i]?'Ban TGĐ · TCKT':ownOf(i),act:'Đánh giá khả năng thu hồi, tài sản bảo đảm; trích lập dự phòng; xử lý pháp lý nếu không có kế hoạch trả.',go:`custOpen(${i})`});});
  const stop=K.filter(o=>o.dr>=1e9&&(()=>{const lp=lastPayAt(o.g,D);return !lp||D-lp>=60;})()).sort((a,b)=>b.dr-a.dr);
  stop.slice(0,6).forEach(o=>{const i=o.g,lp=lastPayAt(i,D);A_({lv:'r',sec:'tt',grp:'Ngừng thanh toán',t:`${esc(cShort(i))}: dư nợ ${fTy(o.dr)} tỷ, ${lp?fDay(D-lp)+' ngày':'chưa'} không có tiền về`,d:`${esc(X.vung[i])} · quá hạn ${fTy(o.ov)} tỷ · lần thu cuối ${lp?dStr(lp):'—'}.`,own:X.layer[i]?'Ban TGĐ · TCKT':ownOf(i),act:'Liên hệ trực tiếp chủ doanh nghiệp, xác nhận công nợ bằng văn bản, lập lịch trả.',go:`custOpen(${i})`});});
  /* hạn mức */
  const p2=[],p1=[];for(let i=0;i<X.nC;i++){if(!mask[i]||!X.hasHM[i])continue;const d=S.net[i];if(X.HM2[i]&&d>X.HM2[i]+0.5)p2.push(i);else if(d>X.HM[i]+0.5)p1.push(i);}
  p2.sort((a,b)=>(S.net[b]-X.HM2[b])-(S.net[a]-X.HM2[a])).slice(0,6).forEach(i=>A_({lv:'r',sec:'hm',grp:'Hạn mức công nợ',t:`${esc(cShort(i))}: dư nợ ${fTy(S.net[i])} tỷ vượt mức phê duyệt 2 (${fTy(X.HM2[i])} tỷ)`,d:`Hạn mức ${fTy(X.HM[i])} tỷ · sử dụng ${pc(X.HM[i]?S.net[i]/X.HM[i]:null,0)} · quá hạn ${fTy(OVA(S,i))} tỷ.`,own:ownOf(i),act:'Chặn xuất hàng bán chịu đến khi dư nợ về dưới hạn mức; nếu cần tăng hạn mức phải có bảo lãnh / phê duyệt TGĐ.',go:`custOpen(${i})`}));
  if(p1.length)A_({lv:'y',sec:'hm',grp:'Hạn mức công nợ',t:`${p1.length} khách vượt hạn mức (chưa tới mức PD2)`,d:p1.slice(0,6).map(i=>esc(cShort(i))+' '+pc(S.net[i]/(X.HM[i]||1),0)).join(' · '),own:'KD Kênh phân phối',act:'Nhắc thanh toán trước khi giao đơn mới; theo dõi hằng ngày.',go:"go('hm')"});
  /* bảo lãnh */
  X.BL.forEach(b=>{if(b.ci<0||!mask[b.ci]||S.net[b.ci]<=0.5)return;const left=b.t-D;
    if(left>=0&&left<=30)A_({lv:'y',sec:'hm',grp:'Bảo lãnh',t:`${esc(cShort(b.ci))}: bảo lãnh ${fTy(b.a)} tỷ hết hạn ${dStr(b.t)} (còn ${left} ngày)`,d:`Dư nợ ${fTy(S.net[b.ci])} tỷ · ${esc(b.bank)}.`,own:'Kế toán công nợ · '+ownOf(b.ci).split(' · ')[0],act:'Yêu cầu khách gia hạn / phát hành bảo lãnh mới trước ngày hết hạn; nếu không, giảm hạn mức tương ứng.',go:`custOpen(${b.ci})`});
    else if(left<0&&left>=-30&&!X.BL.some(c=>c.ci===b.ci&&c.f<=D&&c.t>=D))A_({lv:'y',sec:'hm',grp:'Bảo lãnh',t:`${esc(cShort(b.ci))}: bảo lãnh vừa hết hạn ${dStr(b.t)}, chưa có thư mới`,d:`Dư nợ ${fTy(S.net[b.ci])} tỷ đang không có bảo đảm.`,own:'Kế toán công nợ · '+ownOf(b.ci).split(' · ')[0],act:'Bổ sung bảo lãnh mới hoặc thu hồi nợ.',go:`custOpen(${b.ci})`});});
  /* thu tiền */
  const cA=COLL(z.FA),cB=COLL(z.FB),dc=dPct(cA,cB);
  if(!nul(dc)&&dc<-0.15)A_({lv:dc<-0.3?'r':'y',sec:'tt',grp:'Thu tiền',t:`Tiền thu ${arw(dc)} so ${labB()} (${fTy(cB)} → ${fTy(cA)} tỷ)`,d:`Doanh số ghi nợ ${arw(dPct(BILL(z.FA),BILL(z.FB)))}; thu / doanh số ${pc(BILL(z.FA)?cA/BILL(z.FA):null)}.`,own:'TCKT · KD các kênh',act:'Rà soát kế hoạch thu tuần theo vùng; ưu tiên khách quá hạn và khách ngừng thanh toán.',go:"go('tt')"});
  /* NT00 */
  if(g.open&&g.cnt/g.open>0.1)A_({lv:'r',sec:'qh',grp:'Kiểm soát',t:`${fTy(g.cnt)} tỷ (${pc(g.cnt/g.open)}) dư nợ chưa có nguyên tắc hạn nợ`,d:`Không xác định được quá hạn cho kênh Thương mại / Không thường xuyên / Nợ cũ${state.a0?`; tạm tính hạn 30 ngày: ${fTy(g.cntOv)} tỷ đã quá hạn`:''}.`,own:'Ban TGĐ · TCKT',act:'Ban hành nguyên tắc hạn nợ cho các kênh này (bổ sung bảng III / IV ở IN_Thời hạn công nợ).',go:"go('qh')"});
  /* dự phòng */
  if(g.dp-gB.dp>5e8&&dPct(g.dp,gB.dp)>0.1)A_({lv:'y',sec:'tn',grp:'Dự phòng',t:`Dự phòng theo tuổi nợ tăng ${fTy(g.dp-gB.dp)} tỷ (${arw(dPct(g.dp,gB.dp))})`,d:`${fTy(gB.dp)} → ${fTy(g.dp)} tỷ — nợ chuyển sang nhóm ≥ 180 ngày.`,own:'TCKT',act:'Đưa vào dự kiến chi phí dự phòng kỳ; ưu tiên thu các khoản sắp sang nhóm tuổi cao hơn.',go:"go('tn')"});
  /* trượt nhóm */
  const rr=ROLL(Math.max(0,curM()-1));if(rr&&rr.fr[2]>1e9&&rr.st[2]/rr.fr[2]>0.7)A_({lv:'y',sec:'tn',grp:'Trượt nhóm nợ',t:`${pc(rr.st[2]/rr.fr[2],0)} nợ 61–90 ngày không thu được sau 1 tháng`,d:`${fTy(rr.st[2])} / ${fTy(rr.fr[2])} tỷ trượt sang nhóm > 90 ngày.`,own:'Kế toán công nợ',act:'Tác động mạnh vào nhóm 31–90 ngày trước khi thành nợ khó đòi.',go:"go('tn')"});
  /* tập trung */
  const P=K.slice().sort((a,b)=>b.dr-a.dr),t10=P.slice(0,10).reduce((s,o)=>s+o.dr,0);
  if(g.dr&&t10/g.dr>0.6)A_({lv:'y',sec:'kh',grp:'Tập trung',t:`10 khách lớn nhất chiếm ${pc(t10/g.dr)} dư nợ`,d:P.slice(0,3).map(o=>esc(cShort(o.g))+' '+fTy(o.dr)+' tỷ').join(' · '),own:'TCKT',act:'Rà soát hạn mức, bảo lãnh và tình hình tài chính của nhóm khách lớn.',go:"go('kh')"});
  /* dư Có */
  const cr=K.filter(o=>o.cr>=1e9);if(cr.length)A_({lv:'y',sec:'ng',grp:'Dư Có khách hàng',t:`${cr.length} khách dư Có ≥ 1 tỷ (tổng ${fTy(cr.reduce((s,o)=>s+o.cr,0))} tỷ)`,d:cr.slice(0,4).map(o=>esc(cShort(o.g))+' '+fTy(o.cr)).join(' · '),own:'Kế toán công nợ',act:'Đối chiếu: tiền đặt cọc, tiền về chưa xuất hóa đơn hay hạch toán nhầm đối tượng; cấn trừ nếu đúng.',go:"go('ng')"});
  /* chiết khấu */
  const ckA=z.FA[0]?-z.FA[5]/z.FA[0]:null,ckB=z.FB[0]?-z.FB[5]/z.FB[0]:null;
  if(!nul(ckA)&&!nul(ckB)&&ckA-ckB>0.005)A_({lv:'y',sec:'ck',grp:'Chiết khấu',t:`Chiết khấu / doanh thu ${pc(ckB,2)} → ${pc(ckA,2)}`,d:`Chiết khấu kỳ ${fTy(-z.FA[5])} tỷ.`,own:'KD · TCKT',act:'Đối chiếu chính sách chiết khấu kỳ; tách chiết khấu quý/năm (ngoài kế hoạch).',go:"go('ck')"});
  /* kiểm soát */
  checks().filter(c=>!c.ok).forEach(c=>A_({lv:c.lv,sec:'ks',grp:'Kiểm soát số liệu',t:esc(c.t),d:esc(c.v),own:'Kế toán công nợ',act:esc(c.fix||''),go:"go('ks')"}));
  ALERTS._a=out; ALERTS._k=Z._k; return out;
}

/* ═════════════ ĐIỀU HƯỚNG ═════════════ */
function buildNav(){
  let h='', g=''; const al=ALERTS();
  SECS.forEach(x=>{
    if(x.g!==g){g=x.g;h+=`<div class="navsec">${esc(g)}</div>`;}
    const a=al.filter(q=>q.sec===x.k), r=a.filter(q=>q.lv==='r').length;
    const cnt=x.k==='cb'?(al.length?`<span class="cnt ${al.some(q=>q.lv==='r')?'':'y'}">${al.length}</span>`:''):(r?`<span class="cnt" title="${r} cảnh báo đỏ">${r}</span>`:(a.length?`<span class="cnt y" title="${a.length} cảnh báo vàng">${a.length}</span>`:''));
    h+=`<div class="nitem ${state.sec===x.k?'on':''}" data-sec="${x.k}"><span class="ico">${x.ico}</span><span class="nt" title="${esc(secT(x.k))}">${esc(TXT['sec.'+x.k]!==undefined?secT(x.k):x.n)}</span>${cnt}</div>`;
  });
  $('nav').innerHTML=h; navInd();
  $$('#nav .nitem').forEach(el=>el.onclick=()=>{document.body.classList.remove('sbshow');go(el.dataset.sec);});
  let ft='Dữ liệu <b>'+mLab(0)+' – '+mLab(X.nM-1)+'</b> · chốt <b>'+dStr(X.dmax)+'</b><br>'+n0(X.P.meta.rows)+' dòng công nợ · '+n0(X.P.cid.length)+' đối tượng';
  if(window.__SAVEDAT__){const d=new Date(window.__SAVEDAT__);ft+='<br><span style="color:var(--brand)">💾 Bản lưu '+d.toLocaleDateString('vi-VN')+' '+d.toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'})+'</span>';}
  $('fUpd').innerHTML=ft; $('fSrc').textContent=X.P.meta.file||'';
}
function syncNav(){
  buildNav();
  const s0=SECS.find(x=>x.k===state.sec)||SECS[0];
  $('crumbs').innerHTML=`<span class="lk hidesm" data-go="tq">Công nợ 131</span><span class="sep hidesm">›</span><b>${esc(secT(s0.k))}</b><span class="sep">·</span><span class="hidesm">${esc(fLab())}</span>`;
  const lk=$('crumbs').querySelector('[data-go]'); if(lk)lk.onclick=()=>go('tq');
  const it=$('nav').querySelector('.nitem.on'); if(it)it.scrollIntoView({block:'nearest'});
  const bp=$('btnPer'); if(bp)bp.innerHTML=ic('cal2')+`<span class="pertx"><b>${esc(labA())}</b> <i>so</i> ${esc(labBs())}</span>`;
  buildFil();
}
function buildMonths(){
  const m=curM();
  const cu=state.pm==='c';
  $('fMonth').innerHTML=(cu?`<option value="c" selected>${esc(labA())}</option>`:'')+MONTHS().map((_,i)=>`<option value="${i}"${!cu&&i===m?' selected':''}>T${X.MS[i]%100}/${Math.floor(X.MS[i]/100)}${i===X.nM-1&&!isME(X.ME[i])?' · đến '+dS(X.dmax):''}</option>`).reverse().join('');
}
function buildFil(){
  const e=$('fFil');if(!e)return;const ks={};for(let i=0;i<X.nC;i++){if(!X.rowsOf[i].length)continue;if(state.ly==='hd'&&X.layer[i])continue;if(state.ly==='ng'&&!X.layer[i])continue;(ks[X.kenh[i]]=ks[X.kenh[i]]||new Set()).add(X.vung[i]);}
  let h=`<option value="">Tất cả kênh · vùng</option>`;
  Object.keys(ks).sort((a,b)=>kOrd(a)-kOrd(b)).forEach(k=>{h+=`<option value="k:${esc(k)}"${state.fk===k&&!state.fv?' selected':''}>${esc(k)}</option>`;
    Array.from(ks[k]).sort((a,b)=>vOrd(a)-vOrd(b)).forEach(v=>{if(v!==k.replace(/^\d\.\s*/,''))h+=`<option value="v:${esc(v)}"${state.fv===v?' selected':''}>   └ ${esc(v)}</option>`;});});
  e.innerHTML=h;
}
function buildUseg(){
  const e=$('useg'); if(!e)return;
  e.innerHTML=`<div class="segs useg1">${['hd','all','ng'].map(u=>`<button data-ly="${u}" class="${state.ly===u?'on':''}" title="Lớp ${LYN[u]} (phím L)">${ic(u==='hd'?'store':u==='all'?'layers':'scale')}<span>${LYN[u]}</span></button>`).join('')}</div>`+
    `<div class="segs useg1" style="margin-left:6px">${['ty','tr'].map(u=>`<button data-uu="${u}" class="${state.u===u?'on':''}" title="Đơn vị (phím U)"><span>${u==='ty'?'Tỷ':'Triệu'}</span></button>`).join('')}</div>`;
  e.querySelectorAll('[data-ly]').forEach(b=>b.onclick=()=>setLayer(b.dataset.ly));
  e.querySelectorAll('[data-uu]').forEach(b=>b.onclick=()=>setUnit(b.dataset.uu));
}
function setLayer(l){state.ly=l||({hd:'all',all:'ng',ng:'hd'}[state.ly]);if(state.fk||state.fv){/* giữ lọc nếu còn hợp lệ */}MASK._k=null;savePer();buildUseg();render();toast('Lớp: '+LYN[state.ly]);}
function setUnit(u){state.u=u||(state.u==='ty'?'tr':'ty');savePer();buildUseg();render();toast('Đơn vị: '+UN());}
function setFil(v){if(!v){state.fk='';state.fv='';}else if(v.indexOf('k:')===0){state.fk=v.slice(2);state.fv='';}else{state.fv=v.slice(2);state.fk='';}MASK._k=null;savePer();render();toast('Đang xem: '+fLab());}

/* ═════════════ BỘ CHỌN KỲ ═════════════ */
function savePer(){try{localStorage.setItem(LSK2+'_per',JSON.stringify({mi:state.mi,pm:state.pm,cmp:state.cmp,u:state.u,ly:state.ly,fk:state.fk,fv:state.fv,a0:state.a0,dcut:state.dcut,cf:state.cf,ct:state.ct,last:X?X.P.meta.dmax:null}));}catch(e){}}
function loadPer(){try{const s=JSON.parse(localStorage.getItem(LSK2+'_per')||'{}');
  ['pm','cmp','ly','fk','fv'].forEach(k=>{if(typeof s[k]==='string')state[k]=s[k];});if(s.u==='ty'||s.u==='tr')state.u=s.u;if(s.a0===0||s.a0===1)state.a0=s.a0;
  if(s.cf&&s.ct){state.cf=s.cf;state.ct=s.ct;}else if(state.pm==='c')state.pm='m';
  if(s.last===PDATA.meta.dmax){if(s.mi!==undefined)state.mi=s.mi;if(s.dcut)state.dcut=s.dcut;}}catch(e){}}
function openPer(){
  const m=curM(), toISO=d=>{const x=AR.toD(d);return x.getUTCFullYear()+'-'+String(x.getUTCMonth()+1).padStart(2,'0')+'-'+String(x.getUTCDate()).padStart(2,'0');};
  const fromISO=v=>{const p=(v||'').split('-').map(Number);return p.length===3&&p[0]?AR.ser(p[0],p[1],p[2]):null;};
  const lo=Math.max(X.P.meta.dmin,AR.ymStart(X.MS[0])),hi=X.dmax;
  let md=state.pm==='c'?'c':'m', pm=state.pm==='c'?'m':state.pm, cmp=state.cmp;
  const cw=state.pm==='c'?custW():{f:AR.ymStart(AR.ymOf(hi)),t:hi};
  const opt=MONTHS().map((_,i)=>`<option value="${i}"${i===m?' selected':''}>${mLabL(i)}${i===X.nM-1&&!isME(X.ME[i])?' (đến '+dS(X.dmax)+')':''}</option>`).reverse().join('');
  const qk=[['mtd','Tháng này đến nay'],['pm','Tháng trước'],['w7','7 ngày gần nhất'],['w30','30 ngày gần nhất'],['qtd','Quý này đến nay'],['ytd','Đầu năm đến nay']];
  $('perBody').innerHTML=`<h2>${ic('cal2')} Kỳ xem số liệu & kỳ so sánh<button class="xclose" onclick="hide2('ovPer')">×</button></h2>
    <div class="msub">Số dư, tuổi nợ, quá hạn lấy tại ngày cuối kỳ; doanh số, tiền thu, chiết khấu cộng trong kỳ. Dữ liệu có đến <b>${dStr(hi)}</b>.</div>
    <div class="segs pmode" style="margin:4px 0 12px"><button data-pmd="m" class="${md==='m'?'on':''}">${ic('cal2')}<span>Tròn tháng</span></button><button data-pmd="c" class="${md==='c'?'on':''}">${ic('clock')}<span>Từ ngày – đến ngày</span></button></div>
    <div id="pmM" style="${md==='m'?'':'display:none'}">
      <div class="phd">Tháng cuối kỳ</div><div class="perrow"><select class="msel wsel" id="pM">${opt}</select></div>
      <div class="phd">Độ dài kỳ</div><div class="segs" style="flex-wrap:wrap;margin-bottom:8px">${Object.keys(PMN).map(k=>`<button data-ppm="${k}" class="${pm===k?'on':''}">${PMN[k]}</button>`).join('')}</div>
    </div>
    <div id="pmC" style="${md==='c'?'':'display:none'}">
      <div class="phd">Khoảng ngày</div>
      <div class="perrow drow"><label>Từ ngày <input type="date" class="msel dinp" id="pF" min="${toISO(lo)}" max="${toISO(hi)}" value="${toISO(cw.f)}"></label><label>đến ngày <input type="date" class="msel dinp" id="pT" min="${toISO(lo)}" max="${toISO(hi)}" value="${toISO(cw.t)}"></label></div>
      <div class="qchips">${qk.map(q=>`<button class="qc" data-qk="${q[0]}">${q[1]}</button>`).join('')}</div>
    </div>
    <div class="phd">So sánh với</div><div class="segs" id="pCmp" style="flex-wrap:wrap;margin-bottom:8px"></div>
    <div class="dqi" style="margin-top:12px"><div class="dic y">${ic('cal2')}</div><div class="bd"><b id="perPrev"></b><p id="perPrev2"></p></div></div>
    <div style="display:flex;gap:8px;margin-top:14px"><button class="btn" id="perGo" style="flex:1">Áp dụng</button><button class="btn ghost" onclick="hide2('ovPer')">Huỷ</button></div>`;
  const rdC=()=>{let f=fromISO($('pF').value),t=fromISO($('pT').value);if(!t)t=hi;if(!f)f=t;t=Math.min(Math.max(t,lo),hi);f=Math.min(Math.max(f,lo),hi);if(f>t){const z=f;f=t;t=z;}return {f,t};};
  const cmpSeg=()=>{const N=md==='c'?CMNc:CMN;$('pCmp').innerHTML=Object.keys(N).map(k=>`<button data-pcm="${k}" class="${cmp===k?'on':''}">${N[k]}</button>`).join('');
    $$('#pCmp [data-pcm]').forEach(x=>x.onclick=()=>{cmp=x.dataset.pcm;$$('#pCmp [data-pcm]').forEach(y=>y.classList.toggle('on',y===x));prev();});};
  const apply=()=>{if(md==='c'){const w=rdC();state.pm='c';state.cf=w.f;state.ct=w.t;}else{state.pm=pm;state.mi=+$('pM').value;}state.cmp=cmp;};
  const prev=()=>{const k=[state.mi,state.pm,state.cmp,state.cf,state.ct];apply();const A=winA(),B=winB();
    $('perPrev').innerHTML='Xem: '+dStr(A.f)+' – '+dStr(A.t)+' <span class="mu">('+(A.t-A.f+1)+' ngày)</span> &nbsp;↔&nbsp; So: '+dStr(B.f)+' – '+dStr(B.t);$('perPrev2').textContent=labA()+' so '+labB();
    [state.mi,state.pm,state.cmp,state.cf,state.ct]=k;};
  $$('#perBody [data-pmd]').forEach(x=>x.onclick=()=>{md=x.dataset.pmd;$$('#perBody [data-pmd]').forEach(y=>y.classList.toggle('on',y===x));$('pmM').style.display=md==='m'?'':'none';$('pmC').style.display=md==='c'?'':'none';cmpSeg();prev();});
  $$('#perBody [data-ppm]').forEach(x=>x.onclick=()=>{pm=x.dataset.ppm;$$('#perBody [data-ppm]').forEach(y=>y.classList.toggle('on',y===x));prev();});
  $$('#perBody [data-qk]').forEach(x=>x.onclick=()=>{const q=x.dataset.qk,ym=AR.ymOf(hi);let f,t=hi;
    if(q==='mtd')f=AR.ymStart(ym);else if(q==='pm'){f=AR.ymStart(AR.ymAdd(ym,-1));t=AR.ymEnd(AR.ymAdd(ym,-1));}else if(q==='w7')f=hi-6;else if(q==='w30')f=hi-29;
    else if(q==='qtd')f=AR.ymStart(Math.floor(ym/100)*100+Math.floor((ym%100-1)/3)*3+1);else f=AR.ymStart(Math.floor(ym/100)*100+1);
    $('pF').value=toISO(Math.max(f,lo));$('pT').value=toISO(t);$$('#perBody [data-qk]').forEach(y=>y.classList.toggle('on',y===x));prev();});
  $('pM').onchange=prev; $('pF').onchange=prev; $('pT').onchange=prev;
  $('perGo').onclick=()=>{apply();if(state.pm!=='c'&&state.mi===X.nM-1)state.mi=null;hide2('ovPer');savePer();buildMonths();render();toast('Kỳ '+labA()+' so '+labB());};
  cmpSeg(); prev(); $('ovPer').classList.add('show');
}

/* ═════════════ DRILL / NGUỒN ═════════════ */
function drillOpen(key){
  const d=DRF[+key]; if(!d)return;
  PEND=[]; const html=d.f(); if(html===null||html===undefined){PEND=[];return;}
  $('drillBody').innerHTML=`<h2>🔍 ${esc(d.t)}<button class="xclose" onclick="hide2('ovDrill')">×</button></h2>`+html;
  $('ovDrill').classList.add('show'); state.drill={k:key}; alignTables($('drillBody'));
  $$('#drillBody tr[data-kh]').forEach(r=>r.onclick=()=>custOpen(r.dataset.kh));
  const pend=PEND.slice(); PEND=[];
  pend.forEach(p=>{const el=$(p.id);if(el&&p.cfg){try{CH.push(new Chart(el.getContext('2d'),p.cfg));}catch(e){console.warn(e);}}});
}
function custOpen(i){i=+i;drillOpen(DR('Hồ sơ công nợ · '+cShort(i),()=>custDrill(i)));}
function srcOpen(key){
  const s=SRCR[+key]; if(!s)return;
  $('srcBody').innerHTML=`<h2>🔎 Nguồn &amp; công thức<button class="xclose" onclick="hide2('ovSrc')">×</button></h2><div class="msub">${esc(s.t)} · ${esc(PER())}</div>
    <div class="srcrow">${s.r.map(r=>`<b>${esc(r[0])}</b><span>${esc(r[1])}</span>`).join('')}<b>File nguồn</b><span>${esc(X.P.meta.file||'')} › IN_/M_ Bảng kê chứng từ TK 131 + M_Dư nợ tại 1.1.23</span></div>`;
  $('ovSrc').classList.add('show');
}
function bindAR(){
  $$('#grid [data-gs]').forEach(b=>b.onclick=e=>{e.stopPropagation();const p=b.dataset.gs.split(':'),k=p[0],v=p.slice(1).join(':');
    if(k==='a0'){state.a0=+v;savePer();}else if(k==='ksort')state.ksort=v;else if(k==='calN'){state.calN=+v;}
    else if(k==='tdp'){state.tdp=v;const D=tdDay();if(v==='m'){state.tdF=AR.ymStart(AR.ymOf(D));state.tdT=D;}else if(v==='w'){state.tdF=Math.max(X.P.meta.dmin,D-6);state.tdT=D;}else{const ym=AR.ymAdd(AR.ymOf(D),-1);state.tdF=AR.ymStart(ym);state.tdT=AR.ymEnd(ym);}}
    else state[k]=v; render();});
  const tD=$('tdD');if(tD)tD.onchange=()=>{state.tdD=+tD.value;if((state.tdp||'m')==='m'){state.tdF=AR.ymStart(AR.ymOf(state.tdD));state.tdT=state.tdD;}render();};
  const tF=$('tdF'),tT=$('tdT');if(tF)tF.onchange=()=>{state.tdF=+tF.value;state.tdp='c';render();};if(tT)tT.onchange=()=>{state.tdT=+tT.value;state.tdp='c';render();};
  const bw=$('btnTdWord');if(bw)bw.onclick=openWordDlg;
  const fp=$('btnFcPlan');if(fp)fp.onclick=()=>{const v=parseFloat(($('fcPlan').value||'').replace(',','.'));if(!(v>0)){toast('Nhập doanh số dự kiến (tỷ đ).');return;}TXT[planKey(X.MS[mOf(X.dmax)])]=v;saveCfg();if(window.ONL)ONL.markPending('doanh số dự kiến');BACKTEST._c={};render();toast('Đã áp dụng doanh số dự kiến '+nd(v,1)+' tỷ.');};
  const fc=$('btnFcClr');if(fc)fc.onclick=()=>{delete TXT[planKey(X.MS[mOf(X.dmax)])];saveCfg();render();toast('Dùng nhịp bán hiện tại.');};
  $$('#grid tr[data-fk]').forEach(r=>r.onclick=()=>setFil('k:'+r.dataset.fk));
  $$('#grid tr[data-fv]').forEach(r=>r.onclick=()=>setFil('v:'+r.dataset.fv));
  $$('#grid tr[data-kh]').forEach(r=>r.onclick=()=>custOpen(r.dataset.kh));
  $$('#grid select.pbst').forEach(s=>s.onchange=()=>{TXT[s.dataset.pbk]=s.value;saveCfg();if(window.ONL)ONL.markPending('trạng thái xử lý');toast('Đã cập nhật trạng thái: '+s.value);});
  const bc=$('btnCut');if(bc)bc.onclick=()=>setCut(+$('selCut').value);
  const cr=$('ckRef');if(cr)cr.onchange=()=>{state.noRef=!cr.checked;};
  const dz=$('dropZone'); if(dz){dz.ondragover=e=>{e.preventDefault();dz.classList.add('on');};dz.ondragleave=()=>dz.classList.remove('on');}
}
/* căn lề bảng: số → phải · chữ → trái · tiêu đề → giữa */
const UNITW=/\b(ngày|tỷ|tr|KH|đ%|HM|Có|x|thư)\b/g;
function alignTables(root){(root||document).querySelectorAll('table').forEach(t=>{if(t.dataset.al)return;t.dataset.al=1;
  t.querySelectorAll('tbody td').forEach(td=>{if(td.classList.contains('num')||td.classList.contains('txt'))return;if(td.classList.contains('tl')||td.querySelector('.pl,select,input,.rk'))return td.classList.add(td.querySelector('.rk')?'ctr':'txt');
    const s=(td.textContent||'').replace(UNITW,'').trim();td.classList.add(/[A-Za-zÀ-ỹ]/.test(s)?'txt':'num');});});}
(function(){const _r=render;render=function(o){DRF=[];SRCR=[];if(!X)return;const r=_r(o);bindAR();alignTables($('grid'));return r;};})();
function clearCaches(){COHORT._k=null;BACKTEST._c={};for(const k in SNC)delete SNC[k];for(const k in FWC)delete FWC[k];MASK._k=null;Z._k=null;TS._k=null;MSER._k=null;ROLL._c={};ALERTS._k=null;}
const DLAST=P=>P.meta.dlast||P.meta.dmax;
function buildCtx(){const cut=state.dcut&&state.dcut<=DLAST(PDATA)&&state.dcut>=PDATA.meta.dmin?state.dcut:DLAST(PDATA);
  X=AR.ctx(PDATA,{dmax:cut});X._g=Date.now()+Math.random();clearCaches();}
async function setCut(d){busy('Đang tính lại tuổi nợ tại ngày '+dStr(d)+'…');await tick();state.dcut=d;state.mi=null;buildCtx();savePer();busy(false);buildMonths();render({top:1});toast('Ngày chốt: '+dStr(d));}

/* ═════════════ TÌM NHANH ═════════════ */
function palItems(){
  const L2=SECS.map(s=>({t:secT(s.k),s:'Mục · '+s.g,go:()=>go(s.k),i:s.ico}));
  ['hd','all','ng'].forEach(l=>L2.push({t:'Lớp '+LYN[l],s:'Đổi lớp phân tích',go:()=>setLayer(l),i:'▦'}));
  const vs=new Set();for(let i=0;i<X.nC;i++)if(X.rowsOf[i].length)vs.add(X.vung[i]);
  KORDER.forEach(k=>L2.push({t:k,s:'Lọc kênh',go:()=>setFil('k:'+k),i:'◆'}));Array.from(vs).sort((a,b)=>vOrd(a)-vOrd(b)).forEach(v=>L2.push({t:v,s:'Lọc vùng',go:()=>setFil('v:'+v),i:'◇'}));
  const S=X.SN[X.nM-1];const idx=[];for(let i=0;i<X.nC;i++)if(X.rowsOf[i].length)idx.push(i);idx.sort((a,b)=>Math.abs(S.net[b])-Math.abs(S.net[a]));
  idx.slice(0,600).forEach(i=>L2.push({t:X.P.cid[i]+' · '+cName(i),s:'Khách hàng · '+X.vung[i],go:()=>custOpen(i),i:'🔎'}));
  Object.keys(PALS).forEach(p=>L2.push({t:'Men '+PALS[p].n,s:'Đổi màu giao diện',go:()=>{state.pal=p;saveCfg();render();syncUI();},i:'🎨'}));
  L2.push({t:'Đổi kỳ phân tích / kỳ so sánh',s:'Phím D',go:()=>openPer(),i:'📅'});
  L2.push({t:'Xuất báo cáo thu tiền ngày ra Word',s:'File .docx gửi lãnh đạo',go:()=>{go('td');setTimeout(openWordDlg,300);},i:'📄'});
  L2.push({t:'Đổi ngày chốt số liệu',s:'Mục Nạp dữ liệu',go:()=>go('dl'),i:'📌'});
  L2.push({t:'Trình chiếu toàn màn hình',s:'Phím F',go:()=>togglePresent(true),i:'▶'});
  L2.push({t:'In báo cáo',s:'Chọn nội dung, xuất PDF / PowerPoint',go:()=>openPrint(),i:'🖨'});
  L2.push({t:'Lưu bản HTML hiện tại',s:'Đóng gói số liệu + bố cục',go:()=>saveHTML(),i:'💾'});
  L2.push({t:'Nạp file Excel TK 131',s:'.xlsb / .xlsx',go:()=>$('fileIn').click(),i:'📂'});
  return L2;
}
function palRender(q){
  const all=palItems(); q=(q||'').toLowerCase().trim();
  palF=q?all.filter(x=>(x.t+' '+x.s).toLowerCase().indexOf(q)>=0):all.filter(x=>!/^Khách hàng/.test(x.s));
  palF=palF.slice(0,40); palSel=Math.min(palSel,palF.length-1); if(palSel<0)palSel=0;
  $('palList').innerHTML=palF.length?palF.map((x,i)=>`<div class="pgo ${i===palSel?'on':''}" data-pi="${i}"><span>${x.i}</span><span><b>${esc(x.t)}</b></span><span class="k">${esc(x.s)}</span></div>`).join(''):'<div class="psub" style="padding:12px">Không tìm thấy.</div>';
  $$('#palList [data-pi]').forEach(e=>e.onclick=()=>palGo(+e.dataset.pi));
}

/* ═════════════ XUẤT CSV ═════════════ */
function csvAll(){
  const z=Z(),S=SNAPI(z.A.t),mask=MASK(),F=FW(z.A.f,z.A.t);
  const R=[['Phân tích công nợ TK 131 CMC — ngày chốt '+dStr(z.A.t)+' · '+fLab()+' · kỳ dòng tiền '+labA()],['Nguồn',X.P.meta.file||''],[],
    ['Mã','Tên khách hàng','Kênh','Vùng','Nguyên tắc','Lớp','Dư Nợ','Dư Có'].concat(X.BKN).concat(['Dự phòng','Bảo lãnh hiệu lực','BL trừ','Trong hạn','Quá hạn (file)','Chưa có NT','Quá hạn (NT00 tạm tính)','Hạn mức','Doanh số ghi nợ kỳ','Tiền thu kỳ','Chiết khấu kỳ','Lần thu cuối'])];
  for(let i=0;i<X.nC;i++){if(!mask[i])continue;const n=S.net[i];const f=F.subarray(i*X.NL,i*X.NL+X.NL);if(Math.abs(n)<0.5&&!f.some(v=>v))continue;const lp=lastPayAt(i,z.A.t);
    R.push([X.P.cid[i],cName(i),X.kenh[i],X.vung[i],X.nt[i],X.layer[i]?'Ngoài HĐKD':'HĐKD',Math.round(Math.max(n,0)),Math.round(Math.max(-n,0))].concat(S.b.map(b=>Math.round(b[i]))).concat([Math.round(S.dp[i]),Math.round(S.bl[i]),Math.round(S.blu[i]),Math.round(S.inT[i]),Math.round(S.qh[i]),Math.round(S.cnt[i]),Math.round(S.qhA[i]),X.hasHM[i]?X.HM[i]:'',Math.round(f[0]+f[1]+f[2]+f[3]),Math.round(-f[6]),Math.round(-f[5]),lp?dStr(lp):'']));}
  dlCSV(stamp()+'_CMC_CongNo131_'+dStr(z.A.t).replace(/\//g,'')+'.csv',R);
}

/* ═════════════ NẠP FILE EXCEL ═════════════ */
function busy(t){let o=$('ovBusy');if(!o){o=document.createElement('div');o.id='ovBusy';o.className='ov';o.innerHTML='<div class="modal sm" style="text-align:center"><div class="spin"></div><div id="busyT" style="margin-top:12px"></div></div>';document.body.appendChild(o);}
  if(t===false){o.classList.remove('show');return;} $('busyT').innerHTML=t; o.classList.add('show');}
const tick=()=>new Promise(r=>setTimeout(r,40));
async function importFiles(fl){
  const files=Array.prototype.slice.call(fl||[]).filter(f=>/\.xlsb$|\.xlsx$|\.xlsm$/i.test(f.name)); if(!files.length){if(fl&&fl.length)alert('Chỉ nhận file .xlsb / .xlsx / .xlsm.');return;}
  const f=files[0], t0=Date.now();
  try{
    busy('Đang đọc <b>'+esc(f.name)+'</b> ('+nd(f.size/1048576,1)+' MB)…'); await tick();
    const u8=new Uint8Array(await f.arrayBuffer());
    const names=XLSX.read(u8,{type:'array',bookSheets:true}).SheetNames;
    const need=names.filter(n=>{n=n.normalize('NFC');return Object.keys(ARM.SH).some(k=>!/^o[A-Z]/.test(k)&&ARM.SH[k].test(n));});
    if(!need.length)throw new Error('Không thấy sheet nào đúng mẫu (IN_Bảng kê chứng từ…, M_…, W_Tên phân tích).');
    busy('Đang giải nén '+need.length+' sheet dữ liệu…'); await tick();
    const wb=XLSX.read(u8,{type:'array',dense:true,sheets:need});
    busy('Đang đọc bảng kê & danh mục…'); await tick();
    const raw=ARM.parse(wb,f.name);
    if(!raw._lines.length)throw new Error('Không đọc được dòng bảng kê nào.');
    if(!state.noRef){const outs=names.filter(n=>/^OUT_/i.test(n));if(outs.length){busy('Đang đọc dòng tổng các sheet OUT_ để đối soát…'); await tick();
      try{raw.ref=ARM.parseRef(XLSX.read(u8,{type:'array',dense:true,sheetRows:12,sheets:outs}));}catch(e){console.warn(e);}}}
    busy('Đang phân loại bút toán…'); await tick();
    const P=AR.pack(raw,PDATA);
    busy('Đang tính tuổi nợ FIFO cho mọi cuối tháng…'); await tick();
    const X2=AR.ctx(P,{dmax:DLAST(P)});
    busy(false);
    const ok=await confirmImport(P,X2,f,(Date.now()-t0)/1000); if(!ok)return;
    busy('Đang đóng gói số liệu…'); await tick();
    PDATA=P; window.DATA={meta:{m:10,file:f.name,gen:P.meta.gen},bin:await AR.enc(P)};
    state.dcut=null; state.mi=null; buildCtx(); busy(false); savePer(); buildMonths(); render({top:1}); buildUseg();
    if(window.ONL)ONL.markPending('số liệu từ '+f.name);
    toast('✅ Đã nạp '+f.name+' · '+n0(P.meta.rows)+' dòng công nợ · chốt '+dStr(X.dmax)+'.');
  }catch(err){busy(false);console.error(err);alert('❌ KHÔNG NẠP ĐƯỢC — báo cáo vẫn giữ số liệu cũ.\n\n'+err.message);}
  finally{$('fileIn').value='';}
}
function confirmImport(P,X2,f,sec){
  return new Promise(res=>{
    const old=PDATA, S=X2.SN[X2.nM-1]; let dr=0;for(let i=0;i<X2.nC;i++)if(S.net[i]>0)dr+=S.net[i];
    const ck=(P.cdps||[]).map(r=>{const Lx=P.L;let n=0;for(let j=0;j<Lx.k.length;j++)if(Lx.d[j]>=r[0]&&Lx.d[j]<=r[1]&&Lx.v[j])n+=Lx.a[j];return Math.abs(n-r[4])<2;});
    $('helpBody').innerHTML=`<h2>📂 Xác nhận nạp dữ liệu<button class="xclose" id="ciX">×</button></h2>
      <div class="msub">Đã đọc trong ${nd(sec,1)} giây.</div>
      <div class="srcrow"><b>File</b><span>${esc(f.name)}</span><b>Dòng bảng kê</b><span>${n0(P.meta.lines)} → ${n0(P.meta.rows)} dòng công nợ (hiện tại ${n0(old.meta.rows)})</span>
        <b>Khoảng ngày</b><span>${dStr(P.meta.dmin)} – ${dStr(DLAST(P))} (hiện tại đến ${dStr(DLAST(old))})</span>
        <b>Ngày chốt báo cáo</b><span style="color:var(--brand)"><b>${dStr(DLAST(P))}</b> — ngày chứng từ cuối của IN_Bảng kê${P.meta.cdpsTo?' (IN_CĐPS đến '+dStr(P.meta.cdpsTo)+')':''}</span>
        ${P.meta.keptBase?`<b>Lịch sử giữ lại</b><span>${n0(P.meta.keptBase)} dòng trước ${dStr(P.meta.keptBefore)} (file không có sheet M_Bảng kê FY23-25)</span>`:''}
        <b>Dư nợ phải thu</b><span>${fTy(dr)} tỷ tại ${dStr(X2.dmax)}</span>
        <b>Đối soát CĐPS</b><span style="color:${ck.every(x=>x)?'var(--ok)':'var(--bad)'}">${ck.length?(ck.every(x=>x)?'✓ Khớp '+ck.length+'/'+ck.length+' kỳ':'✕ Lệch '+ck.filter(x=>!x).length+' kỳ — xem mục Kiểm soát'):'Không có sheet CĐPS'}</span>
        <b>Bút toán chưa phân loại</b><span>${P.unk.length?P.unk.length+' tổ hợp (xếp vào Khác)':'Không có'}</span>
        ${(P.meta.miss||[]).length?`<b>Sheet thiếu</b><span>${esc(P.meta.miss.join(', '))} — dùng số đang có</span>`:''}</div>
      <div style="display:flex;gap:8px;margin-top:14px"><button class="btn" id="ciGo" style="flex:1">Áp dụng &amp; tính lại</button><button class="btn ghost" id="ciNo">Huỷ</button></div>`;
    $('ovHelp').classList.add('show');
    const end=v=>{hide2('ovHelp');res(v);};
    $('ciGo').onclick=()=>end(true); $('ciNo').onclick=$('ciX').onclick=()=>end(false);
  });
}

/* ═════════════ HƯỚNG DẪN ═════════════ */
function openHelp(){
  $('helpBody').innerHTML=`<h2>❓ Hướng dẫn sử dụng<button class="xclose" onclick="hide2('ovHelp')">×</button></h2>
  <div class="msub">Phân tích công nợ & thu tiền TK 131 · chạy độc lập, không cần mạng, không cần Excel.</div>
  <div class="dql">
    <div class="dqi"><div class="ic">🗂</div><div class="bd"><b>Nguồn số liệu</b><p>Tính lại từ bảng kê chứng từ TK 131 (2023 → nay), số dư 01/01/2023, danh mục, hạn mức, bảo lãnh, nguyên tắc hạn nợ — không dùng số của sheet OUT_ (chỉ đối soát).</p></div></div>
    <div class="dqi"><div class="ic">▦</div><div class="bd"><b>Lớp & bộ lọc</b><p>HĐKD (mặc định) · Toàn bộ · Ngoài HĐKD (phím L). Ô lọc kênh / vùng trên thanh công cụ; bấm dòng bảng kênh / vùng để lọc nhanh.</p></div></div>
    <div class="dqi"><div class="ic">📅</div><div class="bd"><b>Kỳ & so sánh</b><p>Nút lịch (phím D): tháng / quý / lũy kế năm / 12 tháng, so kỳ liền trước hoặc cùng kỳ. Tháng chưa trọn tự so cùng số ngày. Ngày chốt đổi ở mục Nạp dữ liệu.</p></div></div>
    <div class="dqi"><div class="ic">🔍</div><div class="bd"><b>Đi sâu</b><p>Bấm khách hàng ở bất kỳ bảng nào → hồ sơ công nợ: 24 tháng, hóa đơn còn nợ (FIFO), hạn TT, bảo lãnh, bút toán gần nhất. Ctrl+K tìm khách theo mã / tên.</p></div></div>
    <div class="dqi"><div class="ic">✎</div><div class="bd"><b>Sửa bố cục, nội dung</b><p>Bấm 🔒 nhập mật khẩu rồi bật ✎: đổi độ rộng / chiều cao / thứ tự khối, ẩn khối, đổi dạng biểu đồ, màu khối, sửa tiêu đề và các dòng nhận định.</p></div></div>
    <div class="dqi"><div class="ic">🖨</div><div class="bd"><b>In / PDF / PowerPoint</b><p>Bấm 🖨 → chọn mục, bìa, mục lục → In PDF hoặc xuất PowerPoint.</p></div></div>
    <div class="dqi"><div class="ic">⌨</div><div class="bd"><b>Phím tắt</b><p><span class="kbd">Ctrl</span>+<span class="kbd">K</span> tìm nhanh · <span class="kbd">D</span> chọn kỳ · <span class="kbd">L</span> đổi lớp · <span class="kbd">U</span> tỷ ⇄ triệu · <span class="kbd">F</span> trình chiếu · <span class="kbd">←</span><span class="kbd">→</span> đổi mục · <span class="kbd">?</span> hướng dẫn.</p></div></div>
  </div>`;
  $('ovHelp').classList.add('show');
}

/* ═════════════ KHỞI TẠO ═════════════ */
async function init(){
  loadCfg();
  if(window.__SAVED__){
    try{const S=window.__SAVED__;
      if(S.DATA)window.DATA=S.DATA; if(S.LAY)LAY=S.LAY; if(S.TXT)TXT=S.TXT; if(S.LOGO)LOGO=S.LOGO;
      if(S.view){const v=Object.assign({},S.view);let had=false;try{had=!!localStorage.getItem(LSK);}catch(_){}
        if(had)['mode','pal','labels','prev','anim','toolbar','sec','u','lv','fx','fxc','cgrad'].forEach(k=>delete v[k]);Object.assign(state,v);}
      state.unlocked=false; state.editing=false; window.__SAVEDAT__=S.savedAt||null;
    }catch(e){console.error('Không đọc được trạng thái đã lưu',e);}
  }
  if(!SECS.some(x=>x.k===state.sec))state.sec='tq';
  if(!PALS[state.pal])state.pal='hkdem';
  if(state.u!=='ty'&&state.u!=='tr')state.u='ty';
  busy('Đang giải nén số liệu công nợ…');
  try{PDATA=await AR.dec(DATA.bin);}catch(e){busy(false);alert('❌ Không giải nén được số liệu nhúng: '+e.message+'\nHãy mở bằng Chrome / Edge bản mới.');return;}
  if(!window.__SAVED__)loadPer();
  busy('Đang tính tuổi nợ FIFO cho mọi cuối tháng…');await tick();
  buildCtx(); busy(false);
  applyIcons(); applyTheme(); applyLogo(); buildMonths(); setToolbar(state.toolbar); buildUseg(); render(); syncUI();
  $('btnSb').onclick=toggleSb;
  $('btnMore').onclick=e=>{e.stopPropagation();if(window.innerWidth<=820&&!state.toolbar){setToolbar(true);return;}openMenu();};
  $('fMonth').onchange=e=>{const i=+e.target.value;if(e.target.value==='c'){openPer();return;}if(state.pm==='c')state.pm='m';state.mi=i===X.nM-1?null:i;savePer();buildMonths();render();};
  $('fFil').onchange=e=>setFil(e.target.value);
  $('btnPer').onclick=openPer;
  $('btnGear').onclick=openDrawer; $('btnClose').onclick=()=>$('drawer').classList.remove('show');
  $('btnPresent').onclick=()=>togglePresent(); $('btnPrint').onclick=openPrint;
  $('btnMode').onclick=()=>{state.mode=state.mode==='dark'?'light':'dark';saveCfg();render();syncUI();};
  $('fileIn').onchange=e=>importFiles(e.target.files); $('jsonIn').onchange=impCfg; $('btnFind').onclick=palOpen;
  $$('#moreMenu .mi').forEach(el=>el.onclick=()=>{const a=el.dataset.a;$('moreMenu').classList.remove('show');
    if(a==='import')$('fileIn').click(); else if(a==='files')go('dl'); else if(a==='html')saveHTML(); else if(a==='print')openPrint(); else if(a==='csv')csvAll();
    else if(a==='per')openPer(); else if(a==='expcfg')expCfg(); else if(a==='impcfg')$('jsonIn').click(); else if(a==='reset')$('ovReset').classList.add('show');
    else if(a==='lock')$('btnLock').click(); else if(a==='help')openHelp();
    else if(a==='publish'&&window.ONL)ONL.openPublish(); else if(a==='history'&&window.ONL)ONL.openHistory();});
  document.addEventListener('click',e=>{const m=$('moreMenu');if(m.classList.contains('show')&&!m.contains(e.target)&&e.target!==$('btnMore'))m.classList.remove('show');});
  $('scrim').onclick=()=>document.body.classList.remove('sbshow');
  $('btnLock').onclick=()=>{if(state.unlocked){state.unlocked=false;toggleEdit(false);state.editing=false;document.body.classList.remove('editing');syncUI();render();toast('Đã khoá lại.');}
    else{$('ovPwd').classList.add('show');setTimeout(()=>$('pwdIn').focus(),60);}};
  $('btnEdit').onclick=()=>toggleEdit(); $('pwdIn').onkeydown=e=>{if(e.key==='Enter')tryUnlock();}; $('pwdGo').onclick=tryUnlock;
  $$('[data-mode-set]').forEach(b=>b.onclick=()=>{state.mode=b.dataset.modeSet;saveCfg();render();syncUI();});
  $$('[data-rs]').forEach(b=>b.onclick=()=>resetScope(b.dataset.rs));
  [['ckLabels','labels'],['ckPrev','prev'],['ckAnim','anim']].forEach(x=>{const e=$(x[0]);if(e)e.onchange=ev=>{state[x[1]]=ev.target.checked;saveCfg();render();};});
  $('logoIn').onchange=e=>{const f=e.target.files&&e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>{LOGO=ev.target.result;saveCfg();applyLogo();toast('Đã đổi logo.');};r.readAsDataURL(f);e.target.value='';};
  $('palIn').oninput=e=>palRender(e.target.value);
  $('palIn').onkeydown=e=>{if(e.key==='ArrowDown'){palSel=Math.min(palSel+1,palF.length-1);palRender($('palIn').value);e.preventDefault();}
    else if(e.key==='ArrowUp'){palSel=Math.max(palSel-1,0);palRender($('palIn').value);e.preventDefault();}else if(e.key==='Enter'){palGo(palSel);e.preventDefault();}};
  $$('.ov').forEach(o=>o.onclick=e=>{if(e.target===o&&o.id!=='ovBusy')hide2(o.id);});
  $('pNext').onclick=()=>moveSec(1); $('pPrev').onclick=()=>moveSec(-1); $('pExit').onclick=()=>togglePresent(false);
  document.addEventListener('dragover',e=>{if(e.dataTransfer&&Array.from(e.dataTransfer.types||[]).indexOf('Files')>=0){e.preventDefault();document.body.classList.add('dropon');}});
  document.addEventListener('dragleave',e=>{if(!e.relatedTarget)document.body.classList.remove('dropon');});
  document.addEventListener('drop',e=>{if(e.dataTransfer&&e.dataTransfer.files&&e.dataTransfer.files.length){e.preventDefault();document.body.classList.remove('dropon');importFiles(e.dataTransfer.files);}});
  document.addEventListener('keydown',e=>{
    const typing=/INPUT|TEXTAREA|SELECT/.test(e.target.tagName||'')||e.target.isContentEditable;
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();palOpen();return;}
    if(typing)return;
    if(e.key==='Escape'){if(document.body.classList.contains('present')){togglePresent(false);return;}const op=$$('.ov.show')[0];if(op&&op.id!=='ovBusy'){hide2(op.id);return;}
      if($('drawer').classList.contains('show')){$('drawer').classList.remove('show');return;}if(state.editing){toggleEdit(false);return;}return;}
    if(e.key==='Backspace'){const op=$$('.ov.show')[0];if(op&&op.id!=='ovBusy'){e.preventDefault();hide2(op.id);}return;}
    const k=e.key.toLowerCase();
    if(k==='f')togglePresent(); else if(k==='s')setToolbar(true); else if(k==='h')setToolbar(false); else if(k==='u')setUnit(); else if(k==='l')setLayer();
    else if(k==='d')openPer(); else if(k==='?')openHelp(); else if(k==='m')toggleSb(); else if(k==='p')openPrint();
    else if(e.key==='ArrowRight')moveSec(1); else if(e.key==='ArrowLeft')moveSec(-1);
    else if(/^[1-9]$/.test(e.key)){const s=SECS[+e.key-1];if(s)go(s.k);}
  });
  document.addEventListener('fullscreenchange',()=>{if(!document.fullscreenElement&&document.body.classList.contains('present')){document.body.classList.remove('present');state.present=false;setTimeout(()=>CH.forEach(c=>{try{c.resize();}catch(_){}}),200);}});
  window.addEventListener('scroll',()=>{if(!state.present)return;const h=document.documentElement,p=h.scrollTop/((h.scrollHeight-h.clientHeight)||1);$('pbar').style.width=(p*100)+'%';});
}
if(window.Chart&&window.ChartDataLabels){try{Chart.register(ChartDataLabels);Chart.defaults.locale='vi-VN';}catch(e){}}
document.addEventListener('DOMContentLoaded',()=>{(window.ONL?ONL.boot():Promise.resolve()).then(init,init);});
