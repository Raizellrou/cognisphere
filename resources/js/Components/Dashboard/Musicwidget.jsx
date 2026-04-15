/**
 * Musicwidget.jsx — Redesigned
 * Music player with track info, play/pause, next. Glassmorphism card.
 * Firebase: replace playlist with real data from useMusic hook.
 */

import { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { Music2, Pause, Play } from 'lucide-react';

const DEFAULT_PLAYLIST = [
  { id: 1, title: 'Music 1', artist: 'Artist 1' },
  { id: 2, title: 'Music 2', artist: 'Artist 2' },
  { id: 3, title: 'Music 3', artist: 'Artist 3' },
];

export default function MusicWidget({ playlist = DEFAULT_PLAYLIST }) {
  const { isDark } = useTheme();
  const [idx, setIdx]       = useState(0);
  const [playing, setPlay]  = useState(false);

  const current = playlist[idx] || playlist[0];

  const handleNext = () => {
    setIdx(i => (i + 1) % playlist.length);
    setPlay(false);
  };

  return (
    <div style={{
      background: isDark ? 'rgba(28,28,30,0.8)' : '#ffffff',
      backdropFilter: 'blur(12px)',
      borderRadius: 20,
      padding: 16,
      border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e5e7eb',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Music2 width={16} height={16} strokeWidth={1.8} color="#1C9EF9" />
          <span style={{ color: isDark ? '#fff' : '#111827', fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
            Music
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: isDark ? 'rgba(255,255,255,0.4)' : '#6b7280', fontSize: 12 }}>{current.title}</span>
          <button
            onClick={handleNext}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: isDark ? '#fff' : '#111827', fontSize: 12, fontWeight: 600, padding: '2px 8px', borderRadius: 8, background: isDark ? 'rgba(255,255,255,0.07)' : '#f8fafc', transition: 'background 150ms ease' }}
          >
            Next
          </button>
        </div>
      </div>

      {/* Player area */}
      <div style={{
        background: isDark ? 'rgba(0,0,0,0.3)' : '#f8fafc',
        borderRadius: 14,
        aspectRatio: '16/9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid #d1d5db',
      }}>
        {/* Subtle animated gradient bg */}
        <div style={{
          position: 'absolute', inset: 0,
          background: isDark ? 'radial-gradient(ellipse at 30% 60%, rgba(10,132,255,0.08) 0%, transparent 70%)' : 'radial-gradient(ellipse at 30% 60%, rgba(10,132,255,0.04) 0%, transparent 70%)',
        }} />

        {/* Waveform decorative lines */}
        {playing && (
          <div style={{ position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 3, alignItems: 'flex-end' }}>
            {[4,8,12,7,10,5,9,6,11,8,4].map((h, i) => (
              <div key={i} style={{
                width: 3, height: h * 2,
                background: 'rgba(10,132,255,0.6)',
                borderRadius: 2,
                animation: `wave ${0.5 + i * 0.07}s ease-in-out infinite alternate`,
              }} />
            ))}
          </div>
        )}

        {/* Play/Pause button */}
        <button
          onClick={() => setPlay(p => !p)}
          style={{
            position: 'relative', zIndex: 1,
            width: 52, height: 52, borderRadius: '50%',
            background: isDark ? 'rgba(255,255,255,0.08)' : '#f8fafc',
            backdropFilter: 'blur(8px)',
            border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid #d1d5db',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: isDark ? '#fff' : '#111827', transition: 'background 150ms ease, transform 150ms ease',
          }}
          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.93)'}
          onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          {playing
            ? <Pause width={20} height={20} strokeWidth={2} fill="currentColor" />
            : <Play width={20} height={20} strokeWidth={2} fill="currentColor" style={{ marginLeft: 2 }} />
          }
        </button>
      </div>

      {/* Artist */}
      <p style={{ color: isDark ? 'rgba(255,255,255,0.3)' : '#6b7280', fontSize: 11, textAlign: 'center', marginTop: 8 }}>{current.artist}</p>

      {/* CSS for waveform animation */}
      <style>{`
        @keyframes wave {
          from { transform: scaleY(0.5); }
          to   { transform: scaleY(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes wave { from, to { transform: none; } }
        }
      `}</style>
    </div>
  );
}