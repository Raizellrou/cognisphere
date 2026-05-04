import { useEffect, useState } from 'react';
import { doc, onSnapshot, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase';

// ── Local date helpers (not exported) ───────────────────────────────────────
function getTodayStr() {
  const now = new Date();
  return toDateStr(now);
}

function getYesterdayStr() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return toDateStr(yesterday);
}

function toDateStr(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function useStreak(uid) {
  const [streak, setStreak] = useState(0);
  const [completedToday, setCompletedToday] = useState(false);
  const [loading, setLoading] = useState(true);

  // ── Real-time listener with onSnapshot ────────────────────────────────────
  useEffect(() => {
    if (!uid) return;

    const unsubscribe = onSnapshot(doc(db, 'users', uid), (snap) => {
      const data = snap.data();
      setStreak(data?.streak ?? 0);

      // Compare lastActiveDate to today's local date (YYYY-MM-DD string)
      const lastActiveDate = data?.lastActiveDate?.toDate ? data.lastActiveDate.toDate() : null;
      const lastActiveDateStr = lastActiveDate ? toDateStr(lastActiveDate) : null;
      const today = getTodayStr();

      setCompletedToday(lastActiveDateStr === today);
      setLoading(false);
    });

    return unsubscribe;
  }, [uid]);

  // ── Record a Pomodoro session (idempotent) ────────────────────────────────
  const recordPomodoroSession = async () => {
    if (!uid) return;

    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    const data = snap.data();

    const lastActiveDate = data?.lastActiveDate?.toDate ? data.lastActiveDate.toDate() : null;
    const lastActiveDateStr = lastActiveDate ? toDateStr(lastActiveDate) : null;
    const today = getTodayStr();
    const yesterday = getYesterdayStr();

    let newStreak = data?.streak ?? 0;

    // Already completed today — do nothing (idempotent)
    if (lastActiveDateStr === today) {
      return;
    }

    // Last active was yesterday — increment streak
    if (lastActiveDateStr === yesterday) {
      newStreak = (data?.streak ?? 0) + 1;
    } else {
      // Last active is older or null — reset to 1
      newStreak = 1;
    }

    // Write to Firestore
    await updateDoc(userRef, {
      streak: newStreak,
      lastActiveDate: serverTimestamp(),
    });
  };

  return { streak, completedToday, loading, recordPomodoroSession };
}