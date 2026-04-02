/**
 * EventModal.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Bottom-sheet style modal for adding a new event on a selected date.
 * Slides up from the bottom on mobile, centered on desktop.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect } from 'react';

export default function EventModal({ date, onSave, onClose }) {
  const [title, setTitle]           = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState('');

  // Format display date: "Monday, April 3"
  const displayDate = date
    ? new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric',
      })
    : '';

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleSave = async () => {
    if (!title.trim()) { setError('Event title is required.'); return; }
    setSaving(true);
    setError('');
    try {
      await onSave({ title, description, date });
      onClose();
    } catch {
      setError('Failed to save. Please try again.');
      setSaving(false);
    }
  };

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center
                 justify-center bg-black/70 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Sheet */}
      <div className="w-full sm:max-w-sm bg-[#111] border border-[#1e1e1e]
                      rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl
                      animate-slide-up sm:animate-none">

        {/* Drag handle (mobile) */}
        <div className="w-10 h-1 bg-[#2a2a2a] rounded-full mx-auto mb-5 sm:hidden" />

        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-white font-bold text-base">Add Event</h2>
            <p className="text-gray-500 text-xs mt-0.5">{displayDate}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-white transition-colors p-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Fields */}
        <div className="space-y-3">
          <div>
            <input
              autoFocus
              placeholder="Event title *"
              value={title}
              onChange={e => { setTitle(e.target.value); setError(''); }}
              onKeyDown={e => { if (e.key === 'Enter') handleSave(); }}
              className={`w-full bg-[#1a1a1a] text-white rounded-xl px-4 py-3 text-sm
                         outline-none placeholder-gray-600 transition-all
                         ${error
                           ? 'ring-1 ring-red-500/60'
                           : 'focus:ring-1 focus:ring-white/20'}`}
            />
            {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
          </div>
          <textarea
            placeholder="Description (optional)"
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            className="w-full bg-[#1a1a1a] text-white rounded-xl px-4 py-3 text-sm
                       outline-none placeholder-gray-600 resize-none
                       focus:ring-1 focus:ring-white/20 transition-all"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-5">
          <button
            onClick={onClose}
            className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] text-gray-400
                       text-sm font-semibold py-3 rounded-xl hover:text-white
                       transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-white text-black text-sm font-bold py-3
                       rounded-xl hover:bg-gray-100 transition-colors
                       disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving && (
              <span className="w-3.5 h-3.5 border-2 border-black/30 border-t-black
                               rounded-full animate-spin"/>
            )}
            Save Event
          </button>
        </div>
      </div>
    </div>
  );
}