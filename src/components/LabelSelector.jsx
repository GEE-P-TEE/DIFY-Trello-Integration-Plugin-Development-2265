import React, { useState } from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useTrello } from '../contexts/TrelloContext';

const { FiTag, FiX } = FiIcons;

const LabelSelector = ({ register, setValue }) => {
  const { labels, selectedBoard } = useTrello();
  const [selectedLabels, setSelectedLabels] = useState([]);

  const handleLabelToggle = (label) => {
    const isSelected = selectedLabels.some(l => l.id === label.id);
    let newSelection;
    
    if (isSelected) {
      newSelection = selectedLabels.filter(l => l.id !== label.id);
    } else {
      newSelection = [...selectedLabels, label];
    }
    
    setSelectedLabels(newSelection);
    setValue('labelIds', newSelection.map(l => l.id));
  };

  const removeLabel = (labelId) => {
    const newSelection = selectedLabels.filter(l => l.id !== labelId);
    setSelectedLabels(newSelection);
    setValue('labelIds', newSelection.map(l => l.id));
  };

  if (!selectedBoard || labels.length === 0) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Labels (Optional)
        </label>
        <p className="text-sm text-gray-500">
          {!selectedBoard ? 'Select a board to see available labels' : 'No labels available for this board'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Labels (Optional)
      </label>
      
      {/* Selected Labels */}
      {selectedLabels.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedLabels.map((label) => (
            <span
              key={label.id}
              className="inline-flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium text-white"
              style={{ backgroundColor: label.color || '#gray' }}
            >
              <span>{label.name || 'Unnamed'}</span>
              <button
                type="button"
                onClick={() => removeLabel(label.id)}
                className="hover:bg-black hover:bg-opacity-20 rounded"
              >
                <SafeIcon icon={FiX} className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      
      {/* Available Labels */}
      <div className="border border-gray-300 rounded-lg p-3 max-h-32 overflow-y-auto">
        <div className="grid grid-cols-2 gap-2">
          {labels.map((label) => {
            const isSelected = selectedLabels.some(l => l.id === label.id);
            return (
              <button
                key={label.id}
                type="button"
                onClick={() => handleLabelToggle(label)}
                className={`flex items-center space-x-2 px-2 py-1 rounded text-xs font-medium transition-all ${
                  isSelected 
                    ? 'ring-2 ring-blue-500 ring-offset-1' 
                    : 'hover:ring-1 hover:ring-gray-300'
                } text-white`}
                style={{ backgroundColor: label.color || '#6B7280' }}
              >
                <SafeIcon icon={FiTag} className="w-3 h-3" />
                <span className="truncate">{label.name || 'Unnamed'}</span>
              </button>
            );
          })}
        </div>
      </div>
      
      <p className="text-xs text-gray-500">
        Click labels to add them to your card
      </p>
    </div>
  );
};

export default LabelSelector;