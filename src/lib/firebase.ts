// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDl-_qTfbXKND3r8DOU24hS_nwsmfO6WWs",
  authDomain: "artifyai-891ba.firebaseapp.com",
  projectId: "artifyai-891ba",
  storageBucket: "artifyai-891ba.appspot.com",
  messagingSenderId: "599463248805",
  appId: "1:599463248805:web:0d93b8541d013909001e4c",
  measurementId: "G-TRJH21BNZJ"
};

// Initialize Firebase only once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Firestore
const db = getFirestore(app);

// Storage
const storage = getStorage(app);

// Auth
const auth = getAuth(app);

export { db, storage, auth };
