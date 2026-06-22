import { NavLink } from 'react-router-dom';
import { cn } from '../lib/utils';
import { navItems } from '../config/navigation';

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-background/85 backdrop-blur-xl pb-safe md:hidden">
      <div className="flex h-16 items-center justify-around px-2">
        {navItems.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) =>
              cn(
                'relative flex flex-col items-center justify-center w-16 h-full text-muted-foreground transition-all duration-300',
                isActive && 'text-primary'
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute top-1 h-1 w-8 rounded-full bg-primary transition-all duration-300" />
                )}
                <link.icon className={cn('h-6 w-6 mb-0.5 transition-transform duration-300', isActive && 'scale-110')} />
                <span className={cn('text-xs transition-all duration-300', isActive && 'font-semibold')}>
                  {link.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
