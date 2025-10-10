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
    <section className="bg-panel p-4 rounded-lg border border-border flex flex-col flex-1 min-h-0 max-h-full">
      <div 
        className="term-output flex-1 overflow-y-auto bg-black/90 p-4 rounded text-sm font-mono max-h-[400px]"
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
          className="flex-1 p-3 bg-zinc-900 rounded text-sm font-mono border border-zinc-700 focus:border-blue-500 focus:outline-none"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              submit()
            }
          }}
          placeholder="Escribe comando..."
        />
        <button className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 rounded text-sm font-medium transition-colors flex-shrink-0" onClick={submit}>
          Send
        </button>
      </div>
    </section>
  )
}
