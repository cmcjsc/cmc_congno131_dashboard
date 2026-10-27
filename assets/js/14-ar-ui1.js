/* ══════════════════════════════════════════════════════════════
   CMC · PHÂN TÍCH CÔNG NỢ & THU TIỀN TK 131 — lớp nền
   kỳ phân tích, bộ lọc lớp / kênh / vùng, gom số, định dạng, thành phần, biểu đồ
   (khai báo SAU engine chung — dùng lại state / C / panel / cbox / baseOpt / DL / TT …)
   ══════════════════════════════════════════════════════════════ */
var KHID={},KORD={};
let KREG=[], DRS=[], DRF=[], SRCR=[];
let X=null;                                   /* ngữ cảnh tính (AR.ctx) */
let PDATA=null;                               /* khối dữ liệu gọn đã giải nén (AR.pack) */
Object.assign(ICO,{
  coin:'<ellipse cx="12" cy="6.5" rx="7.5" ry="3"/><path d="M4.5 6.5v5c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-5"/><path d="M4.5 11.5v5c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-5"/>',
  hourglass:'<path d="M6 3h12M6 21h12"/><path d="M7 3c0 5 10 6 10 9s-10 4-10 9"/><path d="M17 3c0 5-10 6-10 9s10 4 10 9"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
  layers:'<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/><path d="m3 17.5 9 4.5 9-4.5" opacity=".6"/>',
  grid:'<rect x="3.5" y="3.5" width="7" height="7" rx="1.2"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.2"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.2"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.2"/>',
  shield:'<path d="M12 3 4.5 6v6c0 4.4 3.2 7.6 7.5 9 4.3-1.4 7.5-4.6 7.5-9V6z"/><path d="m8.8 12 2.2 2.2 4.2-4.4"/>',
  users:'<circle cx="9" cy="8" r="3.4"/><path d="M2.5 20c.6-3.6 3.3-5.6 6.5-5.6s5.9 2 6.5 5.6"/><circle cx="17" cy="9" r="2.6"/><path d="M16 14.6c2.8.1 4.8 1.9 5.3 5.4"/>',
  tag:'<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8" r="1.4"/>',
  cal2:'<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  hand:'<path d="M7 11V6.5a1.5 1.5 0 0 1 3 0V11"/><path d="M10 10V4.5a1.5 1.5 0 0 1 3 0V10"/><path d="M13 10V5.5a1.5 1.5 0 0 1 3 0V12"/><path d="M16 9.5a1.5 1.5 0 0 1 3 0V14a7 7 0 0 1-7 7h-.5A6.5 6.5 0 0 1 6 18l-2.6-4.3a1.6 1.6 0 0 1 2.6-1.9L7 13"/>',
  pct:'<path d="M19 5 5 19"/><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="17" r="2.5"/>',
  book:'<path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H20v15H5.5A1.5 1.5 0 0 0 4 19.5z"/><path d="M4 19.5A1.5 1.5 0 0 0 5.5 21H20"/><path d="M8 7h8M8 11h6"/>',
  x:'<path d="M6 6l12 12M18 6 6 18"/>', right:'<path d="m9 5 7 7-7 7"/>'
});
const LSK2='cmc_ar131_v1';

/* ---------- trạng thái riêng ---------- */
state.pal='hkdem'; state.mode='dark'; state.fx='glass'; state.fxc='shimmer'; state.sec='tq';
state.u='ty';                    /* ty = tỷ đồng · tr = triệu đồng */
state.lv={ty:0,tr:0};
state.ly='hd';                   /* lớp: hd = HĐKD · all = Toàn bộ · ng = Ngoài HĐKD */
state.fk=''; state.fv='';        /* lọc kênh / vùng */
state.mi=null;                   /* chỉ số tháng phân tích (null = tháng cuối) */
state.pm='m';                    /* kỳ: m tháng · q quý · ytd lũy kế năm · r12 12 tháng · c từ ngày – đến ngày */
state.cf=null; state.ct=null;   /* khoảng ngày tự chọn (serial Excel) */
state.cmp='prev';                /* so sánh: prev kỳ liền trước · yoy cùng kỳ năm trước */
state.a0=1;                      /* 1 = NT00 tạm tính hạn 30 ngày (đã chốt) · 0 = giữ đúng file (không xét quá hạn) */
state.kh=null;                   /* khách hàng đang xem (hồ sơ) */
state.khq='';                    /* ô tìm khách hàng */
state.ksort='dr';
state.dcut=null;                 /* ngày chốt số liệu (serial Excel) */

