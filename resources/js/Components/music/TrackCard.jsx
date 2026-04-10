/**
 * TrackCard.jsx
 * resources/js/components/music/TrackCard.jsx
 * A single track result card. Shows album art, title, artist, duration.
 * Highlights when it's the currently playing track.
 */

export default function TrackCard({ track, isPlaying, onClick }) {
  const durationStr = track.duration_ms > 0
    ? formatDuration(track.duration_ms)
    : '';

  return (
    <button
      onClick={() => onClick(track)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl
                  transition-all duration-150 text-left group
                  ${isPlaying
                    ? 'bg-white/10 border border-white/20'
                    : 'hover:bg-[#1a1a1a] border border-transparent'}`}
    >
      {/* Album art */}
      <div className="relative flex-shrink-0">
        {track.image ? (
          <img
            src={track.image}
            alt={track.album}
            className="w-11 h-11 rounded-lg object-cover"
          />
        ) : (
          <div className="w-11 h-11 bg-[#2a2a2a] rounded-lg flex items-center
                          justify-center">
            <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79
                       4 4 4 4-1.79 4-4V7h4V3h-6z"/>
            </svg>
          </div>
        )}
        {/* Playing indicator overlay */}
        {isPlaying && (
          <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center
                          justify-center">
            <PlayingBars />
          </div>
        )}
      </div>

      {/* Track info */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate
                       ${isPlaying ? 'text-white' : 'text-gray-200'}`}>
          {track.title}
        </p>
        <p className="text-gray-500 text-xs truncate">{track.artist}</p>
        {track.album && (
          <p className="text-gray-700 text-xs truncate mt-0.5">{track.album}</p>
        )}
      </div>

      {/* Duration */}
      {durationStr && (
        <span className="text-gray-600 text-xs flex-shrink-0 tabular-nums">
          {durationStr}
        </span>
      )}

      {/* Play arrow (visible on hover) */}
      {!isPlaying && (
        <svg className="w-4 h-4 text-gray-700 group-hover:text-white
                        transition-colors flex-shrink-0"
             fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1
                   0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      )}
    </button>
  );
}

// Animated bars icon for currently playing track
function PlayingBars() {
  return (
    <div className="flex items-end gap-0.5 h-4">
      {[1, 2, 3].map(i => (
        <div
          key={i}
          className="w-1 bg-white rounded-full animate-bounce"
          style={{
            height:          `${8 + i * 4}px`,
            animationDelay:  `${i * 0.15}s`,
            animationDuration: '0.8s',
          }}
        />
      ))}
    </div>
  );
}

function formatDuration(ms) {
  const totalSec = Math.floor(ms / 1000);
  return `${Math.floor(totalSec / 60)}:${String(totalSec % 60).padStart(2, '0')}`;
}