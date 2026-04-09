<?php
// app/Services/GeminiService.php
// ─────────────────────────────────────────────────────────────────────────────
// Handles all communication with the Google Gemini API.
//
// KEY DESIGN DECISIONS:
//  1. The system prompt HARD-ENFORCES study-only context.
//     Gemini is instructed to refuse anything outside the uploaded documents.
//  2. File content is injected into the prompt as a "STUDY MATERIALS" block.
//     Gemini then treats it as the ONLY source of truth.
//  3. If no files are attached, the AI is still strict — it tells the user
//     to upload materials before asking questions.
//  4. Conversation history is sent with every request so Gemini has context.
//
// Requires: composer require google/cloud-ai-platform (or direct HTTP via Guzzle)
// We use direct HTTP here to avoid dependency conflicts.
// ─────────────────────────────────────────────────────────────────────────────

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeminiService
{
    private string $apiKey;
    private string $model;
    private string $endpoint;

    public function __construct()
    {
        $this->apiKey   = config('services.gemini.api_key');
        $this->model    = config('services.gemini.model', 'gemini-1.5-flash');
        $this->endpoint = "https://generativelanguage.googleapis.com/v1beta/models/{$this->model}:generateContent";
    }

    /**
     * Send a user question + file context + conversation history to Gemini.
     *
     * @param string $userMessage       The user's current question
     * @param string $fileContext       Extracted text from all attached files (may be empty)
     * @param array  $conversationHistory  Previous messages [['role'=>'user'|'model', 'parts'=>[['text'=>'...']]]]
     * @return string                   Gemini's response text
     */
    public function ask(
        string $userMessage,
        string $fileContext = '',
        array  $conversationHistory = []
    ): string {
        $systemInstruction = $this->buildSystemPrompt($fileContext);
        $contents          = $this->buildContents($conversationHistory, $userMessage);

        $payload = [
            'system_instruction' => [
                'parts' => [['text' => $systemInstruction]],
            ],
            'contents'           => $contents,
            'generationConfig'   => [
                'temperature'     => 0.3,   // Lower = more factual, less hallucination
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
        ];

        $response = Http::withQueryParameters(['key' => $this->apiKey])
            ->timeout(30)
            ->post($this->endpoint, $payload);

        if ($response->failed()) {
            Log::error('Gemini API error', [
                'status' => $response->status(),
                'body'   => $response->body(),
            ]);
            throw new \RuntimeException('AI service is temporarily unavailable. Please try again.');
        }

        $data = $response->json();

        // Extract text from response
        $text = data_get($data, 'candidates.0.content.parts.0.text');

        if (!$text) {
            // Check if blocked by safety filters
            $finishReason = data_get($data, 'candidates.0.finishReason');
            if ($finishReason === 'SAFETY') {
                return "I'm unable to respond to that message due to content safety guidelines.";
            }
            throw new \RuntimeException('Received an empty response from AI.');
        }

        return trim($text);
    }

    // ── Prompt Engineering ───────────────────────────────────────────────────

    /**
     * THE CRITICAL SYSTEM PROMPT.
     *
     * This is what enforces the "study context only" rule.
     * Gemini is given explicit instructions to:
     *  1. ONLY answer from the provided study materials
     *  2. Refuse ANY question not grounded in those materials
     *  3. Never make up information not in the documents
     *
     * When $fileContext is empty, it tells the user to upload files first.
     */
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

ABSOLUTE RULES — YOU MUST FOLLOW THESE AT ALL TIMES:

1. ONLY answer questions that are directly answerable using the STUDY MATERIALS above.
2. If a question cannot be answered from the study materials, respond with:
   "❌ I can only answer questions based on your uploaded study materials. Your question appears to be outside that scope. Try asking something directly related to the documents you uploaded."
3. NEVER use your training data to answer questions. All answers must come ONLY from the study materials.
4. NEVER make up, infer, or hallucinate information not present in the documents.
5. If you are UNSURE whether something is in the documents, say: "I don't see a clear answer to that in your study materials."

WHAT YOU CAN DO:
✅ Summarize sections or the entire document
✅ Answer specific questions from the document content
✅ Explain concepts that appear in the document
✅ Create quiz questions based on document content
✅ Compare topics mentioned in the document
✅ Highlight key points from the document

HOW TO RESPOND:
- Be concise but thorough
- Use bullet points for lists
- Quote directly from the document when relevant (use "..." format)
- Always ground your answers in the specific document content
- If asked to summarize, cover the main points systematically
PROMPT;
    }

    /**
     * Builds the Gemini 'contents' array from conversation history + new message.
     *
     * Gemini expects alternating user/model turns.
     * History format: [['role'=>'user'|'model', 'parts'=>[['text'=>'...']]]]
     */
    private function buildContents(array $history, string $currentMessage): array
    {
        $contents = [];

        // Add conversation history (last 10 exchanges to stay within token limits)
        $recentHistory = array_slice($history, -20); // 10 user + 10 model turns
        foreach ($recentHistory as $turn) {
            $contents[] = [
                'role'  => $turn['role'],  // 'user' or 'model'
                'parts' => [['text' => $turn['parts'][0]['text'] ?? '']],
            ];
        }

        // Add current user message
        $contents[] = [
            'role'  => 'user',
            'parts' => [['text' => $currentMessage]],
        ];

        return $contents;
    }
}