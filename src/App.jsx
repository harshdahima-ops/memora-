import { useState, useEffect, useRef } from 'react'
import { supabase } from './supabase.js'

const FREE_LIMIT = 20

const BOARD_GROUPS = {
  'School - CBSE': ['Class 5 - CBSE','Class 6 - CBSE','Class 7 - CBSE','Class 8 - CBSE','Class 9 - CBSE','Class 10 - CBSE','Class 11 - CBSE','Class 12 - CBSE'],
  'School - ICSE / ISC': ['Class 5 - ICSE','Class 6 - ICSE','Class 7 - ICSE','Class 8 - ICSE','Class 9 - ICSE','Class 10 - ICSE','Class 11 - ISC','Class 12 - ISC'],
  'School - State Board': ['Class 5 - State Board','Class 6 - State Board','Class 7 - State Board','Class 8 - State Board','Class 9 - State Board','Class 10 - State Board','Class 11 - State Board','Class 12 - State Board'],
  'Competitive Exams': ['JEE Mains & Advanced','NEET','UPSC Civil Services','SSC CGL / CHSL','SSC GD / MTS','Railway (RRB)','Banking (IBPS / SBI)','NDA / CDS','CLAT - Law Entrance','CAT / MBA Entrance','GATE','CUET'],
  'College - Engineering': ['B.Tech / B.E - CSE','B.Tech / B.E - ECE','B.Tech / B.E - Mechanical','B.Tech / B.E - Civil','B.Tech / B.E - IT','B.Tech / B.E - EEE','B.Tech / B.E - Chemical','Diploma / Polytechnic'],
  'College - Commerce': ['B.Com / M.Com','BBA / MBA','CA Foundation','CA Intermediate','CA Final','CMA / ICWA'],
  'College - Science': ['B.Sc / M.Sc - Physics','B.Sc / M.Sc - Chemistry','B.Sc / M.Sc - Mathematics','B.Sc / M.Sc - Biology','B.Sc / M.Sc - Computer Science','B.Sc - Biotechnology'],
  'College - Computer': ['BCA / MCA','B.Sc IT','PGDCA'],
  'College - Medical': ['MBBS / BDS','B.Pharma / M.Pharma','Nursing','Physiotherapy','Allied Health Sciences'],
  'College - Arts & Law': ['BA / MA - History','BA / MA - Political Science','BA / MA - Economics','BA / MA - Psychology','BA / MA - English Literature','LLB / LLM - Law','B.Ed / M.Ed'],
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
  'Class 5 - ICSE':['Mathematics','Science','Social Science','English','Hindi'],
  'Class 6 - ICSE':['Mathematics','Science','Social Science','English','Hindi'],
  'Class 7 - ICSE':['Mathematics','Science','Social Science','English','Hindi'],
  'Class 8 - ICSE':['Mathematics','Science','Social Science','English','Hindi'],
  'Class 9 - ICSE':['Mathematics','Physics','Chemistry','Biology','English','History & Civics','Geography'],
  'Class 10 - ICSE':['Mathematics','Physics','Chemistry','Biology','English','History & Civics','Geography'],
  'Class 11 - ISC':['Physics','Chemistry','Mathematics','Biology','English','Accountancy','Economics','Computer Science'],
  'Class 12 - ISC':['Physics','Chemistry','Mathematics','Biology','English','Accountancy','Economics','Computer Science'],
  'Class 5 - State Board':['Mathematics','Science','Social Science','English','Hindi'],
  'Class 6 - State Board':['Mathematics','Science','Social Science','English','Hindi'],
  'Class 7 - State Board':['Mathematics','Science','Social Science','English','Hindi'],
  'Class 8 - State Board':['Mathematics','Science','Social Science','English','Hindi'],
  'Class 9 - State Board':['Mathematics','Science','Social Science','English','Hindi'],
  'Class 10 - State Board':['Mathematics','Science','Social Science','English','Hindi'],
  'Class 11 - State Board':['Physics','Chemistry','Mathematics','Biology','English','Accountancy','Economics'],
  'Class 12 - State Board':['Physics','Chemistry','Mathematics','Biology','English','Accountancy','Economics'],
  'JEE Mains & Advanced':['Physics','Chemistry','Mathematics'],
  'NEET':['Physics','Chemistry','Biology (Botany)','Biology (Zoology)'],
  'UPSC Civil Services':['General Studies I','General Studies II','General Studies III','General Studies IV','CSAT','Essay','Optional Subject'],
  'SSC CGL / CHSL':['General Intelligence & Reasoning','General Awareness','Quantitative Aptitude','English Comprehension'],
  'SSC GD / MTS':['Reasoning','General Knowledge','Mathematics','English / Hindi'],
  'Railway (RRB)':['Mathematics','General Intelligence','General Awareness','General Science'],
  'Banking (IBPS / SBI)':['Quantitative Aptitude','Reasoning','English Language','General Awareness','Computer Knowledge'],
  'NDA / CDS':['Mathematics','General Ability Test','English','General Knowledge'],
  'CLAT - Law Entrance':['English','Current Affairs','Legal Reasoning','Logical Reasoning','Quantitative Techniques'],
  'CAT / MBA Entrance':['Quantitative Aptitude','Verbal Ability','Logical Reasoning','Data Interpretation'],
  'GATE':['Engineering Mathematics','General Aptitude','Core Subject'],
  'CUET':['English','Domain Subject','General Test'],
  'B.Tech / B.E - CSE':['Data Structures & Algorithms','Database Management System','Operating Systems','Computer Networks','Object Oriented Programming','Software Engineering','Machine Learning','Web Development','Theory of Computation','Compiler Design','Artificial Intelligence','Cloud Computing'],
  'B.Tech / B.E - ECE':['Electronic Devices & Circuits','Digital Electronics','Signals & Systems','Communication Systems','Microprocessors','VLSI Design','Electromagnetic Theory','Control Systems'],
  'B.Tech / B.E - Mechanical':['Engineering Mechanics','Thermodynamics','Fluid Mechanics','Machine Design','Manufacturing Processes','Heat Transfer','Theory of Machines','Material Science'],
  'B.Tech / B.E - Civil':['Structural Analysis','Fluid Mechanics','Geotechnical Engineering','Transportation Engineering','Environmental Engineering','Concrete Technology','Surveying'],
  'B.Tech / B.E - IT':['Data Structures','Database Systems','Computer Networks','Web Technologies','Software Engineering','Cloud Computing','Cyber Security'],
  'B.Tech / B.E - EEE':['Circuit Theory','Electrical Machines','Power Systems','Control Systems','Power Electronics','Measurements'],
  'B.Tech / B.E - Chemical':['Chemical Engineering Thermodynamics','Mass Transfer','Heat Transfer','Reaction Engineering','Process Control','Fluid Mechanics'],
  'Diploma / Polytechnic':['Engineering Mathematics','Applied Physics','Applied Chemistry','Workshop Technology','Core Trade Subject'],
  'B.Com / M.Com':['Financial Accounting','Cost Accounting','Business Law','Income Tax','Auditing','Corporate Accounting','Financial Management','Business Statistics','Economics'],
  'BBA / MBA':['Management Principles','Marketing Management','Financial Management','Human Resource Management','Business Statistics','Operations Management','Strategic Management','Entrepreneurship'],
  'CA Foundation':['Principles of Accounting','Business Law','Quantitative Aptitude','Business Economics'],
  'CA Intermediate':['Accounting','Corporate Laws','Cost & Management Accounting','Taxation','Auditing','Financial Management'],
  'CA Final':['Financial Reporting','Strategic Financial Management','Advanced Auditing','Corporate Laws','Strategic Cost Management','Direct Tax Laws','Indirect Tax Laws'],
  'CMA / ICWA':['Financial Accounting','Cost Accounting','Financial Management','Laws & Ethics','Strategic Management'],
  'B.Sc / M.Sc - Physics':['Classical Mechanics','Quantum Mechanics','Thermodynamics','Electromagnetism','Optics','Nuclear Physics','Mathematical Physics'],
  'B.Sc / M.Sc - Chemistry':['Organic Chemistry','Inorganic Chemistry','Physical Chemistry','Analytical Chemistry','Spectroscopy','Biochemistry'],
  'B.Sc / M.Sc - Mathematics':['Real Analysis','Abstract Algebra','Linear Algebra','Differential Equations','Numerical Methods','Probability & Statistics','Topology'],
  'B.Sc / M.Sc - Biology':['Cell Biology','Genetics','Ecology','Microbiology','Biochemistry','Physiology','Evolutionary Biology'],
  'B.Sc / M.Sc - Computer Science':['Data Structures','Algorithms','Database Systems','Artificial Intelligence','Computer Graphics','Software Engineering'],
  'B.Sc - Biotechnology':['Cell Biology','Molecular Biology','Genetics','Biochemistry','Microbiology','Bioinformatics'],
  'BCA / MCA':['C Programming','Data Structures','Database Management','Web Technologies','Java Programming','Python','Software Engineering','Computer Networks','Operating Systems'],
  'B.Sc IT':['Programming','Database Management','Web Development','Computer Networks','Software Engineering'],
  'PGDCA':['Computer Fundamentals','Programming in C','Database Management','Web Technology','Office Automation'],
  'MBBS / BDS':['Anatomy','Physiology','Biochemistry','Pathology','Pharmacology','Microbiology','Community Medicine','Medicine','Surgery'],
  'B.Pharma / M.Pharma':['Pharmaceutical Chemistry','Pharmacology','Pharmaceutics','Pharmacognosy','Pharmaceutical Analysis'],
  'Nursing':['Anatomy & Physiology','Microbiology','Pharmacology','Medical Surgical Nursing','Community Health Nursing','Pediatric Nursing'],
  'Physiotherapy':['Anatomy','Physiology','Biomechanics','Musculoskeletal PT','Neurological PT','Cardiopulmonary PT'],
  'Allied Health Sciences':['Anatomy','Physiology','Pathology','Core Specialization Subject'],
  'BA / MA - History':['Ancient History','Medieval History','Modern History','World History','Indian National Movement','Historiography'],
  'BA / MA - Political Science':['Indian Constitution','Comparative Politics','International Relations','Political Theory','Public Administration'],
  'BA / MA - Economics':['Microeconomics','Macroeconomics','Statistics','Indian Economy','International Economics','Development Economics'],
  'BA / MA - Psychology':['General Psychology','Developmental Psychology','Social Psychology','Abnormal Psychology','Cognitive Psychology','Research Methods'],
  'BA / MA - English Literature':['British Literature','American Literature','Indian Writing in English','Literary Theory','Linguistics','Poetry & Drama'],
  'LLB / LLM - Law':['Constitutional Law','Contract Law','Criminal Law','Family Law','Property Law','Administrative Law','International Law','Corporate Law'],
  'B.Ed / M.Ed':['Education Philosophy','Educational Psychology','Curriculum Development','Teaching Methods','Assessment & Evaluation'],
}

function today(){ return new Date().toISOString().split('T')[0] }

async function callAI(messages, system, image, url){
  const body = { messages, system }
  if(image) body.image = image
  if(url) body.url = url
  const res = await fetch('/api/chat', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) })
  const data = await res.json()
  if(data.error === 'RATE_LIMIT') throw new Error('RATE_LIMIT')
  if(data.error) throw new Error(data.error)
  if(!data.reply) throw new Error('No response')
  return data.reply
}

// FIX: corrected regex — original had missing \s* backslash on A/B/C/D replacements
function parseQuiz(text){
  try{
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
    let q='', a='', b='', c='', d='', ans=''
    for(const line of lines){
      if(line.startsWith('QUESTION:')) q = line.replace('QUESTION:','').trim()
      else if(line.match(/^A[\)\.]/)){ a = line.replace(/^A[\)\.]\s*/,'').trim() }
      else if(line.match(/^B[\)\.]/)){ b = line.replace(/^B[\)\.]\s*/,'').trim() }
      else if(line.match(/^C[\)\.]/)){ c = line.replace(/^C[\)\.]\s*/,'').trim() }
      else if(line.match(/^D[\)\.]/)){ d = line.replace(/^D[\)\.]\s*/,'').trim() }
      else if(line.startsWith('ANSWER:')) ans = line.replace('ANSWER:','').trim().charAt(0).toUpperCase()
    }
    if(!q||!a||!b||!c||!d||!['A','B','C','D'].includes(ans)) return null
    return { question:q, options:{A:a,B:b,C:c,D:d}, correct:ans }
  }catch{ return null }
}

