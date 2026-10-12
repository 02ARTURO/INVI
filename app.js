/* ===================== CONFIGURACIÓN =====================
   Cuando el flujo de n8n esté listo, pega aquí las URLs de los webhooks.
   Mientras estén vacías, el sitio funciona en modo demo con datos de ejemplo. */
const CONFIG = {
  TIENDA: false,     // FASE 1: false = sitio informativo con cotización. FASE 2: true = carrito, órdenes y seguimiento.
  PRODUCTS_URL: "",  // GET  -> [{id,sku,name,cat,price,desc,stock}]
  ORDER_URL:    "",  // POST -> {folio,cliente,items,total,pago,factura}
  TRACK_URL:    "",  // GET  ?folio=XXX -> {estado: 0..3}
  CONTACT_URL:  "",  // POST -> {nombre,correo,telefono,mensaje}
  EMPRESA: {
    nombre: "Proveedora Industrial Virgo",
    corto: "PROINVI",
    direccion: ["Calle y número (por definir)", "Colonia, C.P. 00000", "Ciudad, Estado"],
    telefonos: ["(000) 000 00 00", "(000) 000 00 00"],
    horario: ["Lunes a viernes 8:00 – 18:30", "Sábado 8:30 – 13:00"],
    correos: ["ventas@proinvi.com.mx"]
  }
};

