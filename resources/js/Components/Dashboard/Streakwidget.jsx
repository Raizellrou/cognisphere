/**
 * Streakwidget.jsx — Redesigned
 * Shows the user's current streak. Glassmorphism card, fire icon, blue accent header.
 */

import { useTheme } from '@/context/ThemeContext';
import { Flame } from 'lucide-react';

export default function StreakWidget({ streak = 0, completedToday = false }) {
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

      {/* Status badge */}
      <div style={{
        marginTop: 12,
        padding: '6px 12px',
        borderRadius: 999,
        background: completedToday ? (isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)') : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.04)'),
        border: completedToday ? (isDark ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(16, 185, 129, 0.2)') : (isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e5e7eb'),
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
      }}>
        <span style={{ color: completedToday ? '#10b981' : (isDark ? 'rgba(255,255,255,0.35)' : '#6b7280'), fontSize: 12, fontWeight: 600 }}>
          {completedToday ? 'Done for today!' : 'Complete a Pomodoro'}
        </span>
      </div>

      {/* Mini progress ring for visual interest when streak > 0 */}
      {streak > 0 && (
        <div style={{ marginTop: 14, display: 'flex', gap: 4, alignItems: 'center' }}>
          {Array.from({ length: Math.min(streak, 7) }).map((_, i) => (
            <div key={i} style={{
              width: 6, height: 6, borderRadius: '50%',
              background: '#1C9EF9',
              opacity: 0.3 + (i / 6) * 0.7,
            }} />
          ))}
          {streak > 7 && <span style={{ color: isDark ? 'rgba(255,255,255,0.3)' : '#6b7280', fontSize: 10, marginLeft: 2 }}>+{streak - 7}</span>}
        </div>
      )}
    </div>
  );
}