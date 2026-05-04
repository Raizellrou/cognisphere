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
import { useIsDesktop }      from '@/hooks/useIsDesktop';
import { resendVerificationEmail } from '@/services/firebaseAuthService';
import { VerificationBanner }      from '@/context/auth/AuthUI';
import { useCardVisibility }       from '@/hooks/useCardVisibility';
import { useCardOrder }            from '@/hooks/useCardOrder';
import { useEffect, useState } from 'react';

import DesktopLayout   from '@/Layouts/DesktopLayout';
import PomodoroTimer   from '@/components/Dashboard/Pomodorotimer';
import CalendarWidget  from '@/components/Dashboard/Calendarwidget';
import StreakWidget    from '@/components/Dashboard/Streakwidget';
import CountdownWidget from '@/components/Dashboard/Countdownwidget';
import MusicWidget     from '@/components/Dashboard/Musicwidget';
import BottomNav       from '@/components/layout/BottomNav';
import Footer          from '@/components/layout/Footer';

export default function Dashboard() {
  const {
    currentUser,
    userProfile,
    emailVerified,
    checkEmailVerification,
  } = useAuth();

  const uid = currentUser?.uid;

  const { streak, completedToday, recordPomodoroSession } = useStreak(uid);
  const { tasks, addTask, toggleTask } = useTasks(uid); 
  const { countdowns, addCountdown, deleteCountdown } = useCountdowns(uid);
  const { visibleCards, toggleCard, isLastVisible }   = useCardVisibility();
  const { cardOrder, reorderCards } = useCardOrder();

  const [draggedCard, setDraggedCard] = useState(null);
  const isDesktop = useIsDesktop();

  // Guard: check uid is loaded
  if (!uid) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-gray-500 text-sm">Loading user data…</p>
      </div>
    );
  }

  // Guard: visibleCards should always be defined from the hook,
  // but this ensures we never render with a broken state
  if (!visibleCards) return null;

  // ── Desktop drag-to-reorder handlers ─────────────────────────────────────
  const handleDragStart = (e, cardKey) => {
    setDraggedCard(cardKey);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', cardKey);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetCardKey) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (draggedCard && draggedCard !== targetCardKey) {
      reorderCards(draggedCard, targetCardKey);
    }
    
    setDraggedCard(null);
  };

  const handleDragEnd = () => {
    setDraggedCard(null);
  };

  // ── Render desktop layout ────────────────────────────────────────────────
  if (isDesktop) {
    // Map card keys to their components
    const cardComponents = {
      pomodoro: visibleCards.pomodoro && (
        <PomodoroTimer onSessionComplete={recordPomodoroSession} />
      ),
      music: visibleCards.music && (
        <MusicWidget />
      ),
      calendar: visibleCards.calendar && (
        <CalendarWidget />
      ),
      countdown: visibleCards.countdown && (
        <CountdownWidget
          countdowns={countdowns ?? []}
          onAdd={addCountdown}
          onDelete={deleteCountdown}
        />
      ),
      streak: visibleCards.streak && (
        <StreakWidget streak={streak} completedToday={completedToday} />
      ),
    };

    // Filter cards to only visible ones and sort by cardOrder
    const visibleCardKeys = cardOrder.filter(key => visibleCards[key]);

    return (
      <DesktopLayout sidebarProps={{ visibleCards, toggleCard, isLastVisible }}>
        <div className="mx-auto px-6 py-4" style={{ maxWidth: '1280px' }}>
          {!emailVerified && (
            <VerificationBanner
              onResend={resendVerificationEmail}
              onVerified={checkEmailVerification}
            />
          )}

          {/* Masonry cards layout — fills gaps automatically */}
          <div 
            className="p-3"
            style={{ 
              columns: 'auto',
              columnWidth: '380px',
              columnGap: '12px',
            }}
          >
            {visibleCardKeys.map((cardKey) => (
              <div
                key={cardKey}
                draggable
                onDragStart={(e) => handleDragStart(e, cardKey)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, cardKey)}
                onDragEnd={handleDragEnd}
                className={`transition-all duration-150 ${
                  draggedCard === cardKey 
                    ? 'opacity-50 scale-95' 
                    : draggedCard 
                    ? 'opacity-70' 
                    : 'opacity-100'
                } ${draggedCard && draggedCard !== cardKey ? 'cursor-grab' : 'cursor-move'}`}
                style={{
                  transform: draggedCard === cardKey ? 'scale(0.95)' : 'scale(1)',
                  breakInside: 'avoid',
                  marginBottom: '12px',
                }}
              >
                {cardComponents[cardKey]}
              </div>
            ))}
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
          <PomodoroTimer onSessionComplete={recordPomodoroSession} />
        </CardSlot>

        <CardSlot visible={visibleCards.calendar}>
          <CalendarWidget />
        </CardSlot>

        <CardSlot visible={visibleCards.streak}>
          <StreakWidget streak={streak} completedToday={completedToday} />
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