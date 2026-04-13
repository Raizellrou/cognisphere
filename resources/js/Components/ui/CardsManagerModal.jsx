/**
 * CardsManagerModal.jsx — Fixed
 * Slide-up bottom sheet to toggle dashboard card visibility.
 * Props: isOpen, onClose, visibleCards, toggleCard, isLastVisible
 */

import { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { Clock, Calendar, Flame, Music2, Eye, EyeOff, X } from 'lucide-react';

const CARD_LIST = [
  { key: 'pomodoro', label: 'Pomodoro', icon: <Clock width={20} height={20} strokeWidth={1.8} /> },
  { key: 'calendar', label: 'Calendar', icon: <Calendar width={20} height={20} strokeWidth={1.8} /> },
  { key: 'streak', label: 'Streak', icon: <Flame width={20} height={20} strokeWidth={1.8} /> },
  { key: 'countdown', label: 'Countdown', icon: <Clock width={20} height={20} strokeWidth={1.8} /> },
  { key: 'music', label: 'Music', icon: <Music2 width={20} height={20} strokeWidth={1.8} /> },
];

export default function CardsManagerModal({
  isOpen,
  onClose,
  visibleCards = {},          // ← safe default: never undefined
  toggleCard   = () => {},
  isLastVisible = () => false,
}) {
  const { isDark } = useTheme();
  const [visible,   setVisible]   = useState(false);
  const [animating, setAnimating] = useState(false);
  const [popping,   setPopping]   = useState(null);
  const startYRef = useRef(null);

  // Open/close animation
  useEffect(() => {
    if (isOpen) {
      setAnimating(true);
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    } else {
      setVisible(false);
      const t = setTimeout(() => setAnimating(false), 320);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // ESC key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => onClose(), 320);
  };

  // Swipe down to close
  const handleTouchStart = (e) => { startYRef.current = e.touches[0].clientY; };
  const handleTouchEnd   = (e) => {
    if (startYRef.current === null) return;
    const delta = e.changedTouches[0].clientY - startYRef.current;
    if (delta > 80) handleClose();
    startYRef.current = null;
  };

  const handleToggle = (key) => {
    if (isLastVisible(key)) return;
    setPopping(key);
    setTimeout(() => setPopping(null), 200);
    toggleCard(key);
  };

  if (!animating) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 8999,
          background: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.35)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          opacity: visible ? 1 : 0,
          transition: 'opacity 200ms ease',
        }}
      />

      {/* Sheet */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{
          position: 'fixed',
          left: 0, right: 0, bottom: 0,
          zIndex: 9000,
          height: '85dvh',
          background: isDark ? '#1C1C1E' : '#ffffff',
          borderRadius: '20px 20px 0 0',
          borderTop: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid #e5e7eb',
          display: 'flex',
          flexDirection: 'column',
          transform: visible ? 'translateY(0)' : 'translateY(100%)',
          transition: visible
            ? 'transform 400ms cubic-bezier(0.34, 1.56, 0.64, 1)'
            : 'transform 300ms cubic-bezier(0.4, 0, 1, 1)',
          willChange: 'transform',
        }}
      >
        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12, paddingBottom: 4, flexShrink: 0 }}>
          <div style={{ width: 36, height: 4, background: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(107,114,128,0.2)', borderRadius: 999 }} />
        </div>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', padding: '12px 20px 4px', flexShrink: 0,
        }}>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ color: isDark ? '#fff' : '#111827', fontSize: 17, fontWeight: 700, letterSpacing: '-0.3px', margin: 0 }}>
              Cards
            </h2>
            <p style={{ color: isDark ? 'rgba(255,255,255,0.35)' : '#6b7280', fontSize: 12, marginTop: 3 }}>
              Manage dashboard cards
            </p>
          </div>
          <button
            onClick={handleClose}
            style={{
              position: 'absolute', right: 16, top: 12,
              width: 28, height: 28, borderRadius: '50%',
              background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.08)',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <X width={12} height={12} strokeWidth={1.8} color={isDark ? 'rgba(255,255,255,0.6)' : 'rgba(17,24,39,0.5)'} />
          </button>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: isDark ? 'rgba(255,255,255,0.07)' : '#e5e7eb', margin: '16px 0 0', flexShrink: 0 }} />

        {/* Card list — scrollable */}
        <div style={{ flex: 1, overflowY: 'auto', overscrollBehavior: 'contain' }}>
          {CARD_LIST.map(({ key, label, icon }, i) => {
            // ── Defensive reads — safe even if visibleCards is somehow partial ──
            const isOn      = visibleCards?.[key] ?? false;
            const isLast    = isLastVisible?.(key) ?? false;
            const isPopping = popping === key;

            return (
              <div
                key={key}
                style={{
                  display: 'flex', alignItems: 'center',
                  padding: '18px 20px',
                  borderBottom: i < CARD_LIST.length - 1
                    ? isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #f3f4f6'
                    : 'none',
                  gap: 16,
                }}
              >
                {/* Card icon */}
                <span style={{ color: isOn ? '#1C9EF9' : (isDark ? 'rgba(255,255,255,0.3)' : '#ccc'), flexShrink: 0, transition: 'color 200ms ease' }}>
                  {icon}
                </span>

                {/* Label */}
                <span style={{
                  flex: 1,
                  color: isOn ? (isDark ? '#fff' : '#111827') : (isDark ? 'rgba(255,255,255,0.35)' : '#999'),
                  fontSize: 16, fontWeight: 500,
                  transition: 'color 200ms ease',
                }}>
                  {label}
                </span>

                {/* Eye toggle */}
                <button
                  onClick={() => handleToggle(key)}
                  disabled={isLast}
                  title={isLast ? 'At least one card must be visible' : isOn ? 'Hide card' : 'Show card'}
                  style={{
                    background: 'none', border: 'none', cursor: isLast ? 'not-allowed' : 'pointer',
                    padding: 4, flexShrink: 0,
                    color: isOn ? '#1C9EF9' : (isDark ? '#8E8E93' : '#bbb'),
                    transform: isPopping ? 'scale(1.25)' : 'scale(1)',
                    transition: 'color 200ms ease, transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                    opacity: isLast ? 0.4 : 1,
                  }}
                >
                  {isOn ? <Eye width={22} height={22} strokeWidth={2} stroke="currentColor" /> : <EyeOff width={22} height={22} strokeWidth={2} stroke="currentColor" />}
                </button>
              </div>
            );
          })}

          {/* Hint */}
          <p style={{
            textAlign: 'center',
            color: isDark ? 'rgba(255,255,255,0.2)' : '#9ca3af',
            fontSize: 12,
            padding: '20px 20px 32px',
          }}>
            At least one card must stay visible
          </p>
        </div>
      </div>
    </>
  );
}

// ── Icons ────────────────────────────────────────────────────────────────────