/**
 * musicApiService.js
 * resources/js/services/musicApiService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * All HTTP calls to the Laravel music API.
 * Uses the Firebase ID token for authentication.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { auth } from '@/firebase';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

async function apiFetch(path) {
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new Error('Not authenticated.');

  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept':        'application/json',
    },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Request failed: ${res.status}`);
  }

  return res.json();
}

/**
 * Search Spotify for tracks.
 * @param {string} query
 * @param {number} limit
 * @returns {Promise<{ tracks: Track[] }>}
 */
export async function searchMusic(query, limit = 20) {
  const q = encodeURIComponent(query);
  return apiFetch(`/music/search?q=${q}&limit=${limit}`);
}

/**
 * Get AI-suggested music based on a mood/message.
 * @param {string} mood
 * @returns {Promise<{ suggestion: Suggestion, tracks: Track[] }>}
 */
export async function suggestMusic(mood) {
  const m = encodeURIComponent(mood);
  return apiFetch(`/music/suggest?mood=${m}`);
}

/**
 * Get available Spotify genre seeds.
 * @returns {Promise<{ genres: string[] }>}
 */
export async function fetchGenres() {
  return apiFetch('/music/genres');
}