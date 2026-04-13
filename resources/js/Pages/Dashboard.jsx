/**
 * Dashboard.jsx — Fixed
 * Cards are shown/hidden based on visibleCards state from useCardVisibility.
 * The hook is passed down to BottomNav so CardsManagerModal can toggle them.
 */

import { useAuth }           from '@/context/AuthContext';
import { useStreak }         from '@/hooks/useStreak';
import { useTasks }          from '@/hooks/useTasks';
import { useCountdowns }     from '@/hooks/useCountdowns';
import { resendVerificationEmail } from '@/services/firebaseAuthService';
import { VerificationBanner }      from '@/context/auth/AuthUI';
import { useCardVisibility }       from '@/hooks/useCardVisibility';

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

  const { streak }                                    = useStreak(uid);
  const { tasks, addTask, toggleTask } = useTasks(uid); 
  const { countdowns, addCountdown, deleteCountdown } = useCountdowns(uid);
  const { visibleCards, toggleCard, isLastVisible }   = useCardVisibility();

  // Guard: visibleCards should always be defined from the hook,
  // but this ensures we never render with a broken state
  if (!visibleCards) return null;

  const incompleteTasks = (tasks ?? []).filter(t => !t.done).length;

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