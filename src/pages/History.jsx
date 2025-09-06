import React, { useState } from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useTrello } from '../contexts/TrelloContext';
import { formatDistance } from 'date-fns';

const { FiClock, FiTrash2, FiExternalLink, FiCheckCircle, FiXCircle, FiFilter } = FiIcons;

const History = () => {
  const { cardHistory, clearHistory } = useTrello();
  const [filter, setFilter] = useState('all'); // all, success, failed
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest

  const filteredHistory = cardHistory
    .filter(card => {
      if (filter === 'all') return true;
      return card.status === filter;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      return new Date(a.createdAt) - new Date(b.createdAt);
    });

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all history? This action cannot be undone.')) {
      clearHistory();
    }
  };

  const getStatusIcon = (status) => {
    return status === 'success' ? FiCheckCircle : FiXCircle;
  };

  const getStatusColor = (status) => {
    return status === 'success' ? 'text-green-600' : 'text-red-600';
  };

  const getStatusBg = (status) => {
    return status === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Card History</h1>
          <p className="text-gray-600 mt-1">View all created cards and their status</p>
        </div>
        
        {cardHistory.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="flex items-center space-x-2 px-4 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
          >
            <SafeIcon icon={FiTrash2} className="w-4 h-4" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <SafeIcon icon={FiFilter} className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Filter:</span>
          </div>
          
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="all">All Cards ({cardHistory.length})</option>
            <option value="success">
              Successful ({cardHistory.filter(c => c.status === 'success').length})
            </option>
            <option value="failed">
              Failed ({cardHistory.filter(c => c.status === 'failed').length})
            </option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* History List */}
      {filteredHistory.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <SafeIcon icon={FiClock} className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No History Yet</h2>
          <p className="text-gray-600">
            {cardHistory.length === 0 
              ? 'Create your first card to see it here'
              : 'No cards match the current filter'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredHistory.map((card) => (
            <div
              key={card.id}
              className={`bg-white rounded-xl shadow-sm border p-6 ${getStatusBg(card.status)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <SafeIcon 
                      icon={getStatusIcon(card.status)} 
                      className={`w-5 h-5 ${getStatusColor(card.status)}`} 
                    />
                    <h3 className="text-lg font-semibold text-gray-900">
                      {card.title}
                    </h3>
                  </div>
                  
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {card.description}
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <span>
                      {formatDistance(new Date(card.createdAt), new Date(), { addSuffix: true })}
                    </span>
                    
                    {card.status === 'success' && card.cardUrl && (
                      <a
                        href={card.cardUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                      >
                        <span>View in Trello</span>
                        <SafeIcon icon={FiExternalLink} className="w-4 h-4" />
                      </a>
                    )}
                    
                    {card.status === 'failed' && card.error && (
                      <span className="text-red-600">
                        Error: {card.error}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="text-right ml-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    card.status === 'success' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {card.status === 'success' ? 'Success' : 'Failed'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;