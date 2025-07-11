import { toast } from '@/hooks/use-toast';

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
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
}