import { Suspense } from 'react';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import SectionErrorBoundary from '@/components/errors/SectionErrorBoundary';
import LoadingSpinner from '@/components/loading/LoadingSpinner';
import { RouteConfig } from './config';

interface RouteWrapperProps {
  route: RouteConfig;
  children: React.ReactNode;
}

const RouteWrapper = ({ route, children }: RouteWrapperProps) => {
  let wrappedElement = children;

  // Wrap with Suspense for lazy loading
  wrappedElement = (
    <Suspense fallback={<LoadingSpinner message="Loading page..." />}>
      {wrappedElement}
    </Suspense>
  );

  // Wrap with ProtectedRoute if needed
  if (route.protected) {
    wrappedElement = (
      <ProtectedRoute>
        {wrappedElement}
      </ProtectedRoute>
    );
  }

  // Wrap with Layout if needed
  if (route.layout) {
    wrappedElement = (
      <Layout>
        {wrappedElement}
      </Layout>
    );
  }

  // Wrap with SectionErrorBoundary if specified
  if (route.errorBoundary) {
    wrappedElement = (
      <SectionErrorBoundary section={route.errorBoundary}>
        {wrappedElement}
      </SectionErrorBoundary>
    );
  }

  return <>{wrappedElement}</>;
};

export default RouteWrapper;