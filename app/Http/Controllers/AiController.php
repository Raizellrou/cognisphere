<?php
// app/Http/Controllers/AiController.php
// ─────────────────────────────────────────────────────────────────────────────
// FIX: Removed ALL Firestore/FirestoreService dependencies.
//
// NEW ARCHITECTURE:
//  - Frontend sends: message + fileIds + conversation history
//  - Backend: fetches extracted file text → calls Gemini → returns reply
//  - Frontend: saves both user message AND AI reply to Firestore directly
//
// WHY THIS IS BETTER:
//  - Zero PHP Firestore SDK dependency (eliminates the crash)
//  - Backend does exactly one job: call Gemini
//  - Frontend Firebase JS SDK handles all Firestore operations natively
// ─────────────────────────────────────────────────────────────────────────────

namespace App\Http\Controllers;

use App\Services\GeminiService;
use App\Services\FileExtractionService;
use App\Models\StudyFile;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class AiController extends Controller
{
    public function __construct(
        private GeminiService         $gemini,
        private FileExtractionService $extractor,
    ) {}

    /**
     * POST /api/ai/ask
     *
     * Request body:
     * {
     *   "message":  "What is the main topic of chapter 2?",
     *   "fileIds":  ["fileId1", "fileId2"],        // files attached to this chat
     *   "history":  [                               // last N messages (from frontend)
     *     { "role": "user", "content": "Hello" },
     *     { "role": "ai",   "content": "Hi!" }
     *   ]
     * }
     *
     * Response:
     * {
     *   "reply": "Chapter 2 focuses on..."
     * }
     */
    public function ask(Request $request): JsonResponse
    {
        // ── Validate ───────────────────────────────────────────────────────
        $validated = $request->validate([
            'message'         => 'required|string|min:1|max:5000',
            'fileIds'         => 'nullable|array|max:10',
            'fileIds.*'       => 'string',
            'history'         => 'nullable|array|max:40',
            'history.*.role'  => 'required|in:user,ai',
            'history.*.content' => 'required|string|max:10000',
        ]);

        $uid     = $request->firebase_uid;
        $message = trim($validated['message']);
        $fileIds = $validated['fileIds'] ?? [];
        $history = $validated['history'] ?? [];

        // ── Build file context ─────────────────────────────────────────────
        $fileContext = $this->buildFileContext($uid, $fileIds);

        // ── Format history for Gemini ──────────────────────────────────────
        // Our format:   role = 'user' | 'ai'
        // Gemini format: role = 'user' | 'model'
        $geminiHistory = array_map(fn($msg) => [
            'role'  => $msg['role'] === 'ai' ? 'model' : 'user',
            'parts' => [['text' => $msg['content']]],
        ], $history);

        // ── Call Gemini ────────────────────────────────────────────────────
        try {
            $reply = $this->gemini->ask($message, $fileContext, $geminiHistory);
        } catch (\RuntimeException $e) {
            return response()->json(['error' => $e->getMessage()], 503);
        }

        return response()->json(['reply' => $reply]);
    }

    // ── Private helpers ────────────────────────────────────────────────────

    private function buildFileContext(string $uid, array $fileIds): string
    {
        if (empty($fileIds)) return '';

        $files = [];

        foreach ($fileIds as $fileId) {
            // Look up file in Laravel DB (not Firestore)
            $fileMeta = StudyFile::where('id', $fileId)
                ->where('user_id', $uid)
                ->first();

            if (!$fileMeta) continue;

            $storagePath = "study-files/{$uid}/{$fileId}.txt";
            if (!Storage::exists($storagePath)) continue;

            $content = Storage::get($storagePath);
            if (!empty(trim($content))) {
                $files[] = [
                    'filename' => $fileMeta->original_name,
                    'content'  => $content,
                ];
            }
        }

        return $this->extractor->buildContext($files);
    }
}