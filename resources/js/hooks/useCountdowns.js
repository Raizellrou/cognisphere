// resources/js/hooks/useCountdowns.js
import { useEffect, useState } from 'react';
import {
  collection, onSnapshot, addDoc,
  deleteDoc, doc, serverTimestamp, Timestamp
} from 'firebase/firestore';
import { db } from '@/firebase';

export function useCountdowns(uid) {
  const [countdowns, setCountdowns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }
    const ref = collection(db, 'users', uid, 'countdowns');
    return onSnapshot(
      ref,
      (snap) => {
        setCountdowns(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
  }, [uid]);

  const addCountdown = (name, targetDate) => {
    setError(null);
    return addDoc(collection(db, 'users', uid, 'countdowns'), {
      name,
      targetDate: Timestamp.fromDate(new Date(targetDate)),
      createdAt: serverTimestamp(),
    }).catch(err => {
      setError('Failed to add countdown. Please try again.');
      throw err;
    });
  };

  const deleteCountdown = (id) =>
    deleteDoc(doc(db, 'users', uid, 'countdowns', id));

  return { countdowns, loading, error, addCountdown, deleteCountdown };
}