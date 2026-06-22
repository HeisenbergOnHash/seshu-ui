import { Plus } from 'lucide-react';
import { cn } from '../lib/utils';

type FABProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export function FAB({ className, ...props }: FABProps) {
  return (
    <button
      className={cn(
        'fixed bottom-20 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl shadow-primary/30 transition-all duration-300 pb-safe md:bottom-6 md:right-8',
        'hover:bg-primary/90 hover:scale-105 active:scale-95',
        className
      )}
      {...props}
    >
      <Plus className="h-6 w-6" />
    </button>
  );
}
