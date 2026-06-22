import { NavLink } from 'react-router-dom';
import { Home, Users, Wallet, FileText } from 'lucide-react';
import { cn } from '../lib/utils';

export function BottomNav() {
  const links = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/borrowers', icon: Users, label: 'Borrowers' },
    { to: '/wallet', icon: Wallet, label: 'Wallet' },
    { to: '/reports', icon: FileText, label: 'Reports' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t bg-background pb-safe z-50">
      <div className="flex h-16 items-center justify-around px-4">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center w-16 h-full text-muted-foreground transition-colors',
                isActive && 'text-primary font-medium'
              )
            }
          >
            <link.icon className="h-6 w-6 mb-1" />
            <span className="text-[10px]">{link.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
