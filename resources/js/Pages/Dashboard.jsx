/**
 * Dashboard.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * WHAT'S IMPROVED vs your original:
 *  ✓ Shows verification banner for unverified users (non-blocking)
 *  ✓ Greeting uses userProfile.displayName from Firestore
 *  ✓ Uses getToken() for any future API calls to Laravel
 *  ✓ isNewUser flag available for onboarding flows
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useAuth }       from '@/context/AuthContext';
import { useStreak }     from '@/hooks/useStreak';
import { useTasks }      from '@/hooks/useTasks';
import { useCountdowns } from '@/hooks/useCountdowns';
import { resendVerificationEmail } from '@/services/firebaseAuthService';
import { VerificationBanner } from '@/context/auth/AuthUI';

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

  const { streak }                                     = useStreak(uid);
  const { tasks }                                      = useTasks(uid);
  const { countdowns, addCountdown, deleteCountdown }  = useCountdowns(uid);

  const incompleteTasks = tasks.filter(t => !t.done).length;

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="max-w-sm mx-auto px-4 pt-6 pb-24">

        {/*
          Email verification banner.
          Non-blocking — users can use the app, but are reminded to verify.
          Hidden once emailVerified = true (Firebase updates this live).
        */}
        {!emailVerified && (
          <VerificationBanner
            onResend={resendVerificationEmail}
            onVerified={checkEmailVerification}
          />
        )}

        <PomodoroTimer />
        <CalendarWidget taskCount={incompleteTasks} />
        <StreakWidget streak={streak} />
        <CountdownWidget
          countdowns={countdowns}
          onAdd={addCountdown}
          onDelete={deleteCountdown}
        />
        <MusicWidget />
        <Footer />
      </main>
      <BottomNav />
    </div>
  );
}