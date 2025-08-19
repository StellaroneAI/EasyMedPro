/**
 * @file translations/index.ts
 * @description Comprehensive translation data for EasyMed - AI-Powered Healthcare Platform
 * Supports 22+ Indian official languages with healthcare-specific terminology
 * and cultural context-appropriate content for inclusive healthcare access
 */

// Language enumeration for better type safety
export enum Language {
  English = "english",
  Hindi = "hindi",
  Tamil = "tamil",
  Telugu = "telugu",
  Bengali = "bengali",
  Marathi = "marathi",
  Punjabi = "punjabi",
  Gujarati = "gujarati",
  Kannada = "kannada",
  Malayalam = "malayalam",
  Odia = "odia",
  Assamese = "assamese",
  Urdu = "urdu",
  Kashmiri = "kashmiri",
  Sindhi = "sindhi",
  Manipuri = "manipuri",
  Bodo = "bodo",
  Konkani = "konkani",
  Sanskrit = "sanskrit",
  Maithili = "maithili",
  Santali = "santali",
  Dogri = "dogri",
  Nepali = "nepali"
}

// Complete translation interface for type safety
export interface TranslationData {
  // Header & Navigation
  welcomeBack: string;
  healthCompanion: string;
  
  // Health Status Cards
  heartRate: string;
  bloodPressure: string; 
  nextAppointment: string;
  medications: string;
  normal: string;
  dueToday: string;
  today3pm: string;
  drSharma: string;
  
  // Quick Actions
  aiSymptomChecker: string;
  bookAppointment: string; 
  emergency108: string;
  familyHealth: string;
  
  // AI Health Insights
  aiHealthInsights: string;
  goodMorning: string;
  vitalsGreat: string;
  medicationReminder: string;
  nextCheckup: string;
  
  // Family Health
  familyHealthTitle: string;
  wife: string;
  son: string;
  daughter: string;
  father: string;
  mother: string;
  allVitalsNormal: string;
  vaccinationDue: string;
  
  // Recent Activity
  recentActivity: string;
  bloodPressureRecorded: string;
  appointmentBooked: string; 
  healthReportShared: string;
  hoursAgo: string;
  yesterday: string;
  daysAgo: string;
  
  // Voice Assistant
  listening: string;
  youSaid: string;
  easymedAI: string;
  
  // Voice Commands
  voiceCommands: {
    greeting: string;
    goToAppointments: string;
    checkSymptoms: string;
    emergency: string;
    familyHealthNav: string;
    bookAppointmentNav: string;
    healthRecords: string;
    callDoctor: string;
    medicationReminder: string;
  };
  
  // ABHA Integration
  abhaTitle: string;
  abhaSubtitle: string;
  abhaNotConnected: string;
  abhaConnectNow: string;
  abhaConnected: string;
  abhaHealthId: string;
  abhaViewRecords: string;
  abhaCreateAccount: string;
  abhaLogin: string;
  abhaNationalId: string;
  
  // Medical Terminology
  symptoms: string;
  diagnosis: string;
  treatment: string;
  prescription: string;
  vitals: string;
  fever: string;
  cough: string;
  headache: string;
  bodyache: string;
  nausea: string;
  diarrhea: string;
  vomiting: string;
  dizziness: string;
  fatigue: string;
  breathingDifficulty: string;
  chestPain: string;
  abdominalPain: string;
  
  // Healthcare Actions
  scheduleAppointment: string;
  viewReport: string;
  downloadPrescription: string;
  contactDoctor: string;
  callAmbulance: string;
  findNearbyHospital: string;
  searchMedicine: string;
  setReminder: string;
  shareReport: string;
  uploadDocument: string;
  
  // Common Phrases
  pleaseWait: string;
  loading: string;
  success: string;
  error: string;
  retry: string;
  cancel: string;
  confirm: string;
  save: string;
  edit: string;
  delete: string;
  search: string;
  filter: string;
  sort: string;
  
  // Greetings by time
  goodAfternoon: string;
  goodEvening: string;
  goodNight: string;
  
  // Cultural Context
  namaste: string;
  blessing: string;
  takeCareBlessings: string;
  familyWellbeing: string;
  communityHealth: string;
  
  // Emergency
  urgentCare: string;
  criticalCondition: string;
  stableCondition: string;
  emergencyContact: string;
  hospitalAdmission: string;

  // Homepage specific translations
  homepage: {
    getStarted: string;
    mainHeading: string;
    subHeading: string;
    feature1Title: string;
    feature1Desc: string;
    feature2Title: string;
    feature2Desc: string;
    feature3Title: string;
    feature3Desc: string;
    feature4Title: string;
    feature4Desc: string;
    whyChooseUs: string;
    why1Title: string;
    why1Desc: string;
    why2Title: string;
    why2Desc: string;
    why3Title: string;
    why3Desc: string;
  }
}

