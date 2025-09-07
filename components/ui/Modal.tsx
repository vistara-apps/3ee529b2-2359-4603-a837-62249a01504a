'use client';

import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
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
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className={cn('modal-content', className)}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between mb-lg">
            <h2 className="text-xl font-semibold text-textPrimary">{title}</h2>
            <button
              onClick={onClose}
              className="p-xs hover:bg-gray-100 rounded-md transition-colors duration-200"
            >
              <X className="w-5 h-5 text-textSecondary" />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
