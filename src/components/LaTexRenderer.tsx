
import React from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

interface LaTexRendererProps {
  children: string;
  inline?: boolean;
  className?: string;
}

const LaTexRenderer: React.FC<LaTexRendererProps> = ({ children, inline = true, className }) => {
  // Check if the text contains LaTeX expressions
  const hasLatex = /\$\$.*?\$\$|\$.*?\$|\\[a-zA-Z]+/.test(children);
  
  if (!hasLatex) {
    return <span className={className}>{children}</span>;
  }

  // Handle block LaTeX ($$...$$)
  if (children.includes('$$')) {
    const parts = children.split(/(\$\$.*?\$\$)/);
    return (
      <span className={className}>
        {parts.map((part, index) => {
          if (part.startsWith('$$') && part.endsWith('$$')) {
            const math = part.slice(2, -2);
            return <BlockMath key={index} math={math} />;
          }
          return part;
        })}
      </span>
    );
  }

  // Handle inline LaTeX ($...$)
  if (children.includes('$')) {
    const parts = children.split(/(\$.*?\$)/);
    return (
      <span className={className}>
        {parts.map((part, index) => {
          if (part.startsWith('$') && part.endsWith('$')) {
            const math = part.slice(1, -1);
            return <InlineMath key={index} math={math} />;
          }
          return part;
        })}
      </span>
    );
  }

  // Handle LaTeX commands without $ delimiters
  try {
    return inline ? 
      <InlineMath math={children} className={className} /> : 
      <BlockMath math={children} className={className} />;
  } catch (error) {
    // Fallback to regular text if LaTeX parsing fails
    return <span className={className}>{children}</span>;
  }
};

export default LaTexRenderer;
