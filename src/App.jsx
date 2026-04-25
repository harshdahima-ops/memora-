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

function today(){return new Date().toISOString().split('T')[0]}

async function callAI(messages,system,image,url){
  const body={messages,system}
  if(image)body.image=image
  if(url)body.url=url
  const res=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})
  const data=await res.json()
  if(data.error==='RATE_LIMIT')throw new Error('RATE_LIMIT')
  if(data.error)throw new Error(data.error)
  if(!data.reply)throw new Error('No response received')
  return data.reply
}

function parseQuiz(text){
  try{
    const lines=text.split('\n').map(l=>l.trim()).filter(Boolean)
    let q='',a='',b='',c='',d='',ans=''
    for(const line of lines){
      if(line.startsWith('QUESTION:'))q=line.replace('QUESTION:','').trim()
      else if(line.match(/^A\)/))a=line.replace(/^A\)/,'').trim()
      else if(line.match(/^B\)/))b=line.replace(/^B\)/,'').trim()
      else if(line.match(/^C\)/))c=line.replace(/^C\)/,'').trim()
      else if(line.match(/^D\)/))d=line.replace(/^D\)/,'').trim()
      else if(line.startsWith('ANSWER:'))ans=line.replace('ANSWER:','').trim().charAt(0).toUpperCase()
    }
    if(!q||!a||!b||!c||!d||!ans)return null
    return{question:q,options:{A:a,B:b,C:c,D:d},correct:ans}
  }catch{return null}
}

const getCSS=(dark)=>`
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@700;800&display=swap');
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
@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-7px)}}
@keyframes float{0%,100%{transform:translateY(0px)}50%{transform:translateY(-10px)}}
@keyframes glow{0%,100%{opacity:0.5}50%{opacity:1}}
.fade-up{animation:fadeUp 0.4s cubic-bezier(0.16,1,0.3,1);}
.fade-up-d1{animation:fadeUp 0.4s 0.1s cubic-bezier(0.16,1,0.3,1) both;}
.fade-up-d2{animation:fadeUp 0.4s 0.2s cubic-bezier(0.16,1,0.3,1) both;}
.fade-up-d3{animation:fadeUp 0.4s 0.3s cubic-bezier(0.16,1,0.3,1) both;}
.fade-up-d4{animation:fadeUp 0.4s 0.4s cubic-bezier(0.16,1,0.3,1) both;}
`

const T=(dark)=>({
  bg:dark?'#0D0D12':'#F4F3FF',
  card:dark?'#15151C':'#FFFFFF',
  card2:dark?'#1C1C26':'#F0EFF8',
  border:dark?'#252535':'#E0DFF0',
  text:dark?'#EEEDF5':'#1A1A2E',
  muted:dark?'#7A79A0':'#6B6B8A',
  accent:'#7B6EF6',
  green:'#4DC9A0',
  red:'#F06B6B',
  sidebar:dark?'#111118':'#EBEBF8',
})

