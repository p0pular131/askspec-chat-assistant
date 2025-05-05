
import React from 'react';
import { SurveyOptionProps } from './types';

export const SurveyOption: React.FC<SurveyOptionProps> = ({
  id,
  title,
  description,
  isSelected,
  onSelect,
}) => {
  return (
    <div
      onClick={onSelect}
      className={`p-3 rounded-lg cursor-pointer border transition-all ${
        isSelected
          ? 'border-askspec-purple bg-askspec-purple-light'
          : 'border-gray-200 hover:border-askspec-purple hover:bg-gray-50'
      }`}
    >
      <div className="flex items-center mb-2">
        <div
          className={`w-4 h-4 rounded-full border border-askspec-purple flex items-center justify-center mr-2 ${
            isSelected ? 'bg-askspec-purple' : 'bg-white'
          }`}
        >
          {isSelected && (
            <div className="w-2 h-2 bg-white rounded-full"></div>
          )}
        </div>
        <h3 className="text-sm font-medium text-zinc-900">{title}</h3>
      </div>
      <p className="text-xs text-stone-500 pl-6">{description}</p>
    </div>
  );
};
