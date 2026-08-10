/**
 * useApi Hook
 * Generic hook for making API calls with loading, error, and data state management.
 * Eliminates duplicated fetch/loading/error patterns across pages.
 */
import { useState, useCallback } from 'react';

/**
 * @param {Function} apiFunction - The service function to call (e.g., propertyService.getProperties)
 * @param {Object} options - { immediate: boolean } — if true, does NOT auto-execute
 * @returns {{ data, loading, error, execute, reset }}
 */
export default function useApi(apiFunction, { onSuccess, onError } = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);
      try {
        const result = await apiFunction(...args);
        setData(result);
        onSuccess?.(result);
        return result;
      } catch (err) {
        const message = err.message || 'Something went wrong';
        setError(message);
        onError?.(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiFunction, onSuccess, onError]
  );

  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  return { data, loading, error, execute, reset };
}
