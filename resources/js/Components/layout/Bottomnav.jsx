/**
 * BottomNav.jsx — Fixed
 * Floating glass pill navigation.
 * - "Account" → opens AccountModal sheet
 * - "Cards"   → opens CardsManagerModal sheet
 *
 * visibleCards, toggleCard, isLastVisible are passed in from Dashboard
 * so CardsManagerModal can control card visibility on the home screen.
 */

import { useState } from 'react';
import { NavLink }  from 'react-router-dom';
import { useTheme } from '@/context/ThemeContext';
import { Home, Calendar, MessageSquare, CreditCard, User } from 'lucide-react';
import AccountModal      from '@/Pages/AccountPage';
import CardsManagerModal from '@/components/ui/CardsManagerModal';

const PAGE_NAV = [
  { to: '/',         label: 'Home',     Icon: ({ active }) => <Home width={22} height={22} strokeWidth={active ? 2.2 : 1.8} /> },
  { to: '/calendar', label: 'Calendar', Icon: ({ active }) => <Calendar width={22} height={22} strokeWidth={active ? 2.2 : 1.8} /> },
  { to: '/chat',     label: 'Chat',     Icon: ({ active }) => <MessageSquare width={22} height={22} strokeWidth={active ? 2.2 : 1.8} /> },
];

export default function BottomNav({ visibleCards, toggleCard, isLastVisible }) {
  const { isDark } = useTheme();
  const [showAccount, setShowAccount] = useState(false);
  const [showCards,   setShowCards]   = useState(false);

  // Guard: don't open cards modal if props aren't ready
  const handleShowCards = () => {
    if (visibleCards && toggleCard && isLastVisible) {
      setShowCards(true);
    }
  };

  return (
    <>
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .cogni-nav-item * { transition: none !important; }
        }
      `}</style>

      <nav
        className="lg:hidden"
        aria-label="Main navigation"
        style={{
          position: 'fixed',
          bottom: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 100,
          width: 'calc(100% - 32px)',
          maxWidth: 420,
          background: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e5e7eb',
          borderRadius: '22px',
          boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)' : '0 10px 30px rgba(15,23,42,0.08)',
          pointerEvents: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '10px 8px' }}>

          {PAGE_NAV.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              style={{ textDecoration: 'none', flex: 1 }}
            >
              {({ isActive }) => (
                <NavItem label={label} isActive={isActive}>
                  <Icon active={isActive} />
                </NavItem>
              )}
            </NavLink>
          ))}

          {/* Cards modal button */}
          <button
            onClick={handleShowCards}
            style={{ background: 'none', border: 'none', flex: 1, cursor: 'pointer', padding: 0 }}
          >
            <NavItem label="Cards" isActive={showCards}>
              <CreditCard width={22} height={22} strokeWidth={showCards ? 2.2 : 1.8} />
            </NavItem>
          </button>

          {/* Account modal button */}
          <button
            onClick={() => setShowAccount(true)}
            style={{ background: 'none', border: 'none', flex: 1, cursor: 'pointer', padding: 0 }}
          >
            <NavItem label="Account" isActive={showAccount}>
              <User width={22} height={22} strokeWidth={showAccount ? 2.2 : 1.8} />
            </NavItem>
          </button>

        </div>
      </nav>

      <div style={{ height: 90 }} aria-hidden="true" />

      <AccountModal
        isOpen={showAccount}
        onClose={() => setShowAccount(false)}
      />

      {/* Only mount when props are guaranteed ready */}
      {visibleCards && toggleCard && isLastVisible && (
        <CardsManagerModal
          isOpen={showCards}
          onClose={() => setShowCards(false)}
          visibleCards={visibleCards}
          toggleCard={toggleCard}
          isLastVisible={isLastVisible}
        />
      )}
    </>
  );
}

function NavItem({ label, isActive, children }) {
  const { isDark } = useTheme();
  return (
    <div
      className="cogni-nav-item"
      style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 4, padding: '2px 0',
        color: isActive ? '#1C9EF9' : (isDark ? 'rgba(255,255,255,0.6)' : '#9ca3af'),
        transition: 'color 200ms cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {isActive && (
          <div style={{
            position: 'absolute', inset: -6, borderRadius: '50%',
            background: 'rgba(28,158,249,0.12)',
            transition: 'opacity 200ms ease',
          }} />
        )}
        {children}
      </div>
      <span style={{
        fontSize: 10, fontWeight: isActive ? 700 : 500,
        letterSpacing: '0.2px',
        transition: 'font-weight 200ms ease, color 200ms ease',
      }}>
        {label}
      </span>
      <div style={{
        width: 4, height: 4, borderRadius: '50%',
        background: '#1C9EF9',
        opacity: isActive ? 1 : 0,
        transform: isActive ? 'scale(1)' : 'scale(0)',
        transition: 'opacity 200ms ease, transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        marginTop: -2,
      }} />
    </div>
  );
}