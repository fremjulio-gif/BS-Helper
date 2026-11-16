'use client';

import React from 'react';

export type BadgeTone = 'yellow' | 'cyan' | 'green' | 'red' | 'purple' | 'dark';

interface StatBadgeProps {
  icon?: React.ReactNode;
  label: string;
  value: string | number;
  subValue?: string;
  tone?: BadgeTone;
  className?: string;
}

export function StatBadge({
  icon,
  label,
  value,
  subValue,
  tone = 'yellow',
  className = '',
}: StatBadgeProps) {
  const toneBg = {
    yellow: 'bg-[#ffc700]/15 border-[#ffc700]/40 text-[#ffc700]',
    cyan: 'bg-[#00d9ff]/15 border-[#00d9ff]/40 text-[#00d9ff]',
    green: 'bg-[#22c55e]/15 border-[#22c55e]/40 text-[#22c55e]',
    red: 'bg-[#ef4444]/15 border-[#ef4444]/40 text-[#ef4444]',
    purple: 'bg-[#a855f7]/15 border-[#a855f7]/40 text-[#c084fc]',
    dark: 'bg-[#0d132c]/80 border-white/10 text-slate-200',
  }[tone];

  return (
    <div
      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border-2 shadow-[0_3px_0_#070b16] ${toneBg} ${className}`}
    >
      {icon && <div className="shrink-0">{icon}</div>}
      <div className="flex flex-col min-w-0">
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-300 leading-none truncate">
          {label}
        </span>
        <div className="flex items-baseline gap-1 mt-0.5">
          <span className="font-cartoon text-base sm:text-lg text-white leading-tight">
            {value}
          </span>
          {subValue && (
            <span className="text-[10px] font-bold text-slate-400 leading-none">
              {subValue}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
