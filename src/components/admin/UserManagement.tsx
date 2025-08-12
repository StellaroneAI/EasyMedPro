import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../contexts/AdminContext';

interface User {
  id: string;
  name: string;
  email?: string;
  phone: string;
  userType: 'patient' | 'asha' | 'doctor' | 'admin';
  role?: string;
  isActive: boolean;
  createdAt: Date;
  lastActive?: Date;
  location?: string;
  specialization?: string;
}

export default function UserManagement() {
  const { currentAdmin, isSuperAdmin, checkPermission } = useAdmin();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Mock user data - in real app, this would come from Firebase
  useEffect(() => {
    const mockUsers: User[] = [
      {
        id: '1',
        name: 'Rajesh Kumar',
        email: 'rajesh.kumar@email.com',
        phone: '9876543210',
        userType: 'patient',
        isActive: true,
        createdAt: new Date('2024-01-15'),
        lastActive: new Date('2024-12-15'),
        location: 'Mumbai, Maharashtra'
      },
      {
        id: '2',
        name: 'Dr. Priya Sharma',
        email: 'dr.priya@hospital.com',
        phone: '9876543211',
        userType: 'doctor',
        role: 'Cardiologist',
        specialization: 'Cardiology',
        isActive: true,
        createdAt: new Date('2024-02-20'),
        lastActive: new Date('2024-12-14'),
        location: 'Delhi'
      },
      {
        id: '3',
        name: 'Sunita Devi',
        email: 'sunita.asha@gmail.com',
        phone: '9876543212',
        userType: 'asha',
        role: 'ASHA Worker',
        isActive: true,
        createdAt: new Date('2024-03-10'),
        lastActive: new Date('2024-12-13'),
        location: 'Rural Bihar'
      },
      {
        id: '4',
        name: 'Admin User',
        email: 'admin@easymed.in',
        phone: '9876543213',
        userType: 'admin',
        role: 'Administrator',
        isActive: true,
        createdAt: new Date('2024-01-01'),
        lastActive: new Date('2024-12-15'),
        location: 'Headquarters'
      }
    ];
    
    setUsers(mockUsers);
    setFilteredUsers(mockUsers);
  }, []);

  // Filter and search users
  useEffect(() => {
    let filtered = users;
    
    if (filterType !== 'all') {
      filtered = filtered.filter(user => user.userType === filterType);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone.includes(searchTerm)
      );
    }
    
    setFilteredUsers(filtered);
  }, [users, filterType, searchTerm]);

  const handleAddUser = async (userData: Omit<User, 'id' | 'createdAt'>) => {
    if (!checkPermission('manage_users')) {
      alert('You do not have permission to add users');
      return;
    }

    setIsLoading(true);
    try {
      const newUser: User = {
        ...userData,
        id: `user_${Date.now()}`,
        createdAt: new Date()
      };
      
      setUsers(prev => [...prev, newUser]);
      setShowAddModal(false);
      
      // In real app, save to Firebase here
      console.log('User added:', newUser);
    } catch (error) {
      console.error('Error adding user:', error);
      alert('Failed to add user');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditUser = async (userId: string, updates: Partial<User>) => {
    if (!checkPermission('manage_users')) {
      alert('You do not have permission to edit users');
      return;
    }

    setIsLoading(true);
    try {
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, ...updates } : user
      ));
      setShowEditModal(false);
      setSelectedUser(null);
      
      // In real app, update Firebase here
      console.log('User updated:', userId, updates);
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!checkPermission('manage_users')) {
      alert('You do not have permission to delete users');
      return;
    }

    if (!confirm('Are you sure you want to delete this user?')) {
      return;
    }

    setIsLoading(true);
    try {
      setUsers(prev => prev.filter(user => user.id !== userId));
      
      // In real app, delete from Firebase here
      console.log('User deleted:', userId);
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUserStatus = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      await handleEditUser(userId, { isActive: !user.isActive });
    }
  };

  const getUserTypeColor = (userType: string) => {
    switch (userType) {
      case 'patient': return 'bg-blue-100 text-blue-800';
      case 'doctor': return 'bg-green-100 text-green-800';
      case 'asha': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-gray-600">Manage all users in the EasyMedPro system</p>
        </div>
        {checkPermission('manage_users') && (
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <span>➕</span>
            <span>Add User</span>
          </button>
        )}
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Users</option>
              <option value="patient">Patients</option>
              <option value="doctor">Doctors</option>
              <option value="asha">ASHA Workers</option>
              <option value="admin">Administrators</option>
            </select>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Total: {filteredUsers.length}</span>
              <span className="text-sm text-gray-600">|</span>
              <span className="text-sm text-green-600">
                Active: {filteredUsers.filter(u => u.isActive).length}
              </span>
            </div>
          </div>
          
          <div className="relative">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
            />
            <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Active
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {user.name.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.location}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getUserTypeColor(user.userType)}`}>
                      {user.userType.toUpperCase()}
                    </span>
                    {user.specialization && (
                      <div className="text-xs text-gray-500 mt-1">{user.specialization}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>{user.phone}</div>
                    {user.email && (
                      <div className="text-gray-500">{user.email}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.lastActive ? user.lastActive.toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      {checkPermission('manage_users') && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowEditModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => toggleUserStatus(user.id)}
                            className={`${user.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                          >
                            {user.isActive ? '⏸️' : '▶️'}
                          </button>
                          {isSuperAdmin && (
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              🗑️
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">No users found</div>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <UserModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddUser}
          isLoading={isLoading}
        />
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <UserModal
          user={selectedUser}
          onClose={() => {
            setShowEditModal(false);
            setSelectedUser(null);
          }}
          onSave={(userData) => handleEditUser(selectedUser.id, userData)}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}

// User Modal Component
interface UserModalProps {
  user?: User;
  onClose: () => void;
  onSave: (userData: Omit<User, 'id' | 'createdAt'>) => void;
  isLoading: boolean;
}

function UserModal({ user, onClose, onSave, isLoading }: UserModalProps) {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    userType: user?.userType || 'patient',
    role: user?.role || '',
    location: user?.location || '',
    specialization: user?.specialization || '',
    isActive: user?.isActive ?? true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      lastActive: user?.lastActive
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-screen overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">
          {user ? 'Edit User' : 'Add New User'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">User Type</label>
            <select
              value={formData.userType}
              onChange={(e) => setFormData(prev => ({ ...prev, userType: e.target.value as any }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
              <option value="asha">ASHA Worker</option>
              <option value="admin">Administrator</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {(formData.userType === 'doctor' || formData.userType === 'asha') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {formData.userType === 'doctor' ? 'Specialization' : 'Role'}
              </label>
              <input
                type="text"
                value={formData.userType === 'doctor' ? formData.specialization : formData.role}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  [formData.userType === 'doctor' ? 'specialization' : 'role']: e.target.value 
                }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
              className="mr-2"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
              Active User
            </label>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}