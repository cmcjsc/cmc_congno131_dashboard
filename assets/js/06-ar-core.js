/* ══════════════════════════════════════════════════════════════
   CMC · CÔNG NỢ TK 131 — LÕI TÍNH (dùng chung trình duyệt & kiểm thử node)
   pack(raw)  : dòng bảng kê → khối gọn (phân loại bút toán theo W_Tên phân tích)
   ctx(P)     : dựng khách hàng / kênh / vùng / nguyên tắc hạn nợ / lớp HĐKD,
                dòng tiền theo tháng, tuổi nợ FIFO tại mọi cuối tháng
   ══════════════════════════════════════════════════════════════ */
var AR=(function(){
  const LOAI=['Bán hàng','GTGT đầu ra','Bán khác','Bán đầu tư','Hàng bán trả lại','Trả chiết khấu','Thu tiền','Trả tiền','Bù trừ','Khác'];
  const LI={};LOAI.forEach((x,i)=>LI[x]=i);
  const NL=LOAI.length;
  const BKT=[0,15,30,60,90,180,365,730,1095], BKN=['< 15 ngày','15–30','30–60','60–90','90–180','180 ngày–1 năm','1–2 năm','2–3 năm','≥ 3 năm'];
  const DPC=[0,0,0,0,0,0.3,0.5,0.7,1];
  const QBK=[1,31,61,91,181], QBN=['1–30 ngày','31–60','61–90','91–180','> 180 ngày'];
  const RBK=[0,31,61,91,181,366], RBN=['0–30','31–60','61–90','91–180','181–365','> 365'];
  const OPDAY=44926;                                 /* 31/12/2022 — mốc số dư đầu */
  const E0=Date.UTC(1899,11,30);
  const toD=s=>new Date(E0+s*864e5);
  const ser=(y,m,d)=>Math.round((Date.UTC(y,m-1,d)-E0)/864e5);
  const ymOf=s=>{const t=toD(s);return t.getUTCFullYear()*100+t.getUTCMonth()+1;};
  const eom=s=>{const t=toD(s);return ser(t.getUTCFullYear(),t.getUTCMonth()+2,1)-1;};
  const ymEnd=ym=>ser(Math.floor(ym/100),ym%100+1,1)-1;
  const ymStart=ym=>ser(Math.floor(ym/100),ym%100,1);
  const ymAdd=(ym,k)=>{let y=Math.floor(ym/100),m=ym%100+k;y+=Math.floor((m-1)/12);m=((m-1)%12+12)%12+1;return y*100+m;};
  const norm=s=>String(s||'').toLowerCase().normalize('NFC').replace(/\s+/g,' ').trim();
  const isHD=c=>c==='HD'||c==='HC';

  /* ---------------- PACK ---------------- */
  function pack(raw,base){
    const P={meta:Object.assign({},raw.meta),dic:{mc:[],bank:[],dg:[]},unk:[]};
    ['rule','kvmap','namemap','bankmap','nt','hm','bl','op','dm','cdps','ref'].forEach(k=>{P[k]=raw[k]!==undefined?raw[k]:(base?base[k]:undefined);});
    if(!P.rule||!P.rule.length)throw new Error('Thiếu bảng phân loại bút toán (sheet W_Tên phân tích).');
    const RM={};P.rule.forEach(r=>RM[r[0]+'|'+r[1]+'|'+r[2]+'|'+r[3]]=r[4]);
    const BM={};(P.bankmap||[]).forEach(r=>BM[r[0]]=r[2]||r[1]);
    /* khách hàng */
    const cid=[],cnm=[],ckv=[],cact=[],CI={};
    const addC=(id,nm,kv,act)=>{if(!id)return -1;let i=CI[id];if(i===undefined){i=CI[id]=cid.length;cid.push(id);cnm.push(nm||'');ckv.push(kv||'');cact.push(act===undefined?1:act);}
      else{if(!cnm[i]&&nm)cnm[i]=nm;if(!ckv[i]&&kv)ckv[i]=kv;}return i;};
    if(P.dm)P.dm.forEach(r=>addC(r[0],r[1],r[2],r[3]));
    else if(base&&base.cid)base.cid.forEach((id,i)=>addC(id,base.cnm[i],base.ckv[i],base.cact[i]));
    (P.op||[]).forEach(r=>addC(r[0],r[1],'',1));
    const di={mc:{},bank:{},dg:{}};
    const dx=(k,v)=>{let i=di[k][v];if(i===undefined){i=di[k][v]=P.dic[k].length;P.dic[k].push(v);}return i;};
    const M=new Map(), UK={};
    let lines=raw._lines||[];
    let keep=[];
    if(base&&base.L){ /* giữ phần lịch sử từ dữ liệu cũ khi file mới thiếu sheet master */
      let yr0=Infinity;for(const l of lines)if(l.d<yr0)yr0=l.d;
      const cut=raw._hasM?-1:ser(toD(yr0).getUTCFullYear(),1,1);
      if(cut>0){const B=base.L;for(let j=0;j<B.k.length;j++)if(B.d[j]<cut)keep.push(j);}
      P.meta.keptBase=keep.length; P.meta.keptBefore=cut;
    }
    const put=(ci,d,s,mc,t,a,b,g,v)=>{const key=ci+'|'+d+'|'+s+'|'+mc+'|'+t+'|'+b+'|'+g+'|'+v;const o=M.get(key);if(o)o.a+=a;else M.set(key,{k:ci,d,s,c:mc,t,a,b,g,v});};
    lines.forEach(l=>{
      const key=l.no+'|'+l.co+'|'+l.mg+'|'+l.mc; let lo=RM[key];
      if(lo===undefined||LI[lo]===undefined){const u=UK[key]||(UK[key]={key,n:0,a:0});u.n++;u.a+=l.t;lo='Khác';}
      const t=LI[lo], mc=dx('mc',l.mc);
      const b=t===6?dx('bank',BM[l.tknh]||l.nh||'(Không rõ NH)'):-1;
      const g=isHD(l.mc)?-1:dx('dg',l.dg.slice(0,90));
      if(l.no.indexOf('131')===0){const ci=addC(l.dn,l.dnn,'',1);put(ci,l.d,l.s,mc,t,l.t,b,g,1);}
      if(l.co.indexOf('131')===0){const ci=addC(l.dc,l.dcn,'',1);put(ci,l.d,l.s,mc,t,-l.t,b,g,0);}
    });
    if(keep.length){const B=base.L,bd=base.dic;keep.forEach(j=>{const ci=addC(base.cid[B.k[j]],base.cnm[B.k[j]],base.ckv[B.k[j]],base.cact[B.k[j]]);
      put(ci,B.d[j],B.s[j],dx('mc',bd.mc[B.c[j]]),B.t[j],B.a[j],B.b[j]<0?-1:dx('bank',bd.bank[B.b[j]]),B.g[j]<0?-1:dx('dg',bd.dg[B.g[j]]),B.v?B.v[j]:(B.a[j]>0?1:0));});}
    const arr=Array.from(M.values()).filter(o=>Math.abs(o.a)>0.4).sort((x,y)=>x.d-y.d||x.k-y.k||(x.s<y.s?-1:x.s>y.s?1:0));
    P.L={k:[],d:[],s:[],c:[],t:[],a:[],b:[],g:[],v:[]};
    arr.forEach(o=>{P.L.k.push(o.k);P.L.d.push(o.d);P.L.s.push(o.s);P.L.c.push(o.c);P.L.t.push(o.t);P.L.a.push(Math.round(o.a));P.L.b.push(o.b);P.L.g.push(o.g);P.L.v.push(o.v);});
    P.cid=cid;P.cnm=cnm;P.ckv=ckv;P.cact=cact;
    P.unk=Object.values(UK); delete P.dm;
    P.meta.rows=arr.length; P.meta.lines=lines.length+(keep.length?keep.length:0);
    P.meta.dmin=arr.length?arr[0].d:0; P.meta.dmax=arr.length?arr[arr.length-1].d:0;
    /* ngày chốt mặc định = ngày chứng từ cuối cùng của IN_Bảng kê (mọi dòng, không chỉ dòng 131), không vượt ngày cuối kỳ IN_CĐPS */
    {const cap=(P.cdps&&P.cdps.length)?Math.max.apply(null,P.cdps.map(r=>r[1])):Infinity;let dl=0;for(const l of lines){if(l.d>dl&&l.d<=cap)dl=l.d;}
     P.meta.dlast=Math.max(P.meta.dmax,dl||0); P.meta.cdpsTo=isFinite(cap)?cap:null;}
    return P;
  }

  /* ---------------- CONTEXT ---------------- */
  function ctx(P,opt){
    opt=opt||{};
    const nC=P.cid.length, L=P.L, nR=L.k.length;
    /* kênh / vùng */
    const NM={},KV={};(P.namemap||[]).forEach(r=>NM[norm(r[0])]=[r[1],r[2]]);(P.kvmap||[]).forEach(r=>KV[r[0]]=[r[1],r[2]]);
    const kenh=new Array(nC),vung=new Array(nC),src=new Array(nC);
    for(let i=0;i<nC;i++){const a=NM[norm(P.cnm[i])];if(a){kenh[i]=a[0];vung[i]=a[1];src[i]='Ngoại lệ theo tên';continue;}
      const b=KV[P.ckv[i]];if(b){kenh[i]=b[0];vung[i]=b[1];src[i]='Mã KV '+P.ckv[i];}else{kenh[i]='5. Khác';vung[i]='Không thường xuyên';src[i]=P.ckv[i]?'Mã KV lạ '+P.ckv[i]:'Chưa có mã KV';}}
    /* nguyên tắc hạn nợ */
    const NT={};(P.nt.rules||[]).forEach(r=>NT[r[0]]={c:r[0],n:r[1],how:r[2],moc:r[3],days:r[4]||0,noi:r[5]||0,lim:r[6]||0});
    if(!NT.NT00)NT.NT00={c:'NT00',n:'Chưa có nguyên tắc',how:'Chưa có nguyên tắc',moc:'Ngày chứng từ',days:30,noi:0,lim:0};
    const CH={};(P.nt.chan||[]).forEach(r=>CH[r[0]+'|'+r[1]]=r[2]);
    const EX={};(P.nt.exc||[]).forEach(r=>EX[r[0]]=r[2]);
    const nt=new Array(nC);for(let i=0;i<nC;i++)nt[i]=EX[P.cid[i]]||CH[kenh[i]+'|'+vung[i]]||'NT00';
    const noiOn=(P.nt.param===undefined?1:P.nt.param)?1:0;
    /* hạn mức */
    const HM=new Float64Array(nC),HM1=new Float64Array(nC),HM2=new Float64Array(nC),hasHM=new Uint8Array(nC);
    const CIx={};P.cid.forEach((id,i)=>CIx[id]=i);
    (P.hm||[]).forEach(r=>{const i=CIx[r[0]];if(i!==undefined){HM[i]=r[1];HM1[i]=r[2];HM2[i]=r[3];hasHM[i]=1;}});
    /* bảo lãnh — khớp theo tên đối tượng */
    const NI={};P.cnm.forEach((n,i)=>{const k=norm(n);if(NI[k]===undefined||P.cact[i])NI[k]=i;});
    const BL=(P.bl||[]).map(r=>({so:r[0],f:r[1],t:r[2],bank:r[3],nm:r[4],a:r[5],tot:r[6],nd:r[7],ci:NI[norm(r[4])]===undefined?-1:NI[norm(r[4])]}));
    /* tháng */
    const dmin=P.meta.dmin, dmax=opt.dmax||P.meta.dlast||P.meta.dmax;
    const ym0=Math.min(ymOf(dmin),202301), ymN=ymOf(dmax); const MS=[];for(let y=ym0;y<=ymN;y=ymAdd(y,1))MS.push(y);
    const nM=MS.length, mIdx=d=>{const y=ymOf(d);let i=(Math.floor(y/100)-Math.floor(ym0/100))*12+(y%100)-(ym0%100);return i;};
    /* số dư đầu */
    const opNo=new Float64Array(nC),opCo=new Float64Array(nC);
    (P.op||[]).forEach(r=>{const i=CIx[r[0]];if(i!==undefined){opNo[i]+=r[2];opCo[i]+=r[3];}});
    /* dòng tiền theo tháng × loại */
    const FL=new Float64Array(nC*nM*NL);
    const rowsOf=Array.from({length:nC},()=>[]);
    for(let j=0;j<nR;j++){const d=L.d[j];if(d>dmax)continue;const m=mIdx(d);if(m<0)continue;FL[(L.k[j]*nM+m)*NL+L.t[j]]+=L.a[j];rowsOf[L.k[j]].push(j);}
    /* lớp HĐKD / Ngoài HĐKD (cấp khách hàng) */
    const NGX=new Set(opt.ngx||['CC000552']);
    const layer=new Uint8Array(nC), lyWhy=new Array(nC).fill('');
    for(let i=0;i<nC;i++){
      if(kenh[i]==='6. Thương mại'){layer[i]=1;lyWhy[i]='Kênh 6. Thương mại';continue;}
      if(NGX.has(P.cid[i])){layer[i]=1;lyWhy[i]='Danh sách ngoại lệ (chuyển nhượng tài sản)';continue;}
      let sh=0,ot=0;for(let m=0;m<nM;m++){const o=(i*nM+m)*NL;sh+=FL[o];ot+=FL[o+2]+FL[o+3];}
      if(ot>=1e9&&ot>=0.5*(sh+ot)){layer[i]=1;lyWhy[i]='Bán khác / bán đầu tư ≥ 50% doanh số ghi nợ';}
    }
    /* khoản ghi nợ (gom theo chứng từ) & quỹ thanh toán cho FIFO */
    const ITM=opt.itemMC===null?null:new Set(opt.itemMC||['HD','HC']);
    const IT=[]; /* mỗi KH: {d:[],s:[],c:[],a:[],cum:[]} ; CR: {d:[],cum:[]} */
    const CR=[], CRT=[];
    for(let i=0;i<nC;i++){
      const it={d:[],s:[],c:[],a:[],cum:null}, cr={d:[],a:[]}, crt=[];
      if(opNo[i])pushIt(it,OPDAY,'SDDK',-1,opNo[i]);
      if(opCo[i]){cr.d.push(OPDAY);cr.a.push(opCo[i]);crt.push({d:OPDAY,a:opCo[i],t:-1});}
      const R=rowsOf[i];
      for(let q=0;q<R.length;q++){const j=R[q],a=L.a[j];
        if(a>0&&L.v[j]===1&&(!ITM||ITM.has(P.dic.mc[L.c[j]]))){ /* ghi nợ 131 = khoản phải thu theo chứng từ */
          const n=it.d.length-1;
          if(n>=0&&it.d[n]===L.d[j]&&it.s[n]===L.s[j]&&it.c[n]===L.c[j])it.a[n]+=a;else pushIt(it,L.d[j],L.s[j],L.c[j],a);
        }else{cr.d.push(L.d[j]);cr.a.push(-a);crt.push({d:L.d[j],a:-a,t:L.t[j],j});}
      }
      crt.sort((x,y)=>x.d-y.d||x.t-y.t);const cm=[];crt.forEach(c=>{const l=cm[cm.length-1];if(l&&l.d===c.d&&l.t===c.t)l.a+=c.a;else cm.push({d:c.d,a:c.a,t:c.t});});
      CRT.push(cm.filter(c=>Math.abs(c.a)>0.5).sort((x,y)=>x.d-y.d||(y.a>0)-(x.a>0)));
      /* sắp theo ngày, số chứng từ */
      const ord=it.d.map((_,q)=>q).sort((x,y)=>it.d[x]-it.d[y]||(it.s[x]<it.s[y]?-1:it.s[x]>it.s[y]?1:0));
      const it2={d:[],s:[],c:[],a:[],cum:[]};let cu=0;ord.forEach(q=>{it2.d.push(it.d[q]);it2.s.push(it.s[q]);it2.c.push(it.c[q]);it2.a.push(it.a[q]);cu+=it.a[q];it2.cum.push(cu);});
      const co=cr.d.map((_,q)=>q).sort((x,y)=>cr.d[x]-cr.d[y]);const cr2={d:[],cum:[]};let cc=0;co.forEach(q=>{cr2.d.push(cr.d[q]);cc+=cr.a[q];cr2.cum.push(cc);});
      IT.push(it2);CR.push(cr2);
    }
    function pushIt(it,d,s,c,a){it.d.push(d);it.s.push(s);it.c.push(c);it.a.push(a);}
    const ub=(arr,v)=>{let lo=0,hi=arr.length;while(lo<hi){const m=(lo+hi)>>1;if(arr[m]<=v)lo=m+1;else hi=m;}return lo;}; /* số phần tử ≤ v */
    const poolAt=(i,D)=>{const c=CR[i];const n=ub(c.d,D);return n?c.cum[n-1]:0;};
    const debAt=(i,D)=>{const t=IT[i];const n=ub(t.d,D);return n?t.cum[n-1]:0;};
    const balAt=(i,D)=>debAt(i,D)-poolAt(i,D);
    /* hạn thanh toán của 1 chứng từ */
    function dueOf(code,d){const r=NT[code]||NT.NT00;
      if(r.how==='Luôn trong hạn'||r.how==='Theo hạn mức')return Infinity;
      const base=r.moc==='Cuối tháng'?eom(d):d; return base+(r.days||0)+(noiOn?(r.noi||0):0);}
    /* ---------- KHỚP TIỀN THU ↔ HÓA ĐƠN (FIFO theo thời gian thực) ----------
       Mỗi khoản giảm công nợ (thu tiền, chiết khấu, trả lại, bù trừ…) trừ vào hóa đơn còn mở cũ nhất tại thời điểm phát sinh;
       tiền về trước hóa đơn (trả trước) treo lại và trừ vào hóa đơn kế tiếp → ngày trả âm. Kết quả: bảng phân bổ AL. */
    let MT=null;
    function match(){
      if(MT)return MT;
      const k=[],pd=[],id=[],a=[],t=[],du=[],io=[];
      const rec=(i,p,it,am,ty,dd,op)=>{k.push(i);pd.push(p);id.push(it);a.push(am);t.push(ty);du.push(dd);io.push(op||0);};
      for(let i=0;i<nC;i++){
        const T=IT[i],C=CRT[i];if(!T.d.length&&!C.length)continue;
        const code=nt[i];const q=[];let qh=0;const carry=[];let ii=0,ci=0;
        const addItem=(d,am,op)=>{const due=code==='NT00'?d+((NT.NT00&&NT.NT00.days)||30):dueOf(code,d);const o={d,r:am,due,op};
          while(carry.length&&o.r>0.5){const c=carry[0];const x=Math.min(c.a,o.r);rec(i,c.d,d,x,c.t,due,op);c.a-=x;o.r-=x;if(c.a<=0.5)carry.shift();}
          if(o.r>0.5)q.push(o);};
        while(ii<T.d.length||ci<C.length){
          const dI=ii<T.d.length?T.d[ii]:Infinity, dC=ci<C.length?C[ci].d:Infinity;
          if(dI<=dC){addItem(T.d[ii],T.a[ii],T.s[ii]==='SDDK'?1:0);ii++;}
          else{const c=C[ci++];if(c.d>dmax)continue;let am=c.a;
            if(am>0){while(am>0.5&&qh<q.length){const o=q[qh];const x=Math.min(o.r,am);rec(i,c.d,o.d,x,c.t,o.due,o.op);o.r-=x;am-=x;if(o.r<=0.5)qh++;}
              if(am>0.5)carry.push({d:c.d,a:am,t:c.t});}
            else if(am<-0.5&&c.t===6){rec(i,c.d,c.d,am,6,c.d,3);q.push({d:c.d,r:-am,due:c.d,op:2});}
            else if(am<-0.5){let x=-am;while(x>0.5&&carry.length){const cc=carry[0];const y=Math.min(cc.a,x);rec(i,cc.d,c.d,y,cc.t,c.d,2);cc.a-=y;x-=y;if(cc.a<=0.5)carry.shift();}
              if(x>0.5){const o={d:c.d,r:x,due:c.d,op:2};q.push(o);}}}
        }
      }
      const Fa=x=>Float64Array.from(x);
      MT={k:Int32Array.from(k),pd:Int32Array.from(pd),id:Int32Array.from(id),a:Fa(a),t:Int8Array.from(t),du:Fa(du),op:Uint8Array.from(io),n:k.length};
      return MT;
    }
    const blAct=(D)=>{const a=new Float64Array(nC);BL.forEach(b=>{if(b.ci>=0&&b.f<=D&&b.t>=D)a[b.ci]+=b.a;});return a;};
    /* ---------- ẢNH CHỤP TUỔI NỢ TẠI NGÀY D ---------- */
    function snap(D,withItems){
      const S={D,net:new Float64Array(nC),deb:new Float64Array(nC),open:new Float64Array(nC),b:Array.from({length:9},()=>new Float64Array(nC)),
        dp:new Float64Array(nC),bl:new Float64Array(nC),blu:new Float64Array(nC),inT:new Float64Array(nC),qh:new Float64Array(nC),cnt:new Float64Array(nC),
        qhA:new Float64Array(nC),cntOv:new Float64Array(nC),qb:Array.from({length:5},()=>new Float64Array(nC)),maxQ:new Float64Array(nC),maxAge:new Float64Array(nC),items:withItems?[]:null};
      const BA=blAct(D);
      for(let i=0;i<nC;i++){
        const t=IT[i];const n=ub(t.d,D);const pool=poolAt(i,D);const deb=n?t.cum[n-1]:0;const net=deb-pool;S.net[i]=net;S.deb[i]=deb;S.bl[i]=BA[i];
        if(net<=0.5)continue;
        const code=nt[i], rule=NT[code]||NT.NT00;let blr=BA[i];const its=[];
        for(let q=0;q<n;q++){const a=t.a[q];if(a<=0)continue;const prev=t.cum[q]-a;const op=Math.min(a,Math.max(0,t.cum[q]-pool));if(op<=0.5)continue;
          const age=D-t.d[q];let bk=0;for(let z=8;z>=0;z--)if(age>=BKT[z]){bk=z;break;}
          S.open[i]+=op;S.b[bk][i]+=op;S.dp[i]+=op*DPC[bk];if(age>S.maxAge[i])S.maxAge[i]=age;
          const u=Math.min(op,blr);blr-=u;S.blu[i]+=u;const af=op-u;
          const due=dueOf(code,t.d[q]);
          its.push({q,d:t.d[q],s:t.s[q],c:t.c[q],a,op,age,bk,u,af,due});
        }
        /* phân loại sau bảo lãnh */
        if(rule.how==='Theo hạn mức'){let ex=Math.max(0,its.reduce((s,x)=>s+x.af,0)-(rule.lim||0));
          for(let z=its.length-1;z>=0;z--){const x=its[z];const o=Math.min(x.af,ex);ex-=o;x.ov=o;x.ok=x.af-o;}}
        its.forEach(x=>{
          if(rule.how==='Theo hạn mức'){S.qh[i]+=x.ov;S.inT[i]+=x.ok;S.qhA[i]+=x.ov;x.qd=x.ov>0?D-x.d:0;x.st=x.ov>0?'Quá hạn':'Trong hạn';}
          else if(code==='NT00'){S.cnt[i]+=x.af;const dA=x.d+(NT.NT00.days||30);x.due=dA;x.qd=Math.max(0,D-dA);if(x.qd>0){S.qhA[i]+=x.af;S.cntOv[i]+=x.af;}x.st=x.u>=x.op-0.5?'Bảo lãnh bao phủ':'Chưa có nguyên tắc';}
          else{x.qd=x.due===Infinity?0:Math.max(0,D-x.due);if(x.qd>0){S.qh[i]+=x.af;S.qhA[i]+=x.af;}else S.inT[i]+=x.af;
            x.st=x.u>=x.op-0.5?'Bảo lãnh bao phủ':(x.qd>0?'Quá hạn':'Trong hạn');}
          const ov=(code==='NT00'||rule.how!=='Theo hạn mức')?(x.qd>0?x.af:0):x.ov;
          if(ov>0.5){let z=0;for(let w=4;w>=0;w--)if(x.qd>=QBK[w]){z=w;break;}S.qb[z][i]+=ov;if(x.qd>S.maxQ[i])S.maxQ[i]=x.qd;}
        });
        if(withItems)its.forEach(x=>{x.ci=i;S.items.push(x);});
      }
      return S;
    }
    /* ảnh chụp tại mọi cuối tháng + ngày chốt */
    const ME=MS.map(ym=>Math.min(ymEnd(ym),dmax));
    const SN=ME.map(D=>snap(D,false));
    /* tỷ lệ trượt nhóm tuổi (khoản còn nợ sau 1 tháng) */
    function roll(m){ /* từ cuối tháng m sang m+1 */
      if(m+1>=nM)return null;const D0=ME[m],D1=ME[m+1];const fr=new Float64Array(6),st=new Float64Array(6);
      for(let i=0;i<nC;i++){const t=IT[i];const n=ub(t.d,D0);if(!n)continue;const p0=poolAt(i,D0),p1=poolAt(i,D1);if(t.cum[n-1]-p0<=0.5)continue;
        for(let q=0;q<n;q++){const a=t.a[q];if(a<=0)continue;const o0=Math.min(a,Math.max(0,t.cum[q]-p0));if(o0<=0.5)continue;const o1=Math.min(a,Math.max(0,t.cum[q]-p1));
          const age=D0-t.d[q];let z=0;for(let w=5;w>=0;w--)if(age>=RBK[w]){z=w;break;}fr[z]+=o0;st[z]+=o1;}}
      return {fr,st};
    }
    return {P,nC,nM,MS,ME,LOAI,NL,LI,BKN,BKT,DPC,QBN,QBK,RBN,FL,SN,kenh,vung,src,nt,NT,layer,lyWhy,HM,HM1,HM2,hasHM,BL,opNo,opCo,IT,CR,CRT,match,rowsOf,
      snap,roll,balAt,poolAt,debAt,mIdx,dueOf,blAct,dmax,dmin,noiOn,CIx};
  }
  /* nén / giải nén khối dữ liệu nhúng (deflate-raw + base64) */
  const isNode=typeof window==='undefined';
  async function enc(P){const u=new TextEncoder().encode(JSON.stringify(P));let z;
    if(isNode)z=new Uint8Array(require('zlib').deflateRawSync(u,{level:9}));else z=new Uint8Array(await new Response(new Blob([u]).stream().pipeThrough(new CompressionStream('deflate-raw'))).arrayBuffer());
    if(isNode)return Buffer.from(z).toString('base64');let s='';for(let i=0;i<z.length;i+=0x8000)s+=String.fromCharCode.apply(null,z.subarray(i,i+0x8000));return btoa(s);}
  async function dec(b64){let z;if(isNode)z=new Uint8Array(Buffer.from(b64,'base64'));else{const b=atob(b64);z=new Uint8Array(b.length);for(let i=0;i<b.length;i++)z[i]=b.charCodeAt(i);}
    const u=isNode?new Uint8Array(require('zlib').inflateRawSync(z)):new Uint8Array(await new Response(new Blob([z]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer());
    return JSON.parse(new TextDecoder().decode(u));}
  return {enc,dec,pack,ctx,LOAI,LI,toD,ser,ymOf,eom,ymEnd,ymStart,ymAdd,norm,OPDAY,BKN,QBN,RBN};
})();
if(typeof module!=='undefined')module.exports=AR;
