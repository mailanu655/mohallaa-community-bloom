import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CreatePostForm from '@/components/CreatePostForm';
import { AuthProvider } from '@/contexts/AuthContext';
import { mockSupabaseClient } from '../mocks/supabase';

// Mock toast hook
const mockToast = jest.fn();
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

// Mock FileUploader component
jest.mock('@/components/FileUploader', () => {
  return function MockFileUploader({ onUploadComplete }: any) {
    return (
      <button 
        onClick={() => onUploadComplete({ url: 'http://example.com/image.jpg' })}
        data-testid="file-uploader"
      >
        Upload File
      </button>
    );
  };
});

const mockCommunities = [
  { id: '1', name: 'Test Community 1' },
  { id: '2', name: 'Test Community 2' },
];

const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
};

// Mock AuthContext
jest.mock('@/contexts/AuthContext', () => ({
  ...jest.requireActual('@/contexts/AuthContext'),
  useAuth: () => ({
    user: mockUser,
    session: { user: mockUser },
    loading: false,
  }),
}));

describe('CreatePostForm Integration', () => {
  const mockOnPostCreated = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabaseClient.from.mockReturnValue({
      insert: jest.fn().mockResolvedValue({ error: null }),
    });
  });

  test('should render form with all fields', () => {
    render(
      <CreatePostForm 
        communities={mockCommunities}
        onPostCreated={mockOnPostCreated}
      />
    );

    expect(screen.getByLabelText('Post Type')).toBeInTheDocument();
    expect(screen.getByLabelText('Community (optional)')).toBeInTheDocument();
    expect(screen.getByLabelText('Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Content')).toBeInTheDocument();
    expect(screen.getByLabelText('Media (optional)')).toBeInTheDocument();
  });

  test('should submit post successfully', async () => {
    const mockInsert = jest.fn().mockResolvedValue({ error: null });
    mockSupabaseClient.from.mockReturnValue({
      insert: mockInsert,
    });

    render(
      <CreatePostForm 
        communities={mockCommunities}
        onPostCreated={mockOnPostCreated}
      />
    );

    // Fill out the form
    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'Test Post Title' }
    });
    fireEvent.change(screen.getByLabelText('Content'), {
      target: { value: 'This is a test post content that is long enough.' }
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /create post/i }));

    await waitFor(() => {
      expect(mockInsert).toHaveBeenCalledWith({
        title: 'Test Post Title',
        content: 'This is a test post content that is long enough.',
        post_type: 'discussion',
        community_id: null,
        author_id: 'user-123',
        media_urls: null,
      });
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Post created!',
        description: 'Your post has been shared with the community.',
      });
      expect(mockOnPostCreated).toHaveBeenCalled();
    });
  });

  test('should handle post creation error', async () => {
    const error = { message: 'Database error' };
    const mockInsert = jest.fn().mockResolvedValue({ error });
    mockSupabaseClient.from.mockReturnValue({
      insert: mockInsert,
    });

    render(
      <CreatePostForm 
        communities={mockCommunities}
        onPostCreated={mockOnPostCreated}
      />
    );

    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'Test Post Title' }
    });
    fireEvent.change(screen.getByLabelText('Content'), {
      target: { value: 'This is a test post content.' }
    });

    fireEvent.click(screen.getByRole('button', { name: /create post/i }));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to create post. Please try again.',
        variant: 'destructive',
      });
    });
  });

  test('should not submit when user is not authenticated', async () => {
    // Mock unauthenticated user
    jest.mocked(require('@/contexts/AuthContext').useAuth).mockReturnValue({
      user: null,
      session: null,
      loading: false,
    });

    render(
      <CreatePostForm 
        communities={mockCommunities}
        onPostCreated={mockOnPostCreated}
      />
    );

    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'Test Post Title' }
    });
    fireEvent.change(screen.getByLabelText('Content'), {
      target: { value: 'This is a test post content.' }
    });

    fireEvent.click(screen.getByRole('button', { name: /create post/i }));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Authentication required',
        description: 'Please log in to create a post.',
        variant: 'destructive',
      });
    });
  });

  test('should handle file upload', async () => {
    const mockInsert = jest.fn().mockResolvedValue({ error: null });
    mockSupabaseClient.from.mockReturnValue({
      insert: mockInsert,
    });

    render(
      <CreatePostForm 
        communities={mockCommunities}
        onPostCreated={mockOnPostCreated}
      />
    );

    // Upload a file
    fireEvent.click(screen.getByTestId('file-uploader'));

    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'Test Post with Media' }
    });
    fireEvent.change(screen.getByLabelText('Content'), {
      target: { value: 'This post includes media.' }
    });

    fireEvent.click(screen.getByRole('button', { name: /create post/i }));

    await waitFor(() => {
      expect(mockInsert).toHaveBeenCalledWith({
        title: 'Test Post with Media',
        content: 'This post includes media.',
        post_type: 'discussion',
        community_id: null,
        author_id: 'user-123',
        media_urls: ['http://example.com/image.jpg'],
      });
    });
  });

  test('should use default community when provided', () => {
    render(
      <CreatePostForm 
        communities={mockCommunities}
        onPostCreated={mockOnPostCreated}
        defaultCommunityId="1"
      />
    );

    // Community selector should not be visible when defaultCommunityId is provided
    expect(screen.queryByLabelText('Community (optional)')).not.toBeInTheDocument();
  });

  test('should show loading state during submission', async () => {
    const mockInsert = jest.fn().mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ error: null }), 100))
    );
    mockSupabaseClient.from.mockReturnValue({
      insert: mockInsert,
    });

    render(
      <CreatePostForm 
        communities={mockCommunities}
        onPostCreated={mockOnPostCreated}
      />
    );

    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'Test Post Title' }
    });
    fireEvent.change(screen.getByLabelText('Content'), {
      target: { value: 'This is a test post content.' }
    });

    fireEvent.click(screen.getByRole('button', { name: /create post/i }));

    expect(screen.getByText('Creating...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText('Creating...')).not.toBeInTheDocument();
    });
  });

  test('should reset form after successful submission', async () => {
    const mockInsert = jest.fn().mockResolvedValue({ error: null });
    mockSupabaseClient.from.mockReturnValue({
      insert: mockInsert,
    });

    render(
      <CreatePostForm 
        communities={mockCommunities}
        onPostCreated={mockOnPostCreated}
      />
    );

    const titleInput = screen.getByLabelText('Title') as HTMLInputElement;
    const contentInput = screen.getByLabelText('Content') as HTMLTextAreaElement;

    fireEvent.change(titleInput, {
      target: { value: 'Test Post Title' }
    });
    fireEvent.change(contentInput, {
      target: { value: 'This is a test post content.' }
    });

    fireEvent.click(screen.getByRole('button', { name: /create post/i }));

    await waitFor(() => {
      expect(titleInput.value).toBe('');
      expect(contentInput.value).toBe('');
    });
  });
});