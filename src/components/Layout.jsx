import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useTrello } from '../contexts/TrelloContext';

const { FiHome, FiPlus, FiSettings, FiClock, FiTrello } = FiIcons;

const Layout = ({ children }) => {
  const location = useLocation();
  const { connected } = useTrello();

  const navItems = [
    { path: '/', icon: FiHome, label: 'Dashboard' },
    { path: '/create', icon: FiPlus, label: 'Create Card' },
    { path: '/history', icon: FiClock, label: 'History' },
    { path: '/settings', icon: FiSettings, label: 'Settings' }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <SafeIcon icon={FiTrello} className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">DIFY Trello</h1>
              <p className="text-sm text-gray-500">Plugin Interface</p>
            </div>
          </div>
          
          {/* Connection Status */}
          <div className="mt-4 p-3 rounded-lg bg-gray-50">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm font-medium text-gray-700">
                {connected ? 'Connected' : 'Not Connected'}
              </span>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <SafeIcon icon={item.icon} className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;