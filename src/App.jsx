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

function today(){return new Date().toISOString().split('T')[0]}
function genId(){return Date.now()+'_'+Math.random().toString(36).slice(2,8)}

async function callAI(messages,system,image,url){
  const body={messages,system}
  if(image)body.image=image
  if(url)body.url=url
  const res=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})
  const data=await res.json()
  if(data.error==='RATE_LIMIT')throw new Error('RATE_LIMIT')
  if(data.error)throw new Error(data.error)
  if(!data.reply)throw new Error('No response')
  return data.reply
}

function parseQuiz(text){
  try{
    const lines=text.split('\n').map(l=>l.trim()).filter(Boolean)
    let q='',a='',b='',c='',d='',ans=''
    for(const line of lines){
      if(line.startsWith('QUESTION:'))q=line.replace('QUESTION:','').trim()
      else if(/^A[\)\.]\s*/.test(line))a=line.replace(/^A[\)\.]\s*/,'').trim()
      else if(/^B[\)\.]\s*/.test(line))b=line.replace(/^B[\)\.]\s*/,'').trim()
      else if(/^C[\)\.]\s*/.test(line))c=line.replace(/^C[\)\.]\s*/,'').trim()
      else if(/^D[\)\.]\s*/.test(line))d=line.replace(/^D[\)\.]\s*/,'').trim()
      else if(line.startsWith('ANSWER:'))ans=line.replace('ANSWER:','').trim().charAt(0).toUpperCase()
    }
    if(!q||!a||!b||!c||!d||!['A','B','C','D'].includes(ans))return null
    return{question:q,options:{A:a,B:b,C:c,D:d},correct:ans}
  }catch{return null}
}

// ── Group flat messages into conversations ─────────────────────────────────
function groupConversations(messages){
  if(!messages.length)return[]
  const sorted=[...messages].sort((a,b)=>new Date(a.created_at)-new Date(b.created_at))
  const groups=[]
  let current=[sorted[0]]
  for(let i=1;i<sorted.length;i++){
    const gap=new Date(sorted[i].created_at)-new Date(sorted[i-1].created_at)
    if(gap>45*60*1000){groups.push(current);current=[sorted[i]]}
    else current.push(sorted[i])
  }
  groups.push(current)
  return groups.reverse().map(msgs=>{
    const firstUser=msgs.find(m=>m.role==='user')
    return{
      id:msgs[0].id,
      title:firstUser?firstUser.content.replace(/[#*`_\[\]]/g,'').trim().slice(0,60):'Chat session',
      date:msgs[0].created_at?.split('T')[0]||today(),
      messages:msgs
    }
  })
}

function getDateLabel(dateStr){
  const t=today()
  const yest=new Date();yest.setDate(yest.getDate()-1)
  const yd=yest.toISOString().split('T')[0]
  if(dateStr===t)return'Today'
  if(dateStr===yd)return'Yesterday'
  const diff=Math.floor((new Date()-new Date(dateStr))/(86400000))
  if(diff<=7)return'Previous 7 Days'
  return new Date(dateStr).toLocaleDateString('en-IN',{month:'long',year:'numeric'})
}

// ── Theme ──────────────────────────────────────────────────────────────────
const T=(dark)=>({
  bg:       dark?'#212121':'#FFFFFF',
  sidebar:  dark?'#171717':'#F0F0F0',
  surface:  dark?'#2A2A2A':'#F7F7F7',
  card:     dark?'#2F2F2F':'#FFFFFF',
  card2:    dark?'#383838':'#F0F0F0',
  border:   dark?'#3A3A3A':'#E0E0E0',
  text:     dark?'#ECECEC':'#0A0A0A',
  muted:    dark?'#8C8C8C':'#606060',
  accent:   '#8B5CF6',
  green:    '#16A34A',
  red:      '#DC2626',
  orange:   '#D97706',
  hoverNav: dark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.05)',
  userBubble:dark?'#303030':'#F0F0F0',
})

const CSS=(dark)=>`
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html,body,#root{height:100%;}
body{font-family:'DM Sans',sans-serif;background:${dark?'#212121':'#FFFFFF'};color:${dark?'#ECECEC':'#0A0A0A'};-webkit-font-smoothing:antialiased;}
input,textarea,button,select{font-family:'DM Sans',sans-serif;}
input::placeholder,textarea::placeholder{color:${dark?'#555':'#AAA'};}
input:focus,textarea:focus,select:focus{outline:none;border-color:#8B5CF6!important;}
button{cursor:pointer;transition:background 0.15s,color 0.15s,opacity 0.15s;}
button:active{transform:scale(0.97);}
::-webkit-scrollbar{width:4px;}
::-webkit-scrollbar-thumb{background:${dark?'#444':'#CCC'};border-radius:4px;}
::-webkit-scrollbar-track{background:transparent;}
@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-5px)}}
@keyframes spin{to{transform:rotate(360deg)}}
.fu{animation:fadeUp 0.25s ease both;}
.fu1{animation:fadeUp 0.25s 0.05s ease both;}
.fu2{animation:fadeUp 0.25s 0.12s ease both;}
.fu3{animation:fadeUp 0.25s 0.2s ease both;}
.msg{animation:fadeUp 0.2s ease both;}
`

// ── Markdown renderer ──────────────────────────────────────────────────────
function MD({content,dark}){
  if(!content)return null
  const t=T(dark)
  function fmtLine(text){
    const parts=[];let rem=text,k=0
    while(rem.length){
      const bm=rem.match(/\*\*(.*?)\*\*/)
      const im=rem.match(/\*(.*?)\*/)
      const cm=rem.match(/`(.*?)`/)
      const hits=[bm&&{t:'b',i:bm.index,f:bm[0],v:bm[1]},im&&{t:'i',i:im.index,f:im[0],v:im[1]},cm&&{t:'c',i:cm.index,f:cm[0],v:cm[1]}].filter(Boolean).sort((a,b)=>a.i-b.i)
      if(!hits.length){parts.push(rem);break}
      const h=hits[0]
      if(h.i>0)parts.push(rem.slice(0,h.i))
      if(h.t==='b')parts.push(<strong key={k++} style={{fontWeight:600,color:t.text}}>{h.v}</strong>)
      else if(h.t==='i')parts.push(<em key={k++}>{h.v}</em>)
      else parts.push(<code key={k++} style={{background:t.card2,borderRadius:4,padding:'1px 6px',fontSize:'0.875em',fontFamily:'monospace',color:t.accent}}>{h.v}</code>)
      rem=rem.slice(h.i+h.f.length)
    }
    return parts.length===1&&typeof parts[0]==='string'?parts[0]:parts
  }
  const els=[];let i=0,inCode=false,codeLines=[],lang=''
  const lines=content.split('\n')
  while(i<lines.length){
    const l=lines[i]
    if(l.startsWith('```')){
      if(!inCode){inCode=true;codeLines=[];lang=l.slice(3).trim()}
      else{els.push(<div key={i} style={{background:dark?'#1A1A1A':'#F5F5F5',borderRadius:8,border:`1px solid ${t.border}`,overflow:'hidden',margin:'10px 0'}}>
        {lang&&<div style={{padding:'5px 14px',fontSize:11,color:t.muted,borderBottom:`1px solid ${t.border}`,fontWeight:500}}>{lang}</div>}
        <pre style={{padding:'14px',fontSize:13,overflowX:'auto',fontFamily:'monospace',lineHeight:1.65,color:t.text}}><code>{codeLines.join('\n')}</code></pre>
      </div>);inCode=false;codeLines=[];lang=''}
      i++;continue
    }
    if(inCode){codeLines.push(l);i++;continue}
    if(l.startsWith('### '))els.push(<h3 key={i} style={{fontSize:15,fontWeight:600,margin:'10px 0 5px',color:t.text}}>{fmtLine(l.slice(4))}</h3>)
    else if(l.startsWith('## '))els.push(<h2 key={i} style={{fontSize:17,fontWeight:700,margin:'14px 0 7px',color:t.text}}>{fmtLine(l.slice(3))}</h2>)
    else if(l.startsWith('# '))els.push(<h1 key={i} style={{fontSize:20,fontWeight:700,margin:'16px 0 8px',color:t.text}}>{fmtLine(l.slice(2))}</h1>)
    else if(l.startsWith('---'))els.push(<hr key={i} style={{border:'none',borderTop:`1px solid ${t.border}`,margin:'12px 0'}}/>)
    else if(/^[-*•] /.test(l))els.push(<div key={i} style={{display:'flex',gap:9,marginBottom:5,paddingLeft:4}}><span style={{color:t.accent,marginTop:4,flexShrink:0,fontSize:11}}>●</span><span style={{fontSize:15,color:t.text,lineHeight:1.7}}>{fmtLine(l.replace(/^[-*•] /,''))}</span></div>)
    else if(/^\d+\. /.test(l)){const[,n,tx]=l.match(/^(\d+)\. (.*)/);els.push(<div key={i} style={{display:'flex',gap:9,marginBottom:5,paddingLeft:4}}><span style={{color:t.accent,fontWeight:600,fontSize:13,flexShrink:0,minWidth:20}}>{n}.</span><span style={{fontSize:15,color:t.text,lineHeight:1.7}}>{fmtLine(tx)}</span></div>)}
    else if(l.startsWith('> '))els.push(<div key={i} style={{borderLeft:`3px solid ${t.accent}`,paddingLeft:14,margin:'8px 0',color:t.muted,fontSize:15,fontStyle:'italic'}}>{fmtLine(l.slice(2))}</div>)
    else if(l.trim()==='')els.push(<div key={i} style={{height:8}}/>)
    else els.push(<p key={i} style={{fontSize:15,color:t.text,lineHeight:1.75,margin:'3px 0'}}>{fmtLine(l)}</p>)
    i++
  }
  return <div style={{lineHeight:1.7}}>{els}</div>
}

// ── Landing / Auth ─────────────────────────────────────────────────────────
function Landing({onAuth}){
  const[view,setView]=useState('home')
  const[mode,setMode]=useState('login')
  const[name,setName]=useState('')
  const[email,setEmail]=useState('')
  const[pass,setPass]=useState('')
  const[err,setErr]=useState('')
  const[loading,setLoading]=useState(false)
  async function googleLogin(){setLoading(true);const{error}=await supabase.auth.signInWithOAuth({provider:'google',options:{redirectTo:window.location.origin}});if(error){setErr(error.message);setLoading(false)}}
  async function submit(){
    setErr('')
    if(!email.trim()||!pass.trim()){setErr('Email and password required.');return}
    if(mode==='signup'&&!name.trim()){setErr('Name is required.');return}
    setLoading(true)
    try{
      let result
      if(mode==='login'){result=await supabase.auth.signInWithPassword({email:email.trim(),password:pass})}
      else{result=await supabase.auth.signUp({email:email.trim(),password:pass,options:{data:{name:name.trim()}}})}
      if(result.error)setErr(result.error.message)
      else if(result.data?.user)onAuth(result.data.user)
    }catch(e){setErr(e.message)}
    setLoading(false)
  }
  const t=T(true)
  if(view==='auth')return(
    <div style={{minHeight:'100vh',background:'#0D0D0D',display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <div style={{width:'100%',maxWidth:380}} className="fu">
        <div style={{textAlign:'center',marginBottom:32}}>
          <div style={{fontSize:36,marginBottom:10}}>🧠</div>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:26,fontWeight:800,color:'#ECECEC',letterSpacing:-0.5}}>Memora</div>
          <div style={{fontSize:14,color:t.muted,marginTop:4}}>{mode==='login'?'Welcome back':'Create your account'}</div>
        </div>
        <div style={{background:'#1C1C1C',border:'1px solid #2E2E2E',borderRadius:14,padding:28}}>
          <button onClick={googleLogin} disabled={loading} style={{width:'100%',padding:12,borderRadius:8,border:'1px solid #3A3A3A',background:'#252525',color:'#ECECEC',fontSize:14,fontWeight:500,display:'flex',alignItems:'center',justifyContent:'center',gap:10,marginBottom:20}}>
            <span style={{fontSize:16}}>G</span> Continue with Google
          </button>
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:18}}>
            <div style={{flex:1,height:1,background:'#2E2E2E'}}/>
            <span style={{fontSize:11,color:t.muted}}>or</span>
            <div style={{flex:1,height:1,background:'#2E2E2E'}}/>
          </div>
          <div style={{display:'flex',background:'#252525',borderRadius:7,border:'1px solid #2E2E2E',marginBottom:18,padding:3}}>
            {['login','signup'].map(m=><button key={m} onClick={()=>setMode(m)} style={{flex:1,padding:'7px',borderRadius:5,border:'none',background:mode===m?'#8B5CF6':'transparent',color:mode===m?'#fff':t.muted,fontSize:13,fontWeight:mode===m?600:400,textTransform:'capitalize'}}>{m==='login'?'Sign In':'Sign Up'}</button>)}
          </div>
          {mode==='signup'&&<input value={name} onChange={e=>setName(e.target.value)} placeholder="Full name" style={{width:'100%',padding:'11px 14px',borderRadius:8,border:'1px solid #3A3A3A',background:'#252525',color:'#ECECEC',fontSize:14,marginBottom:10}}/>}
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" type="email" style={{width:'100%',padding:'11px 14px',borderRadius:8,border:'1px solid #3A3A3A',background:'#252525',color:'#ECECEC',fontSize:14,marginBottom:10}}/>
          <input value={pass} onChange={e=>setPass(e.target.value)} placeholder="Password" type="password" onKeyDown={e=>e.key==='Enter'&&submit()} style={{width:'100%',padding:'11px 14px',borderRadius:8,border:'1px solid #3A3A3A',background:'#252525',color:'#ECECEC',fontSize:14,marginBottom:14}}/>
          {err&&<div style={{fontSize:13,color:'#DC2626',marginBottom:12,textAlign:'center'}}>{err}</div>}
          <button onClick={submit} disabled={loading} style={{width:'100%',padding:12,borderRadius:8,border:'none',background:'#8B5CF6',color:'#fff',fontSize:14,fontWeight:700}}>{loading?'Please wait...':(mode==='login'?'Sign In →':'Create Account →')}</button>
        </div>
        <div style={{textAlign:'center',marginTop:20}}><button onClick={()=>setView('home')} style={{background:'none',border:'none',color:t.muted,fontSize:13}}>← Back</button></div>
      </div>
    </div>
  )
  return(
    <div style={{minHeight:'100vh',background:'#0D0D0D',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:20,textAlign:'center'}}>
      <div className="fu" style={{maxWidth:480,width:'100%'}}>
        <div style={{fontSize:52,marginBottom:16}}>🧠</div>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:38,fontWeight:800,color:'#ECECEC',letterSpacing:-1,marginBottom:8}}>Memora</div>
        <div style={{fontSize:16,color:'#8C8C8C',marginBottom:40,lineHeight:1.6}}>Your AI study companion.<br/>Explain, quiz, summarize — anything from your syllabus.</div>
        <button onClick={()=>setView('auth')} style={{padding:'14px 40px',borderRadius:10,border:'none',background:'#8B5CF6',color:'#fff',fontSize:15,fontWeight:700,marginBottom:12}}>Get Started Free →</button>
        <div style={{fontSize:13,color:'#555'}}>No credit card required</div>
      </div>
    </div>
  )
}

