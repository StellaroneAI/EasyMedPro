// Firebase User Model (Firestore)
import { getFirestore, doc, setDoc, getDoc, updateDoc, deleteDoc } from 'firebase-admin/firestore';

const db = getFirestore();

export async function createUser(user) {
  if (!user.phone) throw new Error('Phone is required');
  await setDoc(doc(db, 'users', user.phone), user);
  return user;
}

export async function getUserByPhone(phone) {
  const userDoc = await getDoc(doc(db, 'users', phone));
  return userDoc.exists ? userDoc.data() : null;
}

export async function getUserByEmail(email) {
  const usersRef = db.collection('users');
  const snapshot = await usersRef.where('email', '==', email).get();
  if (snapshot.empty) return null;
  return snapshot.docs[0].data();
}

export async function updateUser(phone, updates) {
  await updateDoc(doc(db, 'users', phone), updates);
}

export async function deleteUser(phone) {
  await deleteDoc(doc(db, 'users', phone));
}

export async function getAllUsers() {
  const usersRef = db.collection('users');
  const snapshot = await usersRef.get();
  return snapshot.docs.map(doc => doc.data());
}
