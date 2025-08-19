import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { app } from "../../packages/core/src/services/firebaseConfig";

const db = getFirestore(app);

export interface Patient {
  name: string;
  phone: string;
  email?: string;
  userType: "patient";
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  lastLogin?: string;
  isActive?: boolean;
  profile?: any;
}

export async function registerPatient(patient: Patient) {
  await setDoc(doc(db, "users", patient.phone), patient);
}

export async function getPatient(phone: string): Promise<Patient | null> {
  const docRef = doc(db, "users", phone);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data() as Patient;
  }
  return null;
}
