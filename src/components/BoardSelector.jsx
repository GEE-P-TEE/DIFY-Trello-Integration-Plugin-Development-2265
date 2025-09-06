import React, { useEffect } from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useTrello } from '../contexts/TrelloContext';

const { FiGrid, FiRefreshCw } = FiIcons;

const BoardSelector = ({ register, errors, setValue }) => {
  const { boards, loading, loadBoards, loadBoardData } = useTrello();

  useEffect(() => {
    if (boards.length === 0) {
      loadBoards();
    }
  }, []);

  const handleBoardChange = (boardId) => {
    setValue('boardId', boardId);
    setValue('listId', ''); // Reset list selection
    if (boardId) {
      loadBoardData(boardId);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Board *
        </label>
        <button
          type="button"
          onClick={loadBoards}
          disabled={loading}
          className="text-xs text-blue-600 hover:text-blue-800 flex items-center space-x-1"
        >
          <SafeIcon 
            icon={FiRefreshCw} 
            className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} 
          />
          <span>Refresh</span>
        </button>
      </div>
      
      <select
        {...register('boardId', { required: 'Board selection is required' })}
        onChange={(e) => handleBoardChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        disabled={loading || boards.length === 0}
      >
        <option value="">
          {loading ? 'Loading boards...' : 'Select a board'}
        </option>
        {boards.map((board) => (
          <option key={board.id} value={board.id}>
            {board.name}
          </option>
        ))}
      </select>
      
      {errors.boardId && (
        <p className="text-sm text-red-600">{errors.boardId.message}</p>
      )}
      
      {!loading && boards.length === 0 && (
        <p className="text-sm text-gray-500">
          No boards found. Make sure you have access to at least one Trello board.
        </p>
      )}
    </div>
  );
};

export default BoardSelector;