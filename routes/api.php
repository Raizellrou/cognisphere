<?php
// routes/api.php
use App\Http\Controllers\AiController;
use App\Http\Middleware\VerifyFirebaseToken;
use Illuminate\Support\Facades\Route;

// All routes here require a valid Firebase ID token
Route::middleware([VerifyFirebaseToken::class])->group(function () {
    Route::post('/ai/ask', [AiController::class, 'ask']);
});