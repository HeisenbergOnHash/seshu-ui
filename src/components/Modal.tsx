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
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4 backdrop-blur-sm">
      <div
        className="absolute inset-0"
        onClick={onClose}
      />
      <div
        className={cn(
          'relative w-full max-w-lg max-h-[85dvh] flex flex-col rounded-t-2xl sm:rounded-xl border bg-card p-4 sm:p-6 shadow-lg animate-in fade-in zoom-in-95 pb-safe',
          'sm:max-h-[85vh] sm:mb-0',
          className
        )}
      >
        <div className="flex items-center justify-between mb-4 shrink-0">
          <h2 className="text-xl font-bold tracking-tight">{title}</h2>
          <button
            onClick={onClose}
            className="touch-target rounded-full hover:bg-muted transition-colors shrink-0"
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
