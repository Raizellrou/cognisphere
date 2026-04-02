<?php
// app/Http/Controllers/AiController.php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class AiController extends Controller
{
    public function ask(Request $request)
    {
        $request->validate(['message' => 'required|string|max:2000']);

        // Proxy request to Claude/OpenAI — API key never exposed to frontend
        $response = Http::withHeaders([
            'x-api-key' => config('services.anthropic.key'),
            'anthropic-version' => '2023-06-01',
            'content-type' => 'application/json',
        ])->post('https://api.anthropic.com/v1/messages', [
            'model'      => 'claude-3-haiku-20240307',
            'max_tokens' => 1024,
            'system'     => 'You are a helpful study assistant inside Cognisphere,
                             a productivity app for students. Be concise and encouraging.',
            'messages'   => [
                ['role' => 'user', 'content' => $request->message]
            ],
        ]);

        return response()->json([
            'reply' => $response->json('content.0.text')
        ]);
    }
}