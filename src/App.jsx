import { useState, useEffect, useRef } from 'react'
import { supabase } from './supabase.js'

const FREE_LIMIT = 20

const BOARD_GROUPS = {
  'School - CBSE': ['Class 9 - CBSE','Class 10 - CBSE','Class 11 - CBSE','Class 12 - CBSE'],
  'School - ICSE / ISC': ['Class 10 - ICSE','Class 12 - ISC'],
  'School - State Board': ['Class 9 - State Board','Class 10 - State Board','Class 11 - State Board','Class 12 - State Board'],
  'Entrance Exams': ['JEE Mains & Advanced','NEET','UPSC','CAT / MBA Entrance','CLAT - Law Entrance','GATE'],
  'College - Engineering': ['B.Tech / B.E - CSE','B.Tech / B.E - ECE','B.Tech / B.E - Mechanical','B.Tech / B.E - Civil','B.Tech / B.E - Other','Diploma / Polytechnic'],
  'College - Commerce': ['B.Com / M.Com','BBA / MBA','CA Foundation','CA Intermediate','CA Final'],
  'College - Science': ['B.Sc / M.Sc - Physics','B.Sc / M.Sc - Chemistry','B.Sc / M.Sc - Mathematics','B.Sc / M.Sc - Biology','B.Sc / M.Sc - Computer Science'],
  'College - Computer': ['BCA / MCA'],
  'College - Medical': ['MBBS / BDS','B.Pharma / M.Pharma','Nursing','Allied Health Sciences'],
  'College - Arts & Law': ['BA / MA - History','BA / MA - Political Science','BA / MA - Economics','BA / MA - Psychology','BA / MA - English Literature','LLB / LLM - Law'],
}

const BOARDS = {
  'Class 9 - CBSE':['Mathematics','Science','Social Science','English','Hindi','Sanskrit'],
  'Class 10 - CBSE':['Mathematics','Science','Social Science','English','Hindi','Sanskrit'],
  'Class 11 - CBSE':['Physics','Chemistry','Mathematics','Biology','English','Accountancy','Economics','Business Studies','History','Political Science'],
  'Class 12 - CBSE':['Physics','Chemistry','Mathematics','Biology','English','Accountancy','Economics','Business Studies','History','Political Science'],
  'Class 10 - ICSE':['Mathematics','Physics','Chemistry','Biology','English','History & Civics','Geography'],
  'Class 12 - ISC':['Physics','Chemistry','Mathematics','Biology','English','Accountancy','Economics'],
  'Class 9 - State Board':['Mathematics','Science','Social Science','English','Hindi'],
  'Class 10 - State Board':['Mathematics','Science','Social Science','English','Hindi'],
  'Class 11 - State Board':['Physics','Chemistry','Mathematics','Biology','English','Accountancy','Economics'],
  'Class 12 - State Board':['Physics','Chemistry','Mathematics','Biology','English','Accountancy','Economics'],
  'JEE Mains & Advanced':['Physics','Chemistry','Mathematics'],
  'NEET':['Physics','Chemistry','Biology (Botany)','Biology (Zoology)'],
  'UPSC':['General Studies','History','Geography','Indian Polity','Economy','Science & Technology','Environment & Ecology','Current Affairs'],
  'CAT / MBA Entrance':['Quantitative Aptitude','Verbal Ability','Logical Reasoning','Data Interpretation'],
  'CLAT - Law Entrance':['English','Current Affairs','Legal Reasoning','Logical Reasoning','Quantitative Techniques'],
  'GATE':['Engineering Mathematics','General Aptitude','Core Subject'],
  'B.Tech / B.E - CSE':['Data Structures & Algorithms','Database Management System','Operating Systems','Computer Networks','Object Oriented Programming','Software Engineering','Machine Learning','Web Development','Theory of Computation','Compiler Design'],
  'B.Tech / B.E - ECE':['Electronic Devices & Circuits','Digital Electronics','Signals & Systems','Communication Systems','Microprocessors','VLSI Design','Electromagnetic Theory','Control Systems'],
  'B.Tech / B.E - Mechanical':['Engineering Mechanics','Thermodynamics','Fluid Mechanics','Machine Design','Manufacturing Processes','Heat Transfer','Theory of Machines','Material Science'],
  'B.Tech / B.E - Civil':['Structural Analysis','Fluid Mechanics','Geotechnical Engineering','Transportation Engineering','Environmental Engineering','Concrete Technology','Surveying'],
  'B.Tech / B.E - Other':['Engineering Mathematics','Engineering Physics','Engineering Chemistry','General Aptitude'],
  'Diploma / Polytechnic':['Engineering Mathematics','Applied Physics','Applied Chemistry','Workshop Technology','Core Trade Subject'],
  'B.Com / M.Com':['Financial Accounting','Cost Accounting','Business Law','Income Tax','Auditing','Corporate Accounting','Financial Management','Business Statistics','Economics'],
  'BBA / MBA':['Management Principles','Marketing Management','Financial Management','Human Resource Management','Business Statistics','Operations Management','Strategic Management','Entrepreneurship'],
  'CA Foundation':['Principles of Accounting','Business Law','Quantitative Aptitude','Business Economics'],
  'CA Intermediate':['Accounting','Corporate Laws','Cost & Management Accounting','Taxation','Auditing','Financial Management'],
  'CA Final':['Financial Reporting','Strategic Financial Management','Advanced Auditing','Corporate Laws','Strategic Cost Management','Direct Tax Laws','Indirect Tax Laws'],
  'B.Sc / M.Sc - Physics':['Classical Mechanics','Quantum Mechanics','Thermodynamics','Electromagnetism','Optics','Nuclear Physics','Mathematical Physics'],
  'B.Sc / M.Sc - Chemistry':['Organic Chemistry','Inorganic Chemistry','Physical Chemistry','Analytical Chemistry','Spectroscopy','Biochemistry'],
  'B.Sc / M.Sc - Mathematics':['Real Analysis','Abstract Algebra','Linear Algebra','Differential Equations','Numerical Methods','Probability & Statistics','Topology'],
  'B.Sc / M.Sc - Biology':['Cell Biology','Genetics','Ecology','Microbiology','Biochemistry','Physiology','Evolutionary Biology'],
  'B.Sc / M.Sc - Computer Science':['Data Structures','Algorithms','Database Systems','Artificial Intelligence','Computer Graphics','Software Engineering'],
  'BCA / MCA':['C Programming','Data Structures','Database Management','Web Technologies','Java Programming','Python','Software Engineering','Computer Networks','Operating Systems'],
  'MBBS / BDS':['Anatomy','Physiology','Biochemistry','Pathology','Pharmacology','Microbiology','Community Medicine','Medicine','Surgery'],
  'B.Pharma / M.Pharma':['Pharmaceutical Chemistry','Pharmacology','Pharmaceutics','Pharmacognosy','Pharmaceutical Analysis'],
  'Nursing':['Anatomy & Physiology','Microbiology','Pharmacology','Medical Surgical Nursing','Community Health Nursing','Pediatric Nursing'],
  'Allied Health Sciences':['Anatomy','Physiology','Pathology','Core Specialization Subject'],
  'BA / MA - History':['Ancient History','Medieval History','Modern History','World History','Indian National Movement','Historiography'],
  'BA / MA - Political Science':['Indian Constitution','Comparative Politics','International Relations','Political Theory','Public Administration'],
  'BA / MA - Economics':['Microeconomics','Macroeconomics','Statistics','Indian Economy','International Economics','Development Economics'],
  'BA / MA - Psychology':['General Psychology','Developmental Psychology','Social Psychology','Abnormal Psychology','Cognitive Psychology','Research Methods'],
  'BA / MA - English Literature':['British Literature','American Literature','Indian Writing in English','Literary Theory','Linguistics','Poetry & Drama'],
  'LLB / LLM - Law':['Constitutional Law','Contract Law','Criminal Law','Family Law','Property Law','Administrative Law','International Law','Corporate Law'],
}

