/**
 * Pomodorotimer.jsx — Redesigned
 * Pomodoro + Break Time tabs. Reverse/Classic toggle. Settings popup.
 * Full-screen expand mode. Start/Pause/Reset controls.
 * Notification banner on timer complete + Auto-start toggle.
 * All original functionality preserved; only UI updated.
 */

import { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { X, Pause, Play, Settings, Maximize2, RotateCcw, CheckCircle2 } from 'lucide-react';
import SlideUpModal from '@/components/ui/SlideUpModal';

// ── Web Audio API chime ────────────────────────────────────────────────────
function playChime() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = 'sine';
  osc.frequency.setValueAtTime(880, ctx.currentTime);
  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 1);
}

const MODES = {
  pomodoro: { label: 'Promodoro', duration: 25 * 60 },
  short:    { label: 'Break Time', duration: 5 * 60 },
};

// ── Settings popup (classic pomodoro durations) ────────────────────────────
function SettingsPopup({ onClose, workMins, breakMins, setWorkMins, setBreakMins }) {
  const { isDark } = useTheme();

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 800,
      display: 'flex', alignItems: 'flex-end',
    }}>
      <div style={{ position: 'absolute', inset: 0, background: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(15,23,42,0.08)' }} onClick={onClose} />
      <div style={{
        position: 'relative', width: '100%',
        background: isDark ? 'rgba(14,14,16,0.97)' : '#ffffff',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px 24px 0 0',
        border: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid #e5e7eb',
        padding: '24px 20px 40px',
        animation: 'slideUp 380ms cubic-bezier(0.34,1.56,0.64,1)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h3 style={{ color: isDark ? '#ffffff' : '#000000', fontSize: 16, fontWeight: 700 }}>Classic Promodoro Settings</h3>
          <button onClick={onClose} style={{ background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.05)', border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X width={12} height={12} strokeWidth={1.8} color={isDark ? 'rgba(255,255,255,0.5)' : '#1C9EF9'} />
          </button>
        </div>
        <DurationRow label="Work Duration" sub="Length of each focus session" value={workMins} onChange={setWorkMins} />
        <DurationRow label="Break Time" sub="Break after each session" value={breakMins} onChange={setBreakMins} />
      </div>
    </div>
  );
}

function DurationRow({ label, sub, value, onChange }) {
  const { isDark } = useTheme();
  const textColor = isDark ? '#ffffff' : '#000000';
  const subColor = isDark ? 'rgba(255,255,255,0.35)' : '#6b7280';
  const buttonBg = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.05)';

  return (
    <div style={{ marginBottom: 20 }}>
      <p style={{ color: textColor, fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{label}</p>
      <p style={{ color: subColor, fontSize: 12, marginBottom: 10 }}>{sub}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={() => onChange(v => Math.max(1, v - 1))}
          style={{ width: 36, height: 36, borderRadius: '50%', background: buttonBg, border: 'none', color: isDark ? '#fff' : '#000', fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >−</button>
        <div style={{ flex: 1, background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.04)', borderRadius: 12, padding: '10px 0', textAlign: 'center' }}>
          <span style={{ color: isDark ? '#ffffff' : '#000000', fontSize: 20, fontWeight: 700 }}>{value}</span>
          <span style={{ color: subColor, fontSize: 12, marginLeft: 6 }}>minutes</span>
        </div>
        <button
          onClick={() => onChange(v => Math.min(120, v + 1))}
          style={{ width: 36, height: 36, borderRadius: '50%', background: buttonBg, border: 'none', color: isDark ? '#fff' : '#000', fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >+</button>
      </div>
    </div>
  );
}

// ── Auto-start toggle row ───────────────────────────────────────────────────
function AutoStartRow({ autoStart, setAutoStart, isDark }) {
  const textColor = isDark ? '#ffffff' : '#000000';
  const subColor = isDark ? 'rgba(255,255,255,0.35)' : '#6b7280';
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 16, borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e5e7eb' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ color: textColor, fontSize: 13, fontWeight: 600 }}>Auto-start</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 18, height: 18, borderRadius: '50%', background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)', color: subColor, fontSize: 11, fontWeight: 700, cursor: 'help', title: 'Automatically starts the next session' }}>ⓘ</span>
      </div>
      <button
        onClick={() => setAutoStart(a => !a)}
        style={{
          width: 44, height: 26, borderRadius: 999, border: 'none', cursor: 'pointer', position: 'relative',
          background: autoStart ? '#1C9EF9' : (isDark ? 'rgba(255,255,255,0.08)' : '#e5e7eb'),
          transition: 'background 200ms ease',
        }}
      >
        
        <span style={{
          position: 'absolute', top: 3, left: 3,
          width: 20, height: 20, borderRadius: '50%', background: '#ffffff',
          transition: 'transform 200ms cubic-bezier(0.34,1.56,0.64,1)',
          transform: autoStart ? 'translateX(18px)' : 'translateX(0)',
          boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
        }} />
      </button>
    </div>
  );
}

// ── Full screen overlay ────────────────────────────────────────────────────
function FullscreenTimer({ mode, running, mm, ss, onClose, onToggle, isDark }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 700,
      background: isDark ? '#000000' : '#ffffff',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'space-between',
      padding: '20px 20px 100px',
      animation: 'fadeIn 200ms ease',
    }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth: 360 }}>
        <div style={{ display: 'flex', background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.04)', borderRadius: 999, padding: 4, gap: 2 }}>
          <span style={{ padding: '6px 16px', borderRadius: 999, background: mode === 'pomodoro' ? (isDark ? '#fff' : '#000000') : 'transparent', color: mode === 'pomodoro' ? (isDark ? '#000' : '#ffffff') : (isDark ? 'rgba(255,255,255,0.4)' : '#6b7280'), fontSize: 13, fontWeight: 600 }}>Promodoro</span>
          <span style={{ padding: '6px 16px', borderRadius: 999, background: mode === 'short' ? (isDark ? '#fff' : '#000000') : 'transparent', color: mode === 'short' ? (isDark ? '#000' : '#ffffff') : (isDark ? 'rgba(255,255,255,0.4)' : '#6b7280'), fontSize: 13, fontWeight: 600 }}>Break Time</span>
        </div>
        <button onClick={onClose} style={{ background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.05)', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <X width={14} height={14} strokeWidth={1.8} color={isDark ? 'rgba(255,255,255,0.6)' : '#6b7280'} />
        </button>
      </div>

      {/* Giant timer */}
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: isDark ? 'rgba(255,255,255,0.3)' : '#6b7280', fontSize: 12, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 16 }}>
          {running ? 'Focusing…' : 'Ready to Focus'}
        </p>
        <span style={{ color: isDark ? '#fff' : '#111827', fontSize: 'clamp(80px, 22vw, 120px)', fontWeight: 900, letterSpacing: '-4px', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
          {mm}:{ss}
        </span>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 16 }}>
        <button
          onClick={onToggle}
          style={{ width: 64, height: 64, borderRadius: '50%', background: isDark ? '#fff' : '#000000', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 150ms ease', boxShadow: isDark ? '0 4px 20px rgba(255,255,255,0.15)' : '0 4px 20px rgba(0,0,0,0.15)' }}
          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
          onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          {running
            ? <Pause width={24} height={24} strokeWidth={2.2} fill={isDark ? '#000' : '#ffffff'} stroke={isDark ? '#000' : '#ffffff'} />
            : <Play width={24} height={24} strokeWidth={2.2} fill={isDark ? '#000' : '#ffffff'} stroke={isDark ? '#000' : '#ffffff'} />
          }
        </button>
      </div>
    </div>
  );
}

// ── Notification banner (slides down from top) ────────────────────────────
function NotificationBanner({ show, message }) {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 999,
      display: show ? 'flex' : 'none', alignItems: 'center', justifyContent: 'center',
      padding: '12px 20px',
      animation: show ? 'slideDown 400ms ease' : 'slideUp 400ms ease',
    }}>
      <div style={{
        background: '#10b981', borderRadius: 12, padding: '12px 16px',
        display: 'flex', alignItems: 'center', gap: 12,
        boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
        maxWidth: '90%',
      }}>
        <CheckCircle2 width={20} height={20} color="#ffffff" strokeWidth={2.2} />
        <span style={{ color: '#ffffff', fontSize: 14, fontWeight: 600 }}>
          {message}
        </span>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export default function PomodoroTimer() {
  const [mode, setMode] = useState('pomodoro');
  const [reverse, setReverse] = useState(true);
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(MODES.pomodoro.duration);
  const [showSettings, setShowSettings] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [workMins, setWorkMins] = useState(15);
  const [breakMins, setBreakMins] = useState(5);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState('');
  const [autoStart, setAutoStart] = useState(false);
  const intervalRef = useRef(null);
  const notificationTimeoutRef = useRef(null);
  const modeRef = useRef(mode);
  const { isDark } = useTheme();

  const colors = isDark
    ? {
        panel: 'rgba(28,28,30,0.8)',
        border: '1px solid rgba(255,255,255,0.06)',
        tabs: 'rgba(255,255,255,0.06)',
        tabText: 'rgba(255,255,255,0.4)',
        tabActive: '#000000',
        controlText: 'rgba(255,255,255,0.4)',
        accent: '#1C9EF9',
        cardBg: 'rgba(28,28,30,0.8)',
        statusText: 'rgba(255,255,255,0.35)',
        buttonBg: '#ffffff',
        buttonBorder: '1px solid rgba(255,255,255,0.08)',
        timerText: '#ffffff',
      }
    : {
        panel: '#ffffff',
        border: '1px solid #e5e7eb',
        tabs: 'rgba(15,23,42,0.04)',
        tabText: '#9ca3af',
        tabActive: '#000000',
        controlText: '#6b7280',
        accent: '#1C9EF9',
        cardBg: '#ffffff',
        statusText: '#6b7280',
        buttonBg: '#ffffff',
        buttonBorder: '1px solid #e5e7eb',
        timerText: '#000000',
      };

  const duration = mode === 'pomodoro' ? workMins * 60 : breakMins * 60;

  useEffect(() => {
    clearInterval(intervalRef.current);
    setRunning(false);
    setSeconds(duration);
  }, [mode, workMins, breakMins]);

  // ── Keep modeRef in sync with mode ──────────────────────────────────────
  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  // ── Handle timer countdown ──────────────────────────────────────────────
  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => {
          if (s <= 0) { clearInterval(intervalRef.current); setRunning(false); return 0; }
          return s - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  // ── Handle notification and auto-start when timer reaches 0 ─────────────
  useEffect(() => {
    if (seconds === 0 && running === false && showNotification === false) {
      // Show notification
      const msg = mode === 'pomodoro'
        ? "Break time! You've earned it."
        : "Break time is over! Ready to focus again!";
      setNotificationMsg(msg);
      setShowNotification(true);
      playChime();

      // Clear existing timeout
      clearTimeout(notificationTimeoutRef.current);

      // Hide notification after 2 seconds and auto-start if enabled
      notificationTimeoutRef.current = setTimeout(() => {
        setShowNotification(false);

        // If auto-start is on, switch mode, reset seconds, and start — all in same callback
        if (autoStart) {
          const nextMode = modeRef.current === 'pomodoro' ? 'short' : 'pomodoro';
          const newDuration = MODES[nextMode].duration;
          setMode(nextMode);
          setSeconds(newDuration);
          setRunning(true);
        }
      }, 2000);
    }

    return () => {
      clearTimeout(notificationTimeoutRef.current);
    };
  }, [seconds, running, mode, autoStart]);

  const displayed = reverse ? duration - seconds : seconds;
  const mm = String(Math.floor(displayed / 60)).padStart(2, '0');
  const ss = String(displayed % 60).padStart(2, '0');

  const handleReset = () => { setRunning(false); setSeconds(duration); };

  return (
    <>
      <style>{`
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes slideDown { from { transform: translateY(-100%); } to { transform: translateY(0); } }
        @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
        @media (prefers-reduced-motion: reduce) {
          .cogni-timer-start { transition: none !important; }
        }
      `}</style>

      <div style={{
        background: colors.panel,
        backdropFilter: 'blur(12px)',
        borderRadius: 20,
        padding: 20,
        border: colors.border,
      }}>
        {/* Auto-start toggle row */}
        <AutoStartRow autoStart={autoStart} setAutoStart={setAutoStart} isDark={isDark} />

        {/* Mode tabs */}
        <div style={{ display: 'flex', background: colors.tabs, borderRadius: 999, padding: 4, marginBottom: 20, gap: 2 }}>
          {Object.entries(MODES).map(([key, { label }]) => (
            <button
              key={key}
              onClick={() => setMode(key)}
              style={{
                flex: 1, fontSize: 13, fontWeight: 600,
                padding: '8px 0', borderRadius: 999, border: 'none', cursor: 'pointer',
                background: mode === key ? '#ffffff' : 'transparent',
                color: mode === key ? '#000000' : colors.tabText,
                transition: 'background 200ms ease, color 200ms ease',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Controls row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          {/* Reverse/Classic toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: colors.controlText, fontSize: 12 }}>Reverse</span>
            <button
              onClick={() => setReverse(r => !r)}
              style={{
                width: 38, height: 22, borderRadius: 999, border: 'none', cursor: 'pointer', position: 'relative',
                background: reverse ? colors.accent : 'rgba(0,0,0,0.08)',
                transition: 'background 200ms ease',
              }}
            >
              <span style={{
                position: 'absolute', top: 3, left: 3,
                width: 16, height: 16, borderRadius: '50%', background: '#ffffff',
                transition: 'transform 200ms cubic-bezier(0.34,1.56,0.64,1)',
                transform: reverse ? 'translateX(16px)' : 'translateX(0)',
                boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
              }} />
            </button>
            <span style={{ color: colors.controlText, fontSize: 12 }}>Classic</span>
          </div>
          {/* Icon actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => setShowSettings(true)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.accent, padding: 4, borderRadius: 8 }}
              title="Settings"
            >
              <Settings width={18} height={18} strokeWidth={1.8} stroke="currentColor" />
            </button>
            <button
              onClick={() => setShowFullscreen(true)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.accent, padding: 4, borderRadius: 8 }}
              title="Fullscreen"
            >
              <Maximize2 width={18} height={18} strokeWidth={1.8} stroke="currentColor" />
            </button>
          </div>
        </div>

        {/* Status */}
        <p style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', color: colors.statusText, textTransform: 'uppercase', marginBottom: 12 }}>
          {running ? 'Focusing…' : 'Ready to Focus'}
        </p>

        {/* Timer */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <span style={{ color: colors.timerText, fontSize: 'clamp(64px, 20vw, 88px)', fontWeight: 900, letterSpacing: '-3px', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
            {mm}:{ss}
          </span>
        </div>

        {/* Buttons */}
        {running ? (
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => setRunning(false)}
              style={{ flex: 1, background: '#fff', color: '#000', border: 'none', borderRadius: 14, padding: '14px 0', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              <Pause width={16} height={16} fill="currentColor" stroke="currentColor" strokeWidth={2} />
              Pause
            </button>
            <button
              onClick={handleReset}
              style={{ width: 50, height: 50, background: isDark ? 'rgba(255,255,255,0.08)' : '#f3f4f6', border: 'none', borderRadius: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <RotateCcw width={18} height={18} strokeWidth={2} color={isDark ? 'rgba(255,255,255,0.7)' : '#6b7280'} />
            </button>
          </div>
        ) : (
          <button
            className="cogni-timer-start"
            onClick={() => setRunning(true)}
            style={{ width: '100%', background: colors.buttonBg, color: '#000', border: colors.buttonBorder, borderRadius: 14, padding: '14px 0', fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'background 150ms ease, transform 150ms ease' }}
            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            Start
          </button>
        )}
      </div>

      {/* Settings popup */}
      {showSettings && (
        <SettingsPopup
          onClose={() => setShowSettings(false)}
          workMins={workMins}
          breakMins={breakMins}
          setWorkMins={setWorkMins}
          setBreakMins={setBreakMins}
        />
      )}

      {/* Fullscreen */}
      {showFullscreen && (
        <FullscreenTimer
          mode={mode}
          running={running}
          mm={mm}
          ss={ss}
          onClose={() => setShowFullscreen(false)}
          onToggle={() => setRunning(r => !r)}
          isDark={isDark}
        />
      )}

      {/* Notification banner */}
      <NotificationBanner show={showNotification} message={notificationMsg} />
    </>
  );
}