/* ══════════════════════ MỤC & NỘI DUNG — PHÂN TÍCH CÔNG NỢ & THU TIỀN TK 131 ══════════════════════
   Mọi số tính lại từ bảng kê chứng từ + số dư 01/01/2023 + danh mục (không đọc số từ sheet OUT_).
   Đi từ tổng thể → xu hướng → chất lượng nợ → thu tiền → kênh/vùng → khách hàng → hóa đơn.
   ══════════════════════════════════════════════════════════════════════════════════════ */
const SECS=[
  {k:'tq', n:'Tổng quan điều hành',   t:'Tổng quan công nợ phải thu & thu tiền',            g:'TỔNG HỢP',              ico:ic('dash')},
  {k:'cb', n:'Kết luận & cảnh báo',   t:'Kết luận, cảnh báo tự động & giải pháp',           g:'TỔNG HỢP',              ico:ic('alert')},
  {k:'xh', n:'Xu hướng dư nợ & DSO',  t:'Xu hướng dư nợ, vòng quay & mùa vụ',               g:'XU HƯỚNG & CHẤT LƯỢNG', ico:ic('trend')},
  {k:'tn', n:'Tuổi nợ & chất lượng',  t:'Tuổi nợ, trượt nhóm nợ & dự phòng',                g:'XU HƯỚNG & CHẤT LƯỢNG', ico:ic('hourglass')},
  {k:'qh', n:'Quá hạn & hạn nợ',      t:'Nợ quá hạn theo nguyên tắc hạn nợ (sau bảo lãnh)', g:'XU HƯỚNG & CHẤT LƯỢNG', ico:ic('clock')},
  {k:'tt', n:'Thu tiền — tổng quan',  t:'Thu tiền: nhịp thu, kênh, vùng & ngân hàng',       g:'THU TIỀN',              ico:ic('wallet')},
  {k:'td', n:'Báo cáo thu tiền ngày', t:'Báo cáo thu tiền hằng ngày (bản tin & bảng chi tiết)', g:'THU TIỀN',            ico:ic('cal')},
  {k:'fc', n:'Dự báo thu tiền tháng', t:'Dự báo thu tiền trong tháng',                       g:'THU TIỀN',              ico:ic('target')},
  {k:'mt', n:'Khớp thu tiền – bán hàng',t:'Khớp tiền thu với hóa đơn bán hàng: thời gian trả & hành vi thanh toán', g:'THU TIỀN', ico:ic('link2')},
  {k:'kv', n:'Kênh & vùng',           t:'Bảng điểm công nợ theo kênh & vùng',               g:'THEO ĐỐI TƯỢNG',        ico:ic('globe')},
  {k:'kh', n:'Khách hàng',            t:'Khách hàng — tập trung, rủi ro & hồ sơ công nợ',   g:'THEO ĐỐI TƯỢNG',        ico:ic('users')},
  {k:'hm', n:'Hạn mức & bảo lãnh',    t:'Hạn mức công nợ & bảo lãnh ngân hàng',             g:'THEO ĐỐI TƯỢNG',        ico:ic('shield')},
  {k:'ng', n:'Ngoài HĐKD & bất thường',t:'Công nợ ngoài HĐKD & bút toán bất thường',        g:'THEO ĐỐI TƯỢNG',        ico:ic('layers')},
  {k:'ck', n:'Chiết khấu & giảm trừ', t:'Chiết khấu, hàng bán trả lại trên doanh số',       g:'THEO ĐỐI TƯỢNG',        ico:ic('pct')},
  {k:'ks', n:'Kiểm soát số liệu',     t:'Kiểm soát số liệu, đối soát & phương pháp',        g:'KIỂM SOÁT',             ico:ic('check')},
  {k:'dl', n:'Nạp dữ liệu',           t:'Nạp file Excel TK 131 & ngày chốt',                g:'KIỂM SOÁT',             ico:ic('folder')},
  {k:'pb', n:'Phối hợp liên phòng ban',t:'Kế hoạch hành động & phối hợp liên phòng ban',    g:'KIỂM SOÁT',             ico:ic('hand')}
];
const secT=k=>T('sec.'+k,(SECS.find(s=>s.k===k)||{}).t||k);
const BLKNAME={}, BPN={};
const OWN={'1. Độc quyền':'KD Độc quyền / OEM','2. Phân phối':'KD Kênh phân phối','3. Xuất khẩu':'Phòng KDQT','4. Dự án':'Ban Dự án','5. Khác':'Kế toán công nợ','6. Thương mại':'Ban TGĐ · TCKT'};
const ownOf=i=>(OWN[X.kenh[i]]||'Kế toán công nợ')+(X.kenh[i]==='2. Phân phối'?' · '+X.vung[i]:'');
const LL=()=>X.P.L;
function lastPayAt(i,D){const R=X.rowsOf[i],Lx=LL();for(let q=R.length-1;q>=0;q--){const j=R[q];if(Lx.d[j]<=D&&Lx.t[j]===6&&Lx.a[j]<0)return Lx.d[j];}return null;}
/* DSO / dư nợ theo tháng cho 1 mặt nạ bất kỳ */
function TSm(mask){const ms=MSER(mask);const dr=X.SN.map(S=>{let s=0;for(let i=0;i<X.nC;i++)if(mask[i]&&S.net[i]>0)s+=S.net[i];return s;});
  const bill=dr.map((_,m)=>ms[0][m]+ms[1][m]+ms[2][m]+ms[3][m]);
  const dso=dr.map((v,m)=>{if(m<2)return null;const b=bill[m]+bill[m-1]+bill[m-2];return b>0?v/b*(X.ME[m]-AR.ymStart(X.MS[m-2])+1):null;});
  return {dr,bill,dso,coll:dr.map((_,m)=>-ms[6][m])};}
function maskOf(fn){const m=MASK(),o=new Uint8Array(X.nC);for(let i=0;i<X.nC;i++)if(m[i]&&fn(i))o[i]=1;return o;}
/* tỷ lệ trượt nhóm tuổi: khoản còn nợ sau 1 tháng */
const RBKx=[0,31,61,91,181,366];
function ROLL(m){
  if(m+1>=X.nM)return null; const mask=MASK(),k=X._g+'|'+MASK._k+'|'+m; ROLL._c=ROLL._c||{}; if(ROLL._c[k])return ROLL._c[k];
  const D0=X.ME[m],D1=X.ME[m+1],fr=new Float64Array(6),st=new Float64Array(6);
  for(let i=0;i<X.nC;i++){if(!mask[i])continue;const t=X.IT[i];let lo=0,hi=t.d.length;while(lo<hi){const q=(lo+hi)>>1;if(t.d[q]<=D0)lo=q+1;else hi=q;}const n=lo;if(!n)continue;
    const p0=X.poolAt(i,D0),p1=X.poolAt(i,D1);if(t.cum[n-1]-p0<=0.5)continue;
    for(let q=0;q<n;q++){const a=t.a[q];if(a<=0)continue;const o0=Math.min(a,Math.max(0,t.cum[q]-p0));if(o0<=0.5)continue;const o1=Math.min(a,Math.max(0,t.cum[q]-p1));
      const age=D0-t.d[q];let z=0;for(let w=5;w>=0;w--)if(age>=RBKx[w]){z=w;break;}fr[z]+=o0;st[z]+=o1;}}
  return ROLL._c[k]={fr,st};
}
function insTxt(a){return a.filter(Boolean);}

/* ═════════════ 1 · TỔNG QUAN ═════════════ */
function hmOver(S,mask){let n=0,v=0,n2=0;for(let i=0;i<X.nC;i++){if(!mask[i]||!X.hasHM[i])continue;const d=S.net[i];if(d>X.HM[i]+0.5){n++;v+=d-X.HM[i];if(X.HM2[i]&&d>X.HM2[i])n2++;}}return {n,v,n2};}
function ceiWin(z){const cur=z.gA.open-z.gA.ov,den=z.g0.dr+BILL(z.FA)-cur;return den>0?(z.g0.dr+BILL(z.FA)-z.gA.dr)/den:null;}
function ceiWinB(z){const S0=SNAP(z.B.f-1),g0=AG(S0),cur=z.gB.open-z.gB.ov,den=g0.dr+BILL(z.FB)-cur;return den>0?(g0.dr+BILL(z.FB)-z.gB.dr)/den:null;}
function secTQ(){
  const z=Z(), out=[], A=z.A, B=z.B, gA=z.gA, gB=z.gB, ts=TS(), m=curM(), mask=MASK();
  const bA=BILL(z.FA), bB=BILL(z.FB), cA=COLL(z.FA), cB=COLL(z.FB);
  const dsoA=DSOat(A.t), dsoB=DSOat(B.t), ovr=gA.open?gA.ov/gA.open:null, ovrB=gB.open?gB.ov/gB.open:null;
  const ceiA=ceiWin(z), ceiB=ceiWinB(z), hmo=hmOver(z.SA,mask), hmoB=hmOver(z.SB,mask);
  const ddr=dPct(gA.dr,gB.dr);
  out.push(hero2('tq',`Dư nợ phải thu <b>${fTy(gA.dr)} tỷ</b> tại ${dStr(A.t)} (${arw(ddr)} so ${dStr(B.t)}). Quá hạn sau bảo lãnh <b>${fTy(gA.ov)} tỷ = ${pc(ovr)}</b>${state.a0&&gA.cntOv>0.5?` (gồm ${fTy(gA.cntOv)} tỷ nợ chưa có nguyên tắc, tạm tính hạn 30 ngày)`:''}; DSO <b>${fDay(dsoA)} ngày</b> (${sgD(nul(dsoA)||nul(dsoB)?null:dsoA-dsoB)} ngày). Tiền thu kỳ <b>${fTy(cA)} tỷ</b> = ${pc(bA?cA/bA:null)} doanh số ghi nợ.`,[
    {l:'Dư nợ phải thu',v:fTy(gA.dr),s:'tỷ đ · '+arw(ddr),c:cUp(ddr)},
    {l:'% quá hạn',v:pc(ovr),s:'so '+pc(ovrB),c:cUp(nul(ovr)||nul(ovrB)?null:ovr-ovrB)},
    {l:'DSO 3 tháng',v:fDay(dsoA),s:'ngày · '+sgD(nul(dsoA)||nul(dsoB)?null:dsoA-dsoB),c:cUp(nul(dsoA)||nul(dsoB)?null:dsoA-dsoB)},
    {l:'Tiền thu kỳ',v:fTy(cA),s:'tỷ đ · '+arw(dPct(cA,cB)),c:cDn(dPct(cA,cB))}]));
  const s1=SRC('Dư nợ phải thu',[['Định nghĩa','Σ số dư Nợ TK 131 của các khách hàng có dư Nợ (không bù trừ với khách hàng đang dư Có / trả trước)'],['Công thức','Dư 01/01/2023 (M_Dư nợ) + Σ phát sinh Nợ − Σ phát sinh Có đến ngày chốt, theo từng mã đối tượng'],['Ngày chốt',dStr(A.t)],['Dư Nợ',fTy(gA.dr)+' tỷ'],['Dư Có (KH trả trước)',fTy(gA.cr)+' tỷ'],['Dư thuần',fTy(gA.net)+' tỷ'],['Lớp / lọc',fLab()]]);
  const s2=SRC('Nợ quá hạn sau bảo lãnh',[['Nguyên tắc','Theo IN_Thời hạn công nợ: NT01 cuối tháng + 10 ngày nới · NT02 cuối tháng + 15 · NT03 cuối tháng + 28 · NT04 phần vượt 2 tỷ · NT05 luôn trong hạn · NT06 ngày HĐ + 90'],['Bảo lãnh','Bảo lãnh còn hiệu lực tại ngày chốt trừ vào hóa đơn cũ nhất trước (FIFO)'],['Nợ chưa có nguyên tắc (NT00)',state.a0?'ĐANG tạm tính hạn = ngày chứng từ + 30 ngày (phương án b đã chốt)':'Không xét quá hạn (giữ đúng file Excel)'],['Quá hạn (file)',fTy(gA.qh)+' tỷ'],['NT00 quá 30 ngày',fTy(gA.cntOv)+' tỷ'],['Quá hạn dùng trong báo cáo',fTy(gA.ov)+' tỷ']]);
  const s3=SRC('DSO 3 tháng',[['Công thức','Dư nợ phải thu tại ngày chốt ÷ Doanh số ghi nợ 3 tháng gần nhất (gồm VAT, gồm bán khác / bán đầu tư) × số ngày của 3 tháng'],['Doanh số ghi nợ','Bán hàng + GTGT đầu ra + Bán khác + Bán đầu tư (theo bảng phân loại W_Tên phân tích)'],['Lưu ý','Tháng cuối chưa trọn tháng: số ngày tính đến ngày chốt']]);
  const s4=SRC('CEI — hiệu quả thu nợ',[['Công thức','(Dư nợ đầu kỳ + Doanh số ghi nợ trong kỳ − Dư nợ cuối kỳ) ÷ (Dư nợ đầu kỳ + Doanh số ghi nợ − Nợ trong hạn cuối kỳ)'],['Ý nghĩa','100% = thu hết phần đến hạn; < 80% là thu chậm'],['Kỳ',labA()]]);
  const sp=k=>spk(last13(k));
  out.push(panel('tq_k','','',krow([
    kc({l:'Dư nợ phải thu',v:fTy(gA.dr),u:'tỷ đ',cls:cUp(ddr)==='r'?'r':'g',src:s1,sub:'tại '+dStr(A.t),chips:[chipP('So '+labBs(),gA.dr,gB.dr,'down')],spk:sp(ts.dr),foot:`<span class="klkl">KH trả trước (dư Có)</span><b class="klkv">${fTy(gA.cr)}</b>`,dr:DR('Dư nợ theo vùng',()=>drillGrp('vung'))}),
    kc({l:'Nợ quá hạn sau bảo lãnh',v:fTy(gA.ov),u:'tỷ đ',cls:ovr>0.2?'r':ovr>0.1?'y':'g',src:s2,sub:pc(ovr)+' dư nợ · '+gA.nOv+' KH',chips:[chipA('So '+labBs(),ovr*100,ovrB*100,v=>nd(v,1)+' đ%','down')],spk:sp(ts.ov),foot:`<span class="klkl">Trong đó NT00 &gt; 30 ngày</span><b class="klkv">${fTy(gA.cntOv)}</b>`,dr:DR('Quá hạn theo khách hàng',()=>{go('qh');return null;})}),
    kc({l:'Nợ ≥ 180 ngày tuổi',v:fTy(gA.b180),u:'tỷ đ',cls:gA.b180>gB.b180*1.05?'r':'n',sub:pc(gA.open?gA.b180/gA.open:null)+' dư nợ',chips:[chipP('So '+labBs(),gA.b180,gB.b180,'down')],spk:sp(ts.b180),foot:`<span class="klkl">Dự phòng theo tuổi</span><b class="klkv">${fTy(gA.dp)}</b>`}),
    kc({l:'DSO 3 tháng',v:fDay(dsoA),u:'ngày',cls:!nul(dsoA)&&!nul(dsoB)&&dsoA-dsoB>3?'r':'g',src:s3,sub:'dư nợ ÷ doanh số 3 tháng',chips:[chipA('So '+labBs(),dsoA,dsoB,v=>nd(v,1)+' ngày','down')],spk:sp(ts.dso),foot:(()=>{const i=curM();const b=ts.bp[i],d=ts.dso[i];return `<span class="klkl">Tốt nhất có thể · trễ BQ</span><b class="klkv">${fDay(b)} · ${fDay(nul(b)||nul(d)?null:d-b)}</b>`;})()}),
    kc({l:'Hiệu quả thu nợ (CEI)',v:pc(ceiA),u:'',cls:nul(ceiA)?'n':ceiA<0.8?'r':ceiA<0.9?'y':'g',src:s4,sub:'kỳ '+labA(),chips:[chipA('So '+labBs(),ceiA*100,ceiB*100,v=>nd(v,1)+' đ%','up')],spk:sp(ts.cei)}),
    kc({l:'Tiền thu trong kỳ',v:fTy(cA),u:'tỷ đ',cls:cDn(dPct(cA,cB))==='r'?'r':'g',sub:'thu / doanh số '+pc(bA?cA/bA:null),chips:[chipP('So '+labBs(),cA,cB,'up')],spk:sp(ts.coll),foot:(A.t===X.dmax&&state.pm==='m')?(()=>{const F=fcAll(X.dmax);return `<span class="klkl">Dự báo cả tháng</span><b class="klkv">${fTy(F.fin)}</b>`;})():'',dr:DR('Dự báo thu tiền',()=>{go('fc');return null;})}),
    kc({l:'Doanh số ghi nợ',v:fTy(bA),u:'tỷ đ',cls:'n',sub:'gồm VAT · '+labA(),chips:[chipP('So '+labBs(),bA,bB,'up')].map(c=>Object.assign(c,{c:'n'})),spk:sp(ts.bill)}),
    kc({l:'Vượt hạn mức công nợ',v:String(hmo.n),u:'KH',cls:hmo.n2?'r':hmo.n?'y':'g',sub:'giá trị vượt '+fTy(hmo.v)+' tỷ',chips:[{l:'So '+labBs(),s:'So KG',v:(hmo.n-hmoB.n>=0?'▲ +':'▼ ')+(hmo.n-hmoB.n)+' KH',c:hmo.n>hmoB.n?'r':hmo.n<hmoB.n?'g':'n'}],foot:`<span class="klkl">Vượt mức phê duyệt 2</span><b class="klkv">${hmo.n2} KH</b>`,dr:DR('Hạn mức',()=>{go('hm');return null;})})
  ]),'',6,'bare'));
  /* thác nước dư nợ */
  const f=z.FA, oth=f[7]+f[8]+f[9];
  const st=[{n:'Dư thuần '+dSy(A.f-1),v:z.g0.net,tot:1,c:C.muted},
    {n:'Bán hàng',v:f[0],d:'Doanh thu bán hàng ghi nợ (chưa VAT)'},{n:'VAT đầu ra',v:f[1]},
    {n:'Bán khác & đầu tư',v:f[2]+f[3],d:'Bán khác (711) + bán đầu tư (221)'},{n:'Hàng trả lại',v:f[4]},{n:'Chiết khấu',v:f[5]},
    {n:'Thu tiền',v:f[6]},{n:'Bù trừ, chi trả & khác',v:oth,d:'Bù trừ công nợ + chi trả lại KH + điều chỉnh khác'},
    {n:'Dư thuần '+dSy(A.t),v:gA.net,tot:1,c:C.gold}].filter(s=>s.tot||Math.abs(s.v)>=1e6);
  out.push(panel('tq_wf','Biến động dư nợ thuần trong kỳ '+labA(),'tỷ đ · đỏ = làm tăng dư nợ, xanh = làm giảm',chWaterfall('c_tq_wf','h320',st,fTy1,{u:'tỷ đ'})+
    note(`Dư thuần ${fTy(z.g0.net)} → <b>${fTy(gA.net)} tỷ</b>. Doanh số ghi nợ ${fTy(bA)} tỷ, thu ${fTy(cA)} tỷ (thu/doanh số ${pc(bA?cA/bA:null)}); chiết khấu ${fTy(-f[5])} tỷ, bù trừ & khác ${sgV(oth)}.`,null,''),
    'Dư thuần = dư Nợ − dư Có. Các bước cộng đúng bằng chênh lệch số dư (kiểm tra tự động ở mục Kiểm soát).',3));
  /* xu hướng 24 tháng */
  const R=mRange(24), lab=R.map(mLab);
  out.push(panel('tq_tr','Dư nợ phải thu, quá hạn & DSO — 24 tháng','Cột: dư nợ phải thu và nợ quá hạn (tỷ đ) · Đường: DSO 3 tháng (ngày, trục phải)',
    chCombo('c_tq_tr','h320',lab,[{n:'Dư nợ phải thu',v:R.map(i=>ts.dr[i]),c:C.gold+'cc'},{n:'Quá hạn sau BL',v:R.map(i=>ts.ov[i]),c:C.bad+'cc'}],[{n:'DSO (ngày)',v:R.map(i=>ts.dso[i]),c:MCOL()[1],f:fDay}],{fl:fDay,ul:'ngày',band:pband(R[0])})+
    note(trendTxt(ts,R),null,''),'Dải vàng = kỳ phân tích, dải xám = kỳ so sánh.',3));
  /* cơ cấu tuổi nợ & theo kênh */
  const ac=AGECOL();
  out.push(panel('tq_age','Cơ cấu tuổi nợ tại '+dStr(A.t),'Theo tuổi hóa đơn (ngày chốt − ngày chứng từ), trước bảo lãnh',chDonut('c_tq_age','h280',X.BKN.map((n,i)=>({n,v:gA.b[i],c:ac[i]})).filter(r=>r.v>0),v=>fTy(v)+' tỷ')+ageNote(gA),'',2));
  const G=GRP('kenh',A.t,A).sort((a,b)=>kOrd(a.g)-kOrd(b.g)), GB={};GRP('kenh',B.t,B).forEach(o=>GB[o.g]=o);
  let h=`<div class="tw"><table><thead><tr><th>Kênh</th><th>Dư nợ<br>${dSy(A.t)}</th><th>Tỷ trọng</th><th>Δ so<br>${dSy(B.t)}</th><th>Quá hạn</th><th>% quá hạn</th><th>Thu kỳ</th><th>Thu / DS</th></tr></thead><tbody>`;
  G.forEach(o=>{const b=GB[o.g]||{dr:0};const bl=BILL(o.f),co=COLL(o.f);
    h+=`<tr class="clk" data-fk="${esc(o.g)}"><td><b>${esc(o.g)}</b></td><td><b>${fTy(o.dr)}</b></td><td>${pc(gA.dr?o.dr/gA.dr:null)}</td><td class="${cUp(o.dr-b.dr)}">${sgV(o.dr-b.dr)}</td><td class="${o.ov>0.5?'r':''}">${fTy(o.ov)}</td><td style="${heat1(o.open?o.ov/o.open:0,0.5)}">${pc(o.open?o.ov/o.open:null)}</td><td>${fTy(co)}</td><td>${pc(bl?co/bl:null)}</td></tr>`;});
  h+=`<tr class="sum"><td>Tổng</td><td>${fTy(gA.dr)}</td><td>100%</td><td>${sgV(gA.dr-gB.dr)}</td><td>${fTy(gA.ov)}</td><td>${pc(ovr)}</td><td>${fTy(cA)}</td><td>${pc(bA?cA/bA:null)}</td></tr>`;
  out.push(panel('tq_kn','Công nợ theo kênh','tỷ đ · bấm dòng để lọc theo kênh',h+'</tbody></table></div>','',4));
  out.push(insBox('tq','Nhận định điều hành',tqInsights(z,dsoA,dsoB,ceiA,hmo)));
  return out;
}
function trendTxt(ts,R){const a=R[0],b=R[R.length-1];const d=dPct(ts.dr[b],ts.dr[a]);
  const mx=R.reduce((p,i)=>ts.dr[i]>ts.dr[p]?i:p,R[0]),mn=R.reduce((p,i)=>ts.dr[i]<ts.dr[p]?i:p,R[0]);
  return `24 tháng: dư nợ ${arw(d)} (${fTy(ts.dr[a])} → <b>${fTy(ts.dr[b])} tỷ</b>); đỉnh ${mLab(mx)} ${fTy(ts.dr[mx])} tỷ, đáy ${mLab(mn)} ${fTy(ts.dr[mn])} tỷ. DSO ${fDay(ts.dso[a])} → <b>${fDay(ts.dso[b])} ngày</b>.`;}
function tqInsights(z,dsoA,dsoB,ceiA,hmo){
  const g=z.gA,o=[],ovr=g.open?g.ov/g.open:0;
  const top=GRP('cust',z.A.t,z.A).sort((a,b)=>b.dr-a.dr);const t10=top.slice(0,10).reduce((s,x)=>s+x.dr,0);
  o.push(`Dư nợ phải thu <b>${fTy(g.dr)} tỷ</b> (${fLab()}); 10 khách hàng lớn nhất chiếm <b>${pc(g.dr?t10/g.dr:null)}</b> — khách lớn nhất ${esc(cShort(top[0]?top[0].g:0))} ${fTy(top[0]?top[0].dr:0)} tỷ.`);
  o.push(`Quá hạn sau bảo lãnh <b>${fTy(g.ov)} tỷ (${pc(ovr)})</b>, trong đó quá hạn trên 90 ngày ${fTy(g.ov90)} tỷ. Bảo lãnh đang che ${fTy(g.blu)} tỷ dư nợ.`);
  if(g.cnt>0.5)o.push(`<b>${fTy(g.cnt)} tỷ (${pc(g.open?g.cnt/g.open:null)})</b> dư nợ thuộc nhóm <b>chưa có nguyên tắc hạn nợ (NT00)</b>${state.a0?` — tạm tính hạn 30 ngày thì ${fTy(g.cntOv)} tỷ đã quá hạn`:''}. Cần ban hành nguyên tắc hạn nợ cho kênh Thương mại / Không thường xuyên / Nợ cũ.`);
  if(!nul(dsoA)&&!nul(dsoB))o.push(`DSO ${fDay(dsoB)} → <b>${fDay(dsoA)} ngày</b> (${sgD(dsoA-dsoB)}). ${dsoA-dsoB>3?'Vòng quay chậm lại — kiểm tra kênh có DSO tăng ở mục Kênh & vùng.':'Vòng quay ổn định.'}`);
  {const ts=TS(),i=curM();if(!nul(ts.bp[i]))o.push(`DSO ${fDay(ts.dso[i])} ngày gồm ${fDay(ts.bp[i])} ngày theo điều khoản bán hàng (BPDSO) và <b>${fDay(ts.dso[i]-ts.bp[i])} ngày do nợ quá hạn (ADD)</b> — ${ts.dso[i]-ts.bp[i]>ts.bp[i]?'nợ quá hạn là nguyên nhân chính làm vòng quay chậm':'điều khoản bán hàng là phần chính của DSO'}.`);}
  if(!nul(ceiA))o.push(`CEI kỳ ${labA()}: <b>${pc(ceiA)}</b> — ${ceiA>=0.9?'thu tốt phần đến hạn':ceiA>=0.8?'thu chưa hết phần đến hạn':'thu chậm, phần đến hạn còn tồn nhiều'}.`);
  if(hmo.n)o.push(`<b>${hmo.n} khách hàng</b> vượt hạn mức (giá trị vượt ${fTy(hmo.v)} tỷ), ${hmo.n2} khách vượt cả mức phê duyệt 2 — cần chặn xuất hàng theo quy chế hạn mức.`);
  if(state.ly==='all'){const n=AG(z.SA,maskLy('ng'));o.push(`Lớp Ngoài HĐKD đang chiếm <b>${fTy(n.dr)} tỷ</b> dư nợ — xem mục Ngoài HĐKD & bất thường; khi đánh giá vòng quay bán hàng nên xem lớp HĐKD.`);}
  return o;
}
function drillGrp(key){
  const z=Z(),G=GRP(key,z.A.t,z.A).sort((a,b)=>b.dr-a.dr);
  let h=`<div class="tw"><table><thead><tr><th>${key==='vung'?'Vùng':'Kênh'}</th><th>Dư nợ</th><th>Quá hạn</th><th>% QH</th><th>≥ 180 ngày</th><th>Số KH nợ</th></tr></thead><tbody>`;
  G.forEach(o=>h+=`<tr><td><b>${esc(o.g)}</b></td><td>${fTy(o.dr)}</td><td>${fTy(o.ov)}</td><td>${pc(o.open?o.ov/o.open:null)}</td><td>${fTy(o.b180)}</td><td>${o.n}</td></tr>`);
  return h+'</tbody></table></div>';
}

