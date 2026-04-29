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

// ── Theme ──────────────────────────────────────────────────────────────────
const T=(dark)=>({
  bg:      dark?'#000000':'#FFFFFF',
  surface: dark?'#0F0F0F':'#F7F7F7',
  card:    dark?'#161616':'#FFFFFF',
  card2:   dark?'#1E1E1E':'#F0F0F0',
  border:  dark?'#2A2A2A':'#E0E0E0',
  text:    dark?'#F0F0F0':'#0A0A0A',
  muted:   dark?'#707070':'#606060',
  accent:  '#8B5CF6',
  green:   '#16A34A',
  red:     '#DC2626',
  orange:  '#D97706',
})

const CSS=(dark)=>`
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html,body,#root{height:100%;}
body{font-family:'Inter',sans-serif;background:${dark?'#000000':'#FFFFFF'};color:${dark?'#F0F0F0':'#0A0A0A'};-webkit-font-smoothing:antialiased;}
input,textarea,button,select{font-family:'Inter',sans-serif;}
input::placeholder,textarea::placeholder{color:${dark?'#444':'#AAA'};}
input:focus,textarea:focus,select:focus{outline:none;border-color:#8B5CF6!important;}
button{cursor:pointer;transition:opacity 0.15s;}
button:hover{opacity:0.85;}
button:active{transform:scale(0.97);}
::-webkit-scrollbar{width:4px;}
::-webkit-scrollbar-thumb{background:${dark?'#333':'#CCC'};border-radius:4px;}
@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}
.fu{animation:fadeUp 0.3s ease;}
.fu1{animation:fadeUp 0.3s 0.1s ease both;}
.fu2{animation:fadeUp 0.3s 0.2s ease both;}
.fu3{animation:fadeUp 0.3s 0.3s ease both;}
.fu4{animation:fadeUp 0.3s 0.4s ease both;}
.msg{animation:fadeUp 0.2s ease;}
`

// ── Markdown ───────────────────────────────────────────────────────────────
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
      else parts.push(<code key={k++} style={{background:t.card2,borderRadius:3,padding:'1px 5px',fontSize:'0.87em',fontFamily:'monospace',color:t.accent}}>{h.v}</code>)
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
      else{els.push(<div key={i} style={{background:dark?'#0A0A0A':'#F5F5F5',borderRadius:8,border:`1px solid ${t.border}`,overflow:'hidden',margin:'8px 0'}}>
        {lang&&<div style={{padding:'5px 14px',fontSize:11,color:t.muted,borderBottom:`1px solid ${t.border}`,fontWeight:500}}>{lang}</div>}
        <pre style={{padding:'12px 14px',fontSize:13,overflowX:'auto',fontFamily:'monospace',lineHeight:1.6,color:t.text}}><code>{codeLines.join('\n')}</code></pre>
      </div>);inCode=false;codeLines=[];lang=''}
      i++;continue
    }
    if(inCode){codeLines.push(l);i++;continue}
    if(l.startsWith('### '))els.push(<h3 key={i} style={{fontSize:14,fontWeight:600,margin:'8px 0 4px',color:t.text}}>{fmtLine(l.slice(4))}</h3>)
    else if(l.startsWith('## '))els.push(<h2 key={i} style={{fontSize:16,fontWeight:700,margin:'12px 0 6px',color:t.text}}>{fmtLine(l.slice(3))}</h2>)
    else if(l.startsWith('# '))els.push(<h1 key={i} style={{fontSize:18,fontWeight:700,margin:'14px 0 8px',color:t.text}}>{fmtLine(l.slice(2))}</h1>)
    else if(l.startsWith('---'))els.push(<hr key={i} style={{border:'none',borderTop:`1px solid ${t.border}`,margin:'10px 0'}}/>)
    else if(/^[-*•] /.test(l))els.push(<div key={i} style={{display:'flex',gap:8,marginBottom:4,paddingLeft:4}}><span style={{color:t.accent,marginTop:3,flexShrink:0,fontSize:12}}>●</span><span style={{fontSize:14,color:t.muted,lineHeight:1.65}}>{fmtLine(l.replace(/^[-*•] /,''))}</span></div>)
    else if(/^\d+\. /.test(l)){const[,n,tx]=l.match(/^(\d+)\. (.*)/);els.push(<div key={i} style={{display:'flex',gap:8,marginBottom:4,paddingLeft:4}}><span style={{color:t.accent,fontWeight:600,fontSize:13,flexShrink:0,minWidth:18}}>{n}.</span><span style={{fontSize:14,color:t.muted,lineHeight:1.65}}>{fmtLine(tx)}</span></div>)}
    else if(l.startsWith('> '))els.push(<div key={i} style={{borderLeft:`3px solid ${t.accent}`,paddingLeft:12,margin:'6px 0',color:t.muted,fontSize:14,fontStyle:'italic'}}>{fmtLine(l.slice(2))}</div>)
    else if(l.trim()==='')els.push(<div key={i} style={{height:7}}/>)
    else els.push(<p key={i} style={{fontSize:14,color:t.muted,lineHeight:1.7,margin:'2px 0'}}>{fmtLine(l)}</p>)
    i++
  }
  return <div style={{lineHeight:1.65}}>{els}</div>
}

