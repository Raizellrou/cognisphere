/**
 * CalendarPage.jsx — Redesigned with desktop layout support
 * Full monthly calendar. Glassmorphism cards, blue accent for today,
 * task list with green/blue states. Add task via SlideUpModal.
 * Desktop: Two-column layout with calendar + Focus Tasks panel
 */

import { useState, useMemo, useEffect } from 'react';
import { useAuth }            from '@/context/AuthContext';
import { useTheme }           from '@/context/ThemeContext';
import { useCalendarEvents }  from '@/hooks/useCalendarEvents';
import { useTasks }           from '@/hooks/useTasks';
import EventModal             from '@/components/calendar/EventModal';
import DesktopLayout          from '@/Layouts/DesktopLayout';
import BottomNav              from '@/components/layout/BottomNav';
import SlideUpModal           from '@/components/ui/SlideUpModal';
import { Plus, Trash2, Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';

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

// ── Desktop breakpoint hook ─────────────────────────────────────────────────
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth >= 1024;
  });

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const handler = (e) => setIsDesktop(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return isDesktop;
}

export default function CalendarPage() {
  const { currentUser } = useAuth();
  const { isDark } = useTheme();
  const uid   = currentUser?.uid;
  const today = new Date();
  const isDesktop = useIsDesktop();
  const [showTaskPanel, setShowTaskPanel] = useState(true);

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

  const { tasks, addTask, toggleTask, deleteTask } = useTasks(uid);

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

  // ── Desktop layout ───────────────────────────────────────────────────────
  if (isDesktop) {
    return (
      <DesktopLayout>
        <div className="flex flex-1 overflow-hidden bg-[#f8fafc] dark:bg-[#0a0a0a]">
          {/* Left: Calendar */}
          <div className="flex-1 overflow-y-auto p-6 border-r border-[#e5e7eb] dark:border-[rgba(255,255,255,0.07)]">
            <CalendarComponent
              viewYear={viewYear}
              viewMonth={viewMonth}
              prevMonth={prevMonth}
              nextMonth={nextMonth}
              cells={cells}
              today={today}
              selected={selected}
              toDateStr={toDateStr}
              makeDateStr={makeDateStr}
              isToday={isToday}
              isSelected={isSelected}
              handleDayClick={handleDayClick}
              eventsByDate={eventsByDate}
              colors={colors}
              isDark={isDark}
            />
          </div>

          {/* Right: Focus Tasks panel (300px fixed) */}
          {showTaskPanel && (
            <div
              style={{
                width: 300,
                borderLeft: `1px solid ${colors.border}`,
                backgroundColor: colors.pageBg,
                display: 'flex',
                flexDirection: 'column',
                flexShrink: 0,
              }}
            >
              {/* Header */}
              <div
                style={{
                  flexShrink: 0,
                  padding: '16px',
                  borderBottom: `1px solid ${colors.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <p style={{ fontSize: 13, fontWeight: 700, color: colors.textPrimary }}>
                  🗒️ Focus Tasks
                </p>
                <button
                  onClick={() => setShowTaskPanel(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: colors.textMuted,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Filter chips */}
              <div style={{ flexShrink: 0, padding: '12px 16px', display: 'flex', gap: 8, overflow: 'x-auto' }}>
                <button
                  style={{
                    padding: '6px 12px',
                    borderRadius: 12,
                    border: `1px solid ${colors.border}`,
                    backgroundColor: 'transparent',
                    color: colors.textMuted,
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  All Tasks
                </button>
                <button
                  style={{
                    padding: '6px 12px',
                    borderRadius: 12,
                    border: `1px solid ${colors.border}`,
                    backgroundColor: 'transparent',
                    color: colors.textMuted,
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  All Tags
                </button>
              </div>

              {/* + Add Task button */}
              <button
                onClick={() => handleAddEvent(parseInt(selected.split('-')[2]))}
                style={{
                  margin: '0 12px',
                  marginTop: 8,
                  padding: '10px 12px',
                  width: 'calc(100% - 24px)',
                  backgroundColor: '#1C9EF9',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <Plus size={14} />
                Add Task
              </button>

              {/* Task list */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
                {tasks && tasks.length > 0 ? (
                  tasks.map(task => (
                    <div
                      key={task.id}
                      style={{
                        padding: '10px 12px',
                        marginBottom: 8,
                        borderRadius: 6,
                        backgroundColor: task.done ? 'rgba(34,197,94,0.12)' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={task.done}
                        onChange={() => toggleTask(task.id, !task.done)}
                        style={{ cursor: 'pointer' }}
                      />
                      <span
                        style={{
                          flex: 1,
                          fontSize: 12,
                          color: task.done ? colors.textMuted : colors.textPrimary,
                          textDecoration: task.done ? 'line-through' : 'none',
                        }}
                      >
                        {task.title}
                      </span>
                      <span
                        style={{
                          fontSize: 10,
                          color: colors.textMuted,
                        }}
                      >
                        {task.done ? '1/1' : '0/1'}
                      </span>
                    </div>
                  ))
                ) : (
                  <p style={{ fontSize: 12, color: colors.textMuted, textAlign: 'center', marginTop: 24 }}>
                    No tasks yet
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Toggle button when panel is closed */}
          {!showTaskPanel && (
            <button
              onClick={() => setShowTaskPanel(true)}
              style={{
                width: 48,
                borderLeft: `1px solid ${colors.border}`,
                backgroundColor: colors.pageBg,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: colors.textMuted,
              }}
              title="Show Focus Tasks"
            >
              📋
            </button>
          )}
        </div>
      </DesktopLayout>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // MOBILE LAYOUT (existing)
  // ─────────────────────────────────────────────────────────────────────────

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
              <button onClick={nextMonth} style={{ width: 32, height: 32, borderRadius: 10, background: colors.buttonBg, border: `1px solid ${colors.border}`, color: '#1C9EF9', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ChevronRight width={14} height={14} strokeWidth={2.2} stroke="currentColor" />
              </button>
            </div>
          </div>

          {/* Day labels */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 12 }}>
            {DAY_LABELS.map(label => (
              <div key={label} style={{ textAlign: 'center', fontSize: 11, fontWeight: 600, color: colors.label }}>
                {label}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
            {cells.map((day, i) => {
              if (day === null) {
                return <div key={`empty-${i}`} />;
              }
              const dateStr = makeDateStr(day);
              return (
                <div
                  key={day}
                  onClick={() => handleDayClick(day)}
                  style={{
                    aspectRatio: '1',
                    borderRadius: 10,
                    border: `1px solid ${isSelected(day) ? '#1C9EF9' : colors.border}`,
                    background: isToday(day) ? 'rgba(28, 158, 249, 0.12)' : isSelected(day) ? colors.selectedBg : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: colors.textPrimary,
                    fontSize: 13,
                    fontWeight: isToday(day) ? 700 : 500,
                    position: 'relative',
                    transition: 'all 150ms ease',
                  }}
                >
                  {day}
                  {(eventsByDate[dateStr] || []).length > 0 && (
                    <div style={{
                      position: 'absolute',
                      bottom: 4, left: '50%', transform: 'translateX(-50%)',
                      width: 4, height: 4,
                      borderRadius: '50%',
                      background: colors.eventDot,
                    }} />
                  )}
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

// ── CalendarComponent (shared between desktop & mobile) ────────────────────

function CalendarComponent({
  viewYear,
  viewMonth,
  prevMonth,
  nextMonth,
  cells,
  today,
  selected,
  toDateStr,
  makeDateStr,
  isToday,
  isSelected,
  handleDayClick,
  eventsByDate,
  colors,
  isDark,
}) {
  return (
    <div>
      {/* Month header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: colors.textPrimary, marginBottom: 8 }}>
          {MONTH_NAMES[viewMonth]}
        </h1>
        <p style={{ fontSize: 14, color: colors.textMuted }}>{viewYear}</p>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <button
          onClick={() => {
            // reset to today
          }}
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            border: `1px solid ${colors.border}`,
            backgroundColor: 'transparent',
            color: colors.textPrimary,
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Today
        </button>
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            onClick={prevMonth}
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              border: `1px solid ${colors.border}`,
              backgroundColor: 'transparent',
              color: '#1C9EF9',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={nextMonth}
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              border: `1px solid ${colors.border}`,
              backgroundColor: 'transparent',
              color: '#1C9EF9',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Day labels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, marginBottom: 12 }}>
        {DAY_LABELS.map(label => (
          <div key={label} style={{ textAlign: 'center', fontSize: 12, fontWeight: 700, color: colors.label, marginBottom: 8 }}>
            {label}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
        {cells.map((day, i) => {
          if (day === null) {
            return <div key={`empty-${i}`} />;
          }
          const dateStr = makeDateStr(day);
          return (
            <button
              key={day}
              onClick={() => handleDayClick(day)}
              style={{
                aspectRatio: '1',
                borderRadius: 12,
                border: `1px solid ${isSelected(day) ? '#1C9EF9' : colors.border}`,
                background: isToday(day) ? 'rgba(28, 158, 249, 0.12)' : isSelected(day) ? colors.selectedBg : 'transparent',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: colors.textPrimary,
                fontSize: 14,
                fontWeight: isToday(day) ? 700 : 500,
                position: 'relative',
                transition: 'all 150ms ease',
              }}
            >
              {day}
              {(eventsByDate[dateStr] || []).length > 0 && (
                <div style={{
                  marginTop: 4,
                  width: 4,
                  height: 4,
                  borderRadius: '50%',
                  background: '#1C9EF9',
                }} />
              )}
            </button>
          );
        })}
      </div>
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