/* Válvula real en video: gira sola y se puede arrastrar para girarla 360° (control del tiempo del video).
   Si el video no carga, se activa la válvula 3D hecha por código (hero3d.js). */
(function(){
  var hv=document.getElementById('hv'); if(!hv) return;
  var v=hv.querySelector('video'), H=document.documentElement;
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var drag=false,lx=0,pid=null,resume=0;
  function fallback(){ if(!hv.parentNode) return; hv.remove(); H.classList.add('v3d'); document.dispatchEvent(new Event('pv:fallback')); }
  v.addEventListener('error',function(e){ if(e.target.tagName==='SOURCE'&&e.target.nextElementSibling) return; fallback(); },true);
  v.addEventListener('canplay',function(){ H.classList.add('glready'); });
  if(reduce){ v.removeAttribute('autoplay'); v.pause(); }
  else { var p=v.play(); if(p&&p.catch)p.catch(function(){}); }
  function seek(dx){
    var d=v.duration||4, t=(v.currentTime+dx/hv.clientWidth*d)%d; if(t<0)t+=d; v.currentTime=t;
  }
  hv.addEventListener('pointerdown',function(e){drag=true;pid=e.pointerId;lx=e.clientX;clearTimeout(resume);v.pause();hv.classList.add('grab');try{hv.setPointerCapture(pid)}catch(_){}});
  hv.addEventListener('pointermove',function(e){ if(!drag||e.pointerId!==pid)return; seek(e.clientX-lx); lx=e.clientX; });
  function up(){ if(!drag)return; drag=false; hv.classList.remove('grab'); H.classList.add('dragged'); if(!reduce) resume=setTimeout(function(){var p=v.play();if(p&&p.catch)p.catch(function(){});},900); }
  hv.addEventListener('pointerup',up); hv.addEventListener('pointercancel',up);
})();
