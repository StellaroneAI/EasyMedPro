# EasyMedPro - Cross-Platform AI Healthcare Application

[![Deploy to Firebase](https://github.com/StellaroneAI/EasyMedPro/actions/workflows/deploy.yml/badge.svg)](https://github.com/StellaroneAI/EasyMedPro/actions/workflows/deploy.yml)
[![Firebase Hosting](https://img.shields.io/badge/Firebase-Hosting-orange)](https://easymed-8c074.web.app)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-green)](https://easymed-8c074.web.app)
[![Android](https://img.shields.io/badge/Android-Available-green)](https://github.com/StellaroneAI/EasyMedPro/releases)
[![iOS](https://img.shields.io/badge/iOS-Available-blue)](#ios-setup)

## 🌟 Overview

EasyMedPro is a comprehensive cross-platform AI-powered healthcare application designed for India's diverse healthcare landscape. Available as a **Web App**, **Progressive Web App (PWA)**, **Android App**, and **iOS App** - all built from a single codebase using modern web technologies and Capacitor.

### 📱 Platform Availability
- **🌐 Web App**: [https://easymed-8c074.web.app](https://easymed-8c074.web.app)
- **📲 PWA**: Installable progressive web app with offline functionality
- **🤖 Android**: Native Android app with device integration
- **🍎 iOS**: Native iOS app with device integration

---

## ✨ Key Features

### 🤖 AI-Powered Health Assistant
- **Advanced Symptom Analysis**: Natural language processing for symptom evaluation
- **Health Risk Assessment**: Predictive analytics for chronic illness monitoring
- **Personalized Health Insights**: AI-driven recommendations based on patient data
- **Medical Content Generation**: Contextual health information in multiple languages

### 🗣️ Multilingual Voice Assistant
- **One-Click Voice Commands**: Floating voice button for instant access
- **4 Language Support**: English, Hindi, Tamil, Telugu with native voice synthesis
- **Natural Language Navigation**: Voice commands for all app sections
- **Healthcare-Specific Commands**: "Call 108", "Check symptoms", "Book appointment"
- **Smart Intent Recognition**: AI-powered understanding of voice inputs

### 📱 Mobile-First Features
- **📷 Camera Integration**: Scan prescriptions, medical documents, insurance cards
- **🗺️ GPS Features**: Find nearest hospitals, clinics, pharmacies with directions
- **📴 Offline Mode**: Cache critical health data, emergency contacts, medical history
- **🔔 Push Notifications**: Appointment reminders, medication alerts, health tips
- **🆘 Emergency Features**: Quick dial 108, emergency contact notifications
- **📳 Haptic Feedback**: Native mobile interactions and alerts

### 💾 Offline & Sync Capabilities
- **Service Worker**: Advanced caching for offline functionality
- **Background Sync**: Health data synchronization when connection restored
- **Local Storage**: Critical health information accessible without internet
- **Smart Caching**: Prioritized caching of emergency and health data

### 🏥 Comprehensive Healthcare Management
- **Patient Dashboard**: Real-time health overview with key metrics
- **Appointment Booking**: Smart scheduling with healthcare providers
- **Health Records**: Secure digital storage of medical history
- **Family Health Management**: Multi-member health profiles under one account
- **Prescription Management**: Digital prescriptions with medication reminders
- **Emergency Services**: One-tap access to 108 ambulance services

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18.x or later
- npm or yarn
- Firebase account (for deployment)

### Installation
```bash
# Clone the repository
git clone https://github.com/StellaroneAI/EasyMedPro.git
cd EasyMedPro

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Setup
1. Copy `.env.example` to `.env`
2. Configure Firebase environment variables:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
# ... other Firebase config
```

---

## 🛠️ Development & Build Commands

### Web Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Mobile Development
```bash
npm run build:android    # Build Android app
npm run build:ios        # Build iOS app
npm run build:all        # Build all platforms
npm run dev:android      # Open Android in Android Studio
npm run dev:ios          # Open iOS in Xcode
npm run sync             # Sync web assets to mobile platforms
```

### Firebase Deployment
```bash
npm run deploy:firebase  # Deploy to Firebase Hosting
npm run serve:firebase   # Test Firebase hosting locally
npm run emulate:firebase # Start Firebase emulators
```

---

## 📱 Mobile App Setup

### Android Development
1. **Install Android Studio**
2. **Add Android platform**: `npx cap add android`
3. **Sync and build**: `npm run build:android`
4. **Open in Android Studio**: `npm run dev:android`

### iOS Development (macOS only)
1. **Install Xcode**
2. **Install CocoaPods**: `sudo gem install cocoapods`
3. **Add iOS platform**: `npx cap add ios`
4. **Sync and build**: `npm run build:ios`
5. **Open in Xcode**: `npm run dev:ios`

📖 **Detailed Setup Guide**: [MOBILE_DEPLOYMENT_GUIDE.md](./MOBILE_DEPLOYMENT_GUIDE.md)

---

## 🌐 Progressive Web App (PWA)

### Features
- **📲 Installable**: Add to home screen on mobile devices
- **⚡ Fast**: Service worker caching for instant loading
- **📴 Offline**: Full functionality without internet connection
- **🔔 Notifications**: Push notifications for health reminders
- **🏠 App Shortcuts**: Quick access to key features

### Installation
1. Open [https://easymed-8c074.web.app](https://easymed-8c074.web.app) in a mobile browser
2. Tap "Add to Home Screen" (iOS) or "Install" (Android)
3. Use like a native app with offline capabilities

---

## 🔧 Mobile-Specific Features Integration

### Using Mobile Hooks
```typescript
import { useMobile, useCamera, useGeolocation } from './hooks/useMobile';

// Camera integration
const { takePicture, selectFromGallery } = useCamera();

// GPS and location services
const { getCurrentLocation, findNearbyHospitals } = useGeolocation();

// Device features
const { vibrate, callEmergency, shareHealthReport } = useMobile();
```

### Emergency Component
```typescript
import EmergencyComponent from './components/EmergencyComponent';

<EmergencyComponent />
```

### Camera Component
```typescript
import CameraComponent from './components/CameraComponent';

<CameraComponent 
  onPhotoTaken={(photo) => handlePhoto(photo)}
  title="Scan Prescription"
/>
```

---

## 🔒 Security & Privacy

### Firebase Security
- **Firestore Rules**: User data isolation and role-based access
- **Storage Rules**: Secure file uploads and access control
- **Authentication**: Multi-factor authentication with SMS OTP
- **Encryption**: End-to-end encryption for sensitive health data

### Mobile Security
- **App Signing**: Secure app distribution
- **Permission Management**: Granular device permission controls
- **Secure Storage**: Encrypted local data storage
- **Network Security**: HTTPS enforcement and certificate pinning

---

## 🚀 Deployment

### Automatic Deployment (CI/CD)
Every push to `main` branch automatically:
1. **Builds** the web application
2. **Deploys** to Firebase Hosting
3. **Builds** Android APK
4. **Creates** GitHub release with downloadable APK

### Manual Deployment
```bash
# Firebase Hosting
npm run deploy:firebase

# Android APK
npm run build:android
cd android && ./gradlew assembleRelease

# iOS (requires Xcode)
npm run build:ios
# Then build in Xcode for App Store
```

---

## 📊 Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for responsive design
- **Lucide React** for modern icons

### Mobile
- **Capacitor** for cross-platform native apps
- **Native Plugins**: Camera, Geolocation, Push Notifications, Haptics
- **Progressive Web App** with service workers

### Backend & Services
- **Firebase Authentication** for secure user management
- **Firebase Firestore** for real-time database
- **Firebase Storage** for file uploads
- **Firebase Hosting** for web deployment
- **Firebase Cloud Messaging** for push notifications

### AI & Voice
- **OpenAI GPT** for AI health assistant
- **Web Speech API** for voice commands
- **Natural Language Processing** for symptom analysis

---

## 📖 Documentation

- **[Mobile Deployment Guide](./MOBILE_DEPLOYMENT_GUIDE.md)**: Complete setup and deployment instructions
- **[Firebase Setup Guide](./FIREBASE_AUTHENTICATION_GUIDE.md)**: Firebase configuration
- **[Voice Assistant Setup](./VOICE_SETUP_GUIDE.md)**: Voice feature configuration
- **[Authentication Setup](./AUTHENTICATION_SETUP.md)**: User authentication setup

---

## 🤝 Contributing

1. **Fork** the repository
2. **Create** your feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

---

## 📱 Download & Access

### Web Application
🌐 **Live Demo**: [https://easymed-8c074.web.app](https://easymed-8c074.web.app)

### Mobile Applications
📱 **Android APK**: [Download from Releases](https://github.com/StellaroneAI/EasyMedPro/releases)
🍎 **iOS**: Available through TestFlight (coming soon)

### Progressive Web App
📲 **Install PWA**: Visit the web app and tap "Add to Home Screen"

---

## 📞 Support & Contact

- **🐛 Bug Reports**: [GitHub Issues](https://github.com/StellaroneAI/EasyMedPro/issues)
- **💡 Feature Requests**: [GitHub Discussions](https://github.com/StellaroneAI/EasyMedPro/discussions)
- **📧 Email**: support@easymedpro.com
- **📱 Emergency**: Always call 108 for medical emergencies

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🌟 Features Roadmap

### Current Version (v1.0)
- ✅ Web Application
- ✅ Progressive Web App
- ✅ Android App
- ✅ iOS App
- ✅ Firebase Hosting
- ✅ Offline Functionality
- ✅ Push Notifications

### Coming Soon (v1.1)
- 🔄 App Store Distribution
- 🔄 Advanced AI Diagnostics
- 🔄 Telemedicine Integration
- 🔄 IoT Device Connectivity
- 🔄 Insurance Integration

---

🏥 **EasyMedPro** - *Transforming healthcare with technology*  
📱 *Available everywhere, accessible to everyone*

1. Push this code to GitHub.
2. Go to [Vercel](https://vercel.com).
3. Import your GitHub repo.
4. Use the following build settings:
   - **Framework Preset**: Create React App
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

**SPA Routing Fix:**  
We've included a `vercel.json` to handle all unmatched routes and send them to `index.html`:

```json
"routes": [
  { "src": "/(.*)", "dest": "/" }
]
```

---

## 🛠 Tech Stack

- React
- Tailwind CSS
- Lucide Icons
- Vercel (Hosting)

---

## 🗃️ Archive

Legacy projects and experiments have been moved to the `archive/` directory to keep the codebase lean.

---

EasyMed - Transforming Healthcare Through AI Innovation  
Built with ❤️ for India's Healthcare Future
