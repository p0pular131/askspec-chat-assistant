
import React from 'react';
import ReactMarkdown from 'react-markdown';

interface SpecUpgradeRendererProps {
  content: string;
}

const SpecUpgradeRenderer: React.FC<SpecUpgradeRendererProps> = ({ content }) => {
  return (
    <div className="spec-upgrade-response">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
};

export default SpecUpgradeRenderer;
