import { LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthProvider';
import { useNavigate } from 'react-router-dom';

export function TopBar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-border/50 bg-background/80 backdrop-blur-xl px-4 pt-safe">
      <h1 className="text-lg font-semibold tracking-tight md:hidden">FinManager</h1>

      <div className="flex items-center gap-1 md:ml-auto">
        <button
          onClick={handleLogout}
          className="touch-target rounded-full text-destructive hover:bg-destructive/10 transition-colors md:hidden"
          aria-label="Logout"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
