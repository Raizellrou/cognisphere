/**
 * AddCardModal.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Bottom-sheet modal for creating a new flashcard.
 * Has front (question) + back (answer) fields with live preview.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { X, ArrowUpDown } from 'lucide-react';

export default function AddCardModal({ onSave, onClose }) {
  const { isDark } = useTheme();
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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center backdrop-blur-sm"
      style={{ backgroundColor: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.35)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl" style={{
        backgroundColor: isDark ? '#111' : '#ffffff',
        borderColor: isDark ? '#1e1e1e' : '#e5e7eb',
        borderWidth: '1px'
      }}>

        {/* Drag handle */}
        <div className="w-10 h-1 rounded-full mx-auto mb-5 sm:hidden" style={{
          backgroundColor: isDark ? '#2a2a2a' : '#d1d5db'
        }}/>

        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-base" style={{ color: isDark ? '#ffffff' : '#111827' }}>New Flashcard</h2>
          <button onClick={onClose}
                  className="transition-colors p-1" style={{
                    color: isDark ? '#666' : '#999'
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = isDark ? '#fff' : '#111827'}
                  onMouseLeave={e => e.currentTarget.style.color = isDark ? '#666' : '#999'}>
            <X width={20} height={20} strokeWidth={2} stroke="currentColor" />
          </button>
        </div>

        <div className="space-y-3">
          {/* Front */}
          <div>
            <label className="text-xs font-medium block mb-1" style={{
              color: isDark ? '#999' : '#6b7280'
            }}>
              Front (Question)
            </label>
            <textarea
              autoFocus
              rows={3}
              placeholder="What is the question?"
              value={front}
              onChange={e => { setFront(e.target.value); setError(''); }}
              className="w-full rounded-xl px-4 py-3 text-sm outline-none placeholder-gray-600 resize-none transition-all"
              style={{
                backgroundColor: isDark ? '#1a1a1a' : '#f8fafc',
                color: isDark ? '#fff' : '#111827',
                borderWidth: '1px',
                borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#d1d5db'
              }}
            />
          </div>

          {/* Divider with flip icon */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{
              backgroundColor: isDark ? '#2a2a2a' : '#d1d5db'
            }}/>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{
              backgroundColor: isDark ? '#1a1a1a' : '#f8fafc',
              borderWidth: '1px',
              borderColor: isDark ? '#2a2a2a' : '#d1d5db'
            }}>
              <ArrowUpDown width={14} height={14} strokeWidth={2} style={{
                color: isDark ? '#666' : '#999'
              }} stroke="currentColor" />
            </div>
            <div className="flex-1 h-px" style={{
              backgroundColor: isDark ? '#2a2a2a' : '#d1d5db'
            }}/>
          </div>

          {/* Back */}
          <div>
            <label className="text-xs font-medium block mb-1" style={{
              color: isDark ? '#999' : '#6b7280'
            }}>
              Back (Answer)
            </label>
            <textarea
              rows={3}
              placeholder="What is the answer?"
              value={back}
              onChange={e => { setBack(e.target.value); setError(''); }}
              className="w-full rounded-xl px-4 py-3 text-sm outline-none placeholder-gray-600 resize-none transition-all"
              style={{
                backgroundColor: isDark ? '#1a1a1a' : '#f8fafc',
                color: isDark ? '#fff' : '#111827',
                borderWidth: '1px',
                borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#d1d5db'
              }}
            />
          </div>

          {error && <p className="text-xs" style={{ color: '#ef4444' }}>{error}</p>}
        </div>

        <div className="flex gap-3 mt-5">
          <button onClick={onClose}
                  className="flex-1 text-sm font-semibold py-3 rounded-xl transition-colors" style={{
                    backgroundColor: isDark ? '#1a1a1a' : '#f8fafc',
                    borderWidth: '1px',
                    borderColor: isDark ? '#2a2a2a' : '#d1d5db',
                    color: isDark ? '#999' : '#6b7280'
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = isDark ? '#fff' : '#111827'}
                  onMouseLeave={e => e.currentTarget.style.color = isDark ? '#999' : '#6b7280'}>
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 text-sm font-bold py-3 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            style={{
              backgroundColor: '#1C9EF9',
              color: '#ffffff'
            }}
          >
            {saving && (
              <span className="w-3.5 h-3.5 border-2 rounded-full animate-spin" style={{
                borderColor: 'rgba(255,255,255,0.3)',
                borderTopColor: '#ffffff'
              }}/>
            )}
            Add Card
          </button>
        </div>
      </div>
    </div>
  );
}