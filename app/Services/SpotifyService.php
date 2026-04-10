<?php
// app/Services/SpotifyService.php
// ─────────────────────────────────────────────────────────────────────────────
// Handles Spotify Web API communication.
// Uses Client Credentials Flow — no user login required.
// Tokens are cached in Laravel cache for 50 minutes (they expire at 60).
//
// Requires in .env:
//   SPOTIFY_CLIENT_ID=your_client_id
//   SPOTIFY_CLIENT_SECRET=your_client_secret
//
// Get credentials at: https://developer.spotify.com/dashboard
// ─────────────────────────────────────────────────────────────────────────────

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class SpotifyService
{
    private string $clientId;
    private string $clientSecret;
    private string $tokenUrl    = 'https://accounts.spotify.com/api/token';
    private string $apiBase     = 'https://api.spotify.com/v1';

    public function __construct()
    {
        $this->clientId     = config('services.spotify.client_id', '');
        $this->clientSecret = config('services.spotify.client_secret', '');
    }

    // ── Token management ──────────────────────────────────────────────────────

    /**
     * Gets a valid access token, using cache to avoid unnecessary requests.
     * Spotify tokens expire after 3600s — we cache for 3300s to be safe.
     */
    private function getAccessToken(): string
    {
        if (empty($this->clientId) || empty($this->clientSecret)) {
            throw new \RuntimeException(
                'Spotify credentials not configured. Add SPOTIFY_CLIENT_ID and ' .
                'SPOTIFY_CLIENT_SECRET to your .env file.'
            );
        }

        return Cache::remember('spotify_access_token', 3300, function () {
            $response = Http::asForm()
                ->withBasicAuth($this->clientId, $this->clientSecret)
                ->post($this->tokenUrl, [
                    'grant_type' => 'client_credentials',
                ]);

            if ($response->failed()) {
                Log::error('Spotify token request failed', [
                    'status' => $response->status(),
                    'body'   => $response->body(),
                ]);
                throw new \RuntimeException(
                    'Could not authenticate with Spotify. Check your API credentials.'
                );
            }

            return $response->json('access_token');
        });
    }

    /**
     * Make an authenticated GET request to the Spotify API.
     */
    private function get(string $endpoint, array $params = []): array
    {
        $token    = $this->getAccessToken();
        $response = Http::withToken($token)
            ->timeout(10)
            ->get($this->apiBase . $endpoint, $params);

        if ($response->status() === 401) {
            // Token expired mid-request — clear cache and retry once
            Cache::forget('spotify_access_token');
            $token    = $this->getAccessToken();
            $response = Http::withToken($token)
                ->timeout(10)
                ->get($this->apiBase . $endpoint, $params);
        }

        if ($response->failed()) {
            Log::error('Spotify API request failed', [
                'endpoint' => $endpoint,
                'status'   => $response->status(),
                'body'     => $response->body(),
            ]);
            throw new \RuntimeException('Spotify API request failed: ' . $response->status());
        }

        return $response->json();
    }

    // ── Search ────────────────────────────────────────────────────────────────

    /**
     * Search Spotify for tracks matching a query.
     *
     * @param  string $query  Search string (e.g. "lofi chill beats")
     * @param  int    $limit  Max results (1–50)
     * @return array  Simplified track objects
     */
    public function searchTracks(string $query, int $limit = 20): array
    {
        $data = $this->get('/search', [
            'q'     => $query,
            'type'  => 'track',
            'limit' => min($limit, 50),
        ]);

        $tracks = data_get($data, 'tracks.items', []);

        // Simplify the Spotify response — only send what the frontend needs
        return array_map(fn($track) => $this->simplifyTrack($track), $tracks);
    }

    /**
     * Search for tracks AND artists in one call.
     * Useful for the initial "discover" view.
     */
    public function search(string $query, int $limit = 20): array
    {
        $data = $this->get('/search', [
            'q'     => $query,
            'type'  => 'track,artist',
            'limit' => min($limit, 50),
        ]);

        return [
            'tracks'  => array_map(
                fn($t) => $this->simplifyTrack($t),
                data_get($data, 'tracks.items', [])
            ),
        ];
    }

    /**
     * Get recommendations based on seed tracks or genres.
     * Used by the AI suggestion endpoint.
     *
     * @param array $seedGenres  e.g. ['lo-fi', 'study', 'ambient']
     * @param array $seedTracks  Spotify track IDs
     */
    public function getRecommendations(
        array $seedGenres = [],
        array $seedTracks = [],
        int   $limit = 20
    ): array {
        $params = ['limit' => $limit];

        if (!empty($seedGenres)) {
            // Spotify accepts max 5 seeds total
            $params['seed_genres'] = implode(',', array_slice($seedGenres, 0, 3));
        }
        if (!empty($seedTracks)) {
            $params['seed_tracks'] = implode(',', array_slice($seedTracks, 0, 2));
        }

        // Fallback if no seeds provided
        if (empty($params['seed_genres']) && empty($params['seed_tracks'])) {
            $params['seed_genres'] = 'pop';
        }

        $data = $this->get('/recommendations', $params);

        return array_map(
            fn($t) => $this->simplifyTrack($t),
            data_get($data, 'tracks', [])
        );
    }

    /**
     * Get available genre seeds (for validation / UI dropdowns).
     */
    public function getAvailableGenres(): array
    {
        return Cache::remember('spotify_genres', 86400, function () {
            $data = $this->get('/recommendations/available-genre-seeds');
            return data_get($data, 'genres', []);
        });
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    /**
     * Strips a full Spotify track object down to only what the frontend needs.
     * This keeps our API responses small and our frontend code simple.
     */
    private function simplifyTrack(array $track): array
    {
        return [
            'id'          => $track['id'] ?? '',
            'title'       => $track['name'] ?? 'Unknown Title',
            'artist'      => collect($track['artists'] ?? [])
                                ->pluck('name')
                                ->implode(', '),
            'album'       => $track['album']['name'] ?? '',
            'image'       => data_get($track, 'album.images.0.url', null),
            'duration_ms' => $track['duration_ms'] ?? 0,
            'spotify_url' => data_get($track, 'external_urls.spotify', null),
            // Pre-built YouTube search query — frontend uses this directly
            'youtube_query' => urlencode(
                ($track['name'] ?? '') . ' ' .
                (collect($track['artists'] ?? [])->pluck('name')->first() ?? '') .
                ' official audio'
            ),
        ];
    }
}