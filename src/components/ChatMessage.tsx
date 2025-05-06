
import React from 'react';
import { ChatMessageProps } from './types';
import ReactMarkdown from 'react-markdown';

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  return (
    <div
      className={`flex mb-4 ${
        message.isUser ? 'justify-end' : 'justify-start'
      }`}
    >
      <div
        className={`max-w-[80%] rounded-lg p-3 ${
          message.isUser
            ? 'bg-askspec-purple text-white rounded-tr-none'
            : 'bg-gray-100 text-zinc-900 rounded-tl-none'
        }`}
      >
        {message.isUser ? (
          <p className="text-sm">{message.text}</p>
        ) : (
          <div className="markdown text-sm">
            <ReactMarkdown>{message.text}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
};
