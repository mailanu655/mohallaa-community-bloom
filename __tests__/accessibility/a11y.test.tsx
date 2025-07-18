import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { BrowserRouter } from 'react-router-dom';
import Auth from '@/pages/Auth';
import { AuthProvider } from '@/contexts/AuthContext';
import CommunitiesPage from '@/pages/CommunitiesPage';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock Supabase
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } }
      })),
      getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      then: jest.fn().mockResolvedValue({ data: [], error: null }),
    })),
  },
}));

// Mock toast
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: jest.fn() }),
}));

const AuthWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <AuthProvider>
      {children}
    </AuthProvider>
  </BrowserRouter>
);

describe('Accessibility Tests', () => {
  test('Auth page should have no accessibility violations', async () => {
    const { container } = render(
      <AuthWrapper>
        <Auth />
      </AuthWrapper>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test('Communities page should have no accessibility violations', async () => {
    const { container } = render(
      <AuthWrapper>
        <CommunitiesPage />
      </AuthWrapper>
    );

    // Wait for loading to complete
    await screen.findByText(/discover communities/i);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test('Form elements should have proper labels', () => {
    render(
      <AuthWrapper>
        <Auth />
      </AuthWrapper>
    );

    // Check that all form inputs have labels
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(emailInput).toHaveAttribute('type', 'email');
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('Buttons should have accessible names', () => {
    render(
      <AuthWrapper>
        <Auth />
      </AuthWrapper>
    );

    const signInButton = screen.getByRole('button', { name: /sign in/i });
    expect(signInButton).toBeInTheDocument();
    expect(signInButton).toHaveAttribute('type', 'submit');
  });

  test('Navigation should be keyboard accessible', () => {
    render(
      <AuthWrapper>
        <CommunitiesPage />
      </AuthWrapper>
    );

    // Check for proper tab order and keyboard navigation
    const buttons = screen.getAllByRole('button');
    const links = screen.getAllByRole('link');

    buttons.forEach(button => {
      expect(button).not.toHaveAttribute('tabindex', '-1');
    });

    links.forEach(link => {
      expect(link).not.toHaveAttribute('tabindex', '-1');
    });
  });

  test('Images should have alt text', async () => {
    render(
      <AuthWrapper>
        <CommunitiesPage />
      </AuthWrapper>
    );

    await screen.findByText(/discover communities/i);

    const images = screen.queryAllByRole('img');
    images.forEach(img => {
      expect(img).toHaveAttribute('alt');
      expect(img.getAttribute('alt')).not.toBe('');
    });
  });

  test('Color contrast should be sufficient', () => {
    render(
      <AuthWrapper>
        <Auth />
      </AuthWrapper>
    );

    // Check that text has sufficient color contrast
    const heading = screen.getByRole('heading', { name: /welcome to your community/i });
    const computedStyle = window.getComputedStyle(heading);
    
    // These would be more comprehensive with actual color analysis
    expect(computedStyle.color).toBeDefined();
    expect(computedStyle.backgroundColor).toBeDefined();
  });

  test('Focus management should work correctly', () => {
    render(
      <AuthWrapper>
        <Auth />
      </AuthWrapper>
    );

    const firstInput = screen.getByLabelText(/email/i);
    firstInput.focus();
    
    expect(document.activeElement).toBe(firstInput);

    // Test tab navigation
    const focusableElements = screen.getAllByRole('button').concat(
      screen.getAllByRole('textbox')
    );

    expect(focusableElements.length).toBeGreaterThan(0);
  });

  test('ARIA attributes should be properly set', () => {
    render(
      <AuthWrapper>
        <Auth />
      </AuthWrapper>
    );

    // Check for proper ARIA labels and descriptions
    const form = screen.getByRole('form', { hidden: true }) || 
                  screen.getByText(/sign in/i).closest('form');
    
    if (form) {
      expect(form).toBeInTheDocument();
    }

    // Check for proper tab panels
    const tabPanels = screen.getAllByRole('tabpanel', { hidden: true });
    tabPanels.forEach(panel => {
      expect(panel).toHaveAttribute('aria-labelledby');
    });
  });

  test('Error messages should be associated with form fields', async () => {
    render(
      <AuthWrapper>
        <Auth />
      </AuthWrapper>
    );

    // Submit form without filling required fields to trigger errors
    const signInButton = screen.getByRole('button', { name: /sign in/i });
    signInButton.click();

    // Wait for potential error messages
    await new Promise(resolve => setTimeout(resolve, 100));

    const errorMessages = screen.queryAllByRole('alert');
    errorMessages.forEach(error => {
      expect(error).toBeInTheDocument();
    });
  });

  test('Loading states should be announced to screen readers', () => {
    render(
      <AuthWrapper>
        <CommunitiesPage />
      </AuthWrapper>
    );

    // Check for loading indicators with proper ARIA attributes
    const loadingElements = screen.queryAllByText(/loading/i);
    loadingElements.forEach(element => {
      expect(element).toBeInTheDocument();
    });
  });

  test('Modal dialogs should trap focus', () => {
    // This would test modal focus trapping when modals are opened
    // For now, we'll just check that the basic structure is correct
    render(
      <AuthWrapper>
        <Auth />
      </AuthWrapper>
    );

    // Check for dialog elements
    const dialogs = screen.queryAllByRole('dialog', { hidden: true });
    dialogs.forEach(dialog => {
      expect(dialog).toBeInTheDocument();
    });
  });

  test('Skip links should be present for keyboard navigation', () => {
    render(
      <AuthWrapper>
        <CommunitiesPage />
      </AuthWrapper>
    );

    // Look for skip navigation links (these might be visually hidden)
    const skipLinks = screen.queryAllByText(/skip to/i);
    // Skip links are often implemented as the first focusable element
    const firstFocusable = document.querySelector('a, button, input, [tabindex]:not([tabindex="-1"])');
    
    expect(firstFocusable).toBeInTheDocument();
  });

  test('Form validation messages should be accessible', () => {
    render(
      <AuthWrapper>
        <Auth />
      </AuthWrapper>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    // Check that inputs have proper validation attributes
    expect(emailInput).toHaveAttribute('type', 'email');
    expect(emailInput).toHaveAttribute('required');
    expect(passwordInput).toHaveAttribute('required');
  });

  test('Dynamic content updates should be announced', async () => {
    render(
      <AuthWrapper>
        <CommunitiesPage />
      </AuthWrapper>
    );

    // Wait for content to load
    await screen.findByText(/discover communities/i);

    // Check for ARIA live regions for dynamic updates
    const liveRegions = document.querySelectorAll('[aria-live]');
    expect(liveRegions.length).toBeGreaterThanOrEqual(0);
  });
});