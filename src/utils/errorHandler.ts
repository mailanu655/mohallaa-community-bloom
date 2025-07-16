import { toast } from '@/hooks/use-toast';

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

export interface LocationError extends ApiError {
  type: 'timeout' | 'permission' | 'unavailable' | 'geocoding' | 'network';
}

export class ApiErrorHandler {
  static handle(error: any, context?: string): ApiError {
    console.error(`API Error ${context ? `in ${context}` : ''}:`, error);
    
    let message = 'An unexpected error occurred';
    let code = 'UNKNOWN_ERROR';
    
    if (error?.message) {
      message = error.message;
      code = error.code || 'SUPABASE_ERROR';
    } else if (typeof error === 'string') {
      message = error;
    }
    
    // Handle specific Supabase errors
    if (error?.code === 'PGRST116') {
      message = 'No data found';
      code = 'NOT_FOUND';
    } else if (error?.code === '23505') {
      message = 'This record already exists';
      code = 'DUPLICATE_ERROR';
    } else if (error?.code === '42501') {
      message = 'You don\'t have permission to perform this action';
      code = 'PERMISSION_DENIED';
    }
    
    return { message, code, details: error };
  }
  
  static showToast(error: any, context?: string) {
    const apiError = this.handle(error, context);
    
    toast({
      title: "Error",
      description: apiError.message,
      variant: "destructive",
    });
    
    return apiError;
  }
  
  static isNetworkError(error: any): boolean {
    return error?.message?.includes('Failed to fetch') || 
           error?.message?.includes('Network Error') ||
           !navigator.onLine;
  }
  
  static isAuthError(error: any): boolean {
    return error?.message?.includes('JWT') ||
           error?.message?.includes('not authenticated') ||
           error?.code === '42501';
  }

  static handleLocationError(error: any): LocationError {
    let message = 'Failed to get location';
    let type: LocationError['type'] = 'unavailable';

    if (error?.code === 1) {
      message = 'Location access denied. Please enable location permissions in your browser settings.';
      type = 'permission';
    } else if (error?.code === 2) {
      message = 'Location unavailable. Please check your connection and try again.';
      type = 'unavailable';
    } else if (error?.code === 3) {
      message = 'Location request timed out. Please try again.';
      type = 'timeout';
    } else if (error?.message?.includes('Timeout')) {
      message = 'Request timed out. Please check your connection and try again.';
      type = 'timeout';
    } else if (error?.message?.includes('fetch')) {
      message = 'Network error. Please check your connection.';
      type = 'network';
    } else if (error?.message?.includes('geocoding')) {
      message = 'Unable to determine your city. Location will work with approximate area.';
      type = 'geocoding';
    }

    return {
      message,
      code: `LOCATION_${type.toUpperCase()}`,
      type,
      details: error
    };
  }

  static showLocationToast(error: any) {
    const locationError = this.handleLocationError(error);
    
    toast({
      title: locationError.type === 'geocoding' ? 'Partial Success' : 'Location Error',
      description: locationError.message,
      variant: locationError.type === 'geocoding' ? 'default' : 'destructive',
    });
    
    return locationError;
  }
}