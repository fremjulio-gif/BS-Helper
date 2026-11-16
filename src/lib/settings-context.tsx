'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

interface SettingsContextType {
  reduceMotion: boolean;
  reduceTransparency: boolean;
  sound: boolean;
  haptics: boolean;
  setReduceMotion: (val: boolean) => void;
  setReduceTransparency: (val: boolean) => void;
  setSound: (val: boolean) => void;
  setHaptics: (val: boolean) => void;
  toggleReduceMotion: () => void;
  toggleReduceTransparency: () => void;
  toggleSound: () => void;
  toggleHaptics: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  // 1. Reduced motion: follows OS prefers-reduced-motion by default unless overridden
  const [reduceMotion, setReduceMotionState] = useState<boolean>(false);
  // 2. Reduced transparency: follows OS prefers-reduced-transparency or prefers-contrast: more by default
  const [reduceTransparency, setReduceTransparencyState] = useState<boolean>(false);
  // 3. Sound: disabled by default
  const [sound, setSoundState] = useState<boolean>(false);
  // 4. Haptics: disabled by default
  const [haptics, setHapticsState] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // A. Check motion system preference
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const savedMotion = localStorage.getItem('bs_setting_reduce_motion');

    if (savedMotion !== null) {
      setReduceMotionState(savedMotion === 'true');
    } else {
      setReduceMotionState(motionQuery.matches);
    }

    const handleMotionChange = (e: MediaQueryListEvent) => {
      if (localStorage.getItem('bs_setting_reduce_motion') === null) {
        setReduceMotionState(e.matches);
      }
    };
    motionQuery.addEventListener('change', handleMotionChange);

    // B. Check transparency & contrast system preference
    const transparencyQuery = window.matchMedia('(prefers-reduced-transparency: reduce)');
    const contrastQuery = window.matchMedia('(prefers-contrast: more)');
    const savedTransparency = localStorage.getItem('bs_setting_reduce_transparency');

    if (savedTransparency !== null) {
      setReduceTransparencyState(savedTransparency === 'true');
    } else {
      setReduceTransparencyState(transparencyQuery.matches || contrastQuery.matches);
    }

    const handleTransparencyChange = () => {
      if (localStorage.getItem('bs_setting_reduce_transparency') === null) {
        setReduceTransparencyState(transparencyQuery.matches || contrastQuery.matches);
      }
    };
    transparencyQuery.addEventListener('change', handleTransparencyChange);
    contrastQuery.addEventListener('change', handleTransparencyChange);

    // C. Read sound & haptics (default false)
    const savedSound = localStorage.getItem('bs_setting_sound');
    if (savedSound !== null) {
      setSoundState(savedSound === 'true');
    }

    const savedHaptics = localStorage.getItem('bs_setting_haptics');
    if (savedHaptics !== null) {
      setHapticsState(savedHaptics === 'true');
    }

    return () => {
      motionQuery.removeEventListener('change', handleMotionChange);
      transparencyQuery.removeEventListener('change', handleTransparencyChange);
      contrastQuery.removeEventListener('change', handleTransparencyChange);
    };
  }, []);

  const setReduceMotion = useCallback((val: boolean) => {
    setReduceMotionState(val);
    localStorage.setItem('bs_setting_reduce_motion', String(val));
  }, []);

  const setReduceTransparency = useCallback((val: boolean) => {
    setReduceTransparencyState(val);
    localStorage.setItem('bs_setting_reduce_transparency', String(val));
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

  const toggleReduceTransparency = useCallback(() => {
    setReduceTransparency(!reduceTransparency);
  }, [reduceTransparency, setReduceTransparency]);

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
        reduceTransparency,
        sound,
        haptics,
        setReduceMotion,
        setReduceTransparency,
        setSound,
        setHaptics,
        toggleReduceMotion,
        toggleReduceTransparency,
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
    return {
      reduceMotion: false,
      reduceTransparency: false,
      sound: false,
      haptics: false,
      setReduceMotion: () => {},
      setReduceTransparency: () => {},
      setSound: () => {},
      setHaptics: () => {},
      toggleReduceMotion: () => {},
      toggleReduceTransparency: () => {},
      toggleSound: () => {},
      toggleHaptics: () => {},
    };
  }
  return context;
}
