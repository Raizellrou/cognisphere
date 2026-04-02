/**
 * RegisterPage.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * WHAT'S IMPROVED vs your original:
 *  ✓ Full name field (used in Firestore profile + Firebase displayName)
 *  ✓ Confirm password field with match validation
 *  ✓ Password strength meter (visual feedback)
 *  ✓ Per-field validation errors
 *  ✓ Email verification sent on success → redirects to check-email page
 *  ✓ Google OAuth registration (same flow as login — Firebase handles it)
 *  ✓ Redirects already-logged-in users away
 *  ✓ Terms acknowledgement checkbox (required for compliance)
 *  ✓ Accessible form with proper autocomplete values
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  registerWithEmail,
  loginWithGoogle,
  getAuthErrorMessage,
} from '@/services/firebaseAuthService';
import {
  validateRegisterForm,
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

export default function RegisterPage() {
  const { currentUser } = useAuth();
  const navigate        = useNavigate();

  // Already logged in → go to dashboard
  if (currentUser) {
    return <Navigate to="/" replace />;
  }

  // ── Form state ────────────────────────────────────────────────────────────
  const [fields, setFields] = useState({
    name:            '',
    email:           '',
    password:        '',
    confirmPassword: '',
  });
  const [errors, setErrors]           = useState({});
  const [agreedToTerms, setAgreed]    = useState(false);
  const [termsError, setTermsError]   = useState(false);

  // ── UI state ──────────────────────────────────────────────────────────────
  const [submitError, setSubmitError]     = useState('');
  const [loadingEmail, setLoadingEmail]   = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  const isLoading = loadingEmail || loadingGoogle;

  // ── Field change ──────────────────────────────────────────────────────────
  const handleChange = (field) => (e) => {
    setFields(f => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors(e => ({ ...e, [field]: null }));
    setSubmitError('');
  };

  // ── Email registration ────────────────────────────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault();

    // 1. Validate all fields
    const fieldErrors = validateRegisterForm(fields);
    setErrors(fieldErrors);

    // 2. Check terms agreement
    if (!agreedToTerms) {
      setTermsError(true);
      if (hasErrors(fieldErrors)) return;
    }

    if (hasErrors(fieldErrors) || !agreedToTerms) return;

    setLoadingEmail(true);
    setSubmitError('');

    try {
      await registerWithEmail(
        fields.name.trim(),
        fields.email.trim(),
        fields.password,
      );
      // AuthContext's onAuthStateChanged fires → ensureUserDocument creates profile
      // Redirect to a "check your email" page rather than dashboard
      // so the user knows to verify before proceeding
      navigate('/verify-email', { replace: true });
    } catch (err) {
      setSubmitError(getAuthErrorMessage(err));
    } finally {
      setLoadingEmail(false);
    }
  };

  // ── Google registration ───────────────────────────────────────────────────
  const handleGoogleRegister = async () => {
    if (!agreedToTerms) { setTermsError(true); return; }

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

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <AuthCard
      title="Create Account"
      subtitle="Start your Cognisphere journey"
    >
      {submitError && (
        <AlertBanner
          type="error"
          message={submitError}
          onDismiss={() => setSubmitError('')}
        />
      )}

      <div className="mt-4 space-y-4">
        <form onSubmit={handleRegister} className="space-y-3" noValidate>
          {/* Full name */}
          <InputField
            id="name"
            label="Full name"
            placeholder="Your name"
            value={fields.name}
            onChange={handleChange('name')}
            error={errors.name}
            autoComplete="name"
            disabled={isLoading}
          />

          {/* Email */}
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

          {/* Password with strength meter */}
          <PasswordInput
            id="password"
            label="Password"
            placeholder="Create a strong password"
            value={fields.password}
            onChange={handleChange('password')}
            error={errors.password}
            autoComplete="new-password"
            disabled={isLoading}
            showStrength={true}   // ← shows the 5-bar strength meter
          />

          {/* Confirm password */}
          <PasswordInput
            id="confirmPassword"
            label="Confirm password"
            placeholder="Repeat your password"
            value={fields.confirmPassword}
            onChange={handleChange('confirmPassword')}
            error={errors.confirmPassword}
            autoComplete="new-password"
            disabled={isLoading}
          />

          {/* Terms checkbox */}
          <div>
            <label className="flex items-start gap-2 cursor-pointer group">
              <div className="relative mt-0.5 flex-shrink-0">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={e => {
                    setAgreed(e.target.checked);
                    if (e.target.checked) setTermsError(false);
                  }}
                  className="sr-only"
                />
                <div className={`w-4 h-4 rounded border transition-colors ${
                  agreedToTerms
                    ? 'bg-white border-white'
                    : termsError
                    ? 'border-red-500 bg-red-950/30'
                    : 'border-[#3a3a3a] bg-[#1a1a1a] group-hover:border-[#555]'
                }`}>
                  {agreedToTerms && (
                    <svg className="w-3 h-3 text-black mx-auto mt-0.5"
                         fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round"
                            strokeWidth={3} d="M5 13l4 4L19 7"/>
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-gray-500 text-xs leading-relaxed">
                I agree to the{' '}
                <a href="/terms" target="_blank"
                   className="text-white hover:underline">Terms of Service</a>
                {' '}and{' '}
                <a href="/privacy" target="_blank"
                   className="text-white hover:underline">Privacy Policy</a>
              </span>
            </label>
            {termsError && (
              <p className="text-red-400 text-xs mt-1 ml-6">
                You must agree to the terms to continue.
              </p>
            )}
          </div>

          <Button type="submit" loading={loadingEmail} disabled={isLoading}>
            Create Account
          </Button>
        </form>

        <Divider />

        <GoogleButton
          onClick={handleGoogleRegister}
          loading={loadingGoogle}
          disabled={isLoading}
        />

        <p className="text-center text-gray-600 text-xs pt-2">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-white hover:text-gray-300 transition-colors font-medium"
          >
            Sign in
          </Link>
        </p>
      </div>
    </AuthCard>
  );
}