/* ═════════════ 2 · KẾT LUẬN & CẢNH BÁO ═════════════ */
function alertCard(a){return `<div class="dqi ${a.lv}"><div class="dic ${a.lv}">${ic(a.lv==='r'?'alert':a.lv==='y'?'warn':'check')}</div><div class="bd"><b>${esc(a.grp)} · ${a.t}</b><p>${a.d}</p>${a.act?`<p class="mu" style="margin-top:3px">→ <b>Giải pháp:</b> ${a.act}${a.own?' · <b>'+esc(a.own)+'</b>':''}</p>`:''}${a.go?`<p style="margin-top:4px"><a class="lnk" href="javascript:void(0)" onclick="${a.go}">Xem chi tiết ›</a></p>`:''}</div></div>`;}
function secCB(){
  const z=Z(),out=[], al=ALERTS(), r=al.filter(a=>a.lv==='r'), y=al.filter(a=>a.lv==='y');
  out.push(hero2('cb',`<b>${al.length}</b> điểm cần xử lý tại ${dStr(z.A.t)} (${esc(fLab())}): <b>${r.length} đỏ</b> · ${y.length} vàng. Ngưỡng: % quá hạn > 10% (đỏ > 20%) · DSO tăng > 3 ngày (đỏ > 7) · khách quá hạn > 90 ngày từ 500 tr · vượt hạn mức · bảo lãnh hết hạn trong 30 ngày · thu giảm > 15% so kỳ so sánh · nợ ≥ 1 năm tuổi.`,[
    {l:'Cảnh báo đỏ',v:String(r.length),c:r.length?'r':'g'},{l:'Cảnh báo vàng',v:String(y.length),c:y.length?'y':'g'},{l:'Đầu mối liên quan',v:String(new Set(al.map(a=>a.own)).size)}]));
  /* kết luận tổng hợp */
  const g=z.gA, dsoA=DSOat(z.A.t), dsoB=DSOat(z.B.t);
  const con=[];
  con.push(`<b>Quy mô & xu hướng:</b> dư nợ phải thu ${fTy(g.dr)} tỷ, ${arw(dPct(g.dr,z.gB.dr))} so ${dStr(z.B.t)}; DSO ${fDay(dsoA)} ngày (${sgD(nul(dsoA)||nul(dsoB)?null:dsoA-dsoB)}).`);
  con.push(`<b>Chất lượng nợ:</b> quá hạn ${pc(g.open?g.ov/g.open:null)} dư nợ (${fTy(g.ov)} tỷ); nợ ≥ 180 ngày ${fTy(g.b180)} tỷ; dự phòng theo tuổi ${fTy(g.dp)} tỷ.`);
  con.push(`<b>Kiểm soát:</b> ${fTy(g.cnt)} tỷ chưa có nguyên tắc hạn nợ; ${r.length} cảnh báo đỏ cần chủ sở hữu xử lý trong tuần.`);
  out.push(panel('cb_kl','Kết luận','Tự sinh từ số liệu kỳ đang xem',`<div class="dql">${con.map(c=>`<div class="dqi"><div class="dic y">${ic('bulb')}</div><div class="bd"><p>${c}</p></div></div>`).join('')}</div>`,'',6));
  const grps={}; al.forEach(a=>(grps[a.grp]=grps[a.grp]||[]).push(a));
  Object.keys(grps).forEach((gk,i)=>out.push(panel('cb_'+i,gk,grps[gk].length+' điểm',`<div class="dql">${grps[gk].sort((a,b)=>(a.lv==='r'?0:1)-(b.lv==='r'?0:1)).map(alertCard).join('')}</div>`,'',Object.keys(grps).length===1?6:3)));
  if(!al.length)out.push(panel('cb_0','Không có cảnh báo','',`<div class="empty">Không có chỉ tiêu nào vượt ngưỡng trong kỳ đang xem.</div>`,'',6));
  return out;
}

/* ═════════════ 3 · XU HƯỚNG ═════════════ */
function secXH(){
  const z=Z(),out=[],ts=TS(),n=X.nM,all=Array.from({length:n},(_,i)=>i),lab=all.map(mLab),m=curM();
  const ys=Array.from(new Set(X.MS.map(ym=>Math.floor(ym/100))));
  /* dư nợ theo năm (12 tháng) */
  const cols=MCOL();
  const byY=k=>ys.map((y,j)=>({n:String(y),v:Array.from({length:12},(_,q)=>{const i=X.MS.indexOf(y*100+q+1);return i>=0&&i<=m?ts[k][i]:null;}),c:j===ys.length-1?C.gold:[cols[1],cols[3],cols[4],cols[6]][j%4],w:j===ys.length-1?3:1.8,dash:j<ys.length-2}));
  const yA=ts.dr[m], iy=X.MS.indexOf(X.MS[m]-100), yB=iy>=0?ts.dr[iy]:null;
  out.push(hero2('xh',`Dư nợ phải thu cuối ${mLab(m)}: <b>${fTy(yA)} tỷ</b>, ${iy>=0?arw(dPct(yA,yB))+' so cùng kỳ ('+fTy(yB)+' tỷ)':''}. DSO 3 tháng <b>${fDay(ts.dso[m])} ngày</b> (cùng kỳ ${fDay(iy>=0?ts.dso[iy]:null)}). Bình quân 12 tháng: thu ${fTy(avgL(ts.coll,m,12))} tỷ/tháng, doanh số ghi nợ ${fTy(avgL(ts.bill,m,12))} tỷ/tháng.`,[
    {l:'Dư nợ cuối kỳ',v:fTy(yA),s:'tỷ · so CK '+arw(dPct(yA,yB)),c:cUp(dPct(yA,yB))},{l:'DSO',v:fDay(ts.dso[m]),s:'ngày'},
    {l:'DSO BQ 12 tháng',v:fDay(avgL(ts.dso,m,12)),s:'ngày'},{l:'CEI BQ 12 tháng',v:pc(avgL(ts.cei,m,12))}]));
  out.push(panel('xh_y','Dư nợ phải thu cuối tháng — so sánh theo năm','tỷ đ · đường vàng = năm hiện tại · thấy rõ mùa vụ (sau Tết dư nợ giảm, cuối quý III tăng)',
    chLines('c_xh_y','h300',['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'],byY('dr'),fTy1,{u:'tỷ đ'})+yearNote(ts,m,'dr'),'',3));
  out.push(panel('xh_d','DSO 3 tháng — so sánh theo năm','ngày',chLines('c_xh_d','h300',['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'],byY('dso'),fDay,{u:'ngày'})+yearNote(ts,m,'dso'),'',3));
  out.push(panel('xh_bc',`Doanh số ghi nợ & tiền thu theo tháng ${mLab(0)} – ${mLab(n-1)}`,'Cột: doanh số ghi nợ và tiền thu (tỷ đ) · Đường: thu / doanh số (%, trục phải)',
    chCombo('c_xh_bc','h320',lab,[{n:'Doanh số ghi nợ',v:ts.bill,c:C.muted+'aa'},{n:'Tiền thu',v:ts.coll,c:C.gold+'dd'}],[{n:'Thu / doanh số',v:all.map(i=>ts.bill[i]?ts.coll[i]/ts.bill[i]:null),c:MCOL()[1],f:v=>pc(v,0)}],{fl:v=>pc(v,0),band:pband(0)})+
    note(`Thu / doanh số 12 tháng gần nhất: <b>${pc(sumL(ts.coll,m,12)/sumL(ts.bill,m,12))}</b> (12 tháng trước đó ${pc(sumL(ts.coll,m-12,12)/sumL(ts.bill,m-12,12))}). Tháng có thu > doanh số kéo dư nợ giảm và ngược lại.${state.ly!=='hd'?' Lưu ý: lớp đang xem có khoản Ngoài HĐKD (bán đầu tư 150 tỷ T6/2026…) làm méo tỷ lệ.':''}`,null,''),'',6));
  out.push(panel('xh_dso','DSO 3 tháng & CEI theo tháng','DSO (ngày, trục trái) · CEI (%, trục phải)',
    chCombo('c_xh_dso','h300',lab,[{n:'DSO (ngày)',v:ts.dso,c:C.gold+'bb',f:fDay}],[{n:'CEI',v:ts.cei,c:MCOL()[1],f:v=>pc(v,0)}],{fb:fDay,ub:'ngày',fl:v=>pc(v,0),y1min:0,band:pband(0)})+dsoNote(ts,m),'',6));
  /* bản đồ nhiệt năm × tháng */
  const mk=state.xhm||'dso';const MET={dso:['DSO (ngày)',ts.dso,fDay,true],dr:['Dư nợ (tỷ)',ts.dr,fTy1,true],coll:['Tiền thu (tỷ)',ts.coll,fTy1,false],bill:['Doanh số (tỷ)',ts.bill,fTy1,false],ov:['Quá hạn (tỷ)',ts.ov,fTy1,true]};
  const me=MET[mk]||MET.dso, vals=me[1].filter((v,i)=>!nul(v)&&i<=m), mx=Math.max.apply(null,vals), mn=Math.min.apply(null,vals);
  let h=seg('xhm',Object.keys(MET).map(k=>[k,MET[k][0]]),mk)+`<div class="tw"><table class="heat"><thead><tr><th>Năm</th>${Array.from({length:12},(_,q)=>`<th>T${q+1}</th>`).join('')}<th>BQ</th></tr></thead><tbody>`;
  ys.forEach(y=>{const r=Array.from({length:12},(_,q)=>{const i=X.MS.indexOf(y*100+q+1);return i>=0&&i<=m?me[1][i]:null;});const f=r.filter(v=>!nul(v));
    h+=`<tr><td><b>${y}</b></td>${r.map(v=>{const t=nul(v)?null:(v-mn)/((mx-mn)||1);const bad=me[3]?t:1-t;return `<td style="${nul(v)?'':'background:'+(bad>0.5?C.bad:C.ok)+Math.round(20+Math.abs(bad-0.5)*2*150).toString(16).padStart(2,'0')}">${me[2](v)}</td>`;}).join('')}<td><b>${f.length?me[2](f.reduce((a,b)=>a+b,0)/f.length):'–'}</b></td></tr>`;});
  out.push(panel('xh_hm','Bản đồ nhiệt mùa vụ: năm × tháng','Đỏ = bất lợi (dư nợ / DSO / quá hạn cao, thu / doanh số thấp) · xanh = thuận lợi',h+'</tbody></table></div>'+seasonNote(me,ys,m),'',6));
  /* bảng so cùng kỳ 12 tháng */
  const R=mRange(12);let t=`<div class="tw"><table><thead><tr><th>Tháng</th><th>Dư nợ</th><th>Cùng kỳ</th><th>Δ%</th><th>Doanh số</th><th>Thu</th><th>Thu/DS</th><th>DSO</th><th>DSO CK</th><th>CEI</th><th>% quá hạn</th></tr></thead><tbody>`;
  R.slice().reverse().forEach(i=>{const j=X.MS.indexOf(X.MS[i]-100);const d=j>=0?dPct(ts.dr[i],ts.dr[j]):null;
    t+=`<tr><td><b>${mLab(i)}</b></td><td><b>${fTy(ts.dr[i])}</b></td><td class="mu">${j>=0?fTy(ts.dr[j]):'–'}</td><td class="${cUp(d)}">${arw(d)}</td><td>${fTy(ts.bill[i])}</td><td>${fTy(ts.coll[i])}</td><td>${pc(ts.bill[i]?ts.coll[i]/ts.bill[i]:null,0)}</td><td><b>${fDay(ts.dso[i])}</b></td><td class="mu">${j>=0?fDay(ts.dso[j]):'–'}</td><td>${pc(ts.cei[i],0)}</td><td style="${heat1(ts.open[i]?ts.ov[i]/ts.open[i]:0,0.5)}">${pc(ts.open[i]?ts.ov[i]/ts.open[i]:null)}</td></tr>`;});
  out.push(panel('xh_t','So sánh 12 tháng gần nhất với cùng kỳ','tỷ đ · ngày',t+'</tbody></table></div>'+yoyNote(ts,R),'',6));
  out.push(insBox('xh','Nhận định xu hướng',xhInsights(ts,m)));
  return out;
}
const avgL=(a,m,k)=>{const v=[];for(let i=Math.max(0,m-k+1);i<=m;i++)if(!nul(a[i]))v.push(a[i]);return v.length?v.reduce((x,y)=>x+y,0)/v.length:null;};
const sumL=(a,m,k)=>{let s=0;for(let i=Math.max(0,m-k+1);i<=m;i++)if(i>=0&&!nul(a[i]))s+=a[i];return s;};
function xhInsights(ts,m){const o=[];const iy=X.MS.indexOf(X.MS[m]-100);
  if(iy>=0)o.push(`So cùng kỳ: dư nợ ${arw(dPct(ts.dr[m],ts.dr[iy]))}, DSO ${sgD(ts.dso[m]-ts.dso[iy])} ngày, thu/doanh số 3 tháng ${pc(sumL(ts.coll,m,3)/sumL(ts.bill,m,3))} so ${pc(sumL(ts.coll,iy,3)/sumL(ts.bill,iy,3))}.`);
  const d12=avgL(ts.dso,m,12),d12b=avgL(ts.dso,m-12,12);if(!nul(d12)&&!nul(d12b))o.push(`DSO bình quân 12 tháng ${fDay(d12)} ngày so ${fDay(d12b)} ngày của 12 tháng trước — ${d12>d12b+1?'vòng quay công nợ đang chậm lại':d12<d12b-1?'vòng quay công nợ cải thiện':'vòng quay ổn định'}.`);
  const t2=X.MS.map((ym,i)=>ym%100===2&&i<=m&&i>=6?i:-1).filter(i=>i>=0);if(t2.length)o.push(`Mùa vụ: tháng 2 (Tết) doanh số ghi nợ chỉ bằng ${pc(t2.map(i=>ts.bill[i]/(avgL(ts.bill,i-1,6)||1)).reduce((a,b)=>a+b,0)/t2.length,0)} bình quân 6 tháng trước — so sánh tháng 2 nên dùng cùng kỳ năm trước.`);
  o.push('DSO tính trên doanh số ghi nợ gồm VAT; tháng chưa trọn (tháng hiện tại) tính số ngày đến ngày chốt nên vẫn so sánh được.');
  return o;}

/* ═════════════ 4 · TUỔI NỢ & CHẤT LƯỢNG ═════════════ */
function secTN(){
  const z=Z(),out=[],ts=TS(),m=curM(),R=mRange(24),lab=R.map(mLab),g=z.gA,gB=z.gB,ac=AGECOL();
  const v=state.tnv||'gt';
  const p90=x=>x.open?(x.b[4]+x.b[5]+x.b[6]+x.b[7]+x.b[8])/x.open:null;
  out.push(hero2('tn',`Tại ${dStr(z.A.t)}: nợ dưới 30 ngày tuổi <b>${pc(g.open?(g.b[0]+g.b[1])/g.open:null)}</b>, từ 90 ngày trở lên <b>${pc(p90(g))}</b> (${fTy(g.b[4]+g.b[5]+g.b[6]+g.b[7]+g.b[8])} tỷ), ≥ 1 năm ${fTy(g.b[6]+g.b[7]+g.b[8])} tỷ. Dự phòng theo tuổi nợ (30/50/70/100%) <b>${fTy(g.dp)} tỷ</b> (${arw(dPct(g.dp,gB.dp))} so ${dStr(z.B.t)}).`,[
    {l:'< 30 ngày',v:fTy(g.b[0]+g.b[1]),s:'tỷ đ'},{l:'≥ 90 ngày',v:fTy(g.b[4]+g.b[5]+g.b[6]+g.b[7]+g.b[8]),s:pc(p90(g)),c:'y'},{l:'≥ 1 năm',v:fTy(g.b[6]+g.b[7]+g.b[8]),s:'tỷ đ',c:(g.b[6]+g.b[7]+g.b[8])>0.5e9?'r':''},{l:'Dự phòng',v:fTy(g.dp),s:'tỷ đ · '+arw(dPct(g.dp,gB.dp)),c:cUp(dPct(g.dp,gB.dp))}]));
  const ser=X.BKN.map((n,k)=>({n,c:ac[k],v:R.map(i=>v==='pct'?(ts.open[i]?ts.b[i][k]/ts.open[i]*100:null):ts.b[i][k])}));
  out.push(panel('tn_st','Cơ cấu tuổi nợ cuối tháng — 24 tháng',v==='pct'?'% dư nợ theo tuổi hóa đơn':'tỷ đ theo tuổi hóa đơn (ngày chốt − ngày chứng từ)',
    seg('tnv',[['gt','Giá trị'],['pct','Tỷ trọng %']],v)+chStack('c_tn_st','h340',lab,ser,v==='pct'?(x=>nd(x,0)+'%'):fTy1,{band:pband(R[0]),max:v==='pct'?100:undefined,u:v==='pct'?'':'tỷ đ',line:{label:'Dự phòng',data:R.map(i=>v==='pct'?(ts.open[i]?ts.dp[i]/ts.open[i]*100:null):ts.dp[i]),borderColor:'#fff',backgroundColor:'#fff',borderDash:[4,3]}})+
    note(`Tỷ trọng nợ ≥ 90 ngày: ${pc(R.length?(()=>{const i=R[0];const b=ts.b[i];return ts.open[i]?(b[4]+b[5]+b[6]+b[7]+b[8])/ts.open[i]:null;})():null)} (${mLab(R[0])}) → <b>${pc(p90(g))}</b> (${dStr(z.A.t)}). Đường trắng = dự phòng theo tuổi.`,null,''),'',4));
  out.push(panel('tn_b','Tuổi nợ tại ngày chốt',dStr(z.A.t)+' · so '+dStr(z.B.t),chBarH('c_tn_b','h340',X.BKN.map((n,k)=>({n,v:g.b[k],c:ac[k]})),fTy1,{lab:dStr(z.A.t),u:'tỷ đ',ds2:{label:dStr(z.B.t),data:X.BKN.map((_,k)=>gB.b[k]),backgroundColor:C.muted+'77'}})+bktNote(g,gB),'',2));
  /* ma trận trượt nhóm */
  const RR=mRange(13).slice(0,-1).filter(i=>i+1<X.nM);
  const rows=RR.map(i=>({i,r:ROLL(i)})).filter(o=>o.r);
  let h=`<div class="tw"><table class="heat"><thead><tr><th>Từ cuối tháng</th>${['0–30','31–60','61–90','91–180','181–365','> 365'].map(x=>`<th>${x} ngày</th>`).join('')}<th>Tổng</th></tr></thead><tbody>`;
  const avg=new Array(6).fill(0),avn=new Array(6).fill(0);
  rows.forEach(o=>{const r=o.r;let fr=0,st=0;h+=`<tr><td><b>${mLab(o.i)} → ${mLab(o.i+1)}</b></td>`+[0,1,2,3,4,5].map(k=>{fr+=r.fr[k];st+=r.st[k];const p=r.fr[k]>1e6?r.st[k]/r.fr[k]:null;if(!nul(p)){avg[k]+=p;avn[k]++;}return `<td style="${heat1(p,1)}" title="${fTy(r.st[k])} / ${fTy(r.fr[k])} tỷ">${pc(p,0)}</td>`;}).join('')+`<td><b>${pc(fr?st/fr:null,0)}</b></td></tr>`;});
  h+=`<tr class="sum"><td>Bình quân</td>${avg.map((a,k)=>`<td>${pc(avn[k]?a/avn[k]:null,0)}</td>`).join('')}<td></td></tr>`;
  out.push(panel('tn_roll','Tỷ lệ trượt nhóm: % nợ còn chưa thu sau 1 tháng','Mỗi ô = phần dư nợ của nhóm tuổi tại cuối tháng vẫn chưa được thanh toán ở cuối tháng sau (FIFO). Càng cao càng xấu — nhóm 61–90 ngày > 70% là dấu hiệu nợ khó đòi.',h+'</tbody></table></div>'+
    note(`Nợ 0–30 ngày: bình quân ${pc(avn[0]?avg[0]/avn[0]:null,0)} còn tồn sau 1 tháng (bình thường vì hạn thanh toán ~ 40 ngày). Nhóm 91–180 ngày: <b>${pc(avn[3]?avg[3]/avn[3]:null,0)}</b> còn tồn — ${avn[3]&&avg[3]/avn[3]>0.8?'nợ đã quá 3 tháng gần như không tự thu được, cần biện pháp thu hồi':'vẫn thu được một phần'}.`,null,''),'',6));
  /* theo vùng */
  const G=GRP('vung',z.A.t,z.A).filter(o=>o.open>0.5).sort((a,b)=>vOrd(a.g)-vOrd(b.g));const mx=Math.max.apply(null,G.map(o=>Math.max.apply(null,o.b)).concat([1]));
  let t=`<div class="tw"><table class="heat"><thead><tr><th>Vùng</th>${X.BKN.map(n=>`<th>${n}</th>`).join('')}<th>Tổng</th><th>% ≥ 90 ngày</th><th>Dự phòng</th></tr></thead><tbody>`;
  G.forEach(o=>{const p=(o.b[4]+o.b[5]+o.b[6]+o.b[7]+o.b[8])/o.open;t+=`<tr class="clk" data-fv="${esc(o.g)}"><td><b>${esc(o.g)}</b></td>${o.b.map((x,k)=>`<td style="${k>=4?heat1(x,mx):''}">${x>0.5?fTy(x):'·'}</td>`).join('')}<td><b>${fTy(o.open)}</b></td><td style="${heat1(p,0.6)}">${pc(p)}</td><td>${fTy(o.dp)}</td></tr>`;});
  t+=`<tr class="sum"><td>Tổng</td>${g.b.map(x=>`<td>${fTy(x)}</td>`).join('')}<td>${fTy(g.open)}</td><td>${pc(p90(g))}</td><td>${fTy(g.dp)}</td></tr>`;
  out.push(panel('tn_v','Tuổi nợ theo vùng tại '+dStr(z.A.t),'tỷ đ · bấm dòng để lọc vùng',t+'</tbody></table></div>'+grpTopNote(G.map(o=>Object.assign({},o,{x:o.b[4]+o.b[5]+o.b[6]+o.b[7]+o.b[8]})),'x','vùng'),'',6));
  /* khách hàng nợ lâu */
  const C2=GRP('cust',z.A.t,z.A).filter(o=>o.b180>0.5).sort((a,b)=>b.b180-a.b180).slice(0,15);
  let c=`<div class="tw"><table><thead><tr><th>Khách hàng</th><th>Vùng</th><th>Dư nợ</th><th>≥ 180 ngày</th><th>≥ 1 năm</th><th>Tuổi lớn nhất</th><th>Dự phòng</th><th>Lần thu cuối</th></tr></thead><tbody>`;
  C2.forEach(o=>{const i=o.g;const lp=lastPayAt(i,z.A.t);c+=`<tr class="clk" data-kh="${i}"><td><b>${esc(cShort(i))}</b><div class="mu">${esc(X.P.cid[i])}</div></td><td>${esc(X.vung[i])}</td><td>${fTy(o.dr)}</td><td class="r"><b>${fTy(o.b180)}</b></td><td>${fTy(o.b[6]+o.b[7]+o.b[8])}</td><td>${fDay(z.SA.maxAge[i])} ngày</td><td>${fTy(o.dp)}</td><td class="${lp&&z.A.t-lp>90?'r':''}">${lp?dStr(lp):'—'}</td></tr>`;});
  out.push(panel('tn_kh','Khách hàng có nợ ≥ 180 ngày tuổi','Sắp theo giá trị ≥ 180 ngày · bấm để xem hồ sơ',c+'</tbody></table></div>','',6));
  out.push(insBox('tn','Nhận định chất lượng nợ',[
    `Dự phòng theo tuổi nợ tại ${dStr(z.A.t)}: <b>${fTy(g.dp)} tỷ</b> — tỷ lệ áp theo cấu hình file Excel (≥ 180 ngày 30%, ≥ 1 năm 50%, ≥ 2 năm 70%, ≥ 3 năm 100%), tính theo tuổi hóa đơn, chưa trừ bảo lãnh.`,
    `${C2.length} khách hàng có nợ ≥ 180 ngày; lớn nhất ${C2[0]?esc(cShort(C2[0].g))+' '+fTy(C2[0].b180)+' tỷ':'—'}.`,
    'Khuyến nghị: đối chiếu & xác nhận công nợ bằng văn bản với toàn bộ khách có nợ ≥ 180 ngày trước kỳ khóa sổ quý; chuyển hồ sơ pháp chế với khoản ≥ 1 năm không có thanh toán 90 ngày.']));
  return out;
}