function Avatar({name,size=34}){
  return <div style={{width:size,height:size,borderRadius:'50%',background:'linear-gradient(135deg,#7B6EF6,#5A50D4)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:size*0.38,fontWeight:700,color:'#fff',flexShrink:0}}>{(name||'U').slice(0,2).toUpperCase()}</div>
}
function Tag({text,color='#7B6EF6'}){
  return <span style={{fontSize:11,padding:'2px 8px',borderRadius:20,background:color+'22',color,fontWeight:600,flexShrink:0}}>{text}</span>
}

function fmtInline(text,dark){
  if(!text)return''
  const t=T(dark)
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
  const t=T(dark)
  const lines=content.split('\n'),els=[];let i=0,inCode=false,codeLines=[]
  while(i<lines.length){
    const l=lines[i]
    if(l.startsWith('```')){inCode?(els.push(<pre key={i} style={{background:dark?'#0D0D12':'#F0EFF8',borderRadius:8,padding:'10px 12px',fontSize:12,overflow:'auto',margin:'8px 0',fontFamily:'monospace'}}><code>{codeLines.join('\n')}</code></pre>),inCode=false,codeLines=[]):(inCode=true,codeLines=[]);i++;continue}
    if(inCode){codeLines.push(l);i++;continue}
    if(l.startsWith('### '))els.push(<h3 key={i} style={{fontSize:14,fontWeight:600,margin:'6px 0 3px',color:t.text}}>{fmtInline(l.slice(4),dark)}</h3>)
    else if(l.startsWith('## '))els.push(<h2 key={i} style={{fontSize:16,fontWeight:600,margin:'8px 0 4px',color:t.text}}>{fmtInline(l.slice(3),dark)}</h2>)
    else if(l.startsWith('# '))els.push(<h1 key={i} style={{fontSize:18,fontWeight:700,margin:'10px 0 4px',color:t.text}}>{fmtInline(l.slice(2),dark)}</h1>)
    else if(l.startsWith('---'))els.push(<hr key={i} style={{border:'none',borderTop:'1px solid '+(dark?'#252535':'#E0DFF5'),margin:'10px 0'}}/>)
    else if(l.startsWith('- ')||l.startsWith('* '))els.push(<div key={i} style={{paddingLeft:16,marginBottom:3,lineHeight:1.65,fontSize:14,color:t.muted}}>• {fmtInline(l.slice(2),dark)}</div>)
    else if(/^\d+\. /.test(l)){const[,n,tx]=l.match(/^(\d+)\. (.*)/);els.push(<div key={i} style={{paddingLeft:16,marginBottom:3,lineHeight:1.65,fontSize:14,color:t.muted}}>{n}. {fmtInline(tx,dark)}</div>)}
    else if(l.trim()==='')els.push(<div key={i} style={{height:6}}/>)
    else els.push(<p key={i} style={{margin:'3px 0',lineHeight:1.7,fontSize:14,color:t.muted}}>{fmtInline(l,dark)}</p>)
    i++
  }
  return <div style={{lineHeight:1.6}}>{els}</div>
}

// ── LANDING / AUTH ──────────────────────────────────────────────────────────
function AuthScreen({onAuth,dark}){
  const t=T(dark)
  const [view,setView]=useState('landing')
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
    if(view==='signup'&&!name.trim()){setErr('Name is required.');return}
    setLoading(true)
    try{
      if(view==='signup'){
        const{data,error}=await supabase.auth.signUp({email:email.trim(),password:pass.trim(),options:{data:{name:name.trim()}}})
        if(error)throw error
        if(data.user)onAuth(data.user)
        else setErr('Account created! You can now login.')
      }else{
        const{data,error}=await supabase.auth.signInWithPassword({email:email.trim(),password:pass.trim()})
        if(error)throw error
        onAuth(data.user)
      }
    }catch(e){setErr(e.message||'Something went wrong.')}
    setLoading(false)
  }

  const inp={width:'100%',padding:'12px 16px',borderRadius:12,border:'1px solid #252535',background:'#1C1C26',color:'#EEEDF5',fontSize:14}
  const features=[{icon:'🎯',text:'Personalized for CBSE, JEE, NEET, CA & 40+ courses'},{icon:'🧩',text:'Interactive quiz that tracks your weak topics'},{icon:'📝',text:'Smart notes with proper formatting'},{icon:'📋',text:'Upload your college syllabus PDF for exact answers'}]

  if(view==='landing'){
    return(
      <div style={{minHeight:'100vh',background:'#0A0A10',color:'#EEEDF5',overflowY:'auto'}}>
        <div style={{position:'fixed',inset:0,overflow:'hidden',pointerEvents:'none'}}>
          <div style={{position:'absolute',top:'-20%',left:'50%',transform:'translateX(-50%)',width:600,height:600,background:'radial-gradient(circle,rgba(123,110,246,0.15) 0%,transparent 70%)',animation:'glow 4s ease infinite'}}/>
        </div>
        <nav style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'20px 32px',position:'relative',zIndex:10}}>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:800}}>🧠 <span style={{color:'#7B6EF6'}}>Memora</span></div>
          <div style={{display:'flex',gap:10}}>
            <button onClick={()=>setView('login')} style={{padding:'8px 20px',borderRadius:10,border:'1px solid #252535',background:'transparent',color:'#EEEDF5',fontSize:13,fontWeight:500}}>Login</button>
            <button onClick={()=>setView('signup')} style={{padding:'8px 20px',borderRadius:10,border:'none',background:'#7B6EF6',color:'#fff',fontSize:13,fontWeight:600}}>Sign Up Free</button>
          </div>
        </nav>
        <div style={{textAlign:'center',padding:'60px 20px 40px',position:'relative',zIndex:10,maxWidth:700,margin:'0 auto'}}>
          <div className="fade-up" style={{display:'inline-flex',alignItems:'center',gap:8,background:'rgba(123,110,246,0.12)',border:'1px solid rgba(123,110,246,0.3)',borderRadius:20,padding:'6px 16px',fontSize:12,color:'#A78BFA',fontWeight:500,marginBottom:24}}>✨ Your Personal AI Study Companion</div>
          <h1 className="fade-up-d1" style={{fontFamily:"'Syne',sans-serif",fontSize:'clamp(36px,7vw,64px)',fontWeight:800,lineHeight:1.1,marginBottom:20,letterSpacing:-1}}>Study Smarter.<br/><span style={{color:'#FFFFFF'}}>Score Higher.</span></h1>
          <p className="fade-up-d2" style={{fontSize:16,color:'#7A79A0',lineHeight:1.7,marginBottom:36,maxWidth:500,margin:'0 auto 36px'}}>AI-powered study assistant built for Indian students. Personalized for your board, exam, or college course.</p>
          <div className="fade-up-d3" style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap',marginBottom:16}}>
            <button onClick={googleLogin} style={{display:'flex',alignItems:'center',gap:10,padding:'13px 24px',borderRadius:12,border:'1px solid #252535',background:'#15151C',color:'#EEEDF5',fontSize:14,fontWeight:500}}>
              <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 002.38-5.88c0-.57-.05-.66-.15-1.18z"/><path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.04a4.8 4.8 0 01-7.18-2.54H1.83v2.07A8 8 0 008.98 17z"/><path fill="#FBBC05" d="M4.5 10.48A4.8 4.8 0 014.5 9a5 5 0 01.32-1.76V5.17H2.18a8 8 0 000 7.66l2.32-2.35z"/><path fill="#EA4335" d="M8.98 4.72c1.3 0 2.11.56 2.6 1.03l1.93-1.93C12.07 2.79 10.6 2 8.98 2a8 8 0 00-6.8 3.83l2.32 2.07a4.77 4.77 0 014.48-3.18z"/></svg>
              Continue with Google
            </button>
            <button onClick={()=>setView('signup')} style={{padding:'13px 28px',borderRadius:12,border:'none',background:'#7B6EF6',color:'#fff',fontSize:14,fontWeight:600}}>Create Free Account</button>
          </div>
          <div className="fade-up-d4" style={{fontSize:12,color:'#3A3A58'}}>No credit card required • 20 free AI messages per day</div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:16,maxWidth:800,margin:'20px auto 60px',padding:'0 24px',position:'relative',zIndex:10}}>
          {features.map((f,i)=>(
            <div key={i} className="fade-up" style={{background:'#15151C',border:'1px solid #252535',borderRadius:14,padding:'16px 18px',animationDelay:i*0.1+'s'}}>
              <div style={{fontSize:24,marginBottom:8}}>{f.icon}</div>
              <div style={{fontSize:13,color:'#7A79A0',lineHeight:1.6}}>{f.text}</div>
            </div>
          ))}
        </div>
        <div style={{display:'flex',justifyContent:'center',gap:40,flexWrap:'wrap',padding:'0 24px 60px',position:'relative',zIndex:10}}>
          {[['40+','Boards & Courses'],['₹99','Premium/Month'],['Free','To Start'],['24/7','Available']].map(([val,label],i)=>(
            <div key={i} style={{textAlign:'center'}}>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:28,fontWeight:800,color:'#7B6EF6'}}>{val}</div>
              <div style={{fontSize:12,color:'#3A3A58',marginTop:2}}>{label}</div>
            </div>
          ))}
        </div>
        <div style={{textAlign:'center',padding:'0 0 40px',color:'#3A3A58',fontSize:13,position:'relative',zIndex:10}}>
          Already have an account?{' '}
          <button onClick={()=>setView('login')} style={{background:'none',border:'none',color:'#7B6EF6',fontSize:13,fontWeight:600,cursor:'pointer'}}>Login →</button>
        </div>
      </div>
    )
  }

  return(
    <div style={{minHeight:'100vh',display:'flex',background:'#0A0A10',overflowY:'auto'}}>
      <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',padding:40,position:'relative'}}>
        <div style={{position:'absolute',inset:0,overflow:'hidden',pointerEvents:'none'}}>
          <div style={{position:'absolute',top:'30%',left:'30%',width:300,height:300,background:'radial-gradient(circle,rgba(123,110,246,0.12) 0%,transparent 70%)'}}/>
        </div>
        <div style={{width:'100%',maxWidth:380,position:'relative',zIndex:1}} className="fade-up">
          <button onClick={()=>setView('landing')} style={{background:'none',border:'none',color:'#7A79A0',fontSize:13,cursor:'pointer',marginBottom:24,display:'flex',alignItems:'center',gap:6}}>← Back</button>
          <div style={{marginBottom:28}}>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:26,fontWeight:800,color:'#EEEDF5',marginBottom:6}}>{view==='login'?'Welcome back 👋':'Create your account'}</div>
            <div style={{fontSize:13,color:'#7A79A0'}}>{view==='login'?'Login to continue your learning journey':'Join thousands of students studying smarter'}</div>
          </div>
          <button onClick={googleLogin} disabled={loading} style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'center',gap:10,padding:'12px',borderRadius:12,border:'1px solid #252535',background:'#15151C',color:'#EEEDF5',fontSize:14,fontWeight:500,marginBottom:16}}>
            <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 002.38-5.88c0-.57-.05-.66-.15-1.18z"/><path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.04a4.8 4.8 0 01-7.18-2.54H1.83v2.07A8 8 0 008.98 17z"/><path fill="#FBBC05" d="M4.5 10.48A4.8 4.8 0 014.5 9a5 5 0 01.32-1.76V5.17H2.18a8 8 0 000 7.66l2.32-2.35z"/><path fill="#EA4335" d="M8.98 4.72c1.3 0 2.11.56 2.6 1.03l1.93-1.93C12.07 2.79 10.6 2 8.98 2a8 8 0 00-6.8 3.83l2.32 2.07a4.77 4.77 0 014.48-3.18z"/></svg>
            Continue with Google
          </button>
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16}}>
            <div style={{flex:1,height:1,background:'#252535'}}/><span style={{fontSize:12,color:'#3A3A58'}}>or</span><div style={{flex:1,height:1,background:'#252535'}}/>
          </div>
          {view==='signup'&&<div style={{marginBottom:12}}><label style={{fontSize:12,color:'#7A79A0',display:'block',marginBottom:5}}>Your name</label><input style={inp} placeholder="e.g. Harsh" value={name} onChange={e=>setName(e.target.value)}/></div>}
          <div style={{marginBottom:12}}><label style={{fontSize:12,color:'#7A79A0',display:'block',marginBottom:5}}>Email address</label><input style={inp} type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)}/></div>
          <div style={{marginBottom:20}}><label style={{fontSize:12,color:'#7A79A0',display:'block',marginBottom:5}}>Password</label><input style={inp} type="password" placeholder="min 6 characters" value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==='Enter'&&submit()}/></div>
          {err&&<div style={{fontSize:13,color:'#F06B6B',background:'#F06B6B15',border:'1px solid #F06B6B30',borderRadius:10,padding:'10px 14px',marginBottom:14,textAlign:'center'}}>{err}</div>}
          <button onClick={submit} disabled={loading} style={{width:'100%',padding:13,borderRadius:12,border:'none',background:loading?'#252535':'linear-gradient(135deg,#7B6EF6,#5A50D4)',color:'#fff',fontSize:14,fontWeight:700,cursor:loading?'not-allowed':'pointer'}}>
            {loading?'Please wait...':(view==='login'?'Login to Memora':'Create Free Account')}
          </button>
          <div style={{textAlign:'center',marginTop:16,fontSize:13,color:'#7A79A0'}}>
            {view==='login'?<>No account? <button onClick={()=>{setView('signup');setErr('')}} style={{background:'none',border:'none',color:'#7B6EF6',fontSize:13,fontWeight:600,cursor:'pointer'}}>Sign up free</button></>:<>Already have an account? <button onClick={()=>{setView('login');setErr('')}} style={{background:'none',border:'none',color:'#7B6EF6',fontSize:13,fontWeight:600,cursor:'pointer'}}>Login</button></>}
          </div>
        </div>
      </div>
      <div style={{flex:1,background:'linear-gradient(135deg,#111118,#0D0D1A)',display:'flex',alignItems:'center',justifyContent:'center',padding:40,borderLeft:'1px solid #252535'}} className="hide-mobile">
        <div style={{textAlign:'center',maxWidth:320}}>
          <div style={{fontSize:64,marginBottom:20,animation:'float 3s ease infinite'}}>🧠</div>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:24,fontWeight:800,color:'#EEEDF5',marginBottom:10}}>Study Smarter with AI</div>
          <div style={{fontSize:14,color:'#7A79A0',lineHeight:1.7,marginBottom:24}}>Personalized for your board, exam, or college course.</div>
          {[['🎯','40+ boards & courses'],['🧩','Interactive quiz mode'],['📊','Weak topic tracker'],['📋','Upload syllabus PDF']].map(([ic,tx],i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',gap:10,background:'rgba(123,110,246,0.08)',border:'1px solid rgba(123,110,246,0.15)',borderRadius:10,padding:'10px 14px',marginBottom:8,textAlign:'left'}}>
              <span style={{fontSize:18}}>{ic}</span><span style={{fontSize:13,color:'#A0A0C0'}}>{tx}</span>
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
  const [loading,setLoading]=useState(false)
  const subjects=board?BOARDS[board]:[]
  async function save(){
    if(!board)return
    setLoading(true)
    await supabase.from('profiles').upsert({user_id:user.id,board,subject:subject||null,weak_topics:[],premium:false})
    onDone({board,subject,premium:false})
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
              {Object.entries(BOARD_GROUPS).map(([group,opts])=>(<optgroup key={group} label={group}>{opts.map(b=><option key={b} value={b}>{b}</option>)}</optgroup>))}
            </select>
          </div>
          {subjects.length>0&&(<div style={{marginBottom:20}}><label style={{fontSize:12,color:t.muted,display:'block',marginBottom:6}}>Main subject (optional)</label><select value={subject} onChange={e=>setSubject(e.target.value)} style={{...sel,color:subject?t.text:t.muted}}><option value="">All subjects</option>{subjects.map(s=><option key={s} value={s}>{s}</option>)}</select></div>)}
          <button onClick={save} disabled={!board||loading} style={{width:'100%',padding:11,borderRadius:10,border:'none',background:!board||loading?t.border:'#7B6EF6',color:'#fff',fontSize:14,fontWeight:600,opacity:!board?0.5:1}}>{loading?'Saving...':'Start Learning →'}</button>
        </div>
        <div style={{textAlign:'center',marginTop:14}}><button onClick={()=>onDone(null)} style={{background:'none',border:'none',color:t.muted,fontSize:12,cursor:'pointer'}}>Skip for now</button></div>
      </div>
    </div>
  )
}

// ── Premium Modal ──────────────────────────────────────────────────────────
function PremiumModal({onClose,dark,user}){
  const t=T(dark)
  const [loading,setLoading]=useState(false)
  const [step,setStep]=useState('plan')

  async function startPayment(){
    setLoading(true)
    try{
      await new Promise((resolve,reject)=>{
        if(window.Razorpay){resolve();return}
        const s=document.createElement('script')
        s.src='https://checkout.razorpay.com/v1/checkout.js'
        s.onload=resolve;s.onerror=reject
        document.body.appendChild(s)
      })
      const orderRes=await fetch('/api/payment',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'create_order'})})
      const orderData=await orderRes.json()
      if(orderData.error){alert('Payment setup failed: '+orderData.error);setLoading(false);return}
      const options={
        key:orderData.keyId,amount:orderData.amount,currency:orderData.currency,order_id:orderData.orderId,
        name:'Memora Premium',description:'Unlimited AI messages per month',
        prefill:{email:user?.email||'',name:user?.user_metadata?.name||''},
        theme:{color:'#7B6EF6'},
        handler:async function(response){
          const verifyRes=await fetch('/api/payment',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'verify_payment',...response})})
          const verifyData=await verifyRes.json()
          if(verifyData.verified){
            await supabase.from('profiles').update({premium:true,premium_since:new Date().toISOString()}).eq('user_id',user.id)
            setStep('success')
          }else alert('Payment verification failed. Contact support.')
        },
        modal:{ondismiss:()=>setLoading(false)}
      }
      new window.Razorpay(options).open()
    }catch(e){alert('Payment error: '+(e.message||'Try again.'))}
    setLoading(false)
  }

  if(step==='success')return(
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:20}}>
      <div style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:20,padding:32,width:'100%',maxWidth:360,textAlign:'center'}} className="fade-up">
        <div style={{fontSize:52,marginBottom:12}}>🎉</div>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:700,color:t.text,marginBottom:8}}>You're Premium!</div>
        <div style={{fontSize:14,color:t.muted,marginBottom:24}}>Enjoy unlimited AI messages and all premium features.</div>
        <button onClick={()=>{onClose();window.location.reload()}} style={{width:'100%',padding:12,borderRadius:12,border:'none',background:'#7B6EF6',color:'#fff',fontSize:14,fontWeight:700}}>Start Studying →</button>
      </div>
    </div>
  )

  const features=[{icon:'∞',label:'Unlimited AI messages per day'},{icon:'🧩',label:'Unlimited quiz questions'},{icon:'📁',label:'Upload images & analyze URLs'},{icon:'📋',label:'Upload syllabus PDF'},{icon:'📊',label:'Advanced progress analytics'},{icon:'⚡',label:'Priority AI response speed'}]
  return(
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:20,overflowY:'auto'}}>
      <div style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:20,padding:28,width:'100%',maxWidth:420}} className="fade-up">
        <div style={{textAlign:'center',marginBottom:24}}>
          <div style={{fontSize:40,marginBottom:8}}>⭐</div>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:700,color:t.text}}>Memora Premium</div>
          <div style={{fontSize:13,color:t.muted,marginTop:4}}>Unlock your full learning potential</div>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:22}}>
          {features.map((f,i)=>(<div key={i} style={{display:'flex',alignItems:'center',gap:12,padding:'8px 12px',background:t.card2,borderRadius:10}}><span style={{fontSize:18,width:28,textAlign:'center'}}>{f.icon}</span><span style={{fontSize:13,color:t.text}}>{f.label}</span></div>))}
        </div>
        <div style={{background:'linear-gradient(135deg,#7B6EF6,#5A50D4)',borderRadius:14,padding:'16px 20px',textAlign:'center',marginBottom:14}}>
          <div style={{fontSize:28,fontWeight:800,color:'#fff',fontFamily:"'Syne',sans-serif"}}>₹99 <span style={{fontSize:15,fontWeight:400,opacity:0.8}}>/ month</span></div>
          <div style={{fontSize:12,color:'rgba(255,255,255,0.7)',marginTop:3}}>Cancel anytime • Instant access</div>
        </div>
        <div style={{display:'flex',gap:6,justifyContent:'center',flexWrap:'wrap',marginBottom:16}}>
          {['UPI','Credit Card','Debit Card','Net Banking','Wallets'].map(m=>(<span key={m} style={{fontSize:10,padding:'3px 8px',borderRadius:8,background:t.card2,border:`1px solid ${t.border}`,color:t.muted}}>{m}</span>))}
        </div>
        <button onClick={startPayment} disabled={loading} style={{width:'100%',padding:13,borderRadius:12,border:'none',background:loading?t.border:'linear-gradient(135deg,#7B6EF6,#5A50D4)',color:'#fff',fontSize:15,fontWeight:700,marginBottom:10,cursor:loading?'not-allowed':'pointer'}}>
          {loading?'Loading payment...':'Pay ₹99 & Upgrade Now'}
        </button>
        <div style={{fontSize:11,color:t.muted,textAlign:'center',marginBottom:12}}>🔒 Secure payment powered by Razorpay</div>
        <button onClick={onClose} style={{width:'100%',padding:10,borderRadius:10,border:`1px solid ${t.border}`,background:'transparent',color:t.muted,fontSize:13}}>Maybe later</button>
      </div>
    </div>
  )
}

