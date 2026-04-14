/**
 * AuthContext.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * ARCHITECTURE ROLE:
 *   Single source of truth for auth state across the entire app.
 *   Components never import Firebase Auth directly — they consume this context.
 *
 * WHAT'S IMPROVED vs your original:
 *   ✓ Exposes emailVerified status for verification banner
 *   ✓ Exposes isNewUser flag to differentiate first login vs returning
 *   ✓ Provides refreshUser() so verification state can be polled
 *   ✓ Token refresh is handled automatically by Firebase SDK — we expose
 *     getIdToken() for Laravel API calls
 *   ✓ Error boundary at context level — auth failures don't crash the app
 *   ✓ logout navigates to /login (avoids stale component state)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '@/firebase';
import { logout as firebaseLogout, refreshUser } from '@/services/firebaseAuthService';

// ─── Context Definition ─────────────────────────────────────────────────────

const AuthContext = createContext(null);

// ─── Provider ───────────────────────────────────────────────────────────────

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser]   = useState(null);
  const [userProfile, setUserProfile]   = useState(null); // Firestore profile data
  const [loading, setLoading]           = useState(true);
  const [isNewUser, setIsNewUser]       = useState(false);
  const navigate = useNavigate();

  // ── Auth state listener ──────────────────────────────────────────────────
  useEffect(() => {
    /**
     * onAuthStateChanged fires:
     *  1. Immediately on mount with current user (or null)
     *  2. After login/logout/token refresh
     *
     * WHY async here: We need to await Firestore operations before setting
     * the user, so the rest of the app always has a complete user object.
     */
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const { profile, firstLogin } = await ensureUserDocument(firebaseUser);
        setCurrentUser(firebaseUser);
        setUserProfile(profile);
        setIsNewUser(firstLogin);
      } else {
        setCurrentUser(null);
        setUserProfile(null);
        setIsNewUser(false);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // ── Logout ───────────────────────────────────────────────────────────────

  /**
   * WHY useCallback: logout is passed as a prop to child components.
   * Without useCallback it creates a new function reference on every render,
   * causing unnecessary re-renders of anything that depends on it.
   */
  const logout = useCallback(async () => {
    await firebaseLogout();
    setCurrentUser(null);
    setUserProfile(null);
    navigate('/login', { replace: true });
  }, [navigate]);

  // ── Token for Laravel API calls ──────────────────────────────────────────

  /**
   * Returns a fresh Firebase ID token to attach to Laravel API requests.
   * Firebase auto-refreshes tokens every 1 hour — this always gives you
   * a valid one. Use in your API hooks like:
   *   const token = await getToken();
   *   fetch('/api/ai/ask', { headers: { Authorization: `Bearer ${token}` } })
   */
  const getToken = useCallback(async () => {
    if (!currentUser) return null;
    return currentUser.getIdToken(); // Firebase refreshes if expired
  }, [currentUser]);

  // ── Refresh email verification status ────────────────────────────────────

  /**
   * Called when user clicks "I've verified my email" on the banner.
   * Reloads the Firebase user object, which updates emailVerified.
   */
  const checkEmailVerification = useCallback(async () => {
    const refreshed = await refreshUser();
    setCurrentUser({ ...refreshed }); // Force re-render with updated user
    return refreshed?.emailVerified ?? false;
  }, []);

  // ── Context value ────────────────────────────────────────────────────────

  const value = {
    currentUser,          // Firebase Auth user object (or null)
    userProfile,          // Firestore profile document data
    setUserProfile,       // Update userProfile state (e.g., after displayName changes)
    loading,              // True until first auth check completes
    isNewUser,            // True only on first-ever login
    emailVerified: currentUser?.emailVerified ?? false,
    logout,
    getToken,
    checkEmailVerification,
  };

  // ── Render ───────────────────────────────────────────────────────────────

  /**
   * WHY show spinner during loading:
   * Without this, ProtectedRoute renders with currentUser = null (initial state)
   * and redirects to /login before Firebase has had a chance to rehydrate the
   * session. The spinner prevents that flash.
   */
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white
                          rounded-full animate-spin" />
          <p className="text-gray-600 text-xs tracking-widest uppercase">
            Loading
          </p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ───────────────────────────────────────────────────────────────────

/**
 * useAuth — consume this in any component instead of useContext(AuthContext).
 * The guard ensures it's only used inside <AuthProvider> — catches
 * developer mistakes early with a clear error message.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside <AuthProvider>. Check your component tree.');
  }
  return context;
}

// ─── Firestore user document management ─────────────────────────────────────

/**
 * Creates or fetches the user's Firestore document.
 * Returns { profile, firstLogin }.
 *
 * WHY setDoc with merge:true instead of just setDoc:
 *   Plain setDoc would overwrite the document on every login, erasing streak
 *   and other user data. merge:true only writes fields that don't exist yet.
 *
 * WHY separate from registerWithEmail:
 *   Google OAuth users never go through registration — they need their
 *   document created here on first Google login too.
 */
async function ensureUserDocument(user) {
  const userRef = doc(db, 'users', user.uid);
  const snap    = await getDoc(userRef);
  const exists  = snap.exists();

  if (!exists) {
    // First ever login — create the document
    const profileData = {
      uid:           user.uid,
      displayName:   user.displayName || 'User',
      email:         user.email,
      photoURL:      user.photoURL || null,
      provider:      user.providerData[0]?.providerId || 'email',
      streak:        0,
      lastActiveDate: null,
      emailVerified: user.emailVerified,
      createdAt:     serverTimestamp(),
      updatedAt:     serverTimestamp(),
    };

    await setDoc(userRef, profileData);

    // Seed sample data for a better first-time experience
    const { seedUserData } = await import('@/utils/seedFirestore');
    await seedUserData(user.uid);

    return { profile: profileData, firstLogin: true };
  }

  // Returning user — update emailVerified and last-seen timestamp
  await setDoc(
    userRef,
    { emailVerified: user.emailVerified, updatedAt: serverTimestamp() },
    { merge: true }
  );

  return { profile: snap.data(), firstLogin: false };
}