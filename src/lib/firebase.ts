// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import {
  getAuth,
  signInWithCustomToken,
  signInAnonymously,
  setPersistence,
  browserSessionPersistence,
} from "firebase/auth";

// --- FIREBASE CONFIG (YOUR PROJECT CONFIG) ---
const firebaseConfig = {
  apiKey: "AIzaSyDl-_qTfbXKND3r8DOU24hS_nwsmfO6WWs",
  authDomain: "artifyai-891ba.firebaseapp.com",
  projectId: "artifyai-891ba",
  storageBucket: "artifyai-891ba.appspot.com",
  messagingSenderId: "599463248805",
  appId: "1:599463248805:web:0d93b8541d013909001e4c",
  measurementId: "G-TRJH21BNZJ",
};

// --- OPTIONAL: Token injection if used by your platform ---
// Read from globalThis in a safe way so TypeScript won't complain if the variable doesn't exist.
const initialAuthToken = (globalThis as any)?.__initial_auth_token ?? null;

// --- Initialize Firebase only once ---
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// --- Initialize Firestore, Storage, and Auth ---
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

// --- SESSION PERSISTENCE AND AUTO LOGIN FIX ---
const initialAuth = (async () => {
  try {
    // Keep the auth session alive in the same browser session
    await setPersistence(auth, browserSessionPersistence);

    if (initialAuthToken) {
      // If your app provides secure tokens at runtime, use them here
      await signInWithCustomToken(auth, initialAuthToken);
      console.log("Firebase: Signed in successfully with custom token.");
    } else {
      // Otherwise, sign in anonymously to establish context
      await signInAnonymously(auth);
      console.log("Firebase: Signed in anonymously.");
    }
  } catch (error) {
    console.error("Firebase Auth init failed:", error);
  }
})();

// --- Export for use throughout the app ---
export { db, storage, auth, initialAuth };