// ── Profile Setup ──────────────────────────────────────────────────────────
function ProfileSetup({user,onDone,dark}){
  const t=T(dark)
  const[step,setStep]=useState(0)
  const[group,setGroup]=useState('')
  const[board,setBoard]=useState('')
  const[subject,setSubject]=useState('')
  const[saving,setSaving]=useState(false)
  const groups=Object.keys(BOARD_GROUPS)
  const boards=group?BOARD_GROUPS[group]:[]
  const subjects=board?BOARDS[board]||[]:[]
  async function save(){
    if(!board)return
    setSaving(true)
    const{data,error}=await supabase.from('profiles').upsert({user_id:user.id,name:user.user_metadata?.name||user.email.split('@')[0],board,subject:subject||null,weak_topics:[],premium:false},{onConflict:'user_id'}).select().single()
    if(!error&&data)onDone(data)
    setSaving(false)
  }
  return(
    <div style={{minHeight:'100vh',background:t.bg,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <style>{CSS(dark)}</style>
      <div style={{width:'100%',maxWidth:460}} className="fu">
        <div style={{marginBottom:28,textAlign:'center'}}>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:800,color:t.text,marginBottom:6}}>Set up your profile</div>
          <div style={{fontSize:14,color:t.muted}}>So Memora can personalize your study experience.</div>
        </div>
        <div style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:14,padding:24}}>
          <div style={{marginBottom:16}}>
            <label style={{fontSize:12,color:t.muted,fontWeight:600,display:'block',marginBottom:7,textTransform:'uppercase',letterSpacing:0.5}}>Category</label>
            <select value={group} onChange={e=>{setGroup(e.target.value);setBoard('');setSubject('')}} style={{width:'100%',padding:'11px 14px',borderRadius:8,border:`1px solid ${t.border}`,background:t.card2,color:t.text,fontSize:14,appearance:'none'}}>
              <option value=''>Select your category...</option>
              {groups.map(g=><option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          {group&&<div style={{marginBottom:16}}>
            <label style={{fontSize:12,color:t.muted,fontWeight:600,display:'block',marginBottom:7,textTransform:'uppercase',letterSpacing:0.5}}>Course / Class</label>
            <select value={board} onChange={e=>{setBoard(e.target.value);setSubject('')}} style={{width:'100%',padding:'11px 14px',borderRadius:8,border:`1px solid ${t.border}`,background:t.card2,color:t.text,fontSize:14,appearance:'none'}}>
              <option value=''>Select...</option>
              {boards.map(b=><option key={b} value={b}>{b}</option>)}
            </select>
          </div>}
          {board&&subjects.length>0&&<div style={{marginBottom:20}}>
            <label style={{fontSize:12,color:t.muted,fontWeight:600,display:'block',marginBottom:7,textTransform:'uppercase',letterSpacing:0.5}}>Primary Subject <span style={{fontWeight:400,textTransform:'none'}}>(optional)</span></label>
            <select value={subject} onChange={e=>setSubject(e.target.value)} style={{width:'100%',padding:'11px 14px',borderRadius:8,border:`1px solid ${t.border}`,background:t.card2,color:t.text,fontSize:14,appearance:'none'}}>
              <option value=''>All subjects</option>
              {subjects.map(s=><option key={s} value={s}>{s}</option>)}
            </select>
          </div>}
          <button onClick={save} disabled={!board||saving} style={{width:'100%',padding:13,borderRadius:8,border:'none',background:board?'#8B5CF6':t.border,color:'#fff',fontSize:15,fontWeight:700,opacity:!board?0.4:1}}>{saving?'Saving...':'Start Studying →'}</button>
        </div>
      </div>
    </div>
  )
}

