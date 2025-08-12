/**
 * Firebase User Management Service for Admin Panel
 * Provides CRUD operations for managing users in Firebase Realtime Database
 */

import { getDatabase, ref, push, set, get, update, remove, onValue, off } from 'firebase/database';
import { app } from './firebaseConfig';

interface User {
  id?: string;
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
  permissions?: string[];
  profile?: {
    age?: number;
    gender?: string;
    bloodGroup?: string;
    address?: string;
    emergencyContact?: string;
  };
}

interface AdminUser {
  id?: string;
  name: string;
  phone: string;
  email?: string;
  designation: string;
  role: 'super_admin' | 'admin' | 'manager' | 'coordinator';
  permissions: string[];
  createdAt: Date;
  isActive: boolean;
}

class FirebaseUserManagement {
  private db;
  private usersRef;
  private adminsRef;

  constructor() {
    this.db = getDatabase(app);
    this.usersRef = ref(this.db, 'users');
    this.adminsRef = ref(this.db, 'admins');
  }

  // ==================== USER MANAGEMENT ====================

  /**
   * Add a new user to the system
   */
  async addUser(userData: Omit<User, 'id' | 'createdAt'>): Promise<{ success: boolean; data?: User; error?: string }> {
    try {
      const newUserRef = push(this.usersRef);
      const userId = newUserRef.key;
      
      if (!userId) {
        throw new Error('Failed to generate user ID');
      }

      const newUser: User = {
        ...userData,
        id: userId,
        createdAt: new Date(),
        isActive: userData.isActive ?? true
      };

      await set(newUserRef, {
        ...newUser,
        createdAt: newUser.createdAt.toISOString(),
        lastActive: newUser.lastActive?.toISOString() || null
      });

      return { success: true, data: newUser };
    } catch (error) {
      console.error('Error adding user:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get all users from the system
   */
  async getAllUsers(): Promise<{ success: boolean; data?: User[]; error?: string }> {
    try {
      const snapshot = await get(this.usersRef);
      
      if (!snapshot.exists()) {
        return { success: true, data: [] };
      }

      const usersData = snapshot.val();
      const users: User[] = Object.entries(usersData).map(([id, userData]: [string, any]) => ({
        ...userData,
        id,
        createdAt: new Date(userData.createdAt),
        lastActive: userData.lastActive ? new Date(userData.lastActive) : undefined
      }));

      return { success: true, data: users };
    } catch (error) {
      console.error('Error fetching users:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get users by type
   */
  async getUsersByType(userType: User['userType']): Promise<{ success: boolean; data?: User[]; error?: string }> {
    try {
      const result = await this.getAllUsers();
      if (!result.success || !result.data) {
        return result;
      }

      const filteredUsers = result.data.filter(user => user.userType === userType);
      return { success: true, data: filteredUsers };
    } catch (error) {
      console.error('Error fetching users by type:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<{ success: boolean; data?: User; error?: string }> {
    try {
      const userRef = ref(this.db, `users/${userId}`);
      const snapshot = await get(userRef);

      if (!snapshot.exists()) {
        return { success: false, error: 'User not found' };
      }

      const userData = snapshot.val();
      const user: User = {
        ...userData,
        id: userId,
        createdAt: new Date(userData.createdAt),
        lastActive: userData.lastActive ? new Date(userData.lastActive) : undefined
      };

      return { success: true, data: user };
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Update user information
   */
  async updateUser(userId: string, updates: Partial<User>): Promise<{ success: boolean; error?: string }> {
    try {
      const userRef = ref(this.db, `users/${userId}`);
      
      // Convert dates to ISO strings for Firebase
      const updateData = {
        ...updates,
        lastActive: updates.lastActive?.toISOString() || null
      };

      await update(userRef, updateData);
      return { success: true };
    } catch (error) {
      console.error('Error updating user:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Delete user from the system
   */
  async deleteUser(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const userRef = ref(this.db, `users/${userId}`);
      await remove(userRef);
      return { success: true };
    } catch (error) {
      console.error('Error deleting user:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Search users by name, phone, or email
   */
  async searchUsers(searchTerm: string): Promise<{ success: boolean; data?: User[]; error?: string }> {
    try {
      const result = await this.getAllUsers();
      if (!result.success || !result.data) {
        return result;
      }

      const searchLower = searchTerm.toLowerCase();
      const filteredUsers = result.data.filter(user =>
        user.name.toLowerCase().includes(searchLower) ||
        user.phone.includes(searchTerm) ||
        (user.email && user.email.toLowerCase().includes(searchLower))
      );

      return { success: true, data: filteredUsers };
    } catch (error) {
      console.error('Error searching users:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Toggle user active status
   */
  async toggleUserStatus(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const userResult = await this.getUserById(userId);
      if (!userResult.success || !userResult.data) {
        return { success: false, error: 'User not found' };
      }

      return await this.updateUser(userId, { isActive: !userResult.data.isActive });
    } catch (error) {
      console.error('Error toggling user status:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // ==================== ADMIN MANAGEMENT ====================

  /**
   * Add a new admin user
   */
  async addAdmin(adminData: Omit<AdminUser, 'id' | 'createdAt'>): Promise<{ success: boolean; data?: AdminUser; error?: string }> {
    try {
      const newAdminRef = push(this.adminsRef);
      const adminId = newAdminRef.key;
      
      if (!adminId) {
        throw new Error('Failed to generate admin ID');
      }

      const newAdmin: AdminUser = {
        ...adminData,
        id: adminId,
        createdAt: new Date(),
        isActive: adminData.isActive ?? true
      };

      await set(newAdminRef, {
        ...newAdmin,
        createdAt: newAdmin.createdAt.toISOString()
      });

      return { success: true, data: newAdmin };
    } catch (error) {
      console.error('Error adding admin:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get all admin users
   */
  async getAllAdmins(): Promise<{ success: boolean; data?: AdminUser[]; error?: string }> {
    try {
      const snapshot = await get(this.adminsRef);
      
      if (!snapshot.exists()) {
        return { success: true, data: [] };
      }

      const adminsData = snapshot.val();
      const admins: AdminUser[] = Object.entries(adminsData).map(([id, adminData]: [string, any]) => ({
        ...adminData,
        id,
        createdAt: new Date(adminData.createdAt)
      }));

      return { success: true, data: admins };
    } catch (error) {
      console.error('Error fetching admins:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // ==================== REAL-TIME LISTENERS ====================

  /**
   * Listen for real-time user updates
   */
  onUsersChange(callback: (users: User[]) => void): () => void {
    const unsubscribe = onValue(this.usersRef, (snapshot) => {
      if (snapshot.exists()) {
        const usersData = snapshot.val();
        const users: User[] = Object.entries(usersData).map(([id, userData]: [string, any]) => ({
          ...userData,
          id,
          createdAt: new Date(userData.createdAt),
          lastActive: userData.lastActive ? new Date(userData.lastActive) : undefined
        }));
        callback(users);
      } else {
        callback([]);
      }
    });

    // Return unsubscribe function
    return () => off(this.usersRef, 'value', unsubscribe);
  }

  /**
   * Listen for real-time admin updates
   */
  onAdminsChange(callback: (admins: AdminUser[]) => void): () => void {
    const unsubscribe = onValue(this.adminsRef, (snapshot) => {
      if (snapshot.exists()) {
        const adminsData = snapshot.val();
        const admins: AdminUser[] = Object.entries(adminsData).map(([id, adminData]: [string, any]) => ({
          ...adminData,
          id,
          createdAt: new Date(adminData.createdAt)
        }));
        callback(admins);
      } else {
        callback([]);
      }
    });

    // Return unsubscribe function
    return () => off(this.adminsRef, 'value', unsubscribe);
  }

  // ==================== ANALYTICS ====================

  /**
   * Get user statistics
   */
  async getUserStats(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const result = await this.getAllUsers();
      if (!result.success || !result.data) {
        return result;
      }

      const users = result.data;
      const stats = {
        total: users.length,
        active: users.filter(u => u.isActive).length,
        inactive: users.filter(u => !u.isActive).length,
        byType: {
          patients: users.filter(u => u.userType === 'patient').length,
          doctors: users.filter(u => u.userType === 'doctor').length,
          asha: users.filter(u => u.userType === 'asha').length,
          admins: users.filter(u => u.userType === 'admin').length
        },
        recentlyActive: users.filter(u => {
          if (!u.lastActive) return false;
          const dayAgo = new Date();
          dayAgo.setDate(dayAgo.getDate() - 1);
          return u.lastActive > dayAgo;
        }).length,
        newThisMonth: users.filter(u => {
          const monthAgo = new Date();
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return u.createdAt > monthAgo;
        }).length
      };

      return { success: true, data: stats };
    } catch (error) {
      console.error('Error getting user stats:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // ==================== BULK OPERATIONS ====================

  /**
   * Bulk update user status
   */
  async bulkUpdateUserStatus(userIds: string[], isActive: boolean): Promise<{ success: boolean; error?: string }> {
    try {
      const updates: { [key: string]: any } = {};
      
      userIds.forEach(userId => {
        updates[`users/${userId}/isActive`] = isActive;
      });

      await update(ref(this.db), updates);
      return { success: true };
    } catch (error) {
      console.error('Error bulk updating user status:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Bulk delete users
   */
  async bulkDeleteUsers(userIds: string[]): Promise<{ success: boolean; error?: string }> {
    try {
      const updates: { [key: string]: any } = {};
      
      userIds.forEach(userId => {
        updates[`users/${userId}`] = null;
      });

      await update(ref(this.db), updates);
      return { success: true };
    } catch (error) {
      console.error('Error bulk deleting users:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

// Export singleton instance
export const firebaseUserManagement = new FirebaseUserManagement();
export default firebaseUserManagement;