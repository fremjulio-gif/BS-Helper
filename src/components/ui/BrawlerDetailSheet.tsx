'use client';

import React, { useEffect } from 'react';
import { m, AnimatePresence } from 'motion/react';
import { X, Trophy, Zap, ShieldCheck, Flame, Sparkles, Lock, CheckCircle2 } from 'lucide-react';
import { CatalogBrawler } from '@/types/brawlstars';
import { GlassSurface } from './GlassSurface';
import { BrawlerAvatar } from './BrawlerAvatar';
import { useSettings } from '@/lib/settings-context';
import Image from 'next/image';

interface BrawlerDetailSheetProps {
  brawler: CatalogBrawler | null;
  onClose: () => void;
}

export function BrawlerDetailSheet({ brawler, onClose }: BrawlerDetailSheetProps) {
  const { reduceMotion } = useSettings();

  // Bloquer le scroll d'arrière-plan quand la modal est ouverte
  useEffect(() => {
    if (brawler) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [brawler]);

  // Fermeture par touche Échap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!brawler) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-md"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-label={`Détails de ${brawler.name}`}
      >
        <m.div
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 40, scale: 0.98 }}
          animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 30, scale: 0.98 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-xl max-h-[92vh] sm:max-h-[85vh] flex flex-col rounded-t-[2.5rem] sm:rounded-3xl overflow-hidden shadow-2xl"
        >
          <GlassSurface
            level="pronounced"
            className="flex flex-col h-full overflow-hidden border-t sm:border border-white/20 bg-[#0c1228]/95"
          >
            {/* Header avec bouton fermer */}
            <div className="relative p-5 sm:p-6 pb-4 border-b border-white/10 shrink-0">
              <button
                type="button"
                onClick={onClose}
                aria-label="Fermer la fiche"
                className="absolute top-4 right-4 z-10 w-11 h-11 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white/80 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-start gap-4 pr-12">
                <BrawlerAvatar
                  id={brawler.id}
                  name={brawler.name}
                  power={brawler.power}
                  rarityColor={brawler.rarity.color}
                  size="xl"
                  hasHypercharge={brawler.hyperCharges.some((hc) => hc.isUnlocked)}
                  className={!brawler.isUnlocked ? 'filter grayscale opacity-60' : ''}
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span
                      style={{
                        backgroundColor: `${brawler.rarity.color}25`,
                        color: brawler.rarity.color,
                        borderColor: `${brawler.rarity.color}60`,
                      }}
                      className="text-xs font-black px-2.5 py-0.5 rounded-full border uppercase tracking-wide"
                    >
                      {brawler.rarity.name}
                    </span>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white/10 text-slate-300 border border-white/10">
                      {brawler.class.name}
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-wider truncate">
                    {brawler.name}
                  </h2>

                  <div className="flex items-center gap-3 mt-2 text-sm">
                    {brawler.isUnlocked ? (
                      <>
                        <div className="flex items-center gap-1.5 font-black text-yellow-400">
                          <Trophy className="w-4 h-4 text-yellow-400" />
                          <span>{brawler.trophies}</span>
                          <span className="text-xs text-white/40 font-normal">
                            (Record: {brawler.highestTrophies})
                          </span>
                        </div>
                        <div className="text-xs font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          Niveau {brawler.power}
                        </div>
                      </>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Non débloqué</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {brawler.description && (
                <p className="mt-3 text-xs sm:text-sm text-slate-300/80 leading-relaxed italic line-clamp-2">
                  &ldquo;{brawler.description}&rdquo;
                </p>
              )}
            </div>

            {/* Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
              {/* Priorité d'amélioration transparente */}
              {brawler.isUnlocked && brawler.upgradePriority && (
                <div
                  className={`p-3.5 rounded-2xl border text-xs sm:text-sm ${
                    brawler.upgradePriority.levelLabel === 'Priorité Haute'
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-200'
                      : brawler.upgradePriority.levelLabel === 'Priorité Moyenne'
                      ? 'bg-blue-500/15 border-blue-500/40 text-blue-200'
                      : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200'
                  }`}
                >
                  <div className="flex items-center gap-2 font-black uppercase tracking-wider mb-1">
                    <Sparkles className="w-4 h-4 shrink-0" />
                    <span>Conseil Bitz : {brawler.upgradePriority.levelLabel}</span>
                  </div>
                  <p className="text-xs text-white/90 leading-snug">
                    {brawler.upgradePriority.reason}
                  </p>
                </div>
              )}

              {/* Gadgets */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-emerald-400" />
                    Gadgets (Niveau 7)
                  </h3>
                  <span className="text-[11px] font-bold text-slate-400">
                    {brawler.gadgets.filter((g) => g.isUnlocked).length} / {brawler.gadgets.length}
                  </span>
                </div>

                {brawler.gadgets.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">Aucun gadget répertorié</p>
                ) : (
                  <div className="grid grid-cols-1 gap-2">
                    {brawler.gadgets.map((gadget) => (
                      <div
                        key={gadget.id}
                        className={`p-3 rounded-xl border flex items-start gap-3 transition-colors ${
                          gadget.isUnlocked
                            ? 'bg-emerald-950/30 border-emerald-500/40'
                            : 'bg-black/30 border-white/5 opacity-60'
                        }`}
                      >
                        {gadget.imageUrl ? (
                          <div className="relative w-9 h-9 shrink-0 rounded-lg overflow-hidden bg-black/40 border border-white/10 flex items-center justify-center">
                            <Image
                              src={gadget.imageUrl}
                              alt={gadget.name}
                              width={36}
                              height={36}
                              className="object-contain"
                            />
                          </div>
                        ) : (
                          <div className="w-9 h-9 shrink-0 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300 font-black">
                            <Zap className="w-4 h-4" />
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs sm:text-sm font-bold text-white truncate">
                              {gadget.name}
                            </span>
                            {gadget.isUnlocked ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shrink-0">
                                <CheckCircle2 className="w-3 h-3" />
                                Débloqué
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/5 shrink-0">
                                Manquant
                              </span>
                            )}
                          </div>
                          {gadget.description && (
                            <p className="text-[11px] sm:text-xs text-slate-300/80 mt-1 leading-snug">
                              {gadget.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Star Powers */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-yellow-400" />
                    Star Powers (Niveau 9)
                  </h3>
                  <span className="text-[11px] font-bold text-slate-400">
                    {brawler.starPowers.filter((sp) => sp.isUnlocked).length} /{' '}
                    {brawler.starPowers.length}
                  </span>
                </div>

                {brawler.starPowers.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">Aucun Star Power répertorié</p>
                ) : (
                  <div className="grid grid-cols-1 gap-2">
                    {brawler.starPowers.map((sp) => (
                      <div
                        key={sp.id}
                        className={`p-3 rounded-xl border flex items-start gap-3 transition-colors ${
                          sp.isUnlocked
                            ? 'bg-amber-950/30 border-amber-500/40'
                            : 'bg-black/30 border-white/5 opacity-60'
                        }`}
                      >
                        {sp.imageUrl ? (
                          <div className="relative w-9 h-9 shrink-0 rounded-lg overflow-hidden bg-black/40 border border-white/10 flex items-center justify-center">
                            <Image
                              src={sp.imageUrl}
                              alt={sp.name}
                              width={36}
                              height={36}
                              className="object-contain"
                            />
                          </div>
                        ) : (
                          <div className="w-9 h-9 shrink-0 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300 font-black">
                            <ShieldCheck className="w-4 h-4" />
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs sm:text-sm font-bold text-white truncate">
                              {sp.name}
                            </span>
                            {sp.isUnlocked ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0">
                                <CheckCircle2 className="w-3 h-3" />
                                Débloqué
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/5 shrink-0">
                                Manquant
                              </span>
                            )}
                          </div>
                          {sp.description && (
                            <p className="text-[11px] sm:text-xs text-slate-300/80 mt-1 leading-snug">
                              {sp.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Hypercharge */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-2.5">
                  <Flame className="w-3.5 h-3.5 text-fuchsia-400" />
                  Hypercharge (Niveau 11)
                </h3>

                {brawler.hyperCharges.length === 0 ? (
                  <div className="p-3 rounded-xl bg-black/20 border border-white/5 text-xs text-slate-500 italic">
                    Aucune Hypercharge disponible pour {brawler.name} dans la version actuelle du jeu.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2">
                    {brawler.hyperCharges.map((hc) => (
                      <div
                        key={hc.id}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                          hc.isUnlocked
                            ? 'bg-fuchsia-950/40 border-fuchsia-500/50 shadow-[0_0_15px_rgba(217,70,239,0.2)]'
                            : 'bg-black/30 border-white/5 opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-fuchsia-500/20 border border-fuchsia-500/40 flex items-center justify-center text-fuchsia-300">
                            <Flame className="w-4 h-4" />
                          </div>
                          <span className="text-xs sm:text-sm font-bold text-white uppercase">
                            {hc.name}
                          </span>
                        </div>

                        {hc.isUnlocked ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-fuchsia-500/30 text-fuchsia-200 border border-fuchsia-500/50">
                            <CheckCircle2 className="w-3 h-3" />
                            Débloquée
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/5">
                            Manquante
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Gears débloqués */}
              {brawler.gears.length > 0 && (
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
                    Équipements Débloqués ({brawler.gears.filter((g) => g.isUnlocked).length})
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {brawler.gears
                      .filter((g) => g.isUnlocked)
                      .map((gear) => (
                        <span
                          key={gear.id}
                          className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-200 border border-indigo-500/30"
                        >
                          {gear.name} {gear.level ? `Nv.${gear.level}` : ''}
                        </span>
                      ))}
                    {brawler.gears.filter((g) => g.isUnlocked).length === 0 && (
                      <span className="text-xs text-slate-500 italic">
                        Aucun équipement acheté pour le moment.
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </GlassSurface>
        </m.div>
      </div>
    </AnimatePresence>
  );
}
