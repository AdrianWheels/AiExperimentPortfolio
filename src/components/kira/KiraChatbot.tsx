import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { getKiraMessages, getKiraSystemPrompt, matchKiraResponse, getKiraFallback } from '../../i18n/kira'
import type { Locale } from '../../i18n/utils'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface KiraChatbotProps {
  currentPage: string
  projectSlug?: string
  locale: Locale
}

const GROQ_API_KEY = import.meta.env.PUBLIC_GROQ_API_KEY as string | undefined
const GROQ_MODEL = 'llama-3.3-70b-versatile'
const MAX_MSG_PER_MIN = 5
const MAX_HISTORY = 10

const KIRA_EXPRESSIONS = [
  '/kira_images/KIRA_NEUTRAL.png',
  '/kira_images/KIRA_TALK.png',
  '/kira_images/KIRA_IRONIC.png',
]

export default function KiraChatbot({ currentPage, projectSlug, locale }: KiraChatbotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [expression, setExpression] = useState(0)

  // Idle mode (predefined cycling messages)
  const [idleText, setIdleText] = useState('')
  const [msgIndex, setMsgIndex] = useState(0)

  // Chat mode
  const [chatMode, setChatMode] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const [timestamps, setTimestamps] = useState<number[]>([])

  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const typeRef = useRef<ReturnType<typeof setTimeout>>()
  const cycleRef = useRef<ReturnType<typeof setInterval>>()
  const abortRef = useRef<AbortController | null>(null)

  const MESSAGES = useMemo(() => getKiraMessages(locale || 'es'), [locale])

  const getIdleMessages = useCallback(() => {
    const key = projectSlug || currentPage
    return MESSAGES[key] || MESSAGES.home
  }, [currentPage, projectSlug, MESSAGES])

  // Typewriter for idle mode
  useEffect(() => {
    if (chatMode) return
    const msgs = getIdleMessages()
    const msg = msgs[msgIndex % msgs.length]
    let i = 0
    setIdleText('')
    setExpression(1)
    const type = () => {
      if (i <= msg.length) {
        setIdleText(msg.slice(0, i))
        i++
        typeRef.current = setTimeout(type, 30 + Math.random() * 20)
      } else {
        setExpression(0)
      }
    }
    type()
    return () => { if (typeRef.current) clearTimeout(typeRef.current) }
  }, [msgIndex, chatMode, getIdleMessages])

  // Cycle idle messages
  useEffect(() => {
    if (chatMode) return
    cycleRef.current = setInterval(() => setMsgIndex(p => p + 1), 6000)
    return () => { if (cycleRef.current) clearInterval(cycleRef.current) }
  }, [chatMode])

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, streamingText])

  // Focus input on open
  useEffect(() => {
    if (chatMode && isOpen) setTimeout(() => inputRef.current?.focus(), 100)
  }, [chatMode, isOpen])

  // Cleanup
  useEffect(() => () => { abortRef.current?.abort() }, [])

  const isRateLimited = useCallback(() => {
    const now = Date.now()
    return timestamps.filter(t => now - t < 60000).length >= MAX_MSG_PER_MIN
  }, [timestamps])

  const sendMessage = useCallback(async () => {
    const trimmed = input.trim()
    if (!trimmed || isLoading) return

    if (!GROQ_API_KEY) {
      setChatMode(true)
      const matched = matchKiraResponse(trimmed, locale) || getKiraFallback(locale)
      setMessages(prev => [
        ...prev,
        { role: 'user', content: trimmed },
        { role: 'assistant', content: matched },
      ])
      setInput('')
      return
    }

    if (isRateLimited()) {
      setMessages(prev => [...prev, { role: 'assistant', content: locale === 'en'
        ? 'Too many messages! Wait a moment before asking again.'
        : '¡Demasiados mensajes! Espera un momento.'
      }])
      return
    }

    setChatMode(true)
    const userMsg: ChatMessage = { role: 'user', content: trimmed }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsLoading(true)
    setExpression(1)
    setStreamingText('')
    setTimestamps(prev => [...prev.filter(t => Date.now() - t < 60000), Date.now()])

    const history = [...messages.slice(-MAX_HISTORY), userMsg]

    try {
      abortRef.current = new AbortController()
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [
            { role: 'system', content: getKiraSystemPrompt(locale) },
            ...history,
          ],
          stream: true,
          max_tokens: 300,
          temperature: 0.7,
        }),
        signal: abortRef.current.signal,
      })

      if (!res.ok) throw new Error(`API ${res.status}`)

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let full = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value, { stream: true })
          for (const line of chunk.split('\n')) {
            if (!line.startsWith('data: ')) continue
            const data = line.slice(6)
            if (data === '[DONE]') continue
            try {
              const delta = JSON.parse(data).choices?.[0]?.delta?.content
              if (delta) { full += delta; setStreamingText(full) }
            } catch {}
          }
        }
      }

      setMessages(prev => [...prev, { role: 'assistant', content: full || '...' }])
      setStreamingText('')
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setMessages(prev => [...prev, { role: 'assistant', content: locale === 'en'
          ? 'Something went wrong. Try again or contact Adrián directly.'
          : 'Algo salió mal. Inténtalo de nuevo o contacta con Adrián.'
        }])
        setStreamingText('')
      }
    } finally {
      setIsLoading(false)
      setExpression(0)
      abortRef.current = null
    }
  }, [input, isLoading, messages, locale, isRateLimited])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen && (
        <div className="mb-3 w-80 bg-[#12121a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in flex flex-col" style={{ maxHeight: '480px' }}>
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-900/50 to-purple-800/30 px-4 py-3 flex items-center gap-3 border-b border-white/5 flex-shrink-0">
            <img src={KIRA_EXPRESSIONS[expression]} alt="KIRA" className="w-10 h-10 rounded-full border border-purple-500/30" />
            <div>
              <p className="text-xs font-bold text-white">K.I.R.A.</p>
              <p className="text-[10px] text-purple-300">{locale === 'en' ? 'Portfolio assistant' : 'Asistente de portfolio'}</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="ml-auto w-6 h-6 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              aria-label={locale === 'en' ? 'Close chat' : 'Cerrar chat'}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2.5 custom-scrollbar" style={{ minHeight: '100px', maxHeight: '320px' }}>
            {!chatMode ? (
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl rounded-tl-sm px-3 py-2">
                <p className="text-sm text-gray-300 leading-relaxed">
                  {idleText}<span className="animate-pulse text-purple-400">|</span>
                </p>
              </div>
            ) : (
              <>
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`rounded-xl px-3 py-2 max-w-[85%] ${
                      msg.role === 'user'
                        ? 'bg-purple-600/30 border border-purple-500/20 rounded-br-sm'
                        : 'bg-white/5 border border-white/10 rounded-tl-sm'
                    }`}>
                      <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {streamingText && (
                  <div className="flex justify-start">
                    <div className="bg-white/5 border border-white/10 rounded-xl rounded-tl-sm px-3 py-2 max-w-[85%]">
                      <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {streamingText}<span className="animate-pulse text-purple-400">|</span>
                      </p>
                    </div>
                  </div>
                )}
                {isLoading && !streamingText && (
                  <div className="flex justify-start">
                    <div className="bg-white/5 border border-white/10 rounded-xl rounded-tl-sm px-3 py-2">
                      <span className="flex gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Input */}
          <div className="px-3 py-2 border-t border-white/5 flex items-center gap-2 flex-shrink-0">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={locale === 'en' ? 'Ask about the portfolio...' : 'Pregunta sobre el portfolio...'}
              disabled={isLoading}
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-purple-500/50 focus:outline-none transition-colors disabled:opacity-50"
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              className="w-8 h-8 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:bg-purple-600/30 disabled:cursor-not-allowed flex items-center justify-center transition-colors flex-shrink-0"
              aria-label={locale === 'en' ? 'Send' : 'Enviar'}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-[#12121a] border border-purple-500/30 hover:border-purple-500/60 shadow-lg shadow-purple-900/20 flex items-center justify-center transition-all hover:scale-105 relative"
        aria-label={isOpen ? (locale === 'en' ? 'Close KIRA' : 'Cerrar KIRA') : (locale === 'en' ? 'Open KIRA' : 'Abrir KIRA')}
      >
        <img src="/kira_images/KIRA_NEUTRAL.png" alt="KIRA" className="w-10 h-10 rounded-full" />
        {!isOpen && <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-purple-500 animate-pulse border-2 border-[#12121a]" />}
      </button>

      <style>{`
        .animate-in { animation: slideUp .3s ease-out }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px) }
          to { opacity: 1; transform: translateY(0) }
        }
      `}</style>
    </div>
  )
}
