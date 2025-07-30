# EasyMed - AI-Powered Mobile Healthcare Platform for India

## Overview

EasyMed is a next-generation, AI-integrated mobile-first healthcare platform specifically designed for India's diverse and evolving healthcare landscape. The platform combines advanced AI technology with comprehensive healthcare management tools to provide patients, families, and healthcare providers with seamless digital health experiences.

---

## 🌟 Key Features

### 🤖 AI-Powered Health Assistant
- Advanced Symptom Analysis: Natural language processing for symptom evaluation
- Health Risk Assessment: Predictive analytics for chronic illness monitoring
- Personalized Health Insights: AI-driven recommendations based on patient data
- Medical Content Generation: Contextual health information in multiple languages

### 🗣️ Multilingual Voice Assistant
- One-Click Voice Commands: Floating voice button for instant access
- 4 Language Support: English, Hindi, Tamil, Telugu with native voice synthesis
- Natural Language Navigation: Voice commands for all app sections
- Healthcare-Specific Commands: "Call 108", "Check symptoms", "Book appointment"
- Smart Intent Recognition: AI-powered understanding of voice inputs

### 📱 Comprehensive Healthcare Management
- Patient Dashboard: Real-time health overview with key metrics
- Appointment Booking: Smart scheduling with healthcare providers
- Health Records: Secure digital storage of medical history
- Family Health Management: Multi-member health profiles under one account
- Prescription Management: Digital prescriptions with medication reminders
- Emergency Services: One-tap access to 108 ambulance services

EasyMed is a React + Tailwind CSS-based MVP for an intelligent healthcare booking and assistant platform.

---

## 🚀 Getting Started

Install dependencies:

```bash
npm install
```

Run locally:

```bash
npm run dev
```

---

## 📦 Deploy on Vercel

1. Push this code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your GitHub repo
4. Use the following build settings:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

### SPA Routing Fix

If you need SPA routing, add a `vercel.json` file like this:

```json
{
  "routes": [
    { "src": "/(.*)", "dest": "/" }
  ]
}
```

---

## 🛠 Tech Stack

- React + TypeScript
- Vite (Build Tool)
- Tailwind CSS
- Lucide Icons
- PWA Support
- Vercel (Hosting)

---

**EasyMed – Transforming Healthcare Through AI Innovation**  
**Built with ❤️ by Praveen Kumar J for India's Healthcare Future**
