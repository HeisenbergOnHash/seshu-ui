import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div
        className={cn(
          'relative w-full max-w-lg max-h-[85dvh] flex flex-col glass-panel rounded-t-3xl sm:rounded-2xl p-4 sm:p-6 pb-safe animate-slide-up sm:animate-scale-in',
          'sm:max-h-[85vh]',
          className
        )}
      >
        <div className="flex items-center justify-between mb-4 shrink-0">
          <h2 className="text-lg font-bold tracking-tight">{title}</h2>
          <button
            onClick={onClose}
            className="touch-target rounded-full hover:bg-muted/80 transition-colors duration-200 shrink-0"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto pr-2 -mr-2 flex-1 min-h-0">
          {children}
        </div>
      </div>
    </div>
  );
}