// ── Theme — pure Black / White only (no blue/purple tints in backgrounds)
const C = (dark) => ({
  bg:      dark ? '#0A0A0A' : '#FFFFFF',
  sidebar: dark ? '#111111' : '#F7F7F7',
  card:    dark ? '#181818' : '#FFFFFF',
  card2:   dark ? '#222222' : '#F2F2F2',
  border:  dark ? '#2A2A2A' : '#E0E0E0',
  text:    dark ? '#EFEFEF' : '#111111',
  muted:   dark ? '#666666' : '#777777',
  accent:  '#8B5CF6',
  accent2: '#7C3AED',
  green:   '#10B981',
  red:     '#EF4444',
  orange:  '#F59E0B',
  blue:    '#3B82F6',
})

const getCSS = (dark) => `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html,body,#root{height:100%;}
body{font-family:'Inter',sans-serif;background:${dark?'#0A0A0A':'#FFFFFF'};color:${dark?'#EFEFEF':'#111111'};-webkit-font-smoothing:antialiased;}
input,textarea,button,select{font-family:'Inter',sans-serif;}
input::placeholder,textarea::placeholder{color:${dark?'#444444':'#AAAAAA'};}
input:focus,textarea:focus,select:focus{outline:none;box-shadow:0 0 0 2px rgba(139,92,246,0.3)!important;border-color:#8B5CF6!important;}
button{cursor:pointer;transition:all 0.15s ease;}
::-webkit-scrollbar{width:5px;}
::-webkit-scrollbar-thumb{background:${dark?'#333333':'#CCCCCC'};border-radius:10px;}
@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}
@keyframes spin{to{transform:rotate(360deg)}}
.fade-up{animation:fadeUp 0.35s cubic-bezier(0.16,1,0.3,1);}
.fade-up-1{animation:fadeUp 0.35s 0.1s cubic-bezier(0.16,1,0.3,1) both;}
.fade-up-2{animation:fadeUp 0.35s 0.2s cubic-bezier(0.16,1,0.3,1) both;}
.fade-up-3{animation:fadeUp 0.35s 0.3s cubic-bezier(0.16,1,0.3,1) both;}
.fade-up-4{animation:fadeUp 0.35s 0.4s cubic-bezier(0.16,1,0.3,1) both;}
.msg-in{animation:fadeUp 0.25s ease;}
`

function Av({ name, size=36 }){
  const colors = ['linear-gradient(135deg,#8B5CF6,#7C3AED)','linear-gradient(135deg,#3B82F6,#2563EB)','linear-gradient(135deg,#10B981,#059669)','linear-gradient(135deg,#F59E0B,#D97706)']
  const idx = (name||'U').charCodeAt(0) % colors.length
  return <div style={{width:size,height:size,borderRadius:'50%',background:colors[idx],display:'flex',alignItems:'center',justifyContent:'center',fontSize:size*0.36,fontWeight:700,color:'#fff',flexShrink:0}}>{(name||'U').slice(0,2).toUpperCase()}</div>
}

function Chip({ text, color }){
  const cl = color||'#8B5CF6'
  return <span style={{fontSize:11,padding:'3px 10px',borderRadius:20,background:cl+'22',color:cl,fontWeight:600,flexShrink:0}}>{text}</span>
}

// ── Markdown ───────────────────────────────────────────────────────────────
function fmtInline(text, dark){
  if(!text) return ''
  const c = C(dark)
  const cd = {background:dark?'#222222':'#F0F0F0',borderRadius:4,padding:'1px 6px',fontSize:'0.86em',fontFamily:'monospace',color:dark?'#A78BFA':'#7C3AED'}
  const parts = []; let rem = text, k = 0
  while(rem.length){
    const bm = rem.match(/\*\*(.*?)\*\*/)
    const im = rem.match(/\*(.*?)\*/)
    const cm = rem.match(/`(.*?)`/)
    const hits = [bm&&{t:'b',i:bm.index,f:bm[0],v:bm[1]},im&&{t:'i',i:im.index,f:im[0],v:im[1]},cm&&{t:'c',i:cm.index,f:cm[0],v:cm[1]}].filter(Boolean).sort((a,b)=>a.i-b.i)
    if(!hits.length){ parts.push(rem); break }
    const h = hits[0]
    if(h.i>0) parts.push(rem.slice(0,h.i))
    if(h.t==='b') parts.push(<strong key={k++} style={{color:c.text,fontWeight:600}}>{h.v}</strong>)
    else if(h.t==='i') parts.push(<em key={k++}>{h.v}</em>)
    else parts.push(<code key={k++} style={cd}>{h.v}</code>)
    rem = rem.slice(h.i+h.f.length)
  }
  return parts.length===1&&typeof parts[0]==='string' ? parts[0] : parts
}

function MD({ content, dark=true }){
  if(!content) return null
  const c = C(dark)
  const els = []; let i = 0, inCode = false, codeLines = [], lang = ''
  const lines = content.split('\n')
  while(i < lines.length){
    const l = lines[i]
    if(l.startsWith('```')){
      if(!inCode){ inCode=true; codeLines=[]; lang=l.slice(3).trim() }
      else{
        els.push(<div key={i} style={{background:dark?'#0D0D0D':'#F5F5F5',borderRadius:10,overflow:'hidden',margin:'10px 0',border:`1px solid ${c.border}`}}>
          {lang&&<div style={{padding:'6px 14px',fontSize:11,color:c.muted,fontWeight:500,borderBottom:`1px solid ${c.border}`,background:dark?'#181818':'#EBEBEB'}}>{lang}</div>}
          <pre style={{padding:'12px 14px',fontSize:13,overflowX:'auto',fontFamily:'monospace',lineHeight:1.6,color:c.text}}><code>{codeLines.join('\n')}</code></pre>
        </div>)
        inCode=false; codeLines=[]; lang=''
      }
      i++; continue
    }
    if(inCode){ codeLines.push(l); i++; continue }
    if(l.startsWith('### ')) els.push(<h3 key={i} style={{fontSize:14,fontWeight:600,margin:'8px 0 4px',color:c.text}}>{fmtInline(l.slice(4),dark)}</h3>)
    else if(l.startsWith('## ')) els.push(<h2 key={i} style={{fontSize:16,fontWeight:700,margin:'12px 0 6px',color:c.text}}>{fmtInline(l.slice(3),dark)}</h2>)
    else if(l.startsWith('# ')) els.push(<h1 key={i} style={{fontSize:18,fontWeight:700,margin:'14px 0 8px',color:c.text}}>{fmtInline(l.slice(2),dark)}</h1>)
    else if(l.startsWith('---')) els.push(<hr key={i} style={{border:'none',borderTop:`1px solid ${c.border}`,margin:'12px 0'}}/>)
    else if(l.startsWith('- ')||l.startsWith('* ')||l.startsWith('• ')) els.push(<div key={i} style={{display:'flex',gap:8,marginBottom:4,paddingLeft:4}}><span style={{color:c.accent,marginTop:2,flexShrink:0}}>•</span><span style={{fontSize:14,color:c.text,lineHeight:1.65}}>{fmtInline(l.replace(/^[-*•] /,''),dark)}</span></div>)
    else if(/^\d+\. /.test(l)){ const [,n,tx]=l.match(/^(\d+)\. (.*)/); els.push(<div key={i} style={{display:'flex',gap:8,marginBottom:4,paddingLeft:4}}><span style={{color:c.accent,fontWeight:600,fontSize:13,flexShrink:0,minWidth:18}}>{n}.</span><span style={{fontSize:14,color:c.text,lineHeight:1.65}}>{fmtInline(tx,dark)}</span></div>) }
    else if(l.startsWith('> ')) els.push(<div key={i} style={{borderLeft:`3px solid ${c.accent}`,paddingLeft:12,margin:'6px 0',color:c.muted,fontSize:14,fontStyle:'italic'}}>{fmtInline(l.slice(2),dark)}</div>)
    else if(l.trim()==='') els.push(<div key={i} style={{height:8}}/>)
    else els.push(<p key={i} style={{fontSize:14,color:c.text,lineHeight:1.7,margin:'2px 0'}}>{fmtInline(l,dark)}</p>)
    i++
  }
  return <div style={{lineHeight:1.65}}>{els}</div>
}

