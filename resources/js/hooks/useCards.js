/**
 * useCards.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Manages flashcard CRUD operations in Firestore.
 *
 * Firestore path: users/{uid}/cards/{cardId}
 * Card shape: { id, front, back, tags[], deckId, createdAt }
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useCallback } from 'react';
import {
  collection, onSnapshot, addDoc, updateDoc,
  deleteDoc, doc, serverTimestamp, query, orderBy,
} from 'firebase/firestore';
import { db } from '@/firebase';

export function useCards(uid) {
  const [cards, setCards]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  // ── Live listener for all cards ─────────────────────────────────────────
  useEffect(() => {
    if (!uid) return;

    const q = query(
      collection(db, 'users', uid, 'cards'),
      orderBy('createdAt', 'desc'),
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        setCards(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (err) => {
        console.error('Cards error:', err);
        setError('Failed to load cards.');
        setLoading(false);
      }
    );

    return unsub;
  }, [uid]);

  // ── Add card ────────────────────────────────────────────────────────────
  const addCard = useCallback(async ({ front, back, tags = [] }) => {
    if (!uid || !front.trim() || !back.trim()) return;
    await addDoc(collection(db, 'users', uid, 'cards'), {
      front:     front.trim(),
      back:      back.trim(),
      tags,
      createdAt: serverTimestamp(),
    });
  }, [uid]);

  // ── Update card ─────────────────────────────────────────────────────────
  const updateCard = useCallback(async (cardId, updates) => {
    if (!uid) return;
    await updateDoc(doc(db, 'users', uid, 'cards', cardId), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  }, [uid]);

  // ── Delete card ─────────────────────────────────────────────────────────
  const deleteCard = useCallback(async (cardId) => {
    if (!uid) return;
    await deleteDoc(doc(db, 'users', uid, 'cards', cardId));
  }, [uid]);

  // ── Shuffle helper ──────────────────────────────────────────────────────
  const shuffle = useCallback((arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }, []);

  return { cards, loading, error, addCard, updateCard, deleteCard, shuffle };
}