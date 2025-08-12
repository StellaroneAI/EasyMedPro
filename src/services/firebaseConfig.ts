/**
 * Firebase Configuration for EasyMedPro
 * Real SMS OTP Authentication Setup
 */

import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

// Firebase configuration provided in requirements
const firebaseConfig = {
  apiKey: "AIzaSyALfzOIwhtgwgTmB2yrjC0hTqX7E3FPMbY",
  authDomain: "easymed-8c074.firebaseapp.com",
  projectId: "easymed-8c074",
  storageBucket: "easymed-8c074.firebasestorage.app",
  messagingSenderId: "301714324653",
  appId: "1:301714324653:web:75a42dbb7b0ff2136b9a24",
  measurementId: "G-2BH7FMF24N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// Configure for Indian phone numbers
auth.languageCode = 'en'; // Can be changed based on user preference

export { auth, app };
export default auth;