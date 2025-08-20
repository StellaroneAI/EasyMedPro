// Type declarations for window properties
declare global {
  interface Window {
    recaptchaVerifier?: any;
    confirmationResult?: any;
  }
}

import React, { useState } from 'react';
import { registerPatient, getPatient } from '../services/firebasePatientService';
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
} from 'firebase/auth';

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    userType: 'patient',
    uniqueId: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtp, setEmailOtp] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const user: any = {
        ...form,
        isPhoneVerified: false,
        isEmailVerified: false,
        createdAt: new Date().toISOString(),
      };
      await registerPatient(user);
      const auth = getAuth();
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
      });
      signInWithPhoneNumber(auth, '+91' + form.phone, window.recaptchaVerifier)
        .then((confirmationResult) => {
          window.confirmationResult = confirmationResult;
          setOtpSent(true);
          setMessage(
            'Registration successful! OTP sent to your phone. Enter OTP to verify.',
          );
        })
        .catch((error) => {
          setMessage('Failed to send OTP: ' + error.message);
        });

      if (form.email) {
        const actionCodeSettings = {
          url: window.location.href,
          handleCodeInApp: true,
        };
        sendSignInLinkToEmail(auth, form.email, actionCodeSettings)
          .then(() => {
            window.localStorage.setItem('emailForSignIn', form.email);
            setEmailOtpSent(true);
            setMessage(
              'Email OTP sent! Check your inbox and paste the link here to verify.',
            );
          })
          .catch((error) => {
            setMessage('Failed to send Email OTP: ' + error.message);
          });
      }
    } catch (err) {
      setMessage('Registration failed. Please try again.');
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await window.confirmationResult?.confirm(otp);
      const user = await getPatient(form.phone);
      if (user) {
        await registerPatient({ ...user, isPhoneVerified: true });
        setMessage('Phone verified successfully!');
      }
    } catch (error: any) {
      setMessage('Phone OTP verification failed: ' + error.message);
    }
    setLoading(false);
  };

  const handleVerifyEmailOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    const auth = getAuth();
    if (isSignInWithEmailLink(auth, emailOtp)) {
      const email = window.localStorage.getItem('emailForSignIn') || form.email;
      signInWithEmailLink(auth, email, emailOtp)
        .then(async () => {
          const user = await getPatient(form.phone);
          if (user) {
            await registerPatient({ ...user, isEmailVerified: true });
            setMessage('Email verified successfully!');
          }
        })
        .catch((error) => {
          setMessage('Email OTP verification failed: ' + error.message);
        });
    } else {
      setMessage('Invalid email OTP link.');
    }
    setLoading(false);
  };

  return (
    <div className="main-screen safe-area keyboard-aware flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <form onSubmit={handleSubmit} className="space-y-2">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={form.phone}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email (optional)"
            value={form.email}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
          <select
            name="userType"
            value={form.userType}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          >
            <option value="patient">Patient</option>
            <option value="asha">ASHA Worker</option>
          </select>
          <input
            type="text"
            name="uniqueId"
            placeholder="Unique Identifier (e.g., Govt ID, Employee ID)"
            value={form.uniqueId}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded font-semibold"
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        {otpSent && (
          <form onSubmit={handleVerifyOtp} className="mt-4 space-y-2">
            <input
              type="text"
              name="otp"
              placeholder="Enter Phone OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 rounded font-semibold"
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Verify Phone OTP'}
            </button>
          </form>
        )}

        {emailOtpSent && (
          <form onSubmit={handleVerifyEmailOtp} className="mt-4 space-y-2">
            <input
              type="text"
              name="emailOtp"
              placeholder="Paste Email OTP Link Here"
              value={emailOtp}
              onChange={(e) => setEmailOtp(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
            <button
              type="submit"
              className="w-full bg-purple-600 text-white py-2 rounded font-semibold"
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Verify Email OTP'}
            </button>
          </form>
        )}

        <div id="recaptcha-container"></div>
        {message && <p className="mt-4 text-center text-green-600">{message}</p>}
      </div>
    </div>
  );
}

