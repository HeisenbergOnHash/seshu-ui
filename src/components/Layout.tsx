import { Outlet } from 'react-router-dom';
import { TopBar } from './TopBar';
import { BottomNav } from './BottomNav';
import { Sidebar } from './Sidebar';
import { PageTransition } from './PageTransition';

export function Layout() {
  return (
    <div className="flex min-h-dvh w-full max-w-[100vw] overflow-x-hidden mesh-bg text-foreground">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col md:ml-60">
        <TopBar />
        <main className="flex-1 min-w-0 overflow-x-hidden overflow-y-auto content-pb-nav md:pb-6">
          <div className="page-shell mx-auto max-w-5xl p-3 sm:p-4 md:p-6">
            <PageTransition>
              <Outlet />
            </PageTransition>
          </div>
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
