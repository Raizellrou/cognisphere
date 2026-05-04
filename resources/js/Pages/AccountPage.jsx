import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { updateDisplayName } from '@/services/firebaseAuthService';
import FeedbackModal from '@/Components/ui/FeedbackModal';
import SignOutModal from '@/Components/ui/SignOutModal';

export default function AccountModal({ isOpen, onClose }) {
  const { currentUser, userProfile, setUserProfile, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const { isDark: darkMode, toggleTheme } = useTheme();
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);
  const startYRef = useRef(null);

  // Edit username state
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [editError, setEditError] = useState('');
  const [isSavingUsername, setIsSavingUsername] = useState(false);

  // Local displayName state for instant UI updates
  const [localDisplayName, setLocalDisplayName] = useState(userProfile?.displayName || currentUser?.displayName || 'User');

  // Feedback modal state
  const [showFeedback, setShowFeedback] = useState(false);

  const handleToggleTheme = useCallback((e) => {
    e?.preventDefault?.();
    toggleTheme();
  }, [toggleTheme]);

  const displayName = localDisplayName;
  const email = currentUser?.email || '';
  const joinedDate = userProfile?.createdAt?.toDate
    ? userProfile.createdAt.toDate().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'March 2026';

  const initials = displayName
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  // Sync local displayName with userProfile when it updates externally
  useEffect(() => {
    if (userProfile?.displayName) {
      setLocalDisplayName(userProfile.displayName);
    }
  }, [userProfile?.displayName]);

  // ── Animation ────────────────────────────────────────────────────
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

  // ESC key close
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Swipe down to close
  const handleTouchStart = (e) => { startYRef.current = e.touches[0].clientY; };
  const handleTouchEnd = (e) => {
    if (startYRef.current === null) return;
    const delta = e.changedTouches[0].clientY - startYRef.current;
    if (delta > 80) onClose();
    startYRef.current = null;
  };

 const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

  const handleLogout = () => {
    setShowSignOutConfirm(true);
  };

  const confirmSignOut = async () => {
    setShowSignOutConfirm(false);
    setLoggingOut(true);
    try { await logout(); }
    catch { setLoggingOut(false); }
  };

  // ── Username edit handlers ───────────────────────────────────────
  const handleEditUsername = () => {
    setIsEditingUsername(true);
    setNewUsername(displayName);
    setEditError('');
  };

  const handleCancelEdit = () => {
    setIsEditingUsername(false);
    setNewUsername('');
    setEditError('');
  };

  const validateUsername = (name) => {
    const trimmed = name.trim();
    if (!trimmed) return 'Name cannot be empty.';
    if (trimmed.length > 40) return 'Name must be 40 characters or less.';
    return '';
  };

  const handleSaveUsername = async () => {
    const error = validateUsername(newUsername);
    if (error) {
      setEditError(error);
      return;
    }

    setIsSavingUsername(true);
    setEditError('');
    try {
      const trimmedName = newUsername.trim();
      await updateDisplayName(currentUser, trimmedName);
      // Update local state immediately for instant UI feedback
      setLocalDisplayName(trimmedName);
      // Update context state to persist across component re-renders
      setUserProfile(prev => ({ ...prev, displayName: trimmedName }));
      setIsEditingUsername(false);
      setNewUsername('');
    } catch (err) {
      setEditError('Failed to update name. Please try again.');
    } finally {
      setIsSavingUsername(false);
    }
  };

  if (!animating) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 8999,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          opacity: visible ? 1 : 0,
          transition: 'opacity 300ms ease',
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
          background: darkMode ? 'rgba(12,12,14,0.98)' : 'rgba(255,255,255,0.96)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderTop: darkMode ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.08)',
          borderRadius: '20px 20px 0 0',
          maxHeight: '85dvh',
          display: 'flex',
          flexDirection: 'column',
          transform: visible ? 'translateY(0)' : 'translateY(100%)',
          transition: visible
            ? 'transform 400ms cubic-bezier(0.34, 1.56, 0.64, 1)'
            : 'transform 300ms cubic-bezier(0.4, 0, 1, 1)',
          willChange: 'transform',
          overflowY: 'auto',
          overscrollBehavior: 'contain',
        }}
      >
        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12, paddingBottom: 4 }}>
          <div style={{ width: 36, height: 4, background: darkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.18)', borderRadius: 999 }} />
        </div>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', padding: '12px 20px 8px',
        }}>
          <h2 style={{ color: darkMode ? '#fff' : '#111', fontSize: 17, fontWeight: 700, letterSpacing: '-0.3px' }}>
            Account
          </h2>
          <button
            onClick={onClose}
            style={{
              position: 'absolute', right: 16,
              width: 28, height: 28, borderRadius: '50%',
              background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.65)',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* ── Profile Section ───────────────────────────────────── */}
        <div style={{ padding: '16px 20px 20px', borderBottom: darkMode ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* Avatar */}
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
              background: '#1C9EF9',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <span style={{ color: '#ffffff', fontSize: 20, fontWeight: 700 }}>{initials}</span>
            </div>
            <div>
              <p style={{ color: darkMode ? '#ffffff' : '#000000', fontSize: 16, fontWeight: 700, marginBottom: 2 }}>
                {displayName}
              </p>
              <p style={{ color: darkMode ? 'rgba(255,255,255,0.55)' : '#6b7280', fontSize: 13, marginBottom: 2 }}>
                {email}
              </p>
              <p style={{ color: darkMode ? 'rgba(255,255,255,0.35)' : '#6b7280', fontSize: 12 }}>
                member since {joinedDate}
              </p>
            </div>
          </div>
        </div>

        {/* ── Dark Mode Toggle ──────────────────────────────────── */}
        <div style={{
          padding: '16px 20px',
          borderBottom: darkMode ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ color: darkMode ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.75)', fontSize: 14 }}>
            Theme
          </span>
          {/* Toggle */}
          <button
            type="button"
            onClick={handleToggleTheme}
            aria-pressed={darkMode}
            style={{
              width: 44, height: 26, borderRadius: 13,
              background: darkMode ? '#1C9EF9' : '#111827',
              border: 'none', cursor: 'pointer',
              position: 'relative',
              transition: 'background 200ms ease',
            }}
          >
            <div style={{
              position: 'absolute',
              top: 3,
              left: darkMode ? 21 : 3,
              width: 20, height: 20,
              borderRadius: '50%',
              background: '#ffffff',
              transition: 'left 200ms cubic-bezier(0.34, 1.56, 0.64, 1)',
            }} />
          </button>
          <span style={{ color: darkMode ? '#ffffff' : '#000000', fontSize: 14 }}>
            {darkMode ? 'Dark Mode' : 'Light Mode'}
          </span>
        </div>

        {/* ── Menu Items ─────────────────────────────────────────── */}
        <div style={{ padding: '8px 0' }}>
          {/* Edit Username Row */}
          {!isEditingUsername ? (
            <MenuItem
              icon={<EditIcon />}
              label={displayName}
              onClick={handleEditUsername}
            />
          ) : (
            <div style={{ padding: '14px 20px', borderBottom: darkMode ? '1px solid rgba(255,255,255,0.05)' : '#e5e7eb' }}>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => {
                  setNewUsername(e.target.value);
                  if (editError) setEditError('');
                }}
                placeholder="Enter new name"
                disabled={isSavingUsername}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: darkMode ? '1px solid rgba(255,255,255,0.12)' : '1px solid #e5e7eb',
                  background: darkMode ? 'rgba(255,255,255,0.05)' : '#ffffff',
                  color: darkMode ? '#ffffff' : '#111827',
                  fontSize: 14,
                  marginBottom: editError ? 4 : 12,
                  fontFamily: 'inherit',
                  opacity: isSavingUsername ? 0.6 : 1,
                }}
              />
              {editError && (
                <p style={{ fontSize: 12, color: '#FF453A', marginBottom: 12 }}>
                  {editError}
                </p>
              )}
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={handleSaveUsername}
                  disabled={isSavingUsername}
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    borderRadius: 8,
                    background: '#1C9EF9',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    opacity: isSavingUsername ? 0.7 : 1,
                  }}
                >
                  {isSavingUsername ? (
                    <span style={{
                      width: 14, height: 14, borderRadius: '50%',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTop: '2px solid #ffffff',
                      display: 'inline-block',
                      animation: 'spin 0.7s linear infinite',
                    }} />
                  ) : 'Save'}
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={isSavingUsername}
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    borderRadius: 8,
                    background: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                    color: darkMode ? '#ffffff' : '#111827',
                    border: 'none',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    opacity: isSavingUsername ? 0.5 : 1,
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <MenuItem
            icon={<SignOutIcon />}
            label="Sign out"
            labelColor="#FF453A"
            iconColor="#FF453A"
            onClick={() => setShowSignOutConfirm(true)}
            loading={loggingOut}
          />
          <MenuItem
            icon={<FeedbackIcon />}
            label="Feedback"
            onClick={() => setShowFeedback(true)}
            last
          />
        </div>

        {/* Bottom safe area */}
        <div style={{ height: 24 }} />
      </div>

      {/* Feedback Modal */}
      <FeedbackModal isOpen={showFeedback} onClose={() => setShowFeedback(false)} />
      <SignOutModal
        isOpen={showSignOutConfirm}
        onCancel={() => setShowSignOutConfirm(false)}
        onConfirm={confirmSignOut}
      />
    </>
  );
}

