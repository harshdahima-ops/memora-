import { useState, useEffect, useRef } from 'react'
import { supabase } from './supabase.js'

const FREE_LIMIT = 20

const BOARD_GROUPS = {
  'School - CBSE': ['Class 5 - CBSE','Class 6 - CBSE','Class 7 - CBSE','Class 8 - CBSE','Class 9 - CBSE','Class 10 - CBSE','Class 11 - CBSE','Class 12 - CBSE'],
  'School - ICSE / ISC': ['Class 5 - ICSE','Class 6 - ICSE','Class 7 - ICSE','Class 8 - ICSE','Class 9 - ICSE','Class 10 - ICSE','Class 11 - ISC','Class 12 - ISC'],
  'School - State Board': ['Class 5 - State Board','Class 6 - State Board','Class 7 - State Board','Class 8 - State Board','Class 9 - State Board','Class 10 - State Board','Class 11 - State Board','Class 12 - State Board'],
  'Competitive Exams': ['JEE Mains & Advanced','NEET','UPSC Civil Services','SSC CGL / CHSL','SSC GD / MTS','Railway (RRB)','Banking (IBPS / SBI)','NDA / CDS','CLAT - Law Entrance','CAT / MBA Entrance','GATE','CUET'],
  'College - Engineering': ['B.Tech - CSE','B.Tech - ECE','B.Tech - Mechanical','B.Tech - Civil','B.Tech - IT','B.Tech - EEE','Diploma / Polytechnic'],
  'College - Commerce': ['B.Com / M.Com','BBA / MBA','CA Foundation','CA Intermediate','CA Final'],
  'College - Science': ['B.Sc - Physics','B.Sc - Chemistry','B.Sc - Mathematics','B.Sc - Biology','B.Sc - Computer Science'],
  'College - Computer': ['BCA / MCA','B.Sc IT'],
  'College - Medical': ['MBBS / BDS','B.Pharma','Nursing','Physiotherapy'],
  'College - Arts & Law': ['BA / MA - History','BA / MA - Political Science','BA / MA - Economics','BA / MA - Psychology','BA / MA - English','LLB / LLM','B.Ed / M.Ed'],
}

const BOARDS = {
  'Class 5 - CBSE':['Mathematics','Science','Social Science','English','Hindi'],
  'Class 6 - CBSE':['Mathematics','Science','Social Science','English','Hindi','Sanskrit'],
  'Class 7 - CBSE':['Mathematics','Science','Social Science','English','Hindi','Sanskrit'],
  'Class 8 - CBSE':['Mathematics','Science','Social Science','English','Hindi','Sanskrit'],
  'Class 9 - CBSE':['Mathematics','Science','Social Science','English','Hindi','Sanskrit'],
  'Class 10 - CBSE':['Mathematics','Science','Social Science','English','Hindi','Sanskrit'],
  'Class 11 - CBSE':['Physics','Chemistry','Mathematics','Biology','English','Accountancy','Economics','Business Studies','History','Political Science','Computer Science'],
  'Class 12 - CBSE':['Physics','Chemistry','Mathematics','Biology','English','Accountancy','Economics','Business Studies','History','Political Science','Computer Science'],
  'Class 9 - ICSE':['Mathematics','Physics','Chemistry','Biology','English','History & Civics','Geography'],
  'Class 10 - ICSE':['Mathematics','Physics','Chemistry','Biology','English','History & Civics','Geography'],
  'Class 11 - ISC':['Physics','Chemistry','Mathematics','Biology','English','Accountancy','Economics','Computer Science'],
  'Class 12 - ISC':['Physics','Chemistry','Mathematics','Biology','English','Accountancy','Economics','Computer Science'],
  'Class 9 - State Board':['Mathematics','Science','Social Science','English','Hindi'],
  'Class 10 - State Board':['Mathematics','Science','Social Science','English','Hindi'],
  'Class 11 - State Board':['Physics','Chemistry','Mathematics','Biology','English','Accountancy','Economics'],
  'Class 12 - State Board':['Physics','Chemistry','Mathematics','Biology','English','Accountancy','Economics'],
  'JEE Mains & Advanced':['Physics','Chemistry','Mathematics'],
  'NEET':['Physics','Chemistry','Biology (Botany)','Biology (Zoology)'],
  'UPSC Civil Services':['General Studies I','General Studies II','General Studies III','General Studies IV','CSAT','Essay'],
  'SSC CGL / CHSL':['General Intelligence & Reasoning','General Awareness','Quantitative Aptitude','English'],
  'SSC GD / MTS':['Reasoning','General Knowledge','Mathematics','English / Hindi'],
  'Railway (RRB)':['Mathematics','General Intelligence','General Awareness','General Science'],
  'Banking (IBPS / SBI)':['Quantitative Aptitude','Reasoning','English Language','General Awareness','Computer Knowledge'],
  'NDA / CDS':['Mathematics','General Ability Test','English','General Knowledge'],
  'CLAT - Law Entrance':['English','Current Affairs','Legal Reasoning','Logical Reasoning','Quantitative Techniques'],
  'CAT / MBA Entrance':['Quantitative Aptitude','Verbal Ability','Logical Reasoning','Data Interpretation'],
  'GATE':['Engineering Mathematics','General Aptitude','Core Subject'],
  'CUET':['English','Domain Subject','General Test'],
  'B.Tech - CSE':['Data Structures & Algorithms','DBMS','Operating Systems','Computer Networks','OOP','Software Engineering','Machine Learning','Web Development','Theory of Computation','Compiler Design','AI','Cloud Computing'],
  'B.Tech - ECE':['Electronic Devices','Digital Electronics','Signals & Systems','Communication Systems','Microprocessors','VLSI Design','Electromagnetic Theory','Control Systems'],
  'B.Tech - Mechanical':['Engineering Mechanics','Thermodynamics','Fluid Mechanics','Machine Design','Manufacturing Processes','Heat Transfer','Theory of Machines','Material Science'],
  'B.Tech - Civil':['Structural Analysis','Fluid Mechanics','Geotechnical Engineering','Transportation Engineering','Environmental Engineering','Concrete Technology','Surveying'],
  'B.Tech - IT':['Data Structures','Database Systems','Computer Networks','Web Technologies','Software Engineering','Cloud Computing','Cyber Security'],
  'B.Tech - EEE':['Circuit Theory','Electrical Machines','Power Systems','Control Systems','Power Electronics','Measurements'],
  'Diploma / Polytechnic':['Engineering Mathematics','Applied Physics','Applied Chemistry','Workshop Technology','Core Trade Subject'],
  'B.Com / M.Com':['Financial Accounting','Cost Accounting','Business Law','Income Tax','Auditing','Corporate Accounting','Financial Management'],
  'BBA / MBA':['Management Principles','Marketing Management','Financial Management','HRM','Business Statistics','Operations Management','Strategic Management'],
  'CA Foundation':['Principles of Accounting','Business Law','Quantitative Aptitude','Business Economics'],
  'CA Intermediate':['Accounting','Corporate Laws','Cost & Management Accounting','Taxation','Auditing','Financial Management'],
  'CA Final':['Financial Reporting','Strategic Financial Management','Advanced Auditing','Corporate Laws','Direct Tax Laws','Indirect Tax Laws'],
  'B.Sc - Physics':['Classical Mechanics','Quantum Mechanics','Thermodynamics','Electromagnetism','Optics','Nuclear Physics'],
  'B.Sc - Chemistry':['Organic Chemistry','Inorganic Chemistry','Physical Chemistry','Analytical Chemistry','Spectroscopy'],
  'B.Sc - Mathematics':['Real Analysis','Abstract Algebra','Linear Algebra','Differential Equations','Numerical Methods','Probability & Statistics'],
  'B.Sc - Biology':['Cell Biology','Genetics','Ecology','Microbiology','Biochemistry','Physiology'],
  'B.Sc - Computer Science':['Data Structures','Algorithms','Database Systems','AI','Computer Graphics','Software Engineering'],
  'BCA / MCA':['C Programming','Data Structures','Database Management','Web Technologies','Java','Python','Software Engineering','Computer Networks','Operating Systems'],
  'B.Sc IT':['Programming','Database Management','Web Development','Computer Networks','Software Engineering'],
  'MBBS / BDS':['Anatomy','Physiology','Biochemistry','Pathology','Pharmacology','Microbiology','Community Medicine','Medicine','Surgery'],
  'B.Pharma':['Pharmaceutical Chemistry','Pharmacology','Pharmaceutics','Pharmacognosy','Pharmaceutical Analysis'],
  'Nursing':['Anatomy & Physiology','Microbiology','Pharmacology','Medical Surgical Nursing','Community Health Nursing'],
  'Physiotherapy':['Anatomy','Physiology','Biomechanics','Musculoskeletal PT','Neurological PT'],
  'BA / MA - History':['Ancient History','Medieval History','Modern History','World History','Indian National Movement'],
  'BA / MA - Political Science':['Indian Constitution','Comparative Politics','International Relations','Political Theory','Public Administration'],
  'BA / MA - Economics':['Microeconomics','Macroeconomics','Statistics','Indian Economy','International Economics'],
  'BA / MA - Psychology':['General Psychology','Developmental Psychology','Social Psychology','Abnormal Psychology','Research Methods'],
  'BA / MA - English':['British Literature','American Literature','Indian Writing in English','Literary Theory','Linguistics'],
  'LLB / LLM':['Constitutional Law','Contract Law','Criminal Law','Family Law','Property Law','Administrative Law','Corporate Law'],
  'B.Ed / M.Ed':['Education Philosophy','Educational Psychology','Curriculum Development','Teaching Methods','Assessment & Evaluation'],
}

function today(){ return new Date().toISOString().split('T')[0] }
function genId(){ return Date.now()+'_'+Math.random().toString(36).slice(2,8) }

// ── AI Call ────────────────────────────────────────────────────────────────
async function callAI(messages, system, image, url) {
  const body = { messages, system }
  if (image) body.image = image
  if (url) body.url = url
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 28000)
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal
    })
    clearTimeout(timer)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    if (data.error === 'RATE_LIMIT') throw new Error('RATE_LIMIT')
    if (data.error) throw new Error(data.error)
    if (!data.reply) throw new Error('No response from AI')
    return data.reply
  } catch(err) {
    clearTimeout(timer)
    if (err.name === 'AbortError') throw new Error('RATE_LIMIT')
    throw err
  }
}

// ── Parsers ────────────────────────────────────────────────────────────────
function parseQuiz(text) {
  try {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
    let q='', a='', b='', c='', d='', ans='', exp=''
    for (const line of lines) {
      if (line.startsWith('QUESTION:')) q = line.replace('QUESTION:','').trim()
      else if (/^A[\)\.]\s*/.test(line)) a = line.replace(/^A[\)\.]\s*/,'').trim()
      else if (/^B[\)\.]\s*/.test(line)) b = line.replace(/^B[\)\.]\s*/,'').trim()
      else if (/^C[\)\.]\s*/.test(line)) c = line.replace(/^C[\)\.]\s*/,'').trim()
      else if (/^D[\)\.]\s*/.test(line)) d = line.replace(/^D[\)\.]\s*/,'').trim()
      else if (line.startsWith('ANSWER:')) ans = line.replace('ANSWER:','').trim().charAt(0).toUpperCase()
      else if (line.startsWith('EXPLANATION:')) exp = line.replace('EXPLANATION:','').trim()
    }
    if (!q||!a||!b||!c||!d||!['A','B','C','D'].includes(ans)) return null
    return { question:q, options:{A:a,B:b,C:c,D:d}, correct:ans, explanation:exp }
  } catch { return null }
}

function parseFlashcards(text) {
  const cards = []
  const blocks = text.split(/---+|\n\n+/)
  for (const block of blocks) {
    const termMatch = block.match(/TERM:\s*(.+)/i)
    const defMatch = block.match(/DEF(?:INITION)?:\s*([\s\S]+)/i)
    if (termMatch && defMatch) {
      cards.push({ term: termMatch[1].trim(), def: defMatch[1].replace(/TERM:.*/gi,'').trim() })
    }
  }
  // fallback: Q/A style
  if (cards.length === 0) {
    const qas = text.match(/Q:\s*.+[\s\S]*?A:\s*.+/gi) || []
    for (const qa of qas) {
      const qm = qa.match(/Q:\s*(.+)/i)
      const am = qa.match(/A:\s*([\s\S]+)/i)
      if (qm && am) cards.push({ term: qm[1].trim(), def: am[1].trim() })
    }
  }
  return cards
}

