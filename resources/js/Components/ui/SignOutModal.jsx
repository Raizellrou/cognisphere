import { createPortal } from 'react-dom';
import { useTheme } from '@/context/ThemeContext';

export default function SignOutModal({ isOpen, onCancel, onConfirm }) {
  const { isDark } = useTheme();

  if (!isOpen) return null;

  return createPortal(
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px',
    }}>
      {/* Backdrop */}
      <div
        onClick={onCancel}
        style={{
          position: 'absolute', inset: 0,
          background: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(15,23,42,0.2)',
          backdropFilter: 'blur(6px)',
        }}
      />

      {/* Modal card */}
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: 360,
        background: isDark ? 'rgba(20,20,22,0.98)' : '#ffffff',
        borderRadius: 24,
        border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e5e7eb',
        padding: '32px 24px 24px',
        boxShadow: isDark
          ? '0 24px 64px rgba(0,0,0,0.6)'
          : '0 24px 64px rgba(15,23,42,0.12)',
        animation: 'popIn 280ms cubic-bezier(0.34,1.56,0.64,1)',
      }}>

        <style>{`
          @keyframes popIn {
            from { opacity: 0; transform: scale(0.88); }
            to   { opacity: 1; transform: scale(1); }
          }
        `}</style>

        {/* Icon */}
        <div style={{
          width: 52, height: 52, borderRadius: '50%',
          background: 'rgba(255,69,58,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 18px',
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
            stroke="#FF453A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </div>

        {/* Text */}
        <h3 style={{
          textAlign: 'center',
          color: isDark ? '#ffffff' : '#000000',
          fontSize: 17, fontWeight: 700, marginBottom: 8,
        }}>
          Sign out?
        </h3>
        <p style={{
          textAlign: 'center',
          color: isDark ? 'rgba(255,255,255,0.4)' : '#6b7280',
          fontSize: 13, lineHeight: 1.6, marginBottom: 28,
        }}>
          You'll need to sign back in to access your workspace.
        </p>

        {/* Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            onClick={onConfirm}
            style={{
              width: '100%', padding: '14px 0',
              background: '#FF453A', color: '#ffffff',
              border: 'none', borderRadius: 14,
              fontSize: 14, fontWeight: 700, cursor: 'pointer',
              transition: 'opacity 150ms ease',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            Sign out
          </button>
          <button
            onClick={onCancel}
            style={{
              width: '100%', padding: '14px 0',
              background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.04)',
              color: isDark ? '#ffffff' : '#000000',
              border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e5e7eb',
              borderRadius: 14,
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
              transition: 'background 150ms ease',
            }}
            onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.04)'}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}