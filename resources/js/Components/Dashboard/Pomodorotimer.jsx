import { useState, useEffect, useRef } from "react";

/**
 * PomodoroTimer Component
 * Displays a focus timer with Pomodoro, Short Break, and Long Break modes.
 * Includes Reverse/Classic toggle and a Start/Pause/Reset control.
 * Firebase integration: replace local state with Firestore doc for persistence.
 */

const MODES = {
  pomodoro: { label: "Promodoro", duration: 25 * 60 },
  short: { label: "Short Break", duration: 5 * 60 },
  long: { label: "Long Break", duration: 15 * 60 },
};

export default function PomodoroTimer() {
  const [mode, setMode] = useState("pomodoro");
  const [reverse, setReverse] = useState(false);
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(MODES.pomodoro.duration);
  const intervalRef = useRef(null);

  // Reset timer whenever mode changes
  useEffect(() => {
    clearInterval(intervalRef.current);
    setRunning(false);
    setSeconds(MODES[mode].duration);
  }, [mode]);

  // Tick logic
  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s <= 0) {
            clearInterval(intervalRef.current);
            setRunning(false);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const displayed = reverse ? MODES[mode].duration - seconds : seconds;
  const mm = String(Math.floor(displayed / 60)).padStart(2, "0");
  const ss = String(displayed % 60).padStart(2, "0");

  const handleStart = () => setRunning((r) => !r);
  const handleReset = () => {
    setRunning(false);
    setSeconds(MODES[mode].duration);
  };

  return (
    <div className="bg-[#1a1a1a] rounded-2xl p-5 mb-4">
      {/* Mode tabs */}
      <div className="flex bg-[#2a2a2a] rounded-full p-1 mb-5">
        {Object.entries(MODES).map(([key, { label }]) => (
          <button
            key={key}
            onClick={() => setMode(key)}
            className={`flex-1 text-xs font-semibold py-2 rounded-full transition-all duration-200 ${
              mode === key
                ? "bg-white text-black shadow"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Controls row */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-xs">Reverse</span>
          {/* Toggle switch */}
          <button
            onClick={() => setReverse((r) => !r)}
            className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${
              reverse ? "bg-white" : "bg-[#3a3a3a]"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-4 h-4 bg-black rounded-full shadow transition-transform duration-200 ${
                reverse ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
          <span className="text-gray-400 text-xs">Classic</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Settings icon placeholder */}
          <button onClick={handleReset} className="text-gray-500 hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          {/* Expand icon placeholder */}
          <button className="text-gray-500 hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5h-4m4 0v-4m0 4l-5-5" />
            </svg>
          </button>
        </div>
      </div>

      {/* Status label */}
      <p className="text-center text-xs font-bold tracking-widest text-gray-400 mb-3 uppercase">
        Ready to Focus
      </p>

      {/* Timer display */}
      <div className="text-center mb-6">
        <span className="text-8xl font-black text-white tracking-tighter tabular-nums">
          {mm}:{ss}
        </span>
      </div>

      {/* Start/Pause button */}
      <button
        onClick={handleStart}
        className="w-full bg-white text-black text-sm font-bold py-3 rounded-full hover:bg-gray-200 active:scale-95 transition-all duration-150"
      >
        {running ? "Pause" : "Start"}
      </button>
    </div>
  );
}