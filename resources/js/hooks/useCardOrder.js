/**
 * useCardOrder.js
 * Manages dashboard card ordering for drag-and-drop reordering.
 * Persists to localStorage.
 *
 * Returns:
 *   cardOrder     — array of card keys in display order
 *   reorderCards  — (draggedKey, targetKey) => void
 *   resetOrder    — () => void
 */

import { useState, useCallback } from 'react';

const STORAGE_KEY = 'cogni_card_order';

const DEFAULT_CARD_ORDER = ['pomodoro', 'music', 'calendar', 'countdown', 'streak'];

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CARD_ORDER;

    const parsed = JSON.parse(raw);
    
    // Validate that all default cards are present
    if (!Array.isArray(parsed)) return DEFAULT_CARD_ORDER;
    
    // Add any missing cards that were added in updates
    const existing = new Set(parsed);
    const allCards = [...parsed, ...DEFAULT_CARD_ORDER.filter(c => !existing.has(c))];
    
    return allCards.length === DEFAULT_CARD_ORDER.length ? allCards : DEFAULT_CARD_ORDER;
  } catch {
    return DEFAULT_CARD_ORDER;
  }
}

export function useCardOrder() {
  const [cardOrder, setCardOrder] = useState(() => loadFromStorage());

  const reorderCards = useCallback((draggedKey, targetKey) => {
    if (draggedKey === targetKey) return;

    setCardOrder((prev) => {
      const dragIndex = prev.indexOf(draggedKey);
      const targetIndex = prev.indexOf(targetKey);

      if (dragIndex === -1 || targetIndex === -1) return prev;

      const next = [...prev];
      next.splice(dragIndex, 1); // Remove dragged card
      
      // Insert at new position
      const insertIndex = dragIndex < targetIndex ? targetIndex - 1 : targetIndex;
      next.splice(insertIndex, 0, draggedKey);

      // Persist
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // localStorage unavailable (private mode, etc.) — silently skip
      }

      return next;
    });
  }, []);

  const resetOrder = useCallback(() => {
    setCardOrder(DEFAULT_CARD_ORDER);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // silently skip
    }
  }, []);

  return { cardOrder, reorderCards, resetOrder };
}
