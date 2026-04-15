/**
 * Countdownwidget.jsx — Redesigned
 * Countdown timers. Matches design: large "2 DAYS" card style,
 * add form with event name + date picker, delete button.
 * Firebase: replace local state with useCountdowns hook props.
 */

import { useState, useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { Clock, Trash2, ChevronDown, Plus } from 'lucide-react';

function toJsDate(val) {
  if (!val) return null;
  if (val?.toDate) return val.toDate();       // Firestore Timestamp
  return new Date(val);                        // string or number
}

function getTimeLeft(targetDate) {
  const d = toJsDate(targetDate);
  const diff = d ? d - new Date() : -1;
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  return {
    days:    Math.floor(diff / 86400000),
    hours:   Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
    expired: false,
  };
}

function CountdownCard({ name, targetDate, onDelete }) {
  const { isDark } = useTheme();
  const [tl, setTl] = useState(getTimeLeft(targetDate));

  useEffect(() => {
    const id = setInterval(() => setTl(getTimeLeft(targetDate)), 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  const dateLabel = toJsDate(targetDate)?.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  }) ?? '';
  const dayName = toJsDate(targetDate)?.toLocaleDateString('en-US', { weekday: 'long' }) ?? '';

  return (
    <div style={{
      background: isDark ? 'rgba(255,255,255,0.04)' : '#ffffff',
      border: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid #e5e7eb',
      borderRadius: 16,
      padding: '14px 16px',
      marginBottom: 10,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Subtle gradient accent */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: tl.expired ? '#ef4444' : 'rgba(10,132,255,0.5)',
      }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <p style={{ color: isDark ? 'rgba(255,255,255,0.45)' : '#6b7280', fontSize: 11, marginBottom: 2 }}>{dayName}</p>
          {tl.expired ? (
            <p style={{ color: '#ef4444', fontSize: 13, fontWeight: 600 }}>Expired</p>
          ) : (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ color: isDark ? '#fff' : '#111827', fontSize: 44, fontWeight: 900, lineHeight: 1, letterSpacing: '-2px', fontVariantNumeric: 'tabular-nums' }}>
                {tl.days}
              </span>
              <span style={{ color: '#1C9EF9', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em' }}>DAYS</span>
            </div>
          )}
          <p style={{ color: isDark ? 'rgba(255,255,255,0.35)' : '#6b7280', fontSize: 11, marginTop: 4 }}>{dateLabel}</p>
          {!tl.expired && tl.days === 0 && (
            <p style={{ color: isDark ? 'rgba(255,255,255,0.4)' : '#6b7280', fontSize: 11, fontVariantNumeric: 'tabular-nums', marginTop: 2 }}>
              {String(tl.hours).padStart(2,'0')}:{String(tl.minutes).padStart(2,'0')}:{String(tl.seconds).padStart(2,'0')}
            </p>
          )}
        </div>
        <button
          onClick={onDelete}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(17,24,39,0.2)', padding: 4, borderRadius: 8, transition: 'color 150ms ease' }}
          onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
          onMouseLeave={e => e.currentTarget.style.color = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(17,24,39,0.2)'}
        >
          <Trash2 width={16} height={16} strokeWidth={2} stroke="currentColor" />
        </button>
      </div>

      <span style={{ color: isDark ? '#fff' : '#111827', fontSize: 13, fontWeight: 600, marginTop: 8 }}>{name}</span>
    </div>
  );
}

export default function CountdownWidget({ countdowns: propCountdowns, onAdd, onDelete }) {
  const { isDark } = useTheme();
  // Support both prop-driven (Firebase) and local state modes
  const [localCountdowns, setLocalCountdowns] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', date: '' });
  const [dateMode, setDateMode] = useState(false);

  const countdowns = propCountdowns ?? localCountdowns;

  const handleAdd = () => {
    if (!form.name || !form.date) return;
    if (onAdd) {
      onAdd(form.name, form.date);
    } else {
      setLocalCountdowns(prev => [...prev, { id: Date.now(), name: form.name, targetDate: form.date }]);
    }
    setForm({ name: '', date: '' });
    setShowForm(false);
  };

  const handleDelete = (id) => {
    if (onDelete) {
      onDelete(id);
    } else {
      setLocalCountdowns(prev => prev.filter(c => c.id !== id));
    }
  };

  return (
    <div style={{
      background: isDark ? 'rgba(28,28,30,0.8)' : '#ffffff',
      backdropFilter: 'blur(12px)',
      borderRadius: 20,
      padding: 16,
      border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e5e7eb',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <Clock width={16} height={16} strokeWidth={1.8} color="#1C9EF9" />
        <span style={{ color: isDark ? '#fff' : '#111827', fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
          Countdown
        </span>
      </div>

      {/* Empty state */}
      {countdowns.length === 0 && !showForm && (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{
            width: 44, height: 44, borderRadius: '50%',
            border: isDark ? '1.5px solid rgba(255,255,255,0.1)' : '1.5px solid #d1d5db',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 10px',
          }}>
            <Clock width={20} height={20} strokeWidth={1.5} color={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(17,24,39,0.35)'} />
          </div>
          <p style={{ color: isDark ? '#fff' : '#111827', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>No countdowns yet</p>
          <p style={{ color: isDark ? 'rgba(255,255,255,0.3)' : '#6b7280', fontSize: 12 }}>Add event below to start counting down</p>
        </div>
      )}

      {/* Countdown cards */}
      {countdowns.map(c => (
        <CountdownCard
          key={c.id}
          name={c.name}
          targetDate={c.targetDate}
          onDelete={() => handleDelete(c.id)}
        />
      ))}

      {/* Add form */}
      {showForm && (
        <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <input
            style={{
              width: '100%', background: isDark ? 'rgba(255,255,255,0.06)' : '#f8fafc',
              border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #d1d5db',
              borderRadius: 12, padding: '12px 14px',
              color: isDark ? '#fff' : '#111827', fontSize: 13, outline: 'none',
              boxSizing: 'border-box',
            }}
            placeholder="Event Name (Field)"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          />
          <div style={{ position: 'relative' }}>
            <input
              type={dateMode ? 'date' : 'text'}
              style={{
                width: '100%', background: isDark ? 'rgba(255,255,255,0.06)' : '#f8fafc',
                border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #d1d5db',
                borderRadius: 12, padding: '12px 44px 12px 14px',
                color: form.date ? (isDark ? '#fff' : '#111827') : (isDark ? 'rgba(255,255,255,0.3)' : 'rgba(17,24,39,0.35)'),
                fontSize: 13, outline: 'none', boxSizing: 'border-box',
                colorScheme: isDark ? 'dark' : 'light',
              }}
              placeholder="Select Date"
              value={form.date}
              onFocus={() => setDateMode(true)}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
            />
            <ChevronDown width={16} height={16} strokeWidth={2} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(17,24,39,0.35)' }} />
          </div>
          <button
            onClick={handleAdd}
            style={{
              width: '100%', background: '#1C9EF9', color: '#fff',
              border: 'none', borderRadius: 12, padding: '13px 0',
              fontSize: 14, fontWeight: 700, cursor: 'pointer',
              transition: 'background 150ms ease',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#1490e1'}
            onMouseLeave={e => e.currentTarget.style.background = '#1C9EF9'}
          >
            Add
          </button>
          <button
            onClick={() => setShowForm(false)}
            style={{ background: 'none', border: 'none', color: isDark ? 'rgba(255,255,255,0.35)' : '#6b7280', fontSize: 12, cursor: 'pointer', padding: 4 }}
          >
            Cancel
          </button>
        </div>
      )}

      {/* Add button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'none', border: 'none', cursor: 'pointer',
            color: isDark ? 'rgba(255,255,255,0.35)' : '#6b7280', fontSize: 13,
            marginTop: countdowns.length > 0 ? 10 : 14,
            padding: '4px 0',
            transition: 'color 150ms ease',
          }}
          onMouseEnter={e => e.currentTarget.style.color = isDark ? '#fff' : '#111827'}
          onMouseLeave={e => e.currentTarget.style.color = isDark ? 'rgba(255,255,255,0.35)' : '#6b7280'}
        >
          <Plus width={14} height={14} strokeWidth={2.2} />
          Add countdown
        </button>
      )}
    </div>
  );
}