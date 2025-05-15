
import React from 'react';
import ReactMarkdown from 'react-markdown';

interface BuildEvaluationRendererProps {
  content: string;
}

const BuildEvaluationRenderer: React.FC<BuildEvaluationRendererProps> = ({ content }) => {
  return (
    <div className="build-evaluation-response">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
};

export default BuildEvaluationRenderer;
