
import React from 'react';
import { cn } from '@/lib/utils';

interface RatingIndicatorProps {
  label: string;
  value: number | null;
  maxValue: number;
  icon?: React.ReactNode;
  color?: string;
}

export const RatingIndicator: React.FC<RatingIndicatorProps> = ({
  label,
  value,
  maxValue,
  icon,
  color = '#9b87f5', // Default purple color
}) => {
  // Calculate percentage for the circle fill
  const percentage = value !== null ? (value / maxValue) * 100 : 0;
  const isRated = value !== null;
  
  // Size constants
  const size = 120;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  return (
    <div className="flex flex-col items-center justify-center">
      {/* Label at top */}
      <div className="text-sm font-medium mb-2 flex items-center gap-1.5">
        {icon && <span className="text-muted-foreground">{icon}</span>}
        <span>{label}</span>
      </div>
      
      {/* Circular indicator */}
      <div className="relative" style={{ width: size, height: size }}>
        {/* Background circle */}
        <svg width={size} height={size} className="rotate-[-90deg]">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#e2e8f0" // Light gray background
            strokeWidth={strokeWidth}
          />
          
          {/* Foreground circle (the progress) */}
          {isRated && (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          )}
        </svg>
        
        {/* Text in center */}
        <div 
          className={cn(
            "absolute inset-0 flex items-center justify-center text-lg font-bold", 
            !isRated && "text-muted-foreground"
          )}
        >
          {isRated ? `${value}/${maxValue}` : "N/A"}
        </div>
      </div>
    </div>
  );
};
