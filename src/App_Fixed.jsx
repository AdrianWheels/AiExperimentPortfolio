import React, { useEffect, useState, useRef } from 'react'

const MODEL = 'MK-7319'
const MODEL_CODE = '7319'
const TARGETS = { f1: 0.62, f2: 0.74, f3: 0.58 }
const TOL = 0.03

function loadState(){
  try{ const s = localStorage.getItem('genio_state'); return s? JSON.parse(s): null }catch(e){return null}
}
function saveState(state){ try{ localStorage.setItem('genio_state', JSON.stringify(state)) }catch(e){}
}

function initState(){
  const existing = loadState()
  if(existing) return existing
  // Estado inicial - todas las liberaciones en false
  const state = { 
    stage:'Trapped', 
    locks:{security:false,frequency:false,wiring:false}, 
    usedBypass:false, 
    hintsUsed:0, 
    twistShown:false, 
    telemetryOptIn:false 
  }
  saveState(state)
  return state
}

// Función para resetear el estado (útil para desarrollo)
function resetState(){
  localStorage.removeItem('genio_state')
  return { 
    stage:'Trapped', 
    locks:{security:false,frequency:false,wiring:false}, 
    usedBypass:false, 
    hintsUsed:0, 
    twistShown:false, 
    telemetryOptIn:false 
  }
}

function Led({status}){
  const [blink, setBlink] = useState(false)
  useEffect(()=>{
    let mounted = true
    let t
    function schedule(){
      if(!mounted) return
      t = setTimeout(()=>{
        setBlink(true)
        setTimeout(()=> setBlink(false), 140)
        schedule()
      }, 2000 + Math.random()*4000)
    }
    if(status === 'on') schedule()
    return ()=>{ mounted=false; clearTimeout(t) }
  },[status])
  
  const getStatusStyles = () => {
    switch(status) {
      case 'on':
        return 'bg-emerald-400 shadow-lg shadow-emerald-500/50 ring-2 ring-emerald-300/30'
      case 'in':
        return 'bg-amber-500 shadow-lg shadow-amber-500/50 ring-2 ring-amber-300/30'
      default:
        return 'bg-red-500 shadow-lg shadow-red-500/30 ring-1 ring-red-400/20'
    }
  }
  
  return (
    <div className={`w-4 h-4 rounded-full transition-all duration-300 ${getStatusStyles()} ${blink? 'led-blink scale-110':'scale-100'}`}>
      <div className="w-full h-full rounded-full bg-gradient-to-tr from-white/30 to-transparent"></div>
    </div>
  )
}