/* ===================== DATOS DE EJEMPLO ===================== */
const ICONS = {
  pipe:`<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4"><circle cx="20" cy="24" r="11"/><circle cx="20" cy="24" r="6"/><circle cx="44" cy="24" r="11"/><circle cx="44" cy="24" r="6"/><circle cx="32" cy="45" r="11"/><circle cx="32" cy="45" r="6"/></svg>`,
  flange:`<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4"><circle cx="32" cy="32" r="26"/><circle cx="32" cy="32" r="11"/><circle cx="32" cy="11" r="3"/><circle cx="32" cy="53" r="3"/><circle cx="11" cy="32" r="3"/><circle cx="53" cy="32" r="3"/></svg>`,
  rod:`<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M8 50 50 8l6 6L14 56z"/><path d="m16 42 6 6M22 36l6 6M28 30l6 6M34 24l6 6M40 18l6 6"/></svg>`,
  tee:`<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M6 20h52v14H6zM25 34h14v26H25z"/><path d="M6 16v22M58 16v22M21 60h22"/></svg>`,
  elbow:`<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M10 12h16v14c0 8 6 14 14 14h14v16H40C22 56 10 44 10 26z"/><path d="M6 12h24M54 36v28"/></svg>`,
  plate:`<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4"><path d="m6 24 34-10 18 8-34 10z"/><path d="m6 34 18 8 34-10M6 44l18 8 34-10"/></svg>`,
  valve:`<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M32 6v22M18 6h28"/><path d="M12 30h40v22H12z"/><path d="M4 26v30M60 26v30"/><path d="m22 36 20 10M42 36 22 46"/></svg>`,
  bolt:`<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4"><path d="m20 8 12-4 12 4v10l-12 4-12-4z"/><path d="M26 22v34h12V22M26 32h12M26 40h12M26 48h12"/></svg>`
};
const CATS = [
  ["Tubería","pipe"],["Bridas","flange"],["Tubería calibrada (tubing)","pipe"],["Espárragos","rod"],
  ["Conexiones forjadas","tee"],["Conexiones soldables a tope","elbow"],["Línea material sanitario","elbow"],
  ["Placas, PTR, ángulos y láminas","plate"],["Válvulas","valve"],["Accesorios","bolt"],
  ["Conectores de instrumentación (tube fittings)","tee"],["Conectores de instrumentación (pipe fittings)","elbow"]
];
const iconOf = c => ICONS[(CATS.find(x=>x[0]===c)||[0,"pipe"])[1]];
const RAW = [
  ["Tubería","Tubo inox. 316L sin costura 1\" Ced. 40",1380],["Tubería","Tubo inox. 304 con costura 2\" Ced. 10",1120],["Tubería","Tubo acero al carbón 2\" Ced. 40",890],
  ["Bridas","Brida WN 150# inox. 316 2\"",640],["Bridas","Brida slip-on 150# acero carbón 3\"",410],["Bridas","Brida ciega 300# inox. 304 2\"",780],
  ["Tubería calibrada (tubing)","Tubing inox. 316 1/2\" x .065\"",520],["Tubería calibrada (tubing)","Tubing inox. 316 3/8\" x .049\"",390],["Tubería calibrada (tubing)","Tubing inox. 304 1/4\" x .035\"",260],
  ["Espárragos","Espárrago B7 5/8\" x 4\" con 2 tuercas",48],["Espárragos","Espárrago B8 inox. 3/4\" x 5\" con 2 tuercas",96],["Espárragos","Varilla roscada inox. 304 1/2\" x 1 m",210],
  ["Conexiones forjadas","Codo 90° roscado 3000# inox. 316 1\"",185],["Conexiones forjadas","Tee roscada 3000# acero carbón 1\"",120],["Conexiones forjadas","Cople completo 3000# inox. 304 3/4\"",95],
  ["Conexiones soldables a tope","Codo 90° LR soldable inox. 316L 2\"",260],["Conexiones soldables a tope","Reducción concéntrica inox. 304 3\" x 2\"",310],["Conexiones soldables a tope","Tee igual soldable acero carbón 2\"",230],
  ["Línea material sanitario","Codo sanitario 90° inox. 304 1.5\" tri-clamp",165],["Línea material sanitario","Abrazadera tri-clamp inox. 2\"",98],["Línea material sanitario","Válvula mariposa sanitaria 2\"",1450],
  ["Placas, PTR, ángulos y láminas","Placa inox. 304 3/16\" 1.22 x 2.44 m",5900],["Placas, PTR, ángulos y láminas","PTR cuadrado 2\" cal. 14 (6 m)",780],["Placas, PTR, ángulos y láminas","Ángulo acero A36 2\" x 3/16\" (6 m)",640],
  ["Válvulas","Válvula de bola inox. 316 1\" roscada",720],["Válvulas","Válvula de compuerta bridada 150# 3\"",3900],["Válvulas","Válvula check swing inox. 2\"",1650],
  ["Accesorios","Junta espirometálica 150# 2\"",85],["Accesorios","Soporte tipo U 2\" galvanizado",58],["Accesorios","Niple roscado inox. 304 1\" x 4\"",74],
  ["Conectores de instrumentación (tube fittings)","Conector macho tubing 1/2\" x 1/2\" NPT",210],["Conectores de instrumentación (tube fittings)","Unión tubing inox. 316 3/8\"",145],["Conectores de instrumentación (tube fittings)","Tee tubing inox. 316 1/4\"",190],
  ["Conectores de instrumentación (pipe fittings)","Codo roscado 3000# 1/2\" inox.",70],["Conectores de instrumentación (pipe fittings)","Niple hexagonal inox. 1/4\"",42],["Conectores de instrumentación (pipe fittings)","Bushing reductor inox. 3/4\" x 1/2\"",55]
];
let PRODUCTS = RAW.map((r,i)=>({id:i+1,sku:"PRV-"+String(i+1).padStart(3,"0"),cat:r[0],name:r[1],price:r[2],desc:"Producto de ejemplo.",stock:(i*7)%40+4}));

/* ===================== UTILIDADES ===================== */
const $ = s => document.querySelector(s);
const money = n => n.toLocaleString("es-MX",{style:"currency",currency:"MXN"});
const E = CONFIG.EMPRESA;
let cart = [];
try{ cart = JSON.parse(localStorage.getItem("proinvi_cart")||"[]"); }catch(e){}
const saveCart = () => { try{ localStorage.setItem("proinvi_cart", JSON.stringify(cart)); }catch(e){} };
function toast(t){ const el=$("#toast"); el.textContent=t; el.classList.add("on"); setTimeout(()=>el.classList.remove("on"),1800); }

