import { Plus } from 'lucide-react';
import { cn } from '../lib/utils';

interface FABProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export function FAB({ className, ...props }: FABProps) {
  return (
    <button
      className={cn(
        "fixed bottom-20 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 active:scale-95 transition-transform",
        className
      )}
      {...props}
    >
      <Plus className="h-6 w-6" />
    </button>
  );
}
