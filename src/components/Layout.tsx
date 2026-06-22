import { Outlet } from 'react-router-dom';
import { TopBar } from './TopBar';
import { BottomNav } from './BottomNav';
import { Sidebar } from './Sidebar';

export function Layout() {
  return (
    <div className="flex min-h-dvh bg-background text-foreground">
      <Sidebar />
      <div className="flex flex-1 flex-col md:ml-60">
        <TopBar />
        <main className="flex-1 overflow-y-auto content-pb-nav md:pb-6">
          <div className="mx-auto w-full max-w-5xl p-4 md:p-6">
            <Outlet />
          </div>
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
