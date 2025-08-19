import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken, authorizeUserTypes } from '../middleware/auth.js';
import Appointment from '../models/Appointment.js';
import {
  bookAppointment,
  findAppointmentById,
  updateAppointmentDetails,
  removeAppointment,
  listAllAppointments
} from '../services/appointmentService.firebase.js';
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

    const appointment = {
      patient: req.user.userId,
      doctor: doctorId,
      ashaWorker: ashaWorkerId,
      scheduledDate: new Date(scheduledDate),
      scheduledTime,
      type,
      chiefComplaint,
      symptoms: symptoms || [],
      urgency
    };
    const result = await bookAppointment(appointment);
    res.json({ success: true, appointment: result });
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
    const filter = {
      userId: req.user.userId,
      userType: req.user.userType,
      status,
      page: parseInt(page),
      limit: parseInt(limit)
    };
    const result = await listAllAppointments(filter);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get appointment by ID
router.get('/:appointmentId', authenticateToken, async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const appointment = await findAppointmentById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }
    // Access control should be handled in service or here as needed
    res.json({ success: true, appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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
    const update = { status, notes };
    const appointment = await updateAppointmentDetails(appointmentId, update);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }
    res.json({ success: true, message: 'Appointment status updated successfully', appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all appointments (admin only)
router.get('/', authenticateToken, authorizeUserTypes('admin'), async (req, res) => {
  try {
    const { status, doctorId, page = 1, limit = 10 } = req.query;
    const filter = {
      status,
      doctorId,
      page: parseInt(page),
      limit: parseInt(limit)
    };
    const result = await listAllAppointments(filter);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;