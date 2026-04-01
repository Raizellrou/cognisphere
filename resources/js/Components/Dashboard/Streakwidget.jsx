/**
 * StreakWidget Component
 * Shows the user's current streak in days.
 * Firebase integration: replace `streak` prop with Firestore user doc field.
 */
export default function StreakWidget({ streak = 0 }) {
  return (
    <div className="bg-[#1a1a1a] rounded-2xl p-8 mb-4 flex flex-col items-center justify-center text-center min-h-[160px]">
      <p className="text-xs font-bold tracking-widest text-white uppercase mb-4">
        Streak
      </p>
      <p className="text-7xl font-black text-white mb-2 tabular-nums leading-none">
        {streak}
      </p>
      <p className="text-gray-500 text-sm">Days</p>
    </div>
  );
}