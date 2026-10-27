

/* MOBILE FIX v1 — đóng thanh công cụ / menu khi chạm ra ngoài hoặc sau khi chọn */
(function(){
  function mob(){return window.innerWidth<=820;}
  document.addEventListener('click',function(e){
    if(!mob())return;
    var t=e.target, tl=document.querySelector('.tools');
    if(!tl||typeof state==='undefined'||!state.toolbar||typeof setToolbar!=='function')return;
    var inTools=tl.contains(t), onMore=t.closest&&t.closest('#btnMore');
    if(!inTools&&!onMore){ setToolbar(false); return; }
    var b=t.closest&&t.closest('.ib');
    if(inTools&&b&&b.id!=='btnMode'&&b.id!=='btnLock'){ setTimeout(function(){try{setToolbar(false);}catch(_){}},60); }
  },true);
  /* nút Back / vuốt: đóng sidebar nếu đang mở khi đổi kích thước */
  window.addEventListener('resize',function(){ if(window.innerWidth>1020)document.body.classList.remove('sbshow'); });
  /* chạm vào vùng ngoài trên iOS: scrim phải bắt được tap */
  var sc=document.getElementById('scrim'); if(sc)sc.addEventListener('touchend',function(e){e.preventDefault();document.body.classList.remove('sbshow');},{passive:false});
})();

