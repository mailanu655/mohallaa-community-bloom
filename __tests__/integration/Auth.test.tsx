import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Auth from '@/pages/Auth';
import { AuthProvider } from '@/contexts/AuthContext';
import { mockSupabaseClient } from '../mocks/supabase';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock toast hook
const mockToast = jest.fn();
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

const AuthWrapper = () => (
  <BrowserRouter>
    <AuthProvider>
      <Auth />
    </AuthProvider>
  </BrowserRouter>
);

describe('Auth Page Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render auth page with all tabs', () => {
    render(<AuthWrapper />);
    
    expect(screen.getByText('Welcome to Your Community')).toBeInTheDocument();
    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
    expect(screen.getByText('Reset Password')).toBeInTheDocument();
  });

  test('should handle successful sign in', async () => {
    mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({ error: null });
    
    render(<AuthWrapper />);
    
    // Fill in sign in form
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' }
    });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    await waitFor(() => {
      expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Welcome back!',
        description: 'You\'ve successfully signed in.',
      });
      expect(mockNavigate).toHaveBeenCalledWith('/home');
    });
  });

  test('should handle sign in error', async () => {
    const error = { message: 'Invalid credentials' };
    mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({ error });
    
    render(<AuthWrapper />);
    
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'wrongpassword' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  test('should handle successful sign up', async () => {
    mockSupabaseClient.auth.signUp.mockResolvedValue({ error: null });
    
    render(<AuthWrapper />);
    
    // Switch to sign up tab
    fireEvent.click(screen.getByText('Sign Up'));
    
    // Fill in sign up form
    fireEvent.change(screen.getByLabelText('First Name'), {
      target: { value: 'John' }
    });
    fireEvent.change(screen.getByLabelText('Last Name'), {
      target: { value: 'Doe' }
    });
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'john@example.com' }
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' }
    });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    
    await waitFor(() => {
      expect(mockSupabaseClient.auth.signUp).toHaveBeenCalledWith({
        email: 'john@example.com',
        password: 'password123',
        options: {
          emailRedirectTo: 'http://localhost:3000/',
          data: {
            first_name: 'John',
            last_name: 'Doe',
          },
        },
      });
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Account created!',
        description: 'Please check your email to verify your account before signing in.',
      });
    });
  });

  test('should handle password reset', async () => {
    mockSupabaseClient.auth.resetPasswordForEmail.mockResolvedValue({ error: null });
    
    render(<AuthWrapper />);
    
    // Switch to reset password tab
    fireEvent.click(screen.getByText('Reset Password'));
    
    // Fill in email
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' }
    });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /send reset link/i }));
    
    await waitFor(() => {
      expect(mockSupabaseClient.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com',
        { redirectTo: 'http://localhost:3000/auth?tab=reset-password' }
      );
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Password reset email sent!',
        description: 'Check your email for the password reset link.',
      });
    });
  });

  test('should handle social login', async () => {
    mockSupabaseClient.auth.signInWithOAuth.mockResolvedValue({ error: null });
    
    render(<AuthWrapper />);
    
    // Click Google login button
    fireEvent.click(screen.getByText('Continue with Google'));
    
    await waitFor(() => {
      expect(mockSupabaseClient.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: 'http://localhost:3000/home',
        },
      });
    });
  });

  test('should show loading state during authentication', async () => {
    // Mock a slow response
    mockSupabaseClient.auth.signInWithPassword.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ error: null }), 100))
    );
    
    render(<AuthWrapper />);
    
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    expect(screen.getByText('Signing in...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.queryByText('Signing in...')).not.toBeInTheDocument();
    });
  });

  test('should switch between tabs correctly', () => {
    render(<AuthWrapper />);
    
    // Default should show sign in form
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    
    // Switch to sign up
    fireEvent.click(screen.getByText('Sign Up'));
    expect(screen.getByLabelText('First Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Last Name')).toBeInTheDocument();
    
    // Switch to reset password
    fireEvent.click(screen.getByText('Reset Password'));
    expect(screen.getByText('Reset your password')).toBeInTheDocument();
  });
});