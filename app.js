(function(){
'use strict';
var P=window.PROINVI||{},E=P.EMPRESA||{},CATS=window.CATS||[],D=document,H=D.documentElement;
var $=function(s,r){return(r||D).querySelector(s)},$$=function(s,r){return[].slice.call((r||D).querySelectorAll(s))};
var esc=function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
var page=D.body.getAttribute('data-page')||'';
H.classList.add(P.TIENDA?'pv-tienda-on':'pv-tienda-off');
var ARROW='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
var pend=function(v){return v?esc(v):'<span class="pend">Por definir</span>'};

/* ---------- shell ---------- */
function shell(){
  var nav=[['index.html','Inicio','inicio'],['index.html#productos','Productos',''],['quienes-somos.html','Nosotros','nosotros'],['tienda.html','Tienda','tienda',1],['contacto.html','Contacto','contacto']];
  var h='<header class="hdr" id="hdr"><div class="wrap"><a class="logo" href="index.html" aria-label="Proinvi inicio"><img src="images/logo-blanco.svg" alt="Proinvi" width="68" height="58"></a>'+
   '<nav class="nav" id="nav">'+nav.map(function(n){
     if(n[1]==='Productos')return'<div class="dd'+(page==='producto'?' on':'')+'"><a href="'+n[0]+'" class="ddl">Productos</a><button class="ddb" type="button" aria-label="Ver líneas de producto" aria-expanded="false"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="m6 9 6 6 6-6"/></svg></button><div class="ddm">'+CATS.map(function(c){return'<a href="producto.html?c='+c.slug+'"><img src="'+c.cover+'" alt="" loading="lazy"><span>'+esc(c.name)+'</span></a>'}).join('')+'<a class="all" href="index.html#productos">Ver todas las líneas →</a></div></div>';
     return'<a href="'+n[0]+'"'+(n[3]?' data-tienda':'')+(n[2]&&n[2]===page?' class="on"':'')+'>'+n[1]+'</a>'}).join('')+
   '<a class="cta" data-sin-tienda href="contacto.html">Solicitar cotización</a>'+
   '<button class="cartbtn" data-tienda id="cartbtn" type="button" aria-label="Abrir carrito">Carrito<b id="cartn">0</b></button></nav>'+
   '<button class="burger" id="burger" aria-label="Menú"><span></span><span></span><span></span></button></div></header>';
  D.body.insertAdjacentHTML('afterbegin','<div class="glow" id="glow"></div>'+h);
  var f='<footer class="ftr"><div class="wrap"><div class="fg"><div><img src="images/logo-blanco.svg" alt="Proinvi"><p>'+esc(E.razon||'Proveedora Industrial Virgo, S.A. de C.V.')+'<br>Tuberías, válvulas y conexiones para el sector industrial.</p></div>'+
   '<div><h4>Productos</h4><ul>'+CATS.slice(0,5).map(function(c){return'<li><a href="producto.html?c='+c.slug+'">'+esc(c.name)+'</a></li>'}).join('')+'<li><a href="index.html#productos">Ver todas →</a></li></ul></div>'+
   '<div><h4>Empresa</h4><ul><li><a href="quienes-somos.html">Quiénes somos</a></li><li><a href="contacto.html">Contacto</a></li><li data-tienda><a href="tienda.html">Tienda en línea</a></li><li data-tienda><a href="tienda.html#seguimiento">Seguimiento de pedido</a></li></ul></div>'+
   '<div><h4>Contacto</h4><ul><li>'+pend(E.telefono)+'</li><li>'+pend(E.email)+'</li><li>'+pend(E.direccion)+'</li></ul></div></div>'+
   '<div class="copy"><span>© '+new Date().getFullYear()+' '+esc(E.nombre||'Proinvi')+' · '+esc(E.razon||'')+'</span><span>proinvi.com.mx</span></div></div></footer>';
  D.body.insertAdjacentHTML('beforeend',f);
  var hdr=$('#hdr'),nv=$('#nav'),bg=$('#burger');
  var onS=function(){hdr.classList.toggle('sc',scrollY>30)};addEventListener('scroll',onS,{passive:true});onS();
  bg.addEventListener('click',function(){bg.classList.toggle('on');nv.classList.toggle('on')});
  $$('a',nv).forEach(function(a){a.addEventListener('click',function(){bg.classList.remove('on');nv.classList.remove('on')})});
  var dd=$('.dd',nv),db=$('.ddb',nv);
  db.addEventListener('click',function(e){e.stopPropagation();var o=dd.classList.toggle('open');db.setAttribute('aria-expanded',o)});
  D.addEventListener('click',function(e){if(!dd.contains(e.target)){dd.classList.remove('open');db.setAttribute('aria-expanded','false')}});
  dd.addEventListener('keydown',function(e){if(e.key==='Escape'){dd.classList.remove('open');db.focus()}});
  if(matchMedia('(hover:hover)').matches)addEventListener('pointermove',function(e){var g=$('#glow');g.style.setProperty('--mx',e.clientX+'px');g.style.setProperty('--my',(e.clientY)+'px')},{passive:true});
}

/* ---------- efectos ---------- */
function fx(){
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce||!('IntersectionObserver' in window)){H.classList.add('noanim')}
  else{var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.05});
    $$('.rv').forEach(function(el,i){el.style.setProperty('--d',(i%4)*.08+'s');io.observe(el)});
    setTimeout(function(){$$('.rv').forEach(function(el){if(!el.classList.contains('in')&&el.getBoundingClientRect().top<innerHeight)el.classList.add('in')})},1500)}
  /* contadores */
  $$('[data-n]').forEach(function(el){var n=+el.getAttribute('data-n'),done=0;
    var run=function(){if(done)return;done=1;if(reduce){el.textContent=n;return}var t0=performance.now();(function s(t){var p=Math.min(1,(t-t0)/1400);el.textContent=Math.round(n*(1-Math.pow(1-p,3)));if(p<1)requestAnimationFrame(s)})(t0)};
    if('IntersectionObserver' in window)new IntersectionObserver(function(es,o){if(es[0].isIntersecting){run();o.disconnect()}}).observe(el);else run()});
  if(reduce||!matchMedia('(hover:hover)').matches)return;
  /* tilt 3D con brillo */
  $$('.card').forEach(function(c){
    c.addEventListener('pointermove',function(e){var r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
      c.classList.add('tilting');c.style.transform='rotateX('+((.5-y)*12)+'deg) rotateY('+((x-.5)*14)+'deg) translateZ(14px)';c.style.setProperty('--gx',x*100+'%');c.style.setProperty('--gy',y*100+'%')});
    c.addEventListener('pointerleave',function(){c.classList.remove('tilting');c.style.transform=''})});
  /* botones magnéticos */
  $$('.btn.p,.nav .cta').forEach(function(b){b.addEventListener('pointermove',function(e){var r=b.getBoundingClientRect();b.style.transform='translate('+((e.clientX-r.left-r.width/2)*.18)+'px,'+((e.clientY-r.top-r.height/2)*.3)+'px)'});b.addEventListener('pointerleave',function(){b.style.transform=''})});
  $$('.feat').forEach(function(f){f.addEventListener('pointermove',function(e){var r=f.getBoundingClientRect();f.style.setProperty('--fx',(e.clientX-r.left)+'px');f.style.setProperty('--fy',(e.clientY-r.top)+'px')})});
  /* parallax foto producto */
  var m=$('.gal .main');if(m){var im=$('img',m);m.addEventListener('pointermove',function(e){var r=m.getBoundingClientRect();im.style.transform='scale(1.12) translate('+(-(e.clientX-r.left-r.width/2)/r.width*24)+'px,'+(-(e.clientY-r.top-r.height/2)/r.height*24)+'px)'});m.addEventListener('pointerleave',function(){im.style.transform=''})}
}

