/**
 * NotificationSystem.jsx
 * Toast notification system – top-right, glassmorphism style.
 * Usage: import { useNotification, NotificationContainer } from './NotificationSystem'
 *        const { notify } = useNotification()
 *        notify.success('Saved!') / notify.error('Oops') / notify.info('Hey')
 */

import { useState, useCallback, useEffect, createContext, useContext } from 'react';

// ── Context ──────────────────────────────────────────────────────────────────

const NotifCtx = createContext(null);

export function NotificationProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((type, message) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, type, message, leaving: false }]);

    // Start dismiss after 3s
    setTimeout(() => {
      setToasts(prev =>
        prev.map(t => t.id === id ? { ...t, leaving: true } : t)
      );
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 220);
    }, 3000);
  }, []);

  const notify = {
    success: (msg) => push('success', msg),
    error:   (msg) => push('error',   msg),
    warning: (msg) => push('warning', msg),
    info:    (msg) => push('info',    msg),
  };

  return (
    <NotifCtx.Provider value={{ notify }}>
      {children}
      <NotificationContainer toasts={toasts} />
    </NotifCtx.Provider>
  );
}

export function useNotification() {
  return useContext(NotifCtx);
}

// ── Container ────────────────────────────────────────────────────────────────

function NotificationContainer({ toasts }) {
  if (!toasts.length) return null;
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => <Toast key={t.id} {...t} />)}
    </div>
  );
}

// ── Toast ────────────────────────────────────────────────────────────────────

const TYPE_CONFIG = {
  success: { bar: '#22c55e', icon: '✓', iconColor: '#22c55e' },
  error:   { bar: '#ef4444', icon: '✕', iconColor: '#ef4444' },
  warning: { bar: '#f59e0b', icon: '!', iconColor: '#f59e0b' },
  info:    { bar: '#1C9EF9', icon: 'i', iconColor: '#1C9EF9' },
};

function Toast({ type, message, leaving }) {
  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.info;

  return (
    <div
      className="pointer-events-auto"
      style={{
        transform: leaving ? 'translateY(-8px)' : 'translateY(0)',
        opacity:   leaving ? 0 : 1,
        transition: leaving
          ? 'opacity 200ms ease-in, transform 200ms ease-in'
          : 'opacity 200ms ease-out, transform 200ms ease-out',
        willChange: 'transform, opacity',
      }}
    >
      <div
        style={{
          background: 'rgba(20,20,22,0.85)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '14px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          overflow: 'hidden',
          minWidth: '220px',
          maxWidth: '300px',
        }}
      >
        <div className="flex items-center gap-3 px-4 py-3">
          {/* Icon */}
          <span
            style={{
              width: 20, height: 20, borderRadius: '50%',
              border: `1.5px solid ${cfg.iconColor}`,
              color: cfg.iconColor,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '10px', fontWeight: '800', flexShrink: 0,
            }}
          >
            {cfg.icon}
          </span>
          <p style={{ color: '#fff', fontSize: '13px', fontWeight: '500', flex: 1 }}>
            {message}
          </p>
        </div>
        {/* Progress bar */}
        <div style={{ height: 2, background: 'rgba(255,255,255,0.05)' }}>
          <div
            style={{
              height: '100%',
              background: cfg.bar,
              animation: 'notif-progress 3s linear forwards',
            }}
          />
        </div>
      </div>
    </div>
  );
}

// Inject keyframe once
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes notif-progress {
      from { width: 100%; }
      to   { width: 0%; }
    }
  `;
  document.head.appendChild(style);
}