// ── Group conversations ────────────────────────────────────────────────────
function groupConversations(messages) {
  if (!messages.length) return []
  const sorted = [...messages].sort((a,b) => new Date(a.created_at)-new Date(b.created_at))
  const groups = []
  let current = [sorted[0]]
  for (let i=1; i<sorted.length; i++) {
    const gap = new Date(sorted[i].created_at) - new Date(sorted[i-1].created_at)
    if (gap > 45*60*1000) { groups.push(current); current=[sorted[i]] }
    else current.push(sorted[i])
  }
  groups.push(current)
  return groups.reverse().map(msgs => {
    const firstUser = msgs.find(m => m.role==='user')
    return {
      id: msgs[0].id,
      title: firstUser ? firstUser.content.replace(/[#*`_\[\]]/g,'').trim().slice(0,60) : 'Chat session',
      date: msgs[0].created_at?.split('T')[0] || today(),
      messages: msgs
    }
  })
}

function getDateLabel(dateStr) {
  const t = today()
  const yest = new Date(); yest.setDate(yest.getDate()-1)
  const yd = yest.toISOString().split('T')[0]
  if (dateStr===t) return 'Today'
  if (dateStr===yd) return 'Yesterday'
  const diff = Math.floor((new Date()-new Date(dateStr))/(86400000))
  if (diff<=7) return 'Previous 7 Days'
  return new Date(dateStr).toLocaleDateString('en-IN',{month:'long',year:'numeric'})
}

// ── Theme ──────────────────────────────────────────────────────────────────
const T = (dark) => ({
  bg:         dark ? '#212121' : '#FFFFFF',
  sidebar:    dark ? '#171717' : '#F0F0F0',
  surface:    dark ? '#2A2A2A' : '#F7F7F7',
  card:       dark ? '#2F2F2F' : '#FFFFFF',
  card2:      dark ? '#383838' : '#F0F0F0',
  border:     dark ? '#3A3A3A' : '#E0E0E0',
  text:       dark ? '#ECECEC' : '#0A0A0A',
  muted:      dark ? '#8C8C8C' : '#606060',
  accent:     '#8B5CF6',
  accentBg:   dark ? 'rgba(139,92,246,0.12)' : 'rgba(139,92,246,0.08)',
  accentBorder:'rgba(139,92,246,0.35)',
  green:      '#16A34A',
  red:        '#DC2626',
  orange:     '#D97706',
  blue:       '#2563EB',
  hoverNav:   dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
  userBubble: dark ? '#303030' : '#F0F0F0',
})

const CSS = (dark) => `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html,body,#root{height:100%;overflow:hidden;}
body{font-family:'DM Sans',sans-serif;background:${dark?'#212121':'#FFFFFF'};color:${dark?'#ECECEC':'#0A0A0A'};-webkit-font-smoothing:antialiased;-webkit-text-size-adjust:100%;}
input,textarea,button,select{font-family:'DM Sans',sans-serif;-webkit-appearance:none;}
input::placeholder,textarea::placeholder{color:${dark?'#555':'#AAA'};}
input:focus,textarea:focus,select:focus{outline:none;border-color:#8B5CF6!important;}
button{cursor:pointer;transition:background 0.15s,color 0.15s,opacity 0.15s;-webkit-tap-highlight-color:transparent;}
button:active{transform:scale(0.97);}
::-webkit-scrollbar{width:4px;}
::-webkit-scrollbar-thumb{background:${dark?'#444':'#CCC'};border-radius:4px;}
::-webkit-scrollbar-track{background:transparent;}
@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-5px)}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes flipIn{from{transform:rotateY(90deg);opacity:0}to{transform:rotateY(0deg);opacity:1}}
@keyframes shimmer{0%{opacity:0.4}50%{opacity:0.9}100%{opacity:0.4}}
.fu{animation:fadeUp 0.25s ease both;}
.fu1{animation:fadeUp 0.25s 0.05s ease both;}
.fu2{animation:fadeUp 0.25s 0.12s ease both;}
.fu3{animation:fadeUp 0.25s 0.2s ease both;}
.msg{animation:fadeUp 0.2s ease both;}
.flip-card{perspective:900px;}
.flip-inner{position:relative;width:100%;transition:transform 0.55s cubic-bezier(.4,0,.2,1);transform-style:preserve-3d;}
.flip-inner.flipped{transform:rotateY(180deg);}
.flip-face{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;}
.flip-back{transform:rotateY(180deg);}
.desktop-only{display:flex;}
.mobile-only{display:none;}
@media(max-width:768px){
  .desktop-only{display:none!important;}
  .mobile-only{display:flex!important;}
  .sidebar-wrap{display:none!important;}
  .main-content{width:100%!important;}
  .msg-wrap{padding:6px 12px!important;}
  .mode-pills{gap:4px!important;}
  .mode-pill{padding:4px 10px!important;font-size:11px!important;}
  .chat-input-row{padding:8px 12px 12px!important;}
  .non-chat-panel{padding:10px 12px!important;}
}
`

// ── Markdown renderer ──────────────────────────────────────────────────────
function MD({ content, dark }) {
  if (!content) return null
  const t = T(dark)

  function fmtLine(text) {
    const parts = []; let rem = text, k = 0
    while (rem.length) {
      const bm = rem.match(/\*\*(.*?)\*\*/)
      const im = rem.match(/\*(.*?)\*/)
      const cm = rem.match(/`(.*?)`/)
      const hits = [bm&&{t:'b',i:bm.index,f:bm[0],v:bm[1]}, im&&{t:'i',i:im.index,f:im[0],v:im[1]}, cm&&{t:'c',i:cm.index,f:cm[0],v:cm[1]}].filter(Boolean).sort((a,b)=>a.i-b.i)
      if (!hits.length) { parts.push(rem); break }
      const h = hits[0]
      if (h.i > 0) parts.push(rem.slice(0,h.i))
      if (h.t==='b') parts.push(<strong key={k++} style={{fontWeight:600,color:t.text}}>{h.v}</strong>)
      else if (h.t==='i') parts.push(<em key={k++}>{h.v}</em>)
      else parts.push(<code key={k++} style={{background:t.card2,borderRadius:4,padding:'1px 6px',fontSize:'0.875em',fontFamily:'monospace',color:t.accent}}>{h.v}</code>)
      rem = rem.slice(h.i+h.f.length)
    }
    return parts.length===1&&typeof parts[0]==='string' ? parts[0] : parts
  }

  const els = []; let i=0, inCode=false, codeLines=[], lang=''
  const lines = content.split('\n')
  while (i < lines.length) {
    const l = lines[i]
    if (l.startsWith('```')) {
      if (!inCode) { inCode=true; codeLines=[]; lang=l.slice(3).trim() }
      else {
        els.push(<div key={i} style={{background:dark?'#1A1A1A':'#F5F5F5',borderRadius:8,border:`1px solid ${t.border}`,overflow:'hidden',margin:'10px 0'}}>
          {lang&&<div style={{padding:'5px 14px',fontSize:11,color:t.muted,borderBottom:`1px solid ${t.border}`,fontWeight:500}}>{lang}</div>}
          <pre style={{padding:'14px',fontSize:13,overflowX:'auto',fontFamily:'monospace',lineHeight:1.65,color:t.text}}><code>{codeLines.join('\n')}</code></pre>
        </div>)
        inCode=false; codeLines=[]; lang=''
      }
      i++; continue
    }
    if (inCode) { codeLines.push(l); i++; continue }
    if (l.startsWith('### ')) els.push(<h3 key={i} style={{fontSize:15,fontWeight:600,margin:'12px 0 5px',color:t.text}}>{fmtLine(l.slice(4))}</h3>)
    else if (l.startsWith('## ')) els.push(<h2 key={i} style={{fontSize:17,fontWeight:700,margin:'16px 0 7px',color:t.text,borderBottom:`1px solid ${t.border}`,paddingBottom:6}}>{fmtLine(l.slice(3))}</h2>)
    else if (l.startsWith('# ')) els.push(<h1 key={i} style={{fontSize:20,fontWeight:700,margin:'18px 0 10px',color:t.text}}>{fmtLine(l.slice(2))}</h1>)
    else if (l.startsWith('---')) els.push(<hr key={i} style={{border:'none',borderTop:`1px solid ${t.border}`,margin:'14px 0'}}/>)
    else if (/^[-*•] /.test(l)) els.push(<div key={i} style={{display:'flex',gap:9,marginBottom:6,paddingLeft:4}}><span style={{color:t.accent,marginTop:5,flexShrink:0,fontSize:10}}>◆</span><span style={{fontSize:15,color:t.text,lineHeight:1.7}}>{fmtLine(l.replace(/^[-*•] /,''))}</span></div>)
    else if (/^\d+\. /.test(l)) { const[,n,tx]=l.match(/^(\d+)\. (.*)/); els.push(<div key={i} style={{display:'flex',gap:9,marginBottom:6,paddingLeft:4}}><span style={{color:t.accent,fontWeight:700,fontSize:13,flexShrink:0,minWidth:22,background:t.accentBg,borderRadius:4,textAlign:'center',lineHeight:'22px',height:22}}>{n}</span><span style={{fontSize:15,color:t.text,lineHeight:1.7}}>{fmtLine(tx)}</span></div>) }
    else if (l.startsWith('> ')) els.push(<div key={i} style={{borderLeft:`3px solid ${t.accent}`,paddingLeft:14,margin:'10px 0',color:t.muted,fontSize:15,fontStyle:'italic',background:t.accentBg,padding:'10px 14px',borderRadius:'0 8px 8px 0'}}>{fmtLine(l.slice(2))}</div>)
    else if (l.trim()==='') els.push(<div key={i} style={{height:8}}/>)
    else els.push(<p key={i} style={{fontSize:15,color:t.text,lineHeight:1.75,margin:'3px 0'}}>{fmtLine(l)}</p>)
    i++
  }
  return <div style={{lineHeight:1.7}}>{els}</div>
}

// ── Skeleton Loader ────────────────────────────────────────────────────────
function Skeleton({ dark, lines=4 }) {
  const t = T(dark)
  return (
    <div style={{display:'flex',flexDirection:'column',gap:10,padding:'4px 0'}}>
      {Array.from({length:lines}).map((_,i)=>(
        <div key={i} style={{height:14,borderRadius:6,background:t.card2,width:i===lines-1?'60%':'100%',animation:'shimmer 1.4s ease infinite',animationDelay:i*0.1+'s'}}/>
      ))}
    </div>
  )
}

// ── Landing / Auth ─────────────────────────────────────────────────────────
function Landing({ onAuth }) {
  const [view,setView] = useState('home')
  const [mode,setMode] = useState('login')
  const [name,setName] = useState('')
  const [email,setEmail] = useState('')
  const [pass,setPass] = useState('')
  const [err,setErr] = useState('')
  const [loading,setLoading] = useState(false)
  const t = T(true)

  async function googleLogin() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({ provider:'google', options:{redirectTo:window.location.origin} })
    if (error) { setErr(error.message); setLoading(false) }
  }

  async function submit() {
    setErr('')
    if (!email.trim()||!pass.trim()) { setErr('Email and password required.'); return }
    if (mode==='signup'&&!name.trim()) { setErr('Name is required.'); return }
    setLoading(true)
    try {
      let result
      if (mode==='login') result = await supabase.auth.signInWithPassword({email:email.trim(),password:pass})
      else result = await supabase.auth.signUp({email:email.trim(),password:pass,options:{data:{name:name.trim()}}})
      if (result.error) setErr(result.error.message)
      else if (result.data?.user) onAuth(result.data.user)
    } catch(e) { setErr(e.message) }
    setLoading(false)
  }

  if (view==='auth') return (
    <div style={{minHeight:'100vh',background:'#0D0D0D',display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <div style={{width:'100%',maxWidth:380}} className="fu">
        <div style={{textAlign:'center',marginBottom:32}}>
          <div style={{fontSize:36,marginBottom:10}}>🧠</div>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:26,fontWeight:800,color:'#ECECEC',letterSpacing:-0.5}}>Memora</div>
          <div style={{fontSize:14,color:t.muted,marginTop:4}}>{mode==='login'?'Welcome back':'Create your account'}</div>
        </div>
        <div style={{background:'#1C1C1C',border:'1px solid #2E2E2E',borderRadius:14,padding:28}}>
          <button onClick={googleLogin} disabled={loading} style={{width:'100%',padding:12,borderRadius:8,border:'1px solid #3A3A3A',background:'#252525',color:'#ECECEC',fontSize:14,fontWeight:500,display:'flex',alignItems:'center',justifyContent:'center',gap:10,marginBottom:20}}>
            <span style={{fontSize:16,fontWeight:700}}>G</span> Continue with Google
          </button>
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:18}}>
            <div style={{flex:1,height:1,background:'#2E2E2E'}}/><span style={{fontSize:11,color:t.muted}}>or</span><div style={{flex:1,height:1,background:'#2E2E2E'}}/>
          </div>
          <div style={{display:'flex',background:'#252525',borderRadius:7,border:'1px solid #2E2E2E',marginBottom:18,padding:3}}>
            {['login','signup'].map(m=><button key={m} onClick={()=>setMode(m)} style={{flex:1,padding:7,borderRadius:5,border:'none',background:mode===m?'#8B5CF6':'transparent',color:mode===m?'#fff':t.muted,fontSize:13,fontWeight:mode===m?600:400,textTransform:'capitalize'}}>{m==='login'?'Sign In':'Sign Up'}</button>)}
          </div>
          {mode==='signup'&&<input value={name} onChange={e=>setName(e.target.value)} placeholder="Full name" style={{width:'100%',padding:'11px 14px',borderRadius:8,border:'1px solid #3A3A3A',background:'#252525',color:'#ECECEC',fontSize:14,marginBottom:10}}/>}
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" type="email" style={{width:'100%',padding:'11px 14px',borderRadius:8,border:'1px solid #3A3A3A',background:'#252525',color:'#ECECEC',fontSize:14,marginBottom:10}}/>
          <input value={pass} onChange={e=>setPass(e.target.value)} placeholder="Password" type="password" onKeyDown={e=>e.key==='Enter'&&submit()} style={{width:'100%',padding:'11px 14px',borderRadius:8,border:'1px solid #3A3A3A',background:'#252525',color:'#ECECEC',fontSize:14,marginBottom:14}}/>
          {err&&<div style={{fontSize:13,color:'#DC2626',marginBottom:12,textAlign:'center'}}>{err}</div>}
          <button onClick={submit} disabled={loading} style={{width:'100%',padding:12,borderRadius:8,border:'none',background:'#8B5CF6',color:'#fff',fontSize:14,fontWeight:700}}>
            {loading ? 'Please wait…' : (mode==='login' ? 'Sign In →' : 'Create Account →')}
          </button>
        </div>
        <div style={{textAlign:'center',marginTop:20}}><button onClick={()=>setView('home')} style={{background:'none',border:'none',color:t.muted,fontSize:13}}>← Back</button></div>
      </div>
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:'#0D0D0D',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:20,textAlign:'center'}}>
      <style>{CSS(true)}</style>
      <div className="fu" style={{maxWidth:520,width:'100%'}}>
        <div style={{fontSize:52,marginBottom:16}}>🧠</div>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:42,fontWeight:800,color:'#ECECEC',letterSpacing:-1.5,marginBottom:10}}>Memora</div>
        <div style={{fontSize:16,color:'#8C8C8C',marginBottom:14,lineHeight:1.65}}>Your AI study companion for Indian students.<br/>Chat · Summarize · Quiz · Flashcards · Predict.</div>
        <div style={{display:'flex',gap:8,justifyContent:'center',flexWrap:'wrap',marginBottom:36}}>
          {['🧩 Smart Quizzes','📋 Flip Flashcards','📄 Deep Summaries','🎯 Exam Predictions','💡 Expert Explanations'].map((f,i)=>(
            <span key={i} style={{padding:'5px 14px',borderRadius:20,background:'rgba(139,92,246,0.12)',border:'1px solid rgba(139,92,246,0.25)',fontSize:13,color:'#C4B5FD',fontWeight:500}}>{f}</span>
          ))}
        </div>
        <button onClick={()=>setView('auth')} style={{padding:'14px 48px',borderRadius:10,border:'none',background:'#8B5CF6',color:'#fff',fontSize:16,fontWeight:700,marginBottom:12,boxShadow:'0 4px 24px rgba(139,92,246,0.35)'}}>Get Started Free →</button>
        <div style={{fontSize:13,color:'#555'}}>No credit card required · CBSE · ICSE · JEE · NEET · UPSC + more</div>
      </div>
    </div>
  )
}

