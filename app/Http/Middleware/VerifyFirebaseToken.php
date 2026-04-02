// app/Http/Middleware/VerifyFirebaseToken.php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Kreait\Firebase\Factory;

class VerifyFirebaseToken
{
    public function handle(Request $request, Closure $next)
    {
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json(['error' => 'No token provided'], 401);
        }

        try {
            $factory = (new Factory)->withServiceAccount(
                base_path(config('services.firebase.credentials'))
            );
            $auth = $factory->createAuth();
            $verifiedToken = $auth->verifyIdToken($token);

            // Attach uid to request for use in controllers
            $request->merge(['firebase_uid' => $verifiedToken->claims()->get('sub')]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Invalid token'], 401);
        }

        return $next($request);
    }
}