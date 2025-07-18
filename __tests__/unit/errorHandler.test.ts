import { ApiErrorHandler } from '@/utils/errorHandler';

// Mock toast
jest.mock('@/hooks/use-toast', () => ({
  toast: jest.fn(),
}));

describe('ApiErrorHandler', () => {
  describe('handle', () => {
    test('should handle generic error with message', () => {
      const error = { message: 'Test error', code: 'TEST_CODE' };
      const result = ApiErrorHandler.handle(error, 'test context');
      
      expect(result.message).toBe('Test error');
      expect(result.code).toBe('TEST_CODE');
      expect(result.details).toBe(error);
    });

    test('should handle string error', () => {
      const error = 'Simple error message';
      const result = ApiErrorHandler.handle(error);
      
      expect(result.message).toBe('Simple error message');
      expect(result.code).toBe('UNKNOWN_ERROR');
    });

    test('should handle Supabase not found error', () => {
      const error = { code: 'PGRST116', message: 'Original message' };
      const result = ApiErrorHandler.handle(error);
      
      expect(result.message).toBe('No data found');
      expect(result.code).toBe('NOT_FOUND');
    });

    test('should handle Supabase duplicate error', () => {
      const error = { code: '23505', message: 'Duplicate key value' };
      const result = ApiErrorHandler.handle(error);
      
      expect(result.message).toBe('This record already exists');
      expect(result.code).toBe('DUPLICATE_ERROR');
    });

    test('should handle permission denied error', () => {
      const error = { code: '42501', message: 'Permission denied' };
      const result = ApiErrorHandler.handle(error);
      
      expect(result.message).toBe('You don\'t have permission to perform this action');
      expect(result.code).toBe('PERMISSION_DENIED');
    });

    test('should handle unknown error', () => {
      const error = { unknown: 'property' };
      const result = ApiErrorHandler.handle(error);
      
      expect(result.message).toBe('An unexpected error occurred');
      expect(result.code).toBe('UNKNOWN_ERROR');
    });
  });

  describe('isNetworkError', () => {
    test('should identify network errors', () => {
      expect(ApiErrorHandler.isNetworkError({ message: 'Failed to fetch' })).toBe(true);
      expect(ApiErrorHandler.isNetworkError({ message: 'Network Error' })).toBe(true);
      expect(ApiErrorHandler.isNetworkError({ message: 'Other error' })).toBe(false);
    });
  });

  describe('isAuthError', () => {
    test('should identify auth errors', () => {
      expect(ApiErrorHandler.isAuthError({ message: 'JWT expired' })).toBe(true);
      expect(ApiErrorHandler.isAuthError({ message: 'not authenticated' })).toBe(true);
      expect(ApiErrorHandler.isAuthError({ code: '42501' })).toBe(true);
      expect(ApiErrorHandler.isAuthError({ message: 'Other error' })).toBe(false);
    });
  });

  describe('handleLocationError', () => {
    test('should handle permission denied error', () => {
      const error = { code: 1 };
      const result = ApiErrorHandler.handleLocationError(error);
      
      expect(result.type).toBe('permission');
      expect(result.message).toContain('Location access denied');
    });

    test('should handle location unavailable error', () => {
      const error = { code: 2 };
      const result = ApiErrorHandler.handleLocationError(error);
      
      expect(result.type).toBe('unavailable');
      expect(result.message).toContain('Location unavailable');
    });

    test('should handle timeout error', () => {
      const error = { code: 3 };
      const result = ApiErrorHandler.handleLocationError(error);
      
      expect(result.type).toBe('timeout');
      expect(result.message).toContain('timed out');
    });

    test('should handle custom timeout error', () => {
      const error = { message: 'Timeout: Location request took too long' };
      const result = ApiErrorHandler.handleLocationError(error);
      
      expect(result.type).toBe('timeout');
      expect(result.message).toContain('timed out');
    });

    test('should handle network error', () => {
      const error = { message: 'Failed to fetch data' };
      const result = ApiErrorHandler.handleLocationError(error);
      
      expect(result.type).toBe('network');
      expect(result.message).toContain('Network error');
    });

    test('should handle geocoding error', () => {
      const error = { message: 'geocoding failed' };
      const result = ApiErrorHandler.handleLocationError(error);
      
      expect(result.type).toBe('geocoding');
      expect(result.message).toContain('Unable to determine your city');
    });

    test('should handle unknown location error', () => {
      const error = { message: 'Unknown location error' };
      const result = ApiErrorHandler.handleLocationError(error);
      
      expect(result.type).toBe('unavailable');
      expect(result.message).toBe('Failed to get location');
    });
  });
});