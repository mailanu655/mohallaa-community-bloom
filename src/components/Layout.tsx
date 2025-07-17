import { ReactNode, useState } from 'react';
import Header from './Header';
import MobileNav from './MobileNav';
import NavigationSidebar from './NavigationSidebar';
import CreatePostModal from './CreatePostModal';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [createPostModalOpen, setCreatePostModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <MobileNav />
      
      <div className="max-w-6xl mx-auto border-x border-border/50">
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] min-h-screen">
          <NavigationSidebar onCreatePost={() => setCreatePostModalOpen(true)} />
          
          {/* Main content */}
          <div className="pb-20 md:pb-0">
            {children}
          </div>
        </div>
      </div>

      <CreatePostModal 
        open={createPostModalOpen} 
        onOpenChange={setCreatePostModalOpen} 
      />
    </div>
  );
};

export default Layout;