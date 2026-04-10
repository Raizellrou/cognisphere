/**
 * MoodInput.jsx
 * resources/js/components/music/MoodInput.jsx
 * The AI mood input bar. User types how they feel → gets music suggestions.
 */

import { useState } from 'react';

const MOOD_SUGGESTIONS = [
  'I feel stressed studying 📚',
  'Need focus for deep work 🎯',
  'Feeling tired and slow ☁️',
  'Motivated and energetic ⚡',
  'Relaxing after a long day 🌙',
];

export default function MoodInput({ onSubmit, loading }) {
  const [mood, setMood] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!mood.trim() || loading) return;
    onSubmit(mood.trim());
  };

  return (
    <div className="bg-[#0d1a0e] border border-emerald-900/40 rounded-2xl p-4 mb-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 bg-emerald-950/60 border border-emerald-800/40
                        rounded-lg flex items-center justify-center">
          <span className="text-xs">✨</span>
        </div>
        <p className="text-emerald-400 text-xs font-semibold uppercase tracking-widest">
          AI Music Suggestions
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="flex gap-2">
          <input
            value={mood}
            onChange={e => setMood(e.target.value)}
            placeholder="How are you feeling right now?"
            disabled={loading}
            className="flex-1 bg-[#111] border border-[#1e1e1e] text-white text-sm
                       rounded-xl px-4 py-2.5 outline-none placeholder-gray-600
                       focus:border-emerald-900/60 transition-colors
                       disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!mood.trim() || loading}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50
                       disabled:cursor-not-allowed text-white text-xs font-bold
                       px-4 py-2.5 rounded-xl transition-colors flex items-center gap-1.5
                       flex-shrink-0"
          >
            {loading ? (
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white
                               rounded-full animate-spin"/>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor"
                   viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                      d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            )}
            {loading ? 'Thinking…' : 'Suggest'}
          </button>
        </div>
      </form>

      {/* Quick mood chips */}
      <div className="flex flex-wrap gap-1.5 mt-3">
        {MOOD_SUGGESTIONS.map(s => (
          <button
            key={s}
            onClick={() => { setMood(s); }}
            disabled={loading}
            className="text-[11px] bg-[#111] border border-[#1e1e1e] text-gray-500
                       hover:text-white hover:border-emerald-900/40 px-2.5 py-1
                       rounded-full transition-all disabled:opacity-50"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}