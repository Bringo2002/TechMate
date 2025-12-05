import UserSidebar from '../components/user-dashboard/UserSidebar';

import { ReactNode } from 'react';

export default function UserDashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen">
      <UserSidebar />
      <main className="flex-1 p-4 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
