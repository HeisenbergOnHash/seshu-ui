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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 pb-20 backdrop-blur-sm">
      <div 
        className="absolute inset-0" 
        onClick={onClose}
      />
      <div 
        className={cn(
          "relative w-full max-w-lg max-h-[85vh] flex flex-col rounded-xl border bg-card p-4 sm:p-6 shadow-lg animate-in fade-in zoom-in-95",
          className
        )}
      >
        <div className="flex items-center justify-between mb-4 shrink-0">
          <h2 className="text-xl font-bold tracking-tight">{title}</h2>
          <button 
            onClick={onClose}
            className="rounded-full p-2 hover:bg-muted transition-colors shrink-0"
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
