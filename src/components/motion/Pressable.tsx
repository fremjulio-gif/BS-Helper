'use client';

import React, { forwardRef } from 'react';
import { m, HTMLMotionProps } from 'motion/react';
import { useSettings } from '@/lib/settings-context';
import { springSnappy } from '@/lib/motion-tokens';

export interface PressableProps extends HTMLMotionProps<'button'> {
  children: React.ReactNode;
  /** Force scale factor on tap, default 0.96 */
  tapScale?: number;
  /** Extra Y translation on tap (simulating 3D button press), default 2px */
  pressY?: number;
  className?: string;
  disabled?: boolean;
}

export const Pressable = forwardRef<HTMLButtonElement, PressableProps>(
  (
    {
      children,
      tapScale = 0.96,
      pressY = 2,
      className = '',
      disabled = false,
      ...props
    },
    ref
  ) => {
    const { reduceMotion } = useSettings();

    // In reduced motion or disabled mode, avoid transform animations
    const shouldAnimate = !disabled && !reduceMotion;

    return (
      <m.button
        ref={ref}
        disabled={disabled}
        whileHover={shouldAnimate ? { scale: 1.02 } : undefined}
        whileTap={shouldAnimate ? { scale: tapScale, y: pressY } : undefined}
        transition={springSnappy}
        className={`focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#12183b] select-none ${className}`}
        {...props}
      >
        {children}
      </m.button>
    );
  }
);

Pressable.displayName = 'Pressable';
