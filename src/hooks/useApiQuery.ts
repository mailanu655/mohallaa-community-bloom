import { useState, useEffect, useCallback } from 'react';
import { ApiErrorHandler } from '@/utils/errorHandler';

interface ApiQueryOptions<T> {
  queryFn: () => Promise<T>;
  dependencies?: any[];
  enabled?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: any) => void;
  refetchOnWindowFocus?: boolean;
}

export function useApiQuery<T>(options: ApiQueryOptions<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  
  const {
    queryFn,
    dependencies = [],
    enabled = true,
    onSuccess,
    onError,
    refetchOnWindowFocus = false
  } = options;
  
  const execute = useCallback(async () => {
    if (!enabled) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await queryFn();
      setData(result);
      onSuccess?.(result);
    } catch (err) {
      const apiError = ApiErrorHandler.handle(err, 'useApiQuery');
      setError(apiError);
      onError?.(apiError);
    } finally {
      setLoading(false);
    }
  }, [queryFn, enabled, onSuccess, onError]);
  
  const refetch = useCallback(() => {
    execute();
  }, [execute]);
  
  useEffect(() => {
    execute();
  }, [execute, ...dependencies]);
  
  // Optional: Refetch on window focus
  useEffect(() => {
    if (!refetchOnWindowFocus) return;
    
    const handleFocus = () => {
      if (!document.hidden) {
        refetch();
      }
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refetch, refetchOnWindowFocus]);
  
  return {
    data,
    loading,
    error,
    refetch,
    isSuccess: !!data && !error,
    isError: !!error
  };
}