// ── QUIZ COMPONENT ─────────────────────────────────────────────────────────
function QuizCard({quiz,onAnswer,onNext,onEnd,score,total,dark}){
  const t=T(dark)
  const [selected,setSelected]=useState(null)
  const [revealed,setRevealed]=useState(false)

  function submit(){
    if(!selected)return
    setRevealed(true)
    const correct=selected===quiz.correct
    onAnswer(correct,selected)
  }

  function next(){
    setSelected(null)
    setRevealed(false)
    onNext()
  }

  return(
    <div style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:16,padding:'18px 16px',marginTop:10,maxWidth:'85%'}}>
      {/* Score bar */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
        <span style={{fontSize:12,color:t.muted,fontWeight:500}}>Question {total+1}</span>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <span style={{fontSize:12,fontWeight:600,color:'#4DC9A0'}}>✅ {score} correct</span>
          <button onClick={onEnd} style={{fontSize:11,color:t.red,background:'none',border:`1px solid ${t.red}44`,borderRadius:8,padding:'2px 8px',cursor:'pointer'}}>End</button>
        </div>
      </div>

      {/* Question */}
      <div style={{fontSize:15,fontWeight:600,color:t.text,marginBottom:16,lineHeight:1.5}}>{quiz.question}</div>

      {/* Options */}
      <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:14}}>
        {Object.entries(quiz.options).map(([letter,text])=>{
          let bg=t.card2,border=t.border,col=t.text,icon=''
          if(revealed){
            if(letter===quiz.correct){bg='#4DC9A022';border='#4DC9A0';col='#4DC9A0';icon=' ✅'}
            else if(selected===letter&&letter!==quiz.correct){bg='#F06B6B22';border='#F06B6B';col='#F06B6B';icon=' ❌'}
          } else if(selected===letter){bg='#7B6EF622';border='#7B6EF6';col='#7B6EF6'}
          return(
            <button key={letter} onClick={()=>!revealed&&setSelected(letter)}
              style={{padding:'10px 14px',borderRadius:10,border:`1px solid ${border}`,background:bg,color:col,fontSize:14,textAlign:'left',cursor:revealed?'default':'pointer',transition:'all 0.15s',fontWeight:selected===letter||letter===quiz.correct?500:400}}>
              <strong>{letter})</strong> {text}{icon}
            </button>
          )
        })}
      </div>

      {/* Action buttons */}
      {!revealed?(
        <button onClick={submit} disabled={!selected} style={{width:'100%',padding:'10px',borderRadius:10,border:'none',background:selected?'#7B6EF6':t.border,color:'#fff',fontSize:14,fontWeight:600,opacity:selected?1:0.5,cursor:selected?'pointer':'not-allowed'}}>
          Submit Answer
        </button>
      ):(
        <div>
          <div style={{padding:'10px 14px',borderRadius:10,background:selected===quiz.correct?'#4DC9A022':'#F06B6B22',border:`1px solid ${selected===quiz.correct?'#4DC9A040':'#F06B6B40'}`,marginBottom:10,textAlign:'center'}}>
            <div style={{fontSize:14,fontWeight:700,color:selected===quiz.correct?'#4DC9A0':'#F06B6B'}}>
              {selected===quiz.correct?'🎉 Correct! Well done.':'❌ Wrong answer!'}
            </div>
            {selected!==quiz.correct&&<div style={{fontSize:13,color:t.muted,marginTop:4}}>Correct: <strong style={{color:'#4DC9A0'}}>{quiz.correct}) {quiz.options[quiz.correct]}</strong></div>}
          </div>
          <div style={{display:'flex',gap:8}}>
            <button onClick={next} style={{flex:1,padding:'10px',borderRadius:10,border:'none',background:'#7B6EF6',color:'#fff',fontSize:14,fontWeight:600}}>Next Question →</button>
            <button onClick={onEnd} style={{padding:'10px 14px',borderRadius:10,border:`1px solid ${t.border}`,background:'transparent',color:t.muted,fontSize:13}}>End Quiz</button>
          </div>
        </div>
      )}
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
  const [loadingMsgs,setLoadingMsgs]=useState(true)
  const [attachment,setAttachment]=useState(null)
  const [urlInput,setUrlInput]=useState('')
  const [showAttach,setShowAttach]=useState(false)
  const [syllabus,setSyllabus]=useState(null)
  const [syllabusName,setSyllabusName]=useState(null)
  const [parsingSyllabus,setParsingSyllabus]=useState(false)
  // Quiz state
  const [quizTopic,setQuizTopic]=useState(null)
  const [quizScore,setQuizScore]=useState(0)
  const [quizTotal,setQuizTotal]=useState(0)
  const [currentQuiz,setCurrentQuiz]=useState(null)
  const [quizMsgId,setQuizMsgId]=useState(null)
  const [loadingQuiz,setLoadingQuiz]=useState(false)
  const bottomRef=useRef(null)
  const fileRef=useRef(null)
  const syllabusRef=useRef(null)

  useEffect(()=>{loadData()},[])
  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:'smooth'})},[messages,typing,currentQuiz])

  async function loadData(){
    const[mr,ur]=await Promise.all([
      supabase.from('messages').select('*').eq('user_id',user.id).order('created_at'),
      supabase.from('usage').select('count').eq('user_id',user.id).eq('date',today()).single()
    ])
    if(mr.data)setMessages(mr.data)
    if(ur.data)setUsage(ur.data.count)
    setLoadingMsgs(false)
  }

  async function trackUsage(){
    const{data}=await supabase.from('usage').select('count').eq('user_id',user.id).eq('date',today()).single()
    if(data){await supabase.from('usage').update({count:data.count+1}).eq('user_id',user.id).eq('date',today());setUsage(data.count+1)}
    else{await supabase.from('usage').insert({user_id:user.id,date:today(),count:1});setUsage(1)}
  }

  function handleFile(e){
    const file=e.target.files[0];if(!file)return
    if(file.type.startsWith('image/')){
      const reader=new FileReader()
      reader.onload=ev=>setAttachment({type:'image',data:ev.target.result,preview:file.name})
      reader.readAsDataURL(file)
    }else alert('Only image files supported.')
    setShowAttach(false)
  }

  async function handleSyllabusPDF(e){
    const file=e.target.files[0];if(!file)return
    if(!file.name.endsWith('.pdf')){alert('Please upload a PDF file.');return}
    setParsingSyllabus(true);setShowAttach(false)
    try{
      // Extract text from PDF using FileReader + send to API
      const reader=new FileReader()
      reader.onload=async(ev)=>{
        try{
          // Convert ArrayBuffer to text by extracting readable strings from PDF binary
          const arr=new Uint8Array(ev.target.result)
          let text=''
          for(let i=0;i<arr.length;i++){
            const c=arr[i]
            if(c>=32&&c<=126)text+=String.fromCharCode(c)
            else if(c===10||c===13)text+=' '
          }
          // Clean up: remove excessive spaces/junk, keep readable content
          text=text.replace(/[^\x20-\x7E\n]/g,' ').replace(/\s+/g,' ').trim()
          if(text.length<100){alert('Could not extract text from PDF. Make sure it is not a scanned image PDF.');setParsingSyllabus(false);return}
          const res=await fetch('/api/parse-pdf',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text})})
          const data=await res.json()
          if(data.syllabus){setSyllabus(data.syllabus);setSyllabusName(file.name)}
          else alert('Could not parse syllabus. Try a text-based PDF.')
        }catch(err){alert('PDF parsing failed: '+err.message)}
        setParsingSyllabus(false)
      }
      reader.readAsArrayBuffer(file)
    }catch(err){alert('Error reading file.');setParsingSyllabus(false)}
  }

  function addUrl(){
    if(!urlInput.trim())return
    setAttachment({type:'url',data:urlInput.trim(),preview:urlInput.trim()})
    setUrlInput('');setShowAttach(false)
  }

  function buildSystem(){
    let sys='You are Memora, a precise AI study assistant for Indian students.'
    if(profile?.board)sys+=' Student is studying '+profile.board+'.'
    if(profile?.subject)sys+=' Main subject: '+profile.subject+'.'
    if(syllabus){
      sys+=' IMPORTANT: The student has uploaded their EXACT syllabus. Follow it strictly:\n\n'+syllabus+'\n\nOnly cover these exact units and topics. Nothing more.'
    }else{
      sys+=' Follow the standard syllabus. Cover ALL units completely, not just the first one.'
    }
    sys+=' Rules: Use ## for unit headings, **bold** for key terms, numbered lists. Keep it exam-focused. No padding.'
    if(mode==='summarize')sys+=' Give a structured unit-wise bullet summary covering ALL units.'
    if(mode==='explain')sys+=' Explain step by step in simple terms with examples.'
    if(mode==='quiz')sys+=' Generate EXACTLY 1 MCQ from the syllabus. Format strictly on separate lines: QUESTION: [text] A) [opt] B) [opt] C) [opt] D) [opt] ANSWER: [A or B or C or D]'
    if(notes.length>0)sys+='\n\nStudent notes:\n'+notes.map(n=>'['+n.tag+'] '+n.title+': '+n.body).join('\n')
    if(weakTopics.length>0)sys+='\n\nWeak topics: '+weakTopics.join(', ')
    return sys
  }

  async function sendMessage(q,skipInput=false){
    const query=q||input.trim()
    if(!query||typing)return
    const limit=isPremium?9999:FREE_LIMIT
    if(usage>=limit){onUpgrade();return}
    if(!skipInput)setInput('')
    const attNote=attachment?.type==='url'?' [URL: '+attachment.data+']':''
    const userMsg={id:Date.now(),user_id:user.id,role:'user',content:query+attNote,created_at:new Date().toISOString()}
    setMessages(prev=>[...prev,userMsg]);setTyping(true)
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
        if(parsed){setCurrentQuiz(parsed);setQuizMsgId(aiId);if(!quizTopic){setQuizTopic(query);setQuizScore(0);setQuizTotal(0)}}
      }
    }catch(e){
      const errMsg=e.message==='RATE_LIMIT'
        ?'⏳ AI is taking a short break due to high usage. Please wait 1-2 minutes and try again.'
        :'Error: '+(e.message||'Try again.')
      setMessages(prev=>[...prev,{id:Date.now()+1,role:'ai',content:errMsg,created_at:new Date().toISOString()}])
    }
    setTyping(false)
  }

  async function onQuizAnswer(correct,selected){
    const newScore=quizScore+(correct?1:0)
    const newTotal=quizTotal+1
    setQuizScore(newScore);setQuizTotal(newTotal)
    if(!correct){
      const topic=quizTopic||'Unknown'
      if(!weakTopics.includes(topic)){const updated=[...weakTopics,topic];setWeakTopics(updated);supabase.from('profiles').update({weak_topics:updated}).eq('user_id',user.id)}
    }
  }

  async function onNextQuestion(){
    setLoadingQuiz(true);setCurrentQuiz(null)
    // Send a silent request for next question
    const limit=isPremium?9999:FREE_LIMIT
    if(usage>=limit){onUpgrade();setLoadingQuiz(false);return}
    const sys=buildSystem()
    const apiMsgs=[{role:'user',content:'Give me the next question on '+quizTopic}]
    try{
      await trackUsage()
      const reply=await callAI(apiMsgs,sys,null,null)
      const aiId=Date.now()+1
      const aiMsg={id:aiId,user_id:user.id,role:'ai',content:reply,created_at:new Date().toISOString()}
      setMessages(prev=>[...prev,aiMsg])
      await supabase.from('messages').insert({user_id:user.id,role:'ai',content:reply})
      const parsed=parseQuiz(reply)
      if(parsed){setCurrentQuiz(parsed);setQuizMsgId(aiId)}
    }catch(e){
      setMessages(prev=>[...prev,{id:Date.now()+1,role:'ai',content:e.message==='RATE_LIMIT'?'⏳ AI is taking a break. Wait 1-2 minutes.':'Error getting next question.',created_at:new Date().toISOString()}])
    }
    setLoadingQuiz(false)
  }

  function endQuiz(){
    const finalScore=quizScore;const finalTotal=quizTotal
    setCurrentQuiz(null);setQuizTopic(null);setQuizScore(0);setQuizTotal(0);setMode('chat')
    if(finalTotal>0){
      const summary={id:Date.now(),role:'ai',content:'📊 **Quiz Ended!**\n\nYour score: **'+finalScore+' / '+finalTotal+'** ('+(Math.round(finalScore/finalTotal*100))+'%)\n\n'+(finalScore===finalTotal?'🎉 Perfect score! Excellent!':finalScore>=finalTotal*0.7?'👍 Good job! Keep practicing.':'📚 Keep studying. You can do better!'),created_at:new Date().toISOString()}
      setMessages(prev=>[...prev,summary])
    }
  }

  const modes=[{id:'chat',label:'💬 Chat',color:'#7B6EF6'},{id:'summarize',label:'📋 Summarize',color:'#4DC9A0'},{id:'explain',label:'🔍 Explain',color:'#F0A86B'},{id:'quiz',label:'🧩 Quiz Me',color:'#F06B6B'}]
  const limitHit=!isPremium&&usage>=FREE_LIMIT

  return(
    <div style={{display:'flex',flexDirection:'column',height:'100%',overflow:'hidden'}}>
      {/* Top bar */}
      <div style={{padding:'5px 14px',background:t.card2,borderBottom:`1px solid ${t.border}`,display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0,flexWrap:'wrap',gap:4}}>
        <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
          <span style={{fontSize:11,color:'#7B6EF6',fontWeight:500}}>{profile?.board?'🎯 '+profile.board+(profile.subject?' · '+profile.subject:''):'🎯 No board set'}</span>
          {parsingSyllabus&&<span style={{fontSize:11,color:'#F0A86B',animation:'pulse 1.5s infinite'}}>📄 Parsing syllabus...</span>}
          {syllabus&&!parsingSyllabus&&(
            <div style={{display:'flex',alignItems:'center',gap:4,background:'#4DC9A022',border:'1px solid #4DC9A044',borderRadius:10,padding:'2px 8px'}}>
              <span style={{fontSize:11,color:'#4DC9A0',fontWeight:500}}>📋 {syllabusName||'Syllabus'} loaded</span>
              <button onClick={()=>{setSyllabus(null);setSyllabusName(null)}} style={{background:'none',border:'none',color:'#4DC9A0',fontSize:11,padding:0,cursor:'pointer'}}>✕</button>
            </div>
          )}
        </div>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          {isPremium?<Tag text="⭐ Premium" color="#F0A86B"/>:(
            <>
              <div style={{width:70,height:3,background:t.border,borderRadius:4,overflow:'hidden'}}>
                <div style={{width:Math.min((usage/FREE_LIMIT)*100,100)+'%',height:'100%',background:limitHit?t.red:'#7B6EF6',borderRadius:4}}/>
              </div>
              <span style={{fontSize:11,color:limitHit?t.red:t.muted}}>{FREE_LIMIT-usage} left</span>
              <button onClick={onUpgrade} style={{fontSize:10,background:'#7B6EF622',border:'1px solid #7B6EF644',borderRadius:10,color:'#7B6EF6',padding:'2px 7px',fontWeight:600}}>⭐ Pro</button>
            </>
          )}
        </div>
      </div>

      {/* Messages */}
      <div style={{flex:1,overflowY:'auto',padding:'16px 14px'}}>
        {loadingMsgs&&<div style={{textAlign:'center',padding:40}}><div style={{fontSize:24,animation:'pulse 1.5s ease infinite'}}>🧠</div></div>}
        {!loadingMsgs&&messages.length===0&&(
          <div style={{textAlign:'center',padding:'36px 16px',color:t.muted}}>
            <div style={{fontSize:38,marginBottom:10}}>🧠</div>
            <div style={{fontSize:16,fontWeight:600,color:t.text,marginBottom:6}}>Hi {user.user_metadata?.name||user.email.split('@')[0]}!</div>
            <div style={{fontSize:13,lineHeight:1.7,marginBottom:20}}>Ask anything from your syllabus. I'll explain, summarize, or quiz you interactively.</div>
            <div style={{display:'flex',gap:8,justifyContent:'center',flexWrap:'wrap'}}>
              {["Explain Newton's laws","Summarize the water cycle","Quiz me on Photosynthesis"].map(s=>(<button key={s} onClick={()=>setInput(s)} style={{padding:'6px 12px',borderRadius:20,border:`1px solid ${t.border}`,background:'transparent',color:t.muted,fontSize:12}}>{s}</button>))}
            </div>
          </div>
        )}

        {messages.map(m=>(
          <div key={m.id} style={{display:'flex',flexDirection:'column',alignItems:m.role==='user'?'flex-end':'flex-start',marginBottom:14}}>
            {m.role==='ai'&&<div style={{fontSize:11,color:t.muted,marginBottom:4,paddingLeft:2}}>🧠 Memora</div>}
            {/* Hide raw quiz messages - show QuizCard instead */}
            {!(mode==='quiz'&&m.role==='ai'&&m.id===quizMsgId&&currentQuiz)&&(
              <div style={{maxWidth:'85%',padding:'10px 14px',fontSize:14,borderRadius:m.role==='user'?'16px 16px 4px 16px':'16px 16px 16px 4px',background:m.role==='user'?'#7B6EF6':t.card,border:m.role==='ai'?`1px solid ${t.border}`:'none',color:m.role==='user'?'#fff':t.text}}>
                {m.role==='ai'?<Markdown content={m.content} dark={dark}/>:m.content}
              </div>
            )}
            {/* Show quiz card for current quiz question */}
            {m.role==='ai'&&m.id===quizMsgId&&currentQuiz&&(
              <QuizCard quiz={currentQuiz} onAnswer={onQuizAnswer} onNext={onNextQuestion} onEnd={endQuiz} score={quizScore} total={quizTotal} dark={dark}/>
            )}
            {m.role==='ai'&&<button onClick={()=>onSaveNote(m.content)} style={{fontSize:11,color:'#7B6EF6',background:'none',border:'none',padding:'4px 0 0 2px',cursor:'pointer',textAlign:'left'}}>+ Save as note</button>}
          </div>
        ))}

        {(typing||loadingQuiz)&&<div style={{display:'flex',gap:4,alignItems:'center',padding:'10px 14px',background:t.card,border:`1px solid ${t.border}`,borderRadius:'16px 16px 16px 4px',width:'fit-content',marginBottom:14}}>{[0,1,2].map(i=><span key={i} style={{display:'inline-block',width:6,height:6,borderRadius:'50%',background:t.muted,animation:'bounce 1.1s ease infinite',animationDelay:i*0.18+'s'}}/>)}</div>}
        <div ref={bottomRef}/>
      </div>

      {/* Attachment preview */}
      {attachment&&(
        <div style={{padding:'6px 14px',borderTop:`1px solid ${t.border}`,background:t.card2,display:'flex',alignItems:'center',gap:8}}>
          <span style={{fontSize:12,color:'#7B6EF6'}}>📎 {attachment.type==='image'?'Image':'URL'}: {attachment.preview.slice(0,50)}</span>
          <button onClick={()=>setAttachment(null)} style={{background:'none',border:'none',color:t.red,fontSize:14,padding:0}}>✕</button>
        </div>
      )}

      {/* Attach panel */}
      {showAttach&&(
        <div style={{padding:'10px 14px',borderTop:`1px solid ${t.border}`,background:t.card2}}>
          <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
            <input value={urlInput} onChange={e=>setUrlInput(e.target.value)} placeholder="Paste a URL to analyze..." style={{flex:1,minWidth:150,padding:'8px 12px',borderRadius:10,border:`1px solid ${t.border}`,background:t.card,color:t.text,fontSize:13}} onKeyDown={e=>e.key==='Enter'&&addUrl()}/>
            <button onClick={addUrl} style={{padding:'8px 12px',borderRadius:10,border:'none',background:'#7B6EF6',color:'#fff',fontSize:12,fontWeight:600}}>Add</button>
            <button onClick={()=>fileRef.current.click()} style={{padding:'8px 12px',borderRadius:10,border:`1px solid ${t.border}`,background:'transparent',color:t.muted,fontSize:13}}>📷 Image</button>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{display:'none'}}/>
            <button onClick={()=>syllabusRef.current.click()} style={{padding:'8px 12px',borderRadius:10,border:'1px solid #4DC9A044',background:'#4DC9A011',color:'#4DC9A0',fontSize:12,fontWeight:500}}>📋 Syllabus PDF</button>
            <input ref={syllabusRef} type="file" accept=".pdf" onChange={handleSyllabusPDF} style={{display:'none'}}/>
            <button onClick={()=>setShowAttach(false)} style={{background:'none',border:'none',color:t.muted,fontSize:18,padding:0}}>✕</button>
          </div>
        </div>
      )}

      {/* Input */}
      <div style={{padding:'10px 14px 16px',borderTop:`1px solid ${t.border}`,background:t.bg,flexShrink:0}}>
        {limitHit&&<div style={{fontSize:13,color:t.red,background:t.red+'15',border:`1px solid ${t.red}30`,borderRadius:8,padding:'8px 12px',marginBottom:10,textAlign:'center',cursor:'pointer'}} onClick={onUpgrade}>Daily limit reached. <span style={{textDecoration:'underline',fontWeight:600}}>Upgrade to Premium ⭐</span></div>}
        <div style={{display:'flex',gap:6,marginBottom:10,flexWrap:'wrap'}}>
          {modes.map(m=>(<button key={m.id} onClick={()=>setMode(m.id)} style={{padding:'4px 12px',borderRadius:20,border:`1px solid ${mode===m.id?m.color:t.border}`,background:mode===m.id?m.color+'20':'transparent',color:mode===m.id?m.color:t.muted,fontSize:12,fontWeight:mode===m.id?600:400}}>{m.label}</button>))}
        </div>
        <div style={{display:'flex',gap:8}}>
          <button onClick={()=>setShowAttach(!showAttach)} style={{padding:'10px 12px',borderRadius:12,border:`1px solid ${t.border}`,background:showAttach?'#7B6EF622':'transparent',color:showAttach?'#7B6EF6':t.muted,fontSize:16,flexShrink:0}}>📎</button>
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&sendMessage()} placeholder={mode==='quiz'?'Enter topic to start quiz (e.g. Photosynthesis)...':'Ask anything from your syllabus...'} disabled={limitHit} style={{flex:1,padding:'10px 14px',borderRadius:12,border:`1px solid ${t.border}`,background:t.card,color:t.text,fontSize:14}}/>
          <button onClick={()=>sendMessage()} disabled={typing||!input.trim()||limitHit} style={{padding:'10px 18px',borderRadius:12,border:'none',background:typing||!input.trim()||limitHit?t.border:'#7B6EF6',color:'#fff',fontSize:13,fontWeight:600,flexShrink:0,opacity:typing||!input.trim()||limitHit?0.5:1}}>Send</button>
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
  useEffect(()=>{supabase.from('notes').select('*').eq('user_id',user.id).order('created_at',{ascending:false}).then(({data})=>{if(data)setNotes(data);setLoading(false)})},[])
  useEffect(()=>{if(prefill){setForm({title:'AI Response',body:prefill.slice(0,800),tag:'ai'});setShowModal(true);clearPrefill()}},[prefill])
  async function saveNote(){
    if(!form.title.trim()||!form.body.trim())return
    const{data,error}=await supabase.from('notes').insert({user_id:user.id,title:form.title.trim(),body:form.body.trim(),tag:form.tag.trim()||'general'}).select().single()
    if(!error&&data){setNotes(prev=>[data,...prev]);setShowModal(false);setForm({title:'',body:'',tag:''})}
  }
  async function del(id){await supabase.from('notes').delete().eq('id',id);setNotes(prev=>prev.filter(n=>n.id!==id))}
  const tagColors={math:'#F0A86B',physics:'#4DC9A0',ai:'#7B6EF6',chemistry:'#F06B6B',biology:'#6BC9F0',general:t.muted}
  const filtered=filter.trim()?notes.filter(n=>n.title.toLowerCase().includes(filter.toLowerCase())||n.body.toLowerCase().includes(filter.toLowerCase())):notes
  const fld={width:'100%',padding:'9px 12px',borderRadius:10,border:`1px solid ${t.border}`,background:t.card2,color:t.text,fontSize:13}
  return(
    <div style={{display:'flex',flexDirection:'column',height:'100%',overflow:'hidden'}}>
      <div style={{display:'flex',gap:8,padding:'10px 14px',borderBottom:`1px solid ${t.border}`,flexShrink:0}}>
        <input value={filter} onChange={e=>setFilter(e.target.value)} placeholder="Filter notes..." style={{...fld,flex:1}}/>
        <button onClick={()=>{setForm({title:'',body:'',tag:''});setShowModal(true)}} style={{padding:'9px 14px',borderRadius:10,border:'none',background:'#7B6EF6',color:'#fff',fontSize:13,fontWeight:600,whiteSpace:'nowrap',flexShrink:0}}>+ Add</button>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:14}}>
        {loading&&<div style={{textAlign:'center',padding:40,color:t.muted,animation:'pulse 1.5s infinite'}}>Loading...</div>}
        {!loading&&filtered.length===0&&<div style={{textAlign:'center',padding:'40px 16px',color:t.muted}}><div style={{fontSize:32,marginBottom:8}}>📝</div><div style={{fontSize:14}}>{filter?'No matching notes.':'No notes yet.'}</div></div>}
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {filtered.map(n=>(
            <div key={n.id} style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:14,overflow:'hidden'}}>
              <div style={{padding:'12px 14px',cursor:'pointer'}} onClick={()=>setExpanded(expanded===n.id?null:n.id)}>
                <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:4,gap:8}}>
                  <div style={{fontWeight:600,fontSize:14,flex:1,color:t.text}}>{n.title}</div>
                  <div style={{display:'flex',alignItems:'center',gap:6,flexShrink:0}}>
                    <Tag text={n.tag} color={tagColors[n.tag]||'#7B6EF6'}/>
                    <button onClick={e=>{e.stopPropagation();del(n.id)}} style={{fontSize:12,color:t.red,background:'none',border:'none',padding:'2px 6px'}}>✕</button>
                    <span style={{color:t.muted,fontSize:12}}>{expanded===n.id?'▲':'▼'}</span>
                  </div>
                </div>
                {expanded!==n.id&&<div style={{fontSize:13,color:t.muted,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{n.body.replace(/[#*`_]/g,'').slice(0,100)}</div>}
              </div>
              {expanded===n.id&&<div style={{padding:'0 14px 14px',borderTop:`1px solid ${t.border}`}}><div style={{paddingTop:12}}><Markdown content={n.body} dark={dark}/></div></div>}
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
            <div style={{marginBottom:18}}><label style={{fontSize:12,color:t.muted,display:'block',marginBottom:5}}>Content</label><textarea value={form.body} onChange={e=>setForm({...form,body:e.target.value})} placeholder="Write your note here..." rows={5} style={{...fld,resize:'vertical',fontFamily:'monospace'}}/></div>
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
  async function removeWeak(topic){const updated=weakTopics.filter(x=>x!==topic);setWeakTopics(updated);await supabase.from('profiles').update({weak_topics:updated}).eq('user_id',user.id)}
  return(
    <div style={{flex:1,overflowY:'auto',padding:16}}>
      <div style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:14,padding:'14px 16px',marginBottom:14}}>
        <div style={{fontSize:12,color:t.muted,marginBottom:8,fontWeight:600,textTransform:'uppercase',letterSpacing:0.5}}>Your Profile</div>
        {profile?.board?<><div style={{fontSize:15,fontWeight:600,marginBottom:4,color:t.text}}>🎯 {profile.board}</div>{profile.subject&&<div style={{fontSize:13,color:t.muted}}>📚 {profile.subject}</div>}</>:<div style={{fontSize:13,color:t.muted}}>No board selected.</div>}
      </div>
      <div style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:14,padding:'14px 16px',marginBottom:14}}>
        <div style={{fontSize:12,color:t.muted,marginBottom:10,fontWeight:600,textTransform:'uppercase',letterSpacing:0.5}}>⚠️ Weak Topics</div>
        {weakTopics.length===0?<div style={{fontSize:13,color:t.muted}}>No weak topics yet. Get quiz answers wrong and they appear here automatically.</div>:(
          <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
            {weakTopics.map(topic=>(<div key={topic} style={{display:'flex',alignItems:'center',gap:6,background:t.red+'15',border:`1px solid ${t.red}30`,borderRadius:20,padding:'4px 10px'}}><span style={{fontSize:12,color:t.red}}>{topic}</span><button onClick={()=>removeWeak(topic)} style={{background:'none',border:'none',color:t.red,fontSize:12,padding:0}}>✕</button></div>))}
          </div>
        )}
      </div>
      <div style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:14,padding:'14px 16px'}}>
        <div style={{fontSize:12,color:t.muted,marginBottom:10,fontWeight:600,textTransform:'uppercase',letterSpacing:0.5}}>💡 Study Tips</div>
        {['Use Quiz mode to test yourself on weak topics','Upload your college syllabus PDF for exact unit-wise answers','Save AI explanations as notes for quick revision','Use Summarize mode the night before exams','Add URLs of study materials for instant AI summary'].map((tip,i,arr)=>(<div key={i} style={{fontSize:13,color:t.muted,padding:'6px 0',borderBottom:i<arr.length-1?`1px solid ${t.border}`:'none'}}>• {tip}</div>))}
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
          {results.map((r,i)=>(<div key={i} style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:12,padding:'10px 14px'}}><div style={{display:'flex',alignItems:'center',gap:6,marginBottom:5}}><span style={{fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:0.5,color:'#7B6EF6'}}>📝 Note</span>{r.tag&&<Tag text={r.tag} color="#7B6EF6"/>}</div><div style={{fontWeight:600,fontSize:14,marginBottom:4,color:t.text}}>{hl(r.title,q)}</div><div style={{fontSize:13,color:t.muted,lineHeight:1.6}}>{hl(r.snippet,q)}</div></div>))}
        </div>
      </div>
    </div>
  )
}

