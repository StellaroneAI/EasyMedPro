// Firebase Admin Initialization
import admin from 'firebase-admin';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '../.env' });

// Mock Firebase for development without service account
const mockFirestore = {
  collection: (collectionName) => ({
    doc: (docId) => ({
      set: async (data) => {
        console.log(`📝 Mock Firebase: Set ${collectionName}/${docId}:`, data);
        return { success: true };
      },
      get: async () => ({
        exists: true,
        data: () => ({ id: docId, phone: docId, email: 'demo@example.com' })
      }),
      update: async (data) => {
        console.log(`📝 Mock Firebase: Update ${collectionName}/${docId}:`, data);
        return { success: true };
      },
      delete: async () => {
        console.log(`🗑️ Mock Firebase: Delete ${collectionName}/${docId}`);
        return { success: true };
      }
    }),
    get: async () => ({
      docs: [
        { data: () => ({ id: 'doc1', phone: '9060328119', email: 'demo@example.com' }) },
        { data: () => ({ id: 'doc2', phone: '9876543210', email: 'user@example.com' }) }
      ]
    }),
    where: (field, op, value) => ({
      get: async () => ({
        empty: false,
        docs: [{ data: () => ({ id: 'doc1', [field]: value }) }]
      })
    })
  })
};

// Initialize Firebase Admin SDK or use mock for development
let firebaseApp;
try {
  if (!admin.apps.length) {
    firebaseApp = admin.initializeApp({
      projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'easymed-8c074',
    });
    console.log('🔥 Firebase Admin initialized successfully');
  } else {
    firebaseApp = admin.app();
  }
} catch (error) {
  console.log('⚠️ Firebase Admin not available, using mock for development');
  // Create a mock admin object
  firebaseApp = {
    firestore: () => mockFirestore
  };
}

export default firebaseApp;