// Comprehensive translation data for all Indian languages
export const translations: Record<Language, TranslationData> = {
  [Language.English]: {
    // Header & Navigation
    welcomeBack: "Welcome back",
    healthCompanion: "Your health companion is here",
    
    // Health Status Cards
    heartRate: "Heart Rate",
    bloodPressure: "Blood Pressure", 
    nextAppointment: "Next Appointment",
    medications: "Medications",
    normal: "Normal",
    dueToday: "Due Today",
    today3pm: "Today 3PM",
    drSharma: "Dr. Sharma",
    
    // Quick Actions
    aiSymptomChecker: "AI Symptom Checker",
    bookAppointment: "Book Appointment", 
    emergency108: "Emergency (108)",
    familyHealth: "Family Health",
    
    // AI Health Insights
    aiHealthInsights: "🤖 AI Health Insights",
    goodMorning: "Good morning, Rajesh!",
    vitalsGreat: "Based on your health data, your vitals look great today.",
    medicationReminder: "Don't forget to take your blood pressure medication at 2 PM.",
    nextCheckup: "Your next checkup with Dr. Sharma is in 3 hours.",
    
    // Family Health
    familyHealthTitle: "👨‍👩‍👧‍👦 Family Health",
    wife: "Wife",
    son: "Son",
    daughter: "Daughter",
    father: "Father",
    mother: "Mother",
    allVitalsNormal: "All vitals normal",
    vaccinationDue: "Vaccination due next week",
    
    // Recent Activity
    recentActivity: "📋 Recent Activity",
    bloodPressureRecorded: "Blood pressure recorded: 120/80 (Normal)",
    appointmentBooked: "Appointment booked with Dr. Sharma", 
    healthReportShared: "Health report shared with family",
    hoursAgo: "2 hours ago",
    yesterday: "Yesterday",
    daysAgo: "2 days ago",
    
    // Voice Assistant
    listening: "Listening...",
    youSaid: "You said:",
    easymedAI: "EasyMed AI:",
    
    // Voice Commands
    voiceCommands: {
      greeting: "Hello! How can I help you today?",
      goToAppointments: "Navigating to appointments...",
      checkSymptoms: "Opening AI symptom checker...",
      emergency: "Calling 108 emergency services...",
      familyHealthNav: "Showing family health overview...",
      bookAppointmentNav: "Opening appointment booking...",
      healthRecords: "Accessing your health records...",
      callDoctor: "Connecting you with Dr. Sharma...",
      medicationReminder: "Showing your medication schedule..."
    },
    
    // ABHA Integration
    abhaTitle: "🏥 ABHA Integration",
    abhaSubtitle: "Connect your Ayushman Bharat Health Account",
    abhaNotConnected: "ABHA Not Connected",
    abhaConnectNow: "Connect ABHA",
    abhaConnected: "ABHA Connected",
    abhaHealthId: "Health ID",
    abhaViewRecords: "View Health Records",
    abhaCreateAccount: "Create ABHA",
    abhaLogin: "Login with ABHA",
    abhaNationalId: "National Digital Health ID",
    
    // Medical Terminology
    symptoms: "Symptoms",
    diagnosis: "Diagnosis",
    treatment: "Treatment",
    prescription: "Prescription",
    vitals: "Vitals",
    fever: "Fever",
    cough: "Cough",
    headache: "Headache",
    bodyache: "Body Ache",
    nausea: "Nausea",
    diarrhea: "Diarrhea",
    vomiting: "Vomiting",
    dizziness: "Dizziness",
    fatigue: "Fatigue",
    breathingDifficulty: "Breathing Difficulty",
    chestPain: "Chest Pain",
    abdominalPain: "Abdominal Pain",
    
    // Healthcare Actions
    scheduleAppointment: "Schedule Appointment",
    viewReport: "View Report",
    downloadPrescription: "Download Prescription",
    contactDoctor: "Contact Doctor",
    callAmbulance: "Call Ambulance",
    findNearbyHospital: "Find Nearby Hospital",
    searchMedicine: "Search Medicine",
    setReminder: "Set Reminder",
    shareReport: "Share Report",
    uploadDocument: "Upload Document",
    
    // Common Phrases
    pleaseWait: "Please wait",
    loading: "Loading",
    success: "Success",
    error: "Error",
    retry: "Retry",
    cancel: "Cancel",
    confirm: "Confirm",
    save: "Save",
    edit: "Edit",
    delete: "Delete",
    search: "Search",
    filter: "Filter",
    sort: "Sort",
    
    // Greetings by time
    goodAfternoon: "Good afternoon",
    goodEvening: "Good evening",
    goodNight: "Good night",
    
    // Cultural Context
    namaste: "Namaste",
    blessing: "Blessings",
    takeCareBlessings: "Take care and stay blessed",
    familyWellbeing: "Family wellbeing",
    communityHealth: "Community health",
    
    // Emergency
    urgentCare: "Urgent Care",
    criticalCondition: "Critical Condition",
    stableCondition: "Stable Condition",
    emergencyContact: "Emergency Contact",
    hospitalAdmission: "Hospital Admission",

    // Homepage specific translations
    homepage: {
      getStarted: "Get Started",
      mainHeading: "Intelligent Healthcare, Instantly Accessible.",
      subHeading: "Welcome to the future of healthcare. Get instant symptom analysis, manage your medications, and receive personalized health insights—all from the comfort of your home.",
      feature1Title: "24/7 AI Doctor",
      feature1Desc: "Instant health consultation powered by advanced AI.",
      feature2Title: "Smart Diagnosis",
      feature2Desc: "90%+ accuracy in symptom analysis and recommendations.",
      feature3Title: "7+ Languages",
      feature3Desc: "Speak in your native language - Hindi, Tamil, Telugu, and more.",
      feature4Title: "Save 80% on Costs",
      feature4Desc: "Significantly reduce hospital visits and medical expenses.",
      whyChooseUs: "Why Choose EasyMed-TeleHealth?",
      why1Title: "Voice-enabled AI Assistant",
      why1Desc: "Navigate the app and get health information using your voice.",
      why2Title: "ABHA Integrated",
      why2Desc: "Securely manage your health records with your Ayushman Bharat Health Account.",
      why3Title: "Family Health Hub",
      why3Desc: "Monitor and manage the health of your entire family in one place."
    }
  },
  
  [Language.Hindi]: {
    // Header & Navigation  
    welcomeBack: "वापस स्वागत है",
    healthCompanion: "आपका स्वास्थ्य साथी यहाँ है",
    
    // Health Status Cards
    heartRate: "हृदय गति",
    bloodPressure: "रक्तचाप",
    nextAppointment: "अगली अपॉइंटमेंट", 
    medications: "दवाइयाँ",
    normal: "सामान्य",
    dueToday: "आज देय",
    today3pm: "आज दोपहर 3 बजे",
    drSharma: "डॉ. शर्मा",
    
    // Quick Actions
    aiSymptomChecker: "AI लक्षण जाँचकर्ता",
    bookAppointment: "अपॉइंटमेंट बुक करें",
    emergency108: "आपातकाल (108)", 
    familyHealth: "पारिवारिक स्वास्थ्य",
    
    // AI Health Insights
    aiHealthInsights: "🤖 AI स्वास्थ्य अंतर्दृष्टि",
    goodMorning: "सुप्रभात, राजेश!",
    vitalsGreat: "आपके स्वास्थ्य डेटा के आधार पर, आज आपके जीवन संकेतक बहुत अच्छे लग रहे हैं।",
    medicationReminder: "दोपहर 2 बजे अपनी रक्तचाप की दवा लेना न भूलें।",
    nextCheckup: "डॉ. शर्मा के साथ आपकी अगली जांच 3 घंटे में है।",
    
    // Family Health
    familyHealthTitle: "👨‍👩‍👧‍👦 पारिवारिक स्वास्थ्य",
    wife: "पत्नी",
    son: "बेटा",
    daughter: "बेटी",
    father: "पिता",
    mother: "माता",
    allVitalsNormal: "सभी जीवन संकेतक सामान्य",
    vaccinationDue: "अगले सप्ताह टीकाकरण देय",
    
    // Recent Activity
    recentActivity: "📋 हाल की गतिविधि",
    bloodPressureRecorded: "रक्तचाप दर्ज किया गया: 120/80 (सामान्य)",
    appointmentBooked: "डॉ. शर्मा के साथ अपॉइंटमेंट बुक की गई",
    healthReportShared: "पारिवारिक स्वास्थ्य रिपोर्ट साझा की गई", 
    hoursAgo: "2 घंटे पहले",
    yesterday: "कल",
    daysAgo: "2 दिन पहले",
    
    // Voice Assistant
    listening: "सुन रहे हैं...",
    youSaid: "आपने कहा:",
    easymedAI: "EasyMed AI:",
    
    // Voice Commands
    voiceCommands: {
      greeting: "नमस्ते! आज मैं आपकी कैसे मदद कर सकता हूँ?",
      goToAppointments: "अपॉइंटमेंट्स पर जा रहे हैं...",
      checkSymptoms: "AI लक्षण जांचकर्ता खोल रहे हैं...",
      emergency: "108 आपातकालीन सेवाओं को कॉल कर रहे हैं...",
      familyHealthNav: "पारिवारिक स्वास्थ्य अवलोकन दिखा रहे हैं...",
      bookAppointmentNav: "अपॉइंटमेंट बुकिंग खोल रहे हैं...",
      healthRecords: "आपके स्वास्थ्य रिकॉर्ड्स तक पहुंच रहे हैं...",
      callDoctor: "डॉ. शर्मा से जोड़ रहे हैं...",
      medicationReminder: "आपका दवा कार्यक्रम दिखा रहे हैं..."
    },
    
    // ABHA Integration
    abhaTitle: "🏥 आभा एकीकरण",
    abhaSubtitle: "अपना आयुष्मान भारत स्वास्थ्य खाता जोड़ें",
    abhaNotConnected: "आभा जुड़ा नहीं है",
    abhaConnectNow: "आभा जोड़ें",
    abhaConnected: "आभा जुड़ा हुआ",
    abhaHealthId: "स्वास्थ्य आईडी",
    abhaViewRecords: "स्वास्थ्य रिकॉर्ड देखें",
    abhaCreateAccount: "आभा बनाएं",
    abhaLogin: "आभा से लॉगिन करें",
    abhaNationalId: "राष्ट्रीय डिजिटल स्वास्थ्य आईडी",
    
    // Medical Terminology
    symptoms: "लक्षण",
    diagnosis: "निदान",
    treatment: "उपचार",
    prescription: "नुस्खा",
    vitals: "जीवन संकेतक",
    fever: "बुखार",
    cough: "खांसी",
    headache: "सिरदर्द",
    bodyache: "शरीर दर्द",
    nausea: "मतली",
    diarrhea: "दस्त",
    vomiting: "उल्टी",
    dizziness: "चक्कर आना",
    fatigue: "थकान",
    breathingDifficulty: "सांस लेने में कठिनाई",
    chestPain: "छाती में दर्द",
    abdominalPain: "पेट दर्द",
    
    // Healthcare Actions
    scheduleAppointment: "अपॉइंटमेंट निर्धारित करें",
    viewReport: "रिपोर्ट देखें",
    downloadPrescription: "नुस्खा डाउनलोड करें",
    contactDoctor: "डॉक्टर से संपर्क करें",
    callAmbulance: "एम्बुलेंस बुलाएं",
    findNearbyHospital: "नजदीकी अस्पताल खोजें",
    searchMedicine: "दवा खोजें",
    setReminder: "अनुस्मारक सेट करें",
    shareReport: "रिपोर्ट साझा करें",
    uploadDocument: "दस्तावेज़ अपलोड करें",
    
    // Common Phrases
    pleaseWait: "कृपया प्रतीक्षा करें",
    loading: "लोड हो रहा है",
    success: "सफल",
    error: "त्रुटि",
    retry: "पुनः प्रयास करें",
    cancel: "रद्द करें",
    confirm: "पुष्टि करें",
    save: "सहेजें",
    edit: "संपादित करें",
    delete: "हटाएं",
    search: "खोजें",
    filter: "फ़िल्टर",
    sort: "क्रमबद्ध करें",
    
    // Greetings by time
    goodAfternoon: "शुभ दोपहर",
    goodEvening: "शुभ संध्या",
    goodNight: "शुभ रात्रि",
    
    // Cultural Context
    namaste: "नमस्ते",
    blessing: "आशीर्वाद",
    takeCareBlessings: "स्वस्थ रहें और आशीर्वाद पाते रहें",
    familyWellbeing: "पारिवारिक कल्याण",
    communityHealth: "सामुदायिक स्वास्थ्य",
    
    // Emergency
    urgentCare: "तत्काल देखभाल",
    criticalCondition: "गंभीर स्थिति",
    stableCondition: "स्थिर स्थिति",
    emergencyContact: "आपातकालीन संपर्क",
    hospitalAdmission: "अस्पताल में भर्ती",

    // Homepage specific translations
    homepage: {
      getStarted: "शुरू करें",
      mainHeading: "बुद्धिमान स्वास्थ्य सेवा, तुरंत सुलभ।",
      subHeading: "स्वास्थ्य सेवा के भविष्य में आपका स्वागत है। तुरंत लक्षण विश्लेषण प्राप्त करें, अपनी दवाएं प्रबंधित करें, और व्यक्तिगत स्वास्थ्य जानकारी प्राप्त करें - सब कुछ अपने घर के आराम से।",
      feature1Title: "24/7 एआई डॉक्टर",
      feature1Desc: "उन्नत एआई द्वारा संचालित तत्काल स्वास्थ्य परामर्श।",
      feature2Title: "स्मार्ट निदान",
      feature2Desc: "लक्षण विश्लेषण और सिफारिशों में 90%+ सटीकता।",
      feature3Title: "7+ भाषाएँ",
      feature3Desc: "अपनी मूल भाषा में बोलें - हिंदी, तमिल, तेलुगु, और बहुत कुछ।",
      feature4Title: "लागत पर 80% बचाएं",
      feature4Desc: "अस्पताल के दौरे और चिकित्सा खर्चों में उल्लेखनीय कमी।",
      whyChooseUs: "EasyMed-TeleHealth क्यों चुनें?",
      why1Title: "आवाज-सक्षम एआई सहायक",
      why1Desc: "ऐप नेविगेट करें और अपनी आवाज का उपयोग करके स्वास्थ्य जानकारी प्राप्त करें।",
      why2Title: "आभा एकीकृत",
      why2Desc: "अपने आयुष्मान भारत स्वास्थ्य खाते के साथ अपने स्वास्थ्य रिकॉर्ड को सुरक्षित रूप से प्रबंधित करें।",
      why3Title: "पारिवारिक स्वास्थ्य हब",
      why3Desc: "एक ही स्थान पर अपने पूरे परिवार के स्वास्थ्य की निगरानी और प्रबंधन करें।"
    }
  },
  
  tamil: {
    // Header & Navigation
    welcomeBack: "மீண்டும் வருக",
    healthCompanion: "உங்கள் உடல்நல துணை இங்கே உள்ளது",
    
    // Health Status Cards  
    heartRate: "இதய துடிப்பு",
    bloodPressure: "இரத்த அழுத்தம்",
    nextAppointment: "அடுத்த சந்திப்பு",
    medications: "மருந்துகள்", 
    normal: "சாதாரண",
    dueToday: "இன்று செலுத்த வேண்டிய",
    today3pm: "இன்று மதியம் 3 மணி",
    drSharma: "டாக்டர். சர்மா",
    
    // Quick Actions
    aiSymptomChecker: "AI அறிகுறி சரிபார்ப்பாளர்",
    bookAppointment: "சந்திப்பு முன்பதிவு செய்யுங்கள்",
    emergency108: "அவசரநிலை (108)",
    familyHealth: "குடும்ப உடல்நலம்",
    
    // AI Health Insights
    aiHealthInsights: "🤖 AI உடல்நல நுண்ணறிவுகள்",
    goodMorning: "காலை வணக்கம், ராஜேஷ்!",
    vitalsGreat: "உங்கள் உடல்நல தரவுகளின் அடிப்படையில், இன்று உங்கள் உயிர் அறிகுறிகள் மிகவும் சிறப்பாக உள்ளன.",
    medicationReminder: "மதியம் 2 மணிக்கு உங்கள் இரத்த அழுத்த மருந்தை எடுக்க மறக்காதீர்கள்.",
    nextCheckup: "டாக்டர். சர்மாவுடன் உங்கள் அடுத்த பரிசோதனை 3 மணி நேரத்தில் உள்ளது.",
    
    // Family Health
    familyHealthTitle: "👨‍👩‍👧‍👦 குடும்ப உடல்நலம்", 
    wife: "மனைவி",
    son: "மகன்",
    allVitalsNormal: "அனைத்து உயிர் அறிகுறிகளும் சாதாரணமாக உள்ளன",
    vaccinationDue: "அடுத்த வாரம் தடுப்பூசி செலுத்த வேண்டும்",
    
    // Recent Activity
    recentActivity: "📋 சமீபத்திய செயல்பாடு",
    bloodPressureRecorded: "இரத்த அழுத்தம் பதிவு செய்யப்பட்டது: 120/80 (சாதாரண)",
    appointmentBooked: "டாக்டர். சர்மாவுடன் சந்திப்பு முன்பதிவு செய்யப்பட்டது",
    healthReportShared: "குடும்பத்துடன் உடல்நல அறிக்கை பகிரப்பட்டது",
    hoursAgo: "2 மணி நேரம் முன்பு", 
    yesterday: "நேற்று",
    daysAgo: "2 நாட்களுக்கு முன்பு",
    
    // Voice Assistant
    listening: "கேட்டுக்கொண்டிருக்கிறது...",
    youSaid: "நீங்கள் சொன்னது:",
    easymedAI: "EasyMed AI:",
    
    // Voice Commands
    voiceCommands: {
      greeting: "வணக்கம்! இன்று நான் உங்களுக்கு எப்படி உதவ முடியும்?",
      goToAppointments: "சந்திப்புகளுக்கு செல்கிறோம்...",
      checkSymptoms: "AI அறிகுறி சரிபார்ப்பாளரைத் திறக்கிறோம்...",
      emergency: "108 அவசர சேவைகளை அழைக்கிறோம்...",
      familyHealthNav: "குடும்ப உடல்நல கண்ணோட்டத்தைக் காட்டுகிறோம்...",
      bookAppointmentNav: "சந்திப்பு முன்பதிவைத் திறக்கிறோம்...",
      healthRecords: "உங்கள் உடல்நல பதிவுகளை அணுகுகிறோம்...",
      callDoctor: "டாக்டர். சர்மாவுடன் இணைக்கிறோம்...",
      medicationReminder: "உங்கள் மருந்து அட்டவணையைக் காட்டுகிறோம்..."
    }
  },
  
  telugu: {
    // Header & Navigation
    welcomeBack: "తిరిగి స్వాగతం",
    healthCompanion: "మీ ఆరోగ్య సహాయకుడు ఇక్కడ ఉన్నారు",
    
    // Health Status Cards
    heartRate: "హృదయ స్పందన",
    bloodPressure: "రక్తపోటు", 
    nextAppointment: "తదుపరి అపాయింట్‌మెంట్",
    medications: "మందులు",
    normal: "సాధారణ",
    dueToday: "ఈరోజు చెల్లించవలసిన",
    today3pm: "ఈరోజు మధ్యాహ్నం 3 గంటలకు",
    drSharma: "డాక్టర్ శర్మ",
    
    // Quick Actions
    aiSymptomChecker: "AI లక్షణ తనిఖీదారు",
    bookAppointment: "అపాయింట్‌మెంట్ బుక్ చేయండి",
    emergency108: "అత్యవసరం (108)",
    familyHealth: "కుటుంబ ఆరోగ్యం",
    
    // AI Health Insights
    aiHealthInsights: "🤖 AI ఆరోగ్య అంతర్దృష్టులు",
    goodMorning: "శుభోదయం, రాజేష్!",
    vitalsGreat: "మీ ఆరోగ్య డేటా ఆధారంగా, ఈరోజు మీ జీవన సంకేతాలు చాలా బాగున్నాయి.",
    medicationReminder: "మధ్యాహ్నం 2 గంటలకు మీ రక్తపోటు మందు తీసుకోవడం మర్చిపోవద్దు.",
    nextCheckup: "డాక్టర్ శర్మతో మీ తదుపరి పరీక్ష 3 గంటల్లో ఉంది.",
    
    // Family Health
    familyHealthTitle: "👨‍👩‍👧‍👦 కుటుంబ ఆరోగ్యం",
    wife: "భార్య",
    son: "కొడుకు",
    allVitalsNormal: "అన్ని జీవన సంకేతాలు సాధారణంగా ఉన్నాయి",
    vaccinationDue: "వచ్చే వారం టీకా వేయించుకోవాలి",
    
    // Recent Activity  
    recentActivity: "📋 ఇటీవలి కార్యకలాపం",
    bloodPressureRecorded: "రక్తపోటు నమోదు చేయబడింది: 120/80 (సాధారణ)",
    appointmentBooked: "డాక్టర్ శర్మతో అపాయింట్‌మెంట్ బుక్ చేయబడింది",
    healthReportShared: "కుటుంబంతో ఆరోగ్య నివేదిక భాగస్వామ్యం చేయబడింది",
    hoursAgo: "2 గంటల క్రితం",
    yesterday: "నిన్న", 
    daysAgo: "2 రోజుల క్రితం",
    
    // Voice Assistant
    listening: "వింటున్నాం...",
    youSaid: "మీరు చెప్పింది:",
    easymedAI: "EasyMed AI:",
    
    // Voice Commands
    voiceCommands: {
      greeting: "నమస్కారం! ఈరోజు నేను మీకు ఎలా సహాయం చేయగలను?",
      goToAppointments: "అపాయింట్‌మెంట్‌లకు వెళ్తున్నాం...",
      checkSymptoms: "AI లక్షణ తనిఖీదారుని తెరుస్తున్నాం...",
      emergency: "108 అత్యవసర సేవలను కాల్ చేస్తున్నాం...",
      familyHealthNav: "కుటుంబ ఆరోగ్య అవలోకనాన్ని చూపిస్తున్నాం...",
      bookAppointmentNav: "అపాయింట్‌మెంట్ బుకింగ్‌ను తెరుస్తున్నాం...",
      healthRecords: "మీ ఆరోగ్య రికార్డులను యాక్సెస్ చేస్తున్నాం...",
      callDoctor: "డాక్టర్ శర్మతో కనెక్ట్ చేస్తున్నాం...",
      medicationReminder: "మీ మందుల షెడ్యూల్‌ను చూపిస్తున్నాం..."
    }
  },
  
  bengali: {
    // Header & Navigation
    welcomeBack: "ফিরে আসার জন্য স্বাগতম",
    healthCompanion: "আপনার স্বাস্থ্য সহায়ক এখানে আছেন",
    
    // Health Status Cards
    heartRate: "হৃদস্পন্দন",
    bloodPressure: "রক্তচাপ",
    nextAppointment: "পরবর্তী অ্যাপয়েন্টমেন্ট",
    medications: "ওষুধ",
    normal: "স্বাভাবিক",
    dueToday: "আজ নেওয়ার",
    today3pm: "আজ বিকাল ৩টা",
    drSharma: "ডাক্তার শর্মা",
    
    // Quick Actions
    aiSymptomChecker: "AI লক্ষণ পরীক্ষক",
    bookAppointment: "অ্যাপয়েন্টমেন্ট বুক করুন",
    emergency108: "জরুরি (১০৮)",
    familyHealth: "পারিবারিক স্বাস্থ্য",
    
    // AI Health Insights
    aiHealthInsights: "🤖 AI স্বাস্থ্য অন্তর্দৃষ্টি",
    goodMorning: "সুপ্রভাত, রাজেশ!",
    vitalsGreat: "আপনার স্বাস্থ্য তথ্যের ভিত্তিতে, আজ আপনার জীবনীশক্তি দুর্দান্ত দেখাচ্ছে।",
    medicationReminder: "দুপুর ২টায় আপনার রক্তচাপের ওষুধ নিতে ভুলবেন না।",
    nextCheckup: "ডাক্তার শর্মার সাথে আপনার পরবর্তী চেকআপ ৩ ঘন্টার মধ্যে।",
    
    // Family Health
    familyHealthTitle: "👨‍👩‍👧‍👦 পারিবারিক স্বাস্থ্য",
    wife: "স্ত্রী",
    son: "ছেলে",
    allVitalsNormal: "সব জীবনীশক্তি স্বাভাবিক",
    vaccinationDue: "পরের সপ্তাহে টিকাদান প্রয়োজন",
    
    // Recent Activity
    recentActivity: "📋 সাম্প্রতিক কার্যকলাপ",
    bloodPressureRecorded: "রক্তচাপ রেকর্ড করা হয়েছে: ১২০/৮০ (স্বাভাবিক)",
    appointmentBooked: "ডাক্তার শর্মার সাথে অ্যাপয়েন্টমেন্ট বুক করা হয়েছে",
    healthReportShared: "পরিবারের সাথে স্বাস্থ্য রিপোর্ট শেয়ার করা হয়েছে",
    hoursAgo: "২ ঘন্টা আগে",
    yesterday: "গতকাল",
    daysAgo: "২ দিন আগে",
    
    // Voice Assistant
    listening: "শুনছি...",
    youSaid: "আপনি বলেছেন:",
    easymedAI: "EasyMed AI:",
    
    // Voice Commands
    voiceCommands: {
      greeting: "নমস্কার! আজ আমি আপনাকে কীভাবে সাহায্য করতে পারি?",
      goToAppointments: "অ্যাপয়েন্টমেন্টে যাচ্ছি...",
      checkSymptoms: "AI লক্ষণ পরীক্ষক খুলছি...",
      emergency: "১০৮ জরুরি সেবায় কল করছি...",
      familyHealthNav: "পারিবারিক স্বাস্থ্য ওভারভিউ দেখাচ্ছি...",
      bookAppointmentNav: "অ্যাপয়েন্টমেন্ট বুকিং খুলছি...",
      healthRecords: "আপনার স্বাস্থ্য রেকর্ড অ্যাক্সেস করছি...",
      callDoctor: "ডাক্তার শর্মার সাথে সংযোগ করছি...",
      medicationReminder: "আপনার ওষুধের সূচি দেখাচ্ছি..."
    }
  },
  
  marathi: {
    // Header & Navigation
    welcomeBack: "परत स्वागत आहे",
    healthCompanion: "तुमचा आरोग्य सहाय्यक येथे आहे",
    
    // Health Status Cards
    heartRate: "हृदयाची धडधड",
    bloodPressure: "रक्तदाब",
    nextAppointment: "पुढील भेट",
    medications: "औषधे",
    normal: "सामान्य",
    dueToday: "आज घ्यावयाची",
    today3pm: "आज दुपारी ३ वाजता",
    drSharma: "डॉ. शर्मा",
    
    // Quick Actions
    aiSymptomChecker: "AI लक्षण तपासकर्ता",
    bookAppointment: "भेट बुक करा",
    emergency108: "आणीबाणी (१०८)",
    familyHealth: "कौटुंबिक आरोग्य",
    
    // AI Health Insights
    aiHealthInsights: "🤖 AI आरोग्य अंतर्दृष्टी",
    goodMorning: "सुप्रभात, राजेश!",
    vitalsGreat: "तुमच्या आरोग्य डेटाच्या आधारे, आज तुमचे जीवनसंकेत उत्कृष्ट दिसत आहेत.",
    medicationReminder: "दुपारी २ वाजता तुमची रक्तदाब औषध घेणे विसरू नका.",
    nextCheckup: "डॉ. शर्मा यांच्यासोबत तुमची पुढील तपासणी ३ तासांत आहे.",
    
    // Family Health
    familyHealthTitle: "👨‍👩‍👧‍👦 कौटुंबिक आरोग्य",
    wife: "पत्नी",
    son: "मुलगा",
    allVitalsNormal: "सर्व जीवनसंकेत सामान्य",
    vaccinationDue: "पुढच्या आठवड्यात लसीकरण आवश्यक",
    
    // Recent Activity
    recentActivity: "📋 अलीकडची क्रिया",
    bloodPressureRecorded: "रक्तदाब नोंदवला गेला: १२०/८० (सामान्य)",
    appointmentBooked: "डॉ. शर्मा यांच्यासोबत भेट बुक केली गेली",
    healthReportShared: "कुटुंबासोबत आरोग्य अहवाल सामायिक केला गेला",
    hoursAgo: "२ तासांपूर्वी",
    yesterday: "काल",
    daysAgo: "२ दिवसांपूर्वी",
    
    // Voice Assistant
    listening: "ऐकत आहे...",
    youSaid: "तुम्ही म्हणालात:",
    easymedAI: "EasyMed AI:",
    
    // Voice Commands
    voiceCommands: {
      greeting: "नमस्कार! आज मी तुम्हाला कशी मदत करू शकतो?",
      goToAppointments: "भेटींकडे जात आहे...",
      checkSymptoms: "AI लक्षण तपासकर्ता उघडत आहे...",
      emergency: "१०८ आणीबाणी सेवेला कॉल करत आहे...",
      familyHealthNav: "कौटुंबिक आरोग्य विहंगावलोकन दाखवत आहे...",
      bookAppointmentNav: "भेट बुकिंग उघडत आहे...",
      healthRecords: "तुमचे आरोग्य रेकॉर्ड्स ॲक्सेस करत आहे...",
      callDoctor: "डॉ. शर्मा यांच्याशी कनेक्ट करत आहे...",
      medicationReminder: "तुमचे औषध वेळापत्रक दाखवत आहे..."
    }
  },
  
  punjabi: {
    // Header & Navigation
    welcomeBack: "ਵਾਪਸ ਜੀ ਆਇਆਂ ਨੂੰ",
    healthCompanion: "ਤੁਹਾਡਾ ਸਿਹਤ ਸਹਾਇਕ ਇੱਥੇ ਹੈ",
    
    // Health Status Cards
    heartRate: "ਦਿਲ ਦੀ ਧੜਕਣ",
    bloodPressure: "ਖੂਨ ਦਾ ਦਬਾਅ",
    nextAppointment: "ਅਗਲੀ ਮੁਲਾਕਾਤ",
    medications: "ਦਵਾਈਆਂ",
    normal: "ਸਧਾਰਣ",
    dueToday: "ਅੱਜ ਲੈਣੀਆਂ",
    today3pm: "ਅੱਜ ਦੁਪਹਿਰ 3 ਵਜੇ",
    drSharma: "ਡਾ. ਸ਼ਰਮਾ",
    
    // Quick Actions
    aiSymptomChecker: "AI ਲੱਛਣ ਜਾਂਚਕਰਤਾ",
    bookAppointment: "ਮੁਲਾਕਾਤ ਬੁੱਕ ਕਰੋ",
    emergency108: "ਐਮਰਜੈਂਸੀ (108)",
    familyHealth: "ਪਰਿਵਾਰਕ ਸਿਹਤ",
    
    // AI Health Insights
    aiHealthInsights: "🤖 AI ਸਿਹਤ ਸੂਝ",
    goodMorning: "ਸਤ ਸ੍ਰੀ ਅਕਾਲ, ਰਾਜੇਸ਼!",
    vitalsGreat: "ਤੁਹਾਡੇ ਸਿਹਤ ਡੇਟਾ ਦੇ ਆਧਾਰ ਤੇ, ਅੱਜ ਤੁਹਾਡੇ ਜੀਵਨ ਸੰਕੇਤ ਬਹੁਤ ਵਧੀਆ ਲੱਗ ਰਹੇ ਹਨ।",
    medicationReminder: "ਦੁਪਹਿਰ 2 ਵਜੇ ਆਪਣੀ ਖੂਨ ਦਾ ਦਬਾਅ ਦੀ ਦਵਾਈ ਲੈਣਾ ਨਾ ਭੁੱਲੋ।",
    nextCheckup: "ਡਾ. ਸ਼ਰਮਾ ਨਾਲ ਤੁਹਾਡੀ ਅਗਲੀ ਜਾਂਚ 3 ਘੰਟਿਆਂ ਵਿੱਚ ਹੈ।",
    
    // Family Health
    familyHealthTitle: "👨‍👩‍👧‍👦 ਪਰਿਵਾਰਕ ਸਿਹਤ",
    wife: "ਪਤਨੀ",
    son: "ਪੁੱਤਰ",
    allVitalsNormal: "ਸਾਰੇ ਜੀਵਨ ਸੰਕੇਤ ਸਧਾਰਣ",
    vaccinationDue: "ਅਗਲੇ ਹਫ਼ਤੇ ਟੀਕਾਕਰਣ ਜ਼ਰੂਰੀ",
    
    // Recent Activity
    recentActivity: "📋 ਹਾਲ ਦੀ ਗਤੀਵਿਧੀ",
    bloodPressureRecorded: "ਖੂਨ ਦਾ ਦਬਾਅ ਰਿਕਾਰਡ ਕੀਤਾ ਗਿਆ: 120/80 (ਸਧਾਰਣ)",
    appointmentBooked: "ਡਾ. ਸ਼ਰਮਾ ਨਾਲ ਮੁਲਾਕਾਤ ਬੁੱਕ ਕੀਤੀ ਗਈ",
    healthReportShared: "ਪਰਿਵਾਰ ਨਾਲ ਸਿਹਤ ਰਿਪੋਰਟ ਸਾਂਝੀ ਕੀਤੀ ਗਈ",
    hoursAgo: "2 ਘੰਟੇ ਪਹਿਲਾਂ",
    yesterday: "ਕੱਲ੍ਹ",
    daysAgo: "2 ਦਿਨ ਪਹਿਲਾਂ",
    
    // Voice Assistant
    listening: "ਸੁਣ ਰਿਹਾ ਹੈ...",
    youSaid: "ਤੁਸੀਂ ਕਿਹਾ:",
    easymedAI: "EasyMed AI:",
    
    // Voice Commands
    voiceCommands: {
      greeting: "ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਅੱਜ ਮੈਂ ਤੁਹਾਡੀ ਕਿਵੇਂ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ?",
      goToAppointments: "ਮੁਲਾਕਾਤਾਂ ਵੱਲ ਜਾ ਰਿਹਾ ਹਾਂ...",
      checkSymptoms: "AI ਲੱਛਣ ਜਾਂਚਕਰਤਾ ਖੋਲ੍ਹ ਰਿਹਾ ਹਾਂ...",
      emergency: "108 ਐਮਰਜੈਂਸੀ ਸੇਵਾਵਾਂ ਨੂੰ ਕਾਲ ਕਰ ਰਿਹਾ ਹਾਂ...",
      familyHealthNav: "ਪਰਿਵਾਰਕ ਸਿਹਤ ਸੰਖੇਪ ਦਿਖਾ ਰਿਹਾ ਹਾਂ...",
      bookAppointmentNav: "ਮੁਲਾਕਾਤ ਬੁਕਿੰਗ ਖੋਲ੍ਹ ਰਿਹਾ ਹਾਂ...",
      healthRecords: "ਤੁਹਾਡੇ ਸਿਹਤ ਰਿਕਾਰਡ ਐਕਸੈਸ ਕਰ ਰਿਹਾ ਹਾਂ...",
      callDoctor: "ਡਾ. ਸ਼ਰਮਾ ਨਾਲ ਜੋੜ ਰਿਹਾ ਹਾਂ...",
      medicationReminder: "ਤੁਹਾਡਾ ਦਵਾਈ ਸਮਾਂ-ਸਾਰਣੀ ਦਿਖਾ ਰਿਹਾ ਹਾਂ..."
    }
  }
} as const;

export type LanguageKey = keyof typeof translations;
export type TranslationKey = keyof typeof translations.english;
