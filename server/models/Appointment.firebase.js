// Firebase Appointment Model (Firestore)
import firebaseApp from '../config/firebase.js';

const db = firebaseApp.firestore();

export async function createAppointment(appointment) {
  if (!appointment.appointmentId) throw new Error('appointmentId is required');
  await db.collection('appointments').doc(appointment.appointmentId).set(appointment);
  return appointment;
}

export async function getAppointmentById(appointmentId) {
  const appointmentDoc = await db.collection('appointments').doc(appointmentId).get();
  return appointmentDoc.exists ? appointmentDoc.data() : null;
}

export async function updateAppointment(appointmentId, updates) {
  await db.collection('appointments').doc(appointmentId).update(updates);
}

export async function deleteAppointment(appointmentId) {
  await db.collection('appointments').doc(appointmentId).delete();
}

export async function getAllAppointments() {
  const appointmentsRef = db.collection('appointments');
  const snapshot = await appointmentsRef.get();
  return snapshot.docs.map(doc => doc.data());
}
