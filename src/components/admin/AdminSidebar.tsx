import React from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import { useLanguage } from '../../contexts/LanguageContext';

interface AdminSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export default function AdminSidebar({ activeSection, onSectionChange }: AdminSidebarProps) {
  const { currentAdmin, isSuperAdmin } = useAdmin();
  const { t } = useLanguage();

  const adminSections = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: '📊',
      description: 'Overview & Analytics'
    },
    {
      id: 'users',
      name: 'User Management',
      icon: '👥',
      description: 'Manage All Users'
    },
    {
      id: 'appointments',
      name: 'Appointments',
      icon: '📅',
      description: 'Manage Appointments'
    },
    {
      id: 'healthcare',
      name: 'Healthcare Providers',
      icon: '🏥',
      description: 'Manage Clinics & Doctors'
    },
    {
      id: 'emergency',
      name: 'Emergency Services',
      icon: '🚨',
      description: 'Emergency Management'
    },
    {
      id: 'analytics',
      name: 'Analytics',
      icon: '📈',
      description: 'System Analytics'
    },
    {
      id: 'settings',
      name: 'System Settings',
      icon: '⚙️',
      description: 'Configuration'
    },
    {
      id: 'security',
      name: 'Security & Audit',
      icon: '🔒',
      description: 'Security Management',
      superAdminOnly: true
    }
  ];

  const filteredSections = adminSections.filter(section => 
    !section.superAdminOnly || isSuperAdmin
  );

  return (
    <div className="w-64 bg-gradient-to-b from-blue-900 to-blue-800 text-white min-h-screen shadow-xl">
      {/* Admin Profile Section */}
      <div className="p-6 border-b border-blue-700">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center font-bold text-lg">
            {currentAdmin?.name?.charAt(0) || 'A'}
          </div>
          <div>
            <h3 className="font-semibold text-lg">{currentAdmin?.name}</h3>
            <p className="text-blue-200 text-sm">
              {isSuperAdmin ? 'Super Administrator' : currentAdmin?.designation}
            </p>
          </div>
        </div>
        {isSuperAdmin && (
          <div className="mt-3 px-3 py-1 bg-yellow-500 bg-opacity-20 rounded-full">
            <span className="text-yellow-300 text-xs font-medium">SUPER ADMIN ACCESS</span>
          </div>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="mt-6">
        <div className="px-4 mb-4">
          <h4 className="text-blue-300 text-xs font-semibold uppercase tracking-wider">
            Administration
          </h4>
        </div>
        
        {filteredSections.map((section) => (
          <button
            key={section.id}
            onClick={() => onSectionChange(section.id)}
            className={`w-full text-left px-6 py-3 transition-all duration-200 hover:bg-blue-700 border-l-4 ${
              activeSection === section.id
                ? 'bg-blue-700 border-l-yellow-400 text-white'
                : 'border-l-transparent text-blue-100 hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-3">
              <span className="text-xl">{section.icon}</span>
              <div>
                <div className="font-medium">{section.name}</div>
                <div className="text-xs text-blue-300">{section.description}</div>
              </div>
            </div>
          </button>
        ))}
      </nav>

      {/* Quick Stats */}
      <div className="mt-8 px-6">
        <div className="bg-blue-800 bg-opacity-50 rounded-lg p-4">
          <h4 className="text-blue-200 text-sm font-medium mb-3">Quick Stats</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-blue-300">Active Users</span>
              <span className="text-white font-medium">1,247</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-blue-300">System Health</span>
              <span className="text-green-400 font-medium">99.2%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-blue-300">Uptime</span>
              <span className="text-blue-100 font-medium">24h</span>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="absolute bottom-6 left-6 right-6">
        <div className="bg-red-600 bg-opacity-20 border border-red-500 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <span className="text-red-400">🚨</span>
            <div>
              <div className="text-red-300 text-xs font-medium">Emergency</div>
              <div className="text-red-100 text-sm">108</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}