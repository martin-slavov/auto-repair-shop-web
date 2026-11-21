import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { MessageCircle, Send, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ApiError } from '../../api/client'
import { sendChatMessage } from '../../api/chat'
import type { ChatMessage, ChatRole } from '../../types/chat'

const MAX_MESSAGE_LENGTH = 500
const MAX_HISTORY_MESSAGES = 6
const MAX_HISTORY_CONTENT_LENGTH = 1000
const MAX_COOLDOWN_SECONDS = 120

const GREETING = 'Ask about our services, prices and opening hours.'
const UNAVAILABLE_MESSAGE = 'The assistant is temporarily unavailable. Please try again later.'
const GENERIC_ERROR_MESSAGE = 'Something went wrong. Please try again.'
const NETWORK_ERROR_MESSAGE = 'Could not reach the server. Please check your connection.'

interface DisplayMessage {
  id: number
  role: ChatRole
  content: string
}

function buildHistory(messages: DisplayMessage[]): ChatMessage[] {
  return messages.slice(-MAX_HISTORY_MESSAGES).map(({ role, content }) => ({
    role,
    content: content.slice(0, MAX_HISTORY_CONTENT_LENGTH),
  }))
}

function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<DisplayMessage[]>([])
  const [input, setInput] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldError, setFieldError] = useState<string | null>(null)
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null)
  const [now, setNow] = useState(0)

  const pendingRef = useRef(false)
  const nextIdRef = useRef(1)
  const toggleButtonRef = useRef<HTMLButtonElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const baseId = useId()
  const panelId = `${baseId}-panel`
  const titleId = `${baseId}-title`
  const inputId = `${baseId}-input`
  const errorId = `${baseId}-error`
  const counterId = `${baseId}-counter`

  const cooldownSeconds =
    cooldownUntil === null ? 0 : Math.max(0, Math.ceil((cooldownUntil - now) / 1000))
  const coolingDown = cooldownSeconds > 0
  const canSend = input.trim() !== '' && !pending && !coolingDown

  useEffect(() => {
    if (open) textareaRef.current?.focus()
  }, [open])

  useEffect(() => {
    if (!open) return
    const list = listRef.current
    if (list) list.scrollTop = list.scrollHeight
  }, [open, messages, pending])

  useEffect(() => {
    if (cooldownUntil === null) return
    const timer = window.setInterval(() => {
      const current = Date.now()
      setNow(current)
      if (current >= cooldownUntil) {
        setCooldownUntil(null)
        window.clearInterval(timer)
      }
    }, 500)
    return () => window.clearInterval(timer)
  }, [cooldownUntil])

  function closePanel() {
    setOpen(false)
    toggleButtonRef.current?.focus()
  }

  function handleError(err: unknown) {
    if (!(err instanceof ApiError)) {
      setError(NETWORK_ERROR_MESSAGE)
      return
    }
    if (err.status === 429) {
      setError(err.message)
      if (err.retryAfter !== undefined && err.retryAfter > 0 && err.retryAfter <= MAX_COOLDOWN_SECONDS) {
        const current = Date.now()
        setNow(current)
        setCooldownUntil(current + err.retryAfter * 1000)
      }
      return
    }
    if (err.status === 503) {
      setError(UNAVAILABLE_MESSAGE)
      return
    }
    if (err.status === 400 && err.fieldErrors.message) {
      setFieldError(err.fieldErrors.message)
      return
    }
    setError(GENERIC_ERROR_MESSAGE)
  }

  async function send() {
    const text = input.trim()
    if (!text || pendingRef.current || coolingDown) return

    pendingRef.current = true
    setPending(true)
    setError(null)
    setFieldError(null)

    const history = buildHistory(messages)
    const userMessage: DisplayMessage = { id: nextIdRef.current++, role: 'USER', content: text }
    setMessages((current) => [...current, userMessage])
    setInput('')

    try {
      const { reply } = await sendChatMessage({ message: text, history })
      const assistantMessage: DisplayMessage = {
        id: nextIdRef.current++,
        role: 'ASSISTANT',
        content: reply,
      }
      setMessages((current) => [...current, assistantMessage])
    } catch (err) {
      setMessages((current) => current.filter((message) => message.id !== userMessage.id))
      setInput((current) => (current === '' ? text : current))
      handleError(err)
    } finally {
      pendingRef.current = false
      setPending(false)
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void send()
  }

  function handleTextareaKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault()
      void send()
    }
  }

  function handlePanelKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === 'Escape') {
      event.stopPropagation()
      closePanel()
    }
  }

  const statusMessage = fieldError ?? error

  return (
    <div className="chat-widget fixed right-4 bottom-4 z-40 flex flex-col items-end gap-3 print:hidden">
      {open && (
        <section
          id={panelId}
          role="dialog"
          aria-modal="false"
          aria-labelledby={titleId}
          onKeyDown={handlePanelKeyDown}
          className="flex h-[min(560px,calc(100dvh-6rem))] w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-xl bg-card text-sm text-card-foreground shadow-xl ring-1 ring-foreground/10 sm:w-[380px]"
        >
          <header className="flex items-center justify-between gap-2 bg-foreground px-4 py-3 text-background">
            <h2 id={titleId} className="text-lg tracking-wide uppercase">
              Ask our assistant
            </h2>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Close chat"
              onClick={closePanel}
              className="text-background hover:bg-background/10 hover:text-background"
            >
              <X />
            </Button>
          </header>

          <div
            ref={listRef}
            role="log"
            aria-live="polite"
            aria-label="Conversation"
            className="flex flex-1 flex-col gap-3 overflow-y-auto bg-muted p-4"
          >
            <p className="max-w-[85%] self-start rounded-lg bg-background px-3 py-2 ring-1 ring-foreground/10">
              {GREETING}
            </p>
            {messages.map((message) => (
              <p
                key={message.id}
                className={cn(
                  'max-w-[85%] rounded-lg px-3 py-2 break-words whitespace-pre-wrap',
                  message.role === 'USER'
                    ? 'self-end bg-primary text-primary-foreground'
                    : 'self-start bg-background text-foreground ring-1 ring-foreground/10',
                )}
              >
                <span className="sr-only">{message.role === 'USER' ? 'You: ' : 'Assistant: '}</span>
                {message.content}
              </p>
            ))}
            {pending && (
              <div className="flex items-center gap-1 self-start rounded-lg bg-background px-3 py-3 ring-1 ring-foreground/10">
                <span className="sr-only">Assistant is typing</span>
                {[0, 150, 300].map((delay) => (
                  <span
                    key={delay}
                    aria-hidden="true"
                    style={{ animationDelay: `${delay}ms` }}
                    className="size-1.5 animate-bounce rounded-full bg-muted-foreground motion-reduce:animate-none"
                  />
                ))}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-1.5 border-t p-3">
            <label htmlFor={inputId} className="sr-only">
              Your message
            </label>
            <div className="flex items-end gap-2">
              <textarea
                id={inputId}
                ref={textareaRef}
                rows={2}
                maxLength={MAX_MESSAGE_LENGTH}
                value={input}
                placeholder="Type your question…"
                onChange={(event) => {
                  setInput(event.target.value)
                  setFieldError(null)
                }}
                onKeyDown={handleTextareaKeyDown}
                aria-invalid={Boolean(fieldError)}
                aria-describedby={cn(statusMessage && errorId, counterId)}
                className="max-h-32 min-h-14 w-full min-w-0 resize-none rounded-lg border border-input bg-background px-2.5 py-1.5 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm"
              />
              <Button type="submit" size="icon-lg" aria-label="Send" disabled={!canSend}>
                <Send />
              </Button>
            </div>
            <div className="flex items-start justify-between gap-3 text-xs">
              <div className="min-w-0">
                {statusMessage && (
                  <p id={errorId} role="alert" className="text-destructive">
                    {statusMessage}
                  </p>
                )}
                {coolingDown && (
                  <p className="text-muted-foreground">
                    You can send again in {cooldownSeconds} s.
                  </p>
                )}
              </div>
              <span id={counterId} className="shrink-0 text-muted-foreground tabular-nums">
                {input.length}/{MAX_MESSAGE_LENGTH}
              </span>
            </div>
          </form>
        </section>
      )}

      <Button
        ref={toggleButtonRef}
        size="icon"
        aria-label={open ? 'Close chat' : 'Open chat'}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => (open ? closePanel() : setOpen(true))}
        className="size-12 rounded-full shadow-lg focus-visible:ring-offset-2 [&_svg:not([class*='size-'])]:size-6"
      >
        {open ? <X /> : <MessageCircle />}
      </Button>
    </div>
  )
}

export default ChatWidget
