'use client';

import { useEffect, useRef } from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';
import Button from './Button';

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed with this action?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
}) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div 
        ref={dialogRef}
        className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
      >
        <div className="flex items-start mb-4">
          <div className="flex-shrink-0 text-yellow-500">
            <FaExclamationTriangle size={24} />
          </div>
          <div className="ml-3 flex-1">
            <h3 id="dialog-title" className="text-lg font-medium text-gray-900">
              {title}
            </h3>
          </div>
        </div>
        
        <div className="mt-2">
          <p className="text-sm text-gray-500">
            {message}
          </p>
        </div>
        
        <div className="mt-6 flex justify-end space-x-3">
          <Button
            variant="ghost"
            onClick={onClose}
          >
            {cancelText}
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              onConfirm();
            }}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}