/* ---------- định dạng ---------- */
const MONTHS=()=>X.MS;
function mLab(i){const ym=MONTHS()[i];if(ym===undefined)return '?';return 'T'+(ym%100)+'/'+String(Math.floor(ym/100)).slice(2);}
function mLabL(i){const ym=MONTHS()[i];return 'Tháng '+(ym%100)+'/'+Math.floor(ym/100);}
const dStr=s=>{if(nul(s)||!isFinite(s))return '–';const d=AR.toD(s);return String(d.getUTCDate()).padStart(2,'0')+'/'+String(d.getUTCMonth()+1).padStart(2,'0')+'/'+d.getUTCFullYear();};
const dS=s=>{const d=AR.toD(s);return String(d.getUTCDate()).padStart(2,'0')+'/'+String(d.getUTCMonth()+1).padStart(2,'0');};
const dSy=s=>{const d=AR.toD(s);return dS(s)+'/'+String(d.getUTCFullYear()).slice(2);};
const nz=t=>(t==='-0'||t==='−0')?'0':t;
const fTy=v=>nul(v)?'–':nz(nfd(2).format(v/1e9));
const fTy1=v=>nul(v)?'–':nz(nfd(1).format(v/1e9));
const fTr=v=>nul(v)?'–':nz(nfd(0).format(v/1e6));
const UVIEW={ty:{n:'Tỷ đồng',ax:'tỷ đ',ico:'coin',f:fTy,d:1e9},tr:{n:'Triệu đồng',ax:'tr đ',ico:'wallet',f:fTr,d:1e6}};
const fV=v=>UVIEW[state.u].f(v);
const UA=()=>UVIEW[state.u].ax;
const fVu=v=>fV(v)+' '+UA();
const fDay=v=>nul(v)?'–':nfd(0).format(v);
const sgV=v=>nul(v)?'–':(v>0?'+':v<0?'−':'')+fV(Math.abs(v));
const sgD=v=>nul(v)?'–':(v>0?'+':v<0?'−':'')+nfd(1).format(Math.abs(v));
const sgP=v=>nul(v)?'–':(v>0?'+':v<0?'−':'')+nfd(1).format(Math.abs(v*100))+' đ%';
function dPct(a,b){return (nul(a)||nul(b)||!b)?null:(a-b)/Math.abs(b);}
/* công nợ: TĂNG dư nợ / quá hạn / DSO là xấu (đỏ) — tiền thu tăng là tốt */
const cUp=v=>nul(v)||Math.abs(v)<1e-9?'n':(v>0?'r':'g');
const cDn=v=>nul(v)||Math.abs(v)<1e-9?'n':(v>0?'g':'r');
function chipP(lab,a,b,good){const d=dPct(a,b);const c=nul(d)||Math.abs(d)<0.005?'n':((d>0)===(good==='up')?'g':'r');
  return {l:lab,s:lab.replace(/^So /,''),v:nul(d)?'–':(d>0?'▲ ':'▼ ')+sg(d),c};}
function chipA(lab,a,b,fmt,good){const d=(nul(a)||nul(b))?null:a-b;const c=nul(d)||Math.abs(d)<1e-9?'n':((d>0)===(good==='up')?'g':'r');
  return {l:lab,s:lab.replace(/^So /,''),v:nul(d)?'–':(d>0?'▲ +':'▼ −')+fmt(Math.abs(d)),c};}
function UL(){return {ax:UA(),lb:UVIEW[state.u].n};}
function UN(){return UVIEW[state.u].n;}
const LYN={hd:'HĐKD',all:'Toàn bộ',ng:'Ngoài HĐKD'};

/* ---------- KỲ PHÂN TÍCH ---------- */
function custW(){let t=Math.min(state.ct||X.dmax,X.dmax),f=state.cf||AR.ymStart(AR.ymOf(t));f=Math.max(f,AR.ymStart(X.MS[0]),X.P.meta.dmin);if(f>t)f=t;return {f,t};}
function curM(){const n=X.nM;if(state.pm==='c'){const m=X.mIdx(custW().t);return m<0?n-1:m;}let m=state.mi;if(m===null||m===undefined||m<0||m>=n)m=n-1;return m;}
const isME=d=>AR.eom(d)===d;
function winA(){const m=curM(),ym=X.MS[m];if(state.pm==='c'){const w=custW();return {f:w.f,t:w.t,m,ym};}const t=X.ME[m];let f;
  if(state.pm==='q'){const q0=Math.floor(ym/100)*100+(Math.floor((ym%100-1)/3)*3+1);f=AR.ymStart(q0);}
  else if(state.pm==='ytd')f=AR.ymStart(Math.floor(ym/100)*100+1);
  else if(state.pm==='r12')f=AR.ymStart(AR.ymAdd(ym,-11));
  else f=AR.ymStart(ym);
  return {f:Math.max(f,AR.ymStart(X.MS[0])),t,m,ym};}
function shiftWin(w,k){
  const yf=AR.ymAdd(AR.ymOf(w.f),-k), yt=AR.ymAdd(AR.ymOf(w.t),-k), dd=AR.toD(w.t).getUTCDate();
  const t=isME(w.t)?AR.ymEnd(yt):Math.min(AR.ymEnd(yt),AR.ser(Math.floor(yt/100),yt%100,dd));
  return {f:AR.ymStart(yf),t};}
/* dời 1 ngày serial sang năm trước, giữ ngày trong tháng (29/2 → 28/2) */
function yAgo(d){const x=AR.toD(d),y=x.getUTCFullYear()-1,m=x.getUTCMonth()+1;return Math.min(AR.ser(y,m,x.getUTCDate()),AR.ymEnd(y*100+m));}
function winB(){const A=winA();if(state.pm==='c'){if(state.cmp==='yoy')return {f:yAgo(A.f),t:yAgo(A.t)};const n=A.t-A.f+1;return {f:A.f-n,t:A.f-1};}const k=state.cmp==='yoy'?12:({m:1,q:3,ytd:12,r12:12}[state.pm]||1);return shiftWin(A,k);}
const partial=w=>!isME(w.t);
function wLab(w,short){
  if(state.pm==='c'){if(w.f===w.t)return dSy(w.t);return (AR.toD(w.f).getUTCFullYear()===AR.toD(w.t).getUTCFullYear()?dS(w.f):dSy(w.f))+'–'+dSy(w.t);}
  const yf=AR.ymOf(w.f),yt=AR.ymOf(w.t),p=partial(w);
  const ml=ym=>'T'+(ym%100)+'/'+String(Math.floor(ym/100)).slice(2);
  let s=yf===yt?ml(yt):ml(yf)+'–'+ml(yt);
  if(p&&!short)s+=' (đến '+dS(w.t)+')';
  return s;}
