
import React from 'react';
import ReactMarkdown from 'react-markdown';

interface PartRecommendationRendererProps {
  content: string;
}

const PartRecommendationRenderer: React.FC<PartRecommendationRendererProps> = ({ content }) => {
  return (
    <div className="part-recommendation-response">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
};

export default PartRecommendationRenderer;