/* ═════════════ 5 · QUÁ HẠN ═════════════ */
function secQH(){
  const z=Z(),out=[],ts=TS(),g=z.gA,gB=z.gB,R=mRange(24),lab=R.map(mLab),qc=QCOL();
  const ovr=g.open?g.ov/g.open:null;
  out.push(hero2('qh',`Nợ quá hạn sau bảo lãnh <b>${fTy(g.ov)} tỷ = ${pc(ovr)}</b> dư nợ (${g.nOv} khách). Theo đúng file Excel (không xét NT00): ${fTy(g.qh)} tỷ; nhóm chưa có nguyên tắc ${fTy(g.cnt)} tỷ${state.a0?`, tạm tính hạn 30 ngày thì quá hạn ${fTy(g.cntOv)} tỷ`:''}. Quá hạn trên 90 ngày <b>${fTy(g.ov90)} tỷ</b>.`,[
    {l:'Quá hạn sau BL',v:fTy(g.ov),s:pc(ovr),c:ovr>0.2?'r':ovr>0.1?'y':'g'},{l:'Quá hạn > 90 ngày',v:fTy(g.ov90),s:'tỷ đ',c:'r'},{l:'Trong hạn',v:fTy(g.inT),s:'tỷ đ',c:'g'},{l:'Bảo lãnh đang che',v:fTy(g.blu),s:'tỷ đ'}]));
  out.push(panel('qh_mode','','',`<div class="perrow"><span>Nợ chưa có nguyên tắc hạn nợ (NT00):</span>${seg('a0',[[1,'Tạm tính hạn 30 ngày (đã chốt)'],[0,'Không xét quá hạn (đúng file Excel)']],state.a0)}</div>`,'',6,'bare'));
  /* theo nguyên tắc */
  const NG=GRP('nt',z.A.t,z.A).sort((a,b)=>a.g<b.g?-1:1);
  let h=`<div class="tw"><table><thead><tr><th>Mã</th><th>Nguyên tắc</th><th>Cách xét hạn</th><th>Số KH nợ</th><th>Dư nợ (gộp)</th><th>BL trừ</th><th>Trong hạn</th><th>Quá hạn</th><th>% QH</th><th>QH > 90 ngày</th></tr></thead><tbody>`;
  NG.forEach(o=>{const r=X.NT[o.g]||{};const how=o.g==='NT00'?(state.a0?'Tạm tính: ngày CT + 30 ngày':'Không xét'):(r.how==='Theo hạn'?(r.moc==='Cuối tháng'?'Cuối tháng + '+r.days+(r.noi&&X.noiOn?' (+'+r.noi+' nới)':''):'Ngày CT + '+r.days)+' ngày':r.how+(r.lim?' '+fTy(r.lim)+' tỷ':''));
    const inT=o.g==='NT00'?o.cnt-(state.a0?o.ov:0):o.inT;
    h+=`<tr><td><b>${esc(o.g)}</b></td><td>${esc(r.n||'')}</td><td class="tl mu">${esc(how)}</td><td>${o.n}</td><td>${fTy(o.open)}</td><td>${fTy(o.blu)}</td><td>${fTy(inT)}</td><td class="${o.ov>0.5?'r':''}"><b>${fTy(o.ov)}</b></td><td style="${heat1(o.open?o.ov/o.open:0,0.6)}">${pc(o.open?o.ov/o.open:null)}</td><td>${fTy(o.ov90)}</td></tr>`;});
  out.push(panel('qh_nt','Quá hạn theo nguyên tắc hạn nợ','Nguồn: IN_Thời hạn công nợ (bảng II–IV) · tỷ đ',h+'</tbody></table></div>'+grpTopNote(NG,'ov','nguyên tắc'),'',6));
  /* theo số ngày quá hạn — xu hướng */
  const ser=X.QBN.map((n,k)=>({n,c:qc[k],v:R.map(i=>{const S=X.SN[i];const mk=MASK();let s=0;for(let j=0;j<X.nC;j++)if(mk[j])s+=S.qb[k][j];return s;})}));
  out.push(panel('qh_tr','Nợ quá hạn theo số ngày quá hạn — 24 tháng','tỷ đ (sau bảo lãnh) · đường = % quá hạn trên dư nợ',
    chStack('c_qh_tr','h320',lab,ser,fTy1,{band:pband(R[0]),u:'tỷ đ',line:{label:'% quá hạn',data:R.map(i=>ts.open[i]?ts.ov[i]/ts.open[i]*100:null),yAxisID:'y1',ax:'y1',f:v=>nd(v,0)+'%',u:''}})+ovTrendNote(ts,R),'',4));
  out.push(panel('qh_b','Quá hạn theo số ngày tại '+dStr(z.A.t),'tỷ đ',chDonut('c_qh_b','h300',X.QBN.map((n,k)=>({n,v:g.qb[k],c:qc[k]})).filter(r=>r.v>0),v=>fTy(v)+' tỷ')+qbNote(g),'',2));
  /* theo vùng */
  const G=GRP('vung',z.A.t,z.A).filter(o=>o.open>0.5).sort((a,b)=>b.ov-a.ov);
  out.push(panel('qh_v','Quá hạn theo vùng','tỷ đ · nhãn = % quá hạn',chBarH('c_qh_v','h340',G.map(o=>({n:o.g,v:o.ov,c:(o.open&&o.ov/o.open>0.2)?C.bad:C.warn,d:'% quá hạn '+pc(o.open?o.ov/o.open:null)+' · '+o.nOv+' KH'})),fTy1,{lab:'Quá hạn',u:'tỷ đ'})+grpTopNote(G,'ov','vùng'),'',2));
  /* top khách */
  const K=GRP('cust',z.A.t,z.A).filter(o=>o.ov>0.5).sort((a,b)=>b.ov-a.ov);
  let c=tsearch(K.length,20)+`<div class="tw"><table class="lim"><thead><tr><th>Khách hàng</th><th>Vùng</th><th>NT</th><th>Dư nợ</th><th>Quá hạn</th><th>Quá hạn > 90 ngày</th><th>Số ngày QH lớn nhất</th><th>Bảo lãnh</th><th>Hạn mức</th><th>Lần thu cuối</th></tr></thead><tbody>`;
  K.forEach((o,ix)=>{const i=o.g,lp=lastPayAt(i,z.A.t);c+=`<tr class="clk${ix>=20?' xtra':''}" data-kh="${i}"><td><b>${esc(cShort(i))}</b><div class="mu">${esc(X.P.cid[i])}</div></td><td>${esc(X.vung[i])}</td><td>${esc(X.nt[i])}</td><td>${fTy(o.dr)}</td><td class="r"><b>${fTy(o.ov)}</b></td><td>${fTy(o.ov90)}</td><td style="${heat1(o.maxQ,365)}">${fDay(o.maxQ)}</td><td>${fTy(z.SA.bl[i])}</td><td>${X.hasHM[i]?fTy(X.HM[i]):'—'}</td><td class="${lp&&z.A.t-lp>60?'r':''}">${lp?dStr(lp):'—'}</td></tr>`;});
  out.push(panel('qh_kh','Khách hàng quá hạn','Sắp theo giá trị quá hạn · bấm để xem hồ sơ & hóa đơn',c+'</tbody></table></div>','',4));
  /* NT00 */
  const N0=GRP('vung',z.A.t,z.A).filter(o=>o.cnt>0.5).sort((a,b)=>b.cnt-a.cnt);
  let n0=`<div class="tw"><table><thead><tr><th>Vùng (NT00)</th><th>Dư nợ chưa có NT</th><th>Quá 30 ngày</th><th>Số KH</th></tr></thead><tbody>`;
  N0.forEach(o=>n0+=`<tr class="clk" data-fv="${esc(o.g)}"><td><b>${esc(o.g)}</b></td><td>${fTy(o.cnt)}</td><td class="r">${fTy(state.a0?o.ov:0)}</td><td>${o.n}</td></tr>`);
  out.push(panel('qh_n0','Nợ chưa có nguyên tắc hạn nợ (NT00)',`${fTy(g.cnt)} tỷ = ${pc(g.open?g.cnt/g.open:null)} dư nợ — không xác định được quá hạn`,n0+'</tbody></table></div>'+
    note('Giải pháp: Phòng TCKT trình Ban TGĐ bổ sung nguyên tắc hạn nợ cho kênh <b>6. Thương mại</b>, <b>Không thường xuyên</b>, <b>Nợ cũ</b> vào sheet IN_Thời hạn công nợ (bảng III) hoặc theo từng hợp đồng (bảng IV).',null,''),'',2));
  out.push(insBox('qh','Nhận định quá hạn',[
    `Top 5 khách quá hạn chiếm ${pc(g.ov?K.slice(0,5).reduce((s,o)=>s+o.ov,0)/g.ov:null)} tổng quá hạn: ${K.slice(0,5).map(o=>esc(cShort(o.g))+' '+fTy(o.ov)).join(' · ')} tỷ.`,
    `Bảo lãnh ngân hàng đang che ${fTy(g.blu)} tỷ dư nợ (phân bổ vào hóa đơn cũ nhất trước) — khoản che bởi bảo lãnh không tính quá hạn.`,
    'Quy tắc NT04 (NT Export): chỉ phần dư nợ vượt 2 tỷ là quá hạn, phân bổ vào chứng từ mới nhất; NT05 (Chiencheng, LC) luôn trong hạn.']));
  return out;
}

/* ═════════════ 6 · THU TIỀN ═════════════ */
const WD=['CN','T2','T3','T4','T5','T6','T7'];
function collDaily(f,t,mask){mask=mask||MASK();const Lx=LL(),n=Lx.k.length,o={};let lo=0,hi=n;while(lo<hi){const q=(lo+hi)>>1;if(Lx.d[q]<f)lo=q+1;else hi=q;}
  for(let j=lo;j<n&&Lx.d[j]<=t;j++){if(Lx.t[j]!==6||!mask[Lx.k[j]])continue;o[Lx.d[j]]=(o[Lx.d[j]]||0)-Lx.a[j];}return o;}
function collBank(f,t,mask){mask=mask||MASK();const Lx=LL(),n=Lx.k.length,o={};let lo=0,hi=n;while(lo<hi){const q=(lo+hi)>>1;if(Lx.d[q]<f)lo=q+1;else hi=q;}
  for(let j=lo;j<n&&Lx.d[j]<=t;j++){if(Lx.t[j]!==6||!mask[Lx.k[j]])continue;const b=Lx.b[j]>=0?X.P.dic.bank[Lx.b[j]]:'(Không rõ)';o[b]=(o[b]||0)-Lx.a[j];}return o;}
function secTT(){
  const z=Z(),out=[],A=z.A,B=z.B,ts=TS(),m=curM(),mask=MASK();
  const cA=COLL(z.FA),cB=COLL(z.FB),bA=BILL(z.FA),bB=BILL(z.FB);
  const dA=collDaily(A.f,A.t),dB=collDaily(B.f,B.t);
  const wdays=o=>Object.keys(o).filter(d=>o[d]>0.5).length;
  const r12c=sumL(ts.coll,m,12), r12b=sumL(ts.bill,m,12), r12r=(()=>{let c=0,d=0;for(let i=Math.max(0,m-11);i<=m;i++){if(!nul(ts.rate[i])){c+=ts.coll[i];d+=ts.coll[i]/ts.rate[i];}}return d?c/d:null;})();
  out.push(hero2('tt',`Tiền thu kỳ ${labA()}: <b>${fTy(cA)} tỷ</b> (${arw(dPct(cA,cB))} so ${labB()}: ${fTy(cB)} tỷ) trong ${wdays(dA)} ngày có thu — bình quân <b>${fTy(wdays(dA)?cA/wdays(dA):null)} tỷ/ngày</b>. Thu / doanh số ghi nợ ${pc(bA?cA/bA:null)} (kỳ so sánh ${pc(bB?cB/bB:null)}). 12 tháng: thu ${fTy(r12c)} tỷ, tỷ lệ thu / phát sinh ${pc(r12r)}.`,[
    {l:'Tiền thu kỳ',v:fTy(cA),s:'tỷ · '+arw(dPct(cA,cB)),c:cDn(dPct(cA,cB))},{l:'BQ / ngày có thu',v:fTy(wdays(dA)?cA/wdays(dA):null),s:'tỷ đ'},
    {l:'Thu / doanh số',v:pc(bA?cA/bA:null),s:'so '+pc(bB?cB/bB:null)},{l:'Tỷ lệ thu 12 tháng',v:pc(r12r),s:'thu ÷ (phát sinh thuần − thu)'}]));
  /* lũy kế theo ngày trong kỳ, so kỳ B */
  const dayA=[],dayB=[];for(let d=A.f;d<=A.t;d++)dayA.push(d);for(let d=B.f;d<=B.t;d++)dayB.push(d);
  const n=Math.max(dayA.length,dayB.length);let ca=0,cb=0;const cumA=[],cumB=[],bar=[],labs=[];
  for(let k=0;k<n;k++){const a=dayA[k],b=dayB[k];if(a!==undefined){ca+=dA[a]||0;cumA.push(ca);bar.push(dA[a]||0);}else{cumA.push(null);bar.push(null);}if(b!==undefined){cb+=dB[b]||0;cumB.push(cb);}else cumB.push(null);
    labs.push(a!==undefined?(n>62?dS(a):dS(a)):('N'+(k+1)));}
  out.push(panel('tt_cum','Tiền thu lũy kế theo ngày — '+labA()+' so '+labB(),'Cột: thu từng ngày (trục trái) · Đường: lũy kế (trục phải) · cùng số thứ tự ngày trong kỳ',
    chCombo('c_tt_cum','h320',labs,[{n:'Thu trong ngày',v:bar,c:C.gold+'aa'}],[{n:'Lũy kế '+labA(),v:cumA,c:C.gold},{n:'Lũy kế '+labB(),v:cumB,c:C.muted,dash:true}],{})+
    note(`Đến ngày thứ ${dayA.length} của kỳ: ${fTy(ca)} tỷ so ${fTy(cumB[dayA.length-1])} tỷ cùng thời điểm kỳ so sánh (${arw(dPct(ca,cumB[dayA.length-1]))}).`,null,''),'',4));
  /* hồ sơ thứ trong tuần (6 tháng) */
  const f6=AR.ymStart(AR.ymAdd(X.MS[m],-5)),d6=collDaily(f6,A.t);const wsum=new Array(7).fill(0),wcnt=new Array(7).fill(0);
  for(let d=f6;d<=A.t;d++){const w=AR.toD(d).getUTCDay();wsum[w]+=d6[d]||0;wcnt[w]++;}
  const wo=[1,2,3,4,5,6,0];
  out.push(panel('tt_wd','Thu bình quân theo thứ trong tuần','6 tháng gần nhất · tỷ đ/ngày',chBarH('c_tt_wd','h320',wo.map(w=>({n:WD[w],v:wcnt[w]?wsum[w]/wcnt[w]:0,c:C.gold})),fTy1,{lab:'BQ/ngày',u:'tỷ đ'})+wdNote(wo,wsum,wcnt),'',2));
  /* lịch nhiệt 6 tháng */
  const cN=+(state.calN||3),fN=AR.ymStart(AR.ymAdd(AR.ymOf(A.t),-(cN-1))),dN=collDaily(fN,A.t);
  out.push(panel('tt_cal','Lịch thu tiền theo ngày — '+cN+' tháng','Mỗi ô = 1 ngày · số trong ô = tiền thu (tỷ đ) · màu càng đậm thu càng lớn · viền vàng = ngày thu cao nhất tháng',
    seg('calN',[[1,'1 tháng'],[2,'2 tháng'],[3,'3 tháng'],[4,'4 tháng'],[6,'6 tháng'],[12,'12 tháng']],cN)+calHeat(fN,A.t,dN)+calNote(fN,A.t,dN),'',6));
  /* theo kênh / vùng */
  const G=GRP('vung',A.t,A),GB={};GRP('vung',B.t,B).forEach(o=>GB[o.g]=o);
  G.sort((a,b)=>vOrd(a.g)-vOrd(b.g));
  let h=`<div class="tw"><table><thead><tr><th>Kênh</th><th>Vùng</th><th>Thu ${esc(labA())}</th><th>Thu ${esc(labBs())}</th><th>Δ%</th><th>Tỷ trọng</th><th>Doanh số ghi nợ</th><th>Thu / DS</th><th>Dư nợ cuối</th><th>Thu / dư nợ đầu</th></tr></thead><tbody>`;
  const S0=z.S0;G.forEach(o=>{const b=GB[o.g];const c=COLL(o.f),cb=b?COLL(b.f):0,bl=BILL(o.f);let d0=0;for(let i=0;i<X.nC;i++)if(mask[i]&&X.vung[i]===o.g&&S0.net[i]>0)d0+=S0.net[i];const dd=dPct(c,cb);
    h+=`<tr class="clk" data-fv="${esc(o.g)}"><td class="mu">${esc(kenhOfV(o.g))}</td><td><b>${esc(o.g)}</b></td><td><b>${fTy(c)}</b></td><td class="mu">${fTy(cb)}</td><td class="${cDn(dd)}">${arw(dd)}</td><td>${pc(cA?c/cA:null)}</td><td>${fTy(bl)}</td><td style="${heat1(bl&&c/bl<1?1-c/bl:0,0.5)}">${pc(bl?c/bl:null)}</td><td>${fTy(o.dr)}</td><td>${pc(d0?c/d0:null)}</td></tr>`;});
  h+=`<tr class="sum"><td></td><td>Tổng</td><td>${fTy(cA)}</td><td>${fTy(cB)}</td><td>${arw(dPct(cA,cB))}</td><td>100%</td><td>${fTy(bA)}</td><td>${pc(bA?cA/bA:null)}</td><td>${fTy(z.gA.dr)}</td><td>${pc(z.g0.dr?cA/z.g0.dr:null)}</td></tr>`;
  out.push(panel('tt_v','Thu tiền theo kênh & vùng','tỷ đ · bấm dòng để lọc vùng',h+'</tbody></table></div>','',6));
  /* theo ngân hàng — 12 tháng */
  const R=mRange(12),lab=R.map(mLab);const BK={};R.forEach((i,ix)=>{const o=collBank(AR.ymStart(X.MS[i]),X.ME[i]);Object.keys(o).forEach(b=>{(BK[b]=BK[b]||new Array(R.length).fill(0))[ix]+=o[b];});});
  const bks=Object.keys(BK).sort((a,b)=>BK[b].reduce((x,y)=>x+y,0)-BK[a].reduce((x,y)=>x+y,0));const cols=MCOL();
  out.push(panel('tt_bank','Tiền về theo ngân hàng — 12 tháng','tỷ đ · tên ngân hàng theo bảng quy đổi tài khoản (W_Tên phân tích)',chStack('c_tt_bank','h320',lab,bks.map((b,k)=>({n:b,v:BK[b],c:cols[k%cols.length]})),fTy1,{u:'tỷ đ',band:pband(R[0])})+bankNote(collBank(A.f,A.t),Object.keys(collBank(A.f,A.t)).sort((a,b)=>collBank(A.f,A.t)[b]-collBank(A.f,A.t)[a]),cA),'',4));
  const bA2=collBank(A.f,A.t);const bt=Object.keys(bA2).sort((a,b)=>bA2[b]-bA2[a]);
  out.push(panel('tt_bk','Cơ cấu ngân hàng kỳ '+labA(),'tỷ đ',chDonut('c_tt_bk','h320',bt.map((b,k)=>({n:b,v:bA2[b],c:cols[bks.indexOf(b)%cols.length]})),v=>fTy(v)+' tỷ'),'',2));
  /* khách ngừng thanh toán */
  const K=[];for(let i=0;i<X.nC;i++){if(!mask[i]||z.SA.net[i]<1e8)continue;const lp=lastPayAt(i,A.t);const gap=lp?A.t-lp:9999;if(gap>=60)K.push({i,lp,gap,dr:z.SA.net[i],ov:OVA(z.SA,i)});}
  K.sort((a,b)=>b.dr-a.dr);
  let k=tsearch(K.length,15)+`<div class="tw"><table class="lim"><thead><tr><th>Khách hàng</th><th>Vùng</th><th>Dư nợ</th><th>Quá hạn</th><th>Lần thu cuối</th><th>Số ngày không thu</th></tr></thead><tbody>`;
  K.forEach((o,ix)=>k+=`<tr class="clk${ix>=15?' xtra':''}" data-kh="${o.i}"><td><b>${esc(cShort(o.i))}</b><div class="mu">${esc(X.P.cid[o.i])}</div></td><td>${esc(X.vung[o.i])}</td><td><b>${fTy(o.dr)}</b></td><td class="${o.ov>0.5?'r':''}">${fTy(o.ov)}</td><td>${o.lp?dStr(o.lp):'Chưa từng thu'}</td><td style="${heat1(Math.min(o.gap,720),720)}">${o.gap>=9999?'—':fDay(o.gap)}</td></tr>`);
  out.push(panel('tt_stop',`Khách hàng dư nợ ≥ 100 triệu, không thanh toán ≥ 60 ngày (${K.length} KH · ${fTy(K.reduce((s,o)=>s+o.dr,0))} tỷ)`,'Danh sách ưu tiên đòi nợ / xác nhận công nợ',k+'</tbody></table></div>','',4));
  /* top khách thu trong kỳ */
  const T=GRP('cust',A.t,A).map(o=>({i:o.g,c:COLL(o.f)})).filter(o=>o.c>0.5).sort((a,b)=>b.c-a.c).slice(0,12);
  out.push(panel('tt_top','Khách hàng nộp tiền lớn nhất kỳ '+labA(),'tỷ đ',chBarH('c_tt_top','h320',T.map(o=>({n:cShort(o.i),v:o.c,c:C.ok})),fTy1,{lab:'Tiền thu',u:'tỷ đ'})+NT_(`12 khách nộp lớn nhất mang về ${pc(cA?T.reduce((s,o)=>s+o.c,0)/cA:null,0)} tiền thu kỳ.`),'',2));
  out.push(insBox('tt','Nhận định thu tiền',[
    `Thu kỳ ${labA()} ${arw(dPct(cA,cB))} so ${labB()}; thu / doanh số ${pc(bA?cA/bA:null)} — ${bA&&cA/bA<0.9?'thu chưa theo kịp doanh số, dư nợ đang tăng':'thu theo kịp doanh số'}.`,
    `${K.length} khách hàng dư nợ ≥ 100 triệu không có tiền về ≥ 60 ngày, tổng ${fTy(K.reduce((s,o)=>s+o.dr,0))} tỷ — giao KD vùng đối chiếu & lập kế hoạch thu trong tuần.`,
    `Tiền về tập trung ${bt.slice(0,3).map(b=>b+' '+pc(cA?bA2[b]/cA:null,0)).join(' · ')} — phục vụ kế hoạch dòng tiền và hạn mức thấu chi theo ngân hàng.`,
    'Tỷ lệ thu / phát sinh theo định nghĩa file Excel = Tiền thu ÷ (Phát sinh thuần − Tiền thu); doanh số ghi nợ = Bán hàng + VAT + Bán khác + Bán đầu tư.']));
  return out;
}
function calHeat(f,t,o){
  /* lịch tháng: mỗi tháng 1 thẻ (T2 → CN), ô = ngày, màu theo tiền thu */
  const vals=[];for(let d=f;d<=t;d++)if((o[d]||0)>0.5)vals.push(o[d]);vals.sort((a,b)=>a-b);
  const mx=vals.length?vals[Math.min(vals.length-1,Math.floor(vals.length*0.95))]:1;
  const ms=[];for(let ym=AR.ymOf(f);ym<=AR.ymOf(t);ym=AR.ymAdd(ym,1))ms.push(ym);
  let h=`<div class="kcal n${Math.min(ms.length,4)}">`;
  ms.forEach(ym=>{const s0=AR.ymStart(ym),e0=AR.ymEnd(ym),e=Math.min(e0,t);let tot=0,nd=0,wd=0,best=0,bd=0;
    for(let d=s0;d<=e;d++){const v=o[d]||0;tot+=v;if(v>0.5)nd++;if(isWork(d))wd++;if(v>best){best=v;bd=d;}}
    const lead=(AR.toD(s0).getUTCDay()+6)%7;
    let g=['T2','T3','T4','T5','T6','T7','CN'].map(x=>`<div class="kch${x==='CN'?' ksu':''}">${x}</div>`).join('');
    for(let q=0;q<lead;q++)g+='<div class="kcd kx"></div>';
    for(let d=s0;d<=e0;d++){const v=o[d]||0,fut=d>t,su=!isWork(d),r=Math.min(1,v/mx),dk=r>0.55;
      const bg=v>0.5?`background:color-mix(in srgb,var(--brand) ${Math.round(14+r*76)}%,transparent);`:'';
      g+=`<div class="kcd${fut?' kfut':''}${su?' ksu':''}${d===bd&&best>0.5?' kbest':''}${dk?' kdk':''}" style="${bg}" title="${dStr(d)} (${WDN[wday(d)]}): ${fut?'chưa đến':fTy(v)+' tỷ'}"><i>${dom(d)}</i>${v>0.5?(v<5e7?'<b class="ksm">&lt;0,1</b>':'<b>'+fTy1(v)+'</b>'):''}</div>`;}
    h+=`<div class="kcm"><div class="kcmh"><b>Tháng ${ym%100}/${Math.floor(ym/100)}</b><span>${fTy(tot)} tỷ${e<e0?' · đến '+dS(e):''}</span></div><div class="kcmg">${g}</div>
      <div class="kcmf"><span>BQ <b>${fTy(wd?tot/wd:null)}</b> tỷ/ngày LV</span><span>Cao nhất <b>${bd?dS(bd):'–'}</b> ${best>0.5?fTy1(best):''}</span><span>${nd} ngày có tiền về</span></div></div>`;});
  return h+`</div><div class="kcleg"><span>Ít</span>${[0.1,0.3,0.5,0.7,0.9].map(r=>`<i style="background:color-mix(in srgb,var(--brand) ${Math.round(14+r*76)}%,transparent)"></i>`).join('')}<span>Nhiều (≥ ${fTy1(mx)} tỷ)</span></div>`;
}

/* ═════════════ 7 · KÊNH & VÙNG ═════════════ */
function secKV(){
  const z=Z(),out=[],A=z.A,B=z.B,mask=MASK();
  const G=GRP('vung',A.t,A).filter(o=>o.dr>0.5||BILL(o.f)>0.5),GB={};GRP('vung',B.t,B).forEach(o=>GB[o.g]=o);
  const f3=AR.ymStart(AR.ymAdd(AR.ymOf(A.t),-2)),F3=FW(f3,A.t),days=A.t-f3+1;
  G.forEach(o=>{let b3=0;for(let i=0;i<X.nC;i++)if(mask[i]&&X.vung[i]===o.g)b3+=F3[i*X.NL]+F3[i*X.NL+1]+F3[i*X.NL+2]+F3[i*X.NL+3];o.dso=b3>0?o.dr/b3*days:null;o.b3=b3;
    const b=GB[o.g];o.drB=b?b.dr:0;o.ovB=b?b.ov:0;o.ovrB=b&&b.open?b.ov/b.open:null;o.ovr=o.open?o.ov/o.open:0;o.cA=COLL(o.f);o.bA=BILL(o.f);
    o.ck=o.f[0]?-o.f[5]/o.f[0]:null;o.tl=o.f[0]?-o.f[4]/o.f[0]:null;
    o.score=(o.ovr||0)*60+Math.min(1,(o.dso||0)/90)*25+(o.open?o.b180/o.open:0)*15;});
  G.sort((a,b)=>vOrd(a.g)-vOrd(b.g));
  const rk=G.filter(o=>o.dr>=1e9).sort((a,b)=>b.score-a.score);rk.forEach((o,i)=>o.rk=i+1);
  const worst=rk[0]||{};
  out.push(hero2('kv',`${G.length} vùng có công nợ. Rủi ro cao nhất: <b>${esc(worst.g||'')}</b> (quá hạn ${pc(worst.ovr)}, DSO ${fDay(worst.dso)} ngày). DSO thấp nhất ${esc((G.filter(o=>!nul(o.dso)&&o.dr>1e9).sort((a,b)=>a.dso-b.dso)[0]||{}).g||'–')}.`,[
    {l:'Số vùng',v:String(G.length)},{l:'Vùng rủi ro nhất',v:esc(worst.g||'–'),c:'r'},{l:'% quá hạn cao nhất',v:pc(worst.ovr),c:'r'}]));
  let h=`<div class="tw"><table><thead><tr><th>Hạng<br>rủi ro</th><th>Vùng</th><th>Dư nợ</th><th>Δ so<br>${dSy(B.t)}</th><th>Tỷ trọng</th><th>DSO<br>(ngày)</th><th>% quá hạn</th><th>Δ đ% QH</th><th>QH > 90 ngày</th><th>≥ 180 ngày</th><th>Doanh số kỳ</th><th>Thu kỳ</th><th>Thu/DS</th><th>CK / bán hàng</th><th>Vượt HM</th><th>Số KH nợ</th></tr></thead><tbody>`;
  const mxD=Math.max.apply(null,G.map(o=>o.dso||0).concat([1]));
  G.forEach(o=>{h+=`<tr class="clk" data-fv="${esc(o.g)}"><td>${o.rk?`<span class="rk ${o.rk<=3?'r':''}">${o.rk}</span>`:'<span class="mu" title="Dư nợ < 1 tỷ — không xếp hạng">–</span>'}</td><td class="tl"><b>${esc(o.g)}</b><div class="mu">${esc(kenhOfV(o.g))}</div></td><td><b>${fTy(o.dr)}</b></td><td class="${cUp(o.dr-o.drB)}">${sgV(o.dr-o.drB)}</td><td>${pc(z.gA.dr?o.dr/z.gA.dr:null)}</td>
    <td style="${heat1(o.dso,mxD,C.warn)}"><b>${fDay(o.dso)}</b></td><td style="${heat1(o.ovr,0.5)}">${pc(o.ovr)}</td><td class="${cUp(nul(o.ovrB)?null:o.ovr-o.ovrB)}">${nul(o.ovrB)?'–':sgD((o.ovr-o.ovrB)*100)}</td><td>${fTy(o.ov90)}</td><td>${fTy(o.b180)}</td><td>${fTy(o.bA)}</td><td>${fTy(o.cA)}</td><td>${pc(o.bA?o.cA/o.bA:null,0)}</td><td>${pc(o.ck)}</td><td class="${o.vhm>0.5?'r':''}">${fTy(o.vhm)}</td><td>${o.n}</td></tr>`;});
  out.push(panel('kv_t','Bảng điểm công nợ theo vùng','tỷ đ · DSO = dư nợ ÷ doanh số ghi nợ 3 tháng · hạng rủi ro (vùng dư nợ ≥ 1 tỷ) = 60% tỷ lệ quá hạn + 25% DSO + 15% nợ ≥ 180 ngày · bấm dòng để lọc',h+'</tbody></table></div>'+NT_(`Hạng 1–3 là ${rk.slice(0,3).map(o=>'<b>'+esc(o.g)+'</b>').join(', ')}: ưu tiên họp thu nợ theo vùng. Δ đ% QH dương = tỷ lệ quá hạn đang xấu đi so kỳ so sánh.`),'',6));
  const cols=MCOL();
  out.push(panel('kv_bb','Ma trận rủi ro vùng: DSO × % quá hạn','Kích thước = dư nợ · góc phải trên = rủi ro cao',chBubble('c_kv_bb','h360',G.filter(o=>o.dr>0.5&&!nul(o.dso)).map((o,i)=>({n:o.g,x:o.dso,y:o.ovr*100,r:Math.max(5,Math.sqrt(o.dr/1e9)*4.5),c:o.ovr>0.2?C.bad:o.ovr>0.1?C.warn:C.ok,t:`dư nợ ${fTy(o.dr)} tỷ · DSO ${fDay(o.dso)} · QH ${pc(o.ovr)}`})),{xl:'DSO (ngày)',yl:'% quá hạn',fx:fDay,fy:v=>nd(v,0)+'%',xmin:0,ymin:0})+bubNote(G),'',3));
  /* DSO theo kênh — 24 tháng */
  const R=mRange(24),lab=R.map(mLab);
  const ks=KORDER.filter(k=>G.some(o=>kenhOfV(o.g)===k));
  const ser=ks.map((k,i)=>{const t=TSm(maskOf(j=>X.kenh[j]===k));return {n:k,v:R.map(q=>t.dso[q]),c:cols[i]};});
  out.push(panel('kv_dso','DSO 3 tháng theo kênh — 24 tháng','ngày',chLines('c_kv_dso','h360',lab,ser,fDay,{u:'ngày',band:pband(R[0])})+kdsoNote(ser,R),'',3));
  /* nhiệt DSO vùng × 12 tháng */
  const R12=mRange(12);let t=`<div class="tw"><table class="heat"><thead><tr><th>Vùng</th>${R12.map(i=>`<th>${mLab(i)}</th>`).join('')}</tr></thead><tbody>`;
  G.filter(o=>o.dr>0.5).forEach(o=>{const s=TSm(maskOf(j=>X.vung[j]===o.g));t+=`<tr><td><b>${esc(o.g)}</b></td>${R12.map(i=>`<td style="${heat1(s.dso[i],mxD*1.2,C.warn)}">${fDay(s.dso[i])}</td>`).join('')}</tr>`;});
  out.push(panel('kv_hm','DSO theo vùng × tháng','ngày · đậm = vòng quay chậm',t+'</tbody></table></div>','',6));
  out.push(insBox('kv','Nhận định theo vùng',rk.slice(0,3).map(o=>`<b>${esc(o.g)}</b>: dư nợ ${fTy(o.dr)} tỷ, DSO ${fDay(o.dso)} ngày, quá hạn ${pc(o.ovr)} (${fTy(o.ov)} tỷ), ≥ 180 ngày ${fTy(o.b180)} tỷ → đầu mối ${esc(OWN[kenhOfV(o.g)]||'')}.`).concat([
    'Vùng có thu / doanh số < 85% trong kỳ là vùng đang để dư nợ tăng — đối chiếu với kế hoạch bán hàng để tránh đẩy hàng cuối kỳ.'])));
  return out;
}