const PMN={m:'Tháng',q:'Quý',ytd:'Lũy kế năm',r12:'12 tháng'};
const CMNc={prev:'Cùng số ngày liền trước',yoy:'Cùng kỳ năm trước'};
const CMN={prev:'Kỳ liền trước',yoy:'Cùng kỳ năm trước'};
function labA(){return wLab(winA());}
function labB(){return wLab(winB());}
function labBs(){return wLab(winB(),1);}
const PER=()=>labA()+' so '+labB();
const DCUT=()=>X.dmax;

/* ---------- LỌC LỚP / KÊNH / VÙNG ---------- */
function MASK(){
  const k=state.ly+'|'+state.fk+'|'+state.fv+'|'+X._g;
  if(MASK._k===k)return MASK._m;
  const m=new Uint8Array(X.nC);
  for(let i=0;i<X.nC;i++){
    if(state.ly==='hd'&&X.layer[i])continue; if(state.ly==='ng'&&!X.layer[i])continue;
    if(state.fk&&X.kenh[i]!==state.fk)continue; if(state.fv&&X.vung[i]!==state.fv)continue;
    m[i]=1;}
  MASK._k=k;MASK._m=m;return m;
}
function maskLy(ly){const m=new Uint8Array(X.nC);for(let i=0;i<X.nC;i++){if(ly==='hd'&&X.layer[i])continue;if(ly==='ng'&&!X.layer[i])continue;m[i]=1;}return m;}
function fLab(){return LYN[state.ly]+(state.fv?' · '+state.fv:(state.fk?' · '+state.fk:''));}

/* ---------- ẢNH CHỤP TUỔI NỢ & GOM SỐ ---------- */
const SNC={};
function SNAP(D){const i=X.ME.indexOf(D);if(i>=0)return X.SN[i];const k=X._g+'|'+D;return SNC[k]||(SNC[k]=X.snap(D,false));}
function SNAPI(D){const k=X._g+'|I|'+D;return SNC[k]||(SNC[k]=X.snap(D,true));}
const OVA=(S,i)=>state.a0?S.qhA[i]:S.qh[i];
function AG(S,mask){
  mask=mask||MASK();
  const o={net:0,dr:0,cr:0,open:0,b:new Array(9).fill(0),dp:0,bl:0,blu:0,inT:0,qh:0,cnt:0,qhA:0,cntOv:0,qb:new Array(5).fill(0),nKH:0,nOv:0,nCr:0,ov:0,ov90:0,b180:0};
  for(let i=0;i<X.nC;i++){if(!mask[i])continue;const n=S.net[i];o.net+=n;if(n>0)o.dr+=n;else if(n<0){o.cr-=n;if(n<-0.5)o.nCr++;}
    if(S.open[i]>0.5){o.nKH++;o.open+=S.open[i];for(let z=0;z<9;z++)o.b[z]+=S.b[z][i];o.dp+=S.dp[i];o.blu+=S.blu[i];o.inT+=S.inT[i];o.qh+=S.qh[i];o.cnt+=S.cnt[i];o.qhA+=S.qhA[i];o.cntOv+=S.cntOv[i];
      for(let z=0;z<5;z++)o.qb[z]+=S.qb[z][i];if(OVA(S,i)>0.5)o.nOv++;}
    o.bl+=S.bl[i];}
  o.ov=state.a0?o.qhA:o.qh; o.ov90=o.qb[3]+o.qb[4]; o.b180=o.b[5]+o.b[6]+o.b[7]+o.b[8];
  return o;
}
/* dòng tiền theo cửa sổ ngày — mảng [KH × loại] */
const FWC={};
function FW(f,t){
  const k=X._g+'|'+f+'|'+t; if(FWC[k])return FWC[k];
  const L=X.P.L, n=L.k.length, a=new Float64Array(X.nC*X.NL);
  let lo=0,hi=n;while(lo<hi){const m=(lo+hi)>>1;if(L.d[m]<f)lo=m+1;else hi=m;}
  for(let j=lo;j<n&&L.d[j]<=t;j++)a[L.k[j]*X.NL+L.t[j]]+=L.a[j];
  return FWC[k]=a;
}
function FS(f,t,mask){mask=mask||MASK();const a=FW(f,t),o=new Array(X.NL).fill(0);for(let i=0;i<X.nC;i++){if(!mask[i])continue;for(let l=0;l<X.NL;l++)o[l]+=a[i*X.NL+l];}return o;}
const BILL=o=>o[0]+o[1]+o[2]+o[3];                /* doanh số ghi nợ (gồm VAT) */
const COLL=o=>-o[6];                              /* tiền thu */
const NETR=o=>o.reduce((s,x)=>s+x,0);
/* chuỗi tháng theo loại */
function MSER(mask){const own=!mask;mask=mask||MASK();const k=own?'MS|'+X._g+'|'+MASK._k:null;if(own&&MSER._k===k)return MSER._v;
  const v=Array.from({length:X.NL},()=>new Float64Array(X.nM));
  for(let i=0;i<X.nC;i++){if(!mask[i])continue;const b=i*X.nM*X.NL;for(let m=0;m<X.nM;m++)for(let l=0;l<X.NL;l++)v[l][m]+=X.FL[b+m*X.NL+l];}
  if(own){MSER._k=k;MSER._v=v;}return v;}
