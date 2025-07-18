import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface OptimisticAction<T> {
  optimisticUpdate: (currentData: T[]) => T[];
  serverAction: () => Promise<void>;
  rollbackUpdate: (currentData: T[]) => T[];
  successMessage?: string;
  errorMessage?: string;
}

export const useOptimisticUpdates = <T>(initialData: T[] = []) => {
  const [data, setData] = useState<T[]>(initialData);
  const [isUpdating, setIsUpdating] = useState(false);

  const executeOptimisticUpdate = useCallback(async <K>({
    optimisticUpdate,
    serverAction,
    rollbackUpdate,
    successMessage,
    errorMessage = 'Something went wrong'
  }: OptimisticAction<T>) => {
    setIsUpdating(true);
    
    // Apply optimistic update immediately
    setData(currentData => optimisticUpdate(currentData));
    
    try {
      // Execute server action
      await serverAction();
      
      if (successMessage) {
        toast.success(successMessage);
      }
    } catch (error) {
      // Rollback on error
      setData(currentData => rollbackUpdate(currentData));
      toast.error(errorMessage);
      console.error('Optimistic update failed:', error);
    } finally {
      setIsUpdating(false);
    }
  }, []);

  const updateData = useCallback((newData: T[]) => {
    setData(newData);
  }, []);

  return {
    data,
    isUpdating,
    executeOptimisticUpdate,
    updateData
  };
};

// Helper functions for common operations
export const optimisticOperations = {
  // Add item to beginning of array
  addItem: <T>(newItem: T) => ({
    optimisticUpdate: (currentData: T[]) => [newItem, ...currentData],
    rollbackUpdate: (currentData: T[]) => currentData.slice(1)
  }),

  // Remove item by property
  removeItem: <T>(itemId: string | number, idProperty: keyof T = 'id' as keyof T) => ({
    optimisticUpdate: (currentData: T[]) => 
      currentData.filter(item => item[idProperty] !== itemId),
    rollbackUpdate: (currentData: T[]) => currentData // Would need the original item to restore
  }),

  // Update item by property
  updateItem: <T>(itemId: string | number, updates: Partial<T>, idProperty: keyof T = 'id' as keyof T) => {
    let originalItem: T | null = null;
    
    return {
      optimisticUpdate: (currentData: T[]) => 
        currentData.map(item => {
          if (item[idProperty] === itemId) {
            originalItem = item;
            return { ...item, ...updates };
          }
          return item;
        }),
      rollbackUpdate: (currentData: T[]) =>
        originalItem 
          ? currentData.map(item => 
              item[idProperty] === itemId ? originalItem! : item
            )
          : currentData
    };
  },

  // Toggle boolean property
  toggleProperty: <T>(itemId: string | number, property: keyof T, idProperty: keyof T = 'id' as keyof T) => {
    let originalValue: any = null;
    
    return {
      optimisticUpdate: (currentData: T[]) => 
        currentData.map(item => {
          if (item[idProperty] === itemId) {
            originalValue = item[property];
            return { ...item, [property]: !item[property] };
          }
          return item;
        }),
      rollbackUpdate: (currentData: T[]) =>
        currentData.map(item => 
          item[idProperty] === itemId 
            ? { ...item, [property]: originalValue }
            : item
        )
    };
  },

  // Increment/decrement numeric property
  incrementProperty: <T>(
    itemId: string | number, 
    property: keyof T, 
    amount: number = 1,
    idProperty: keyof T = 'id' as keyof T
  ) => {
    return {
      optimisticUpdate: (currentData: T[]) => 
        currentData.map(item => {
          if (item[idProperty] === itemId) {
            const currentValue = Number(item[property]) || 0;
            return { ...item, [property]: currentValue + amount };
          }
          return item;
        }),
      rollbackUpdate: (currentData: T[]) =>
        currentData.map(item => {
          if (item[idProperty] === itemId) {
            const currentValue = Number(item[property]) || 0;
            return { ...item, [property]: currentValue - amount };
          }
          return item;
        })
    };
  }
};