/* ═════════════ 8 · KHÁCH HÀNG ═════════════ */
function secKH(){
  const z=Z(),out=[],A=z.A,B=z.B,mask=MASK(),S=z.SA;
  const K=GRP('cust',A.t,A).filter(o=>o.dr>0.5||o.cr>1e8||COLL(o.f)>0.5);
  const KB={};GRP('cust',B.t,B).forEach(o=>KB[o.g]=o);
  K.forEach(o=>{const i=o.g;o.lp=lastPayAt(i,A.t);o.drB=KB[i]?KB[i].dr:0;o.hmp=X.hasHM[i]&&X.HM[i]>0?o.dr/X.HM[i]:null;o.cA=COLL(o.f);
    const tag=[];if(o.ov90>0.5)tag.push(['QH > 90 ngày','r']);if(X.hasHM[i]&&o.dr>X.HM[i]+0.5)tag.push([X.HM2[i]&&o.dr>X.HM2[i]?'Vượt mức PD2':'Vượt HM',X.HM2[i]&&o.dr>X.HM2[i]?'r':'y']);
    if(o.dr>1e8&&(!o.lp||A.t-o.lp>=60))tag.push(['Ngừng thu ≥ 60 ngày','r']);if(o.cr>1e8)tag.push(['Dư Có','b']);if(X.layer[i])tag.push(['Ngoài HĐKD','b']);o.tag=tag;});
  const tot=K.reduce((s,o)=>s+o.dr,0);
  const P=K.slice().sort((a,b)=>b.dr-a.dr);let cum=0;P.forEach(o=>{cum+=o.dr;o.cum=tot?cum/tot:0;});
  const n80=P.findIndex(o=>o.cum>=0.8)+1;
  out.push(hero2('kh',`${P.filter(o=>o.dr>0.5).length} khách hàng đang dư nợ. <b>${n80} khách</b> chiếm 80% dư nợ; top 10 chiếm <b>${pc(P[9]?P[9].cum:null)}</b>. ${K.filter(o=>o.tag.some(t=>t[1]==='r')).length} khách gắn cờ đỏ (quá hạn > 90 ngày / vượt mức PD2 / ngừng thu).`,[
    {l:'KH dư nợ',v:String(P.filter(o=>o.dr>0.5).length)},{l:'KH chiếm 80%',v:String(n80)},{l:'Top 10',v:pc(P[9]?P[9].cum:null),c:P[9]&&P[9].cum>0.6?'y':''},{l:'KH cờ đỏ',v:String(K.filter(o=>o.tag.some(t=>t[1]==='r')).length),c:'r'}]));
  const T20=P.slice(0,20);
  out.push(panel('kh_par','Pareto dư nợ — 20 khách hàng lớn nhất','Cột: dư nợ (tỷ đ) · Đường: % lũy kế',
    chCombo('c_kh_par','h340',T20.map(o=>cShort(o.g)),[{n:'Dư nợ',v:T20.map(o=>o.dr),c:C.gold+'cc'},{n:'Quá hạn',v:T20.map(o=>o.ov),c:C.bad+'cc'}],[{n:'% lũy kế',v:T20.map(o=>o.cum),c:MCOL()[1],f:v=>pc(v,0)}],{fl:v=>pc(v,0),y1min:0,y1max:1})+parNote(P,tot),'',4));
  const RS=P.filter(o=>o.dr>2e8).slice(0,60);
  out.push(panel('kh_rm','Ma trận rủi ro khách hàng','Trục ngang: số ngày quá hạn lớn nhất · trục dọc: dư nợ (tỷ, thang log) · đỏ = vượt hạn mức hoặc QH > 90 ngày',
    cbox('c_kh_rm','h340',{type:'bubble',data:{datasets:[{label:'KH',data:RS.map(o=>({x:o.maxQ,y:o.dr/1e9,r:Math.max(4,Math.min(16,Math.sqrt(o.ov/1e9)*5+3)),i:o.g})),
      backgroundColor:RS.map(o=>(o.tag.some(t=>t[1]==='r')?C.bad:o.ov>0.5?C.warn:C.ok)+'aa'),borderColor:RS.map(o=>o.tag.some(t=>t[1]==='r')?C.bad:C.ok),datalabels:{display:false}}]},
      options:baseOpt({interaction:{mode:'nearest',intersect:true},plugins:{legend:{display:false},tooltip:Object.assign(TT(),{callbacks:{label:c=>{const o=RS[c.dataIndex];return ' '+cShort(o.g)+': dư nợ '+fTy(o.dr)+' tỷ · QH '+fTy(o.ov)+' tỷ · '+fDay(o.maxQ)+' ngày';}}})},
        scales:{x:{grid:{color:C.grid},title:{display:true,text:'Số ngày quá hạn lớn nhất',color:C.mut,font:{size:10}},ticks:{color:C.mut,font:{size:10}},min:0},y:{type:'logarithmic',grid:{color:C.grid},title:{display:true,text:'Dư nợ (tỷ đ)',color:C.mut,font:{size:10}},ticks:{color:C.mut,font:{size:10},callback:v=>nd(v,1)}}}})})+rmNote(RS),'',2));
  /* bảng khách hàng */
  const srt=state.ksort||'dr';const SK={dr:['Dư nợ',(a,b)=>b.dr-a.dr],ov:['Quá hạn',(a,b)=>b.ov-a.ov],q:['Số ngày QH',(a,b)=>b.maxQ-a.maxQ],hm:['% hạn mức',(a,b)=>(b.hmp||0)-(a.hmp||0)],d:['Tăng dư nợ',(a,b)=>(b.dr-b.drB)-(a.dr-a.drB)],c:['Tiền thu kỳ',(a,b)=>b.cA-a.cA]};
  const L2=K.slice().sort(SK[srt][1]);
  let h=seg('ksort',Object.keys(SK).map(k=>[k,'Sắp theo '+SK[k][0]]),srt)+tsearch(L2.length,30)+`<div class="tw"><table class="lim"><thead><tr><th>Khách hàng</th><th>Vùng · NT</th><th>Dư nợ</th><th>Δ so ${dSy(B.t)}</th><th>Quá hạn</th><th>Ngày QH max</th><th>≥ 180 ngày</th><th>Hạn mức · % dùng</th><th>Bảo lãnh</th><th>Thu kỳ</th><th>Số ngày trả BQ<br>3 tháng</th><th>Lần thu cuối</th></tr></thead><tbody>`;
  const n3=MAGG(AR.ymStart(AR.ymAdd(AR.ymOf(A.t),-2)),A.t);
  L2.forEach((o,ix)=>{const i=o.g;h+=`<tr class="clk${ix>=30?' xtra':''}" data-kh="${i}"><td class="tl" style="white-space:normal;min-width:230px"><b>${esc(cShort(i))}</b><div class="mu">${esc(X.P.cid[i])} ${o.tag.map(t=>pill(t[0],t[1])).join(' ')}</div></td><td class="mu">${esc(X.vung[i])}<br>${esc(X.nt[i])}</td><td><b>${fTy(o.dr)}</b>${o.cr>0.5?`<div class="mu">Có ${fTy(o.cr)}</div>`:''}</td><td class="${cUp(o.dr-o.drB)}">${sgV(o.dr-o.drB)}</td><td class="${o.ov>0.5?'r':''}">${fTy(o.ov)}</td><td style="${heat1(o.maxQ,365)}">${o.maxQ?fDay(o.maxQ):''}</td><td>${o.b180>0.5?fTy(o.b180):''}</td><td style="${heat1(o.hmp&&o.hmp>1?o.hmp-1:0,1)}">${X.hasHM[i]?fTy(X.HM[i])+' · '+pc(o.hmp,0):'—'}</td><td>${S.bl[i]>0.5?fTy(S.bl[i]):''}</td><td>${o.cA>0.5?fTy(o.cA):''}</td><td>${n3.byC[i]>1e7?fDay(n3.wC[i]/n3.byC[i]):''}</td><td>${o.lp?dStr(o.lp):'—'}</td></tr>`;});
  out.push(panel('kh_t','Danh sách khách hàng','Bấm dòng để mở hồ sơ công nợ: diễn biến 24 tháng, hóa đơn còn nợ, hạn thanh toán, bảo lãnh, giao dịch gần nhất',h+'</tbody></table></div>','',6));
  out.push(insBox('kh','Nhận định khách hàng',[
    `Mức tập trung: ${n80} khách chiếm 80% dư nợ; khách lớn nhất ${esc(cShort(P[0]?P[0].g:0))} ${fTy(P[0]?P[0].dr:0)} tỷ (${pc(tot&&P[0]?P[0].dr/tot:null)}).`,
    `Khách tăng dư nợ mạnh nhất so ${dStr(B.t)}: ${K.slice().sort((a,b)=>(b.dr-b.drB)-(a.dr-a.drB)).slice(0,3).map(o=>esc(cShort(o.g))+' '+sgV(o.dr-o.drB)).join(' · ')} tỷ.`,
    `${K.filter(o=>o.cr>1e8).length} khách đang dư Có (trả trước) ≥ 100 triệu, tổng ${fTy(K.filter(o=>o.cr>1e8).reduce((s,o)=>s+o.cr,0))} tỷ — đối chiếu để cấn trừ hoặc ghi nhận đúng bản chất (đặt cọc / tiền về chưa xuất hóa đơn).`]));
  return out;
}
function custDrill(i){
  const z=Z(),A=z.A,S=SNAPI(A.t),R=mRange(24),lab=R.map(mLab),Lx=LL();
  const bill=R.map(m=>{const o=(i*X.nM+m)*X.NL;return X.FL[o]+X.FL[o+1]+X.FL[o+2]+X.FL[o+3];}), col=R.map(m=>-X.FL[(i*X.nM+m)*X.NL+6]), bal=R.map(m=>X.SN[m].net[i]);
  const its=S.items.filter(x=>x.ci===i).sort((a,b)=>a.d-b.d);
  const bl=X.BL.filter(b=>b.ci===i).sort((a,b)=>b.t-a.t);
  const lp=lastPayAt(i,A.t);
  const kp=[['Dư nợ',fTy(S.net[i])+' tỷ'],['Quá hạn sau BL',fTy(OVA(S,i))+' tỷ'],['Tuổi lớn nhất',fDay(S.maxAge[i])+' ngày'],['Hạn mức',X.hasHM[i]?fTy(X.HM[i])+' / '+fTy(X.HM1[i])+' / '+fTy(X.HM2[i])+' tỷ':'Chưa có'],
    ['Bảo lãnh hiệu lực',fTy(S.bl[i])+' tỷ'],['Nguyên tắc',X.nt[i]+' · '+((X.NT[X.nt[i]]||{}).n||'')],['Lần thu cuối',lp?dStr(lp):'—'],['Lớp',X.layer[i]?'Ngoài HĐKD — '+X.lyWhy[i]:'HĐKD']];
  let h=`<div class="msub">${esc(X.P.cid[i])} · ${esc(cName(i))} · ${esc(X.kenh[i])} › ${esc(X.vung[i])} · ngày chốt ${dStr(A.t)}</div>`;
  h+=`<div class="srcrow">${kp.map(r=>`<b>${esc(r[0])}</b><span>${esc(r[1])}</span>`).join('')}</div>`;
  h+=`<h3 style="font-size:12.6px;margin:14px 0 6px">Diễn biến 24 tháng</h3>`+chCombo('c_cd_'+i,'h260',lab,[{n:'Doanh số ghi nợ',v:bill,c:C.muted+'aa'},{n:'Tiền thu',v:col,c:C.gold+'cc'}],[{n:'Dư nợ cuối tháng',v:bal,c:MCOL()[1]}],{fb:fTy1,fl:fTy1,ul:'tỷ đ'});
  h+=`<h3 style="font-size:12.6px;margin:14px 0 6px">Hóa đơn còn nợ (FIFO) — ${its.length} chứng từ</h3><div class="tw"><table><thead><tr><th>Ngày CT</th><th>Số CT</th><th>Giá trị</th><th>Còn nợ</th><th>Tuổi</th><th>Hạn TT</th><th>Ngày QH</th><th>BL trừ</th><th>Tình trạng</th></tr></thead><tbody>`;
  its.slice(-80).reverse().forEach(x=>h+=`<tr><td>${dStr(x.d)}</td><td>${esc(x.s)}</td><td>${fTr(x.a)}</td><td><b>${fTr(x.op)}</b></td><td>${fDay(x.age)}</td><td>${isFinite(x.due)?dStr(x.due):'—'}</td><td class="${x.qd>0?'r':''}">${x.qd>0?fDay(x.qd):''}</td><td>${x.u>0.5?fTr(x.u):''}</td><td>${stPill(x.st)}</td></tr>`);
  h+=`</tbody></table></div><div class="psub">Đơn vị: triệu đồng. ${its.length>80?'Hiện 80 chứng từ gần nhất.':''}</div>`;
  if(bl.length){h+=`<h3 style="font-size:12.6px;margin:14px 0 6px">Bảo lãnh ngân hàng</h3><div class="tw"><table><thead><tr><th>Số</th><th>Ngân hàng</th><th>Từ</th><th>Đến</th><th>Giá trị</th><th>Trạng thái</th></tr></thead><tbody>`;
    bl.forEach(b=>h+=`<tr><td>${esc(b.so)}</td><td class="tl">${esc(b.bank)}</td><td>${dStr(b.f)}</td><td>${dStr(b.t)}</td><td>${fTr(b.a)} tr</td><td>${b.t<A.t?pill('Hết hạn','y'):b.f>A.t?pill('Chưa hiệu lực'):b.t-A.t<=30?pill('Hết hạn ≤ 30 ngày','r'):pill('Hiệu lực','g')}</td></tr>`);h+='</tbody></table></div>';}
  const rows=X.rowsOf[i].filter(j=>Lx.d[j]<=A.t).slice(-25).reverse();
  h+=`<h3 style="font-size:12.6px;margin:14px 0 6px">25 bút toán gần nhất</h3><div class="tw"><table><thead><tr><th>Ngày</th><th>Số CT</th><th>Mã CT</th><th>Loại</th><th>Nợ (+) / Có (−)</th><th>Diễn giải / ngân hàng</th></tr></thead><tbody>`;
  rows.forEach(j=>h+=`<tr><td>${dStr(Lx.d[j])}</td><td>${esc(Lx.s[j])}</td><td>${esc(X.P.dic.mc[Lx.c[j]])}</td><td>${esc(X.LOAI[Lx.t[j]])}</td><td class="${Lx.a[j]<0?'g':''}">${fTr(Lx.a[j])}</td><td class="tl mu">${esc(Lx.g[j]>=0?X.P.dic.dg[Lx.g[j]]:(Lx.b[j]>=0?X.P.dic.bank[Lx.b[j]]:''))}</td></tr>`);
  return h+'</tbody></table></div>';
}

/* ═════════════ 9 · HẠN MỨC & BẢO LÃNH ═════════════ */
function secHM(){
  const z=Z(),out=[],A=z.A,S=z.SA,mask=MASK();
  const H=[];let nNo=0,vNo=0;
  for(let i=0;i<X.nC;i++){if(!mask[i])continue;const d=S.net[i];
    if(X.hasHM[i])H.push({i,d,hm:X.HM[i],h1:X.HM1[i],h2:X.HM2[i],p:X.HM[i]>0?d/X.HM[i]:(d>0.5?9.99:0),ov:OVA(S,i),bl:S.bl[i],st:d>X.HM2[i]+0.5&&X.HM2[i]?'Vượt mức PD2':d>X.HM1[i]+0.5&&X.HM1[i]?'Vượt mức PD1':d>X.HM[i]+0.5?'Vượt hạn mức':'Trong hạn mức'});
    else if(d>0.5&&X.kenh[i]==='2. Phân phối'){nNo++;vNo+=d;}}
  const ov=H.filter(o=>o.st!=='Trong hạn mức');const stc={'Vượt mức PD2':'r','Vượt mức PD1':'r','Vượt hạn mức':'y','Trong hạn mức':'g'};
  const BLx=X.BL, act=BLx.filter(b=>b.f<=A.t&&b.t>=A.t), exp30=act.filter(b=>b.t-A.t<=30), unm=BLx.filter(b=>b.ci<0);
  out.push(hero2('hm',`${H.length} khách hàng có hạn mức (tổng ${fTy(H.reduce((s,o)=>s+o.hm,0))} tỷ). <b>${ov.length} khách vượt</b> (giá trị vượt ${fTy(ov.reduce((s,o)=>s+Math.max(0,o.d-o.hm),0))} tỷ), ${ov.filter(o=>o.st==='Vượt mức PD2').length} vượt mức phê duyệt 2. ${act.length} bảo lãnh đang hiệu lực (${fTy(act.reduce((s,b)=>s+b.a,0))} tỷ), <b>${exp30.length}</b> hết hạn trong 30 ngày.`,[
    {l:'KH có hạn mức',v:String(H.length)},{l:'KH vượt hạn mức',v:String(ov.length),c:ov.length?'r':'g'},{l:'BL hiệu lực',v:fTy(act.reduce((s,b)=>s+b.a,0)),s:act.length+' thư'},{l:'BL hết hạn ≤ 30 ngày',v:String(exp30.length),c:exp30.length?'y':''}]));
  const T=H.filter(o=>o.d>0.5).sort((a,b)=>b.p-a.p).slice(0,20);
  out.push(panel('hm_c','Mức sử dụng hạn mức — 20 khách cao nhất','% = dư nợ ÷ hạn mức · vạch: 100% hạn mức',chBarH('c_hm_c','h400',T.filter(o=>o.hm>0).map(o=>({n:cShort(o.i),v:o.p*100,c:o.p>1?(o.d>o.h2&&o.h2?C.bad:C.warn):C.ok,d:'Dư nợ '+fTy(o.d)+' / HM '+fTy(o.hm)+' tỷ'})),v=>nd(v,0)+'%',{lab:'% hạn mức'})+hmcNote(T),'',6));
  let h=tsearch(H.length,25)+`<div class="tw"><table class="lim"><thead><tr><th>Khách hàng</th><th>Vùng</th><th>Dư nợ</th><th>Hạn mức</th><th>Mức PD1</th><th>Mức PD2</th><th>% sử dụng</th><th>Vượt HM</th><th>Quá hạn</th><th>Bảo lãnh</th><th>Trạng thái</th></tr></thead><tbody>`;
  H.sort((a,b)=>b.p-a.p).forEach((o,ix)=>h+=`<tr class="clk${ix>=25?' xtra':''}" data-kh="${o.i}"><td><b>${esc(cShort(o.i))}</b><div class="mu">${esc(X.P.cid[o.i])}</div></td><td>${esc(X.vung[o.i])}</td><td><b>${fTy(o.d)}</b></td><td>${fTy(o.hm)}</td><td class="mu">${fTy(o.h1)}</td><td class="mu">${fTy(o.h2)}</td><td style="${heat1(o.p>1?o.p-1:0,1)}">${o.hm>0?pc(o.p,0):'HM = 0'}</td><td class="${o.d>o.hm?'r':''}">${o.d>o.hm?fTy(o.d-o.hm):''}</td><td>${fTy(o.ov)}</td><td>${fTy(o.bl)}</td><td>${pill(o.st,stc[o.st])}</td></tr>`);
  out.push(panel('hm_t','Hạn mức công nợ theo khách hàng','Nguồn: IN_Hạn mức công nợ (hiệu lực 18/07/2024 – 30/12/2026) · tỷ đ',h+'</tbody></table></div>','',6));
  /* bảo lãnh */
  const bst=b=>b.t<A.t?['Đã hết hạn','n']:b.f>A.t?['Chưa hiệu lực','n']:b.t-A.t<=30?['Hết hạn ≤ 30 ngày','r']:b.t-A.t<=90?['Hết hạn ≤ 90 ngày','y']:['Hiệu lực','g'];
  const BV=BLx.filter(b=>b.t>=A.t-90).sort((a,b)=>a.t-b.t);
  let b=`<div class="tw"><table><thead><tr><th>Số BL</th><th>Khách hàng · ngân hàng</th><th>Hiệu lực từ</th><th>Đến</th><th>Còn (ngày)</th><th>Giá trị</th><th>Dư nợ KH</th><th>Trạng thái</th></tr></thead><tbody>`;
  BV.forEach(x=>{const s=bst(x);b+=`<tr${x.ci>=0?` class="clk" data-kh="${x.ci}"`:''}><td>${esc(x.so)}</td><td class="tl"><b>${esc(x.ci>=0?cShort(x.ci):x.nm)}</b>${x.ci<0?'<div class="r">Không khớp tên KH</div>':''}<div class="mu">${esc(x.bank)}</div></td><td>${dStr(x.f)}</td><td>${dStr(x.t)}</td><td>${x.t>=A.t?fDay(x.t-A.t):'–'}</td><td>${fTy(x.a)}</td><td>${x.ci>=0?fTy(S.net[x.ci]):'–'}</td><td>${pill(s[0],s[1])}</td></tr>`;});
  out.push(panel('hm_bl','Bảo lãnh ngân hàng — hiệu lực & sắp hết hạn','Thư bảo lãnh còn hiệu lực hoặc hết hạn trong 90 ngày qua · nguồn M_Bảo lãnh · khớp khách hàng theo tên',b+'</tbody></table></div>'+(unm.length?banner(`${unm.length} thư bảo lãnh không khớp được tên khách hàng trong danh mục — kiểm tra lại tên đối tượng ở M_Bảo lãnh.`,'y'):''),'',4));
  const G=GRP('vung',A.t,A).filter(o=>o.dr>0.5).sort((a,b)=>b.dr-a.dr);
  out.push(panel('hm_cov','Dư nợ được bảo đảm bằng bảo lãnh theo vùng','tỷ đ · phần BL che (đã phân bổ FIFO) so với dư nợ',chBarH('c_hm_cov','h340',G.map(o=>({n:o.g,v:o.dr,c:C.muted+'99',d:'BL che '+fTy(o.blu)+' tỷ = '+pc(o.dr?o.blu/o.dr:null)})),fTy1,{lab:'Dư nợ',u:'tỷ đ',ds2:{label:'Bảo lãnh che',data:G.map(o=>o.blu),backgroundColor:C.ok}})+covNote(G),'',2));
  out.push(insBox('hm','Nhận định hạn mức & bảo lãnh',[
    (()=>{const p2=ov.filter(o=>o.st==='Vượt mức PD2').sort((a,b)=>(b.d-b.h2)-(a.d-a.h2));return `${ov.length} khách vượt hạn mức, trong đó <b>${p2.length} khách vượt mức phê duyệt 2</b>${p2.length?' — lớn nhất: '+p2.slice(0,6).map(o=>esc(cShort(o.i))+' (vượt '+fTy(o.d-o.h2)+' tỷ)').join(', ')+(p2.length>6?'…':''):''}.`;})(),
    `${nNo} khách kênh Phân phối đang dư nợ (${fTy(vNo)} tỷ) nhưng chưa có hạn mức trong IN_Hạn mức công nợ — cần bổ sung hoặc chặn bán chịu.`,
    `${exp30.length} bảo lãnh hết hạn trong 30 ngày${exp30.length?': '+exp30.map(x=>esc(x.ci>=0?cShort(x.ci):x.nm)+' ('+dS(x.t)+')').join(', '):''} — yêu cầu gia hạn trước khi hết hiệu lực, nếu không nợ đang được che sẽ chuyển thành quá hạn.`]));
  return out;
}