/* chuỗi chỉ số theo tháng (dư nợ, quá hạn, DSO, CEI…) */
function TS(){
  MASK(); const k='TS|'+X._g+'|'+MASK._k+'|'+state.a0; if(TS._k===k)return TS._v;
  const ms=MSER(), n=X.nM, out={dr:[],net:[],cr:[],open:[],ov:[],ov90:[],b180:[],dp:[],cnt:[],bill:[],coll:[],dso:[],bp:[],cei:[],rate:[],b:[],nOv:[],blu:[]};
  const ag=X.SN.map(S=>AG(S));
  for(let m=0;m<n;m++){const a=ag[m];
    out.dr.push(a.dr);out.net.push(a.net);out.cr.push(a.cr);out.open.push(a.open);out.ov.push(a.ov);out.ov90.push(a.ov90);out.b180.push(a.b180);out.dp.push(a.dp);out.cnt.push(a.cnt);out.b.push(a.b);out.nOv.push(a.nOv);out.blu.push(a.blu);
    const bill=ms[0][m]+ms[1][m]+ms[2][m]+ms[3][m], coll=-ms[6][m];out.bill.push(bill);out.coll.push(coll);
    /* DSO 3 tháng: dư nợ phải thu ÷ doanh số ghi nợ 3 tháng × số ngày */
    if(m>=2){const b3=out.bill[m]+out.bill[m-1]+out.bill[m-2];const days=X.ME[m]-AR.ymStart(X.MS[m-2])+1;out.dso.push(b3>0?a.dr/b3*days:null);out.bp.push(b3>0?Math.max(0,a.open-a.ov)/b3*days:null);}else{out.dso.push(null);out.bp.push(null);}
    /* CEI */
    if(m>=1){const b0=ag[m-1].dr, cur=a.open-a.ov, den=b0+bill-cur;out.cei.push(den>0?(b0+bill-a.dr)/den:null);}else out.cei.push(null);
    /* tỷ lệ thu / phát sinh (định nghĩa file Excel) */
    let net=0;for(let l=0;l<X.NL;l++)net+=ms[l][m];const den=net+coll;out.rate.push(den>0?coll/den:null);
  }
  TS._k=k;TS._v=out;return out;
}
/* tổng hợp theo nhóm (kênh / vùng / khách) tại ngày D và trong cửa sổ A */
function GRP(key,D,w){
  const S=SNAP(D),mask=MASK(),FA=FW(w.f,w.t),G={};
  for(let i=0;i<X.nC;i++){if(!mask[i])continue;
    const g=key==='kenh'?X.kenh[i]:key==='vung'?X.vung[i]:key==='nt'?X.nt[i]:key==='ly'?(X.layer[i]?'Ngoài HĐKD':'HĐKD'):i;
    const o=G[g]||(G[g]={g,dr:0,cr:0,net:0,open:0,ov:0,ov90:0,b180:0,dp:0,cnt:0,blu:0,inT:0,f:new Array(X.NL).fill(0),n:0,nOv:0,b:new Array(9).fill(0),qb:new Array(5).fill(0),maxQ:0,hm:0,vhm:0});
    const n=S.net[i];o.net+=n;if(n>0)o.dr+=n;else o.cr-=n;
    if(S.open[i]>0.5){o.n++;o.open+=S.open[i];const ov=OVA(S,i);o.ov+=ov;if(ov>0.5)o.nOv++;o.ov90+=S.qb[3][i]+S.qb[4][i];o.dp+=S.dp[i];o.cnt+=S.cnt[i];o.blu+=S.blu[i];o.inT+=S.inT[i];
      for(let z=0;z<9;z++)o.b[z]+=S.b[z][i];for(let z=0;z<5;z++)o.qb[z]+=S.qb[z][i];o.b180+=S.b[5][i]+S.b[6][i]+S.b[7][i]+S.b[8][i];if(S.maxQ[i]>o.maxQ)o.maxQ=S.maxQ[i];}
    if(X.hasHM[i]){o.hm+=X.HM[i];if(n>X.HM[i])o.vhm+=n-X.HM[i];}
    for(let l=0;l<X.NL;l++)o.f[l]+=FA[i*X.NL+l];}
  return Object.values(G);
}
const KORDER=['1. Độc quyền','2. Phân phối','3. Xuất khẩu','4. Dự án','5. Khác','6. Thương mại'];
const VORDER=['Độc quyền','Vùng 1','Vùng 2','Vùng 3','Vùng 4','Vùng 5','Vùng 6','TopOne','Kinh doanh quốc tế','Dự án miền bắc','Dự án miền nam','Không thường xuyên','Khách lẻ miền bắc','Nợ cũ','Thương mại'];
const kOrd=g=>{const i=KORDER.indexOf(g);return i<0?99:i;}, vOrd=g=>{const i=VORDER.indexOf(g);return i<0?99:i;};
function kenhOfV(v){for(let i=0;i<X.nC;i++)if(X.vung[i]===v)return X.kenh[i];return '';}
const cName=i=>X.P.cnm[i]||X.P.cid[i];
const cShort=i=>{let s=cName(i).replace(/^(Công ty|CÔNG TY|Cty|CTY)\s+(TNHH|Cổ phần|CỔ PHẦN|cổ phần|CP|TNHH MTV|Trách Nhiệm Hữu Hạn)?\s*/i,'').replace(/^(Một Thành Viên|MTV|Thương mại|TM)\s+/i,'');return s.length>34?s.slice(0,32)+'…':s;};

/* ---------- bộ nhớ phân tích (tính lại khi đổi kỳ / lọc) ---------- */
function Z(){
  MASK();
  const A=winA(),B=winB();
  const k=X._g+'|'+JSON.stringify(A)+'|'+JSON.stringify(B)+'|'+MASK._k+'|'+state.a0;
  if(Z._k===k&&Z._z)return Z._z;
  const z={A,B,SA:SNAP(A.t),SB:SNAP(B.t),S0:SNAP(A.f-1),FA:FS(A.f,A.t),FB:FS(B.f,B.t)};
  z.gA=AG(z.SA);z.gB=AG(z.SB);z.g0=AG(z.S0);
  Z._k=k;Z._z=z;ALERTS._k=null;return z;
}
/* DSO tại ngày D (3 tháng) — theo lọc hiện tại */
function DSOat(D,mask){mask=mask||MASK();const ym=AR.ymOf(D),f=AR.ymStart(AR.ymAdd(ym,-2));const b=BILL(FS(f,D,mask));const a=AG(SNAP(D),mask);return b>0?a.dr/b*(D-f+1):null;}

