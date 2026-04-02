// resources/js/hooks/useStreak.js
import { useEffect, useState } from 'react';
import { doc, onSnapshot, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase';

export function useStreak(uid) {
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;

    // onSnapshot = real-time listener. Updates the UI instantly when data changes.
    const unsubscribe = onSnapshot(doc(db, 'users', uid), (snap) => {
      setStreak(snap.data()?.streak ?? 0);
      setLoading(false);
    });

    return unsubscribe;   // Stop listening when component unmounts
  }, [uid]);

  // Call this when user completes a Pomodoro session
  const incrementStreakIfNewDay = async () => {
    const userRef = doc(db, 'users', uid);
    const today = new Date().toDateString();
    const snap = await getDoc(userRef);
    const last = snap.data()?.lastActiveDate?.toDate()?.toDateString();

    if (last !== today) {
      await updateDoc(userRef, {
        streak: (snap.data()?.streak ?? 0) + 1,
        lastActiveDate: serverTimestamp(),
      });
    }
  };

  return { streak, loading, incrementStreakIfNewDay };
}