// ── Sidebar ────────────────────────────────────────────────────────────────
function Sidebar({tab,setTab,user,notes,dark,setDark,onLogout,onUpgrade,isPremium}){
  const t=T(dark)
  const userName=user.user_metadata?.name||user.email.split('@')[0]
  const navItems=[{id:'chat',icon:'💬',label:'Chat'},{id:'notes',icon:'📝',label:'Notes',badge:notes.length},{id:'progress',icon:'📊',label:'Progress'},{id:'search',icon:'🔍',label:'Search'}]
  return(
    <div style={{width:220,height:'100%',background:t.sidebar,borderRight:`1px solid ${t.border}`,display:'flex',flexDirection:'column',flexShrink:0}}>
      <div style={{padding:'20px 16px 16px',borderBottom:`1px solid ${t.border}`}}>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:700,color:t.text}}>🧠 <span style={{color:'#7B6EF6'}}>Memora</span></div>
        <div style={{fontSize:11,color:t.muted,marginTop:2}}>AI Study Companion</div>
      </div>
      <div style={{flex:1,padding:'10px 8px',overflowY:'auto'}}>
        {navItems.map(item=>(<button key={item.id} onClick={()=>setTab(item.id)} style={{width:'100%',padding:'10px 12px',borderRadius:10,border:'none',background:tab===item.id?'#7B6EF622':'transparent',color:tab===item.id?'#7B6EF6':t.muted,fontSize:14,fontWeight:tab===item.id?600:400,display:'flex',alignItems:'center',gap:10,marginBottom:4,transition:'all 0.15s',textAlign:'left'}}><span style={{fontSize:16,width:20,textAlign:'center'}}>{item.icon}</span>{item.label}{item.badge>0&&<span style={{marginLeft:'auto',fontSize:10,background:'#7B6EF622',color:'#7B6EF6',borderRadius:10,padding:'1px 6px',fontWeight:700}}>{item.badge}</span>}</button>))}
        {!isPremium&&(<button onClick={onUpgrade} style={{width:'100%',marginTop:10,padding:'10px 12px',borderRadius:10,border:'1px solid #7B6EF644',background:'linear-gradient(135deg,#7B6EF610,#5A50D410)',color:'#7B6EF6',fontSize:13,fontWeight:600,display:'flex',alignItems:'center',gap:10,textAlign:'left'}}><span style={{fontSize:16}}>⭐</span>Upgrade to Pro</button>)}
        {isPremium&&<div style={{margin:'10px 4px',padding:'8px 12px',borderRadius:10,background:'#F0A86B15',border:'1px solid #F0A86B30',fontSize:12,color:'#F0A86B',fontWeight:600}}>⭐ Premium Active</div>}
      </div>
      <div style={{padding:'10px 8px',borderTop:`1px solid ${t.border}`}}>
        <button onClick={()=>setDark(!dark)} style={{width:'100%',padding:'8px 12px',borderRadius:10,border:`1px solid ${t.border}`,background:'transparent',color:t.muted,fontSize:13,display:'flex',alignItems:'center',gap:10,marginBottom:8}}><span>{dark?'☀️':'🌙'}</span>{dark?'Light Mode':'Dark Mode'}</button>
        <div style={{display:'flex',alignItems:'center',gap:8,padding:'8px 4px'}}>
          <Avatar name={userName} size={30}/>
          <div style={{flex:1,overflow:'hidden'}}>
            <div style={{fontSize:13,fontWeight:600,color:t.text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{userName}</div>
            <button onClick={onLogout} style={{background:'none',border:'none',color:t.muted,fontSize:11,padding:0,cursor:'pointer'}}>Logout</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function BottomTabs({tab,setTab,notes,dark}){
  const t=T(dark)
  const items=[{id:'chat',icon:'💬',label:'Chat'},{id:'notes',icon:'📝',label:'Notes',badge:notes.length},{id:'progress',icon:'📊',label:'Progress'},{id:'search',icon:'🔍',label:'Search'}]
  return(
    <div style={{display:'flex',borderTop:`1px solid ${t.border}`,background:t.sidebar,flexShrink:0}}>
      {items.map(item=>(<button key={item.id} onClick={()=>setTab(item.id)} style={{flex:1,padding:'10px 4px 8px',border:'none',borderTop:`2px solid ${tab===item.id?'#7B6EF6':'transparent'}`,background:'transparent',color:tab===item.id?'#7B6EF6':t.muted,fontSize:10,fontWeight:tab===item.id?600:400,display:'flex',flexDirection:'column',alignItems:'center',gap:2,position:'relative'}}><span style={{fontSize:18}}>{item.icon}</span>{item.label}{item.badge>0&&<span style={{position:'absolute',top:6,right:'calc(50% - 16px)',fontSize:9,background:'#7B6EF6',color:'#fff',borderRadius:10,padding:'1px 4px',fontWeight:700}}>{item.badge}</span>}</button>))}
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
    const h=()=>setMobile(window.innerWidth<768)
    window.addEventListener('resize',h);return()=>window.removeEventListener('resize',h)
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
    if(data){
      setProfile(data)
      setWeakTopics(data.weak_topics||[])
      setIsPremium(data.premium===true) // explicit check
    }else setShowProfileSetup(true)
    setLoading(false)
  }

  async function logout(){await supabase.auth.signOut();setUser(null);setProfile(null);setNotes([]);setTab('chat');setIsPremium(false)}
  function saveFromAI(content){setNotePrefill(content);setTab('notes')}
  function onProfileDone(p){setProfile(p);setShowProfileSetup(false)}
  const t=T(dark)

  if(loading)return <div style={{minHeight:'100vh',background:'#0A0A10',display:'flex',alignItems:'center',justifyContent:'center'}}><style>{getCSS(dark)}</style><div style={{fontSize:40,animation:'pulse 1.5s ease infinite'}}>🧠</div></div>
  if(!user)return <><style>{getCSS(dark)}</style><AuthScreen onAuth={setUser} dark={dark}/></>
  if(showProfileSetup)return <><style>{getCSS(dark)}</style><ProfileSetup user={user} onDone={onProfileDone} dark={dark}/></>

  return(
    <div style={{height:'100vh',display:'flex',flexDirection:'column',background:t.bg,color:t.text,overflow:'hidden'}}>
      <style>{getCSS(dark)}</style>
      {mobile&&(
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 16px',borderBottom:`1px solid ${t.border}`,background:t.sidebar,flexShrink:0}}>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:17,fontWeight:700}}>🧠 <span style={{color:'#7B6EF6'}}>Memora</span></div>
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            {isPremium?<Tag text="⭐ Premium" color="#F0A86B"/>:<button onClick={()=>setShowPremium(true)} style={{fontSize:11,padding:'4px 10px',borderRadius:20,border:'1px solid #7B6EF644',background:'#7B6EF610',color:'#7B6EF6',fontWeight:600}}>⭐ Pro</button>}
            <button onClick={()=>setDark(!dark)} style={{background:'none',border:'none',fontSize:18,padding:0}}>{dark?'☀️':'🌙'}</button>
            <Avatar name={user.user_metadata?.name||user.email.split('@')[0]} size={28}/>
          </div>
        </div>
      )}
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
      {showPremium&&<PremiumModal onClose={()=>setShowPremium(false)} dark={dark} user={user}/>}
    </div>
  )
}
