/**
 * useCardVisibility.js
 * Manages which dashboard cards are visible.
 * Persists to localStorage so choices survive refresh.
 *
 * Returns:
 *   visibleCards   — { pomodoro: bool, calendar: bool, ... }
 *   toggleCard     — (key: string) => void
 *   isLastVisible  — (key: string) => bool
 */

import { useState, useCallback } from 'react';

const STORAGE_KEY = 'cogni_visible_cards';

const DEFAULT_VISIBLE_CARDS = {
  pomodoro:  true,
  calendar:  true,
  streak:    true,
  countdown: true,
  music:     true,
};

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_VISIBLE_CARDS;

    const parsed = JSON.parse(raw);

    // Merge with defaults so new keys are never missing
    return { ...DEFAULT_VISIBLE_CARDS, ...parsed };
  } catch {
    return DEFAULT_VISIBLE_CARDS;
  }
}

export function useCardVisibility() {
  const [visibleCards, setVisibleCards] = useState(() => loadFromStorage());

  const toggleCard = useCallback((key) => {
    setVisibleCards((prev) => {
      // Safety: never toggle an unknown key
      if (!(key in DEFAULT_VISIBLE_CARDS)) return prev;

      const next = { ...prev, [key]: !prev[key] };

      // Persist
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // localStorage unavailable (private mode, etc.) — silently skip
      }

      return next;
    });
  }, []);

  const isLastVisible = useCallback(
    (key) => {
      if (!visibleCards[key]) return false; // already hidden — not "the last"
      const visibleCount = Object.values(visibleCards).filter(Boolean).length;
      return visibleCount === 1;
    },
    [visibleCards],
  );

  return { visibleCards, toggleCard, isLastVisible };
}