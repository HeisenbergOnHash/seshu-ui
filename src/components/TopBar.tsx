import { useState } from 'react';
import { Moon, Sun, Menu, X, LogOut, User, Settings } from 'lucide-react';
import { useTheme } from '../contexts/ThemeProvider';
import { useAuth } from '../contexts/AuthProvider';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

export function TopBar() {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const closeSidebar = () => setIsSidebarOpen(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    closeSidebar();
  };

  return (
    <>
      <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-border/50 bg-background/80 backdrop-blur-xl px-4 pt-safe">
        <div className="flex items-center gap-2">
          <button
            className="touch-target -ml-2 text-foreground md:hidden"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-semibold tracking-tight md:hidden">FinManager</h1>
        </div>

        <div className="flex items-center gap-1 md:ml-auto">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="touch-target rounded-full text-foreground hover:bg-muted transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity md:hidden"
          onClick={closeSidebar}
        />
      )}

      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-3/4 max-w-xs bg-background border-r shadow-xl transition-transform duration-300 ease-in-out transform md:hidden',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b pt-safe">
            <h2 className="text-xl font-bold tracking-tight">FinManager</h2>
            <button onClick={closeSidebar} className="touch-target rounded-full hover:bg-muted transition-colors" aria-label="Close menu">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-4 border-b">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <User className="h-5 w-5" />
              </div>
              <div>
                <div className="font-medium text-sm">{user?.name || 'User'}</div>
                <div className="text-xs text-muted-foreground">{user?.phone}</div>
              </div>
            </div>
            <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-secondary text-secondary-foreground">
              {user?.role}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto py-2">
            <nav className="flex flex-col px-2 space-y-1">
              <button className="flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium hover:bg-muted text-foreground transition-colors w-full text-left">
                <Settings className="h-4 w-4" />
                Settings
              </button>
            </nav>
          </div>

          <div className="p-4 border-t pb-safe">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium hover:bg-destructive/10 text-destructive transition-colors w-full text-left"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
