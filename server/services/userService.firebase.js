// Firebase User Service
import {
  createUser,
  getUserByPhone,
  getUserByEmail,
  updateUser,
  deleteUser,
  getAllUsers
} from '../models/User.firebase.js';

export async function registerUser(user) {
  // Add additional validation as needed
  return await createUser(user);
}

export async function findUserByPhone(phone) {
  return await getUserByPhone(phone);
}

export async function findUserByEmail(email) {
  return await getUserByEmail(email);
}

export async function updateUserProfile(phone, updates) {
  return await updateUser(phone, updates);
}

export async function removeUser(phone) {
  return await deleteUser(phone);
}

export async function listAllUsers() {
  return await getAllUsers();
}
