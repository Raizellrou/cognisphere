/**
 * firebaseAuthService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * WHY THIS EXISTS:
 *   Keeping Firebase calls scattered across components creates tight coupling —
 *   if Firebase ever changes or you want to swap providers, you'd touch 10 files.
 *   This service is the ONLY place that imports firebase/auth. Every component
 *   calls this instead, so future changes happen in one place.
 *
 * PATTERN: Service Layer (separates "what to do" from "how Auth does it")
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  reload,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/firebase';

const googleProvider = new GoogleAuthProvider();
// Request additional Google scopes if needed later (e.g. Calendar)
googleProvider.addScope('profile');
googleProvider.addScope('email');

// ─── REGISTRATION ──────────────────────────────────────────────────────────

/**
 * Creates a new user with email/password, sets their display name,
 * and sends an email verification link.
 *
 * WHY updateProfile here: Firebase Auth doesn't store displayName during
 * createUserWithEmailAndPassword — it must be set as a separate call.
 *
 * WHY sendEmailVerification: Prevents fake/typo email addresses from
 * accumulating in your system. Users with unverified emails are flagged
 * in AuthContext and shown a verification banner.
 */
export async function registerWithEmail(name, email, password) {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);

  // Set display name immediately so AuthContext.ensureUserDocument has it
  await updateProfile(user, { displayName: name });

  // Send verification email — Firebase handles the link + expiry
  await sendEmailVerification(user, {
    url: `${window.location.origin}/login?verified=true`,
  });

  return user;
}

// ─── LOGIN ─────────────────────────────────────────────────────────────────

/**
 * Signs in with email + password.
 * Sets persistence based on the "remember me" checkbox:
 *  - LOCAL  → survives browser close (stored in IndexedDB)
 *  - SESSION → cleared when tab/window closes
 *
 * WHY setPersistence before signIn: Firebase requires the persistence mode
 * to be set BEFORE the sign-in call to take effect for that session.
 */
export async function loginWithEmail(email, password, rememberMe = true) {
  const persistence = rememberMe
    ? browserLocalPersistence
    : browserSessionPersistence;

  await setPersistence(auth, persistence);
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  return user;
}

/**
 * Google OAuth popup sign-in.
 * Works for both new users (registers) and returning users (logs in) —
 * Firebase handles the distinction automatically.
 *
 * WHY popup vs redirect: Popup is better for PWAs installed on desktop.
 * For mobile PWAs, signInWithRedirect() is more reliable — add a flag
 * check here when you implement mobile-specific behavior.
 */
export async function loginWithGoogle() {
  await setPersistence(auth, browserLocalPersistence);
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

// ─── LOGOUT ────────────────────────────────────────────────────────────────

/**
 * Signs out from Firebase. The onAuthStateChanged listener in AuthContext
 * will fire with null, which triggers navigation to /login automatically.
 *
 * WHY we don't navigate here: The service should not know about routing.
 * That concern belongs in AuthContext or the component.
 */
export async function logout() {
  await signOut(auth);
}

// ─── DISPLAY NAME UPDATE ───────────────────────────────────────────────────

/**
 * Updates the user's display name in both Firebase Auth and Firestore.
 * Called from AccountPage when user saves a new display name.
 */
export async function updateDisplayName(user, newName) {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('No user is signed in.');
  
  // Update Firebase Auth profile
  await updateProfile(currentUser, { displayName: newName });
  
  // Refresh the user object to pick up the new displayName
  await reload(currentUser);
  
  // Update Firestore user document
  await setDoc(
    doc(db, 'users', currentUser.uid),
    { displayName: newName, updatedAt: serverTimestamp() },
    { merge: true }
  );
}

// ─── EMAIL VERIFICATION ────────────────────────────────────────────────────

/**
 * Re-sends the verification email. Called from the verification banner
 * when a user says "I didn't get the email."
 * Has a cooldown enforced in the UI — Firebase rate-limits this anyway.
 */
export async function resendVerificationEmail() {
  const user = auth.currentUser;
  if (!user) throw new Error('No user is signed in.');
  await sendEmailVerification(user, {
    url: `${window.location.origin}/login?verified=true`,
  });
}

/**
 * Refreshes the Firebase user object to pick up emailVerified = true
 * after the user clicks the verification link and returns to the app.
 * Call this when the user clicks "I've verified my email".
 */
export async function refreshUser() {
  const user = auth.currentUser;
  if (!user) throw new Error('No user is signed in.');
  await reload(user);
  return auth.currentUser;
}

// ─── PASSWORD RESET ────────────────────────────────────────────────────────

/**
 * Sends a password reset email via Firebase.
 * Firebase sends its own branded email with a secure time-limited link.
 *
 * WHY we don't check if email exists first: That would expose whether an
 * email is registered (user enumeration attack). Always show "if this
 * email exists, a link was sent" regardless of the result.
 */
export async function resetPassword(email) {
  await sendPasswordResetEmail(auth, email, {
    url: `${window.location.origin}/login?reset=true`,
  });
}

// ─── HELPERS ───────────────────────────────────────────────────────────────

/**
 * Maps Firebase auth error codes to human-readable messages.
 * Centralizing this prevents inconsistent error messages across pages.
 *
 * WHY not expose raw Firebase error messages: They're technical and
 * sometimes reveal security-sensitive info (e.g., "user not found"
 * vs "wrong password" helps attackers enumerate accounts).
 */
export function getAuthErrorMessage(firebaseError) {
  const code = firebaseError?.code || '';

  const messages = {
    'auth/user-not-found':        'No account found with this email.',
    'auth/wrong-password':        'Incorrect password. Try again or reset it.',
    'auth/invalid-credential':    'Invalid email or password.',
    'auth/email-already-in-use':  'This email is already registered. Try logging in.',
    'auth/weak-password':         'Password must be at least 6 characters.',
    'auth/invalid-email':         'Please enter a valid email address.',
    'auth/too-many-requests':     'Too many attempts. Please wait a moment and try again.',
    'auth/network-request-failed':'Network error. Check your connection and try again.',
    'auth/popup-closed-by-user':  'Sign-in popup was closed. Please try again.',
    'auth/cancelled-popup-request': 'Only one sign-in window at a time. Please try again.',
    'auth/user-disabled':         'This account has been disabled. Contact support.',
    'auth/requires-recent-login': 'Please log out and log back in to continue.',
  };

  return messages[code] || 'Something went wrong. Please try again.';
}