/**
 * MusicPage.jsx
 * resources/js/Pages/MusicPage.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Full music page for Cognisphere.
 *
 * LAYOUT:
 *  ┌──────────────────────────────────┐
 *  │ Header                           │
 *  ├──────────────────────────────────┤
 *  │ AI Mood Input                    │
 *  ├──────────────────────────────────┤
 *  │ Search bar                       │
 *  ├──────────────────────────────────┤
 *  │ YouTube Player (when track set)  │
 *  ├──────────────────────────────────┤
 *  │ AI Suggestion banner (if shown)  │
 *  ├──────────────────────────────────┤
 *  │ Track list / Recently played     │
 *  └──────────────────────────────────┘
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useRef } from 'react';
import { useAuth }     from '@/context/AuthContext';
import { useMusic }    from '@/hooks/useMusic';
import YouTubePlayer   from '@/components/music/YouTubePlayer';
import TrackCard       from '@/components/music/TrackCard';
import MoodInput       from '@/components/music/MoodInput';
import BottomNav       from '@/components/layout/BottomNav';

export default function MusicPage() {
  const { currentUser }  = useAuth();
  const uid              = currentUser?.uid;

  const {
    searchResults, recentlyPlayed, currentTrack,
    suggestion, searchQuery, loading, error,
    search, suggestFromMood, playTrack, clearSearch,
  } = useMusic(uid);

  const [inputValue, setInputValue] = useState('');
  const [activeTab, setActiveTab]   = useState('search'); // 'search' | 'recent'
  const inputRef = useRef(null);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSearch = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    search(inputValue.trim());
    setActiveTab('search');
  };

  const handleMoodSuggest = (mood) => {
    suggestFromMood(mood);
    setActiveTab('search');
  };

  const handleClear = () => {
    clearSearch();
    setInputValue('');
    inputRef.current?.focus();
  };

  // ── Determine what track list to show ─────────────────────────────────────
  const showingResults  = searchResults.length > 0;
  const showingRecent   = activeTab === 'recent' && recentlyPlayed.length > 0;
  const trackList       = activeTab === 'recent' ? recentlyPlayed : searchResults;

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-white text-black dark:bg-black dark:text-white">
      <main className="max-w-sm mx-auto px-4 pt-6 pb-28">

        {/* ── Header ────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-white text-xl font-black tracking-tight">
              Music
            </h1>
            <p className="text-gray-600 text-xs mt-0.5">
              Powered by Spotify + YouTube
            </p>
          </div>
          {/* Spotify badge */}
          <div className="flex items-center gap-1.5 bg-[#111] border border-[#1e1e1e]
                          rounded-lg px-2.5 py-1.5">
            <div className="w-3 h-3 bg-[#1DB954] rounded-full"/>
            <span className="text-gray-400 text-xs">Spotify</span>
          </div>
        </div>

        {/* ── AI Mood Input ─────────────────────────────────────────── */}
        <MoodInput onSubmit={handleMoodSuggest} loading={loading.suggest} />

        {/* ── Search bar ────────────────────────────────────────────── */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4
                            text-gray-600 pointer-events-none" fill="none"
                 stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0"/>
            </svg>
            <input
              ref={inputRef}
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder="Search songs, artists…"
              className="w-full bg-[#111] border border-[#1e1e1e] text-white text-sm
                         rounded-xl pl-10 pr-4 py-3 outline-none placeholder-gray-600
                         focus:border-[#2a2a2a] transition-colors"
            />
            {inputValue && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600
                           hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={!inputValue.trim() || loading.search}
            className="bg-white text-black text-sm font-bold px-4 py-3 rounded-xl
                       hover:bg-gray-100 disabled:opacity-50 transition-colors
                       flex-shrink-0 flex items-center gap-1.5"
          >
            {loading.search ? (
              <span className="w-4 h-4 border-2 border-black/20 border-t-black
                               rounded-full animate-spin"/>
            ) : 'Search'}
          </button>
        </form>

        {/* ── Error ─────────────────────────────────────────────────── */}
        {error && (
          <div className="bg-red-950/30 border border-red-900/40 rounded-xl
                          px-4 py-3 mb-4 text-xs text-red-400 flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor"
                 viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667
                    1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34
                    16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
            {error}
          </div>
        )}

        {/* ── YouTube Player ────────────────────────────────────────── */}
        {currentTrack && (
          <div className="mb-4">
            <YouTubePlayer track={currentTrack} />
          </div>
        )}

        {/* ── AI Suggestion banner ──────────────────────────────────── */}
        {suggestion && (
          <div className="bg-[#0d1a0e] border border-emerald-900/30 rounded-xl
                          px-4 py-3 mb-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs">✨</span>
              <p className="text-emerald-400 text-xs font-semibold">
                AI suggested: "{suggestion.query}"
              </p>
              {suggestion.source === 'fallback' && (
                <span className="text-gray-700 text-[10px]">(offline)</span>
              )}
            </div>
            <p className="text-gray-500 text-xs">{suggestion.description}</p>
            {suggestion.genres?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {suggestion.genres.map(g => (
                  <span key={g}
                        className="text-[10px] bg-emerald-950/60 border border-emerald-900/40
                                   text-emerald-500 px-2 py-0.5 rounded-full">
                    {g}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Tab bar ───────────────────────────────────────────────── */}
        {(showingResults || recentlyPlayed.length > 0) && (
          <div className="flex bg-[#111] border border-[#1e1e1e] rounded-xl p-1 mb-3">
            <TabButton
              active={activeTab === 'search'}
              onClick={() => setActiveTab('search')}
              disabled={!showingResults}
            >
              Results
              {showingResults && (
                <span className="ml-1.5 text-[10px] bg-white/10 px-1.5 py-0.5 rounded-full">
                  {searchResults.length}
                </span>
              )}
            </TabButton>
            <TabButton
              active={activeTab === 'recent'}
              onClick={() => setActiveTab('recent')}
              disabled={recentlyPlayed.length === 0}
            >
              Recently Played
              {recentlyPlayed.length > 0 && (
                <span className="ml-1.5 text-[10px] bg-white/10 px-1.5 py-0.5 rounded-full">
                  {recentlyPlayed.length}
                </span>
              )}
            </TabButton>
          </div>
        )}

        {/* ── Track list ────────────────────────────────────────────── */}
        {loading.search || loading.suggest ? (
          <TrackListSkeleton />
        ) : trackList.length > 0 ? (
          <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl overflow-hidden">
            {trackList.map((track, i) => {
              // recently played items have slightly different shape
              const normalizedTrack = activeTab === 'recent'
                ? {
                    id:            track.trackId,
                    title:         track.title,
                    artist:        track.artist,
                    album:         track.album,
                    image:         track.image,
                    youtube_query: track.youtubeQuery,
                    spotify_url:   track.spotifyUrl,
                    duration_ms:   0,
                  }
                : track;

              return (
                <div
                  key={track.id || track.trackId}
                  className={i < trackList.length - 1
                    ? 'border-b border-[#1e1e1e]' : ''}
                >
                  <TrackCard
                    track={normalizedTrack}
                    isPlaying={currentTrack?.id === normalizedTrack.id}
                    onClick={playTrack}
                  />
                </div>
              );
            })}
          </div>
        ) : activeTab === 'search' && !showingResults && !loading.search ? (
          <EmptySearch onMoodClick={() => document.querySelector('input[placeholder*="feeling"]')?.focus()} />
        ) : null}

      </main>
      <BottomNav />
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function TabButton({ children, active, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex-1 text-xs font-semibold py-2 rounded-lg transition-all
                  ${active
                    ? 'bg-white text-black'
                    : 'text-gray-500 hover:text-white disabled:opacity-30'}`}
    >
      {children}
    </button>
  );
}

function TrackListSkeleton() {
  return (
    <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl overflow-hidden">
      {[1,2,3,4,5].map(i => (
        <div key={i}
             className="flex items-center gap-3 px-4 py-3 border-b border-[#1e1e1e]
                        last:border-0 animate-pulse">
          <div className="w-11 h-11 bg-[#1a1a1a] rounded-lg flex-shrink-0"/>
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-[#1a1a1a] rounded w-3/4"/>
            <div className="h-2.5 bg-[#1a1a1a] rounded w-1/2"/>
          </div>
          <div className="h-2.5 bg-[#1a1a1a] rounded w-8 flex-shrink-0"/>
        </div>
      ))}
    </div>
  );
}

function EmptySearch({ onMoodClick }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center px-4">
      <div className="w-14 h-14 bg-[#111] border border-[#1e1e1e] rounded-2xl
                      flex items-center justify-center mb-4">
        <svg className="w-7 h-7 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79
                   4 4 4 4-1.79 4-4V7h4V3h-6z"/>
        </svg>
      </div>
      <p className="text-white text-sm font-semibold mb-1">
        Find your study soundtrack
      </p>
      <p className="text-gray-500 text-xs mb-4 max-w-xs">
        Search for any song, artist, or describe your mood to get AI-powered suggestions.
      </p>
      <button
        onClick={onMoodClick}
        className="text-emerald-400 text-xs underline underline-offset-2
                   hover:text-emerald-300 transition-colors"
      >
        Try AI mood suggestion ✨
      </button>
    </div>
  );
}