// ── Landing ────────────────────────────────────────────────────────────────
function Landing({ onAuth, dark }){
  const [view, setView] = useState('home')
  const [authMode, setAuthMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const c = C(true) // landing always dark

  async function googleLogin(){
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({ provider:'google', options:{ redirectTo:window.location.origin } })
    if(error){ setErr(error.message); setLoading(false) }
  }

  async function submit(){
    setErr('')
    if(!email.trim()||!pass.trim()){ setErr('Email and password required.'); return }
    if(authMode==='signup'&&!name.trim()){ setErr('Name is required.'); return }
    setLoading(true)
    try{
      if(authMode==='signup'){
        const { data, error } = await supabase.auth.signUp({ email:email.trim(), password:pass.trim(), options:{ data:{ name:name.trim() } } })
        if(error) throw error
        if(data.user) onAuth(data.user)
        else setErr('Account created! You can now log in.')
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email:email.trim(), password:pass.trim() })
        if(error) throw error
        onAuth(data.user)
      }
    }catch(e){ setErr(e.message||'Something went wrong.') }
    setLoading(false)
  }

  const features = [
    {icon:'🧩',title:'Interactive Quiz',desc:'MCQ with A/B/C/D options. Select an answer and get instant explanation.'},
    {icon:'📋',title:'Upload Syllabus',desc:'Upload your college syllabus PDF. AI follows your exact units and chapters.'},
    {icon:'📝',title:'Smart Notes',desc:'Save AI answers as formatted notes. Search everything anytime.'},
    {icon:'💬',title:'General AI Chat',desc:'Not just study — ask anything in life or explore new topics.'},
    {icon:'🎯',title:'Smart Study AI',desc:'Personalized for your exact board, exam and subject. Class 5 to PhD.'},
    {icon:'⭐',title:'Premium Plan',desc:'₹99/month for unlimited messages, all features, priority responses.'},
  ]

  if(view==='auth'){
    return(
      <div style={{minHeight:'100vh',background:'#0A0A0A',display:'flex',overflowY:'auto'}}>
        <style>{getCSS(true)}</style>
        <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',padding:40}}>
          <div style={{width:'100%',maxWidth:400}} className="fade-up">
            <button onClick={()=>setView('home')} style={{background:'none',border:'none',color:'#666666',fontSize:13,marginBottom:28,display:'flex',alignItems:'center',gap:6,padding:0}}>← Back to home</button>
            <div style={{marginBottom:32}}>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:28,fontWeight:800,color:'#EFEFEF',marginBottom:6,letterSpacing:-0.5}}>
                {authMode==='login'?'Welcome back 👋':'Join Memora'}
              </div>
              <div style={{fontSize:14,color:'#666666'}}>{authMode==='login'?'Continue your learning journey':'Start studying smarter today'}</div>
            </div>

            <button onClick={googleLogin} disabled={loading} style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'center',gap:12,padding:'13px',borderRadius:12,border:'1px solid #2A2A2A',background:'#181818',color:'#EFEFEF',fontSize:14,fontWeight:500,marginBottom:20}}>
              <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 002.38-5.88c0-.57-.05-.66-.15-1.18z"/><path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.04a4.8 4.8 0 01-7.18-2.54H1.83v2.07A8 8 0 008.98 17z"/><path fill="#FBBC05" d="M4.5 10.48A4.8 4.8 0 014.5 9a5 5 0 01.32-1.76V5.17H2.18a8 8 0 000 7.66l2.32-2.35z"/><path fill="#EA4335" d="M8.98 4.72c1.3 0 2.11.56 2.6 1.03l1.93-1.93C12.07 2.79 10.6 2 8.98 2a8 8 0 00-6.8 3.83l2.32 2.07a4.77 4.77 0 014.48-3.18z"/></svg>
              Continue with Google
            </button>

            <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20}}>
              <div style={{flex:1,height:1,background:'#2A2A2A'}}/><span style={{fontSize:12,color:'#444444',whiteSpace:'nowrap'}}>or with email</span><div style={{flex:1,height:1,background:'#2A2A2A'}}/>
            </div>

            <div style={{display:'flex',background:'#181818',borderRadius:10,padding:3,marginBottom:20,border:'1px solid #2A2A2A'}}>
              {['login','signup'].map(m=>(<button key={m} onClick={()=>{setAuthMode(m);setErr('')}} style={{flex:1,padding:'8px',borderRadius:8,border:'none',fontSize:13,fontWeight:500,background:authMode===m?'#8B5CF6':'transparent',color:authMode===m?'#fff':'#666666'}}>{m==='login'?'Login':'Sign Up'}</button>))}
            </div>

            {authMode==='signup'&&(
              <div style={{marginBottom:14}}>
                <label style={{fontSize:12,color:'#666666',display:'block',marginBottom:5,fontWeight:500}}>Your name</label>
                <input style={{width:'100%',padding:'11px 14px',borderRadius:10,border:'1px solid #2A2A2A',background:'#181818',color:'#EFEFEF',fontSize:14}} placeholder="e.g. Harsh" value={name} onChange={e=>setName(e.target.value)}/>
              </div>
            )}
            <div style={{marginBottom:14}}>
              <label style={{fontSize:12,color:'#666666',display:'block',marginBottom:5,fontWeight:500}}>Email address</label>
              <input style={{width:'100%',padding:'11px 14px',borderRadius:10,border:'1px solid #2A2A2A',background:'#181818',color:'#EFEFEF',fontSize:14}} type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)}/>
            </div>
            <div style={{marginBottom:22}}>
              <label style={{fontSize:12,color:'#666666',display:'block',marginBottom:5,fontWeight:500}}>Password</label>
              <input style={{width:'100%',padding:'11px 14px',borderRadius:10,border:'1px solid #2A2A2A',background:'#181818',color:'#EFEFEF',fontSize:14}} type="password" placeholder="min 6 characters" value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==='Enter'&&submit()}/>
            </div>

            {err&&<div style={{fontSize:13,color:'#EF4444',background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:10,padding:'10px 14px',marginBottom:16,textAlign:'center'}}>{err}</div>}

            <button onClick={submit} disabled={loading} style={{width:'100%',padding:'13px',borderRadius:12,border:'none',background:loading?'#2A2A2A':'linear-gradient(135deg,#8B5CF6,#7C3AED)',color:'#fff',fontSize:14,fontWeight:700}}>
              {loading?'Please wait...':(authMode==='login'?'Login to Memora':'Create Free Account')}
            </button>
          </div>
        </div>
        {/* Right panel */}
        <div style={{flex:1,background:'#111111',borderLeft:'1px solid #1A1A1A',display:'flex',alignItems:'center',justifyContent:'center',padding:48}}>
          <div style={{maxWidth:380}}>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:28,fontWeight:800,color:'#EFEFEF',marginBottom:8,letterSpacing:-0.5}}>🧠 Memora</div>
            <div style={{fontSize:15,color:'#666666',marginBottom:32,lineHeight:1.7}}>Your AI study companion. Built for Indian students — from Class 5 to competitive exams.</div>
            {features.slice(0,4).map((f,i)=>(
              <div key={i} style={{display:'flex',gap:14,marginBottom:20}}>
                <div style={{fontSize:22,flexShrink:0,width:36,textAlign:'center'}}>{f.icon}</div>
                <div>
                  <div style={{fontSize:14,fontWeight:600,color:'#EFEFEF',marginBottom:3}}>{f.title}</div>
                  <div style={{fontSize:13,color:'#666666',lineHeight:1.6}}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Home landing
  return(
    <div style={{minHeight:'100vh',background:'#0A0A0A',color:'#EFEFEF',overflowY:'auto'}}>
      <style>{getCSS(true)}</style>
      {/* Nav */}
      <nav style={{padding:'18px 32px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'1px solid #1A1A1A'}}>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:800,letterSpacing:-0.5}}>🧠 <span style={{color:'#8B5CF6'}}>Memora</span></div>
        <div style={{display:'flex',gap:12}}>
          <button onClick={()=>{setView('auth');setAuthMode('login')}} style={{padding:'9px 22px',borderRadius:10,border:'1px solid #2A2A2A',background:'transparent',color:'#EFEFEF',fontSize:13,fontWeight:500}}>Login</button>
          <button onClick={()=>{setView('auth');setAuthMode('signup')}} style={{padding:'9px 22px',borderRadius:10,border:'none',background:'#8B5CF6',color:'#fff',fontSize:13,fontWeight:600}}>Get Started Free</button>
        </div>
      </nav>
      {/* Hero */}
      <div style={{textAlign:'center',padding:'80px 24px 60px',maxWidth:640,margin:'0 auto'}} className="fade-up">
        <div style={{fontSize:13,color:'#8B5CF6',fontWeight:600,letterSpacing:1,textTransform:'uppercase',marginBottom:16}}>AI Study Companion</div>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:48,fontWeight:800,lineHeight:1.1,marginBottom:18,letterSpacing:-1}}>Study smarter, <span style={{color:'#8B5CF6'}}>score higher.</span></div>
        <div style={{fontSize:16,color:'#666666',lineHeight:1.7,marginBottom:36}}>AI-powered study assistant for every Indian student — CBSE, ICSE, JEE, NEET, competitive exams and college courses.</div>
        <div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap'}}>
          <button onClick={()=>{setView('auth');setAuthMode('signup')}} style={{padding:'14px 36px',borderRadius:12,border:'none',background:'#8B5CF6',color:'#fff',fontSize:15,fontWeight:700}}>Start for Free</button>
          <button onClick={()=>{setView('auth');setAuthMode('login')}} style={{padding:'14px 28px',borderRadius:12,border:'1px solid #2A2A2A',background:'transparent',color:'#EFEFEF',fontSize:15,fontWeight:500}}>Login</button>
        </div>
      </div>
      {/* Features */}
      <div style={{maxWidth:900,margin:'0 auto',padding:'0 24px 80px',display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:20}}>
        {features.map((f,i)=>(
          <div key={i} style={{background:'#111111',border:'1px solid #1A1A1A',borderRadius:16,padding:'22px 24px'}} className={`fade-up-${Math.min(i+1,4)}`}>
            <div style={{fontSize:28,marginBottom:12}}>{f.icon}</div>
            <div style={{fontSize:15,fontWeight:700,color:'#EFEFEF',marginBottom:6}}>{f.title}</div>
            <div style={{fontSize:13,color:'#666666',lineHeight:1.6}}>{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Profile Setup ──────────────────────────────────────────────────────────
function ProfileSetup({ user, onDone, dark }){
  const c = C(dark)
  const [board, setBoard] = useState('')
  const [subject, setSubject] = useState('')
  const [loading, setLoading] = useState(false)
  const subjects = board ? BOARDS[board] : []

  async function save(){
    if(!board) return
    setLoading(true)
    await supabase.from('profiles').upsert({ user_id:user.id, board, subject:subject||null, weak_topics:[], premium:false })
    onDone({ board, subject, premium:false, weak_topics:[] })
    setLoading(false)
  }

  const sel = { width:'100%', padding:'11px 14px', borderRadius:10, border:`1px solid ${c.border}`, background:c.card2, color:board?c.text:c.muted, fontSize:14 }
  return(
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:20,background:c.bg}}>
      <style>{getCSS(dark)}</style>
      <div style={{width:'100%',maxWidth:440}} className="fade-up">
        <div style={{textAlign:'center',marginBottom:32}}>
          <div style={{fontSize:48,marginBottom:10}}>🎯</div>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:24,fontWeight:800,color:c.text,letterSpacing:-0.5}}>Set up your profile</div>
          <div style={{fontSize:14,color:c.muted,marginTop:6,lineHeight:1.6}}>Memora personalizes AI for your exact board, exam or course</div>
        </div>
        <div style={{background:c.card,border:`1px solid ${c.border}`,borderRadius:18,padding:28}}>
          <div style={{marginBottom:18}}>
            <label style={{fontSize:12,color:c.muted,display:'block',marginBottom:6,fontWeight:500,letterSpacing:0.3,textTransform:'uppercase'}}>Your board / exam / course *</label>
            <select value={board} onChange={e=>{setBoard(e.target.value);setSubject('')}} style={sel}>
              <option value="">Select your board, exam or course...</option>
              {Object.entries(BOARD_GROUPS).map(([g,opts])=>(<optgroup key={g} label={g}>{opts.map(b=><option key={b} value={b}>{b}</option>)}</optgroup>))}
            </select>
          </div>
          {subjects.length>0&&(
            <div style={{marginBottom:24}}>
              <label style={{fontSize:12,color:c.muted,display:'block',marginBottom:6,fontWeight:500,letterSpacing:0.3,textTransform:'uppercase'}}>Main subject (optional)</label>
              <select value={subject} onChange={e=>setSubject(e.target.value)} style={{...sel,color:subject?c.text:c.muted}}>
                <option value="">All subjects</option>
                {subjects.map(s=><option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          )}
          <button onClick={save} disabled={!board||loading} style={{width:'100%',padding:13,borderRadius:12,border:'none',background:(!board||loading)?c.border:'linear-gradient(135deg,#8B5CF6,#7C3AED)',color:'#fff',fontSize:14,fontWeight:700,opacity:!board?0.5:1}}>
            {loading?'Saving...':'Start Learning →'}
          </button>
        </div>
        <div style={{textAlign:'center',marginTop:16}}>
          <button onClick={()=>onDone(null)} style={{background:'none',border:'none',color:c.muted,fontSize:13}}>Skip for now</button>
        </div>
      </div>
    </div>
  )
}

// ── Premium Modal ──────────────────────────────────────────────────────────
function PremiumModal({ onClose, dark, user }){
  const c = C(dark)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function pay(){
    setLoading(true)
    try{
      await new Promise((res,rej)=>{
        if(window.Razorpay){ res(); return }
        const s = document.createElement('script'); s.src='https://checkout.razorpay.com/v1/checkout.js'; s.onload=res; s.onerror=rej; document.body.appendChild(s)
      })
      const r = await fetch('/api/payment', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ action:'create_order' }) })
      const od = await r.json()
      if(od.error){ alert('Payment error: '+od.error); setLoading(false); return }
      new window.Razorpay({
        key:od.keyId, amount:od.amount, currency:od.currency, order_id:od.orderId,
        name:'Memora Premium', description:'Unlimited AI messages per month',
        prefill:{ email:user?.email||'', name:user?.user_metadata?.name||'' },
        theme:{ color:'#8B5CF6' },
        handler: async(response)=>{
          const vr = await fetch('/api/payment', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ action:'verify_payment', ...response }) })
          const vd = await vr.json()
          if(vd.verified){ await supabase.from('profiles').update({ premium:true, premium_since:new Date().toISOString() }).eq('user_id',user.id); setDone(true) }
          else alert('Payment verification failed. Contact support.')
        },
        modal:{ ondismiss:()=>setLoading(false) }
      }).open()
    }catch(e){ alert('Payment error: '+e.message) }
    setLoading(false)
  }

  if(done) return(
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:20}}>
      <div style={{background:c.card,border:`1px solid ${c.border}`,borderRadius:20,padding:40,width:'100%',maxWidth:380,textAlign:'center'}} className="fade-up">
        <div style={{fontSize:56,marginBottom:14}}>🎉</div>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:24,fontWeight:800,color:c.text,marginBottom:10}}>You're Premium!</div>
        <div style={{fontSize:14,color:c.muted,marginBottom:28,lineHeight:1.7}}>Unlimited messages, all features unlocked. Study without limits.</div>
        <button onClick={()=>{onClose();window.location.reload()}} style={{width:'100%',padding:14,borderRadius:12,border:'none',background:'linear-gradient(135deg,#8B5CF6,#7C3AED)',color:'#fff',fontSize:15,fontWeight:700}}>Start Studying →</button>
      </div>
    </div>
  )

  const features = ['Unlimited AI messages every day','Unlimited interactive quizzes','Upload images, PDFs & URLs','Syllabus PDF upload & analysis','Priority AI response speed','Advanced progress analytics']
  return(
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:20,overflowY:'auto'}}>
      <div style={{background:c.card,border:`1px solid ${c.border}`,borderRadius:20,padding:32,width:'100%',maxWidth:440}} className="fade-up">
        <div style={{textAlign:'center',marginBottom:26}}>
          <div style={{fontSize:44,marginBottom:10}}>⭐</div>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:24,fontWeight:800,color:c.text,letterSpacing:-0.5}}>Memora Premium</div>
          <div style={{fontSize:13,color:c.muted,marginTop:4}}>Study without any limits</div>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:24}}>
          {features.map((f,i)=>(<div key={i} style={{display:'flex',alignItems:'center',gap:12,padding:'9px 14px',background:c.card2,borderRadius:10}}><span style={{color:'#10B981',fontWeight:700,flexShrink:0}}>✓</span><span style={{fontSize:13,color:c.text}}>{f}</span></div>))}
        </div>
        <div style={{background:'linear-gradient(135deg,#8B5CF6,#7C3AED)',borderRadius:14,padding:'18px 24px',textAlign:'center',marginBottom:16}}>
          <div style={{fontSize:30,fontWeight:800,color:'#fff',fontFamily:"'Syne',sans-serif",letterSpacing:-0.5}}>₹99 <span style={{fontSize:16,fontWeight:400,opacity:0.8}}>/ month</span></div>
          <div style={{fontSize:12,color:'rgba(255,255,255,0.65)',marginTop:4}}>Cancel anytime • Instant access</div>
        </div>
        <button onClick={pay} disabled={loading} style={{width:'100%',padding:14,borderRadius:12,border:'none',background:loading?c.border:'linear-gradient(135deg,#8B5CF6,#7C3AED)',color:'#fff',fontSize:15,fontWeight:700,marginBottom:10}}>
          {loading?'Loading payment...':'Pay ₹99 & Upgrade Now'}
        </button>
        <div style={{fontSize:11,color:c.muted,textAlign:'center',marginBottom:14}}>🔒 Secure payment by Razorpay</div>
        <button onClick={onClose} style={{width:'100%',padding:11,borderRadius:10,border:`1px solid ${c.border}`,background:'transparent',color:c.muted,fontSize:13}}>Maybe later</button>
      </div>
    </div>
  )
}

