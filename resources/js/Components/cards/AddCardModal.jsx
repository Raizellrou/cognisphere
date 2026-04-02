/**
 * AddCardModal.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Bottom-sheet modal for creating a new flashcard.
 * Has front (question) + back (answer) fields with live preview.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect } from 'react';

export default function AddCardModal({ onSave, onClose }) {
  const [front, setFront]   = useState('');
  const [back, setBack]     = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleSave = async () => {
    if (!front.trim()) { setError('Question (front) is required.'); return; }
    if (!back.trim())  { setError('Answer (back) is required.');    return; }
    setSaving(true);
    setError('');
    try {
      await onSave({ front, back });
      onClose();
    } catch {
      setError('Failed to save. Try again.');
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center
                 bg-black/70 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full sm:max-w-sm bg-[#111] border border-[#1e1e1e]
                      rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl">

        {/* Drag handle */}
        <div className="w-10 h-1 bg-[#2a2a2a] rounded-full mx-auto mb-5 sm:hidden"/>

        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white font-bold text-base">New Flashcard</h2>
          <button onClick={onClose}
                  className="text-gray-600 hover:text-white transition-colors p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="space-y-3">
          {/* Front */}
          <div>
            <label className="text-gray-500 text-xs font-medium block mb-1">
              Front (Question)
            </label>
            <textarea
              autoFocus
              rows={3}
              placeholder="What is the question?"
              value={front}
              onChange={e => { setFront(e.target.value); setError(''); }}
              className="w-full bg-[#1a1a1a] text-white rounded-xl px-4 py-3 text-sm
                         outline-none placeholder-gray-600 resize-none
                         focus:ring-1 focus:ring-white/20 transition-all"
            />
          </div>

          {/* Divider with flip icon */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-[#2a2a2a]"/>
            <div className="w-7 h-7 bg-[#1a1a1a] rounded-lg border border-[#2a2a2a]
                            flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor"
                   viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/>
              </svg>
            </div>
            <div className="flex-1 h-px bg-[#2a2a2a]"/>
          </div>

          {/* Back */}
          <div>
            <label className="text-gray-500 text-xs font-medium block mb-1">
              Back (Answer)
            </label>
            <textarea
              rows={3}
              placeholder="What is the answer?"
              value={back}
              onChange={e => { setBack(e.target.value); setError(''); }}
              className="w-full bg-[#1a1a1a] text-white rounded-xl px-4 py-3 text-sm
                         outline-none placeholder-gray-600 resize-none
                         focus:ring-1 focus:ring-white/20 transition-all"
            />
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}
        </div>

        <div className="flex gap-3 mt-5">
          <button onClick={onClose}
                  className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] text-gray-400
                             text-sm font-semibold py-3 rounded-xl hover:text-white
                             transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-white text-black text-sm font-bold py-3 rounded-xl
                       hover:bg-gray-100 transition-colors disabled:opacity-50
                       flex items-center justify-center gap-2"
          >
            {saving && (
              <span className="w-3.5 h-3.5 border-2 border-black/30 border-t-black
                               rounded-full animate-spin"/>
            )}
            Add Card
          </button>
        </div>
      </div>
    </div>
  );
}