// ── Profile Setup ──────────────────────────────────────────────────────────
function ProfileSetup({ user, onDone, dark }) {
  const t = T(dark)
  const [group,setGroup] = useState('')
  const [board,setBoard] = useState('')
  const [subject,setSubject] = useState('')
  const [saving,setSaving] = useState(false)
  const groups = Object.keys(BOARD_GROUPS)
  const boards = group ? BOARD_GROUPS[group] : []
  const subjects = board ? BOARDS[board]||[] : []

  async function save() {
    if (!board) return
    setSaving(true)

    const profileData = {
      user_id:     user.id,
      name:        user.user_metadata?.name || user.email.split('@')[0],
      board,
      subject:     subject || null,
      weak_topics: [],
      premium:     false,
    }

    try {
      // 8 second timeout on the DB call
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('TIMEOUT')), 8000)
      )

      const dbCall = supabase
        .from('profiles')
        .upsert(profileData, { onConflict: 'user_id' })
        .select()
        .single()

      const { data, error } = await Promise.race([dbCall, timeout])

      if (error) {
        console.error('Profile save error:', error.message)
        // Still proceed — use local profile so user isn't stuck
        onDone({ ...profileData, id: user.id })
        return
      }

      if (data) { onDone(data); return }
    } catch (err) {
      console.error('Profile save failed:', err.message)
      // TIMEOUT or network error — proceed anyway with local data
      // User can still use the app; profile saves next time
    }

    // Fallback: don't leave user stuck on "Saving…"
    onDone({ ...profileData, id: user.id })
  }

  const sel = { width:'100%', padding:'11px 14px', borderRadius:8, border:`1px solid ${t.border}`, background:t.card2, color:t.text, fontSize:14, appearance:'none' }

  return (
    <div style={{minHeight:'100vh',background:t.bg,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <style>{CSS(dark)}</style>
      <div style={{width:'100%',maxWidth:460}} className="fu">
        <div style={{marginBottom:28,textAlign:'center'}}>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:24,fontWeight:800,color:t.text,marginBottom:6}}>Set up your profile</div>
          <div style={{fontSize:14,color:t.muted}}>Memora personalizes everything to your exact syllabus.</div>
        </div>
        <div style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:14,padding:24}}>
          <div style={{marginBottom:16}}>
            <label style={{fontSize:12,color:t.muted,fontWeight:600,display:'block',marginBottom:7,textTransform:'uppercase',letterSpacing:0.5}}>Category</label>
            <select value={group} onChange={e=>{setGroup(e.target.value);setBoard('');setSubject('')}} style={sel}>
              <option value=''>Select your category…</option>
              {groups.map(g=><option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          {group&&<div style={{marginBottom:16}}>
            <label style={{fontSize:12,color:t.muted,fontWeight:600,display:'block',marginBottom:7,textTransform:'uppercase',letterSpacing:0.5}}>Course / Class</label>
            <select value={board} onChange={e=>{setBoard(e.target.value);setSubject('')}} style={sel}>
              <option value=''>Select…</option>
              {boards.map(b=><option key={b} value={b}>{b}</option>)}
            </select>
          </div>}
          {board&&subjects.length>0&&<div style={{marginBottom:20}}>
            <label style={{fontSize:12,color:t.muted,fontWeight:600,display:'block',marginBottom:7,textTransform:'uppercase',letterSpacing:0.5}}>Primary Subject <span style={{fontWeight:400,textTransform:'none'}}>(optional)</span></label>
            <select value={subject} onChange={e=>setSubject(e.target.value)} style={sel}>
              <option value=''>All subjects</option>
              {subjects.map(s=><option key={s} value={s}>{s}</option>)}
            </select>
          </div>}
          <button onClick={save} disabled={!board||saving} style={{width:'100%',padding:13,borderRadius:8,border:'none',background:board?'#8B5CF6':t.border,color:'#fff',fontSize:15,fontWeight:700,opacity:!board?0.4:1}}>
            {saving ? 'Saving…' : 'Start Studying →'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Premium Modal ──────────────────────────────────────────────────────────
function PremiumModal({ onClose, dark, user }) {
  const t = T(dark)
  const [loading,setLoading] = useState(false)
  const [done,setDone] = useState(false)

  async function pay() {
    setLoading(true)
    try {
      const r = await fetch('/api/payment', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({action:'create_order'}) })
      const order = await r.json()
      if (order.error) throw new Error(order.error)
      const options = {
        key:order.keyId, amount:order.amount, currency:order.currency, name:'Memora', description:'Premium Plan', order_id:order.orderId,
        handler: async (response) => {
          const v = await fetch('/api/payment', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({action:'verify_payment',...response}) })
          const vd = await v.json()
          if (vd.verified) { await supabase.from('profiles').update({premium:true}).eq('user_id',user.id); setDone(true) }
          else alert('Payment verification failed.')
        },
        prefill: { email:user.email }, theme: { color:'#8B5CF6' }
      }
      const rzp = new window.Razorpay(options); rzp.open()
    } catch(e) { alert('Payment error: '+e.message) }
    setLoading(false)
  }

  if (done) return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:20}}>
      <div style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:16,padding:40,width:'100%',maxWidth:360,textAlign:'center'}} className="fu">
        <div style={{fontSize:52,marginBottom:14}}>🎉</div>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:800,color:t.text,marginBottom:8}}>You're Premium!</div>
        <div style={{fontSize:14,color:t.muted,marginBottom:24}}>Unlimited messages and all features unlocked.</div>
        <button onClick={()=>{onClose();window.location.reload()}} style={{width:'100%',padding:13,borderRadius:8,border:'none',background:'#8B5CF6',color:'#fff',fontSize:14,fontWeight:600}}>Start Studying →</button>
      </div>
    </div>
  )

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.88)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:20,overflowY:'auto'}}>
      <div style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:16,padding:28,width:'100%',maxWidth:400}} className="fu">
        <div style={{textAlign:'center',marginBottom:22}}>
          <div style={{fontSize:36,marginBottom:8}}>⭐</div>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:800,color:t.text}}>Memora Premium</div>
          <div style={{fontSize:13,color:t.muted,marginTop:3}}>Study without limits</div>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:7,marginBottom:20}}>
          {[['∞','Unlimited AI messages every day'],['🧩','Unlimited quiz questions'],['📁','Upload images, PDFs & URLs'],['📋','Syllabus PDF upload'],['⚡','Priority AI response speed']].map(([ic,lb],i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',gap:12,padding:'9px 12px',background:t.card2,borderRadius:8}}>
              <span style={{fontSize:16,width:24,textAlign:'center'}}>{ic}</span>
              <span style={{fontSize:13,color:t.text}}>{lb}</span>
            </div>
          ))}
        </div>
        <div style={{background:'#8B5CF6',borderRadius:10,padding:'14px 20px',textAlign:'center',marginBottom:14}}>
          <div style={{fontSize:28,fontWeight:800,color:'#fff',fontFamily:"'Syne',sans-serif"}}>₹99 <span style={{fontSize:14,fontWeight:400,opacity:0.8}}>/ month</span></div>
          <div style={{fontSize:12,color:'rgba(255,255,255,0.65)',marginTop:2}}>Cancel anytime · Instant access</div>
        </div>
        <div style={{display:'flex',gap:6,justifyContent:'center',flexWrap:'wrap',marginBottom:14}}>
          {['UPI','Credit Card','Debit Card','Net Banking','Wallets'].map(m=>(
            <span key={m} style={{fontSize:10,padding:'3px 9px',borderRadius:6,background:t.card2,border:`1px solid ${t.border}`,color:t.muted,fontWeight:500}}>{m}</span>
          ))}
        </div>
        <button onClick={pay} disabled={loading} style={{width:'100%',padding:13,borderRadius:8,border:'none',background:loading?t.border:'#8B5CF6',color:'#fff',fontSize:14,fontWeight:700,marginBottom:8}}>
          {loading ? 'Loading…' : 'Pay ₹99 & Upgrade Now'}
        </button>
        <div style={{fontSize:11,color:t.muted,textAlign:'center',marginBottom:12}}>🔒 Secure payment by Razorpay</div>
        <button onClick={onClose} style={{width:'100%',padding:10,borderRadius:8,border:`1px solid ${t.border}`,background:'transparent',color:t.muted,fontSize:13}}>Maybe later</button>
      </div>
    </div>
  )
}

