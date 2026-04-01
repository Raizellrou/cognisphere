// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const analytics = getAnalytics(app);