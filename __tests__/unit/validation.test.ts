import {
  emailSchema,
  passwordSchema,
  profileSchema,
  communitySchema,
  postSchema,
  eventSchema,
  validateData,
  validateFormData,
} from '@/utils/validation';

describe('Validation Schemas', () => {
  describe('emailSchema', () => {
    test('should validate correct email', () => {
      const result = validateData(emailSchema, 'test@example.com');
      expect(result.success).toBe(true);
      expect(result.data).toBe('test@example.com');
    });

    test('should reject invalid email', () => {
      const result = validateData(emailSchema, 'invalid-email');
      expect(result.success).toBe(false);
      expect(result.errors).toHaveProperty('');
    });
  });

  describe('passwordSchema', () => {
    test('should validate strong password', () => {
      const result = validateData(passwordSchema, 'password123');
      expect(result.success).toBe(true);
    });

    test('should reject short password', () => {
      const result = validateData(passwordSchema, '123');
      expect(result.success).toBe(false);
    });
  });

  describe('profileSchema', () => {
    test('should validate complete profile', () => {
      const profile = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        bio: 'Software developer',
        profession: 'Engineer',
        hometown_india: 'Mumbai',
        current_address: '123 Main St',
        linkedin_url: 'https://linkedin.com/in/johndoe',
        skills: ['JavaScript', 'React'],
        interests: ['Technology', 'Travel'],
      };

      const result = validateData(profileSchema, profile);
      expect(result.success).toBe(true);
    });

    test('should reject profile with invalid URL', () => {
      const profile = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        linkedin_url: 'invalid-url',
      };

      const result = validateData(profileSchema, profile);
      expect(result.success).toBe(false);
    });

    test('should reject profile with too many skills', () => {
      const profile = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        skills: Array(11).fill('skill'), // More than 10 skills
      };

      const result = validateData(profileSchema, profile);
      expect(result.success).toBe(false);
    });
  });

  describe('communitySchema', () => {
    test('should validate community data', () => {
      const community = {
        name: 'Test Community',
        description: 'A test community',
        city: 'New York',
        state: 'NY',
        zip_code: '10001',
        type: 'city' as const,
        privacy_type: 'public' as const,
      };

      const result = validateData(communitySchema, community);
      expect(result.success).toBe(true);
    });

    test('should reject invalid ZIP code', () => {
      const community = {
        name: 'Test Community',
        city: 'New York',
        state: 'NY',
        zip_code: 'invalid',
        type: 'city' as const,
        privacy_type: 'public' as const,
      };

      const result = validateData(communitySchema, community);
      expect(result.success).toBe(false);
    });
  });

  describe('postSchema', () => {
    test('should validate post data', () => {
      const post = {
        title: 'Test Post Title',
        content: 'This is a test post content',
        post_type: 'discussion' as const,
        tags: ['test', 'example'],
      };

      const result = validateData(postSchema, post);
      expect(result.success).toBe(true);
    });

    test('should reject post with short title', () => {
      const post = {
        title: 'Hi',
        content: 'This is a test post content',
        post_type: 'discussion' as const,
      };

      const result = validateData(postSchema, post);
      expect(result.success).toBe(false);
    });

    test('should reject post with too many tags', () => {
      const post = {
        title: 'Test Post Title',
        content: 'This is a test post content',
        post_type: 'discussion' as const,
        tags: Array(6).fill('tag'), // More than 5 tags
      };

      const result = validateData(postSchema, post);
      expect(result.success).toBe(false);
    });
  });

  describe('eventSchema', () => {
    test('should validate event data', () => {
      const event = {
        title: 'Test Event',
        description: 'A test event',
        start_date: '2024-01-01T10:00:00Z',
        end_date: '2024-01-01T12:00:00Z',
        location: 'Test Location',
        address: '123 Test St',
        event_type: 'cultural' as const,
        is_virtual: false,
        is_free: true,
        max_attendees: 100,
      };

      const result = validateData(eventSchema, event);
      expect(result.success).toBe(true);
    });

    test('should reject event with negative price', () => {
      const event = {
        title: 'Test Event',
        start_date: '2024-01-01T10:00:00Z',
        event_type: 'cultural' as const,
        is_virtual: false,
        is_free: false,
        ticket_price: -10,
      };

      const result = validateData(eventSchema, event);
      expect(result.success).toBe(false);
    });
  });

  describe('validateFormData', () => {
    test('should return data on successful validation', () => {
      const mockToast = jest.fn();
      const data = { first_name: 'John', last_name: 'Doe', email: 'john@example.com' };
      
      const result = validateFormData(profileSchema, data, mockToast);
      
      expect(result).toEqual(data);
      expect(mockToast).not.toHaveBeenCalled();
    });

    test('should return null and show toast on validation error', () => {
      const mockToast = jest.fn();
      const data = { first_name: '', last_name: 'Doe', email: 'invalid-email' };
      
      const result = validateFormData(profileSchema, data, mockToast);
      
      expect(result).toBeNull();
      expect(mockToast).toHaveBeenCalled();
    });
  });
});