/* ===================== ESTRUCTURA COMÚN ===================== */
const PAGE = document.body.dataset.page || "inicio";
const NAV = [["inicio","index.html","Inicio"],["quienes","quienes-somos.html","Quiénes somos"],["catalogo","catalogo.html",CONFIG.TIENDA?"Tienda":"Productos"],...(CONFIG.TIENDA?[["seguimiento","seguimiento.html","Seguimiento"]]:[]),["contacto","contacto.html","Contacto"]];
function buildShell(){
  const logo = `<img src="assets/logo.svg" alt="Logo Proveedora Industrial Virgo">`;
  document.body.insertAdjacentHTML("afterbegin",`
  <div id="glow"></div>
  <header><div class="wrap nav">
    <a href="index.html" class="brand"><span class="lg">${logo}</span><span><b>${E.corto}</b><small>Proveedora Industrial Virgo</small></span></a>
    <ul id="menu">${NAV.map(n=>`<li><a href="${n[1]}" class="${n[0]===PAGE?'on':''}">${n[2]}</a></li>`).join("")}</ul>
    <div style="display:flex;gap:10px;align-items:center">
      ${CONFIG.TIENDA?'<button class="cart-btn" id="openCart">Carrito <b id="cartCount">0</b></button>':''}
      <button class="burger" id="burger" aria-label="Menú">☰</button>
    </div>
  </div></header>`);
  document.body.insertAdjacentHTML("beforeend",`
  <footer><div class="wrap">
    <div class="fgrid">
      <div><span class="flogo">${logo}</span><p style="margin-top:14px;font-size:.9rem">${E.nombre}.<br>Tuberías, válvulas y conexiones para el sector industrial.</p></div>
      <div><h4>Productos</h4><ul class="cols">${CATS.map(c=>`<li><a href="catalogo.html?cat=${encodeURIComponent(c[0])}">${c[0]}</a></li>`).join("")}</ul></div>
      <div><h4>Contacto</h4><ul><li>${E.direccion.join("<br>")}</li><li>${E.telefonos.join(" · ")}</li><li>${E.correos.join("<br>")}</li></ul></div>
    </div>
    <div class="copy">© ${new Date().getFullYear()} ${E.nombre}. Todos los derechos reservados. · Sitio de muestra con datos de ejemplo.</div>
  </div></footer>
  ${CONFIG.TIENDA?`<div class="veil" id="veil"></div>
  <aside class="drawer" id="drawer">
    <div class="dh"><h3>Tu carrito</h3><button id="closeCart" aria-label="Cerrar">✕</button></div>
    <div class="items" id="items"></div>
    <div class="df"><div class="tot"><span>Total</span><span id="total">$0.00</span></div>
    <button class="btn p" id="checkout">Generar orden de compra</button></div>
  </aside>
  <div class="modal" id="modal"><div class="mbox" id="mbox"></div></div>`:''}
  <div class="toast" id="toast"></div>`);
  $("#burger").onclick = () => $("#menu").classList.toggle("open");
  document.addEventListener("pointermove",e=>{ const g=$("#glow"); g.style.left=e.clientX+"px"; g.style.top=e.clientY+"px"; });
}

/* ===================== CARRITO ===================== */
function addToCart(id){
  const it = cart.find(i=>i.id===id);
  it ? it.qty++ : cart.push({id,qty:1});
  saveCart(); renderCart(); toast("Agregado al carrito");
}
function cartRows(){ return cart.map(c=>({...PRODUCTS.find(p=>p.id===c.id), qty:c.qty})).filter(r=>r.id); }
function renderCart(){
  if(!CONFIG.TIENDA) return;
  const rows = cartRows();
  $("#cartCount").textContent = rows.reduce((s,r)=>s+r.qty,0);
  $("#items").innerHTML = rows.length ? rows.map(r=>`
    <div class="it"><div><strong>${r.name}</strong><br><small>${r.sku} · ${money(r.price)}</small>
      <div class="qty"><button data-m="${r.id}">−</button><span>${r.qty}</span><button data-p="${r.id}">+</button></div></div>
      <strong>${money(r.price*r.qty)}</strong></div>`).join("")
    : `<p style="color:var(--muted);padding:30px 0;text-align:center">Tu carrito está vacío.</p>`;
  $("#total").textContent = money(rows.reduce((s,r)=>s+r.price*r.qty,0));
}
function wireCart(){
  if(!CONFIG.TIENDA) return;
  $("#items").addEventListener("click",e=>{
    const m=+e.target.dataset.m, p=+e.target.dataset.p;
    if(p){ cart.find(i=>i.id===p).qty++; }
    if(m){ const it=cart.find(i=>i.id===m); it.qty--; if(it.qty<=0) cart=cart.filter(i=>i.id!==m); }
    if(p||m){ saveCart(); renderCart(); }
  });
  const toggle = on => { $("#drawer").classList.toggle("on",on); $("#veil").classList.toggle("on",on); };
  $("#openCart").onclick = () => toggle(true);
  $("#closeCart").onclick = $("#veil").onclick = () => toggle(false);
  $("#checkout").onclick = () => { if(!cart.length) return toast("Agrega productos primero"); toggle(false); openOrderForm(); };
}

