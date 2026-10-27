/* Válvula de bola industrial 3D (Three.js r149)
   - Arrastra para girarla 360° en cualquier dirección (en celular: horizontal)
   - Gira sola cuando nadie la toca; al hacer scroll la palanca cierra la válvula */
function pvInit3D(){
  var box=document.getElementById('c3d'); if(!box) return;
  var fail=function(){document.documentElement.classList.add('nogl');};
  if(!window.THREE){fail();return;}
  var T=THREE, renderer;
  try{
    var test=document.createElement('canvas');
    if(!(test.getContext('webgl2')||test.getContext('webgl'))) throw 0;
    renderer=new T.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
  }catch(e){fail();return;}
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));
  renderer.outputEncoding=T.sRGBEncoding;
  renderer.toneMapping=T.ACESFilmicToneMapping; renderer.toneMappingExposure=1.05;
  box.appendChild(renderer.domElement);
  var scene=new T.Scene(), cam=new T.PerspectiveCamera(30,1,.1,60); cam.position.set(0,0,10);

  /* ---- estudio fotográfico virtual para los reflejos ---- */
  (function(){
    var env=new T.Scene();
    env.add(new T.Mesh(new T.BoxGeometry(40,40,40),new T.MeshBasicMaterial({color:0x14181f,side:T.BackSide})));
    function panel(w,h,x,y,z,c,rx,ry){var m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({side:T.DoubleSide}));m.material.color.setRGB(c[0],c[1],c[2]);m.position.set(x,y,z);m.rotation.set(rx||0,ry||0,0);env.add(m);}
    panel(18,5,0,14,0,[9,9,9],Math.PI/2,0);            /* softbox superior */
    panel(4,18,-14,2,3,[5,5.4,6.4],0,Math.PI/2);       /* tira izquierda  */
    panel(4,18,14,2,-3,[6.2,5.6,5],0,Math.PI/2);       /* tira derecha    */
    panel(16,3,0,-6,13,[2.6,2.8,3.2],0,0);             /* relleno inferior */
    panel(12,6,0,3,-15,[2,2.2,2.6],0,0);               /* fondo           */
    panel(2,12,6,0,14,[7,7,7],0,0);                    /* tira frontal    */
    var pm=new T.PMREMGenerator(renderer); scene.environment=pm.fromScene(env,.03).texture; pm.dispose();
  })();

  /* ---- materiales ---- */
  var steel=new T.MeshStandardMaterial({color:0xd5d9de,metalness:1,roughness:.3});
  var steel2=new T.MeshStandardMaterial({color:0xc4c9d0,metalness:1,roughness:.42});
  var darkM=new T.MeshStandardMaterial({color:0x1d2025,metalness:.8,roughness:.62});
  var grip=new T.MeshStandardMaterial({color:0x5e0c04,metalness:0,roughness:.7});
  var root=new T.Group(), valve=new T.Group(); root.add(valve); scene.add(root);
  var V2=T.Vector2, R=1.45, BR=1.12, NB=4;
  function lathe(pts,seg,m){return new T.Mesh(new T.LatheGeometry(pts.map(function(p){return new V2(p[0],p[1])}),seg),m);}
  function hexNut(r,d,m,bev){var h=new T.Shape();for(var i=0;i<6;i++){var q=i/6*Math.PI*2;(i?h.lineTo:h.moveTo).call(h,Math.cos(q)*r,Math.sin(q)*r);}h.closePath();
    var g=new T.ExtrudeGeometry(h,{depth:d,bevelEnabled:true,bevelSize:bev,bevelThickness:bev,bevelSegments:2});g.rotateX(-Math.PI/2);g.translate(0,-d/2,0);return new T.Mesh(g,m);}

  /* eje del flujo = Y.  Cuerpo central abombado con orificio pasante */
  var op=[[.56,-1.46],[.8,-1.46],[.8,-1.3]];
  for(var y=-1.3;y<=1.3001;y+=.1){var t=Math.abs(y)/1.3;op.push([.8+.3*(1-Math.pow(t,2.6)),y]);}
  op.push([.8,1.3],[.8,1.46],[.56,1.46],[.56,-1.46]);
  valve.add(lathe(op,96,steel));
  /* bandas de unión del cuerpo (dos piezas) */
  [-.62,.62].forEach(function(yy){var b=new T.Mesh(new T.TorusGeometry(1.0,.045,10,96),steel2);b.rotation.x=Math.PI/2;b.position.y=yy;b.scale.set(1,1,1.2);valve.add(b);});

  /* bridas en ambos extremos */
  function flange(side){
    var g=new T.Group();
    var sh=new T.Shape();sh.absarc(0,0,R,0,Math.PI*2,false);
    var h=new T.Path();h.absarc(0,0,.56,0,Math.PI*2,true);sh.holes.push(h);
    for(var i=0;i<NB;i++){var a=(i+.5)/NB*Math.PI*2,p=new T.Path();p.absarc(Math.cos(a)*BR,Math.sin(a)*BR,.13,0,Math.PI*2,true);sh.holes.push(p);}
    var geo=new T.ExtrudeGeometry(sh,{depth:.2,bevelEnabled:true,bevelSize:.035,bevelThickness:.04,bevelSegments:4,curveSegments:96});
    geo.rotateX(-Math.PI/2);geo.translate(0,1.5,0);   /* y: 1.46 .. 1.74 */
    g.add(new T.Mesh(geo,steel));
    var rp=[[.5,1.74]],n=14;for(var k=0;k<=n;k++){rp.push([.6+(k/n)*.4,1.74+(k%2?.025:.05)]);}rp.push([1.04,1.74],[.5,1.74]);
    g.add(lathe(rp,96,steel2));
    if(side<0)g.rotation.x=Math.PI;
    return g;}
  valve.add(flange(1),flange(-1));

  /* vástago + prensaestopas + palanca, sobre el eje +Z */
  var stem=new T.Group(); stem.rotation.x=Math.PI/2; valve.add(stem);
  var boss=lathe([[0,.85],[.58,.85],[.58,.95],[.4,1.05],[.38,1.3],[.3,1.34],[0,1.34]],48,steel); stem.add(boss);
  var gl=hexNut(.3,.14,steel2,.02); gl.position.y=1.42; stem.add(gl);
  var rod=new T.Mesh(new T.CylinderGeometry(.12,.12,.55,32),steel); rod.position.y=1.7; stem.add(rod);
  var lever=new T.Group(); lever.position.y=1.62; stem.add(lever);
  /* palanca: placa plana con extremos redondeados + manguito rojo */
  var ls=new T.Shape(),w=.14,x0=-.45,x1=2.3;
  ls.moveTo(x0,-w);ls.lineTo(x1,-w*.7);ls.absarc(x1,0,w*.7,-Math.PI/2,Math.PI/2,false);ls.lineTo(x0,w);ls.absarc(x0,0,w,Math.PI/2,Math.PI*1.5,false);
  var lg=new T.ExtrudeGeometry(ls,{depth:.06,bevelEnabled:true,bevelSize:.02,bevelThickness:.02,bevelSegments:2,curveSegments:24});
  lg.rotateX(-Math.PI/2); lever.add(new T.Mesh(lg,steel));
  var sl=lathe([[0,0],[.19,0],[.19,.95],[.15,1.02],[.0,1.04]],32,grip); sl.rotation.z=-Math.PI/2; sl.position.set(1.4,.03,0); lever.add(sl);
  var topN=hexNut(.2,.16,steel2,.02); topN.position.y=.2; lever.add(topN);
  var tw=new T.Mesh(new T.CylinderGeometry(.22,.22,.03,32),steel); tw.position.y=.1; lever.add(tw);
  lever.rotation.y=Math.PI/2;   /* abierta: paralela al flujo */

  /* polvo muy sutil */
  var N=120,pa=new Float32Array(N*3); for(i=0;i<N;i++){var r=3.5+Math.random()*3,th=Math.random()*6.283,ph=Math.acos(2*Math.random()-1);pa[i*3]=r*Math.sin(ph)*Math.cos(th);pa[i*3+1]=r*Math.cos(ph)*.8;pa[i*3+2]=r*Math.sin(ph)*Math.sin(th);}
  var pg=new T.BufferGeometry();pg.setAttribute('position',new T.BufferAttribute(pa,3));
  var pts2=new T.Points(pg,new T.PointsMaterial({color:0x9fd2ff,size:.03,transparent:true,opacity:.45,depthWrite:false})); scene.add(pts2);

  /* luces (el reflejo principal viene del entorno) */
  var l3=new T.DirectionalLight(0xffffff,1.3);l3.position.set(3,6,5);scene.add(l3);
  var l1=new T.PointLight(0x3b8cff,3,18);l1.position.set(-5,2,3);scene.add(l1);
  var l2=new T.PointLight(0x22d3ee,2,18);l2.position.set(5,-3,2);scene.add(l2);

  /* orientación inicial inclinada */
  root.quaternion.setFromEuler(new T.Euler(.35,.9,-.25));

  /* ---- control: arrastrar = giro libre 360° con inercia ---- */
  var drag=false,lx=0,ly=0,vx=0,vy=0,pid=null,idleBoost=1;
  var AX=new T.Vector3(1,0,0),AY=new T.Vector3(0,1,0),qa=new T.Quaternion();
  function rot(dx,dy){ /* dx → giro vertical (eje Y mundo), dy → eje X de cámara */
    qa.setFromAxisAngle(AY,dx); root.quaternion.premultiply(qa);
    if(dy){qa.setFromAxisAngle(AX,dy); root.quaternion.premultiply(qa);}
  }
  box.style.touchAction='pan-y'; box.style.cursor='grab';
  box.addEventListener('pointerdown',function(e){drag=true;pid=e.pointerId;lx=e.clientX;ly=e.clientY;vx=vy=0;box.style.cursor='grabbing';try{box.setPointerCapture(pid)}catch(_){}});
  box.addEventListener('pointermove',function(e){
    if(!drag||e.pointerId!==pid)return;
    var dx=(e.clientX-lx)*.009,dy=e.pointerType==='touch'?0:(e.clientY-ly)*.009; lx=e.clientX;ly=e.clientY;
    vx=dx;vy=dy;rot(dx,dy);
    if(reduce||!raf)render();
  });
  var up=function(e){if(!drag)return;drag=false;box.style.cursor='grab';try{box.releasePointerCapture(pid)}catch(_){}document.documentElement.classList.add('dragged')};
  box.addEventListener('pointerup',up);box.addEventListener('pointercancel',up);box.addEventListener('lostpointercapture',function(){drag=false;box.style.cursor='grab'});

  var scr=0,gap=0,vis=true,raf=0,sc=1,last=performance.now();
  function size(){
    var w=box.clientWidth||600,h=box.clientHeight||600;
    renderer.setSize(w,h,false); cam.aspect=w/h;
    sc=w<700?.52:(w<1000?.62:.68); cam.position.z=w/h<.9?11.5:10; cam.updateProjectionMatrix(); if(reduce)render();
  }
  size(); if(window.ResizeObserver) new ResizeObserver(size).observe(box); else addEventListener('resize',size);
  function onScroll(){var hh=box.parentElement.offsetHeight||innerHeight;scr=Math.max(0,Math.min(1,scrollY/(hh*.85)));}
  addEventListener('scroll',onScroll,{passive:true});onScroll();
  function render(){
    gap+=(scr-gap)*.12; lever.rotation.y=Math.PI/2*(1-gap);   /* al hacer scroll la válvula se cierra */
    root.scale.setScalar(sc*(1-scr*.1)); root.position.y=-scr*.5; root.position.x=-scr*.7;
    renderer.render(scene,cam);
  }
  function frame(now){
    raf=0; if(!vis||document.hidden) return;
    var dt=Math.min(.05,(now-last)/1000); last=now;
    if(!drag){
      if(Math.abs(vx)>1e-4||Math.abs(vy)>1e-4){rot(vx,vy);vx*=.94;vy*=.94;}   /* inercia */
      else if(!reduce){rot(dt*.45,0);}                                          /* giro automático 360° */
    }
    pts2.rotation.y+=dt*.03; l1.position.x=-5+Math.sin(now/2500)*1.5;
    render(); raf=requestAnimationFrame(frame);
  }
  function start(){if(!raf){last=performance.now();raf=requestAnimationFrame(frame);}}
  if(reduce){ render(); addEventListener('scroll',function(){requestAnimationFrame(render)},{passive:true}); }
  else{
    if('IntersectionObserver' in window) new IntersectionObserver(function(es){vis=es[0].isIntersecting;if(vis)start();}).observe(box);
    document.addEventListener('visibilitychange',start); start();
  }
  document.documentElement.classList.add('glready');
}
if(document.getElementById('hv'))document.addEventListener('pv:fallback',pvInit3D);else pvInit3D();
