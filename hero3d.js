/* Unión bridada 3D (Three.js r149) — reacciona al mouse y al scroll */
(function(){
  var box=document.getElementById('c3d'); if(!box) return;
  var fail=function(){document.documentElement.classList.add('nogl');};
  if(!window.THREE){fail();return;}
  var T=THREE, renderer;
  try{
    var test=document.createElement('canvas');
    if(!(test.getContext('webgl2')||test.getContext('webgl'))) throw 0;
    renderer=new T.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
  }catch(e){fail();return;}
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
  renderer.outputEncoding=T.sRGBEncoding;
  renderer.toneMapping=T.ACESFilmicToneMapping; renderer.toneMappingExposure=1.15;
  box.appendChild(renderer.domElement);
  var scene=new T.Scene(), cam=new T.PerspectiveCamera(32,1,.1,60); cam.position.set(0,0,9);

  /* entorno para reflejos metálicos (escena de estudio propia) */
  (function(){
    var env=new T.Scene();
    var room=new T.Mesh(new T.BoxGeometry(30,30,30),new T.MeshBasicMaterial({color:0x06080e,side:T.BackSide})); env.add(room);
    function panel(w,h,x,y,z,c,rx,ry){var m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({side:T.DoubleSide}));m.material.color.setRGB(c[0],c[1],c[2]);m.position.set(x,y,z);m.rotation.set(rx||0,ry||0,0);env.add(m);}
    panel(14,3,0,12,0,[7,7,7],Math.PI/2,0);
    panel(3,14,-12,0,2,[2,4,7],0,Math.PI/2);
    panel(3,14,12,0,-2,[6,5,5],0,Math.PI/2);
    panel(10,2.5,0,-4,12,[3,5,6],0,0);
    panel(8,2,0,2,-12,[3,3,4],0,0);
    var pm=new T.PMREMGenerator(renderer); scene.environment=pm.fromScene(env,.02).texture; pm.dispose();
  })();

  var steel=new T.MeshStandardMaterial({color:0xdfe4ec,metalness:1,roughness:.22});
  var dark=new T.MeshStandardMaterial({color:0x39445a,metalness:1,roughness:.38});
  var gask=new T.MeshStandardMaterial({color:0x151a24,metalness:.3,roughness:.8});
  var tilt=new T.Group(), spin=new T.Group(); tilt.add(spin); scene.add(tilt);
  var R=1.65, NB=8, BR=1.25;

  function flangeGroup(){
    var g=new T.Group();
    var sh=new T.Shape(); sh.absarc(0,0,R,0,Math.PI*2,false);
    var h=new T.Path(); h.absarc(0,0,.52,0,Math.PI*2,true); sh.holes.push(h);
    for(var i=0;i<NB;i++){var a=i/NB*Math.PI*2,p=new T.Path();p.absarc(Math.cos(a)*BR,Math.sin(a)*BR,.14,0,Math.PI*2,true);sh.holes.push(p);}
    var geo=new T.ExtrudeGeometry(sh,{depth:.22,bevelEnabled:true,bevelSize:.03,bevelThickness:.03,bevelSegments:3,curveSegments:72});
    geo.rotateX(-Math.PI/2); geo.translate(0,-.39,0);
    g.add(new T.Mesh(geo,steel));
    var pts=[[.52,-2.5],[.62,-2.5],[.62,-1.15],[.95,-.62],[.95,-.42],[.52,-.42]].map(function(p){return new T.Vector2(p[0],p[1]);});
    g.add(new T.Mesh(new T.LatheGeometry(pts,72),steel));
    /* anillo de la cara */
    var rf=new T.Mesh(new T.TorusGeometry(.78,.022,10,72),steel); rf.rotation.x=Math.PI/2; rf.position.y=-.135; g.add(rf);
    return g;
  }
  var A=flangeGroup(), B=flangeGroup(); B.rotation.x=Math.PI;
  spin.add(A,B);
  var ringG=new T.Shape(); ringG.absarc(0,0,1.08,0,Math.PI*2,false); var hh=new T.Path(); hh.absarc(0,0,.55,0,Math.PI*2,true); ringG.holes.push(hh);
  var gg=new T.ExtrudeGeometry(ringG,{depth:.24,bevelEnabled:false,curveSegments:64}); gg.rotateX(-Math.PI/2); gg.translate(0,-.12,0);
  var gasket=new T.Mesh(gg,gask); spin.add(gasket);
  /* tornillos (grupo A) y tuercas (grupo B) */
  var hexG=new T.CylinderGeometry(.2,.2,.14,6), rodG=new T.CylinderGeometry(.09,.09,1.4,16);
  for(var i=0;i<NB;i++){
    var a=i/NB*Math.PI*2,x=Math.cos(a)*BR,z=Math.sin(a)*BR;
    var head=new T.Mesh(hexG,dark);head.position.set(x,-.49,z);head.rotation.y=a;A.add(head);
    var rod=new T.Mesh(rodG,steel);rod.position.set(x,.2,z);A.add(rod);
    var nut=new T.Mesh(hexG,dark);nut.position.set(x,-.49,z);nut.rotation.y=a+.3;B.add(nut);
  }
  /* anillos de luz */
  var cy=new T.MeshBasicMaterial({color:0x22d3ee,transparent:true,opacity:.85});
  var r1=new T.Mesh(new T.TorusGeometry(2.4,.012,8,128),cy); r1.rotation.x=Math.PI/2; spin.add(r1);
  var r2=new T.Mesh(new T.TorusGeometry(2.9,.008,8,128),new T.MeshBasicMaterial({color:0x3b8cff,transparent:true,opacity:.6})); r2.rotation.set(Math.PI/2.4,0,.4); tilt.add(r2);
  /* partículas */
  var N=260,pa=new Float32Array(N*3); for(i=0;i<N;i++){var r=3.3+Math.random()*3,th=Math.random()*6.283,ph=Math.acos(2*Math.random()-1);pa[i*3]=r*Math.sin(ph)*Math.cos(th);pa[i*3+1]=r*Math.cos(ph)*.8;pa[i*3+2]=r*Math.sin(ph)*Math.sin(th);}
  var pg=new T.BufferGeometry();pg.setAttribute('position',new T.BufferAttribute(pa,3));
  var pts=new T.Points(pg,new T.PointsMaterial({color:0x7fd8ff,size:.035,transparent:true,opacity:.7,depthWrite:false})); scene.add(pts);
  /* luces */
  var l1=new T.PointLight(0x3b8cff,12,16);l1.position.set(-4,3,4);scene.add(l1);
  var l2=new T.PointLight(0x22d3ee,9,16);l2.position.set(4,-2,3);scene.add(l2);
  var l3=new T.DirectionalLight(0xffffff,1.1);l3.position.set(2,5,5);scene.add(l3);
  tilt.rotation.set(.55,0,-.75);

  var mx=0,my=0,tx=0,ty=0,scr=0,gap=0,t0=performance.now(),vis=true,raf=0,sc=1;
  function size(){
    var w=box.clientWidth||600,h=box.clientHeight||600;
    renderer.setSize(w,h,false); cam.aspect=w/h;
    sc=w<700?.6:(w<1000?.75:.82); cam.position.z=w/h<.9?11:9; cam.updateProjectionMatrix();
  }
  size(); if(window.ResizeObserver) new ResizeObserver(size).observe(box); else addEventListener('resize',size);
  addEventListener('pointermove',function(e){mx=(e.clientX/innerWidth-.5)*2;my=(e.clientY/innerHeight-.5)*2;},{passive:true});
  function onScroll(){var hh=box.parentElement.offsetHeight||innerHeight;scr=Math.max(0,Math.min(1,scrollY/(hh*.85)));}
  addEventListener('scroll',onScroll,{passive:true});onScroll();
  function frame(now){
    raf=0; if(!vis||document.hidden) return;
    var t=(now-t0)/1000;
    tx+=(mx-tx)*.06; ty+=(my-ty)*.06;
    if(!reduce) spin.rotation.y=t*.28+scr*3.2;
    tilt.rotation.x=.55+ty*.22+scr*.5; tilt.rotation.z=-.75+tx*.2-scr*.3;
    tilt.position.y=Math.sin(t*.9)*.12-scr*.6; tilt.position.x=-scr*.8;
    tilt.scale.setScalar(sc*(1-scr*.12));
    var g=scr*1.5; gap+=(g-gap)*.1; B.position.y=gap; gasket.position.y=gap*.5; B.children.forEach(function(c){});
    r1.rotation.z=t*.4; r2.rotation.z=.4+t*.15; pts.rotation.y=t*.03;
    l1.position.x=-4+tx*2; l2.position.y=-2-ty*2;
    renderer.render(scene,cam);
    raf=requestAnimationFrame(frame);
  }
  function start(){if(!raf)raf=requestAnimationFrame(frame);}
  if(reduce){ spin.rotation.y=.6; renderer.render(scene,cam); addEventListener('scroll',function(){if(!raf)raf=requestAnimationFrame(function(n){raf=0;vis=true;frame(n);});},{passive:true}); }
  else{
    if('IntersectionObserver' in window) new IntersectionObserver(function(es){vis=es[0].isIntersecting;if(vis)start();}).observe(box);
    document.addEventListener('visibilitychange',start); start();
  }
  document.documentElement.classList.add('glready');
})();
