<?php
// routes/api.php
// ─────────────────────────────────────────────────────────────────────────────
// All routes require a valid Firebase ID token via VerifyFirebaseToken middleware.
// The middleware decodes the token and sets $request->firebase_uid on every request.
// ─────────────────────────────────────────────────────────────────────────────

use App\Http\Controllers\AiController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\FileController;
use App\Http\Middleware\VerifyFirebaseToken;
use Illuminate\Support\Facades\Route;

Route::middleware([VerifyFirebaseToken::class])->group(function () {

    // ── AI ────────────────────────────────────────────────────────────────
    // POST /api/ai/ask  → send message + file context → get Gemini response
    Route::post('/ai/ask', [AiController::class, 'ask']);

    // ── Chats ─────────────────────────────────────────────────────────────
    // GET    /api/chats          → list all conversations for the user
    // POST   /api/chats          → create a new conversation
    // GET    /api/chats/{chatId} → get a single conversation + its messages
    // DELETE /api/chats/{chatId} → delete a conversation and all its messages
    Route::get('/chats',            [ChatController::class, 'index']);
    Route::post('/chats',           [ChatController::class, 'store']);
    Route::get('/chats/{chatId}',   [ChatController::class, 'show']);
    Route::delete('/chats/{chatId}',[ChatController::class, 'destroy']);

    // ── Files ─────────────────────────────────────────────────────────────
    // POST   /api/files          → upload a study file (PDF, TXT, DOCX)
    // GET    /api/files          → list all uploaded files for the user
    // DELETE /api/files/{fileId} → delete a file
    // POST   /api/files/{fileId}/attach/{chatId} → attach file to a chat session
    Route::post('/files',                              [FileController::class, 'upload']);
    Route::get('/files',                               [FileController::class, 'index']);
    Route::delete('/files/{fileId}',                   [FileController::class, 'destroy']);
    Route::post('/files/{fileId}/attach/{chatId}',     [FileController::class, 'attachToChat']);
});