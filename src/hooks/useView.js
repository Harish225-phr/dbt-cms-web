// hooks/useApi.js
import { useState, useCallback } from "react";

export const useApi = (apiFunction) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiFunction(...args);
      if (result.success) {
        setData(result.data?.response?.data?.richText || "");
      } else {
        setError(result.message);
      }
      return result;
    } catch (err) {
      setError(err.message || "Something went wrong");
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  }, [apiFunction]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return { data, loading, error, execute, reset };
};