// ── Premium Modal ──────────────────────────────────────────────────────────
function PremiumModal({onClose,dark,user}){
  const t=T(dark)
  const[loading,setLoading]=useState(false)
  const[done,setDone]=useState(false)
  async function pay(){
    setLoading(true)
    try{
      const r=await fetch('/api/payment',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'create_order'})})
      const order=await r.json()
      if(order.error)throw new Error(order.error)
      const options={key:order.keyId,amount:order.amount,currency:order.currency,name:'Memora',description:'Premium Plan',order_id:order.orderId,
        handler:async(response)=>{
          const v=await fetch('/api/payment',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'verify_payment',...response})})
          const vd=await v.json()
          if(vd.verified){await supabase.from('profiles').update({premium:true}).eq('user_id',user.id);setDone(true)}
          else alert('Payment verification failed.')
        },
        prefill:{email:user.email},theme:{color:'#8B5CF6'}}
      const rzp=new window.Razorpay(options);rzp.open()
    }catch(e){alert('Payment error: '+e.message)}
    setLoading(false)
  }
  if(done)return(
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:20}}>
      <div style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:16,padding:40,width:'100%',maxWidth:360,textAlign:'center'}} className="fu">
        <div style={{fontSize:48,marginBottom:14}}>🎉</div>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:800,color:t.text,marginBottom:8}}>You're Premium!</div>
        <div style={{fontSize:14,color:t.muted,marginBottom:24}}>Unlimited messages and all features unlocked.</div>
        <button onClick={()=>{onClose();window.location.reload()}} style={{width:'100%',padding:13,borderRadius:8,border:'none',background:'#8B5CF6',color:'#fff',fontSize:14,fontWeight:600}}>Start Studying →</button>
      </div>
    </div>
  )
  return(
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
        <button onClick={pay} disabled={loading} style={{width:'100%',padding:13,borderRadius:8,border:'none',background:loading?t.border:'#8B5CF6',color:'#fff',fontSize:14,fontWeight:700,marginBottom:8}}>{loading?'Loading...':'Pay ₹99 & Upgrade Now'}</button>
        <div style={{fontSize:11,color:t.muted,textAlign:'center',marginBottom:12}}>🔒 Secure payment by Razorpay</div>
        <button onClick={onClose} style={{width:'100%',padding:10,borderRadius:8,border:`1px solid ${t.border}`,background:'transparent',color:t.muted,fontSize:13}}>Maybe later</button>
      </div>
    </div>
  )
}

