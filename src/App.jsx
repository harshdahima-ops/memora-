import { useState, useEffect, useRef } from 'react'
import { supabase } from './supabase.js'

// ── Constants ────────────────────────────────────────────────────────────────
const FREE_LIMIT = 20

// ── Helpers ──────────────────────────────────────────────────────────────────
function timeNow() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
function dateNow() {
  return new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}
function today() {
  return new Date().toISOString().split('T')[0]
}

async function callAI(messages, system) {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, system }),
  })
  const data = await res.json()
  if (data.error) throw new Error(data.error)
  return data.content[0].text
}

// ── Global CSS ───────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@700&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body, #root { height: 100%; }
body { font-family: 'DM Sans', sans-serif; background: #0D0D12; color: #EEEDF5; -webkit-font-smoothing: antialiased; }
input, textarea, button, select { font-family: 'DM Sans', sans-serif; }
input::placeholder, textarea::placeholder { color: #3A3A58; }
input:focus, textarea:focus { outline: none; border-color: #7B6EF6 !important; }
button { cursor: pointer; }
button:active { transform: scale(0.97); }
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-thumb { background: #252535; border-radius: 4px; }
a { color: #7B6EF6; text-decoration: none; }
@keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
@keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-7px)} }
.fade-up { animation: fadeUp 0.3s ease; }
`

// ── Shared UI ─────────────────────────────────────────────────────────────────
function Avatar({ name, size = 34 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'linear-gradient(135deg,#7B6EF6,#5A50D4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.38, fontWeight: 700, color: '#fff', flexShrink: 0,
    }}>
      {(name || 'U').slice(0, 2).toUpperCase()}
    </div>
  )
}

function Tag({ text, color = '#7B6EF6' }) {
  return (
    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: color + '22', color, fontWeight: 600, flexShrink: 0 }}>
      {text}
    </span>
  )
}

function Btn({ children, onClick, disabled, full, ghost, danger, style = {} }) {
  const base = {
    padding: '10px 20px', borderRadius: 10, border: 'none', fontSize: 14,
    fontWeight: 600, transition: 'opacity 0.15s', ...style,
  }
  if (ghost) Object.assign(base, { background: 'transparent', border: '1px solid #252535', color: '#7A79A0' })
  else if (danger) Object.assign(base, { background: '#F06B6B22', border: '1px solid #F06B6B44', color: '#F06B6B' })
  else Object.assign(base, { background: disabled ? '#252535' : '#7B6EF6', color: '#fff' })
  if (full) base.width = '100%'
  if (disabled) { base.opacity = 0.5; base.cursor = 'not-allowed' }
  return <button onClick={onClick} disabled={disabled} style={base}>{children}</button>
}

function Input({ label, type = 'text', value, onChange, placeholder, onKeyDown }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ fontSize: 12, color: '#7A79A0', display: 'block', marginBottom: 5 }}>{label}</label>}
      <input
        type={type} value={value} onChange={onChange} placeholder={placeholder} onKeyDown={onKeyDown}
        style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #252535', background: '#1C1C26', color: '#EEEDF5', fontSize: 14 }}
      />
    </div>
  )
}

// ── Auth ──────────────────────────────────────────────────────────────────────
function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit() {
    setErr('')
    if (!email.trim() || !pass.trim()) { setErr('Email and password are required.'); return }
    if (mode === 'signup' && !name.trim()) { setErr('Name is required.'); return }
    setLoading(true)
    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: pass.trim(),
          options: { data: { name: name.trim() } },
        })
        if (error) throw error
        if (data.user) onAuth(data.user)
        else setErr('Check your email to confirm your account.')
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: pass.trim(),
        })
        if (error) throw error
        onAuth(data.user)
      }
    } catch (e) {
      setErr(e.message || 'Something went wrong.')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: '#0D0D12' }}>
      <div style={{ width: '100%', maxWidth: 360 }} className="fade-up">
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🧠</div>
          <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 28, fontWeight: 700 }}>Memora</div>
          <div style={{ fontSize: 13, color: '#7A79A0', marginTop: 4 }}>Your personal AI study companion</div>
        </div>

        <div style={{ background: '#15151C', border: '1px solid #252535', borderRadius: 18, padding: 24 }}>
          <div style={{ display: 'flex', background: '#1C1C26', borderRadius: 10, padding: 3, marginBottom: 22 }}>
            {['login', 'signup'].map((m) => (
              <button key={m} onClick={() => { setMode(m); setErr('') }} style={{
                flex: 1, padding: '8px 0', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 500,
                transition: 'all 0.2s', background: mode === m ? '#7B6EF6' : 'transparent', color: mode === m ? '#fff' : '#7A79A0',
              }}>
                {m === 'login' ? 'Login' : 'Sign Up'}
              </button>
            ))}
          </div>

          {mode === 'signup' && <Input label="Your name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Harsh" />}
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          <Input label="Password" type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="min 6 characters" onKeyDown={(e) => e.key === 'Enter' && submit()} />

          {err && (
            <div style={{ fontSize: 13, color: '#F06B6B', background: '#F06B6B15', border: '1px solid #F06B6B30', borderRadius: 8, padding: '9px 12px', marginBottom: 14, textAlign: 'center' }}>
              {err}
            </div>
          )}

          <Btn onClick={submit} disabled={loading} full>
            {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create Account'}
          </Btn>
        </div>

        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: '#3A3A58' }}>
          20 free AI messages per day • No credit card required
        </div>
      </div>
    </div>
  )
}

// ── Chat ──────────────────────────────────────────────────────────────────────
function ChatTab({ user, notes, onSaveNote }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [mode, setMode] = useState('chat')
  const [typing, setTyping] = useState(false)
  const [usage, setUsage] = useState(0)
  const [loadingMsgs, setLoadingMsgs] = useState(true)
  const bottomRef = useRef(null)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  async function loadData() {
    const [msgsRes, usageRes] = await Promise.all([
      supabase.from('messages').select('*').eq('user_id', user.id).order('created_at'),
      supabase.from('usage').select('count').eq('user_id', user.id).eq('date', today()).single(),
    ])
    if (msgsRes.data) setMessages(msgsRes.data)
    if (usageRes.data) setUsage(usageRes.data.count)
    setLoadingMsgs(false)
  }

  async function trackUsage() {
    const { data } = await supabase.from('usage').select('count').eq('user_id', user.id).eq('date', today()).single()
    if (data) {
      await supabase.from('usage').update({ count: data.count + 1 }).eq('user_id', user.id).eq('date', today())
      setUsage(data.count + 1)
      return data.count + 1
    } else {
      await supabase.from('usage').insert({ user_id: user.id, date: today(), count: 1 })
      setUsage(1)
      return 1
    }
  }

  async function send() {
    const q = input.trim()
    if (!q || typing) return
    if (usage >= FREE_LIMIT) return

    setInput('')
    const userMsg = { id: Date.now(), user_id: user.id, role: 'user', content: q, created_at: new Date().toISOString() }
    setMessages((prev) => [...prev, userMsg])
    setTyping(true)

    await supabase.from('messages').insert({ user_id: user.id, role: 'user', content: q })

    let sys = 'You are Memora, a smart AI study assistant. Be clear, helpful, and precise.'
    if (mode === 'summarize') sys += ' Give a concise bullet-point summary in plain language.'
    if (mode === 'explain') sys += ' Explain step by step in very simple terms with examples for a beginner.'
    if (notes.length > 0) sys += '\n\nStudent saved notes:\n' + notes.map((n) => '[' + n.tag + '] ' + n.title + ': ' + n.body).join('\n')

    const apiMsgs = [...messages, userMsg].slice(-12).map((m) => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.content }))

    try {
      await trackUsage()
      const reply = await callAI(apiMsgs, sys)
      const aiMsg = { id: Date.now() + 1, user_id: user.id, role: 'ai', content: reply, created_at: new Date().toISOString() }
      setMessages((prev) => [...prev, aiMsg])
      await supabase.from('messages').insert({ user_id: user.id, role: 'ai', content: reply })
    } catch (e) {
      const errMsg = { id: Date.now() + 1, role: 'ai', content: 'Error: ' + (e.message || 'Please try again.'), created_at: new Date().toISOString() }
      setMessages((prev) => [...prev, errMsg])
    }
    setTyping(false)
  }

  const modes = [
    { id: 'chat', label: '💬 Chat', color: '#7B6EF6' },
    { id: 'summarize', label: '📋 Summarize', color: '#4DC9A0' },
    { id: 'explain', label: '🔍 Explain Simply', color: '#F0A86B' },
  ]

  const remaining = FREE_LIMIT - usage
  const limitHit = usage >= FREE_LIMIT

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Usage bar */}
      <div style={{ padding: '6px 14px', borderBottom: '1px solid #252535', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 11, color: '#7A79A0' }}>Daily messages</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 80, height: 4, background: '#1C1C26', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ width: Math.min((usage / FREE_LIMIT) * 100, 100) + '%', height: '100%', background: limitHit ? '#F06B6B' : '#7B6EF6', borderRadius: 4, transition: 'width 0.3s' }} />
          </div>
          <span style={{ fontSize: 11, color: limitHit ? '#F06B6B' : '#7A79A0', fontWeight: 500 }}>{remaining} left</span>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 14px' }}>
        {loadingMsgs && (
          <div style={{ textAlign: 'center', padding: 40, color: '#7A79A0' }}>
            <div style={{ fontSize: 24, animation: 'pulse 1.5s ease infinite' }}>🧠</div>
          </div>
        )}
        {!loadingMsgs && messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '36px 16px', color: '#7A79A0' }}>
            <div style={{ fontSize: 38, marginBottom: 10 }}>🧠</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#EEEDF5', marginBottom: 6 }}>
              Hi {user.user_metadata?.name || user.email.split('@')[0]}!
            </div>
            <div style={{ fontSize: 13, lineHeight: 1.7, marginBottom: 20 }}>
              Ask me anything — explain topics, summarize content, or help you study.
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
              {["Explain Newton's laws", 'Summarize the water cycle', 'What is machine learning?'].map((s) => (
                <button key={s} onClick={() => setInput(s)} style={{ padding: '6px 12px', borderRadius: 20, border: '1px solid #252535', background: 'transparent', color: '#7A79A0', fontSize: 12 }}>{s}</button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => (
          <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: 14 }}>
            {m.role === 'ai' && <div style={{ fontSize: 11, color: '#7A79A0', marginBottom: 4, paddingLeft: 2 }}>🧠 Memora</div>}
            <div style={{
              maxWidth: '82%', padding: '10px 14px', fontSize: 14, lineHeight: 1.7, wordBreak: 'break-word', whiteSpace: 'pre-wrap',
              borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              background: m.role === 'user' ? '#7B6EF6' : '#15151C',
              border: m.role === 'ai' ? '1px solid #252535' : 'none',
              color: '#EEEDF5',
            }}>{m.content}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, paddingLeft: m.role === 'ai' ? 2 : 0 }}>
              {m.role === 'ai' && (
                <button onClick={() => onSaveNote(m.content)} style={{ fontSize: 11, color: '#7B6EF6', background: 'none', border: 'none', padding: 0 }}>
                  + Save as note
                </button>
              )}
            </div>
          </div>
        ))}

        {typing && (
          <div style={{ display: 'flex', gap: 4, alignItems: 'center', padding: '10px 14px', background: '#15151C', border: '1px solid #252535', borderRadius: '16px 16px 16px 4px', width: 'fit-content', marginBottom: 14 }}>
            {[0, 1, 2].map((i) => (
              <span key={i} style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#7A79A0', animation: 'bounce 1.1s ease infinite', animationDelay: i * 0.18 + 's' }} />
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '10px 14px 16px', borderTop: '1px solid #252535', background: '#0D0D12', flexShrink: 0 }}>
        {limitHit && (
          <div style={{ fontSize: 13, color: '#F06B6B', background: '#F06B6B15', border: '1px solid #F06B6B30', borderRadius: 8, padding: '8px 12px', marginBottom: 10, textAlign: 'center' }}>
            Daily limit reached. Resets at midnight.
          </div>
        )}
        <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
          {modes.map((m) => (
            <button key={m.id} onClick={() => setMode(m.id)} style={{
              padding: '4px 12px', borderRadius: 20,
              border: '1px solid ' + (mode === m.id ? m.color : '#252535'),
              background: mode === m.id ? m.color + '20' : 'transparent',
              color: mode === m.id ? m.color : '#7A79A0',
              fontSize: 12, fontWeight: mode === m.id ? 600 : 400,
            }}>{m.label}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder={limitHit ? 'Daily limit reached...' : 'Ask anything...'}
            disabled={limitHit}
            style={{ flex: 1, padding: '10px 14px', borderRadius: 12, border: '1px solid #252535', background: '#15151C', color: '#EEEDF5', fontSize: 14 }}
          />
          <button onClick={send} disabled={typing || !input.trim() || limitHit} style={{
            padding: '10px 18px', borderRadius: 12, border: 'none',
            background: typing || !input.trim() || limitHit ? '#252535' : '#7B6EF6',
            color: '#fff', fontSize: 13, fontWeight: 600, flexShrink: 0,
            opacity: typing || !input.trim() || limitHit ? 0.5 : 1,
            cursor: typing || !input.trim() || limitHit ? 'not-allowed' : 'pointer',
          }}>Send</button>
        </div>
      </div>
    </div>
  )
}

// ── Notes ──────────────────────────────────────────────────────────────────────
function NotesTab({ user, notes, setNotes, prefill, clearPrefill }) {
  const [filter, setFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ title: '', body: '', tag: '' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('notes').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).then(({ data }) => {
      if (data) setNotes(data)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (prefill) {
      setForm({ title: 'AI Response', body: prefill.slice(0, 600), tag: 'ai' })
      setShowModal(true)
      clearPrefill()
    }
  }, [prefill])

  async function saveNote() {
    if (!form.title.trim() || !form.body.trim()) return
    const note = { user_id: user.id, title: form.title.trim(), body: form.body.trim(), tag: form.tag.trim() || 'general' }
    const { data, error } = await supabase.from('notes').insert(note).select().single()
    if (!error && data) {
      setNotes((prev) => [data, ...prev])
      setShowModal(false)
      setForm({ title: '', body: '', tag: '' })
    }
  }

  async function deleteNote(id) {
    await supabase.from('notes').delete().eq('id', id)
    setNotes((prev) => prev.filter((n) => n.id !== id))
  }

  const tagColors = { math: '#F0A86B', physics: '#4DC9A0', ai: '#7B6EF6', chemistry: '#F06B6B', biology: '#6BC9F0', general: '#7A79A0' }
  const filtered = filter.trim() ? notes.filter((n) => n.title.toLowerCase().includes(filter.toLowerCase()) || n.body.toLowerCase().includes(filter.toLowerCase()) || n.tag.toLowerCase().includes(filter.toLowerCase())) : notes
  const fld = { width: '100%', padding: '9px 12px', borderRadius: 10, border: '1px solid #252535', background: '#1C1C26', color: '#EEEDF5', fontSize: 13 }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ display: 'flex', gap: 8, padding: '10px 14px', borderBottom: '1px solid #252535', flexShrink: 0 }}>
        <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filter notes..." style={{ ...fld, flex: 1 }} />
        <button onClick={() => { setForm({ title: '', body: '', tag: '' }); setShowModal(true) }} style={{ padding: '9px 14px', borderRadius: 10, border: 'none', background: '#7B6EF6', color: '#fff', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0 }}>+ Add</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 14 }}>
        {loading && <div style={{ textAlign: 'center', padding: 40, color: '#7A79A0', animation: 'pulse 1.5s infinite' }}>Loading...</div>}
        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 16px', color: '#7A79A0' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📝</div>
            <div style={{ fontSize: 14 }}>{filter ? 'No matching notes.' : 'No notes yet. Add one or save an AI response.'}</div>
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map((n) => (
            <div key={n.id} style={{ background: '#15151C', border: '1px solid #252535', borderRadius: 14, padding: '12px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6, gap: 8 }}>
                <div style={{ fontWeight: 600, fontSize: 14, flex: 1 }}>{n.title}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                  <Tag text={n.tag} color={tagColors[n.tag] || '#7B6EF6'} />
                  <button onClick={() => deleteNote(n.id)} style={{ fontSize: 12, color: '#F06B6B', background: 'none', border: 'none', padding: '2px 6px' }}>✕</button>
                </div>
              </div>
              <div style={{ fontSize: 13, color: '#7A79A0', lineHeight: 1.65 }}>{n.body}</div>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: 20 }}>
          <div style={{ background: '#15151C', border: '1px solid #252535', borderRadius: 18, padding: 24, width: '100%', maxWidth: 420 }} className="fade-up">
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 17, fontWeight: 700, marginBottom: 18 }}>Save Note 📝</div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, color: '#7A79A0', display: 'block', marginBottom: 5 }}>Title</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Note title..." style={fld} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, color: '#7A79A0', display: 'block', marginBottom: 5 }}>Tag</label>
              <input value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })} placeholder="e.g. math, physics, ai..." style={fld} />
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 12, color: '#7A79A0', display: 'block', marginBottom: 5 }}>Content</label>
              <textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="Write your note here..." rows={4} style={{ ...fld, resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowModal(false)} style={{ padding: '8px 16px', borderRadius: 10, border: '1px solid #252535', background: 'transparent', color: '#7A79A0', fontSize: 13 }}>Cancel</button>
              <button onClick={saveNote} style={{ padding: '8px 20px', borderRadius: 10, border: 'none', background: '#7B6EF6', color: '#fff', fontSize: 13, fontWeight: 600 }}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Search ────────────────────────────────────────────────────────────────────
function SearchTab({ user, notes, messages: chatMsgs }) {
  const [q, setQ] = useState('')

  function hl(text, query) {
    if (!query.trim()) return text
    const parts = text.split(new RegExp('(' + query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi'))
    return parts.map((p, i) =>
      p.toLowerCase() === query.toLowerCase()
        ? <mark key={i} style={{ background: '#7B6EF622', color: '#7B6EF6', borderRadius: 3, padding: '0 2px' }}>{p}</mark>
        : p
    )
  }

  const results = q.trim() ? [
    ...notes.filter((n) => n.title.toLowerCase().includes(q.toLowerCase()) || n.body.toLowerCase().includes(q.toLowerCase())).map((n) => ({ type: 'note', title: n.title, snippet: n.body.slice(0, 160), tag: n.tag })),
    ...chatMsgs.filter((m) => m.content.toLowerCase().includes(q.toLowerCase())).map((m) => ({ type: 'chat', title: m.role === 'user' ? 'Your question' : 'AI answer', snippet: m.content.slice(0, 160) })),
  ] : []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ padding: '12px 14px', borderBottom: '1px solid #252535', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#15151C', border: '1px solid #252535', borderRadius: 12, padding: '9px 14px' }}>
          <span style={{ fontSize: 16, flexShrink: 0 }}>🔍</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search notes and chat history..." autoFocus style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#EEEDF5', fontSize: 14 }} />
          {q && <button onClick={() => setQ('')} style={{ background: 'none', border: 'none', color: '#7A79A0', fontSize: 16, padding: 0 }}>✕</button>}
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 14 }}>
        {!q && <div style={{ textAlign: 'center', padding: '40px 16px', color: '#7A79A0' }}><div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div><div style={{ fontSize: 14 }}>Search across all your notes and chat history</div></div>}
        {q && results.length === 0 && <div style={{ textAlign: 'center', padding: '40px 16px', color: '#7A79A0' }}><div style={{ fontSize: 14 }}>No results for <strong style={{ color: '#EEEDF5' }}>"{q}"</strong></div></div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {results.map((r, i) => (
            <div key={i} style={{ background: '#15151C', border: '1px solid #252535', borderRadius: 12, padding: '10px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: r.type === 'note' ? '#7B6EF6' : '#4DC9A0' }}>{r.type === 'note' ? '📝 Note' : '💬 Chat'}</span>
                {r.tag && <Tag text={r.tag} color="#7B6EF6" />}
              </div>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{hl(r.title, q)}</div>
              <div style={{ fontSize: 13, color: '#7A79A0', lineHeight: 1.6 }}>{hl(r.snippet, q)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('chat')
  const [notes, setNotes] = useState([])
  const [chatMsgs, setChatMsgs] = useState([])
  const [notePrefill, setNotePrefill] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function logout() {
    await supabase.auth.signOut()
    setNotes([])
    setChatMsgs([])
    setTab('chat')
  }

  function saveFromAI(content) {
    setNotePrefill(content)
    setTab('notes')
  }

  const tabs = [
    { id: 'chat', label: '💬 Chat' },
    { id: 'notes', label: '📝 Notes', badge: notes.length },
    { id: 'search', label: '🔍 Search' },
  ]

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0D0D12', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <style>{CSS}</style>
        <div style={{ fontSize: 40, animation: 'pulse 1.5s ease infinite' }}>🧠</div>
      </div>
    )
  }

  if (!user) return <><style>{CSS}</style><AuthScreen onAuth={setUser} /></>

  const userName = user.user_metadata?.name || user.email.split('@')[0]

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#0D0D12', color: '#EEEDF5' }}>
      <style>{CSS}</style>

      {/* Topbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #252535', flexShrink: 0 }}>
        <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 700 }}>
          🧠 <span style={{ color: '#7B6EF6' }}>Memora</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar name={userName} size={30} />
          <span style={{ fontSize: 13, color: '#7A79A0' }}>{userName}</span>
          <button onClick={logout} style={{ padding: '5px 10px', borderRadius: 8, border: '1px solid #252535', background: 'transparent', color: '#7A79A0', fontSize: 12 }}>Logout</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #252535', flexShrink: 0 }}>
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, padding: '11px 8px', border: 'none',
            borderBottom: '2px solid ' + (tab === t.id ? '#7B6EF6' : 'transparent'),
            background: 'transparent', fontSize: 13, fontWeight: tab === t.id ? 600 : 400,
            color: tab === t.id ? '#7B6EF6' : '#7A79A0',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 0.15s',
          }}>
            {t.label}
            {t.badge > 0 && <span style={{ fontSize: 10, background: '#7B6EF622', color: '#7B6EF6', borderRadius: 10, padding: '1px 6px', fontWeight: 700 }}>{t.badge}</span>}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {tab === 'chat' && <ChatTab user={user} notes={notes} onSaveNote={saveFromAI} />}
        {tab === 'notes' && <NotesTab user={user} notes={notes} setNotes={setNotes} prefill={notePrefill} clearPrefill={() => setNotePrefill(null)} />}
        {tab === 'search' && <SearchTab user={user} notes={notes} messages={chatMsgs} />}
      </div>
    </div>
  )
}
