<?php
namespace App\Http\Middleware;

// app/Http/Middleware/VerifyFirebaseToken.php

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

        // For development: extract UID from token or use a default test UID
        // In production, integrate with proper Firebase Admin SDK
        try {
            // Try to decode JWT to get UID (basic validation)
            $parts = explode('.', $token);
            if (count($parts) !== 3) {
                return response()->json(['error' => 'Invalid token format'], 401);
            }

            // Decode the payload (second part)
            $payload = json_decode(base64_decode(strtr($parts[1], '-_', '+/')), true);
            
            if (!$payload || !isset($payload['sub'])) {
                // Use a test UID for development if token doesn't have 'sub'
                $uid = 'test-user-' . uniqid();
            } else {
                $uid = $payload['sub'];
            }

            // Attach uid to request for use in controllers
            $request->merge(['firebase_uid' => $uid]);
        } catch (\Exception $e) {
            // For development: allow requests and assign a test UID
            $request->merge(['firebase_uid' => 'test-user-' . uniqid()]);
        }

        return $next($request);
    }
}