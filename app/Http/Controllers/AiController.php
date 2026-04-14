<?php

namespace App\Http\Controllers;

use App\Services\GeminiService;
use App\Services\FileExtractionService;
use App\Models\StudyFile;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class AiController extends Controller
{
    public function __construct(
        private GeminiService $gemini,
        private FileExtractionService $extractor,
    ) {}

    public function ask(Request $request): JsonResponse
    {
        // ── Validate ─────────────────────────────────────────────
        $validated = $request->validate([
            'message'            => 'required|string|min:1|max:5000',
            'fileIds'            => 'nullable|array|max:10',
            'fileIds.*'          => 'string',
            'history'            => 'nullable|array|max:40',
            'history.*.role'     => 'required|in:user,ai',
            'history.*.content'  => 'required|string|max:10000',
        ]);

        $uid     = $request->firebase_uid;
        $message = trim($validated['message']);
        $fileIds = $validated['fileIds'] ?? [];
        $history = $validated['history'] ?? [];

        // ── File context ─────────────────────────────────────────
        $fileContext = $this->buildFileContext($uid, $fileIds);

        // ── FIX: Convert history properly for Gemini ─────────────
        $geminiHistory = array_map(fn($msg) => [
            'role'  => $msg['role'] === 'ai' ? 'model' : 'user',
            'parts' => [
                ['text' => $msg['content']]
            ],
        ], $history);

        // ── Call Gemini ───────────────────────────────────────────
        try {
            $reply = $this->gemini->ask(
                $message,
                $fileContext,
                $geminiHistory
            );
        } catch (\RuntimeException $e) {

            Log::error('AI ASK FAILED', [
                'error' => $e->getMessage(),
                'uid' => $uid,
                'message' => $message
            ]);

            return response()->json([
                'error' => $e->getMessage()
            ], 503);
        }

        return response()->json([
            'reply' => $reply
        ]);
    }

    // ── File context builder ───────────────────────────────────
    private function buildFileContext(string $uid, array $fileIds): string
    {
        if (empty($fileIds)) return '';

        $files = [];

        foreach ($fileIds as $fileId) {

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