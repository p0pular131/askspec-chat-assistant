
/**
 * Helper function to validate if a string is a valid database ID (not a timestamp)
 */
export const isValidId = (str: string | null): boolean => {
  if (!str) return false;
  const num = parseInt(str);
  // Check if it's a valid number and not a timestamp (less than 1 billion)
  return !isNaN(num) && num > 0 && num < 1000000000;
};

/**
 * Retry function with exponential backoff
 */
export const fetchWithRetry = async <T,>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> => {
  try {
    return await fn();
  } catch (err) {
    if (retries <= 0) throw err;
    
    await new Promise(resolve => setTimeout(resolve, delay));
    return fetchWithRetry(fn, retries - 1, delay * 1.5);
  }
};
