import React from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useTrello } from '../contexts/TrelloContext';

const { FiList } = FiIcons;

const ListSelector = ({ register, errors, setValue }) => {
  const { lists, selectedBoard, loading } = useTrello();

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        List *
      </label>
      
      <select
        {...register('listId', { required: 'List selection is required' })}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        disabled={!selectedBoard || loading}
      >
        <option value="">
          {!selectedBoard 
            ? 'Select a board first' 
            : lists.length === 0 
              ? 'No lists available'
              : 'Select a list'
          }
        </option>
        {lists.map((list) => (
          <option key={list.id} value={list.id}>
            {list.name}
          </option>
        ))}
      </select>
      
      {errors.listId && (
        <p className="text-sm text-red-600">{errors.listId.message}</p>
      )}
    </div>
  );
};

export default ListSelector;