function timeNow(){return new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}
function today(){return new Date().toISOString().split('T')[0]}

async function callAI(messages,system,image=null,url=null){
  const res=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages,system,image,url})})
  const data=await res.json()
  if(data.error)throw new Error(data.error)
  if(!data.reply)throw new Error('No response received')
  return data.reply
}

function parseQuiz(text){
  try{
    const q=text.match(/QUESTION:\s*(.+?)(?=\nA\))/s)?.[1]?.trim()
    const a=text.match(/A\)\s*(.+?)(?=\nB\))/s)?.[1]?.trim()
    const b=text.match(/B\)\s*(.+?)(?=\nC\))/s)?.[1]?.trim()
    const c=text.match(/C\)\s*(.+?)(?=\nD\))/s)?.[1]?.trim()
    const d=text.match(/D\)\s*(.+?)(?=\nANSWER:)/s)?.[1]?.trim()
    const ans=text.match(/ANSWER:\s*([A-D])/i)?.[1]?.toUpperCase()
    if(!q||!a||!b||!c||!d||!ans)return null
    return{question:q,options:{A:a,B:b,C:c,D:d},correct:ans}
  }catch{return null}
}

// ── Markdown Renderer ──────────────────────────────────────────────────────
function fmtInline(text,dark){
  if(!text)return''
  const cd={background:dark?'#1C1C26':'#F0EFF8',borderRadius:3,padding:'1px 5px',fontSize:'0.88em',fontFamily:'monospace',color:dark?'#A78BFA':'#6D5FC7'}
  const parts=[];let rem=text,k=0
  while(rem.length){
    const bm=rem.match(/\*\*(.*?)\*\*/)
    const im=rem.match(/\*(.*?)\*/)
    const cm=rem.match(/`(.*?)`/)
    const hits=[bm&&{t:'b',i:bm.index,f:bm[0],c:bm[1]},im&&{t:'i',i:im.index,f:im[0],c:im[1]},cm&&{t:'c',i:cm.index,f:cm[0],c:cm[1]}].filter(Boolean).sort((a,b)=>a.i-b.i)
    if(!hits.length){parts.push(rem);break}
    const h=hits[0]
    if(h.i>0)parts.push(rem.slice(0,h.i))
    if(h.t==='b')parts.push(<strong key={k++}>{h.c}</strong>)
    else if(h.t==='i')parts.push(<em key={k++}>{h.c}</em>)
    else parts.push(<code key={k++} style={cd}>{h.c}</code>)
    rem=rem.slice(h.i+h.f.length)
  }
  return parts.length===1&&typeof parts[0]==='string'?parts[0]:parts
}

function Markdown({content,dark=true}){
  if(!content)return null
  const c={h1:{fontSize:18,fontWeight:700,margin:'10px 0 4px',color:dark?'#EEEDF5':'#1A1A2E'},h2:{fontSize:16,fontWeight:600,margin:'8px 0 4px',color:dark?'#EEEDF5':'#1A1A2E'},h3:{fontSize:14,fontWeight:600,margin:'6px 0 3px',color:dark?'#EEEDF5':'#1A1A2E'},p:{margin:'3px 0',lineHeight:1.7,fontSize:14},li:{paddingLeft:16,marginBottom:3,lineHeight:1.65,fontSize:14},pre:{background:dark?'#0D0D12':'#F0EFF8',borderRadius:8,padding:'10px 12px',fontSize:12,overflow:'auto',margin:'8px 0',fontFamily:'monospace'},hr:{border:'none',borderTop:'1px solid '+(dark?'#252535':'#E0DFF5'),margin:'10px 0'}}
  const lines=content.split('\n'),els=[];let i=0,inCode=false,codeLines=[]
  while(i<lines.length){
    const l=lines[i]
    if(l.startsWith('```')){
      if(!inCode){inCode=true;codeLines=[]}
      else{els.push(<pre key={i} style={c.pre}><code>{codeLines.join('\n')}</code></pre>);inCode=false;codeLines=[]}
      i++;continue
    }
    if(inCode){codeLines.push(l);i++;continue}
    if(l.startsWith('### '))els.push(<h3 key={i} style={c.h3}>{fmtInline(l.slice(4),dark)}</h3>)
    else if(l.startsWith('## '))els.push(<h2 key={i} style={c.h2}>{fmtInline(l.slice(3),dark)}</h2>)
    else if(l.startsWith('# '))els.push(<h1 key={i} style={c.h1}>{fmtInline(l.slice(2),dark)}</h1>)
    else if(l.startsWith('---')||l.startsWith('***'))els.push(<hr key={i} style={c.hr}/>)
    else if(l.startsWith('- ')||l.startsWith('* '))els.push(<div key={i} style={c.li}>• {fmtInline(l.slice(2),dark)}</div>)
    else if(/^\d+\. /.test(l)){const[,n,t]=l.match(/^(\d+)\. (.*)/);els.push(<div key={i} style={c.li}>{n}. {fmtInline(t,dark)}</div>)}
    else if(l.trim()==='')els.push(<div key={i} style={{height:6}}/>)
    else els.push(<p key={i} style={{...c.p,color:dark?'#D4D3E8':'#2A2A3E'}}>{fmtInline(l,dark)}</p>)
    i++
  }
  return <div style={{lineHeight:1.6}}>{els}</div>
}

// ── Global CSS ─────────────────────────────────────────────────────────────
const getCSS=(dark)=>`
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html,body,#root{height:100%;}
body{font-family:'DM Sans',sans-serif;background:${dark?'#0D0D12':'#F4F3FF'};color:${dark?'#EEEDF5':'#1A1A2E'};-webkit-font-smoothing:antialiased;}
input,textarea,button,select{font-family:'DM Sans',sans-serif;}
input::placeholder,textarea::placeholder{color:${dark?'#3A3A58':'#9999BB'};}
input:focus,textarea:focus,select:focus{outline:none;border-color:#7B6EF6!important;}
button{cursor:pointer;}
button:active{transform:scale(0.97);}
::-webkit-scrollbar{width:4px;}
::-webkit-scrollbar-thumb{background:${dark?'#252535':'#CCCCE0'};border-radius:4px;}
@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-7px)}}
@keyframes slideIn{from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:translateX(0)}}
.fade-up{animation:fadeUp 0.3s ease;}
.slide-in{animation:slideIn 0.2s ease;}
`

// ── Theme colors ───────────────────────────────────────────────────────────
const T=(dark)=>({
  bg: dark?'#0D0D12':'#F4F3FF',
  card: dark?'#15151C':'#FFFFFF',
  card2: dark?'#1C1C26':'#F0EFF8',
  border: dark?'#252535':'#E0DFF0',
  text: dark?'#EEEDF5':'#1A1A2E',
  muted: dark?'#7A79A0':'#6B6B8A',
  accent:'#7B6EF6',
  accent2:'#5A50D4',
  green:'#4DC9A0',
  red:'#F06B6B',
  sidebar: dark?'#111118':'#EBEBF8',
})

