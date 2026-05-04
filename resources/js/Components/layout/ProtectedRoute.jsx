import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { VerificationBanner } from '@/context/auth/AuthUI';
import { resendVerificationEmail } from '@/services/firebaseAuthService';
import CogniLogo from '@/assets/CogniLogo.png';

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
  // WITH THIS:
if (loading) {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#000000',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
    }}>
      <img
        src={CogniLogo}
        alt="CogniSphere"
        style={{ width: 80, height: 80, objectFit: 'contain' }}
      />
      <p style={{
        color: 'rgba(255,255,255,0.6)',
        fontSize: 14,
        fontWeight: 600,
        letterSpacing: '0.05em',
      }}>
        Thinking...
      </p>
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
    <div style={{
      minHeight: '100vh',
      background: '#000000',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
    }}>
      <img
        src={CogniLogo}
        alt="CogniSphere"
        style={{ width: 80, height: 80, objectFit: 'contain' }}
      />
      <p style={{
        color: 'rgba(255,255,255,0.6)',
        fontSize: 14,
        fontWeight: 600,
        letterSpacing: '0.05em',
      }}>
        Thinking...
      </p>
    </div>
  );
}

  // Already logged in → send to dashboard
  if (currentUser) {
    return <Navigate to="/" replace />;
  }

  return children;
}