import React from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useTrello } from '../contexts/TrelloContext';

const { FiUser } = FiIcons;

const MemberSelector = ({ register, setValue }) => {
  const { members, selectedBoard } = useTrello();

  if (!selectedBoard || members.length === 0) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Assign To (Optional)
        </label>
        <p className="text-sm text-gray-500">
          {!selectedBoard ? 'Select a board to see available members' : 'No members available for this board'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Assign To (Optional)
      </label>
      
      <select
        {...register('assigneeId')}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="">No assignment</option>
        {members.map((member) => (
          <option key={member.id} value={member.id}>
            {member.fullName} (@{member.username})
          </option>
        ))}
      </select>
    </div>
  );
};

export default MemberSelector;