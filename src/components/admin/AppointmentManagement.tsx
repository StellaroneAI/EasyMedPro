import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../contexts/AdminContext';

interface Appointment {
  id: string;
  patientName: string;
  patientPhone: string;
  doctorName: string;
  doctorSpecialization: string;
  appointmentDate: Date;
  appointmentTime: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  type: 'consultation' | 'follow-up' | 'emergency' | 'telemedicine';
  location: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function AppointmentManagement() {
  const { checkPermission } = useAdmin();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Mock appointment data
  useEffect(() => {
    const mockAppointments: Appointment[] = [
      {
        id: '1',
        patientName: 'Rajesh Kumar',
        patientPhone: '9876543210',
        doctorName: 'Dr. Priya Sharma',
        doctorSpecialization: 'Cardiology',
        appointmentDate: new Date('2024-12-16'),
        appointmentTime: '10:00 AM',
        status: 'scheduled',
        type: 'consultation',
        location: 'Clinic A, Room 101',
        notes: 'Regular checkup for heart condition',
        createdAt: new Date('2024-12-10'),
        updatedAt: new Date('2024-12-10')
      },
      {
        id: '2',
        patientName: 'Sunita Devi',
        patientPhone: '9876543211',
        doctorName: 'Dr. Amit Patel',
        doctorSpecialization: 'General Medicine',
        appointmentDate: new Date('2024-12-16'),
        appointmentTime: '2:30 PM',
        status: 'completed',
        type: 'follow-up',
        location: 'Telemedicine',
        notes: 'Follow-up for diabetes management',
        createdAt: new Date('2024-12-08'),
        updatedAt: new Date('2024-12-15')
      },
      {
        id: '3',
        patientName: 'Mohammad Ali',
        patientPhone: '9876543212',
        doctorName: 'Dr. Sarah Johnson',
        doctorSpecialization: 'Emergency Medicine',
        appointmentDate: new Date('2024-12-15'),
        appointmentTime: '11:45 AM',
        status: 'cancelled',
        type: 'emergency',
        location: 'Emergency Department',
        notes: 'Patient recovered, cancelled appointment',
        createdAt: new Date('2024-12-14'),
        updatedAt: new Date('2024-12-15')
      }
    ];
    
    setAppointments(mockAppointments);
    setFilteredAppointments(mockAppointments);
  }, []);

  // Filter appointments
  useEffect(() => {
    let filtered = appointments;
    
    if (selectedDate) {
      const filterDate = new Date(selectedDate);
      filtered = filtered.filter(apt => 
        apt.appointmentDate.toDateString() === filterDate.toDateString()
      );
    }
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(apt => apt.status === filterStatus);
    }
    
    if (filterType !== 'all') {
      filtered = filtered.filter(apt => apt.type === filterType);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(apt =>
        apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.patientPhone.includes(searchTerm)
      );
    }
    
    setFilteredAppointments(filtered);
  }, [appointments, selectedDate, filterStatus, filterType, searchTerm]);

