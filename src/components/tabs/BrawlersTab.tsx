'use client';

import React, { useState, useMemo } from 'react';
import { PlayerBrawler, StrategyRecommendation, CatalogResponse, CatalogBrawler } from '@/types/brawlstars';
import { Card } from '../ui/Card';
import { Chip } from '../ui/Chip';
import { ProgressBar } from '../ui/ProgressBar';
import { BrawlerAvatar } from '../ui/BrawlerAvatar';
import { TabHeader } from '../ui/TabHeader';
import { BrawlerDetailSheet } from '../ui/BrawlerDetailSheet';
import { GlassSurface } from '../ui/GlassSurface';
import { getBrawlerFrenchName } from '@/lib/brawler-names';
import {
  Trophy,
  Zap,
  ArrowUpRight,
  ShieldCheck,
  Search,
  Layers,
  Sparkles,
  Lock,
  Flame,
  Filter,
} from 'lucide-react';

interface BrawlersTabProps {
  brawlers: PlayerBrawler[];
  easyTrophies: StrategyRecommendation[];
  catalog?: CatalogResponse;
}

export function BrawlersTab({ brawlers, easyTrophies, catalog }: BrawlersTabProps) {
  // Navigation interne à 2 vues
  const [subView, setSubView] = useState<'rush' | 'collection'>('rush');

  // État Rush
  const [rushFilter, setRushFilter] = useState<'easy' | 'tilt' | 'all'>('easy');
  const [rushSearch, setRushSearch] = useState('');

  // État Collection
  const [collectionSearch, setCollectionSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [rarityFilter, setRarityFilter] = useState<string>('all');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'trophies' | 'power' | 'rarity' | 'name'>('trophies');

  // Sheet détail brawler
  const [selectedBrawler, setSelectedBrawler] = useState<CatalogBrawler | null>(null);

  const tiltList = easyTrophies.filter((r) => r.type === 'tilt_recovery');
  const boostList = easyTrophies.filter((r) => r.type === 'easy_trophies');

  // Brawlers pour la vue Rush
  const filteredRushBrawlers = useMemo(() => {
    return brawlers
      .filter((b) => {
        const q = rushSearch.toLowerCase();
        const fr = getBrawlerFrenchName(b.name, b.id).toLowerCase();
        return b.name.toLowerCase().includes(q) || fr.includes(q);
      })
      .sort((a, b) => {
        if (rushFilter === 'tilt') {
          const tiltA = a.highestTrophies - a.trophies;
          const tiltB = b.highestTrophies - b.trophies;
          return tiltB - tiltA;
        }
        if (rushFilter === 'easy') {
          return a.trophies - b.trophies;
        }
        return b.trophies - a.trophies;
      });
  }, [brawlers, rushSearch, rushFilter]);

  // Brawlers pour la vue Collection (111 brawlers officiels)
  const allCatalogBrawlers = useMemo(() => catalog?.brawlers || [], [catalog]);
  const catalogTotal = catalog?.total || 111;
  const catalogUnlocked = catalog?.unlockedCount || brawlers.length;

  const filteredCollectionBrawlers = useMemo(() => {
    return allCatalogBrawlers
      .filter((b) => {
        // Recherche
        if (collectionSearch) {
          const q = collectionSearch.toLowerCase();
          const matches =
            b.name.toLowerCase().includes(q) ||
            b.scName.toLowerCase().includes(q) ||
            b.class.name.toLowerCase().includes(q) ||
            b.rarity.name.toLowerCase().includes(q);
          if (!matches) return false;
        }

        // Filtre Statut (Débloqué / À débloquer)
        if (statusFilter === 'unlocked' && !b.isUnlocked) return false;
        if (statusFilter === 'locked' && b.isUnlocked) return false;

        // Filtre Rareté
        if (rarityFilter !== 'all' && b.rarity.name !== rarityFilter) return false;

        // Filtre Classe
        if (classFilter !== 'all' && b.class.name !== classFilter) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'trophies') {
          if (a.isUnlocked && !b.isUnlocked) return -1;
          if (!a.isUnlocked && b.isUnlocked) return 1;
          return b.trophies - a.trophies;
        }
        if (sortBy === 'power') {
          if (a.isUnlocked && !b.isUnlocked) return -1;
          if (!a.isUnlocked && b.isUnlocked) return 1;
          return b.power - a.power;
        }
        if (sortBy === 'rarity') {
          return b.rarity.id - a.rarity.id || a.name.localeCompare(b.name);
        }
        return a.name.localeCompare(b.name);
      });
  }, [allCatalogBrawlers, collectionSearch, statusFilter, rarityFilter, classFilter, sortBy]);

  // Liste des raretés uniques présentes
  const uniqueRarities = useMemo(() => {
    const set = new Set<string>();
    allCatalogBrawlers.forEach((b) => {
      if (b.rarity.name) set.add(b.rarity.name);
    });
    return Array.from(set);
  }, [allCatalogBrawlers]);

  // Liste des classes uniques présentes
  const uniqueClasses = useMemo(() => {
    const set = new Set<string>();
    allCatalogBrawlers.forEach((b) => {
      if (b.class.name) set.add(b.class.name);
    });
    return Array.from(set);
  }, [allCatalogBrawlers]);

  // Ouvre le sheet détail d'un brawler
  const handleOpenBrawlerDetail = (brawlerId: number) => {
    const found = allCatalogBrawlers.find((b) => b.id === brawlerId);
    if (found) {
      setSelectedBrawler(found);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Sélecteur de sous-vue : Rush vs Collection */}
      <div className="flex justify-center">
        <GlassSurface
          level="subtle"
          className="p-1 rounded-2xl inline-flex items-center gap-1.5 border border-white/10 shadow-lg"
        >
          <button
            type="button"
            onClick={() => setSubView('rush')}
            className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all min-h-[44px] ${
              subView === 'rush'
                ? 'bg-yellow-400 text-slate-950 shadow-[0_2px_10px_rgba(250,204,21,0.3)]'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Trophy className="w-4 h-4 shrink-0" />
            <span>Rush Trophées</span>
            {easyTrophies.length > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  subView === 'rush' ? 'bg-slate-950/20 text-slate-950' : 'bg-yellow-400/20 text-yellow-300'
                }`}
              >
                {easyTrophies.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setSubView('collection')}
            className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all min-h-[44px] ${
              subView === 'collection'
                ? 'bg-indigo-600 text-white shadow-[0_2px_10px_rgba(99,102,241,0.4)]'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Layers className="w-4 h-4 shrink-0" />
            <span>Collection</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                subView === 'collection' ? 'bg-white/20 text-white' : 'bg-white/10 text-slate-300'
              }`}
            >
              {catalogUnlocked}/{catalogTotal}
            </span>
          </button>
        </GlassSurface>
      </div>

      {/* ============================================================
          VUE 1 : RUSH TROPHÉES
          ============================================================ */}
      {subView === 'rush' && (
        <div className="space-y-6 sm:space-y-8">
          <TabHeader
            icon={Trophy}
            title="Accélérateur de Trophées"
            subtitle="Repérez instantanément les Brawlers les plus rentables à monter sans résistance"
            badge={`${easyTrophies.length} opportunités`}
          />

          {/* Filter Chips Bar */}
          <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
            <Chip
              label="Trophées Faciles"
              count={boostList.length}
              active={rushFilter === 'easy'}
              onClick={() => setRushFilter('easy')}
              tone="yellow"
            />
            <Chip
              label="Tilt Recovery"
              count={tiltList.length}
              active={rushFilter === 'tilt'}
              onClick={() => setRushFilter('tilt')}
              tone="red"
            />
            <Chip
              label="Tout le Roster"
              count={brawlers.length}
              active={rushFilter === 'all'}
              onClick={() => setRushFilter('all')}
              tone="cyan"
            />
          </div>

          {/* Easy Trophies List */}
          {rushFilter === 'easy' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {boostList.map((rec) => {
                const nextMilestone = rec.currentTrophies < 300 ? 300 : 500;
                const progressPercent = Math.round((rec.currentTrophies / nextMilestone) * 100);

                return (
                  <div
                    key={rec.brawlerId}
                    onClick={() => handleOpenBrawlerDetail(rec.brawlerId)}
                    className="cursor-pointer"
                  >
                    <Card
                      topHighlight={true}
                      className="flex flex-col justify-between border-3 border-[#070b16] hover:border-yellow-400/50 transition-colors"
                    >
                      <div>
                        <div className="flex items-start gap-3.5">
                          <BrawlerAvatar
                            id={rec.brawlerId}
                            name={getBrawlerFrenchName(rec.brawlerName, rec.brawlerId)}
                            power={rec.power}
                            size="lg"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="font-cartoon text-base text-white truncate">
                                {getBrawlerFrenchName(rec.brawlerName, rec.brawlerId)}
                              </span>
                              <span className="px-2 py-0.5 rounded-md text-xs font-cartoon uppercase bg-[#22c55e] text-[#070b16] border-2 border-[#070b16] shadow-[0_2px_0_#070b16]">
                                {rec.difficulty}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="font-cartoon text-sm text-[#ffc700] tabular-nums">
                                {rec.currentTrophies} 🏆
                              </span>
                              <span className="text-slate-400 font-bold text-xs">&rarr;</span>
                              <span className="font-cartoon text-xs text-slate-200 tabular-nums">
                                Palier {nextMilestone} 🏆
                              </span>
                            </div>
                          </div>
                        </div>

                        <p className="text-xs sm:text-sm text-slate-300 mt-3 font-medium leading-relaxed bg-[#101636] p-2.5 rounded-xl border border-white/5">
                          {rec.reason}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t-2 border-[#070b16]/60">
                        <ProgressBar
                          value={progressPercent}
                          label="Progression vers palier"
                          subLabel={`${progressPercent}%`}
                          color="yellow"
                          height="sm"
                        />
                        <div className="flex items-center justify-between text-xs font-bold text-[#4ade80] mt-2">
                          <span className="flex items-center gap-1 tabular-nums">
                            <Zap className="w-3.5 h-3.5 fill-[#4ade80]" /> +
                            {nextMilestone - rec.currentTrophies} trophées estimés
                          </span>
                          <span className="text-slate-400 text-xs">Fiche &rarr;</span>
                        </div>
                      </div>
                    </Card>
                  </div>
                );
              })}
            </div>
          )}

          {/* Tilt Recovery List */}
          {rushFilter === 'tilt' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tiltList.length === 0 ? (
                <div className="col-span-full brawl-card p-10 text-center text-slate-300">
                  <ShieldCheck className="w-12 h-12 text-[#22c55e] mx-auto mb-2" />
                  <h3 className="font-cartoon text-xl text-white">Aucun Brawler en tilt majeur !</h3>
                  <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto font-medium">
                    Félicitations, tous vos Brawlers sont proches de leur niveau record personnel.
                  </p>
                </div>
              ) : (
                tiltList.map((rec) => {
                  const diff = (rec.targetTrophies || 0) - rec.currentTrophies;
                  const progressPercent = Math.round(
                    (rec.currentTrophies / (rec.targetTrophies || 1)) * 100
                  );

                  return (
                    <div
                      key={rec.brawlerId}
                      onClick={() => handleOpenBrawlerDetail(rec.brawlerId)}
                      className="cursor-pointer"
                    >
                      <Card
                        topHighlight={true}
                        className="flex flex-col justify-between border-3 border-[#070b16] hover:border-red-400/50 transition-colors"
                      >
                        <div>
                          <div className="flex items-start gap-3.5">
                            <BrawlerAvatar
                              id={rec.brawlerId}
                              name={getBrawlerFrenchName(rec.brawlerName, rec.brawlerId)}
                              power={rec.power}
                              size="lg"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="font-cartoon text-base text-white truncate">
                                  {getBrawlerFrenchName(rec.brawlerName, rec.brawlerId)}
                                </span>
                                <span className="px-2 py-0.5 rounded-md text-xs font-cartoon uppercase bg-[#ef4444] text-white border-2 border-[#070b16] shadow-[0_2px_0_#070b16] tabular-nums">
                                  -{diff} tr
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="font-cartoon text-sm text-[#f87171] tabular-nums">
                                  {rec.currentTrophies} 🏆
                                </span>
                                <span className="text-slate-400 font-bold text-xs">&rarr;</span>
                                <span className="font-cartoon text-xs text-[#ffc700] tabular-nums">
                                  Record {rec.targetTrophies} 🏆
                                </span>
                              </div>
                            </div>
                          </div>

                          <p className="text-xs sm:text-sm text-slate-300 mt-3 font-medium leading-relaxed bg-[#101636] p-2.5 rounded-xl border border-white/5">
                            {rec.reason}
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t-2 border-[#070b16]/60">
                          <ProgressBar
                            value={progressPercent}
                            label="Niveau record"
                            subLabel={`${rec.currentTrophies} / ${rec.targetTrophies}`}
                            color="red"
                            height="sm"
                          />
                          <div className="flex items-center justify-between text-xs font-bold text-[#ffc700] mt-2">
                            <span className="flex items-center gap-1 tabular-nums">
                              <ArrowUpRight className="w-3.5 h-3.5" /> Récupérez {diff} trophées
                            </span>
                            <span className="text-slate-400 text-xs">Fiche &rarr;</span>
                          </div>
                        </div>
                      </Card>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Roster Grid Rush */}
          <Card topHighlight={true} className="p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
              <div>
                <h3 className="font-cartoon text-lg text-white">
                  Vos Brawlers Débloqués ({filteredRushBrawlers.length})
                </h3>
                <p className="text-xs text-slate-300">
                  Cliquez sur un Brawler pour afficher sa fiche complète (équipements et conseils)
                </p>
              </div>
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Rechercher (Colt, Spike)..."
                  value={rushSearch}
                  onChange={(e) => setRushSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#0e142e] border-2 border-[#070b16] text-xs font-bold text-white placeholder-slate-400 focus:outline-none focus:border-[#ffc700]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {filteredRushBrawlers.map((brawler) => {
                const deficit = brawler.highestTrophies - brawler.trophies;
                return (
                  <div
                    key={brawler.id}
                    onClick={() => handleOpenBrawlerDetail(brawler.id)}
                    className="brawl-card p-3 flex flex-col items-center text-center cursor-pointer transition-transform hover:-translate-y-1 active:scale-95"
                  >
                    <BrawlerAvatar
                      id={brawler.id}
                      name={getBrawlerFrenchName(brawler.name, brawler.id)}
                      power={brawler.power}
                      hasHypercharge={Boolean(brawler.hyperCharges && brawler.hyperCharges.length > 0)}
                      size="md"
                      className="mb-2"
                    />
                    <span className="font-cartoon text-xs text-white truncate max-w-full">
                      {getBrawlerFrenchName(brawler.name, brawler.id)}
                    </span>
                    <span className="font-cartoon text-xs text-[#ffc700] mt-0.5 tabular-nums">
                      {brawler.trophies} 🏆
                    </span>
                    <div className="flex items-center gap-1 mt-1 text-xs font-bold text-slate-400 tabular-nums">
                      <span>Max: {brawler.highestTrophies}</span>
                      {deficit > 0 && <span className="text-[#f87171]">(-{deficit})</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* ============================================================
          VUE 2 : COLLECTION COMPLÈTE (111 BRAWLERS SUPERCELL)
          ============================================================ */}
      {subView === 'collection' && (
        <div className="space-y-6 sm:space-y-8">
          <TabHeader
            icon={Layers}
            title="Collection Officielle Brawl Stars"
            subtitle="Inventaire complet des 111 Brawlers, équipements débloqués et priorités d'amélioration"
            badge={`${catalogUnlocked} / ${catalogTotal} débloqués`}
          />

          {/* Collection Progression Banner */}
          <Card topHighlight={true} className="p-5 sm:p-6 bg-[#0c1228]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-white uppercase tracking-wider">
                    {catalogUnlocked}{' '}
                    <span className="text-white/40 text-lg sm:text-xl font-normal">
                      / {catalogTotal}
                    </span>
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {Math.round((catalogUnlocked / catalogTotal) * 100)}% Complet
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  {catalogTotal - catalogUnlocked} Brawlers restent à débloquer dans les boîtes et la route des trophées
                </p>
              </div>

              {/* Badges récapitulatifs */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs font-bold text-slate-300">
                  <Zap className="w-3.5 h-3.5 text-emerald-400" />
                  <span>
                    {allCatalogBrawlers.reduce(
                      (acc, b) => acc + b.gadgets.filter((g) => g.isUnlocked).length,
                      0
                    )}{' '}
                    Gadgets
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs font-bold text-slate-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    {allCatalogBrawlers.reduce(
                      (acc, b) => acc + b.starPowers.filter((sp) => sp.isUnlocked).length,
                      0
                    )}{' '}
                    Star Powers
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs font-bold text-slate-300">
                  <Flame className="w-3.5 h-3.5 text-fuchsia-400" />
                  <span>
                    {allCatalogBrawlers.reduce(
                      (acc, b) => acc + b.hyperCharges.filter((hc) => hc.isUnlocked).length,
                      0
                    )}{' '}
                    Hypercharges
                  </span>
                </div>
              </div>
            </div>

            <ProgressBar
              value={Math.round((catalogUnlocked / catalogTotal) * 100)}
              color="purple"
              height="md"
            />
          </Card>

          {/* Filtres et Recherche Collection */}
          <div className="space-y-3">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {/* Recherche */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, classe, rareté..."
                  value={collectionSearch}
                  onChange={(e) => setCollectionSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0e142e] border-2 border-[#070b16] text-xs sm:text-sm font-bold text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Sélecteur de Tri */}
              <div className="flex items-center gap-2 shrink-0">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  aria-label="Trier par"
                  className="bg-[#0e142e] border-2 border-[#070b16] text-white text-xs font-bold rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500 min-h-[44px]"
                >
                  <option value="trophies">Trier par Trophées (↓)</option>
                  <option value="power">Trier par Niveau (↓)</option>
                  <option value="rarity">Trier par Rareté (↓)</option>
                  <option value="name">Trier par Nom (A-Z)</option>
                </select>
              </div>
            </div>

            {/* Chips de statut et filtres avancés */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <Chip
                label="Tous"
                count={allCatalogBrawlers.length}
                active={statusFilter === 'all'}
                onClick={() => setStatusFilter('all')}
                tone="purple"
              />
              <Chip
                label="Débloqués"
                count={catalogUnlocked}
                active={statusFilter === 'unlocked'}
                onClick={() => setStatusFilter('unlocked')}
                tone="cyan"
              />
              <Chip
                label="À débloquer"
                count={catalogTotal - catalogUnlocked}
                active={statusFilter === 'locked'}
                onClick={() => setStatusFilter('locked')}
                tone="yellow"
              />

              {/* Filtre Rareté */}
              {uniqueRarities.length > 0 && (
                <select
                  value={rarityFilter}
                  onChange={(e) => setRarityFilter(e.target.value)}
                  aria-label="Filtrer par rareté"
                  className="bg-[#0e142e] border-2 border-[#070b16] text-slate-300 text-xs font-bold rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 shrink-0"
                >
                  <option value="all">Toutes les Raretés</option>
                  {uniqueRarities.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              )}

              {/* Filtre Classe */}
              {uniqueClasses.length > 0 && (
                <select
                  value={classFilter}
                  onChange={(e) => setClassFilter(e.target.value)}
                  aria-label="Filtrer par classe"
                  className="bg-[#0e142e] border-2 border-[#070b16] text-slate-300 text-xs font-bold rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 shrink-0"
                >
                  <option value="all">Toutes les Classes</option>
                  {uniqueClasses.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Grille des Brawlers Collection */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {filteredCollectionBrawlers.map((brawler) => {
              const hasHighPriority =
                brawler.isUnlocked && brawler.upgradePriority?.levelLabel === 'Priorité Haute';

              return (
                <div
                  key={brawler.id}
                  onClick={() => setSelectedBrawler(brawler)}
                  className={`brawl-card p-3 flex flex-col items-center text-center cursor-pointer transition-all hover:-translate-y-1 active:scale-95 relative group ${
                    !brawler.isUnlocked ? 'opacity-55 hover:opacity-85' : ''
                  }`}
                  style={{
                    borderColor: brawler.isUnlocked ? `${brawler.rarity.color}60` : '#1f293d',
                  }}
                >
                  {/* Badge Haute Priorité Bitz */}
                  {hasHighPriority && (
                    <div className="absolute top-1.5 right-1.5 z-10 w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-md animate-pulse">
                      <Sparkles className="w-3 h-3" />
                    </div>
                  )}

                  {/* Avatar */}
                  <BrawlerAvatar
                    id={brawler.id}
                    name={brawler.name}
                    power={brawler.isUnlocked ? brawler.power : undefined}
                    rarityColor={brawler.rarity.color}
                    hasHypercharge={brawler.hyperCharges.some((hc) => hc.isUnlocked)}
                    size="md"
                    className={`mb-2 ${!brawler.isUnlocked ? 'filter grayscale' : ''}`}
                  />

                  {/* Nom en Français */}
                  <span className="font-cartoon text-xs text-white truncate max-w-full">
                    {brawler.name}
                  </span>

                  {/* Rareté & Classe */}
                  <div className="flex items-center gap-1 mt-0.5">
                    <span
                      style={{ color: brawler.rarity.color }}
                      className="text-[10px] font-black uppercase tracking-tight truncate"
                    >
                      {brawler.rarity.name}
                    </span>
                  </div>

                  {/* Trophées ou Statut Verrouillé */}
                  {brawler.isUnlocked ? (
                    <div className="flex items-center gap-1 mt-1 font-cartoon text-xs text-yellow-400 tabular-nums">
                      <Trophy className="w-3 h-3 text-yellow-400" />
                      <span>{brawler.trophies}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 mt-1 text-[10px] font-bold text-slate-500">
                      <Lock className="w-3 h-3" />
                      <span>À débloquer</span>
                    </div>
                  )}

                  {/* Mini indicateurs d'équipements */}
                  {brawler.isUnlocked && (
                    <div className="flex items-center gap-1 mt-2 text-[9px] font-black text-slate-400">
                      <span
                        className={`px-1 py-0.2 rounded ${
                          brawler.gadgets.some((g) => g.isUnlocked)
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-white/5 text-slate-600'
                        }`}
                        title="Gadget"
                      >
                        G
                      </span>
                      <span
                        className={`px-1 py-0.2 rounded ${
                          brawler.starPowers.some((sp) => sp.isUnlocked)
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-white/5 text-slate-600'
                        }`}
                        title="Star Power"
                      >
                        SP
                      </span>
                      {brawler.hyperCharges.length > 0 && (
                        <span
                          className={`px-1 py-0.2 rounded ${
                            brawler.hyperCharges.some((hc) => hc.isUnlocked)
                              ? 'bg-fuchsia-500/30 text-fuchsia-300'
                              : 'bg-white/5 text-slate-600'
                          }`}
                          title="Hypercharge"
                        >
                          HC
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {filteredCollectionBrawlers.length === 0 && (
            <div className="brawl-card p-10 text-center text-slate-400">
              <p className="font-cartoon text-base text-white">Aucun Brawler ne correspond aux filtres.</p>
              <button
                type="button"
                onClick={() => {
                  setCollectionSearch('');
                  setStatusFilter('all');
                  setRarityFilter('all');
                  setClassFilter('all');
                }}
                className="mt-3 px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-bold hover:bg-white/20"
              >
                Réinitialiser les filtres
              </button>
            </div>
          )}
        </div>
      )}

      {/* Sheet Détail Brawler Interactif */}
      <BrawlerDetailSheet
        brawler={selectedBrawler}
        onClose={() => setSelectedBrawler(null)}
      />
    </div>
  );
}
