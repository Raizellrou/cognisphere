/**
 * Calendarwidget.jsx — Fixed
 * Removed task-related UI and props. Calendar grid only for dashboard.
 */

import { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const MONTH_NAMES_FULL = ['January','February','March','April','May','June',
                          'July','August','September','October','November','December'];

function getDaysInMonth(y, m) { return new Date(y, m + 1, 0).getDate(); }
function getFirstDay(y, m)    { return new Date(y, m, 1).getDay(); }

// Build ISO date string (YYYY-MM-DD) from year, month (0-indexed), day
function toDateStr(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

export default function CalendarWidget() {
  const today = new Date();
  const [viewYear, setViewYear]   = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [expanded, setExpanded]   = useState(false);
  const [selected, setSelected]   = useState(today.getDate());

  const isToday = (day) =>
    day === today.getDate() &&
    viewMonth === today.getMonth() &&
    viewYear === today.getFullYear();

  const cells = [
    ...Array(getFirstDay(viewYear, viewMonth)).fill(null),
    ...Array.from({ length: getDaysInMonth(viewYear, viewMonth) }, (_, i) => i + 1),
  ];

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  // Tasks filtered to the selected date
  const { isDark } = useTheme();
  const selectedDateStr = toDateStr(viewYear, viewMonth, selected);

  const colors = isDark ? {
    cardBg: '#1a1a1a',
    border: '1px solid rgba(255,255,255,0.06)',
    headerText: '#ffffff',
    labelText: 'rgba(255,255,255,0.35)',
    dayLabel: 'rgba(255,255,255,0.3)',
    todayBg: '#1C9EF9',
    todayText: '#ffffff',
    rowText: '#ffffff',
    rowIcon: '#1C9EF9',
    rowBorder: 'rgba(255,255,255,0.07)',
  } : {
    cardBg: '#ffffff',
    border: '1px solid #e5e7eb',
    headerText: '#000000',
    labelText: '#6b7280',
    dayLabel: '#6b7280',
    todayBg: '#1C9EF9',
    todayText: '#ffffff',
    rowText: '#000000',
    rowIcon: '#1C9EF9',
    rowBorder: '#e5e7eb',
  };

  return (
    <>
      {/* ── Dashboard Card ────────────────────────────────────────── */}
      <div style={{
        background: colors.cardBg, borderRadius: 16, padding: '16px',
        marginBottom: 16, border: colors.border,
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1C9EF9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <path d="M16 2v4M8 2v4M3 10h18"/>
            </svg>
            <span style={{ color: colors.headerText, fontWeight: 600, fontSize: 14 }}>
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={() => setExpanded(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1C9EF9', padding: 2 }}>
              <Maximize2 width={16} height={16} strokeWidth={2} stroke="currentColor" />
            </button>
            <button onClick={prevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1C9EF9', padding: 2 }}>
              <ChevronLeft width={16} height={16} strokeWidth={2} stroke="currentColor" />
            </button>
            <button onClick={nextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1C9EF9', padding: 2 }}>
              <ChevronRight width={16} height={16} strokeWidth={2} stroke="currentColor" />
            </button>
          </div>
        </div>

        {/* Day labels */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 6 }}>
          {DAY_LABELS.map((d, i) => (
            <div key={i} style={{ textAlign: 'center', color: colors.dayLabel, fontSize: 11, fontWeight: 600, paddingBottom: 4 }}>{d}</div>
          ))}
        </div>

        {/* Day cells */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', rowGap: 2 }}>
          {cells.map((day, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 32 }}>
              {day ? (
                <button
                  onClick={() => setSelected(day)}
                  style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: isToday(day) ? colors.todayBg : 'transparent',
                    color: isToday(day) ? colors.todayText : (isDark ? 'rgba(255,255,255,0.75)' : '#000000'),
                    fontSize: 12, fontWeight: isToday(day) ? 700 : 400,
                    border: 'none', cursor: 'pointer',
                    transition: 'background 150ms ease',
                  }}
                >
                  {day}
                </button>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      {/* ── Full-Screen Modal ─────────────────────────────────────── */}
      {expanded && (
        <CalendarFullScreen
          viewYear={viewYear}
          viewMonth={viewMonth}
          selected={selected}
          today={today}
          cells={cells}
          onSelect={setSelected}
          onPrev={prevMonth}
          onNext={nextMonth}
          onClose={() => setExpanded(false)}
        />
      )}
    </>
  );
}

// ── Full Screen Calendar Modal ────────────────────────────────────────────────
// Calendar only (task functionality removed)

function CalendarFullScreen({ viewYear, viewMonth, selected, today, cells, onSelect, onPrev, onNext, onClose }) {
  const { isDark } = useTheme();
  const [visible, setVisible] = useState(false);
  const startYRef = useRef(null);

  const colors = isDark ? {
    backdrop: 'rgba(0,0,0,0.7)',
    sheetBg: '#0b0b0d',
    closeBtnBg: 'rgba(255,255,255,0.1)',
    closeBtnText: 'rgba(255,255,255,0.6)',
    heading: '#ffffff',
    dayLabel: 'rgba(255,255,255,0.3)',
    buttonText: 'rgba(255,255,255,0.8)',
    taskHeader: '#ffffff',
    addButtonBg: 'rgba(255,255,255,0.05)',
    addButtonBorder: '1.5px dashed rgba(255,255,255,0.2)',
    emptyText: 'rgba(255,255,255,0.25)',
    modalBg: 'rgba(20,20,22,0.98)',
    inputBg: 'rgba(255,255,255,0.08)',
    inputText: '#fff',
  } : {
    backdrop: 'rgba(0,0,0,0.35)',
    sheetBg: '#ffffff',
    closeBtnBg: 'rgba(15,23,42,0.04)',
    closeBtnText: '#111827',
    heading: '#111827',
    dayLabel: '#6b7280',
    buttonText: '#111827',
    taskHeader: '#111827',
    addButtonBg: 'rgba(15,23,42,0.04)',
    addButtonBorder: '1.5px dashed rgba(107,114,128,0.3)',
    emptyText: '#6b7280',
    modalBg: '#f9fafb',
    inputBg: '#ffffff',
    inputText: '#111827',
  };

  useEffect(() => {
    requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    const handler = (e) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => onClose(), 320);
  };

  const handleTouchStart = (e) => { startYRef.current = e.touches[0].clientY; };
  const handleTouchEnd = (e) => {
    if (startYRef.current === null) return;
    const delta = e.changedTouches[0].clientY - startYRef.current;
    if (delta > 80) handleClose();
    startYRef.current = null;
  };

  const isToday = (day) =>
    day === today.getDate() &&
    viewMonth === today.getMonth() &&
    viewYear === today.getFullYear();

  const isSelected = (day) => day === selected;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 8998,
          background: colors.backdrop,
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          opacity: visible ? 1 : 0,
          transition: 'opacity 300ms ease',
        }}
      />

      {/* Sheet */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{
          position: 'fixed',
          left: 0, right: 0, bottom: 0,
          zIndex: 8999,
          height: '95dvh',
          background: colors.sheetBg,
          borderRadius: '20px 20px 0 0',
          overflow: 'hidden auto',
          overscrollBehavior: 'contain',
          transform: visible ? 'translateY(0)' : 'translateY(100%)',
          transition: visible
            ? 'transform 400ms cubic-bezier(0.34, 1.56, 0.64, 1)'
            : 'transform 300ms cubic-bezier(0.4, 0, 1, 1)',
          willChange: 'transform',
        }}
      >
        {/* Close button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '16px 16px 0' }}>
          <button
            onClick={handleClose}
            style={{
              width: 28, height: 28, borderRadius: '50%',
              background: colors.closeBtnBg,
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: colors.closeBtnText,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Calendar card */}
        <div style={{ margin: '0 12px', background: isDark ? '#121212' : '#ffffff', borderRadius: 20, padding: '20px 16px 24px', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e5e7eb' }}>
          <h2 style={{ color: colors.heading, fontSize: 32, fontWeight: 900, letterSpacing: '-0.5px', marginBottom: 20 }}>
            {MONTH_NAMES_FULL[viewMonth]} {viewYear}
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 8 }}>
            {DAY_LABELS.map((d, i) => (
              <div key={i} style={{ textAlign: 'center', color: colors.dayLabel, fontSize: 12, fontWeight: 600 }}>{d}</div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', rowGap: 4 }}>
            {cells.map((day, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 44 }}>
                {day ? (
                  <button
                    onClick={() => onSelect(day)}
                    style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: isSelected(day) || isToday(day) ? '#1C9EF9' : 'transparent',
                      color: isSelected(day) || isToday(day) ? '#fff' : colors.buttonText,
                      fontSize: 15,
                      fontWeight: isSelected(day) || isToday(day) ? 700 : 400,
                      border: 'none', cursor: 'pointer',
                      transition: 'background 150ms ease',
                    }}
                  >
                    {day}
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}