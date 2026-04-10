<?php
// config/services.php
// Add the spotify block to your existing services.php

return [
    // ... existing entries (gemini, firebase, etc.) ...

    // ── Spotify ───────────────────────────────────────────────────────────────
    // Get credentials at: https://developer.spotify.com/dashboard
    // Create an app → copy Client ID and Client Secret
    'spotify' => [
        'client_id'     => env('SPOTIFY_CLIENT_ID'),
        'client_secret' => env('SPOTIFY_CLIENT_SECRET'),
    ],

    // ── Gemini (already exists — shown for reference) ─────────────────────────
    'gemini' => [
        'api_key' => env('GEMINI_API_KEY'),
        'model'   => env('GEMINI_MODEL', 'gemini-1.5-flash'),
    ],

    // ── Firebase (already exists — shown for reference) ───────────────────────
    'firebase' => [
        'credentials' => env('FIREBASE_CREDENTIALS', 'storage/app/firebase-service-account.json'),
        'project_id'  => env('FIREBASE_PROJECT_ID'),
    ],
];

// ─────────────────────────────────────────────────────────────────────────────
// .env additions:
// ─────────────────────────────────────────────────────────────────────────────
// SPOTIFY_CLIENT_ID=your_client_id_here
// SPOTIFY_CLIENT_SECRET=your_client_secret_here