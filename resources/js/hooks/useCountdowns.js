// resources/js/hooks/useCountdowns.js
import { useEffect, useState } from 'react';
import {
  collection, onSnapshot, addDoc,
  deleteDoc, doc, serverTimestamp, Timestamp
} from 'firebase/firestore';
import { db } from '@/firebase';

export function useCountdowns(uid) {
  const [countdowns, setCountdowns] = useState([]);

  useEffect(() => {
    if (!uid) return;
    const ref = collection(db, 'users', uid, 'countdowns');
    return onSnapshot(ref, (snap) => {
      setCountdowns(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, [uid]);

  const addCountdown = (name, targetDate) =>
    addDoc(collection(db, 'users', uid, 'countdowns'), {
      name,
      targetDate: Timestamp.fromDate(new Date(targetDate)),
      createdAt: serverTimestamp(),
    });

  const deleteCountdown = (id) =>
    deleteDoc(doc(db, 'users', uid, 'countdowns', id));

  return { countdowns, addCountdown, deleteCountdown };
}