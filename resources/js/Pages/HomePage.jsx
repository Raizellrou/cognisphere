/**
 * HomePage.jsx — CogniSphere
 * Scroll-driven feature showcase with sticky left column + snap cards
 * Brand: #1C9EF9 blue accent, #000 text, #fff background
 */

import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame } from 'lucide-react';
import CogniLogo from '@/assets/CogniLogo.png';

// ── Inline SVG icons ──────────────────────────────────────────────────────────
const TimerIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="13" r="8"/>
    <path d="M12 9v4l2.5 2.5"/>
    <path d="M9 3h6M12 3v2"/>
  </svg>
);

const ChartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 20h18"/>
    <path d="M7 16V9"/>
    <path d="M12 16V4"/>
    <path d="M17 16v-5"/>
  </svg>
);

const CalendarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <path d="M16 2v4M8 2v4M3 10h18"/>
  </svg>
);

const MusicIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18V5l12-2v13"/>
    <circle cx="6" cy="18" r="3"/>
    <circle cx="18" cy="16" r="3"/>
  </svg>
);

const AIIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a4 4 0 0 1 4 4v1h1a3 3 0 0 1 0 6h-1v1a4 4 0 0 1-8 0v-1H7a3 3 0 0 1 0-6h1V6a4 4 0 0 1 4-4z"/>
    <circle cx="9" cy="9" r="1" fill="currentColor"/>
    <circle cx="15" cy="9" r="1" fill="currentColor"/>
  </svg>
);

// ── Feature data ──────────────────────────────────────────────────────────────
const FEATURES = [
  {
    id: 'timer',
    icon: <TimerIcon />,
    heading: 'Focus timer, your way.',
    body: 'Classic Pomodoro or Reverse — start with a break, earn your work time. Switch modes to match your mood and eliminate the anxiety of starting.',
  },
  {
    id: 'streak',
    icon: <ChartIcon />,
    heading: 'Build your streak.',
    body: 'Track your daily focus streaks and watch your consistency grow. Each session counts toward your streak — maintain your momentum and never break the chain.',
  },
  {
    id: 'calendar',
    icon: <CalendarIcon />,
    heading: 'Your study plan, on a calendar.',
    body: 'An integrated monthly calendar with drag-and-drop tasks. Map topics to dates, track what you\'ve covered, and never lose sight of what\'s left.',
  },
  {
    id: 'music',
    icon: <MusicIcon />,
    heading: 'Study music, built in.',
    body: 'Curated lo-fi and focus music streams play right inside the app. No tab switching, no distractions — everything in one focused workspace.',
  },
  {
    id: 'ai',
    icon: <AIIcon />,
    heading: 'AI study partner.',
    body: 'Ask anything, get instant explanations, and clarify concepts without leaving your session. Your personal tutor, always on standby.',
  },
];

// ── Demo Cards ────────────────────────────────────────────────────────────────

function TimerCard() {
  const [mode, setMode] = useState('reverse');
  const [seconds, setSeconds] = useState(300);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => {
          if (s <= 1) { clearInterval(intervalRef.current); setRunning(false); return 0; }
          return s - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const reset = () => { setRunning(false); setSeconds(mode === 'classic' ? 1500 : 300); };
  const switchMode = (m) => { setMode(m); setRunning(false); setSeconds(m === 'classic' ? 1500 : 300); };
  const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
  const secs = String(seconds % 60).padStart(2, '0');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '24px', padding: '32px', minHeight: 'auto' }}>
      <div style={{ display: 'flex', gap: '12px' }}>
        {['classic', 'reverse'].map(m => (
          <button key={m} onClick={() => switchMode(m)} style={{
            padding: '8px 20px', borderRadius: '999px', border: '1.5px solid',
            borderColor: mode === m ? '#1C9EF9' : '#e5e7eb',
            background: mode === m ? '#EFF8FF' : 'white',
            color: mode === m ? '#1C9EF9' : '#6b7280',
            fontWeight: 600, fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s',
            textTransform: 'uppercase', letterSpacing: '0.05em'
          }}>
            {m}
          </button>
        ))}
      </div>

      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 'clamp(48px, 12vw, 72px)', fontWeight: 800, letterSpacing: '-2px', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
          {mins}<span style={{ color: '#1C9EF9' }}>:</span>{secs}
        </div>
        <div style={{ fontSize: '13px', color: '#9ca3af', marginTop: '8px' }}>
          {mode === 'classic' ? 'Work → Break' : 'Break → Work'}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <button onClick={() => setRunning(r => !r)} style={{
          padding: '10px 28px', borderRadius: '999px', border: 'none',
          background: '#1C9EF9', color: 'white', fontWeight: 600, fontSize: '14px',
          cursor: 'pointer', transition: 'opacity 0.2s'
        }} onMouseOver={e => e.target.style.opacity = 0.85} onMouseOut={e => e.target.style.opacity = 1}>
          {running ? 'Pause' : 'Start'}
        </button>
        <button onClick={reset} style={{
          padding: '10px 20px', borderRadius: '999px',
          border: '1.5px solid #e5e7eb', background: 'white', color: '#374151',
          fontWeight: 500, fontSize: '14px', cursor: 'pointer'
        }}>Reset</button>
      </div>
    </div>
  );
}