/* ═════════════ 10 · NGOÀI HĐKD & BẤT THƯỜNG ═════════════ */
function secNG(){
  const z=Z(),out=[],A=z.A,S=z.SA,ts=TS(),R=mRange(36),lab=R.map(mLab),Lx=LL();
  const mH=maskLy('hd'),mN=maskLy('ng');const tH=TSm(mH),tN=TSm(mN),tAll=TSm(maskLy('all'));
  const gN=AG(S,mN),gH=AG(S,mH);
  out.push(hero2('ng',`Lớp <b>Ngoài HĐKD</b> đang dư nợ <b>${fTy(gN.dr)} tỷ</b> = ${pc((gN.dr+gH.dr)?gN.dr/(gN.dr+gH.dr):null)} tổng dư nợ, ≥ 180 ngày ${fTy(gN.b180)} tỷ. Nếu gộp vào, DSO toàn công ty ${fDay(DSOat(A.t,maskLy('all')))} ngày so ${fDay(DSOat(A.t,mH))} ngày của riêng HĐKD.`,[
    {l:'Dư nợ Ngoài HĐKD',v:fTy(gN.dr),s:'tỷ đ',c:'y'},{l:'Tỷ trọng',v:pc((gN.dr+gH.dr)?gN.dr/(gN.dr+gH.dr):null)},{l:'DSO HĐKD',v:fDay(DSOat(A.t,mH)),s:'ngày'},{l:'DSO toàn bộ',v:fDay(DSOat(A.t,maskLy('all'))),s:'ngày'}]));
  out.push(panel('ng_tr','Dư nợ HĐKD và Ngoài HĐKD — 36 tháng','tỷ đ · cột chồng',chStack('c_ng_tr','h320',lab,[{n:'HĐKD',v:R.map(i=>tH.dr[i]),c:C.gold+'cc'},{n:'Ngoài HĐKD',v:R.map(i=>tN.dr[i]),c:MCOL()[4]+'cc'}],fTy1,{u:'tỷ đ'})+ngNote(tH,tN,R),'',3));
  out.push(panel('ng_dso','DSO: HĐKD so toàn bộ','ngày · chênh lệch = méo số do khoản ngoài hoạt động bán hàng',chLines('c_ng_dso','h320',lab,[{n:'HĐKD',v:R.map(i=>tH.dso[i]),c:C.gold},{n:'Toàn bộ',v:R.map(i=>tAll.dso[i]),c:MCOL()[4],dash:true}],fDay,{u:'ngày'})+ngdNote(tH,tAll,R),'',3));
  /* danh sách KH ngoài HĐKD */
  const NG=[];for(let i=0;i<X.nC;i++)if(X.layer[i]&&(Math.abs(S.net[i])>0.5||X.rowsOf[i].length))NG.push(i);
  NG.sort((a,b)=>S.net[b]-S.net[a]);
  let h=`<div class="tw"><table><thead><tr><th>Khách hàng</th><th>Lý do xếp lớp</th><th>Dư nợ</th><th>Tuổi lớn nhất</th><th>≥ 180 ngày</th><th>Lần thu cuối</th><th>Bán khác/đầu tư lũy kế</th></tr></thead><tbody>`;
  NG.forEach(i=>{let ot=0;for(let m=0;m<X.nM;m++){const o=(i*X.nM+m)*X.NL;ot+=X.FL[o+2]+X.FL[o+3];}const lp=lastPayAt(i,A.t);
    h+=`<tr class="clk" data-kh="${i}"><td><b>${esc(cShort(i))}</b><div class="mu">${esc(X.P.cid[i])}</div></td><td class="tl mu">${esc(X.lyWhy[i])}</td><td><b>${fTy(S.net[i])}</b></td><td>${S.net[i]>0.5?fDay(S.maxAge[i])+' ngày':'–'}</td><td class="${S.b[5][i]+S.b[6][i]+S.b[7][i]+S.b[8][i]>0.5?'r':''}">${fTy(S.b[5][i]+S.b[6][i]+S.b[7][i]+S.b[8][i])}</td><td>${lp?dStr(lp):'—'}</td><td>${fTy(ot)}</td></tr>`;});
  out.push(panel('ng_kh','Khách hàng thuộc lớp Ngoài HĐKD','Quy tắc: kênh 6. Thương mại · danh sách ngoại lệ (CC000552 chuyển nhượng tài sản) · khách có bán khác/bán đầu tư ≥ 50% doanh số ghi nợ và ≥ 1 tỷ',h+'</tbody></table></div>','',6));
  /* bút toán bất thường */
  const th=5e9, f24=AR.ymStart(AR.ymAdd(X.MS[curM()],-23)), BIG=[];let small=0,smallN=0;
  for(let j=0;j<Lx.k.length;j++){const d=Lx.d[j];if(d<f24||d>A.t)continue;const t=Lx.t[j],a=Lx.a[j];
    if([2,3,7,8,9].indexOf(t)>=0&&Math.abs(a)>=(t===2?1e9:th))BIG.push(j);
    if((t===9||t===2)&&Math.abs(a)<1000){small+=a;smallN++;}}
  BIG.sort((a,b)=>Lx.d[b]-Lx.d[a]);
  let b=`<div class="tw"><table><thead><tr><th>Ngày</th><th>Số CT</th><th>Khách hàng</th><th>Loại</th><th>Số tiền (tỷ)</th><th>Diễn giải</th><th>Lớp</th></tr></thead><tbody>`;
  BIG.forEach(j=>{const i=Lx.k[j];b+=`<tr class="clk" data-kh="${i}"><td>${dStr(Lx.d[j])}</td><td>${esc(Lx.s[j])}</td><td><b>${esc(cShort(i))}</b></td><td>${esc(X.LOAI[Lx.t[j]])}</td><td class="${Lx.a[j]>0?'r':'g'}"><b>${sgV(Lx.a[j]).replace(' ','')}</b></td><td class="tl mu">${esc(Lx.g[j]>=0?X.P.dic.dg[Lx.g[j]]:'')}</td><td>${X.layer[i]?pill('Ngoài HĐKD','b'):pill('HĐKD')}</td></tr>`;});
  out.push(panel('ng_big','Bút toán bất thường — 24 tháng',`Bán khác ≥ 1 tỷ · bán đầu tư, chi trả cho KH, bù trừ, điều chỉnh khác ≥ ${fTy(th)} tỷ · ${BIG.length} bút toán`,b+'</tbody></table></div>'+
    note(`Ngoài ra có <b>${smallN}</b> bút toán điều chỉnh số dư lẻ dưới 1.000 đ (tổng ${n0(small)} đ) — không ảnh hưởng phân tích.`,null,''),'',6));
  /* dư Có */
  const CR=[];for(let i=0;i<X.nC;i++)if(MASK()[i]&&S.net[i]<-1e8)CR.push(i);CR.sort((a,b)=>S.net[a]-S.net[b]);
  let c=`<div class="tw"><table><thead><tr><th>Khách hàng</th><th>Vùng</th><th>Dư Có (trả trước)</th><th>Lần thu cuối</th></tr></thead><tbody>`;
  CR.forEach(i=>{const lp=lastPayAt(i,A.t);c+=`<tr class="clk" data-kh="${i}"><td><b>${esc(cShort(i))}</b><div class="mu">${esc(X.P.cid[i])}</div></td><td>${esc(X.vung[i])}</td><td class="g"><b>${fTy(-S.net[i])}</b></td><td>${lp?dStr(lp):'—'}</td></tr>`;});
  out.push(panel('ng_cr',`Khách hàng dư Có ≥ 100 triệu (${CR.length} KH · ${fTy(CR.reduce((s,i)=>s-S.net[i],0))} tỷ)`,'Tiền khách trả trước / tiền về chưa xuất hóa đơn — lớp đang lọc',c+'</tbody></table></div>','',6));
  out.push(insBox('ng','Nhận định Ngoài HĐKD',[
    `Không đánh giá vòng quay bán hàng trên số Toàn bộ: các khoản Ngoài HĐKD (chuyển nhượng tài sản, bán đầu tư, thương mại) có chu kỳ thanh toán riêng theo hợp đồng.`,
    `Khoản Vinatop (CC000552 — chuyển nhượng tài sản 12/2024) ${(()=>{const i=X.CIx['CC000552'];return i!==undefined?'còn '+fTy(S.net[i])+' tỷ, tuổi '+fDay(S.maxAge[i])+' ngày':'—';})()} — cần đánh giá khả năng thu hồi, tài sản bảo đảm và dự phòng theo hợp đồng.`,
    'Bán đầu tư 150 tỷ (T6/2026 — nhóm Tasco) và các bút toán bù trừ lớn làm tiền thu và phát sinh tháng tăng đột biến: khi so sánh tháng 6 hoặc tháng có bù trừ lớn cần xem ở lớp HĐKD.']));
  return out;
}

/* ═════════════ 11 · CHIẾT KHẤU & GIẢM TRỪ ═════════════ */
function secCK(){
  const z=Z(),out=[],A=z.A,B=z.B,ms=MSER(),R=mRange(24),lab=R.map(mLab),m=curM();
  const rck=i=>ms[0][i]?-ms[5][i]/ms[0][i]:null, rtl=i=>ms[0][i]?-ms[4][i]/ms[0][i]:null;
  const ckA=-z.FA[5],ckB=-z.FB[5],bhA=z.FA[0],bhB=z.FB[0],tlA=-z.FA[4];
  out.push(hero2('ck',`Chiết khấu trả qua công nợ kỳ ${labA()}: <b>${fTy(ckA)} tỷ = ${pc(bhA?ckA/bhA:null,2)}</b> doanh thu bán hàng (kỳ so sánh ${pc(bhB?ckB/bhB:null,2)}). Hàng bán trả lại ${fTy(tlA)} tỷ (${pc(bhA?tlA/bhA:null,2)}).`,[
    {l:'Chiết khấu kỳ',v:fTy(ckA),s:pc(bhA?ckA/bhA:null,2)+' doanh thu'},{l:'Kỳ so sánh',v:pc(bhB?ckB/bhB:null,2)},{l:'Hàng trả lại',v:fTy(tlA),s:pc(bhA?tlA/bhA:null,2)},{l:'CK 12 tháng',v:fTy(-sumL(Array.from(ms[5]),m,12)),s:'tỷ đ'}]));
  out.push(panel('ck_tr','Chiết khấu & hàng trả lại trên doanh thu — 24 tháng','Cột: tỷ đ · Đường: % doanh thu bán hàng (chưa VAT)',
    chCombo('c_ck_tr','h320',lab,[{n:'Chiết khấu',v:R.map(i=>-ms[5][i]),c:C.gold+'cc'},{n:'Hàng trả lại',v:R.map(i=>-ms[4][i]),c:C.bad+'aa'}],[{n:'% CK / doanh thu',v:R.map(rck),c:MCOL()[1],f:v=>pc(v,1)},{n:'% trả lại',v:R.map(rtl),c:MCOL()[2],f:v=>pc(v,2),dash:true}],{fl:v=>pc(v,1),band:pband(R[0])})+ckNote(ms,m),'',4));
  const G=GRP('vung',A.t,A),GB={};GRP('vung',B.t,B).forEach(o=>GB[o.g]=o);
  const rows=G.filter(o=>o.f[0]>0.5).map(o=>({n:o.g,v:-o.f[5]/o.f[0]*100,c:C.gold,d:'CK '+fTy(-o.f[5])+' tỷ / DT '+fTy(o.f[0])+' tỷ'})).sort((a,b)=>b.v-a.v);
  out.push(panel('ck_v','% chiết khấu theo vùng — '+labA(),'% doanh thu bán hàng',chBarH('c_ck_v','h320',rows,v=>nd(v,2)+'%',{lab:'% CK'})+ckvNote(rows),'',2));
  let h=`<div class="tw"><table><thead><tr><th>Vùng</th><th>Doanh thu bán hàng</th><th>Chiết khấu</th><th>% CK</th><th>% CK kỳ SS</th><th>Δ đ%</th><th>Hàng trả lại</th><th>% trả lại</th></tr></thead><tbody>`;
  G.filter(o=>o.f[0]>0.5).sort((a,b)=>vOrd(a.g)-vOrd(b.g)).forEach(o=>{const b=GB[o.g];const p=-o.f[5]/o.f[0],pb=b&&b.f[0]?-b.f[5]/b.f[0]:null;
    h+=`<tr class="clk" data-fv="${esc(o.g)}"><td><b>${esc(o.g)}</b></td><td>${fTy(o.f[0])}</td><td>${fTy(-o.f[5])}</td><td><b>${pc(p,2)}</b></td><td class="mu">${pc(pb,2)}</td><td class="${cUp(nul(pb)?null:p-pb)}">${nul(pb)?'–':sgD((p-pb)*100)}</td><td>${fTy(-o.f[4])}</td><td>${pc(-o.f[4]/o.f[0],2)}</td></tr>`;});
  out.push(panel('ck_t','Chiết khấu & trả lại theo vùng','tỷ đ',h+'</tbody></table></div>','',6));
  out.push(insBox('ck','Nhận định chiết khấu',[
    'Chiết khấu ở đây là phần trả cho khách qua công nợ TK 131 (Nợ 338/336/… – Có 131), không gồm chiết khấu trừ thẳng trên hóa đơn.',
    'Chiết khấu chi trả theo quý / năm (ngoài kế hoạch) dồn vào tháng cuối quý làm % tháng đó tăng — so sánh nên xem theo quý hoặc 12 tháng.']));
  return out;
}

/* ═════════════ 12 · KIỂM SOÁT ═════════════ */
function balFull(D){const Lx=LL();let s=0;for(let i=0;i<X.nC;i++)s+=X.opNo[i]-X.opCo[i];for(let j=0;j<Lx.k.length;j++)if(Lx.d[j]<=D)s+=Lx.a[j];return s;}
function checks(){
  const C_=[],add=(t,v,ok,fix,lv)=>C_.push({t,v,ok,fix,lv:ok?'g':(lv||'y')}),P=X.P,Lx=LL();
  (P.cdps||[]).forEach(r=>{let n=0,c=0;for(let j=0;j<Lx.k.length;j++)if(Lx.d[j]>=r[0]&&Lx.d[j]<=r[1]){if(Lx.v[j])n+=Lx.a[j];else c-=Lx.a[j];}
    const ok=Math.abs(n-r[4])<2&&Math.abs(c-r[5])<2;add(`CĐPS ${dStr(r[0])}–${dStr(r[1])}: phát sinh Nợ / Có = bảng kê`,`Nợ ${fTy(n)} / ${fTy(r[4])} · Có ${fTy(c)} / ${fTy(r[5])} tỷ`,ok,'Nạp lại bảng kê đúng kỳ hoặc kiểm tra bút toán thiếu','r');
    const b=balFull(r[1]),cd=r[6]-r[7];add(`Số dư thuần TK 131 tại ${dStr(r[1])} = CĐPS`,`${fTy(b)} / ${fTy(cd)} tỷ`,Math.abs(b-cd)<2,'Kiểm tra số dư đầu 01/01/2023','r');});
  add('Bút toán chưa có trong bảng phân loại (W_Tên phân tích)',P.unk&&P.unk.length?P.unk.length+' tổ hợp TK/mã GD: '+P.unk.slice(0,4).map(u=>u.key).join(' · '):'Không có',!(P.unk&&P.unk.length),'Bổ sung tổ hợp vào bảng phân loại; tạm xếp vào “Khác”','y');
  const S=SNAP(X.dmax);let nk=0,vk=0,nl=0;for(let i=0;i<X.nC;i++){if(S.net[i]>0.5&&/^Chưa có mã KV|^Mã KV lạ/.test(X.src[i])){nk++;vk+=S.net[i];}}
  add('Khách hàng dư nợ chưa có mã khu vực (xếp vào Không thường xuyên)',nk+' KH · '+fTy(vk)+' tỷ',vk<1e9,'Cập nhật “Khu vực” trong danh mục đối tượng Bravo','y');
  const un=X.BL.filter(b=>b.ci<0);add('Bảo lãnh không khớp tên khách hàng',un.length?un.length+' thư: '+un.slice(0,3).map(b=>b.nm).join(' · '):'Không có',!un.length,'Sửa tên đối tượng ở M_Bảo lãnh cho khớp danh mục','y');
  const g=AG(S,maskLy('all'));add('Tỷ trọng nợ chưa có nguyên tắc hạn nợ (NT00)',fTy(g.cnt)+' tỷ = '+pc(g.open?g.cnt/g.open:null),g.open&&g.cnt/g.open<0.1,'Ban hành nguyên tắc hạn nợ cho kênh Thương mại / Không thường xuyên / Nợ cũ','r');
  const after=(()=>{let n=0,s=0;for(let j=0;j<Lx.k.length;j++)if(Lx.d[j]>X.dmax){n++;s+=Lx.a[j];}return [n,s];})();
  add('Bút toán sau ngày chốt (không đưa vào phân tích)',after[0]?after[0]+' dòng · '+fTy(after[1])+' tỷ (từ '+dStr(X.dmax+1)+')':'Không có',true,'');
  const ref=P.ref||{};
  if(ref.age&&ref.age.rep===X.dmax){const a=ref.age;
    [['Tổng còn nợ',g.open,a.con],['Dự phòng',g.dp,a.dp],['Bảo lãnh trừ',g.blu,a.blt],['Trong hạn (sau BL)',g.inT,a.th],['Quá hạn (sau BL, đúng file)',g.qh,a.qh],['Chưa có nguyên tắc',g.cnt,a.cnt]].forEach(r=>add('Đối soát OUT_BC theo dõi tuổi nợ: '+r[0],fTy(r[1])+' / '+fTy(r[2])+' tỷ',Math.abs(r[1]-r[2])<1000,'Kiểm tra lại công thức sheet W_Tuổi nợ','r'));
    const b0=g.b[0],s=a.b.reduce((x,y)=>x+y,0);if(Math.abs(s+b0-a.con)<1000&&a.b[0]===0)add('Sheet OUT_BC theo dõi tuổi nợ: ô tổng nhóm “< 15 ngày” bị trống',`Engine tính ${fTy(b0)} tỷ; tổng các nhóm còn lại ${fTy(s)} tỷ ≠ tổng còn nợ ${fTy(a.con)} tỷ`,false,'Bổ sung công thức tổng cho cột “Số nợ < 15 ngày” (dòng Tổng cộng) trong file Excel','y');
  }else if(ref.age)add('Đối soát OUT_BC theo dõi tuổi nợ','Ngày báo cáo trong file '+dStr(ref.age.rep)+' khác ngày chốt '+dStr(X.dmax)+' — đổi ngày chốt để đối soát',true,'');
  if(ref.sum&&ref.sum.to===X.dmax){const s=ref.sum,F=FS(s.from,s.to,maskLy('all'));
    [['Bán hàng',F[0],s.ban],['GTGT đầu ra',F[1],s.vat],['Thu tiền',F[6],s.thu],['Trả chiết khấu',F[5],s.ck],['Bù trừ',F[8],s.bt]].forEach(r=>add('Đối soát OUT_Tổng hợp phải thu: '+r[0],fTy(r[1])+' / '+fTy(r[2])+' tỷ',Math.abs(r[1]-r[2])<1000,'Kiểm tra bảng phân loại bút toán','r'));
    add('Đối soát OUT_Tổng hợp phải thu: dư cuối Nợ / Có',fTy(g.dr)+' / '+fTy(s.cn)+' · '+fTy(g.cr)+' / '+fTy(s.cc)+' tỷ',Math.abs(g.dr-s.cn)<1000&&Math.abs(g.cr-s.cc)<1000,'','r');
    {let neg=0,pos=0;for(let i=0;i<X.nC;i++){if(!X.hasHM[i])continue;const d=S.net[i]-X.HM[i];if(d>0.5)pos+=d;}
      if(Math.abs(pos-s.vhm)>1000)add('OUT_Tổng hợp phải thu: ô tổng “Giá trị vượt hạn mức nợ”',`Excel ${fTy(s.vhm)} tỷ ≠ tổng phần vượt thực ${fTy(pos)} tỷ`,false,'Ô tổng đang cộng cả số âm của khách chưa dùng hết hạn mức — đổi công thức dòng tổng thành SUMIF(…,">0")','y');}
    const c12=-FS(AR.ymStart(AR.ymAdd(AR.ymOf(s.to),-11)),s.to,maskLy('all'))[6];
    add('Tiền thu 12 tháng liền kề (OUT_Tổng hợp cột AK)',`Engine ${fTy(c12)} / Excel ${fTy(s.thu12)} tỷ — chênh ${fTy(c12-s.thu12)} tỷ`,Math.abs(c12-s.thu12)<1000,'Chênh do sheet Excel chỉ cộng các khách có trong danh sách OUT_Tổng hợp (khách phát sinh năm 2026); khách chỉ có tiền về T11–T12/2025 bị bỏ sót — nên lấy danh sách KH theo 12 tháng liền kề','y');}
  if(ref.thu&&ref.thu.to<=X.dmax){const c=-FS(ref.thu.from,ref.thu.to,maskLy('all'))[6];add(`Đối soát OUT_BC thu tiền ${dStr(ref.thu.from)}–${dStr(ref.thu.to)}`,fTy(c)+' / '+fTy(ref.thu.tot)+' tỷ',Math.abs(c-ref.thu.tot)<1000,'','r');}
  return C_;
}
function secKS(){
  const out=[],ck=checks(),bad=ck.filter(x=>!x.ok),P=X.P;
  out.push(hero2('ks',`<b>${ck.length}</b> phép kiểm tra tự động · ${bad.length} điểm cần xử lý. Engine tính lại từ ${n0(P.meta.lines||P.meta.rows)} dòng bảng kê (${dStr(P.meta.dmin)} – ${dStr(P.meta.dmax)}), số dư 01/01/2023 của ${(P.op||[]).length} đối tượng — không dùng số của sheet OUT_.`,[
    {l:'Kiểm tra đạt',v:String(ck.length-bad.length),c:'g'},{l:'Cần xử lý',v:String(bad.length),c:bad.length?'y':'g'},{l:'Ngày chốt',v:dStr(X.dmax)}]));
  out.push(panel('ks_c','Kiểm tra toàn vẹn & đối soát với file Excel','Tự chạy mỗi lần nạp file / đổi ngày chốt',`<div class="dql">${ck.map(x=>`<div class="dqi ${x.lv}"><div class="dic ${x.lv}">${ic(x.ok?'check':x.lv==='r'?'alert':'warn')}</div><div class="bd"><b>${esc(x.t)}</b><p>${esc(x.v)}${x.ok||!x.fix?'':' — '+esc(x.fix)}</p></div></div>`).join('')}</div>`,'',3));
  out.push(panel('ks_pp','Phương pháp & định nghĩa','',`<div class="dql">
    <div class="dqi"><div class="dic y">${ic('layers')}</div><div class="bd"><b>Phân loại bút toán</b><p>Mỗi dòng bảng kê có TK 131 ở bên Nợ hoặc Có → 1 dòng công nợ cho đối tượng tương ứng (+ Nợ / − Có). Loại bút toán tra theo tổ hợp TK Nợ – TK Có – Mã giao dịch – Mã chứng từ ở W_Tên phân tích (10 loại: Bán hàng, GTGT, Bán khác, Bán đầu tư, Trả lại, Trả chiết khấu, Thu tiền, Trả tiền, Bù trừ, Khác).</p></div></div>
    <div class="dqi"><div class="dic y">${ic('globe')}</div><div class="bd"><b>Kênh / vùng</b><p>Theo khách hàng: tên khách có trong bảng ngoại lệ (W_Tên phân tích) → kênh ngoại lệ; còn lại theo “Khu vực” trong danh mục đối tượng → bảng quy đổi Mã KV; không có mã → 5. Khác / Không thường xuyên.</p></div></div>
    <div class="dqi"><div class="dic y">${ic('hourglass')}</div><div class="bd"><b>Tuổi nợ FIFO</b><p>Khoản ghi nợ = dòng Nợ 131 của hóa đơn (HD, HC) gom theo số chứng từ + số dư Nợ đầu 01/01/2023. Quỹ thanh toán = mọi phát sinh Có 131 + dư Có đầu kỳ + các dòng Nợ 131 không phải hóa đơn (bù trừ, điều chỉnh). Quỹ trừ vào hóa đơn cũ nhất trước. Tuổi = ngày chốt − ngày chứng từ. Khớp 100% sheet W_Tuổi nợ.</p></div></div>
    <div class="dqi"><div class="dic y">${ic('clock')}</div><div class="bd"><b>Quá hạn</b><p>Hạn theo IN_Thời hạn công nợ; bảo lãnh còn hiệu lực trừ vào hóa đơn cũ nhất; NT04 quá hạn phần vượt 2 tỷ (chứng từ mới nhất); NT05 luôn trong hạn; NT00 ${state.a0?'tạm tính ngày CT + 30 ngày':'không xét'}.</p></div></div>
    <div class="dqi"><div class="dic y">${ic('trend')}</div><div class="bd"><b>DSO · CEI · tỷ lệ thu</b><p>DSO = dư nợ phải thu ÷ doanh số ghi nợ 3 tháng × số ngày. CEI = (dư đầu + doanh số − dư cuối) ÷ (dư đầu + doanh số − nợ trong hạn cuối). Tỷ lệ thu (định nghĩa file) = thu ÷ (phát sinh thuần − thu).</p></div></div>
    <div class="dqi"><div class="dic y">${ic('shield')}</div><div class="bd"><b>Lớp HĐKD / Ngoài HĐKD</b><p>Ngoài HĐKD = kênh 6. Thương mại + CC000552 (chuyển nhượng tài sản) + khách có bán khác / bán đầu tư ≥ 50% doanh số ghi nợ và ≥ 1 tỷ. Mặc định báo cáo xem lớp HĐKD.</p></div></div></div>`,'',3));
  /* CĐPS */
  let h=`<div class="tw"><table><thead><tr><th>Kỳ</th><th>Dư đầu Nợ</th><th>Dư đầu Có</th><th>PS Nợ</th><th>PS Có</th><th>Dư cuối Nợ</th><th>Dư cuối Có</th></tr></thead><tbody>`;
  (P.cdps||[]).forEach(r=>h+=`<tr><td><b>${dStr(r[0])} – ${dStr(r[1])}</b></td>${r.slice(2).map(v=>`<td>${fTy(v)}</td>`).join('')}</tr>`);
  out.push(panel('ks_cd','Cân đối phát sinh TK 131 (IN_CĐPS)','tỷ đ',h+'</tbody></table></div>','',6));
  out.push(insBox('ks','Giới hạn dữ liệu cần biết',[
    'Hạn mức công nợ chỉ có bản hiện hành (không có lịch sử) — so sánh vượt hạn mức các tháng trước dùng hạn mức hiện tại.',
    'Bảo lãnh khớp khách hàng theo tên — tên khác danh mục sẽ không được trừ khi xét quá hạn.',
    'Tháng hiện tại chưa trọn tháng: so sánh luôn lấy cùng số ngày của kỳ so sánh.',
    'Trong Excel, ô tổng “< 15 ngày” ở OUT_BC theo dõi tuổi nợ đang trống; cột tiền thu 12 tháng chỉ tính khách có trong danh sách năm 2026.']));
  return out;
}