// ── Quiz Card ──────────────────────────────────────────────────────────────
function QuizCard({ quiz, onAnswer, onNext, onEnd, score, total, streak, dark }) {
  const t = T(dark)
  const [sel,setSel] = useState(null)
  const [revealed,setRevealed] = useState(false)

  function submit() { if (!sel) return; setRevealed(true); onAnswer(sel===quiz.correct) }
  function next() { setSel(null); setRevealed(false); onNext() }

  const isCorrect = revealed && sel===quiz.correct

  return (
    <div style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:14,padding:'18px 16px',width:'100%',maxWidth:520,marginTop:6}} className="msg">
      {/* Header */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <span style={{fontSize:12,color:t.muted,fontWeight:500}}>Q {total+1}</span>
          {streak>=2&&<span style={{fontSize:11,padding:'2px 8px',borderRadius:20,background:'rgba(245,158,11,0.12)',border:'1px solid rgba(245,158,11,0.3)',color:'#F59E0B',fontWeight:600}}>🔥 {streak} streak</span>}
        </div>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <span style={{fontSize:12,fontWeight:700,color:t.green}}>✓ {score}/{total}</span>
          <button onClick={onEnd} style={{fontSize:11,color:t.red,background:'none',border:`1px solid rgba(220,38,38,0.3)`,borderRadius:6,padding:'2px 8px',fontWeight:500}}>End Quiz</button>
        </div>
      </div>

      {/* Score bar */}
      {total > 0 && (
        <div style={{height:3,background:t.card2,borderRadius:2,marginBottom:14,overflow:'hidden'}}>
          <div style={{height:'100%',width:`${(score/total)*100}%`,background:t.green,borderRadius:2,transition:'width 0.4s'}}/>
        </div>
      )}

      <div style={{fontSize:15,fontWeight:600,color:t.text,marginBottom:16,lineHeight:1.55}}>{quiz.question}</div>

      <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:14}}>
        {Object.entries(quiz.options).map(([letter,text]) => {
          let bg=t.card2, border=t.border, col=t.text
          if (revealed) {
            if (letter===quiz.correct) { bg=dark?'rgba(22,163,74,0.12)':'rgba(22,163,74,0.08)'; border='#16A34A'; col='#16A34A' }
            else if (sel===letter) { bg=dark?'rgba(220,38,38,0.12)':'rgba(220,38,38,0.08)'; border='#DC2626'; col='#DC2626' }
          } else if (sel===letter) { bg=t.accentBg; border=t.accent; col=t.accent }

          return (
            <button key={letter} onClick={()=>!revealed&&setSel(letter)} style={{padding:'11px 14px',borderRadius:10,border:`1.5px solid ${border}`,background:bg,color:col,fontSize:14,textAlign:'left',cursor:revealed?'default':'pointer',display:'flex',alignItems:'center',gap:10,fontWeight:sel===letter?600:400,transition:'all 0.15s'}}>
              <span style={{width:26,height:26,borderRadius:'50%',border:`1.5px solid ${border}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,flexShrink:0,color:col}}>{letter}</span>
              <span style={{flex:1,lineHeight:1.45}}>{text}</span>
              {revealed&&letter===quiz.correct&&<span style={{fontSize:16}}>✓</span>}
              {revealed&&sel===letter&&letter!==quiz.correct&&<span style={{fontSize:16}}>✗</span>}
            </button>
          )
        })}
      </div>

      {!revealed ? (
        <button onClick={submit} disabled={!sel} style={{width:'100%',padding:11,borderRadius:8,border:'none',background:sel?'#8B5CF6':t.border,color:'#fff',fontSize:14,fontWeight:600,opacity:sel?1:0.4}}>Submit Answer</button>
      ) : (
        <div>
          {/* Result */}
          <div style={{padding:'12px 14px',borderRadius:10,background:isCorrect?(dark?'rgba(22,163,74,0.1)':'rgba(22,163,74,0.06)'):'rgba(220,38,38,0.08)',border:`1px solid ${isCorrect?'rgba(22,163,74,0.3)':'rgba(220,38,38,0.25)'}`,marginBottom:10}}>
            <div style={{fontSize:14,fontWeight:700,color:isCorrect?t.green:t.red,marginBottom:isCorrect?0:4}}>
              {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
            </div>
            {!isCorrect&&<div style={{fontSize:13,color:t.muted}}>Correct answer: <strong style={{color:t.green}}>{quiz.correct}) {quiz.options[quiz.correct]}</strong></div>}
            {quiz.explanation&&<div style={{fontSize:13,color:t.muted,marginTop:6,lineHeight:1.5,borderTop:`1px solid ${t.border}`,paddingTop:8}}>{quiz.explanation}</div>}
          </div>
          <div style={{display:'flex',gap:8}}>
            <button onClick={next} style={{flex:1,padding:11,borderRadius:8,border:'none',background:'#8B5CF6',color:'#fff',fontSize:14,fontWeight:600}}>Next Question →</button>
            <button onClick={onEnd} style={{padding:'11px 14px',borderRadius:8,border:`1px solid ${t.border}`,background:'transparent',color:t.muted,fontSize:13}}>End</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Flashcard Deck ─────────────────────────────────────────────────────────
function FlashcardDeck({ cards, dark, onClose }) {
  const t = T(dark)
  const [idx,setIdx] = useState(0)
  const [flipped,setFlipped] = useState(false)
  const [known,setKnown] = useState([])
  const [unknown,setUnknown] = useState([])
  const [done,setDone] = useState(false)

  const card = cards[idx]
  const progress = Math.round(((known.length+unknown.length)/cards.length)*100)

  function markKnown() {
    setKnown(p=>[...p,idx])
    advance()
  }
  function markUnknown() {
    setUnknown(p=>[...p,idx])
    advance()
  }
  function advance() {
    setFlipped(false)
    setTimeout(()=>{
      if (idx < cards.length-1) setIdx(i=>i+1)
      else setDone(true)
    },200)
  }

  if (done) return (
    <div style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:14,padding:24,marginTop:8,textAlign:'center'}} className="fu">
      <div style={{fontSize:36,marginBottom:12}}>🎓</div>
      <div style={{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:800,color:t.text,marginBottom:6}}>Deck Complete!</div>
      <div style={{display:'flex',gap:10,justifyContent:'center',margin:'14px 0'}}>
        <div style={{padding:'10px 18px',borderRadius:8,background:'rgba(22,163,74,0.1)',border:'1px solid rgba(22,163,74,0.3)',textAlign:'center'}}>
          <div style={{fontSize:22,fontWeight:800,color:t.green}}>{known.length}</div>
          <div style={{fontSize:12,color:t.muted}}>Known</div>
        </div>
        <div style={{padding:'10px 18px',borderRadius:8,background:'rgba(220,38,38,0.08)',border:'1px solid rgba(220,38,38,0.2)',textAlign:'center'}}>
          <div style={{fontSize:22,fontWeight:800,color:t.red}}>{unknown.length}</div>
          <div style={{fontSize:12,color:t.muted}}>Review</div>
        </div>
      </div>
      <div style={{display:'flex',gap:8,justifyContent:'center'}}>
        <button onClick={()=>{setIdx(0);setFlipped(false);setKnown([]);setUnknown([]);setDone(false)}} style={{padding:'9px 20px',borderRadius:8,border:'none',background:'#8B5CF6',color:'#fff',fontSize:13,fontWeight:600}}>Study Again</button>
        {onClose&&<button onClick={onClose} style={{padding:'9px 14px',borderRadius:8,border:`1px solid ${t.border}`,background:'transparent',color:t.muted,fontSize:13}}>Close</button>}
      </div>
    </div>
  )

  return (
    <div style={{marginTop:8}} className="msg">
      {/* Progress */}
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
        <div style={{flex:1,height:4,background:t.card2,borderRadius:2,overflow:'hidden'}}>
          <div style={{height:'100%',width:`${progress}%`,background:t.accent,borderRadius:2,transition:'width 0.3s'}}/>
        </div>
        <span style={{fontSize:12,color:t.muted,flexShrink:0}}>{idx+1} / {cards.length}</span>
      </div>

      {/* Card */}
      <div className="flip-card" style={{height:200,marginBottom:12}} onClick={()=>setFlipped(f=>!f)}>
        <div className={`flip-inner${flipped?' flipped':''}`} style={{height:200}}>
          {/* Front */}
          <div className="flip-face" style={{background:t.card,border:`1.5px solid ${t.accentBorder}`,borderRadius:14,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'20px 24px',cursor:'pointer'}}>
            <div style={{fontSize:11,color:t.muted,fontWeight:600,textTransform:'uppercase',letterSpacing:0.5,marginBottom:12}}>TERM</div>
            <div style={{fontSize:17,fontWeight:700,color:t.text,textAlign:'center',lineHeight:1.45}}>{card.term}</div>
            <div style={{fontSize:11,color:t.muted,marginTop:14,display:'flex',alignItems:'center',gap:4}}>
              <span>↔</span> Click to flip
            </div>
          </div>
          {/* Back */}
          <div className="flip-face flip-back" style={{background:t.accentBg,border:`1.5px solid ${t.accentBorder}`,borderRadius:14,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'20px 24px',cursor:'pointer'}}>
            <div style={{fontSize:11,color:t.accent,fontWeight:600,textTransform:'uppercase',letterSpacing:0.5,marginBottom:12}}>DEFINITION</div>
            <div style={{fontSize:14,color:t.text,textAlign:'center',lineHeight:1.6}}>{card.def}</div>
          </div>
        </div>
      </div>

      {/* Known / Unknown */}
      {flipped && (
        <div style={{display:'flex',gap:10}} className="fu">
          <button onClick={markUnknown} style={{flex:1,padding:'10px',borderRadius:10,border:'1px solid rgba(220,38,38,0.3)',background:'rgba(220,38,38,0.07)',color:t.red,fontSize:13,fontWeight:600}}>✗ Need Review</button>
          <button onClick={markKnown} style={{flex:1,padding:'10px',borderRadius:10,border:'1px solid rgba(22,163,74,0.3)',background:'rgba(22,163,74,0.08)',color:t.green,fontSize:13,fontWeight:600}}>✓ Got It</button>
        </div>
      )}
      {!flipped && (
        <div style={{display:'flex',gap:8}}>
          <button onClick={()=>idx>0&&(setFlipped(false),setIdx(i=>i-1))} disabled={idx===0} style={{padding:'9px 16px',borderRadius:8,border:`1px solid ${t.border}`,background:'transparent',color:t.muted,fontSize:13,opacity:idx===0?0.4:1}}>← Prev</button>
          <button onClick={()=>setFlipped(true)} style={{flex:1,padding:'9px',borderRadius:8,border:`1px solid ${t.accent}`,background:t.accentBg,color:t.accent,fontSize:13,fontWeight:600}}>Flip Card ↔</button>
        </div>
      )}
    </div>
  )
}

// ── Study Modes config ─────────────────────────────────────────────────────
const studyModes = [
  { id:'chat',      label:'💬 Chat',        color:'#8B5CF6', desc:'Ask anything' },
  { id:'summarize', label:'📄 Summarize',   color:'#0EA5E9', desc:'Deep structured summary' },
  { id:'explain',   label:'💡 Explain',     color:'#F59E0B', desc:'Expert explanation' },
  { id:'quiz',      label:'🧩 Quiz',        color:'#10B981', desc:'Test your knowledge' },
  { id:'flashcard', label:'📋 Flashcards',  color:'#EC4899', desc:'Flip card revision' },
  { id:'predict',   label:'🎯 Predict',     color:'#EF4444', desc:'Exam predictions' },
]

// ── Change Subject Modal ───────────────────────────────────────────────────
function SubjectModal({ profile, onClose, onSave, dark }) {
  const t = T(dark)
  const [group,setGroup] = useState(()=>{
    if (!profile?.board) return ''
    return Object.keys(BOARD_GROUPS).find(g=>BOARD_GROUPS[g].includes(profile.board))||''
  })
  const [board,setBoard] = useState(profile?.board||'')
  const [subject,setSubject] = useState(profile?.subject||'')
  const boards = group ? BOARD_GROUPS[group] : []
  const subjects = board ? BOARDS[board]||[] : []
  const sel = { width:'100%', padding:'10px 12px', borderRadius:8, border:`1px solid ${t.border}`, background:t.card2, color:t.text, fontSize:14, appearance:'none' }

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.82)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:20}}>
      <div style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:14,padding:26,width:'100%',maxWidth:420}} className="fu">
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:17,fontWeight:800,color:t.text}}>Change Subject</div>
          <button onClick={onClose} style={{background:'none',border:'none',color:t.muted,fontSize:20,padding:0,lineHeight:1}}>✕</button>
        </div>
        <div style={{marginBottom:14}}>
          <label style={{fontSize:11,color:t.muted,fontWeight:600,display:'block',marginBottom:6,textTransform:'uppercase',letterSpacing:0.5}}>Category</label>
          <select value={group} onChange={e=>{setGroup(e.target.value);setBoard('');setSubject('')}} style={sel}>
            <option value=''>Select category…</option>
            {Object.keys(BOARD_GROUPS).map(g=><option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        {group&&<div style={{marginBottom:14}}>
          <label style={{fontSize:11,color:t.muted,fontWeight:600,display:'block',marginBottom:6,textTransform:'uppercase',letterSpacing:0.5}}>Course / Class</label>
          <select value={board} onChange={e=>{setBoard(e.target.value);setSubject('')}} style={sel}>
            <option value=''>Select course…</option>
            {boards.map(b=><option key={b} value={b}>{b}</option>)}
          </select>
        </div>}
        {board&&subjects.length>0&&<div style={{marginBottom:20}}>
          <label style={{fontSize:11,color:t.muted,fontWeight:600,display:'block',marginBottom:6,textTransform:'uppercase',letterSpacing:0.5}}>Subject <span style={{fontWeight:400,textTransform:'none'}}>— optional</span></label>
          <select value={subject} onChange={e=>setSubject(e.target.value)} style={sel}>
            <option value=''>All subjects</option>
            {subjects.map(s=><option key={s} value={s}>{s}</option>)}
          </select>
        </div>}
        {!group&&<div style={{height:20}}/>}
        <div style={{display:'flex',gap:8}}>
          <button onClick={onClose} style={{flex:1,padding:10,borderRadius:8,border:`1px solid ${t.border}`,background:'transparent',color:t.muted,fontSize:13}}>Cancel</button>
          <button onClick={()=>onSave(board,subject)} disabled={!board} style={{flex:2,padding:10,borderRadius:8,border:'none',background:board?'#8B5CF6':t.border,color:'#fff',fontSize:13,fontWeight:600,opacity:board?1:0.4}}>Save Changes</button>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// ── CHAT TAB (main upgraded component) ────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════
function ChatTab({ user, notes, profile, onSaveNote, weakTopics, setWeakTopics, isPremium, dark, onUpgrade, aiMode, onNewMessage, onProfileUpdate }) {
  const t = T(dark)
  const [messages,setMessages] = useState([])
  const [input,setInput] = useState('')
  const [mode,setMode] = useState('chat')
  const [typing,setTyping] = useState(false)
  const [usage,setUsage] = useState(0)
  const [attachment,setAttachment] = useState(null)
  const [urlInput,setUrlInput] = useState('')
  const [showAttach,setShowAttach] = useState(false)
  const [syllabus,setSyllabus] = useState(null)
  const [syllabusName,setSyllabusName] = useState(null)
  const [parsingSyllabus,setParsingSyllabus] = useState(false)
  const [quizTopic,setQuizTopic] = useState(null)
  const [quizScore,setQuizScore] = useState(0)
  const [quizTotal,setQuizTotal] = useState(0)
  const [quizStreak,setQuizStreak] = useState(0)
  const [currentQuiz,setCurrentQuiz] = useState(null)
  const [quizMsgId,setQuizMsgId] = useState(null)
  const [loadingNext,setLoadingNext] = useState(false)
  const [showSubjectModal,setShowSubjectModal] = useState(false)
  const [localProfile,setLocalProfile] = useState(profile)
  // Mode-specific state
  const [modeInput,setModeInput] = useState('')
  const [modeResult,setModeResult] = useState(null)
  const [modeLoading,setModeLoading] = useState(false)
  const [modeError,setModeError] = useState('')
  const [flashcards,setFlashcards] = useState([])
  const [showDeck,setShowDeck] = useState(false)
  const [sumFormat,setSumFormat] = useState('structured')
  const [expLevel,setExpLevel] = useState('intermediate')
  const [expStyle,setExpStyle] = useState('analogy')
  const [quizCount,setQuizCount] = useState(5)
  const [predLevel,setPredLevel] = useState('college')
  const [predType,setPredType] = useState('both')
  const [fcCount,setFcCount] = useState(8)

  const bottomRef = useRef(null)
  const fileRef = useRef(null)
  const syllabusRef = useRef(null)
  const modeInputRef = useRef(null)
  const userName = user.user_metadata?.name || user.email.split('@')[0]

  useEffect(()=>{ setLocalProfile(profile) },[profile])

  async function saveSubject(board, subject) {
    const updated = {...localProfile, board, subject:subject||null}
    setLocalProfile(updated)
    setShowSubjectModal(false)
    await supabase.from('profiles').update({board,subject:subject||null}).eq('user_id',user.id)
    if (onProfileUpdate) onProfileUpdate(updated)
  }

  useEffect(()=>{
    supabase.from('usage').select('count').eq('user_id',user.id).eq('date',today()).single().then(({data})=>{ if(data) setUsage(data.count) })
  },[])

  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:'smooth'}) },[messages,typing,currentQuiz,modeResult,flashcards])

  // Reset mode state when switching modes
  useEffect(()=>{
    setModeInput(''); setModeResult(null); setModeError(''); setFlashcards([]); setShowDeck(false)
    setTimeout(()=>modeInputRef.current?.focus(), 100)
  },[mode])

  async function trackUsage() {
    const { data } = await supabase.from('usage').select('count').eq('user_id',user.id).eq('date',today()).single()
    if (data) { await supabase.from('usage').update({count:data.count+1}).eq('user_id',user.id).eq('date',today()); setUsage(v=>v+1) }
    else { await supabase.from('usage').insert({user_id:user.id,date:today(),count:1}); setUsage(1) }
  }

  function handleFile(e) {
    const file = e.target.files[0]; if (!file) return
    if (file.type.startsWith('image/')) {
      const r = new FileReader()
      r.onload = ev => setAttachment({type:'image',data:ev.target.result,preview:file.name})
      r.readAsDataURL(file)
    } else alert('Only image files supported.')
    setShowAttach(false)
  }

  async function handleSyllabusPDF(e) {
    const file = e.target.files[0]; if (!file) return
    if (!file.name.endsWith('.pdf')) { alert('Please upload a PDF file.'); return }
    setParsingSyllabus(true); setShowAttach(false)
    try {
      const reader = new FileReader()
      reader.onload = async ev => {
        try {
          const arr = new Uint8Array(ev.target.result); let text=''
          for (let i=0;i<arr.length;i++) { const ch=arr[i]; if(ch>=32&&ch<=126) text+=String.fromCharCode(ch); else if(ch===10||ch===13) text+=' ' }
          text = text.replace(/\s+/g,' ').trim()
          if (text.length<80) { alert('Could not extract text. Use a text-based PDF.'); setParsingSyllabus(false); return }
          const res = await fetch('/api/parse-pdf',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text})})
          const data = await res.json()
          if (data.syllabus) { setSyllabus(data.syllabus); setSyllabusName(file.name) }
          else alert('Could not parse. Try a different PDF.')
        } catch(err) { alert('PDF error: '+err.message) }
        setParsingSyllabus(false)
      }
      reader.readAsArrayBuffer(file)
    } catch(err) { alert('Error reading file.'); setParsingSyllabus(false) }
  }

  function addUrl() { if (!urlInput.trim()) return; setAttachment({type:'url',data:urlInput.trim(),preview:urlInput.trim()}); setUrlInput(''); setShowAttach(false) }

  // ── System prompts ──────────────────────────────────────────────────────
  const RULES = `
STRICT RULES:
1. Greetings (hi/hello/hey) → reply warmly in 1-2 sentences ONLY. No study content.
2. Casual questions → answer briefly and naturally.
3. Only give deep study content when explicitly asked.
4. Never start with "Sure!", "Of course!", "Certainly!". Be direct.
5. Never repeat the question back. Match response length to question complexity.`

  function buildSystem(forMode) {
    const m = forMode || mode
    if (aiMode==='general') return 'You are Memora, a helpful and friendly AI assistant.' + RULES
    let sys = 'You are Memora, an elite AI study assistant for Indian students. You have deep expertise in the Indian education system.'
    if (localProfile?.board) sys += ` Student course: ${localProfile.board}.`
    if (localProfile?.subject) sys += ` Subject focus: ${localProfile.subject}.`
    if (syllabus) sys += `\n\nSyllabus uploaded:\n${syllabus}\nALWAYS reference only these units when answering.`
    if (notes.length>0) sys += `\n\nStudent notes:\n${notes.map(n=>`[${n.tag}] ${n.title}: ${n.body}`).join('\n')}`
    if (weakTopics.length>0) sys += `\n\nStudent weak topics (give extra attention): ${weakTopics.join(', ')}`

    if (m==='summarize') sys += `\n\nYou are a MASTER SUMMARIZER. When asked to summarize:
- Use ## headings for each major section/unit
- Use bullet points with **bold key terms**
- Include "Key Takeaways" section at end
- Cover ALL important points comprehensively
- Use > blockquotes for crucial definitions`

    if (m==='explain') sys += `\n\nYou are a WORLD-CLASS EXPERT TEACHER. When explaining a concept:
1. Start with a one-line core definition
2. Build understanding layer by layer — simple → complex
3. Use powerful real-world analogies and examples
4. Break down the mechanism step by step with numbered lists
5. Cover real-world applications
6. Flag common misconceptions
7. End with a "Key Insight" that crystallizes understanding
Be thorough, precise, and memorable.`

    if (m==='quiz') sys += `\n\nGenerate EXACTLY 1 high-quality MCQ. Format strictly:
QUESTION: [clear, precise question — not trivial]
A) [option]
B) [option]
C) [option]
D) [option]
ANSWER: [A/B/C/D]
EXPLANATION: [1-2 sentence explanation of why the answer is correct and why others are wrong]
Make questions test deep understanding, not just memorization.`

    if (m==='flashcard') sys += `\n\nGenerate flashcard pairs in EXACT format:
TERM: [concise key term, concept, or question]
DEF: [clear, complete definition — 1-3 sentences]
---
TERM: [next term]
DEF: [definition]
---
Make terms memorable and definitions precise. Cover the most important concepts.`

    if (m==='predict') sys += `\n\nYou are an EXPERT EXAM STRATEGIST with years of experience analyzing Indian exam patterns. 
When predicting exam questions:
- Mark each as [HIGH], [MEDIUM], or [LOW] probability
- Give reasoning for each prediction
- Group by topic/unit
- Include short-answer AND long-answer predictions
- Add strategic preparation advice at the end
Base predictions on NCERT focus areas, previous year patterns, and weightage.`

    return sys + RULES
  }

  // ── Mode-specific AI calls ──────────────────────────────────────────────
  async function runMode() {
    if (!modeInput.trim() || modeLoading) return
    if ((usage>=(isPremium?9999:FREE_LIMIT))) { onUpgrade(); return }
    setModeLoading(true); setModeResult(null); setModeError(''); setFlashcards([]); setShowDeck(false)

    try {
      await trackUsage()
      let prompt = ''
      const board = localProfile?.board||''
      const subj = localProfile?.subject||''
      const ctx = [board,subj].filter(Boolean).join(' · ')

      if (mode==='summarize') {
        const fmtMap = {
          structured:'Give a comprehensive structured summary with ## section headings, bullet points for key points, and a Key Takeaways section.',
          brief:'Give a crisp executive summary in 5-8 bullet points covering only the most critical points.',
          detailed:'Give a very detailed, paragraph-based summary covering all nuances, examples, and sub-topics.',
          study:'Format as study notes: headings, sub-headings, key definitions in bold, important dates/formulas highlighted.',
        }
        prompt = `${ctx ? `Context: ${ctx}\n` : ''}Task: ${fmtMap[sumFormat]}\n\nContent to summarize:\n${modeInput}`
      }
      else if (mode==='explain') {
        const levelMap = { beginner:'a complete beginner (use simple language, no jargon)', intermediate:'an intermediate student (some background assumed)', advanced:'an advanced student (full technical depth)' }
        const styleMap = { analogy:'Use powerful real-world analogies to make it intuitive.', technical:'Give a rigorous technical explanation with precise terminology.', stepbystep:'Break it into numbered steps building from basics to advanced.' }
        prompt = `${ctx ? `Context: ${ctx}\n` : ''}Explain "${modeInput}" for ${levelMap[expLevel]}. ${styleMap[expStyle]}\n\nCover: definition, mechanism, examples, applications, and key insights.`
      }
      else if (mode==='flashcard') {
        prompt = `${ctx ? `Context: ${ctx}\n` : ''}Generate ${fcCount} high-quality flashcards for: "${modeInput}"\n\nCover the most important terms, concepts, formulas, and key ideas. Use the exact TERM: / DEF: / --- format.`
      }
      else if (mode==='predict') {
        const levelMap = { school:'school board', college:'college/university', competitive:'competitive exam (JEE/NEET/UPSC)', professional:'professional certification' }
        const typeMap = { questions:'exam questions only', topics:'key topics and weightage only', both:'both key topics AND likely exam questions' }
        prompt = `${ctx ? `Context: ${ctx}\n` : ''}Predict ${typeMap[predType]} for a ${levelMap[predLevel]} level exam on: "${modeInput}"\n\nInclude probability ratings, reasoning, and exam strategy.`
      }

      const reply = await callAI([{role:'user',content:prompt}], buildSystem(), null, null)

      if (mode==='flashcard') {
        const parsed = parseFlashcards(reply)
        if (parsed.length > 0) { setFlashcards(parsed); setShowDeck(true) }
        else { setModeResult(reply) }
      } else {
        setModeResult(reply)
        // Save to notes
        const titleMap = { summarize:`Summary: ${modeInput.slice(0,50)}`, explain:`Explanation: ${modeInput.slice(0,50)}`, predict:`Predictions: ${modeInput.slice(0,50)}` }
        if (onSaveNote && reply.length > 200) {
          // Auto-offer save - just set prefill
        }
      }
    } catch(e) {
      setModeError(e.message==='RATE_LIMIT' ? '⏳ AI is on a short break. Please wait 1-2 minutes and try again.' : 'Something went wrong. Please try again.')
    }
    setModeLoading(false)
  }

  // ── Chat send ───────────────────────────────────────────────────────────
  const limitHit = usage>=(isPremium?9999:FREE_LIMIT)

  async function send() {
    const query = input.trim()
    if (!query||typing) return
    if (limitHit) { onUpgrade(); return }
    setInput('')
    const attNote = attachment?.type==='url' ? ` [URL: ${attachment.data}]` : ''
    const userMsg = { id:genId(), role:'user', content:query+attNote }
    setMessages(p=>[...p,userMsg]); setTyping(true)
    supabase.from('messages').insert({user_id:user.id,role:'user',content:userMsg.content}).then(()=>{ if(onNewMessage) onNewMessage() })
    const apiMsgs = [...messages,userMsg].slice(-14).map(m=>({role:m.role==='ai'?'assistant':'user',content:m.content}))
    const img = attachment?.type==='image' ? attachment.data : null
    const url = attachment?.type==='url' ? attachment.data : null
    setAttachment(null)
    try {
      await trackUsage()
      const reply = await callAI(apiMsgs, buildSystem('chat'), img, url)
      const aiId = genId()
      const aiMsg = { id:aiId, role:'ai', content:reply }
      setMessages(p=>[...p,aiMsg])
      supabase.from('messages').insert({user_id:user.id,role:'ai',content:reply}).then(()=>{ if(onNewMessage) onNewMessage() })
      if (mode==='quiz') {
        const parsed = parseQuiz(reply)
        if (parsed) { setCurrentQuiz(parsed); setQuizMsgId(aiId); if(!quizTopic){setQuizTopic(query);setQuizScore(0);setQuizTotal(0);setQuizStreak(0)} }
      }
    } catch(e) {
      const msg = e.message==='RATE_LIMIT' ? '⏳ AI is on a short break. Please wait 1-2 minutes and try again.' : 'Something went wrong. Please try again.'
      setMessages(p=>[...p,{id:genId(),role:'ai',content:msg}])
    }
    setTyping(false)
  }

  async function onQuizAnswer(correct) {
    setQuizScore(s=>s+(correct?1:0))
    setQuizTotal(t=>t+1)
    setQuizStreak(s=>correct?s+1:0)
    if (!correct&&quizTopic&&!weakTopics.includes(quizTopic)) {
      const up=[...weakTopics,quizTopic]; setWeakTopics(up)
      supabase.from('profiles').update({weak_topics:up}).eq('user_id',user.id)
    }
  }

  async function onNextQuestion() {
    setLoadingNext(true); setCurrentQuiz(null)
    if (limitHit) { onUpgrade(); setLoadingNext(false); return }
    try {
      await trackUsage()
      const reply = await callAI([{role:'user',content:`Next quiz question on: ${quizTopic}`}], buildSystem('quiz'), null, null)
      const aiId = genId()
      setMessages(p=>[...p,{id:aiId,role:'ai',content:reply}])
      const parsed = parseQuiz(reply)
      if (parsed) { setCurrentQuiz(parsed); setQuizMsgId(aiId) }
    } catch(e) { setMessages(p=>[...p,{id:genId(),role:'ai',content:'Could not load next question.'}]) }
    setLoadingNext(false)
  }

  function endQuiz() {
    const pct = quizTotal>0 ? Math.round((quizScore/quizTotal)*100) : 0
    const summary = `**Quiz Complete!** Score: ${quizScore}/${quizTotal} (${pct}%)\n\n${pct>=80?'🌟 Excellent work!':pct>=60?'👍 Good effort — review the missed ones.':'📚 Keep studying and try again!'}`
    setMessages(p=>[...p,{id:genId(),role:'ai',content:summary}])
    setCurrentQuiz(null); setQuizTopic(null); setQuizScore(0); setQuizTotal(0); setQuizStreak(0)
  }

  const suggestions = aiMode==='general'
    ? ["What is quantum computing?","Help me write an email","Explain blockchain simply","What's the latest in AI?"]
    : ["Explain Newton's laws simply","Quiz me on Photosynthesis","Predict exam questions for Trigonometry","Explain the water cycle step by step"]

  const currentMode = studyModes.find(m=>m.id===mode)
  const isNonChatMode = mode !== 'chat'

  // ── Mode Panel for Summarize / Explain / Flashcard / Predict ────────────
  const modePlaceholders = {
    summarize: 'Paste the text, chapter, or notes you want to summarize...',
    explain: 'Enter any concept, topic, formula, or question to explain...',
    flashcard: 'Enter a topic or paste notes to generate flashcards...',
    predict: 'Enter your subject, topic, or paste syllabus content...',
    quiz: 'Enter a topic to start the quiz in chat...',
  }

  const modeConfigs = {
    summarize: (
      <div style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'center'}}>
        <span style={{fontSize:12,color:t.muted}}>Format:</span>
        {[['structured','Structured'],['brief','Brief'],['detailed','Detailed'],['study','Study Notes']].map(([v,l])=>(
          <button key={v} onClick={()=>setSumFormat(v)} style={{padding:'4px 12px',borderRadius:20,border:`1px solid ${sumFormat===v?'#0EA5E9':t.border}`,background:sumFormat===v?'rgba(14,165,233,0.1)':'transparent',color:sumFormat===v?'#0EA5E9':t.muted,fontSize:12,fontWeight:sumFormat===v?600:400}}>{l}</button>
        ))}
      </div>
    ),
    explain: (
      <div style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'center'}}>
        <select value={expLevel} onChange={e=>setExpLevel(e.target.value)} style={{padding:'5px 10px',borderRadius:8,border:`1px solid ${t.border}`,background:t.card2,color:t.muted,fontSize:12,appearance:'none'}}>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
        {[['analogy','Analogies'],['technical','Technical'],['stepbystep','Step-by-step']].map(([v,l])=>(
          <button key={v} onClick={()=>setExpStyle(v)} style={{padding:'4px 12px',borderRadius:20,border:`1px solid ${expStyle===v?'#F59E0B':t.border}`,background:expStyle===v?'rgba(245,158,11,0.1)':'transparent',color:expStyle===v?'#F59E0B':t.muted,fontSize:12,fontWeight:expStyle===v?600:400}}>{l}</button>
        ))}
      </div>
    ),
    flashcard: (
      <div style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'center'}}>
        <span style={{fontSize:12,color:t.muted}}>Cards:</span>
        {[5,8,12,16].map(n=>(
          <button key={n} onClick={()=>setFcCount(n)} style={{padding:'4px 12px',borderRadius:20,border:`1px solid ${fcCount===n?'#EC4899':t.border}`,background:fcCount===n?'rgba(236,72,153,0.1)':'transparent',color:fcCount===n?'#EC4899':t.muted,fontSize:12,fontWeight:fcCount===n?600:400}}>{n}</button>
        ))}
      </div>
    ),
    predict: (
      <div style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'center'}}>
        <select value={predLevel} onChange={e=>setPredLevel(e.target.value)} style={{padding:'5px 10px',borderRadius:8,border:`1px solid ${t.border}`,background:t.card2,color:t.muted,fontSize:12,appearance:'none'}}>
          <option value="school">School Board</option>
          <option value="college">College / University</option>
          <option value="competitive">JEE / NEET / UPSC</option>
          <option value="professional">Professional Cert</option>
        </select>
        {[['both','Questions + Topics'],['questions','Questions Only'],['topics','Topics Only']].map(([v,l])=>(
          <button key={v} onClick={()=>setPredType(v)} style={{padding:'4px 12px',borderRadius:20,border:`1px solid ${predType===v?'#EF4444':t.border}`,background:predType===v?'rgba(239,68,68,0.1)':'transparent',color:predType===v?'#EF4444':t.muted,fontSize:12,fontWeight:predType===v?600:400}}>{l}</button>
        ))}
      </div>
    ),
  }

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100%',overflow:'hidden',background:t.bg}}>

      {/* Subject bar */}
      {aiMode==='study'&&(
        <div style={{padding:'7px 20px',borderBottom:`1px solid ${t.border}`,background:t.sidebar,display:'flex',alignItems:'center',gap:8,flexShrink:0}}>
          <span style={{fontSize:12,color:t.muted}}>📚</span>
          <span style={{fontSize:12,color:t.muted,flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
            {localProfile?.board ? <><span style={{color:t.text,fontWeight:500}}>{localProfile.board}</span>{localProfile?.subject&&<span style={{color:t.muted}}> · {localProfile.subject}</span>}</> : 'No course selected'}
          </span>
          <button onClick={()=>setShowSubjectModal(true)} style={{fontSize:11,color:'#8B5CF6',background:'rgba(139,92,246,0.08)',border:'1px solid rgba(139,92,246,0.2)',borderRadius:6,padding:'3px 10px',fontWeight:600,flexShrink:0,whiteSpace:'nowrap'}}>Change ✏️</button>
        </div>
      )}

      {/* Syllabus badge */}
      {(syllabus||parsingSyllabus)&&(
        <div style={{padding:'8px 20px',borderBottom:`1px solid ${t.border}`,background:t.surface,display:'flex',alignItems:'center',gap:8,flexShrink:0}}>
          {parsingSyllabus
            ? <span style={{fontSize:12,color:t.muted,animation:'pulse 1.5s infinite'}}>⏳ Parsing syllabus PDF…</span>
            : <><span style={{fontSize:12,color:t.green}}>✓ Syllabus loaded:</span><span style={{fontSize:12,color:t.muted}}>{syllabusName}</span><button onClick={()=>{setSyllabus(null);setSyllabusName(null)}} style={{background:'none',border:'none',color:t.red,fontSize:12,padding:0,marginLeft:4}}>✕</button></>
          }
        </div>
      )}

      {/* ── NON-CHAT MODE PANEL ─────────────────────────────────────────── */}
      {isNonChatMode && mode !== 'quiz' ? (
        <div style={{flex:1,overflowY:'auto',display:'flex',flexDirection:'column'}}>

          {/* Mode header */}
          <div style={{padding:'16px 20px 12px',borderBottom:`1px solid ${t.border}`,flexShrink:0,overflowX:'hidden'}}>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
              <span style={{fontSize:18}}>{currentMode.label.split(' ')[0]}</span>
              <div>
                <div style={{fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:800,color:t.text}}>{currentMode.label.split(' ').slice(1).join(' ')}</div>
                <div style={{fontSize:12,color:t.muted}}>{currentMode.desc}</div>
              </div>
              <div style={{marginLeft:'auto',fontSize:12,color:t.muted}}>
                {!isPremium&&<span style={{color:usage>=(FREE_LIMIT-3)?t.red:t.muted}}>{FREE_LIMIT-usage} left</span>}
              </div>
            </div>

            {/* Mode-specific options */}
            {modeConfigs[mode]&&<div style={{marginBottom:0}}>{modeConfigs[mode]}</div>}
          </div>

          {/* Input area */}
          <div style={{padding:'12px 20px',borderBottom:`1px solid ${t.border}`,flexShrink:0,background:t.bg}}>
            <textarea
              ref={modeInputRef}
              value={modeInput}
              onChange={e=>setModeInput(e.target.value)}
              placeholder={modePlaceholders[mode]}
              rows={mode==='flashcard'||mode==='predict'?3:5}
              onKeyDown={e=>{ if(e.key==='Enter'&&e.ctrlKey) runMode() }}
              style={{width:'100%',padding:'12px 14px',borderRadius:10,border:`1px solid ${t.border}`,background:t.card,color:t.text,fontSize:14,resize:'vertical',lineHeight:1.6,maxHeight:200}}
            />
            <div style={{display:'flex',alignItems:'center',gap:8,marginTop:8}}>
              <button onClick={()=>setModeInput('')} style={{padding:'8px 14px',borderRadius:8,border:`1px solid ${t.border}`,background:'transparent',color:t.muted,fontSize:13}}>Clear</button>
              <div style={{flex:1}}/>
              <span style={{fontSize:11,color:t.muted}}>Ctrl+Enter to run</span>
              <button
                onClick={runMode}
                disabled={!modeInput.trim()||modeLoading||limitHit}
                style={{padding:'9px 20px',borderRadius:8,border:'none',background:(!modeInput.trim()||modeLoading||limitHit)?t.border:currentMode.color,color:'#fff',fontSize:14,fontWeight:600,opacity:(!modeInput.trim()||modeLoading||limitHit)?0.4:1,minWidth:100}}
              >
                {modeLoading ? <span style={{display:'flex',alignItems:'center',gap:6}}><span style={{width:14,height:14,border:'2px solid rgba(255,255,255,0.3)',borderTop:'2px solid #fff',borderRadius:'50%',display:'inline-block',animation:'spin 0.6s linear infinite'}}/> Working…</span> : currentMode.label.split(' ')[0]+' Generate'}
              </button>
            </div>
          </div>

          {/* Output area */}
          <div style={{flex:1,overflowY:'auto',padding:'16px 20px'}}>
            {modeLoading&&(
              <div className="fu">
                <div style={{fontSize:12,color:t.muted,marginBottom:12,display:'flex',alignItems:'center',gap:6}}>
                  <span style={{width:12,height:12,border:`2px solid ${t.border}`,borderTop:`2px solid ${currentMode.color}`,borderRadius:'50%',display:'inline-block',animation:'spin 0.6s linear infinite'}}/>
                  Generating {mode==='flashcard'?'flashcards':mode==='predict'?'predictions':mode==='summarize'?'summary':'explanation'}…
                </div>
                <div style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:12,padding:20}}>
                  <Skeleton dark={dark} lines={6}/>
                </div>
              </div>
            )}

            {modeError&&!modeLoading&&(
              <div style={{padding:'12px 16px',borderRadius:10,background:'rgba(220,38,38,0.07)',border:'1px solid rgba(220,38,38,0.2)',color:t.red,fontSize:14}} className="fu">
                {modeError}
              </div>
            )}

            {/* Flashcard deck */}
            {mode==='flashcard'&&showDeck&&flashcards.length>0&&!modeLoading&&(
              <div className="fu">
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
                  <div style={{fontSize:14,fontWeight:600,color:t.text}}>{flashcards.length} flashcards generated</div>
                  <button onClick={()=>onSaveNote&&onSaveNote(flashcards.map(c=>`**${c.term}**\n${c.def}`).join('\n\n'))} style={{fontSize:12,color:t.accent,background:'none',border:`1px solid ${t.accentBorder}`,borderRadius:6,padding:'3px 10px'}}>+ Save All</button>
                </div>
                <FlashcardDeck cards={flashcards} dark={dark}/>
              </div>
            )}

            {/* Text results (Summarize / Explain / Predict) */}
            {modeResult&&!modeLoading&&mode!=='flashcard'&&(
              <div className="fu">
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
                  <div style={{fontSize:12,color:t.muted}}>Result for: <span style={{color:t.text,fontWeight:500}}>{modeInput.slice(0,60)}{modeInput.length>60?'…':''}</span></div>
                  <div style={{display:'flex',gap:6}}>
                    <button onClick={()=>onSaveNote&&onSaveNote(modeResult)} style={{fontSize:12,color:t.accent,background:'none',border:`1px solid ${t.accentBorder}`,borderRadius:6,padding:'3px 10px'}}>+ Save Note</button>
                    <button onClick={()=>{setModeResult(null);setModeInput('')}} style={{fontSize:12,color:t.muted,background:'none',border:`1px solid ${t.border}`,borderRadius:6,padding:'3px 10px'}}>Clear</button>
                  </div>
                </div>
                <div style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:12,padding:'18px 20px'}}>
                  <MD content={modeResult} dark={dark}/>
                </div>
              </div>
            )}

            {!modeLoading&&!modeResult&&!modeError&&!showDeck&&(
              <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'40px 20px',textAlign:'center',opacity:0.6}}>
                <div style={{fontSize:36,marginBottom:12}}>{currentMode.label.split(' ')[0]}</div>
                <div style={{fontSize:14,color:t.muted}}>{
                  mode==='summarize'?'Paste any text above and get a deep, structured summary.' :
                  mode==='explain'?'Enter any concept and get an expert-level explanation.' :
                  mode==='flashcard'?'Enter a topic to generate a flip-card study deck.' :
                  'Enter your subject to get exam predictions with confidence ratings.'
                }</div>
              </div>
            )}

            <div ref={bottomRef}/>
          </div>
        </div>
      ) : (
        /* ── CHAT MODE (and quiz mode) ─────────────────────────────────── */
        <>
          <div style={{flex:1,overflowY:'auto',padding:'24px 0'}}>
            {messages.length===0&&(
              <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100%',padding:'0 20px',textAlign:'center'}} className="fu">
                <div style={{fontSize:32,marginBottom:16}}>🧠</div>
                <div style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:800,color:t.text,marginBottom:8}}>Hi, {userName.split(' ')[0]}!</div>
                <div style={{fontSize:15,color:t.muted,marginBottom:32,maxWidth:400}}>
                  {mode==='quiz'
                    ? 'Tell me a topic to quiz you on — I\'ll generate questions one by one with instant feedback.'
                    : aiMode==='study'
                      ? 'Ask anything from your syllabus. I\'ll explain, summarize, quiz you, or predict exam questions.'
                      : 'Ask me anything — I\'m here to help.'}
                </div>
                <div style={{display:'flex',flexWrap:'wrap',gap:8,justifyContent:'center',maxWidth:560}}>
                  {suggestions.map((s,i)=>(
                    <button key={i} onClick={()=>setInput(s)} style={{padding:'8px 16px',borderRadius:20,border:`1px solid ${t.border}`,background:t.card,color:t.muted,fontSize:13,fontWeight:500,transition:'border-color 0.15s'}}
                      onMouseEnter={e=>e.target.style.borderColor='#8B5CF6'}
                      onMouseLeave={e=>e.target.style.borderColor=t.border}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map(m=>(
              <div key={m.id} className="msg" style={{display:'flex',flexDirection:m.role==='user'?'row-reverse':'row',gap:8,padding:'6px 16px',maxWidth:760,margin:'0 auto',width:'100%',alignItems:'flex-start'}}>
                {m.role==='ai'&&<div style={{width:32,height:32,borderRadius:6,background:'#8B5CF6',display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,flexShrink:0,marginTop:2}}>🧠</div>}
                {m.role==='user'&&<div style={{width:32,height:32,borderRadius:6,background:t.card2,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,flexShrink:0,color:t.text,marginTop:2,border:`1px solid ${t.border}`}}>{userName.slice(0,1).toUpperCase()}</div>}
                <div style={{flex:1,maxWidth:'calc(100% - 44px)',display:'flex',flexDirection:'column',alignItems:m.role==='user'?'flex-end':'flex-start'}}>
                  {m.role==='user' ? (
                    <div style={{padding:'10px 16px',borderRadius:12,background:t.userBubble,color:t.text,fontSize:15,lineHeight:1.6,maxWidth:'85%'}}>{m.content}</div>
                  ) : (
                    <>
                      {!(m.role==='ai'&&m.id===quizMsgId&&currentQuiz)&&(
                        <div style={{fontSize:15,color:t.text,lineHeight:1.75,width:'100%'}}>
                          <MD content={m.content} dark={dark}/>
                        </div>
                      )}
                      {m.role==='ai'&&m.id===quizMsgId&&currentQuiz&&(
                        <QuizCard quiz={currentQuiz} onAnswer={onQuizAnswer} onNext={onNextQuestion} onEnd={endQuiz} score={quizScore} total={quizTotal} streak={quizStreak} dark={dark}/>
                      )}
                      <button onClick={()=>onSaveNote(m.content)} style={{fontSize:12,color:t.muted,background:'none',border:'none',padding:'5px 0 0',cursor:'pointer',textAlign:'left',marginTop:2}}
                        onMouseEnter={e=>e.target.style.color=t.accent}
                        onMouseLeave={e=>e.target.style.color=t.muted}>
                        + Save as note
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}

            {(typing||loadingNext)&&(
              <div style={{display:'flex',gap:12,padding:'6px 20px',maxWidth:760,margin:'0 auto',width:'100%',alignItems:'flex-start'}}>
                <div style={{width:32,height:32,borderRadius:6,background:'#8B5CF6',display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,flexShrink:0}}>🧠</div>
                <div style={{padding:'12px 16px',display:'flex',gap:5,alignItems:'center',marginTop:2}}>
                  {[0,1,2].map(i=><span key={i} style={{width:7,height:7,borderRadius:'50%',background:t.muted,display:'inline-block',animation:'bounce 1.1s ease infinite',animationDelay:i*0.18+'s'}}/>)}
                </div>
              </div>
            )}
            <div ref={bottomRef}/>
          </div>

          {/* Attachment preview */}
          {attachment&&(
            <div style={{padding:'6px 20px',borderTop:`1px solid ${t.border}`,background:t.surface,display:'flex',alignItems:'center',gap:8,flexShrink:0}}>
              <span style={{fontSize:13,color:t.accent}}>📎 {attachment.type==='image'?'Image':'URL'}: {attachment.preview.slice(0,60)}</span>
              <button onClick={()=>setAttachment(null)} style={{background:'none',border:'none',color:t.red,fontSize:15,padding:0}}>✕</button>
            </div>
          )}

          {/* Attach panel */}
          {showAttach&&(
            <div style={{padding:'12px 20px',borderTop:`1px solid ${t.border}`,background:t.surface,flexShrink:0}}>
              <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
                <input value={urlInput} onChange={e=>setUrlInput(e.target.value)} placeholder="Paste a URL…" style={{flex:1,minWidth:160,padding:'9px 12px',borderRadius:8,border:`1px solid ${t.border}`,background:t.card,color:t.text,fontSize:13}} onKeyDown={e=>e.key==='Enter'&&addUrl()}/>
                <button onClick={addUrl} style={{padding:'9px 14px',borderRadius:8,border:'none',background:t.accent,color:'#fff',fontSize:12,fontWeight:600}}>Add</button>
                <button onClick={()=>fileRef.current.click()} style={{padding:'9px 14px',borderRadius:8,border:`1px solid ${t.border}`,background:'transparent',color:t.muted,fontSize:12}}>📷 Image</button>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{display:'none'}}/>
                <button onClick={()=>syllabusRef.current.click()} style={{padding:'9px 14px',borderRadius:8,border:`1px solid ${t.green}50`,background:`${t.green}10`,color:t.green,fontSize:12,fontWeight:500}}>📋 Syllabus PDF</button>
                <input ref={syllabusRef} type="file" accept=".pdf" onChange={handleSyllabusPDF} style={{display:'none'}}/>
                <button onClick={()=>setShowAttach(false)} style={{background:'none',border:'none',color:t.muted,fontSize:20,padding:0,lineHeight:1}}>✕</button>
              </div>
            </div>
          )}

          {/* Input area */}
          <div style={{padding:'8px 16px 16px',borderTop:`1px solid ${t.border}`,background:t.bg,flexShrink:0}}>
            {limitHit&&(
              <div style={{fontSize:13,color:t.red,background:'rgba(220,38,38,0.07)',border:'1px solid rgba(220,38,38,0.2)',borderRadius:8,padding:'9px 16px',marginBottom:10,textAlign:'center',cursor:'pointer'}} onClick={onUpgrade}>
                Daily limit reached. <span style={{textDecoration:'underline',fontWeight:700}}>Upgrade to Premium ⭐</span>
              </div>
            )}

            {/* Mode pills */}
            {aiMode==='study'&&(
              <div className="mode-pills" style={{display:'flex',gap:5,marginBottom:10,flexWrap:'wrap',overflowX:'auto',paddingBottom:2}}>
                {studyModes.map(m=>(
                  <button key={m.id} onClick={()=>setMode(m.id)} className="mode-pill" style={{padding:'5px 12px',borderRadius:20,border:`1px solid ${mode===m.id?m.color:t.border}`,background:mode===m.id?`${m.color}18`:'transparent',color:mode===m.id?m.color:t.muted,fontSize:12,fontWeight:mode===m.id?600:400,transition:'all 0.15s',whiteSpace:'nowrap',flexShrink:0}}>
                    {m.label}
                  </button>
                ))}
              </div>
            )}

            <div className="chat-input-row" style={{display:'flex',gap:8,alignItems:'flex-end',background:t.card,border:`1px solid ${t.border}`,borderRadius:12,padding:'8px 8px 8px 12px'}}>
              <button onClick={()=>setShowAttach(!showAttach)} style={{padding:'6px 8px',borderRadius:6,border:'none',background:'transparent',color:showAttach?t.accent:t.muted,fontSize:18,flexShrink:0,lineHeight:1,minWidth:36,minHeight:36}}>📎</button>
              <textarea
                value={input}
                onChange={e=>setInput(e.target.value)}
                onKeyDown={e=>{ if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send()} }}
                placeholder={mode==='quiz'?'Enter a topic to quiz on…':aiMode==='general'?'Ask me anything…':'Ask anything…'}
                disabled={limitHit}
                rows={1}
                style={{flex:1,padding:'6px 0',border:'none',background:'transparent',color:t.text,fontSize:15,resize:'none',maxHeight:120,lineHeight:1.6}}
                onInput={e=>{e.target.style.height='auto';e.target.style.height=Math.min(e.target.scrollHeight,120)+'px'}}
              />
              <button onClick={send} disabled={typing||!input.trim()||limitHit} style={{padding:'8px 14px',borderRadius:8,border:'none',background:(typing||!input.trim()||limitHit)?t.card2:'#8B5CF6',color:(typing||!input.trim()||limitHit)?t.muted:'#fff',fontSize:16,fontWeight:700,flexShrink:0,opacity:(typing||!input.trim()||limitHit)?0.5:1,minWidth:42,minHeight:42}}>↑</button>
            </div>
            <div style={{fontSize:11,color:t.muted,marginTop:5,textAlign:'center'}}>Enter to send · Shift+Enter for new line</div>
          </div>
        </>
      )}

      {showSubjectModal&&<SubjectModal profile={localProfile} onClose={()=>setShowSubjectModal(false)} onSave={saveSubject} dark={dark}/>}
    </div>
  )
}

// ── Conversation View (read-only history) ──────────────────────────────────
function ConversationView({ conversation, dark, onBack }) {
  const t = T(dark)
  const bottomRef = useRef(null)
  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:'instant'}) },[conversation])

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100%',overflow:'hidden',background:t.bg}}>
      <div style={{padding:'14px 20px',borderBottom:`1px solid ${t.border}`,display:'flex',alignItems:'center',gap:12,flexShrink:0,background:t.bg}}>
        <button onClick={onBack} style={{padding:'6px 10px',borderRadius:7,border:`1px solid ${t.border}`,background:'transparent',color:t.muted,fontSize:13,fontWeight:500}}>← Back</button>
        <div style={{flex:1,overflow:'hidden'}}>
          <div style={{fontWeight:600,fontSize:14,color:t.text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{conversation.title}</div>
          <div style={{fontSize:11,color:t.muted}}>{new Date(conversation.date).toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'})}</div>
        </div>
        <div style={{fontSize:11,color:t.muted,background:t.card,border:`1px solid ${t.border}`,borderRadius:20,padding:'3px 10px'}}>{conversation.messages.length} msgs</div>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'24px 0'}}>
        {conversation.messages.map((m,i)=>(
          <div key={i} className="msg" style={{display:'flex',flexDirection:m.role==='user'?'row-reverse':'row',gap:8,padding:'6px 16px',maxWidth:760,margin:'0 auto',width:'100%',alignItems:'flex-start'}}>
            {m.role==='ai'&&<div style={{width:32,height:32,borderRadius:6,background:'#8B5CF6',display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,flexShrink:0,marginTop:2}}>🧠</div>}
            {m.role==='user'&&<div style={{width:32,height:32,borderRadius:6,background:t.card2,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,flexShrink:0,color:t.text,marginTop:2,border:`1px solid ${t.border}`}}>U</div>}
            <div style={{flex:1,maxWidth:'calc(100% - 44px)',display:'flex',flexDirection:'column',alignItems:m.role==='user'?'flex-end':'flex-start'}}>
              {m.role==='user'
                ? <div style={{padding:'10px 16px',borderRadius:12,background:t.userBubble,color:t.text,fontSize:15,lineHeight:1.6,maxWidth:'85%'}}>{m.content}</div>
                : <div style={{fontSize:15,color:t.text,lineHeight:1.75,width:'100%'}}><MD content={m.content} dark={dark}/></div>
              }
            </div>
          </div>
        ))}
        <div ref={bottomRef}/>
      </div>
    </div>
  )
}

// ── Notes Tab ──────────────────────────────────────────────────────────────
function NotesTab({ user, notes, setNotes, prefill, clearPrefill, dark }) {
  const t = T(dark)
  const [filter,setFilter] = useState('')
  const [showModal,setShowModal] = useState(false)
  const [form,setForm] = useState({title:'',body:'',tag:''})
  const [loading,setLoading] = useState(true)
  const [expanded,setExpanded] = useState(null)

  useEffect(()=>{ supabase.from('notes').select('*').eq('user_id',user.id).order('created_at',{ascending:false}).then(({data})=>{ if(data) setNotes(data); setLoading(false) }) },[])
  useEffect(()=>{ if(prefill){ setForm({title:'AI Response',body:prefill.slice(0,900),tag:'ai'}); setShowModal(true); clearPrefill() } },[prefill])

  async function save() {
    if (!form.title.trim()||!form.body.trim()) return
    const { data, error } = await supabase.from('notes').insert({user_id:user.id,title:form.title.trim(),body:form.body.trim(),tag:form.tag.trim()||'general'}).select().single()
    if (!error&&data) { setNotes(p=>[data,...p]); setShowModal(false); setForm({title:'',body:'',tag:''}) }
  }

  async function del(id) { await supabase.from('notes').delete().eq('id',id); setNotes(p=>p.filter(n=>n.id!==id)) }

  const filtered = filter.trim() ? notes.filter(n=>n.title.toLowerCase().includes(filter.toLowerCase())||n.body.toLowerCase().includes(filter.toLowerCase())) : notes
  const fld = { width:'100%', padding:'10px 12px', borderRadius:8, border:`1px solid ${t.border}`, background:t.card2, color:t.text, fontSize:13 }

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100%',overflow:'hidden',background:t.bg}}>
      <div style={{padding:'14px 20px',borderBottom:`1px solid ${t.border}`,flexShrink:0,display:'flex',gap:8,background:t.bg}}>
        <input value={filter} onChange={e=>setFilter(e.target.value)} placeholder="Search notes…" style={{...fld,flex:1,padding:'9px 12px'}}/>
        <button onClick={()=>{setForm({title:'',body:'',tag:''});setShowModal(true)}} style={{padding:'9px 18px',borderRadius:8,border:'none',background:'#8B5CF6',color:'#fff',fontSize:13,fontWeight:600,whiteSpace:'nowrap',flexShrink:0}}>＋ New Note</button>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'16px 20px'}}>
        {loading&&<div style={{textAlign:'center',padding:40,color:t.muted,animation:'pulse 1.5s infinite'}}>Loading…</div>}
        {!loading&&filtered.length===0&&<div style={{textAlign:'center',padding:'60px 20px',color:t.muted}}><div style={{fontSize:34,marginBottom:10}}>📝</div><div style={{fontSize:14,fontWeight:600,color:t.text,marginBottom:4}}>No notes yet</div><div style={{fontSize:13}}>{filter?'No matching notes.':'Save AI responses or add your own notes.'}</div></div>}
        <div style={{display:'flex',flexDirection:'column',gap:10,maxWidth:720,margin:'0 auto'}}>
          {filtered.map(n=>(
            <div key={n.id} style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:10,overflow:'hidden'}}>
              <div style={{padding:'13px 16px',cursor:'pointer'}} onClick={()=>setExpanded(expanded===n.id?null:n.id)}>
                <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:8}}>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:600,fontSize:14,color:t.text,marginBottom:3}}>{n.title}</div>
                    {expanded!==n.id&&<div style={{fontSize:12,color:t.muted,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{n.body.replace(/[#*`_]/g,'').slice(0,100)}</div>}
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:6,flexShrink:0}}>
                    <span style={{fontSize:11,padding:'2px 8px',borderRadius:20,background:t.card2,color:t.muted,fontWeight:500}}>{n.tag}</span>
                    <button onClick={e=>{e.stopPropagation();del(n.id)}} style={{fontSize:12,color:t.red,background:'none',border:'none',padding:'2px 6px'}}>✕</button>
                    <span style={{color:t.muted,fontSize:11}}>{expanded===n.id?'▲':'▼'}</span>
                  </div>
                </div>
              </div>
              {expanded===n.id&&<div style={{padding:'0 16px 14px',borderTop:`1px solid ${t.border}`}}><div style={{paddingTop:12}}><MD content={n.body} dark={dark}/></div></div>}
            </div>
          ))}
        </div>
      </div>
      {showModal&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:999,padding:20}}>
          <div style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:14,padding:24,width:'100%',maxWidth:440}} className="fu">
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:17,fontWeight:800,marginBottom:18,color:t.text}}>Save Note</div>
            <div style={{marginBottom:12}}><label style={{fontSize:11,color:t.muted,display:'block',marginBottom:4,fontWeight:600,textTransform:'uppercase',letterSpacing:0.5}}>Title</label><input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Note title…" style={fld}/></div>
            <div style={{marginBottom:12}}><label style={{fontSize:11,color:t.muted,display:'block',marginBottom:4,fontWeight:600,textTransform:'uppercase',letterSpacing:0.5}}>Tag</label><input value={form.tag} onChange={e=>setForm({...form,tag:e.target.value})} placeholder="e.g. math, physics…" style={fld}/></div>
            <div style={{marginBottom:20}}><label style={{fontSize:11,color:t.muted,display:'block',marginBottom:4,fontWeight:600,textTransform:'uppercase',letterSpacing:0.5}}>Content</label><textarea value={form.body} onChange={e=>setForm({...form,body:e.target.value})} placeholder="Write your note…" rows={6} style={{...fld,resize:'vertical',fontFamily:'monospace',fontSize:12}}/></div>
            <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
              <button onClick={()=>setShowModal(false)} style={{padding:'9px 16px',borderRadius:8,border:`1px solid ${t.border}`,background:'transparent',color:t.muted,fontSize:13}}>Cancel</button>
              <button onClick={save} style={{padding:'9px 20px',borderRadius:8,border:'none',background:'#8B5CF6',color:'#fff',fontSize:13,fontWeight:600}}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Progress Tab ───────────────────────────────────────────────────────────
