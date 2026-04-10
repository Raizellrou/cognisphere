<?php
// routes/api.php
// Full updated version with music routes added.

use App\Http\Controllers\AiController;
use App\Http\Controllers\FileController;
use App\Http\Controllers\MusicController;
use App\Http\Middleware\VerifyFirebaseToken;
use Illuminate\Support\Facades\Route;

Route::middleware([VerifyFirebaseToken::class])->group(function () {

    // ── AI Chat ───────────────────────────────────────────────────────────
    Route::post('/ai/ask', [AiController::class, 'ask']);

    // ── Study Files ───────────────────────────────────────────────────────
    Route::post('/files',            [FileController::class, 'upload']);
    Route::get('/files',             [FileController::class, 'index']);
    Route::delete('/files/{fileId}', [FileController::class, 'destroy']);

    // ── Music ─────────────────────────────────────────────────────────────
    // GET /api/music/search?q=query
    // GET /api/music/suggest?mood=text
    // GET /api/music/genres
    Route::get('/music/search',  [MusicController::class, 'search']);
    Route::get('/music/suggest', [MusicController::class, 'suggest']);
    Route::get('/music/genres',  [MusicController::class, 'genres']);
});