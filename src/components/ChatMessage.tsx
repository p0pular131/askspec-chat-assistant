
import React from 'react';
import ReactMarkdown from 'react-markdown';
import ResponseRenderer from './responseRenderers/ResponseRenderer';

interface ChatMessageProps {
  text: string;
  isUser: boolean;
  chatMode?: string;
  expertiseLevel?: 'beginner' | 'intermediate' | 'expert';
  sessionId?: string;
  onTitleExtracted?: (title: string) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ 
  text, 
  isUser, 
  chatMode = '범용 검색',
  expertiseLevel = 'beginner',
  sessionId,
  onTitleExtracted
}) => {
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div 
        className={`max-w-[80%] p-3 rounded-lg ${
          isUser 
            ? 'bg-askspec-purple text-white' 
            : 'bg-gray-100 text-gray-900'
        }`}
      >
        {isUser ? (
          <ReactMarkdown className="prose prose-sm max-w-none">
            {text}
          </ReactMarkdown>
        ) : (
          <ResponseRenderer 
            content={text}
            chatMode={chatMode}
            sessionId={sessionId}
            expertiseLevel={expertiseLevel}
            onTitleExtracted={onTitleExtracted}
          />
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