/* ---------- inicio ---------- */
function inicio(){
  var b=$('#bento');if(!b)return;
  var sp=['w3','','','','w3','','w4','','','w4'];
  var spans=['','','','w4','','','w4','','',''];
  b.innerHTML=CATS.map(function(c,i){return'<a class="card rv '+(spans[i]||'')+'" href="producto.html?c='+c.slug+'"><span class="num">'+String(i+1).padStart(2,'0')+'</span><span class="go">'+ARROW+'</span><div class="ph"><img loading="lazy" src="'+c.cover+'" alt="'+esc(c.name)+'"></div><div class="bd"><h3>'+esc(c.name)+'</h3><p>'+esc(c.short)+'</p></div><span class="glare"></span></a>'}).join('');
}

/* ---------- producto ---------- */
function producto(){
  var root=$('#prod');if(!root)return;
  var slug=new URLSearchParams(location.search).get('c'),c=CATS.filter(function(x){return x.slug===slug})[0];
  if(!c){root.innerHTML='<div class="wrap" style="padding:160px 0"><h1>Línea no encontrada</h1><p class="sub" style="color:var(--mu);margin:14px 0 24px">Elige una línea de producto.</p><a class="btn p" href="index.html#productos">Ver productos</a></div>';return}
  D.title=c.name+' | Proinvi';
  var specs=c.specs.map(function(s){return'<tr><td>'+esc(s[0])+'</td><td>'+esc(s[1])+'</td></tr>'}).join('');
  var items=c.items.length?'<div class="ptitle">Incluye</div><div class="chips">'+c.items.map(function(i){return'<span>'+esc(i)+'</span>'}).join('')+'</div>':'';
  var q='contacto.html?producto='+encodeURIComponent(c.name);
  root.innerHTML='<section class="phero"><div class="wrap"><div class="crumb"><a href="index.html">Inicio</a> / <a href="index.html#productos">Productos</a> / '+esc(c.name)+'</div><div class="eyebrow">Línea de producto</div><h1>'+esc(c.name)+'</h1><p>'+esc(c.intro)+'</p></div></section>'+
   '<section class="sec" style="padding-top:30px"><div class="wrap"><div class="pgrid"><div class="gal rv"><div class="main"><img id="gm" src="'+c.photos[0]+'" alt="'+esc(c.name)+'"></div><div class="thumbs">'+c.photos.map(function(p,i){return'<button type="button" class="'+(i?'':'on')+'" data-i="'+i+'" aria-label="Foto '+(i+1)+'"><img src="'+p+'" alt=""></button>'}).join('')+'</div></div>'+
   '<div class="rv"><div class="ptitle">Especificaciones</div><table class="spec">'+specs+'</table>'+items+
   '<div class="cta-row"><a class="btn p" data-sin-tienda href="'+q+'">Solicitar cotización '+ARROW+'</a><a class="btn p" data-tienda href="tienda.html?cat='+c.slug+'">Comprar en línea '+ARROW+'</a><a class="btn" data-tienda href="'+q+'">Pedir cotización</a></div></div></div>'+
   '<div class="sidenav">'+CATS.map(function(x){return'<a href="producto.html?c='+x.slug+'"'+(x.slug===c.slug?' class="on"':'')+'>'+esc(x.name)+'</a>'}).join('')+'</div></div></section>';
  $$('.thumbs button').forEach(function(b){b.addEventListener('click',function(){$('#gm').src=c.photos[+b.dataset.i];$$('.thumbs button').forEach(function(x){x.classList.toggle('on',x===b)})})});
}

