/**
 * ProtectedRoute.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * WHAT'S IMPROVED vs your original:
 *  ✓ Handles loading state — no flash-to-login during Firebase rehydration
 *  ✓ Preserves the intended destination (redirects back after login)
 *  ✓ Optional email verification gate (requireVerified prop)
 *  ✓ Shows verification banner if user is logged in but unverified
 *
 * HOW "redirect back after login" WORKS:
 *  When a user hits /calendar without being logged in, we save "/calendar"
 *  in the location state. LoginPage reads this after successful auth and
 *  navigates there instead of always going to "/".
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { VerificationBanner } from '@/context/auth/AuthUI';
import { resendVerificationEmail } from '@/services/firebaseAuthService';

export default function ProtectedRoute({
  children,
  requireVerified = false,  // Set true on routes that need verified email
}) {
  const { currentUser, loading, emailVerified, checkEmailVerification } = useAuth();
  const location = useLocation();

  // ── Still checking Firebase session ──────────────────────────────────────
  // WHY: Firebase rehydrates from IndexedDB asynchronously on page load.
  // Without this, currentUser is null for ~100ms and we'd redirect to /login
  // even for legitimately logged-in users.
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white/80
                        rounded-full animate-spin" />
      </div>
    );
  }

  // ── Not logged in → redirect to /login ───────────────────────────────────
  if (!currentUser) {
    // Save where they were going so LoginPage can redirect them back
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  // ── Logged in but unverified, and this route requires verification ────────
  if (requireVerified && !emailVerified) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="max-w-sm mx-auto px-4 pt-8">
          <VerificationBanner
            onResend={resendVerificationEmail}
            onVerified={checkEmailVerification}
          />
          {/* Still render the page content beneath the banner */}
          {children}
        </div>
      </div>
    );
  }

  // ── Logged in and all checks pass → render the page ──────────────────────
  return children;
}


/**
 * GuestRoute.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * The OPPOSITE of ProtectedRoute — redirects AWAY from auth pages
 * if the user is already logged in.
 *
 * Use on: /login, /register, /verify-email
 *
 * WHY this matters: Without it, a logged-in user can navigate to /login
 * manually and see the login form, which is confusing and potentially
 * causes issues with form state.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export function GuestRoute({ children }) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white/80
                        rounded-full animate-spin" />
      </div>
    );
  }

  // Already logged in → send to dashboard
  if (currentUser) {
    return <Navigate to="/" replace />;
  }

  return children;
}