import React from 'react';
import { Link } from 'react-router-dom';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useTrello } from '../contexts/TrelloContext';

const { FiPlus, FiSettings, FiClock, FiTrello } = FiIcons;

const QuickActions = () => {
  const { connected, boards } = useTrello();

  const actions = [
    {
      title: 'Create Card',
      description: 'Create a new Trello card from AI content',
      icon: FiPlus,
      to: '/create',
      color: 'blue',
      enabled: connected
    },
    {
      title: 'View History',
      description: 'See all previously created cards',
      icon: FiClock,
      to: '/history',
      color: 'purple',
      enabled: true
    },
    {
      title: 'Open Trello',
      description: 'Visit Trello in a new tab',
      icon: FiTrello,
      href: 'https://trello.com',
      color: 'green',
      enabled: true,
      external: true
    },
    {
      title: 'Settings',
      description: 'Configure your Trello connection',
      icon: FiSettings,
      to: '/settings',
      color: 'gray',
      enabled: true
    }
  ];

  const colorClasses = {
    blue: 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700',
    purple: 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700',
    green: 'bg-green-50 hover:bg-green-100 border-green-200 text-green-700',
    gray: 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action) => {
          const Component = action.external ? 'a' : Link;
          const props = action.external 
            ? { href: action.href, target: '_blank', rel: 'noopener noreferrer' }
            : { to: action.to };

          return (
            <Component
              key={action.title}
              {...props}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                action.enabled 
                  ? `${colorClasses[action.color]} hover:shadow-md` 
                  : 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center space-x-3">
                <SafeIcon 
                  icon={action.icon} 
                  className="w-6 h-6" 
                />
                <div>
                  <h3 className="font-semibold text-sm">{action.title}</h3>
                  <p className="text-xs opacity-75 mt-1">{action.description}</p>
                </div>
              </div>
            </Component>
          );
        })}
      </div>

      {!connected && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-700">
            Connect to Trello to enable card creation features.
          </p>
        </div>
      )}
    </div>
  );
};

export default QuickActions;