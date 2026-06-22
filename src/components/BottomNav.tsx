import { NavLink } from 'react-router-dom';
import { cn } from '../lib/utils';
import { navItems } from '../config/navigation';

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t bg-background pb-safe z-50 md:hidden">
      <div className="flex h-16 items-center justify-around px-2">
        {navItems.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center w-16 h-full text-muted-foreground transition-colors',
                isActive && 'text-primary font-medium'
              )
            }
          >
            <link.icon className="h-6 w-6 mb-1" />
            <span className="text-xs">{link.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
