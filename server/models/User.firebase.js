// Firebase User Model (Firestore)
import firebaseApp from '../config/firebase.js';

const db = firebaseApp.firestore();

export async function createUser(user) {
  if (!user.phone) throw new Error('Phone is required');
  await db.collection('users').doc(user.phone).set(user);
  return user;
}

export async function getUserByPhone(phone) {
  const userDoc = await db.collection('users').doc(phone).get();
  return userDoc.exists ? userDoc.data() : null;
}

export async function getUserByEmail(email) {
  const usersRef = db.collection('users');
  const snapshot = await usersRef.where('email', '==', email).get();
  if (snapshot.empty) return null;
  return snapshot.docs[0].data();
}

export async function updateUser(phone, updates) {
  await db.collection('users').doc(phone).update(updates);
}

export async function deleteUser(phone) {
  await db.collection('users').doc(phone).delete();
}

export async function getAllUsers() {
  const usersRef = db.collection('users');
  const snapshot = await usersRef.get();
  return snapshot.docs.map(doc => doc.data());
}
