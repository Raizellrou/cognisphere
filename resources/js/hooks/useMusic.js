/**
 * useMusic.js
 * resources/js/hooks/useMusic.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Manages:
 *  1. Track search via Spotify (through Laravel)
 *  2. AI mood suggestions (Gemini → Spotify)
 *  3. Currently playing track + YouTube query
 *  4. Recently played — saved and fetched from Firestore
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useCallback } from 'react';
import {
  collection, addDoc, query,
  orderBy, limit, onSnapshot, serverTimestamp,
} from 'firebase/firestore';
import { db }          from '@/firebase';
import { searchMusic, suggestMusic } from '@/services/musicApiService';

export function useMusic(uid) {
  // ── State ─────────────────────────────────────────────────────────────────
  const [searchResults, setSearchResults]   = useState([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [currentTrack, setCurrentTrack]     = useState(null);
  const [suggestion, setSuggestion]         = useState(null); // AI suggestion metadata

  const [loading, setLoading] = useState({
    search:  false,
    suggest: false,
    recent:  true,
  });
  const [error, setError]   = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // ── Recently played — real-time Firestore listener ────────────────────────
  useEffect(() => {
    if (!uid) return;

    const q = query(
      collection(db, 'users', uid, 'recentlyPlayed'),
      orderBy('playedAt', 'desc'),
      limit(20)
    );

    const unsub = onSnapshot(q, (snap) => {
      setRecentlyPlayed(
        snap.docs.map(d => ({ id: d.id, ...d.data() }))
      );
      setLoading(l => ({ ...l, recent: false }));
    }, (err) => {
      setError('Failed to load recently played tracks.');
      setLoading(l => ({ ...l, recent: false }));
    });

    return unsub;
  }, [uid]);

  // ── Search ────────────────────────────────────────────────────────────────
  const search = useCallback(async (query) => {
    if (!query.trim()) return;

    setSearchQuery(query);
    setLoading(l => ({ ...l, search: true }));
    setError(null);
    setSuggestion(null);

    try {
      const data = await searchMusic(query);
      setSearchResults(data.tracks ?? []);
    } catch (err) {
      setError(err.message || 'Search failed.');
      setSearchResults([]);
    } finally {
      setLoading(l => ({ ...l, search: false }));
    }
  }, []);

  // ── AI mood suggestion ────────────────────────────────────────────────────
  const suggestFromMood = useCallback(async (mood) => {
    if (!mood.trim()) return;

    setLoading(l => ({ ...l, suggest: true }));
    setError(null);

    try {
      const data = await suggestMusic(mood);
      setSearchResults(data.tracks ?? []);
      setSuggestion(data.suggestion ?? null);
      setSearchQuery(data.suggestion?.query ?? mood);
    } catch (err) {
      setError(err.message || 'Could not get suggestions.');
    } finally {
      setLoading(l => ({ ...l, suggest: false }));
    }
  }, []);

  // ── Play a track ──────────────────────────────────────────────────────────
  const playTrack = useCallback(async (track) => {
    setCurrentTrack(track);

    // Save to Firestore recently played (fire-and-forget)
    if (uid) {
      addDoc(collection(db, 'users', uid, 'recentlyPlayed'), {
        trackId:      track.id,
        title:        track.title,
        artist:       track.artist,
        album:        track.album,
        image:        track.image,
        youtubeQuery: track.youtube_query,
        spotifyUrl:   track.spotify_url,
        playedAt:     serverTimestamp(),
      }).catch(() => {}); // Non-critical — don't surface this error
    }
  }, [uid]);

  const clearSearch = useCallback(() => {
    setSearchResults([]);
    setSearchQuery('');
    setSuggestion(null);
    setError(null);
  }, []);

  return {
    // State
    searchResults, recentlyPlayed, currentTrack,
    suggestion, searchQuery, loading, error,
    // Actions
    search, suggestFromMood, playTrack, clearSearch,
  };
}