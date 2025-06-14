
import React, { useState, useRef, useEffect } from 'react';
import { MessageInputProps } from './types';

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  chatMode,
  setChatMode,
  showExample,
  exampleText,
  isDisabled,
}) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const modes = ['범용 검색', '부품 추천', '견적 추천', '호환성 검사', '스펙 업그레이드', '견적 평가'];

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '48px';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 150)}px`;
    }
  }, [message]);

  const handleSend = () => {
    if (message.trim() && !isDisabled) {
      onSendMessage(message);
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = '48px';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Always use the example text from the current chat mode
  const placeholderText = exampleText;

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="flex items-center px-3 h-10 border-b border-gray-200 overflow-x-auto">
        <div className="flex items-center gap-2">
          {modes.map((mode) => (
            <button
              key={mode}
              onClick={() => setChatMode(mode)}
              disabled={isDisabled}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors whitespace-nowrap ${
                chatMode === mode
                  ? 'bg-askspec-purple text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholderText}
          disabled={isDisabled}
          className={`py-3 pl-4 pr-12 w-full max-h-[150px] min-h-[48px] text-sm resize-none bg-transparent focus:outline-none ${
            isDisabled ? 'text-gray-400 cursor-not-allowed' : ''
          }`}
          rows={1}
        />
        <button
          onClick={handleSend}
          disabled={!message.trim() || isDisabled}
          className={`absolute right-3 bottom-3 p-2 rounded-full ${
            message.trim() && !isDisabled
              ? 'text-askspec-purple hover:bg-askspec-purple-light'
              : 'text-gray-300 cursor-not-allowed'
          }`}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="w-5 h-5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" />
          </svg>
        </button>
      </div>
    </div>
  );
};
