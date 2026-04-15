/**
 * Streakwidget.jsx — Redesigned
 * Shows the user's current streak. Glassmorphism card, fire icon, blue accent header.
 */

import { useTheme } from '@/context/ThemeContext';
import { Flame } from 'lucide-react';

export default function StreakWidget({ streak = 0 }) {
  const { isDark } = useTheme();
  return (
    <div style={{
      background: isDark ? 'rgba(28,28,30,0.8)' : '#ffffff',
      backdropFilter: 'blur(12px)',
      borderRadius: 20,
      padding: '28px 20px',
      border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e5e7eb',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      minHeight: 160,
    }}>
      {/* Header with fire icon */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <Flame width={18} height={18} strokeWidth={1.8} color="#FF9500" />
        <span style={{ color: isDark ? '#fff' : '#111827', fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
          Streak
        </span>
      </div>

      {/* Number */}
      <p style={{
        color: isDark ? '#fff' : '#111827',
        fontSize: streak > 99 ? 64 : 80,
        fontWeight: 900,
        lineHeight: 1,
        marginBottom: 8,
        fontVariantNumeric: 'tabular-nums',
        letterSpacing: '-3px',
      }}>
        {streak}
      </p>

      <p style={{ color: isDark ? 'rgba(255,255,255,0.35)' : '#6b7280', fontSize: 13 }}>Days</p>

      {/* Mini progress ring for visual interest when streak > 0 */}
      {streak > 0 && (
        <div style={{ marginTop: 14, display: 'flex', gap: 4 }}>
          {Array.from({ length: Math.min(streak, 7) }).map((_, i) => (
            <div key={i} style={{
              width: 6, height: 6, borderRadius: '50%',
              background: i < streak ? '#1C9EF9' : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(17,24,39,0.1)'),
              opacity: 0.6 + (i / 7) * 0.4,
            }} />
          ))}
          {streak > 7 && <span style={{ color: isDark ? 'rgba(255,255,255,0.3)' : '#6b7280', fontSize: 10 }}>+{streak - 7}</span>}
        </div>
      )}
    </div>
  );
}