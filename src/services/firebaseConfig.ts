/**
 * Firebase Configuration for EasyMedPro
 * Real SMS OTP Authentication Setup
 */

import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

// Firebase configuration - using environment variables for security
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyALfzOIwhtgwgTmB2yrjC0hTqX7E3FPMbY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "easymed-8c074.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "easymed-8c074",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "easymed-8c074.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "301714324653",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:301714324653:web:75a42dbb7b0ff2136b9a24",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-2BH7FMF24N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// Configure for Indian phone numbers
auth.languageCode = 'en'; // Can be changed based on user preference

// Log configuration status
console.log('🔥 Firebase initialized for EasyMedPro SMS Authentication');
console.log('📱 Project:', firebaseConfig.projectId);
console.log('🌍 Environment:', import.meta.env.MODE);

export { auth, app };
export default auth;