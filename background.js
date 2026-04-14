/* background.js — ILYA AI Canvas Engine */
(function(){
'use strict';
var canvas=document.getElementById('bg-canvas');
if(!canvas)return;
var ctx=canvas.getContext('2d'),W=0,H=0,TAU=Math.PI*2;
var stars=[],nodes=[],orbs=[];

function resize(){W=canvas.width=window.innerWidth;H=canvas.height=window.innerHeight;init()}

function initStars(){
  stars=[];
  var n=Math.min(Math.floor(W*H/4500),260);
  for(var i=0;i<n;i++){
    var t=Math.random();
    stars.push({x:Math.random()*W,y:Math.random()*H,r:Math.random()*1.7+.2,seed:Math.random()*TAU,
      spd:Math.random()*.011+.004,cross:t>.95,twinkle:t>.88,
      col:t>.9?'rgba(255,60,80,':t>.78?'rgba(255,180,180,':'rgba(255,255,255,'});
  }
}
function drawStars(t){
  for(var i=0;i<stars.length;i++){
    var s=stars[i];
    var a=.22+.78*(.5+.5*Math.sin(t*s.spd+s.seed));
    if(s.cross){
      ctx.save();ctx.translate(s.x,s.y);
      ctx.strokeStyle=s.col+(a*.9)+')';ctx.lineWidth=.7;
      var sz=s.r*3.5;
      ctx.beginPath();ctx.moveTo(-sz,0);ctx.lineTo(sz,0);ctx.stroke();
      ctx.beginPath();ctx.moveTo(0,-sz);ctx.lineTo(0,sz);ctx.stroke();
      ctx.restore();
    }else{
      ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,TAU);ctx.fillStyle=s.col+a+')';ctx.fill();
      if(s.twinkle&&a>.8){ctx.beginPath();ctx.arc(s.x,s.y,s.r*4,0,TAU);ctx.fillStyle=s.col+(a*.04)+')';ctx.fill();}
    }
  }
}

function initNodes(){
  nodes=[];
  var n=Math.min(Math.floor(W/130),15);
  for(var i=0;i<n;i++)
    nodes.push({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.38,vy:(Math.random()-.5)*.38,r:Math.random()*2.4+.8,ph:Math.random()*TAU});
}
function updateNodes(){
  for(var i=0;i<nodes.length;i++){
    var n=nodes[i];n.x+=n.vx;n.y+=n.vy;
    if(n.x<0||n.x>W)n.vx*=-1;if(n.y<0||n.y>H)n.vy*=-1;n.ph+=.034;
  }
}
function drawNodes(){
  var D=185;
  for(var i=0;i<nodes.length;i++)for(var j=i+1;j<nodes.length;j++){
    var dx=nodes[i].x-nodes[j].x,dy=nodes[i].y-nodes[j].y,d=Math.sqrt(dx*dx+dy*dy);
    if(d<D){ctx.beginPath();ctx.moveTo(nodes[i].x,nodes[i].y);ctx.lineTo(nodes[j].x,nodes[j].y);ctx.strokeStyle='rgba(220,20,60,'+(1-d/D)*.16+')';ctx.lineWidth=.65;ctx.stroke();}
  }
  for(var i=0;i<nodes.length;i++){
    var n=nodes[i],p=.38+.62*(.5+.5*Math.sin(n.ph));
    ctx.beginPath();ctx.arc(n.x,n.y,n.r*p,0,TAU);ctx.fillStyle='rgba(255,0,64,'+(.5*p)+')';ctx.fill();
    ctx.beginPath();ctx.arc(n.x,n.y,n.r*5.5*p,0,TAU);ctx.fillStyle='rgba(220,20,60,'+(.035*p)+')';ctx.fill();
  }
}

function initOrbs(){
  orbs=[
    {cx:W*.86,cy:H*.11,a:0,rx:100,ry:42,spd:.0007,n:3},
    {cx:W*.14,cy:H*.90,a:1.1,rx:75,ry:30,spd:-.0005,n:2},
    {cx:W*.5, cy:H*.55,a:2.4,rx:130,ry:50,spd:.0004,n:2}
  ];
}
function drawOrbs(){
  for(var k=0;k<orbs.length;k++){
    var o=orbs[k];o.a+=o.spd;
    ctx.beginPath();ctx.ellipse(o.cx,o.cy,o.rx,o.ry,Math.sin(o.a*.3)*.4,0,TAU);
    ctx.strokeStyle='rgba(139,0,0,.19)';ctx.lineWidth=.8;ctx.stroke();
    for(var i=0;i<o.n;i++){
      var ang=o.a+(i/o.n)*TAU;
      var sa=Math.sin(o.a*.3),ca=Math.cos(o.a*.3);
      var ex=Math.cos(ang)*o.rx,ey=Math.sin(ang)*o.ry;
      ctx.beginPath();ctx.arc(o.cx+ca*ex-sa*ey,o.cy+sa*ex+ca*ey,2.4,0,TAU);
      ctx.fillStyle='rgba(255,0,64,.58)';ctx.fill();
    }
  }
}
function drawGrid(t){
  var horizon=H*.62,vx=W/2,shift=(t*.038)%55;
  ctx.strokeStyle='rgba(75,0,0,.055)';ctx.lineWidth=.5;
  for(var i=-16;i<=16;i++){ctx.beginPath();ctx.moveTo(vx+i*46,horizon);ctx.lineTo(vx+i*580,H+80);ctx.stroke();}
  for(var d=0;d<10;d++){
    var depth=d/10,y=horizon+(H-horizon+80)*depth-shift*depth*7;
    if(y<horizon||y>H+5)continue;
    ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();
  }
}
function drawDiamonds(t){
  var shapes=[
    {x:W*.15,y:H*.28,sz:19,rot:t*.0004,a:.07},{x:W*.82,y:H*.62,sz:13,rot:-t*.0006,a:.055},
    {x:W*.52,y:H*.12,sz:24,rot:t*.00028,a:.065},{x:W*.08,y:H*.72,sz:16,rot:-t*.0005,a:.05}
  ];
  for(var k=0;k<shapes.length;k++){
    var s=shapes[k];
    ctx.save();ctx.translate(s.x,s.y);ctx.rotate(s.rot);
    ctx.strokeStyle='rgba(220,20,60,'+s.a+')';ctx.lineWidth=.85;
    ctx.beginPath();ctx.moveTo(0,-s.sz);ctx.lineTo(s.sz*.62,0);ctx.lineTo(0,s.sz);ctx.lineTo(-s.sz*.62,0);ctx.closePath();ctx.stroke();
    ctx.strokeStyle='rgba(220,20,60,'+(s.a*.55)+')';
    ctx.beginPath();ctx.moveTo(0,-s.sz*.52);ctx.lineTo(s.sz*.32,0);ctx.lineTo(0,s.sz*.52);ctx.lineTo(-s.sz*.32,0);ctx.closePath();ctx.stroke();
    ctx.restore();
  }
}
function drawNebula(t){
  var blobs=[{x:W*.08,y:H*.16,r:200,c:'139,0,0'},{x:W*.92,y:H*.84,r:240,c:'80,0,0'},{x:W*.5,y:H*.48,r:165,c:'100,0,18'}];
  for(var k=0;k<blobs.length;k++){
    var b=blobs[k],a=.02+.009*Math.sin(t*.0007+b.x*.001);
    var g=ctx.createRadialGradient(b.x,b.y,0,b.x,b.y,b.r);
    g.addColorStop(0,'rgba('+b.c+','+a+')');g.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,TAU);ctx.fill();
  }
}
function init(){initStars();initNodes();initOrbs()}
function draw(t){
  ctx.clearRect(0,0,W,H);
  var bg=ctx.createRadialGradient(W/2,H/2,0,W/2,H/2,Math.hypot(W,H)*.72);
  bg.addColorStop(0,'#0e0000');bg.addColorStop(1,'#050000');
  ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
  drawNebula(t);drawGrid(t);drawDiamonds(t);drawOrbs();updateNodes();drawNodes();drawStars(t);
}
function loop(t){draw(t);requestAnimationFrame(loop)}
window.addEventListener('resize',resize);
resize();
requestAnimationFrame(loop);

/* Preloader particles */
var pp=document.getElementById('pre-particles');
if(pp){
  for(var i=0;i<22;i++){
    var p=document.createElement('div');p.className='pre-p';
    var sz=3+Math.random()*7;
    p.style.cssText='width:'+sz+'px;height:'+sz+'px;left:'+(Math.random()*100)+'%;bottom:-20px;animation-duration:'+(5.5+Math.random()*9)+'s;animation-delay:'+(Math.random()*7)+'s;opacity:0;';
    pp.appendChild(p);
  }
}
})();
