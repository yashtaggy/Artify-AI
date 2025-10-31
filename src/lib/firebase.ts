// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import {
  getAuth,
  signInWithCustomToken,
  setPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

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
const initialAuthToken = (globalThis as any)?.__initial_auth_token ?? null;

// --- Initialize Firebase only once ---
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// ✅ --- Initialize App Check with reCAPTCHA v3 ---
if (typeof window !== "undefined") {
  const appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider("6Ldj7vsrAAAAAA5V7C5SrXR_fSVQhr3z6q4V80nQ"), // 🔹 Replace with your actual site key
    isTokenAutoRefreshEnabled: true, // Keeps App Check token fresh
  });
  console.log("✅ Firebase App Check initialized");
}

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
      // Use secure custom token if available
      await signInWithCustomToken(auth, initialAuthToken);
      console.log("Firebase: Signed in successfully with custom token.");
    } else {
      console.log("Firebase: No custom token available — user will sign in manually.");
    }
  } catch (error) {
    console.error("Firebase Auth init failed:", error);
  }
})();

// --- Export for use throughout the app ---
export { db, storage, auth, initialAuth };
