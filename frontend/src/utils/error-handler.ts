/**
 * Error handling utilities
 * Standardizes error message extraction and handling
 */

export const getErrorMessage = (error: any, defaultMessage: string = 'An error occurred'): string => {
  if (!error) return defaultMessage;
  
  // Try to extract message from different error formats
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  
  if (error.message) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return defaultMessage;
};

export const handleApiError = (error: any, defaultMessage: string = 'An error occurred'): string => {
  const message = getErrorMessage(error, defaultMessage);
  
  // Log error for debugging
  console.error('API Error:', error);
  
  return message;
};

