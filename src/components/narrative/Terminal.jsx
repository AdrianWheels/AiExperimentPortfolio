import React, { useRef, useState, useEffect } from 'react'
import { useGame } from '../../context/GameContext'

export default function Terminal() {
  const { terminalLines, handleTerminalCommand } = useGame()
  const [input, setInput] = useState('')
  const outputRef = useRef(null)

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [terminalLines])

  const submit = () => {
    if (!input.trim()) return
    handleTerminalCommand(input)
    setInput('')
  }

  return (
    <section className="flex flex-col h-full min-h-0">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs text-muted font-mono">{'>'}_</span>
        <h3 className="text-sm font-semibold text-white">Terminal</h3>
      </div>
      
      <div 
        className="term-output flex-1 overflow-y-auto bg-black/40 p-3 rounded-lg text-sm font-mono min-h-[120px] max-h-[200px]"
        ref={outputRef}
      >
        <div className="flex flex-col gap-1">
          {terminalLines.map((line, index) => (
            <div key={index} className={`term-line term-${line.type}`}>
              <span>{line.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="term-input flex gap-2 mt-3 items-center flex-shrink-0">
        <input
          className="flex-1 px-3 py-2 bg-black/30 rounded-lg text-sm font-mono border border-white/5 focus:border-purple-glow focus:outline-none placeholder:text-subtle transition-all"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              submit()
            }
          }}
          placeholder="comando..."
        />
        <button className="px-3 py-2 bg-purple-glow/80 hover:bg-purple-glow rounded-lg text-xs font-semibold transition-colors flex-shrink-0" onClick={submit}>
          →
        </button>
      </div>
    </section>
  )
}
