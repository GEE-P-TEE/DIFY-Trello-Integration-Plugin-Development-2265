import React from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiWifi, FiWifiOff, FiAlertTriangle } = FiIcons;

const ConnectionStatus = ({ connected, loading, error }) => {
  if (loading) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2 bg-yellow-50 rounded-lg border border-yellow-200">
        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
        <span className="text-sm font-medium text-yellow-700">Connecting...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2 bg-red-50 rounded-lg border border-red-200">
        <SafeIcon icon={FiAlertTriangle} className="w-4 h-4 text-red-600" />
        <span className="text-sm font-medium text-red-700">Connection Error</span>
      </div>
    );
  }

  if (connected) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2 bg-green-50 rounded-lg border border-green-200">
        <SafeIcon icon={FiWifi} className="w-4 h-4 text-green-600" />
        <span className="text-sm font-medium text-green-700">Connected</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
      <SafeIcon icon={FiWifiOff} className="w-4 h-4 text-gray-600" />
      <span className="text-sm font-medium text-gray-700">Not Connected</span>
    </div>
  );
};

export default ConnectionStatus;