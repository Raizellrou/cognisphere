import { useState } from "react";

/**
 * CalendarWidget Component
 * Displays a monthly calendar with navigation (prev/next month).
 * Highlights today's date. Shows task count below.
 * Firebase integration: replace taskCount with live Firestore query count.
 */

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

const MONTH_NAMES = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec",
];

export default function CalendarWidget({ taskCount = 1 }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  const isToday = (day) =>
    day === today.getDate() &&
    viewMonth === today.getMonth() &&
    viewYear === today.getFullYear();

  // Build calendar cells (empty + day numbers)
  const cells = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="bg-[#1a1a1a] rounded-2xl p-5 mb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {/* Calendar icon */}
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-white font-semibold text-sm">
            {MONTH_NAMES[viewMonth]} {viewYear}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Expand icon */}
          <button className="text-gray-500 hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5h-4m4 0v-4m0 4l-5-5" />
            </svg>
          </button>
          <button onClick={prevMonth} className="text-gray-500 hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button onClick={nextMonth} className="text-gray-500 hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Day labels — inline style ensures 7 columns regardless of Tailwind JIT scan */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }} className="mb-2">
        {DAY_LABELS.map((d, i) => (
          <div key={i} className="text-center text-gray-500 text-xs font-semibold py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Day cells — inline style for guaranteed 7-col grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", rowGap: "4px" }}>
        {cells.map((day, i) => (
          <div key={i} className="flex items-center justify-center h-8">
            {day ? (
              <button
                className={`w-7 h-7 rounded-full text-xs font-medium transition-all duration-150
                  ${isToday(day)
                    ? "bg-white text-black font-bold"
                    : "text-gray-300 hover:bg-[#2a2a2a]"
                  }`}
              >
                {day}
              </button>
            ) : null}
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="border-t border-[#2a2a2a] mt-4 pt-4">
        {/* All Tasks row — Firebase: replace taskCount with live data */}
        <button className="flex items-center justify-between w-full group">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="text-white text-xs font-bold tracking-widest uppercase">
              All Tasks ({taskCount})
            </span>
          </div>
          <svg className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}