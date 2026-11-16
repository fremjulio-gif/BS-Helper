'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from './Card';
import { ProgressBar } from './ProgressBar';
import { GlassSurface } from './GlassSurface';
import { FullRankingsResponse } from '@/lib/rankings-service';
import { Trophy, Globe, Award, Sparkles, TrendingUp, Users } from 'lucide-react';

interface RankingsCardProps {
  playerTag: string;
  initialCountry?: string;
}

const COUNTRIES = [
  { code: 'fr', label: 'France 🇫🇷' },
  { code: 'global', label: 'Monde 🌍' },
  { code: 'es', label: 'Espagne 🇪🇸' },
  { code: 'de', label: 'Allemagne 🇩🇪' },
  { code: 'it', label: 'Italie 🇮🇹' },
  { code: 'us', label: 'États-Unis 🇺🇸' },
];

export function RankingsCard({ playerTag, initialCountry = 'fr' }: RankingsCardProps) {
  const [country, setCountry] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('bs_rankings_country') || initialCountry;
    }
    return initialCountry;
  });

  const [data, setData] = useState<FullRankingsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRankings = useCallback(
    async (targetCountry: string) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/rankings?country=${targetCountry}&tag=${encodeURIComponent(playerTag)}`
        );
        const json = await res.json();
        if (json.success) {
          setData(json);
        } else {
          setError(json.error || 'Impossible de charger le classement');
        }
      } catch {
        setError('Erreur réseau lors du chargement des classements');
      } finally {
        setLoading(false);
      }
    },
    [playerTag]
  );

  useEffect(() => {
    fetchRankings(country);
  }, [country, fetchRankings]);

  const handleCountryChange = (newCountry: string) => {
    setCountry(newCountry);
    if (typeof window !== 'undefined') {
      localStorage.setItem('bs_rankings_country', newCountry);
    }
  };

  const player = data?.player;
  const brawler = data?.brawler;
  const club = data?.club;

  // Calcul du % de progression vers le seuil Top 200
  const progressPercent = player
    ? Math.min(100, Math.round((player.playerTrophies / (player.top200Threshold || 1)) * 100))
    : 0;

  return (
    <Card topHighlight={true} className="p-5 sm:p-6 bg-[#0c1228]">
      {/* Header avec sélecteur de pays */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-white/10 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-yellow-400/20 border border-yellow-400/40 flex items-center justify-center text-yellow-300 shrink-0">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-cartoon text-lg sm:text-xl text-white">
              Classement Officiel Supercell
            </h3>
            <p className="text-xs text-slate-300">
              Surveillance en temps réel de votre position dans le Top 200
            </p>
          </div>
        </div>

        {/* Sélecteur de pays avec stockage localStorage */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Globe className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={country}
            onChange={(e) => handleCountryChange(e.target.value)}
            aria-label="Sélectionner la région du classement"
            className="bg-[#0e142e] border-2 border-[#070b16] text-white text-xs font-bold rounded-xl px-3 py-2 min-h-[44px] focus:outline-none focus:border-yellow-400"
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && !data ? (
        <div className="py-8 text-center text-slate-400 text-xs font-bold animate-pulse">
          Chargement des classements officiels...
        </div>
      ) : error && !data ? (
        <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/30 text-red-200 text-xs text-center">
          {error}
        </div>
      ) : player ? (
        <div className="space-y-4">
          {/* Situation Joueur Principal */}
          <div className="p-4 rounded-2xl bg-black/30 border border-white/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div>
                <span className="text-xs font-cartoon text-slate-400 uppercase tracking-wide">
                  Votre Position en {country.toUpperCase()}
                </span>
                <div className="flex items-center gap-2 mt-1">
                  {player.isInTop200 ? (
                    <span className="font-cartoon text-2xl sm:text-3xl text-emerald-400">
                      #{player.rank} National
                    </span>
                  ) : (
                    <span className="font-cartoon text-lg sm:text-xl text-white">
                      Hors du Top 200
                    </span>
                  )}
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-white/10 text-slate-300 border border-white/10">
                    {player.playerTrophies.toLocaleString('fr-FR')} 🏆
                  </span>
                </div>
              </div>

              {/* Statut Top 200 ou Gap */}
              {player.isInTop200 ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-black uppercase">
                  <Award className="w-4 h-4" />
                  Top 200 Confirmé
                </div>
              ) : (
                <div className="text-left sm:text-right">
                  <span className="text-[11px] text-slate-400 block">Seuil d&apos;entrée Top 200</span>
                  <span className="font-cartoon text-sm text-yellow-400 tabular-nums">
                    {player.top200Threshold.toLocaleString('fr-FR')} 🏆
                  </span>
                </div>
              )}
            </div>

            {/* Barre de progression vers le Top 200 */}
            {!player.isInTop200 && (
              <div className="space-y-1.5">
                <ProgressBar
                  value={progressPercent}
                  label="Objectif Top 200"
                  subLabel={`${progressPercent}% du seuil`}
                  color="yellow"
                  height="sm"
                />
                <div className="flex items-center justify-between text-xs font-bold text-yellow-300/90 pt-1">
                  <span className="flex items-center gap-1 tabular-nums">
                    <TrendingUp className="w-3.5 h-3.5" /> +
                    {player.gapToTop200.toLocaleString('fr-FR')} trophées pour entrer dans le Top 200
                  </span>
                  {player.cutoffPlayer && (
                    <span className="text-slate-400 text-[11px]">
                      #200 : {player.cutoffPlayer.name}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Cartes secondaires : Meilleur Brawler & Club */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Meilleur Brawler */}
            {brawler && (
              <GlassSurface level="subtle" className="p-3.5 rounded-xl border border-white/10">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[11px] font-black uppercase text-slate-400 flex items-center gap-1">
                    <Award className="w-3 h-3 text-amber-400" />
                    Top Brawler : {brawler.brawlerName}
                  </span>
                  <span className="text-xs font-bold text-yellow-400 tabular-nums">
                    {brawler.brawlerTrophies} 🏆
                  </span>
                </div>
                {brawler.isInTop200 ? (
                  <p className="text-xs font-black text-emerald-400">
                    Classé #{brawler.rank} en {country.toUpperCase()} !
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-300 leading-snug">
                    À <span className="font-bold text-yellow-400">+{brawler.gapToTop200} 🏆</span> du
                    Top 200 Brawler (seuil : {brawler.top200Threshold} 🏆)
                  </p>
                )}
              </GlassSurface>
            )}

            {/* Club */}
            {club?.clubTag && (
              <GlassSurface level="subtle" className="p-3.5 rounded-xl border border-white/10">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[11px] font-black uppercase text-slate-400 flex items-center gap-1">
                    <Users className="w-3 h-3 text-cyan-400" />
                    Club : {club.clubName || 'Votre Club'}
                  </span>
                  {club.clubTrophies && (
                    <span className="text-xs font-bold text-cyan-300 tabular-nums">
                      {club.clubTrophies.toLocaleString('fr-FR')} 🏆
                    </span>
                  )}
                </div>
                {club.isInTop200 ? (
                  <p className="text-xs font-black text-emerald-400">
                    Club classé #{club.rank} en {country.toUpperCase()} !
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-300 leading-snug">
                    Seuil Top 200 Clubs : {club.top200Threshold.toLocaleString('fr-FR')} 🏆
                  </p>
                )}
              </GlassSurface>
            )}
          </div>

          {/* Conseil de Coach Bitz pour le Ladder */}
          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs flex items-start gap-2 text-indigo-200">
            <Sparkles className="w-4 h-4 text-indigo-300 shrink-0 mt-0.5" />
            <p className="leading-snug">
              <span className="font-bold text-white">Conseil Coach Bitz :</span> Le Top 200 récompense
              la régularité sur l&apos;ensemble de votre collection. Utilisez l&apos;onglet{' '}
              <span className="font-bold text-yellow-300">Brawlers &gt; Rush Trophées</span> pour
              monter vos brawlers sous 500 trophées en priorité avec le matchmaking le plus facile !
            </p>
          </div>
        </div>
      ) : null}
    </Card>
  );
}
