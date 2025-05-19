import { FC, ReactNode } from 'react';
import Sidebar from './Sidebar';
import { AppKit } from '@/context/AppKit';

interface LayoutProps {
  children: ReactNode;
}

const Layout: FC<LayoutProps> = ({ children }) => {
  return (
    <AppKit>
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <div className="pl-64">
          <main className="p-8">
            {children}
          </main>
        </div>
      </div>
    </AppKit>
  );
};

export default Layout; 