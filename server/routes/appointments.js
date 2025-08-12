import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken, authorizeUserTypes } from '../middleware/auth.js';
import Appointment from '../models/Appointment.js';
import User from '../models/User.js';
import twilioService from '../services/twilioService.js';

const router = express.Router();

// Validation middleware
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Create new appointment
router.post('/', authenticateToken, [
  body('doctorId').isMongoId().withMessage('Invalid doctor ID'),
  body('scheduledDate').isISO8601().withMessage('Invalid date format'),
  body('scheduledTime').notEmpty().withMessage('Time is required'),
  body('type').isIn(['video-consultation', 'in-person', 'phone-consultation', 'home-visit']).withMessage('Invalid appointment type'),
  body('chiefComplaint').optional().isLength({ max: 500 }).withMessage('Chief complaint too long')
], validateRequest, async (req, res) => {
  try {
    const {
      doctorId,
      ashaWorkerId,
      scheduledDate,
      scheduledTime,
      type,
      chiefComplaint,
      symptoms,
      urgency = 'medium'
    } = req.body;

    // Verify doctor exists
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.userType !== 'doctor') {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Verify ASHA worker if provided
    let ashaWorker = null;
    if (ashaWorkerId) {
      ashaWorker = await User.findById(ashaWorkerId);
      if (!ashaWorker || ashaWorker.userType !== 'asha') {
        return res.status(404).json({
          success: false,
          message: 'ASHA worker not found'
        });
      }
    }

    // Create appointment
    const appointment = new Appointment({
      patient: req.user.userId,
      doctor: doctorId,
      ashaWorker: ashaWorkerId,
      scheduledDate: new Date(scheduledDate),
      scheduledTime,
      type,
      chiefComplaint,
      symptoms: symptoms || [],
      urgency
    });

    await appointment.save();

    // Populate the appointment with user details
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('patient', 'name phone email')
      .populate('doctor', 'name phone email profile.specialty')
      .populate('ashaWorker', 'name phone email profile.village');

    // Send confirmation SMS to patient
    const patient = await User.findById(req.user.userId);
    await twilioService.sendAppointmentConfirmation(patient.phone, {
      doctorName: doctor.name,
      date: scheduledDate,
      time: scheduledTime,
      type
    });

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      appointment: populatedAppointment
    });
  } catch (error) {
    console.error('Appointment creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create appointment'
    });
  }
});

// Get user's appointments
router.get('/my', authenticateToken, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const query = {};
    
    // Filter by user type
    if (req.user.userType === 'patient') {
      query.patient = req.user.userId;
    } else if (req.user.userType === 'doctor') {
      query.doctor = req.user.userId;
    } else if (req.user.userType === 'asha') {
      query.ashaWorker = req.user.userId;
    }

    if (status) query.status = status;

    const appointments = await Appointment.find(query)
      .populate('patient', 'name phone email')
      .populate('doctor', 'name phone email profile.specialty')
      .populate('ashaWorker', 'name phone email profile.village')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ scheduledDate: -1 });

    const total = await Appointment.countDocuments(query);

    res.json({
      success: true,
      appointments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Appointments fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointments'
    });
  }
});

// Get appointment by ID
router.get('/:appointmentId', authenticateToken, async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const appointment = await Appointment.findById(appointmentId)
      .populate('patient', 'name phone email')
      .populate('doctor', 'name phone email profile.specialty')
      .populate('ashaWorker', 'name phone email profile.village');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if user has access to this appointment
    const hasAccess = 
      req.user.userType === 'admin' ||
      appointment.patient._id.toString() === req.user.userId.toString() ||
      appointment.doctor._id.toString() === req.user.userId.toString() ||
      (appointment.ashaWorker && appointment.ashaWorker._id.toString() === req.user.userId.toString());

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      appointment
    });
  } catch (error) {
    console.error('Appointment fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointment'
    });
  }
});

// Update appointment status
router.patch('/:appointmentId/status', authenticateToken, [
  body('status').isIn(['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show']).withMessage('Invalid status'),
  body('notes').optional().isLength({ max: 1000 }).withMessage('Notes too long')
], validateRequest, async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { status, notes } = req.body;

    const appointment = await Appointment.findById(appointmentId)
      .populate('patient', 'name phone email')
      .populate('doctor', 'name phone email');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if user has permission to update status
    const canUpdate = 
      req.user.userType === 'admin' ||
      appointment.doctor._id.toString() === req.user.userId.toString() ||
      (appointment.ashaWorker && appointment.ashaWorker._id.toString() === req.user.userId.toString());

    if (!canUpdate) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    appointment.status = status;
    if (notes) appointment.notes = notes;
    await appointment.save();

    // Send notification to patient about status change
    if (status === 'confirmed') {
      await twilioService.sendAppointmentConfirmation(appointment.patient.phone, {
        doctorName: appointment.doctor.name,
        date: appointment.scheduledDate.toISOString().split('T')[0],
        time: appointment.scheduledTime,
        type: appointment.type
      });
    }

    res.json({
      success: true,
      message: 'Appointment status updated successfully',
      appointment
    });
  } catch (error) {
    console.error('Appointment update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update appointment'
    });
  }
});

// Get all appointments (admin only)
router.get('/', authenticateToken, authorizeUserTypes('admin'), async (req, res) => {
  try {
    const { status, doctorId, page = 1, limit = 10 } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (doctorId) query.doctor = doctorId;

    const appointments = await Appointment.find(query)
      .populate('patient', 'name phone email')
      .populate('doctor', 'name phone email profile.specialty')
      .populate('ashaWorker', 'name phone email profile.village')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ scheduledDate: -1 });

    const total = await Appointment.countDocuments(query);

    res.json({
      success: true,
      appointments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('All appointments fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointments'
    });
  }
});

export default router;