// ── Quiz Card — clickable A/B/C/D with instant explanation ─────────────────
function QuizCard({ quiz, onAnswer, onNext, onEnd, score, total, dark }){
  const c = C(dark)
  const [sel, setSel] = useState(null)
  const [revealed, setRevealed] = useState(false)

  function submit(){
    if(!sel) return
    setRevealed(true)
    onAnswer(sel===quiz.correct, sel)
  }
  function next(){ setSel(null); setRevealed(false); onNext() }

  return(
    <div style={{background:c.card,border:`1px solid ${c.border}`,borderRadius:16,padding:'20px 18px',maxWidth:'90%',marginTop:10}} className="msg-in">
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <span style={{fontSize:12,color:c.muted,fontWeight:500}}>Q.{total+1}</span>
          <div style={{height:3,width:80,background:c.card2,borderRadius:2,overflow:'hidden'}}>
            <div style={{height:'100%',width:total>0?Math.min((score/total)*100,100)+'%':'0%',background:'#10B981',borderRadius:2,transition:'width 0.4s'}}/>
          </div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <span style={{fontSize:12,fontWeight:700,color:'#10B981'}}>✅ {score}/{total}</span>
          <button onClick={onEnd} style={{fontSize:11,color:c.red,background:'none',border:`1px solid ${c.red}44`,borderRadius:8,padding:'3px 10px',fontWeight:500}}>End</button>
        </div>
      </div>
      <div style={{fontSize:15,fontWeight:600,color:c.text,marginBottom:18,lineHeight:1.55}}>{quiz.question}</div>
      <div style={{display:'flex',flexDirection:'column',gap:9,marginBottom:16}}>
        {Object.entries(quiz.options).map(([letter,text])=>{
          let bg=c.card2, border=c.border, col=c.text
          if(revealed){
            if(letter===quiz.correct){ bg='rgba(16,185,129,0.1)'; border='#10B981'; col='#10B981' }
            else if(sel===letter){ bg='rgba(239,68,68,0.1)'; border='#EF4444'; col='#EF4444' }
          } else if(sel===letter){ bg='rgba(139,92,246,0.1)'; border='#8B5CF6'; col='#8B5CF6' }
          return(
            <button key={letter} onClick={()=>!revealed&&setSel(letter)}
              style={{padding:'12px 16px',borderRadius:10,border:`1px solid ${border}`,background:bg,color:col,fontSize:14,textAlign:'left',cursor:revealed?'default':'pointer',transition:'all 0.15s',fontWeight:sel===letter?600:400,display:'flex',alignItems:'center',gap:10}}>
              <span style={{width:24,height:24,borderRadius:'50%',border:`1.5px solid ${border}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,flexShrink:0,color:col}}>{letter}</span>
              <span style={{flex:1}}>{text}</span>
              {revealed&&letter===quiz.correct&&<span style={{fontSize:16}}>✅</span>}
              {revealed&&sel===letter&&letter!==quiz.correct&&<span style={{fontSize:16}}>❌</span>}
            </button>
          )
        })}
      </div>
      {!revealed?(
        <button onClick={submit} disabled={!sel} style={{width:'100%',padding:'11px',borderRadius:10,border:'none',background:sel?'linear-gradient(135deg,#8B5CF6,#7C3AED)':c.border,color:'#fff',fontSize:14,fontWeight:700,opacity:sel?1:0.5}}>
          Submit Answer
        </button>
      ):(
        <div>
          <div style={{padding:'12px 16px',borderRadius:10,background:sel===quiz.correct?'rgba(16,185,129,0.08)':'rgba(239,68,68,0.08)',border:`1px solid ${sel===quiz.correct?'rgba(16,185,129,0.3)':'rgba(239,68,68,0.3)'}`,marginBottom:12,textAlign:'center'}}>
            <div style={{fontSize:15,fontWeight:700,color:sel===quiz.correct?'#10B981':'#EF4444'}}>
              {sel===quiz.correct?'🎉 Correct! Well done.':'❌ Wrong answer!'}
            </div>
            {sel!==quiz.correct&&<div style={{fontSize:13,color:c.muted,marginTop:4}}>Correct answer: <strong style={{color:'#10B981'}}>{quiz.correct}) {quiz.options[quiz.correct]}</strong></div>}
          </div>
          <div style={{display:'flex',gap:8}}>
            <button onClick={next} style={{flex:1,padding:'11px',borderRadius:10,border:'none',background:'linear-gradient(135deg,#8B5CF6,#7C3AED)',color:'#fff',fontSize:14,fontWeight:700}}>Next Question →</button>
            <button onClick={onEnd} style={{padding:'11px 16px',borderRadius:10,border:`1px solid ${c.border}`,background:'transparent',color:c.muted,fontSize:13}}>End Quiz</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Chat Tab — starts FRESH every login / reopen, no auto-load from DB ──────
function ChatTab({ user, notes, profile, onSaveNote, weakTopics, setWeakTopics, isPremium, dark, onUpgrade, aiMode }){
  const c = C(dark)
  // FIX: messages start EMPTY — no DB load on mount → fresh session every time
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [mode, setMode] = useState('chat')
  const [typing, setTyping] = useState(false)
  const [usage, setUsage] = useState(0)
  const [attachment, setAttachment] = useState(null)
  const [urlInput, setUrlInput] = useState('')
  const [showAttach, setShowAttach] = useState(false)
  const [syllabus, setSyllabus] = useState(null)
  const [syllabusName, setSyllabusName] = useState(null)
  const [parsingSyllabus, setParsingSyllabus] = useState(false)
  const [quizTopic, setQuizTopic] = useState(null)
  const [quizScore, setQuizScore] = useState(0)
  const [quizTotal, setQuizTotal] = useState(0)
  const [currentQuiz, setCurrentQuiz] = useState(null)
  const [quizMsgId, setQuizMsgId] = useState(null)
  const [loadingNext, setLoadingNext] = useState(false)
  const bottomRef = useRef(null)
  const fileRef = useRef(null)
  const syllabusRef = useRef(null)

  // Only load usage count — NOT message history
  useEffect(()=>{
    supabase.from('usage').select('count').eq('user_id',user.id).eq('date',today()).single().then(({data})=>{
      if(data) setUsage(data.count)
    })
  },[])

  useEffect(()=>{ bottomRef.current?.scrollIntoView({ behavior:'smooth' }) },[messages, typing, currentQuiz])

  async function trackUsage(){
    const { data } = await supabase.from('usage').select('count').eq('user_id',user.id).eq('date',today()).single()
    if(data){ await supabase.from('usage').update({ count:data.count+1 }).eq('user_id',user.id).eq('date',today()); setUsage(v=>v+1) }
    else { await supabase.from('usage').insert({ user_id:user.id, date:today(), count:1 }); setUsage(1) }
  }

  function handleFile(e){
    const file = e.target.files[0]; if(!file) return
    if(file.type.startsWith('image/')){ const r=new FileReader(); r.onload=ev=>setAttachment({type:'image',data:ev.target.result,preview:file.name}); r.readAsDataURL(file) }
    else alert('Only image files supported.')
    setShowAttach(false)
  }

  async function handleSyllabusPDF(e){
    const file = e.target.files[0]; if(!file) return
    if(!file.name.endsWith('.pdf')){ alert('Please upload a PDF file.'); return }
    setParsingSyllabus(true); setShowAttach(false)
    try{
      const reader = new FileReader()
      reader.onload = async ev => {
        try{
          const arr = new Uint8Array(ev.target.result)
          let text = ''
          for(let i=0;i<arr.length;i++){ const ch=arr[i]; if(ch>=32&&ch<=126) text+=String.fromCharCode(ch); else if(ch===10||ch===13) text+=' ' }
          text = text.replace(/\s+/g,' ').trim()
          if(text.length<80){ alert('Could not extract text. Use a text-based PDF, not a scanned image.'); setParsingSyllabus(false); return }
          const res = await fetch('/api/parse-pdf', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ text }) })
          const data = await res.json()
          if(data.syllabus){ setSyllabus(data.syllabus); setSyllabusName(file.name) }
          else alert('Could not parse syllabus. Try a different PDF.')
        }catch(err){ alert('PDF parsing failed: '+err.message) }
        setParsingSyllabus(false)
      }
      reader.readAsArrayBuffer(file)
    }catch(err){ alert('Error reading file.'); setParsingSyllabus(false) }
  }

  function addUrl(){ if(!urlInput.trim()) return; setAttachment({ type:'url', data:urlInput.trim(), preview:urlInput.trim() }); setUrlInput(''); setShowAttach(false) }

  function buildSystem(){
    if(aiMode==='general'){
      return 'You are Memora, a helpful and friendly AI assistant. You can help with anything — answer questions, have conversations, help with creative tasks, give advice, or just chat. Be warm and engaging. Format responses clearly.'
    }
    let sys = 'You are Memora, a precise and expert AI study assistant for Indian students.'
    if(profile?.board) sys += ' Student course: '+profile.board+'.'
    if(profile?.subject) sys += ' Subject: '+profile.subject+'.'
    if(syllabus){ sys += '\n\nSTRICT RULE: Student uploaded their EXACT syllabus. Follow ONLY these units and topics:\n'+syllabus+'\nDo not add any content outside this syllabus.' }
    else sys += ' Follow the standard curriculum. Cover ALL units completely — never stop at Unit 1.'
    sys += ' Rules: ## for unit headings, **bold** key terms, numbered lists for steps, - for bullet points. Be exam-focused.'
    if(mode==='summarize') sys += ' Task: Give structured unit-wise summary. Cover ALL units. Keep points exam-relevant.'
    if(mode==='explain') sys += ' Task: Explain with simple language and real examples. Use numbered steps. Beginner-friendly.'
    if(mode==='flashcard') sys += ' Task: Generate 5 flashcard-style Q&A pairs. Format as:\nQ: [question]\nA: [concise answer]\n\nRepeat for each card.'
    if(mode==='quiz') sys += ' Task: Generate EXACTLY 1 MCQ. Put EACH part on a new line in EXACTLY this format:\nQUESTION: [question text]\nA) [option A]\nB) [option B]\nC) [option C]\nD) [option D]\nANSWER: [only A, B, C, or D]'
    if(mode==='predict') sys += ' Task: Predict the most likely exam questions. List top 5-8 probable questions with brief hints.'
    if(notes.length>0) sys += '\n\nStudent saved notes:\n'+notes.map(n=>'['+n.tag+'] '+n.title+': '+n.body).join('\n')
    if(weakTopics.length>0) sys += '\n\nWeak topics needing attention: '+weakTopics.join(', ')
    return sys
  }

  async function send(){
    const query = input.trim()
    if(!query||typing) return
    if(usage>=(isPremium?9999:FREE_LIMIT)){ onUpgrade(); return }
    setInput('')
    const attNote = attachment?.type==='url' ? ' [URL: '+attachment.data+']' : ''
    const userMsg = { id:Date.now(), user_id:user.id, role:'user', content:query+attNote, created_at:new Date().toISOString() }
    setMessages(p=>[...p,userMsg]); setTyping(true)
    await supabase.from('messages').insert({ user_id:user.id, role:'user', content:userMsg.content })
    const apiMsgs = [...messages, userMsg].slice(-14).map(m=>({ role:m.role==='ai'?'assistant':'user', content:m.content }))
    const img = attachment?.type==='image' ? attachment.data : null
    const url = attachment?.type==='url' ? attachment.data : null
    setAttachment(null)
    try{
      await trackUsage()
      const reply = await callAI(apiMsgs, buildSystem(), img, url)
      const aiId = Date.now()+1
      const aiMsg = { id:aiId, user_id:user.id, role:'ai', content:reply, created_at:new Date().toISOString() }
      setMessages(p=>[...p,aiMsg])
      await supabase.from('messages').insert({ user_id:user.id, role:'ai', content:reply })
      // FIX: detect MCQ in ALL modes, not just quiz mode — shows clickable options always
      const parsed = parseQuiz(reply)
      if(parsed){
        setCurrentQuiz(parsed); setQuizMsgId(aiId)
        if(!quizTopic){ setQuizTopic(query); setQuizScore(0); setQuizTotal(0) }
      }
    }catch(e){
      const msg = e.message==='RATE_LIMIT' ? '⏳ AI is on a short break due to high usage. Wait 1-2 minutes and try again.' : 'Sorry, something went wrong. Please try again.'
      setMessages(p=>[...p,{id:Date.now()+1,role:'ai',content:msg,created_at:new Date().toISOString()}])
    }
    setTyping(false)
  }

  async function onQuizAnswer(correct){
    setQuizScore(s=>s+(correct?1:0))
    setQuizTotal(t=>t+1)
    if(!correct&&quizTopic&&!weakTopics.includes(quizTopic)){
      const up = [...weakTopics, quizTopic]; setWeakTopics(up)
      supabase.from('profiles').update({ weak_topics:up }).eq('user_id',user.id)
    }
  }

  async function onNextQuestion(){
    setLoadingNext(true); setCurrentQuiz(null)
    if(usage>=(isPremium?9999:FREE_LIMIT)){ onUpgrade(); setLoadingNext(false); return }
    try{
      await trackUsage()
      const reply = await callAI([{role:'user',content:'Next question on '+quizTopic}], buildSystem(), null, null)
      const aiId = Date.now()+1
      const aiMsg = { id:aiId, role:'ai', content:reply, created_at:new Date().toISOString() }
      setMessages(p=>[...p,aiMsg])
      await supabase.from('messages').insert({ user_id:user.id, role:'ai', content:reply })
      const parsed = parseQuiz(reply)
      if(parsed){ setCurrentQuiz(parsed); setQuizMsgId(aiId) }
    }catch(e){
      setMessages(p=>[...p,{id:Date.now()+1,role:'ai',content:e.message==='RATE_LIMIT'?'⏳ Wait 1-2 minutes.':'Error. Try again.',created_at:new Date().toISOString()}])
    }
    setLoadingNext(false)
  }

  function endQuiz(){
    const sc=quizScore, tot=quizTotal
    setCurrentQuiz(null); setQuizTopic(null); setQuizScore(0); setQuizTotal(0); setMode('chat')
    if(tot>0){
      const pct = Math.round(sc/tot*100)
      const summary = { id:Date.now(), role:'ai', content:`## 📊 Quiz Completed!\n\nYour score: **${sc} / ${tot}** (${pct}%)\n\n${pct>=80?'🎉 Excellent! Keep it up.':pct>=60?'👍 Good effort. Review the topics you missed.':'📚 Keep practicing. Focus on weak topics.'}\n\n${sc<tot?`Consider reviewing: **${quizTopic}**`:''}`, created_at:new Date().toISOString() }
      setMessages(p=>[...p,summary])
    }
  }

  const studyModes = [
    {id:'chat',label:'💬 Chat',color:'#8B5CF6'},
    {id:'summarize',label:'📋 Summarize',color:'#10B981'},
    {id:'explain',label:'🔍 Explain',color:'#F59E0B'},
    {id:'quiz',label:'🧩 Quiz',color:'#EF4444'},
    {id:'flashcard',label:'📇 Flashcards',color:'#3B82F6'},
    {id:'predict',label:'🎯 Predict',color:'#EC4899'},
  ]

  const limitHit = !isPremium && usage>=FREE_LIMIT
  const userName = user.user_metadata?.name||user.email.split('@')[0]

  return(
    <div style={{display:'flex',flexDirection:'column',height:'100%',overflow:'hidden'}}>
      {/* Status bar */}
      <div style={{padding:'5px 16px',background:c.card2,borderBottom:`1px solid ${c.border}`,display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0,flexWrap:'wrap',gap:4,minHeight:32}}>
        <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
          {aiMode==='study'&&<span style={{fontSize:11,color:'#8B5CF6',fontWeight:500}}>{profile?.board?'🎯 '+profile.board+(profile.subject?' · '+profile.subject:''):'🎯 No board set'}</span>}
          {aiMode==='general'&&<span style={{fontSize:11,color:'#10B981',fontWeight:500}}>💬 General AI Mode</span>}
          {parsingSyllabus&&<span style={{fontSize:11,color:'#F59E0B',animation:'pulse 1.5s infinite'}}>📄 Parsing syllabus...</span>}
          {syllabus&&!parsingSyllabus&&(<div style={{display:'flex',alignItems:'center',gap:4,background:'rgba(16,185,129,0.1)',border:'1px solid rgba(16,185,129,0.25)',borderRadius:10,padding:'2px 8px'}}><span style={{fontSize:11,color:'#10B981',fontWeight:500}}>📋 {syllabusName||'Syllabus'}</span><button onClick={()=>{setSyllabus(null);setSyllabusName(null)}} style={{background:'none',border:'none',color:'#10B981',fontSize:11,padding:0}}>✕</button></div>)}
        </div>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          {isPremium?<Chip text="⭐ Premium" color="#F59E0B"/>:(
            <><div style={{width:64,height:3,background:c.border,borderRadius:2,overflow:'hidden'}}><div style={{width:Math.min((usage/FREE_LIMIT)*100,100)+'%',height:'100%',background:limitHit?c.red:'#8B5CF6',borderRadius:2,transition:'width 0.4s'}}/></div><span style={{fontSize:11,color:limitHit?c.red:c.muted}}>{FREE_LIMIT-usage} left</span><button onClick={onUpgrade} style={{fontSize:10,background:'rgba(139,92,246,0.1)',border:'1px solid rgba(139,92,246,0.25)',borderRadius:8,color:'#8B5CF6',padding:'2px 8px',fontWeight:600}}>⭐ Pro</button></>
          )}
        </div>
      </div>

      {/* Messages */}
      <div style={{flex:1,overflowY:'auto',padding:'20px 16px'}}>
        {messages.length===0&&(
          <div style={{textAlign:'center',padding:'48px 16px',color:c.muted}}>
            <div style={{fontSize:44,marginBottom:12}}>{aiMode==='general'?'💬':'🧠'}</div>
            <div style={{fontSize:18,fontWeight:700,color:c.text,marginBottom:8,fontFamily:"'Syne',sans-serif",letterSpacing:-0.3}}>Hi {userName}!</div>
            <div style={{fontSize:14,lineHeight:1.7,marginBottom:28,maxWidth:440,margin:'0 auto 28px'}}>
              {aiMode==='general'?'Ask me anything — I can help with any topic or just have a conversation.':'Ask anything from your syllabus. I\'ll explain, summarize, quiz you, or predict exam questions.'}
            </div>
            <div style={{display:'flex',gap:8,justifyContent:'center',flexWrap:'wrap'}}>
              {(aiMode==='general'
                ?["What's quantum computing?","Write a short poem about India","Help me with a cover letter"]
                :["Explain Newton's laws simply","Summarize the water cycle","Quiz me on Photosynthesis","Predict exam questions for Trigonometry"]
              ).map(s=>(<button key={s} onClick={()=>setInput(s)} style={{padding:'7px 14px',borderRadius:20,border:`1px solid ${c.border}`,background:'transparent',color:c.muted,fontSize:12}}>{s}</button>))}
            </div>
          </div>
        )}

        {messages.map(m=>(
          <div key={m.id} style={{display:'flex',gap:10,marginBottom:18,flexDirection:m.role==='user'?'row-reverse':'row',alignItems:'flex-start'}} className="msg-in">
            {m.role==='ai'&&(
              <div style={{flexShrink:0,marginTop:2}}>
                <div style={{width:28,height:28,borderRadius:'50%',background:'linear-gradient(135deg,#8B5CF6,#7C3AED)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14}}>🧠</div>
              </div>
            )}
            <div style={{maxWidth:'80%',display:'flex',flexDirection:'column',alignItems:m.role==='user'?'flex-end':'flex-start'}}>
              {/* Don't show raw text for quiz messages that have a QuizCard */}
              {!(m.role==='ai'&&m.id===quizMsgId&&currentQuiz)&&(
                <div style={{padding:'11px 16px',borderRadius:m.role==='user'?'18px 18px 4px 18px':'18px 18px 18px 4px',background:m.role==='user'?'linear-gradient(135deg,#8B5CF6,#7C3AED)':c.card,border:m.role==='ai'?`1px solid ${c.border}`:'none',color:m.role==='user'?'#fff':c.text,fontSize:14,lineHeight:1.7}}>
                  {m.role==='ai'?<MD content={m.content} dark={dark}/>:m.content}
                </div>
              )}
              {/* FIX: QuizCard renders for current active quiz message */}
              {m.role==='ai'&&m.id===quizMsgId&&currentQuiz&&(
                <QuizCard quiz={currentQuiz} onAnswer={onQuizAnswer} onNext={onNextQuestion} onEnd={endQuiz} score={quizScore} total={quizTotal} dark={dark}/>
              )}
              {m.role==='ai'&&<button onClick={()=>onSaveNote(m.content)} style={{fontSize:11,color:'#8B5CF6',background:'none',border:'none',padding:'5px 0 0',cursor:'pointer',textAlign:'left',opacity:0.7}}>＋ Save as note</button>}
            </div>
          </div>
        ))}

        {(typing||loadingNext)&&(
          <div style={{display:'flex',gap:10,marginBottom:18,alignItems:'flex-start'}}>
            <div style={{width:28,height:28,borderRadius:'50%',background:'linear-gradient(135deg,#8B5CF6,#7C3AED)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,flexShrink:0}}>🧠</div>
            <div style={{padding:'12px 16px',background:c.card,border:`1px solid ${c.border}`,borderRadius:'18px 18px 18px 4px',display:'flex',gap:5,alignItems:'center'}}>
              {[0,1,2].map(i=><span key={i} style={{width:6,height:6,borderRadius:'50%',background:c.muted,display:'inline-block',animation:'bounce 1.1s ease infinite',animationDelay:i*0.18+'s'}}/>)}
            </div>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      {/* Attachment preview */}
      {attachment&&(
        <div style={{padding:'6px 16px',borderTop:`1px solid ${c.border}`,background:c.card2,display:'flex',alignItems:'center',gap:8}}>
          <span style={{fontSize:12,color:'#8B5CF6'}}>📎 {attachment.type==='image'?'Image':'URL'}: {attachment.preview.slice(0,50)}</span>
          <button onClick={()=>setAttachment(null)} style={{background:'none',border:'none',color:c.red,fontSize:14,padding:0}}>✕</button>
        </div>
      )}

      {/* Attach panel */}
      {showAttach&&(
        <div style={{padding:'10px 16px',borderTop:`1px solid ${c.border}`,background:c.card2}}>
          <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
            <input value={urlInput} onChange={e=>setUrlInput(e.target.value)} placeholder="Paste URL to analyze..." style={{flex:1,minWidth:140,padding:'8px 12px',borderRadius:8,border:`1px solid ${c.border}`,background:c.card,color:c.text,fontSize:13}} onKeyDown={e=>e.key==='Enter'&&addUrl()}/>
            <button onClick={addUrl} style={{padding:'8px 14px',borderRadius:8,border:'none',background:'#8B5CF6',color:'#fff',fontSize:12,fontWeight:600}}>Add URL</button>
            <button onClick={()=>fileRef.current.click()} style={{padding:'8px 12px',borderRadius:8,border:`1px solid ${c.border}`,background:'transparent',color:c.muted,fontSize:12}}>📷 Image</button>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{display:'none'}}/>
            <button onClick={()=>syllabusRef.current.click()} style={{padding:'8px 12px',borderRadius:8,border:'1px solid rgba(16,185,129,0.3)',background:'rgba(16,185,129,0.08)',color:'#10B981',fontSize:12,fontWeight:500}}>📋 Syllabus PDF</button>
            <input ref={syllabusRef} type="file" accept=".pdf" onChange={handleSyllabusPDF} style={{display:'none'}}/>
            <button onClick={()=>setShowAttach(false)} style={{background:'none',border:'none',color:c.muted,fontSize:20,padding:0,lineHeight:1}}>✕</button>
          </div>
        </div>
      )}

      {/* Input area */}
      <div style={{padding:'12px 16px 16px',borderTop:`1px solid ${c.border}`,background:c.bg,flexShrink:0}}>
        {limitHit&&(
          <div style={{fontSize:13,color:c.red,background:'rgba(239,68,68,0.06)',border:'1px solid rgba(239,68,68,0.15)',borderRadius:8,padding:'8px 14px',marginBottom:10,textAlign:'center',cursor:'pointer'}} onClick={onUpgrade}>
            Daily limit reached. <span style={{textDecoration:'underline',fontWeight:700}}>Upgrade to Premium ⭐</span>
          </div>
        )}
        {aiMode==='study'&&(
          <div style={{display:'flex',gap:6,marginBottom:10,flexWrap:'wrap'}}>
            {studyModes.map(m=>(<button key={m.id} onClick={()=>setMode(m.id)} style={{padding:'4px 12px',borderRadius:20,border:`1px solid ${mode===m.id?m.color:c.border}`,background:mode===m.id?m.color+'18':'transparent',color:mode===m.id?m.color:c.muted,fontSize:12,fontWeight:mode===m.id?600:400}}>{m.label}</button>))}
          </div>
        )}
        <div style={{display:'flex',gap:8,alignItems:'flex-end'}}>
          <button onClick={()=>setShowAttach(!showAttach)} style={{padding:'11px 12px',borderRadius:10,border:`1px solid ${c.border}`,background:showAttach?'rgba(139,92,246,0.1)':'transparent',color:showAttach?'#8B5CF6':c.muted,fontSize:18,flexShrink:0,lineHeight:1}}>📎</button>
          <textarea value={input} onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>{ if(e.key==='Enter'&&!e.shiftKey){ e.preventDefault(); send() } }}
            placeholder={mode==='quiz'?'Enter topic to start quiz (e.g. Photosynthesis)...':aiMode==='general'?'Ask me anything...':'Ask anything from your syllabus...'}
            disabled={limitHit} rows={1}
            style={{flex:1,padding:'11px 14px',borderRadius:10,border:`1px solid ${c.border}`,background:c.card,color:c.text,fontSize:14,resize:'none',maxHeight:120,lineHeight:1.5,overflowY:'auto'}}
            onInput={e=>{ e.target.style.height='auto'; e.target.style.height=Math.min(e.target.scrollHeight,120)+'px' }}
          />
          <button onClick={send} disabled={typing||!input.trim()||limitHit}
            style={{padding:'11px 20px',borderRadius:10,border:'none',background:(typing||!input.trim()||limitHit)?c.border:'linear-gradient(135deg,#8B5CF6,#7C3AED)',color:'#fff',fontSize:13,fontWeight:700,flexShrink:0,opacity:(typing||!input.trim()||limitHit)?0.5:1}}>
            Send
          </button>
        </div>
        <div style={{fontSize:11,color:c.muted,marginTop:6,textAlign:'center'}}>Enter to send · Shift+Enter for new line{aiMode==='study'?' · Upload syllabus PDF for exact answers':''}</div>
      </div>
    </div>
  )
}

// ── History Tab — loads old chats FROM DB only when this tab is opened ──────
function HistoryTab({ user, dark }){
  const c = C(dark)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  useEffect(()=>{
    supabase.from('messages').select('*').eq('user_id',user.id).order('created_at',{ascending:true}).then(({data})=>{
      if(data) setMessages(data)
      setLoading(false)
    })
  },[])

  // Group by date
  const grouped = {}
  messages.forEach(m=>{
    const date = m.created_at?.split('T')[0]||'Unknown'
    if(!grouped[date]) grouped[date] = []
    grouped[date].push(m)
  })

  const filtered = filter.trim()
    ? messages.filter(m=>m.content.toLowerCase().includes(filter.toLowerCase()))
    : null

  function formatDate(d){
    try{ const dt=new Date(d); return dt.toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short',year:'numeric'}) }
    catch{ return d }
  }

  return(
    <div style={{display:'flex',flexDirection:'column',height:'100%',overflow:'hidden'}}>
      <div style={{padding:'14px 16px',borderBottom:`1px solid ${c.border}`,flexShrink:0}}>
        <div style={{fontSize:16,fontWeight:700,color:c.text,marginBottom:10}}>Chat History</div>
        <div style={{display:'flex',alignItems:'center',gap:10,background:c.card,border:`1px solid ${c.border}`,borderRadius:10,padding:'9px 14px'}}>
          <span style={{fontSize:16,opacity:0.5}}>🔍</span>
          <input value={filter} onChange={e=>setFilter(e.target.value)} placeholder="Search past chats..." style={{flex:1,background:'none',border:'none',outline:'none',color:c.text,fontSize:14}} autoFocus/>
          {filter&&<button onClick={()=>setFilter('')} style={{background:'none',border:'none',color:c.muted,fontSize:16,padding:0}}>✕</button>}
        </div>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'14px 16px'}}>
        {loading&&<div style={{textAlign:'center',padding:40,color:c.muted,animation:'pulse 1.5s infinite'}}>Loading history...</div>}
        {!loading&&messages.length===0&&(
          <div style={{textAlign:'center',padding:'60px 16px',color:c.muted}}>
            <div style={{fontSize:36,marginBottom:12}}>💬</div>
            <div style={{fontSize:15,fontWeight:600,color:c.text,marginBottom:6}}>No history yet</div>
            <div style={{fontSize:13}}>Your past conversations will appear here.</div>
          </div>
        )}
        {/* Search results */}
        {filtered&&(
          <div>
            <div style={{fontSize:12,color:c.muted,marginBottom:12}}>{filtered.length} result{filtered.length!==1?'s':''} found</div>
            {filtered.length===0&&<div style={{textAlign:'center',padding:40,color:c.muted,fontSize:14}}>No results for "{filter}"</div>}
            {filtered.map(m=>(
              <div key={m.id} style={{marginBottom:10,display:'flex',gap:8,flexDirection:m.role==='user'?'row-reverse':'row'}}>
                <div style={{maxWidth:'80%',padding:'10px 14px',borderRadius:12,background:m.role==='user'?'rgba(139,92,246,0.15)':c.card,border:m.role==='ai'?`1px solid ${c.border}`:'none',fontSize:13,color:c.text,lineHeight:1.6}}>
                  {m.content.slice(0,200)}{m.content.length>200?'...':''}
                </div>
              </div>
            ))}
          </div>
        )}
        {/* Grouped by date */}
        {!filtered&&Object.keys(grouped).reverse().map(date=>(
          <div key={date} style={{marginBottom:24}}>
            <div style={{fontSize:11,color:c.muted,fontWeight:600,textTransform:'uppercase',letterSpacing:0.5,marginBottom:12,padding:'4px 0',borderBottom:`1px solid ${c.border}`}}>{formatDate(date)}</div>
            {grouped[date].map(m=>(
              <div key={m.id} style={{marginBottom:8,display:'flex',gap:8,flexDirection:m.role==='user'?'row-reverse':'row'}}>
                {m.role==='ai'&&<div style={{width:22,height:22,borderRadius:'50%',background:'linear-gradient(135deg,#8B5CF6,#7C3AED)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,flexShrink:0,marginTop:2}}>🧠</div>}
                <div style={{maxWidth:'78%',padding:'9px 14px',borderRadius:m.role==='user'?'14px 14px 4px 14px':'14px 14px 14px 4px',background:m.role==='user'?'linear-gradient(135deg,#8B5CF6,#7C3AED)':c.card,border:m.role==='ai'?`1px solid ${c.border}`:'none',fontSize:13,color:m.role==='user'?'#fff':c.text,lineHeight:1.6}}>
                  {m.content.slice(0,300)}{m.content.length>300?'...':''}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Notes Tab ──────────────────────────────────────────────────────────────
function NotesTab({ user, notes, setNotes, prefill, clearPrefill, dark }){
  const c = C(dark)
  const [filter, setFilter] = useState('')
  const [tag, setTag] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({title:'',body:'',tag:''})
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)

  useEffect(()=>{ supabase.from('notes').select('*').eq('user_id',user.id).order('created_at',{ascending:false}).then(({data})=>{ if(data) setNotes(data); setLoading(false) }) },[])
  useEffect(()=>{ if(prefill){ setForm({title:'AI Response',body:prefill.slice(0,900),tag:'ai'}); setShowModal(true); clearPrefill() } },[prefill])

  async function save(){
    if(!form.title.trim()||!form.body.trim()) return
    const { data, error } = await supabase.from('notes').insert({ user_id:user.id, title:form.title.trim(), body:form.body.trim(), tag:form.tag.trim()||'general' }).select().single()
    if(!error&&data){ setNotes(p=>[data,...p]); setShowModal(false); setForm({title:'',body:'',tag:''}) }
  }
  async function del(id){ await supabase.from('notes').delete().eq('id',id); setNotes(p=>p.filter(n=>n.id!==id)) }

  const allTags = ['all',...[...new Set(notes.map(n=>n.tag))]]
  const tagColor = {math:'#F59E0B',physics:'#10B981',ai:'#8B5CF6',chemistry:'#EF4444',biology:'#3B82F6',general:c.muted,default:'#8B5CF6'}
  const getTc = t => tagColor[t]||tagColor.default
  const filtered = notes.filter(n=>{
    const mf = !filter.trim()||n.title.toLowerCase().includes(filter.toLowerCase())||n.body.toLowerCase().includes(filter.toLowerCase())
    const mt = tag==='all'||n.tag===tag
    return mf&&mt
  })
  const fld = {width:'100%',padding:'10px 14px',borderRadius:10,border:`1px solid ${c.border}`,background:c.card2,color:c.text,fontSize:13}

  return(
    <div style={{display:'flex',flexDirection:'column',height:'100%',overflow:'hidden'}}>
      <div style={{padding:'12px 16px',borderBottom:`1px solid ${c.border}`,flexShrink:0,display:'flex',flexDirection:'column',gap:10}}>
        <div style={{display:'flex',gap:8}}>
          <input value={filter} onChange={e=>setFilter(e.target.value)} placeholder="Search notes..." style={{...fld,flex:1}}/>
          <button onClick={()=>{setForm({title:'',body:'',tag:''});setShowModal(true)}} style={{padding:'10px 16px',borderRadius:10,border:'none',background:'linear-gradient(135deg,#8B5CF6,#7C3AED)',color:'#fff',fontSize:13,fontWeight:600,whiteSpace:'nowrap',flexShrink:0}}>＋ Add note</button>
        </div>
        {allTags.length>1&&(
          <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
            {allTags.map(t=>(<button key={t} onClick={()=>setTag(t)} style={{padding:'3px 10px',borderRadius:20,border:`1px solid ${tag===t?getTc(t):c.border}`,background:tag===t?getTc(t)+'18':'transparent',color:tag===t?getTc(t):c.muted,fontSize:11,fontWeight:tag===t?600:400,textTransform:'capitalize'}}>{t}</button>))}
          </div>
        )}
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'14px 16px'}}>
        {loading&&<div style={{textAlign:'center',padding:40,color:c.muted,animation:'pulse 1.5s infinite'}}>Loading notes...</div>}
        {!loading&&filtered.length===0&&<div style={{textAlign:'center',padding:'50px 16px',color:c.muted}}><div style={{fontSize:36,marginBottom:12}}>📝</div><div style={{fontSize:15,fontWeight:600,color:c.text,marginBottom:6}}>No notes yet</div><div style={{fontSize:13}}>{filter||tag!=='all'?'No matching notes.':'Save AI responses or add your own notes here.'}</div></div>}
        <div style={{display:'grid',gap:12}}>
          {filtered.map(n=>(
            <div key={n.id} style={{background:c.card,border:`1px solid ${c.border}`,borderRadius:14,overflow:'hidden'}}>
              <div style={{padding:'14px 16px',cursor:'pointer'}} onClick={()=>setExpanded(expanded===n.id?null:n.id)}>
                <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:10}}>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:600,fontSize:14,color:c.text,marginBottom:4}}>{n.title}</div>
                    {expanded!==n.id&&<div style={{fontSize:12,color:c.muted,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{n.body.replace(/[#*`_]/g,'').slice(0,100)}</div>}
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:6,flexShrink:0}}>
                    <Chip text={n.tag} color={getTc(n.tag)}/>
                    <button onClick={e=>{e.stopPropagation();del(n.id)}} style={{fontSize:12,color:c.red,background:'none',border:'none',padding:'2px 6px',borderRadius:6}}>✕</button>
                    <span style={{color:c.muted,fontSize:11}}>{expanded===n.id?'▲':'▼'}</span>
                  </div>
                </div>
              </div>
              {expanded===n.id&&<div style={{padding:'0 16px 16px',borderTop:`1px solid ${c.border}`}}><div style={{paddingTop:14}}><MD content={n.body} dark={dark}/></div></div>}
            </div>
          ))}
        </div>
      </div>
      {showModal&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:999,padding:20}}>
          <div style={{background:c.card,border:`1px solid ${c.border}`,borderRadius:18,padding:28,width:'100%',maxWidth:460}} className="fade-up">
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:800,marginBottom:20,color:c.text}}>Save Note 📝</div>
            <div style={{marginBottom:14}}><label style={{fontSize:11,color:c.muted,display:'block',marginBottom:5,fontWeight:500,textTransform:'uppercase',letterSpacing:0.4}}>Title</label><input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Note title..." style={fld}/></div>
            <div style={{marginBottom:14}}><label style={{fontSize:11,color:c.muted,display:'block',marginBottom:5,fontWeight:500,textTransform:'uppercase',letterSpacing:0.4}}>Tag</label><input value={form.tag} onChange={e=>setForm({...form,tag:e.target.value})} placeholder="e.g. math, physics, ai..." style={fld}/></div>
            <div style={{marginBottom:22}}>
              <label style={{fontSize:11,color:c.muted,display:'block',marginBottom:5,fontWeight:500,textTransform:'uppercase',letterSpacing:0.4}}>Content</label>
              <textarea value={form.body} onChange={e=>setForm({...form,body:e.target.value})} placeholder="Write your note here..." rows={6} style={{...fld,resize:'vertical',fontFamily:'monospace',fontSize:12,lineHeight:1.6}}/>
            </div>
            <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}>
              <button onClick={()=>setShowModal(false)} style={{padding:'10px 18px',borderRadius:10,border:`1px solid ${c.border}`,background:'transparent',color:c.muted,fontSize:13}}>Cancel</button>
              <button onClick={save} style={{padding:'10px 22px',borderRadius:10,border:'none',background:'linear-gradient(135deg,#8B5CF6,#7C3AED)',color:'#fff',fontSize:13,fontWeight:700}}>Save note</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Progress Tab ───────────────────────────────────────────────────────────
function ProgressTab({ user, profile, weakTopics, setWeakTopics, notes, dark, onUpgrade, isPremium }){
  const c = C(dark)
  async function removeWeak(t){ const u=weakTopics.filter(x=>x!==t); setWeakTopics(u); await supabase.from('profiles').update({weak_topics:u}).eq('user_id',user.id) }
  return(
    <div style={{flex:1,overflowY:'auto',padding:'16px'}}>
      <div style={{background:c.card,border:`1px solid ${c.border}`,borderRadius:14,padding:'16px 18px',marginBottom:14}}>
        <div style={{fontSize:11,color:c.muted,marginBottom:12,fontWeight:600,textTransform:'uppercase',letterSpacing:0.5}}>Your Profile</div>
        {profile?.board?(
          <div>
            <div style={{fontSize:15,fontWeight:700,marginBottom:4,color:c.text}}>🎯 {profile.board}</div>
            {profile.subject&&<div style={{fontSize:13,color:c.muted}}>📚 {profile.subject}</div>}
          </div>
        ):<div style={{fontSize:13,color:c.muted}}>No board selected.</div>}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:14}}>
        {[['📝',notes.length,'Notes saved'],['⚠️',weakTopics.length,'Weak topics']].map(([ic,val,label],i)=>(
          <div key={i} style={{background:c.card,border:`1px solid ${c.border}`,borderRadius:12,padding:'14px 16px',textAlign:'center'}}>
            <div style={{fontSize:24,marginBottom:6}}>{ic}</div>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:800,color:'#8B5CF6',marginBottom:2}}>{val}</div>
            <div style={{fontSize:11,color:c.muted}}>{label}</div>
          </div>
        ))}
      </div>
      <div style={{background:c.card,border:`1px solid ${c.border}`,borderRadius:14,padding:'16px 18px',marginBottom:14}}>
        <div style={{fontSize:11,color:c.muted,marginBottom:12,fontWeight:600,textTransform:'uppercase',letterSpacing:0.5}}>⚠️ Weak Topics</div>
        {weakTopics.length===0?(
          <div style={{fontSize:13,color:c.muted,lineHeight:1.6}}>No weak topics yet. When you get quiz answers wrong, those topics appear here automatically.</div>
        ):(
          <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
            {weakTopics.map(t=>(<div key={t} style={{display:'flex',alignItems:'center',gap:6,background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:20,padding:'5px 12px'}}><span style={{fontSize:12,color:'#EF4444',fontWeight:500}}>{t}</span><button onClick={()=>removeWeak(t)} style={{background:'none',border:'none',color:'#EF4444',fontSize:12,padding:0,lineHeight:1}}>✕</button></div>))}
          </div>
        )}
      </div>
      {!isPremium&&(
        <div style={{background:c.card,border:'1px solid rgba(139,92,246,0.2)',borderRadius:14,padding:'18px',marginBottom:14,cursor:'pointer'}} onClick={onUpgrade}>
          <div style={{fontSize:11,color:'#8B5CF6',marginBottom:8,fontWeight:600,textTransform:'uppercase',letterSpacing:0.5}}>⭐ Upgrade to Premium</div>
          <div style={{fontSize:13,color:c.muted,lineHeight:1.6,marginBottom:12}}>Get unlimited AI messages, unlimited quizzes, priority responses and all features for just ₹99/month.</div>
          <div style={{padding:'9px 18px',borderRadius:10,border:'none',background:'linear-gradient(135deg,#8B5CF6,#7C3AED)',color:'#fff',fontSize:13,fontWeight:700,display:'inline-block'}}>Upgrade Now →</div>
        </div>
      )}
      <div style={{background:c.card,border:`1px solid ${c.border}`,borderRadius:14,padding:'16px 18px'}}>
        <div style={{fontSize:11,color:c.muted,marginBottom:12,fontWeight:600,textTransform:'uppercase',letterSpacing:0.5}}>💡 Study Tips</div>
        {['Upload your college syllabus PDF for exact unit-wise answers','Use Quiz mode to test yourself — weak topics are tracked automatically','Use Predict mode to get likely exam questions before exams','Save AI explanations as notes for quick revision later','Use Flashcard mode to memorize key concepts quickly'].map((tip,i,arr)=>(<div key={i} style={{fontSize:13,color:c.muted,padding:'7px 0',borderBottom:i<arr.length-1?`1px solid ${c.border}`:'none',lineHeight:1.55}}>• {tip}</div>))}
      </div>
    </div>
  )
}

// ── Sidebar ────────────────────────────────────────────────────────────────
function Sidebar({ tab, setTab, user, notes, dark, setDark, onLogout, onUpgrade, isPremium, aiMode, setAiMode }){
  const c = C(dark)
  const userName = user.user_metadata?.name||user.email.split('@')[0]
  // FIX: Added History tab — separate from Chat
  const navItems = [
    {id:'chat',icon:'💬',label:'Chat'},
    {id:'history',icon:'🕑',label:'History'},
    {id:'notes',icon:'📝',label:'Notes',badge:notes.length},
    {id:'progress',icon:'📊',label:'Progress'},
    {id:'search',icon:'🔍',label:'Search'},
  ]
  return(
    <div style={{width:230,height:'100%',background:c.sidebar,borderRight:`1px solid ${c.border}`,display:'flex',flexDirection:'column',flexShrink:0}}>
      {/* Logo */}
      <div style={{padding:'20px 18px 16px',borderBottom:`1px solid ${c.border}`}}>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:800,color:c.text,letterSpacing:-0.5}}>🧠 <span style={{color:'#8B5CF6'}}>Memora</span></div>
        <div style={{fontSize:11,color:c.muted,marginTop:3}}>AI Study Companion</div>
      </div>
      {/* AI Mode Toggle */}
      <div style={{padding:'12px 12px 8px'}}>
        <div style={{fontSize:10,color:c.muted,fontWeight:600,textTransform:'uppercase',letterSpacing:0.5,marginBottom:6,paddingLeft:4}}>AI Mode</div>
        <div style={{display:'flex',background:c.card,borderRadius:10,padding:3,border:`1px solid ${c.border}`}}>
          <button onClick={()=>setAiMode('study')} style={{flex:1,padding:'6px 0',borderRadius:8,border:'none',fontSize:12,fontWeight:aiMode==='study'?700:400,background:aiMode==='study'?'linear-gradient(135deg,#8B5CF6,#7C3AED)':'transparent',color:aiMode==='study'?'#fff':c.muted}}>📚 Study</button>
          <button onClick={()=>setAiMode('general')} style={{flex:1,padding:'6px 0',borderRadius:8,border:'none',fontSize:12,fontWeight:aiMode==='general'?700:400,background:aiMode==='general'?'#10B981':'transparent',color:aiMode==='general'?'#fff':c.muted}}>💬 General</button>
        </div>
      </div>
      {/* Nav */}
      <div style={{flex:1,padding:'4px 8px',overflowY:'auto'}}>
        {navItems.map(item=>(
          <button key={item.id} onClick={()=>setTab(item.id)}
            style={{width:'100%',padding:'10px 12px',borderRadius:10,border:'none',background:tab===item.id?'rgba(139,92,246,0.1)':'transparent',color:tab===item.id?'#8B5CF6':c.muted,fontSize:13,fontWeight:tab===item.id?600:400,display:'flex',alignItems:'center',gap:10,marginBottom:2,textAlign:'left'}}>
            <span style={{fontSize:15,width:20,textAlign:'center'}}>{item.icon}</span>
            {item.label}
            {item.badge>0&&<span style={{marginLeft:'auto',fontSize:10,background:'rgba(139,92,246,0.15)',color:'#8B5CF6',borderRadius:10,padding:'2px 7px',fontWeight:700}}>{item.badge}</span>}
          </button>
        ))}
        <div style={{height:1,background:c.border,margin:'8px 4px'}}/>
        {!isPremium?(
          <button onClick={onUpgrade} style={{width:'100%',padding:'10px 12px',borderRadius:10,border:'1px solid rgba(139,92,246,0.2)',background:'rgba(139,92,246,0.05)',color:'#8B5CF6',fontSize:13,fontWeight:600,display:'flex',alignItems:'center',gap:10,textAlign:'left',marginTop:4}}>
            <span style={{fontSize:15}}>⭐</span>Upgrade to Pro
            <span style={{marginLeft:'auto',fontSize:10,background:'rgba(139,92,246,0.15)',borderRadius:8,padding:'1px 6px'}}>₹99</span>
          </button>
        ):(
          <div style={{margin:'4px',padding:'10px 12px',borderRadius:10,background:'rgba(245,158,11,0.06)',border:'1px solid rgba(245,158,11,0.15)',fontSize:12,color:'#F59E0B',fontWeight:600,display:'flex',alignItems:'center',gap:8}}>
            <span>⭐</span>Premium Active
          </div>
        )}
      </div>
      {/* Footer — FIX: theme toggle labeled "Black" / "White" only */}
      <div style={{padding:'10px 8px 14px',borderTop:`1px solid ${c.border}`}}>
        <button onClick={()=>setDark(!dark)} style={{width:'100%',padding:'8px 12px',borderRadius:10,border:`1px solid ${c.border}`,background:'transparent',color:c.muted,fontSize:12,display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
          <span style={{fontSize:14}}>{dark?'☀️':'🌑'}</span>{dark?'White (Light mode)':'Black (Dark mode)'}
        </button>
        <div style={{display:'flex',alignItems:'center',gap:10,padding:'6px 4px'}}>
          <Av name={userName} size={32}/>
          <div style={{flex:1,overflow:'hidden'}}>
            <div style={{fontSize:13,fontWeight:600,color:c.text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{userName}</div>
            <button onClick={onLogout} style={{background:'none',border:'none',color:c.muted,fontSize:11,padding:0,cursor:'pointer'}}>Sign out</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function BottomNav({ tab, setTab, notes, dark }){
  const c = C(dark)
  const items = [
    {id:'chat',icon:'💬',label:'Chat'},
    {id:'history',icon:'🕑',label:'History'},
    {id:'notes',icon:'📝',label:'Notes',badge:notes.length},
    {id:'progress',icon:'📊',label:'Progress'},
  ]
  return(
    <div style={{display:'flex',borderTop:`1px solid ${c.border}`,background:c.sidebar,flexShrink:0}}>
      {items.map(item=>(
        <button key={item.id} onClick={()=>setTab(item.id)}
          style={{flex:1,padding:'10px 4px 8px',border:'none',borderTop:`2px solid ${tab===item.id?'#8B5CF6':'transparent'}`,background:'transparent',color:tab===item.id?'#8B5CF6':c.muted,fontSize:10,fontWeight:tab===item.id?700:400,display:'flex',flexDirection:'column',alignItems:'center',gap:2,position:'relative'}}>
          <span style={{fontSize:19}}>{item.icon}</span>
          {item.label}
          {item.badge>0&&<span style={{position:'absolute',top:6,right:'calc(50% - 18px)',fontSize:9,background:'#8B5CF6',color:'#fff',borderRadius:10,padding:'1px 5px',fontWeight:700}}>{item.badge}</span>}
        </button>
      ))}
    </div>
  )
}

// ── Search Tab ─────────────────────────────────────────────────────────────
function SearchTab({ notes, dark }){
  const c = C(dark)
  const [q, setQ] = useState('')
  function hl(text, query){
    if(!query.trim()) return text
    const parts = text.split(new RegExp('('+query.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','gi'))
    return parts.map((p,i)=>p.toLowerCase()===query.toLowerCase()?<mark key={i} style={{background:'rgba(139,92,246,0.2)',color:'#8B5CF6',borderRadius:3,padding:'0 2px'}}>{p}</mark>:p)
  }
  const results = q.trim() ? notes.filter(n=>n.title.toLowerCase().includes(q.toLowerCase())||n.body.toLowerCase().includes(q.toLowerCase())).map(n=>({title:n.title,snippet:n.body.replace(/[#*`_]/g,'').slice(0,180),tag:n.tag})) : []
  return(
    <div style={{display:'flex',flexDirection:'column',height:'100%',overflow:'hidden'}}>
      <div style={{padding:'16px',borderBottom:`1px solid ${c.border}`,flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',gap:12,background:c.card,border:`1px solid ${c.border}`,borderRadius:12,padding:'11px 16px'}}>
          <span style={{fontSize:18,opacity:0.7}}>🔍</span>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search all your notes..." autoFocus style={{flex:1,background:'none',border:'none',outline:'none',color:c.text,fontSize:15}}/>
          {q&&<button onClick={()=>setQ('')} style={{background:'none',border:'none',color:c.muted,fontSize:18,padding:0}}>✕</button>}
        </div>
        {q&&<div style={{fontSize:12,color:c.muted,marginTop:8}}>{results.length} result{results.length!==1?'s':''} found</div>}
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'14px 16px'}}>
        {!q&&<div style={{textAlign:'center',padding:'60px 16px',color:c.muted}}><div style={{fontSize:40,marginBottom:14}}>🔍</div><div style={{fontSize:16,fontWeight:600,color:c.text,marginBottom:6}}>Search your notes</div><div style={{fontSize:13}}>Find anything across all your saved notes.</div></div>}
        {q&&results.length===0&&<div style={{textAlign:'center',padding:'60px 16px',color:c.muted}}><div style={{fontSize:14}}>No results for <strong style={{color:c.text}}>"{q}"</strong></div></div>}
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          {results.map((r,i)=>(
            <div key={i} style={{background:c.card,border:`1px solid ${c.border}`,borderRadius:12,padding:'14px 16px'}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}><Chip text={r.tag} color='#8B5CF6'/></div>
              <div style={{fontWeight:600,fontSize:14,marginBottom:6,color:c.text}}>{hl(r.title,q)}</div>
              <div style={{fontSize:13,color:c.muted,lineHeight:1.6}}>{hl(r.snippet,q)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Main App ───────────────────────────────────────────────────────────────
export default function App(){
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [showProfileSetup, setShowProfileSetup] = useState(false)
  const [tab, setTab] = useState('chat')
  const [notes, setNotes] = useState([])
  const [notePrefill, setNotePrefill] = useState(null)
  const [weakTopics, setWeakTopics] = useState([])
  // FIX: Only two theme options — dark (black) or light (white)
  const [dark, setDark] = useState(true)
  const [showPremium, setShowPremium] = useState(false)
  const [isPremium, setIsPremium] = useState(false)
  const [mobile, setMobile] = useState(window.innerWidth<768)
  const [aiMode, setAiMode] = useState('study')

  useEffect(()=>{
    const h = ()=>setMobile(window.innerWidth<768)
    window.addEventListener('resize',h); return ()=>window.removeEventListener('resize',h)
  },[])

  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>{
      if(session?.user){ setUser(session.user); loadProfile(session.user.id) }
      else setLoading(false)
    })
    const { data:{ subscription } } = supabase.auth.onAuthStateChange((_,session)=>{
      if(session?.user){ setUser(session.user); loadProfile(session.user.id) }
      else { setUser(null); setLoading(false) }
    })
    return ()=>subscription.unsubscribe()
  },[])

  async function loadProfile(id){
    const { data } = await supabase.from('profiles').select('*').eq('user_id',id).single()
    if(data){ setProfile(data); setWeakTopics(data.weak_topics||[]); setIsPremium(data.premium===true) }
    else setShowProfileSetup(true)
    setLoading(false)
  }

  // FIX: logout resets tab to 'chat' so next login always starts fresh
  async function logout(){
    await supabase.auth.signOut()
    setUser(null); setProfile(null); setNotes([]); setTab('chat'); setIsPremium(false)
  }
  function saveFromAI(content){ setNotePrefill(content); setTab('notes') }
  function onProfileDone(p){ setProfile(p); setShowProfileSetup(false) }
  const c = C(dark)

  if(loading) return(
    <div style={{minHeight:'100vh',background:'#0A0A0A',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <style>{getCSS(true)}</style>
      <div style={{fontSize:44,animation:'pulse 1.5s ease infinite'}}>🧠</div>
    </div>
  )
  if(!user) return <><style>{getCSS(dark)}</style><Landing onAuth={setUser} dark={dark}/></>
  if(showProfileSetup) return <ProfileSetup user={user} onDone={onProfileDone} dark={dark}/>

  return(
    <div style={{height:'100vh',display:'flex',flexDirection:'column',background:c.bg,color:c.text,overflow:'hidden'}}>
      <style>{getCSS(dark)}</style>

      {/* Mobile top bar */}
      {mobile&&(
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 16px',borderBottom:`1px solid ${c.border}`,background:c.sidebar,flexShrink:0}}>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:17,fontWeight:800,letterSpacing:-0.3}}>🧠 <span style={{color:'#8B5CF6'}}>Memora</span></div>
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            <div style={{display:'flex',background:c.card,borderRadius:8,padding:2,border:`1px solid ${c.border}`}}>
              <button onClick={()=>setAiMode('study')} style={{padding:'4px 8px',borderRadius:6,border:'none',fontSize:11,background:aiMode==='study'?'#8B5CF6':'transparent',color:aiMode==='study'?'#fff':c.muted,fontWeight:500}}>📚</button>
              <button onClick={()=>setAiMode('general')} style={{padding:'4px 8px',borderRadius:6,border:'none',fontSize:11,background:aiMode==='general'?'#10B981':'transparent',color:aiMode==='general'?'#fff':c.muted,fontWeight:500}}>💬</button>
            </div>
            {isPremium?<Chip text="⭐" color="#F59E0B"/>:<button onClick={()=>setShowPremium(true)} style={{fontSize:11,padding:'4px 10px',borderRadius:16,border:'1px solid rgba(139,92,246,0.3)',background:'rgba(139,92,246,0.1)',color:'#8B5CF6',fontWeight:700}}>⭐ Pro</button>}
            {/* FIX: Theme toggle — Black / White only */}
            <button onClick={()=>setDark(!dark)} style={{background:'none',border:'none',fontSize:18,padding:0}}>{dark?'☀️':'🌑'}</button>
            <Av name={user.user_metadata?.name||user.email.split('@')[0]} size={28}/>
          </div>
        </div>
      )}

      <div style={{flex:1,display:'flex',overflow:'hidden'}}>
        {!mobile&&<Sidebar tab={tab} setTab={setTab} user={user} notes={notes} dark={dark} setDark={setDark} onLogout={logout} onUpgrade={()=>setShowPremium(true)} isPremium={isPremium} aiMode={aiMode} setAiMode={setAiMode}/>}
        <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden',minWidth:0}}>
          {/* FIX: Each login/reopen starts ChatTab fresh (key=user.id ensures clean mount) */}
          {tab==='chat'&&<ChatTab key={user.id+'_chat'} user={user} notes={notes} profile={profile} onSaveNote={saveFromAI} weakTopics={weakTopics} setWeakTopics={setWeakTopics} isPremium={isPremium} dark={dark} onUpgrade={()=>setShowPremium(true)} aiMode={aiMode}/>}
          {/* FIX: History tab is separate — only loads DB messages when opened */}
          {tab==='history'&&<HistoryTab user={user} dark={dark}/>}
          {tab==='notes'&&<NotesTab user={user} notes={notes} setNotes={setNotes} prefill={notePrefill} clearPrefill={()=>setNotePrefill(null)} dark={dark}/>}
          {tab==='progress'&&<ProgressTab user={user} profile={profile} weakTopics={weakTopics} setWeakTopics={setWeakTopics} notes={notes} dark={dark} onUpgrade={()=>setShowPremium(true)} isPremium={isPremium}/>}
          {tab==='search'&&<SearchTab notes={notes} dark={dark}/>}
        </div>
      </div>

      {mobile&&<BottomNav tab={tab} setTab={setTab} notes={notes} dark={dark}/>}
      {showPremium&&<PremiumModal onClose={()=>setShowPremium(false)} dark={dark} user={user}/>}
    </div>
  )
}
