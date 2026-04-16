/**
 * Dashboard.jsx
 * Cards are shown/hidden based on visibleCards state from useCardVisibility.
 * The hook is passed down to BottomNav so CardsManagerModal can toggle them.
 *
 * Desktop (lg+): renders with DesktopLayout in fixed grid layout
 * Mobile (< lg): renders existing mobile layout + BottomNav
 */

import { useAuth }           from '@/context/AuthContext';
import { useStreak }         from '@/hooks/useStreak';
import { useTasks }          from '@/hooks/useTasks';
import { useCountdowns }     from '@/hooks/useCountdowns';
import { resendVerificationEmail } from '@/services/firebaseAuthService';
import { VerificationBanner }      from '@/context/auth/AuthUI';
import { useCardVisibility }       from '@/hooks/useCardVisibility';
import { useEffect, useState } from 'react';

import DesktopLayout   from '@/Layouts/DesktopLayout';
import PomodoroTimer   from '@/components/Dashboard/Pomodorotimer';
import CalendarWidget  from '@/components/Dashboard/Calendarwidget';
import StreakWidget    from '@/components/Dashboard/Streakwidget';
import CountdownWidget from '@/components/Dashboard/Countdownwidget';
import MusicWidget     from '@/components/Dashboard/Musicwidget';
import BottomNav       from '@/components/layout/BottomNav';
import Footer          from '@/components/layout/Footer';

// ── Desktop breakpoint hook ─ detect lg (1024px+) ────────────────────────
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth >= 1024;
  });

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const handler = (e) => setIsDesktop(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return isDesktop;
}

export default function Dashboard() {
  const {
    currentUser,
    userProfile,
    emailVerified,
    checkEmailVerification,
  } = useAuth();

  const uid = currentUser?.uid;

  const { streak }                                    = useStreak(uid);
  const { tasks, addTask, toggleTask } = useTasks(uid); 
  const { countdowns, addCountdown, deleteCountdown } = useCountdowns(uid);
  const { visibleCards, toggleCard, isLastVisible }   = useCardVisibility();

  const [draggedCard, setDraggedCard] = useState(null);
  const isDesktop = useIsDesktop();

  // Guard: visibleCards should always be defined from the hook,
  // but this ensures we never render with a broken state
  if (!visibleCards) return null;

  // ── Desktop drag-to-reorder handlers ─────────────────────────────────────
  const handleDragStart = (e, cardKey) => {
    setDraggedCard(cardKey);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnd = () => {
    setDraggedCard(null);
  };

  // ── Render desktop layout ────────────────────────────────────────────────
  if (isDesktop) {
    return (
      <DesktopLayout sidebarProps={{ visibleCards, toggleCard, isLastVisible }}>
        <div className="mx-auto px-6 py-4" style={{ maxWidth: '1280px' }}>
          {!emailVerified && (
            <VerificationBanner
              onResend={resendVerificationEmail}
              onVerified={checkEmailVerification}
            />
          )}

          {/* Cards layout — 3 columns with fixed widths */}
          <div className="flex gap-3 p-3 items-start">
            {/* Column 1: Pomodoro */}
            <div className="flex flex-col gap-3" style={{ width: '420px', flexShrink: 0 }}>
              {visibleCards.pomodoro && (
                <div
                  key="pomodoro"
                  draggable
                  onDragStart={(e) => handleDragStart(e, 'pomodoro')}
                  onDragOver={handleDragOver}
                  onDragEnd={handleDragEnd}
                  className={`cursor-move transition-opacity ${
                    draggedCard === 'pomodoro' ? 'opacity-50' : 'opacity-100'
                  }`}
                >
                  <PomodoroTimer />
                </div>
              )}
            </div>

            {/* Column 2: Music + Calendar */}
            <div className="flex flex-col gap-3" style={{ width: '420px', flexShrink: 0 }}>
              {visibleCards.music && (
                <div
                  key="music"
                  draggable
                  onDragStart={(e) => handleDragStart(e, 'music')}
                  onDragOver={handleDragOver}
                  onDragEnd={handleDragEnd}
                  className={`cursor-move transition-opacity ${
                    draggedCard === 'music' ? 'opacity-50' : 'opacity-100'
                  }`}
                >
                  <MusicWidget />
                </div>
              )}

              {visibleCards.calendar && (
                <div
                  key="calendar"
                  draggable
                  onDragStart={(e) => handleDragStart(e, 'calendar')}
                  onDragOver={handleDragOver}
                  onDragEnd={handleDragEnd}
                  className={`cursor-move transition-opacity ${
                    draggedCard === 'calendar' ? 'opacity-50' : 'opacity-100'
                  }`}
                >
                  <CalendarWidget />
                </div>
              )}
            </div>

            {/* Column 3: Countdown + Streak */}
            <div className="flex flex-col gap-3" style={{ width: '380px', flexShrink: 0 }}>
              {visibleCards.countdown && (
                <div
                  key="countdown"
                  draggable
                  onDragStart={(e) => handleDragStart(e, 'countdown')}
                  onDragOver={handleDragOver}
                  onDragEnd={handleDragEnd}
                  className={`cursor-move transition-opacity ${
                    draggedCard === 'countdown' ? 'opacity-50' : 'opacity-100'
                  }`}
                >
                  <CountdownWidget
                    countdowns={countdowns ?? []}
                    onAdd={addCountdown}
                    onDelete={deleteCountdown}
                  />
                </div>
              )}

              {visibleCards.streak && (
                <div
                  key="streak"
                  draggable
                  onDragStart={(e) => handleDragStart(e, 'streak')}
                  onDragOver={handleDragOver}
                  onDragEnd={handleDragEnd}
                  className={`cursor-move transition-opacity ${
                    draggedCard === 'streak' ? 'opacity-50' : 'opacity-100'
                  }`}
                >
                  <StreakWidget streak={streak} />
                </div>
              )}
            </div>
          </div>

          <Footer />
        </div>
      </DesktopLayout>
    );
  }

  // ── Render mobile layout (existing) ──────────────────────────────────────
  return (
    <div className="min-h-screen bg-black text-white">
      <main className="max-w-sm mx-auto px-3 pt-3 pb-24 flex flex-col gap-3">

        {!emailVerified && (
          <VerificationBanner
            onResend={resendVerificationEmail}
            onVerified={checkEmailVerification}
          />
        )}

        <CardSlot visible={visibleCards.pomodoro}>
          <PomodoroTimer />
        </CardSlot>

        <CardSlot visible={visibleCards.calendar}>
          <CalendarWidget />
        </CardSlot>

        <CardSlot visible={visibleCards.streak}>
          <StreakWidget streak={streak} />
        </CardSlot>

        <CardSlot visible={visibleCards.countdown}>
          <CountdownWidget
            countdowns={countdowns ?? []}
            onAdd={addCountdown}
            onDelete={deleteCountdown}
          />
        </CardSlot>

        <CardSlot visible={visibleCards.music}>
          <MusicWidget />
        </CardSlot>

        <Footer />
      </main>

      <BottomNav
        visibleCards={visibleCards}
        toggleCard={toggleCard}
        isLastVisible={isLastVisible}
      />
    </div>
  );
}

// ── CardSlot: fade + collapse animation ─────────────────────────────────────

function CardSlot({ visible, children }) {
  return (
    <div
      style={{
        overflow: 'hidden',
        maxHeight: visible ? '1000px' : '0px',
        opacity: visible ? 1 : 0,
        transition: visible
          ? 'max-height 300ms ease-in, opacity 300ms ease-in'
          : 'max-height 300ms ease-out, opacity 200ms ease-out',
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      {children}
    </div>
  );
} 