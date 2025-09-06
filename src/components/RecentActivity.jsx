import React from 'react';
import { Link } from 'react-router-dom';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useTrello } from '../contexts/TrelloContext';
import { formatDistance } from 'date-fns';

const { FiClock, FiCheckCircle, FiXCircle, FiExternalLink, FiArrowRight } = FiIcons;

const RecentActivity = () => {
  const { cardHistory } = useTrello();
  
  const recentCards = cardHistory.slice(0, 5);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
        {cardHistory.length > 5 && (
          <Link
            to="/history"
            className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            <span>View All</span>
            <SafeIcon icon={FiArrowRight} className="w-4 h-4" />
          </Link>
        )}
      </div>

      {recentCards.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <SafeIcon icon={FiClock} className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-gray-600">No recent activity</p>
          <Link
            to="/create"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-2 inline-block"
          >
            Create your first card
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {recentCards.map((card) => (
            <div key={card.id} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
              <SafeIcon 
                icon={card.status === 'success' ? FiCheckCircle : FiXCircle}
                className={`w-5 h-5 mt-0.5 ${
                  card.status === 'success' ? 'text-green-600' : 'text-red-600'
                }`}
              />
              
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-900 truncate">
                  {card.title}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {formatDistance(new Date(card.createdAt), new Date(), { addSuffix: true })}
                </p>
                {card.status === 'failed' && card.error && (
                  <p className="text-xs text-red-600 mt-1">
                    {card.error}
                  </p>
                )}
              </div>
              
              {card.status === 'success' && card.cardUrl && (
                <a
                  href={card.cardUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <SafeIcon icon={FiExternalLink} className="w-4 h-4" />
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentActivity;