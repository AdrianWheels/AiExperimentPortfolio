import React, { useEffect, useRef, useState } from 'react';

// VandalizeCanvas.tsx — versión mínima y COMPILABLE
// - Tacha rosa inclinada con textura sobre el PRIMER nombre
// - "K.I.R.A" debajo en fuente cuadrada, más grande
// - Splatter irregular en esquinas; nada bloquea clicks

interface Props { name?: string; replacement?: string; }

export default function VandalizeCanvas({
  name = 'Adrián Rueda',
  replacement = 'K.I.R.A',
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const svgCyanRef = useRef<SVGPathElement | null>(null);
  const svgPinkRef = useRef<SVGPathElement | null>(null);
  const nameRef = useRef<HTMLSpanElement | null>(null);

  const [intensity, setIntensity] = useState<number>(1);
  const [primary, setPrimary] = useState<'cyan' | 'pink'>('cyan');
  const [struck, setStruck] = useState<boolean>(false);

  const JINX = { bg: '#0b0c10', fg: '#e6e6e6', cyan: '#00e5ff', pink: '#ff3ea5' } as const;
  // RNG determinista para que el efecto no cambie entre clics
  function mulberry32(a:number){ return function(){ let t = a += 0x6D2B79F5; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function hashString(s:string){ let h=2166136261>>>0; for(let i=0;i<s.length;i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h>>>0; }
  let _rng:()=>number = Math.random; const R = ()=> _rng();
  const [seed] = useState<number>(hashString(name + '|v1-fixed'));
  const rand = (min: number, max: number) => R() * (max - min) + min;

  // ---------- lifecycle ----------
  useEffect(() => {
    const onResize = () => { resizeCanvas(); positionStrike(); };
    window.addEventListener('resize', onResize);
    resizeCanvas(); positionStrike();
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // ---------- canvas sizing ----------
  function resizeCanvas() {
    const canvas = canvasRef.current; if (!canvas) return;
    const DPR = window.devicePixelRatio || 1;
    const docW = Math.max(document.documentElement.scrollWidth, window.innerWidth);
    const docH = Math.max(document.documentElement.scrollHeight, window.innerHeight);
    canvas.width = Math.floor(docW * DPR);
    canvas.height = Math.floor(docH * DPR);
    canvas.style.width = `${docW}px`;
    canvas.style.height = `${docH}px`;
    const ctx = canvas.getContext('2d'); if (ctx) ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  function clearCanvas() {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width / (window.devicePixelRatio || 1), canvas.height / (window.devicePixelRatio || 1));
    [svgCyanRef.current, svgPinkRef.current].forEach(path => { if (!path) return; path.style.strokeOpacity = '0'; path.style.strokeDashoffset = ''; });
    const rep = document.getElementById('v-replacement');
    if (rep) rep.setAttribute('style','opacity:0; pointer-events:none;');
    setStruck(false);
  }

  // ---------- graffiti primitives ----------
  function jitterPolyline(x1:number,y1:number,x2:number,y2:number, segments=24, amp=1.5){
    const pts: Array<[number,number]> = [];
    const dx = x2 - x1, dy = y2 - y1; const len = Math.hypot(dx,dy) || 1;
    const nx = -dy/len, ny = dx/len;
    for(let i=0;i<=segments;i++){
      const t = i/segments; const x = x1 + dx*t; const y = y1 + dy*t;
      const a = (Math.sin((t*6.283)+R()*2)*0.5 + (R()-0.5))*amp;
      pts.push([x + nx*a, y + ny*a]);
    }
    return pts;
  }
  function strokePolyline(ctx:CanvasRenderingContext2D, pts:Array<[number,number]>, color:string, width:number, alpha=1){
    ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineCap='round'; ctx.lineJoin='round'; ctx.beginPath(); for(let i=0;i<pts.length;i++){ const [x,y]=pts[i]; if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);} ctx.stroke(); ctx.restore();
  }
  function texturedStroke(ctx:CanvasRenderingContext2D,x1:number,y1:number,x2:number,y2:number,color:string,baseWidth:number){
    ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = baseWidth; ctx.lineCap='round'; ctx.shadowColor=color; ctx.shadowBlur=baseWidth*0.45; ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke(); ctx.restore();
    const pts1 = jitterPolyline(x1,y1,x2,y2, Math.max(18,Math.floor(baseWidth*2)), 1.6);
    const pts2 = jitterPolyline(x1,y1,x2,y2, Math.max(18,Math.floor(baseWidth*2)), 2.2);
    strokePolyline(ctx, pts1, color, baseWidth*0.65, 0.85);
    strokePolyline(ctx, pts2, color, baseWidth*0.35, 0.8);
    const dots = Math.floor(40 + baseWidth*3);
    for(let i=0;i<dots;i++){ const t=R(); const x=x1+(x2-x1)*t; const y=y1+(y2-y1)*t; const r=rand(0, baseWidth*0.7); const ang=rand(0, Math.PI*2); const px=x+Math.cos(ang)*r*0.6; const py=y+Math.sin(ang)*r*0.6; ctx.save(); ctx.globalAlpha=rand(0.05,0.18); ctx.fillStyle=color; ctx.shadowColor=color; ctx.shadowBlur=rand(1,4); ctx.beginPath(); ctx.arc(px,py, rand(0.6,1.8), 0, Math.PI*2); ctx.fill(); ctx.restore(); }
  }
  function splatter(ctx:CanvasRenderingContext2D, x:number, y:number, color:string, radius=42){
    const blobs = Math.floor(rand(6,14));
    for(let i=0;i<blobs;i++){
      const ang = R()*Math.PI*2; const dist = Math.pow(R(),0.55)*radius;
      const px = x + Math.cos(ang)*dist; const py = y + Math.sin(ang)*dist;
      const rr = rand(0.8,6.0);
      ctx.save(); ctx.globalAlpha = rand(0.35,0.85); ctx.fillStyle=color; ctx.shadowColor=color; ctx.shadowBlur=rand(2,8);
      ctx.beginPath(); ctx.arc(px,py, rr, 0, Math.PI*2); ctx.fill(); ctx.restore();
      if(R()>0.65){ ctx.save(); ctx.globalAlpha = rand(0.25,0.55); ctx.strokeStyle=color; ctx.lineWidth = rand(1,2.5); ctx.beginPath(); ctx.moveTo(px,py); ctx.lineTo(px+rand(-1,1), py+rand(12, 28)); ctx.stroke(); ctx.restore(); }
    }
  }

  
  function positionStrike(){
    const el = nameRef.current; const cyan = svgCyanRef.current; const pink = svgPinkRef.current; const svgRoot = document.getElementById('v-strike-svg');
    if(!el || !cyan || !pink || !svgRoot) return;
    const rect = el.getBoundingClientRect(); const pad = 8; const sx = window.scrollX || window.pageXOffset; const sy = window.scrollY || window.pageYOffset;
    (svgRoot as HTMLElement).style.left = `${rect.left - pad + sx}px`; (svgRoot as HTMLElement).style.top = `${rect.top - pad + sy}px`;
    (svgRoot as SVGSVGElement).setAttribute('width', `${rect.width + pad*2}`); (svgRoot as SVGSVGElement).setAttribute('height', `${rect.height + pad*2}`);
    const y = rect.height/2 + pad;
    const wobble = (offset:number) => `M 8 ${y+offset-6} C ${rect.width*0.25} ${y+offset-8}, ${rect.width*0.75} ${y+offset-4}, ${rect.width+pad-8} ${y+offset-2}`;
    cyan.setAttribute('d', wobble(0)); pink.setAttribute('d', wobble(0)); pink.setAttribute('stroke-opacity','0');
    [cyan].forEach(path=>{ path.setAttribute('stroke-opacity','0.35'); const len=(path as any).getTotalLength? (path as any).getTotalLength():300; (path as any).style.strokeDasharray=`${len}`; (path as any).style.strokeDashoffset=`${len}`; (path as any).style.transition='stroke-dashoffset 450ms cubic-bezier(.2,.8,.2,1)'; });
  }

  function drawCanvasStrike(ctx:CanvasRenderingContext2D, rect:DOMRect){
    const sx = window.scrollX || window.pageXOffset; const sy = window.scrollY || window.pageYOffset;
    const x1 = rect.left - 20 + sx, x2 = rect.right + 40 + sx; const midY = rect.top + rect.height*0.45 + sy; const tilt = (x2 - x1) * Math.tan((-7 * Math.PI)/180); const y1 = midY - tilt/2; const y2 = midY + tilt/2;
    texturedStroke(ctx, x1, y1, x2, y2, JINX.pink, 8 + intensity*1.4);
    for(let i=0;i<45;i++){ const t=R(); const xx=x1+(x2-x1)*t; const yy=y1+(y2-y1)*t + (R()-0.5)*10; ctx.save(); ctx.globalAlpha=0.06+R()*0.08; ctx.fillStyle=JINX.cyan; ctx.shadowColor=JINX.cyan; ctx.shadowBlur=1+R()*3; ctx.beginPath(); ctx.arc(xx,yy,0.6+R()*1.2,0,Math.PI*2); ctx.fill(); ctx.restore(); }
  }

  function paintDivCorners(ctx:CanvasRenderingContext2D){
    const nodes = Array.from(document.querySelectorAll('.rounded-2xl')) as HTMLElement[];
    const C = JINX.cyan, P = JINX.pink;
    nodes.forEach((n, i)=>{
      const prev = _rng; _rng = mulberry32((seed + i * 1013904223) >>> 0);
      const skipPanel = R() < 0.35; if(skipPanel){ _rng = prev; return; }
      const r = n.getBoundingClientRect(); const sx=window.scrollX||window.pageXOffset; const sy=window.scrollY||window.pageYOffset;
      const corners=[
        {x:r.left+10+sx,y:r.top+10+sy,col:C},
        {x:r.right-10+sx,y:r.top+10+sy,col: R()>0.5?P:C},
        {x:r.left+10+sx,y:r.bottom-10+sy,col: R()>0.5?P:C},
        {x:r.right-10+sx,y:r.bottom-10+sy,col:P},
      ];
      corners.forEach(c=>{ if(R()>0.45) splatter(ctx, c.x, c.y, c.col, 22 + intensity*6); });
      _rng = prev;
    });
  }

  async function vandalizeOnce(){
    // fija el RNG para este ciclo de pintado
    _rng = mulberry32(seed);
    const canvas = canvasRef.current; if(!canvas) return; const ctx = canvas.getContext('2d'); if(!ctx) return;
    positionStrike(); const firstRect = nameRef.current?.getBoundingClientRect(); if(!firstRect) return;

    if (!struck) { requestAnimationFrame(()=>{ const c = svgCyanRef.current; if(c) c.style.strokeDashoffset='0'; }); drawCanvasStrike(ctx, firstRect); setStruck(true); }

    const rep = document.getElementById('v-replacement');
    if(rep){ const container = (nameRef.current as HTMLElement).closest('div') as HTMLElement; const crect = container.getBoundingClientRect(); const h1=(nameRef.current as HTMLElement).parentElement as HTMLElement; const computed=getComputedStyle(h1); const basePx=parseFloat(computed.fontSize||'64'); const scaled=Math.round(basePx*1.18); const left = firstRect.left - crect.left + firstRect.width/2; const top = firstRect.bottom - crect.top + 10; rep.setAttribute('style', `position:absolute; left:${left}px; transform:translateX(-50%) rotate(-1.5deg); top:${top}px; z-index:62; pointer-events:none; transition:opacity .2s; opacity:1; color:#a3d8ff; font-family: Impact, Haettenschweiler, 'Arial Black', sans-serif; font-weight:900; font-size:${scaled}px; line-height:${computed.lineHeight}; letter-spacing:0.08em; text-shadow:0 1px 0 rgba(0,0,0,.2), 0 0 3px rgba(163,216,255,.55);`); rep.textContent = replacement.toUpperCase(); const sx=window.scrollX||window.pageXOffset; const sy=window.scrollY||window.pageYOffset; const yspr=firstRect.bottom+sy+14; const xL=firstRect.left+sx; const xR=firstRect.right+sx; texturedStroke(ctx, xL, yspr, xR, yspr + rand(-1,1), '#a3d8ff', 2.6); }

    const W = Math.max(document.documentElement.scrollWidth, window.innerWidth);
    const base = primary==='cyan'?JINX.cyan:JINX.pink; const sx = window.scrollX || window.pageXOffset; const sy = window.scrollY || window.pageYOffset;
    texturedStroke(ctx, Math.max(20, firstRect.left-10+sx), firstRect.bottom+10+sy, Math.min(W-20, firstRect.right+36+sx), firstRect.bottom+10+sy, base, 5 + 1.5*intensity);
    paintDivCorners(ctx);
  }

  // ---------- UI ----------
  return (
    <div className="relative min-h-screen" style={{ background: JINX.bg, color: JINX.fg }}>
      <canvas id="v-canvas" ref={canvasRef} className="pointer-events-none absolute left-0 top-0 w-full h-full z-[60]" />

      <svg id="v-strike-svg" className="pointer-events-none absolute z-[61]" style={{ left: 0, top: 0 }}>
        <defs>
          <filter id="glowCyan" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.2" result="b" />
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="glowPink" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.2" result="b" />
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        <path ref={svgCyanRef} d="M0 0 L100 0" stroke={JINX.cyan} strokeWidth={8} strokeLinecap="round" filter="url(#glowCyan)" style={{ strokeOpacity: 0, transition: 'all .35s ease' }}/>
        <path ref={svgPinkRef} d="M0 0 L100 0" stroke={JINX.pink} strokeWidth={6} strokeLinecap="round" filter="url(#glowPink)" style={{ strokeOpacity: 0, transition: 'all .35s ease' }}/>
      </svg>

      <section className="max-w-5xl mx-auto px-6 pt-16 pb-10">
        <div className="relative">
          {(() => { const [first, ...rest] = String(name).split(' '); return (
            <h1 className="text-[64px] md:text-[80px] font-extrabold tracking-tight select-none">
              <span ref={nameRef} id="v-first">{first}</span>{' '}
              <span>{rest.join(' ')}</span>
            </h1>
          ); })()}
          <div id="v-replacement" className="absolute opacity-0 text-base md:text-lg font-semibold" style={{ pointerEvents: 'none' }} aria-hidden />
          <div className="mt-6 flex gap-3">
            <button onClick={() => { clearCanvas(); vandalizeOnce(); }} className="px-4 py-2 rounded-xl text-black font-semibold" style={{ background: primary==='cyan'?JINX.cyan:JINX.pink }}>Vandalizar</button>
            <button onClick={() => clearCanvas()} className="px-4 py-2 rounded-xl bg-[#222] text-white/90">Reset</button>
            <label className="flex items-center gap-2 text-sm text-slate-300/80">Intensidad
              <input type="range" min={0.5} max={3} step={0.1} value={intensity} onChange={(e)=>setIntensity(Number(e.target.value))}/>
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-300/80">Primario
              <select value={primary} onChange={(e)=>setPrimary(e.target.value as any)} className="bg-[#181a1f] px-2 py-1 rounded"><option value="cyan">Cian</option><option value="pink">Rosa</option></select>
            </label>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-20 grid md:grid-cols-3 gap-6">
        <div className="rounded-2xl p-5 border border-white/10 bg-white/[0.02]"><h3 className="text-lg font-bold">About</h3><p className="mt-2 text-slate-300/90 text-sm">Desarrollo integraciones SCADA/MES, APIs y UI en tiempo real. Equilibrio entre rendimiento, claridad y un toque de estilo.</p></div>
        <div className="rounded-2xl p-5 border border-white/10 bg-white/[0.02]"><h3 className="text-lg font-bold">Skills</h3><ul className="mt-2 text-slate-300/90 text-sm list-disc list-inside"><li>Ignition Perspective, Python</li><li>TypeScript/React, Next.js</li><li>SQL (PostgreSQL/MSSQL/MySQL)</li><li>Docker, APIs, Realtime dashboards</li></ul></div>
        <div className="rounded-2xl p-5 border border-white/10 bg-white/[0.02]"><h3 className="text-lg font-bold">Projects</h3><p className="mt-2 text-slate-300/90 text-sm">Telemetría solar, analítica de autoconsumo, paneles operacionales y juguetes experimentales con LLMs.</p></div>
      </section>

      <p className="text-center text-slate-400/80 text-xs pb-10 px-6 max-w-3xl mx-auto">El efecto es visual y no bloquea interacción. El lienzo está en pointer-events: none. Usa Reset si prefieres una vista limpia.</p>
    </div>
  );
}