// ── Components ─────────────────────────────────────────────────────────────
function Avatar({name,size=34}){
  return <div style={{width:size,height:size,borderRadius:'50%',background:'linear-gradient(135deg,#7B6EF6,#5A50D4)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:size*0.38,fontWeight:700,color:'#fff',flexShrink:0}}>{(name||'U').slice(0,2).toUpperCase()}</div>
}

function Tag({text,color='#7B6EF6'}){
  return <span style={{fontSize:11,padding:'2px 8px',borderRadius:20,background:color+'22',color,fontWeight:600,flexShrink:0}}>{text}</span>
}

// ── Auth ───────────────────────────────────────────────────────────────────
function AuthScreen({onAuth,dark}){
  const t=T(dark)
  const [mode,setMode]=useState('login')
  const [name,setName]=useState('')
  const [email,setEmail]=useState('')
  const [pass,setPass]=useState('')
  const [err,setErr]=useState('')
  const [loading,setLoading]=useState(false)

  async function submit(){
    setErr('')
    if(!email.trim()||!pass.trim()){setErr('Email and password required.');return}
    if(mode==='signup'&&!name.trim()){setErr('Name is required.');return}
    setLoading(true)
    try{
      if(mode==='signup'){
        const{data,error}=await supabase.auth.signUp({email:email.trim(),password:pass.trim(),options:{data:{name:name.trim()}}})
        if(error)throw error
        if(data.user)onAuth(data.user)
        else setErr('Check email to confirm.')
      }else{
        const{data,error}=await supabase.auth.signInWithPassword({email:email.trim(),password:pass.trim()})
        if(error)throw error
        onAuth(data.user)
      }
    }catch(e){setErr(e.message||'Something went wrong.')}
    setLoading(false)
  }

  const inp={width:'100%',padding:'10px 14px',borderRadius:10,border:`1px solid ${t.border}`,background:t.card2,color:t.text,fontSize:14}

  return(
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:20,background:t.bg}}>
      <div style={{width:'100%',maxWidth:360}} className="fade-up">
        <div style={{textAlign:'center',marginBottom:28}}>
          <div style={{fontSize:48,marginBottom:8}}>🧠</div>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:28,fontWeight:700,color:t.text}}>Memora</div>
          <div style={{fontSize:13,color:t.muted,marginTop:4}}>AI study companion for every Indian student</div>
        </div>
        <div style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:18,padding:24}}>
          <div style={{display:'flex',background:t.card2,borderRadius:10,padding:3,marginBottom:22}}>
            {['login','signup'].map(m=>(
              <button key={m} onClick={()=>{setMode(m);setErr('')}} style={{flex:1,padding:'8px 0',borderRadius:8,border:'none',fontSize:13,fontWeight:500,transition:'all 0.2s',background:mode===m?'#7B6EF6':'transparent',color:mode===m?'#fff':t.muted}}>
                {m==='login'?'Login':'Sign Up'}
              </button>
            ))}
          </div>
          {mode==='signup'&&<div style={{marginBottom:14}}><label style={{fontSize:12,color:t.muted,display:'block',marginBottom:5}}>Your name</label><input style={inp} placeholder="e.g. Harsh" value={name} onChange={e=>setName(e.target.value)}/></div>}
          <div style={{marginBottom:14}}><label style={{fontSize:12,color:t.muted,display:'block',marginBottom:5}}>Email</label><input style={inp} type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)}/></div>
          <div style={{marginBottom:20}}><label style={{fontSize:12,color:t.muted,display:'block',marginBottom:5}}>Password</label><input style={inp} type="password" placeholder="min 6 characters" value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==='Enter'&&submit()}/></div>
          {err&&<div style={{fontSize:13,color:t.red,background:t.red+'15',border:`1px solid ${t.red}30`,borderRadius:8,padding:'9px 12px',marginBottom:14,textAlign:'center'}}>{err}</div>}
          <button onClick={submit} disabled={loading} style={{width:'100%',padding:11,borderRadius:10,border:'none',background:loading?t.border:'#7B6EF6',color:'#fff',fontSize:14,fontWeight:600,cursor:loading?'not-allowed':'pointer'}}>
            {loading?'Please wait...':(mode==='login'?'Login':'Create Account')}
          </button>
        </div>
        <div style={{textAlign:'center',marginTop:16,fontSize:12,color:t.muted}}>20 free AI messages per day • No credit card required</div>
      </div>
    </div>
  )
}

// ── Profile Setup ──────────────────────────────────────────────────────────
function ProfileSetup({user,onDone,dark}){
  const t=T(dark)
  const [board,setBoard]=useState('')
  const [subject,setSubject]=useState('')
  const [loading,setLoading]=useState(false)
  const subjects=board?BOARDS[board]:[]

  async function save(){
    if(!board)return
    setLoading(true)
    await supabase.from('profiles').upsert({user_id:user.id,board,subject:subject||null,weak_topics:[]})
    onDone({board,subject})
    setLoading(false)
  }

  const sel={width:'100%',padding:'10px 14px',borderRadius:10,border:`1px solid ${t.border}`,background:t.card2,color:board?t.text:t.muted,fontSize:14}

  return(
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:20,background:t.bg}}>
      <div style={{width:'100%',maxWidth:420}} className="fade-up">
        <div style={{textAlign:'center',marginBottom:28}}>
          <div style={{fontSize:44,marginBottom:8}}>🎯</div>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:700,color:t.text}}>Set up your profile</div>
          <div style={{fontSize:13,color:t.muted,marginTop:6}}>Memora personalizes AI answers for your board, exam or course</div>
        </div>
        <div style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:18,padding:24}}>
          <div style={{marginBottom:16}}>
            <label style={{fontSize:12,color:t.muted,display:'block',marginBottom:6}}>Your board / exam / course *</label>
            <select value={board} onChange={e=>{setBoard(e.target.value);setSubject('')}} style={sel}>
              <option value="">Select your board, exam or course...</option>
              {Object.entries(BOARD_GROUPS).map(([group,opts])=>(
                <optgroup key={group} label={group}>
                  {opts.map(b=><option key={b} value={b}>{b}</option>)}
                </optgroup>
              ))}
            </select>
          </div>
          {subjects.length>0&&(
            <div style={{marginBottom:20}}>
              <label style={{fontSize:12,color:t.muted,display:'block',marginBottom:6}}>Main subject (optional)</label>
              <select value={subject} onChange={e=>setSubject(e.target.value)} style={{...sel,color:subject?t.text:t.muted}}>
                <option value="">All subjects</option>
                {subjects.map(s=><option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          )}
          <button onClick={save} disabled={!board||loading} style={{width:'100%',padding:11,borderRadius:10,border:'none',background:!board||loading?t.border:'#7B6EF6',color:'#fff',fontSize:14,fontWeight:600,cursor:!board?'not-allowed':'pointer',opacity:!board?0.5:1}}>
            {loading?'Saving...':'Start Learning →'}
          </button>
        </div>
        <div style={{textAlign:'center',marginTop:14}}>
          <button onClick={()=>onDone(null)} style={{background:'none',border:'none',color:t.muted,fontSize:12,cursor:'pointer'}}>Skip for now</button>
        </div>
      </div>
    </div>
  )
}

// ── Premium Modal ──────────────────────────────────────────────────────────
function PremiumModal({onClose,dark}){
  const t=T(dark)
  const features=[
    {icon:'∞',label:'Unlimited AI messages per day'},
    {icon:'🧩',label:'Unlimited quiz questions'},
    {icon:'📁',label:'Upload images, PDFs & URLs'},
    {icon:'📊',label:'Advanced progress analytics'},
    {icon:'🎯',label:'Personalized study plans'},
    {icon:'⚡',label:'Priority AI response speed'},
  ]
  return(
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:20}}>
      <div style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:20,padding:28,width:'100%',maxWidth:400}} className="fade-up">
        <div style={{textAlign:'center',marginBottom:24}}>
          <div style={{fontSize:40,marginBottom:8}}>⭐</div>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:700,color:t.text}}>Memora Premium</div>
          <div style={{fontSize:13,color:t.muted,marginTop:4}}>Unlock your full learning potential</div>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:10,marginBottom:24}}>
          {features.map((f,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',gap:12,padding:'8px 12px',background:t.card2,borderRadius:10}}>
              <span style={{fontSize:18,width:28,textAlign:'center'}}>{f.icon}</span>
              <span style={{fontSize:13,color:t.text}}>{f.label}</span>
            </div>
          ))}
        </div>
        <div style={{background:'linear-gradient(135deg,#7B6EF6,#5A50D4)',borderRadius:12,padding:'14px 20px',textAlign:'center',marginBottom:14}}>
          <div style={{fontSize:26,fontWeight:700,color:'#fff'}}>₹99 <span style={{fontSize:14,fontWeight:400,opacity:0.8}}>/ month</span></div>
          <div style={{fontSize:12,color:'rgba(255,255,255,0.7)',marginTop:2}}>Cancel anytime • Instant access</div>
        </div>
        <button style={{width:'100%',padding:12,borderRadius:12,border:'none',background:'linear-gradient(135deg,#7B6EF6,#5A50D4)',color:'#fff',fontSize:15,fontWeight:700,marginBottom:10}}
          onClick={()=>alert('Razorpay payment coming soon! Setting up payment gateway.')}>
          Upgrade to Premium
        </button>
        <button onClick={onClose} style={{width:'100%',padding:10,borderRadius:10,border:`1px solid ${t.border}`,background:'transparent',color:t.muted,fontSize:13}}>Maybe later</button>
      </div>
    </div>
  )
}