function StreakCard() {
  const [streak, setStreak] = useState(42);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '20px', padding: 'clamp(16px, 4vw, 32px)', minHeight: 'auto' }}>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        .flame-icon { animation: float 3s ease-in-out infinite; }
      `}</style>

      {/* Flame Icon with floating animation */}
      <div className="flame-icon">
        <Flame width={80} height={80} strokeWidth={1.8} color="#1c9ef9" />
      </div>

      {/* Streak Count */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 'clamp(48px, 12vw, 72px)', fontWeight: 900, color: '#1c9ef9', lineHeight: 1 }}>
          {streak}
        </div>
        <div style={{ fontSize: '16px', color: '#6b7280', marginTop: '8px', fontWeight: 600 }}>
          Day Streak
        </div>
      </div>

      {/* Motivational message */}
      <p style={{ fontSize: '13px', color: '#9ca3af', textAlign: 'center', maxWidth: '280px', lineHeight: 1.6 }}>
        Keep the fire burning! One more day of focus maintains your streak.
      </p>

      {/* Last session info */}
      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '12px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#1C9EF9' }}>127</div>
          <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>Total Sessions</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#1C9EF9' }}>84h 23m</div>
          <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>Focus Time</div>
        </div>
      </div>
    </div>
  );
}


function CalendarCard() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const monthName = today.toLocaleString('default', { month: 'long' });
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayDate = today.getDate();
  const activeDays = new Set([3, 7, 10, 12, 15, 18, 22, 25, 27]);
  const dayLabels = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: 'clamp(16px, 4vw, 32px)', minHeight: 'auto' }}>
      <div style={{ width: '100%', maxWidth: '340px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <span style={{ fontWeight: 700, fontSize: '16px' }}>{monthName} {year}</span>
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center', fontSize: '12px', color: '#9ca3af' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#1C9EF9', minWidth: '8px' }} />
            <span>Session logged</span>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', textAlign: 'center' }}>
          {dayLabels.map(d => (
            <div key={d} style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 600, padding: '4px 0', letterSpacing: '0.05em' }}>{d}</div>
          ))}
          {cells.map((day, i) => (
            <div key={i} style={{ position: 'relative', padding: '6px 2px', display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '40px' }}>
              {day && (
                <>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    background: day === todayDate ? '#1C9EF9' : 'transparent',
                    color: day === todayDate ? 'white' : '#111',
                    fontWeight: day === todayDate ? 700 : 400,
                    fontSize: '13px'
                  }}>{day}</div>
                  {activeDays.has(day) && (
                    <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#1C9EF9', marginTop: '2px' }} />
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MusicCard() {
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const tracks = [
    { title: 'Lo-fi Study Beats', mood: 'Calm & Focused', dur: '∞' },
    { title: 'Deep Focus Flow', mood: 'Concentration', dur: '∞' },
    { title: 'Chill Ambient', mood: 'Relaxed', dur: '∞' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: 'clamp(16px, 4vw, 32px)', gap: '20px', minHeight: 'auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '8px' }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: '#1C9EF9', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Now Playing</div>
        <div style={{ fontSize: 'clamp(18px, 5vw, 22px)', fontWeight: 700 }}>{tracks[current].title}</div>
        <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>{tracks[current].mood}</div>
      </div>

      {/* Waveform visualizer */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '3px', height: '40px' }}>
        {Array.from({ length: 24 }, (_, i) => {
          const h = playing ? 6 + Math.abs(Math.sin(i * 0.8)) * 30 : 6;
          return (
            <div key={i} style={{
              width: '4px', height: `${h}px`, borderRadius: '2px',
              background: playing ? `rgba(28, 158, 249, ${0.4 + Math.abs(Math.sin(i * 0.5)) * 0.6})` : '#e5e7eb',
              transition: 'all 0.5s ease', animationDuration: '0.8s', minWidth: '4px'
            }} />
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button onClick={() => setCurrent(c => (c - 1 + tracks.length) % tracks.length)} style={{ background: 'none', border: '1.5px solid #e5e7eb', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', fontSize: '14px', minWidth: '36px' }}>‹</button>
        <button onClick={() => setPlaying(p => !p)} style={{
          background: '#1C9EF9', border: 'none', borderRadius: '50%', width: '48px', height: '48px',
          cursor: 'pointer', color: 'white', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '48px'
        }}>{playing ? '⏸' : '▶'}</button>
        <button onClick={() => setCurrent(c => (c + 1) % tracks.length)} style={{ background: 'none', border: '1.5px solid #e5e7eb', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', fontSize: '14px', minWidth: '36px' }}>›</button>
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {tracks.map((t, i) => (
          <button key={i} onClick={() => { setCurrent(i); setPlaying(true); }} style={{
            padding: '4px 10px', borderRadius: '999px', border: '1.5px solid',
            borderColor: current === i ? '#1C9EF9' : '#e5e7eb',
            background: current === i ? '#EFF8FF' : 'white',
            color: current === i ? '#1C9EF9' : '#6b7280',
            fontSize: '11px', fontWeight: 500, cursor: 'pointer'
          }}>{t.title.split(' ')[0]}</button>
        ))}
      </div>
    </div>
  );
}

function AICard() {
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hi! Ask me anything about your study material.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesRef = useRef(null);

  const quickQuestions = ['What is osmosis?', 'Explain the Krebs cycle', 'What causes action potentials?'];

  const send = async (text) => {
    if (!text.trim() || loading) return;
    const userMsg = { role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: 'You are a concise study assistant for students. Answer in 2-3 sentences max.',
          messages: [{ role: 'user', content: text }]
        })
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || 'Sorry, I couldn\'t get a response.';
      setMessages(prev => [...prev, { role: 'ai', text: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: 'Connection error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (messagesRef.current) messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [messages, loading]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 'clamp(16px, 4vw, 24px)', gap: '12px', minHeight: 'auto' }}>
      <div ref={messagesRef} style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingBottom: '8px' }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
            maxWidth: '80%', padding: '10px 14px', borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
            background: m.role === 'user' ? '#1C9EF9' : '#f3f4f6',
            color: m.role === 'user' ? 'white' : '#111', fontSize: '13px', lineHeight: 1.5, wordWrap: 'break-word'
          }}>{m.text}</div>
        ))}
        {loading && (
          <div style={{ alignSelf: 'flex-start', padding: '10px 14px', borderRadius: '16px 16px 16px 4px', background: '#f3f4f6', fontSize: '13px', color: '#9ca3af' }}>
            Thinking<span style={{ animation: 'pulse 1s infinite' }}>...</span>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {quickQuestions.map((q, i) => (
          <button key={i} onClick={() => send(q)} style={{
            padding: '4px 10px', borderRadius: '999px', border: '1.5px solid #e5e7eb',
            background: 'white', color: '#374151', fontSize: '11px', cursor: 'pointer', fontWeight: 500
          }}>{q}</button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send(input)}
          placeholder="Ask anything..."
          style={{
            flex: 1, padding: '10px 14px', borderRadius: '999px', border: '1.5px solid #e5e7eb',
            fontSize: '13px', outline: 'none', fontFamily: 'inherit'
          }}
        />
        <button onClick={() => send(input)} style={{
          padding: '10px 18px', borderRadius: '999px', border: 'none',
          background: '#1C9EF9', color: 'white', fontWeight: 600, fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap'
        }}>Send</button>
      </div>
    </div>
  );
}

const CARDS = [TimerCard, StreakCard, CalendarCard, MusicCard, AICard];

// ── Main Component ────────────────────────────────────────────────────────────
export default function HomePage() {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const cardRefs = useRef([]);
  const sectionRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const observers = cardRefs.current.map((ref, i) => {
      if (!ref) return null;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveIndex(i); },
        { threshold: 0.5, rootMargin: '-10% 0px -10% 0px' }
      );
      obs.observe(ref);
      return obs;
    });
    return () => observers.forEach(o => o?.disconnect());
  }, []);

  const scrollToCard = (i) => {
    cardRefs.current[i]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div style={{ background: '#fff', color: '#000', minHeight: '100vh', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { font-family: 'DM Sans', sans-serif; }
        h1,h2,h3 { font-family: 'Playfair Display', serif; }
        @keyframes fadeInUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .hero-btn:hover { opacity: 0.88 !important; transform: translateY(-1px); }
        .hero-btn { transition: all 0.2s ease !important; }
        .stat-card { transition: transform 0.2s, box-shadow 0.2s; }
        .stat-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(28,158,249,0.12) !important; }
        
        /* Mobile Responsive */
        @media (max-width: 1024px) {
          .features-section { gap: 24px !important; }
          .sticky-left { width: 100% !important; position: static !important; top: auto !important; height: auto !important; padding-bottom: 0 !important; margin-bottom: 32px !important; }
          .card-section { height: auto !important; min-height: 350px !important; max-height: none !important; }
        }
        
        @media (max-width: 768px) {
          .features-section { flex-direction: column !important; gap: 16px !important; }
          .sticky-left { 
            width: 100% !important; 
            position: static !important; 
            top: auto !important; 
            height: auto !important; 
            padding-bottom: 0 !important; 
            margin-bottom: 24px !important;
          }
          .card-section { 
            height: auto !important; 
            min-height: 320px !important; 
            max-height: none !important;
          }
          .feature-item-inactive { opacity: 1 !important; color: #6b7280 !important; }
          .hero-title { font-size: 40px !important; line-height: 1.1 !important; }
          .hero-sub { font-size: 14px !important; }
          .nav-links { display: none !important; }
          .dots-nav { bottom: 16px !important; }
          .stat-card { padding: 16px 20px !important; }
          .stat-card .value { font-size: 16px !important; }
        }
        
        @media (max-width: 480px) {
          .hero-title { font-size: 28px !important; line-height: 1.2 !important; letter-spacing: -1px !important; }
          .hero-sub { font-size: 13px !important; }
          .hero-btn { padding: 12px 20px !important; font-size: 13px !important; }
          .feature-item-inactive { opacity: 1 !important; }
          .sticky-left { margin-bottom: 16px !important; }
          .sticky-left button { padding: 12px 0 !important; }
          .sticky-left h3 { font-size: 18px !important; }
          .dots-nav { display: flex !important; gap: 6px !important; }
          .card-section { min-height: 300px !important; border-radius: 12px !important; }
          .stat-card { padding: 12px 16px !important; }
          .stat-card .value { font-size: 14px !important; }
          nav { padding: 0 12px !important; }
          nav .hero-btn { padding: 6px 14px !important; font-size: 12px !important; }
        }
      `}</style>

      {/* ── Navbar ── */}
      <nav style={{
        borderBottom: '1px solid #f0f0f0', position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img src={CogniLogo} alt="CogniSphere" style={{ width: '32px', height: '32px' }} />
            <span style={{ fontWeight: 700, fontSize: '17px', fontFamily: "'DM Sans', sans-serif" }}>CogniSphere</span>
          </div>

          <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            {['Home', 'About', 'Privacy', 'Terms'].map(link => (
              <button key={link} onClick={() => link === 'Home' ? window.scrollTo({ top: 0, behavior: 'smooth' }) : navigate(`/${link.toLowerCase()}`)}
                style={{
                  background: 'none', border: link === 'Home' ? '1px solid #000' : 'none',
                  padding: link === 'Home' ? '4px 12px' : '0', borderRadius: '6px',
                  fontSize: '14px', fontWeight: 500, cursor: 'pointer', color: '#000',
                  fontFamily: "'DM Sans', sans-serif"
                }}>
                {link}
              </button>
            ))}
          </div>

          <button onClick={() => navigate('/dashboard')} className="hero-btn" style={{
            background: '#1C9EF9', color: 'white', border: 'none',
            padding: '8px 20px', borderRadius: '8px', fontWeight: 600,
            fontSize: '14px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif"
          }}>Open App</button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: 'clamp(40px, 10vw, 80px) 24px clamp(36px, 8vw, 72px)', textAlign: 'center' }}>
        <div style={{ animation: 'fadeInUp 0.7s ease both' }}>
          <div style={{ display: 'inline-block', background: '#EFF8FF', color: '#1C9EF9', borderRadius: '999px', padding: '5px 14px', fontSize: '13px', fontWeight: 600, marginBottom: '28px', letterSpacing: '0.04em' }}>
            ✦ Free forever · Start Now ✦
          </div>

          <h1 className="hero-title" style={{ fontSize: 'clamp(32px, 8vw, 72px)', lineHeight: 1.05, letterSpacing: '-2px', marginBottom: '24px', fontFamily: "'Playfair Display', serif" }}>
            Deep focus,<br /><em>every session.</em>
          </h1>

          <p className="hero-sub" style={{ fontSize: 'clamp(13px, 4vw, 18px)', color: '#6b7280', maxWidth: '520px', margin: '0 auto 40px', lineHeight: 1.6 }}>
            The all-in-one study workspace built for board reviewers, students, and anyone doing serious focused work.
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/dashboard')} className="hero-btn" style={{
              background: '#1C9EF9', color: 'white', border: 'none',
              padding: '14px 32px', borderRadius: '999px', fontWeight: 700,
              fontSize: '15px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
              display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              Start focusing for free →
            </button>
            <button onClick={() => sectionRef.current?.scrollIntoView({ behavior: 'smooth' })} className="hero-btn" style={{
              background: 'white', color: '#000', border: '1.5px solid #e5e7eb',
              padding: '14px 32px', borderRadius: '999px', fontWeight: 600,
              fontSize: '15px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif"
            }}>
              See how it works
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '64px', flexWrap: 'wrap', animation: 'fadeInUp 0.9s 0.2s ease both' }}>
          {[
            { value: '5 tools', label: 'In one place' },
            { value: 'Free forever', label: 'No paywalls, ever' },
            { value: 'Browser-based', label: 'No download needed' },
          ].map((s, i) => (
            <div key={i} className="stat-card" style={{
              background: 'white', border: '1.5px solid #f0f0f0', borderRadius: '16px',
              padding: '20px 32px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
            }}>
              <div className="value" style={{ fontSize: '20px', fontWeight: 800, color: '#000', fontFamily: "'DM Sans', sans-serif" }}>{s.value}</div>
              <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px', fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Feature Showcase ── */}
      <section ref={sectionRef} style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px clamp(40px, 10vw, 80px)' }}>
        <div className="features-section" style={{ display: 'flex', gap: '48px', alignItems: 'flex-start' }}>

          {/* Left sticky column */}
          <div className="sticky-left" style={{
            width: '40%', flexShrink: 0,
            position: 'sticky', top: '80px',
            height: 'calc(100vh - 120px)',
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            paddingBottom: '40px'
          }}>
            {FEATURES.map((feat, i) => (
              <button key={feat.id} onClick={() => scrollToCard(i)} style={{
                background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
                padding: '20px 0', borderLeft: `3px solid ${activeIndex === i ? '#1C9EF9' : 'transparent'}`,
                paddingLeft: '20px', transition: 'all 0.3s ease',
                opacity: activeIndex === i ? 1 : 0.25,
                marginBottom: '4px'
              }} className={activeIndex !== i ? 'feature-item-inactive' : ''}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px',
                  color: activeIndex === i ? '#1C9EF9' : '#6b7280',
                  transition: 'color 0.3s ease'
                }}>
                  {feat.icon}
                  <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                <h3 style={{
                  fontSize: '22px', fontWeight: 800, lineHeight: 1.2, marginBottom: '8px',
                  color: '#000', fontFamily: "'Playfair Display', serif",
                  transition: 'opacity 0.3s ease'
                }}>{feat.heading}</h3>
                <p style={{
                  fontSize: '14px', color: '#6b7280', lineHeight: 1.6,
                  transition: 'opacity 0.3s ease',
                  display: activeIndex === i ? 'block' : 'none'
                }}>{feat.body}</p>
              </button>
            ))}

            {/* Dots navigation */}
            <div className="dots-nav" style={{ display: 'flex', gap: '8px', marginTop: '20px', paddingLeft: '20px' }}>
              {FEATURES.map((_, i) => (
                <button key={i} onClick={() => scrollToCard(i)} style={{
                  width: activeIndex === i ? '24px' : '8px',
                  height: '8px', borderRadius: '999px', border: 'none',
                  background: activeIndex === i ? '#1C9EF9' : '#d1d5db',
                  cursor: 'pointer', transition: 'all 0.3s ease', padding: 0
                }} />
              ))}
            </div>
          </div>

          {/* Right scrolling cards */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '32px', paddingTop: '40px', paddingBottom: '40px' }}>
            {FEATURES.map((feat, i) => {
              const CardComp = CARDS[i];
              return (
                <div
                  key={feat.id}
                  ref={el => cardRefs.current[i] = el}
                  className="card-section"
                  style={{
                    height: '70vh', minHeight: '460px', maxHeight: '600px',
                    background: 'white', borderRadius: '20px',
                    border: `1.5px solid ${activeIndex === i ? '#1C9EF9' : '#f0f0f0'}`,
                    boxShadow: activeIndex === i
                      ? '0 8px 40px rgba(28,158,249,0.12)'
                      : '0 2px 12px rgba(0,0,0,0.04)',
                    transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
                    overflow: 'hidden'
                  }}
                >
                  <CardComp />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section style={{ borderTop: '1px solid #f0f0f0', padding: 'clamp(40px, 10vw, 100px) 24px', textAlign: 'center', background: '#FAFBFF' }}>
        <h2 style={{ fontSize: 'clamp(32px, 8vw, 54px)', fontWeight: 900, letterSpacing: '-1.5px', marginBottom: '24px', fontFamily: "'Playfair Display', serif" }}>
          Your best session<br />starts now.
        </h2>
        <p style={{ fontSize: 'clamp(14px, 3vw, 16px)', color: '#6b7280', maxWidth: '400px', margin: '0 auto 40px', lineHeight: 1.6 }}>
          No account needed. No download required. Just open and focus.
        </p>
        <button onClick={() => navigate('/dashboard')} className="hero-btn" style={{
          background: '#1C9EF9', color: 'white', border: 'none',
          padding: '16px 40px', borderRadius: '999px', fontWeight: 700,
          fontSize: '16px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif"
        }}>
          Start focusing for free →
        </button>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: '1px solid #f0f0f0', padding: '40px 24px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '16px' }}>
          <img src={CogniLogo} alt="CogniSphere" style={{ width: '24px', height: '24px' }} />
          <span style={{ fontWeight: 700, fontSize: '15px' }}>CogniSphere</span>
        </div>
        <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '16px' }}>
          {['Home', 'About', 'Privacy', 'Terms'].map(link => (
            <button key={link} onClick={() => link === 'Home' ? window.scrollTo({ top: 0, behavior: 'smooth' }) : navigate(`/${link.toLowerCase()}`)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: '13px', fontFamily: "'DM Sans', sans-serif" }}>
              {link}
            </button>
          ))}
        </div>
        <p style={{ fontSize: '12px', color: '#9ca3af' }}>© {new Date().getFullYear()} CogniSphere. All rights reserved.</p>
      </footer>
    </div>
  );
}
