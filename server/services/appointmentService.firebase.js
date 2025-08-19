// Firebase Appointment Service
import {
  createAppointment,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
  getAllAppointments
} from '../models/Appointment.firebase.js';

export async function bookAppointment(appointment) {
  return await createAppointment(appointment);
}

export async function findAppointmentById(appointmentId) {
  return await getAppointmentById(appointmentId);
}

export async function updateAppointmentDetails(appointmentId, updates) {
  return await updateAppointment(appointmentId, updates);
}

export async function removeAppointment(appointmentId) {
  return await deleteAppointment(appointmentId);
}

export async function listAllAppointments() {
  return await getAllAppointments();
}
