/**
 * SlideUpModal.jsx
 * Reusable slide-up modal with backdrop blur + spring animation.
 * Close on backdrop click or swipe-down gesture.
 */

import { useEffect, useRef, useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { X } from 'lucide-react';

export default function SlideUpModal({
  isOpen,
  onClose,
  children,
  fullscreen = false,
  title,
}) {
  const { isDark } = useTheme();
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);
  const startYRef = useRef(null);
  const sheetRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setAnimating(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
    } else {
      setVisible(false);
      const timer = setTimeout(() => setAnimating(false), 320);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Swipe-down to close
  const handleTouchStart = (e) => {
    startYRef.current = e.touches[0].clientY;
  };
  const handleTouchEnd = (e) => {
    if (startYRef.current === null) return;
    const delta = e.changedTouches[0].clientY - startYRef.current;
    if (delta > 80) onClose();
    startYRef.current = null;
  };

  if (!animating) return null;

  const sheetStyle = {
    position: 'fixed',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9000,
    background: isDark ? 'rgba(12,12,14,0.97)' : '#ffffff',
    backdropFilter: 'blur(24px)',
    borderTop: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid #e5e7eb',
    borderRadius: fullscreen ? '20px 20px 0 0' : '24px 24px 0 0',
    height: fullscreen ? '95dvh' : 'auto',
    maxHeight: fullscreen ? '95dvh' : '85dvh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    transform: visible ? 'translateY(0)' : 'translateY(100%)',
    transition: visible
      ? 'transform 400ms cubic-bezier(0.34, 1.56, 0.64, 1)'
      : 'transform 300ms cubic-bezier(0.4, 0, 1, 1)',
    willChange: 'transform',
  };

  const backdropStyle = {
    position: 'fixed',
    inset: 0,
    zIndex: 8999,
    background: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.35)',
    backdropFilter: 'blur(4px)',
    opacity: visible ? 1 : 0,
    transition: 'opacity 300ms ease',
  };

  return (
    <>
      {/* Backdrop */}
      <div style={backdropStyle} onClick={onClose} />

      {/* Sheet */}
      <div
        ref={sheetRef}
        style={sheetStyle}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div style={{
            width: 36, height: 4,
            background: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(107,114,128,0.2)',
            borderRadius: 999,
          }} />
        </div>

        {/* Header */}
        {(title) && (
          <div className="flex items-center justify-between px-5 py-3 flex-shrink-0">
            <h2 style={{ color: isDark ? '#fff' : '#111827', fontSize: '17px', fontWeight: '700', letterSpacing: '-0.3px' }}>
              {title}
            </h2>
            <button
              onClick={onClose}
              style={{
                width: 28, height: 28, borderRadius: '50%',
                background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: 'none', cursor: 'pointer',
              }}
            >
              <X width={12} height={12} strokeWidth={1.8} color={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(17,24,39,0.5)'} />
            </button>
          </div>
        )}

        {/* Content — scrollable */}
        <div style={{ flex: 1, overflowY: 'auto', overscrollBehavior: 'contain' }}>
          {children}
        </div>
      </div>
    </>
  );
}
