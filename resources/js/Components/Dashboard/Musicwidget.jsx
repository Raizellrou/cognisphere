import { useState } from "react";

/**
 * MusicWidget Component
 * A minimal music player with play/pause and next track controls.
 * Firebase integration: replace playlist state with Firestore "playlists" collection.
 * For real audio playback, integrate with the HTML Audio API or a service like Spotify.
 */

// Placeholder playlist — Firebase: fetch from Firestore
const DEFAULT_PLAYLIST = [
  { id: 1, title: "Music 1", artist: "Artist 1" },
  { id: 2, title: "Music 2", artist: "Artist 2" },
  { id: 3, title: "Music 3", artist: "Artist 3" },
];

export default function MusicWidget({ playlist = DEFAULT_PLAYLIST }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playing, setPlaying] = useState(false);

  const current = playlist[currentIndex] || playlist[0];

  const handleNext = () => {
    setCurrentIndex((i) => (i + 1) % playlist.length);
    setPlaying(false);
  };

  const handlePlayPause = () => setPlaying((p) => !p);

  return (
    <div className="bg-[#1a1a1a] rounded-2xl p-5 mb-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
        <span className="text-white text-xs font-bold tracking-widest uppercase">Music</span>
      </div>

      {/* Track info & Next button */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-gray-400 text-xs">{current.title}</span>
        <button
          onClick={handleNext}
          className="text-white text-xs font-semibold hover:text-gray-300 transition-colors"
        >
          Next
        </button>
      </div>

      {/* Player card */}
      <div className="bg-[#2a2a2a] rounded-xl aspect-video flex items-center justify-center relative overflow-hidden">
        {/* Album art placeholder gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#2a2a2a] to-[#111] opacity-80" />

        {/* Play/Pause button */}
        <button
          onClick={handlePlayPause}
          className="relative z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition-all duration-150 active:scale-95"
        >
          {playing ? (
            // Pause icon
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          ) : (
            // Play icon
            <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
      </div>

      {/* Track subtitle */}
      <p className="text-gray-600 text-xs text-center mt-2">{current.artist}</p>
    </div>
  );
}