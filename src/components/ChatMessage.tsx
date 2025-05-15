
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
          <div className="markdown text-sm prose prose-sm max-w-none">
            <ReactMarkdown components={{
              // Allow HTML content to be rendered safely within markdown
              p: ({node, ...props}) => <p className="mb-2" {...props} />,
              h1: ({node, ...props}) => <h1 className="text-lg font-bold mt-3 mb-2" {...props} />,
              h2: ({node, ...props}) => <h2 className="text-md font-bold mt-3 mb-2" {...props} />,
              h3: ({node, ...props}) => <h3 className="text-sm font-bold mt-2 mb-1" {...props} />,
              table: ({node, ...props}) => <div className="overflow-x-auto"><table className="min-w-full border-collapse border border-gray-300 my-2" {...props} /></div>,
              th: ({node, ...props}) => <th className="border border-gray-300 px-2 py-1 bg-gray-100 font-medium" {...props} />,
              td: ({node, ...props}) => <td className="border border-gray-300 px-2 py-1" {...props} />,
              a: ({node, href, ...props}) => <a href={href} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
              img: ({node, src, alt, ...props}) => <img src={src} alt={alt} className="max-w-full h-auto my-2" {...props} />,
              ul: ({node, ...props}) => <ul className="list-disc pl-5 my-2" {...props} />,
              ol: ({node, ...props}) => <ol className="list-decimal pl-5 my-2" {...props} />,
              li: ({node, ...props}) => <li className="mb-1" {...props} />,
              code: ({node, className, ...props}) => 
                className ? <code className="bg-gray-200 px-1 py-0.5 rounded" {...props} /> :
                <pre className="bg-gray-200 p-2 rounded overflow-x-auto"><code {...props} /></pre>,
              blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-gray-300 pl-3 italic my-2" {...props} />,
            }}>{message.text}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
};
