# Environment Variables

This project uses Vite and Capacitor. The following environment variables configure client-side behavior.

## API

- **VITE_API_BASE**: Base URL for API requests. Defaults to `/api` when not set.

## Firebase

Provide the Firebase config for your project:

- **VITE_FIREBASE_API_KEY**
- **VITE_FIREBASE_AUTH_DOMAIN**
- **VITE_FIREBASE_PROJECT_ID**
- **VITE_FIREBASE_STORAGE_BUCKET**
- **VITE_FIREBASE_MESSAGING_SENDER_ID**
- **VITE_FIREBASE_APP_ID**
- **VITE_FIREBASE_MEASUREMENT_ID**

## Twilio (SMS/OTP)

- **VITE_TWILIO_ACCOUNT_SID**
- **VITE_TWILIO_AUTH_TOKEN**
- **VITE_TWILIO_PHONE_NUMBER**

## ABHA Integration

- **VITE_ABHA_CLIENT_ID**
- **VITE_ABHA_CLIENT_SECRET**

## AI Services

- **VITE_OPENAI_API_KEY**
- **VITE_AI4BHARAT_API_KEY**

## Other Keys

- **VITE_MONGODB_URI** – MongoDB connection string
- **VITE_GOOGLE_MAPS_API_KEY**
- **VITE_FCM_VAPID_KEY**
- **VITE_FCM_SERVER_KEY**
- **VITE_JWT_SECRET**
- **VITE_ENCRYPTION_KEY**

Add these variables to an `.env` file or your deployment environment as needed.
