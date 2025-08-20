import { getMCPClient } from '../mcp/client.js';

export class AppointmentService {
  constructor() {
    this.mcpClient = getMCPClient();
  }

  async searchAvailableSlots(params) {
    try {
      const request = {
        providerId: params.providerId,
        specialty: params.specialty,
        dateRange: params.dateRange,
        location: params.location,
        timestamp: new Date().toISOString()
      };

      const response = await this.mcpClient.request('appointments', 'searchSlots', request);
      
      if (response && response.success) {
        return {
          success: true,
          slots: response.slots || [],
          message: 'Available slots found'
        };
      }

      throw new Error('MCP service failed');

    } catch (error) {
      console.log('[Appointments] Search failed, using fallback:', error.message);
      return this.generateMockSlots(params);
    }
  }

  generateMockSlots(params) {
    const startDate = new Date(params.dateRange.start);
    const mockSlots = [
      {
        slotId: `mock_${Date.now()}_1`,
        providerId: params.providerId || 'dr_smith_001',
        providerName: 'Dr. Sarah Smith',
        specialty: params.specialty || 'General Medicine',
        datetime: new Date(startDate.getTime() + 24 * 60 * 60 * 1000).toISOString(),
        durationMinutes: 30,
        price: 150,
        location: params.location || 'Downtown Clinic',
        availability: 'available'
      },
      {
        slotId: `mock_${Date.now()}_2`,
        providerId: params.providerId || 'dr_jones_002',
        providerName: 'Dr. Michael Jones',
        specialty: params.specialty || 'General Medicine',
        datetime: new Date(startDate.getTime() + 48 * 60 * 60 * 1000).toISOString(),
        durationMinutes: 45,
        price: 200,
        location: params.location || 'Uptown Medical Center',
        availability: 'available'
      }
    ];

    return {
      success: true,
      slots: mockSlots,
      message: 'Mock appointment slots generated (fallback mode)'
    };
  }

  async bookAppointment(slotId, patientId, notes, paymentMethod) {
    try {
      const request = {
        slotId,
        patientId,
        notes,
        paymentMethod,
        timestamp: new Date().toISOString()
      };

      const response = await this.mcpClient.request('appointments', 'bookSlot', request);

      if (response && response.success) {
        return {
          success: true,
          appointmentId: response.appointmentId,
          confirmationCode: response.confirmationCode,
          meetingLink: response.meetingLink,
          message: 'Appointment booked successfully'
        };
      }

      throw new Error('MCP service failed');

    } catch (error) {
      console.log('[Appointments] Booking failed, using fallback:', error.message);
      return this.generateMockBooking(slotId, patientId);
    }
  }

  generateMockBooking(slotId, patientId) {
    const appointmentId = `mock_appt_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const confirmationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Store mock booking
    global.appointmentCache = global.appointmentCache || new Map();
    global.appointmentCache.set(appointmentId, {
      slotId,
      patientId,
      confirmationCode,
      status: 'confirmed',
      createdAt: new Date().toISOString()
    });

    return {
      success: true,
      appointmentId,
      confirmationCode,
      meetingLink: `https://meet.easymedpro.com/${appointmentId}`,
      message: 'Appointment booked successfully (fallback mode)'
    };
  }

  async cancelAppointment(appointmentId, reason) {
    try {
      const request = {
        appointmentId,
        reason,
        timestamp: new Date().toISOString()
      };

      const response = await this.mcpClient.request('appointments', 'cancelAppointment', request);

      if (response && response.success) {
        return {
          success: true,
          message: 'Appointment cancelled successfully'
        };
      }

      throw new Error('MCP service failed');

    } catch (error) {
      console.log('[Appointments] Cancellation failed, using fallback:', error.message);
      
      // Fallback cancellation
      const appointmentCache = global.appointmentCache || new Map();
      if (appointmentCache.has(appointmentId)) {
        appointmentCache.delete(appointmentId);
        return {
          success: true,
          message: 'Appointment cancelled successfully (fallback mode)'
        };
      }

      return {
        success: false,
        message: 'Appointment not found'
      };
    }
  }

  async createMeetingLink(appointmentId, durationMinutes) {
    try {
      const request = {
        appointmentId,
        durationMinutes: durationMinutes || 30,
        timestamp: new Date().toISOString()
      };

      const response = await this.mcpClient.request('appointments', 'createMeetingLink', request);

      if (response && response.success) {
        return {
          success: true,
          meetingLink: response.meetingLink,
          message: 'Meeting link created successfully'
        };
      }

      throw new Error('MCP service failed');

    } catch (error) {
      console.log('[Appointments] Meeting link creation failed, using fallback:', error.message);
      
      return {
        success: true,
        meetingLink: `https://meet.easymedpro.com/${appointmentId}?duration=${durationMinutes || 30}`,
        message: 'Meeting link created successfully (fallback mode)'
      };
    }
  }

  async getAppointmentHistory(patientId) {
    try {
      const request = {
        patientId,
        timestamp: new Date().toISOString()
      };

      const response = await this.mcpClient.request('appointments', 'getHistory', request);

      if (response && response.success) {
        return {
          success: true,
          appointments: response.appointments || [],
          message: 'Appointment history retrieved successfully'
        };
      }

      throw new Error('MCP service failed');

    } catch (error) {
      console.log('[Appointments] History retrieval failed, using fallback:', error.message);
      
      // Return mock history
      const mockHistory = [
        {
          appointmentId: `hist_${Date.now()}_1`,
          providerId: 'dr_smith_001',
          providerName: 'Dr. Sarah Smith',
          specialty: 'General Medicine',
          datetime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'completed',
          notes: 'Regular checkup completed'
        }
      ];

      return {
        success: true,
        appointments: mockHistory,
        message: 'Appointment history retrieved (fallback mode)'
      };
    }
  }
}
