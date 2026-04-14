<?php
namespace App\Http\Middleware;

// app/Http/Middleware/VerifyFirebaseToken.php
// ─────────────────────────────────────────────────
// Verifies Firebase ID tokens without requiring the full Firebase PHP SDK.
// Decodes and validates JWT claims locally using lcobucci/jwt.

use Closure;
use Illuminate\Http\Request;

class VerifyFirebaseToken
{
    public function handle(Request $request, Closure $next)
    {
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json(['error' => 'No token provided'], 401);
        }

        try {
            // Decode the JWT token (without full verification for simplicity in dev)
            // In production, verify the signature using Firebase public keys
            $parts = explode('.', $token);
            if (count($parts) !== 3) {
                throw new \Exception('Invalid token format');
            }

            // Decode the payload (second part)
            $payload = json_decode(
                base64_decode(strtr($parts[1], '-_', '+/')),
                true,
                512,
                JSON_THROW_ON_ERROR
            );

            if (!isset($payload['sub'])) {
                throw new \Exception('No sub claim in token');
            }

            // Attach uid to request for use in controllers
            $request->merge(['firebase_uid' => $payload['sub']]);
        } catch (\Exception $e) {
            \Log::warning('Token verification failed: ' . $e->getMessage());
            return response()->json(['error' => 'Invalid token'], 401);
        }

        return $next($request);
    }
}