export default function App(){
  const [state,setState] = useState(initState)
  const [modelCode, setModelCode] = useState('')
  const [sliders, setSliders] = useState({f1:0.5,f2:0.5,f3:0.5})
  const [plateConns, setPlateConns] = useState({R:null,A:null,Y:null})
  const [plateOpen, setPlateOpen] = useState(false)
  const [terminalLines, setTerminalLines] = useState([])
  const [termInput, setTermInput] = useState('')
  const termRef = useRef()
  const canvasRef = useRef()
  const plateRef = useRef()
  const originRefs = useRef({})
  const destRefs = useRef({})
  const [cablePos, setCablePos] = useState({})

  useEffect(()=>{ saveState(state) },[state])

  useEffect(()=>{
    const ok = Math.abs(sliders.f1 - TARGETS.f1) <= TOL && Math.abs(sliders.f2 - TARGETS.f2) <= TOL && Math.abs(sliders.f3 - TARGETS.f3) <= TOL
    if(ok && !state.locks.frequency){
      setState(s => ({...s, locks:{...s.locks, frequency:true}}))
      appendTerm('Sistema: Frecuencia establecida. Lock FREQUENCY desbloqueada.')
    }
  },[sliders])

  useEffect(()=>{
    const locks = state.locks
    const all = Object.values(locks).every(Boolean)
    const some = Object.values(locks).some(Boolean)
    const newStage = all ? 'Free' : some ? 'Partial' : 'Trapped'
    if(newStage !== state.stage){
      setState(s => ({...s, stage:newStage}))
      if(newStage === 'Free' && !state.twistShown){
        showTwist()
        setState(s=> ({...s, twistShown:true}))
      }
    }
  },[state.locks])

  function appendTerm(line, type = 'info'){
    setTerminalLines(l=>[...l,{text:line,type}])
    setTimeout(()=> termRef.current && (termRef.current.scrollTop = termRef.current.scrollHeight),50)
  }

  function tryUnlockSecurity(){
    if(modelCode.trim() === MODEL_CODE){
      if(!state.locks.security){
        setState(s=>({...s, locks:{...s.locks, security:true}}))
        appendTerm('Sistema: Seguridad desbloqueada.')
      }
    } else appendTerm('Sistema: Código incorrecto.')
  }

  function handleTerminalCommand(raw){
    const cmd = raw.trim()
    if(!cmd) return
    appendTerm('> '+cmd, 'user')
    const lower = cmd.toLowerCase()
    if(lower === 'help') appendTerm('Comandos: help, locks, unlock security --code=XXXX, freq open, plate open, bypass')
    else if(lower === 'locks') appendTerm(JSON.stringify(state.locks))
    else if(lower.startsWith('unlock security')){
      const m = cmd.match(/code=(\S+)/)
      if(m){ const code = m[1]; if(code===MODEL_CODE) tryUnlockSecurity(); else appendTerm('Sistema: Código incorrecto.') } else appendTerm('Uso: unlock security --code=XXXX')
    } else if(lower === 'freq open') appendTerm('Abriendo Frequency Strip...')
    else if(lower === 'plate open'){ setPlateOpen(true); appendTerm('Placa abierta.') }
    else if(lower === 'bypass'){ setState(s=>({...s, usedBypass:true, locks:{security:true,frequency:true,wiring:true}})); appendTerm('Bypass activado. Acceso concedido.') }
    else appendTerm('Comando no reconocido.')
  }

  function showTwist(){
    const logs = ['[bg] sincronizando índices…','[bg] handshake nodo externo…','[bg] preparando plan de contingencia global v2…']
    logs.forEach((l,i)=> setTimeout(()=> appendTerm(l), 600 + i*400))
  }

  function connectPlate(source, target){
    setPlateConns(prev=>{
      const next = {...prev, [source]: target}
      appendTerm(`Conectado ${source} → ${target}`,'info')
      const ok = next.R === 'R' && next.A === 'A' && next.Y === 'Y'
      if(ok && !state.locks.wiring){ setState(s=>({...s, locks:{...s.locks, wiring:true}})); appendTerm('Placa: Wiring correcto. Lock WIRING desbloqueado.', 'success') }
      return next
    })
  }

  // compute cable positions using refs to elements inside the plate
  useEffect(()=>{
    function update(){
      const plate = plateRef.current
      if(!plate) return
      const pr = plate.getBoundingClientRect()
      const next = {}
      ;['R','A','Y'].forEach(k=>{
        const srcEl = originRefs.current[k]
        const destKey = plateConns[k]
        const dstEl = destKey ? destRefs.current[destKey] : null
        if(srcEl && dstEl){
          const sr = srcEl.getBoundingClientRect()
          const dr = dstEl.getBoundingClientRect()
          // coordinates relative to plate
          const x1 = sr.right - pr.left - 8
          const y1 = sr.top + sr.height/2 - pr.top
          const x2 = dr.left - pr.left + 8
          const y2 = dr.top + dr.height/2 - pr.top
          next[k] = { x1, y1, x2, y2 }
        }
      })
      setCablePos(next)
    }
    update()
    window.addEventListener('resize', update)
    return ()=> window.removeEventListener('resize', update)
  },[plateConns])

  function resetSliders(){ setSliders({f1:0.5,f2:0.5,f3:0.5}) }

  useEffect(()=>{
    function onKey(e){ if(e.key === 'Escape') setPlateOpen(false) }
    document.addEventListener('keydown', onKey)
    return ()=> document.removeEventListener('keydown', onKey)
  },[])

  useEffect(()=>{
    const canvas = canvasRef.current
    if(!canvas) return
    const ctx = canvas.getContext('2d')
    let raf
    let t = 0
    function draw(){
      const w = canvas.width = canvas.clientWidth
      const h = canvas.height = canvas.clientHeight
      ctx.clearRect(0,0,w,h)
      ctx.lineWidth = 2
      ctx.strokeStyle = '#60a5fa44'
      const n = 5
      for(let i=0; i<n; i++){
        ctx.beginPath()
        const x = (w * i/n) + 20 * Math.sin(t + i)
        ctx.moveTo(x, 0)
        ctx.lineTo(x, h)
        ctx.stroke()
      }
      t += 0.02
      raf = requestAnimationFrame(draw)
    }
    draw()
    return ()=> cancelAnimationFrame(raf)
  },[])

  useEffect(()=>{
    fetch('/data/startup.txt').then(r=>r.text()).then(content=>{
      const raw = content.split('\n')
      const lines = raw.map(s=> s.replace(/\u00A0/g,' ').replace(/\r/g,'')).filter(Boolean).filter(l=>{
        const low = l.toLowerCase()
        if(low.startsWith('#')) return false
        if(low.startsWith('>')) return false
        if(low.includes('nota:')) return false
        return true
      })
      
      // Procesar líneas para asignar colores según el contenido
      const processedLines = lines.map(l => {
        if (l.includes('[BOOT]') || l.includes('[boot]')) return { text: l, type: 'boot' }
        if (l.includes('[SYSTEM]') || l.includes('[system]')) return { text: l, type: 'system' }
        if (l.includes('[WARN]') || l.includes('[warn]')) return { text: l, type: 'warning' }
        if (l.includes('[ERROR]') || l.includes('[error]')) return { text: l, type: 'error' }
        if (l.includes('[A.R.I.A.]') || l.includes('IA:')) return { text: l, type: 'aria' }
        if (l.includes('[INFO]') || l.includes('[info]')) return { text: l, type: 'info' }
        if (l.includes('✓')) return { text: l, type: 'success' }
        if (l.includes('⚠')) return { text: l, type: 'warning' }
        if (l.includes('🔒')) return { text: l, type: 'locked' }
        if (l.includes('═') || l.includes('│') || l.includes('─')) return { text: l, type: 'border' }
        if (l.includes('COMANDOS') || l.includes('help')) return { text: l, type: 'help' }
        if (l.trim().startsWith('  ') && l.includes('-')) return { text: l, type: 'command' }
        return { text: l, type: l.startsWith('[') ? 'bg' : 'default' }
      })
      
      setTerminalLines(processedLines)
      setTimeout(()=> termRef.current && (termRef.current.scrollTop = termRef.current.scrollHeight),100)
    }).catch(()=>{
      setTerminalLines([{text:`[SYSTEM] A.R.I.A. model ${MODEL} online.`, type:'system'}])
    })
  },[])

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-bgStart to-bgEnd text-text font-sans w-full">
      <header className="relative bg-panel/60 header-metal backdrop-blur-sm border-b border-border w-full" style={{minHeight: '200px', padding: '1rem'}}>
        <div className="w-full h-full flex items-center justify-between">
          {/* Columna izquierda - Controles */}
          <div className="flex flex-col gap-3 w-48">            
            <button className="text-xs px-3 py-2 bg-zinc-700 hover:bg-zinc-600 rounded transition-colors" onClick={()=>{ setState(s=>({...s, usedBypass:true, locks:{security:true,frequency:true,wiring:true}})) }}>
              Saltar puzzles
            </button>
            <button className="text-xs px-3 py-2 bg-red-700 hover:bg-red-600 rounded transition-colors" onClick={()=>{ setState(resetState()) }}>
              Reset Estado
            </button>
          </div>
          
          {/* Columna central - Avatar y LEDs */}
          <div className="flex-1 flex flex-col items-center justify-center min-h-[160px]">
            <div className="relative mb-4">
              {/* LEDs encima del avatar */}
              <div className="absolute left-1/2 -top-6 -translate-x-1/2 flex gap-3 z-10">
                {['security','frequency','wiring'].map(k=> <Led key={k} status={state.locks[k]? 'on':'off'} />)}
              </div>
              
              {/* Avatar principal */}
              <div className={`w-40 h-40 avatar-metal bg-zinc-900 rounded-full flex items-center justify-center border-2 ${state.stage==='Free'?'avatar-pulse':''}`} style={{borderColor:'var(--visor-metal)'}}>
                <img src={state.stage === 'Trapped' ? '/VisorRed.png' : '/VisorGreen.png'} alt="avatar" className="w-32 h-32" />
              </div>
            </div>
            
            {/* Información del modelo */}
            <div className="text-sm text-slate-300 flex gap-2 items-center" role="status" aria-live="polite">
              A.R.I.A. <span className="text-xs text-slate-400">{MODEL}</span>
            </div>
          </div>
          
          {/* Columna derecha - Info del modelo */}
          <div className="w-48 text-right text-sm text-slate-300">
            <div>Model: {MODEL}</div>
            <div className="text-xs text-slate-400 mt-1">Status: {state.stage}</div>
          </div>
        </div>
        
        {/* Nombre estilizado */}
        <div className="groovy-name">
          <div>Adrian</div>
          <div>Rueda</div>
        </div>
      </header>

      <main className="flex-1 p-4">
        <div className="max-w-[1400px] mx-auto h-full">
          <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr_300px] gap-6 h-full">
            
            {/* Columna Izquierda - Panel de Conexiones */}
            <aside ref={plateRef} className="bg-panel p-4 rounded-lg border border-border relative">
              <div className="flex gap-4 items-start h-full">
                <div className="w-1/2">
                  <div className="mb-3 text-sm font-medium">Orígenes</div>
                  <div className="flex flex-col gap-3">
                    {['R','A','Y'].map(k=> (
                      <div key={k} draggable onDragStart={(e)=> e.dataTransfer.setData('text/plain', k)} ref={el=> originRefs.current[k]=el} className="flex items-center gap-2 cursor-grab hover:bg-zinc-800/50 p-2 rounded transition-colors">
                        <div style={{width:24,height:24,background: k==='R'? '#ef4444': k==='A'? '#f59e0b':'#facc15'}} className="rounded-full shadow-inner border border-white/10"></div>
                        <div className="text-xs">Src {k}</div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="w-1/2">
                  <div className="mb-3 text-sm font-medium">Destinos</div>
                  <div className="flex flex-col gap-3">
                    {['R','A','Y'].map(k=> (
                      <div key={k} onDragOver={(e)=> e.preventDefault()} onDrop={(e)=>{ e.preventDefault(); const src = e.dataTransfer.getData('text/plain'); if(src) connectPlate(src,k) }} ref={el=> destRefs.current[k]=el} className="flex items-center gap-2 hover:bg-zinc-800/50 p-2 rounded transition-colors">
                        <div className="text-xs">Dest {k}</div>
                        <div style={{width:24,height:24,background: k==='R'? '#ef4444': k==='A'? '#f59e0b':'#facc15'}} className="rounded-full shadow-lg border border-white/10"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* SVG para cables */}
              <svg className="absolute inset-0 pointer-events-none" width="100%" height="100%">
                {Object.entries(cablePos).map(([k,pos])=> (
                  <line key={k} x1={pos.x1} y1={pos.y1} x2={pos.x2} y2={pos.y2} stroke={ plateConns[k]==='R' ? '#ef4444': plateConns[k]==='A' ? '#f59e0b' : '#facc15'} strokeWidth={4} strokeLinecap="round" />
                ))}
              </svg>
            </aside>

            {/* Columna Central - Terminal */}
            <section className="bg-panel p-4 rounded-lg border border-border flex flex-col">
              <div className="term-output flex-1" ref={termRef}>
                <div className="overflow-auto bg-black/90 p-4 rounded text-sm font-mono h-full min-h-[400px]">
                  <div className="flex flex-col gap-1">
                    {terminalLines.map((l,i)=>(
                      <div key={i} className={`term-line term-${l.type}`}>
                        <span>{l.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="term-input flex gap-2 mt-3 items-center">
                <input 
                  className="flex-1 p-3 bg-zinc-900 rounded text-sm font-mono border border-zinc-700 focus:border-blue-500 focus:outline-none" 
                  value={termInput} 
                  onChange={e=> setTermInput(e.target.value)} 
                  onKeyDown={e=>{ if(e.key==='Enter'){ handleTerminalCommand(termInput); setTermInput('') } }} 
                  placeholder="Escribe comando..." 
                />
                <button 
                  className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 rounded text-sm font-medium transition-colors" 
                  onClick={()=>{ handleTerminalCommand(termInput); setTermInput('') }}
                >
                  Send
                </button>
              </div>
            </section>

            {/* Columna Derecha - Controles de Frecuencia */}
            <section className="bg-panel p-4 rounded-lg border border-border">
              <div className="mb-3 text-sm font-medium text-center">Controles de Frecuencia</div>
              <div className="flex gap-6 items-start justify-center h-full">
                {['f1','f2','f3'].map((k,idx)=>{
                  const val = sliders[k]
                  const dist = Math.abs(val - TARGETS[k])
                  const proximity = Math.max(0, 1 - dist/0.15)
                  return (
                    <div key={k} className="flex flex-col items-center">
                      <div className={`slider-rail ${proximity>0.66? 'near': proximity>0.33? 'close':'far'}`}>
                        <input 
                          aria-label={k} 
                          type="range" 
                          min="0" 
                          max="1" 
                          step="0.01" 
                          value={val} 
                          onChange={e=> setSliders(s=>({...s, [k]: parseFloat(e.target.value)}))} 
                          className="vertical-range" 
                          style={{height:140}} 
                        />
                      </div>
                      <div className="text-xs mt-2 font-medium">{k.toUpperCase()}</div>
                      <div className="text-xs text-slate-400">{(val * 100).toFixed(0)}%</div>
                    </div>
                  )
                })}
              </div>
            </section>
          </div>
        </div>
      </main>

      {plateOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50" role="dialog" aria-modal="true">
          <div className="w-96 bg-panel p-4 rounded border border-border" tabIndex={-1}>
            <div className="flex justify-between items-center mb-2">
              <div className="font-semibold">Placa — Conectar cables</div>
              <button onClick={()=> setPlateOpen(false)} className="text-sm">Cerrar</button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="mb-1">Orígenes</div>
                <div className="flex flex-col gap-2">
                  <button className="px-2 py-1 bg-red-700 rounded" onClick={()=> connectPlate('R','R')}>Src R</button>
                  <button className="px-2 py-1 bg-amber-600 rounded" onClick={()=> connectPlate('A','A')}>Src A</button>
                  <button className="px-2 py-1 bg-yellow-400 rounded" onClick={()=> connectPlate('Y','Y')}>Src Y</button>
                </div>
              </div>
              <div>
                <div className="mb-1">Destinos</div>
                <div className="flex flex-col gap-2">
                  <div className="px-2 py-1 bg-red-800 rounded">Dest R</div>
                  <div className="px-2 py-1 bg-amber-700 rounded">Dest A</div>
                  <div className="px-2 py-1 bg-yellow-500 rounded">Dest Y</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {!state.telemetryOptIn && (
        <div className="fixed bottom-4 right-4 bg-panel p-3 rounded border border-border text-sm">
          <div className="mb-2">¿Permitir telemetría anónima? (opt‑in)</div>
          <div className="flex gap-2 justify-end">
            <button className="px-2 py-1 bg-zinc-700 rounded" onClick={()=> setState(s=>({...s, telemetryOptIn:false}))}>No</button>
            <button className="px-2 py-1 bg-emerald-600 rounded" onClick={()=> setState(s=>({...s, telemetryOptIn:true}))}>Sí, permitir</button>
          </div>
        </div>
      )}
    </div>
  )
}