/* ═════════════ 13 · NẠP DỮ LIỆU ═════════════ */
function secDL(){
  const out=[],M=X.P.meta;
  out.push(hero2('dl',`Đang dùng <b>${esc(M.file||'')}</b> · ${n0(M.rows)} dòng công nợ (${dStr(M.dmin)} – ${dStr(M.dmax)}) · ngày chốt phân tích <b>${dStr(X.dmax)}</b> · đọc lúc ${new Date(M.gen).toLocaleString('vi-VN',{hour12:false})}.`,[
    {l:'Dòng công nợ',v:n0(M.rows)},{l:'Khách hàng',v:n0(X.P.cid.length)},{l:'Tháng dữ liệu',v:String(X.nM)},{l:'Ngày chốt',v:dStr(X.dmax)}]));
  const mx=M.dmax, opts=[];for(let d=mx;d>=mx-45;d--)opts.push(d);
  const ref=(X.P.ref&&X.P.ref.age)?X.P.ref.age.rep:null;
  out.push(panel('dl_cut','Ngày chốt số liệu','Mọi số dư, tuổi nợ, quá hạn tính tại ngày chốt; bút toán sau ngày chốt bị loại',`<div class="perrow"><label>Ngày chốt <select class="msel wsel" id="selCut">${opts.map(d=>`<option value="${d}"${d===X.dmax?' selected':''}>${dStr(d)}${d===ref?' (ngày báo cáo trong file Excel)':''}${d===mx?' (dữ liệu cuối)':''}</option>`).join('')}</select></label><button class="btn" id="btnCut">Áp dụng</button></div>`,'',2));
  out.push(panel('dl_z','Nạp file Excel mới','Kéo thả hoặc chọn file .xlsb / .xlsx “CMC_Phân tích TK 131”',`<div class="drop" id="dropZone">${ic('upload')}<div><b>Kéo thả file Excel vào đây</b> hoặc <button class="btn" onclick="$('fileIn').click()">Chọn file…</button>
    <div class="psub">Đọc các sheet IN_ / M_ / W_Tên phân tích ngay trên trình duyệt — không cần mạng · file 15 MB ≈ 15–30 giây. Thiếu sheet M_Bảng kê FY23-25 thì giữ lịch sử đang có.</div>
    <label class="ckline" style="margin-top:8px"><input type="checkbox" id="ckRef" ${state.noRef?'':'checked'}> Đọc thêm dòng tổng sheet OUT_ để đối soát (thêm ≈ 20 giây)</label></div></div>`,'',4));
  out.push(panel('dl_s','Sheet đã đọc','',`<div class="srcrow">${(M.sheets||[]).map(s=>`<b>✓</b><span>${esc(s)}</span>`).join('')}${(M.miss||[]).map(s=>`<b style="color:var(--bad)">✕</b><span>${esc(s)} — thiếu</span>`).join('')}</div>`,'',3));
  out.push(insBox('dl','Quy trình cập nhật',[
    'Xuất từ Bravo: bảng kê chứng từ TK 131 năm hiện tại (dán vào IN_Bảng kê chứng từ_FY26), CĐPS TK 131, hạn mức, bảo lãnh, danh mục đối tượng khi có thay đổi.',
    'Mở báo cáo HTML → menu ⋯ → <b>Nạp file Excel</b> (hoặc kéo thả) → hệ thống tự phân loại bút toán, tính tuổi nợ, quá hạn và đối soát với CĐPS.',
    'Kiểm tra mục <b>Kiểm soát số liệu</b> — mọi dòng đối soát CĐPS phải đạt trước khi gửi báo cáo.',
    'Menu ⋯ → <b>Lưu bản HTML hiện tại</b> để gửi / lưu trữ (file đóng gói sẵn số liệu, bố cục và trạng thái xử lý ở mục Phối hợp).'],3));
  return out;
}

/* ═════════════ 14 · PHỐI HỢP LIÊN PHÒNG BAN ═════════════ */
const PBST=['Chưa xử lý','Đang xử lý','Đã xử lý','Không xử lý'];
function pbKey(a){const s=(a.grp+'|'+a.t.replace(/<[^>]+>/g,'')).replace(/[\d.,]+\s*(tỷ|%|ngày|KH|tr)?/g,'');let h=0;for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))|0;return 'pb.'+(h>>>0).toString(36);}
function secPB(){
  const out=[],al=ALERTS().filter(a=>a.own);const by={};
  al.forEach(a=>{const o=a.own.split(' · ')[0];(by[o]=by[o]||[]).push(a);});
  const stOf=a=>TXT[pbKey(a)]||'Chưa xử lý';
  const done=al.filter(a=>stOf(a)==='Đã xử lý').length;
  out.push(hero2('pb',`<b>${al.length}</b> việc cần xử lý, phân cho <b>${Object.keys(by).length}</b> đầu mối · đã xử lý ${done}. Trạng thái được lưu cùng file HTML khi bấm “Lưu bản HTML hiện tại”.`,[
    {l:'Việc cần xử lý',v:String(al.length)},{l:'Đã xử lý',v:String(done),c:'g'},{l:'Đầu mối',v:String(Object.keys(by).length)}]));
  Object.keys(by).sort().forEach((o,ix)=>{let h=`<div class="tw"><table><thead><tr><th>Mức</th><th>Vấn đề</th><th>Giải pháp / việc cần làm</th><th>Trạng thái</th></tr></thead><tbody>`;
    by[o].sort((a,b)=>(a.lv==='r'?0:1)-(b.lv==='r'?0:1)).forEach(a=>{const k=pbKey(a),st=stOf(a);
      h+=`<tr><td>${pill(a.lv==='r'?'Đỏ':'Vàng',a.lv==='r'?'r':'y')}</td><td class="tl" style="white-space:normal;min-width:260px"><b>${esc(a.grp)}</b> · ${a.t}</td><td class="tl" style="white-space:normal;min-width:260px">${a.act||''}${a.own.indexOf(' · ')>0?'<div class="mu">'+esc(a.own)+'</div>':''}</td>
        <td><select class="msel pbst" data-pbk="${k}">${PBST.map(s=>`<option${s===st?' selected':''}>${s}</option>`).join('')}</select></td></tr>`;});
    out.push(panel('pb_'+ix,o,by[o].length+' việc',h+'</tbody></table></div>','',6));});
  out.push(insBox('pb','Nhịp phối hợp đề xuất',[
    '<b>Hằng ngày:</b> Kế toán công nợ nạp bảng kê, gửi danh sách khách quá hạn / ngừng thu cho KD vùng.',
    '<b>Hằng tuần (thứ Hai):</b> họp công nợ 30 phút — KD vùng báo kế hoạch thu cho từng khách cờ đỏ; TCKT chốt danh sách chặn xuất hàng (vượt hạn mức PD2, quá hạn > 90 ngày).',
    '<b>Hằng tháng:</b> đối chiếu xác nhận công nợ với khách ≥ 180 ngày; đánh giá dự phòng; báo cáo Ban TGĐ DSO, CEI, % quá hạn theo kênh.',
    '<b>Quý:</b> rà soát hạn mức, bảo lãnh sắp hết hạn, nguyên tắc hạn nợ cho kênh chưa có (NT00).']));
  return out;
}
const SECFN={tq:secTQ,cb:secCB,xh:secXH,tn:secTN,qh:secQH,tt:secTT,td:secTD,fc:secFC,mt:secMT,kv:secKV,kh:secKH,hm:secHM,ng:secNG,ck:secCK,ks:secKS,dl:secDL,pb:secPB};

/* ══════════════════════════════════════════════════════════════
   CMC · CÔNG NỢ TK 131 — THU TIỀN CHUYÊN SÂU
   (1) Báo cáo thu tiền hằng ngày (như OUT_BC thu tiền 1 & 2) + xuất Word gửi lãnh đạo (ar_word.js)
   (2) Dự báo thu tiền tháng: theo lịch sử ngày trong tháng + từ dưới lên (nợ hiện có × xác suất thu + doanh số mới) + kiểm định ngược
   (3) Khớp tiền thu ↔ bán hàng: số ngày trả thực tế (ADP), trả trễ so hạn (DBT), % đúng hạn, đường cong thu theo tháng bán
   ══════════════════════════════════════════════════════════════ */
const WDN=['CN','T2','T3','T4','T5','T6','T7'];
const fTyS=v=>Math.abs(v)<5e6&&Math.abs(v)>0.5?(v<0?'>−0,01':'<0,01'):fTy(v);
const dom=d=>AR.toD(d).getUTCDate();
const wday=d=>AR.toD(d).getUTCDay();
const isWork=d=>wday(d)!==0;
function workDays(f,t){let n=0;for(let d=f;d<=t;d++)if(isWork(d))n++;return n;}
const mOf=d=>X.mIdx(d);

/* ---------- dữ liệu thu tiền thô (dòng loại Thu tiền) ---------- */
function COLROWS(f,t,mask){mask=mask||MASK();const Lx=LL(),n=Lx.k.length,o=[];let lo=0,hi=n;while(lo<hi){const q=(lo+hi)>>1;if(Lx.d[q]<f)lo=q+1;else hi=q;}
  for(let j=lo;j<n&&Lx.d[j]<=t;j++){if(Lx.t[j]!==6||!mask[Lx.k[j]])continue;o.push(j);}return o;}
/* thu theo ngày cho 1 mặt nạ: mảng theo chỉ số ngày từ f */
function dailyArr(f,t,mask){const a=new Float64Array(t-f+1),Lx=LL();COLROWS(f,t,mask).forEach(j=>a[Lx.d[j]-f]-=Lx.a[j]);return a;}
function billDaily(f,t,mask){mask=mask||MASK();const a=new Float64Array(t-f+1),Lx=LL(),n=Lx.k.length;let lo=0,hi=n;while(lo<hi){const q=(lo+hi)>>1;if(Lx.d[q]<f)lo=q+1;else hi=q;}
  for(let j=lo;j<n&&Lx.d[j]<=t;j++){const ty=Lx.t[j];if(ty>3||!mask[Lx.k[j]])continue;a[Lx.d[j]-f]+=Lx.a[j];}return a;}

/* ---------- KHỚP THU ↔ HÓA ĐƠN: gom theo mặt nạ ---------- */
function MAT(){return X.match();}
function MAGG(f,t,mask){
  mask=mask||MASK();const M=MAT(),o={n:0,c:0,w:0,wb:0,ot:0,pre:0,lag:new Float64Array(7),age:new Float64Array(6),nonInv:0,byC:new Float64Array(X.nC),wC:new Float64Array(X.nC),wbC:new Float64Array(X.nC),otC:new Float64Array(X.nC)};
  const LAGB=[0,15,30,45,60,90];
  for(let j=0;j<M.n;j++){if(M.t[j]!==6)continue;const p=M.pd[j];if(p<f||p>t)continue;const i=M.k[j];if(!mask[i])continue;const a=M.a[j];
    o.c+=a;if(M.op[j]>=2){o.nonInv+=a;continue;}
    const lag=p-M.id[j];o.w+=a*lag;o.byC[i]+=a;o.wC[i]+=a*lag;
    const dbt=isFinite(M.du[j])?Math.max(0,p-M.du[j]):0;o.wb+=a*dbt;o.wbC[i]+=a*dbt;if(dbt<=0){o.ot+=a;o.otC[i]+=a;}
    if(lag<0)o.pre+=a;let z=0;if(lag<=0)z=0;else{z=6;for(let q=1;q<6;q++)if(lag<=LAGB[q]){z=q;break;}}o.lag[z]+=a;
    if(M.op[j]===1)o.age[5]+=a;else{const k=mOf(p)-mOf(M.id[j]);o.age[lag<0?4:Math.min(3,Math.max(0,k))]+=a;}}
  const inv=o.c-o.nonInv;o.adp=inv?o.w/inv:null;o.dbt=inv?o.wb/inv:null;o.otr=inv?o.ot/inv:null;o.prer=inv?o.pre/inv:null;o.inv=inv;return o;}
const LAGN=['Trả trước / cùng ngày','1–15 ngày','16–30','31–45','46–60','61–90','> 90 ngày'];
const AGEN=['HĐ cùng tháng','HĐ tháng trước','HĐ 2 tháng trước','HĐ ≥ 3 tháng trước','Trả trước cho HĐ sau','Nợ đầu kỳ 2023'];
/* đường cong thu theo tháng bán (cohort) */
function COHORT(mask){
  mask=mask||MASK();const k=X._g+'|'+MASK._k;if(!mask._own&&COHORT._k===k&&mask===MASK())return COHORT._v;
  const nM=X.nM,base=new Float64Array(nM),col=Array.from({length:nM},()=>new Float64Array(nM)),clr=Array.from({length:nM},()=>new Float64Array(nM));
  for(let i=0;i<X.nC;i++){if(!mask[i])continue;const T=X.IT[i];for(let q=0;q<T.d.length;q++){if(T.s[q]==='SDDK'||T.d[q]>X.dmax)continue;base[mOf(T.d[q])]+=T.a[q];}}
  const M=MAT();for(let j=0;j<M.n;j++){if(M.op[j]!==0||!mask[M.k[j]])continue;const c=mOf(M.id[j]),p=mOf(M.pd[j]);if(c<0||p<0)continue;const pp=Math.max(p,c);(M.t[j]===6?col:clr)[c][pp]+=M.a[j];}
  const v={base,col,clr};if(mask===MASK()){COHORT._k=k;COHORT._v=v;}return v;}
/* xác suất thu trong tháng theo tuổi tháng của hóa đơn (k = 0…6), lấy 12 tháng trước tháng mục tiêu */
function HAZ(Mi,co){const h=[];for(let k=0;k<=6;k++){let num=0,den=0;for(let m=Mi-12;m<Mi;m++){const c=m-k;if(c<0||m<0)continue;let clr=0;for(let p=c;p<m;p++)clr+=co.col[c][p]+co.clr[c][p];const open=co.base[c]-clr;if(open<=0)continue;num+=co.col[c][m];den+=open;}h.push(den>0?Math.min(1,num/den):null);}
  for(let k=1;k<=6;k++)if(h[k]===null)h[k]=h[k-1]||0;return h;}
/* hồ sơ thu lũy kế theo ngày trong tháng (BQ các tháng đủ) */
function PROFILE(Mi,mask,nb){nb=nb||12;const cs=new Float64Array(32),cnt=[];let n=0;
  for(let m=Math.max(0,Mi-nb);m<Mi;m++){const f=AR.ymStart(X.MS[m]),t=AR.ymEnd(X.MS[m]);if(t>X.dmax)continue;const a=dailyArr(f,t,mask);const tot=a.reduce((x,y)=>x+y,0);if(tot<=0)continue;n++;let c=0;
    for(let d=1;d<=31;d++){if(d-1<a.length)c+=a[d-1];cs[d]+=c/tot;}}
  for(let d=1;d<=31;d++)cs[d]=n?cs[d]/n:d/31;return cs;}
/* tỷ lệ thu trong tháng của hóa đơn phát sinh sau ngày dd và của hóa đơn đã phát sinh đến ngày dd còn mở */
function SAMEMONTH(Mi,dd,mask){let bL=0,cL=0,b0=0,c1=0,c2=0;const M=MAT();
  for(let m=Math.max(0,Mi-12);m<Mi;m++){const f=AR.ymStart(X.MS[m]),t=AR.ymEnd(X.MS[m]),cut=f+dd-1;
    for(let i=0;i<X.nC;i++){if(!mask[i])continue;const T=X.IT[i];for(let q=0;q<T.d.length;q++){const d=T.d[q];if(d<f||d>t||T.s[q]==='SDDK')continue;if(d>cut)bL+=T.a[q];else b0+=T.a[q];}}
    for(let j=0;j<M.n;j++){if(M.t[j]!==6||M.op[j]!==0||!mask[M.k[j]])continue;const id=M.id[j],pd=M.pd[j];if(id<f||id>t||pd>t)continue;
      if(id>cut)cL+=M.a[j];else if(pd<=cut)c1+=M.a[j];else c2+=M.a[j];}}
  return {late:bL>0?cL/bL:0,rest:(b0-c1)>0?c2/(b0-c1):0};}
/* ---------- DỰ BÁO thu tiền tháng chứa ngày D ---------- */
function FCAST(D,mask,salesRest){
  mask=mask||MASK();const Mi=mOf(D),ym=X.MS[Mi],f=AR.ymStart(ym),e=AR.ymEnd(ym),dd=dom(D);
  const co=COHORT(mask),h=HAZ(Mi,co),pr=PROFILE(Mi,mask),sm=SAMEMONTH(Mi,dd,mask);
  const mtd=dailyArr(f,D,mask).reduce((x,y)=>x+y,0);
  const rem=Math.max(0,1-pr[dd]);
  /* nợ hiện có tại D theo tuổi tháng */
  const S=SNAPI(D),M=MAT(),openK=new Float64Array(8),mtdK=new Float64Array(8);
  S.items.forEach(x=>{if(!mask[x.ci])return;const k=x.s==='SDDK'?7:Math.min(7,Mi-mOf(x.d));openK[k]+=x.op;});
  for(let j=0;j<M.n;j++){if(M.t[j]!==6||M.op[j]!==0)continue;const p=M.pd[j];if(p<f||p>D||!mask[M.k[j]])continue;mtdK[Math.min(7,Mi-mOf(M.id[j]))]+=M.a[j];}
  let eOpen=openK[0]*sm.rest;const eK=[eOpen];
  for(let k=1;k<=7;k++){const hk=h[Math.min(6,k)]||0;const v=Math.min(openK[k],hk*rem*(openK[k]+mtdK[k]));eK.push(v);eOpen+=v;}
  const bMTD=billDaily(f,D,mask).reduce((x,y)=>x+y,0);
  const wdDone=workDays(f,D),wdRest=workDays(D+1,e);
  const runRest=wdDone?bMTD/wdDone*wdRest:0;
  const sRest=salesRest===undefined||salesRest===null?runRest:salesRest;
  const eNew=sRest*sm.late;
  const bu=mtd+eOpen+eNew, prof=pr[dd]>0.02?mtd/pr[dd]:null;
  return {D,Mi,ym,f,e,dd,mtd,eOpen,eNew,eK,openK,bu,prof,pr,h,sm,bMTD,runRest,sRest,wdDone,wdRest,rem};
}
/* kiểm định ngược: dự báo tại cùng ngày dd của các tháng trước so với thực tế */
function BACKTEST(dd,mask,n){
  mask=mask||MASK();const k='BT|'+X._g+'|'+MASK._k+'|'+dd;BACKTEST._c=BACKTEST._c||{};if(mask===MASK()&&BACKTEST._c[k])return BACKTEST._c[k];
  const out=[];const last=mOf(X.dmax);
  for(let m=last-1;m>=Math.max(13,last-(n||6));m--){const ym=X.MS[m],f=AR.ymStart(ym),e=AR.ymEnd(ym);const D=Math.min(e,f+dd-1);
    const act=dailyArr(f,e,mask).reduce((x,y)=>x+y,0);const sr=billDaily(D+1,e,mask).reduce((x,y)=>x+y,0);
    const F=FCAST(D,mask,sr);out.push({m,D,act,bu:F.bu,prof:F.prof,mtd:F.mtd});}
  const ok=out.filter(o=>o.act>0&&o.bu>0);const med=a=>{a=a.slice().sort((x,y)=>x-y);return a.length?a[Math.floor(a.length/2)]:1;};
  const cal=med(ok.map(o=>o.act/o.bu));
  /* hiệu chỉnh ngoài mẫu: mỗi tháng kiểm định dùng hệ số tính từ các tháng còn lại */
  out.forEach(o=>{const c=med(ok.filter(x=>x!==o).map(x=>x.act/x.bu));o.buc=o.bu*c;o.fin=nul(o.prof)?o.buc:(o.buc+o.prof)/2;});
  const mape=key=>{const v=out.filter(o=>o.act>0&&!nul(o[key]));return v.length?v.reduce((s,o)=>s+Math.abs(o[key]/o.act-1),0)/v.length:null;};
  const r={rows:out,cal,mBU:mape('buc'),mPR:mape('prof'),mFI:mape('fin')};
  if(mask===MASK())BACKTEST._c[k]=r;return r;
}
function planKey(ym){return 'fc.plan.'+ym+'.'+MASK._k;}
function fcAll(D,mask){
  mask=mask||MASK();const Mi=mOf(D);const pk=planKey(X.MS[Mi]);const plan=TXT[pk]!==undefined?+TXT[pk]:null;
  const f=AR.ymStart(X.MS[Mi]);const bMTD=billDaily(f,D,mask).reduce((x,y)=>x+y,0);
  const F=FCAST(D,mask,plan!==null?Math.max(0,plan*1e9-bMTD):null);const bt=BACKTEST(F.dd,mask,6);
  F.buc=F.bu*bt.cal;F.fin=nul(F.prof)?F.buc:(F.buc+F.prof)/2;F.lo=Math.min(F.buc,F.prof||F.buc);F.hi=Math.max(F.buc,F.prof||F.buc);F.bt=bt;F.plan=plan;return F;}

/* ═════════════ 6b · BÁO CÁO THU TIỀN HẰNG NGÀY ═════════════ */
function tdWin(){const D=X.dmax;let f=state.tdF,t=state.tdT;if(!f||!t||f>t||t>D||f<X.P.meta.dmin){f=AR.ymStart(AR.ymOf(D));t=D;}return {f,t};}
function tdDay(){let d=state.tdD;if(!d||d>X.dmax||d<X.P.meta.dmin)d=X.dmax;return d;}
const dHead=d=>`${dS(d)}<br><span class="mu">${WDN[wday(d)]}</span>`;
function secTD(){
  const out=[],mask=MASK(),W=tdWin(),D=tdDay(),Lx=LL();
  const ym=AR.ymOf(D),mf=AR.ymStart(ym);
  const dayRows=COLROWS(D,D),dTot=dayRows.reduce((s,j)=>s-Lx.a[j],0),dKH=new Set(dayRows.map(j=>Lx.k[j])).size;
  const mtd=dailyArr(mf,D).reduce((x,y)=>x+y,0);
  const pW=shiftWin({f:mf,t:D},1),yW=shiftWin({f:mf,t:D},12);
  const mtdP=dailyArr(pW.f,pW.t).reduce((x,y)=>x+y,0),mtdY=pW.f>=X.P.meta.dmin?dailyArr(yW.f,yW.t).reduce((x,y)=>x+y,0):null;
  const wdMTD=workDays(mf,D),avgD=wdMTD?mtd/wdMTD:null;
  const F=fcAll(D);const remain=Math.max(0,F.fin-mtd),wdRest=workDays(D+1,AR.ymEnd(ym));
  out.push(hero2('td',`Ngày <b>${dStr(D)} (${WDN[wday(D)]})</b>: thu <b>${fTy(dTot)} tỷ</b> từ ${dKH} khách hàng (${dTot>=(avgD||0)?'cao hơn':'thấp hơn'} bình quân ${fTy(avgD)} tỷ/ngày làm việc của tháng). Lũy kế T${ym%100}: <b>${fTy(mtd)} tỷ</b>, ${arw(dPct(mtd,mtdP))} so cùng kỳ tháng trước${mtdY!==null?', '+arw(dPct(mtd,mtdY))+' so cùng kỳ năm trước':''}. Dự báo cả tháng <b>${fTy(F.fin)} tỷ</b> → còn phải thu <b>${fTy(remain)} tỷ</b> trong ${wdRest} ngày làm việc (≈ ${fTy(wdRest?remain/wdRest:null)} tỷ/ngày).`,[
    {l:'Thu ngày '+dS(D),v:fTy(dTot),s:dKH+' KH',c:dTot>=(avgD||0)?'g':'y'},{l:'Lũy kế tháng',v:fTy(mtd),s:arw(dPct(mtd,mtdP))+' so T-1',c:cDn(dPct(mtd,mtdP))},
    {l:'Dự báo tháng',v:fTy(F.fin),s:'đạt '+pc(F.fin?mtd/F.fin:null,0)},{l:'Cần thu / ngày',v:fTy(wdRest?remain/wdRest:null),s:wdRest+' ngày LV còn lại'}]));
  /* chọn ngày & khoảng */
  const days=[];for(let d=X.dmax;d>=Math.max(X.P.meta.dmin,X.dmax-120);d--)days.push(d);
  const opt=(sel)=>days.map(d=>`<option value="${d}"${d===sel?' selected':''}>${dStr(d)} · ${WDN[wday(d)]}</option>`).join('');
  out.push(panel('td_ctl','','',`<div class="perrow tdctl">
    <label>Ngày báo cáo <select class="msel" id="tdD">${opt(D)}</select></label>
    <span class="sep2"></span>
    <label>Bảng chi tiết từ <select class="msel" id="tdF">${opt(W.f)}</select></label><label>đến <select class="msel" id="tdT">${opt(W.t)}</select></label>
    ${seg('tdp',[['m','Tháng của ngày BC'],['w','7 ngày'],['p','Tháng trước']],state.tdp||'m')}
    <button class="btn" id="btnTdWord" title="Tạo file Word báo cáo thu tiền tại ngày báo cáo và lũy kế tháng, kèm biểu đồ & bảng phân tích">${ic('download')} Xuất báo cáo Word</button></div>`,'',6,'bare'));
  /* bản tin ngày */
  const G=GRP('vung',D,{f:D,t:D}).filter(o=>COLL(o.f)>0.5).sort((a,b)=>COLL(b.f)-COLL(a.f));
  const GK={};dayRows.forEach(j=>{const k=X.kenh[Lx.k[j]];GK[k]=(GK[k]||0)-Lx.a[j];});
  const KC={};dayRows.forEach(j=>{KC[Lx.k[j]]=(KC[Lx.k[j]]||0)-Lx.a[j];});const topK=Object.keys(KC).map(i=>({i:+i,v:KC[i]})).sort((a,b)=>b.v-a.v);
  const BK={};dayRows.forEach(j=>{const b=Lx.b[j]>=0?X.P.dic.bank[Lx.b[j]]:'(Không rõ)';BK[b]=(BK[b]||0)-Lx.a[j];});
  const mK={};COLROWS(mf,D).forEach(j=>{const k=X.kenh[Lx.k[j]];mK[k]=(mK[k]||0)-Lx.a[j];});
  let bt=`<div class="brief"><div class="bcol"><h4>Theo kênh — ngày ${dS(D)} · lũy kế tháng</h4><table class="mini"><tbody>${KORDER.filter(k=>GK[k]||mK[k]).map(k=>`<tr><td>${esc(k)}</td><td>${GK[k]?fTyS(GK[k]):'–'}</td><td class="mu">${fTy(mK[k]||0)}</td></tr>`).join('')}<tr class="sum"><td>Tổng</td><td>${fTy(dTot)}</td><td>${fTy(mtd)}</td></tr></tbody></table></div>
    <div class="bcol"><h4>Khách hàng nộp tiền ngày ${dS(D)}</h4><table class="mini"><tbody>${topK.slice(0,10).map(o=>`<tr class="clk" data-kh="${o.i}"><td>${esc(cShort(o.i))}<div class="mu">${esc(X.vung[o.i])}</div></td><td>${fTy(o.v)}</td></tr>`).join('')||'<tr><td class="mu">Không có tiền về</td></tr>'}</tbody></table>${topK.length>10?`<div class="mu" style="margin-top:4px">+ ${topK.length-10} KH khác · ${fTy(topK.slice(10).reduce((s,o)=>s+o.v,0))} tỷ</div>`:''}</div>
    <div class="bcol"><h4>Tiền về theo ngân hàng — ngày ${dS(D)}</h4><table class="mini"><tbody>${Object.keys(BK).sort((a,b)=>BK[b]-BK[a]).map(b=>`<tr><td>${esc(b)}</td><td>${fTy(BK[b])}</td><td class="mu">${pc(dTot?BK[b]/dTot:null,0)}</td></tr>`).join('')||'<tr><td class="mu">—</td></tr>'}</tbody></table></div></div>`;
  out.push(panel('td_brief','Bản tin thu tiền ngày '+dStr(D),'tỷ đ · cột xám = lũy kế tháng đến ngày báo cáo',bt+note(briefNote(D,dTot,mtd,mtdP,F,topK),null,''),'',6));
  /* biểu đồ ngày trong khoảng */
  const nD=W.t-W.f+1, labs=[];for(let d=W.f;d<=W.t;d++)labs.push(dS(d));
  const ks=KORDER.filter(k=>k!=='6. Thương mại'||state.ly!=='hd');const cols=MCOL();
  const ser=ks.map((k,i)=>({n:k,c:cols[i],v:Array.from(dailyArr(W.f,W.t,maskOf(j=>X.kenh[j]===k)))})).filter(s=>s.v.some(v=>v>0));
  const tot=dailyArr(W.f,W.t),bil=billDaily(W.f,W.t);let ca=0,cb=0;const cumC=[],cumB=[];for(let q=0;q<nD;q++){ca+=tot[q];cb+=bil[q];cumC.push(ca);cumB.push(cb);}
  out.push(panel('td_ch',`Thu tiền theo ngày & kênh ${dS(W.f)} – ${dS(W.t)}`,'Cột chồng: tiền thu theo kênh (tỷ đ) · Đường: lũy kế tiền thu và lũy kế doanh số ghi nợ (trục phải)',
    chStack('c_td_ch','h320',labs,ser,fTy1,{u:'tỷ đ',line:{label:'Lũy kế thu',data:cumC,yAxisID:'y1',ax:'y1',f:fTy1,u:'tỷ đ'}})+
    note(dayChartNote(W,tot,bil,ser),null,''),'',6));
  /* bảng KH × ngày (OUT_BC thu tiền 1) */
  out.push(panel('td_kh','Báo cáo thu tiền theo ngày — chi tiết khách hàng',`${dStr(W.f)} – ${dStr(W.t)} · tỷ đ · nhóm theo kênh → vùng (giống sheet OUT_BC thu tiền 1)`,tblKHDay(W),'',6));
  out.push(panel('td_v','Báo cáo thu tiền theo ngày — kênh, vùng & ngân hàng',`${dStr(W.f)} – ${dStr(W.t)} · tỷ đ (giống sheet OUT_BC thu tiền 2)`,tblVDay(W),'',6));
  out.push(insBox('td','Lưu ý khi báo cáo',[
    'Số tiền thu = phát sinh Có TK 131 loại “Thu tiền” theo bảng phân loại W_Tên phân tích (Nợ 111/112 – Có 131) — khớp sheet OUT_BC thu tiền 1 & 2.',
    'Bản tin dùng ngày chốt dữ liệu; nạp bảng kê mới mỗi sáng để số ngày hôm trước đầy đủ (Bravo cập nhật hằng ngày).',
    'Nút “Xuất báo cáo Word” tạo file .docx gửi Ban TGĐ: tóm tắt điều hành, tiền thu tại ngày báo cáo, lũy kế tháng, 4 biểu đồ, bảng theo kênh/vùng/khách hàng/ngân hàng, dự báo và danh sách khách cần đôn đốc.']));
  return out;
}
function briefNote(D,dTot,mtd,mtdP,F,topK){
  const t3=topK.slice(0,3);const sh=dTot?t3.reduce((s,o)=>s+o.v,0)/dTot:0;
  return `Ngày ${dS(D)}: ${t3.length?'3 khách lớn nhất chiếm '+pc(sh,0)+' tiền về ('+t3.map(o=>esc(cShort(o.i))).join(', ')+')':'không có tiền về'}. Lũy kế tháng ${pc(F.fin?mtd/F.fin:null,0)} dự báo; ${mtd>=mtdP?'đang vượt':'đang thấp hơn'} cùng kỳ tháng trước ${fTy(Math.abs(mtd-mtdP))} tỷ.`;}
