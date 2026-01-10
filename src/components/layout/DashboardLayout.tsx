import {type ReactNode, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-stone-50">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="md:ml-64 pt-16">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        <main
          className="p-6 md:p-8 lg:p-12"
          data-testid="main-content"
        >
          {children}
        </main>
      </div>
    </div>
  );
};