// ── Auth / Landing ─────────────────────────────────────────────────────────
function Landing({onAuth}){
  const [view,setView]=useState('home')
  const [mode,setMode]=useState('login')
  const [name,setName]=useState('')
  const [email,setEmail]=useState('')
  const [pass,setPass]=useState('')
  const [err,setErr]=useState('')
  const [loading,setLoading]=useState(false)

  async function googleLogin(){
    setLoading(true)
    const{error}=await supabase.auth.signInWithOAuth({provider:'google',options:{redirectTo:window.location.origin}})
    if(error){setErr(error.message);setLoading(false)}
  }
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
        else setErr('Check your email to confirm.')
      }else{
        const{data,error}=await supabase.auth.signInWithPassword({email:email.trim(),password:pass.trim()})
        if(error)throw error
        onAuth(data.user)
      }
    }catch(e){setErr(e.message||'Something went wrong.')}
    setLoading(false)
  }

  if(view==='auth'){
    return(
      <div style={{minHeight:'100vh',display:'flex',background:'#000'}}>
        <style>{CSS(true)}</style>
        <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',padding:40}}>
          <div style={{width:'100%',maxWidth:380}} className="fu">
            <button onClick={()=>setView('home')} style={{background:'none',border:'none',color:'#666',fontSize:13,cursor:'pointer',marginBottom:28,display:'flex',alignItems:'center',gap:6,padding:0}}>← Back</button>
            <div style={{marginBottom:28}}>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:26,fontWeight:800,color:'#F0F0F0',marginBottom:4}}>{mode==='login'?'Welcome back':'Join Memora'}</div>
              <div style={{fontSize:13,color:'#666'}}>{mode==='login'?'Continue your learning journey':'Start studying smarter today — free'}</div>
            </div>
            <button onClick={googleLogin} disabled={loading} style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'center',gap:10,padding:13,borderRadius:10,border:'1px solid #2A2A2A',background:'#161616',color:'#F0F0F0',fontSize:14,fontWeight:500,marginBottom:18}}>
              <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 002.38-5.88c0-.57-.05-.66-.15-1.18z"/><path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.04a4.8 4.8 0 01-7.18-2.54H1.83v2.07A8 8 0 008.98 17z"/><path fill="#FBBC05" d="M4.5 10.48A4.8 4.8 0 014.5 9a5 5 0 01.32-1.76V5.17H2.18a8 8 0 000 7.66l2.32-2.35z"/><path fill="#EA4335" d="M8.98 4.72c1.3 0 2.11.56 2.6 1.03l1.93-1.93C12.07 2.79 10.6 2 8.98 2a8 8 0 00-6.8 3.83l2.32 2.07a4.77 4.77 0 014.48-3.18z"/></svg>
              Continue with Google
            </button>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:18}}><div style={{flex:1,height:1,background:'#2A2A2A'}}/><span style={{fontSize:11,color:'#444'}}>or</span><div style={{flex:1,height:1,background:'#2A2A2A'}}/></div>
            <div style={{display:'flex',background:'#161616',borderRadius:8,padding:3,marginBottom:18,border:'1px solid #2A2A2A'}}>
              {['login','signup'].map(m=>(<button key={m} onClick={()=>{setMode(m);setErr('')}} style={{flex:1,padding:'8px',borderRadius:6,border:'none',fontSize:13,fontWeight:500,background:mode===m?'#8B5CF6':'transparent',color:mode===m?'#fff':'#666'}}>{m==='login'?'Login':'Sign Up'}</button>))}
            </div>
            {mode==='signup'&&(<div style={{marginBottom:12}}><label style={{fontSize:12,color:'#666',display:'block',marginBottom:4}}>Name</label><input style={{width:'100%',padding:'11px 12px',borderRadius:8,border:'1px solid #2A2A2A',background:'#161616',color:'#F0F0F0',fontSize:14}} placeholder="Your name" value={name} onChange={e=>setName(e.target.value)}/></div>)}
            <div style={{marginBottom:12}}><label style={{fontSize:12,color:'#666',display:'block',marginBottom:4}}>Email</label><input style={{width:'100%',padding:'11px 12px',borderRadius:8,border:'1px solid #2A2A2A',background:'#161616',color:'#F0F0F0',fontSize:14}} type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)}/></div>
            <div style={{marginBottom:20}}><label style={{fontSize:12,color:'#666',display:'block',marginBottom:4}}>Password</label><input style={{width:'100%',padding:'11px 12px',borderRadius:8,border:'1px solid #2A2A2A',background:'#161616',color:'#F0F0F0',fontSize:14}} type="password" placeholder="min 6 characters" value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==='Enter'&&submit()}/></div>
            {err&&<div style={{fontSize:13,color:'#EF4444',background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:8,padding:'9px 12px',marginBottom:14,textAlign:'center'}}>{err}</div>}
            <button onClick={submit} disabled={loading} style={{width:'100%',padding:12,borderRadius:8,border:'none',background:loading?'#2A2A2A':'#8B5CF6',color:'#fff',fontSize:14,fontWeight:600}}>{loading?'Please wait...':(mode==='login'?'Login':'Create Free Account')}</button>
            <div style={{textAlign:'center',marginTop:16,fontSize:13,color:'#666'}}>
              {mode==='login'?<>New here? <button onClick={()=>{setMode('signup');setErr('')}} style={{background:'none',border:'none',color:'#8B5CF6',fontSize:13,fontWeight:600,cursor:'pointer'}}>Sign up free</button></>:<>Have account? <button onClick={()=>{setMode('login');setErr('')}} style={{background:'none',border:'none',color:'#8B5CF6',fontSize:13,fontWeight:600,cursor:'pointer'}}>Login</button></>}
            </div>
          </div>
        </div>
        <div style={{flex:1,background:'#0A0A0A',borderLeft:'1px solid #1A1A1A',display:'flex',alignItems:'center',justifyContent:'center',padding:40}}>
          <div style={{maxWidth:340}} className="fu1">
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:800,color:'#F0F0F0',marginBottom:6}}>🧠 Memora</div>
            <div style={{fontSize:13,color:'#666',marginBottom:24,lineHeight:1.7}}>AI study assistant for every Indian student. Class 5 to competitive exams to college.</div>
            {[['🎯','40+ boards, exams & college courses'],['🧩','Interactive quiz with weak topic tracking'],['📋','Upload syllabus PDF for exact answers'],['💬','Study AI + General AI in one place'],['⭐','Premium: Unlimited messages at ₹99/mo']].map(([ic,tx],i)=>(
              <div key={i} style={{display:'flex',gap:12,padding:'9px 12px',border:'1px solid #1A1A1A',borderRadius:8,marginBottom:8,alignItems:'flex-start'}}>
                <span style={{fontSize:16,flexShrink:0}}>{ic}</span><span style={{fontSize:13,color:'#888',lineHeight:1.55}}>{tx}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Home
  return(
    <div style={{minHeight:'100vh',background:'#000',color:'#F0F0F0',overflowY:'auto'}}>
      <style>{CSS(true)}</style>
      <nav style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'18px 40px',borderBottom:'1px solid #141414'}}>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:800,letterSpacing:-0.3}}>🧠 <span style={{color:'#8B5CF6'}}>Memora</span></div>
        <div style={{display:'flex',gap:10}}>
          <button onClick={()=>{setView('auth');setMode('login')}} style={{padding:'8px 20px',borderRadius:8,border:'1px solid #2A2A2A',background:'transparent',color:'#CCC',fontSize:13,fontWeight:500}}>Login</button>
          <button onClick={()=>{setView('auth');setMode('signup')}} style={{padding:'8px 20px',borderRadius:8,border:'none',background:'#8B5CF6',color:'#fff',fontSize:13,fontWeight:600}}>Get Started Free</button>
        </div>
      </nav>
      <div style={{maxWidth:760,margin:'0 auto',textAlign:'center',padding:'80px 24px 60px'}}>
        <div className="fu" style={{display:'inline-block',background:'rgba(139,92,246,0.1)',border:'1px solid rgba(139,92,246,0.2)',borderRadius:20,padding:'5px 16px',fontSize:12,color:'#A78BFA',fontWeight:500,marginBottom:24,letterSpacing:0.3}}>✦ AI Study Companion for Indian Students</div>
        <h1 className="fu1" style={{fontFamily:"'Syne',sans-serif",fontSize:'clamp(38px,6vw,68px)',fontWeight:800,lineHeight:1.06,letterSpacing:-2,marginBottom:22}}>Study Smarter.<br/><span style={{color:'#8B5CF6'}}>Score Higher.</span></h1>
        <p className="fu2" style={{fontSize:17,color:'#888',lineHeight:1.7,marginBottom:38,maxWidth:520,margin:'0 auto 38px'}}>The most personalized AI study assistant — from Class 5 to competitive exams to college. Built for India.</p>
        <div className="fu3" style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap',marginBottom:16}}>
          <button onClick={googleLogin} style={{display:'flex',alignItems:'center',gap:10,padding:'13px 24px',borderRadius:10,border:'1px solid #2A2A2A',background:'#161616',color:'#F0F0F0',fontSize:14,fontWeight:500}}>
            <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 002.38-5.88c0-.57-.05-.66-.15-1.18z"/><path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.04a4.8 4.8 0 01-7.18-2.54H1.83v2.07A8 8 0 008.98 17z"/><path fill="#FBBC05" d="M4.5 10.48A4.8 4.8 0 014.5 9a5 5 0 01.32-1.76V5.17H2.18a8 8 0 000 7.66l2.32-2.35z"/><path fill="#EA4335" d="M8.98 4.72c1.3 0 2.11.56 2.6 1.03l1.93-1.93C12.07 2.79 10.6 2 8.98 2a8 8 0 00-6.8 3.83l2.32 2.07a4.77 4.77 0 014.48-3.18z"/></svg>
            Continue with Google
          </button>
          <button onClick={()=>{setView('auth');setMode('signup')}} style={{padding:'13px 28px',borderRadius:10,border:'none',background:'#8B5CF6',color:'#fff',fontSize:14,fontWeight:600}}>Start Free — No Card Needed</button>
        </div>
        <div className="fu4" style={{fontSize:12,color:'#444'}}>20 free AI messages per day • No credit card required</div>
      </div>
      <div style={{display:'flex',justifyContent:'center',gap:56,flexWrap:'wrap',padding:'0 24px 64px'}}>
        {[['40+','Boards & Courses'],['₹99','Premium/Month'],['Free','To Get Started'],['24/7','Available']].map(([v,l],i)=>(<div key={i} style={{textAlign:'center'}}><div style={{fontFamily:"'Syne',sans-serif",fontSize:30,fontWeight:800,color:'#8B5CF6'}}>{v}</div><div style={{fontSize:12,color:'#555',marginTop:4}}>{l}</div></div>))}
      </div>
      <div style={{maxWidth:920,margin:'0 auto',padding:'0 24px 80px'}}>
        <h2 style={{fontFamily:"'Syne',sans-serif",fontSize:26,fontWeight:800,textAlign:'center',marginBottom:40,letterSpacing:-0.3}}>Everything you need to ace your exams</h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:16}}>
          {[{ic:'🎯',t:'Study AI',d:'Syllabus-aware AI personalized for your exact board, exam or college course. Covers Class 5 to PhD.'},{ic:'💬',t:'General AI',d:'Not just study — chat about anything, get advice, explore ideas. Two AIs in one.'},{ic:'🧩',t:'Interactive Quiz',d:'One question at a time. Click your answer, see result instantly, track score and weak topics.'},{ic:'📝',t:'Smart Modes',d:'Chat, Summarize, Explain, Quiz, Flashcards, Predict. Switch modes anytime for what you need.'},{ic:'📋',t:'Syllabus Upload',d:'Upload your college PDF. AI reads your exact units and only answers from your syllabus.'},{ic:'⭐',t:'Premium Plan',d:'₹99/month for unlimited messages, all features. Pay with UPI, card, net banking.'}].map((f,i)=>(
            <div key={i} style={{background:'#0A0A0A',border:'1px solid #1A1A1A',borderRadius:12,padding:'20px 20px'}}>
              <div style={{fontSize:26,marginBottom:12}}>{f.ic}</div>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:700,marginBottom:6,color:'#F0F0F0'}}>{f.t}</div>
              <div style={{fontSize:13,color:'#666',lineHeight:1.6}}>{f.d}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Profile Setup ──────────────────────────────────────────────────────────
function ProfileSetup({user,onDone,dark}){
  const t=T(dark)
  const [board,setBoard]=useState('')
  const [subject,setSubject]=useState('')
  const [saving,setSaving]=useState(false)
  const subjects=board?BOARDS[board]:[]
  async function save(){
    if(!board)return
    setSaving(true)
    await supabase.from('profiles').upsert({user_id:user.id,board,subject:subject||null,weak_topics:[],premium:false})
    onDone({board,subject,premium:false,weak_topics:[]})
    setSaving(false)
  }
  const sel={width:'100%',padding:'11px 12px',borderRadius:8,border:`1px solid ${t.border}`,background:t.card2,color:board?t.text:t.muted,fontSize:14}
  return(
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:20,background:t.bg}}>
      <style>{CSS(dark)}</style>
      <div style={{width:'100%',maxWidth:420}} className="fu">
        <div style={{textAlign:'center',marginBottom:30}}>
          <div style={{fontSize:44,marginBottom:10}}>🎯</div>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:800,color:t.text}}>Set up your profile</div>
          <div style={{fontSize:13,color:t.muted,marginTop:6}}>Memora personalizes AI for your exact course</div>
        </div>
        <div style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:14,padding:24}}>
          <div style={{marginBottom:16}}>
            <label style={{fontSize:11,color:t.muted,display:'block',marginBottom:5,fontWeight:500,textTransform:'uppercase',letterSpacing:0.5}}>Board / Exam / Course *</label>
            <select value={board} onChange={e=>{setBoard(e.target.value);setSubject('')}} style={sel}>
              <option value="">Select your course...</option>
              {Object.entries(BOARD_GROUPS).map(([g,opts])=>(<optgroup key={g} label={g}>{opts.map(b=><option key={b} value={b}>{b}</option>)}</optgroup>))}
            </select>
          </div>
          {subjects.length>0&&(<div style={{marginBottom:20}}>
            <label style={{fontSize:11,color:t.muted,display:'block',marginBottom:5,fontWeight:500,textTransform:'uppercase',letterSpacing:0.5}}>Subject (optional)</label>
            <select value={subject} onChange={e=>setSubject(e.target.value)} style={{...sel,color:subject?t.text:t.muted}}>
              <option value="">All subjects</option>
              {subjects.map(s=><option key={s} value={s}>{s}</option>)}
            </select>
          </div>)}
          <button onClick={save} disabled={!board||saving} style={{width:'100%',padding:12,borderRadius:8,border:'none',background:!board||saving?t.border:'#8B5CF6',color:'#fff',fontSize:14,fontWeight:600,opacity:!board?0.5:1}}>{saving?'Saving...':'Start Learning →'}</button>
        </div>
        <div style={{textAlign:'center',marginTop:14}}><button onClick={()=>onDone(null)} style={{background:'none',border:'none',color:t.muted,fontSize:13,cursor:'pointer'}}>Skip for now</button></div>
      </div>
    </div>
  )
}