function dayChartNote(W,tot,bil,ser){
  const n=tot.length;let mx=0,mi=0,z=0;for(let q=0;q<n;q++){if(tot[q]>mx){mx=tot[q];mi=q;}if(tot[q]<=0.5&&isWork(W.f+q))z++;}
  const st=tot.reduce((a,b)=>a+b,0),sb=bil.reduce((a,b)=>a+b,0);const top=ser.slice().sort((a,b)=>b.v.reduce((x,y)=>x+y,0)-a.v.reduce((x,y)=>x+y,0))[0];
  return `Tổng thu ${fTy(st)} tỷ / doanh số ghi nợ ${fTy(sb)} tỷ (${pc(sb?st/sb:null,0)}) → dư nợ ${st>=sb?'giảm':'tăng'} ${fTy(Math.abs(sb-st))} tỷ trong khoảng. Ngày thu cao nhất ${dS(W.f+mi)} (${fTy(mx)} tỷ = ${pc(st?mx/st:null,0)} cả khoảng)${z?'; '+z+' ngày làm việc không có tiền về':''}. Kênh đóng góp lớn nhất: ${top?esc(top.n)+' '+pc(st?top.v.reduce((x,y)=>x+y,0)/st:null,0):'—'}.`;}
function tblKHDay(W){
  const Lx=LL(),rows=COLROWS(W.f,W.t),nD=W.t-W.f+1,C={};
  rows.forEach(j=>{const i=Lx.k[j];(C[i]=C[i]||new Float64Array(nD))[Lx.d[j]-W.f]-=Lx.a[j];});
  const ids=Object.keys(C).map(Number).sort((a,b)=>kOrd(X.kenh[a])-kOrd(X.kenh[b])||vOrd(X.vung[a])-vOrd(X.vung[b])||C[b].reduce((x,y)=>x+y,0)-C[a].reduce((x,y)=>x+y,0));
  const sum=a=>a.reduce((x,y)=>x+y,0),cell=v=>`<td class="num">${v>0.5?fTyS(v):''}</td>`;
  const tot=new Float64Array(nD);ids.forEach(i=>C[i].forEach((v,q)=>tot[q]+=v));
  let h=`<div class="tw tscroll"><table class="dtab"><thead><tr><th class="stk">Kênh / vùng / khách hàng</th><th>Tổng</th>${Array.from({length:nD},(_,q)=>`<th>${dHead(W.f+q)}</th>`).join('')}</tr></thead><tbody>`;
  h+=`<tr class="sum"><td class="stk">Tổng cộng · ${ids.length} KH</td><td class="num">${fTy(sum(tot))}</td>${Array.from(tot).map(cell).join('')}</tr>`;
  let ck='',cv='';
  const grp=(lab,arr,cls)=>`<tr class="${cls}"><td class="stk">${esc(lab)}</td><td class="num">${fTy(sum(arr))}</td>${Array.from(arr).map(cell).join('')}</tr>`;
  ids.forEach(i=>{const k=X.kenh[i],v=X.vung[i];
    if(k!==ck){ck=k;cv='';const a=new Float64Array(nD);ids.filter(x=>X.kenh[x]===k).forEach(x=>C[x].forEach((y,q)=>a[q]+=y));h+=grp(k,a,'g1');}
    if(v!==cv){cv=v;const a=new Float64Array(nD);ids.filter(x=>X.vung[x]===v&&X.kenh[x]===k).forEach(x=>C[x].forEach((y,q)=>a[q]+=y));if(v!==k.replace(/^\d\.\s*/,''))h+=grp('  '+v,a,'g2');}
    h+=`<tr class="clk" data-kh="${i}"><td class="stk tl"><span class="ind">${esc(cShort(i))}</span> <span class="mu">${esc(X.P.cid[i])}</span></td><td class="num"><b>${fTy(sum(C[i]))}</b></td>${Array.from(C[i]).map(cell).join('')}</tr>`;});
  return h+'</tbody></table></div>';
}
function tblVDay(W){
  const Lx=LL(),rows=COLROWS(W.f,W.t),nD=W.t-W.f+1,V={},B={};const tot=new Float64Array(nD);
  rows.forEach(j=>{const i=Lx.k[j],q=Lx.d[j]-W.f,a=-Lx.a[j];const key=X.kenh[i]+'|'+X.vung[i];(V[key]=V[key]||new Float64Array(nD))[q]+=a;const b=Lx.b[j]>=0?X.P.dic.bank[Lx.b[j]]:'(Không rõ)';(B[b]=B[b]||new Float64Array(nD))[q]+=a;tot[q]+=a;});
  const sum=a=>a.reduce((x,y)=>x+y,0),cell=v=>`<td class="num">${v>0.5?fTyS(v):''}</td>`;
  let h=`<div class="tw tscroll"><table class="dtab"><thead><tr><th class="stk">Kênh · vùng</th><th>Tổng</th><th>Tỷ trọng</th>${Array.from({length:nD},(_,q)=>`<th>${dHead(W.f+q)}</th>`).join('')}</tr></thead><tbody>`;
  h+=`<tr class="sum"><td class="stk">Tổng cộng</td><td class="num">${fTy(sum(tot))}</td><td class="num">100%</td>${Array.from(tot).map(cell).join('')}</tr>`;
  Object.keys(V).sort((a,b)=>kOrd(a.split('|')[0])-kOrd(b.split('|')[0])||vOrd(a.split('|')[1])-vOrd(b.split('|')[1])).forEach(k=>{const p=k.split('|');
    h+=`<tr class="clk" data-fv="${esc(p[1])}"><td class="stk tl">${esc(p[1])}${p[1]!==p[0].replace(/^\d\.\s*/,'')?' <span class="mu">'+esc(p[0])+'</span>':''}</td><td class="num"><b>${fTy(sum(V[k]))}</b></td><td class="num">${pc(sum(tot)?sum(V[k])/sum(tot):null)}</td>${Array.from(V[k]).map(cell).join('')}</tr>`;});
  h+=`<tr class="g1"><td class="stk" colspan="${3+nD}">Theo ngân hàng nhận tiền</td></tr>`;
  Object.keys(B).sort((a,b)=>sum(B[b])-sum(B[a])).forEach(b=>h+=`<tr><td class="stk tl">${esc(b)}</td><td class="num"><b>${fTy(sum(B[b]))}</b></td><td class="num">${pc(sum(tot)?sum(B[b])/sum(tot):null)}</td>${Array.from(B[b]).map(cell).join('')}</tr>`);
  return h+'</tbody></table></div>';
}
/* ═════════════ 6c · DỰ BÁO THU TIỀN THÁNG ═════════════ */
function secFC(){
  const out=[],mask=MASK(),D=X.dmax,F=fcAll(D),bt=F.bt,ym=F.ym,lab='T'+(ym%100)+'/'+Math.floor(ym/100);
  const pk=planKey(ym);
  out.push(hero2('fc',`Dự báo thu tiền ${lab}: <b>${fTy(F.fin)} tỷ</b> (khoảng ${fTy(F.lo)} – ${fTy(F.hi)} tỷ). Đã thu ${fTy(F.mtd)} tỷ đến ${dStr(D)} (${pc(F.fin?F.mtd/F.fin:null,0)}); còn ${F.wdRest} ngày làm việc, cần bình quân <b>${fTy(F.wdRest?(F.fin-F.mtd)/F.wdRest:null)} tỷ/ngày</b>. Sai số kiểm định 6 tháng gần nhất: ${pc(bt.mFI,0)} (kết hợp) · ${pc(bt.mBU,0)} (từ dưới lên) · ${pc(bt.mPR,0)} (theo lịch sử ngày).`,[
    {l:'Dự báo tháng',v:fTy(F.fin),s:'tỷ đ'},{l:'Đã thu',v:fTy(F.mtd),s:pc(F.fin?F.mtd/F.fin:null,0)+' dự báo'},{l:'Còn phải thu',v:fTy(Math.max(0,F.fin-F.mtd)),s:F.wdRest+' ngày LV'},{l:'Sai số kiểm định',v:pc(bt.mFI,0),s:'BQ tuyệt đối 6 tháng',c:bt.mFI>0.15?'y':'g'}]));
  /* tham số doanh số */
  out.push(panel('fc_in','','',`<div class="perrow fcin"><span><b>Doanh số ghi nợ dự kiến cả tháng ${lab}</b> (gồm VAT, tỷ đ):</span>
    <input class="msel num" id="fcPlan" type="number" step="0.1" min="0" value="${F.plan!==null?F.plan:''}" placeholder="${nd((F.bMTD+F.runRest)/1e9,1)}">
    <button class="btn" id="btnFcPlan">Áp dụng</button><button class="btn ghost" id="btnFcClr">Dùng nhịp bán hiện tại</button>
    <span class="mu">Đã ghi nợ ${fTy(F.bMTD)} tỷ trong ${F.wdDone} ngày LV · nhịp hiện tại → cả tháng ${fTy(F.bMTD+F.runRest)} tỷ · đang dùng: ${F.plan!==null?'<b>kế hoạch nhập tay</b>':'<b>nhịp bán hiện tại</b>'} → doanh số còn lại ${fTy(F.sRest)} tỷ</span></div>`,'',6,'bare'));
  /* đường đi lũy kế */
  const f=F.f,e=F.e,n=e-f+1,act=dailyArr(f,D),labs=[];for(let d=f;d<=e;d++)labs.push(dS(d));
  const pr=F.pr;let c=0;const cumA=[],cumF=[],cumP=[],cumLo=[],cumHi=[];
  const pD=shiftWin({f,t:e},1),prevA=dailyArr(pD.f,pD.t);let cp=0;
  for(let q=0;q<n;q++){const d=f+q,dd=q+1;if(d<=D){c+=act[q];cumA.push(c);}else cumA.push(null);
    const frac=(pr[Math.min(31,dd)]-pr[F.dd])/Math.max(1e-6,1-pr[F.dd]);
    cumF.push(d>=D?F.mtd+(F.fin-F.mtd)*(d===D?0:frac):null);cumLo.push(d>=D?F.mtd+(F.lo-F.mtd)*(d===D?0:frac):null);cumHi.push(d>=D?F.mtd+(F.hi-F.mtd)*(d===D?0:frac):null);
    cp+=q<prevA.length?prevA[q]:0;cumP.push(q<prevA.length?cp:null);}
  out.push(panel('fc_path',`Lũy kế thu ${lab}: thực tế & đường dự báo`,'tỷ đ · đường vàng = thực tế · nét đứt = dự báo (vùng = khoảng thấp–cao) · xám = tháng trước',
    chLines('c_fc_path','h340',labs,[{n:'Thực tế',v:cumA,c:C.gold,w:3},{n:'Dự báo',v:cumF,c:C.gold,dash:true},{n:'Cận cao',v:cumHi,c:MCOL()[3],dash:true,w:1.2},{n:'Cận thấp',v:cumLo,c:C.bad,dash:true,w:1.2},{n:'Tháng trước',v:cumP,c:C.muted}],fTy1,{u:'tỷ đ'})+
    note(`Theo lịch sử 12 tháng, đến ngày ${F.dd} thường đã thu ${pc(pr[F.dd],0)} tiền cả tháng → phương pháp lịch sử ngày cho ${fTy(F.prof)} tỷ. Phương pháp từ dưới lên cho ${fTy(F.bu)} tỷ, hiệu chỉnh theo kiểm định (×${nd(bt.cal,2)}) còn ${fTy(F.buc)} tỷ. Kết quả dùng = bình quân 2 phương pháp.`,null,''),'',6));
  /* cấu phần dự báo từ dưới lên */
  const kl=['HĐ trong tháng','HĐ tháng trước','2 tháng','3 tháng','4 tháng','5 tháng','6 tháng','> 6 tháng / đầu kỳ'];
  let t=`<div class="tw"><table><thead><tr><th>Nguồn tiền dự kiến</th><th>Dư nợ tại ${dS(D)}</th><th>Xác suất thu<br>trong tháng</th><th>Dự kiến thu<br>đến cuối tháng</th></tr></thead><tbody>`;
  t+=`<tr><td class="tl"><b>Đã thu đến ${dS(D)}</b></td><td></td><td></td><td class="num"><b>${fTy(F.mtd)}</b></td></tr>`;
  kl.forEach((l,k)=>{if(F.openK[k]<0.5)return;const p=k===0?F.sm.rest:(F.h[Math.min(6,k)]||0);t+=`<tr><td class="tl">Nợ hiện có · ${l}</td><td class="num">${fTy(F.openK[k])}</td><td class="num">${pc(p,0)}${k?' × '+pc(F.rem,0)+' tháng còn lại':''}</td><td class="num">${fTy(F.eK[k])}</td></tr>`;});
  t+=`<tr><td class="tl">Doanh số mới đến cuối tháng</td><td class="num">${fTy(F.sRest)}</td><td class="num">${pc(F.sm.late,0)}</td><td class="num">${fTy(F.eNew)}</td></tr>`;
  t+=`<tr class="sum"><td class="tl">Dự báo từ dưới lên</td><td></td><td></td><td class="num">${fTy(F.bu)}</td></tr><tr><td class="tl">× hệ số kiểm định</td><td></td><td class="num">${nd(bt.cal,2)}</td><td class="num">${fTy(F.buc)}</td></tr>
    <tr><td class="tl">Theo lịch sử ngày trong tháng</td><td></td><td class="num">÷ ${pc(pr[F.dd],0)}</td><td class="num">${fTy(F.prof)}</td></tr><tr class="sum"><td class="tl">Dự báo dùng (bình quân)</td><td></td><td></td><td class="num">${fTy(F.fin)}</td></tr>`;
  out.push(panel('fc_bu','Cấu phần dự báo','Xác suất thu = tỷ lệ thu trong tháng của nợ cùng tuổi, 12 tháng trước (đường cong thu nợ) · tỷ đ',t+'</tbody></table></div>'+
    note(`Nợ tháng trước đóng góp nhiều nhất (${fTy(F.eK[1])} tỷ). Hệ số kiểm định ${nd(bt.cal,2)} ${bt.cal>1.05?'> 1: khách thường trả trước / trả thêm ngoài hóa đơn đang mở, mô hình gốc ước thấp':bt.cal<0.95?'< 1: mô hình gốc ước cao':'≈ 1: mô hình gốc sát thực tế'}.`,null,''),'',6));
  /* dự báo theo kênh */
  const ks=KORDER.filter(k=>{for(let i=0;i<X.nC;i++)if(mask[i]&&X.kenh[i]===k&&X.rowsOf[i].length)return true;return false;});
  const KF=ks.map(k=>{const m=maskOf(j=>X.kenh[j]===k);m._own=1;const G=FCAST(D,m,null);const prv=dailyArr(pD.f,pD.t,m).reduce((x,y)=>x+y,0);return {k,G,prv,fin:nul(G.prof)?G.bu*bt.cal:(G.bu*bt.cal+G.prof)/2};});
  let kt=`<div class="tw"><table><thead><tr><th>Kênh</th><th>Đã thu</th><th>Dự báo cả tháng</th><th>% đạt</th><th>Còn phải thu</th><th>Tháng trước (cả tháng)</th><th>Δ so tháng trước</th></tr></thead><tbody>`;
  KF.forEach(o=>kt+=`<tr class="clk" data-fk="${esc(o.k)}"><td class="tl"><b>${esc(o.k)}</b></td><td class="num">${fTy(o.G.mtd)}</td><td class="num"><b>${fTy(o.fin)}</b></td><td class="num">${pc(o.fin?o.G.mtd/o.fin:null,0)}</td><td class="num">${fTy(Math.max(0,o.fin-o.G.mtd))}</td><td class="num">${fTy(o.prv)}</td><td class="num ${cDn(dPct(o.fin,o.prv))}">${arw(dPct(o.fin,o.prv))}</td></tr>`);
  out.push(panel('fc_k','Dự báo theo kênh','Mỗi kênh dự báo riêng theo đường cong thu của kênh; tổng các kênh có thể lệch nhẹ tổng công ty',kt+'</tbody></table></div>'+NT_(`Kênh cần thu nhiều nhất đến cuối tháng: ${KF.slice().sort((a,b)=>(b.fin-b.G.mtd)-(a.fin-a.G.mtd)).slice(0,2).map(o=>'<b>'+esc(o.k)+'</b> '+fTy(Math.max(0,o.fin-o.G.mtd))+' tỷ').join(' · ')}.`),'',6));
  /* kiểm định ngược */
  const R=bt.rows.slice().reverse();
  out.push(panel('fc_bt',`Kiểm định: dự báo tại ngày ${F.dd} so với thực tế cả tháng`,'Chạy lại mô hình ở cùng ngày của 6 tháng trước (doanh số còn lại = thực tế) · tỷ đ',
    chCombo('c_fc_bt','h300',R.map(o=>mLab(o.m)),[{n:'Thực tế',v:R.map(o=>o.act),c:C.gold+'cc'}],[{n:'Dự báo kết hợp',v:R.map(o=>o.fin),c:MCOL()[1]},{n:'Lịch sử ngày',v:R.map(o=>o.prof),c:MCOL()[4],dash:true},{n:'Từ dưới lên (đã hiệu chỉnh)',v:R.map(o=>o.buc),c:MCOL()[3],dash:true}],{fl:fTy1,ul:'tỷ đ'})+
    note(`Sai số tuyệt đối bình quân: kết hợp <b>${pc(bt.mFI,0)}</b>, lịch sử ngày ${pc(bt.mPR,0)}, từ dưới lên ${pc(bt.mBU,0)}. ${bt.mFI<=0.1?'Độ tin cậy tốt để báo cáo.':bt.mFI<=0.2?'Dùng như mức định hướng, cập nhật mỗi ngày.':'Sai số lớn — tháng có khoản thu bất thường (bù trừ, thu nợ lớn) làm lệch; xem lớp HĐKD.'} Hệ số hiệu chỉnh mỗi tháng tính từ 5 tháng còn lại (ngoài mẫu); doanh số còn lại lấy theo thực tế nên sai số thực khi chưa biết doanh số sẽ cao hơn.`,null,''),'',6));
  /* danh sách đến hạn cần thu */
  const S=SNAPI(D),E=AR.ymEnd(ym),by={};
  S.items.forEach(x=>{if(!mask[x.ci])return;const o=by[x.ci]||(by[x.ci]={i:x.ci,ov:0,due:0,n:0,old:9e9});if(x.qd>0)o.ov+=x.af;else if(isFinite(x.due)&&x.due<=E)o.due+=x.af;else return;o.n++;o.old=Math.min(o.old,x.due);});
  const L2=Object.values(by).filter(o=>o.ov+o.due>5e6).sort((a,b)=>(b.ov+b.due)-(a.ov+a.due));
  let dl=tsearch(L2.length,25)+`<div class="tw"><table class="lim"><thead><tr><th>Khách hàng</th><th>Vùng</th><th>Đã quá hạn</th><th>Đến hạn đến ${dS(E)}</th><th>Tổng cần thu</th><th>Hạn sớm nhất</th><th>Lần thu cuối</th></tr></thead><tbody>`;
  L2.forEach((o,ix)=>{const lp=lastPayAt(o.i,D);dl+=`<tr class="clk${ix>=25?' xtra':''}" data-kh="${o.i}"><td class="tl"><b>${esc(cShort(o.i))}</b><div class="mu">${esc(X.P.cid[o.i])}</div></td><td class="tl">${esc(X.vung[o.i])}</td><td class="num r">${o.ov>0.5?fTy(o.ov):''}</td><td class="num">${o.due>0.5?fTy(o.due):''}</td><td class="num"><b>${fTy(o.ov+o.due)}</b></td><td class="num">${dStr(o.old)}</td><td class="num">${lp?dStr(lp):'—'}</td></tr>`;});
  out.push(panel('fc_due',`Danh sách cần thu đến cuối tháng (${L2.length} KH · ${fTy(L2.reduce((s,o)=>s+o.ov+o.due,0))} tỷ)`,'Hóa đơn đã quá hạn + đến hạn trước '+dStr(E)+' (sau bảo lãnh) — giao KD vùng theo dõi hằng ngày',dl+'</tbody></table></div>'+
    note(`${L2.length} khách cần thu ${fTy(L2.reduce((s,o)=>s+o.ov+o.due,0))} tỷ, trong đó đã quá hạn ${fTy(L2.reduce((s,o)=>s+o.ov,0))} tỷ. Nếu thu được 100% danh sách này, tiền thu tháng đạt ${fTy(F.mtd+L2.reduce((s,o)=>s+o.ov+o.due,0))} tỷ (so dự báo ${fTy(F.fin)} tỷ).`,null,''),'',6));
  out.push(insBox('fc','Phương pháp dự báo',[
    '<b>Theo lịch sử ngày trong tháng:</b> lũy kế thực thu ÷ tỷ lệ tiền thu thường đạt đến cùng ngày (bình quân 12 tháng đủ) — đơn giản, phản ánh nhịp thu theo ngày.',
    '<b>Từ dưới lên:</b> nợ đang mở tại ngày chốt theo tuổi tháng × xác suất thu trong tháng của nợ cùng tuổi (đường cong thu nợ 12 tháng) × phần tháng còn lại + doanh số dự kiến còn lại × tỷ lệ thu ngay trong tháng của hóa đơn phát sinh cuối tháng.',
    '<b>Hiệu chỉnh:</b> nhân hệ số = trung vị (thực tế ÷ dự báo) của 6 lần kiểm định; kết quả cuối = bình quân 2 phương pháp; khoảng = giá trị thấp nhất – cao nhất của 2 phương pháp.',
    'Nhập doanh số dự kiến cả tháng khi có kế hoạch bán hàng — mặc định dùng nhịp bán bình quân / ngày làm việc từ đầu tháng.']));
  return out;
}

