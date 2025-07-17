import React, { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  section: string;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class SectionErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`Error in ${this.props.section} section:`, error, errorInfo);
    
    // In production, you might want to send this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: reportError(error, { section: this.props.section, ...errorInfo });
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  handleGoHome = () => {
    window.location.href = '/home';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const sectionMessages = {
        community: {
          title: 'Community Error',
          description: 'There was an issue loading the community content.',
        },
        marketplace: {
          title: 'Marketplace Error',
          description: 'There was an issue loading the marketplace.',
        },
        events: {
          title: 'Events Error',
          description: 'There was an issue loading the events.',
        },
        business: {
          title: 'Business Error',
          description: 'There was an issue loading the business content.',
        },
        advertising: {
          title: 'Advertising Error',
          description: 'There was an issue loading the advertising dashboard.',
        },
        profile: {
          title: 'Profile Error',
          description: 'There was an issue loading your profile.',
        },
        content: {
          title: 'Content Error',
          description: 'There was an issue loading the content.',
        },
        general: {
          title: 'Application Error',
          description: 'Something went wrong.',
        },
      };

      const message = sectionMessages[this.props.section as keyof typeof sectionMessages] || sectionMessages.general;

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 text-destructive">
                <AlertTriangle className="h-full w-full" />
              </div>
              <CardTitle className="text-xl">{message.title}</CardTitle>
              <CardDescription>{message.description}</CardDescription>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4 text-left">
                  <summary className="cursor-pointer text-sm font-medium">Error Details</summary>
                  <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">
                    {this.state.error.message}
                  </pre>
                </details>
              )}
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                onClick={this.handleRetry} 
                className="w-full"
                variant="default"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
              <Button 
                onClick={this.handleGoHome} 
                className="w-full"
                variant="outline"
              >
                <Home className="mr-2 h-4 w-4" />
                Go to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default SectionErrorBoundary;