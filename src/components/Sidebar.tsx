import { NavLink } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthProvider';
import { navItems } from '../config/navigation';
import { cn } from '../lib/utils';

export function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="hidden md:flex fixed inset-y-0 left-0 z-40 w-60 flex-col border-r border-border/50 bg-background/90 backdrop-blur-xl">
      <div className="flex h-14 items-center border-b px-4">
        <h1 className="text-lg font-semibold tracking-tight">FinManager</h1>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )
            }
          >
            <link.icon className="h-5 w-5 shrink-0" />
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <User className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="font-medium text-sm truncate">{user?.name || 'User'}</div>
            <div className="text-xs text-muted-foreground truncate">{user?.phone}</div>
          </div>
        </div>
        <div className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-secondary text-secondary-foreground">
          {user?.role}
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
