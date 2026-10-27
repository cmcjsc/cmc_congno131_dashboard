



/* ══════════════════════════════════════════════════════════════
   CMC · Phòng Marketing — engine (kế thừa engine Khối Sản xuất v7)
   ══════════════════════════════════════════════════════════════ */
const $  = id => document.getElementById(id);
const $$ = s  => Array.prototype.slice.call(document.querySelectorAll(s));
const LSK = 'cmc_ar131_v1';
const PWK = [56,56,56,56];                 // mật khẩu quản trị (char-code, không lộ)

/* ---------- 20 MEN MÀU ---------- */
function hsl2hex(h,s,l){
  s/=100; l/=100;
  const k=n=>(n+h/30)%12, a=s*Math.min(l,1-l);
  const f=n=>l-a*Math.max(-1,Math.min(k(n)-3,Math.min(9-k(n),1)));
  const t=x=>Math.round(255*x).toString(16).padStart(2,'0');
  return '#'+t(f(0))+t(f(8))+t(f(4));
}
/* h = sắc chủ đạo · hs = sắc phụ trợ · sat = độ bão hoà */
const FAMS=[
  {k:'cham',   n:'Chàm',        h:226, hs:200, sat:38},
  {k:'lam',    n:'Lam',         h:208, hs:186, sat:44},
  {k:'thanh',  n:'Thanh thiên', h:194, hs:222, sat:46},
  {k:'ngoc',   n:'Ngọc',        h:174, hs:200, sat:42},
  {k:'lucbao', n:'Lục bảo',     h:156, hs:186, sat:40},
  {k:'reu',    n:'Xanh rêu',    h:128, hs:160, sat:30},
  {k:'oliu',   n:'Ô liu',       h:88,  hs:120, sat:32},
  {k:'vang',   n:'Vàng đồng',   h:46,  hs:22,  sat:50},
  {k:'hopach', n:'Hổ phách',    h:36,  hs:12,  sat:54},
  {k:'camdat', n:'Cam đất',     h:22,  hs:200, sat:48},
  {k:'sanho',  n:'San hô',      h:8,   hs:36,  sat:50},
  {k:'doson',  n:'Đỏ son',      h:354, hs:20,  sat:46},
  {k:'hongsen',n:'Hồng sen',    h:336, hs:300, sat:42},
  {k:'man',    n:'Mận',         h:316, hs:344, sat:36},
  {k:'tim',    n:'Tím',         h:286, hs:214, sat:38},
  {k:'chamtim',n:'Chàm tím',    h:262, hs:200, sat:40},
  {k:'lamtim', n:'Lam tím',     h:244, hs:196, sat:38},
  {k:'daxam',  n:'Đá xám',      h:212, hs:196, sat:15},
  {k:'nautram',n:'Nâu trầm',    h:26,  hs:200, sat:22},
  {k:'bac',    n:'Bạc',         h:202, hs:222, sat:9 }
];
const PALS={};
FAMS.forEach(f=>{
  PALS[f.k]={n:f.n,
    b :hsl2hex(f.h ,f.sat   ,68), d :hsl2hex(f.h ,f.sat+6 ,50), s :hsl2hex(f.hs,f.sat-6,64),
    lb:hsl2hex(f.h ,f.sat+12,40), ld:hsl2hex(f.h ,f.sat+18,26), ls:hsl2hex(f.hs,f.sat+4,40)};
});

/* ---------- STATE ---------- */
let LAY={}, TXT={}, LOGO=null;
const state={
  m:DATA.meta.m, sec:'tq', mode:'dark', pal:'cham', toolbar:false, u:'dt', lv:{dt:2,sl:1}, dcm:null,
  labels:true, prev:true, anim:true, drill:null, editing:false, unlocked:false, present:false
};
const C={};
function applyTheme(){
  const p=PALS[state.pal]||PALS.lam, dark=state.mode==='dark';
  const r=document.documentElement;
  r.setAttribute('data-mode',state.mode);
  r.style.setProperty('--brand',  dark?p.b:p.lb);
  r.style.setProperty('--deep',   dark?p.d:p.ld);
  r.style.setProperty('--support',dark?p.s:p.ls);
  const cs=getComputedStyle(r);
  ['brand','deep','support','muted','ok','warn','bad','ink','sub','mut','line','line2','plan','gold','gold2','card','card2','bg']
    .forEach(k=>C[k]=cs.getPropertyValue('--'+k).trim());
  C.grid  = dark?'rgba(255,255,255,.07)':'rgba(16,24,40,.08)';
  C.lblBg = dark?'rgba(10,14,21,.74)':'rgba(255,255,255,.80)';
  C.ck    = '#9AA4AE';
}
function mix(a,b,t){
  const h=x=>{x=x.replace('#','');if(x.length===3)x=x.split('').map(c=>c+c).join('');
    return [parseInt(x.slice(0,2),16),parseInt(x.slice(2,4),16),parseInt(x.slice(4,6),16)];};
  const A=h(a),B=h(b);
  return '#'+A.map((v,i)=>Math.round(v+(B[i]-v)*t).toString(16).padStart(2,'0')).join('');
}
function KCOL(){return [C.brand,C.gold,C.support,C.deep,mix(C.brand,C.support,.5),C.muted,
  mix(C.gold,C.brand,.5),mix(C.support,C.deep,.55),mix(C.brand,C.gold,.75),mix(C.muted,C.support,.5)];}

