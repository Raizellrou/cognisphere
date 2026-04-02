/**
 * AccountPage.jsx
 * Displays the user's profile info pulled from AuthContext (Firebase + Firestore)
 * and provides a logout button that calls the centralized logout from AuthContext.
 *
 * Matches the dark Cognisphere aesthetic used across the app.
 */

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import BottomNav from '@/components/layout/BottomNav';

export default function AccountPage() {
  const { currentUser, userProfile, logout, emailVerified } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Display name: prefer Firestore profile, fall back to Firebase Auth
  const displayName = userProfile?.displayName || currentUser?.displayName || 'User';
  const email       = currentUser?.email || '';
  const photoURL    = currentUser?.photoURL || null;
  const provider    = userProfile?.provider || 'email';
  const joinedDate  = userProfile?.createdAt?.toDate
    ? userProfile.createdAt.toDate().toLocaleDateString('en-US', {
        year: 'numeric', month: 'long',
      })
    : null;

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout(); // AuthContext handles navigate('/login')
    } catch {
      setLoggingOut(false);
    }
  };

  // Avatar initials fallback when no photo
  const initials = displayName
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="max-w-sm mx-auto px-4 pt-8 pb-28">

        {/* ── Profile Card ──────────────────────────────────────── */}
        <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-6 mb-4
                        flex flex-col items-center text-center">
          {/* Avatar */}
          <div className="relative mb-4">
            {photoURL ? (
              <img
                src={photoURL}
                alt={displayName}
                className="w-20 h-20 rounded-full object-cover ring-2 ring-[#2a2a2a]"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-[#2a2a2a] ring-2 ring-[#333]
                              flex items-center justify-center">
                <span className="text-white text-2xl font-black tracking-tight">
                  {initials}
                </span>
              </div>
            )}
            {/* Online indicator */}
            <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-emerald-500
                             rounded-full border-2 border-black" />
          </div>

          <h2 className="text-white text-xl font-bold tracking-tight mb-0.5">
            {displayName}
          </h2>
          <p className="text-gray-500 text-sm mb-3">{email}</p>

          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {/* Email verification badge */}
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
              emailVerified
                ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                : 'bg-amber-950/60 text-amber-400 border border-amber-800/40'
            }`}>
              {emailVerified ? '✓ Verified' : '⚠ Unverified'}
            </span>

            {/* Provider badge */}
            <span className="text-xs px-2.5 py-1 rounded-full font-medium
                             bg-[#1a1a1a] text-gray-400 border border-[#2a2a2a]">
              {provider === 'google.com' ? '🔵 Google' : '✉ Email'}
            </span>
          </div>

          {joinedDate && (
            <p className="text-gray-700 text-xs mt-3">Member since {joinedDate}</p>
          )}
        </div>

        {/* ── Stats Row ─────────────────────────────────────────── */}
        <div className="grid gap-3 mb-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)' }}>
          <StatCard label="Streak" value={`${userProfile?.streak ?? 0}`} unit="days" />
          <StatCard label="Sessions" value="–" unit="total" />
        </div>

        {/* ── Settings List ─────────────────────────────────────── */}
        <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl overflow-hidden mb-4">
          <SettingRow icon={ProfileIcon} label="Edit Profile"       onClick={() => {}} />
          <SettingRow icon={BellIcon}    label="Notifications"      onClick={() => {}} />
          <SettingRow icon={LockIcon}    label="Change Password"    onClick={() => {}} />
          <SettingRow icon={InfoIcon}    label="About Cognisphere"  onClick={() => {}} last />
        </div>

        {/* ── Logout ────────────────────────────────────────────── */}
        {!showConfirm ? (
          <button
            onClick={() => setShowConfirm(true)}
            className="w-full bg-[#111] border border-[#1e1e1e] hover:border-red-900/60
                       hover:bg-red-950/20 text-red-400 font-semibold text-sm py-4
                       rounded-2xl transition-all duration-200 flex items-center
                       justify-center gap-2"
          >
            <LogoutIcon />
            Sign Out
          </button>
        ) : (
          /* Confirmation — prevents accidental logouts */
          <div className="bg-red-950/20 border border-red-900/40 rounded-2xl p-5">
            <p className="text-white text-sm font-semibold text-center mb-1">
              Sign out of Cognisphere?
            </p>
            <p className="text-gray-500 text-xs text-center mb-4">
              Your data is saved and will be here when you return.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={loggingOut}
                className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] text-gray-400
                           text-sm font-semibold py-3 rounded-xl hover:text-white
                           transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white text-sm
                           font-semibold py-3 rounded-xl transition-colors
                           disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loggingOut && (
                  <span className="w-3.5 h-3.5 border-2 border-white/40
                                   border-t-white rounded-full animate-spin" />
                )}
                {loggingOut ? 'Signing out…' : 'Yes, Sign Out'}
              </button>
            </div>
          </div>
        )}

        <p className="text-center text-gray-800 text-xs mt-6">Cognisphere v1.0</p>
      </main>

      <BottomNav />
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function StatCard({ label, value, unit }) {
  return (
    <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-4 text-center">
      <p className="text-white text-2xl font-black tabular-nums">{value}</p>
      <p className="text-gray-600 text-xs mt-0.5">{unit}</p>
      <p className="text-gray-500 text-xs font-medium uppercase tracking-widest mt-1">
        {label}
      </p>
    </div>
  );
}

function SettingRow({ icon: Icon, label, onClick, last = false }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-5 py-4
                  hover:bg-[#1a1a1a] transition-colors text-left
                  ${!last ? 'border-b border-[#1e1e1e]' : ''}`}
    >
      <div className="flex items-center gap-3">
        <span className="text-gray-500"><Icon /></span>
        <span className="text-white text-sm">{label}</span>
      </div>
      <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor"
           viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 5l7 7-7 7"/>
      </svg>
    </button>
  );
}

// ── Icons ───────────────────────────────────────────────────────────────────

function LogoutIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7
        a3 3 0 013-3h4a3 3 0 013 3v1"/>
    </svg>
  );
}
function ProfileIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
    </svg>
  );
}
function BellIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0
        00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0
        .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
    </svg>
  );
}
function LockIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2
        2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
    </svg>
  );
}
function InfoIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>
  );
}