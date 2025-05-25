'use client';

import { useState, useEffect } from 'react';
import { FaCheckCircle, FaTimesCircle, FaInfoCircle, FaExclamationTriangle } from 'react-icons/fa';

const TOAST_TYPES = {
  success: {
    icon: FaCheckCircle,
    bgColor: 'bg-green-500',
    textColor: 'text-white',
  },
  error: {
    icon: FaTimesCircle,
    bgColor: 'bg-red-500',
    textColor: 'text-white',
  },
  info: {
    icon: FaInfoCircle,
    bgColor: 'bg-blue-500',
    textColor: 'text-white',
  },
  warning: {
    icon: FaExclamationTriangle,
    bgColor: 'bg-yellow-500',
    textColor: 'text-white',
  },
};

export default function Toast({ message, type = 'info', duration = 3000, onClose }) {
  const [isVisible, setIsVisible] = useState(true);
  const ToastIcon = TOAST_TYPES[type]?.icon;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  return (
    <div
      className={`
        fixed bottom-4 right-4 flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg
        transform transition-all duration-300 ease-in-out
        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}
        ${TOAST_TYPES[type]?.bgColor} ${TOAST_TYPES[type]?.textColor}
      `}
      role="alert"
    >
      {ToastIcon && <ToastIcon className="h-5 w-5" />}
      <p className="font-medium">{message}</p>
      <button
        onClick={() => {
          setIsVisible(false);
          onClose?.();
        }}
        className="ml-4 hover:opacity-80 transition-opacity"
      >
        ×
      </button>
    </div>
  );
} 