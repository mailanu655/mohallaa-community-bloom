import { ReactNode } from 'react';
import Header from './Header';
import MobileNav from './MobileNav';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <MobileNav />
      
      {/* Main content with proper spacing for mobile nav */}
      <main className="pt-0 md:pt-0 pb-20 md:pb-0">
        {children}
      </main>
    </div>
  );
};

export default Layout;