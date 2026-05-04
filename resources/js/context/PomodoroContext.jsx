import { createContext, useContext, useState, useEffect, useRef } from 'react';

const PomodoroCtx = createContext(null);

const MODES = {
  pomodoro: { label: 'Pomodoro' },
  short: { label: 'Break Time' },
};

function playChime() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = 'sine';
  osc.frequency.setValueAtTime(880, ctx.currentTime);
  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 1);
}

export function PomodoroProvider({ children }) {
  const [mode, setMode] = useState('pomodoro');
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(15 * 60);

  const [workMins, setWorkMins] = useState(15);
  const [breakMins, setBreakMins] = useState(5);

  const [autoStart, setAutoStart] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState('');

  const [targetTime, setTargetTime] = useState(null);

  // FIX 1: reverse lives here so it survives page navigation
  const [reverse, setReverse] = useState(true);

  // FIX 2: duration is stored in context so the timer display always has
  // the correct full-duration value to subtract from, even after remounting.
  // It is updated whenever mode or the minute settings change.
  const [duration, setDuration] = useState(15 * 60);

  const intervalRef = useRef(null);
  const modeRef = useRef(mode);
  const autoStartRef = useRef(autoStart);

  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { autoStartRef.current = autoStart; }, [autoStart]);

  const getDuration = (m) =>
    m === 'pomodoro' ? workMins * 60 : breakMins * 60;

  // Keep duration in sync whenever mode or minute settings change.
  // This is the single source of truth for the full session length.
  useEffect(() => {
    const d = getDuration(mode);
    setDuration(d);
  }, [mode, workMins, breakMins]);

  // START TIMER (real-time based)
  const startTimer = () => {
    const now = Date.now();
    setTargetTime(now + seconds * 1000);
    setRunning(true);
  };

  // COUNTDOWN (based on real time so it is unaffected by tab/page switches)
  useEffect(() => {
    if (!running || !targetTime) return;

    intervalRef.current = setInterval(() => {
      const remaining = Math.max(
        0,
        Math.floor((targetTime - Date.now()) / 1000)
      );

      setSeconds(remaining);

      if (remaining <= 0) {
        clearInterval(intervalRef.current);
        setRunning(false);

        playChime();

        const isPomodoro = modeRef.current === 'pomodoro';

        setNotificationMsg(
          isPomodoro
            ? "Break time! You've earned it."
            : "Break time is over! Ready to focus again!"
        );
        setShowNotification(true);

        setTimeout(() => {
          setShowNotification(false);

          if (autoStartRef.current) {
            const nextMode =
              modeRef.current === 'pomodoro' ? 'short' : 'pomodoro';

            const newDuration = getDuration(nextMode);

            setMode(nextMode);
            setDuration(newDuration);          // keep duration in sync
            setSeconds(newDuration);
            setTargetTime(Date.now() + newDuration * 1000);
            setRunning(true);
          }
        }, 2000);
      }
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [running, targetTime, workMins, breakMins]);

  // RESET
  const handleReset = () => {
    const d = getDuration(mode);
    setRunning(false);
    setSeconds(d);
    setDuration(d);   // keep duration in sync on reset too
    setTargetTime(null);
  };

  // MODE CHANGE (manual tab click)
  const handleModeChange = (newMode) => {
    const d = getDuration(newMode);
    setMode(newMode);
    setRunning(false);
    setSeconds(d);
    setDuration(d);   // keep duration in sync on mode switch
    setTargetTime(null);
  };

  return (
    <PomodoroCtx.Provider
      value={{
        mode,
        setMode: handleModeChange,
        running,
        setRunning,
        seconds,
        duration,     // expose so PomodoroTimer never recalculates it locally
        startTimer,
        handleReset,
        workMins,
        setWorkMins,
        breakMins,
        setBreakMins,
        autoStart,
        setAutoStart,
        reverse,      // expose so PomodoroTimer reads the persisted value
        setReverse,
        showNotification,
        notificationMsg,
        MODES,
      }}
    >
      {children}
    </PomodoroCtx.Provider>
  );
}

export function usePomodoro() {
  return useContext(PomodoroCtx);
}