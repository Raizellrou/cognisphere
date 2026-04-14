/**
 * Dashboard.jsx — Fixed
 * Cards are shown/hidden based on visibleCards state from useCardVisibility.
 * The hook is passed down to BottomNav so CardsManagerModal can toggle them.
 *
 * Desktop (lg+): renders with DesktopLayout + sortable card grid
 * Mobile (< lg): renders existing mobile layout + BottomNav
 */

import { useAuth }           from '@/context/AuthContext';
import { useStreak }         from '@/hooks/useStreak';
import { useTasks }          from '@/hooks/useTasks';
import { useCountdowns }     from '@/hooks/useCountdowns';
import { resendVerificationEmail } from '@/services/firebaseAuthService';
import { VerificationBanner }      from '@/context/auth/AuthUI';
import { useCardVisibility }       from '@/hooks/useCardVisibility';
import { useEffect, useState }     from 'react';

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

// ── Card order persistence ──────────────────────────────────────────────────
const CARD_ORDER_KEY = 'cogni_card_order';
const DEFAULT_CARD_ORDER = ['pomodoro', 'calendar', 'streak', 'countdown', 'music'];

function loadCardOrder() {
  try {
    const stored = localStorage.getItem(CARD_ORDER_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length === DEFAULT_CARD_ORDER.length) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return DEFAULT_CARD_ORDER;
}

function saveCardOrder(order) {
  try {
    localStorage.setItem(CARD_ORDER_KEY, JSON.stringify(order));
  } catch {
    // ignore (localStorage unavailable)
  }
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

  const [cardOrder, setCardOrder] = useState(() => loadCardOrder());
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

  const handleDrop = (e, targetKey) => {
    e.preventDefault();
    if (!draggedCard || draggedCard === targetKey) {
      setDraggedCard(null);
      return;
    }

    const draggedIdx = cardOrder.indexOf(draggedCard);
    const targetIdx = cardOrder.indexOf(targetKey);

    const newOrder = [...cardOrder];
    newOrder.splice(draggedIdx, 1);
    newOrder.splice(targetIdx, 0, draggedCard);

    setCardOrder(newOrder);
    saveCardOrder(newOrder);
    setDraggedCard(null);
  };

  const handleDragEnd = () => {
    setDraggedCard(null);
  };

  // ── Render desktop layout ────────────────────────────────────────────────
  if (isDesktop) {
    return (
      <DesktopLayout sidebarProps={{ visibleCards, toggleCard, isLastVisible }}>
        <div className="max-w-7xl mx-auto px-6 py-8">
          {!emailVerified && (
            <VerificationBanner
              onResend={resendVerificationEmail}
              onVerified={checkEmailVerification}
            />
          )}

          {/* Cards grid — 3 columns */}
          <div className="grid grid-cols-3 gap-6 mb-12">
            {cardOrder.map((cardKey) => {
              const isVisible = visibleCards[cardKey];
              if (!isVisible) return null;

              return (
                <div
                  key={cardKey}
                  draggable
                  onDragStart={(e) => handleDragStart(e, cardKey)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, cardKey)}
                  onDragEnd={handleDragEnd}
                  className={`cursor-move transition-opacity ${
                    draggedCard === cardKey ? 'opacity-50' : 'opacity-100'
                  }`}
                >
                  {cardKey === 'pomodoro' && <PomodoroTimer />}
                  {cardKey === 'calendar' && <CalendarWidget />}
                  {cardKey === 'streak' && <StreakWidget streak={streak} />}
                  {cardKey === 'countdown' && (
                    <CountdownWidget
                      countdowns={countdowns ?? []}
                      onAdd={addCountdown}
                      onDelete={deleteCountdown}
                    />
                  )}
                  {cardKey === 'music' && <MusicWidget />}
                </div>
              );
            })}
          </div>

          <Footer />
        </div>
      </DesktopLayout>
    );
  }

  // ── Render mobile layout (existing) ──────────────────────────────────────
  return (
    <div className="min-h-screen bg-black text-white">
      <main className="max-w-sm mx-auto px-4 pt-6 pb-24">

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