function ProgressTab({ user, profile, weakTopics, setWeakTopics, notes, dark, onUpgrade, isPremium }) {
  const t = T(dark)

  async function removeWeak(topic) {
    const u = weakTopics.filter(x=>x!==topic)
    setWeakTopics(u)
    await supabase.from('profiles').update({weak_topics:u}).eq('user_id',user.id)
  }

  return (
    <div style={{flex:1,overflowY:'auto',padding:'20px',background:t.bg}}>
      <div style={{maxWidth:600,margin:'0 auto'}}>

        {/* Profile card */}
        <div style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:12,padding:'16px 18px',marginBottom:12}}>
          <div style={{fontSize:11,color:t.muted,marginBottom:10,fontWeight:600,textTransform:'uppercase',letterSpacing:0.5}}>Profile</div>
          {profile?.board
            ? <><div style={{fontSize:15,fontWeight:700,marginBottom:4,color:t.text}}>{profile.board}</div>{profile.subject&&<div style={{fontSize:13,color:t.muted}}>{profile.subject}</div>}</>
            : <div style={{fontSize:13,color:t.muted}}>No board set.</div>}
        </div>

        {/* Stats */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:12}}>
          {[['📝',notes.length,'Notes Saved'],['⚠️',weakTopics.length,'Weak Topics']].map(([ic,val,label],i)=>(
            <div key={i} style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:12,padding:16,textAlign:'center'}}>
              <div style={{fontSize:22,marginBottom:6}}>{ic}</div>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:28,fontWeight:800,color:t.accent,marginBottom:2}}>{val}</div>
              <div style={{fontSize:12,color:t.muted}}>{label}</div>
            </div>
          ))}
        </div>

        {/* Weak topics */}
        <div style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:12,padding:'16px 18px',marginBottom:12}}>
          <div style={{fontSize:11,color:t.muted,marginBottom:10,fontWeight:600,textTransform:'uppercase',letterSpacing:0.5}}>Weak Topics</div>
          {weakTopics.length===0
            ? <div style={{fontSize:13,color:t.muted}}>No weak topics yet. Wrong quiz answers appear here automatically.</div>
            : <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
                {weakTopics.map(topic=>(
                  <div key={topic} style={{display:'flex',alignItems:'center',gap:6,padding:'5px 12px',borderRadius:20,background:'rgba(220,38,38,0.08)',border:'1px solid rgba(220,38,38,0.2)'}}>
                    <span style={{fontSize:13,color:t.red}}>{topic}</span>
                    <button onClick={()=>removeWeak(topic)} style={{background:'none',border:'none',color:t.red,fontSize:14,padding:0,lineHeight:1,cursor:'pointer'}}>✕</button>
                  </div>
                ))}
              </div>
          }
        </div>

        {/* Premium upsell */}
        {!isPremium&&(
          <div style={{background:t.accentBg,border:`1px solid ${t.accentBorder}`,borderRadius:12,padding:'16px 18px',cursor:'pointer'}} onClick={onUpgrade}>
            <div style={{fontSize:14,fontWeight:700,color:t.accent,marginBottom:4}}>⭐ Upgrade to Premium</div>
            <div style={{fontSize:13,color:t.muted}}>Unlimited messages, quiz questions, and all advanced features for ₹99/month.</div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── History Tab ────────────────────────────────────────────────────────────
function HistoryTab({ user, dark, onSelectConv, refresh }) {
  const t = T(dark)
  const [messages,setMessages] = useState([])
  const [loading,setLoading] = useState(true)

  useEffect(()=>{
    setLoading(true)
    supabase.from('messages').select('*').eq('user_id',user.id).order('created_at',{ascending:false}).limit(300).then(({data})=>{
      if (data) setMessages(data)
      setLoading(false)
    })
  },[refresh])

  const convos = groupConversations(messages)
  const grouped = {}
  for (const c of convos) {
    const label = getDateLabel(c.date)
    if (!grouped[label]) grouped[label] = []
    grouped[label].push(c)
  }

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100%',overflow:'hidden',background:t.bg}}>
      <div style={{padding:'14px 20px',borderBottom:`1px solid ${t.border}`,flexShrink:0}}>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:800,color:t.text}}>Chat History</div>
        <div style={{fontSize:12,color:t.muted,marginTop:2}}>{convos.length} conversations</div>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'12px 16px'}}>
        {loading&&<div style={{textAlign:'center',padding:40,color:t.muted,animation:'pulse 1.5s infinite'}}>Loading…</div>}
        {!loading&&convos.length===0&&<div style={{textAlign:'center',padding:'60px 20px',color:t.muted}}><div style={{fontSize:34,marginBottom:10}}>💬</div><div style={{fontSize:14,color:t.text,fontWeight:600,marginBottom:4}}>No history yet</div><div style={{fontSize:13}}>Start a conversation to see it here.</div></div>}
        {Object.entries(grouped).map(([label,convs])=>(
          <div key={label} style={{marginBottom:20}}>
            <div style={{fontSize:11,color:t.muted,fontWeight:600,textTransform:'uppercase',letterSpacing:0.5,marginBottom:8,padding:'0 4px'}}>{label}</div>
            <div style={{display:'flex',flexDirection:'column',gap:4}}>
              {convs.map(c=>(
                <button key={c.id} onClick={()=>onSelectConv(c)} style={{padding:'11px 14px',borderRadius:8,border:`1px solid ${t.border}`,background:t.card,color:t.text,fontSize:14,textAlign:'left',display:'flex',alignItems:'center',gap:10,cursor:'pointer',transition:'background 0.12s'}}
                  onMouseEnter={e=>e.currentTarget.style.background=t.card2}
                  onMouseLeave={e=>e.currentTarget.style.background=t.card}>
                  <span style={{fontSize:15,flexShrink:0}}>💬</span>
                  <div style={{flex:1,overflow:'hidden'}}>
                    <div style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontWeight:500,fontSize:13}}>{c.title}</div>
                    <div style={{fontSize:11,color:t.muted,marginTop:1}}>{c.messages.length} messages</div>
                  </div>
                  <span style={{fontSize:11,color:t.muted,flexShrink:0}}>→</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Sidebar ────────────────────────────────────────────────────────────────
function Sidebar({ tab, setTab, dark, setDark, user, profile, isPremium, onUpgrade, onLogout, aiMode, setAiMode }) {
  const t = T(dark)
  const userName = user.user_metadata?.name || user.email.split('@')[0]

  const navItems = [
    { id:'chat', icon:'💬', label:'Chat' },
    { id:'notes', icon:'📝', label:'Notes' },
    { id:'progress', icon:'📊', label:'Progress' },
    { id:'history', icon:'🕐', label:'History' },
  ]

  return (
    <div style={{width:220,background:t.sidebar,borderRight:`1px solid ${t.border}`,display:'flex',flexDirection:'column',flexShrink:0,height:'100%',overflow:'hidden'}}>
      {/* Logo */}
      <div style={{padding:'18px 16px 14px',borderBottom:`1px solid ${t.border}`}}>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:800,color:t.text,letterSpacing:-0.5}}>🧠 Memora</div>
        <div style={{fontSize:11,color:t.muted,marginTop:2}}>AI Study Assistant</div>
      </div>

      {/* AI Mode toggle */}
      <div style={{padding:'12px 16px',borderBottom:`1px solid ${t.border}`}}>
        <div style={{fontSize:11,color:t.muted,fontWeight:600,textTransform:'uppercase',letterSpacing:0.5,marginBottom:8}}>Mode</div>
        <div style={{display:'flex',background:t.card,borderRadius:8,border:`1px solid ${t.border}`,padding:3,gap:2}}>
          {[['study','📚 Study'],['general','🌐 General']].map(([m,l])=>(
            <button key={m} onClick={()=>setAiMode(m)} style={{flex:1,padding:'5px 6px',borderRadius:5,border:'none',background:aiMode===m?'#8B5CF6':'transparent',color:aiMode===m?'#fff':t.muted,fontSize:11,fontWeight:aiMode===m?600:400}}>{l}</button>
          ))}
        </div>
      </div>

      {/* Nav */}
      <nav style={{flex:1,padding:'8px 8px',overflowY:'auto'}}>
        {navItems.map(item=>(
          <button key={item.id} onClick={()=>setTab(item.id)} style={{width:'100%',padding:'9px 12px',borderRadius:8,border:'none',background:tab===item.id?t.accentBg:'transparent',color:tab===item.id?t.accent:t.muted,fontSize:14,fontWeight:tab===item.id?600:400,display:'flex',alignItems:'center',gap:10,marginBottom:2,textAlign:'left',transition:'all 0.12s'}}
            onMouseEnter={e=>{ if(tab!==item.id) e.currentTarget.style.background=t.hoverNav }}
            onMouseLeave={e=>{ if(tab!==item.id) e.currentTarget.style.background='transparent' }}>
            <span style={{fontSize:15}}>{item.icon}</span>{item.label}
            {tab===item.id&&<span style={{marginLeft:'auto',width:5,height:5,borderRadius:'50%',background:t.accent}}/>}
          </button>
        ))}
      </nav>

      {/* Bottom */}
      <div style={{padding:'10px 8px',borderTop:`1px solid ${t.border}`}}>
        {/* Premium badge */}
        {isPremium
          ? <div style={{padding:'8px 12px',borderRadius:8,background:'rgba(139,92,246,0.1)',border:'1px solid rgba(139,92,246,0.2)',marginBottom:8,textAlign:'center'}}>
              <div style={{fontSize:12,color:t.accent,fontWeight:600}}>⭐ Premium</div>
            </div>
          : <button onClick={onUpgrade} style={{width:'100%',padding:'8px 12px',borderRadius:8,border:'1px solid rgba(139,92,246,0.3)',background:'rgba(139,92,246,0.07)',color:t.accent,fontSize:12,fontWeight:600,marginBottom:8}}>⭐ Upgrade to Premium</button>
        }
        {/* Dark toggle */}
        <button onClick={()=>setDark(d=>!d)} style={{width:'100%',padding:'8px 12px',borderRadius:8,border:`1px solid ${t.border}`,background:'transparent',color:t.muted,fontSize:12,display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
          {dark?'☀️ Light Mode':'🌙 Dark Mode'}
        </button>
        {/* User */}
        <div style={{padding:'8px 12px',borderRadius:8,background:t.card,border:`1px solid ${t.border}`,display:'flex',alignItems:'center',gap:8}}>
          <div style={{width:28,height:28,borderRadius:'50%',background:'#8B5CF6',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,color:'#fff',flexShrink:0}}>{userName.slice(0,1).toUpperCase()}</div>
          <div style={{flex:1,overflow:'hidden'}}>
            <div style={{fontSize:12,fontWeight:600,color:t.text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{userName}</div>
            <button onClick={onLogout} style={{fontSize:10,color:t.muted,background:'none',border:'none',padding:0,cursor:'pointer'}}>Sign out</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main App ───────────────────────────────────────────────────────────────
export default function App() {
  const [user,setUser] = useState(null)
  const [profile,setProfile] = useState(null)
  const [loading,setLoading] = useState(true)
  const [dark,setDark] = useState(()=>localStorage.getItem('memora-dark')!=='false')
  const [tab,setTab] = useState('chat')
  const [aiMode,setAiMode] = useState('study')
  const [notes,setNotes] = useState([])
  const [weakTopics,setWeakTopics] = useState([])
  const [notePrefill,setNotePrefill] = useState(null)
  const [showPremium,setShowPremium] = useState(false)
  const [histRefresh,setHistRefresh] = useState(0)
  const [selectedConv,setSelectedConv] = useState(null)
  const [sidebarOpen,setSidebarOpen] = useState(true)

  useEffect(()=>{ localStorage.setItem('memora-dark', dark) },[dark])

  useEffect(()=>{
    // Failsafe: if Supabase hangs for any reason, stop the spinner after 6s
    const failsafe = setTimeout(() => setLoading(false), 6000)

    supabase.auth.getSession()
      .then(async ({ data: { session } }) => {
        clearTimeout(failsafe)
        if (session?.user) {
          setUser(session.user)
          await loadProfile(session.user).catch(()=>{})
        }
        setLoading(false)
      })
      .catch((err) => {
        clearTimeout(failsafe)
        console.error('Supabase getSession error:', err)
        setLoading(false)
      })

    let subscription = { unsubscribe: ()=>{} }
    try {
      const { data } = supabase.auth.onAuthStateChange(async (_, session) => {
        if (session?.user) {
          setUser(session.user)
          loadProfile(session.user).catch(()=>{})
        } else {
          setUser(null)
          setProfile(null)
        }
      })
      subscription = data.subscription
    } catch(e) {
      console.error('onAuthStateChange error:', e)
    }

    return () => subscription.unsubscribe()
  },[])

  async function loadProfile(u) {
    try {
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('TIMEOUT')), 6000)
      )
      const dbCall = supabase
        .from('profiles')
        .select('*')
        .eq('user_id', u.id)
        .single()

      const { data } = await Promise.race([dbCall, timeout])
      if (data) {
        setProfile(data)
        setWeakTopics(data.weak_topics || [])
      }
    } catch (err) {
      console.error('loadProfile error:', err.message)
      // No profile found — ProfileSetup will handle it
    }
  }

  async function handleAuth(u) { setUser(u); await loadProfile(u) }
  async function handleProfileDone(p) { setProfile(p); setWeakTopics(p.weak_topics||[]) }
  async function handleLogout() { await supabase.auth.signOut(); setUser(null); setProfile(null) }

  const isPremium = profile?.premium||false

  if (loading) {
    // Check if Supabase env vars are missing (common cause of infinite spinner)
    const missingEnv = !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY
    return (
      <div style={{minHeight:'100vh',background:'#212121',display:'flex',alignItems:'center',justifyContent:'center'}}>
        <div style={{textAlign:'center'}}>
          <div style={{fontSize:36,marginBottom:12}}>🧠</div>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:800,color:'#ECECEC',marginBottom:16}}>Memora</div>
          {missingEnv ? (
            <div style={{background:'rgba(220,38,38,0.1)',border:'1px solid rgba(220,38,38,0.3)',borderRadius:10,padding:'14px 20px',maxWidth:320,textAlign:'left'}}>
              <div style={{color:'#EF4444',fontSize:13,fontWeight:700,marginBottom:8}}>⚠️ Missing Environment Variables</div>
              <div style={{color:'#9CA3AF',fontSize:12,lineHeight:1.6}}>
                Add these to Vercel → Settings → Env Vars:<br/>
                <code style={{color:'#C084FC'}}>VITE_SUPABASE_URL</code><br/>
                <code style={{color:'#C084FC'}}>VITE_SUPABASE_ANON_KEY</code>
              </div>
            </div>
          ) : (
            <div style={{width:32,height:32,border:'3px solid #3A3A3A',borderTop:'3px solid #8B5CF6',borderRadius:'50%',animation:'spin 0.7s linear infinite',margin:'0 auto'}}/>
          )}
        </div>
      </div>
    )
  }

  if (!user) return <><style>{CSS(true)}</style><Landing onAuth={handleAuth}/></>
  if (!profile) return <ProfileSetup user={user} onDone={handleProfileDone} dark={dark}/>

  const t = T(dark)
  const navItems = [
    {id:'chat',icon:'💬',label:'Chat'},
    {id:'notes',icon:'📝',label:'Notes'},
    {id:'progress',icon:'📊',label:'Progress'},
    {id:'history',icon:'🕐',label:'History'},
  ]

  function switchTab(id){ setTab(id); setSelectedConv(null) }

  return (
    <div style={{height:'100vh',display:'flex',flexDirection:'column',overflow:'hidden',background:t.bg}}>
      <style>{CSS(dark)}</style>

      {/* ── MOBILE TOP BAR ── */}
      <div className="mobile-only" style={{
        alignItems:'center',justifyContent:'space-between',
        padding:'10px 16px',borderBottom:`1px solid ${t.border}`,
        background:t.sidebar,flexShrink:0,zIndex:10
      }}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <span style={{fontSize:20}}>🧠</span>
          <span style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:17,color:t.text}}>Memora</span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <button onClick={()=>setDark(d=>!d)} style={{background:'none',border:`1px solid ${t.border}`,borderRadius:8,padding:'6px 10px',color:t.muted,fontSize:14}}>{dark?'☀️':'🌙'}</button>
          {!isPremium&&<button onClick={()=>setShowPremium(true)} style={{background:'rgba(139,92,246,0.12)',border:'1px solid rgba(139,92,246,0.3)',borderRadius:8,padding:'6px 10px',color:'#8B5CF6',fontSize:12,fontWeight:600}}>⭐ Pro</button>}
        </div>
      </div>

      {/* ── DESKTOP: sidebar + content ── */}
      <div style={{flex:1,display:'flex',overflow:'hidden',minHeight:0}}>

        {/* Sidebar — desktop only */}
        <div className="sidebar-wrap desktop-only" style={{flexShrink:0}}>
          {sidebarOpen && (
            <Sidebar
              tab={tab} setTab={switchTab}
              dark={dark} setDark={setDark}
              user={user} profile={profile}
              isPremium={isPremium}
              onUpgrade={()=>setShowPremium(true)}
              onLogout={handleLogout}
              aiMode={aiMode} setAiMode={setAiMode}
            />
          )}
        </div>

        {/* Main content */}
        <div className="main-content" style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden',minWidth:0}}>

          {/* AI Mode toggle — mobile only */}
          <div className="mobile-only" style={{
            padding:'8px 12px',borderBottom:`1px solid ${t.border}`,
            background:t.bg,flexShrink:0,alignItems:'center',gap:8
          }}>
            <div style={{display:'flex',background:t.card,borderRadius:8,border:`1px solid ${t.border}`,padding:3,gap:2,flex:1}}>
              {[['study','📚 Study'],['general','🌐 General']].map(([m,l])=>(
                <button key={m} onClick={()=>setAiMode(m)} style={{flex:1,padding:'5px 6px',borderRadius:5,border:'none',background:aiMode===m?'#8B5CF6':'transparent',color:aiMode===m?'#fff':t.muted,fontSize:12,fontWeight:aiMode===m?600:400}}>{l}</button>
              ))}
            </div>
            {profile?.board&&<span style={{fontSize:11,color:t.muted,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',maxWidth:120}}>{profile.board}</span>}
          </div>

          {/* Page content */}
          <div style={{flex:1,overflow:'hidden',display:'flex',flexDirection:'column',minHeight:0}}>
            {selectedConv ? (
              <ConversationView conversation={selectedConv} dark={dark} onBack={()=>setSelectedConv(null)}/>
            ) : tab==='chat' ? (
              <ChatTab
                user={user} notes={notes} profile={profile}
                onSaveNote={content=>{setNotePrefill(content);setTab('notes')}}
                weakTopics={weakTopics} setWeakTopics={setWeakTopics}
                isPremium={isPremium} dark={dark}
                onUpgrade={()=>setShowPremium(true)}
                aiMode={aiMode}
                onNewMessage={()=>setHistRefresh(r=>r+1)}
                onProfileUpdate={setProfile}
              />
            ) : tab==='notes' ? (
              <NotesTab user={user} notes={notes} setNotes={setNotes} prefill={notePrefill} clearPrefill={()=>setNotePrefill(null)} dark={dark}/>
            ) : tab==='progress' ? (
              <ProgressTab user={user} profile={profile} weakTopics={weakTopics} setWeakTopics={setWeakTopics} notes={notes} dark={dark} onUpgrade={()=>setShowPremium(true)} isPremium={isPremium}/>
            ) : tab==='history' ? (
              <HistoryTab user={user} dark={dark} onSelectConv={setSelectedConv} refresh={histRefresh}/>
            ) : null}
          </div>

          {/* ── MOBILE BOTTOM NAV ── */}
          <div className="mobile-only" style={{
            borderTop:`1px solid ${t.border}`,background:t.sidebar,
            flexShrink:0,padding:'4px 0 max(4px,env(safe-area-inset-bottom))',
            alignItems:'center',justifyContent:'space-around',zIndex:10
          }}>
            {navItems.map(item=>(
              <button key={item.id} onClick={()=>switchTab(item.id)} style={{
                display:'flex',flexDirection:'column',alignItems:'center',gap:3,
                padding:'6px 12px',border:'none',background:'transparent',
                color:tab===item.id?'#8B5CF6':t.muted,flex:1,minHeight:52
              }}>
                <span style={{fontSize:20}}>{item.icon}</span>
                <span style={{fontSize:10,fontWeight:tab===item.id?700:400}}>{item.label}</span>
                {tab===item.id&&<div style={{width:16,height:2,borderRadius:2,background:'#8B5CF6',marginTop:1}}/>}
              </button>
            ))}
          </div>
        </div>
      </div>

      {showPremium&&<PremiumModal onClose={()=>setShowPremium(false)} dark={dark} user={user}/>}
    </div>
  )
}
// Add this at the bottom
import SoloChat from './SoloChat';

function SoloPage() {
  return <SoloChat />;
}

// Export both (keep your old one + new Solo page)
export { SoloPage };
export default App;   // Keep your original export
