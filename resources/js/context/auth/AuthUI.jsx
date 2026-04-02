/**
 * AuthUI.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Reusable, accessible UI primitives for all auth pages.
 * Centralizing these prevents style drift between Login and Register.
 *
 * Components exported:
 *  - InputField     → labeled input with inline error display
 *  - PasswordInput  → InputField + show/hide toggle + strength meter
 *  - Button         → primary action button with loading state
 *  - AuthCard       → page wrapper with Cognisphere branding
 *  - Divider        → "or" separator between email and OAuth
 *  - AlertBanner    → error / success / info banners
 *  - VerificationBanner → email verification reminder with resend CTA
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState } from 'react';
import { getPasswordStrength } from '@/utils/validation';

// ─── InputField ─────────────────────────────────────────────────────────────

/**
 * WHY a wrapper component instead of raw <input>:
 *  - Consistent label + error layout guaranteed everywhere
 *  - Accessibility: label is always linked via htmlFor/id
 *  - Error state styling is centralized — change once, applies everywhere
 */
export function InputField({
  id,
  label,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  autoComplete,
  disabled,
  ...rest
}) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={id}
          className="text-gray-400 text-xs font-medium tracking-wide"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        disabled={disabled}
        className={`
          w-full bg-[#1a1a1a] text-white rounded-xl px-4 py-3 text-sm
          outline-none transition-all duration-150 placeholder-gray-600
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error
            ? 'ring-1 ring-red-500/70 bg-red-950/20'
            : 'focus:ring-1 focus:ring-white/25 hover:bg-[#222]'
          }
        `}
        {...rest}
      />
      {/* Inline error — appears below the field it belongs to */}
      {error && (
        <p className="text-red-400 text-xs mt-0.5 flex items-center gap-1">
          <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7
              4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1
              1 0 00-1-1z" clipRule="evenodd"/>
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

// ─── PasswordInput ───────────────────────────────────────────────────────────

/**
 * Password field with:
 *  - Show/hide toggle (accessibility + UX)
 *  - Optional strength meter (for registration form)
 *
 * WHY show/hide: Users on mobile often mistype passwords. Showing the
 * password removes frustration without meaningfully reducing security
 * (it's their private device).
 */
export function PasswordInput({
  showStrength = false,
  value,
  error,
  ...rest
}) {
  const [visible, setVisible] = useState(false);
  const strength = showStrength ? getPasswordStrength(value) : null;

  return (
    <div className="flex flex-col gap-1">
      <div className="relative">
        <InputField
          type={visible ? 'text' : 'password'}
          value={value}
          error={error}
          {...rest}
        />
        <button
          type="button"
          onClick={() => setVisible(v => !v)}
          className="absolute right-3 top-3 text-gray-500 hover:text-gray-300
                     transition-colors p-0.5"
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? (
            // Eye-slash icon
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97
                  9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242
                  4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0
                  0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0
                  01-4.132 5.411m0 0L21 21"/>
            </svg>
          ) : (
            // Eye icon
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542
                  7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
            </svg>
          )}
        </button>
      </div>

      {/* Password strength meter — only shown on register form */}
      {showStrength && value && strength && (
        <div className="mt-1">
          <div className="flex gap-1 mb-1">
            {[1, 2, 3, 4, 5].map(i => (
              <div
                key={i}
                className="h-0.5 flex-1 rounded-full transition-all duration-300"
                style={{
                  backgroundColor: i <= strength.score ? strength.color : '#2a2a2a'
                }}
              />
            ))}
          </div>
          {strength.label && (
            <p className="text-xs" style={{ color: strength.color }}>
              {strength.label}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Button ─────────────────────────────────────────────────────────────────

/**
 * WHY a Button component:
 *  - Loading state (spinner + disabled) is needed on every form submit
 *  - Prevents double-submit: disabled during loading blocks repeat clicks
 *  - Consistent styling: one place to update the primary CTA look
 */
export function Button({
  children,
  loading = false,
  variant = 'primary',  // 'primary' | 'secondary' | 'ghost'
  type = 'button',
  disabled,
  className = '',
  ...rest
}) {
  const base = `
    w-full py-3 rounded-xl text-sm font-bold transition-all duration-150
    flex items-center justify-center gap-2
    disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]
  `;

  const variants = {
    primary:   'bg-white text-black hover:bg-gray-100',
    secondary: 'bg-[#1a1a1a] text-white border border-[#2a2a2a] hover:bg-[#2a2a2a]',
    ghost:     'text-gray-400 hover:text-white',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${className}`}
      {...rest}
    >
      {loading && (
        <span className="w-4 h-4 border-2 border-current border-t-transparent
                         rounded-full animate-spin flex-shrink-0" />
      )}
      {children}
    </button>
  );
}

// ─── Divider ────────────────────────────────────────────────────────────────

export function Divider({ label = 'or' }) {
  return (
    <div className="flex items-center gap-3 my-2">
      <div className="flex-1 h-px bg-[#2a2a2a]" />
      <span className="text-gray-600 text-xs">{label}</span>
      <div className="flex-1 h-px bg-[#2a2a2a]" />
    </div>
  );
}

// ─── AlertBanner ────────────────────────────────────────────────────────────

/**
 * Dismissible alert banner for top-level messages (form submit errors,
 * success confirmations). For field-level errors, use InputField's error prop.
 */
export function AlertBanner({ type = 'error', message, onDismiss }) {
  if (!message) return null;

  const styles = {
    error:   'bg-red-950/40 border-red-800/60 text-red-400',
    success: 'bg-emerald-950/40 border-emerald-800/60 text-emerald-400',
    info:    'bg-blue-950/40 border-blue-800/60 text-blue-400',
    warning: 'bg-amber-950/40 border-amber-800/60 text-amber-400',
  };

  const icons = {
    error:   'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    success: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    info:    'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    warning: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
  };

  return (
    <div className={`flex items-start gap-2 border rounded-xl px-4 py-3
                     text-xs ${styles[type]}`}>
      <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none"
           stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d={icons[type]} />
      </svg>
      <p className="flex-1 leading-relaxed">{message}</p>
      {onDismiss && (
        <button onClick={onDismiss} className="opacity-60 hover:opacity-100
                                              transition-opacity ml-1 flex-shrink-0">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10
              8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293
              4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0
              01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"/>
          </svg>
        </button>
      )}
    </div>
  );
}

// ─── GoogleButton ────────────────────────────────────────────────────────────

export function GoogleButton({ onClick, loading, disabled }) {
  return (
    <Button
      variant="secondary"
      onClick={onClick}
      loading={loading}
      disabled={disabled}
    >
      {!loading && (
        <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26
            1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23
            1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99
            20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43
            8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09
            14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6
            3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
      )}
      Continue with Google
    </Button>
  );
}

// ─── AuthCard ────────────────────────────────────────────────────────────────

/**
 * Page wrapper with Cognisphere branding + consistent layout.
 * Both Login and Register import this so the "frame" is identical.
 */
export function AuthCard({ title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center
                    px-4 py-12">
      {/* Subtle background orb — adds depth without distraction */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-96 h-96
                        bg-white/[0.02] rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative">
        {/* Brand mark */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-10 h-10
                          bg-white rounded-xl mb-3">
            <span className="text-black font-black text-lg">C</span>
          </div>
          <h1 className="text-white text-2xl font-black tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-gray-500 text-sm mt-1">{subtitle}</p>
          )}
        </div>

        {/* Card */}
        <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-6
                        shadow-2xl shadow-black/50">
          {children}
        </div>
      </div>
    </div>
  );
}

// ─── VerificationBanner ──────────────────────────────────────────────────────

/**
 * Shown at the top of the dashboard when email is unverified.
 * Includes a resend button with a 60-second cooldown to prevent spam.
 */
export function VerificationBanner({ onResend, onVerified }) {
  const [sending, setSending]   = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [sent, setSent]         = useState(false);

  const handleResend = async () => {
    setSending(true);
    try {
      await onResend();
      setSent(true);
      // 60-second cooldown
      setCooldown(60);
      const interval = setInterval(() => {
        setCooldown(c => {
          if (c <= 1) { clearInterval(interval); return 0; }
          return c - 1;
        });
      }, 1000);
    } catch {
      // Silent — user can try again
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-amber-950/30 border border-amber-800/40 rounded-xl
                    px-4 py-3 mb-4 text-xs">
      <div className="flex items-start gap-2">
        <svg className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0"
             fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2
            2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
        </svg>
        <div className="flex-1">
          <p className="text-amber-300 font-medium mb-1">
            Please verify your email
          </p>
          <p className="text-amber-400/70 mb-2">
            Check your inbox for a verification link. Some features require a
            verified email.
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleResend}
              disabled={sending || cooldown > 0}
              className="text-amber-300 hover:text-white underline disabled:opacity-50
                         disabled:no-underline disabled:cursor-not-allowed transition-colors"
            >
              {sending
                ? 'Sending…'
                : cooldown > 0
                ? `Resend in ${cooldown}s`
                : sent ? 'Resend again' : 'Resend email'}
            </button>
            <button
              onClick={onVerified}
              className="text-amber-400/60 hover:text-amber-300 transition-colors"
            >
              I've verified →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}