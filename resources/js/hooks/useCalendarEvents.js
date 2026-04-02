/**
 * useCalendarEvents.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Manages all Firestore read/write operations for calendar events.
 * Fetches only the current month's events to minimize reads.
 *
 * Firestore path: users/{uid}/events/{eventId}
 * Event shape: { id, title, description, date (YYYY-MM-DD), createdAt }
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useCallback } from 'react';
import {
  collection, query, where, onSnapshot,
  addDoc, deleteDoc, doc, serverTimestamp, orderBy,
} from 'firebase/firestore';
import { db } from '@/firebase';

export function useCalendarEvents(uid, viewYear, viewMonth) {
  const [events, setEvents]   = useState([]);  // All events for the month
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  // ── Fetch events for the visible month ─────────────────────────────────
  useEffect(() => {
    if (!uid) return;

    // Build date range strings for the query (YYYY-MM-DD format)
    // Pad month to 2 digits
    const mm    = String(viewMonth + 1).padStart(2, '0');
    const start = `${viewYear}-${mm}-01`;
    // Last day of month
    const lastDay = new Date(viewYear, viewMonth + 1, 0).getDate();
    const end   = `${viewYear}-${mm}-${String(lastDay).padStart(2, '0')}`;

    const eventsRef = collection(db, 'users', uid, 'events');
    const q = query(
      eventsRef,
      where('date', '>=', start),
      where('date', '<=', end),
      orderBy('date', 'asc'),
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        setEvents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (err) => {
        console.error('Calendar events error:', err);
        setError('Failed to load events.');
        setLoading(false);
      }
    );

    return unsub;
  }, [uid, viewYear, viewMonth]);

  // ── Add event ───────────────────────────────────────────────────────────
  const addEvent = useCallback(async ({ title, description = '', date }) => {
    if (!uid || !title.trim() || !date) return;
    await addDoc(collection(db, 'users', uid, 'events'), {
      title:       title.trim(),
      description: description.trim(),
      date,          // stored as "YYYY-MM-DD" string for easy querying
      createdAt:   serverTimestamp(),
    });
  }, [uid]);

  // ── Delete event ────────────────────────────────────────────────────────
  const deleteEvent = useCallback(async (eventId) => {
    if (!uid) return;
    await deleteDoc(doc(db, 'users', uid, 'events', eventId));
  }, [uid]);

  // ── Events grouped by date string ───────────────────────────────────────
  // Returns a Map: "YYYY-MM-DD" → [event, event, ...]
  // Components use this to quickly check if a date has events
  const eventsByDate = events.reduce((acc, ev) => {
    if (!acc[ev.date]) acc[ev.date] = [];
    acc[ev.date].push(ev);
    return acc;
  }, {});

  return { events, eventsByDate, loading, error, addEvent, deleteEvent };
}