  const handleStatusChange = async (appointmentId: string, newStatus: Appointment['status']) => {
    if (!checkPermission('manage_appointments')) {
      alert('You do not have permission to modify appointments');
      return;
    }

    setIsLoading(true);
    try {
      setAppointments(prev => prev.map(apt => 
        apt.id === appointmentId 
          ? { ...apt, status: newStatus, updatedAt: new Date() }
          : apt
      ));
      
      // In real app, update Firebase/database here
      console.log('Appointment status updated:', appointmentId, newStatus);
    } catch (error) {
      console.error('Error updating appointment:', error);
      alert('Failed to update appointment status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReschedule = async (appointmentId: string, newDate: Date, newTime: string) => {
    if (!checkPermission('manage_appointments')) {
      alert('You do not have permission to reschedule appointments');
      return;
    }

    setIsLoading(true);
    try {
      setAppointments(prev => prev.map(apt => 
        apt.id === appointmentId 
          ? { 
              ...apt, 
              appointmentDate: newDate, 
              appointmentTime: newTime,
              updatedAt: new Date() 
            }
          : apt
      ));
      
      // In real app, update Firebase/database here
      console.log('Appointment rescheduled:', appointmentId);
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      alert('Failed to reschedule appointment');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no-show': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'consultation': return '🩺';
      case 'follow-up': return '🔄';
      case 'emergency': return '🚨';
      case 'telemedicine': return '💻';
      default: return '📅';
    }
  };

  const getTodayStats = () => {
    const today = new Date().toDateString();
    const todayAppointments = appointments.filter(apt => 
      apt.appointmentDate.toDateString() === today
    );
    
    return {
      total: todayAppointments.length,
      scheduled: todayAppointments.filter(apt => apt.status === 'scheduled').length,
      completed: todayAppointments.filter(apt => apt.status === 'completed').length,
      cancelled: todayAppointments.filter(apt => apt.status === 'cancelled').length
    };
  };

  const todayStats = getTodayStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Appointment Management</h2>
          <p className="text-gray-600">Manage and monitor all appointments in the system</p>
        </div>
        {checkPermission('manage_appointments') && (
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <span>➕</span>
            <span>Schedule Appointment</span>
          </button>
        )}
      </div>

      {/* Today's Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Today's Total</p>
              <p className="text-2xl font-bold text-gray-900">{todayStats.total}</p>
            </div>
            <span className="text-2xl">📅</span>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Scheduled</p>
              <p className="text-2xl font-bold text-blue-600">{todayStats.scheduled}</p>
            </div>
            <span className="text-2xl">⏰</span>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{todayStats.completed}</p>
            </div>
            <span className="text-2xl">✅</span>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Cancelled</p>
              <p className="text-2xl font-bold text-red-600">{todayStats.cancelled}</p>
            </div>
            <span className="text-2xl">❌</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no-show">No Show</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="consultation">Consultation</option>
              <option value="follow-up">Follow-up</option>
              <option value="emergency">Emergency</option>
              <option value="telemedicine">Telemedicine</option>
            </select>
          </div>
          
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              placeholder="Search patient, doctor, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Appointment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Doctor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAppointments.map((appointment) => (
                <tr key={appointment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{getTypeIcon(appointment.type)}</span>
                      <div>
                        <div className="text-sm font-medium text-gray-900 capitalize">
                          {appointment.type}
                        </div>
                        <div className="text-sm text-gray-500">{appointment.location}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {appointment.patientName}
                      </div>
                      <div className="text-sm text-gray-500">{appointment.patientPhone}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {appointment.doctorName}
                      </div>
                      <div className="text-sm text-gray-500">{appointment.doctorSpecialization}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {appointment.appointmentDate.toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">{appointment.appointmentTime}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                      {appointment.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {checkPermission('manage_appointments') && (
                      <div className="flex items-center space-x-2">
                        <select
                          value={appointment.status}
                          onChange={(e) => handleStatusChange(appointment.id, e.target.value as Appointment['status'])}
                          className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          disabled={isLoading}
                        >
                          <option value="scheduled">Scheduled</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="no-show">No Show</option>
                        </select>
                        
                        <button
                          onClick={() => {
                            setSelectedAppointment(appointment);
                            setShowEditModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit appointment"
                        >
                          ✏️
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredAppointments.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">No appointments found for the selected criteria</div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">📊 Analytics</h3>
          <p className="text-sm text-blue-700 mb-3">
            View detailed appointment statistics and trends
          </p>
          <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
            View Analytics →
          </button>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-900 mb-2">📋 Reports</h3>
          <p className="text-sm text-green-700 mb-3">
            Generate appointment reports for analysis
          </p>
          <button className="text-green-600 hover:text-green-800 font-medium text-sm">
            Generate Report →
          </button>
        </div>
        
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h3 className="font-semibold text-purple-900 mb-2">⚙️ Settings</h3>
          <p className="text-sm text-purple-700 mb-3">
            Configure appointment scheduling settings
          </p>
          <button className="text-purple-600 hover:text-purple-800 font-medium text-sm">
            Open Settings →
          </button>
        </div>
      </div>

      {/* Modals would go here - simplified for now */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4">Schedule New Appointment</h3>
            <p className="text-gray-600 mb-4">
              Appointment scheduling form would be implemented here with full patient/doctor selection,
              date/time picker, and appointment type selection.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4">Edit Appointment</h3>
            <p className="text-gray-600 mb-4">
              Appointment editing form would be implemented here with reschedule options,
              note updates, and status changes.
            </p>
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <p className="text-sm"><strong>Patient:</strong> {selectedAppointment.patientName}</p>
              <p className="text-sm"><strong>Doctor:</strong> {selectedAppointment.doctorName}</p>
              <p className="text-sm"><strong>Current Date:</strong> {selectedAppointment.appointmentDate.toLocaleDateString()}</p>
              <p className="text-sm"><strong>Current Time:</strong> {selectedAppointment.appointmentTime}</p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedAppointment(null);
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}