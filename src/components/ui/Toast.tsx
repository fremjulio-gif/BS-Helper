'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, m } from 'motion/react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { useSettings } from '@/lib/settings-context';
import { springSnappy, reducedTransition } from '@/lib/motion-tokens';

type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const { reduceMotion } = useSettings();

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts((prev) => [...prev.slice(-2), { id, type, message }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Floating Toast Container */}
      <div className="fixed top-20 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-2">
        <AnimatePresence>
          {toasts.map((toast) => (
            <m.div
              key={toast.id}
              initial={
                reduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, y: -20, scale: 0.95 }
              }
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={
                reduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, y: -15, scale: 0.9 }
              }
              transition={reduceMotion ? reducedTransition : springSnappy}
              className={`pointer-events-auto p-3.5 rounded-2xl border-3 border-[#070b16] shadow-[0_4px_0_#070b16] flex items-center justify-between gap-3 text-xs sm:text-sm font-cartoon select-none ${
                toast.type === 'success'
                  ? 'bg-gradient-to-r from-[#173a2a] to-[#1b4332] text-[#4ade80]'
                  : toast.type === 'error'
                  ? 'bg-gradient-to-r from-[#3f1620] to-[#4c1d29] text-[#f87171]'
                  : 'bg-gradient-to-r from-[#18214a] to-[#1e2a5e] text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {toast.type === 'success' && (
                  <CheckCircle2 className="w-5 h-5 text-[#4ade80] shrink-0" />
                )}
                {toast.type === 'error' && (
                  <AlertTriangle className="w-5 h-5 text-[#f87171] shrink-0" />
                )}
                {toast.type === 'info' && (
                  <Info className="w-5 h-5 text-[#00d9ff] shrink-0" />
                )}
                <span className="leading-snug">{toast.message}</span>
              </div>

              <button
                onClick={() => removeToast(toast.id)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </m.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return { showToast: () => {} };
  }
  return ctx;
}
