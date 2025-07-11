import { z } from 'zod';

// Common validation schemas
export const emailSchema = z.string().email('Please enter a valid email address');
export const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');
export const nameSchema = z.string().min(1, 'This field is required').max(50, 'Too long');

// Profile validation
export const profileSchema = z.object({
  first_name: nameSchema,
  last_name: nameSchema,
  email: emailSchema,
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  profession: z.string().max(100, 'Profession must be less than 100 characters').optional(),
  hometown_india: z.string().max(100, 'Hometown must be less than 100 characters').optional(),
  current_address: z.string().max(200, 'Address must be less than 200 characters').optional(),
  linkedin_url: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  skills: z.array(z.string()).max(10, 'Maximum 10 skills allowed').optional(),
  interests: z.array(z.string()).max(10, 'Maximum 10 interests allowed').optional(),
});

// Community validation
export const communitySchema = z.object({
  name: z.string().min(3, 'Community name must be at least 3 characters').max(100, 'Name too long'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  city: z.string().min(1, 'City is required').max(50, 'City name too long'),
  state: z.string().min(1, 'State is required').max(50, 'State name too long'),
  zip_code: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code format').optional(),
  type: z.enum(['city', 'neighborhood', 'region']),
  privacy_type: z.enum(['public', 'private']),
});

// Post validation
export const postSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200, 'Title too long'),
  content: z.string().min(10, 'Content must be at least 10 characters').max(5000, 'Content too long'),
  post_type: z.enum(['discussion', 'question', 'announcement', 'resource', 'event', 'job', 'housing', 'marketplace', 'recommendation', 'safety_alert']),
  tags: z.array(z.string()).max(5, 'Maximum 5 tags allowed').optional(),
});

// Event validation
export const eventSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200, 'Title too long'),
  description: z.string().max(2000, 'Description too long').optional(),
  start_date: z.string().datetime('Invalid date format'),
  end_date: z.string().datetime('Invalid date format').optional(),
  location: z.string().max(200, 'Location too long').optional(),
  address: z.string().max(300, 'Address too long').optional(),
  event_type: z.enum(['cultural', 'professional', 'social', 'religious', 'educational']),
  is_virtual: z.boolean(),
  is_free: z.boolean(),
  ticket_price: z.number().min(0, 'Price cannot be negative').optional(),
  max_attendees: z.number().min(1, 'Must allow at least 1 attendee').optional(),
});

// Join request validation
export const joinRequestSchema = z.object({
  message: z.string().max(500, 'Message must be less than 500 characters').optional(),
});

// Search validation
export const searchSchema = z.object({
  query: z.string().min(1, 'Search query cannot be empty').max(100, 'Search query too long'),
  type: z.enum(['post', 'community', 'user', 'event', 'business']).optional(),
});

// File upload validation
export const fileUploadSchema = z.object({
  file: z.instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, 'File size must be less than 5MB')
    .refine(
      (file) => ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type),
      'File must be an image (JPEG, PNG, WebP, or GIF)'
    ),
});

// Helper function to validate data
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  errors?: Record<string, string>;
} {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return { success: false, errors };
    }
    return { success: false, errors: { general: 'Validation failed' } };
  }
}

// Helper to validate form data and show toast errors
export function validateFormData<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  showToast?: (message: string) => void
): T | null {
  const result = validateData(schema, data);
  
  if (!result.success) {
    const firstError = Object.values(result.errors || {})[0];
    if (showToast && firstError) {
      showToast(firstError);
    }
    return null;
  }
  
  return result.data!;
}