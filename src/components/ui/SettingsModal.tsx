'use client';

import React from 'react';
import { useSettings } from '@/lib/settings-context';
import { soundManager } from '@/lib/sound-manager';
import { Button } from './Button';
import { Volume2, VolumeX, Smartphone, Eye, Sparkles, X, Check, Layers } from 'lucide-react';
import { GlassSurface } from './GlassSurface';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const {
    sound,
    haptics,
    reduceMotion,
    reduceTransparency,
    toggleSound,
    toggleHaptics,
    toggleReduceMotion,
    toggleReduceTransparency,
  } = useSettings();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
      <GlassSurface
        level="pronounced"
        floating
        className="max-w-md w-full p-6 relative rounded-3xl shadow-[0_16px_48px_rgba(0,0,0,0.5)]"
      >
        {/* Close Button */}
        <button
          onClick={() => {
            soundManager.playTap();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-xl bg-[#0e142e] border-2 border-[#070b16] text-slate-300 hover:text-white cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5 mb-5">
          <div className="p-2 rounded-xl bg-[#c084fc] border-2 border-[#070b16] text-[#070b16]">
            <Sparkles className="w-5 h-5 fill-[#070b16]" />
          </div>
          <div>
            <h3 className="font-cartoon text-xl text-white">Réglages & Préférences</h3>
            <p className="text-xs text-slate-300 font-medium">
              Personnalisez votre confort sonore et visuel
            </p>
          </div>
        </div>

        <div className="space-y-3.5">
          {/* Sound Toggle Row */}
          <div className="p-3.5 rounded-2xl bg-[#090d1f] border-2 border-[#070b16] flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-xl border-2 border-[#070b16] ${
                  sound ? 'bg-[#ffc700] text-[#070b16]' : 'bg-[#18214a] text-slate-400'
                }`}
              >
                {sound ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </div>
              <div>
                <span className="font-cartoon text-sm text-white block leading-tight">
                  Effets Sonores Synthétisés
                </span>
                <span className="text-xs text-slate-300">
                  {sound ? 'Activés (ondes douces sinusoïdales)' : 'Désactivés (mode silencieux)'}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                toggleSound();
                if (!sound) soundManager.playTap();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-cartoon border-2 border-[#070b16] shadow-[0_2px_0_#070b16] cursor-pointer ${
                sound
                  ? 'bg-[#22c55e] text-[#070b16]'
                  : 'bg-[#18214a] text-slate-300 hover:text-white'
              }`}
            >
              {sound ? 'OUI' : 'NON'}
            </button>
          </div>

          {/* Haptics Toggle Row */}
          <div className="p-3.5 rounded-2xl bg-[#090d1f] border-2 border-[#070b16] flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-xl border-2 border-[#070b16] ${
                  haptics ? 'bg-[#42eeff] text-[#070b16]' : 'bg-[#18214a] text-slate-400'
                }`}
              >
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <span className="font-cartoon text-sm text-white block leading-tight">
                  Vibrations Haptiques
                </span>
                <span className="text-xs text-slate-300">
                  {haptics ? 'Activées sur mobile compatible' : 'Désactivées'}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                toggleHaptics();
                soundManager.haptic(15);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-cartoon border-2 border-[#070b16] shadow-[0_2px_0_#070b16] cursor-pointer ${
                haptics
                  ? 'bg-[#22c55e] text-[#070b16]'
                  : 'bg-[#18214a] text-slate-300 hover:text-white'
              }`}
            >
              {haptics ? 'OUI' : 'NON'}
            </button>
          </div>

          {/* Reduce Motion Row */}
          <div className="p-3.5 rounded-2xl bg-[#090d1f] border-2 border-[#070b16] flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-xl border-2 border-[#070b16] ${
                  reduceMotion ? 'bg-[#ffc700] text-[#070b16]' : 'bg-[#18214a] text-slate-400'
                }`}
              >
                <Eye className="w-4 h-4" />
              </div>
              <div>
                <span className="font-cartoon text-sm text-white block leading-tight">
                  Mode Mouvement Réduit
                </span>
                <span className="text-xs text-slate-300">
                  {reduceMotion ? 'Sobriété activée (pas de rebond ni glissement)' : 'Animations cartoon actives'}
                </span>
              </div>
            </div>

            <button
              onClick={toggleReduceMotion}
              className={`px-3 py-1.5 rounded-xl text-xs font-cartoon border-2 border-[#070b16] shadow-[0_2px_0_#070b16] cursor-pointer ${
                reduceMotion
                  ? 'bg-[#ffc700] text-[#070b16]'
                  : 'bg-[#18214a] text-slate-300 hover:text-white'
              }`}
            >
              {reduceMotion ? 'ACTIF' : 'OFF'}
            </button>
          </div>

          {/* Reduce Transparency Row */}
          <div className="p-3.5 rounded-2xl bg-[#090d1f] border-2 border-[#070b16] flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-xl border-2 border-[#070b16] ${
                  reduceTransparency ? 'bg-[#a855f7] text-white' : 'bg-[#18214a] text-slate-400'
                }`}
              >
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <span className="font-cartoon text-sm text-white block leading-tight">
                  Réduire la Transparence
                </span>
                <span className="text-xs text-slate-300">
                  {reduceTransparency ? 'Fonds opaques unis (contraste maximal)' : 'Liquid Glass translucide actif'}
                </span>
              </div>
            </div>

            <button
              onClick={toggleReduceTransparency}
              className={`px-3 py-1.5 rounded-xl text-xs font-cartoon border-2 border-[#070b16] shadow-[0_2px_0_#070b16] cursor-pointer ${
                reduceTransparency
                  ? 'bg-[#a855f7] text-white'
                  : 'bg-[#18214a] text-slate-300 hover:text-white'
              }`}
            >
              {reduceTransparency ? 'ACTIF' : 'OFF'}
            </button>
          </div>
        </div>

        <div className="pt-5 flex justify-end">
          <Button
            variant="yellow"
            size="md"
            icon={<Check className="w-4 h-4" />}
            onClick={() => {
              soundManager.playTap();
              onClose();
            }}
            className="w-full sm:w-auto"
          >
            Fermer les Réglages
          </Button>
        </div>
      </GlassSurface>
    </div>
  );
}
