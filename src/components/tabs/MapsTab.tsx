'use client';

import React from 'react';
import { ActiveEvent, PlayerBrawler } from '@/types/brawlstars';
import { Compass, Clock, Sparkles } from 'lucide-react';

interface MapsTabProps {
  mapRecommendations: Array<{
    event: ActiveEvent;
    recommendedBrawlers: PlayerBrawler[];
  }>;
}

const MODE_NAMES_FR: Record<string, string> = {
  brawlBall: 'Brawl Ball',
  soloShowdown: 'Survivant Solo',
  duoShowdown: 'Survivant Duo',
  gemGrab: 'Razzia de Gemmes',
  heist: 'Braquage',
  knockout: 'Hors-Jeu (Knockout)',
  bounty: 'Prime',
  hotZone: 'Zone Réservée',
  megaShowdown: 'Méga Survivant',
  megaDuoShowdown: 'Méga Duo',
  wipeout: 'Chasse Ouverte',
  brawlArena: 'Arène Brawl',
  airHockey: 'Air Hockey',
  tagTeam: 'Tag Team',
};

export function MapsTab({ mapRecommendations }: MapsTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
          <Compass className="w-6 h-6 text-yellow-400" />
          Rotation des Maps & Brawlers Optimaux
        </h2>
        <p className="text-xs sm:text-sm text-slate-400">
          Les événements en direct croisés avec votre roster pour maximiser votre taux de victoire.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mapRecommendations.map(({ event, recommendedBrawlers }) => {
          const modeName = MODE_NAMES_FR[event.event.mode] || event.event.mode;
          const endHour = new Date(event.endTime).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <div
              key={event.slotId}
              className="esport-card rounded-2xl p-5 flex flex-col justify-between border-white/10 hover:border-yellow-500/30 transition-all"
            >
              <div>
                {/* Event Header */}
                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20">
                      {modeName}
                    </span>
                    <h3 className="font-extrabold text-base text-white mt-1.5">
                      {event.event.map}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-white/5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Fin à {endHour}</span>
                  </div>
                </div>

                {/* Modifiers if any */}
                {event.event.modifiers && event.event.modifiers.length > 0 && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="text-[10px] text-purple-300 font-bold bg-purple-500/20 border border-purple-500/30 px-2 py-0.5 rounded">
                      Modificateur : {event.event.modifiers.join(', ')}
                    </span>
                  </div>
                )}

                {/* Recommended Brawlers from player roster */}
                <div className="mt-4">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-2.5">
                    <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                    Brawlers recommandés dans votre compte :
                  </span>

                  <div className="grid grid-cols-3 gap-2">
                    {recommendedBrawlers.length > 0 ? (
                      recommendedBrawlers.map((brawler) => (
                        <div
                          key={brawler.id}
                          className="bg-slate-900/80 rounded-xl p-2.5 border border-white/5 flex flex-col items-center text-center hover:border-yellow-500/40 transition-all"
                        >
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-slate-800 mb-1.5 border border-white/10">
                            <img
                              src={`https://cdn.brawlify.com/brawlers/borderless/${brawler.id}.png`}
                              alt={brawler.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  'https://cdn.brawlify.com/brawlers/emoji/16000000.png';
                              }}
                            />
                            <span className="absolute bottom-0 right-0 bg-yellow-500 text-black text-[8px] font-black px-1 rounded-tl">
                              P{brawler.power}
                            </span>
                          </div>
                          <span className="font-bold text-[11px] text-white truncate max-w-full">
                            {brawler.name}
                          </span>
                          <span className="text-[10px] text-yellow-400 font-black mt-0.5">
                            {brawler.trophies} 🏆
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-3 py-3 text-center text-xs text-slate-400 bg-slate-900/40 rounded-xl">
                        Jouez vos Brawlers de contrôle ou longue portée.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Strategy Advice */}
              <div className="mt-4 pt-3 border-t border-white/5 text-[11px] text-slate-400 flex items-center justify-between">
                <span>
                  {event.event.mode === 'heist'
                    ? '🎯 Priorité : Infliger du DPS direct au coffre adverse.'
                    : event.event.mode === 'brawlBall'
                    ? '⚽ Cassez les murs adverses et maintenez la ligne.'
                    : event.event.mode.includes('Showdown')
                    ? '⚔️ Sécurisez 2 boîtes et visez au minimum le top 4.'
                    : '🛡️ Privilégiez le contrôle du centre.'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
