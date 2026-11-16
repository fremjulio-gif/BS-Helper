'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { GlassSurface } from '@/components/ui/GlassSurface';
import { TabHeader } from '@/components/ui/TabHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { useSettings } from '@/lib/settings-context';
import {
  Trophy,
  ArrowLeft,
  Layers,
} from 'lucide-react';

export default function StyleguidePage() {
  const { reduceTransparency, toggleReduceTransparency } = useSettings();
  const [activeChip, setActiveChip] = useState<'a' | 'b' | 'c'>('a');
  const [glassStateMode, setGlassStateMode] = useState<'live' | 'forceOpaque'>('live');

  return (
    <div className="min-h-screen bg-[#171347] text-slate-100 font-sans pb-32">
      {/* Floating Glass Top Bar */}
      <header className="sticky top-4 z-40 max-w-6xl mx-auto px-4 mb-8">
        <GlassSurface
          level="subtle"
          className="px-6 py-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-colors flex items-center gap-1.5 text-xs font-cartoon"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retour App</span>
            </Link>
            <div>
              <h1 className="font-cartoon text-xl text-white tracking-wide text-stroke-sm">
                BS HELPER • STYLEGUIDE
              </h1>
              <p className="text-xs text-slate-300 font-medium">
                Système Liquid Glass (Apple-like) & Composants Cartoon Opaque
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleReduceTransparency}
              className={`px-3 py-1.5 rounded-xl text-xs font-cartoon border border-white/20 transition-all cursor-pointer ${
                reduceTransparency ? 'bg-[#a855f7] text-white' : 'bg-white/10 text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5 inline mr-1" />
              {reduceTransparency ? 'Opaque (Actif)' : 'Verre (Actif)'}
            </button>
          </div>
        </GlassSurface>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
        {/* SECTION 1: UNIFIED TAB HEADER SHOWCASE */}
        <section className="space-y-4">
          <div className="border-b border-white/10 pb-2">
            <span className="text-xs font-cartoon text-yellow-400 uppercase tracking-wider">
              Composant Unifié
            </span>
            <h2 className="font-cartoon text-2xl text-white">1. En-tête d&apos;Onglet Standard (TabHeader)</h2>
          </div>

          <Card topHighlight={true} className="p-6">
            <TabHeader
              icon={<Trophy className="w-5 h-5 fill-[#070b16]" />}
              title="Accélérateur de Trophées (Exemple Standardisé)"
              subtitle="Ce composant garantit exactement la même hauteur, alignement et taille de texte sur les 5 onglets."
              rightElement={
                <div className="flex gap-2">
                  <Chip
                    label="Filtre A"
                    active={activeChip === 'a'}
                    onClick={() => setActiveChip('a')}
                    tone="yellow"
                  />
                  <Chip
                    label="Filtre B"
                    active={activeChip === 'b'}
                    onClick={() => setActiveChip('b')}
                    tone="cyan"
                  />
                </div>
              }
            />
          </Card>
        </section>

        {/* SECTION 2: TEST EN CONDITIONS RÉELLES - CONTENU COLORÉ DÉFILANT DERRIÈRE LE VERRE */}
        <section className="space-y-4">
          <div className="border-b border-white/10 pb-2 flex items-center justify-between">
            <div>
              <span className="text-xs font-cartoon text-yellow-400 uppercase tracking-wider">
                Épreuve de Lisibilité
              </span>
              <h2 className="font-cartoon text-2xl text-white">
                2. Verre Flottant au-dessus d&apos;un Arrière-Plan Coloré Vif
              </h2>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setGlassStateMode('live')}
                className={`px-3 py-1 rounded-xl text-xs font-cartoon ${
                  glassStateMode === 'live' ? 'bg-[#ffc700] text-[#070b16]' : 'bg-white/10 text-white'
                }`}
              >
                État Verre Normal
              </button>
              <button
                onClick={() => setGlassStateMode('forceOpaque')}
                className={`px-3 py-1 rounded-xl text-xs font-cartoon ${
                  glassStateMode === 'forceOpaque' ? 'bg-[#ffc700] text-[#070b16]' : 'bg-white/10 text-white'
                }`}
              >
                Repli Opaque Forcé
              </button>
            </div>
          </div>

          <div className="relative rounded-3xl overflow-hidden border-3 border-[#070b16] p-6 bg-[#0e122b]">
            {/* Arrière-plan coloré contrasté qui simule le pire cas de défilement */}
            <div className="grid grid-cols-3 gap-4 mb-6 select-none opacity-90">
              <div className="h-36 rounded-2xl bg-gradient-to-br from-[#ffdc2e] to-[#ff6b00] p-4 text-[#070b16] font-cartoon">
                <span className="text-lg">ZONE JAUNE ÉCLATANTE</span>
                <p className="text-xs font-sans font-bold mt-2">
                  Test de saturation maximale sous le verre.
                </p>
              </div>
              <div className="h-36 rounded-2xl bg-gradient-to-br from-[#00d9ff] to-[#0055ff] p-4 text-[#070b16] font-cartoon">
                <span className="text-lg">ZONE CYAN NEON</span>
                <p className="text-xs font-sans font-bold mt-2">
                  Contraste froid élevé.
                </p>
              </div>
              <div className="h-36 rounded-2xl bg-gradient-to-br from-[#ff0055] to-[#7700ff] p-4 text-white font-cartoon">
                <span className="text-lg">ZONE MAGENTA CHAUDE</span>
                <p className="text-xs font-sans font-bold mt-2">
                  Fond sombre texturé.
                </p>
              </div>
            </div>

            {/* Verre flottant superposé */}
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 -mt-24">
              {/* Surface Verre 1 (Subtle) */}
              <GlassSurface
                level="subtle"
                forceOpaque={glassStateMode === 'forceOpaque'}
                className="p-6 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-lg text-xs font-cartoon bg-white/15 text-white border border-white/20">
                    Niveau 1 : Subtle (58% opacité)
                  </span>
                  <span className="text-xs font-bold text-yellow-400 tabular-nums">
                    Contraste AA Garanti
                  </span>
                </div>
                <h3 className="font-cartoon text-xl text-white">
                  Surface Verre Flottante Légère
                </h3>
                <p className="text-sm text-slate-200 leading-relaxed font-medium">
                  Utilisée pour les barres de navigation, le dock mobile et les toasts. Même sur
                  la zone jaune vif ci-dessus, ce texte en blanc reste net et parfaitement lisible
                  grâce au flou de 18px et à la teinte indigo.
                </p>
                <div className="pt-2 flex gap-3">
                  <Button variant="yellow" size="sm">Action Cartoon</Button>
                  <Button variant="dark" size="sm">Secondaire</Button>
                </div>
              </GlassSurface>

              {/* Surface Verre 2 (Pronounced) */}
              <GlassSurface
                level="pronounced"
                forceOpaque={glassStateMode === 'forceOpaque'}
                className="p-6 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-lg text-xs font-cartoon bg-white/20 text-white border border-white/25">
                    Niveau 2 : Pronounced (70% opacité)
                  </span>
                  <span className="text-xs font-bold text-[#4ade80] tabular-nums">
                    Feuille Modale / Sheet
                  </span>
                </div>
                <h3 className="font-cartoon text-xl text-white">
                  Panneau & Modale Givrée
                </h3>
                <p className="text-sm text-slate-200 leading-relaxed font-medium">
                  Utilisée pour les fenêtres surgissantes (Réglages, Changement de tag). Le flou de 22px
                  isole la lecture tout en laissant percevoir la profondeur de l&apos;arène.
                </p>
                <div className="pt-2 flex gap-3">
                  <Button variant="cyan" size="sm">Confirmer</Button>
                </div>
              </GlassSurface>
            </div>
          </div>
        </section>

        {/* SECTION 3: LES 3 ÉTATS COMPARÉS (NORMAL / OPAQUE / SANS SUPPORT) */}
        <section className="space-y-4">
          <div className="border-b border-white/10 pb-2">
            <span className="text-xs font-cartoon text-yellow-400 uppercase tracking-wider">
              Replis Accessibilité
            </span>
            <h2 className="font-cartoon text-2xl text-white">3. Les 3 États de Transparence Comparés</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* État 1 : Normal Glass */}
            <div className="space-y-2">
              <span className="text-xs font-cartoon text-slate-300 uppercase">
                1. Mode Standard (Liquid Glass)
              </span>
              <GlassSurface level="subtle" forceOpaque={false} className="p-5 h-48 flex flex-col justify-between">
                <div>
                  <h4 className="font-cartoon text-base text-white">Translucide Flouté</h4>
                  <p className="text-sm text-slate-200 mt-1">
                    Flou matériel actif + liseré lumineux supérieur.
                  </p>
                </div>
                <span className="text-xs text-yellow-400 font-bold">18px blur • 58% opacité</span>
              </GlassSurface>
            </div>

            {/* État 2 : Transparence Réduite (Opaque Fallback) */}
            <div className="space-y-2">
              <span className="text-xs font-cartoon text-slate-300 uppercase">
                2. Transparence Réduite (Réglages/OS)
              </span>
              <GlassSurface level="subtle" forceOpaque={true} className="p-5 h-48 flex flex-col justify-between">
                <div>
                  <h4 className="font-cartoon text-base text-white">Fond Opaque Indigo</h4>
                  <p className="text-sm text-slate-200 mt-1">
                    Zéro transparence, contraste maximal garanti, préserve la batterie.
                  </p>
                </div>
                <span className="text-xs text-[#4ade80] font-bold">Opaque #171445 • Zéro GPU blur</span>
              </GlassSurface>
            </div>

            {/* État 3 : Cartoon Opaque (Inchangé) */}
            <div className="space-y-2">
              <span className="text-xs font-cartoon text-slate-300 uppercase">
                3. Carte Contenu Cartoon (Contraste brut)
              </span>
              <div className="brawl-card p-5 h-48 flex flex-col justify-between">
                <div>
                  <h4 className="font-cartoon text-base text-white">Carte Cartoon Opaque</h4>
                  <p className="text-sm text-slate-300 mt-1">
                    Bordure noire 3px, ombre portée dure, esprit arcade préservé.
                  </p>
                </div>
                <span className="text-xs text-yellow-400 font-bold">Bord 3px #070B16</span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: TYPOGRAPHIE & CHIFFRES TABULAIRES */}
        <section className="space-y-4">
          <div className="border-b border-white/10 pb-2">
            <span className="text-xs font-cartoon text-yellow-400 uppercase tracking-wider">
              Lisibilité & Chiffres Stables
            </span>
            <h2 className="font-cartoon text-2xl text-white">4. Échelle Typographique & Tabular Nums</h2>
          </div>

          <Card topHighlight={true} className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <span className="text-xs font-cartoon text-slate-400 block mb-1">
                  Chiffres Tabulaires (Sans Jitter)
                </span>
                <span className="font-cartoon text-3xl text-yellow-400 tabular-nums">
                  26,040 🏆
                </span>
                <span className="text-xs text-slate-300 block mt-1">
                  Espacement égal pour tous les chiffres (0-9)
                </span>
              </div>

              <div>
                <span className="text-xs font-cartoon text-slate-400 block mb-1">
                  Texte Courant (≥ 14px)
                </span>
                <p className="text-sm text-slate-200 leading-relaxed font-medium">
                  Tout le texte explicatif est désormais au plancher de 14px (text-sm) pour une lecture
                  sans fatigue visuelle.
                </p>
              </div>

              <div>
                <span className="text-xs font-cartoon text-slate-400 block mb-1">
                  Tags & Badges (≥ 12px)
                </span>
                <div className="flex flex-wrap gap-2 mt-1">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-cartoon bg-[#22c55e] text-[#070b16]">
                    VICTOIRE
                  </span>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-cartoon bg-[#ef4444] text-white">
                    DÉFAITE
                  </span>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-cartoon bg-[#00d9ff] text-[#070b16]">
                    GUIDE MODE
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </section>
      </main>
    </div>
  );
}