// ── Menu Item ────────────────────────────────────────────────────────────────

function MenuItem({ icon, label, onClick, labelColor, iconColor, loading, last }) {
  const isDarkTheme = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
  const effectiveLabelColor = labelColor ?? (isDarkTheme ? '#ffffff' : '#000000');
  const effectiveIconColor = iconColor ?? '#1C9EF9';
  const borderColor = isDarkTheme ? 'rgba(255,255,255,0.05)' : '#e5e7eb';

  return (
    <button
      onClick={onClick}
      disabled={loading}
      style={{
        width: '100%', display: 'flex', alignItems: 'center',
        gap: 14, padding: '14px 20px',
        background: 'none', border: 'none', cursor: 'pointer',
        borderBottom: last ? 'none' : `1px solid ${borderColor}`,
        textAlign: 'left',
        opacity: loading ? 0.6 : 1,
      }}
    >
      <span style={{ color: effectiveIconColor, display: 'flex', alignItems: 'center' }}>
        {loading ? (
          <span style={{
            width: 18, height: 18, borderRadius: '50%',
            border: isDarkTheme ? '2px solid rgba(255,255,255,0.2)' : '2px solid rgba(0,0,0,0.2)',
            borderTop: isDarkTheme ? '2px solid #fff' : '2px solid #111',
            display: 'inline-block',
            animation: 'spin 0.7s linear infinite',
          }} />
        ) : icon}
      </span>
      <span style={{ color: effectiveLabelColor, fontSize: 15, fontWeight: 500 }}>
        {label}
      </span>
    </button>
  );
}

// ── Icons ────────────────────────────────────────────────────────────────────

function EditIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  );
}

function SignOutIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  );
}

function FeedbackIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z"/>
    </svg>
  );
}