// ── Premium Modal ──────────────────────────────────────────────────────────
function PremiumModal({onClose,dark,user}){
  const t=T(dark)
  const [loading,setLoading]=useState(false)
  const [done,setDone]=useState(false)
  async function pay(){
    setLoading(true)
    try{
      await new Promise((res,rej)=>{if(window.Razorpay){res();return}const s=document.createElement('script');s.src='https://checkout.razorpay.com/v1/checkout.js';s.onload=res;s.onerror=rej;document.body.appendChild(s)})
      const r=await fetch('/api/payment',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'create_order'})})
      const od=await r.json()
      if(od.error){alert('Payment error: '+od.error);setLoading(false);return}
      new window.Razorpay({key:od.keyId,amount:od.amount,currency:od.currency,order_id:od.orderId,name:'Memora Premium',description:'Unlimited AI messages per month',prefill:{email:user?.email||'',name:user?.user_metadata?.name||''},theme:{color:'#8B5CF6'},handler:async(response)=>{const vr=await fetch('/api/payment',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'verify_payment',...response})});const vd=await vr.json();if(vd.verified){await supabase.from('profiles').update({premium:true,premium_since:new Date().toISOString()}).eq('user_id',user.id);setDone(true)}else alert('Verification failed.')},modal:{ondismiss:()=>setLoading(false)}}).open()
    }catch(e){alert('Payment error: '+e.message)}
    setLoading(false)
  }
  if(done)return(
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:20}}>
      <div style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:16,padding:36,width:'100%',maxWidth:360,textAlign:'center'}} className="fu">
        <div style={{fontSize:48,marginBottom:12}}>🎉</div>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:800,color:t.text,marginBottom:8}}>You're Premium!</div>
        <div style={{fontSize:14,color:t.muted,marginBottom:24}}>Unlimited messages and all features unlocked.</div>
        <button onClick={()=>{onClose();window.location.reload()}} style={{width:'100%',padding:12,borderRadius:8,border:'none',background:'#8B5CF6',color:'#fff',fontSize:14,fontWeight:600}}>Start Studying →</button>
      </div>
    </div>
  )
  return(
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:20,overflowY:'auto'}}>
      <div style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:16,padding:28,width:'100%',maxWidth:400}} className="fu">
        <div style={{textAlign:'center',marginBottom:22}}>
          <div style={{fontSize:40,marginBottom:8}}>⭐</div>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:800,color:t.text}}>Memora Premium</div>
          <div style={{fontSize:13,color:t.muted,marginTop:3}}>Study without limits</div>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:7,marginBottom:20}}>
          {[['∞','Unlimited AI messages every day'],['🧩','Unlimited quiz questions'],['📁','Upload images, PDFs & URLs'],['📋','Syllabus PDF upload'],['⚡','Priority AI response speed']].map(([ic,lb],i)=>(<div key={i} style={{display:'flex',alignItems:'center',gap:12,padding:'8px 12px',background:t.card2,borderRadius:8}}><span style={{fontSize:16,width:24,textAlign:'center'}}>{ic}</span><span style={{fontSize:13,color:t.text}}>{lb}</span></div>))}
        </div>
        <div style={{background:'#8B5CF6',borderRadius:10,padding:'14px 20px',textAlign:'center',marginBottom:14}}>
          <div style={{fontSize:28,fontWeight:800,color:'#fff',fontFamily:"'Syne',sans-serif"}}>₹99 <span style={{fontSize:14,fontWeight:400,opacity:0.8}}>/ month</span></div>
          <div style={{fontSize:12,color:'rgba(255,255,255,0.65)',marginTop:2}}>Cancel anytime • Instant access</div>
        </div>
        <div style={{display:'flex',gap:6,justifyContent:'center',flexWrap:'wrap',marginBottom:14}}>
          {['UPI','Credit Card','Debit Card','Net Banking','Wallets'].map(m=>(<span key={m} style={{fontSize:10,padding:'3px 9px',borderRadius:6,background:t.card2,border:`1px solid ${t.border}`,color:t.muted,fontWeight:500}}>{m}</span>))}
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
  const [sel,setSel]=useState(null)
  const [revealed,setRevealed]=useState(false)
  function submit(){if(!sel)return;setRevealed(true);onAnswer(sel===quiz.correct)}
  function next(){setSel(null);setRevealed(false);onNext()}
  return(
    <div style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:12,padding:'18px 16px',maxWidth:'86%',marginTop:8}} className="msg">
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
        <button onClick={submit} disabled={!sel} style={{width:'100%',padding:'11px',borderRadius:8,border:'none',background:sel?'#8B5CF6':t.border,color:'#fff',fontSize:14,fontWeight:600,opacity:sel?1:0.45}}>Submit Answer</button>
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
function ChatTab({user,notes,profile,onSaveNote,weakTopics,setWeakTopics,isPremium,dark,onUpgrade,aiMode}){
  const t=T(dark)
  // FRESH chat every session — no loading from DB
  const [messages,setMessages]=useState([])
  const [input,setInput]=useState('')
  const [mode,setMode]=useState('chat')
  const [typing,setTyping]=useState(false)
  const [usage,setUsage]=useState(0)
  const [attachment,setAttachment]=useState(null)
  const [urlInput,setUrlInput]=useState('')
  const [showAttach,setShowAttach]=useState(false)
  const [syllabus,setSyllabus]=useState(null)
  const [syllabusName,setSyllabusName]=useState(null)
  const [parsingSyllabus,setParsingSyllabus]=useState(false)
  const [quizTopic,setQuizTopic]=useState(null)
  const [quizScore,setQuizScore]=useState(0)
  const [quizTotal,setQuizTotal]=useState(0)
  const [currentQuiz,setCurrentQuiz]=useState(null)
  const [quizMsgId,setQuizMsgId]=useState(null)
  const [loadingNext,setLoadingNext]=useState(false)
  const bottomRef=useRef(null)
  const fileRef=useRef(null)
  const syllabusRef=useRef(null)

  // Load only usage count — NOT messages
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
          const arr=new Uint8Array(ev.target.result)
          let text=''
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
    if(aiMode==='general')return 'You are Memora, a helpful and friendly AI assistant. Help with anything — questions, conversations, creative tasks, advice. Be warm and clear. Use markdown formatting where helpful.'
    let sys='You are Memora, a precise AI study assistant for Indian students.'
    if(profile?.board)sys+=' Student course: '+profile.board+'.'
    if(profile?.subject)sys+=' Subject: '+profile.subject+'.'
    if(syllabus){sys+='\n\nCRITICAL: Student uploaded their exact syllabus. Follow ONLY these units:\n'+syllabus+'\nDo not go outside this syllabus.'}
    else sys+=' Follow the standard curriculum. Always cover ALL units completely, never stop after Unit 1.'
    sys+=' Formatting: ## for unit headings, **bold** for key terms, numbered lists for steps. Be exam-focused and precise.'
    if(mode==='summarize')sys+=' Task: Write a structured unit-wise summary covering ALL units.'
    if(mode==='explain')sys+=' Task: Explain in simple language with real examples. Use numbered steps.'
    if(mode==='flashcard')sys+=' Task: Generate 5 flashcard-style Q&A pairs:\nQ: [question]\nA: [concise answer]\n\n(repeat for each)'
    if(mode==='quiz')sys+=' Task: Generate EXACTLY 1 MCQ on the topic. Each part MUST be on its own line:\nQUESTION: [text]\nA) [option]\nB) [option]\nC) [option]\nD) [option]\nANSWER: [A or B or C or D only]'
    if(mode==='predict')sys+=' Task: List 5-8 most likely exam questions based on standard exam patterns. Include brief hints for each.'
    if(notes.length>0)sys+='\n\nStudent notes:\n'+notes.map(n=>'['+n.tag+'] '+n.title+': '+n.body).join('\n')
    if(weakTopics.length>0)sys+='\n\nWeak topics: '+weakTopics.join(', ')
    return sys
  }

  async function send(){
    const query=input.trim()
    if(!query||typing)return
    if(usage>=(isPremium?9999:FREE_LIMIT)){onUpgrade();return}
    setInput('')
    const attNote=attachment?.type==='url'?' [URL: '+attachment.data+']':''
    const userMsg={id:genId(),role:'user',content:query+attNote}
    setMessages(p=>[...p,userMsg]);setTyping(true)
    // Save to history in DB
    supabase.from('messages').insert({user_id:user.id,role:'user',content:userMsg.content}).then(()=>{})
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
      supabase.from('messages').insert({user_id:user.id,role:'ai',content:reply}).then(()=>{})
      if(mode==='quiz'){
        const parsed=parseQuiz(reply)
        if(parsed){setCurrentQuiz(parsed);setQuizMsgId(aiId);if(!quizTopic){setQuizTopic(query);setQuizScore(0);setQuizTotal(0)}}
      }
    }catch(e){
      const msg=e.message==='RATE_LIMIT'?'⏳ AI is on a short break from high usage. Wait 1-2 minutes and try again.':'Something went wrong. Please try again.'
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
    if(usage>=(isPremium?9999:FREE_LIMIT)){onUpgrade();setLoadingNext(false);return}
    try{
      await trackUsage()
      const reply=await callAI([{role:'user',content:'Next quiz question on: '+quizTopic}],buildSystem(),null,null)
      const aiId=genId()
      setMessages(p=>[...p,{id:aiId,role:'ai',content:reply}])
      const parsed=parseQuiz(reply)
      if(parsed){setCurrentQuiz(parsed);setQuizMsgId(aiId)}
    }catch(e){setMessages(p=>[...p,{id:genId(),role:'ai',content:e.message==='RATE_LIMIT'?'⏳ Wait 1-2 minutes.':'Error. Try again.'}])}
    setLoadingNext(false)
  }

  function endQuiz(){
    const sc=quizScore,tot=quizTotal
    setCurrentQuiz(null);setQuizTopic(null);setQuizScore(0);setQuizTotal(0);setMode('chat')
    if(tot>0){
      const pct=Math.round(sc/tot*100)
      setMessages(p=>[...p,{id:genId(),role:'ai',content:`## Quiz Results\n\nScore: **${sc} / ${tot}** (${pct}%)\n\n${pct>=80?'🎉 Excellent! Keep it up.':pct>=60?'👍 Good effort. Review the topics you missed.':'📚 Keep practicing. Focus on weak topics.'}`}])
    }
  }

  const studyModes=[
    {id:'chat',label:'Chat',color:t.accent},
    {id:'summarize',label:'Summarize',color:t.green},
    {id:'explain',label:'Explain',color:t.orange},
    {id:'quiz',label:'Quiz',color:t.red},
    {id:'flashcard',label:'Flashcards',color:'#3B82F6'},
    {id:'predict',label:'Predict',color:'#EC4899'},
  ]

  const limitHit=!isPremium&&usage>=FREE_LIMIT
  const userName=user.user_metadata?.name||user.email.split('@')[0]

  return(
    <div style={{display:'flex',flexDirection:'column',height:'100%',overflow:'hidden'}}>
      {/* Status bar */}
      <div style={{padding:'4px 16px',background:t.surface,borderBottom:`1px solid ${t.border}`,display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0,minHeight:30,flexWrap:'wrap',gap:4}}>
        <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
          {aiMode==='study'&&<span style={{fontSize:11,color:t.accent,fontWeight:500}}>{profile?.board?'● '+profile.board+(profile.subject?' · '+profile.subject:''):'● No board set'}</span>}
          {aiMode==='general'&&<span style={{fontSize:11,color:t.green,fontWeight:500}}>● General AI</span>}
          {parsingSyllabus&&<span style={{fontSize:11,color:t.orange,animation:'pulse 1.5s infinite'}}>Parsing syllabus...</span>}
          {syllabus&&!parsingSyllabus&&(<div style={{display:'flex',alignItems:'center',gap:4,color:t.green,fontSize:11,fontWeight:500}}>● {syllabusName} <button onClick={()=>{setSyllabus(null);setSyllabusName(null)}} style={{background:'none',border:'none',color:t.muted,fontSize:11,padding:0,cursor:'pointer',marginLeft:2}}>✕</button></div>)}
        </div>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          {isPremium?<span style={{fontSize:11,color:t.orange,fontWeight:600}}>⭐ Premium</span>:(
            <><div style={{width:60,height:3,background:t.border,borderRadius:2,overflow:'hidden'}}><div style={{width:Math.min((usage/FREE_LIMIT)*100,100)+'%',height:'100%',background:limitHit?t.red:t.accent,borderRadius:2}}/></div><span style={{fontSize:11,color:limitHit?t.red:t.muted}}>{FREE_LIMIT-usage} left</span><button onClick={onUpgrade} style={{fontSize:10,background:'none',border:`1px solid ${t.border}`,borderRadius:6,color:t.muted,padding:'1px 7px',fontWeight:500}}>⭐ Pro</button></>
          )}
        </div>
      </div>

      {/* Messages */}
      <div style={{flex:1,overflowY:'auto',padding:'24px 20px'}}>
        {messages.length===0&&(
          <div style={{textAlign:'center',padding:'52px 20px',color:t.muted}} className="fu">
            <div style={{fontSize:40,marginBottom:12}}>{aiMode==='general'?'💬':'🧠'}</div>
            <div style={{fontSize:19,fontWeight:700,color:t.text,marginBottom:8,fontFamily:"'Syne',sans-serif"}}>Hi {userName}!</div>
            <div style={{fontSize:14,lineHeight:1.7,marginBottom:28,maxWidth:440,margin:'0 auto 28px',color:t.muted}}>
              {aiMode==='general'?'Ask me anything. I can help with any topic, question, or just have a conversation.':'Ask anything from your syllabus. I\'ll explain, summarize, quiz you, generate flashcards, or predict exam questions.'}
            </div>
            <div style={{display:'flex',gap:8,justifyContent:'center',flexWrap:'wrap'}}>
              {(aiMode==='general'?["Explain quantum entanglement simply","Help me write a professional email","What is blockchain?"]:["Explain Newton's 3 laws","Quiz me on Photosynthesis","Predict exam questions for Trigonometry","Give me flashcards for Respiration"]).map(s=>(<button key={s} onClick={()=>setInput(s)} style={{padding:'7px 14px',borderRadius:20,border:`1px solid ${t.border}`,background:'transparent',color:t.muted,fontSize:12}}>{s}</button>))}
            </div>
          </div>
        )}

        {messages.map(m=>(
          <div key={m.id} style={{display:'flex',gap:10,marginBottom:20,flexDirection:m.role==='user'?'row-reverse':'row',alignItems:'flex-start'}} className="msg">
            {m.role==='ai'&&(
              <div style={{width:30,height:30,borderRadius:'50%',background:aiMode==='general'?t.green:'#8B5CF6',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,flexShrink:0,marginTop:2}}>{aiMode==='general'?'💬':'🧠'}</div>
            )}
            {m.role==='user'&&(
              <div style={{width:30,height:30,borderRadius:'50%',background:dark?'#2A2A2A':'#E8E8E8',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,flexShrink:0,color:t.text,marginTop:2}}>{userName.slice(0,1).toUpperCase()}</div>
            )}
            <div style={{maxWidth:'80%',display:'flex',flexDirection:'column',alignItems:m.role==='user'?'flex-end':'flex-start'}}>
              {!(m.role==='ai'&&m.id===quizMsgId&&currentQuiz)&&(
                <div style={{padding:'11px 15px',borderRadius:m.role==='user'?'16px 16px 4px 16px':'16px 16px 16px 4px',background:m.role==='user'?dark?'#1E1E1E':'#F0F0F0':t.card,border:m.role==='ai'?`1px solid ${t.border}`:'none',color:m.role==='user'?t.text:t.text,fontSize:14,lineHeight:1.7}}>
                  {m.role==='ai'?<MD content={m.content} dark={dark}/>:m.content}
                </div>
              )}
              {m.role==='ai'&&m.id===quizMsgId&&currentQuiz&&<QuizCard quiz={currentQuiz} onAnswer={onQuizAnswer} onNext={onNextQuestion} onEnd={endQuiz} score={quizScore} total={quizTotal} dark={dark}/>}
              {m.role==='ai'&&<button onClick={()=>onSaveNote(m.content)} style={{fontSize:11,color:t.accent,background:'none',border:'none',padding:'4px 0 0',cursor:'pointer',textAlign:'left'}}>＋ Save as note</button>}
            </div>
          </div>
        ))}

        {(typing||loadingNext)&&(
          <div style={{display:'flex',gap:10,marginBottom:20,alignItems:'flex-start'}}>
            <div style={{width:30,height:30,borderRadius:'50%',background:aiMode==='general'?t.green:'#8B5CF6',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,flexShrink:0}}>{aiMode==='general'?'💬':'🧠'}</div>
            <div style={{padding:'11px 15px',background:t.card,border:`1px solid ${t.border}`,borderRadius:'16px 16px 16px 4px',display:'flex',gap:5,alignItems:'center'}}>
              {[0,1,2].map(i=><span key={i} style={{width:6,height:6,borderRadius:'50%',background:t.muted,display:'inline-block',animation:'bounce 1.1s ease infinite',animationDelay:i*0.18+'s'}}/>)}
            </div>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      {/* Attachment preview */}
      {attachment&&(<div style={{padding:'5px 16px',borderTop:`1px solid ${t.border}`,background:t.surface,display:'flex',alignItems:'center',gap:8,flexShrink:0}}><span style={{fontSize:12,color:t.accent}}>📎 {attachment.type==='image'?'Image':'URL'}: {attachment.preview.slice(0,50)}</span><button onClick={()=>setAttachment(null)} style={{background:'none',border:'none',color:t.red,fontSize:14,padding:0}}>✕</button></div>)}

      {/* Attach panel */}
      {showAttach&&(<div style={{padding:'10px 16px',borderTop:`1px solid ${t.border}`,background:t.surface,flexShrink:0}}>
        <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
          <input value={urlInput} onChange={e=>setUrlInput(e.target.value)} placeholder="Paste URL..." style={{flex:1,minWidth:140,padding:'8px 12px',borderRadius:8,border:`1px solid ${t.border}`,background:t.card,color:t.text,fontSize:13}} onKeyDown={e=>e.key==='Enter'&&addUrl()}/>
          <button onClick={addUrl} style={{padding:'8px 12px',borderRadius:8,border:'none',background:t.accent,color:'#fff',fontSize:12,fontWeight:600}}>Add URL</button>
          <button onClick={()=>fileRef.current.click()} style={{padding:'8px 12px',borderRadius:8,border:`1px solid ${t.border}`,background:'transparent',color:t.muted,fontSize:12}}>📷 Image</button>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{display:'none'}}/>
          <button onClick={()=>syllabusRef.current.click()} style={{padding:'8px 12px',borderRadius:8,border:`1px solid ${t.green}50`,background:`${t.green}10`,color:t.green,fontSize:12,fontWeight:500}}>📋 Syllabus PDF</button>
          <input ref={syllabusRef} type="file" accept=".pdf" onChange={handleSyllabusPDF} style={{display:'none'}}/>
          <button onClick={()=>setShowAttach(false)} style={{background:'none',border:'none',color:t.muted,fontSize:20,padding:0,lineHeight:1}}>✕</button>
        </div>
      </div>)}

      {/* Input */}
      <div style={{padding:'12px 16px 16px',borderTop:`1px solid ${t.border}`,background:t.bg,flexShrink:0}}>
        {limitHit&&(<div style={{fontSize:13,color:t.red,background:'rgba(220,38,38,0.08)',border:'1px solid rgba(220,38,38,0.2)',borderRadius:8,padding:'8px 14px',marginBottom:10,textAlign:'center',cursor:'pointer'}} onClick={onUpgrade}>Daily limit reached. <span style={{textDecoration:'underline',fontWeight:700}}>Upgrade to Premium ⭐</span></div>)}
        {aiMode==='study'&&(
          <div style={{display:'flex',gap:6,marginBottom:10,flexWrap:'wrap'}}>
            {studyModes.map(m=>(<button key={m.id} onClick={()=>setMode(m.id)} style={{padding:'4px 12px',borderRadius:6,border:`1px solid ${mode===m.id?m.color:t.border}`,background:mode===m.id?m.color+'15':'transparent',color:mode===m.id?m.color:t.muted,fontSize:12,fontWeight:mode===m.id?600:400}}>{m.label}</button>))}
          </div>
        )}
        <div style={{display:'flex',gap:8,alignItems:'flex-end'}}>
          <button onClick={()=>setShowAttach(!showAttach)} style={{padding:'10px',borderRadius:8,border:`1px solid ${t.border}`,background:'transparent',color:showAttach?t.accent:t.muted,fontSize:18,flexShrink:0,lineHeight:1}}>📎</button>
          <textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send()}}} placeholder={mode==='quiz'?'Enter topic to quiz (e.g. Photosynthesis)...':aiMode==='general'?'Ask me anything...':'Ask anything from your syllabus...'} disabled={limitHit} rows={1} style={{flex:1,padding:'10px 14px',borderRadius:8,border:`1px solid ${t.border}`,background:t.card,color:t.text,fontSize:14,resize:'none',maxHeight:100,lineHeight:1.5}} onInput={e=>{e.target.style.height='auto';e.target.style.height=Math.min(e.target.scrollHeight,100)+'px'}}/>
          <button onClick={send} disabled={typing||!input.trim()||limitHit} style={{padding:'10px 18px',borderRadius:8,border:'none',background:typing||!input.trim()||limitHit?t.border:'#8B5CF6',color:'#fff',fontSize:13,fontWeight:600,flexShrink:0,opacity:typing||!input.trim()||limitHit?0.45:1}}>Send</button>
        </div>
        <div style={{fontSize:11,color:t.muted,marginTop:5,textAlign:'center'}}>Enter to send · Shift+Enter for new line</div>
      </div>
    </div>
  )
}

