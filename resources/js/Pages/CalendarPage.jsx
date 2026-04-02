/**
 * CalendarPage.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Full monthly calendar with:
 *  - Month navigation with smooth transitions
 *  - Event dots on dates that have events
 *  - Day selection → shows events for that day
 *  - Add event via EventModal (bottom sheet)
 *  - Firestore real-time sync via useCalendarEvents
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useMemo } from 'react';
import { useAuth }            from '@/context/AuthContext';
import { useCalendarEvents }  from '@/hooks/useCalendarEvents';
import EventModal             from '@/components/calendar/EventModal';
import BottomNav              from '@/components/layout/BottomNav';

const DAY_LABELS   = ['S','M','T','W','T','F','S'];
const MONTH_NAMES  = ['January','February','March','April','May','June',
                      'July','August','September','October','November','December'];

// "YYYY-MM-DD" from a Date object, local time
function toDateStr(date) {
  const y  = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${y}-${mm}-${dd}`;
}

export default function CalendarPage() {
  const { currentUser } = useAuth();
  const uid = currentUser?.uid;
  const today = new Date();

  // ── View state ────────────────────────────────────────────────────────────
  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selected,  setSelected]  = useState(toDateStr(today)); // "YYYY-MM-DD"
  const [showModal, setShowModal] = useState(false);
  const [modalDate, setModalDate] = useState(null);

  // ── Firestore ─────────────────────────────────────────────────────────────
  const { eventsByDate, loading, addEvent, deleteEvent } =
    useCalendarEvents(uid, viewYear, viewMonth);

  // ── Calendar grid cells ───────────────────────────────────────────────────
  const { cells, daysInMonth } = useMemo(() => {
    const firstDay   = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells = [
      ...Array(firstDay).fill(null),
      ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];
    return { cells, daysInMonth };
  }, [viewYear, viewMonth]);

  // ── Navigation ────────────────────────────────────────────────────────────
  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  // ── Day helpers ───────────────────────────────────────────────────────────
  const isToday  = (day) => toDateStr(today) === makeDateStr(day);
  const isSelected = (day) => selected === makeDateStr(day);

  function makeDateStr(day) {
    const mm = String(viewMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${viewYear}-${mm}-${dd}`;
  }

  const handleDayClick = (day) => {
    setSelected(makeDateStr(day));
  };

  const handleAddEvent = (day) => {
    setModalDate(makeDateStr(day));
    setShowModal(true);
  };

  // ── Events for selected day ───────────────────────────────────────────────
  const selectedEvents = eventsByDate[selected] || [];
  const selectedDisplay = selected
    ? new Date(selected + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric',
      })
    : '';

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="max-w-sm mx-auto px-4 pt-6 pb-28">

        {/* ── Month Header ──────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-white text-xl font-black tracking-tight">
              {MONTH_NAMES[viewMonth]}
            </h1>
            <p className="text-gray-600 text-xs">{viewYear}</p>
          </div>
          <div className="flex items-center gap-1">
            {/* Today button */}
            <button
              onClick={() => {
                setViewYear(today.getFullYear());
                setViewMonth(today.getMonth());
                setSelected(toDateStr(today));
              }}
              className="text-gray-500 hover:text-white text-xs px-3 py-1.5
                         rounded-lg border border-[#2a2a2a] hover:border-[#3a3a3a]
                         transition-colors mr-1"
            >
              Today
            </button>
            <button
              onClick={prevMonth}
              className="w-8 h-8 flex items-center justify-center rounded-lg
                         text-gray-500 hover:text-white hover:bg-[#1a1a1a] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <button
              onClick={nextMonth}
              className="w-8 h-8 flex items-center justify-center rounded-lg
                         text-gray-500 hover:text-white hover:bg-[#1a1a1a] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        </div>

        {/* ── Calendar Grid ─────────────────────────────────────────── */}
        <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-4 mb-4">
          {/* Day labels */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}
               className="mb-2">
            {DAY_LABELS.map((d, i) => (
              <div key={i}
                   className="text-center text-gray-600 text-xs font-semibold py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
                        rowGap: '4px' }}>
            {cells.map((day, i) => {
              if (!day) return <div key={`e-${i}`} />;
              const dateStr    = makeDateStr(day);
              const hasEvents  = !!(eventsByDate[dateStr]?.length);
              const todayFlag  = isToday(day);
              const selFlag    = isSelected(day);

              return (
                <button
                  key={dateStr}
                  onClick={() => handleDayClick(day)}
                  className={`
                    relative flex flex-col items-center justify-center
                    h-10 rounded-xl text-xs font-medium transition-all duration-150
                    ${selFlag && !todayFlag
                      ? 'bg-[#2a2a2a] text-white'
                      : todayFlag
                      ? 'bg-white text-black font-bold'
                      : 'text-gray-400 hover:bg-[#1a1a1a] hover:text-white'}
                  `}
                >
                  {day}
                  {/* Event dot */}
                  {hasEvents && (
                    <span
                      className={`absolute bottom-1 w-1 h-1 rounded-full
                        ${todayFlag ? 'bg-black' : 'bg-white/60'}`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Selected Day Events ────────────────────────────────────── */}
        <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl overflow-hidden">
          {/* Day header */}
          <div className="flex items-center justify-between px-5 py-4
                          border-b border-[#1e1e1e]">
            <div>
              <p className="text-white text-sm font-semibold">{selectedDisplay}</p>
              <p className="text-gray-600 text-xs">
                {selectedEvents.length === 0
                  ? 'No events'
                  : `${selectedEvents.length} event${selectedEvents.length > 1 ? 's' : ''}`}
              </p>
            </div>
            <button
              onClick={() => handleAddEvent(
                selected.split('-')[2]   // extract day number from "YYYY-MM-DD"
              )}
              className="w-8 h-8 bg-white text-black rounded-xl flex items-center
                         justify-center hover:bg-gray-100 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                      d="M12 4v16m8-8H4"/>
              </svg>
            </button>
          </div>

          {/* Events list */}
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-5 h-5 border-2 border-[#2a2a2a] border-t-white/40
                              rounded-full animate-spin"/>
            </div>
          ) : selectedEvents.length === 0 ? (
            <EmptyEvents
              onAdd={() => handleAddEvent(selected.split('-')[2])}
            />
          ) : (
            <div className="divide-y divide-[#1e1e1e]">
              {selectedEvents.map(ev => (
                <EventRow
                  key={ev.id}
                  event={ev}
                  onDelete={() => deleteEvent(ev.id)}
                />
              ))}
            </div>
          )}
        </div>

      </main>

      {/* ── Add Event Modal ────────────────────────────────────────── */}
      {showModal && (
        <EventModal
          date={modalDate}
          onSave={addEvent}
          onClose={() => setShowModal(false)}
        />
      )}

      <BottomNav />
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function EventRow({ event, onDelete }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try { await onDelete(); }
    catch { setDeleting(false); }
  };

  return (
    <div className="flex items-start gap-3 px-5 py-4 group">
      {/* Color dot */}
      <div className="w-1.5 h-1.5 rounded-full bg-white/60 mt-1.5 flex-shrink-0"/>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium truncate">{event.title}</p>
        {event.description && (
          <p className="text-gray-500 text-xs mt-0.5 line-clamp-2">
            {event.description}
          </p>
        )}
      </div>
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="opacity-0 group-hover:opacity-100 text-gray-700
                   hover:text-red-400 transition-all disabled:opacity-50 flex-shrink-0"
      >
        {deleting ? (
          <span className="w-3.5 h-3.5 border border-current border-t-transparent
                           rounded-full animate-spin block"/>
        ) : (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858
                  L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
        )}
      </button>
    </div>
  );
}

function EmptyEvents({ onAdd }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-5 text-center">
      <div className="w-10 h-10 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a]
                      flex items-center justify-center mb-3">
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor"
             viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0
            00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
        </svg>
      </div>
      <p className="text-gray-500 text-sm mb-1">Nothing scheduled</p>
      <button
        onClick={onAdd}
        className="text-white text-xs underline underline-offset-2 mt-1
                   hover:text-gray-300 transition-colors"
      >
        + Add an event
      </button>
    </div>
  );
}