/* ===================== ORDEN DE COMPRA ===================== */
function openOrderForm(){
  $("#mbox").innerHTML = `
    <h2>Generar orden de compra</h2>
    <form id="oform">
      <label>Nombre completo</label><input name="nombre" required>
      <label>Empresa</label><input name="empresa">
      <label>Correo</label><input name="correo" type="email" required>
      <label>Teléfono / WhatsApp</label><input name="tel" required>
      <label>No. de orden de compra del cliente (opcional)</label><input name="ocCliente">
      <label>Medio de pago</label>
      <select name="pago"><option>Transferencia bancaria</option><option>Tarjeta de crédito/débito</option><option>Mercado Pago</option><option>Pago en sucursal</option><option>Crédito (sujeto a aprobación)</option></select>
      <label class="chk"><input type="checkbox" name="factura"> Requiero factura (CFDI)</label>
      <button class="btn p" type="submit">Confirmar orden · ${$("#total").textContent}</button>
      <button class="btn g" type="button" id="cancel" style="margin-top:10px">Cancelar</button>
    </form>`;
  $("#modal").classList.add("on");
  $("#cancel").onclick = () => $("#modal").classList.remove("on");
  $("#oform").onsubmit = async e => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.target));
    d.factura = !!d.factura;
    const folio = "OC-" + new Date().toISOString().slice(0,10).replace(/-/g,"") + "-" + Math.floor(1000+Math.random()*9000);
    const rows = cartRows();
    const order = {folio, cliente:d, items:rows.map(r=>({sku:r.sku,name:r.name,qty:r.qty,price:r.price})), total:rows.reduce((s,r)=>s+r.price*r.qty,0), fecha:new Date().toISOString(), estado:0};
    if(CONFIG.ORDER_URL){
      try{ const r=await fetch(CONFIG.ORDER_URL,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(order)}); if(!r.ok) throw 0; }
      catch(err){ return toast("No se pudo enviar la orden"); }
    }
    try{ const o=JSON.parse(localStorage.getItem("proinvi_orders")||"{}"); o[folio]=order; localStorage.setItem("proinvi_orders",JSON.stringify(o)); }catch(err){}
    cart=[]; saveCart(); renderCart();
    $("#mbox").innerHTML = `<h2>¡Orden generada!</h2><p style="color:var(--muted)">Guarda tu folio para dar seguimiento:</p>
      <div class="folio">${folio}</div><p style="color:var(--muted)">Total: ${money(order.total)} · Pago: ${d.pago}</p>
      <button class="btn p" id="okb">Dar seguimiento</button>`;
    $("#okb").onclick = () => { location.href = "seguimiento.html?folio=" + encodeURIComponent(folio); };
  };
}

