import { useState, useRef } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { Music2 } from 'lucide-react';

const API_KEY = 'AIzaSyCD3dUfAtD-HzrJPIBFSl_qkmsZ0tEct60';

export default function MusicWidget() {
  const { isDark } = useTheme();
  const [query, setQuery]               = useState('');
  const [results, setResults]           = useState([]);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');
  const [currentTrack, setCurrentTrack] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused]         = useState(false);
  const iframeRef = useRef(null);

  const primaryText  = isDark ? '#ffffff' : '#111827';
  const secondaryText = isDark ? 'rgba(255,255,255,0.45)' : '#6b7280';
  const inputBg      = isDark ? 'rgba(255,255,255,0.06)' : '#f3f4f6';
  const inputBorder  = isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e5e7eb';
  const controlBg    = isDark ? 'rgba(255,255,255,0.08)' : '#f3f4f6';

  // FIX: use youtube.com (not nocookie), controls=1 required for
  // autoplay policy, no origin= param to avoid localhost mismatch
  const getEmbedSrc = (videoId, autoplay) =>
    `https://www.youtube.com/embed/${videoId}?autoplay=${autoplay ? 1 : 0}&controls=1&rel=0&modestbranding=1`;

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    setResults([]);
    try {
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}+music&type=video&maxResults=10&key=${API_KEY}`;
      const res  = await fetch(url);
      const data = await res.json();
      if (data.error) { setError(data.error.message); return; }
      const mapped = data.items.map((item) => ({
        id:        item.id.videoId,
        title:     item.snippet.title,
        channel:   item.snippet.channelTitle,
        thumbnail: item.snippet.thumbnails.default.url,
      }));
      setResults(mapped);
      findAndPlay(mapped, 0);
    } catch (e) {
      setError('Search failed. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const playTrack = (track, index) => {
    setCurrentTrack(track);
    setCurrentIndex(index);
    setIsPaused(false);
    if (iframeRef.current) {
      iframeRef.current.src = getEmbedSrc(track.id, true);
      setTimeout(() => {
        try {
          const doc = iframeRef.current?.contentDocument;
          if (doc && doc.title && doc.title.toLowerCase().includes('not available')) {
            const next = (index + 1) % results.length;
            if (next !== index) playTrack(results[next], next);
          }
        } catch (e) {
          // cross-origin block means video IS loading fine
        }
      }, 4000);
    }
  };

  const handlePlayPause = () => {
    if (!currentTrack || !iframeRef.current) return;
    if (isPaused) {
      iframeRef.current.src = getEmbedSrc(currentTrack.id, true);
      setIsPaused(false);
    } else {
      iframeRef.current.src = '';
      setIsPaused(true);
    }
  };

  const findAndPlay = async (trackList, startIndex) => {
    for (let i = startIndex; i < trackList.length; i++) {
      const track = trackList[i];
      setCurrentTrack(track);
      setCurrentIndex(i);
      setIsPaused(false);
      if (iframeRef.current) {
        iframeRef.current.src = getEmbedSrc(track.id, true);
      }
      await new Promise(res => setTimeout(res, 3500));
      try {
        const doc = iframeRef.current?.contentDocument;
        if (!doc || !doc.title || !doc.title.toLowerCase().includes('not available')) {
          return;
        }
      } catch (e) {
        return;
      }
    }
  };

  const handleNext = () => {
    if (!results.length) return;
    const next = (currentIndex + 1) % results.length;
    findAndPlay(results, next);
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

      {/* ── YouTube embed — visible 16:9 when track is active ── */}
      <iframe
        ref={iframeRef}
        src=""
        style={{
          display:      currentTrack ? 'block' : 'none',
          width:        '100%',
          aspectRatio:  '16/9',
          borderRadius: 10,
          border:       'none',
        }}
        allow="autoplay; encrypted-media"
        allowFullScreen
        title="music-player"
        onError={handleNext}
        onEnded={handleNext}
      />

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
            onClick={handlePlayPause}
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
            {isPaused ? '▶' : '⏸'}
          </button>
          <button
            onClick={handleNext}
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

      {/* ── Scrollable results list REMOVED intentionally ── */}

    </div>
  );
}