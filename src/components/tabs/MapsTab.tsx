'use client';

import React from 'react';
import { ActiveEvent, PlayerBrawler, GameModeMeta } from '@/types/brawlstars';
import { Card } from '../ui/Card';
import { BrawlerAvatar } from '../ui/BrawlerAvatar';
import { TabHeader } from '../ui/TabHeader';
import { GameModeBadge } from '../ui/GameModeBadge';
import { getBrawlerFrenchName } from '@/lib/brawler-names';
import { Compass, Clock, Sparkles, Target } from 'lucide-react';

interface MapsTabProps {
  mapRecommendations: Array<{
    event: ActiveEvent;
    recommendedBrawlers: PlayerBrawler[];
  }>;
  gameModes?: Record<string, GameModeMeta>;
}

const MODE_TACTICS: Record<string, { advice: string; why: string }> = {
  heist: {
    advice: 'DPS direct et assaut sur le coffre adverse.',
    why: 'Brawlers à dégâts continus ou capables de contourner les lignes de défense.',
  },
  brawlBall: {
    advice: 'Cassez les murs devant le but et tenez le centre.',
    why: 'Brawlers résistants, contrôle de zone ou capacité d\'élimination rapide du porteur.',
  },
  knockout: {
    advice: 'Évitez les duels isolés et temporisez la réduction du poison.',
    why: 'Snipers ou longue portée pour sécuriser une première élimination décisive.',
  },
  gemGrab: {
    advice: 'Un porteur désigné et deux soutiens de couloir.',
    why: 'Brawlers à bon contrôle de foule et grande portée pour verrouiller le puits.',
  },
  soloShowdown: {
    advice: 'Sécurisez 2 boîtes et visez la survie top 4.',
    why: 'Duellistes avec échappatoire ou capacité de burst en 1v1.',
  },
  duoShowdown: {
    advice: 'Restez groupés pour partager les boosts et couvrir la réapparition.',
    why: 'Duo polyvalent associant un dégât direct et un contrôle ou longue distance.',
  },
  hotZone: {
    advice: 'Capturez la première zone puis verrouillez l\'accès avec vos tirs de zone.',
    why: 'Contrôleurs et lanceurs qui empêchent l\'ennemi de poser le pied dans le cercle.',
  },
};

export function MapsTab({ mapRecommendations, gameModes }: MapsTabProps) {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Unified Tab Header */}
      <TabHeader
        icon={Compass}
        title="Rotation des Maps"
        subtitle="Événements actifs croisés avec vos Brawlers disponibles pour maximiser vos victoires"
        badge={`${mapRecommendations.length} modes actifs`}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {mapRecommendations.map(({ event, recommendedBrawlers }) => {
          const tactic = MODE_TACTICS[event.event.mode] || {
            advice: 'Privilégiez la synergie d\'équipe et le contrôle du terrain.',
            why: 'Brawlers équilibrés avec pouvoir élevé.',
          };
          const endHour = new Date(event.endTime).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <Card
              key={event.slotId}
              topHighlight={true}
              className="flex flex-col justify-between border-3 border-[#070b16]"
            >
              <div>
                {/* Header with dynamic game mode badge */}
                <div className="flex items-center justify-between pb-3 border-b-2 border-[#070b16]/60">
                  <div>
                    <GameModeBadge
                      mode={event.event.mode}
                      dictionary={gameModes}
                      size="md"
                    />
                    <h3 className="font-cartoon text-base sm:text-lg text-white mt-2">
                      {event.event.map}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 bg-[#0d132c] px-3 py-1.5 rounded-xl border-2 border-[#070b16] tabular-nums">
                    <Clock className="w-3.5 h-3.5 text-yellow-400" />
                    <span>Fin à {endHour}</span>
                  </div>
                </div>

                {/* Modifiers */}
                {event.event.modifiers && event.event.modifiers.length > 0 && (
                  <div className="mt-2.5">
                    <span className="text-xs text-[#c084fc] font-bold bg-[#a855f7]/20 border border-[#a855f7]/40 px-2.5 py-0.5 rounded-lg inline-block">
                      Modificateur : {event.event.modifiers.join(', ')}
                    </span>
                  </div>
                )}

                {/* Recommended brawlers */}
                <div className="mt-4">
                  <span className="text-xs sm:text-sm font-bold text-slate-200 flex items-center gap-1.5 mb-2.5">
                    <Sparkles className="w-4 h-4 text-[#ffc700]" />
                    Vos meilleurs Brawlers pour cette map :
                  </span>

                  <div className="grid grid-cols-3 gap-2.5">
                    {recommendedBrawlers.length > 0 ? (
                      recommendedBrawlers.map((brawler) => (
                        <div
                          key={brawler.id}
                          className="brawl-card p-2.5 flex flex-col items-center text-center group hover:-translate-y-0.5 transition-transform"
                        >
                          <BrawlerAvatar
                            id={brawler.id}
                            name={getBrawlerFrenchName(brawler.name, brawler.id)}
                            power={brawler.power}
                            hasHypercharge={Boolean(
                              brawler.hyperCharges && brawler.hyperCharges.length > 0
                            )}
                            size="md"
                            className="mb-1.5"
                          />
                          <span className="font-cartoon text-xs text-white truncate max-w-full">
                            {getBrawlerFrenchName(brawler.name, brawler.id)}
                          </span>
                          <span className="font-cartoon text-xs text-[#ffc700] mt-0.5 tabular-nums">
                            {brawler.trophies} 🏆
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-3 py-3 text-center text-xs text-slate-400 bg-[#0e142e] rounded-xl border border-white/5">
                        Jouez vos Brawlers avec le plus haut niveau de pouvoir.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Tactic Explanation / Why */}
              <div className="mt-4 pt-3 border-t-2 border-[#070b16]/60 bg-[#0c122a] p-3 rounded-xl border border-white/5">
                <div className="flex items-start gap-2">
                  <Target className="w-4 h-4 text-[#00d9ff] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-white block">
                      {tactic.advice}
                    </span>
                    <span className="text-xs text-slate-300 font-medium block mt-0.5">
                      Pourquoi : {tactic.why}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
