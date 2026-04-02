// resources/js/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";   // <- import Firestore
import { getAnalytics } from "firebase/analytics";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyC_5gZcSkRvvCBB43P-6Iro_ba5zazEoBU",
  authDomain: "cognisphere-7b1f7.firebaseapp.com",
  databaseURL: "https://cognisphere-7b1f7-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "cognisphere-7b1f7",
  storageBucket: "cognisphere-7b1f7.firebasestorage.app",
  messagingSenderId: "495757023567",
  appId: "1:495757023567:web:0705700b7542d33d29cd3a",
  measurementId: "G-7THW9HJYPX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firebase services
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);   // <- Firestore database
export const analytics = getAnalytics(app);