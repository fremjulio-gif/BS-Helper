'use client';

import React from 'react';

interface TabHeaderProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  rightElement?: React.ReactNode;
  className?: string;
}

export function TabHeader({
  icon,
  title,
  subtitle,
  rightElement,
  className = '',
}: TabHeaderProps) {
  return (
    <div
      className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 ${className}`}
    >
      <div className="flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-2xl bg-[#ffc700] border-2 border-[#070b16] shadow-[0_3px_0_#070b16] text-[#070b16] flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div>
          <h2 className="font-cartoon text-xl sm:text-2xl text-white tracking-wide text-stroke-sm leading-tight">
            {title}
          </h2>
          <p className="text-sm text-slate-300 font-medium leading-relaxed mt-0.5">
            {subtitle}
          </p>
        </div>
      </div>

      {rightElement && (
        <div className="w-full sm:w-auto flex items-center gap-2 shrink-0">
          {rightElement}
        </div>
      )}
    </div>
  );
}
