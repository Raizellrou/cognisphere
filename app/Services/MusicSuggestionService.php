<?php
// app/Services/MusicSuggestionService.php
// ─────────────────────────────────────────────────────────────────────────────
// Uses Gemini to convert a user's mood/message into Spotify search keywords.
//
// Flow:
//   User: "I feel stressed while studying"
//   Gemini: { "query": "lo-fi chill study beats", "genres": ["lo-fi", "ambient"] }
//   Backend: uses query/genres to search Spotify
//   Frontend: receives curated track list
// ─────────────────────────────────────────────────────────────────────────────

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MusicSuggestionService
{
    private string $apiKey;
    private string $model;
    private string $endpoint;

    public function __construct()
    {
        $this->apiKey   = config('services.gemini.api_key', '');
        $this->model    = 'gemini-1.5-flash';
        $this->endpoint = "https://generativelanguage.googleapis.com/v1beta/models/{$this->model}:generateContent";
    }

    /**
     * Convert a mood/message into music search keywords via Gemini.
     *
     * @param  string $mood  e.g. "I feel stressed studying for exams"
     * @return array  { query: string, genres: string[], keywords: string[] }
     */
    public function getMusicKeywords(string $mood): array
    {
        if (empty($this->apiKey)) {
            // Graceful fallback if Gemini isn't configured
            return $this->fallbackKeywords($mood);
        }

        $prompt = $this->buildPrompt($mood);

        try {
            $response = Http::withQueryParameters(['key' => $this->apiKey])
                ->timeout(15)
                ->post($this->endpoint, [
                    'contents' => [
                        ['role' => 'user', 'parts' => [['text' => $prompt]]]
                    ],
                    'generationConfig' => [
                        'temperature'     => 0.7,
                        'maxOutputTokens' => 256,
                    ],
                ]);

            if ($response->failed()) {
                Log::warning('Gemini music suggestion failed', ['status' => $response->status()]);
                return $this->fallbackKeywords($mood);
            }

            $text = data_get($response->json(), 'candidates.0.content.parts.0.text', '');
            return $this->parseGeminiResponse($text, $mood);

        } catch (\Exception $e) {
            Log::warning('Gemini music suggestion exception: ' . $e->getMessage());
            return $this->fallbackKeywords($mood);
        }
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    /**
     * THE PROMPT — instructs Gemini to return only structured JSON.
     * Strict JSON output makes parsing reliable and fast.
     */
    private function buildPrompt(string $mood): string
    {
        return <<<PROMPT
You are a music recommendation assistant. A user describes their current mood or situation.
Your job is to suggest the best music search keywords for them.

User's mood: "{$mood}"

Respond with ONLY a valid JSON object — no markdown, no explanation, no code fences.
The JSON must have exactly these fields:
{
  "query": "a short Spotify search query string (2-5 words)",
  "genres": ["genre1", "genre2", "genre3"],
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "description": "one sentence explaining your recommendation"
}

Rules:
- query should be specific and searchable on Spotify
- genres must be from common music genres (lo-fi, pop, ambient, classical, jazz, etc.)
- keywords are additional search terms
- Keep everything study/productivity appropriate
- If the mood is negative (stress, anxiety), suggest calming music
- If the mood is energetic, suggest upbeat music

Examples:
- "stressed studying" → query: "lo-fi chill study beats", genres: ["lo-fi", "ambient"]
- "need focus" → query: "focus deep work instrumental", genres: ["classical", "ambient"]
- "feeling motivated" → query: "upbeat motivational study music", genres: ["pop", "indie"]
PROMPT;
    }

    /**
     * Parse Gemini's JSON response safely.
     * Falls back to keyword extraction if JSON is malformed.
     */
    private function parseGeminiResponse(string $text, string $originalMood): array
    {
        // Strip any accidental markdown fences
        $text = preg_replace('/```json|```/i', '', $text);
        $text = trim($text);

        $parsed = json_decode($text, true);

        if (json_last_error() === JSON_ERROR_NONE && isset($parsed['query'])) {
            return [
                'query'       => $parsed['query'],
                'genres'      => $parsed['genres']      ?? [],
                'keywords'    => $parsed['keywords']    ?? [],
                'description' => $parsed['description'] ?? '',
                'source'      => 'gemini',
            ];
        }

        // JSON failed — fall back to basic keyword extraction
        Log::warning('Gemini returned non-JSON response', ['text' => $text]);
        return $this->fallbackKeywords($originalMood);
    }

    /**
     * Simple rule-based fallback when Gemini is unavailable.
     * Maps common mood keywords to music genres.
     */
    private function fallbackKeywords(string $mood): array
    {
        $mood = strtolower($mood);

        $map = [
            ['keywords' => ['stress', 'anxious', 'overwhelm', 'worried'],
             'query' => 'calming relaxing music', 'genres' => ['ambient', 'classical']],
            ['keywords' => ['focus', 'study', 'concentrate', 'work'],
             'query' => 'lo-fi study beats', 'genres' => ['lo-fi', 'ambient']],
            ['keywords' => ['tired', 'sleepy', 'lazy'],
             'query' => 'soft chill music', 'genres' => ['lo-fi', 'acoustic']],
            ['keywords' => ['happy', 'excited', 'motivated', 'energetic'],
             'query' => 'upbeat feel good pop', 'genres' => ['pop', 'indie']],
            ['keywords' => ['sad', 'down', 'lonely'],
             'query' => 'comforting gentle music', 'genres' => ['acoustic', 'indie']],
        ];

        foreach ($map as $rule) {
            foreach ($rule['keywords'] as $keyword) {
                if (str_contains($mood, $keyword)) {
                    return [
                        'query'       => $rule['query'],
                        'genres'      => $rule['genres'],
                        'keywords'    => [],
                        'description' => 'Based on your mood.',
                        'source'      => 'fallback',
                    ];
                }
            }
        }

        return [
            'query'       => 'lo-fi study beats',
            'genres'      => ['lo-fi'],
            'keywords'    => [],
            'description' => 'Good music for studying.',
            'source'      => 'fallback',
        ];
    }
}