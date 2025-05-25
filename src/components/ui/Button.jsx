'use client';

import { useState } from 'react';
import LoadingSpinner from './LoadingSpinner';

export default function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  className = '',
  type = 'button',
  icon: Icon,
}) {
  const [isPressed, setIsPressed] = useState(false);

  const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-500 shadow-sm hover:shadow',
    secondary: 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500 shadow-sm hover:shadow',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 shadow-sm hover:shadow',
    outline: 'border-2 border-green-500 text-green-500 hover:bg-green-50 focus:ring-green-500',
    ghost: 'text-gray-600 hover:bg-gray-100 focus:ring-gray-500',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const handleClick = (e) => {
    if (!disabled && !loading) {
      setIsPressed(true);
      setTimeout(() => setIsPressed(false), 200);
      onClick?.(e);
    }
  };

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled || loading}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${isPressed ? 'transform scale-95' : ''}
        ${className}
      `}
    >
      {loading ? (
        <LoadingSpinner size="sm" className="mr-2" />
      ) : Icon ? (
        <Icon className={`h-5 w-5 ${children ? 'mr-2' : ''}`} />
      ) : null}
      {children}
    </button>
  );
} 