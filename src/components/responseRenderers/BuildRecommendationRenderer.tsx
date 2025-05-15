
import React from 'react';
import ReactMarkdown from 'react-markdown';

interface BuildRecommendationRendererProps {
  content: string;
}

const BuildRecommendationRenderer: React.FC<BuildRecommendationRendererProps> = ({ content }) => {
  return (
    <div className="build-recommendation-response">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
};

export default BuildRecommendationRenderer;
