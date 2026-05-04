import { useState, useRef } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useMusicContext } from '@/context/MusicContext';
import { Music2, Play } from 'lucide-react';

const API_KEY = 'AIzaSyCD3dUfAtD-HzrJPIBFSl_qkmsZ0tEct60';

export default function MusicWidget() {
  const { isDark } = useTheme();
  const {
    currentTrack,
    results,
    isPlaying,
    currentIndex,
    loading,
    error,
    search: contextSearch,
    playTrack: contextPlayTrack,
    togglePlayPause: contextTogglePlayPause,
    playNext: contextPlayNext,
  } = useMusicContext();

  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);

  const primaryText  = isDark ? '#ffffff' : '#111827';
  const secondaryText = isDark ? 'rgba(255,255,255,0.45)' : '#6b7280';
  const inputBg      = isDark ? 'rgba(255,255,255,0.06)' : '#f3f4f6';
  const inputBorder  = isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e5e7eb';
  const controlBg    = isDark ? 'rgba(255,255,255,0.08)' : '#f3f4f6';
  const resultBg     = isDark ? 'rgba(255,255,255,0.04)' : '#fafafa';
  const resultHoverBg = isDark ? 'rgba(255,255,255,0.08)' : '#f3f4f6';

  // FIX: use youtube.com (not nocookie), controls=1 required for
  // autoplay policy, no origin= param to avoid localhost mismatch
  const getEmbedSrc = (videoId, autoplay) =>
    `https://www.youtube.com/embed/${videoId}?autoplay=${autoplay ? 1 : 0}&controls=1&rel=0&modestbranding=1`;

  const search = async () => {
    if (!query.trim()) return;
    setShowResults(true);
    await contextSearch(query);
  };

  return (
    <div
      style={{
        background:    isDark ? 'rgba(28,28,30,0.8)' : '#ffffff',
        border:        isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e5e7eb',
        borderRadius:  16,
        padding:       16,
        display:       'flex',
        flexDirection: 'column',
        gap:           12,
      }}
    >
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Music2 size={14} strokeWidth={1.8} color="#1C9EF9"/>
        <span style={{ fontWeight: 700, fontSize: 14, color: primaryText, letterSpacing: 1 }}>
          MUSIC
        </span>
      </div>

      {/* ── Search bar ── */}
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && search()}
          placeholder="Search music..."
          style={{
            flex:         1,
            padding:      '8px 12px',
            borderRadius: 8,
            background:   inputBg,
            border:       inputBorder,
            color:        primaryText,
            fontSize:     13,
            outline:      'none',
          }}
        />
        <button
          onClick={search}
          style={{
            padding:         '8px 14px',
            borderRadius:    8,
            border:          'none',
            background:      '#1C9EF9',
            color:           '#fff',
            fontWeight:      600,
            fontSize:        13,
            cursor:          'pointer',
            minWidth:        70,
            display:         'flex',
            alignItems:      'center',
            justifyContent:  'center',
          }}
        >
          {loading ? (
            <span
              style={{
                width:           14,
                height:          14,
                border:          '2px solid #fff',
                borderTopColor:  'transparent',
                borderRadius:    '50%',
                display:         'inline-block',
                animation:       'spin 0.7s linear infinite',
              }}
            />
          ) : (
            'Search'
          )}
        </button>
      </div>

      {/* ── Error ── */}
      {error && <div style={{ color: '#ef4444', fontSize: 12 }}>{error}</div>}

      {/* ── Results List Section (shown when searching) ── */}
      {showResults && (
        <div
          style={{
            maxHeight: '240px',
            overflowY: 'auto',
            borderRadius: 10,
            background: resultBg,
            border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid #e5e7eb',
          }}
        >
          {results.length === 0 && !loading ? (
            <div style={{
              padding: '16px',
              textAlign: 'center',
              color: secondaryText,
              fontSize: 12,
            }}>
              No results found
            </div>
          ) : (
            <div>
              {results.map((track, idx) => (
                <div
                  key={track.id}
                  onClick={() => contextPlayTrack(track, idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 12px',
                    borderBottom: idx < results.length - 1 ? `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : '#e5e7eb'}` : 'none',
                    cursor: 'pointer',
                    transition: 'background 150ms ease',
                    background: currentTrack?.id === track.id ? isDark ? 'rgba(28,158,249,0.12)' : '#eff8ff' : 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (currentTrack?.id !== track.id) {
                      e.currentTarget.style.background = resultHoverBg;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentTrack?.id !== track.id) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  {/* Thumbnail */}
                  <img
                    src={track.thumbnail}
                    alt={track.title}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 6,
                      objectFit: 'cover',
                      flexShrink: 0,
                    }}
                  />

                  {/* Title & Artist */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: primaryText,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {track.title}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: secondaryText,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {track.channel}
                    </div>
                  </div>

                  {/* Play Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      contextPlayTrack(track, idx);
                    }}
                    style={{
                      background: '#1C9EF9',
                      border: 'none',
                      borderRadius: 6,
                      width: 32,
                      height: 32,
                      cursor: 'pointer',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      transition: 'opacity 150ms ease',
                      opacity: 0.9,
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '0.9'}
                  >
                    <Play size={14} fill="#fff" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── YouTube embed — visible 16:9 when track is active ── */}
      {/* Note: iframe is now rendered at the MusicContext provider level with display: none */}

      {/* ── Now-playing bar (thumbnail + title + controls) ── */}
      {currentTrack && (
        <div
          style={{
            display:        'flex',
            alignItems:     'center',
            gap:            10,
            padding:        '10px 12px',
            borderRadius:   10,
            background:     isDark ? 'rgba(28,158,249,0.08)' : '#eff8ff',
            border:         isDark ? '1px solid rgba(28,158,249,0.2)' : '1px solid #bfdbfe',
          }}
        >
          <img
            src={currentTrack.thumbnail}
            style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover' }}
            alt=""
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize:      12,
                fontWeight:    600,
                color:         primaryText,
                whiteSpace:    'nowrap',
                overflow:      'hidden',
                textOverflow:  'ellipsis',
              }}
            >
              {currentTrack.title}
            </div>
            <div
              style={{
                fontSize:      11,
                color:         secondaryText,
                whiteSpace:    'nowrap',
                overflow:      'hidden',
                textOverflow:  'ellipsis',
              }}
            >
              {currentTrack.channel}
            </div>
          </div>
          <button
            onClick={contextTogglePlayPause}
            style={{
              background:     controlBg,
              border:         'none',
              borderRadius:   6,
              width:          30,
              height:         30,
              cursor:         'pointer',
              color:          primaryText,
              fontSize:       14,
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
            }}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
          <button
            onClick={contextPlayNext}
            style={{
              background:     controlBg,
              border:         'none',
              borderRadius:   6,
              width:          30,
              height:         30,
              cursor:         'pointer',
              color:          primaryText,
              fontSize:       14,
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
            }}
          >
            ⏭
          </button>
        </div>
      )}

    </div>
  );
}