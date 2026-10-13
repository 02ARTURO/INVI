/* FASE 2 — Tienda: catálogo, carrito, orden de compra y seguimiento.
   Sin URLs en config.js funciona en MODO DEMO (datos de ejemplo, nada se envía). */
(function(){
'use strict';
var P=window.PROINVI,PV=window.PV,$=PV.$,$$=PV.$$,esc=PV.esc,D=document,CATS=window.CATS;
var money=function(n){return new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN'}).format(n)};
var DEMO=!P.PRODUCTS_URL,ODEMO=!P.ORDER_URL;
var ST=['Orden recibida','Pago confirmado','En preparación','Listo / enviado'];
var store=function(k,v){try{if(v===undefined)return JSON.parse(localStorage.getItem(k));localStorage.setItem(k,JSON.stringify(v))}catch(e){return null}};

/* --- productos de ejemplo --- */
function demoProducts(){
  var out=[],h=function(s){var x=0;for(var i=0;i<s.length;i++)x=(x*31+s.charCodeAt(i))>>>0;return x};
  var sizes={tuberia:['1/2"','1"','2"','4"'],'tuberia-tubing':['1/4"','3/8"','1/2"'],esparragos:['3/8"','1/2"','5/8"']};
  var nm={tuberia:function(s){return'Tubería inoxidable '+s+' ced. 40S'},'tuberia-tubing':function(s){return'Tubing inoxidable '+s+' calibre 18'},esparragos:function(s){return'Espárrago '+s+' con tuercas'}};
  CATS.forEach(function(c){
    var list=c.items.length?c.items.slice(0,4).map(function(i){return i}):sizes[c.slug].map(nm[c.slug]);
    list.forEach(function(n,i){var x=h(c.slug+n);out.push({id:c.slug+'-'+i,sku:'PV-'+c.slug.slice(0,3).toUpperCase()+'-'+String(i+1).padStart(3,'0'),name:n,cat:c.slug,price:80+(x%2400),desc:c.name+(c.specs[0]?' · '+c.specs[0][1]:''),stock:5+(x%150),img:c.cover})});
  });return out;
}
var PRODS=[];
function load(){
  if(DEMO){PRODS=demoProducts();return Promise.resolve()}
  return fetch(P.PRODUCTS_URL).then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(a){PRODS=(Array.isArray(a)?a:a.products||[]).map(function(p){return{id:String(p.id),sku:p.sku||'',name:p.name||'',cat:p.cat||'',price:+p.price||0,desc:p.desc||'',stock:p.stock==null?null:+p.stock}})});
}

/* --- carrito --- */
var cart=store('pv_cart')||{};
var save=function(){store('pv_cart',cart);render()};
function add(id,q){cart[id]=Math.max(0,(cart[id]||0)+q);if(!cart[id])delete cart[id];save()}
function lines(){return Object.keys(cart).map(function(id){var p=PRODS.filter(function(x){return x.id===id})[0];return p?{p:p,q:cart[id]}:null}).filter(Boolean)}
function total(){return lines().reduce(function(s,l){return s+l.p.price*l.q},0)}

D.body.insertAdjacentHTML('beforeend','<div class="ov" id="ov"></div><aside class="drawer" id="drawer" aria-label="Carrito"><div class="dh"><h3 class="disp">Tu carrito</h3><button class="x" id="dx" aria-label="Cerrar">×</button></div><div class="db" id="dbody"></div><div class="df"><div style="display:flex;justify-content:space-between"><span>Total estimado</span><b class="disp" id="dtot"></b></div><button class="btn p" id="dgo" type="button" style="justify-content:center">Generar orden de compra</button></div></aside><div class="modal" id="modal" role="dialog" aria-modal="true"></div>');
var drawer=$('#drawer'),ov=$('#ov'),modal=$('#modal');
function closeAll(){drawer.classList.remove('on');modal.classList.remove('on');ov.classList.remove('on')}
function openDrawer(){render();drawer.classList.add('on');ov.classList.add('on')}
ov.addEventListener('click',closeAll);$('#dx').addEventListener('click',closeAll);$('#cartbtn').addEventListener('click',openDrawer);
addEventListener('keydown',function(e){if(e.key==='Escape')closeAll()});
function render(){
  var L=lines(),n=Object.keys(cart).reduce(function(s,k){return s+cart[k]},0);
  $('#cartn').textContent=n;$('#dtot').textContent=money(total());
  $('#dbody').innerHTML=L.length?L.map(function(l){return'<div class="li"><div><b>'+esc(l.p.name)+'</b><br><small style="color:var(--mu)">'+esc(l.p.sku)+' · '+money(l.p.price)+'</small></div><div class="qty"><button data-a="'+esc(l.p.id)+'" data-d="-1" aria-label="Menos">−</button>'+l.q+'<button data-a="'+esc(l.p.id)+'" data-d="1" aria-label="Más">+</button></div></div>'}).join(''):'<p style="color:var(--mu);padding:30px 0">Tu carrito está vacío.</p>';
  $('#dgo').disabled=!L.length;
}
$('#dbody').addEventListener('click',function(e){var b=e.target.closest('[data-a]');if(b)add(b.dataset.a,+b.dataset.d)});
$('#dgo').addEventListener('click',orderForm);

/* --- orden de compra --- */
function orderForm(){
  drawer.classList.remove('on');
  modal.innerHTML='<h3 class="disp">Orden de compra</h3><p style="color:var(--mu);margin-bottom:18px">Total estimado: <b>'+money(total())+'</b>'+(ODEMO?'<span class="demo">DEMO</span>':'')+'</p><form class="form" id="of"><div class="two"><label>Nombre<input name="nombre" required autocomplete="name"></label><label>Empresa<input name="empresa" autocomplete="organization"></label></div><div class="two"><label>Correo<input name="email" type="email" required autocomplete="email"></label><label>Teléfono<input name="tel" type="tel" required autocomplete="tel"></label></div><label>Método de pago<select name="pago"><option>Transferencia</option><option>Tarjeta</option><option>Mercado Pago</option><option>Pago en sucursal</option></select></label><label>Notas<textarea name="notas" style="min-height:80px"></textarea></label><div style="display:flex;gap:10px"><button class="btn p" type="submit" style="flex:1;justify-content:center">Confirmar orden</button><button class="btn" type="button" id="oc">Cancelar</button></div><div id="omsg"></div></form>';
  modal.classList.add('on');ov.classList.add('on');
  $('#oc').onclick=closeAll;
  $('#of').addEventListener('submit',function(e){
    e.preventDefault();var d={};new FormData(e.target).forEach(function(v,k){d[k]=v});
    var items=lines().map(function(l){return{id:l.p.id,qty:l.q}}),m=$('#omsg'),btn=$('button[type=submit]',e.target);btn.disabled=true;
    var done=function(folio,demo){
      var o=store('pv_orders')||{};o[folio]={estado:0,t:Date.now(),total:total(),demo:!!demo};store('pv_orders',o);
      cart={};store('pv_cart',cart);render();
      modal.innerHTML='<h3 class="disp">¡Orden generada!</h3><p style="margin:12px 0;color:var(--mu)">Tu folio es:</p><p class="disp" style="font-size:1.8rem;color:var(--ac2)">'+esc(folio)+'</p>'+(demo?'<div class="note warn">Modo demostración: esta orden NO se envió a ningún sistema. Sirve solo para mostrar el flujo.</div>':'<p style="margin-top:12px;color:var(--mu)">Guarda tu folio para consultar el estado de tu pedido.</p>')+'<div style="margin-top:22px;display:flex;gap:10px"><a class="btn p" href="tienda.html?folio='+encodeURIComponent(folio)+'#seguimiento">Dar seguimiento</a><button class="btn" id="oc2" type="button">Cerrar</button></div>';
      $('#oc2').onclick=closeAll;
    };
    if(ODEMO){var f='DEMO-'+new Date().toISOString().slice(2,10).replace(/-/g,'')+'-'+String(Math.floor(Math.random()*9000)+1000);done(f,true);return}
    /* IMPORTANTE: n8n debe recalcular precios con su base de datos y generar el folio */
    fetch(P.ORDER_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({cliente:d,items:items})}).then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(j){if(!j.folio)throw 0;done(j.folio,false)}).catch(function(){m.className='note err';m.textContent='No pudimos generar tu orden. Inténtalo de nuevo.';btn.disabled=false});
  });
}

