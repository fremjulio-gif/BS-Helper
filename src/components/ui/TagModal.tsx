'use client';

import React, { useState } from 'react';
import { Button } from './Button';
import { soundManager } from '@/lib/sound-manager';
import { X, Check, Tag } from 'lucide-react';

interface TagModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTag: string;
  onSelectTag: (tag: string) => void;
}

export function TagModal({
  isOpen,
  onClose,
  currentTag,
  onSelectTag,
}: TagModalProps) {
  const [inputTag, setInputTag] = useState(currentTag);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.playTap();

    let cleaned = inputTag.trim().toUpperCase();
    if (!cleaned.startsWith('#')) {
      cleaned = '#' + cleaned;
    }

    // Brawl Stars tag regex: starts with # followed by 3-10 valid chars
    const tagRegex = /^#[0289PYLQGRJCUV]{3,12}$/i;
    if (!tagRegex.test(cleaned)) {
      setError('Format invalide. Un tag Brawl Stars commence par # (ex: #8L80JGJGG).');
      return;
    }

    setError(null);
    onSelectTag(cleaned);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="brawl-card max-w-md w-full p-6 relative bg-gradient-to-b from-[#1c2452] to-[#111736] border-3 border-[#070b16]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl bg-[#0e142e] border-2 border-[#070b16] text-slate-300 hover:text-white cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-2 rounded-xl bg-[#ffc700] border-2 border-[#070b16] text-[#070b16]">
            <Tag className="w-5 h-5 fill-[#070b16]" />
          </div>
          <div>
            <h3 className="font-cartoon text-xl text-white">Changer de Compte</h3>
            <p className="text-xs text-slate-300 font-medium">
              Analysez n&apos;importe quel joueur Brawl Stars
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-cartoon text-slate-200 uppercase mb-1.5">
              Tag Joueur (#TAG)
            </label>
            <div className="relative">
              <input
                type="text"
                value={inputTag}
                onChange={(e) => {
                  setInputTag(e.target.value);
                  setError(null);
                }}
                placeholder="#8L80JGJGG"
                className="w-full px-4 py-2.5 rounded-xl bg-[#090d1f] border-2 border-[#070b16] font-mono font-bold text-sm text-yellow-400 placeholder-slate-500 focus:outline-none focus:border-[#ffc700]"
              />
            </div>
            {error && <p className="text-xs text-[#ef4444] font-bold mt-1.5">{error}</p>}
          </div>

          <div className="bg-[#090d1f] p-3 rounded-xl border border-white/5 text-[11px] text-slate-300 space-y-1">
            <span className="font-bold text-yellow-400 block">Astuce :</span>
            <p>Ouvrez Brawl Stars &rarr; Profil (avatar en haut à gauche) &rarr; votre tag se trouve sous votre avatar.</p>
          </div>

          <div className="flex items-center gap-2.5 pt-2">
            <Button
              type="button"
              variant="dark"
              size="md"
              onClick={onClose}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variant="yellow"
              size="md"
              icon={<Check className="w-4 h-4" />}
              className="flex-1"
            >
              Charger
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
