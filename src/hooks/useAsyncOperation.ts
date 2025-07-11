import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseAsyncOperationOptions {
  onSuccess?: (data?: any) => void;
  onError?: (error: Error) => void;
  successMessage?: string;
  errorMessage?: string;
}

export const useAsyncOperation = (options: UseAsyncOperationOptions = {}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async (operation: () => Promise<any>) => {
    setLoading(true);
    setError(null);

    try {
      const result = await operation();
      
      if (options.successMessage) {
        toast({
          title: "Success",
          description: options.successMessage,
        });
      }
      
      if (options.onSuccess) {
        options.onSuccess(result);
      }
      
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An unknown error occurred');
      setError(error);
      
      const errorMessage = options.errorMessage || error.message;
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      if (options.onError) {
        options.onError(error);
      }
      
      throw error;
    } finally {
      setLoading(false);
    }
  }, [options, toast]);

  const reset = useCallback(() => {
    setError(null);
    setLoading(false);
  }, []);

  return {
    loading,
    error,
    execute,
    reset,
    isLoading: loading,
    hasError: !!error
  };
};