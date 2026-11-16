'use client';

import React from 'react';
import { soundManager } from '@/lib/sound-manager';

export type ButtonVariant = 'yellow' | 'cyan' | 'green' | 'red' | 'dark';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export function Button({
  variant = 'yellow',
  size = 'md',
  icon,
  children,
  className = '',
  onClick,
  disabled,
  ...props
}: ButtonProps) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs min-h-[40px]',
    md: 'px-4 py-2.5 text-sm min-h-[44px]',
    lg: 'px-6 py-3.5 text-base min-h-[50px]',
  }[size];

  const variantClass = {
    yellow: 'brawl-btn-yellow',
    cyan: 'brawl-btn-cyan',
    green: 'brawl-btn-green',
    red: 'brawl-btn-red',
    dark: 'brawl-btn-dark',
  }[variant];

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      soundManager.playTap();
      if (onClick) onClick(e);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`brawl-btn ${variantClass} ${sizeClasses} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span className="font-cartoon tracking-wide">{children}</span>
    </button>
  );
}
