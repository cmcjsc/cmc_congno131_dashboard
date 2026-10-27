
/* ═════ LỚP ONLINE — số liệu lưu trên Vercel Blob (Private), gửi / tải theo nhiều phần ≤ 2,4 MB; xem: ai có link · xuất bản: cần mã nạp ═════ */
var ONL={
  meta:null, online:false, pending:null, code:'', PART:2400000,
  fmt(ts){try{const d=new Date(ts);return d.toLocaleString('vi-VN',{hour12:false,day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'});}catch(e){return ts||'';}},
  per(m){return m?((m.d?String(m.d).padStart(2,'0')+'/':'')+String(m.m).padStart(2,'0')+'/'+m.y):'';},
  async boot(){
    if(!/^https?:$/.test(location.protocol))return;
    try{
      const ctl=new AbortController(), t=setTimeout(()=>ctl.abort(),15000);
      const r=await fetch('/api/state',{cache:'no-store',signal:ctl.signal}); clearTimeout(t);
      if(!r.ok)return;
      const j=await r.json(); ONL.online=true;
      if(j&&j.id&&j.parts){
        if(typeof busy==='function')busy('Đang tải số liệu đã xuất bản…');
        const ps=await Promise.all(Array.from({length:j.parts},(_,k)=>fetch('/api/state?id='+encodeURIComponent(j.id)+'&part='+k,{cache:'no-store'}).then(x=>x.json())));
        if(ps.some(p=>!p||!p.ok))throw new Error('Thiếu phần số liệu');
        const st=JSON.parse(ps.map(p=>p.chunk).join(''));
        if(st&&st.DATA){window.__SAVED__=st; ONL.meta=j.meta||null;}
      }
    }catch(e){console.warn('Không đọc được số liệu online — dùng bản nhúng sẵn trong trang.',e);}
    finally{if(typeof busy==='function')busy(false);}
  },
  announce(){
    if(!ONL.online)return;
    toast(ONL.meta?('🌐 Đang xem bản xuất bản — dữ liệu đến '+ONL.per(ONL.meta)+' · '+ONL.fmt(ONL.meta.ts)):'🌐 Chưa có bản nào được xuất bản — đang hiện số liệu nhúng sẵn trong trang.');
  },
  bundle(){
    return {DATA:DATA,LAY:LAY,TXT:TXT,LOGO:LOGO,GAL:GAL,CAP:CAP,FIT:FIT,IMGU:IMGU,KHID:KHID,KORD:KORD,
      view:{mode:state.mode,pal:state.pal,labels:state.labels,prev:state.prev,anim:state.anim,toolbar:state.toolbar,
            sec:state.sec,u:state.u,lv:state.lv,fx:state.fx,fxc:state.fxc,cgrad:state.cgrad,ly:state.ly,fk:state.fk,fv:state.fv,mi:state.mi,pm:state.pm,cmp:state.cmp,a0:state.a0,dcut:state.dcut,cf:state.cf,ct:state.ct,ksort:state.ksort}};
  },
  markPending(why){
    if(!ONL.online)return;
    ONL.pending=why||ONL.pending||'thay đổi';
    let b=$('onlBar');
    if(!b){b=document.createElement('div');b.id='onlBar';
      b.style.cssText='position:fixed;left:50%;bottom:64px;transform:translateX(-50%);z-index:390;display:flex;align-items:center;gap:10px;flex-wrap:wrap;justify-content:center;'+
        'background:var(--card);color:var(--ink);border:1px solid var(--warn);border-radius:12px;padding:9px 12px;font-size:12.4px;max-width:92vw;box-shadow:0 16px 44px -14px rgba(0,0,0,.7)';
      b.innerHTML='<span id="onlBarT"></span><button class="btn" id="onlBarPub" style="height:30px">Xuất bản…</button><button class="btn ghost" id="onlBarX" style="height:30px">Bỏ thay đổi</button>';
      document.body.appendChild(b);
      $('onlBarPub').onclick=()=>ONL.openPublish();
      $('onlBarX').onclick=()=>{if(confirm('Bỏ các thay đổi chưa xuất bản và tải lại bản đang xuất bản?')){ONL.pending=null;location.reload();}};}
    $('onlBarT').textContent='⚠ BẢN XEM THỬ — chưa xuất bản ('+ONL.pending+'). Người khác vẫn thấy bản cũ.';
    b.style.display='flex';
  },
  clearPending(){ONL.pending=null;const b=$('onlBar');if(b)b.style.display='none';},
  openPublish(){
    if(!ONL.online){alert('Chỉ xuất bản được khi mở báo cáo bằng link online (không phải file lưu trên máy).');return;}
    const PM=PDATA.meta;
    $('pubSum').innerHTML='Sẽ xuất bản: bảng kê <b>'+dStr(PM.dmin)+' – '+dStr(PM.dmax)+'</b> · '+esc(PM.file||'')+' · '+(PM.rows||0).toLocaleString('vi-VN')+' dòng công nợ, kèm bố cục, nội dung đã chỉnh, trạng thái xử lý &amp; kế hoạch doanh số.<br>'+
      (ONL.meta?'Thay bản hiện hành (dữ liệu đến '+ONL.per(ONL.meta)+', '+ONL.fmt(ONL.meta.ts)+'). Bản cũ vẫn lưu trong Lịch sử.':'Đây là bản xuất bản đầu tiên.');
    $('pubErr').style.display='none'; $('pubCode').value=ONL.code||'';
    $('ovPub').classList.add('show'); setTimeout(()=>$((ONL.code?'pubNote':'pubCode')).focus(),60);
  },
  async post(url,obj){const r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(obj)});const j=await r.json().catch(()=>({}));if(!r.ok||!j.ok)throw new Error(j.error||('Lỗi '+r.status));return j;},
  async publish(){
    const err=t=>{$('pubErr').textContent=t;$('pubErr').style.display='';};
    const code=$('pubCode').value; if(!code)return err('Vui lòng nhập mã nạp số liệu.');
    const txt=JSON.stringify(ONL.bundle()), n=Math.ceil(txt.length/ONL.PART);
    if(n>12)return err('Gói dữ liệu quá lớn ('+(txt.length/1048576).toFixed(1)+' MB).');
    const sid=Array.from(crypto.getRandomValues(new Uint8Array(12))).map(x=>(x%36).toString(36)).join('');
    const go=$('pubGo'); go.disabled=true;
    try{
      await ONL.post('/api/check',{code});
      let j=null;
      for(let k=0;k<n;k++){go.textContent='Đang gửi phần '+(k+1)+'/'+n+'…';
        j=await ONL.post('/api/upload',{code,sid,part:k,total:n,note:$('pubNote').value.trim(),chunk:txt.slice(k*ONL.PART,(k+1)*ONL.PART)});}
      ONL.code=code; ONL.meta=j.meta; ONL.clearPending(); hide2('ovPub'); $('pubNote').value='';
      toast('✅ Đã xuất bản dữ liệu đến '+ONL.per(j.meta)+' lúc '+ONL.fmt(j.meta.ts)+' ('+(txt.length/1048576).toFixed(1)+' MB). Mọi người mở link sẽ thấy số mới.');
    }catch(e){err(e.message);}
    go.disabled=false; go.textContent='Xuất bản';
  },
  async openHistory(){
    if(!ONL.online){alert('Lịch sử chỉ có khi mở báo cáo bằng link online.');return;}
    $('hisErr').style.display='none'; $('hisCode').value=ONL.code||''; $('hisBody').textContent='Đang tải…';
    $('ovHis').classList.add('show');
    try{
      const r=await fetch('/api/history',{cache:'no-store'}); const j=await r.json();
      if(!r.ok||!j.ok)throw new Error(j.error||('Lỗi '+r.status));
      if(!j.items.length){$('hisBody').textContent='Chưa có bản nào được xuất bản.';return;}
      $('hisBody').className='';
      $('hisBody').innerHTML='<div class="tw"><table><thead><tr><th>Thời điểm</th><th>Dữ liệu đến</th><th>File Excel</th><th>Ghi chú</th><th></th></tr></thead><tbody>'+
        j.items.map(it=>'<tr><td>'+esc(ONL.fmt(it.ts))+'</td><td>'+esc(ONL.per(it))+'</td><td style="max-width:240px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="'+esc(it.file||'')+'">'+esc(it.file||'')+'</td><td>'+esc(it.note||'')+'</td><td>'+
          (it.id===j.current?'<b style="color:var(--ok)">Đang hiện hành</b>':'<button class="btn ghost" style="height:28px" data-rid="'+esc(it.id)+'">Khôi phục</button>')+'</td></tr>').join('')+
        '</tbody></table></div>';
      $('hisBody').querySelectorAll('[data-rid]').forEach(b=>b.onclick=()=>ONL.restore(b.dataset.rid));
    }catch(e){$('hisBody').textContent='';$('hisErr').textContent=e.message;$('hisErr').style.display='';}
  },
  async restore(id){
    const code=$('hisCode').value, er=t=>{$('hisErr').textContent=t;$('hisErr').style.display='';};
    if(!code)return er('Nhập mã nạp ở ô phía trên trước khi khôi phục.');
    if(!confirm('Đặt bản này làm bản hiện hành? Mọi người sẽ thấy bản này ngay.'))return;
    try{await ONL.post('/api/history',{code,action:'restore',id});ONL.code=code;ONL.pending=null;location.reload();}catch(e){er(e.message);}
  }
};
document.addEventListener('DOMContentLoaded',()=>{
  $('pubGo').onclick=()=>ONL.publish();
  $('pubCode').onkeydown=$('pubNote').onkeydown=e=>{if(e.key==='Enter')ONL.publish();};
  setTimeout(()=>ONL.announce(),1800);
});
window.addEventListener('beforeunload',e=>{if(ONL.pending){e.preventDefault();e.returnValue='';}});