// ── Chat Tab ───────────────────────────────────────────────────────────────
function ChatTab({user,notes,profile,onSaveNote,weakTopics,setWeakTopics,isPremium,dark,onUpgrade}){
  const t=T(dark)
  const [messages,setMessages]=useState([])
  const [input,setInput]=useState('')
  const [mode,setMode]=useState('chat')
  const [typing,setTyping]=useState(false)
  const [usage,setUsage]=useState(0)
  const [loading,setLoading]=useState(true)
  const [attachment,setAttachment]=useState(null) // {type:'image'|'url', data:string, preview:string}
  const [urlInput,setUrlInput]=useState('')
  const [showAttach,setShowAttach]=useState(false)
  const [activeQuiz,setActiveQuiz]=useState(null) // {question,options,correct,msgId,selected,result}
  const bottomRef=useRef(null)
  const fileRef=useRef(null)

  useEffect(()=>{loadData()},[])
  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:'smooth'})},[messages,typing])

  async function loadData(){
    const[mr,ur]=await Promise.all([
      supabase.from('messages').select('*').eq('user_id',user.id).order('created_at'),
      supabase.from('usage').select('count').eq('user_id',user.id).eq('date',today()).single()
    ])
    if(mr.data)setMessages(mr.data)
    if(ur.data)setUsage(ur.data.count)
    setLoading(false)
  }

  async function trackUsage(){
    const{data}=await supabase.from('usage').select('count').eq('user_id',user.id).eq('date',today()).single()
    if(data){
      await supabase.from('usage').update({count:data.count+1}).eq('user_id',user.id).eq('date',today())
      setUsage(data.count+1)
    }else{
      await supabase.from('usage').insert({user_id:user.id,date:today(),count:1})
      setUsage(1)
    }
  }

  function handleFile(e){
    const file=e.target.files[0]
    if(!file)return
    if(file.type.startsWith('image/')){
      const reader=new FileReader()
      reader.onload=ev=>setAttachment({type:'image',data:ev.target.result,preview:file.name})
      reader.readAsDataURL(file)
    }else{
      alert('Only image files are supported for now. PDF support coming soon!')
    }
    setShowAttach(false)
  }

  function addUrl(){
    if(!urlInput.trim())return
    setAttachment({type:'url',data:urlInput.trim(),preview:urlInput.trim()})
    setUrlInput('')
    setShowAttach(false)
  }

  function buildSystem(){
    let sys='You are Memora, a smart AI study assistant for Indian students.'
    if(profile?.board)sys+=` Student is studying ${profile.board}.`
    if(profile?.subject)sys+=` Main subject: ${profile.subject}.`
    sys+=' Be clear, precise, use simple English.'
    if(mode==='summarize')sys+=' Give a concise bullet-point summary.'
    if(mode==='explain')sys+=' Explain step by step in very simple terms with examples.'
    if(mode==='quiz')sys+=` Generate EXACTLY 1 multiple choice question. Use EXACTLY this format:
QUESTION: [your question here]
A) [option A]
B) [option B]
C) [option C]
D) [option D]
ANSWER: [single letter A, B, C, or D only]`
    if(notes.length>0)sys+='\n\nStudent notes:\n'+notes.map(n=>`[${n.tag}] ${n.title}: ${n.body}`).join('\n')
    if(weakTopics.length>0)sys+='\n\nWeak topics: '+weakTopics.join(', ')
    return sys
  }

  async function send(){
    const q=input.trim()
    if(!q||typing)return
    const limit=isPremium?999:FREE_LIMIT
    if(usage>=limit){onUpgrade();return}
    setInput('')
    setActiveQuiz(null)
    const userMsg={id:Date.now(),user_id:user.id,role:'user',content:q+(attachment?.type==='url'?` [URL: ${attachment.data}]':''),created_at:new Date().toISOString()}
    setMessages(prev=>[...prev,userMsg])
    setTyping(true)
    await supabase.from('messages').insert({user_id:user.id,role:'user',content:userMsg.content})
    const apiMsgs=[...messages,userMsg].slice(-12).map(m=>({role:m.role==='ai'?'assistant':'user',content:m.content}))
    const img=attachment?.type==='image'?attachment.data:null
    const url=attachment?.type==='url'?attachment.data:null
    setAttachment(null)
    try{
      await trackUsage()
      const reply=await callAI(apiMsgs,buildSystem(),img,url)
      const aiId=Date.now()+1
      const aiMsg={id:aiId,user_id:user.id,role:'ai',content:reply,created_at:new Date().toISOString()}
      setMessages(prev=>[...prev,aiMsg])
      await supabase.from('messages').insert({user_id:user.id,role:'ai',content:reply})
      if(mode==='quiz'){
        const parsed=parseQuiz(reply)
        if(parsed)setActiveQuiz({...parsed,msgId:aiId,selected:null,result:null})
      }
    }catch(e){
      setMessages(prev=>[...prev,{id:Date.now()+1,role:'ai',content:'Error: '+(e.message||'Try again.'),created_at:new Date().toISOString()}])
    }
    setTyping(false)
  }

  function submitQuizAnswer(){
    if(!activeQuiz||!activeQuiz.selected)return
    const correct=activeQuiz.selected===activeQuiz.correct
    setActiveQuiz(prev=>({...prev,result:correct}))
    if(!correct){
      const topic=input||messages[messages.length-2]?.content||'Unknown'
      if(!weakTopics.includes(topic)){
        const updated=[...weakTopics,topic]
        setWeakTopics(updated)
        supabase.from('profiles').update({weak_topics:updated}).eq('user_id',user.id)
      }
    }
  }

  const modes=[{id:'chat',label:'💬 Chat',color:'#7B6EF6'},{id:'summarize',label:'📋 Summarize',color:'#4DC9A0'},{id:'explain',label:'🔍 Explain',color:'#F0A86B'},{id:'quiz',label:'🧩 Quiz Me',color:'#F06B6B'}]
  const limitHit=!isPremium&&usage>=FREE_LIMIT

  return(
    <div style={{display:'flex',flexDirection:'column',height:'100%',overflow:'hidden'}}>
      {/* Profile + usage bar */}
      <div style={{padding:'5px 14px',background:t.card2,borderBottom:`1px solid ${t.border}`,display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
        <span style={{fontSize:11,color:'#7B6EF6',fontWeight:500}}>
          {profile?.board?`🎯 ${profile.board}${profile.subject?' · '+profile.subject:''}`:'🎯 No board set'}
        </span>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          {isPremium?<Tag text="⭐ Premium" color="#F0A86B"/>:(
            <>
              <div style={{width:70,height:3,background:t.border,borderRadius:4,overflow:'hidden'}}>
                <div style={{width:Math.min((usage/FREE_LIMIT)*100,100)+'%',height:'100%',background:limitHit?t.red:'#7B6EF6',borderRadius:4}}/>
              </div>
              <span style={{fontSize:11,color:limitHit?t.red:t.muted}}>{FREE_LIMIT-usage} left</span>
              <button onClick={onUpgrade} style={{fontSize:10,background:'#7B6EF622',border:'1px solid #7B6EF644',borderRadius:10,color:'#7B6EF6',padding:'2px 7px',fontWeight:600}}>Upgrade</button>
            </>
          )}
        </div>
      </div>

      {/* Messages */}
      <div style={{flex:1,overflowY:'auto',padding:'16px 14px'}}>
        {loading&&<div style={{textAlign:'center',padding:40}}><div style={{fontSize:24,animation:'pulse 1.5s ease infinite'}}>🧠</div></div>}
        {!loading&&messages.length===0&&(
          <div style={{textAlign:'center',padding:'36px 16px',color:t.muted}}>
            <div style={{fontSize:38,marginBottom:10}}>🧠</div>
            <div style={{fontSize:16,fontWeight:600,color:t.text,marginBottom:6}}>Hi {user.user_metadata?.name||user.email.split('@')[0]}!</div>
            <div style={{fontSize:13,lineHeight:1.7,marginBottom:20}}>Ask anything from your syllabus.<br/>I'll explain, summarize, quiz you, or analyze images & URLs.</div>
            <div style={{display:'flex',gap:8,justifyContent:'center',flexWrap:'wrap'}}>
              {["Explain Newton's laws","Summarize the water cycle","Quiz me on Photosynthesis"].map(s=>(
                <button key={s} onClick={()=>setInput(s)} style={{padding:'6px 12px',borderRadius:20,border:`1px solid ${t.border}`,background:'transparent',color:t.muted,fontSize:12}}>{s}</button>
              ))}
            </div>
          </div>
        )}
        {messages.map(m=>(
          <div key={m.id} style={{display:'flex',flexDirection:'column',alignItems:m.role==='user'?'flex-end':'flex-start',marginBottom:14}}>
            {m.role==='ai'&&<div style={{fontSize:11,color:t.muted,marginBottom:4,paddingLeft:2}}>🧠 Memora</div>}
            <div style={{maxWidth:'85%',padding:'10px 14px',fontSize:14,borderRadius:m.role==='user'?'16px 16px 4px 16px':'16px 16px 16px 4px',background:m.role==='user'?'#7B6EF6':t.card,border:m.role==='ai'?`1px solid ${t.border}`:'none',color:m.role==='user'?'#fff':t.text}}>
              {m.role==='ai'?(
                <Markdown content={activeQuiz&&activeQuiz.msgId===m.id?m.content.replace(/QUESTION:[\s\S]*$/,'').trim():m.content} dark={dark}/>
              ):m.content}
            </div>

            {/* Quiz UI */}
            {activeQuiz&&activeQuiz.msgId===m.id&&(
              <div style={{maxWidth:'85%',marginTop:10,width:'100%'}}>
                <div style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:14,padding:'14px 16px'}}>
                  <div style={{fontSize:14,fontWeight:600,color:t.text,marginBottom:12,lineHeight:1.6}}>{activeQuiz.question}</div>
                  <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:12}}>
                    {Object.entries(activeQuiz.options).map(([letter,text])=>{
                      let bg=t.card2,border=t.border,col=t.text
                      if(activeQuiz.selected===letter){bg='#7B6EF622';border='#7B6EF6';col='#7B6EF6'}
                      if(activeQuiz.result!==null){
                        if(letter===activeQuiz.correct){bg='#4DC9A022';border='#4DC9A0';col='#4DC9A0'}
                        else if(activeQuiz.selected===letter&&!activeQuiz.result){bg='#F06B6B22';border='#F06B6B';col='#F06B6B'}
                      }
                      return(
                        <button key={letter} onClick={()=>activeQuiz.result===null&&setActiveQuiz(prev=>({...prev,selected:letter}))}
                          style={{padding:'9px 14px',borderRadius:10,border:`1px solid ${border}`,background:bg,color:col,fontSize:13,textAlign:'left',transition:'all 0.15s',cursor:activeQuiz.result!==null?'default':'pointer'}}>
                          <strong>{letter})</strong> {text}
                        </button>
                      )
                    })}
                  </div>
                  {activeQuiz.result===null?(
                    <button onClick={submitQuizAnswer} disabled={!activeQuiz.selected} style={{width:'100%',padding:'9px',borderRadius:10,border:'none',background:activeQuiz.selected?'#7B6EF6':t.border,color:'#fff',fontSize:13,fontWeight:600,opacity:activeQuiz.selected?1:0.5}}>
                      Check Answer
                    </button>
                  ):(
                    <div style={{padding:'10px 14px',borderRadius:10,background:activeQuiz.result?'#4DC9A022':'#F06B6B22',border:`1px solid ${activeQuiz.result?'#4DC9A040':'#F06B6B40'}`,textAlign:'center'}}>
                      <div style={{fontSize:14,fontWeight:700,color:activeQuiz.result?'#4DC9A0':'#F06B6B'}}>
                        {activeQuiz.result?'✅ Correct! Well done.':'❌ Wrong. Correct answer: '+activeQuiz.correct}
                      </div>
                      {!activeQuiz.result&&<div style={{fontSize:12,color:t.muted,marginTop:4}}>Topic added to weak topics list.</div>}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div style={{display:'flex',alignItems:'center',gap:8,marginTop:4,paddingLeft:m.role==='ai'?2:0}}>
              {m.role==='ai'&&<button onClick={()=>onSaveNote(m.content)} style={{fontSize:11,color:'#7B6EF6',background:'none',border:'none',padding:0}}>+ Save as note</button>}
            </div>
          </div>
        ))}
        {typing&&<div style={{display:'flex',gap:4,alignItems:'center',padding:'10px 14px',background:t.card,border:`1px solid ${t.border}`,borderRadius:'16px 16px 16px 4px',width:'fit-content',marginBottom:14}}>{[0,1,2].map(i=><span key={i} style={{display:'inline-block',width:6,height:6,borderRadius:'50%',background:t.muted,animation:'bounce 1.1s ease infinite',animationDelay:i*0.18+'s'}}/>)}</div>}
        <div ref={bottomRef}/>
      </div>

      {/* Attachment preview */}
      {attachment&&(
        <div style={{padding:'6px 14px',borderTop:`1px solid ${t.border}`,background:t.card2,display:'flex',alignItems:'center',gap:8}}>
          <span style={{fontSize:12,color:'#7B6EF6'}}>📎 {attachment.type==='image'?'Image':'URL'}: {attachment.preview.slice(0,40)}{attachment.preview.length>40?'...':''}</span>
          <button onClick={()=>setAttachment(null)} style={{background:'none',border:'none',color:t.red,fontSize:14,padding:0}}>✕</button>
        </div>
      )}

      {/* Attach panel */}
      {showAttach&&(
        <div style={{padding:'10px 14px',borderTop:`1px solid ${t.border}`,background:t.card2}}>
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            <input value={urlInput} onChange={e=>setUrlInput(e.target.value)} placeholder="Paste a URL to analyze..." style={{flex:1,padding:'8px 12px',borderRadius:10,border:`1px solid ${t.border}`,background:t.card,color:t.text,fontSize:13}} onKeyDown={e=>e.key==='Enter'&&addUrl()}/>
            <button onClick={addUrl} style={{padding:'8px 14px',borderRadius:10,border:'none',background:'#7B6EF6',color:'#fff',fontSize:12,fontWeight:600}}>Add URL</button>
            <button onClick={()=>fileRef.current.click()} style={{padding:'8px 14px',borderRadius:10,border:`1px solid ${t.border}`,background:'transparent',color:t.muted,fontSize:12}}>📷 Image</button>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{display:'none'}}/>
            <button onClick={()=>setShowAttach(false)} style={{background:'none',border:'none',color:t.muted,fontSize:18,padding:0}}>✕</button>
          </div>
        </div>
      )}

      {/* Input area */}
      <div style={{padding:'10px 14px 16px',borderTop:`1px solid ${t.border}`,background:t.bg,flexShrink:0}}>
        {limitHit&&<div style={{fontSize:13,color:t.red,background:t.red+'15',border:`1px solid ${t.red}30`,borderRadius:8,padding:'8px 12px',marginBottom:10,textAlign:'center',cursor:'pointer'}} onClick={onUpgrade}>Daily limit reached. <span style={{textDecoration:'underline',fontWeight:600}}>Upgrade to Premium</span> for unlimited messages.</div>}
        <div style={{display:'flex',gap:6,marginBottom:10,flexWrap:'wrap'}}>
          {modes.map(m=>(
            <button key={m.id} onClick={()=>setMode(m.id)} style={{padding:'4px 12px',borderRadius:20,border:`1px solid ${mode===m.id?m.color:t.border}`,background:mode===m.id?m.color+'20':'transparent',color:mode===m.id?m.color:t.muted,fontSize:12,fontWeight:mode===m.id?600:400}}>{m.label}</button>
          ))}
        </div>
        <div style={{display:'flex',gap:8,alignItems:'flex-end'}}>
          <button onClick={()=>setShowAttach(!showAttach)} style={{padding:'10px 12px',borderRadius:12,border:`1px solid ${t.border}`,background:showAttach?'#7B6EF622':'transparent',color:showAttach?'#7B6EF6':t.muted,fontSize:16,flexShrink:0}}>📎</button>
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&send()} placeholder={mode==='quiz'?'Enter a topic to get quizzed...':'Ask anything from your syllabus...'} disabled={limitHit} style={{flex:1,padding:'10px 14px',borderRadius:12,border:`1px solid ${t.border}`,background:t.card,color:t.text,fontSize:14}}/>
          <button onClick={send} disabled={typing||!input.trim()||limitHit} style={{padding:'10px 18px',borderRadius:12,border:'none',background:typing||!input.trim()||limitHit?t.border:'#7B6EF6',color:'#fff',fontSize:13,fontWeight:600,flexShrink:0,opacity:typing||!input.trim()||limitHit?0.5:1,cursor:typing||!input.trim()||limitHit?'not-allowed':'pointer'}}>Send</button>
        </div>
      </div>
    </div>
  )
}

// ── Notes Tab ──────────────────────────────────────────────────────────────
function NotesTab({user,notes,setNotes,prefill,clearPrefill,dark}){
  const t=T(dark)
  const [filter,setFilter]=useState('')
  const [showModal,setShowModal]=useState(false)
  const [form,setForm]=useState({title:'',body:'',tag:''})
  const [loading,setLoading]=useState(true)
  const [expanded,setExpanded]=useState(null)

  useEffect(()=>{
    supabase.from('notes').select('*').eq('user_id',user.id).order('created_at',{ascending:false}).then(({data})=>{
      if(data)setNotes(data)
      setLoading(false)
    })
  },[])

  useEffect(()=>{
    if(prefill){setForm({title:'AI Response',body:prefill.slice(0,800),tag:'ai'});setShowModal(true);clearPrefill()}
  },[prefill])

  async function saveNote(){
    if(!form.title.trim()||!form.body.trim())return
    const{data,error}=await supabase.from('notes').insert({user_id:user.id,title:form.title.trim(),body:form.body.trim(),tag:form.tag.trim()||'general'}).select().single()
    if(!error&&data){setNotes(prev=>[data,...prev]);setShowModal(false);setForm({title:'',body:'',tag:''})}
  }

  async function deleteNote(id){
    await supabase.from('notes').delete().eq('id',id)
    setNotes(prev=>prev.filter(n=>n.id!==id))
  }

  const tagColors={math:'#F0A86B',physics:'#4DC9A0',ai:'#7B6EF6',chemistry:'#F06B6B',biology:'#6BC9F0',general:t.muted}
  const filtered=filter.trim()?notes.filter(n=>n.title.toLowerCase().includes(filter.toLowerCase())||n.body.toLowerCase().includes(filter.toLowerCase())||n.tag.toLowerCase().includes(filter.toLowerCase())):notes
  const fld={width:'100%',padding:'9px 12px',borderRadius:10,border:`1px solid ${t.border}`,background:t.card2,color:t.text,fontSize:13}

  return(
    <div style={{display:'flex',flexDirection:'column',height:'100%',overflow:'hidden'}}>
      <div style={{display:'flex',gap:8,padding:'10px 14px',borderBottom:`1px solid ${t.border}`,flexShrink:0}}>
        <input value={filter} onChange={e=>setFilter(e.target.value)} placeholder="Filter notes..." style={{...fld,flex:1}}/>
        <button onClick={()=>{setForm({title:'',body:'',tag:''});setShowModal(true)}} style={{padding:'9px 14px',borderRadius:10,border:'none',background:'#7B6EF6',color:'#fff',fontSize:13,fontWeight:600,whiteSpace:'nowrap',flexShrink:0}}>+ Add</button>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:14}}>
        {loading&&<div style={{textAlign:'center',padding:40,color:t.muted,animation:'pulse 1.5s infinite'}}>Loading...</div>}
        {!loading&&filtered.length===0&&<div style={{textAlign:'center',padding:'40px 16px',color:t.muted}}><div style={{fontSize:32,marginBottom:8}}>📝</div><div style={{fontSize:14}}>{filter?'No matching notes.':'No notes yet. Add one or save an AI response.'}</div></div>}
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {filtered.map(n=>(
            <div key={n.id} style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:14,overflow:'hidden',transition:'all 0.2s'}}>
              <div style={{padding:'12px 14px',cursor:'pointer'}} onClick={()=>setExpanded(expanded===n.id?null:n.id)}>
                <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:6,gap:8}}>
                  <div style={{fontWeight:600,fontSize:14,flex:1,color:t.text}}>{n.title}</div>
                  <div style={{display:'flex',alignItems:'center',gap:6,flexShrink:0}}>
                    <Tag text={n.tag} color={tagColors[n.tag]||'#7B6EF6'}/>
                    <button onClick={e=>{e.stopPropagation();deleteNote(n.id)}} style={{fontSize:12,color:t.red,background:'none',border:'none',padding:'2px 6px'}}>✕</button>
                  </div>
                </div>
                {expanded!==n.id&&<div style={{fontSize:13,color:t.muted,lineHeight:1.5,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{n.body.replace(/[#*`_]/g,'').slice(0,100)}...</div>}
              </div>
              {expanded===n.id&&(
                <div style={{padding:'0 14px 14px',borderTop:`1px solid ${t.border}`}}>
                  <div style={{paddingTop:12}}>
                    <Markdown content={n.body} dark={dark}/>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {showModal&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:999,padding:20}}>
          <div style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:18,padding:24,width:'100%',maxWidth:440}} className="fade-up">
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:17,fontWeight:700,marginBottom:18,color:t.text}}>Save Note 📝</div>
            <div style={{marginBottom:12}}><label style={{fontSize:12,color:t.muted,display:'block',marginBottom:5}}>Title</label><input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Note title..." style={fld}/></div>
            <div style={{marginBottom:12}}><label style={{fontSize:12,color:t.muted,display:'block',marginBottom:5}}>Tag</label><input value={form.tag} onChange={e=>setForm({...form,tag:e.target.value})} placeholder="e.g. math, physics, ai..." style={fld}/></div>
            <div style={{marginBottom:18}}><label style={{fontSize:12,color:t.muted,display:'block',marginBottom:5}}>Content <span style={{color:t.muted,fontSize:11}}>(supports **bold**, *italic*, # headings, - lists)</span></label><textarea value={form.body} onChange={e=>setForm({...form,body:e.target.value})} placeholder="Write your note here... Markdown supported!" rows={5} style={{...fld,resize:'vertical',fontFamily:'monospace'}}/></div>
            <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
              <button onClick={()=>setShowModal(false)} style={{padding:'8px 16px',borderRadius:10,border:`1px solid ${t.border}`,background:'transparent',color:t.muted,fontSize:13}}>Cancel</button>
              <button onClick={saveNote} style={{padding:'8px 20px',borderRadius:10,border:'none',background:'#7B6EF6',color:'#fff',fontSize:13,fontWeight:600}}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Progress Tab ───────────────────────────────────────────────────────────
function ProgressTab({user,profile,weakTopics,setWeakTopics,dark}){
  const t=T(dark)
  async function removeWeak(topic){
    const updated=weakTopics.filter(x=>x!==topic)
    setWeakTopics(updated)
    await supabase.from('profiles').update({weak_topics:updated}).eq('user_id',user.id)
  }
  return(
    <div style={{flex:1,overflowY:'auto',padding:16}}>
      <div style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:14,padding:'14px 16px',marginBottom:14}}>
        <div style={{fontSize:12,color:t.muted,marginBottom:8,fontWeight:600,textTransform:'uppercase',letterSpacing:0.5}}>Your Profile</div>
        {profile?.board?<><div style={{fontSize:15,fontWeight:600,marginBottom:4,color:t.text}}>🎯 {profile.board}</div>{profile.subject&&<div style={{fontSize:13,color:t.muted}}>📚 {profile.subject}</div>}</>:<div style={{fontSize:13,color:t.muted}}>No board selected.</div>}
      </div>
      <div style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:14,padding:'14px 16px',marginBottom:14}}>
        <div style={{fontSize:12,color:t.muted,marginBottom:10,fontWeight:600,textTransform:'uppercase',letterSpacing:0.5}}>⚠️ Weak Topics</div>
        {weakTopics.length===0?<div style={{fontSize:13,color:t.muted}}>No weak topics yet. Quiz wrong answers appear here.</div>:(
          <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
            {weakTopics.map(topic=>(
              <div key={topic} style={{display:'flex',alignItems:'center',gap:6,background:t.red+'15',border:`1px solid ${t.red}30`,borderRadius:20,padding:'4px 10px'}}>
                <span style={{fontSize:12,color:t.red}}>{topic}</span>
                <button onClick={()=>removeWeak(topic)} style={{background:'none',border:'none',color:t.red,fontSize:12,padding:0}}>✕</button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:14,padding:'14px 16px'}}>
        <div style={{fontSize:12,color:t.muted,marginBottom:10,fontWeight:600,textTransform:'uppercase',letterSpacing:0.5}}>💡 Study Tips</div>
        {['Use Quiz mode to test yourself on weak topics','Save important AI explanations as notes','Use Summarize mode before exams','Upload images of diagrams or textbook pages','Add URLs of study materials for AI analysis'].map((tip,i,arr)=>(
          <div key={i} style={{fontSize:13,color:t.muted,padding:'6px 0',borderBottom:i<arr.length-1?`1px solid ${t.border}`:'none'}}>• {tip}</div>
        ))}
      </div>
    </div>
  )
}

// ── Search Tab ─────────────────────────────────────────────────────────────
function SearchTab({notes,dark}){
  const t=T(dark)
  const [q,setQ]=useState('')
  function hl(text,query){
    if(!query.trim())return text
    const parts=text.split(new RegExp('('+query.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','gi'))
    return parts.map((p,i)=>p.toLowerCase()===query.toLowerCase()?<mark key={i} style={{background:'#7B6EF622',color:'#7B6EF6',borderRadius:3,padding:'0 2px'}}>{p}</mark>:p)
  }
  const results=q.trim()?notes.filter(n=>n.title.toLowerCase().includes(q.toLowerCase())||n.body.toLowerCase().includes(q.toLowerCase())).map(n=>({title:n.title,snippet:n.body.replace(/[#*`_]/g,'').slice(0,160),tag:n.tag})):[]
  return(
    <div style={{display:'flex',flexDirection:'column',height:'100%',overflow:'hidden'}}>
      <div style={{padding:'12px 14px',borderBottom:`1px solid ${t.border}`,flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',gap:10,background:t.card,border:`1px solid ${t.border}`,borderRadius:12,padding:'9px 14px'}}>
          <span style={{fontSize:16,flexShrink:0}}>🔍</span>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search your notes..." autoFocus style={{flex:1,background:'none',border:'none',outline:'none',color:t.text,fontSize:14}}/>
          {q&&<button onClick={()=>setQ('')} style={{background:'none',border:'none',color:t.muted,fontSize:16,padding:0}}>✕</button>}
        </div>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:14}}>
        {!q&&<div style={{textAlign:'center',padding:'40px 16px',color:t.muted}}><div style={{fontSize:32,marginBottom:8}}>🔍</div><div style={{fontSize:14}}>Search your saved notes</div></div>}
        {q&&results.length===0&&<div style={{textAlign:'center',padding:'40px 16px',color:t.muted}}><div style={{fontSize:14}}>No results for <strong style={{color:t.text}}>"{q}"</strong></div></div>}
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {results.map((r,i)=>(
            <div key={i} style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:12,padding:'10px 14px'}}>
              <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:5}}>
                <span style={{fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:0.5,color:'#7B6EF6'}}>📝 Note</span>
                {r.tag&&<Tag text={r.tag} color="#7B6EF6"/>}
              </div>
              <div style={{fontWeight:600,fontSize:14,marginBottom:4,color:t.text}}>{hl(r.title,q)}</div>
              <div style={{fontSize:13,color:t.muted,lineHeight:1.6}}>{hl(r.snippet,q)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Sidebar ────────────────────────────────────────────────────────────────
function Sidebar({tab,setTab,user,notes,dark,setDark,onLogout,onUpgrade,isPremium}){
  const t=T(dark)
  const userName=user.user_metadata?.name||user.email.split('@')[0]
  const navItems=[
    {id:'chat',icon:'💬',label:'Chat'},
    {id:'notes',icon:'📝',label:'Notes',badge:notes.length},
    {id:'progress',icon:'📊',label:'Progress'},
    {id:'search',icon:'🔍',label:'Search'},
  ]
  return(
    <div style={{width:220,height:'100%',background:t.sidebar,borderRight:`1px solid ${t.border}`,display:'flex',flexDirection:'column',flexShrink:0}}>
      {/* Logo */}
      <div style={{padding:'20px 16px 16px',borderBottom:`1px solid ${t.border}`}}>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:700,color:t.text}}>🧠 <span style={{color:'#7B6EF6'}}>Memora</span></div>
        <div style={{fontSize:11,color:t.muted,marginTop:2}}>AI Study Companion</div>
      </div>

      {/* Nav */}
      <div style={{flex:1,padding:'10px 8px',overflowY:'auto'}}>
        {navItems.map(item=>(
          <button key={item.id} onClick={()=>setTab(item.id)} style={{width:'100%',padding:'10px 12px',borderRadius:10,border:'none',background:tab===item.id?'#7B6EF622':'transparent',color:tab===item.id?'#7B6EF6':t.muted,fontSize:14,fontWeight:tab===item.id?600:400,display:'flex',alignItems:'center',gap:10,marginBottom:4,transition:'all 0.15s',textAlign:'left'}}>
            <span style={{fontSize:16,width:20,textAlign:'center'}}>{item.icon}</span>
            {item.label}
            {item.badge>0&&<span style={{marginLeft:'auto',fontSize:10,background:'#7B6EF622',color:'#7B6EF6',borderRadius:10,padding:'1px 6px',fontWeight:700}}>{item.badge}</span>}
          </button>
        ))}

        {/* Upgrade button */}
        {!isPremium&&(
          <button onClick={onUpgrade} style={{width:'100%',marginTop:10,padding:'10px 12px',borderRadius:10,border:'1px solid #7B6EF644',background:'#7B6EF610',color:'#7B6EF6',fontSize:13,fontWeight:600,display:'flex',alignItems:'center',gap:10,textAlign:'left'}}>
            <span style={{fontSize:16}}>⭐</span>
            Upgrade to Pro
          </button>
        )}
        {isPremium&&<div style={{margin:'10px 4px',padding:'8px 12px',borderRadius:10,background:'#F0A86B15',border:'1px solid #F0A86B30',fontSize:12,color:'#F0A86B',fontWeight:600}}>⭐ Premium Active</div>}
      </div>

      {/* Theme toggle + User */}
      <div style={{padding:'10px 8px',borderTop:`1px solid ${t.border}`}}>
        <button onClick={()=>setDark(!dark)} style={{width:'100%',padding:'8px 12px',borderRadius:10,border:`1px solid ${t.border}`,background:'transparent',color:t.muted,fontSize:13,display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
          <span>{dark?'☀️':'🌙'}</span>
          {dark?'Light Mode':'Dark Mode'}
        </button>
        <div style={{display:'flex',alignItems:'center',gap:8,padding:'8px 4px'}}>
          <Avatar name={userName} size={30}/>
          <div style={{flex:1,overflow:'hidden'}}>
            <div style={{fontSize:13,fontWeight:600,color:t.text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{userName}</div>
            <button onClick={onLogout} style={{background:'none',border:'none',color:t.muted,fontSize:11,padding:0,cursor:'pointer',textAlign:'left'}}>Logout</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Bottom Tabs (Mobile) ───────────────────────────────────────────────────
function BottomTabs({tab,setTab,notes,dark}){
  const t=T(dark)
  const items=[{id:'chat',icon:'💬',label:'Chat'},{id:'notes',icon:'📝',label:'Notes',badge:notes.length},{id:'progress',icon:'📊',label:'Progress'},{id:'search',icon:'🔍',label:'Search'}]
  return(
    <div style={{display:'flex',borderTop:`1px solid ${t.border}`,background:t.sidebar,flexShrink:0}}>
      {items.map(item=>(
        <button key={item.id} onClick={()=>setTab(item.id)} style={{flex:1,padding:'10px 4px 8px',border:'none',borderTop:`2px solid ${tab===item.id?'#7B6EF6':'transparent'}`,background:'transparent',color:tab===item.id?'#7B6EF6':t.muted,fontSize:10,fontWeight:tab===item.id?600:400,display:'flex',flexDirection:'column',alignItems:'center',gap:2,transition:'all 0.15s',position:'relative'}}>
          <span style={{fontSize:18}}>{item.icon}</span>
          {item.label}
          {item.badge>0&&<span style={{position:'absolute',top:6,right:'calc(50% - 16px)',fontSize:9,background:'#7B6EF6',color:'#fff',borderRadius:10,padding:'1px 4px',fontWeight:700}}>{item.badge}</span>}
        </button>
      ))}
    </div>
  )
}

// ── Main App ───────────────────────────────────────────────────────────────
export default function App(){
  const [user,setUser]=useState(null)
  const [loading,setLoading]=useState(true)
  const [profile,setProfile]=useState(null)
  const [showProfileSetup,setShowProfileSetup]=useState(false)
  const [tab,setTab]=useState('chat')
  const [notes,setNotes]=useState([])
  const [notePrefill,setNotePrefill]=useState(null)
  const [weakTopics,setWeakTopics]=useState([])
  const [dark,setDark]=useState(true)
  const [showPremium,setShowPremium]=useState(false)
  const [isPremium,setIsPremium]=useState(false)
  const [mobile,setMobile]=useState(window.innerWidth<768)

  useEffect(()=>{
    const handler=()=>setMobile(window.innerWidth<768)
    window.addEventListener('resize',handler)
    return()=>window.removeEventListener('resize',handler)
  },[])

  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>{
      if(session?.user){setUser(session.user);loadProfile(session.user.id)}
      else setLoading(false)
    })
    const{data:{subscription}}=supabase.auth.onAuthStateChange((_e,session)=>{
      if(session?.user){setUser(session.user);loadProfile(session.user.id)}
      else{setUser(null);setLoading(false)}
    })
    return()=>subscription.unsubscribe()
  },[])

  async function loadProfile(userId){
    const{data}=await supabase.from('profiles').select('*').eq('user_id',userId).single()
    if(data){setProfile(data);setWeakTopics(data.weak_topics||[]);setIsPremium(!!data.premium)}
    else setShowProfileSetup(true)
    setLoading(false)
  }

  async function logout(){
    await supabase.auth.signOut()
    setUser(null);setProfile(null);setNotes([]);setTab('chat')
  }

  function saveFromAI(content){setNotePrefill(content);setTab('notes')}
  function onProfileDone(p){setProfile(p);setShowProfileSetup(false)}

  const t=T(dark)

  if(loading)return <div style={{minHeight:'100vh',background:dark?'#0D0D12':'#F4F3FF',display:'flex',alignItems:'center',justifyContent:'center'}}><style>{getCSS(dark)}</style><div style={{fontSize:40,animation:'pulse 1.5s ease infinite'}}>🧠</div></div>
  if(!user)return <><style>{getCSS(dark)}</style><AuthScreen onAuth={setUser} dark={dark}/></>
  if(showProfileSetup)return <><style>{getCSS(dark)}</style><ProfileSetup user={user} onDone={onProfileDone} dark={dark}/></>

  return(
    <div style={{height:'100vh',display:'flex',flexDirection:'column',background:t.bg,color:t.text,overflow:'hidden'}}>
      <style>{getCSS(dark)}</style>

      {/* Mobile topbar */}
      {mobile&&(
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 16px',borderBottom:`1px solid ${t.border}`,background:t.sidebar,flexShrink:0}}>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:17,fontWeight:700}}>🧠 <span style={{color:'#7B6EF6'}}>Memora</span></div>
          <div style={{display:'flex',gap:8}}>
            {!isPremium&&<button onClick={()=>setShowPremium(true)} style={{fontSize:11,padding:'4px 10px',borderRadius:20,border:'1px solid #7B6EF644',background:'#7B6EF610',color:'#7B6EF6',fontWeight:600}}>⭐ Pro</button>}
            <button onClick={()=>setDark(!dark)} style={{background:'none',border:'none',fontSize:18,padding:0}}>{dark?'☀️':'🌙'}</button>
            <Avatar name={user.user_metadata?.name||user.email.split('@')[0]} size={28}/>
          </div>
        </div>
      )}

      {/* Main layout */}
      <div style={{flex:1,display:'flex',overflow:'hidden'}}>
        {!mobile&&<Sidebar tab={tab} setTab={setTab} user={user} notes={notes} dark={dark} setDark={setDark} onLogout={logout} onUpgrade={()=>setShowPremium(true)} isPremium={isPremium}/>}

        <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
          {tab==='chat'&&<ChatTab user={user} notes={notes} profile={profile} onSaveNote={saveFromAI} weakTopics={weakTopics} setWeakTopics={setWeakTopics} isPremium={isPremium} dark={dark} onUpgrade={()=>setShowPremium(true)}/>}
          {tab==='notes'&&<NotesTab user={user} notes={notes} setNotes={setNotes} prefill={notePrefill} clearPrefill={()=>setNotePrefill(null)} dark={dark}/>}
          {tab==='progress'&&<ProgressTab user={user} profile={profile} weakTopics={weakTopics} setWeakTopics={setWeakTopics} dark={dark}/>}
          {tab==='search'&&<SearchTab notes={notes} dark={dark}/>}
        </div>
      </div>

      {mobile&&<BottomTabs tab={tab} setTab={setTab} notes={notes} dark={dark}/>}
      {showPremium&&<PremiumModal onClose={()=>setShowPremium(false)} dark={dark}/>}
    </div>
  )
}
