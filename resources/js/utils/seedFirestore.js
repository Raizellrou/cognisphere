// resources/js/utils/seedFirestore.js
import {
  doc, setDoc, addDoc, collection, serverTimestamp, Timestamp
} from 'firebase/firestore';
import { db } from '@/firebase';

/**
 * Called automatically on first login via AuthContext.
 * Creates all collections + sample documents for the new user.
 * To re-seed: delete the user document in Firebase Console, then log in again.
 */
export async function seedUserData(uid) {
  console.log('[Cognisphere] Seeding Firestore for new user:', uid);

  const userRef = doc(db, 'users', uid);

  // ── 1. SAMPLE TASKS ─────────────────────────────────────────────────────
  const tasksRef = collection(userRef, 'tasks');
  await addDoc(tasksRef, {
    title: 'Review Chapter 1 notes',
    done: false,
    dueDate: Timestamp.fromDate(addDays(new Date(), 2)),
    subjectId: '',        // Will be linked after subjects are created
    createdAt: serverTimestamp(),
  });
  await addDoc(tasksRef, {
    title: 'Complete practice problems',
    done: false,
    dueDate: Timestamp.fromDate(addDays(new Date(), 5)),
    subjectId: '',
    createdAt: serverTimestamp(),
  });

  // ── 2. SAMPLE COUNTDOWN ──────────────────────────────────────────────────
  const countdownsRef = collection(userRef, 'countdowns');
  await addDoc(countdownsRef, {
    name: 'Final Exams',
    targetDate: Timestamp.fromDate(addDays(new Date(), 30)),
    createdAt: serverTimestamp(),
  });
  await addDoc(countdownsRef, {
    name: 'Project Deadline',
    targetDate: Timestamp.fromDate(addDays(new Date(), 14)),
    createdAt: serverTimestamp(),
  });

  // ── 3. SAMPLE SUBJECTS ───────────────────────────────────────────────────
  const subjectsRef = collection(userRef, 'subjects');
  await addDoc(subjectsRef, {
    name: 'Mathematics',
    color: '#6366f1',
    topics: [
      { id: 't1', name: 'Algebra',   mastery: 'learning' },
      { id: 't2', name: 'Calculus',  mastery: 'not_started' },
      { id: 't3', name: 'Statistics', mastery: 'mastered' },
    ],
    createdAt: serverTimestamp(),
  });
  await addDoc(subjectsRef, {
    name: 'Computer Science',
    color: '#10b981',
    topics: [
      { id: 't1', name: 'Data Structures', mastery: 'learning' },
      { id: 't2', name: 'Algorithms',      mastery: 'not_started' },
    ],
    createdAt: serverTimestamp(),
  });

  // ── 4. SAMPLE SESSION (Pomodoro history) ─────────────────────────────────
  const sessionsRef = collection(userRef, 'sessions');
  await addDoc(sessionsRef, {
    type: 'pomodoro',
    duration: 1500,      // 25 minutes in seconds
    completedAt: serverTimestamp(),
  });

  console.log('[Cognisphere] Seeding complete ✓');
}

// Helper: adds N days to a Date
function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}