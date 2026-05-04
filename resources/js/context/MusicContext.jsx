/**
 * MusicContext.jsx
 * Global context for music player state persistence across route navigation.
 * The YouTube iframe is mounted at the provider level so it survives page changes.
 */

import { createContext, useContext, useState, useRef } from 'react';

const MusicCtx = createContext(null);

const API_KEY = 'AIzaSyCD3dUfAtD-HzrJPIBFSl_qkmsZ0tEct60';

// Helper to get YouTube embed URL
const getEmbedSrc = (videoId, autoplay) =>
  `https://www.youtube.com/embed/${videoId}?autoplay=${autoplay ? 1 : 0}&controls=1&rel=0&modestbranding=1`;

export function MusicProvider({ children }) {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [results, setResults] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const iframeRef = useRef(null);

  // Search YouTube for music
  const search = async (query) => {
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    setResults([]);
    try {
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}+music&type=video&maxResults=10&key=${API_KEY}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.error) {
        setError(data.error.message);
        return;
      }
      const mapped = data.items.map((item) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        channel: item.snippet.channelTitle,
        thumbnail: item.snippet.thumbnails.default.url,
      }));
      setResults(mapped);
    } catch (e) {
      setError('Search failed. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // Play a track
  const playTrack = (track, index) => {
    setCurrentTrack(track);
    setCurrentIndex(index);
    setIsPlaying(true);
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

  // Play/pause toggle
  const togglePlayPause = () => {
    if (!currentTrack || !iframeRef.current) return;
    if (isPlaying) {
      iframeRef.current.src = '';
      setIsPlaying(false);
    } else {
      iframeRef.current.src = getEmbedSrc(currentTrack.id, true);
      setIsPlaying(true);
    }
  };

  // Play next track
  const playNext = () => {
    if (!results.length) return;
    const next = (currentIndex + 1) % results.length;
    playTrack(results[next], next);
  };

  const value = {
    currentTrack,
    results,
    isPlaying,
    currentIndex,
    loading,
    error,
    search,
    playTrack,
    togglePlayPause,
    playNext,
    iframeRef,
    setResults,
  };

  return (
    <MusicCtx.Provider value={value}>
      {children}
      {/* Hidden YouTube iframe at provider level — survives route changes */}
      <iframe
        ref={iframeRef}
        src=""
        style={{
          display: 'none',
          width: '0',
          height: '0',
        }}
        allow="autoplay; encrypted-media"
        allowFullScreen
        title="music-player-context"
      />
    </MusicCtx.Provider>
  );
}

export function useMusicContext() {
  const ctx = useContext(MusicCtx);
  if (!ctx) {
    throw new Error('useMusicContext must be used within MusicProvider');
  }
  return ctx;
}
