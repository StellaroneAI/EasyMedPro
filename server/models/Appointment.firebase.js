// Firebase Appointment Model (Firestore)
import { getFirestore, doc, setDoc, getDoc, updateDoc, deleteDoc, collection, getDocs } from 'firebase-admin/firestore';

const db = getFirestore();

export async function createAppointment(appointment) {
  if (!appointment.appointmentId) throw new Error('appointmentId is required');
  await setDoc(doc(db, 'appointments', appointment.appointmentId), appointment);
  return appointment;
}

export async function getAppointmentById(appointmentId) {
  const appointmentDoc = await getDoc(doc(db, 'appointments', appointmentId));
  return appointmentDoc.exists ? appointmentDoc.data() : null;
}

export async function updateAppointment(appointmentId, updates) {
  await updateDoc(doc(db, 'appointments', appointmentId), updates);
}

export async function deleteAppointment(appointmentId) {
  await deleteDoc(doc(db, 'appointments', appointmentId));
}

export async function getAllAppointments() {
  const appointmentsRef = collection(db, 'appointments');
  const snapshot = await getDocs(appointmentsRef);
  return snapshot.docs.map(doc => doc.data());
}
