'use client';

import React, { forwardRef } from 'react';
import { useSettings } from '@/lib/settings-context';

export interface GlassSurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  level?: 'subtle' | 'pronounced';
  floating?: boolean;
  forceOpaque?: boolean;
  as?: React.ElementType;
  className?: string;
  children: React.ReactNode;
}

export const GlassSurface = forwardRef<HTMLDivElement, GlassSurfaceProps>(
  (
    {
      level = 'subtle',
      floating = true,
      forceOpaque = false,
      as: Component = 'div',
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const { reduceTransparency } = useSettings();
    const isOpaque = forceOpaque || reduceTransparency;

    const glassClass = isOpaque
      ? level === 'pronounced'
        ? 'liquid-glass-pronounced-opaque'
        : 'liquid-glass-subtle-opaque'
      : level === 'pronounced'
      ? 'liquid-glass-pronounced'
      : 'liquid-glass-subtle';

    const floatingClass = floating ? 'rounded-3xl' : '';

    return (
      <Component
        ref={ref}
        className={`${glassClass} ${floatingClass} ${className}`}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

GlassSurface.displayName = 'GlassSurface';
