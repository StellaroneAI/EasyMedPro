import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  // Basic appointment information
  appointmentId: {
    type: String,
    unique: true,
    required: true
  },
  
  // Related users
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ashaWorker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Appointment details
  type: {
    type: String,
    required: true,
    enum: ['video-consultation', 'in-person', 'phone-consultation', 'home-visit']
  },
  status: {
    type: String,
    required: true,
    enum: ['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled'
  },
  
  // Scheduling
  scheduledDate: {
    type: Date,
    required: true
  },
  scheduledTime: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    default: 30 // minutes
  },
  
  // Medical information
  chiefComplaint: String,
  symptoms: [String],
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high', 'emergency'],
    default: 'medium'
  },
  
  // Consultation details
  notes: String,
  diagnosis: String,
  prescription: [{
    medicine: String,
    dosage: String,
    frequency: String,
    duration: String,
    instructions: String
  }],
  
  // Follow-up
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpDate: Date,
  
  // Communication
  meetingLink: String, // For video consultations
  meetingId: String,
  
  // Fees and payment
  consultationFee: {
    type: Number,
    default: 0
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentId: String,
  
  // Ratings and feedback
  patientRating: {
    type: Number,
    min: 1,
    max: 5
  },
  patientFeedback: String,
  doctorNotes: String
}, {
  timestamps: true
});

// Indexes
appointmentSchema.index({ appointmentId: 1 });
appointmentSchema.index({ patient: 1 });
appointmentSchema.index({ doctor: 1 });
appointmentSchema.index({ scheduledDate: 1 });
appointmentSchema.index({ status: 1 });

// Pre-save middleware to generate appointmentId
appointmentSchema.pre('save', async function(next) {
  if (!this.appointmentId) {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const timeStr = Date.now().toString().slice(-6);
    this.appointmentId = `APT${dateStr}${timeStr}`;
  }
  next();
});

const Appointment = mongoose.model('Appointment', appointmentSchema);

export default Appointment;