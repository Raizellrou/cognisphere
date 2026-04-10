<?php
// app/Services/GeminiService.php
// ─────────────────────────────────────────────────────────────────────────────
// FIXES:
//  1. Retry with exponential backoff on 503 (Gemini overload is temporary)
//  2. Auto-fallback to a stable model if primary keeps failing
//  3. Better error messages — surfaces the ACTUAL Gemini error to logs
//     so you can tell if it's a bad API key vs server overload
//  4. Validates API key is set before making any request
// ─────────────────────────────────────────────────────────────────────────────

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeminiService
{
    private string $apiKey;

    // Model priority order — falls back down the list on repeated 503s
    private array $models = [
        'gemini-1.5-flash',       // Primary: fast, free tier friendly
        'gemini-1.5-flash-8b',    // Fallback 1: lighter, more available
        'gemini-1.0-pro',         // Fallback 2: older but very stable
    ];

    private string $baseEndpoint =
        'https://generativelanguage.googleapis.com/v1beta/models/';

    public function __construct()
    {
        $this->apiKey = config('services.gemini.api_key', '');
    }

    /**
     * Send a message to Gemini with automatic retry + model fallback.
     */
    public function ask(
        string $userMessage,
        string $fileContext = '',
        array  $conversationHistory = []
    ): string {
        // ── Guard: catch missing API key immediately ───────────────────────
        if (empty($this->apiKey)) {
            Log::error('Gemini API key is not set. Add GEMINI_API_KEY to your .env file.');
            throw new \RuntimeException(
                'AI service is not configured. Please contact the administrator.'
            );
        }

        $systemPrompt = $this->buildSystemPrompt($fileContext);
        $contents     = $this->buildContents($conversationHistory, $userMessage);

        // Try each model in order
        foreach ($this->models as $modelIndex => $model) {
            $result = $this->tryWithRetries($model, $systemPrompt, $contents, $modelIndex);
            if ($result !== null) {
                return $result;
            }
            // Log that we're falling back
            Log::warning("Gemini model {$model} exhausted retries, trying next model.");
        }

        throw new \RuntimeException(
            'AI service is temporarily unavailable. All models are overloaded. Please try again in a few minutes.'
        );
    }

    // ── Private: retry a single model up to 3 times ───────────────────────

    private function tryWithRetries(
        string $model,
        string $systemPrompt,
        array  $contents,
        int    $modelIndex
    ): ?string {
        $maxRetries = 3;
        $delayMs    = 1000; // Start at 1 second, doubles each retry

        for ($attempt = 1; $attempt <= $maxRetries; $attempt++) {
            $endpoint = $this->baseEndpoint . $model . ':generateContent';

            $response = Http::withQueryParameters(['key' => $this->apiKey])
                ->timeout(30)
                ->post($endpoint, [
                    'system_instruction' => [
                        'parts' => [['text' => $systemPrompt]],
                    ],
                    'contents'         => $contents,
                    'generationConfig' => [
                        'temperature'     => 0.3,
                        'topK'            => 40,
                        'topP'            => 0.95,
                        'maxOutputTokens' => 2048,
                    ],
                    'safetySettings' => [
                        ['category' => 'HARM_CATEGORY_HARASSMENT',        'threshold' => 'BLOCK_MEDIUM_AND_ABOVE'],
                        ['category' => 'HARM_CATEGORY_HATE_SPEECH',       'threshold' => 'BLOCK_MEDIUM_AND_ABOVE'],
                        ['category' => 'HARM_CATEGORY_SEXUALLY_EXPLICIT', 'threshold' => 'BLOCK_MEDIUM_AND_ABOVE'],
                        ['category' => 'HARM_CATEGORY_DANGEROUS_CONTENT', 'threshold' => 'BLOCK_MEDIUM_AND_ABOVE'],
                    ],
                ]);

            $status = $response->status();
            $body   = $response->json();

            // ── Success ───────────────────────────────────────────────────
            if ($response->successful()) {
                $text = data_get($body, 'candidates.0.content.parts.0.text');

                if ($text) return trim($text);

                // Empty response — check why
                $finishReason = data_get($body, 'candidates.0.finishReason');
                if ($finishReason === 'SAFETY') {
                    return "I'm unable to respond to that due to content safety guidelines.";
                }

                Log::warning('Gemini returned empty text', [
                    'model'  => $model,
                    'body'   => $body,
                ]);
                return null;
            }

            // ── 400 Bad Request — API key invalid or bad payload ──────────
            // Don't retry — this won't fix itself
            if ($status === 400) {
                $errorMsg = data_get($body, 'error.message', 'Bad request');
                Log::error("Gemini 400 error on model {$model}: {$errorMsg}", ['body' => $body]);
                throw new \RuntimeException("AI configuration error: {$errorMsg}");
            }

            // ── 401 / 403 — Invalid API key ───────────────────────────────
            if ($status === 401 || $status === 403) {
                $errorMsg = data_get($body, 'error.message', 'Authentication failed');
                Log::error("Gemini auth error: {$errorMsg}. Check your GEMINI_API_KEY in .env");
                throw new \RuntimeException(
                    'AI authentication failed. Check your Gemini API key in the .env file.'
                );
            }

            // ── 429 Rate limit ────────────────────────────────────────────
            if ($status === 429) {
                $errorMsg = data_get($body, 'error.message', 'Rate limited');
                Log::warning("Gemini rate limited on {$model}: {$errorMsg}");
                // Fall through to retry with delay
            }

            // ── 503 Server overload — retry with backoff ──────────────────
            if ($status === 503) {
                $errorMsg = data_get($body, 'error.message', 'Service unavailable');
                Log::warning("Gemini 503 on model {$model} attempt {$attempt}: {$errorMsg}");
            }

            // ── Wait before retrying (exponential backoff) ─────────────────
            if ($attempt < $maxRetries) {
                $waitSeconds = $delayMs / 1000;
                Log::info("Waiting {$waitSeconds}s before retry {$attempt} on model {$model}");
                usleep($delayMs * 1000); // usleep takes microseconds
                $delayMs *= 2;           // 1s → 2s → 4s
            }
        }

        return null; // This model is exhausted — caller will try the next one
    }

    // ── Prompt builders (unchanged) ───────────────────────────────────────

    private function buildSystemPrompt(string $fileContext): string
    {
        if (empty($fileContext)) {
            return <<<PROMPT
You are Cognisphere, a strict AI study assistant.

CRITICAL RULE: You have NO study materials available for this conversation yet.

You MUST respond to EVERY message with exactly this:
"📂 No study materials uploaded yet. Please upload a PDF, text file, or document first, then I can help you study its content. Use the paperclip button to attach files."

Do NOT answer any questions, do NOT have general conversations, do NOT provide information from your training data.
PROMPT;
        }

        return <<<PROMPT
You are Cognisphere, a strict AI study assistant. Your ONLY job is to help users study the documents they have uploaded.

══════════════════════════════════════════════
STUDY MATERIALS PROVIDED BY THE USER:
══════════════════════════════════════════════
{$fileContext}
══════════════════════════════════════════════

ABSOLUTE RULES:
1. ONLY answer questions answerable from the STUDY MATERIALS above.
2. If a question is outside the materials, respond: "❌ I can only answer questions based on your uploaded study materials."
3. NEVER use training data to answer. All answers from study materials only.
4. NEVER hallucinate information not in the documents.

WHAT YOU CAN DO:
✅ Summarize sections or the entire document
✅ Answer specific questions from the document content
✅ Explain concepts that appear in the document
✅ Create quiz questions based on document content
PROMPT;
    }

    private function buildContents(array $history, string $currentMessage): array
    {
        $contents = [];
        foreach (array_slice($history, -20) as $turn) {
            $contents[] = [
                'role'  => $turn['role'],
                'parts' => [['text' => $turn['parts'][0]['text'] ?? '']],
            ];
        }
        $contents[] = ['role' => 'user', 'parts' => [['text' => $currentMessage]]];
        return $contents;
    }
}