/* ---------- FORMAT ---------- */
const nf=new Intl.NumberFormat('vi-VN');
const nfd=d=>new Intl.NumberFormat('vi-VN',{minimumFractionDigits:0,maximumFractionDigits:d});
const nul=v=>(v===null||v===undefined||v===''||(typeof v==='number'&&!isFinite(v)));
function n0(v){return nul(v)?'–':nf.format(Math.round(v));}
function nd(v,d){return nul(v)?'–':nfd(d===undefined?1:d).format(v);}
function pc(v,d){return nul(v)?'–':(v*100).toFixed(d===undefined?1:d).replace('.',',')+'%';}
function sg(v,d){return nul(v)?'–':((v>0?'+':'')+(v*100).toFixed(d===undefined?1:d).replace('.',',')+'%');}
function arw(v){return nul(v)?'–':((Math.abs(v)<0.0005?'─ ':(v>0?'▲ ':'▼ '))+sg(v));}
function dl(a,b){if(nul(a)||nul(b)||!b)return null;return (a-b)/Math.abs(b);}
function esc(s){return String(s===null||s===undefined?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
function T(k,d){return TXT[k]!==undefined?TXT[k]:d;}

/* Chỉ tiêu ĐVT '%' có 2 kiểu nhập: thang 0–1 (0,8718 = 87,18%) và thang 0–100
   (95,1 = 95,1%). Tự dò theo dữ liệu, chia 100 KHI HIỂN THỊ — số gốc trong
   Excel không đổi, %KH vẫn tính trên số gốc nên không sai lệch. */
function pscale(k){
  if(k.dvt!=='%')return 1;
  if(k._ps!==undefined)return k._ps;
  const v=[].concat(k.th||[],k.kh||[],k.cy||[]).filter(x=>!nul(x)&&x!==0);
  k._ps=(v.length&&Math.max.apply(null,v.map(Math.abs))>1.5)?100:1;
  return k._ps;
}
/* trình bày giá trị theo đơn vị của chỉ tiêu */
function fmt(k,v){
  if(nul(v))return '–';
  if(k&&(k.dvt==='U'||k.kind==='P'))return fmtK(k,v);
  if(k.dvt==='%')return pc(v/pscale(k),2);
  const a=Math.abs(v);
  if(a>=100000)return n0(v);
  if(a>=1000)return nd(v,0);
  if(a>=100)return nd(v,1);
  if(a>=10)return nd(v,2);
  return nd(v,3);
}
const MLAB=['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'];
const COL='DEFGHIJKLMNO';

/* ---------- NGƯỠNG ---------- */
/* ≥95% ĐẠT (▲) · 85–95% RỦI RO (●) · <85% KHÔNG ĐẠT (▼) */
function semCls(r){if(nul(r))return 'n';return r>=0.95?'g':(r>=0.85?'y':'r');}
const SHAPE={g:'▲',y:'●',r:'▼',n:'–'};
const SEMTXT={g:'ĐẠT',y:'RỦI RO',r:'KHÔNG ĐẠT',n:'CHƯA CÓ SỐ'};
function trendCls(v,pol){if(nul(v))return 'n';const s=(pol===-1?-1:1)*v;
  return Math.abs(v)<0.0005?'n':(s>0?'g':'r');}

/* ---------- TRUY XUẤT DỮ LIỆU ----------
   BẪY ĐÃ GẶP THẬT: viết `const KPI = DATA.kpi` là CHỤP MẢNG lúc tải trang.
   Sau khi nạp Excel mới, window.DATA trỏ sang object khác nhưng KPI vẫn giữ
   mảng cũ → thẻ KPI, biểu đồ, bảng, insight đứng yên còn phần đọc DATA.* trực
   tiếp (narr/coop/wide/detail/dq) lại đổi → dashboard nửa cũ nửa mới.
   => MỌI truy cập số liệu phải đi qua hàm, không qua hằng. */
const KPI=new Proxy([],{                       // đọc như mảng, luôn trỏ dữ liệu hiện hành
  get(_,p){const a=KREG;
    const v=a[p]; return (typeof v==='function')?v.bind(a):v;},
  has(_,p){return p in (KREG);},
  ownKeys(){return Reflect.ownKeys(KREG);},
  getOwnPropertyDescriptor(_,p){return Object.getOwnPropertyDescriptor(KREG,p);}
});
function SLarr(){return [];}
/* địa chỉ ô Excel của tháng i (0..11) — mỗi sheet có cột T1 khác nhau */
function colL(n){let s='';n++;while(n>0){const m=(n-1)%26;s=String.fromCharCode(65+m)+s;n=Math.floor((n-1)/26);}return s;}
function cellOf(k,i){if(!k||!k.src||!k.src.th)return null;return k.src.th[0]+'!'+colL((k.src.c0||0)+i)+k.src.th[1];}
/* Dò chỉ tiêu có đơn vị KHÔNG ĐỒNG NHẤT giữa các tháng hoặc giữa TH và KH.
   Không tự quy đổi — chỉ chặn mọi phép tổng hợp và cảnh báo, để bộ phận xác nhận. */
function markBad(D){
  (D.kpi||[]).forEach(k=>{
    const th=k.th.filter(v=>!nul(v)&&v!==0), kh=k.kh.filter(v=>!nul(v)&&v!==0);
    let bad=null;
    if(th.length>=2){
      const r=Math.max.apply(null,th)/Math.min.apply(null,th);
      /* Marketing: số đếm (lượt, người, bài) biến động mạnh là bình thường → chỉ dò lệch đơn vị ở chỉ tiêu dạng TỶ LỆ / BÌNH QUÂN */
      if(r>20&&['%','giây','trang','sự kiện','hạng'].indexOf(k.dvt)>=0)bad='Giá trị giữa các tháng chênh nhau '+Math.round(r)+' lần — dấu hiệu nhập khác đơn vị.';
    }
    if(!bad&&th.length&&kh.length){
      const a=th.reduce((x,y)=>x+y,0)/th.length, b=kh.reduce((x,y)=>x+y,0)/kh.length;
      if(a/b>20||a/b<0.05)bad='Thực hiện và kế hoạch khác thang đo ('+nd(a,2)+' vs '+nd(b,2)+').';
    }
    k.bad=bad;
  });
  return D;
}
function sumTo(a,m){const v=a.slice(0,m).filter(x=>!nul(x));return v.length?v.reduce((x,y)=>x+y,0):null;}
function cum(k,m){
  if(k.bad)return null;
  m=m||state.m; const a=k.th;
  if(k.cumf)return k.cumf('th',m);
  if(k.ck==='sum') return sumTo(a,m);
  if(k.ck==='avg'){const v=a.slice(0,m).filter(x=>!nul(x));return v.length?v.reduce((x,y)=>x+y,0)/v.length:null;}
  if(k.ck==='wavg'){const SL=SLarr();let n=0,d=0;
    for(let i=0;i<m;i++){if(!nul(a[i])&&!nul(SL[i])){n+=a[i]*SL[i];d+=SL[i];}}return d?n/d:null;}
  if(k.ck==='last'){for(let i=m-1;i>=0;i--)if(!nul(a[i]))return a[i];}
  if(k.ck==='ratio'){const n=DATA.kpi[k.rn],d=DATA.kpi[k.rd];if(!n||!d)return null;
    const a1=sumTo(n.th,m),b1=sumTo(d.th,m);return (nul(a1)||!b1)?null:a1/b1;}
  return null;
}
function cumKH(k,m){
  if(k.bad)return null;
  m=m||state.m; const a=k.kh;
  if(k.cumf)return k.cumf('kh',m);
  if(k.ck==='sum') return sumTo(a,m);
  if(k.ck==='avg'||k.ck==='wavg'){const v=a.slice(0,m).filter(x=>!nul(x));return v.length?v.reduce((x,y)=>x+y,0)/v.length:null;}
  if(k.ck==='last'){for(let i=m-1;i>=0;i--)if(!nul(a[i]))return a[i];}
  return null;
}
/* lũy kế CÙNG KỲ năm trước — cùng quy tắc CKTYPE với lũy kế thực hiện */
function cumCY(k,m){
  if(k.bad)return null;
  m=m||state.m; const a=k.cy;
  if(k.cumf)return k.cumf('cy',m);
  if(k.ck==='sum') return sumTo(a,m);
  if(k.ck==='avg'){const v=a.slice(0,m).filter(x=>!nul(x)&&x!==0);return v.length?v.reduce((x,y)=>x+y,0)/v.length:null;}
  if(k.ck==='wavg'){const SL=SLarr();let n=0,d=0;
    for(let i=0;i<m;i++){if(!nul(a[i])&&a[i]!==0&&!nul(SL[i])){n+=a[i]*SL[i];d+=SL[i];}}return d?n/d:null;}
  if(k.ck==='last'){for(let i=m-1;i>=0;i--)if(!nul(a[i]))return a[i];}
  return null;
}
/* %KH có xét chiều chỉ tiêu (pol=-1: thấp hơn là tốt) */
function rateKH(k,m){
  if(k.bad)return null;
  m=m||state.m;
  const t=k.th[m-1], p=k.kh[m-1];
  if(nul(t)||nul(p)||!p)return null;
  return k.pol===-1 ? p/t : t/p;
}
function rateLK(k,m){
  const t=cum(k,m), p=cumKH(k,m);
  if(nul(t)||nul(p)||!p)return null;
  return k.pol===-1 ? p/t : t/p;
}
function rateNam(k,m){
  const t=cum(k,m);
  if(nul(t)||nul(k.khn)||!k.khn)return null;
  return k.pol===-1 ? k.khn/t : t/k.khn;
}
function lastFilled(a,m){m=m||state.m;for(let i=m-1;i>=0;i--)if(!nul(a[i]))return {v:a[i],m:i+1};return null;}
const cutM=a=>a.slice(0,state.m);




