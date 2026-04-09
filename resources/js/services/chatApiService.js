/**
 * chatApiService.js
 * resources/js/services/chatApiService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * FIX: Removed all /api/chats endpoints (no longer exist in Laravel).
 *      Chat management is now done directly via Firestore in useChat.js.
 *
 * This file now only handles:
 *  1. POST /api/ai/ask  → send message + file context + history to Gemini
 *  2. POST /api/files   → upload a study file
 *  3. GET  /api/files   → list uploaded files
 *  4. DELETE /api/files/{id} → delete a file
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { auth } from '@/firebase';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

// ── Core fetch wrapper ────────────────────────────────────────────────────────

async function apiFetch(path, options = {}) {
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new Error('Not authenticated.');

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept':        'application/json',
      ...(options.body instanceof FormData
        ? {}
        : { 'Content-Type': 'application/json' }),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || data.message || `Request failed: ${res.status}`);
  }

  return res.json();
}

// ── AI endpoint ───────────────────────────────────────────────────────────────

/**
 * Send a message to Gemini via Laravel.
 *
 * @param {string}   message   User's question
 * @param {string[]} fileIds   IDs of files attached to this chat
 * @param {Array}    history   Last N messages: [{role:'user'|'ai', content:'...'}]
 * @returns {Promise<{reply: string}>}
 */
export async function askAI(message, fileIds = [], history = []) {
  return apiFetch('/ai/ask', {
    method: 'POST',
    body:   JSON.stringify({ message, fileIds, history }),
  });
}

// ── File endpoints ────────────────────────────────────────────────────────────

/** Upload a study file. Returns { file: { id, original_name, size, ... } } */
export async function uploadFile(file) {
  const formData = new FormData();
  formData.append('file', file);
  return apiFetch('/files', { method: 'POST', body: formData });
}

/** List all uploaded files for the current user. */
export async function fetchFiles() {
  return apiFetch('/files');
}

/** Delete an uploaded file. */
export async function deleteFile(fileId) {
  return apiFetch(`/files/${fileId}`, { method: 'DELETE' });
}