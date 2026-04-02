/**
 * VerifyEmailPage.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Shown immediately after registration.
 * Tells the user to check their inbox, with a resend option and a way
 * to proceed once they've clicked the link.
 *
 * Route: /verify-email (GuestRoute — sort of. Accessible to both states.)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { resendVerificationEmail } from '@/services/firebaseAuthService';
import { AuthCard, Button, AlertBanner } from '@/context/auth/AuthUI';

export default function VerifyEmailPage() {
  const { currentUser, checkEmailVerification, logout } = useAuth();
  const navigate = useNavigate();

  const [resending, setResending]   = useState(false);
  const [resent, setResent]         = useState(false);
  const [cooldown, setCooldown]     = useState(0);
  const [checking, setChecking]     = useState(false);
  const [checkError, setCheckError] = useState('');

  const email = currentUser?.email || 'your email';

  // ── Resend verification email ─────────────────────────────────────────────
  const handleResend = async () => {
    setResending(true);
    try {
      await resendVerificationEmail();
      setResent(true);
      setCooldown(60);
      const t = setInterval(() => {
        setCooldown(c => {
          if (c <= 1) { clearInterval(t); return 0; }
          return c - 1;
        });
      }, 1000);
    } catch {
      // Firebase rate-limits this — usually means user just did it
    } finally {
      setResending(false);
    }
  };

  // ── Check if user has verified ────────────────────────────────────────────
  const handleCheckVerification = async () => {
    setChecking(true);
    setCheckError('');
    try {
      const verified = await checkEmailVerification();
      if (verified) {
        navigate('/', { replace: true });
      } else {
        setCheckError(
          'Email not verified yet. Please click the link in your inbox first.'
        );
      }
    } catch {
      setCheckError('Could not check verification. Try again.');
    } finally {
      setChecking(false);
    }
  };

  return (
    <AuthCard
      title="Check Your Email"
      subtitle={`We sent a verification link to ${email}`}
    >
      <div className="text-center py-2">
        {/* Email icon */}
        <div className="w-16 h-16 bg-[#1a1a1a] border border-[#2a2a2a]
                        rounded-2xl flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-white" fill="none"
               stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7
              a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
          </svg>
        </div>

        <p className="text-gray-400 text-sm leading-relaxed mb-6">
          Click the verification link in your email to activate your account.
          After clicking it, come back here and press the button below.
        </p>

        {checkError && (
          <AlertBanner
            type="warning"
            message={checkError}
            onDismiss={() => setCheckError('')}
          />
        )}

        <div className="space-y-3 mt-4">
          {/* Primary CTA — check if verified and proceed */}
          <Button
            onClick={handleCheckVerification}
            loading={checking}
          >
            I've verified my email →
          </Button>

          {/* Resend with cooldown */}
          <Button
            variant="secondary"
            onClick={handleResend}
            disabled={resending || cooldown > 0}
          >
            {resending
              ? 'Sending…'
              : cooldown > 0
              ? `Resend in ${cooldown}s`
              : resent
              ? 'Resend again'
              : 'Resend verification email'}
          </Button>

          {/* Escape hatch — logout and go back to login */}
          <Button
            variant="ghost"
            onClick={logout}
            className="text-gray-600 hover:text-gray-400 text-xs"
          >
            Use a different account
          </Button>
        </div>

        {resent && (
          <p className="text-emerald-400 text-xs mt-4">
            ✓ New verification email sent to {email}
          </p>
        )}
      </div>
    </AuthCard>
  );
}