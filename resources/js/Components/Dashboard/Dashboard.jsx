/**
 * Dashboard.jsx
 * ─────────────────────────────────────────────────────
 * Root dashboard page for the PWA.
 * Imports and composes all dashboard widgets into a single scrollable
 * mobile-first layout that matches the provided design.
 *
 * Firebase integration notes:
 *  - Import { auth, db } from '@/firebase' (your Firebase config file).
 *  - Use onAuthStateChanged(auth, cb) to gate rendering.
 *  - Pass Firestore data as props to each widget (streak, taskCount, etc.).
 *
 * File location: resources/js/Pages/Dashboard.jsx  (Inertia)
 *            OR  resources/js/Components/Dashboard.jsx
 */

import PomodoroTimer   from "@/Components/Dashboard/PomodoroTimer";
import CalendarWidget  from "@/Components/Dashboard/CalendarWidget";
import StreakWidget    from "@/Components/Dashboard/StreakWidget";
import CountdownWidget from "@/Components/Dashboard/CountdownWidget";
import MusicWidget     from "@/Components/Dashboard/MusicWidget";
import BottomNav       from "@/Components/Dashboard/BottomNav";
import Footer          from "@/Components/Dashboard/Footer";

/**
 * Example Firebase placeholder — uncomment and configure once Firebase is set up:
 *
 * import { useEffect, useState } from "react";
 * import { auth, db } from "@/firebase";
 * import { onAuthStateChanged } from "firebase/auth";
 * import { doc, onSnapshot } from "firebase/firestore";
 *
 * function useDashboardData() {
 *   const [streak, setStreak] = useState(0);
 *   const [taskCount, setTaskCount] = useState(0);
 *
 *   useEffect(() => {
 *     const unsub = onAuthStateChanged(auth, (user) => {
 *       if (!user) return;
 *       const ref = doc(db, "users", user.uid);
 *       return onSnapshot(ref, (snap) => {
 *         const data = snap.data() || {};
 *         setStreak(data.streak ?? 0);
 *         setTaskCount(data.taskCount ?? 0);
 *       });
 *     });
 *     return () => unsub();
 *   }, []);
 *
 *   return { streak, taskCount };
 * }
 */

export default function Dashboard() {
  // Firebase: replace with useDashboardData() hook above
  const streak    = 0;  // placeholder — from Firestore user doc
  const taskCount = 1;  // placeholder — from Firestore tasks collection count

  return (
    // Outermost shell: dark background fills viewport
    <div className="min-h-screen bg-black text-white">
      {/*
        Scrollable content area.
        max-w-sm centers content on wider screens (desktop preview),
        pb-24 ensures content isn't hidden behind the fixed BottomNav.
      */}
      <main className="max-w-sm mx-auto px-4 pt-6 pb-24">

        {/* ── 1. Focus Timer ───────────────────────────────── */}
        <PomodoroTimer />

        {/* ── 2. Monthly Calendar + Task Count ─────────────── */}
        <CalendarWidget taskCount={taskCount} />

        {/* ── 3. Daily Streak ──────────────────────────────── */}
        <StreakWidget streak={streak} />

        {/* ── 4. Countdown Timers ──────────────────────────── */}
        <CountdownWidget />

        {/* ── 5. Music Player ──────────────────────────────── */}
        <MusicWidget />

        {/* ── Footer links ─────────────────────────────────── */}
        <Footer />
      </main>

      {/* ── Fixed bottom navigation ──────────────────────── */}
      <BottomNav activeTab="home" />
    </div>
  );
}