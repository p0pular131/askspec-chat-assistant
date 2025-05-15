
import React from 'react';
import ReactMarkdown from 'react-markdown';

interface GeneralSearchRendererProps {
  content: string;
}

const GeneralSearchRenderer: React.FC<GeneralSearchRendererProps> = ({ content }) => {
  return (
    <div className="general-search-response">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
};

export default GeneralSearchRenderer;