/* ---------- contacto ---------- */
function contacto(){
  var f=$('#cform');if(!f)return;
  var pr=new URLSearchParams(location.search).get('producto');
  var sel=$('[name=interes]',f);sel.innerHTML='<option value="">Selecciona (opcional)</option>'+CATS.map(function(c){return'<option>'+esc(c.name)+'</option>'}).join('');
  if(pr){sel.value=pr;if(sel.value!==pr){sel.insertAdjacentHTML('beforeend','<option>'+esc(pr)+'</option>');sel.value=pr}}
  $('#ci').innerHTML=[['Teléfono',E.telefono],['Correo',E.email],['Dirección',E.direccion],['Horario',E.horario]].map(function(r){return'<div class="it"><div><small>'+r[0]+'</small>'+pend(r[1])+'</div></div>'}).join('');
  f.addEventListener('submit',function(e){
    e.preventDefault();var out=$('#cmsg'),d={};new FormData(f).forEach(function(v,k){d[k]=v});
    if(d._honey){return} /* honeypot */
    var show=function(t,m){out.className='note '+t;out.textContent=m};
    if(!P.CONTACT_URL){show('warn','Modo demostración: este formulario todavía no está conectado a un servicio de envío, por lo que tu mensaje NO fue enviado.');return}
    var btn=$('button[type=submit]',f);btn.disabled=true;
    fetch(P.CONTACT_URL,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(d)}).then(function(r){
      return r.json().then(function(j){
        if(!r.ok)throw new Error('El servicio respondió con el error '+r.status+'.');
        if(j.success!==true&&j.success!=='true')throw new Error(j.message||'El servicio no confirmó el envío.');
        return j;
      });
    }).then(function(){show('ok','¡Gracias! Recibimos tu solicitud y te contactaremos pronto.');f.reset()}).catch(function(err){
      var msg=err instanceof TypeError?'No se pudo conectar con el servicio de envío. Revisa la conexión e inténtalo de nuevo.':'El servicio no aceptó el mensaje ('+err.message+'). Si es el primer envío, Daniel debe confirmar el correo de activación de FormSubmit.';
      show('err',msg);
    }).then(function(){btn.disabled=false});
  });
}

/* ---------- init ---------- */
shell();inicio();producto();contacto();
if(P.TIENDA){var s=D.createElement('script');s.src='tienda.js';s.onload=function(){fx()};D.body.appendChild(s)}else fx();
/* flip cards táctil */
$$('.flip').forEach(function(f){f.addEventListener('click',function(){f.classList.toggle('on')})});
window.PV={esc:esc,$:$,$$:$$,fx:fx};
})();
