
import React from 'react';
import { SidebarProps } from './types';

export const Sidebar: React.FC<SidebarProps> = ({ 
  children, 
  isOpen, 
  onToggle, 
  title,
  position 
}) => {
  return (
    <div className={`
      ${isOpen ? 'w-72' : 'w-16'} 
      ${position === 'left' ? 'border-r' : 'border-l'}
      transition-all duration-300 ease-in-out 
      flex flex-col 
      border-gray-200 
      bg-white
    `}>
      <div className={`
        flex items-center justify-between
        p-4 
        border-b border-gray-200
      `}>
        {isOpen && (
          <h2 className="text-base font-medium text-zinc-900">{title}</h2>
        )}
        <button
          onClick={onToggle}
          className="p-1 rounded-full text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-askspec-purple"
        >
          {position === 'left' ? (
            isOpen ? (
              <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
                <path d="M10 4L6 8L10 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
                <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )
          ) : (
            isOpen ? (
              <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
                <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
                <path d="M10 4L6 8L10 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )
          )}
        </button>
      </div>
      <div className={`flex-1 p-4 overflow-y-auto ${isOpen ? 'block' : 'hidden'}`}>
        {children}
      </div>
    </div>
  );
};