/* ---------- tiện ích trình bày ---------- */
function DR(title,fn){DRF.push({t:title,f:fn});return DRF.length-1;}
function SRC(title,rows){SRCR.push({t:title,r:rows});return SRCR.length-1;}
const srcBtn=i=>`<button class="srcb" data-src="${i}" title="Nguồn &amp; công thức">${ic('scan')}</button>`;
function kc(o){
  const ch=(o.chips||[]).filter(Boolean).map(c=>`<span class="chip cc ${c.c||''}"><i data-full="${esc(c.l)}" data-short="${esc(c.s||c.l)}">${esc(c.l)}</i><em>${c.v}</em></span>`).join('');
  return `<div class="kpi ${o.cls||'n'}"${o.dr!==undefined?` data-drill="${o.dr}"`:''}>
    <div class="kl"><b title="${esc(o.l)}">${esc(o.l)}</b>${o.src!==undefined?srcBtn(o.src):''}</div>
    <div class="kv">${o.v}<small>${esc(o.u||'')}</small></div>
    <div class="kmo">${o.sub||labA()}</div>
    ${ch?`<div class="kc krow n${(o.chips||[]).filter(Boolean).length}">${ch}</div>`:''}
    ${o.foot?`<div class="klk"><div class="klkrow">${o.foot}</div></div>`:''}${o.spk||''}</div>`;
}
function krow(list){const n=list.length,c={3:3,4:4,5:5,6:6,7:4,8:4,9:5,10:5,12:6}[n];
  return `<div class="kpis"${c?` style="grid-template-columns:repeat(${c},minmax(0,1fr));--kf:${KF[c]||1}"`:''}>${list.join('')}</div>`;}
function spk(a){const v=a.map(x=>nul(x)?null:x), f=v.filter(x=>x!==null); if(f.length<2)return '';
  const mn=Math.min.apply(null,f), mx=Math.max.apply(null,f), r=(mx-mn)||1, W=64,H=26,n=v.length; let d='',first=true;
  v.forEach((y,i)=>{if(y===null)return;const px=(i/(n-1||1))*(W-2)+1, py=H-2-((y-mn)/r)*(H-6);d+=(first?'M':'L')+px.toFixed(1)+','+py.toFixed(1);first=false;});
  return `<svg class="spk" viewBox="0 0 ${W} ${H}"><path d="${d}" fill="none" stroke="var(--brand)" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"/></svg>`;}
const last13=a=>{const m=curM();return a.slice(Math.max(0,m-12),m+1);};
function hero2(sec,head,stats){
  const s=SECS.find(x=>x.k===sec)||{}; const al=ALERTS().filter(a=>sec==='tq'||sec==='cb'||a.sec===sec);
  const nr=al.filter(a=>a.lv==='r').length, ny=al.filter(a=>a.lv==='y').length;
  const st=nr?`<span class="hpill r">▼ ${nr} cảnh báo đỏ</span>`:(ny?`<span class="hpill y">● ${ny} cảnh báo vàng</span>`:`<span class="hpill g">▲ Trong ngưỡng</span>`);
  return panel(sec+'_hero','','',`<div class="hero">
    <div class="hico">${s.ico||'•'}</div>
    <div class="htx"><div class="hk">Kỳ <b style="color:var(--gold)">${esc(labA())}</b> · so ${esc(labB())} · <b style="color:var(--gold)">${esc(fLab())}</b> ${st}</div>
      <div class="hh" data-tk="hh.${sec}">${T('hh.'+sec,head)}</div></div>
    <div class="hstats">${stats.filter(Boolean).map(x=>`<div class="hs ${x.c||''}"><span>${esc(x.l)}</span><b>${x.v}</b>${x.s?`<em>${x.s}</em>`:''}</div>`).join('')}</div>
  </div>`,'','6','bare');
}
function banner(t,cls){return `<div class="banner ${cls||'y'}">${ic('warn')} <span>${t}</span></div>`;}
function heatBg(v,mx,good){if(nul(v)||!mx)return '';const t=Math.min(1,Math.abs(v)/mx);const c=(good?v<0:v>0)?C.bad:C.ok;return `background:${c}${Math.round(14+t*140).toString(16).padStart(2,'0')}`;}
function heat1(v,mx,col){if(nul(v)||!mx||v<=0)return '';const t=Math.min(1,v/mx);return `background:${col||C.bad}${Math.round(10+t*150).toString(16).padStart(2,'0')}`;}
function tblWrap(el){let w=el.parentNode;while(w&&!w.querySelector('table'))w=w.parentNode;return w;}
function tblFilter(inp){const w=tblWrap(inp), t=w&&w.querySelector('table'), q=inp.value.trim().toLowerCase();
  if(!t)return; t.classList.toggle('srch',!!q);
  t.querySelectorAll('tbody tr:not(.sum)').forEach(tr=>{tr.classList.toggle('hit',!!q&&tr.innerText.toLowerCase().indexOf(q)>=0);});}
function tblAll(btn){const w=tblWrap(btn), t=w&&w.querySelector('table');if(!t)return;
  const on=t.classList.toggle('all');btn.innerText=on?'Thu gọn':'Xem tất cả '+t.querySelectorAll('tbody tr:not(.sum)').length;}
