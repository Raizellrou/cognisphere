import { useState, useEffect } from "react";

/**
 * CountdownWidget Component
 * Lists countdown timers to upcoming events.
 * Users can add new countdowns with a name and target date.
 * Firebase integration: replace local state with Firestore collection "countdowns".
 */

function getTimeLeft(targetDate) {
  const diff = new Date(targetDate) - new Date();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
    expired: false,
  };
}

function CountdownItem({ name, targetDate, onDelete }) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(targetDate));

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(getTimeLeft(targetDate)), 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  return (
    <div className="bg-[#2a2a2a] rounded-xl p-4 mb-3 flex items-center justify-between">
      <div>
        <p className="text-white text-sm font-semibold mb-1">{name}</p>
        {timeLeft.expired ? (
          <p className="text-red-400 text-xs">Expired</p>
        ) : (
          <p className="text-gray-400 text-xs tabular-nums">
            {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
          </p>
        )}
      </div>
      <button
        onClick={onDelete}
        className="text-gray-600 hover:text-red-400 transition-colors ml-4"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export default function CountdownWidget() {
  // Firebase: replace with useCollection("countdowns") hook
  const [countdowns, setCountdowns] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", date: "" });

  const handleAdd = () => {
    if (!form.name || !form.date) return;
    setCountdowns((prev) => [
      ...prev,
      { id: Date.now(), name: form.name, targetDate: form.date },
    ]);
    setForm({ name: "", date: "" });
    setShowForm(false);
  };

  const handleDelete = (id) => {
    setCountdowns((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="bg-[#1a1a1a] rounded-2xl p-5 mb-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-white text-xs font-bold tracking-widest uppercase">Countdown</span>
      </div>

      {/* Empty state or list */}
      {countdowns.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-12 h-12 rounded-full border-2 border-[#3a3a3a] flex items-center justify-center mb-3">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-white text-sm font-medium mb-1">No countdowns yet</p>
          <p className="text-gray-500 text-xs">Add event below to start counting down</p>
        </div>
      ) : (
        <div>
          {countdowns.map((c) => (
            <CountdownItem
              key={c.id}
              name={c.name}
              targetDate={c.targetDate}
              onDelete={() => handleDelete(c.id)}
            />
          ))}
        </div>
      )}

      {/* Add form */}
      {showForm && (
        <div className="mt-3 space-y-2">
          <input
            className="w-full bg-[#2a2a2a] text-white text-sm rounded-xl px-4 py-3 outline-none placeholder-gray-600 focus:ring-1 focus:ring-white/20"
            placeholder="Event name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <input
            type="datetime-local"
            className="w-full bg-[#2a2a2a] text-white text-sm rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-white/20"
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
          />
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              className="flex-1 bg-white text-black text-xs font-bold py-2 rounded-xl hover:bg-gray-200 transition-colors"
            >
              Add
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="flex-1 bg-[#2a2a2a] text-gray-400 text-xs font-bold py-2 rounded-xl hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Add countdown button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1 text-gray-400 hover:text-white text-xs font-medium mt-4 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add countdown
        </button>
      )}
    </div>
  );
}