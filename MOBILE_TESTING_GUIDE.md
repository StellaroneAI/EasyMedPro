# 🧪 EasyMedPro Mobile App Testing Guide

## 🚀 Current Status
- **Backend**: Firebase-based API running on `http://localhost:5000`
- **Android**: Building and deploying to emulator
- **iOS**: Xcode project ready for testing
- **Fix Applied**: ✅ `speakMessage` function error resolved

## 📱 Testing Scenarios

### 1. **Authentication Testing**
- **Phone OTP Login**: Test with `+919060328119` (whitelisted)
- **Firebase Integration**: SMS via Firebase Auth
- **Speech Feature**: Login messages now use Web Speech API
- **Multi-language**: Test login in different Indian languages

### 2. **Core Features to Test**

#### 🔐 **User Registration & Login**
```
Test Flow:
1. Open mobile app
2. Enter phone: +919060328119
3. Receive Firebase OTP
4. Verify OTP
5. Access dashboard
Expected: No JavaScript errors, speech works
```

#### 📅 **Appointment Booking**
```
Test Flow:
1. Navigate to "Book Appointment"
2. Select doctor/speciality
3. Choose date/time
4. Submit booking
Expected: Data saved to Firebase Firestore
```

#### 📸 **Camera Integration**
```
Test Flow:
1. Go to profile or document upload
2. Tap camera icon
3. Take photo
4. Save/upload
Expected: Capacitor camera plugin works
```

#### 📍 **Location Services**
```
Test Flow:
1. Access location-based features
2. Allow location permission
3. View nearby hospitals/clinics
Expected: Geolocation plugin functions
```

#### 🔔 **Push Notifications**
```
Test Flow:
1. Enable notifications
2. Test appointment reminders
3. Check notification display
Expected: Local notifications work
```

### 3. **Firebase Database Testing**

#### **Check Firebase Console**
- Visit: https://console.firebase.google.com/project/easymed-8c074
- Verify data collections: `users`, `appointments`
- Monitor real-time updates

#### **API Endpoints Testing**
```bash
# Test user creation
POST http://localhost:5000/api/auth/register
{
  "phone": "+919060328119",
  "name": "Test User"
}

# Test appointment creation
POST http://localhost:5000/api/appointments
{
  "patientPhone": "+919060328119",
  "doctorName": "Dr. Test",
  "date": "2025-08-20",
  "time": "10:00 AM"
}
```

### 4. **Mobile-Specific Features**

#### **Android Testing**
- Test on emulator: `Medium_Phone_API_36.0`
- Check all Capacitor plugins
- Verify offline functionality
- Test app installation

#### **iOS Testing** 
- Build in Xcode
- Test on iOS Simulator
- Verify App Store compatibility
- Check iOS-specific permissions

### 5. **Performance Testing**

#### **Network Connectivity**
- Test with WiFi
- Test with mobile data
- Test offline mode
- Check data synchronization

#### **Speech Functionality**
- Test text-to-speech on login
- Verify multiple languages
- Check speech rate and pitch
- Test on different devices

## 🐛 Issue Resolution

### **Fixed Issues**
- ✅ `speakMessage is not defined` error
- ✅ Firebase backend integration
- ✅ MongoDB completely replaced with Firebase
- ✅ Android build environment (Java 21)

### **Current Configuration**
```javascript
// Speech Function (now working)
const speakMessage = (text: string) => {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.8;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  }
};
```

### **Environment Variables**
```bash
# Firebase Configuration
VITE_FIREBASE_PROJECT_ID=easymed-8c074
VITE_FIREBASE_API_KEY=AIzaSyALfzOIwhtgwgTmB2yrjC0hTqX7E3FPMbY

# Mobile Features
VITE_ENABLE_CAMERA=true
VITE_ENABLE_GEOLOCATION=true
VITE_ENABLE_NOTIFICATIONS=true

# Backend API
VITE_API_BASE_URL=http://localhost:5000
```

## 📊 Expected Test Results

### **Success Indicators**
- ✅ No JavaScript console errors
- ✅ Firebase authentication works
- ✅ Data persists in Firestore
- ✅ Speech synthesis functions
- ✅ Camera permissions granted
- ✅ Location services active
- ✅ Notifications display correctly

### **Performance Metrics**
- App startup time: < 3 seconds
- API response time: < 1 second
- Camera launch: < 2 seconds
- Speech synthesis: Immediate

## 🔧 Troubleshooting

### **Common Issues**
1. **Network errors**: Check if backend server is running on port 5000
2. **Permission errors**: Ensure mobile permissions are granted
3. **Build errors**: Verify Java 21 and Android SDK setup
4. **Firebase errors**: Check Firebase project configuration

### **Debug Commands**
```bash
# Check backend status
curl http://localhost:5000/api/health

# View server logs
node C:\Users\D2K2\EasyMedPro\EasyMedPro-2\server\index.js

# Android debugging
npx cap run android --debug

# iOS debugging  
npx cap open ios
```

## 🎯 Next Steps
1. **Complete mobile testing** on both platforms
2. **Deploy to app stores** (optional)
3. **Add production Firebase credentials**
4. **Implement additional features** as needed

Your Firebase-based mobile app is now ready for comprehensive testing! 🚀