function tsearch(n,lim){return `<div class="tsch"><input class="tsin" placeholder="🔍 Tìm trong ${n} dòng…" oninput="tblFilter(this)">${n>lim?`<button class="btn ghost sm" onclick="tblAll(this)">Xem tất cả ${n}</button><span class="mu">Đang hiện ${lim} dòng đầu</span>`:''}</div>`;}
function seg(name,opts,cur,attr){return `<div class="segs gseg" style="margin:0 0 10px;flex-wrap:wrap">${opts.map(o=>`<button class="${String(cur)===String(o[0])?'on':''}" data-${attr||'gs'}="${esc(name)}:${esc(o[0])}">${o[1]}</button>`).join('')}</div>`;}
const insBox0=insBox;
insBox=function(sec,title,def,span){return `<section class="panel insp s${span||6}" data-blk="ins_${sec}" data-name="${esc(title)}">`+insBox0(sec,title,def)+'</section>';};
const pill=(t,c)=>`<span class="pl ${c||''}">${t}</span>`;
function stPill(st){const c={'Quá hạn':'r','Trong hạn':'g','Bảo lãnh bao phủ':'b','Chưa có nguyên tắc':'y'}[st]||'';return pill(esc(st),c);}

/* ---------- biểu đồ ---------- */
const MCOL=()=>state.mode==='dark'?['#E9C46A','#5DADE2','#E76F51','#7FB77E','#B39DDB','#F4A261','#4DB6AC','#F28B82','#90A4AE','#DCE775','#A1887F','#81D4FA','#FFAB91','#CE93D8','#C5E1A5']
  :['#B8860B','#2E86C1','#C0392B','#3E8E41','#7D5BA6','#D35400','#00897B','#C2185B','#607D8B','#9E9D24','#795548','#0277BD','#BF360C','#6A1B9A','#558B2F'];
/* thang tuổi nợ: xanh → vàng → đỏ đậm */
const AGECOL=()=>state.mode==='dark'?['#4DB6AC','#7FB77E','#C5E1A5','#E9C46A','#F4A261','#E76F51','#E5534B','#B71C1C','#7B1F1F']
  :['#00897B','#3E8E41','#7CB342','#C9A227','#E67E22','#D35400','#C0392B','#8E1B1B','#5D1010'];
const QCOL=()=>state.mode==='dark'?['#E9C46A','#F4A261','#E76F51','#E5534B','#9E2A2B']:['#C9A227','#E67E22','#D35400','#C0392B','#7B1F1F'];
const PBAND={id:'pband',beforeDatasetsDraw(ch,a,o){
  if(!o||!o.a)return; const x=ch.scales.x, ar=ch.chartArea; if(!x||!ar)return; const g=ch.ctx, n=ch.data.labels.length;
  const w=(x.getPixelForValue(1)-x.getPixelForValue(0))||((ar.right-ar.left)/n);
  const band=(arr,col)=>arr.forEach(i=>{if(i<0||i>=n)return;const px=x.getPixelForValue(i);g.fillStyle=col;g.fillRect(px-w/2,ar.top,w,ar.bottom-ar.top);});
  g.save(); band(o.b||[],o.cb); band(o.a||[],o.ca); g.restore();
}};
try{Chart.register(PBAND);}catch(e){}
/* dải tô tháng của kỳ A / B trên trục tháng (offset = chỉ số tháng đầu của trục) */
function pband(off){off=off||0;const A=winA(),B=winB();const idx=w=>{const r=[];for(let m=0;m<X.nM;m++){const s=AR.ymStart(X.MS[m]),e=X.ME[m];if(e>=w.f&&s<=w.t)r.push(m-off);}return r;};
  return {a:idx(A),b:idx(B),ca:C.gold+'26',cb:C.muted+'1f'};}