/* --- página de tienda --- */
function tiendaPage(){
  var g=$('#pg');if(!g)return;
  var qs=new URLSearchParams(location.search),q=$('#q'),cs=$('#cs');
  cs.innerHTML='<option value="">Todas las líneas</option>'+CATS.map(function(c){return'<option value="'+c.slug+'">'+esc(c.name)+'</option>'}).join('');
  cs.value=qs.get('cat')||'';
  $('#dm').innerHTML=DEMO?'<div class="note warn">Catálogo de <b>muestra</b>: precios y existencias son ficticios. Se reemplazan al conectar la base de datos del cliente.</div>':'';
  function list(){
    var t=q.value.toLowerCase().trim(),c=cs.value;
    var r=PRODS.filter(function(p){return(!c||p.cat===c)&&(!t||(p.name+' '+p.sku).toLowerCase().indexOf(t)>-1)});
    g.innerHTML=r.length?r.map(function(p){return'<div class="pc"><span class="sk">'+esc(p.sku)+'</span><h3>'+esc(p.name)+'</h3><p>'+esc(p.desc)+'</p><div class="pr">'+money(p.price)+'</div><span class="st">'+(p.stock==null?'':(p.stock>0?'Disponible: '+p.stock:'Sin existencia'))+'</span><button class="btn p" data-add="'+esc(p.id)+'" type="button" style="justify-content:center"'+(p.stock===0?' disabled':'')+'>Agregar al carrito</button></div>'}).join(''):'<p style="color:var(--mu)">Sin resultados.</p>';
  }
  q.addEventListener('input',list);cs.addEventListener('change',list);list();
  g.addEventListener('click',function(e){var b=e.target.closest('[data-add]');if(b){add(b.dataset.add,1);b.textContent='✓ Agregado';setTimeout(function(){b.textContent='Agregar al carrito'},900)}});
  /* seguimiento */
  var tf=$('#tf'),tr=$('#tr');
  function show(folio,estado,demo){tr.innerHTML='<div class="track">'+ST.map(function(s,i){return'<div class="'+(i<=estado?'d':'')+'">'+s+'</div>'}).join('')+'</div>'+(demo?'<div class="note warn">Modo demostración. <button class="btn" id="adv" type="button" style="padding:6px 14px;margin-left:8px">Simular avance</button></div>':'');var a=$('#adv');if(a)a.onclick=function(){var o=store('pv_orders')||{};if(o[folio]){o[folio].estado=Math.min(3,o[folio].estado+1);store('pv_orders',o);show(folio,o[folio].estado,true)}}}
  function track(folio){
    if(!folio)return;
    if(P.TRACK_URL){fetch(P.TRACK_URL+(P.TRACK_URL.indexOf('?')>-1?'&':'?')+'folio='+encodeURIComponent(folio)).then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(j){show(folio,Math.max(0,Math.min(3,+j.estado||0)),false)}).catch(function(){tr.innerHTML='<div class="note err">No encontramos ese folio.</div>'});return}
    var o=(store('pv_orders')||{})[folio];o?show(folio,o.estado,true):tr.innerHTML='<div class="note err">No encontramos ese folio (en modo demostración solo se consultan órdenes creadas en este navegador).</div>';
  }
  tf.addEventListener('submit',function(e){e.preventDefault();track($('#fo').value.trim())});
  var f0=qs.get('folio');if(f0){$('#fo').value=f0;track(f0)}
}
load().then(function(){render();tiendaPage()}).catch(function(){var g=$('#pg');if(g)g.innerHTML='<div class="note err">No pudimos cargar el catálogo.</div>'});
})();
