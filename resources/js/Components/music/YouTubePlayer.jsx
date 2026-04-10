/**
 * YouTubePlayer.jsx
 * resources/js/components/music/YouTubePlayer.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Embeds a YouTube search results page inside an iframe.
 *
 * WHY YouTube search embed (not a direct video ID):
 *  - We don't know the exact video ID from Spotify data alone
 *  - YouTube's search embed (?search_query=...) loads the best match automatically
 *  - This is fully legal — it's just embedding a YouTube page
 *  - No YouTube Data API key required
 *
 * The `youtube_query` field is pre-built by SpotifyService:
 *   "{title} {artist} official audio"
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect } from 'react';

export default function YouTubePlayer({ track }) {
  const [loaded, setLoaded] = useState(false);
  const [key, setKey]       = useState(0); // Force iframe remount on track change

  // Reset load state when track changes
  useEffect(() => {
    if (track) {
      setLoaded(false);
      setKey(k => k + 1);
    }
  }, [track?.id]);

  if (!track) {
    return (
      <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl
                      aspect-video flex flex-col items-center justify-center
                      text-center px-6">
        <div className="w-12 h-12 bg-[#1a1a1a] rounded-2xl flex items-center
                        justify-center mb-3">
          {/* Music note icon */}
          <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4
                     4 4-1.79 4-4V7h4V3h-6z"/>
          </svg>
        </div>
        <p className="text-gray-500 text-sm font-medium">No track selected</p>
        <p className="text-gray-700 text-xs mt-1">
          Search for a song or get AI suggestions
        </p>
      </div>
    );
  }

  // Build the YouTube embed URL from the pre-built query
  // search_query parameter loads YouTube search results for that query
  const youtubeEmbedUrl =
    `https://www.youtube.com/embed?listType=search&list=${track.youtube_query}&autoplay=1&rel=0`;

  return (
    <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl overflow-hidden">

      {/* Track info header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#1e1e1e]">
        {/* Album art */}
        {track.image ? (
          <img
            src={track.image}
            alt={track.album}
            className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-10 h-10 bg-[#2a2a2a] rounded-lg flex items-center
                          justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79
                       4 4 4 4-1.79 4-4V7h4V3h-6z"/>
            </svg>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-semibold truncate">{track.title}</p>
          <p className="text-gray-500 text-xs truncate">{track.artist}</p>
        </div>
        {/* Spotify link */}
        {track.spotify_url && (
          <a
            href={track.spotify_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-[#1DB954] transition-colors flex-shrink-0"
            title="Open in Spotify"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521
                       17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9
                       4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
          </a>
        )}
      </div>

      {/* YouTube iframe */}
      <div className="relative aspect-video bg-black">
        {/* Loading skeleton */}
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center
                          bg-[#0a0a0a]">
            <div className="flex flex-col items-center gap-3">
              <div className="w-6 h-6 border-2 border-[#2a2a2a] border-t-white/30
                              rounded-full animate-spin"/>
              <p className="text-gray-600 text-xs">Loading player…</p>
            </div>
          </div>
        )}

        <iframe
          key={key}
          src={youtubeEmbedUrl}
          title={`${track.title} - ${track.artist}`}
          className={`w-full h-full transition-opacity duration-300
                      ${loaded ? 'opacity-100' : 'opacity-0'}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media;
                 gyroscope; picture-in-picture"
          allowFullScreen
          onLoad={() => setLoaded(true)}
        />
      </div>

      {/* Duration */}
      {track.duration_ms > 0 && (
        <div className="px-4 py-2 border-t border-[#1e1e1e]">
          <p className="text-gray-700 text-xs">
            Duration: {formatDuration(track.duration_ms)}
          </p>
        </div>
      )}
    </div>
  );
}

// Format milliseconds to m:ss
function formatDuration(ms) {
  const totalSec = Math.floor(ms / 1000);
  const min      = Math.floor(totalSec / 60);
  const sec      = totalSec % 60;
  return `${min}:${String(sec).padStart(2, '0')}`;
}