// ── Quiz Card ──────────────────────────────────────────────────────────────
function QuizCard({quiz,onAnswer,onNext,onEnd,score,total,dark}){
  const t=T(dark)
  const[sel,setSel]=useState(null)
  const[revealed,setRevealed]=useState(false)
  function submit(){if(!sel)return;setRevealed(true);onAnswer(sel===quiz.correct)}
  function next(){setSel(null);setRevealed(false);onNext()}
  return(
    <div style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:12,padding:'18px 16px',width:'100%',maxWidth:500,marginTop:4}} className="msg">
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
        <span style={{fontSize:12,color:t.muted,fontWeight:500}}>Question {total+1}</span>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <span style={{fontSize:12,fontWeight:700,color:t.green}}>✓ {score}/{total}</span>
          <button onClick={onEnd} style={{fontSize:11,color:t.red,background:'none',border:`1px solid rgba(220,38,38,0.3)`,borderRadius:6,padding:'2px 8px',fontWeight:500}}>End</button>
        </div>
      </div>
      <div style={{fontSize:15,fontWeight:600,color:t.text,marginBottom:16,lineHeight:1.5}}>{quiz.question}</div>
      <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:14}}>
        {Object.entries(quiz.options).map(([letter,text])=>{
          let bg=t.card2,border=t.border,col=t.text
          if(revealed){
            if(letter===quiz.correct){bg=dark?'rgba(22,163,74,0.12)':'rgba(22,163,74,0.08)';border='#16A34A';col='#16A34A'}
            else if(sel===letter){bg=dark?'rgba(220,38,38,0.12)':'rgba(220,38,38,0.08)';border='#DC2626';col='#DC2626'}
          }else if(sel===letter){bg=dark?'rgba(139,92,246,0.12)':'rgba(139,92,246,0.08)';border='#8B5CF6';col='#8B5CF6'}
          return(
            <button key={letter} onClick={()=>!revealed&&setSel(letter)} style={{padding:'11px 14px',borderRadius:8,border:`1.5px solid ${border}`,background:bg,color:col,fontSize:14,textAlign:'left',cursor:revealed?'default':'pointer',display:'flex',alignItems:'center',gap:10,fontWeight:sel===letter?600:400}}>
              <span style={{width:24,height:24,borderRadius:'50%',border:`1.5px solid ${border}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,flexShrink:0,color:col}}>{letter}</span>
              <span style={{flex:1}}>{text}</span>
              {revealed&&letter===quiz.correct&&<span>✓</span>}
              {revealed&&sel===letter&&letter!==quiz.correct&&<span>✗</span>}
            </button>
          )
        })}
      </div>
      {!revealed?(
        <button onClick={submit} disabled={!sel} style={{width:'100%',padding:'11px',borderRadius:8,border:'none',background:sel?'#8B5CF6':t.border,color:'#fff',fontSize:14,fontWeight:600,opacity:sel?1:0.4}}>Submit Answer</button>
      ):(
        <div>
          <div style={{padding:'10px 14px',borderRadius:8,background:sel===quiz.correct?dark?'rgba(22,163,74,0.1)':'rgba(22,163,74,0.06)':'rgba(220,38,38,0.08)',border:`1px solid ${sel===quiz.correct?'rgba(22,163,74,0.3)':'rgba(220,38,38,0.25)'}`,marginBottom:10,textAlign:'center'}}>
            <div style={{fontSize:14,fontWeight:700,color:sel===quiz.correct?t.green:t.red}}>{sel===quiz.correct?'✓ Correct!':'✗ Wrong answer'}</div>
            {sel!==quiz.correct&&<div style={{fontSize:13,color:t.muted,marginTop:3}}>Correct: <strong style={{color:t.green}}>{quiz.correct}) {quiz.options[quiz.correct]}</strong></div>}
          </div>
          <div style={{display:'flex',gap:8}}>
            <button onClick={next} style={{flex:1,padding:'11px',borderRadius:8,border:'none',background:'#8B5CF6',color:'#fff',fontSize:14,fontWeight:600}}>Next Question →</button>
            <button onClick={onEnd} style={{padding:'11px 14px',borderRadius:8,border:`1px solid ${t.border}`,background:'transparent',color:t.muted,fontSize:13}}>End</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Chat Tab ───────────────────────────────────────────────────────────────
const studyModes=[
  {id:'chat',label:'💬 Chat',color:'#8B5CF6'},
  {id:'summarize',label:'📄 Summarize',color:'#0EA5E9'},
  {id:'explain',label:'💡 Explain',color:'#F59E0B'},
  {id:'quiz',label:'🧩 Quiz',color:'#10B981'},
  {id:'flashcard',label:'📋 Flashcards',color:'#EC4899'},
  {id:'predict',label:'🎯 Predict',color:'#EF4444'},
]

function ChatTab({user,notes,profile,onSaveNote,weakTopics,setWeakTopics,isPremium,dark,onUpgrade,aiMode,onNewMessage}){
  const t=T(dark)
  const[messages,setMessages]=useState([])
  const[input,setInput]=useState('')
  const[mode,setMode]=useState('chat')
  const[typing,setTyping]=useState(false)
  const[usage,setUsage]=useState(0)
  const[attachment,setAttachment]=useState(null)
  const[urlInput,setUrlInput]=useState('')
  const[showAttach,setShowAttach]=useState(false)
  const[syllabus,setSyllabus]=useState(null)
  const[syllabusName,setSyllabusName]=useState(null)
  const[parsingSyllabus,setParsingSyllabus]=useState(false)
  const[quizTopic,setQuizTopic]=useState(null)
  const[quizScore,setQuizScore]=useState(0)
  const[quizTotal,setQuizTotal]=useState(0)
  const[currentQuiz,setCurrentQuiz]=useState(null)
  const[quizMsgId,setQuizMsgId]=useState(null)
  const[loadingNext,setLoadingNext]=useState(false)
  const bottomRef=useRef(null)
  const fileRef=useRef(null)
  const syllabusRef=useRef(null)
  const userName=user.user_metadata?.name||user.email.split('@')[0]

  useEffect(()=>{
    supabase.from('usage').select('count').eq('user_id',user.id).eq('date',today()).single().then(({data})=>{if(data)setUsage(data.count)})
  },[])
  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:'smooth'})},[messages,typing,currentQuiz])

  async function trackUsage(){
    const{data}=await supabase.from('usage').select('count').eq('user_id',user.id).eq('date',today()).single()
    if(data){await supabase.from('usage').update({count:data.count+1}).eq('user_id',user.id).eq('date',today());setUsage(v=>v+1)}
    else{await supabase.from('usage').insert({user_id:user.id,date:today(),count:1});setUsage(1)}
  }

  function handleFile(e){
    const file=e.target.files[0];if(!file)return
    if(file.type.startsWith('image/')){const r=new FileReader();r.onload=ev=>setAttachment({type:'image',data:ev.target.result,preview:file.name});r.readAsDataURL(file)}
    else alert('Only image files supported.')
    setShowAttach(false)
  }

  async function handleSyllabusPDF(e){
    const file=e.target.files[0];if(!file)return
    if(!file.name.endsWith('.pdf')){alert('Please upload a PDF file.');return}
    setParsingSyllabus(true);setShowAttach(false)
    try{
      const reader=new FileReader()
      reader.onload=async ev=>{
        try{
          const arr=new Uint8Array(ev.target.result);let text=''
          for(let i=0;i<arr.length;i++){const ch=arr[i];if(ch>=32&&ch<=126)text+=String.fromCharCode(ch);else if(ch===10||ch===13)text+=' '}
          text=text.replace(/\s+/g,' ').trim()
          if(text.length<80){alert('Could not extract text. Use a text-based PDF.');setParsingSyllabus(false);return}
          const res=await fetch('/api/parse-pdf',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text})})
          const data=await res.json()
          if(data.syllabus){setSyllabus(data.syllabus);setSyllabusName(file.name)}
          else alert('Could not parse. Try a different PDF.')
        }catch(err){alert('PDF error: '+err.message)}
        setParsingSyllabus(false)
      }
      reader.readAsArrayBuffer(file)
    }catch(err){alert('Error reading file.');setParsingSyllabus(false)}
  }

  function addUrl(){if(!urlInput.trim())return;setAttachment({type:'url',data:urlInput.trim(),preview:urlInput.trim()});setUrlInput('');setShowAttach(false)}

  function buildSystem(){
    // CRITICAL: Direct, concise responses — no greetings, no question repetition
    const directness = ' IMPORTANT: Never start responses with greetings like "Hi!" or "Sure!". Never repeat the question back to the user. Answer directly and concisely. Give the exact information requested. Do not add filler phrases or unnecessary preambles.'

    if(aiMode==='general')return 'You are Memora, a helpful and friendly AI assistant. Help with anything concisely and directly.' + directness

    let sys='You are Memora, a precise AI study assistant for Indian students.'
    if(profile?.board)sys+=' Student course: '+profile.board+'.'
    if(profile?.subject)sys+=' Subject: '+profile.subject+'.'
    if(syllabus){sys+='\n\nCRITICAL: Student uploaded their exact syllabus. Follow ONLY these units:\n'+syllabus+'\nDo not go outside this syllabus.'}
    else sys+=' Follow the standard curriculum. Cover ALL units completely, never stop after Unit 1.'
    sys+=' Formatting: ## for unit headings, **bold** for key terms, numbered lists for steps. Be exam-focused.'
    if(mode==='summarize')sys+=' Task: Write a structured unit-wise summary covering ALL units.'
    if(mode==='explain')sys+=' Task: Explain in simple language with real examples. Use numbered steps.'
    if(mode==='flashcard')sys+=' Task: Generate 5 flashcard-style Q&A pairs:\nQ: [question]\nA: [concise answer]\n\n(repeat for each)'
    if(mode==='quiz')sys+=' Task: Generate EXACTLY 1 MCQ on the topic. Each part MUST be on its own line:\nQUESTION: [text]\nA) [option]\nB) [option]\nC) [option]\nD) [option]\nANSWER: [A or B or C or D only]'
    if(mode==='predict')sys+=' Task: List 5-8 most likely exam questions based on standard exam patterns. Include brief hints for each.'
    if(notes.length>0)sys+='\n\nStudent notes:\n'+notes.map(n=>'['+n.tag+'] '+n.title+': '+n.body).join('\n')
    if(weakTopics.length>0)sys+='\n\nWeak topics: '+weakTopics.join(', ')
    return sys + directness
  }

  const limitHit=usage>=(isPremium?9999:FREE_LIMIT)

  async function send(){
    const query=input.trim()
    if(!query||typing)return
    if(limitHit){onUpgrade();return}
    setInput('')
    const attNote=attachment?.type==='url'?' [URL: '+attachment.data+']':''
    const userMsg={id:genId(),role:'user',content:query+attNote}
    setMessages(p=>[...p,userMsg]);setTyping(true)
    supabase.from('messages').insert({user_id:user.id,role:'user',content:userMsg.content}).then(()=>{if(onNewMessage)onNewMessage()})
    const apiMsgs=[...messages,userMsg].slice(-14).map(m=>({role:m.role==='ai'?'assistant':'user',content:m.content}))
    const img=attachment?.type==='image'?attachment.data:null
    const url=attachment?.type==='url'?attachment.data:null
    setAttachment(null)
    try{
      await trackUsage()
      const reply=await callAI(apiMsgs,buildSystem(),img,url)
      const aiId=genId()
      const aiMsg={id:aiId,role:'ai',content:reply}
      setMessages(p=>[...p,aiMsg])
      supabase.from('messages').insert({user_id:user.id,role:'ai',content:reply}).then(()=>{if(onNewMessage)onNewMessage()})
      if(mode==='quiz'){
        const parsed=parseQuiz(reply)
        if(parsed){setCurrentQuiz(parsed);setQuizMsgId(aiId);if(!quizTopic){setQuizTopic(query);setQuizScore(0);setQuizTotal(0)}}
      }
    }catch(e){
      const msg=e.message==='RATE_LIMIT'?'⏳ AI is on a short break. Please wait 1-2 minutes and try again.':'Something went wrong. Please try again.'
      setMessages(p=>[...p,{id:genId(),role:'ai',content:msg}])
    }
    setTyping(false)
  }

  async function onQuizAnswer(correct){
    setQuizScore(s=>s+(correct?1:0));setQuizTotal(t=>t+1)
    if(!correct&&quizTopic&&!weakTopics.includes(quizTopic)){
      const up=[...weakTopics,quizTopic];setWeakTopics(up)
      supabase.from('profiles').update({weak_topics:up}).eq('user_id',user.id)
    }
  }

  async function onNextQuestion(){
    setLoadingNext(true);setCurrentQuiz(null)
    if(limitHit){onUpgrade();setLoadingNext(false);return}
    try{
      await trackUsage()
      const reply=await callAI([{role:'user',content:'Next quiz question on: '+quizTopic}],buildSystem(),null,null)
      const aiId=genId()
      setMessages(p=>[...p,{id:aiId,role:'ai',content:reply}])
      const parsed=parseQuiz(reply)
      if(parsed){setCurrentQuiz(parsed);setQuizMsgId(aiId)}
    }catch(e){setMessages(p=>[...p,{id:genId(),role:'ai',content:'Could not load next question.'}])}
    setLoadingNext(false)
  }

  function endQuiz(){
    const summary=`Quiz ended! Score: ${quizScore}/${quizTotal+1}`
    setMessages(p=>[...p,{id:genId(),role:'ai',content:summary}])
    setCurrentQuiz(null);setQuizTopic(null);setQuizScore(0);setQuizTotal(0)
  }

  const suggestions=aiMode==='general'
    ?["What is quantum computing?","Help me write an email","Explain blockchain simply","What's the latest in AI?"]
    :["Explain Newton's laws simply","Summarize the water cycle","Quiz me on Photosynthesis","Predict exam questions for Trigonometry"]

  return(
    <div style={{display:'flex',flexDirection:'column',height:'100%',overflow:'hidden',background:t.bg}}>
      {/* Syllabus badge */}
      {(syllabus||parsingSyllabus)&&(
        <div style={{padding:'8px 20px',borderBottom:`1px solid ${t.border}`,background:t.surface,display:'flex',alignItems:'center',gap:8,flexShrink:0}}>
          {parsingSyllabus?<><span style={{fontSize:12,color:t.muted,animation:'pulse 1.5s infinite'}}>⏳ Parsing syllabus PDF...</span></>:
          <><span style={{fontSize:12,color:t.green}}>✓ Syllabus loaded:</span><span style={{fontSize:12,color:t.muted}}>{syllabusName}</span><button onClick={()=>{setSyllabus(null);setSyllabusName(null)}} style={{background:'none',border:'none',color:t.red,fontSize:12,padding:0,marginLeft:4}}>✕</button></>}
        </div>
      )}

      {/* Messages */}
      <div style={{flex:1,overflowY:'auto',padding:'24px 0'}}>
        {messages.length===0&&(
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100%',padding:'0 20px',textAlign:'center'}} className="fu">
            <div style={{fontSize:32,marginBottom:16}}>🧠</div>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:800,color:t.text,marginBottom:8}}>
              Hi, {userName.split(' ')[0]}!
            </div>
            <div style={{fontSize:15,color:t.muted,marginBottom:32,maxWidth:400}}>
              {aiMode==='study'?'Ask anything from your syllabus. I\'ll explain, summarize, quiz you, or predict exam questions.':'Ask me anything — I\'m here to help.'}
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
          <div key={m.id} className="msg" style={{
            display:'flex',
            flexDirection:m.role==='user'?'row-reverse':'row',
            gap:12,
            padding:'6px 20px',
            maxWidth:760,
            margin:'0 auto',
            width:'100%',
            alignItems:'flex-start',
          }}>
            {/* Avatar */}
            {m.role==='ai'&&(
              <div style={{width:32,height:32,borderRadius:6,background:'#8B5CF6',display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,flexShrink:0,marginTop:2}}>🧠</div>
            )}
            {m.role==='user'&&(
              <div style={{width:32,height:32,borderRadius:6,background:t.card2,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,flexShrink:0,color:t.text,marginTop:2,border:`1px solid ${t.border}`}}>{userName.slice(0,1).toUpperCase()}</div>
            )}

            {/* Message content */}
            <div style={{flex:1,maxWidth:'calc(100% - 44px)',display:'flex',flexDirection:'column',alignItems:m.role==='user'?'flex-end':'flex-start'}}>
              {m.role==='user'?(
                <div style={{padding:'10px 16px',borderRadius:12,background:t.userBubble,color:t.text,fontSize:15,lineHeight:1.6,maxWidth:'85%'}}>
                  {m.content}
                </div>
              ):(
                <>
                  {!(m.role==='ai'&&m.id===quizMsgId&&currentQuiz)&&(
                    <div style={{fontSize:15,color:t.text,lineHeight:1.75,width:'100%'}}>
                      <MD content={m.content} dark={dark}/>
                    </div>
                  )}
                  {m.role==='ai'&&m.id===quizMsgId&&currentQuiz&&(
                    <QuizCard quiz={currentQuiz} onAnswer={onQuizAnswer} onNext={onNextQuestion} onEnd={endQuiz} score={quizScore} total={quizTotal} dark={dark}/>
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
            <input value={urlInput} onChange={e=>setUrlInput(e.target.value)} placeholder="Paste a URL..." style={{flex:1,minWidth:160,padding:'9px 12px',borderRadius:8,border:`1px solid ${t.border}`,background:t.card,color:t.text,fontSize:13}} onKeyDown={e=>e.key==='Enter'&&addUrl()}/>
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
      <div style={{padding:'12px 20px 18px',borderTop:`1px solid ${t.border}`,background:t.bg,flexShrink:0}}>
        {limitHit&&(
          <div style={{fontSize:13,color:t.red,background:'rgba(220,38,38,0.07)',border:'1px solid rgba(220,38,38,0.2)',borderRadius:8,padding:'9px 16px',marginBottom:10,textAlign:'center',cursor:'pointer'}} onClick={onUpgrade}>
            Daily limit reached. <span style={{textDecoration:'underline',fontWeight:700}}>Upgrade to Premium ⭐</span>
          </div>
        )}
        {aiMode==='study'&&(
          <div style={{display:'flex',gap:6,marginBottom:10,flexWrap:'wrap'}}>
            {studyModes.map(m=>(
              <button key={m.id} onClick={()=>setMode(m.id)} style={{padding:'5px 13px',borderRadius:20,border:`1px solid ${mode===m.id?m.color:t.border}`,background:mode===m.id?m.color+'18':'transparent',color:mode===m.id?m.color:t.muted,fontSize:12,fontWeight:mode===m.id?600:400}}>
                {m.label}
              </button>
            ))}
          </div>
        )}
        <div style={{display:'flex',gap:8,alignItems:'flex-end',background:t.card,border:`1px solid ${t.border}`,borderRadius:12,padding:'8px 8px 8px 12px'}}>
          <button onClick={()=>setShowAttach(!showAttach)} style={{padding:'6px 8px',borderRadius:6,border:'none',background:'transparent',color:showAttach?t.accent:t.muted,fontSize:18,flexShrink:0,lineHeight:1}}>📎</button>
          <textarea
            value={input}
            onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send()}}}
            placeholder={mode==='quiz'?'Enter a topic to quiz on...':aiMode==='general'?'Ask me anything...':'Ask anything from your syllabus...'}
            disabled={limitHit}
            rows={1}
            style={{flex:1,padding:'6px 0',border:'none',background:'transparent',color:t.text,fontSize:15,resize:'none',maxHeight:120,lineHeight:1.6}}
            onInput={e=>{e.target.style.height='auto';e.target.style.height=Math.min(e.target.scrollHeight,120)+'px'}}
          />
          <button
            onClick={send}
            disabled={typing||!input.trim()||limitHit}
            style={{padding:'8px 16px',borderRadius:8,border:'none',background:typing||!input.trim()||limitHit?t.card2:'#8B5CF6',color:typing||!input.trim()||limitHit?t.muted:'#fff',fontSize:14,fontWeight:600,flexShrink:0,opacity:typing||!input.trim()||limitHit?0.5:1}}
          >↑</button>
        </div>
        <div style={{fontSize:11,color:t.muted,marginTop:6,textAlign:'center'}}>Enter to send · Shift+Enter for new line{aiMode==='study'?' · Upload syllabus PDF for exact answers':''}</div>
      </div>
    </div>
  )
}

// ── Conversation View (read-only history) ──────────────────────────────────
function ConversationView({conversation,dark,onBack}){
  const t=T(dark)
  const bottomRef=useRef(null)
  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:'instant'})},[conversation])
  return(
    <div style={{display:'flex',flexDirection:'column',height:'100%',overflow:'hidden',background:t.bg}}>
      <div style={{padding:'14px 20px',borderBottom:`1px solid ${t.border}`,display:'flex',alignItems:'center',gap:12,flexShrink:0,background:t.bg}}>
        <button onClick={onBack} style={{padding:'6px 10px',borderRadius:7,border:`1px solid ${t.border}`,background:'transparent',color:t.muted,fontSize:13,fontWeight:500}}>← Back</button>
        <div style={{flex:1,overflow:'hidden'}}>
          <div style={{fontWeight:600,fontSize:14,color:t.text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{conversation.title}</div>
          <div style={{fontSize:11,color:t.muted}}>{new Date(conversation.date).toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'})}</div>
        </div>
        <div style={{fontSize:11,color:t.muted,background:t.card,border:`1px solid ${t.border}`,borderRadius:20,padding:'3px 10px'}}>{conversation.messages.length} messages</div>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'24px 0'}}>
        {conversation.messages.map((m,i)=>(
          <div key={i} className="msg" style={{display:'flex',flexDirection:m.role==='user'?'row-reverse':'row',gap:12,padding:'6px 20px',maxWidth:760,margin:'0 auto',width:'100%',alignItems:'flex-start'}}>
            {m.role==='ai'&&(
              <div style={{width:32,height:32,borderRadius:6,background:'#8B5CF6',display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,flexShrink:0,marginTop:2}}>🧠</div>
            )}
            {m.role==='user'&&(
              <div style={{width:32,height:32,borderRadius:6,background:t.card2,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,flexShrink:0,color:t.text,marginTop:2,border:`1px solid ${t.border}`}}>U</div>
            )}
            <div style={{flex:1,maxWidth:'calc(100% - 44px)',display:'flex',flexDirection:'column',alignItems:m.role==='user'?'flex-end':'flex-start'}}>
              {m.role==='user'?(
                <div style={{padding:'10px 16px',borderRadius:12,background:t.userBubble,color:t.text,fontSize:15,lineHeight:1.6,maxWidth:'85%'}}>{m.content}</div>
              ):(
                <div style={{fontSize:15,color:t.text,lineHeight:1.75,width:'100%'}}><MD content={m.content} dark={dark}/></div>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef}/>
      </div>
    </div>
  )
}

// ── Notes Tab ──────────────────────────────────────────────────────────────
function NotesTab({user,notes,setNotes,prefill,clearPrefill,dark}){
  const t=T(dark)
  const[filter,setFilter]=useState('')
  const[showModal,setShowModal]=useState(false)
  const[form,setForm]=useState({title:'',body:'',tag:''})
  const[loading,setLoading]=useState(true)
  const[expanded,setExpanded]=useState(null)
  useEffect(()=>{supabase.from('notes').select('*').eq('user_id',user.id).order('created_at',{ascending:false}).then(({data})=>{if(data)setNotes(data);setLoading(false)})},[])
  useEffect(()=>{if(prefill){setForm({title:'AI Response',body:prefill.slice(0,900),tag:'ai'});setShowModal(true);clearPrefill()}},[prefill])
  async function save(){
    if(!form.title.trim()||!form.body.trim())return
    const{data,error}=await supabase.from('notes').insert({user_id:user.id,title:form.title.trim(),body:form.body.trim(),tag:form.tag.trim()||'general'}).select().single()
    if(!error&&data){setNotes(p=>[data,...p]);setShowModal(false);setForm({title:'',body:'',tag:''})}
  }
  async function del(id){await supabase.from('notes').delete().eq('id',id);setNotes(p=>p.filter(n=>n.id!==id))}
  const filtered=filter.trim()?notes.filter(n=>n.title.toLowerCase().includes(filter.toLowerCase())||n.body.toLowerCase().includes(filter.toLowerCase())):notes
  const fld={width:'100%',padding:'10px 12px',borderRadius:8,border:`1px solid ${t.border}`,background:t.card2,color:t.text,fontSize:13}
  return(
    <div style={{display:'flex',flexDirection:'column',height:'100%',overflow:'hidden',background:t.bg}}>
      <div style={{padding:'14px 20px',borderBottom:`1px solid ${t.border}`,flexShrink:0,display:'flex',gap:8,background:t.bg}}>
        <input value={filter} onChange={e=>setFilter(e.target.value)} placeholder="Search notes..." style={{...fld,flex:1,padding:'9px 12px'}}/>
        <button onClick={()=>{setForm({title:'',body:'',tag:''});setShowModal(true)}} style={{padding:'9px 18px',borderRadius:8,border:'none',background:'#8B5CF6',color:'#fff',fontSize:13,fontWeight:600,whiteSpace:'nowrap',flexShrink:0}}>＋ New Note</button>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'16px 20px'}}>
        {loading&&<div style={{textAlign:'center',padding:40,color:t.muted,animation:'pulse 1.5s infinite'}}>Loading...</div>}
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
            <div style={{marginBottom:12}}><label style={{fontSize:11,color:t.muted,display:'block',marginBottom:4,fontWeight:600,textTransform:'uppercase',letterSpacing:0.5}}>Title</label><input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Note title..." style={fld}/></div>
            <div style={{marginBottom:12}}><label style={{fontSize:11,color:t.muted,display:'block',marginBottom:4,fontWeight:600,textTransform:'uppercase',letterSpacing:0.5}}>Tag</label><input value={form.tag} onChange={e=>setForm({...form,tag:e.target.value})} placeholder="e.g. math, physics..." style={fld}/></div>
            <div style={{marginBottom:20}}><label style={{fontSize:11,color:t.muted,display:'block',marginBottom:4,fontWeight:600,textTransform:'uppercase',letterSpacing:0.5}}>Content</label><textarea value={form.body} onChange={e=>setForm({...form,body:e.target.value})} placeholder="Write your note..." rows={6} style={{...fld,resize:'vertical',fontFamily:'monospace',fontSize:12}}/></div>
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
function ProgressTab({user,profile,weakTopics,setWeakTopics,notes,dark,onUpgrade,isPremium}){
  const t=T(dark)
  async function removeWeak(topic){const u=weakTopics.filter(x=>x!==topic);setWeakTopics(u);await supabase.from('profiles').update({weak_topics:u}).eq('user_id',user.id)}
  return(
    <div style={{flex:1,overflowY:'auto',padding:'20px',background:t.bg}}>
      <div style={{maxWidth:600,margin:'0 auto'}}>
        <div style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:10,padding:'14px 18px',marginBottom:12}}>
          <div style={{fontSize:11,color:t.muted,marginBottom:10,fontWeight:600,textTransform:'uppercase',letterSpacing:0.5}}>Profile</div>
          {profile?.board?<><div style={{fontSize:15,fontWeight:700,marginBottom:4,color:t.text}}>{profile.board}</div>{profile.subject&&<div style={{fontSize:13,color:t.muted}}>{profile.subject}</div>}</>:<div style={{fontSize:13,color:t.muted}}>No board set.</div>}
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:12}}>
          {[['📝',notes.length,'Notes Saved'],['⚠️',weakTopics.length,'Weak Topics']].map(([ic,val,label],i)=>(
            <div key={i} style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:10,padding:'16px',textAlign:'center'}}>
              <div style={{fontSize:22,marginBottom:6}}>{ic}</div>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:26,fontWeight:800,color:t.accent,marginBottom:2}}>{val}</div>
              <div style={{fontSize:12,color:t.muted}}>{label}</div>
            </div>
          ))}
        </div>
        <div style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:10,padding:'14px 18px',marginBottom:12}}>
          <div style={{fontSize:11,color:t.muted,marginBottom:10,fontWeight:600,textTransform:'uppercase',letterSpacing:0.5}}>Weak Topics</div>
          {weakTopics.length===0?<div style={{fontSize:13,color:t.muted}}>No weak topics yet. Wrong quiz answers appear here automatically.</div>:(
            <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
              {weakTopics.map(topic=>(
                <div key={topic} style={{display:'flex',alignItems:'center',gap:6,padding:'5px 12px',background:dark?'rgba(220,38,38,0.08)':'rgba(220,38,38,0.05)',border:'1px solid rgba(220,38,38,0.25)',borderRadius:20}}>
                  <span style={{fontSize:12,color:t.red,fontWeight:500}}>{topic}</span>
                  <button onClick={()=>removeWeak(topic)} style={{background:'none',border:'none',color:t.red,fontSize:12,padding:0,opacity:0.6}}>✕</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Search Tab ─────────────────────────────────────────────────────────────
function SearchTab({notes,dark}){
  const t=T(dark)
  const[q,setQ]=useState('')
  function hl(text,query){
    if(!query)return text
    const parts=text.split(new RegExp('('+query.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','gi'))
    return parts.map((p,i)=>p.toLowerCase()===query.toLowerCase()?<mark key={i} style={{background:dark?'rgba(139,92,246,0.2)':'rgba(139,92,246,0.12)',color:'#8B5CF6',borderRadius:2,padding:'0 2px'}}>{p}</mark>:p)
  }
  const results=q.trim()?notes.filter(n=>n.title.toLowerCase().includes(q.toLowerCase())||n.body.toLowerCase().includes(q.toLowerCase())).map(n=>({title:n.title,snippet:n.body.replace(/[#*`_]/g,'').slice(0,180),tag:n.tag})):[]
  return(
    <div style={{display:'flex',flexDirection:'column',height:'100%',overflow:'hidden',background:t.bg}}>
      <div style={{padding:'14px 20px',borderBottom:`1px solid ${t.border}`,flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',gap:10,background:t.card,border:`1px solid ${t.border}`,borderRadius:10,padding:'10px 16px',maxWidth:600}}>
          <span style={{fontSize:16,opacity:0.4}}>🔍</span>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search all notes..." autoFocus style={{flex:1,background:'none',border:'none',outline:'none',color:t.text,fontSize:15}}/>
          {q&&<button onClick={()=>setQ('')} style={{background:'none',border:'none',color:t.muted,fontSize:16,padding:0}}>✕</button>}
        </div>
        {q&&<div style={{fontSize:12,color:t.muted,marginTop:8}}>{results.length} result{results.length!==1?'s':''}</div>}
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'16px 20px'}}>
        {!q&&<div style={{textAlign:'center',padding:'60px 20px',color:t.muted}}><div style={{fontSize:36,marginBottom:12}}>🔍</div><div style={{fontSize:15,fontWeight:600,color:t.text,marginBottom:4}}>Search your notes</div><div style={{fontSize:13}}>Find anything across all saved notes.</div></div>}
        {q&&results.length===0&&<div style={{textAlign:'center',padding:'50px 20px',color:t.muted,fontSize:13}}>No results for "<strong style={{color:t.text}}>{q}</strong>"</div>}
        <div style={{display:'flex',flexDirection:'column',gap:10,maxWidth:600}}>
          {results.map((r,i)=>(
            <div key={i} style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:10,padding:'14px 16px'}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
                <span style={{fontSize:11,padding:'2px 9px',borderRadius:20,background:t.card2,color:t.muted,fontWeight:500}}>{r.tag}</span>
              </div>
              <div style={{fontWeight:600,fontSize:14,marginBottom:6,color:t.text,lineHeight:1.4}}>{hl(r.title,q)}</div>
              <div style={{fontSize:13,color:t.muted,lineHeight:1.65}}>{hl(r.snippet,q)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Sidebar ────────────────────────────────────────────────────────────────
function Sidebar({tab,setTab,user,notes,dark,setDark,onLogout,onUpgrade,isPremium,aiMode,setAiMode,conversations,convLoading,onSelectConv,selectedConvId,onNewChat}){
  const t=T(dark)
  const userName=user.user_metadata?.name||user.email.split('@')[0]
  const[search,setSearch]=useState('')
  const[searchFocused,setSearchFocused]=useState(false)

  const filtered=search.trim()
    ?conversations.filter(c=>c.title.toLowerCase().includes(search.toLowerCase()))
    :conversations

  // Group conversations by date label
  const grouped={}
  filtered.forEach(c=>{
    const label=getDateLabel(c.date)
    if(!grouped[label])grouped[label]=[]
    grouped[label].push(c)
  })
  const labelOrder=['Today','Yesterday','Previous 7 Days']
  const sortedLabels=[
    ...labelOrder.filter(l=>grouped[l]),
    ...Object.keys(grouped).filter(l=>!labelOrder.includes(l)).sort((a,b)=>b.localeCompare(a))
  ]

  const bottomNavItems=[
    {id:'notes',icon:'📝',label:'Notes',badge:notes.length},
    {id:'progress',icon:'📊',label:'Progress'},
    {id:'search',icon:'🔍',label:'Search'},
  ]

  return(
    <div style={{width:260,height:'100%',background:t.sidebar,borderRight:`1px solid ${t.border}`,display:'flex',flexDirection:'column',flexShrink:0}}>
      {/* Top: Logo + New Chat */}
      <div style={{padding:'14px 12px 10px',flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:17,fontWeight:800,color:t.text,letterSpacing:-0.3}}>🧠 <span style={{color:'#8B5CF6'}}>Memora</span></div>
          <button onClick={onNewChat} title="New chat" style={{width:32,height:32,borderRadius:7,border:`1px solid ${t.border}`,background:'transparent',color:t.muted,fontSize:16,display:'flex',alignItems:'center',justifyContent:'center'}}
            onMouseEnter={e=>{e.currentTarget.style.background=t.hoverNav;e.currentTarget.style.color=t.text}}
            onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color=t.muted}}>
            ✏️
          </button>
        </div>
        {/* AI Mode toggle */}
        <div style={{display:'flex',background:t.card,borderRadius:7,padding:2,border:`1px solid ${t.border}`}}>
          <button onClick={()=>setAiMode('study')} style={{flex:1,padding:'6px 0',borderRadius:5,border:'none',fontSize:11,fontWeight:aiMode==='study'?700:400,background:aiMode==='study'?'#8B5CF6':'transparent',color:aiMode==='study'?'#fff':t.muted}}>📚 Study</button>
          <button onClick={()=>setAiMode('general')} style={{flex:1,padding:'6px 0',borderRadius:5,border:'none',fontSize:11,fontWeight:aiMode==='general'?700:400,background:aiMode==='general'?t.green:'transparent',color:aiMode==='general'?'#fff':t.muted}}>💬 General</button>
        </div>
      </div>

      {/* Search conversations */}
      <div style={{padding:'0 10px 6px',flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',gap:7,background:t.card,border:`1px solid ${searchFocused?'#8B5CF6':t.border}`,borderRadius:7,padding:'6px 10px',transition:'border-color 0.15s'}}>
          <span style={{fontSize:12,opacity:0.45}}>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} onFocus={()=>setSearchFocused(true)} onBlur={()=>setSearchFocused(false)} placeholder="Search chats..." style={{flex:1,background:'none',border:'none',outline:'none',color:t.text,fontSize:12}}/>
          {search&&<button onClick={()=>setSearch('')} style={{background:'none',border:'none',color:t.muted,fontSize:13,padding:0}}>✕</button>}
        </div>
      </div>

      {/* Conversations list */}
      <div style={{flex:1,overflowY:'auto',padding:'4px 0'}}>
        {convLoading&&<div style={{padding:'20px 16px',textAlign:'center',color:t.muted,fontSize:12,animation:'pulse 1.5s infinite'}}>Loading chats...</div>}
        {!convLoading&&filtered.length===0&&!search&&(
          <div style={{padding:'20px 16px',textAlign:'center',color:t.muted,fontSize:12}}>
            <div style={{marginBottom:4}}>No chats yet</div>
            <div style={{fontSize:11,opacity:0.7}}>Start a conversation to see it here</div>
          </div>
        )}
        {!convLoading&&search&&filtered.length===0&&(
          <div style={{padding:'16px',textAlign:'center',color:t.muted,fontSize:12}}>No chats match "{search}"</div>
        )}
        {sortedLabels.map(label=>(
          <div key={label}>
            <div style={{padding:'8px 14px 4px',fontSize:11,color:t.muted,fontWeight:600,letterSpacing:0.3}}>{label}</div>
            {grouped[label].map(conv=>(
              <button key={conv.id} onClick={()=>onSelectConv(conv)}
                style={{width:'100%',padding:'8px 14px',border:'none',background:selectedConvId===conv.id?t.hoverNav:'transparent',color:selectedConvId===conv.id?t.text:t.muted,fontSize:13,textAlign:'left',display:'block',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',borderRadius:6,margin:'1px 4px',width:'calc(100% - 8px)'}}
                onMouseEnter={e=>{if(selectedConvId!==conv.id)e.currentTarget.style.background=t.hoverNav}}
                onMouseLeave={e=>{if(selectedConvId!==conv.id)e.currentTarget.style.background='transparent'}}>
                {conv.title}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Bottom nav */}
      <div style={{padding:'6px 4px',borderTop:`1px solid ${t.border}`,flexShrink:0}}>
        {bottomNavItems.map(item=>(
          <button key={item.id} onClick={()=>setTab(item.id)}
            style={{width:'100%',padding:'8px 12px',borderRadius:7,border:'none',background:tab===item.id?t.hoverNav:'transparent',color:tab===item.id?t.text:t.muted,fontSize:13,fontWeight:tab===item.id?600:400,display:'flex',alignItems:'center',gap:9,marginBottom:1,textAlign:'left'}}>
            <span style={{fontSize:14,width:18,textAlign:'center'}}>{item.icon}</span>
            {item.label}
            {item.badge>0&&<span style={{marginLeft:'auto',fontSize:10,background:t.card2,color:t.muted,borderRadius:10,padding:'1px 6px',fontWeight:600}}>{item.badge}</span>}
          </button>
        ))}
        <div style={{height:1,background:t.border,margin:'4px 8px 6px'}}/>
        {!isPremium?(
          <button onClick={onUpgrade} style={{width:'100%',padding:'8px 12px',borderRadius:7,border:`1px solid ${t.border}`,background:'transparent',color:t.muted,fontSize:12,fontWeight:500,display:'flex',alignItems:'center',gap:9,textAlign:'left',marginBottom:4}}>
            <span>⭐</span>Upgrade to Pro<span style={{marginLeft:'auto',color:'#8B5CF6',fontWeight:600}}>₹99</span>
          </button>
        ):(
          <div style={{margin:'0 2px 4px',padding:'8px 12px',borderRadius:7,background:dark?'#1A1A1A':'#F5F5F5',border:`1px solid ${t.border}`,fontSize:12,color:'#D97706',fontWeight:600,display:'flex',alignItems:'center',gap:9}}>⭐ Premium Active</div>
        )}
        <button onClick={()=>setDark(!dark)} style={{width:'100%',padding:'7px 12px',borderRadius:7,border:'none',background:'transparent',color:t.muted,fontSize:12,display:'flex',alignItems:'center',gap:9,marginBottom:4}}>
          <span style={{fontSize:13}}>{dark?'☀️':'🌙'}</span>{dark?'Light Mode':'Dark Mode'}
        </button>
        <div style={{display:'flex',alignItems:'center',gap:9,padding:'6px 12px'}}>
          <div style={{width:28,height:28,borderRadius:'50%',background:'#8B5CF6',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,color:'#fff',flexShrink:0}}>{userName.slice(0,1).toUpperCase()}</div>
          <div style={{flex:1,overflow:'hidden'}}>
            <div style={{fontSize:12,fontWeight:600,color:t.text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{userName}</div>
            <button onClick={onLogout} style={{background:'none',border:'none',color:t.muted,fontSize:11,padding:0,cursor:'pointer'}}>Sign out</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Mobile Bottom Nav ──────────────────────────────────────────────────────
function BottomNav({tab,setTab,notes,dark,onNewChat}){
  const t=T(dark)
  const items=[
    {id:'new',icon:'✏️',label:'New'},
    {id:'chat',icon:'💬',label:'Chat'},
    {id:'notes',icon:'📝',label:'Notes',badge:notes.length},
    {id:'progress',icon:'📊',label:'Progress'},
    {id:'search',icon:'🔍',label:'Search'},
  ]
  return(
    <div style={{display:'flex',borderTop:`1px solid ${t.border}`,background:t.sidebar,flexShrink:0}}>
      {items.map(item=>(
        <button key={item.id} onClick={()=>item.id==='new'?onNewChat():setTab(item.id)} style={{flex:1,padding:'8px 2px 7px',border:'none',borderTop:`2px solid ${(tab===item.id&&item.id!=='new')?'#8B5CF6':'transparent'}`,background:'transparent',color:(tab===item.id&&item.id!=='new')?'#8B5CF6':t.muted,fontSize:9,fontWeight:(tab===item.id&&item.id!=='new')?700:400,display:'flex',flexDirection:'column',alignItems:'center',gap:2,position:'relative'}}>
          <span style={{fontSize:18}}>{item.icon}</span>{item.label}
          {item.badge>0&&<span style={{position:'absolute',top:4,right:'calc(50% - 18px)',fontSize:8,background:'#8B5CF6',color:'#fff',borderRadius:8,padding:'1px 4px',fontWeight:700}}>{item.badge}</span>}
        </button>
      ))}
    </div>
  )
}

// ── Main App ───────────────────────────────────────────────────────────────
export default function App(){
  const[user,setUser]=useState(null)
  const[loading,setLoading]=useState(true)
  const[profile,setProfile]=useState(null)
  const[showProfileSetup,setShowProfileSetup]=useState(false)
  const[tab,setTab]=useState('chat')
  const[notes,setNotes]=useState([])
  const[notePrefill,setNotePrefill]=useState(null)
  const[weakTopics,setWeakTopics]=useState([])
  const[dark,setDark]=useState(true)
  const[showPremium,setShowPremium]=useState(false)
  const[isPremium,setIsPremium]=useState(false)
  const[mobile,setMobile]=useState(window.innerWidth<768)
  const[aiMode,setAiMode]=useState('study')
  const[conversations,setConversations]=useState([])
  const[convLoading,setConvLoading]=useState(false)
  const[selectedConv,setSelectedConv]=useState(null) // null = fresh chat

  useEffect(()=>{const h=()=>setMobile(window.innerWidth<768);window.addEventListener('resize',h);return()=>window.removeEventListener('resize',h)},[])
  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>{
      if(session?.user){setUser(session.user);loadProfile(session.user.id)}
      else setLoading(false)
    })
    const{data:{subscription}}=supabase.auth.onAuthStateChange((_,session)=>{
      if(session?.user){setUser(session.user);loadProfile(session.user.id)}
      else{setUser(null);setLoading(false)}
    })
    return()=>subscription.unsubscribe()
  },[])

  async function loadProfile(id){
    const{data}=await supabase.from('profiles').select('*').eq('user_id',id).single()
    if(data){setProfile(data);setWeakTopics(data.weak_topics||[]);setIsPremium(data.premium===true)}
    else setShowProfileSetup(true)
    setLoading(false)
    loadConversations(id)
  }

  async function loadConversations(userId){
    setConvLoading(true)
    const{data}=await supabase.from('messages').select('*').eq('user_id',userId||user?.id).order('created_at',{ascending:false}).limit(300)
    if(data)setConversations(groupConversations(data))
    setConvLoading(false)
  }

  function handleNewMessage(){
    // Refresh conversations list when new message is saved
    if(user)setTimeout(()=>loadConversations(user.id),1000)
  }

  async function logout(){await supabase.auth.signOut();setUser(null);setProfile(null);setNotes([]);setTab('chat');setIsPremium(false);setConversations([]);setSelectedConv(null)}
  function saveFromAI(content){setNotePrefill(content);setTab('notes')}
  function onProfileDone(p){setProfile(p);setShowProfileSetup(false)}
  function handleNewChat(){setSelectedConv(null);setTab('chat')}

  const t=T(dark)

  if(loading)return(
    <div style={{minHeight:'100vh',background:'#0D0D0D',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <style>{CSS(dark)}</style>
      <div style={{fontSize:40,animation:'pulse 1.5s ease infinite'}}>🧠</div>
    </div>
  )
  if(!user)return <><style>{CSS(true)}</style><Landing onAuth={setUser}/></>
  if(showProfileSetup)return <ProfileSetup user={user} onDone={onProfileDone} dark={dark}/>

  const showingConv=selectedConv&&tab==='chat'

  return(
    <div style={{height:'100vh',display:'flex',flexDirection:'column',background:t.bg,color:t.text,overflow:'hidden'}}>
      <style>{CSS(dark)}</style>

      {/* Mobile top bar */}
      {mobile&&(
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 14px',borderBottom:`1px solid ${t.border}`,background:t.sidebar,flexShrink:0}}>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:800,letterSpacing:-0.3}}>🧠 <span style={{color:'#8B5CF6'}}>Memora</span></div>
          <div style={{display:'flex',gap:7,alignItems:'center'}}>
            <div style={{display:'flex',background:t.card,borderRadius:6,padding:2,border:`1px solid ${t.border}`}}>
              <button onClick={()=>setAiMode('study')} style={{padding:'3px 8px',borderRadius:4,border:'none',fontSize:10,background:aiMode==='study'?'#8B5CF6':'transparent',color:aiMode==='study'?'#fff':t.muted,fontWeight:500}}>Study</button>
              <button onClick={()=>setAiMode('general')} style={{padding:'3px 8px',borderRadius:4,border:'none',fontSize:10,background:aiMode==='general'?t.green:'transparent',color:aiMode==='general'?'#fff':t.muted,fontWeight:500}}>General</button>
            </div>
            {isPremium?<span style={{fontSize:11,color:t.orange,fontWeight:600}}>⭐</span>:<button onClick={()=>setShowPremium(true)} style={{fontSize:10,padding:'3px 9px',borderRadius:6,border:`1px solid ${t.border}`,background:'transparent',color:t.muted,fontWeight:500}}>⭐ Pro</button>}
            <button onClick={()=>setDark(!dark)} style={{background:'none',border:'none',fontSize:16,padding:0}}>{dark?'☀️':'🌙'}</button>
          </div>
        </div>
      )}

      <div style={{flex:1,display:'flex',overflow:'hidden'}}>
        {!mobile&&(
          <Sidebar
            tab={tab} setTab={(t)=>{setTab(t);if(t!=='chat')setSelectedConv(null)}}
            user={user} notes={notes} dark={dark} setDark={setDark}
            onLogout={logout} onUpgrade={()=>setShowPremium(true)} isPremium={isPremium}
            aiMode={aiMode} setAiMode={setAiMode}
            conversations={conversations} convLoading={convLoading}
            onSelectConv={(conv)=>{setSelectedConv(conv);setTab('chat')}}
            selectedConvId={selectedConv?.id}
            onNewChat={handleNewChat}
          />
        )}

        <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden',minWidth:0}}>
          {showingConv&&<ConversationView conversation={selectedConv} dark={dark} onBack={()=>setSelectedConv(null)}/>}
          {!showingConv&&tab==='chat'&&<ChatTab user={user} notes={notes} profile={profile} onSaveNote={saveFromAI} weakTopics={weakTopics} setWeakTopics={setWeakTopics} isPremium={isPremium} dark={dark} onUpgrade={()=>setShowPremium(true)} aiMode={aiMode} onNewMessage={handleNewMessage}/>}
          {tab==='notes'&&<NotesTab user={user} notes={notes} setNotes={setNotes} prefill={notePrefill} clearPrefill={()=>setNotePrefill(null)} dark={dark}/>}
          {tab==='progress'&&<ProgressTab user={user} profile={profile} weakTopics={weakTopics} setWeakTopics={setWeakTopics} notes={notes} dark={dark} onUpgrade={()=>setShowPremium(true)} isPremium={isPremium}/>}
          {tab==='search'&&<SearchTab notes={notes} dark={dark}/>}
        </div>
      </div>

      {mobile&&<BottomNav tab={tab} setTab={(t)=>{setTab(t);setSelectedConv(null)}} notes={notes} dark={dark} onNewChat={handleNewChat}/>}
      {showPremium&&<PremiumModal onClose={()=>setShowPremium(false)} dark={dark} user={user}/>}
    </div>
  )
}
