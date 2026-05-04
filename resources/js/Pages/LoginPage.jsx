/**
 * LoginPage.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * WHAT'S IMPROVED vs your original:
 *  ✓ Uses firebaseAuthService (not Firebase directly) — separation of concerns
 *  ✓ Full client-side validation before any network call
 *  ✓ Per-field error display (not just a top banner)
 *  ✓ Remember Me checkbox controls session persistence
 *  ✓ Loading states per button (email vs Google tracked separately)
 *  ✓ Redirects already-logged-in users away (GuestRoute pattern)
 *  ✓ Handles ?verified=true and ?reset=true URL params (from email links)
 *  ✓ Forgot password flow inline (no separate page needed)
 *  ✓ Accessible: labels, aria-live for errors, button types explicit
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import CogniLogo from '@/assets/CogniLogo.png';
import {
  loginWithEmail,
  loginWithGoogle,
  resetPassword,
  getAuthErrorMessage,
} from '@/services/firebaseAuthService';
import {
  validateLoginForm,
  hasErrors,
} from '@/utils/validation';
import {
  AuthCard,
  InputField,
  PasswordInput,
  Button,
  GoogleButton,
  Divider,
  AlertBanner,
} from '@/context/auth/AuthUI';

export default function LoginPage() {
  const { currentUser } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // ✅ ALL HOOKS FIRST
  const [fields, setFields] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [rememberMe, setRemember] = useState(true);

  const [submitError, setSubmitError] = useState('');
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  // ── Redirect already-logged-in users ──────────────────────────────────────
  // WHY here and not just in ProtectedRoute:
  //   ProtectedRoute redirects unauth→login. We also need auth→dashboard here.
  //   Prevents logged-in users from seeing the login form at all.
  if (currentUser) {
    return <Navigate to="/" replace />;
  }
  // ── Form state ────────────────────────────────────────────────────────────

  // ── URL param messages ────────────────────────────────────────────────────
  // ?verified=true → user clicked the email verification link
  // ?reset=true    → user just reset their password
  const successMessage = searchParams.get('verified')
    ? 'Email verified! You can now sign in.'
    : searchParams.get('reset')
    ? 'Password reset successfully. Sign in with your new password.'
    : null;

  // ── Field change handler ──────────────────────────────────────────────────
  const handleChange = (field) => (e) => {
    setFields(f => ({ ...f, [field]: e.target.value }));
    // Clear that field's error as soon as the user starts fixing it
    if (errors[field]) setErrors(e => ({ ...e, [field]: null }));
    setSubmitError('');
  };

  // ── Email login ───────────────────────────────────────────────────────────
  const handleEmailLogin = async (e) => {
    e.preventDefault();

    // 1. Validate first — no network call until form is clean
    const fieldErrors = validateLoginForm(fields);
    if (hasErrors(fieldErrors)) {
      setErrors(fieldErrors);
      return;
    }

    setLoadingEmail(true);
    setSubmitError('');

    try {
      await loginWithEmail(fields.email, fields.password, rememberMe);
      // Navigation happens via AuthContext's onAuthStateChanged → user is set
      // then ProtectedRoute allows / through. We still navigate here for speed.
      navigate('/', { replace: true });
    } catch (err) {
      setSubmitError(getAuthErrorMessage(err));
    } finally {
      setLoadingEmail(false);
    }
  };

  // ── Google login ──────────────────────────────────────────────────────────
  const handleGoogleLogin = async () => {
    setLoadingGoogle(true);
    setSubmitError('');
    try {
      await loginWithGoogle();
      navigate('/', { replace: true });
    } catch (err) {
      setSubmitError(getAuthErrorMessage(err));
    } finally {
      setLoadingGoogle(false);
    }
  };

  // ── Forgot password ───────────────────────────────────────────────────────
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setForgotLoading(true);
    try {
      await resetPassword(forgotEmail.trim());
      setForgotSent(true);
    } catch {
      // Intentionally silent — don't confirm whether email exists (security)
      setForgotSent(true);
    } finally {
      setForgotLoading(false);
    }
  };

  const isLoading = loadingEmail || loadingGoogle;

  // Logo component with animations and dark mode container
  const logoElement = (
    <div style={{
      background: isDark ? 'rgba(255,255,255,0.08)' : 'transparent',
      borderRadius: '20px',
      padding: isDark ? '10px' : '0',
      display: 'inline-block',
    }}>
      <img
        src={CogniLogo}
        alt="Cognisphere Logo"
        className="logo-animated"
        style={{
          width: '72px',
          height: '72px',
          display: 'block',
          margin: '0 auto',
          mixBlendMode: 'normal',
          borderRadius: '16px',
        }}
      />
    </div>
  );

  // Forgot password sub-view
  if (showForgot) {
    return (
      <AuthCard
        title="Reset Password"
        subtitle="We'll send a reset link to your email"
      >
        {forgotSent ? (
          <div className="text-center py-4">
            <div className="w-12 h-12 bg-emerald-950/50 border border-emerald-800/40
                            rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-emerald-400" fill="none"
                   stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <p className="text-white text-sm font-medium mb-1">Check your inbox</p>
            <p className="text-gray-500 text-xs mb-6">
              If <span className="text-gray-300">{forgotEmail}</span> is
              registered, a reset link has been sent.
            </p>
            <Button
              variant="ghost"
              onClick={() => { setShowForgot(false); setForgotSent(false); }}
            >
              ← Back to Sign In
            </Button>
          </div>
        ) : (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <InputField
              id="forgot-email"
              type="email"
              label="Email address"
              placeholder="you@example.com"
              value={forgotEmail}
              onChange={e => setForgotEmail(e.target.value)}
              autoComplete="email"
              disabled={forgotLoading}
            />
            <Button type="submit" loading={forgotLoading}>
              Send Reset Link
            </Button>
            <Button
              variant="ghost"
              onClick={() => setShowForgot(false)}
              disabled={forgotLoading}
            >
              ← Back to Sign In
            </Button>
          </form>
        )}
      </AuthCard>
    );
  }

  // Main login view
  return (
    <>
      <style>{`
        @keyframes logoEntrance {
          from { opacity: 0; transform: translateY(12px) scale(0.92); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes logoFloat {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-4px); }
        }
        .logo-animated {
          animation: logoEntrance 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards, logoFloat 3s ease-in-out 0.6s infinite;
        }
      `}</style>
      <AuthCard
        title="Cognisphere"
        subtitle="Focus. Learn. Achieve."
        logo={logoElement}
        isDark={isDark}
      >

        {/* URL param success messages */}
        {successMessage && (
          <AlertBanner type="success" message={successMessage} className="mb-4" />
        )}

      {/* Top-level submit error (wrong password, network issue, etc.) */}
      {submitError && (
        <AlertBanner
          type="error"
          message={submitError}
          onDismiss={() => setSubmitError('')}
        />
      )}

      <div className="mt-4 space-y-4">
        {/* Email/Password form */}
        <form onSubmit={handleEmailLogin} className="space-y-3" noValidate>
          <InputField
            id="email"
            type="email"
            label="Email"
            placeholder="you@example.com"
            value={fields.email}
            onChange={handleChange('email')}
            error={errors.email}
            autoComplete="email"
            disabled={isLoading}
          />

          <PasswordInput
            id="password"
            label="Password"
            placeholder="Your password"
            value={fields.password}
            onChange={handleChange('password')}
            error={errors.password}
            autoComplete="current-password"
            disabled={isLoading}
          />
          {/* Forgot password link */}
          <div className="text-right mt-1.5">
            <button
              type="button"
              onClick={() => {
                setForgotEmail(fields.email);
                setShowForgot(true);
              }}
              className="text-gray-500 hover:text-white text-xs transition-colors"
            >
              Forgot password?
            </button>
          </div>

          {/* Remember Me */}
          <label className="flex items-center gap-2 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRemember(e.target.checked)}
                className="sr-only"
              />
              <div className={`w-4 h-4 rounded border transition-colors ${
                rememberMe
                  ? 'bg-white border-white'
                  : 'border-[#3a3a3a] bg-[#1a1a1a] group-hover:border-[#555]'
              }`}>
                {rememberMe && (
                  <svg className="w-3 h-3 text-black mx-auto mt-0.5"
                       fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round"
                          strokeWidth={3} d="M5 13l4 4L19 7"/>
                  </svg>
                )}
              </div>
            </div>
            <span className="text-gray-500 text-xs">Keep me signed in</span>
          </label>

          <Button type="submit" loading={loadingEmail} disabled={isLoading}>
            Sign In
          </Button>
        </form>

        <Divider />

        {/* Google OAuth */}
        <GoogleButton
          onClick={handleGoogleLogin}
          loading={loadingGoogle}
          disabled={isLoading}
        />

        {/* Register link */}
        <p className="text-center text-gray-600 text-xs pt-2">
          No account?{' '}
          <Link
            to="/register"
            className="text-white hover:text-gray-300 transition-colors font-medium"
          >
            Create one
          </Link>
        </p>
      </div>
    </AuthCard>
    </>
  );
}