/* ═════════════ 6d · KHỚP TIỀN THU ↔ BÁN HÀNG ═════════════ */
function secMT(){
  const z=Z(),out=[],A=z.A,B=z.B,mask=MASK(),m=curM();
  const a=MAGG(A.f,A.t),b=MAGG(B.f,B.t),y12=MAGG(AR.ymStart(AR.ymAdd(X.MS[m],-11)),A.t);
  out.push(hero2('mt',`Mỗi đồng thu trong kỳ ${labA()} được khớp với hóa đơn theo nguyên tắc nhập trước – thu trước: khách trả bình quân <b>${fDay(a.adp)} ngày</b> sau ngày hóa đơn (kỳ so sánh ${fDay(b.adp)}), trễ <b>${nd(a.dbt,1)} ngày</b> so hạn; <b>${pc(a.otr,0)}</b> tiền thu là đúng hạn. ${pc(a.inv?a.age[0]/a.inv:null,0)} tiền thu là cho hóa đơn cùng tháng, ${pc(a.inv?(a.age[2]+a.age[3]+a.age[5])/a.inv:null,0)} là nợ từ 2 tháng trở lên.`,[
    {l:'Số ngày trả BQ (ADP)',v:fDay(a.adp),s:'ngày · so '+fDay(b.adp),c:cUp(nul(a.adp)||nul(b.adp)?null:a.adp-b.adp)},{l:'Trễ so hạn BQ (DBT)',v:nd(a.dbt,1),s:'ngày · so '+nd(b.dbt,1),c:cUp(nul(a.dbt)||nul(b.dbt)?null:a.dbt-b.dbt)},
    {l:'% thu đúng hạn',v:pc(a.otr,0),s:'so '+pc(b.otr,0),c:cDn(nul(a.otr)||nul(b.otr)?null:a.otr-b.otr)},{l:'ADP 12 tháng',v:fDay(y12.adp),s:'ngày'}]));
  /* xu hướng ADP / đúng hạn */
  const R=mRange(24),lab=R.map(mLab),S=R.map(i=>MAGG(AR.ymStart(X.MS[i]),X.ME[i]));
  out.push(panel('mt_tr','Số ngày trả thực tế & tỷ lệ thu đúng hạn — 24 tháng','Cột: ADP và DBT (ngày, trục trái) · Đường: % tiền thu đúng hạn (trục phải)',
    chCombo('c_mt_tr','h320',lab,[{n:'ADP (ngày từ hóa đơn đến ngày thu)',v:S.map(o=>o.adp),c:C.gold+'bb',f:fDay},{n:'DBT (ngày trễ so hạn)',v:S.map(o=>o.dbt),c:C.bad+'bb',f:v=>nd(v,1)}],[{n:'% đúng hạn',v:S.map(o=>o.otr),c:MCOL()[1],f:v=>pc(v,0)}],{fb:fDay,ub:'ngày',fl:v=>pc(v,0),y1min:0,y1max:1,band:pband(R[0])})+
    note(mtTrendNote(S,R),null,''),'ADP (Average Days to Pay) = bình quân gia quyền theo tiền (ngày thu − ngày hóa đơn). DBT (Days Beyond Terms) = bình quân số ngày thu sau hạn thanh toán. Hạn theo nguyên tắc hạn nợ của khách.',4));
  out.push(panel('mt_lag','Phân bố tiền thu theo số ngày từ hóa đơn — '+labA(),'tỷ đ',chBarH('c_mt_lag','h320',LAGN.map((n,k)=>({n,v:a.lag[k],c:k===0?C.ok:k<=2?MCOL()[3]:k<=4?C.warn:C.bad})),fTy1,{lab:'Tiền thu',u:'tỷ đ'})+
    note(`${pc(a.inv?(a.lag[0]+a.lag[1]+a.lag[2])/a.inv:null,0)} tiền thu là của hóa đơn ≤ 30 ngày; ${pc(a.inv?a.lag[6]/a.inv:null,0)} là hóa đơn > 90 ngày (thu nợ cũ).`,null,''),'',2));
  /* tiền thu theo tuổi hóa đơn — 12 tháng */
  const R12=mRange(12),S12=R12.map(i=>MAGG(AR.ymStart(X.MS[i]),X.ME[i]));const ac=['#7FB77E','#E9C46A','#F4A261','#E76F51','#5DADE2','#90A4AE'];
  out.push(panel('mt_age','Tiền thu mỗi tháng là trả cho hóa đơn tháng nào','tỷ đ · tách theo tháng phát sinh hóa đơn được khớp',
    chStack('c_mt_age','h320',R12.map(mLab),AGEN.map((n,k)=>({n,c:ac[k],v:S12.map(o=>o.age[k])})).filter(s=>s.v.some(v=>v>0.5)),fTy1,{u:'tỷ đ',band:pband(R12[0])})+
    note(`Kỳ ${labA()}: hóa đơn cùng tháng ${pc(a.inv?a.age[0]/a.inv:null,0)}, tháng trước ${pc(a.inv?a.age[1]/a.inv:null,0)}, ≥ 2 tháng ${pc(a.inv?(a.age[2]+a.age[3])/a.inv:null,0)}, trả trước ${pc(a.inv?a.age[4]/a.inv:null,0)}. Tỷ trọng thu nợ ≥ 2 tháng ${(a.inv&&b.inv&&(a.age[2]+a.age[3])/a.inv>(b.age[2]+b.age[3])/b.inv)?'tăng':'giảm'} so kỳ so sánh.`,null,''),'',6));
  /* đường cong thu theo tháng bán */
  const co=COHORT();const RC=mRange(13).slice(0,-1);
  let h=`<div class="tw"><table class="heat"><thead><tr><th>Tháng bán</th><th>Doanh số ghi nợ</th>${[0,1,2,3,4,5,6].map(k=>`<th>${k===0?'Trong tháng':'+'+k+' tháng'}</th>`).join('')}<th>Còn nợ</th></tr></thead><tbody>`;
  const avg=new Array(7).fill(0),an=new Array(7).fill(0);
  RC.forEach(c=>{const bs=co.base[c];if(bs<1e6)return;let cum=0,clr=0;h+=`<tr><td class="tl"><b>${mLab(c)}</b></td><td class="num">${fTy(bs)}</td>`+[0,1,2,3,4,5,6].map(k=>{const p=c+k;if(p>m)return '<td></td>';cum+=co.col[c][p];clr+=co.clr[c][p];const v=cum/bs;avg[k]+=v;an[k]++;return `<td class="num" style="${heat1(1-v,1,C.bad)}">${pc(v,0)}</td>`;}).join('');
    let cAll=0,clAll=0;for(let p=c;p<X.nM;p++){cAll+=co.col[c][p];clAll+=co.clr[c][p];}h+=`<td class="num">${pc(Math.max(0,1-(cAll+clAll)/bs),0)}</td></tr>`;});
  h+=`<tr class="sum"><td class="tl">Bình quân</td><td></td>${avg.map((v,k)=>`<td class="num">${pc(an[k]?v/an[k]:null,0)}</td>`).join('')}<td></td></tr>`;
  out.push(panel('mt_co','Đường cong thu nợ theo tháng bán (cohort)','% doanh số ghi nợ của tháng đã thu bằng tiền, lũy kế theo số tháng sau khi bán · phần còn lại gồm chiết khấu, trả lại, bù trừ và nợ chưa thu',h+'</tbody></table></div>'+
    note(`Bình quân: ${pc(an[0]?avg[0]/an[0]:null,0)} doanh số được thu ngay trong tháng bán, ${pc(an[1]?avg[1]/an[1]:null,0)} sau 1 tháng, ${pc(an[2]?avg[2]/an[2]:null,0)} sau 2 tháng. Tháng bán có tỷ lệ thấp hơn bình quân ở cùng mốc là tháng có rủi ro đọng nợ — dùng làm đầu vào cho dự báo thu tiền.`,null,''),'',6));
  /* theo vùng */
  const VS={};{const mm=MAT();for(let j=0;j<mm.n;j++){if(mm.t[j]!==6||mm.op[j]>=2)continue;const p=mm.pd[j];if(p<A.f||p>A.t)continue;const i=mm.k[j];if(!mask[i])continue;const v=X.vung[i];const o=VS[v]||(VS[v]={c:0,w:0,wb:0,ot:0,pre:0});const am=mm.a[j],lag=p-mm.id[j];o.c+=am;o.w+=am*lag;const db=isFinite(mm.du[j])?Math.max(0,p-mm.du[j]):0;o.wb+=am*db;if(db<=0)o.ot+=am;if(lag<0)o.pre+=am;}}
  const VB={};{const mm=MAT();for(let j=0;j<mm.n;j++){if(mm.t[j]!==6||mm.op[j]>=2)continue;const p=mm.pd[j];if(p<B.f||p>B.t)continue;const i=mm.k[j];if(!mask[i])continue;const v=X.vung[i];const o=VB[v]||(VB[v]={c:0,w:0});o.c+=mm.a[j];o.w+=mm.a[j]*(p-mm.id[j]);}}
  const vk=Object.keys(VS).sort((x,y)=>vOrd(x)-vOrd(y));
  let vt=`<div class="tw"><table><thead><tr><th>Vùng</th><th>Tiền thu đã khớp</th><th>ADP (ngày)</th><th>ADP kỳ SS</th><th>Δ ngày</th><th>DBT (ngày)</th><th>% đúng hạn</th><th>% trả trước</th></tr></thead><tbody>`;
  const mxA=Math.max.apply(null,vk.map(v=>VS[v].c?VS[v].w/VS[v].c:0).concat([1]));
  vk.forEach(v=>{const o=VS[v],ad=o.c?o.w/o.c:null,ab=VB[v]&&VB[v].c?VB[v].w/VB[v].c:null;vt+=`<tr class="clk" data-fv="${esc(v)}"><td class="tl"><b>${esc(v)}</b></td><td class="num">${fTy(o.c)}</td><td class="num" style="${heat1(ad,mxA,C.warn)}"><b>${fDay(ad)}</b></td><td class="num mu">${fDay(ab)}</td><td class="num ${cUp(nul(ad)||nul(ab)?null:ad-ab)}">${nul(ad)||nul(ab)?'–':sgD(ad-ab)}</td><td class="num">${nd(o.c?o.wb/o.c:null,1)}</td><td class="num">${pc(o.c?o.ot/o.c:null,0)}</td><td class="num">${pc(o.c?o.pre/o.c:null,0)}</td></tr>`;});
  out.push(panel('mt_v','Hành vi thanh toán theo vùng — '+labA(),'Chỉ tiền thu đã khớp được với hóa đơn bán hàng',vt+'</tbody></table></div>'+note(vNote(VS,VB),null,''),'',6));
  /* phân khúc khách hàng: 3 tháng gần nhất so 3 tháng trước */
  const f3=AR.ymStart(AR.ymAdd(AR.ymOf(A.t),-2)),f6=AR.ymStart(AR.ymAdd(AR.ymOf(A.t),-5));
  const n3=MAGG(f3,A.t),p3=MAGG(f6,f3-1);const K=[];
  for(let i=0;i<X.nC;i++){if(!mask[i]||n3.byC[i]<5e7)continue;const ad=n3.wC[i]/n3.byC[i],ab=p3.byC[i]>5e7?p3.wC[i]/p3.byC[i]:null,db=n3.wbC[i]/n3.byC[i],ot=n3.otC[i]/n3.byC[i];
    const sg=db<=1?['Đúng hạn','g']:db<=15?['Chậm nhẹ','y']:db<=45?['Chậm','r']:['Rủi ro cao','r'];K.push({i,ad,ab,db,ot,c:n3.byC[i],sg,tr:nul(ab)?null:ad-ab});}
  const segs={};K.forEach(o=>{const s=segs[o.sg[0]]||(segs[o.sg[0]]={n:0,c:0});s.n++;s.c+=o.c;});
  const W2=K.filter(o=>!nul(o.tr)&&o.c>=1e8&&p3.byC[o.i]>=1e8).sort((a,b)=>b.tr-a.tr).slice(0,20);
  let kt=`<div class="segrow">${['Đúng hạn','Chậm nhẹ','Chậm','Rủi ro cao'].map(s=>`<div class="segc"><span>${s}</span><b>${segs[s]?segs[s].n:0} KH</b><em>${fTy(segs[s]?segs[s].c:0)} tỷ thu 3 tháng</em></div>`).join('')}</div>`;
  kt+=`<div class="tw"><table><thead><tr><th>Khách hàng xấu đi nhanh nhất</th><th>Vùng</th><th>Tiền thu 3 tháng</th><th>ADP 3 tháng gần</th><th>ADP 3 tháng trước</th><th>Δ ngày</th><th>DBT</th><th>% đúng hạn</th><th>Phân khúc</th></tr></thead><tbody>`;
  W2.forEach(o=>kt+=`<tr class="clk" data-kh="${o.i}"><td class="tl"><b>${esc(cShort(o.i))}</b><div class="mu">${esc(X.P.cid[o.i])}</div></td><td class="tl">${esc(X.vung[o.i])}</td><td class="num">${fTy(o.c)}</td><td class="num"><b>${fDay(o.ad)}</b></td><td class="num mu">${fDay(o.ab)}</td><td class="num ${cUp(o.tr)}">${sgD(o.tr)}</td><td class="num">${nd(o.db,1)}</td><td class="num">${pc(o.ot,0)}</td><td class="tl">${pill(o.sg[0],o.sg[1])}</td></tr>`);
  out.push(panel('mt_seg','Phân khúc hành vi thanh toán khách hàng','Khách có tiền thu ≥ 50 triệu trong 3 tháng gần nhất · phân khúc theo số ngày trễ so hạn (DBT) · bảng: 20 khách có số ngày trả tăng mạnh nhất',kt+'</tbody></table></div>'+
    note(`${segs['Rủi ro cao']?segs['Rủi ro cao'].n:0} khách trả trễ > 45 ngày so hạn và ${segs['Chậm']?segs['Chậm'].n:0} khách trễ 16–45 ngày. ${W2[0]?esc(cShort(W2[0].i))+' đang trả chậm thêm '+fDay(W2[0].tr)+' ngày so 3 tháng trước — tín hiệu sớm trước khi thành nợ quá hạn.':''}`,null,''),'',6));
  /* bán hàng vs thu tiền theo ngày trong kỳ */
  const dA=dailyArr(A.f,A.t),bA=billDaily(A.f,A.t);const lb=[];for(let d=A.f;d<=A.t;d++)lb.push(dS(d));let net=0;const nl=[];for(let q=0;q<dA.length;q++){net+=bA[q]-dA[q];nl.push(net);}
  if(lb.length<=124)out.push(panel('mt_day','Bán hàng và thu tiền theo ngày — '+labA(),'Cột: doanh số ghi nợ & tiền thu (tỷ đ) · Đường: chênh lệch lũy kế bán − thu (dư nợ tăng thêm)',
    chCombo('c_mt_day','h300',lb,[{n:'Doanh số ghi nợ',v:Array.from(bA),c:C.muted+'aa'},{n:'Tiền thu',v:Array.from(dA),c:C.gold+'cc'}],[{n:'Bán − thu lũy kế',v:nl,c:C.bad}],{fl:fTy1,ul:'tỷ đ'})+
    note(`Trong kỳ, bán ${fTy(bA.reduce((x,y)=>x+y,0))} tỷ, thu ${fTy(dA.reduce((x,y)=>x+y,0))} tỷ → dư nợ ${net>=0?'tăng':'giảm'} ${fTy(Math.abs(net))} tỷ. ${(()=>{let mx=0,mi=0;nl.forEach((v,q)=>{if(v>mx){mx=v;mi=q;}});return mx>0?'Chênh lệch lớn nhất '+fTy(mx)+' tỷ ngày '+lb[mi]+' — thời điểm dư nợ phình to nhất trong kỳ.':'';})()}`,null,''),'',6));
  out.push(insBox('mt','Cách đọc & khuyến nghị',[
    'Khớp FIFO theo thời gian thực: mỗi khoản giảm nợ (thu tiền, chiết khấu, trả lại, bù trừ) trừ vào hóa đơn còn mở cũ nhất tại ngày phát sinh; tiền về trước khi có hóa đơn được treo và trừ vào hóa đơn kế tiếp (ngày trả âm = trả trước).',
    `ADP ${fDay(a.adp)} ngày và DSO ${fDay(DSOat(A.t))} ngày: DSO cao hơn ADP nhiều nghĩa là có khoản nợ cũ không trả (nằm im trong dư nợ) chứ không phải toàn bộ khách trả chậm.`,
    'Theo dõi hằng tuần nhóm “xấu đi nhanh nhất”: ADP tăng > 10 ngày trong 3 tháng là tín hiệu sớm trước khi khách rơi vào quá hạn > 90 ngày.',
    'Tiền thu không khớp được hóa đơn bán hàng (bán đầu tư, khoản nợ khác) được loại khỏi ADP / DBT.']));
  return out;
}
function mtTrendNote(S,R){const n=S.length;if(n<4)return '';const l=S[n-1],l3=S.slice(-3),p3=S.slice(-6,-3),avg=(a,k)=>{const v=a.filter(o=>!nul(o[k]));return v.length?v.reduce((s,o)=>s+o[k]*o.inv,0)/v.reduce((s,o)=>s+o.inv,0):null;};
  const a3=avg(l3,'adp'),b3=avg(p3,'adp'),o3=avg(l3,'otr'),q3=avg(p3,'otr');
  const best=R[S.reduce((b,o,i)=>!nul(o.adp)&&(nul(S[b].adp)||o.adp<S[b].adp)?i:b,0)],worst=R[S.reduce((b,o,i)=>!nul(o.adp)&&(nul(S[b].adp)||o.adp>S[b].adp)?i:b,0)];
  return `ADP 3 tháng gần nhất ${fDay(a3)} ngày so ${fDay(b3)} ngày 3 tháng trước (${sgD(nul(a3)||nul(b3)?null:a3-b3)}); % đúng hạn ${pc(o3,0)} so ${pc(q3,0)}. Tốt nhất ${mLab(best)}, chậm nhất ${mLab(worst)} trong 24 tháng.`;}
function vNote(VS,VB){const v=Object.keys(VS).filter(k=>VS[k].c>1e9);if(!v.length)return '';const ad=k=>VS[k].w/VS[k].c;const s=v.slice().sort((a,b)=>ad(b)-ad(a));
  const up=v.filter(k=>VB[k]&&VB[k].c>0).map(k=>({k,d:ad(k)-VB[k].w/VB[k].c})).sort((a,b)=>b.d-a.d)[0];
  return `Trả chậm nhất: ${esc(s[0])} ${fDay(ad(s[0]))} ngày; nhanh nhất: ${esc(s[s.length-1])} ${fDay(ad(s[s.length-1]))} ngày.${up&&up.d>2?' Xấu đi nhiều nhất: '+esc(up.k)+' '+sgD(up.d)+' ngày.':''}`;}

/* ═════════════ NHẬN XÉT TỰ ĐỘNG DƯỚI BIỂU ĐỒ ═════════════ */
const NT_=t=>note(t,null,'');
function ageNote(g){const p=k=>g.open?k/g.open:null,b=g.b;const k30=b[0]+b[1],k90=b[4]+b[5]+b[6]+b[7]+b[8];let mx=0;b.forEach((v,i)=>{if(v>b[mx])mx=i;});
  return NT_(`Nợ dưới 30 ngày tuổi ${pc(p(k30),0)}, 30–90 ngày ${pc(p(b[2]+b[3]),0)}, ≥ 90 ngày <b>${pc(p(k90),0)}</b> (${fTy(k90)} tỷ). Nhóm lớn nhất: ${X.BKN[mx]}. ${p(k90)>0.2?'Tỷ trọng nợ ≥ 90 ngày trên 20% — chất lượng nợ ở mức cần cảnh giác.':'Cơ cấu tuổi nợ tập trung ở nợ mới.'}`);}
function yearNote(ts,m,key){const v=ts[key],ym=X.MS[m],mo=ym%100,cur=v[m];const prev=[];for(let y=1;y<=3;y++){const i=X.MS.indexOf(ym-100*y);if(i>=0&&!nul(v[i]))prev.push([Math.floor(ym/100)-y,v[i]]);}
  const f=key==='dso'?fDay:fTy;const u=key==='dso'?' ngày':' tỷ';const yi=X.MS.map((x,i)=>Math.floor(x/100)===Math.floor(ym/100)&&i<=m?i:-1).filter(i=>i>=0&&!nul(v[i]));
  const pk=yi.reduce((a,i)=>v[i]>v[a]?i:a,yi[0]);
  return NT_(`T${mo}/${Math.floor(ym/100)}: <b>${f(cur)}${u}</b> so cùng tháng ${prev.map(p=>p[0]+' '+f(p[1])).join(', ')||'—'}. ${prev.length&&cur>prev[0][1]?'Cao hơn cùng kỳ — không phải do mùa vụ.':'Thấp hơn hoặc bằng cùng kỳ.'} Đỉnh năm nay: ${mLab(pk)} (${f(v[pk])}${u}).`);}
function dsoNote(ts,m){const d=ts.dso[m],b=ts.bp[m],add=nul(d)||nul(b)?null:d-b,i12=Math.max(0,m-12);
  return NT_(`DSO ${fDay(d)} ngày = DSO tốt nhất có thể (BPDSO, chỉ tính nợ trong hạn) ${fDay(b)} ngày + <b>số ngày trễ bình quân (ADD) ${fDay(add)} ngày</b>. ADD 12 tháng trước: ${fDay(nul(ts.dso[i12])||nul(ts.bp[i12])?null:ts.dso[i12]-ts.bp[i12])} ngày. ${add>10?'Phần lớn vòng quay chậm do nợ quá hạn, không phải do điều khoản bán hàng.':'Vòng quay chủ yếu do điều khoản bán hàng.'} CEI tháng ${pc(ts.cei[m],0)}.`);}
function seasonNote(me,ys,m){const by=new Array(12).fill(0),n=new Array(12).fill(0);me[1].forEach((v,i)=>{if(i>m||nul(v))return;const mo=X.MS[i]%100-1;by[mo]+=v;n[mo]++;});
  const av=by.map((s,i)=>n[i]?s/n[i]:null);const ix=av.map((v,i)=>i).filter(i=>!nul(av[i]));const hi=ix.reduce((a,i)=>av[i]>av[a]?i:a,ix[0]),lo=ix.reduce((a,i)=>av[i]<av[a]?i:a,ix[0]);
  return NT_(`${me[0]} bình quân các năm cao nhất ở <b>T${hi+1}</b> (${me[2](av[hi])}) và thấp nhất ở <b>T${lo+1}</b> (${me[2](av[lo])}). Khi so sánh tháng có tính mùa vụ, ưu tiên so cùng kỳ năm trước.`);}
function yoyNote(ts,R){let up=0;R.forEach(i=>{const j=X.MS.indexOf(X.MS[i]-100);if(j>=0&&ts.dr[i]>ts.dr[j])up++;});return NT_(`${up}/${R.length} tháng gần nhất có dư nợ cao hơn cùng kỳ năm trước${up>=R.length*0.75?' — xu hướng tăng dư nợ mang tính hệ thống, cần xem lại chính sách bán chịu':''}.`);}
function bktNote(g,gB){let mi=0,mv=-Infinity;g.b.forEach((v,k)=>{const d=v-gB.b[k];if(d>mv){mv=d;mi=k;}});return NT_(`Nhóm tăng mạnh nhất so ${dStr(Z().B.t)}: <b>${X.BKN[mi]}</b> ${sgV(mv)} tỷ. Tổng nợ ≥ 180 ngày ${sgV(g.b180-gB.b180)} tỷ.`);}
function grpTopNote(G,key,lab,fmt){const s=G.slice().sort((a,b)=>b[key]-a[key]).filter(o=>o[key]>0.5);if(!s.length)return '';const tot=G.reduce((x,o)=>x+o[key],0);
  return NT_(`${s.slice(0,3).map(o=>'<b>'+esc(o.g)+'</b> '+(fmt||fTy)(o[key])).join(' · ')} — 3 ${lab} này chiếm ${pc(tot?s.slice(0,3).reduce((x,o)=>x+o[key],0)/tot:null,0)} tổng.`);}
function ovTrendNote(ts,R){const a=R[0],b=R[R.length-1];const r=i=>ts.open[i]?ts.ov[i]/ts.open[i]:null;return NT_(`% quá hạn ${pc(r(a),0)} (${mLab(a)}) → <b>${pc(r(b),0)}</b> (${mLab(b)}); quá hạn > 90 ngày ${fTy(ts.ov90[a])} → ${fTy(ts.ov90[b])} tỷ. ${ts.ov90[b]>ts.ov90[a]*1.2?'Phần quá hạn lâu đang tích tụ.':'Phần quá hạn lâu không tăng đáng kể.'}`);}
function qbNote(g){const t=g.qb.reduce((a,b)=>a+b,0);return NT_(`Trong ${fTy(t)} tỷ quá hạn: 1–30 ngày ${pc(t?g.qb[0]/t:null,0)} (thường là chậm vài ngày so hạn, dễ thu), > 90 ngày ${pc(t?(g.qb[3]+g.qb[4])/t:null,0)} (cần biện pháp thu hồi).`);}
function wdNote(wo,wsum,wcnt){const av=wo.map(w=>({w,v:wcnt[w]?wsum[w]/wcnt[w]:0}));const s=av.slice().sort((a,b)=>b.v-a.v);const tot=av.reduce((x,o)=>x+o.v,0);
  return NT_(`Ngày thu mạnh nhất: <b>${WD[s[0].w]}</b> (${fTy(s[0].v)} tỷ/ngày); yếu nhất ngày làm việc: ${WD[s.filter(o=>o.w!==0)[s.filter(o=>o.w!==0).length-1].w]}. Thứ Bảy chiếm ${pc(tot?av.find(o=>o.w===6).v/tot:null,0)} — có thể dùng để xếp lịch nhắc nợ đầu tuần.`);}
function calNote(f,t,o){const v=[];let z=0;for(let d=f;d<=t;d++){const x=o[d]||0;if(isWork(d)){v.push(x);if(x<=0.5)z++;}}v.sort((a,b)=>b-a);const tot=v.reduce((a,b)=>a+b,0);
  return NT_(`${v.length} ngày làm việc, ${z} ngày không có tiền về. 10% số ngày thu lớn nhất mang về ${pc(tot?v.slice(0,Math.ceil(v.length/10)).reduce((a,b)=>a+b,0)/tot:null,0)} tiền thu — dòng tiền tập trung vào vài ngày (đầu tháng, sau hạn mùng 10/15).`);}
function bankNote(bA2,bt,cA){if(!bt.length)return '';return NT_(`${esc(bt[0])} nhận nhiều nhất ${pc(cA?bA2[bt[0]]/cA:null,0)}; ${bt.length} ngân hàng nhận tiền. Cân đối số dư theo ngân hàng khi lập kế hoạch trả nợ vay / thanh toán.`);}
function bubNote(G){const hi=G.filter(o=>!nul(o.dso)&&o.dso>45&&o.ovr>0.2);return NT_(`${hi.length} vùng nằm ở góc rủi ro (DSO > 45 ngày và quá hạn > 20%)${hi.length?': '+hi.map(o=>esc(o.g)).join(', '):''}. Vùng góc trái dưới là vùng thu tốt.`);}
function kdsoNote(ser,R){const l=R.length-1;const s=ser.filter(x=>!nul(x.v[l])).sort((a,b)=>b.v[l]-a.v[l]);if(!s.length)return '';const ch=s.map(x=>({n:x.n,d:nul(x.v[0])?null:x.v[l]-x.v[0]})).filter(o=>!nul(o.d)).sort((a,b)=>b.d-a.d);
  return NT_(`DSO cao nhất: <b>${esc(s[0].n)}</b> ${fDay(s[0].v[l])} ngày; thấp nhất ${esc(s[s.length-1].n)} ${fDay(s[s.length-1].v[l])} ngày.${ch[0]?' Tăng nhiều nhất 24 tháng: '+esc(ch[0].n)+' '+sgD(ch[0].d)+' ngày.':''}`);}
function parNote(P,tot){const p=P.slice(0,5).reduce((s,o)=>s+o.dr,0);const ov=P.slice(0,20).reduce((s,o)=>s+o.ov,0);return NT_(`5 khách lớn nhất chiếm ${pc(tot?p/tot:null,0)} dư nợ; trong top 20 có ${fTy(ov)} tỷ quá hạn. Mất 1 khách lớn ảnh hưởng ngay đến dòng tiền — cần hạn mức và bảo lãnh tương xứng.`);}
function rmNote(RS){const r=RS.filter(o=>o.tag.some(t=>t[1]==='r'));return NT_(`${r.length}/${RS.length} khách dư nợ trên 200 triệu gắn cờ đỏ, tổng dư nợ ${fTy(r.reduce((s,o)=>s+o.dr,0))} tỷ. Ưu tiên xử lý các điểm ở góc phải trên (nợ lớn, quá hạn lâu).`);}
function hmcNote(T){const a=T.filter(o=>o.hm>0&&o.p>2);return NT_(`${a.length} khách dư nợ gấp trên 2 lần hạn mức${a.length?': '+a.slice(0,4).map(o=>esc(cShort(o.i))).join(', '):''} — hạn mức không còn tác dụng kiểm soát, cần chặn bán chịu hoặc điều chỉnh hạn mức có bảo lãnh.`);}
function covNote(G){const d=G.reduce((s,o)=>s+o.dr,0),b=G.reduce((s,o)=>s+o.blu,0);return NT_(`Bảo lãnh che ${fTy(b)} tỷ = ${pc(d?b/d:null,1)} dư nợ — phần lớn dư nợ không có tài sản bảo đảm.`);}
function ngNote(tH,tN,R){const l=R[R.length-1],f=R[0];return NT_(`Ngoài HĐKD: ${fTy(tN.dr[f])} → ${fTy(tN.dr[l])} tỷ; HĐKD: ${fTy(tH.dr[f])} → ${fTy(tH.dr[l])} tỷ trong 36 tháng.`);}
function ngdNote(tH,tA,R){const l=R[R.length-1];return NT_(`Tại ${mLab(l)}, DSO toàn bộ ${fDay(tA.dso[l])} ngày so HĐKD ${fDay(tH.dso[l])} ngày — chênh ${fDay(nul(tA.dso[l])||nul(tH.dso[l])?null:tA.dso[l]-tH.dso[l])} ngày do khoản ngoài hoạt động bán hàng.`);}
function ckNote(ms,m){const s=(k,a,b)=>{let x=0;for(let i=Math.max(0,a);i<=b;i++)x+=ms[k][i];return x;};const r1=-s(5,m-11,m)/s(0,m-11,m),r0=-s(5,m-23,m-12)/s(0,m-23,m-12);
  return NT_(`Chiết khấu 12 tháng gần nhất ${pc(r1,2)} doanh thu so ${pc(r0,2)} 12 tháng trước (${sgD((r1-r0)*100)} điểm %). Tháng cuối quý thường cao do chi trả chiết khấu quý.`);}
function ckvNote(rows){if(!rows.length)return '';return NT_(`Cao nhất ${esc(rows[0].n)} ${nd(rows[0].v,2)}%, thấp nhất ${esc(rows[rows.length-1].n)} ${nd(rows[rows.length-1].v,2)}% — chênh lệch lớn cần đối chiếu với chính sách chiết khấu từng vùng.`);}
