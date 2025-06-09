
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

interface ErrorMessageRendererProps {
  content: string;
  sessionId?: string;
  expertiseLevel?: "low" | "middle" | "high";
}

const ErrorMessageRenderer: React.FC<ErrorMessageRendererProps> = ({ 
  content 
}) => {
  const extractErrorMessage = (content: string): string => {
    try {
      const parsed = JSON.parse(content);
      
      // Handle the new nested error format
      if (parsed.detail) {
        // First check if detail has a message directly
        if (parsed.detail.message) {
          return parsed.detail.message;
        }
        
        // If detail.detail exists and is a string, try to parse it for nested error
        if (parsed.detail.detail && typeof parsed.detail.detail === 'string') {
          try {
            const nestedError = JSON.parse(parsed.detail.detail);
            
            // Check for deeply nested error message
            if (nestedError.detail && nestedError.detail.message) {
              return nestedError.detail.message;
            }
            
            // Fallback to nested error message
            if (nestedError.message) {
              return nestedError.message;
            }
          } catch {
            // If parsing fails, use the detail string as is
            return parsed.detail.detail;
          }
        }
        
        // Handle API response errors with detail object success: false
        if (parsed.detail.success === false) {
          return parsed.detail.message || 'An error occurred while processing your request.';
        }
      }
      
      // Handle direct error objects
      if (parsed.success === false && parsed.message) {
        return parsed.message;
      }
      
      // Handle messages that contain error information
      if (parsed.message) {
        return parsed.message;
      }
      
      // Fallback to the content if no specific error structure is found
      return content;
    } catch {
      // If JSON parsing fails, return the content as is
      return content;
    }
  };

  const errorMessage = extractErrorMessage(content);

  return (
    <Alert variant="destructive" className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle className="text-red-800 dark:text-red-200">
        오류가 발생했습니다
      </AlertTitle>
      <AlertDescription className="text-red-700 dark:text-red-300">
        {errorMessage}
      </AlertDescription>
    </Alert>
  );
};

export default ErrorMessageRenderer;
