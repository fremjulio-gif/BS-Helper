'use client';

import React from 'react';
import { ActiveEvent, PlayerBrawler } from '@/types/brawlstars';
import { Card } from '../ui/Card';
import { BrawlerAvatar } from '../ui/BrawlerAvatar';
import { Compass, Clock, Sparkles, Target } from 'lucide-react';

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

export function MapsTab({ mapRecommendations }: MapsTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-cartoon text-white flex items-center gap-2.5 text-stroke-sm">
          <div className="p-1.5 rounded-xl bg-[#00d9ff] border-2 border-[#070b16] text-[#070b16]">
            <Compass className="w-5 h-5 stroke-[2.5px]" />
          </div>
          Rotation des Maps & Recommandations
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
          Événements actifs croisés avec vos Brawlers disponibles pour maximiser vos victoires.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mapRecommendations.map(({ event, recommendedBrawlers }) => {
          const modeName = MODE_NAMES_FR[event.event.mode] || event.event.mode;
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
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b-2 border-[#070b16]/60">
                  <div>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-cartoon uppercase bg-[#ffc700] text-[#070b16] border-2 border-[#070b16] shadow-[0_2px_0_#070b16]">
                      {modeName}
                    </span>
                    <h3 className="font-cartoon text-base text-white mt-2">
                      {event.event.map}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 bg-[#0d132c] px-3 py-1.5 rounded-xl border-2 border-[#070b16]">
                    <Clock className="w-3.5 h-3.5 text-yellow-400" />
                    <span>Fin à {endHour}</span>
                  </div>
                </div>

                {/* Modifiers */}
                {event.event.modifiers && event.event.modifiers.length > 0 && (
                  <div className="mt-2.5">
                    <span className="text-[10px] text-[#c084fc] font-bold bg-[#a855f7]/20 border border-[#a855f7]/40 px-2.5 py-0.5 rounded-lg inline-block">
                      Modificateur : {event.event.modifiers.join(', ')}
                    </span>
                  </div>
                )}

                {/* Recommended brawlers */}
                <div className="mt-4">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5 mb-2.5">
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
                            name={brawler.name}
                            power={brawler.power}
                            hasHypercharge={Boolean(
                              brawler.hyperCharges && brawler.hyperCharges.length > 0
                            )}
                            size="md"
                            className="mb-1.5"
                          />
                          <span className="font-cartoon text-xs text-white truncate max-w-full">
                            {brawler.name}
                          </span>
                          <span className="font-cartoon text-xs text-[#ffc700] mt-0.5">
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
                    <span className="text-[11px] font-bold text-white block">
                      {tactic.advice}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
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
