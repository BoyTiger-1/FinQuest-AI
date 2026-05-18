import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAz4X9sPi9woTZglSUIUbsUu75cbRwAUwI",
  authDomain: "financeai-44fa6.firebaseapp.com",
  projectId: "financeai-44fa6",
  storageBucket: "financeai-44fa6.firebasestorage.app",
  messagingSenderId: "1024678062275",
  appId: "1:1024678062275:web:d0b0cd6f654585c1ff9a76",
  measurementId: "G-5RPMM3P5BL",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const firebaseAuth = getAuth(app);
export const FIREBASE_API_KEY = firebaseConfig.apiKey;
