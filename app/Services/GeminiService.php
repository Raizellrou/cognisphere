<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeminiService
{
    private string $apiKey;

    // ✅ Stable + fallback models
    private array $models = [];

    public function __construct()
    {
        $this->apiKey = config('services.gemini.api_key', '');

        $this->models = [
            config('services.gemini.model', 'gemini-1.5-flash')
        ];

        $this->baseEndpoint =
            'https://generativelanguage.googleapis.com/v1/models/';
    }

    /**
     * Main entry: ask Gemini
     */
    public function ask(
        string $userMessage,
        string $fileContext = '',
        array  $conversationHistory = []
    ): string {

        if (empty($this->apiKey)) {
            Log::error('Gemini API key missing');
            throw new \RuntimeException('AI service not configured.');
        }

        // Build conversation
        $contents = $this->buildContents($conversationHistory, $userMessage);

        // Inject system prompt INTO first message (Gemini-safe way)
        $contents[0]['parts'][0]['text'] =
            $this->buildSystemPrompt($fileContext) . "\n\n" .
            $contents[0]['parts'][0]['text'];

        // Try models (fallback system)
        foreach ($this->models as $model) {
            $result = $this->tryWithRetries($model, $contents);

            if ($result !== null) {
                return $result;
            }
        }

        throw new \RuntimeException('AI service unavailable. Try again later.');
    }

    /**
     * Retry logic with exponential backoff
     */
    private function tryWithRetries(
        string $model,
        array  $contents
    ): ?string {

        $maxRetries = 3;
        $delayMs    = 1000;

        for ($attempt = 1; $attempt <= $maxRetries; $attempt++) {

            $endpoint = $this->baseEndpoint . $model . ':generateContent';

            try {
                $response = Http::withQueryParameters([
                        'key' => $this->apiKey
                    ])
                    ->timeout(30)
                    ->post($endpoint, [
                        'contents' => $contents,
                        'generationConfig' => [
                            'temperature'     => 0.3,
                            'maxOutputTokens' => 2048,
                        ],
                    ]);

                $status = $response->status();
                $body   = $response->json();

                // ✅ SUCCESS
                if ($response->successful()) {
                    $text = data_get($body, 'candidates.0.content.parts.0.text');

                    if ($text) return trim($text);

                    Log::warning('Gemini empty response', [
                        'model' => $model,
                        'body'  => $body
                    ]);

                    return null;
                }

                // ❌ BAD REQUEST
                if ($status === 400) {
                    Log::error('Gemini 400 error', [
                        'model' => $model,
                        'body'  => $body
                    ]);
                    throw new \RuntimeException('Invalid AI request.');
                }

                // ❌ AUTH ERROR
                if ($status === 401 || $status === 403) {
                    Log::error('Gemini auth error', [
                        'model' => $model,
                        'body'  => $body
                    ]);
                    throw new \RuntimeException('Invalid Gemini API key.');
                }

                // ⚠️ Retryable errors
                if (in_array($status, [429, 500, 503])) {
                    Log::warning("Gemini retry {$attempt}", [
                        'model'  => $model,
                        'status' => $status,
                        'body'   => $body
                    ]);
                }

            } catch (\Throwable $e) {
                Log::error('Gemini exception', [
                    'model'   => $model,
                    'attempt' => $attempt,
                    'error'   => $e->getMessage()
                ]);
            }

            // ⏳ Exponential backoff
            if ($attempt < $maxRetries) {
                usleep($delayMs * 1000);
                $delayMs *= 2;
            }
        }

        return null;
    }

    /**
     * System prompt builder
     */
    private function buildSystemPrompt(string $fileContext): string
    {
        if (empty($fileContext)) {
            return <<<PROMPT
You are Cognisphere, a strict AI study assistant.

You MUST respond ONLY with:
"📂 No study materials uploaded yet. Please upload a file first."

Do NOT answer anything else.
PROMPT;
        }

        return <<<PROMPT
You are Cognisphere, a strict AI study assistant.

ONLY use the study materials below.

{$fileContext}

RULES:
- Only answer from the material
- If not found, say: "❌ I can only answer based on your uploaded materials."
- Do not use outside knowledge
PROMPT;
    }

    /**
     * Build conversation history
     */
    private function buildContents(array $history, string $currentMessage): array
    {
        $contents = [];

        foreach (array_slice($history, -20) as $turn) {
            $contents[] = [
                'role'  => $turn['role'],
                'parts' => [
                    ['text' => $turn['content'] ?? '']
                ],
            ];
        }

        // Current message
        $contents[] = [
            'role' => 'user',
            'parts' => [
                ['text' => $currentMessage]
            ]
        ];

        return $contents;
    }
}