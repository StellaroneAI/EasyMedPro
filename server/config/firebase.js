// Firebase Admin Initialization
import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'easymed-8c074',
    // For production, you would use a service account key
    // credential: admin.credential.cert(serviceAccount)
  });
}

export default admin;