// ── History Tab ────────────────────────────────────────────────────────────
function HistoryTab({user,dark}){
  const t=T(dark)
  const [messages,setMessages]=useState([])
  const [loading,setLoading]=useState(true)
  const [search,setSearch]=useState('')

  useEffect(()=>{
    supabase.from('messages').select('*').eq('user_id',user.id).order('created_at',{ascending:false}).limit(200).then(({data})=>{
      if(data)setMessages(data)
      setLoading(false)
    })
  },[])

  const filtered=search.trim()?messages.filter(m=>m.content.toLowerCase().includes(search.toLowerCase())):messages

  // Group by date
  const groups={}
  filtered.forEach(m=>{
    const d=m.created_at?m.created_at.split('T')[0]:'unknown'
    if(!groups[d])groups[d]=[]
    groups[d].push(m)
  })

  return(
    <div style={{display:'flex',flexDirection:'column',height:'100%',overflow:'hidden'}}>
      <div style={{padding:'12px 16px',borderBottom:`1px solid ${t.border}`,flexShrink:0}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search chat history..." style={{width:'100%',padding:'10px 14px',borderRadius:8,border:`1px solid ${t.border}`,background:t.card,color:t.text,fontSize:14}}/>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'14px 16px'}}>
        {loading&&<div style={{textAlign:'center',padding:40,color:t.muted,animation:'pulse 1.5s infinite'}}>Loading history...</div>}
        {!loading&&filtered.length===0&&<div style={{textAlign:'center',padding:'50px 16px',color:t.muted}}><div style={{fontSize:32,marginBottom:10}}>🕐</div><div style={{fontSize:15,fontWeight:600,color:t.text,marginBottom:4}}>No history</div><div style={{fontSize:13}}>{search?'No messages match your search.':'Your chat history will appear here.'}</div></div>}
        {Object.entries(groups).sort((a,b)=>b[0].localeCompare(a[0])).map(([date,msgs])=>(
          <div key={date} style={{marginBottom:20}}>
            <div style={{fontSize:11,color:t.muted,fontWeight:600,textTransform:'uppercase',letterSpacing:0.5,marginBottom:10,paddingBottom:6,borderBottom:`1px solid ${t.border}`}}>{date}</div>
            {msgs.map((m,i)=>(
              <div key={i} style={{display:'flex',gap:8,marginBottom:8,padding:'8px 12px',background:m.role==='user'?'transparent':t.card,border:`1px solid ${m.role==='user'?'transparent':t.border}`,borderRadius:8}}>
                <span style={{fontSize:12,color:m.role==='user'?t.muted:'#8B5CF6',fontWeight:600,flexShrink:0,marginTop:1}}>{m.role==='user'?'You':'AI'}</span>
                <span style={{fontSize:13,color:t.muted,lineHeight:1.6,flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{m.content.replace(/[#*`_]/g,'').slice(0,120)}</span>
              </div>
            ))}
          </div>
        ))}
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
    <div style={{display:'flex',flexDirection:'column',height:'100%',overflow:'hidden'}}>
      <div style={{padding:'12px 16px',borderBottom:`1px solid ${t.border}`,flexShrink:0,display:'flex',gap:8}}>
        <input value={filter} onChange={e=>setFilter(e.target.value)} placeholder="Search notes..." style={{...fld,flex:1,padding:'9px 12px'}}/>
        <button onClick={()=>{setForm({title:'',body:'',tag:''});setShowModal(true)}} style={{padding:'9px 16px',borderRadius:8,border:'none',background:'#8B5CF6',color:'#fff',fontSize:13,fontWeight:600,whiteSpace:'nowrap',flexShrink:0}}>＋ Add</button>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'14px 16px'}}>
        {loading&&<div style={{textAlign:'center',padding:40,color:t.muted,animation:'pulse 1.5s infinite'}}>Loading...</div>}
        {!loading&&filtered.length===0&&<div style={{textAlign:'center',padding:'50px 16px',color:t.muted}}><div style={{fontSize:34,marginBottom:10}}>📝</div><div style={{fontSize:14,fontWeight:600,color:t.text,marginBottom:4}}>No notes yet</div><div style={{fontSize:13}}>{filter?'No matching notes.':'Save AI responses or add your own notes.'}</div></div>}
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {filtered.map(n=>(
            <div key={n.id} style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:10,overflow:'hidden'}}>
              <div style={{padding:'12px 14px',cursor:'pointer'}} onClick={()=>setExpanded(expanded===n.id?null:n.id)}>
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
              {expanded===n.id&&<div style={{padding:'0 14px 14px',borderTop:`1px solid ${t.border}`}}><div style={{paddingTop:12}}><MD content={n.body} dark={dark}/></div></div>}
            </div>
          ))}
        </div>
      </div>
      {showModal&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:999,padding:20}}>
          <div style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:14,padding:24,width:'100%',maxWidth:440}} className="fu">
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:17,fontWeight:800,marginBottom:18,color:t.text}}>Save Note</div>
            <div style={{marginBottom:12}}><label style={{fontSize:11,color:t.muted,display:'block',marginBottom:4,fontWeight:500}}>TITLE</label><input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Note title..." style={fld}/></div>
            <div style={{marginBottom:12}}><label style={{fontSize:11,color:t.muted,display:'block',marginBottom:4,fontWeight:500}}>TAG</label><input value={form.tag} onChange={e=>setForm({...form,tag:e.target.value})} placeholder="e.g. math, physics..." style={fld}/></div>
            <div style={{marginBottom:20}}><label style={{fontSize:11,color:t.muted,display:'block',marginBottom:4,fontWeight:500}}>CONTENT</label><textarea value={form.body} onChange={e=>setForm({...form,body:e.target.value})} placeholder="Write your note... (supports **bold**, ## headings, - lists)" rows={6} style={{...fld,resize:'vertical',fontFamily:'monospace',fontSize:12}}/></div>
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
    <div style={{flex:1,overflowY:'auto',padding:16}}>
      <div style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:10,padding:'14px 16px',marginBottom:12}}>
        <div style={{fontSize:11,color:t.muted,marginBottom:10,fontWeight:600,textTransform:'uppercase',letterSpacing:0.5}}>Profile</div>
        {profile?.board?<><div style={{fontSize:14,fontWeight:700,marginBottom:4,color:t.text}}>{profile.board}</div>{profile.subject&&<div style={{fontSize:13,color:t.muted}}>{profile.subject}</div>}</>:<div style={{fontSize:13,color:t.muted}}>No board set.</div>}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:12}}>
        {[['📝',notes.length,'Notes Saved'],['⚠️',weakTopics.length,'Weak Topics']].map(([ic,val,label],i)=>(
          <div key={i} style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:10,padding:'14px',textAlign:'center'}}>
            <div style={{fontSize:22,marginBottom:4}}>{ic}</div>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:24,fontWeight:800,color:t.accent,marginBottom:2}}>{val}</div>
            <div style={{fontSize:11,color:t.muted}}>{label}</div>
          </div>
        ))}
      </div>
      <div style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:10,padding:'14px 16px',marginBottom:12}}>
        <div style={{fontSize:11,color:t.muted,marginBottom:10,fontWeight:600,textTransform:'uppercase',letterSpacing:0.5}}>Weak Topics</div>
        {weakTopics.length===0?<div style={{fontSize:13,color:t.muted}}>No weak topics yet. Quiz wrong answers appear here automatically.</div>:(
          <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
            {weakTopics.map(topic=>(<div key={topic} style={{display:'flex',alignItems:'center',gap:6,background:'rgba(220,38,38,0.08)',border:'1px solid rgba(220,38,38,0.2)',borderRadius:16,padding:'4px 10px'}}><span style={{fontSize:12,color:t.red,fontWeight:500}}>{topic}</span><button onClick={()=>removeWeak(topic)} style={{background:'none',border:'none',color:t.red,fontSize:12,padding:0,cursor:'pointer'}}>✕</button></div>))}
          </div>
        )}
      </div>
      {!isPremium&&(
        <div style={{background:t.card,border:'1px solid rgba(139,92,246,0.2)',borderRadius:10,padding:'16px',marginBottom:12,cursor:'pointer'}} onClick={onUpgrade}>
          <div style={{fontSize:11,color:t.accent,marginBottom:6,fontWeight:600,textTransform:'uppercase',letterSpacing:0.5}}>⭐ Upgrade to Premium</div>
          <div style={{fontSize:13,color:t.muted,lineHeight:1.6,marginBottom:10}}>Unlimited AI messages, quizzes, and all features for ₹99/month.</div>
          <div style={{padding:'8px 16px',borderRadius:8,border:'none',background:'#8B5CF6',color:'#fff',fontSize:13,fontWeight:600,display:'inline-block'}}>Upgrade Now →</div>
        </div>
      )}
      <div style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:10,padding:'14px 16px'}}>
        <div style={{fontSize:11,color:t.muted,marginBottom:10,fontWeight:600,textTransform:'uppercase',letterSpacing:0.5}}>Study Tips</div>
        {['Upload your syllabus PDF for exact unit answers','Use Quiz mode — weak topics tracked automatically','Use Predict mode before exams for likely questions','Save AI answers as notes for quick revision','Use Flashcard mode to memorize key concepts'].map((tip,i,arr)=>(<div key={i} style={{fontSize:13,color:t.muted,padding:'7px 0',borderBottom:i<arr.length-1?`1px solid ${t.border}`:'none',lineHeight:1.5}}>• {tip}</div>))}
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
    return parts.map((p,i)=>p.toLowerCase()===query.toLowerCase()?<mark key={i} style={{background:dark?'rgba(139,92,246,0.2)':'rgba(139,92,246,0.12)',color:'#8B5CF6',borderRadius:2,padding:'0 2px'}}>{p}</mark>:p)
  }
  const results=q.trim()?notes.filter(n=>n.title.toLowerCase().includes(q.toLowerCase())||n.body.toLowerCase().includes(q.toLowerCase())).map(n=>({title:n.title,snippet:n.body.replace(/[#*`_]/g,'').slice(0,180),tag:n.tag})):[]
  return(
    <div style={{display:'flex',flexDirection:'column',height:'100%',overflow:'hidden'}}>
      <div style={{padding:'12px 16px',borderBottom:`1px solid ${t.border}`,flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',gap:10,background:t.card,border:`1px solid ${t.border}`,borderRadius:8,padding:'10px 14px'}}>
          <span style={{fontSize:16,opacity:0.5}}>🔍</span>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search all your notes..." autoFocus style={{flex:1,background:'none',border:'none',outline:'none',color:t.text,fontSize:14}}/>
          {q&&<button onClick={()=>setQ('')} style={{background:'none',border:'none',color:t.muted,fontSize:16,padding:0,lineHeight:1}}>✕</button>}
        </div>
        {q&&<div style={{fontSize:12,color:t.muted,marginTop:7}}>{results.length} result{results.length!==1?'s':''}</div>}
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'14px 16px'}}>
        {!q&&<div style={{textAlign:'center',padding:'60px 16px',color:t.muted}}><div style={{fontSize:36,marginBottom:12}}>🔍</div><div style={{fontSize:15,fontWeight:600,color:t.text,marginBottom:4}}>Search your notes</div><div style={{fontSize:13}}>Find anything across all saved notes.</div></div>}
        {q&&results.length===0&&<div style={{textAlign:'center',padding:'50px 16px',color:t.muted}}><div style={{fontSize:13}}>No results for "<strong style={{color:t.text}}>{q}</strong>"</div></div>}
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {results.map((r,i)=>(
            <div key={i} style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:8,padding:'12px 14px'}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:5}}>
                <span style={{fontSize:11,padding:'2px 8px',borderRadius:20,background:t.card2,color:t.muted,fontWeight:500}}>{r.tag}</span>
              </div>
              <div style={{fontWeight:600,fontSize:14,marginBottom:5,color:t.text,lineHeight:1.4}}>{hl(r.title,q)}</div>
              <div style={{fontSize:13,color:t.muted,lineHeight:1.6}}>{hl(r.snippet,q)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Sidebar ────────────────────────────────────────────────────────────────
function Sidebar({tab,setTab,user,notes,dark,setDark,onLogout,onUpgrade,isPremium,aiMode,setAiMode}){
  const t=T(dark)
  const userName=user.user_metadata?.name||user.email.split('@')[0]
  const navItems=[
    {id:'chat',icon:'💬',label:'Chat'},
    {id:'history',icon:'🕐',label:'History'},
    {id:'notes',icon:'📝',label:'Notes',badge:notes.length},
    {id:'progress',icon:'📊',label:'Progress'},
    {id:'search',icon:'🔍',label:'Search'},
  ]
  return(
    <div style={{width:220,height:'100%',background:t.surface,borderRight:`1px solid ${t.border}`,display:'flex',flexDirection:'column',flexShrink:0}}>
      <div style={{padding:'18px 16px 14px',borderBottom:`1px solid ${t.border}`}}>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:800,color:t.text,letterSpacing:-0.3}}>🧠 <span style={{color:'#8B5CF6'}}>Memora</span></div>
        <div style={{fontSize:11,color:t.muted,marginTop:2}}>AI Study Companion</div>
      </div>
      {/* AI Mode */}
      <div style={{padding:'10px 10px 6px'}}>
        <div style={{fontSize:10,color:t.muted,fontWeight:600,textTransform:'uppercase',letterSpacing:0.5,marginBottom:5,paddingLeft:3}}>Mode</div>
        <div style={{display:'flex',background:t.card,borderRadius:7,padding:2,border:`1px solid ${t.border}`}}>
          <button onClick={()=>setAiMode('study')} style={{flex:1,padding:'6px 0',borderRadius:5,border:'none',fontSize:11,fontWeight:aiMode==='study'?700:400,background:aiMode==='study'?'#8B5CF6':'transparent',color:aiMode==='study'?'#fff':t.muted}}>📚 Study</button>
          <button onClick={()=>setAiMode('general')} style={{flex:1,padding:'6px 0',borderRadius:5,border:'none',fontSize:11,fontWeight:aiMode==='general'?700:400,background:aiMode==='general'?t.green:'transparent',color:aiMode==='general'?'#fff':t.muted}}>💬 General</button>
        </div>
      </div>
      {/* Nav */}
      <div style={{flex:1,padding:'6px 8px',overflowY:'auto'}}>
        {navItems.map(item=>(
          <button key={item.id} onClick={()=>setTab(item.id)} style={{width:'100%',padding:'9px 11px',borderRadius:7,border:'none',background:tab===item.id?dark?'#1E1E1E':'#E8E8E8':'transparent',color:tab===item.id?t.text:t.muted,fontSize:13,fontWeight:tab===item.id?600:400,display:'flex',alignItems:'center',gap:9,marginBottom:2,textAlign:'left'}}>
            <span style={{fontSize:15,width:18,textAlign:'center'}}>{item.icon}</span>
            {item.label}
            {item.badge>0&&<span style={{marginLeft:'auto',fontSize:10,background:dark?'#2A2A2A':'#E0E0E0',color:t.muted,borderRadius:10,padding:'1px 6px',fontWeight:600}}>{item.badge}</span>}
          </button>
        ))}
        <div style={{height:1,background:t.border,margin:'8px 2px'}}/>
        {!isPremium?(
          <button onClick={onUpgrade} style={{width:'100%',padding:'9px 11px',borderRadius:7,border:`1px solid ${t.border}`,background:'transparent',color:t.muted,fontSize:13,fontWeight:500,display:'flex',alignItems:'center',gap:9,textAlign:'left'}}>
            <span style={{fontSize:15}}>⭐</span>Upgrade to Pro<span style={{marginLeft:'auto',fontSize:10,color:'#8B5CF6',fontWeight:600}}>₹99</span>
          </button>
        ):(
          <div style={{margin:'2px',padding:'9px 11px',borderRadius:7,background:dark?'#1A1A1A':'#F5F5F5',border:`1px solid ${t.border}`,fontSize:12,color:t.orange,fontWeight:600,display:'flex',alignItems:'center',gap:9}}>⭐ Premium Active</div>
        )}
      </div>
      {/* Footer */}
      <div style={{padding:'8px 8px 12px',borderTop:`1px solid ${t.border}`}}>
        <button onClick={()=>setDark(!dark)} style={{width:'100%',padding:'8px 11px',borderRadius:7,border:`1px solid ${t.border}`,background:'transparent',color:t.muted,fontSize:12,display:'flex',alignItems:'center',gap:9,marginBottom:6}}>
          <span style={{fontSize:14}}>{dark?'☀️':'🌙'}</span>{dark?'Light Mode':'Dark Mode'}
        </button>
        <div style={{display:'flex',alignItems:'center',gap:8,padding:'6px 3px'}}>
          <div style={{width:28,height:28,borderRadius:'50%',background:dark?'#2A2A2A':'#E8E8E8',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,color:t.text,flexShrink:0}}>{userName.slice(0,1).toUpperCase()}</div>
          <div style={{flex:1,overflow:'hidden'}}>
            <div style={{fontSize:12,fontWeight:600,color:t.text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{userName}</div>
            <button onClick={onLogout} style={{background:'none',border:'none',color:t.muted,fontSize:11,padding:0,cursor:'pointer'}}>Sign out</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function BottomNav({tab,setTab,notes,dark}){
  const t=T(dark)
  const items=[{id:'chat',icon:'💬',label:'Chat'},{id:'history',icon:'🕐',label:'History'},{id:'notes',icon:'📝',label:'Notes',badge:notes.length},{id:'progress',icon:'📊',label:'Progress'},{id:'search',icon:'🔍',label:'Search'}]
  return(
    <div style={{display:'flex',borderTop:`1px solid ${t.border}`,background:t.surface,flexShrink:0}}>
      {items.map(item=>(<button key={item.id} onClick={()=>setTab(item.id)} style={{flex:1,padding:'8px 2px 7px',border:'none',borderTop:`2px solid ${tab===item.id?'#8B5CF6':'transparent'}`,background:'transparent',color:tab===item.id?'#8B5CF6':t.muted,fontSize:9,fontWeight:tab===item.id?700:400,display:'flex',flexDirection:'column',alignItems:'center',gap:2,position:'relative'}}><span style={{fontSize:18}}>{item.icon}</span>{item.label}{item.badge>0&&<span style={{position:'absolute',top:4,right:'calc(50% - 18px)',fontSize:8,background:'#8B5CF6',color:'#fff',borderRadius:8,padding:'1px 4px',fontWeight:700}}>{item.badge}</span>}</button>))}
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
  const [aiMode,setAiMode]=useState('study')

  useEffect(()=>{
    const h=()=>setMobile(window.innerWidth<768)
    window.addEventListener('resize',h);return()=>window.removeEventListener('resize',h)
  },[])

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
  }

  async function logout(){await supabase.auth.signOut();setUser(null);setProfile(null);setNotes([]);setTab('chat');setIsPremium(false)}
  function saveFromAI(content){setNotePrefill(content);setTab('notes')}
  function onProfileDone(p){setProfile(p);setShowProfileSetup(false)}
  const t=T(dark)

  if(loading)return <div style={{minHeight:'100vh',background:dark?'#000':'#FFF',display:'flex',alignItems:'center',justifyContent:'center'}}><style>{CSS(dark)}</style><div style={{fontSize:40,animation:'pulse 1.5s ease infinite'}}>🧠</div></div>
  if(!user)return <><style>{CSS(true)}</style><Landing onAuth={setUser}/></>
  if(showProfileSetup)return <ProfileSetup user={user} onDone={onProfileDone} dark={dark}/>

  return(
    <div style={{height:'100vh',display:'flex',flexDirection:'column',background:t.bg,color:t.text,overflow:'hidden'}}>
      <style>{CSS(dark)}</style>

      {mobile&&(
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 14px',borderBottom:`1px solid ${t.border}`,background:t.surface,flexShrink:0}}>
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
        {!mobile&&<Sidebar tab={tab} setTab={setTab} user={user} notes={notes} dark={dark} setDark={setDark} onLogout={logout} onUpgrade={()=>setShowPremium(true)} isPremium={isPremium} aiMode={aiMode} setAiMode={setAiMode}/>}
        <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden',minWidth:0}}>
          {tab==='chat'&&<ChatTab user={user} notes={notes} profile={profile} onSaveNote={saveFromAI} weakTopics={weakTopics} setWeakTopics={setWeakTopics} isPremium={isPremium} dark={dark} onUpgrade={()=>setShowPremium(true)} aiMode={aiMode}/>}
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
