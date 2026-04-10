<?php
// app/Http/Controllers/MusicController.php
// ─────────────────────────────────────────────────────────────────────────────
// Handles all music-related API endpoints.
//
// Endpoints:
//   GET  /api/music/search?q=query       → search Spotify
//   GET  /api/music/suggest?mood=text    → AI mood → keywords → Spotify tracks
//   GET  /api/music/genres               → list available Spotify genres
// ─────────────────────────────────────────────────────────────────────────────

namespace App\Http\Controllers;

use App\Services\SpotifyService;
use App\Services\MusicSuggestionService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class MusicController extends Controller
{
    public function __construct(
        private SpotifyService         $spotify,
        private MusicSuggestionService $suggestionService,
    ) {}

    /**
     * GET /api/music/search
     *
     * Query params:
     *   q     (required) search string
     *   limit (optional) max results, default 20
     *
     * Response: { tracks: [ { id, title, artist, album, image, youtube_query } ] }
     */
    public function search(Request $request): JsonResponse
    {
        $request->validate([
            'q'     => 'required|string|min:1|max:200',
            'limit' => 'nullable|integer|min:1|max:50',
        ]);

        try {
            $results = $this->spotify->search(
                query: $request->q,
                limit: (int) $request->input('limit', 20),
            );
            return response()->json($results);
        } catch (\RuntimeException $e) {
            return response()->json(['error' => $e->getMessage()], 503);
        }
    }

    /**
     * GET /api/music/suggest
     *
     * Query params:
     *   mood  (required) user's mood or message
     *
     * Flow:
     *   mood → Gemini → { query, genres } → Spotify search → tracks
     *
     * Response: {
     *   suggestion: { query, genres, description },
     *   tracks: [...]
     * }
     */
    public function suggest(Request $request): JsonResponse
    {
        $request->validate([
            'mood' => 'required|string|min:2|max:500',
        ]);

        try {
            // 1. Ask Gemini for music keywords based on mood
            $suggestion = $this->suggestionService->getMusicKeywords(
                $request->input('mood')
            );

            // 2. Use the Gemini-generated query to search Spotify
            $tracks = $this->spotify->searchTracks($suggestion['query'], 16);

            // 3. If search returns too few, try genre recommendations as well
            if (count($tracks) < 5 && !empty($suggestion['genres'])) {
                $recommended = $this->spotify->getRecommendations(
                    seedGenres: $suggestion['genres'],
                    limit: 12
                );
                // Merge, avoiding duplicate IDs
                $existingIds = array_column($tracks, 'id');
                foreach ($recommended as $track) {
                    if (!in_array($track['id'], $existingIds)) {
                        $tracks[] = $track;
                    }
                }
            }

            return response()->json([
                'suggestion' => [
                    'query'       => $suggestion['query'],
                    'genres'      => $suggestion['genres'],
                    'description' => $suggestion['description'],
                    'source'      => $suggestion['source'],
                ],
                'tracks' => $tracks,
            ]);

        } catch (\RuntimeException $e) {
            return response()->json(['error' => $e->getMessage()], 503);
        }
    }

    /**
     * GET /api/music/genres
     * Returns available Spotify genre seeds.
     * Cached for 24 hours — genres rarely change.
     */
    public function genres(): JsonResponse
    {
        try {
            $genres = $this->spotify->getAvailableGenres();
            return response()->json(['genres' => $genres]);
        } catch (\RuntimeException $e) {
            return response()->json(['error' => $e->getMessage()], 503);
        }
    }
}