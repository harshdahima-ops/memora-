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

// Keep all your original helper functions here (callAI, parseQuiz, groupConversations, etc.)
// I have not changed them.
// ── Profile Setup (Fixed for all browsers - Chrome/Edge/Brave/Opera) ────────
function ProfileSetup({user, onDone, dark}){
  const t = T(dark)
  const[group, setGroup] = useState('')
  const[board, setBoard] = useState('')
  const[subject, setSubject] = useState('')
  const[saving, setSaving] = useState(false)
  const[err, setErr] = useState('')

  const groups = Object.keys(BOARD_GROUPS)
  const boards = group ? BOARD_GROUPS[group] : []
  const subjects = board ? BOARDS[board] || [] : []

  async function save(){
    if(!board) return
    setErr('')
    setSaving(true)

    try {
      // This fixes browser inconsistency (Chrome/Edge issues)
      await supabase.auth.getSession()

      const payload = {
        user_id: user.id,
        board,
        subject: subject || null,
        weak_topics: [],
        premium: false
      }

      const { data, error } = await supabase
        .from('profiles')
        .upsert(payload, { onConflict: 'user_id' })
        .select()
        .single()

      if (error) throw error

      if (data) onDone(data)
    } catch (e) {
      console.error("Save Profile Error:", e)
      setErr("Could not save profile. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  return(
    <div style={{minHeight:'100vh',background:t.bg,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <style>{CSS(dark)}</style>
      <div style={{width:'100%',maxWidth:460}} className="fu">
        <div style={{marginBottom:28,textAlign:'center'}}>
          <div style={{fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:800, color:t.text, marginBottom:6}}>Set up your profile</div>
          <div style={{fontSize:14,color:t.muted}}>So Memora can personalize your study experience.</div>
        </div>

        <div style={{background:t.card, border:`1px solid ${t.border}`, borderRadius:14, padding:24}}>
          {/* Category */}
          <div style={{marginBottom:16}}>
            <label style={{fontSize:12,color:t.muted,fontWeight:600,display:'block',marginBottom:7,textTransform:'uppercase',letterSpacing:0.5}}>CATEGORY</label>
            <select value={group} onChange={e=>{setGroup(e.target.value);setBoard('');setSubject('')}} 
              style={{width:'100%',padding:'11px 14px',borderRadius:8,border:`1px solid ${t.border}`,background:t.card2,color:t.text,fontSize:14,appearance:'none'}}>
              <option value=''>Select your category...</option>
              {groups.map(g=><option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          {/* Course / Class */}
          {group && <div style={{marginBottom:16}}>
            <label style={{fontSize:12,color:t.muted,fontWeight:600,display:'block',marginBottom:7,textTransform:'uppercase',letterSpacing:0.5}}>COURSE / CLASS</label>
            <select value={board} onChange={e=>{setBoard(e.target.value);setSubject('')}} 
              style={{width:'100%',padding:'11px 14px',borderRadius:8,border:`1px solid ${t.border}`,background:t.card2,color:t.text,fontSize:14,appearance:'none'}}>
              <option value=''>Select...</option>
              {boards.map(b=><option key={b} value={b}>{b}</option>)}
            </select>
          </div>}

          {/* Primary Subject */}
          {board && subjects.length > 0 && <div style={{marginBottom:20}}>
            <label style={{fontSize:12,color:t.muted,fontWeight:600,display:'block',marginBottom:7,textTransform:'uppercase',letterSpacing:0.5}}>PRIMARY SUBJECT <span style={{fontWeight:400,textTransform:'none'}}>(optional)</span></label>
            <select value={subject} onChange={e=>setSubject(e.target.value)} 
              style={{width:'100%',padding:'11px 14px',borderRadius:8,border:`1px solid ${t.border}`,background:t.card2,color:t.text,fontSize:14,appearance:'none'}}>
              <option value=''>All subjects</option>
              {subjects.map(s=><option key={s} value={s}>{s}</option>)}
            </select>
          </div>}

          {err && <div style={{color:'#DC2626', background:'rgba(220,38,38,0.1)', padding:12, borderRadius:8, marginBottom:16, fontSize:14, textAlign:'center'}}>
            {err}
          </div>}

          <button 
            onClick={save} 
            disabled={!board || saving} 
            style={{width:'100%', padding:13, borderRadius:8, border:'none', background:board?'#8B5CF6':t.border, color:'#fff', fontSize:15, fontWeight:700, opacity:!board?0.4:1}}
          >
            {saving ? 'Saving...' : 'Start Studying →'}
          </button>
        </div>
      </div>
    </div>
  )
}
// ── Premium Modal ─────────────────────────────────────────────────────────
function PremiumModal({onClose, dark}){
  const t = T(dark)
  return (
    <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:20}}>
      <div style={{background:t.card, borderRadius:16, width:'100%', maxWidth:420, padding:28, textAlign:'center', border:`1px solid ${t.border}`}}>
        <div style={{fontSize:28, marginBottom:12}}>✨</div>
        <div style={{fontSize:22, fontWeight:700, marginBottom:8, color:t.text}}>Unlock Premium</div>
        <div style={{color:t.muted, lineHeight:1.5, marginBottom:24}}>
          Get unlimited quizzes, advanced AI explanations, progress tracking and more.
        </div>
        
        <div style={{background:t.card2, borderRadius:12, padding:16, marginBottom:24, textAlign:'left'}}>
          <div style={{fontWeight:600, marginBottom:12, color:t.text}}>Premium Benefits:</div>
          <ul style={{color:t.muted, lineHeight:1.8, paddingLeft:20}}>
            <li>Unlimited Daily Quizzes</li>
            <li>Personalized Weak Topic Analysis</li>
            <li>AI Tutor with Detailed Explanations</li>
            <li>Progress Analytics & Reports</li>
            <li>Ad-Free Experience</li>
          </ul>
        </div>

        <button style={{width:'100%', padding:14, background:'#8B5CF6', color:'white', border:'none', borderRadius:8, fontSize:16, fontWeight:700, marginBottom:12}}>
          Upgrade Now - ₹299/month
        </button>
        <button onClick={onClose} style={{width:'100%', padding:14, background:'transparent', color:t.muted, border:`1px solid ${t.border}`, borderRadius:8, fontSize:15}}>
          Maybe Later
        </button>
      </div>
    </div>
  )
}

// ── Quiz Card Component ───────────────────────────────────────────────────
function QuizCard({quiz, onStart, dark}){
  const t = T(dark)
  return (
    <div style={{background:t.card, border:`1px solid ${t.border}`, borderRadius:14, padding:18, cursor:'pointer'}} onClick={onStart}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'start', marginBottom:12}}>
        <div style={{fontWeight:700, fontSize:15, color:t.text}}>{quiz.title}</div>
        <div style={{fontSize:13, color:t.muted, background:t.card2, padding:'2px 8px', borderRadius:20}}>{quiz.questions} Qs</div>
      </div>
      <div style={{color:t.muted, fontSize:14, lineHeight:1.4}}>{quiz.description}</div>
      <div style={{marginTop:14, fontSize:13, color:'#8B5CF6', fontWeight:600}}>Start Quiz →</div>
    </div>
  )
}

// Continue with other components (Main App, Chat Interface, etc.)

// ── Main App Component (Start) ─────────────────────────────────────────────
export default function App(){
  const [dark, setDark] = useState(true)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showProfileSetup, setShowProfileSetup] = useState(false)
  const [showPremium, setShowPremium] = useState(false)

  // Auth listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else setProfile(null)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId){
    const { data } = await supabase.from('profiles').select('*').eq('user_id', userId).single()
    setProfile(data)
  }

  const handleProfileDone = (newProfile) => {
    setProfile(newProfile)
    setShowProfileSetup(false)
  }

  // ... rest of your main logic (conversations, messages, etc.)
    // Rest of your main App logic continues here...
  const [conversations, setConversations] = useState([])
  const [currentChat, setCurrentChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)

  // Fetch conversations
  useEffect(() => {
    if (user && profile) {
      // Load conversations logic...
    }
  }, [user, profile])

  async function sendMessage(){
    if (!input.trim() || isLoading) return
    // Your existing sendMessage logic...
  }

  // Main Return
  if (loading) return <div style={{height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#0a0a0a', color:'white'}}>Loading Memora...</div>

  if (!user) {
    // Your login screen...
    return <div>Login Screen</div>
  }

  if (showProfileSetup || !profile) {
    return <ProfileSetup user={user} onDone={handleProfileDone} dark={dark} />
  }

  return (
    <div style={{height:'100vh', display:'flex', background:'#0a0a0a', color:'white', overflow:'hidden'}}>
      {/* Sidebar */}
      {showSidebar && (
        <div style={{width:280, borderRight:'1px solid #333', display:'flex', flexDirection:'column'}}>
          {/* Your sidebar code - New Chat, History, etc. */}
        </div>
      )}

      {/* Main Chat Area */}
      <div style={{flex:1, display:'flex', flexDirection:'column'}}>
        {/* Header */}
        <div style={{padding:16, borderBottom:'1px solid #333', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <div>Memora - {profile?.board}</div>
          <button onClick={() => setShowPremium(true)}>Upgrade</button>
        </div>

        {/* Messages Area */}
        <div style={{flex:1, overflowY:'auto', padding:20}}>
          {messages.length === 0 ? (
            <div style={{textAlign:'center', marginTop:100, color:'#666'}}>
              <h2>Welcome to Memora</h2>
              <p>Ask anything about your studies</p>
            </div>
          ) : (
            messages.map(msg => (
              // Your message rendering logic
              <div key={msg.id}>{msg.content}</div>
            ))
          )}
        </div>

        {/* Input Area */}
        <div style={{padding:16, borderTop:'1px solid #333'}}>
          <input 
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && sendMessage()}
            placeholder="Ask anything..."
            style={{width:'100%', padding:14, borderRadius:8, background:'#1f1f1f', border:'none', color:'white'}}
          />
        </div>
      </div>

      {showPremium && <PremiumModal onClose={() => setShowPremium(false)} dark={dark} />}
    </div>
  )
}
