import { useState, useCallback } from 'react';

interface OptimisticOperation<T> {
  optimisticUpdate: (currentData: T) => T;
  operation: () => Promise<T>;
  onError?: (error: any, previousData: T) => void;
  onSuccess?: (newData: T) => void;
}

export function useOptimisticUpdate<T>(initialData: T) {
  const [data, setData] = useState<T>(initialData);
  const [isOptimistic, setIsOptimistic] = useState(false);

  const executeOptimistically = useCallback(async ({
    optimisticUpdate,
    operation,
    onError,
    onSuccess
  }: OptimisticOperation<T>) => {
    const previousData = data;
    
    try {
      // Apply optimistic update immediately
      const optimisticData = optimisticUpdate(data);
      setData(optimisticData);
      setIsOptimistic(true);
      
      // Execute actual operation
      const result = await operation();
      
      // Update with real data
      setData(result);
      setIsOptimistic(false);
      onSuccess?.(result);
      
      return result;
    } catch (error) {
      // Revert to previous state on error
      setData(previousData);
      setIsOptimistic(false);
      onError?.(error, previousData);
      throw error;
    }
  }, [data]);

  return {
    data,
    isOptimistic,
    executeOptimistically,
    setData
  };
}

// Specific optimistic update helpers
export const optimisticUpdates = {
  // Add item to array
  addToArray: <T extends { id: string }>(items: T[], newItem: T): T[] => [
    newItem,
    ...items
  ],

  // Remove item from array
  removeFromArray: <T extends { id: string }>(items: T[], itemId: string): T[] =>
    items.filter(item => item.id !== itemId),

  // Update item in array
  updateInArray: <T extends { id: string }>(items: T[], itemId: string, updates: Partial<T>): T[] =>
    items.map(item => 
      item.id === itemId ? { ...item, ...updates } : item
    ),

  // Increment/decrement counter
  incrementCounter: (current: number, increment: number = 1): number =>
    Math.max(0, current + increment),

  // Toggle boolean
  toggleBoolean: (current: boolean): boolean => !current,

  // Update RSVP status
  updateRSVPStatus: <T extends { status: string; attendee_id?: string }>(
    attendees: T[], 
    userId: string, 
    newStatus: string,
    userAttendee?: T
  ): T[] => {
    if (userAttendee) {
      return attendees.map(a => 
        a === userAttendee ? { ...a, status: newStatus } : a
      );
    } else {
      // Add new attendee optimistically
      const newAttendee = { 
        status: newStatus, 
        attendee_id: userId 
      } as unknown as T;
      return [newAttendee, ...attendees];
    }
  },

  // Update community membership
  updateMembershipStatus: (
    isMember: boolean,
    memberCount: number,
    joining: boolean
  ): { isMember: boolean; memberCount: number } => ({
    isMember: joining,
    memberCount: joining ? memberCount + 1 : Math.max(0, memberCount - 1)
  })
};