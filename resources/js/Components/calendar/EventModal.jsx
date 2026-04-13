/**
 * EventModal.jsx — Redesigned
 * Slide-up bottom sheet modal for adding a new calendar event.
 * Matches screenshot: drag handle, "Add Event" title, date subtitle,
 * two dark input fields, no Cancel button (just X), blue Add button.
 */

import { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { X, Plus } from 'lucide-react';

export default function EventModal({ date, onSave, onClose }) {
  const { isDark } = useTheme();
  const [title, setTitle]       = useState('');
  const [description, setDesc]  = useState('');
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');
  const [visible, setVisible]   = useState(false);
  const startYRef               = useRef(null);

  const displayDate = date
    ? new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric',
      })
    : '';

  useEffect(() => {
    requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    const handler = (e) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => onClose(), 320);
  };

  const handleSave = async () => {
    if (!title.trim()) { setError('Event title is required.'); return; }
    setSaving(true);
    setError('');
    try {
      await onSave({ title, description, date });
      handleClose();
    } catch {
      setError('Failed to save. Try again.');
      setSaving(false);
    }
  };

  // Swipe to close
  const handleTouchStart = (e) => { startYRef.current = e.touches[0].clientY; };
  const handleTouchEnd = (e) => {
    if (startYRef.current === null) return;
    const delta = e.changedTouches[0].clientY - startYRef.current;
    if (delta > 80) handleClose();
    startYRef.current = null;
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 9098,
          background: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.3)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          opacity: visible ? 1 : 0,
          transition: 'opacity 300ms ease',
        }}
      />

      {/* Sheet */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{
          position: 'fixed', left: 0, right: 0, bottom: 0,
          zIndex: 9099,
          background: isDark ? 'rgba(18,18,20,0.98)' : '#ffffff',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRadius: '20px 20px 0 0',
          borderTop: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid #e5e7eb',
          transform: visible ? 'translateY(0)' : 'translateY(100%)',
          transition: visible
            ? 'transform 400ms cubic-bezier(0.34, 1.56, 0.64, 1)'
            : 'transform 300ms cubic-bezier(0.4, 0, 1, 1)',
          willChange: 'transform',
          paddingBottom: 40,
        }}
      >
        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
          <div style={{ width: 36, height: 4, background: isDark ? 'rgba(255,255,255,0.15)' : '#d1d5db', borderRadius: 999 }} />
        </div>

        {/* Header */}
        <div style={{ padding: '12px 20px 16px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ color: isDark ? '#fff' : '#111827', fontSize: 20, fontWeight: 700, letterSpacing: '-0.3px', marginBottom: 4 }}>
              Add Task
            </h2>
            <p style={{ color: isDark ? 'rgba(255,255,255,0.4)' : '#6b7280', fontSize: 14 }}>{displayDate}</p>
          </div>
          <button
            onClick={handleClose}
            style={{
              width: 28, height: 28, borderRadius: '50%',
              background: isDark ? 'rgba(255,255,255,0.1)' : '#f3f4f6',
              border: 'none', cursor: 'pointer', marginTop: 2,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <X width={12} height={12} strokeWidth={1.8} color={isDark ? 'rgba(255,255,255,0.6)' : '#6b7280'} />
          </button>
        </div>

        {/* Inputs */}
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input
            autoFocus
            placeholder="Task title *"
            value={title}
            onChange={e => { setTitle(e.target.value); setError(''); }}
            onKeyDown={e => { if (e.key === 'Enter') handleSave(); }}
            style={{
              width: '100%', padding: '14px 16px', boxSizing: 'border-box',
              background: isDark ? 'rgba(255,255,255,0.07)' : '#f8fafc',
              border: error ? '1px solid rgba(255,69,58,0.6)' : (isDark ? '1px solid transparent' : '1px solid #e5e7eb'),
              borderRadius: 12, outline: 'none',
              color: isDark ? '#fff' : '#111827', fontSize: 15,
            }}
          />
          {error && <p style={{ color: '#FF453A', fontSize: 12, marginTop: -6 }}>{error}</p>}
          <textarea
            placeholder="Description (optional)"
            value={description}
            onChange={e => setDesc(e.target.value)}
            rows={4}
            style={{
              width: '100%', padding: '14px 16px', boxSizing: 'border-box',
              background: isDark ? 'rgba(255,255,255,0.07)' : '#f8fafc',
              border: isDark ? '1px solid transparent' : '1px solid #e5e7eb',
              borderRadius: 12, outline: 'none',
              color: isDark ? '#fff' : '#111827', fontSize: 15, resize: 'none',
            }}
          />
          <button
            onClick={handleSave}
            disabled={saving || !title.trim()}
            style={{
              width: '100%', padding: '16px',
              background: '#1C9EF9', border: 'none', borderRadius: 12,
              color: '#fff', fontSize: 16, fontWeight: 700,
              cursor: title.trim() && !saving ? 'pointer' : 'not-allowed',
              opacity: !title.trim() ? 0.5 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'opacity 200ms ease',
            }}
          >
            {saving ? (
              <span style={{
                width: 18, height: 18, borderRadius: '50%',
                border: '2px solid rgba(255,255,255,0.3)',
                borderTop: '2px solid #fff',
                display: 'inline-block',
                animation: 'spin 0.7s linear infinite',
              }} />
            ) : (
              <>
                <Plus width={16} height={16} strokeWidth={2.5} stroke="currentColor" />
                Save Task
              </>
            )}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}