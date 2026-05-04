import SignOutModal from '@/Components/ui/SignOutModal';
import { useState, useCallback } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useCardVisibility } from '@/hooks/useCardVisibility';
import { updateDisplayName } from '@/services/firebaseAuthService';
import AccountModal from '@/Pages/AccountPage';
import FeedbackModal from '@/Components/ui/FeedbackModal';
import CogniLogo from '@/assets/CogniLogo.png';
import {
  ChevronLeft, ChevronRight, Eye, EyeOff, ChevronDown, ChevronUp,
  Timer, Home, CheckSquare, Calendar, Music2, Edit2, Clock, Flame
} from 'lucide-react';

export default function Sidebar({
  visibleCards: externalVisibleCards,
  toggleCard: externalToggleCard,
  isLastVisible: externalIsLastVisible,
}) {
  const { isDark, toggleTheme } = useTheme();
  const { currentUser, userProfile, setUserProfile, logout } = useAuth();
  const navigate = useNavigate();

  // Local card visibility fallback if not provided
  const {
    visibleCards: localVisibleCards,
    toggleCard: localToggleCard,
    isLastVisible: localIsLastVisible,
  } = useCardVisibility();

  const visibleCards = externalVisibleCards || localVisibleCards;
  const toggleCard = externalToggleCard || localToggleCard;
  const isLastVisible = externalIsLastVisible || localIsLastVisible;

  const [collapsed, setCollapsed] = useState(false);
  const [cardsOpen, setCardsOpen] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [editError, setEditError] = useState('');
  const [isSavingUsername, setIsSavingUsername] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

const handleSignOut = useCallback(() => {
  setShowSignOutConfirm(true);
}, []);

const confirmSignOut = useCallback(async () => {
  setShowSignOutConfirm(false);
  await logout();
  navigate('/login');
}, [logout, navigate]);

  // Extract user initials
  const getInitials = () => {
    if (userProfile?.displayName) {
      return userProfile.displayName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return currentUser?.email?.[0]?.toUpperCase() || 'U';
  };

  const userJoinedDate = userProfile?.createdAt?.toDate
    ? userProfile.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : 'Member';

  const displayName = userProfile?.displayName || currentUser?.email?.split('@')[0] || 'User';

  // Username edit handlers
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
      setUserProfile(prev => ({ ...prev, displayName: trimmedName }));
      setIsEditingUsername(false);
      setNewUsername('');
    } catch (err) {
      setEditError('Failed to update name. Please try again.');
    } finally {
      setIsSavingUsername(false);
    }
  };

  // Colors
  const colors = isDark
    ? {
        bg: '#111827',
        border: 'rgba(255,255,255,0.07)',
        textPrimary: '#ffffff',
        textSecondary: 'rgba(255,255,255,0.6)',
        textMuted: 'rgba(255,255,255,0.55)',
        hoverBg: 'rgba(255,255,255,0.07)',
        activeBg: 'rgba(28,158,249,0.12)',
        activeBorder: '#1C9EF9',
      }
    : {
        bg: '#ffffff',
        border: '#e5e7eb',
        textPrimary: '#111827',
        textSecondary: '#4b5563',
        textMuted: '#6b7280',
        hoverBg: '#f3f4f6',
        activeBg: 'rgba(28,158,249,0.08)',
        activeBorder: '#1C9EF9',
      };

  const sidebarWidth = collapsed ? 80 : 240;
  const cardSubmenuItems = [
    { key: 'pomodoro', label: 'Pomodoro', icon: <Timer size={14} strokeWidth={1.8} /> },
    { key: 'calendar', label: 'Calendar', icon: <Calendar size={14} strokeWidth={1.8} /> },
    { key: 'music', label: 'Music', icon: <Music2 size={14} strokeWidth={1.8} /> },
    { key: 'countdown', label: 'Countdown', icon: <Clock size={14} strokeWidth={1.8} /> },
    { key: 'streak', label: 'Streak', icon: <Flame size={14} strokeWidth={1.8} /> },
  ];

  return (
    <>
      {/* Sidebar */}
      <aside
        style={{
          width: sidebarWidth,
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          flexShrink: 0,
          backgroundColor: colors.bg,
          borderRight: `1px solid ${colors.border}`,
          transition: 'width 300ms ease-in-out',
        }}
      >
        {/* ── Logo Section ─ */}
        <div
          style={{
            flexShrink: 0,
            padding: '16px 12px',
            borderBottom: `1px solid ${colors.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            gap: 8,
          }}
        >
          {collapsed ? (
            // Collapsed state: logo only, centered and clickable to expand
            <button
              onClick={() => setCollapsed(false)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-label="Expand sidebar"
              title="Expand"
            >
              <img src={CogniLogo} alt="Cognisphere" style={{ width: 28, height: 28, borderRadius: 6 }} />
            </button>
          ) : (
            // Expanded state: logo + name + collapse button
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                <img src={CogniLogo} alt="Cognisphere" style={{ width: 28, height: 28, borderRadius: 6 }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: colors.textPrimary, whiteSpace: 'nowrap' }}>
                  Cognisphere
                </span>
              </div>
              <button
                onClick={() => setCollapsed(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: colors.textMuted,
                }}
                aria-label="Collapse sidebar"
              >
                <ChevronLeft size={18} />
              </button>
            </>
          )}
        </div>

        {/* ── User Section ─ */}
        {!collapsed && (
          <div style={{ flexShrink: 0, borderBottom: `1px solid ${colors.border}` }}>
            {/* Profile header - clickable to toggle dropdown */}
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              style={{
                width: '100%',
                padding: '12px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                justifyContent: 'space-between',
                position: 'relative',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    backgroundColor: '#1C9EF9',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11,
                    fontWeight: 600,
                    flexShrink: 0,
                  }}
                >
                  {getInitials()}
                </div>
                <div style={{ minWidth: 0, textAlign: 'left' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: colors.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {displayName}
                  </div>
                  <div style={{ fontSize: 10, color: colors.textMuted, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {currentUser?.email}
                  </div>
                </div>
              </div>
              <div style={{ color: colors.textMuted, display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                {profileDropdownOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>
            </button>

            {/* Profile dropdown - expanded content */}
            {profileDropdownOpen && (
              <div
                style={{
                  padding: '12px',
                  borderTop: `1px solid ${colors.border}`,
                  background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                  borderRadius: '0 0 8px 8px',
                }}
              >
                {/* Member since */}
                <div style={{ fontSize: 11, color: colors.textMuted, marginBottom: 12 }}>
                  Member since {userJoinedDate}
                </div>

                {/* Username edit section */}
                {!isEditingUsername ? (
                  <button
                    onClick={handleEditUsername}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      background: 'none',
                      border: `1px solid ${colors.border}`,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      borderRadius: 6,
                      justifyContent: 'space-between',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = colors.hoverBg)}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <span style={{ fontSize: 13, color: colors.textPrimary, fontWeight: 500 }}>
                      @{displayName}
                    </span>
                    <Edit2 size={14} color={colors.textSecondary} />
                  </button>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
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
                        padding: '8px 10px',
                        borderRadius: 6,
                        border: `1px solid ${colors.border}`,
                        background: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff',
                        color: colors.textPrimary,
                        fontSize: 13,
                        fontFamily: 'inherit',
                        opacity: isSavingUsername ? 0.6 : 1,
                      }}
                      autoFocus
                    />
                    {editError && (
                      <p style={{ fontSize: 11, color: '#FF453A', margin: 0 }}>
                        {editError}
                      </p>
                    )}
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        onClick={handleSaveUsername}
                        disabled={isSavingUsername}
                        style={{
                          flex: 1,
                          padding: '6px 10px',
                          borderRadius: 6,
                          background: '#1C9EF9',
                          color: '#ffffff',
                          border: 'none',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                          opacity: isSavingUsername ? 0.7 : 1,
                        }}
                      >
                        {isSavingUsername ? '...' : 'Save'}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        disabled={isSavingUsername}
                        style={{
                          flex: 1,
                          padding: '6px 10px',
                          borderRadius: 6,
                          background: colors.hoverBg,
                          color: colors.textPrimary,
                          border: 'none',
                          fontSize: 12,
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
              </div>
            )}
          </div>
        )}
        {collapsed && (
          <button
            onClick={() => setShowAccount(true)}
            style={{
              flexShrink: 0,
              padding: '12px',
              borderBottom: `1px solid ${colors.border}`,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                backgroundColor: '#1C9EF9',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              {getInitials()}
            </div>
          </button>
        )}

        {/* ── Nav Links ─ */}
        <nav style={{ flex: 1, overflow: 'hidden', padding: '8px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <NavItem
            to="/dashboard"
            icon="/icons/home-icon/Property 1=linear.png"
            label="Home"
            collapsed={collapsed}
            isDark={isDark}
            colors={colors}
          />
          <NavItem
            to="/calendar"
            icon="/icons/calendar-icon/Property 1=linear.png"
            label="Calendar"
            collapsed={collapsed}
            isDark={isDark}
            colors={colors}
          />
          <NavItem
            to="/chat"
            icon="/icons/message-icon/Property 1=linear.png"
            label="Chat"
            collapsed={collapsed}
            isDark={isDark}
            colors={colors}
          />

          {/* ── Cards Submenu ─ */}
          <div style={{ marginTop: 8, borderTop: `1px solid ${colors.border}`, paddingTop: 8 }}>
            <button
              onClick={() => setCardsOpen(!cardsOpen)}
              style={{
                width: '100%',
                padding: '8px 12px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'space-between',
                color: colors.textSecondary,
                fontSize: 12,
                fontWeight: 500,
                borderRadius: 8,
                transition: 'background 200ms ease, color 200ms ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = colors.hoverBg)}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <img
                  src="/icons/layer-icon/Property 1=linear.png"
                  alt="Cards"
                  style={{ width: 16, height: 16, filter: isDark ? 'invert(1)' : 'none' }}
                />
                {!collapsed && <span>Cards</span>}
              </div>
              {!collapsed && (cardsOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
            </button>

            {/* Submenu items */}
            {cardsOpen && !collapsed && (
              <div style={{ marginTop: 4, paddingLeft: 8 }}>
                {cardSubmenuItems.map(({ key, label, icon }) => (
                  <button
                    key={key}
                    onClick={() => toggleCard(key)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      color: colors.textSecondary,
                      fontSize: 11,
                      borderRadius: 6,
                      transition: 'background 200ms ease',
                      marginBottom: 2,
                    }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = colors.hoverBg)}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <span style={{
                      color: colors.textSecondary,
                      opacity: visibleCards[key] ? 1 : 0.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      {icon}
                    </span>
                    <span>{label}</span>
                    {visibleCards[key] ? (
                      <Eye size={12} style={{ marginLeft: 'auto' }} />
                    ) : (
                      <EyeOff size={12} style={{ marginLeft: 'auto', opacity: 0.4 }} />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* ── Bottom Section ─ */}
        <div
          style={{
            flexShrink: 0,
            padding: '12px 8px',
            borderTop: `1px solid ${colors.border}`,
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          {/* Appearance toggle */}
          <button
            onClick={toggleTheme}
            style={{
              width: '100%',
              padding: '8px 12px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'flex-start',
              gap: 8,
              color: colors.textSecondary,
              fontSize: 12,
              borderRadius: 8,
              transition: 'background 200ms ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = colors.hoverBg)}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <img
              src={`/icons/${isDark ? 'moon-icon' : 'sun-icon'}/Property 1=linear.png`}
              alt="Theme"
              style={{ width: 16, height: 16, filter: isDark ? 'invert(1)' : 'none' }}
            />
            {!collapsed && <span>{isDark ? 'Dark' : 'Light'}</span>}
          </button>

          {/* Feedback */}
          <button
            onClick={() => setShowFeedback(true)}
            style={{
              width: '100%',
              padding: '8px 12px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'flex-start',
              gap: 8,
              color: '#1C9EF9',
              fontSize: 12,
              borderRadius: 8,
              transition: 'background 200ms ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = colors.hoverBg)}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <FeedbackIcon />
            {!collapsed && <span>Feedback</span>}
          </button>

          {/* Sign out */}
          {/* Sign out */}
<button
  onClick={() => setShowSignOutConfirm(true)}
  style={{
    width: '100%',
    padding: '8px 12px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: collapsed ? 'center' : 'flex-start',
    gap: 8,
    color: '#FF453A',
    fontSize: 12,
    borderRadius: 8,
    transition: 'background 200ms ease',
  }}
  onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(255,69,58,0.08)')}
  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
>
  <SignOutIcon />
  {!collapsed && <span>Sign out</span>}
</button>
        </div>
      </aside>

      {/* Modals */}
      <AccountModal isOpen={showAccount} onClose={() => setShowAccount(false)} />
      <FeedbackModal isOpen={showFeedback} onClose={() => setShowFeedback(false)} />
        {/* Sign out confirmation modal */}
{showSignOutConfirm && (
  <div style={{
    position: 'fixed', inset: 0, zIndex: 1000,
    display: 'flex', alignItems: 'flex-end',
    justifyContent: 'center',
  }}>
    {/* Backdrop */}
    <div
      onClick={() => setShowSignOutConfirm(false)}
      style={{
        position: 'absolute', inset: 0,
        background: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(15,23,42,0.15)',
        backdropFilter: 'blur(4px)',
      }}
    />

    {/* Sheet */}
    <div style={{
      position: 'relative',
      width: '100%',
      maxWidth: 480,
      background: isDark ? 'rgba(14,14,16,0.97)' : '#ffffff',
      backdropFilter: 'blur(20px)',
      borderRadius: '24px 24px 0 0',
      border: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid #e5e7eb',
      padding: '28px 24px 40px',
      animation: 'slideUp 380ms cubic-bezier(0.34,1.56,0.64,1)',
    }}>
      {/* Drag handle */}
      <div style={{
        width: 36, height: 4, borderRadius: 999,
        background: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)',
        margin: '0 auto 24px',
      }} />

      {/* Icon */}
      <div style={{
        width: 48, height: 48, borderRadius: '50%',
        background: 'rgba(255,69,58,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 16px',
      }}>
        <SignOutIcon />
      </div>

      {/* Text */}
      <h3 style={{
        textAlign: 'center',
        color: isDark ? '#ffffff' : '#000000',
        fontSize: 16, fontWeight: 700, marginBottom: 8,
      }}>
        Sign out?
      </h3>
      <p style={{
        textAlign: 'center',
        color: isDark ? 'rgba(255,255,255,0.4)' : '#6b7280',
        fontSize: 13, lineHeight: 1.5, marginBottom: 28,
      }}>
        You'll need to sign back in to access your workspace.
      </p>

      {/* Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button
          onClick={confirmSignOut}
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
          onClick={() => setShowSignOutConfirm(false)}
          style={{
            width: '100%', padding: '14px 0',
            background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.05)',
            color: isDark ? '#ffffff' : '#000000',
            border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e5e7eb',
            borderRadius: 14,
            fontSize: 14, fontWeight: 600, cursor: 'pointer',
            transition: 'background 150ms ease',
          }}
          onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.08)'}
          onMouseLeave={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.05)'}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}
    </>
  );
}

// ── Icons ──────────────────────────────────────────────────────────────────

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

// ── NavItem helper ─────────────────────────────────────────────────────────

function NavItem({ to, icon, label, collapsed, isDark, colors }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      style={({ isActive }) => ({
        padding: '10px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        justifyContent: collapsed ? 'center' : 'flex-start',
        borderRadius: 8,
        textDecoration: 'none',
        color: isActive ? colors.textPrimary : colors.textSecondary,
        backgroundColor: isActive ? colors.activeBg : 'transparent',
        borderLeft: isActive ? `2px solid ${colors.activeBorder}` : '2px solid transparent',
        fontSize: 12,
        fontWeight: isActive ? 600 : 500,
        transition: 'background 200ms ease, color 200ms ease, border 200ms ease',
        cursor: 'pointer',
      })}
    >
      <img
        src={icon}
        alt={label}
        style={{
          width: 16,
          height: 16,
          filter: isDark ? 'invert(1)' : 'none',
        }}
      />
      {!collapsed && <span>{label}</span>}
    </NavLink>
  );
}
