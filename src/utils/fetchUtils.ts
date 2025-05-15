
/**
 * Helper function to validate if a string is a valid number
 */
export const isValidId = (str: string | null): boolean => {
  if (!str) return false;
  return !isNaN(parseInt(str));
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