function mRange(n){const m=curM();const f=Math.max(0,m-(n-1));const r=[];for(let i=f;i<=m;i++)r.push(i);return r;}
function chCombo(id,h,labels,bars,lines,opt){
  opt=opt||{}; const ds=[];
  (bars||[]).forEach(b=>ds.push({type:'bar',label:b.n,data:b.v,backgroundColor:b.c||C.muted+'99',borderRadius:4,maxBarThickness:30,yAxisID:b.ax||'y',order:5,stack:b.st,
    datalabels:b.lbl?DL(v=>(b.f||opt.fb||fV)(v),{anchor:'end',align:'end',color:C.sub,font:{size:9,weight:'700'}}):{display:false}}));
  (lines||[]).forEach(l=>ds.push({type:'line',label:l.n,data:l.v,borderColor:l.c,backgroundColor:l.c,borderWidth:l.dash?1.8:2.6,borderDash:l.dash?[6,4]:undefined,
    pointRadius:l.dash?0:2.4,pointHoverRadius:5,tension:.28,spanGaps:true,yAxisID:l.ax||'y1',order:1,fill:false,
    datalabels:l.lbl?DL(v=>(l.f||opt.fl||fV)(v),{align:'top',color:l.c,font:{size:9.5,weight:'700'}}):{display:false}}));
  const fmt=(ax,v)=>ax==='y'?(opt.fb||fV)(v):(opt.fl||fV)(v);
  return cbox(id,h||'h300',{type:'bar',data:{labels,datasets:ds},
    options:baseOpt({plugins:{legend:baseOpt().plugins.legend,pband:opt.band||{},
      tooltip:Object.assign(TT(),{callbacks:{label:c=>{const ax=c.dataset.yAxisID;const f=ax==='y'?(opt.fb||fV):(opt.fl||fV);const ff=(c.dataset.f)||f;return ' '+c.dataset.label+': '+((bars.concat(lines||[]).find(z=>z.n===c.dataset.label)||{}).f||f)(c.parsed.y)+' '+(ax==='y'?(opt.ub||UA()):(opt.ul||''));}}}),datalabels:{display:false}},
      scales:{x:{stacked:!!opt.stack,grid:{display:false},ticks:{color:C.mut,font:{size:10},maxRotation:0,autoSkip:true}},
        y:{stacked:!!opt.stack,position:'left',grace:'8%',grid:{color:C.grid},border:{display:false},ticks:{color:C.mut,font:{size:10},callback:v=>(opt.fb||fV)(v)},title:{display:!!opt.tb,text:opt.tb||'',color:C.mut,font:{size:10}},min:opt.ymin},
        y1:{position:'right',display:!!(lines&&lines.length),grace:'10%',grid:{display:false},border:{display:false},ticks:{color:C.mut,font:{size:10},callback:v=>(opt.fl||fV)(v)},title:{display:!!opt.tl,text:opt.tl||'',color:C.mut,font:{size:10}},min:opt.y1min,max:opt.y1max}}})});
}
function chStack(id,h,labels,series,fm,opt){
  opt=opt||{};
  return cbox(id,h||'h300',{type:'bar',data:{labels,datasets:series.map(s=>({type:'bar',label:s.n,data:s.v,backgroundColor:s.c,borderRadius:2,maxBarThickness:42,stack:'s',
      datalabels:DL(v=>fm(v),{anchor:'center',align:'center',color:'#fff',backgroundColor:'rgba(0,0,0,.22)',font:{size:9,weight:'700'},display:c=>state.labels&&opt.minLbl!==undefined&&Math.abs(c.dataset.data[c.dataIndex])>opt.minLbl})})).concat(opt.line?[Object.assign({type:'line',stack:undefined,borderWidth:2.4,pointRadius:3,tension:.25,fill:false,borderColor:C.gold,backgroundColor:C.gold,yAxisID:opt.line.ax||'y',datalabels:DL(v=>(opt.line.f||fm)(v),{align:'top',color:C.gold})},opt.line)]:[])},
    options:baseOpt({indexAxis:opt.h?'y':'x',plugins:{legend:baseOpt().plugins.legend,pband:opt.band||{},tooltip:Object.assign(TT(),{callbacks:{label:c=>' '+c.dataset.label+': '+((c.dataset.type==='line'&&opt.line&&opt.line.f)||fm)(opt.h?c.parsed.x:c.parsed.y)+(c.dataset.type==='line'&&opt.line&&opt.line.u?' '+opt.line.u:(opt.u?' '+opt.u:''))}}),datalabels:{display:false}},
      scales:Object.assign({x:{stacked:true,grid:{display:!!opt.h,color:C.grid},ticks:Object.assign({color:opt.h?C.mut:C.sub,font:{size:10},maxRotation:0},opt.h?{callback:v=>fm(v)}:{})},
        y:{stacked:true,grace:'6%',max:opt.max,grid:{color:C.grid,display:!opt.h},border:{display:false},ticks:Object.assign({color:opt.h?C.sub:C.mut,font:{size:10},autoSkip:!!opt.h?false:true},opt.h?{}:{callback:v=>fm(v)})}},
        opt.line&&opt.line.ax==='y1'?{y1:{position:'right',grid:{display:false},border:{display:false},ticks:{color:C.mut,font:{size:10},callback:v=>(opt.line.f||fm)(v)}}}:{})})});
}
function chWaterfall(id,h,steps,fm,opt){
  opt=opt||{};
  let run=0; const pts=[];
  steps.forEach(s=>{if(s.tot){pts.push(s.v);run=s.v;}else{pts.push(run);run+=s.v;pts.push(run);}});
  const lo=Math.min.apply(null,pts.concat([0])), hi=Math.max.apply(null,pts), pad=Math.max((hi-lo)*0.12,1);
  run=0; const lab=[], dat=[], col=[], raw=[];
  steps.forEach(s=>{
    if(s.tot){lab.push(s.n);dat.push([0,s.v]);col.push(s.c||C.gold);raw.push(s.v);run=s.v;}
    else{lab.push(s.n);dat.push([run,run+s.v]);col.push(s.col||(s.v>0?C.bad:C.ok));raw.push(s.v);run+=s.v;}
  });
  return cbox(id,h||'h320',{type:'bar',data:{labels:lab,datasets:[{label:opt.lab||'Giá trị',data:dat,backgroundColor:col,borderRadius:4,maxBarThickness:52,minBarLength:2,
      datalabels:DL(null,{anchor:'end',align:'end',offset:2,formatter:(v,c)=>{const r=raw[c.dataIndex];return steps[c.dataIndex].tot?fm(r):(Math.abs(r)<1?'':(r>0?'+':'−')+fm(Math.abs(r)));}})}]},
    options:baseOpt({plugins:{legend:{display:false},tooltip:Object.assign(TT(),{callbacks:{label:c=>{const r=raw[c.dataIndex];return ' '+(steps[c.dataIndex].tot?'Số dư: '+fm(r):'Tác động: '+(r>0?'+':'−')+fm(Math.abs(r)))+(opt.u?' '+opt.u:'');},
        afterLabel:c=>steps[c.dataIndex].d?steps[c.dataIndex].d:''}}),datalabels:{display:false}},
      scales:{x:{grid:{display:false},ticks:{color:C.sub,font:{size:10},autoSkip:false,maxRotation:35,minRotation:0}},
        y:{min:Math.min(0,lo-pad),grace:'10%',grid:{color:C.grid},border:{display:false},ticks:{color:C.mut,font:{size:10},callback:v=>fm(v)}}}})});
}
function chLines(id,h,labels,series,fm,opt){
  opt=opt||{}; const cols=MCOL();
  return cbox(id,h||'h280',{type:'line',data:{labels,datasets:series.map((s,i)=>({label:s.n,data:s.v,borderColor:s.c||cols[i%cols.length],backgroundColor:(s.c||cols[i%cols.length])+(s.fill?'33':''),
      borderWidth:s.w||2.2,borderDash:s.dash?[6,4]:undefined,pointRadius:s.dash?0:2.2,pointHoverRadius:5,tension:.28,spanGaps:true,fill:!!s.fill,
      datalabels:s.lbl?DL(v=>fm(v),{align:'top',color:s.c||cols[i%cols.length],font:{size:9,weight:'700'}}):{display:false}}))},
    options:baseOpt({plugins:{legend:baseOpt().plugins.legend,pband:opt.band||{},tooltip:Object.assign(TT(),{callbacks:{label:c=>' '+c.dataset.label+': '+fm(c.parsed.y)+(opt.u?' '+opt.u:'')}}),datalabels:{display:false}},
      scales:{x:{grid:{display:false},ticks:{color:C.mut,font:{size:10},maxRotation:0,autoSkip:true}},y:{grace:'8%',min:opt.min,max:opt.max,grid:{color:C.grid},border:{display:false},ticks:{color:C.mut,font:{size:10},callback:v=>fm(v)}}}})});
}
function chBarH(id,h,rows,fm,opt){
  opt=opt||{};
  return cbox(id,h||'h320',{type:'bar',data:{labels:rows.map(r=>r.n),datasets:[{label:opt.lab||'Giá trị',data:rows.map(r=>r.v),backgroundColor:rows.map(r=>r.c||(r.v>0?C.bad:C.ok)),borderRadius:4,maxBarThickness:20,
      datalabels:DL(v=>(v>0&&opt.sign?'+':'')+fm(v),{anchor:'end',align:c=>c.dataset.data[c.dataIndex]>=0?'right':'left',offset:3})}].concat(opt.ds2?[Object.assign({borderRadius:4,maxBarThickness:20,datalabels:{display:false}},opt.ds2)]:[])},
    options:baseOpt({indexAxis:'y',layout:{padding:{right:60,left:opt.padL||8,top:4,bottom:2}},plugins:{legend:{display:!!opt.ds2,position:'bottom',labels:{color:C.sub,font:{size:10.5}}},tooltip:Object.assign(TT(),{callbacks:{label:c=>' '+(c.dataset.label||'')+': '+fm(c.parsed.x)+(opt.u?' '+opt.u:''),afterLabel:c=>rows[c.dataIndex]&&rows[c.dataIndex].d||''}}),datalabels:{display:false}},
      scales:{x:{grace:'14%',grid:{color:C.grid},border:{display:false},ticks:{color:C.mut,font:{size:10},callback:v=>fm(v)}},
        y:{grid:{display:false},ticks:{color:C.sub,font:{size:10.5},autoSkip:false,callback:function(v){const t=this.getLabelForValue(v);return t.length>34?t.slice(0,32)+'…':t;}}}}})});
}
function chDonut(id,h,rows,fm){
  const tot=rows.reduce((a,r)=>a+(r.v>0?r.v:0),0);
  return cbox(id,h||'h280',{type:'doughnut',data:{labels:rows.map(r=>r.n),datasets:[{data:rows.map(r=>r.v),backgroundColor:rows.map(r=>r.c),borderWidth:2,borderColor:C.card,
    datalabels:DL(v=>tot&&v/tot>=0.045?pc(v/tot,0):'',{anchor:'center',align:'center',color:'#fff',backgroundColor:'rgba(0,0,0,.25)'})}]},
    options:{responsive:true,maintainAspectRatio:false,cutout:'58%',animation:state.anim?{duration:520}:false,
      plugins:{legend:{position:'right',labels:{color:C.sub,font:{size:11},usePointStyle:true,boxWidth:9,padding:8}},
        tooltip:Object.assign(TT(),{callbacks:{label:c=>' '+c.label+': '+fm(c.parsed)+' · '+pc(tot?c.parsed/tot:null)}}),datalabels:{display:false}}}});
}
function chBubble(id,h,pts,opt){
  opt=opt||{};
  return cbox(id,h||'h340',{type:'bubble',data:{datasets:pts.map(p=>({label:p.n,data:[{x:p.x,y:p.y,r:p.r}],backgroundColor:p.c+'99',borderColor:p.c,borderWidth:1.5,
      datalabels:{display:true,color:C.ink,font:{size:9.5,weight:'700'},align:'top',offset:p.r/1.4+2,formatter:()=>p.n}}))},
    options:baseOpt({interaction:{mode:'nearest',intersect:true},plugins:{legend:{display:false},tooltip:Object.assign(TT(),{callbacks:{label:c=>{const p=pts[c.datasetIndex];return ' '+p.n+': '+(p.t||'');}}}),datalabels:{}},
      scales:{x:{grid:{color:C.grid},title:{display:true,text:opt.xl||'',color:C.mut,font:{size:10}},ticks:{color:C.mut,font:{size:10},callback:v=>(opt.fx||nd)(v)},min:opt.xmin},
        y:{grid:{color:C.grid},title:{display:true,text:opt.yl||'',color:C.mut,font:{size:10}},ticks:{color:C.mut,font:{size:10},callback:v=>(opt.fy||nd)(v)},min:opt.ymin}}})});
}
/* màn hình hẹp: tắt nhãn số trên biểu đồ để không chồng chữ */
{const _DL=DL;DL=function(f,o){const r=_DL(f,o),d=r.display;r.display=c=>window.innerWidth>700&&(typeof d==='function'?d(c):d);return r;};}
