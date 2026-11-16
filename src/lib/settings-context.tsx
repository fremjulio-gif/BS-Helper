'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

interface SettingsContextType {
  reduceMotion: boolean;
  sound: boolean;
  haptics: boolean;
  setReduceMotion: (val: boolean) => void;
  setSound: (val: boolean) => void;
  setHaptics: (val: boolean) => void;
  toggleReduceMotion: () => void;
  toggleSound: () => void;
  toggleHaptics: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  // 1. Reduced motion: follows OS prefers-reduced-motion by default unless overridden in localStorage
  const [reduceMotion, setReduceMotionState] = useState<boolean>(false);
  // 2. Sound: disabled by default
  const [sound, setSoundState] = useState<boolean>(false);
  // 3. Haptics: disabled by default
  const [haptics, setHapticsState] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check system preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const savedMotion = localStorage.getItem('bs_setting_reduce_motion');

    if (savedMotion !== null) {
      setReduceMotionState(savedMotion === 'true');
    } else {
      setReduceMotionState(mediaQuery.matches);
    }

    // Listen to OS changes if user hasn't explicitly set a custom preference
    const handleChange = (e: MediaQueryListEvent) => {
      if (localStorage.getItem('bs_setting_reduce_motion') === null) {
        setReduceMotionState(e.matches);
      }
    };
    mediaQuery.addEventListener('change', handleChange);

    // Read sound & haptics (default false)
    const savedSound = localStorage.getItem('bs_setting_sound');
    if (savedSound !== null) {
      setSoundState(savedSound === 'true');
    }

    const savedHaptics = localStorage.getItem('bs_setting_haptics');
    if (savedHaptics !== null) {
      setHapticsState(savedHaptics === 'true');
    }

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const setReduceMotion = useCallback((val: boolean) => {
    setReduceMotionState(val);
    localStorage.setItem('bs_setting_reduce_motion', String(val));
  }, []);

  const setSound = useCallback((val: boolean) => {
    setSoundState(val);
    localStorage.setItem('bs_setting_sound', String(val));
  }, []);

  const setHaptics = useCallback((val: boolean) => {
    setHapticsState(val);
    localStorage.setItem('bs_setting_haptics', String(val));
  }, []);

  const toggleReduceMotion = useCallback(() => {
    setReduceMotion(!reduceMotion);
  }, [reduceMotion, setReduceMotion]);

  const toggleSound = useCallback(() => {
    setSound(!sound);
  }, [sound, setSound]);

  const toggleHaptics = useCallback(() => {
    setHaptics(!haptics);
  }, [haptics, setHaptics]);

  return (
    <SettingsContext.Provider
      value={{
        reduceMotion,
        sound,
        haptics,
        setReduceMotion,
        setSound,
        setHaptics,
        toggleReduceMotion,
        toggleSound,
        toggleHaptics,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextType {
  const context = useContext(SettingsContext);
  if (!context) {
    // Safe fallback if used outside provider (e.g. tests or isolated components)
    return {
      reduceMotion: false,
      sound: false,
      haptics: false,
      setReduceMotion: () => {},
      setSound: () => {},
      setHaptics: () => {},
      toggleReduceMotion: () => {},
      toggleSound: () => {},
      toggleHaptics: () => {},
    };
  }
  return context;
}
