/* ══════════════════════════════════════════════════════════════
   CMC · PHÂN TÍCH CÔNG NỢ & THU TIỀN TK 131 — đọc file Excel (SheetJS)
   Đọc các sheet IN_ / M_ / W_Tên phân tích → khối RAW (không đọc số từ sheet OUT_,
   trừ dòng tổng của OUT_ để đối soát).
   ══════════════════════════════════════════════════════════════ */
var ARM=(function(){
  const SH={
    bk26:/^IN_B[ảa]ng k[êe] ch[ứu]ng t[ừu]/i, bkM:/^M_B[ảa]ng k[êe] ch[ứu]ng t[ừu]/i,
    cdps:/^IN_C[ĐD]PS/i, rule:/^W_T[êe]n ph[âa]n t[íi]ch/i, nt:/^IN_Th[ờo]i h[ạa]n/i, hm:/^IN_H[ạa]n m[ứu]c/i,
    bl:/^M_B[ảa]o l[ãa]nh/i, op:/^M_D[ưu] n[ợo]/i, dm:/^M_Danh m[ụu]c [đd][ốo]i t[ưu][ợo]ng/i, dc:/^M_Danh m[ụu]c [đd][ìi]nh ch[ỉi]/i,
    oSum:/^OUT_T[ổo]ng h[ợo]p ph[ảa]i thu/i, oAge:/^OUT_BC theo d[õo]i tu[ổo]i/i, oThu:/^OUT_BC thu ti[ềe]n 2/i
  };
  const N=v=>{if(v===null||v===undefined||v==='')return 0;if(typeof v==='number')return v;const x=parseFloat(String(v).replace(/,/g,''));return isNaN(x)?0:x;};
  const S=v=>(v===null||v===undefined)?'':String(v).trim();
  const norm=s=>S(s).toLowerCase().normalize('NFC').replace(/\s+/g,' ').trim();
  function find(wb,re){return wb.SheetNames.filter(n=>re.test(n.normalize('NFC')));}
  function rows(ws){ /* trả mảng 2 chiều giá trị thô */
    if(!ws)return [];
    const D=ws['!data']||(Array.isArray(ws)?ws:null);
    if(D){const n=D.length,o=new Array(n);for(let i=0;i<n;i++){const r=D[i];if(!r){o[i]=[];continue;}const a=new Array(r.length);for(let j=0;j<r.length;j++){const c=r[j];a[j]=c?c.v:null;}o[i]=a;}return o;}
    /* chế độ thường: dựng lại theo toạ độ tuyệt đối (cột A = 0) */
    const rg=XLSX.utils.decode_range(ws['!ref']||'A1:A1'),o=[];
    for(let i=0;i<=rg.e.r;i++){const a=[];for(let j=0;j<=rg.e.c;j++){const c=ws[XLSX.utils.encode_cell({r:i,c:j})];a.push(c?c.v:null);}o.push(a);}
    return o;
  }
  function hdrCol(R,label,from,to){label=norm(label);for(let i=0;i<Math.min(R.length,8);i++){const r=R[i]||[];for(let j=(from||0);j<Math.min(r.length,to||99);j++)if(norm(r[j])===label)return [i,j];}return null;}

  /* ---------- bảng kê chứng từ ---------- */
  function readBK(ws,acc,dic,src){
    const D=ws['!data']||(Array.isArray(ws)?ws:null);
    const head=D?rows8(D):rows(ws);
    const R=D||null;
    const h=hdrCol(head,'Chứng từ'); if(!h)throw new Error('Không tìm thấy dòng tiêu đề "Chứng từ" ở sheet '+src);
    const H=h[0], cD=h[1], cS=h[1]+1, g=l=>{const x=hdrCol(head,l);if(!x)throw new Error('Thiếu cột "'+l+'" ở sheet '+src);return x[1];};
    const cDG=g('Diễn giải'), cTK=g('Tài khoản'), cT=g('Tiền'), cMC=g('Mã chứng từ'), cMG=g('Mã giao dịch'),
      cTKNH=g('Tài khoản ngân hàng'), cNH=g('Tên ngân hàng'), cDN=g('Đối tượng nợ'), cDC=g('Đối tượng có');
    const A=R||head, v=(r,j)=>{const c=r[j];return R?(c?c.v:null):c;};
    let n=0;
    for(let i=H+2;i<A.length;i++){const r=A[i];if(!r)continue;const d=v(r,cD);if(typeof d!=='number'||d<30000)continue;
      const t=N(v(r,cT));if(!t)continue;
      acc.push({d:Math.round(d),s:S(v(r,cS)),dg:S(v(r,cDG)),no:S(v(r,cTK)),co:S(v(r,cTK+1)),t,mc:S(v(r,cMC)),mg:S(v(r,cMG)),tknh:S(v(r,cTKNH)),nh:S(v(r,cNH)),
        dn:S(v(r,cDN)),dnn:S(v(r,cDN+1)),dc:S(v(r,cDC)),dcn:S(v(r,cDC+1))}); n++;
    }
    return n;
  }
  function rows8(D){const o=[];for(let i=0;i<Math.min(D.length,8);i++){const r=D[i];o.push(r?r.map(c=>c?c.v:null):[]);}return o;}
  /* ---------- đọc toàn bộ workbook ---------- */
  function parse(wb,fileName,base){
    const W={}, miss=[], got=[];
    for(const k in SH){const f=find(wb,SH[k]);W[k]=f.length?wb.Sheets[f[0]]:null;if(f.length)got.push(f[0]);}
    const raw={meta:{file:fileName,gen:new Date().toISOString(),sheets:got}};
    /* phân loại bút toán, quy đổi vùng, ngân hàng */
    if(W.rule){const R=rows(W.rule);const h=hdrCol(R,'Bút toán');const H=h?h[0]:3;
      raw.rule=[];raw.kvmap=[];raw.namemap=[];raw.bankmap=[];
      for(let i=H+1;i<R.length;i++){const r=R[i]||[];
        if(S(r[2])&&S(r[3])&&S(r[8]))raw.rule.push([S(r[2]),S(r[3]),S(r[4]),S(r[6]),S(r[8])]);
        if(S(r[11]))raw.namemap.push([S(r[11]),S(r[13]),S(r[12]),S(r[10])]); else if(S(r[10]))raw.kvmap.push([S(r[10]),S(r[13]),S(r[12])]);
        if(S(r[15]))raw.bankmap.push([S(r[15]),S(r[16]),S(r[17])]);}
    } else miss.push('W_Tên phân tích');
    /* nguyên tắc hạn nợ */
    if(W.nt){const R=rows(W.nt);const nt={param:1,rules:[],chan:[],exc:[]};let sec='';
      R.forEach(r=>{r=r||[];const a=S(r[1]);
        if(/^I\./.test(a))sec='I';else if(/^II\./.test(a))sec='II';else if(/^III\./.test(a))sec='III';else if(/^IV\./.test(a))sec='IV';
        else if(sec==='I'&&/ngày nới/i.test(a))nt.param=N(r[5]);
        else if(sec==='II'&&/^NT\d+/.test(a))nt.rules.push([a,S(r[2]),S(r[3]),S(r[4]),N(r[5]),N(r[6]),N(r[7])]);
        else if(sec==='III'&&a&&/^NT\d+/.test(S(r[3])))nt.chan.push([a,S(r[2]),S(r[3])]);
        else if(sec==='IV'&&a&&/^NT\d+/.test(S(r[3])))nt.exc.push([a,S(r[2]),S(r[3])]);});
      raw.nt=nt;
    } else miss.push('IN_Thời hạn công nợ');
    if(W.hm){raw.hm=[];rows(W.hm).forEach(r=>{r=r||[];if(S(r[1])&&typeof r[3]==='number')raw.hm.push([S(r[1]),N(r[3]),N(r[4]),N(r[5])]);});} else miss.push('IN_Hạn mức công nợ');
    if(W.bl){raw.bl=[];rows(W.bl).forEach(r=>{r=r||[];if(S(r[1])&&typeof r[2]==='number')raw.bl.push([S(r[1]),N(r[2]),N(r[3]),S(r[5]),S(r[6]),N(r[7]),N(r[8]),S(r[4])]);});} else miss.push('M_Bảo lãnh');
    if(W.op){raw.op=[];rows(W.op).forEach((r,i)=>{r=r||[];if(i>2&&S(r[1])&&S(r[1])!=='Mã'&&(typeof r[3]==='number'||typeof r[4]==='number'))raw.op.push([S(r[1]),S(r[2]),N(r[3]),N(r[4])]);});} else miss.push('M_Dư nợ tại 1.1.23');
    /* danh mục đối tượng (đang dùng + đình chỉ) */
    const dm=[];[W.dm,W.dc].forEach((w,wi)=>{if(!w)return;const R=rows(w);const h=hdrCol(R,'Khu vực');const ck=h?h[1]:18;
      R.forEach((r,i)=>{r=r||[];if(i>1&&S(r[1])&&S(r[1])!=='Mã')dm.push([S(r[1]),S(r[2]),S(r[ck]),wi?0:1]);});});
    if(dm.length)raw.dm=dm; else miss.push('M_Danh mục đối tượng');
    if(W.cdps){raw.cdps=[];rows(W.cdps).forEach(r=>{r=r||[];if(typeof r[1]==='number'&&typeof r[2]==='number'&&r[1]>30000)raw.cdps.push([r[1],r[2],N(r[3]),N(r[4]),N(r[5]),N(r[6]),N(r[7]),N(r[8])]);});}
    /* bảng kê */
    const lines=[];let nM=0,n26=0;
    if(W.bkM)nM=readBK(W.bkM,lines,null,'M_Bảng kê FY23-25');
    if(W.bk26)n26=readBK(W.bk26,lines,null,'IN_Bảng kê FY26');
    raw.meta.nM=nM; raw.meta.n26=n26;
    raw._lines=lines; raw._hasM=!!W.bkM; raw._has26=!!W.bk26;
    raw.meta.miss=miss;
    return raw;
  }
  /* đọc dòng tổng của các sheet OUT_ (chỉ để đối soát) — gọi với workbook đọc giới hạn số dòng */
  function parseRef(wb){
    const ref={};
    const f1=find(wb,SH.oSum);if(f1.length){const R=rows(wb.Sheets[f1[0]]);
      const t=R.find(r=>r&&S(r[4])==='Tổng cộng');const p=R[3]||[];
      if(t)ref.sum={from:N(p[6]),to:N(p[23]),dn:N(t[5]),dc:N(t[6]),psn:N(t[8]),psc:N(t[9]),ban:N(t[11]),bkh:N(t[12]),bdt:N(t[13]),tl:N(t[14]),vat:N(t[15]),ck:N(t[16]),thu:N(t[17]),tra:N(t[18]),bt:N(t[19]),kh:N(t[20]),
        cn:N(t[22]),cc:N(t[23]),hm:N(t[25]),vhm:N(t[26]),thu12:N(t[36]),nkh:S(t[3])};}
    const f2=find(wb,SH.oAge);if(f2.length){const R=rows(wb.Sheets[f2[0]]);
      const t=R.find(r=>r&&S(r[7])==='Tổng cộng');const rd=(R[1]||[])[13];
      if(t)ref.age={rep:N(rd),dk:N(t[11]),gt:N(t[12]),con:N(t[13]),b:[15,16,17,18,19,20,21,22,23].map(j=>N(t[j])),dp:N(t[26]),blt:N(t[32]),sau:N(t[33]),th:N(t[34]),qh:N(t[35]),cnt:N(t[36]),nkh:S(t[6])};}
    const f3=find(wb,SH.oThu);if(f3.length){const R=rows(wb.Sheets[f3[0]]);
      ref.thu={from:N((R[3]||[])[2]),to:N((R[4]||[])[2]),tot:N((R[7]||[])[3])};}
    return ref;
  }
  return {parse,parseRef,SH,find,rows,norm,N,S};
})();
if(typeof module!=='undefined')module.exports=ARM;
