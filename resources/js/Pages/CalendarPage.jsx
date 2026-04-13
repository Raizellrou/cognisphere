/**
 * CalendarPage.jsx — Redesigned
 * Full monthly calendar. Glassmorphism cards, blue accent for today,
 * task list with green/blue states. Add task via SlideUpModal.
 * All Firebase hook logic preserved unchanged.
 */

import { useState, useMemo } from 'react';
import { useAuth }            from '@/context/AuthContext';
import { useTheme }           from '@/context/ThemeContext';
import { useCalendarEvents }  from '@/hooks/useCalendarEvents';
import EventModal             from '@/components/calendar/EventModal';
import BottomNav              from '@/components/layout/BottomNav';
import SlideUpModal           from '@/components/ui/SlideUpModal';
import { Plus, Trash2, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

const DAY_LABELS  = ['S','M','T','W','T','F','S'];
const MONTH_NAMES = ['January','February','March','April','May','June',
                     'July','August','September','October','November','December'];
const MONTH_SHORT = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

function toDateStr(date) {
  const y  = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${y}-${mm}-${dd}`;
}

export default function CalendarPage() {
  const { currentUser } = useAuth();
  const { isDark } = useTheme();
  const uid   = currentUser?.uid;
  const today = new Date();

  const colors = isDark
    ? {
        pageBg: '#000000',
        surface: 'rgba(28,28,30,0.8)',
        border: 'rgba(255,255,255,0.06)',
        borderSoft: 'rgba(255,255,255,0.05)',
        textPrimary: '#ffffff',
        textSecondary: 'rgba(255,255,255,0.6)',
        textMuted: 'rgba(255,255,255,0.3)',
        label: 'rgba(255,255,255,0.25)',
        buttonBg: 'rgba(255,255,255,0.07)',
        buttonText: 'rgba(255,255,255,0.6)',
        selectedBg: 'rgba(255,255,255,0.1)',
        eventDot: '#1C9EF9',
        addButtonBg: 'rgba(255,255,255,0.03)',
        addButtonHover: 'rgba(255,255,255,0.06)',
      }
    : {
        pageBg: '#ffffff',
        surface: '#ffffff',
        border: '#e5e7eb',
        borderSoft: 'rgba(0,0,0,0.06)',
        textPrimary: '#000000',
        textSecondary: '#4b5563',
        textMuted: '#6b7280',
        label: '#6b7280',
        buttonBg: 'rgba(15,23,42,0.05)',
        buttonText: '#475569',
        selectedBg: 'rgba(15,23,42,0.05)',
        eventDot: '#1C9EF9',
        addButtonBg: 'rgba(15,23,42,0.04)',
        addButtonHover: 'rgba(15,23,42,0.08)',
      };

  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selected,  setSelected]  = useState(toDateStr(today));
  const [showModal, setShowModal] = useState(false);
  const [modalDate, setModalDate] = useState(null);

  const { eventsByDate, loading, addEvent, deleteEvent, toggleEvent } =
    useCalendarEvents(uid, viewYear, viewMonth);

  const { cells } = useMemo(() => {
    const firstDay    = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    return {
      cells: [
        ...Array(firstDay).fill(null),
        ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
      ],
    };
  }, [viewYear, viewMonth]);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  function makeDateStr(day) {
    return `${viewYear}-${String(viewMonth + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
  }

  const isToday    = (day) => toDateStr(today) === makeDateStr(day);
  const isSelected = (day) => selected === makeDateStr(day);

  const handleDayClick  = (day) => setSelected(makeDateStr(day));
  const handleAddEvent  = (day) => { setModalDate(makeDateStr(day)); setShowModal(true); };

  const selectedEvents  = eventsByDate[selected] || [];
  const selectedDisplay = selected
    ? new Date(selected + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric',
      })
    : '';

  return (
    <div style={{ minHeight: '100vh', background: colors.pageBg, color: colors.textPrimary }}>
      <main style={{ maxWidth: 420, margin: '0 auto', padding: '16px 16px 0' }}>

        {/* Calendar card */}
        <div style={{
          background: colors.surface,
          backdropFilter: 'blur(12px)',
          borderRadius: 20,
          padding: 18,
          marginBottom: 12,
          border: `1px solid ${colors.border}`,
        }}>
          {/* Month header */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
            <div>
              <h1 style={{ color: colors.textPrimary, fontSize: 26, fontWeight: 900, letterSpacing: '-0.5px', lineHeight: 1.1 }}>
                {MONTH_NAMES[viewMonth]}
              </h1>
              <p style={{ color: colors.label, fontSize: 13 }}>{viewYear}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                onClick={() => { setViewYear(today.getFullYear()); setViewMonth(today.getMonth()); setSelected(toDateStr(today)); }}
                style={{
                  padding: '6px 12px', borderRadius: 10,
                  background: colors.buttonBg,
                  border: `1px solid ${colors.border}`,
                  color: colors.buttonText, fontSize: 12, cursor: 'pointer',
                  transition: 'background 150ms ease',
                }}
              >
                Today
              </button>
              <button onClick={prevMonth} style={{ width: 32, height: 32, borderRadius: 10, background: colors.buttonBg, border: `1px solid ${colors.border}`, color: '#1C9EF9', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ChevronLeft width={14} height={14} strokeWidth={2.2} stroke="currentColor" />
              </button>
              <button onClick={nextMonth} style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.07)', color: '#1C9EF9', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ChevronRight width={14} height={14} strokeWidth={2.2} stroke="currentColor" />
              </button>
            </div>
          </div>

          {/* Day labels */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 6 }}>
            {DAY_LABELS.map((d, i) => (
              <div key={i} style={{ textAlign: 'center', color: colors.label, fontSize: 12, fontWeight: 600, padding: '4px 0' }}>{d}</div>
            ))}
          </div>

          {/* Day cells */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', rowGap: 4 }}>
            {cells.map((day, i) => {
              if (!day) return <div key={`e-${i}`} />;
              const dateStr   = makeDateStr(day);
              const hasEvents = !!(eventsByDate[dateStr]?.length);
              const todayFlag = isToday(day);
              const selFlag   = isSelected(day);

              return (
                <div key={dateStr} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 40 }}>
                  <button
                    onClick={() => handleDayClick(day)}
                    style={{
                      width: 36, height: 36, borderRadius: '50%', border: 'none', cursor: 'pointer',
                      background: todayFlag
                        ? '#1C9EF9'
                        : selFlag ? colors.selectedBg : 'transparent',
                      color: todayFlag ? '#fff' : colors.textSecondary,
                      fontSize: 13, fontWeight: todayFlag ? 700 : 400,
                      transition: 'background 150ms ease',
                      position: 'relative',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    {day}
                    {hasEvents && (
                      <span style={{
                        position: 'absolute', bottom: 4,
                        width: 4, height: 4, borderRadius: '50%',
                        background: todayFlag ? 'rgba(255,255,255,0.7)' : '#1C9EF9',
                      }} />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tasks section */}
        <div style={{
          background: colors.surface,
          backdropFilter: 'blur(12px)',
          borderRadius: 20,
          overflow: 'hidden',
          marginBottom: 12,
          border: `1px solid ${colors.border}`,
        }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px', borderBottom: `1px solid ${colors.borderSoft}` }}>
            <div>
              <p style={{ color: colors.textPrimary, fontSize: 14, fontWeight: 600 }}>{selectedDisplay}</p>
              <p style={{ color: colors.textMuted, fontSize: 12 }}>
                {selectedEvents.length === 0 ? 'No tasks' : `${selectedEvents.length} task${selectedEvents.length > 1 ? 's' : ''}`}
              </p>
            </div>
          </div>

          {/* Add task button */}
          <button
            onClick={() => handleAddEvent(parseInt(selected.split('-')[2]))}
            style={{
              width: '100%', padding: '14px 18px', background: colors.addButtonBg, border: 'none',
              borderBottom: `1px solid ${colors.borderSoft}`, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              color: colors.textMuted, fontSize: 13, borderRadius: 0,
              transition: 'background 150ms ease',
            }}
            onMouseEnter={e => e.currentTarget.style.background = colors.addButtonHover}
            onMouseLeave={e => e.currentTarget.style.background = colors.addButtonBg}
          >
            <Plus width={14} height={14} strokeWidth={2.2} stroke="currentColor" />
            Add task
          </button>

          {/* Events list */}
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}>
              <div style={{ width: 20, height: 20, border: `2px solid ${colors.borderSoft}`, borderTop: `2px solid ${colors.textSecondary}`, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
            </div>
          ) : selectedEvents.length === 0 ? (
            <EmptyTasks onAdd={() => handleAddEvent(parseInt(selected.split('-')[2]))} />
          ) : (
            <div>
              {selectedEvents.map(ev => (
                <EventRow key={ev.id} event={ev} onDelete={() => deleteEvent(ev.id)} onToggle={() => toggleEvent(ev.id, !!ev.done)} />
              ))}
            </div>
          )}
        </div>

      </main>

      {showModal && (
        <EventModal date={modalDate} onSave={addEvent} onClose={() => setShowModal(false)} />
      )}

      <BottomNav />

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────────

function EventRow({ event, onDelete, onToggle }) {
  const { isDark } = useTheme();
  const [deleting, setDeleting] = useState(false);
  const done = !!event.done;
  const colors = isDark
    ? {
        background: done ? 'rgba(34,197,94,0.08)' : 'rgba(10,132,255,0.07)',
        border: 'rgba(255,255,255,0.04)',
        text: '#fff',
        description: 'rgba(255,255,255,0.35)',
        delete: 'rgba(255,255,255,0.2)',
        deleteHover: '#ef4444',
      }
    : {
        background: done ? 'rgba(34,197,94,0.08)' : 'rgba(59,130,246,0.12)',
        border: 'rgba(0,0,0,0.08)',
        text: '#111827',
        description: '#6b7280',
        delete: '#6b7280',
        deleteHover: '#dc2626',
      };

  const handleDelete = async () => {
    setDeleting(true);
    try { await onDelete(); }
    catch { setDeleting(false); }
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '14px 18px',
      background: colors.background,
      borderBottom: `1px solid ${colors.border}`,
      transition: 'background 150ms ease',
    }}>
      {/* Checkbox */}
      <div
        onClick={onToggle}
        style={{
          width: 22, height: 22, borderRadius: 6, flexShrink: 0,
          border: `2px solid ${done ? '#22c55e' : '#1C9EF9'}`,
          background: done ? '#22c55e' : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
        }}
      >
        {done && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth={1.8} strokeLinecap="round"/></svg>}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ color: colors.text, fontSize: 14, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {event.title}
        </p>
        {event.description && (
          <p style={{ color: colors.description, fontSize: 12, marginTop: 2, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {event.description}
          </p>
        )}
      </div>

      {/* Delete */}
      <button
        onClick={handleDelete}
        disabled={deleting}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.2)', padding: 4, transition: 'color 150ms ease', flexShrink: 0 }}
        onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
        onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.2)'}
      >
        {deleting
          ? <span style={{ width: 14, height: 14, border: '1.5px solid currentColor', borderTop: '1.5px solid transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'block' }} />
          : <Trash2 width={15} height={15} strokeWidth={2} stroke="currentColor" />
        }
      </button>
    </div>
  );
}

function EmptyTasks({ onAdd }) {
  const { isDark } = useTheme();
  const colors = isDark
    ? {
        surface: 'rgba(255,255,255,0.04)',
        border: 'rgba(255,255,255,0.07)',
        text: 'rgba(255,255,255,0.4)',
        button: '#1C9EF9',
      }
    : {
        surface: 'rgba(15,23,42,0.04)',
        border: 'rgba(15,23,42,0.08)',
        text: '#4b5563',
        button: '#1C9EF9',
      };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 20px', textAlign: 'center' }}>
      <div style={{
        width: 44, height: 44, borderRadius: 14,
        background: colors.surface,
        border: `1px solid ${colors.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12,
      }}>
        <Calendar width={20} height={20} strokeWidth={1.5} stroke={colors.text} />
      </div>
      <p style={{ color: colors.text, fontSize: 13, marginBottom: 8 }}>Nothing scheduled</p>
      <button
        onClick={onAdd}
        style={{ background: 'none', border: 'none', color: colors.button, fontSize: 13, cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3 }}
      >
        + Add a task
      </button>
    </div>
  );
}