import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useTrello } from '../contexts/TrelloContext';
import StatsCard from '../components/StatsCard';
import RecentActivity from '../components/RecentActivity';
import QuickActions from '../components/QuickActions';

const { FiPlus, FiSettings, FiAlertCircle, FiCheckCircle } = FiIcons;

const Dashboard = () => {
  const { connected, boards, cardHistory, credentials } = useTrello();

  const stats = {
    totalBoards: boards.length,
    totalCards: cardHistory.length,
    successfulCards: cardHistory.filter(card => card.status === 'success').length,
    failedCards: cardHistory.filter(card => card.status === 'failed').length
  };

  if (!connected && !credentials) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <SafeIcon icon={FiSettings} className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to DIFY Trello Plugin</h2>
          <p className="text-gray-600 mb-6">Connect your Trello account to get started</p>
          <Link
            to="/settings"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <SafeIcon icon={FiSettings} className="w-5 h-5 mr-2" />
            Configure Trello
          </Link>
        </div>
      </div>
    );
  }

  if (!connected && credentials) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <SafeIcon icon={FiAlertCircle} className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Connection Failed</h2>
          <p className="text-gray-600 mb-6">Please check your Trello credentials</p>
          <Link
            to="/settings"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <SafeIcon icon={FiSettings} className="w-5 h-5 mr-2" />
            Update Settings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Overview of your Trello integration</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2 px-3 py-2 bg-green-50 rounded-lg border border-green-200">
            <SafeIcon icon={FiCheckCircle} className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-700">Connected</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Boards"
          value={stats.totalBoards}
          icon={FiSettings}
          color="blue"
        />
        <StatsCard
          title="Cards Created"
          value={stats.totalCards}
          icon={FiPlus}
          color="green"
        />
        <StatsCard
          title="Successful"
          value={stats.successfulCards}
          icon={FiCheckCircle}
          color="emerald"
        />
        <StatsCard
          title="Failed"
          value={stats.failedCards}
          icon={FiAlertCircle}
          color="red"
        />
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Recent Activity */}
      <RecentActivity />
    </div>
  );
};

export default Dashboard;