/* ===================== PÁGINAS ===================== */
function initCatalogo(){
  const params = new URLSearchParams(location.search);
  let cat = params.get("cat") || "Todos", term = "";
  const chips = () => $("#chips").innerHTML = ["Todos",...new Set(PRODUCTS.map(p=>p.cat))].map(c=>`<button class="chip ${c===cat?'on':''}" data-c="${c}">${c}</button>`).join("");
  const grid = () => {
    const list = PRODUCTS.filter(p=>(cat==="Todos"||p.cat===cat)&&(p.name+p.sku+p.cat).toLowerCase().includes(term.toLowerCase()));
    $("#grid").innerHTML = list.length ? list.map(p=>`
      <article class="prod"><div class="thumb">${CONFIG.TIENDA?`<span class="badge">${p.stock<=10?'Últimas piezas':'En existencia'}</span>`:''}${iconOf(p.cat)}</div>
      <div class="pbody"><small>${p.sku} · ${p.cat}</small><h3>${p.name}</h3>
      <div class="pfoot">${CONFIG.TIENDA?`<span class="price">${money(p.price)}</span><button class="add" data-id="${p.id}">Agregar</button>`:`<span style="color:var(--muted);font-size:.85rem">Precio bajo cotización</span><a class="add" href="contacto.html?producto=${encodeURIComponent(p.sku+' - '+p.name)}">Cotizar</a>`}</div></div></article>`).join("")
      : `<div class="empty">No encontramos productos con esa búsqueda.</div>`;
  };
  chips(); grid();
  $("#chips").onclick = e => { const c=e.target.dataset.c; if(c){cat=c;chips();grid();} };
  $("#q").oninput = e => { term=e.target.value; grid(); };
  $("#grid").onclick = e => { const id=+e.target.dataset.id; if(id) addToCart(id); };
}
function initInicio(){
  $("#cats").innerHTML = CATS.map(c=>`
    <a class="cat rv" href="catalogo.html?cat=${encodeURIComponent(c[0])}"><div class="ic">${ICONS[c[1]]}</div><h3>${c[0]}</h3><span class="more">DETALLES</span></a>`).join("");
}
function initSeguimiento(){
  if(!CONFIG.TIENDA){ location.replace('index.html'); return; }
  const paint = n => document.querySelectorAll(".st").forEach((el,i)=>el.classList.toggle("done",i<=n));
  const run = async folio => {
    let estado = null;
    if(CONFIG.TRACK_URL){
      try{ const r=await fetch(CONFIG.TRACK_URL+"?folio="+encodeURIComponent(folio)); estado=(await r.json()).estado; }catch(err){}
    } else if(folio.toUpperCase()==="DEMO"){ estado = 2; }
    else { try{ const o=JSON.parse(localStorage.getItem("proinvi_orders")||"{}")[folio]; if(o) estado=o.estado; }catch(err){} }
    if(estado==null){ $("#trackMsg").textContent="No encontramos ese folio. Revisa que esté bien escrito."; paint(-1); }
    else { $("#trackMsg").textContent="Folio "+folio+" · estado actual: "+["Recibido","En preparación","Enviado","Entregado"][estado]; paint(estado); }
  };
  $("#trackForm").onsubmit = e => { e.preventDefault(); run($("#folioIn").value.trim()); };
  const f = new URLSearchParams(location.search).get("folio");
  if(f){ $("#folioIn").value=f; run(f); }
}
function initContacto(){
  const pr = new URLSearchParams(location.search).get('producto');
  if(pr) document.querySelector('#cform textarea').value = 'Hola, quisiera cotizar: ' + pr + '\nCantidad: ';
  const m = $("#cmap"); if(m) m.innerHTML = "Aquí va el mapa de Google<br>(cuando se defina la dirección)";
  $("#cform").onsubmit = async e => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.target));
    if(CONFIG.CONTACT_URL){
      try{ const r=await fetch(CONFIG.CONTACT_URL,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(d)}); if(!r.ok) throw 0; }
      catch(err){ return toast("No se pudo enviar el mensaje"); }
    }
    e.target.reset(); toast("Mensaje enviado. Te contactaremos pronto.");
  };
}

/* ===================== EFECTOS ===================== */
const io = new IntersectionObserver(es=>es.forEach(en=>{
  if(!en.isIntersecting) return;
  en.target.classList.add("in");
  en.target.querySelectorAll("[data-n]").forEach(c=>{
    const end=+c.dataset.n; let n=0; const step=Math.max(1,Math.ceil(end/50));
    const t=setInterval(()=>{ n=Math.min(end,n+step); c.textContent=n; if(n>=end) clearInterval(t); },28);
  });
  io.unobserve(en.target);
}),{threshold:.15});

/* ===================== ARRANQUE ===================== */
(async function init(){
  if(CONFIG.PRODUCTS_URL){
    try{ const r=await fetch(CONFIG.PRODUCTS_URL); PRODUCTS = await r.json(); }catch(e){ console.warn("Usando productos de ejemplo"); }
  }
  buildShell(); wireCart(); renderCart();
  document.querySelectorAll(CONFIG.TIENDA?'[data-nostore]':'[data-store]').forEach(el=>el.remove());
  ({inicio:initInicio,catalogo:initCatalogo,seguimiento:initSeguimiento,contacto:initContacto}[PAGE]||(()=>{}))();
  document.querySelectorAll(".rv").forEach(el=>io.observe(el));
})();
