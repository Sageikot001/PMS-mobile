import { useState, useEffect, useCallback, useRef } from 'react';
import { Alert } from 'react-native';
import { ApiService } from '../lib/api';

// Custom hook for API calls with loading states and error handling
export const useApi = (apiFunction, initialData = null, executeOnMount = false) => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const mountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const execute = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await apiFunction(...args);
      
      if (mountedRef.current) {
        setData(result);
      }
      
      return result;
    } catch (err) {
      console.error('API Error:', err);
      
      if (mountedRef.current) {
        setError(err);
      }
      
      // Handle specific error types
      if (err.errorCode === 'NETWORK_ERROR') {
        Alert.alert('Network Error', 'Please check your internet connection.');
      } else if (err.errorCode === 'SESSION_EXPIRED') {
        // Session expired, user will be redirected to login
        return;
      } else if (!err.isRetryable) {
        Alert.alert('Error', err.message || 'Something went wrong.');
      }
      
      throw err;
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [apiFunction]);

  const refresh = useCallback(async (...args) => {
    try {
      setRefreshing(true);
      setError(null);
      
      const result = await apiFunction(...args);
      
      if (mountedRef.current) {
        setData(result);
      }
      
      return result;
    } catch (err) {
      console.error('Refresh Error:', err);
      
      if (mountedRef.current) {
        setError(err);
      }
      
      throw err;
    } finally {
      if (mountedRef.current) {
        setRefreshing(false);
      }
    }
  }, [apiFunction]);

  const retry = useCallback(async (...args) => {
    if (error && ApiService.isRetryableError(error)) {
      return execute(...args);
    }
  }, [error, execute]);

  const reset = useCallback(() => {
    setData(initialData);
    setError(null);
    setLoading(false);
    setRefreshing(false);
  }, [initialData]);

  // Execute on mount if requested
  useEffect(() => {
    if (executeOnMount && mountedRef.current) {
      execute();
    }
  }, [executeOnMount, execute]);

  return {
    data,
    loading,
    error,
    refreshing,
    execute,
    refresh,
    retry,
    reset,
  };
};

// Hook for paginated API calls
export const usePaginatedApi = (apiFunction, initialData = []) => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchData = useCallback(async (pageNum = 1, isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      setError(null);
      
      const result = await apiFunction({ page: pageNum, limit: 20 });
      
      if (mountedRef.current) {
        if (pageNum === 1 || isRefresh) {
          setData(result.data || []);
        } else {
          setData(prev => [...prev, ...(result.data || [])]);
        }
        
        setHasMore(result.hasMore || false);
        setPage(pageNum);
      }
      
      return result;
    } catch (err) {
      console.error('Paginated API Error:', err);
      
      if (mountedRef.current) {
        setError(err);
      }
      
      throw err;
    } finally {
      if (mountedRef.current) {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    }
  }, [apiFunction]);

  const refresh = useCallback(() => {
    return fetchData(1, true);
  }, [fetchData]);

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      return fetchData(page + 1);
    }
  }, [loadingMore, hasMore, page, fetchData]);

  const reset = useCallback(() => {
    setData(initialData);
    setError(null);
    setLoading(false);
    setLoadingMore(false);
    setRefreshing(false);
    setHasMore(true);
    setPage(1);
  }, [initialData]);

  return {
    data,
    loading,
    loadingMore,
    error,
    refreshing,
    hasMore,
    page,
    fetchData,
    refresh,
    loadMore,
    reset,
  };
};

// Hook for form submissions
export const useFormApi = (apiFunction) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const submit = useCallback(async (formData) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      
      const result = await apiFunction(formData);
      
      if (mountedRef.current) {
        setSuccess(true);
      }
      
      return result;
    } catch (err) {
      console.error('Form API Error:', err);
      
      if (mountedRef.current) {
        setError(err);
      }
      
      // Show error message for form submissions
      Alert.alert('Error', err.message || 'Failed to submit form.');
      
      throw err;
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [apiFunction]);

  const reset = useCallback(() => {
    setError(null);
    setLoading(false);
    setSuccess(false);
  }, []);

  return {
    loading,
    error,
    success,
    submit,
    reset,
  };
};

// Hook for real-time data with periodic updates
export const useRealTimeApi = (apiFunction, interval = 30000) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [connected, setConnected] = useState(false);
  const mountedRef = useRef(true);
  const intervalRef = useRef(null);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await apiFunction();
      
      if (mountedRef.current) {
        setData(result);
        setConnected(true);
      }
      
      return result;
    } catch (err) {
      console.error('Real-time API Error:', err);
      
      if (mountedRef.current) {
        setError(err);
        setConnected(false);
      }
      
      throw err;
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [apiFunction]);

  const start = useCallback(() => {
    fetchData();
    
    intervalRef.current = setInterval(() => {
      if (mountedRef.current) {
        fetchData();
      }
    }, interval);
  }, [fetchData, interval]);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setConnected(false);
  }, []);

  const reset = useCallback(() => {
    stop();
    setData(null);
    setError(null);
    setLoading(false);
  }, [stop]);

  return {
    data,
    loading,
    error,
    connected,
    start,
    stop,
    reset,
    fetchData,
  };
};

// All hooks are already exported above with 'export const' 