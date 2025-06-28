import { useState, useCallback } from 'react';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (apiCall, options = {}) => {
    const { 
      onSuccess, 
      onError, 
      showLoading = true,
      errorMessage = 'An error occurred'
    } = options;

    try {
      if (showLoading) setLoading(true);
      setError(null);

      const result = await apiCall();
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (err) {
      const errorMsg = err.message || errorMessage;
      setError(errorMsg);
      
      if (onError) {
        onError(err);
      } else {
        console.error('API Error:', err);
      }
      
      throw err;
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    execute,
    clearError
  };
};

export default useApi;