'use client';

import React, { useState } from 'react';
import {
  PlayerProfile,
  BattleLogSummary,
  TacticalTip,
  SessionObjective,
  LossPatternReport,
  UpgradePriorityItem,
  MilestoneRoad,
} from '@/types/brawlstars';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Chip } from '../ui/Chip';
import { ProgressBar } from '../ui/ProgressBar';
import { CoachMascot, MascotMood } from '../ui/CoachMascot';
import { GlassSurface } from '../ui/GlassSurface';
import { soundManager } from '@/lib/sound-manager';
import { m } from 'motion/react';
import { springSnappy } from '@/lib/motion-tokens';
import {
  Send,
  Sparkles,
  MessageSquare,
  ListFilter,
  Target,
  ArrowUpRight,
  ShieldAlert,
} from 'lucide-react';

interface CoachTabProps {
  profile: PlayerProfile;
  battleSummary: BattleLogSummary;
  coachTips: TacticalTip[];
  sessionObjectives?: SessionObjective[];
  lossReport?: LossPatternReport | null;
  upgradePriorities?: UpgradePriorityItem[];
  milestoneRoad?: MilestoneRoad | null;
}

interface Message {
  role: 'assistant' | 'user';
  text: string;
  mood?: MascotMood;
}

export function CoachTab({
  profile,
  battleSummary,
  coachTips,
  sessionObjectives = [],
  lossReport,
  upgradePriorities = [],
  milestoneRoad,
}: CoachTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<'chat' | 'tips' | 'session'>('chat');
  const [tipFilter, setTipFilter] = useState<string>('all');

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      mood: lossReport?.tiltAlertActive ? 'tilt' : 'pumped',
      text: `Salut ${profile.name} ! Je suis **Coach Bitz**, ton partenaire tactique d'entraînement.

J'ai analysé ton profil (**${profile.trophies.toLocaleString()} trophées**, niveau **${profile.expLevel}**, rang **${profile.rankedRankName || 'DIAMOND I'}**) et tes 25 derniers combats (**${battleSummary.winRate}% de winrate**).

${
  lossReport?.tiltAlertActive
    ? '⚠️ J\'ai détecté une alerte tilt sur tes derniers matchs. Prends un moment pour consulter mes conseils anti-tilt !'
    : 'Tout est au vert ! Dis-moi quel Brawler ou quel mode tu souhaites perfectionner.'
}`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const quickPrompts = [
    '🚀 Plan de rush express pour +1 000 trophées',
    '🌵 Stratégie d\'expert pour Spike à 1 200+ tr',
    '🗺️ Meilleur brawler pour la rotation active',
    '🛡️ Comment briser une série de défaites ?',
  ];

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    soundManager.playTap();
    const userMsg: Message = { role: 'user', text: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: textToSend, tag: profile.tag }),
      });
      const data = await res.json();
      if (data.reply) {
        soundManager.playSuccess();
        const replyMood: MascotMood =
          data.reply.includes('Tilt') || data.reply.includes('Attention') ? 'tilt' : 'proud';
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', text: data.reply, mood: replyMood },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            mood: 'neutral',
            text: "Désolé, je n'ai pas pu générer de conseil pour l'instant.",
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          mood: 'tilt',
          text: 'Une erreur de connexion est survenue. Vérifiez votre connexion et réessayez.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredTips = coachTips.filter((tip) => {
    if (tipFilter === 'all') return true;
    return tip.category === tipFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-cartoon text-white flex items-center gap-2.5 text-stroke-sm">
            <div className="p-1.5 rounded-xl bg-[#ffc700] border-2 border-[#070b16] text-[#070b16]">
              <Sparkles className="w-5 h-5 fill-[#070b16]" />
            </div>
            Centre d&apos;Entraînement Coach Bitz
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
            Diagnostics en temps réel, analyses de patterns et coaching personnalisé.
          </p>
        </div>

        {/* View Switcher Chips */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <Chip
            label="Chat Tactique"
            icon={<MessageSquare className="w-4 h-4" />}
            active={activeSubTab === 'chat'}
            onClick={() => setActiveSubTab('chat')}
            tone="yellow"
          />
          <Chip
            label="Conseils Ciblés"
            count={coachTips.length}
            icon={<ListFilter className="w-4 h-4" />}
            active={activeSubTab === 'tips'}
            onClick={() => setActiveSubTab('tips')}
            tone="cyan"
          />
          <Chip
            label="Plan de Session"
            count={sessionObjectives.length}
            icon={<Target className="w-4 h-4" />}
            active={activeSubTab === 'session'}
            onClick={() => setActiveSubTab('session')}
            tone="purple"
          />
        </div>
      </div>

      {/* SUB-TAB 1: LIVE CHAT */}
      {activeSubTab === 'chat' && (
        <Card topHighlight={true} className="p-4 sm:p-5 flex flex-col h-[540px] border-3 border-[#070b16]">
          {/* Messages feed */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {messages.map((msg, i) => (
              <m.div
                key={i}
                initial={{ opacity: 0, scale: 0.92, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={springSnappy}
                className={`flex items-start gap-3 ${
                  msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                {msg.role === 'assistant' ? (
                  <CoachMascot mood={msg.mood || 'neutral'} size={44} />
                ) : (
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-b from-[#ffdc2e] to-[#ffaa00] border-2 border-[#070b16] shadow-[0_2px_0_#070b16] flex items-center justify-center font-cartoon text-[#070b16] text-xs shrink-0">
                    MOI
                  </div>
                )}

                <div
                  className={`rounded-2xl px-4 py-3 max-w-[85%] text-xs sm:text-sm leading-relaxed border-2 border-[#070b16] shadow-[0_3px_0_#070b16] ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-[#00d9ff] to-[#0099b8] text-[#070b16] font-bold'
                      : 'bg-[#101736] text-slate-100 font-medium'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                </div>
              </m.div>
            ))}

            {loading && (
              <m.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3"
              >
                <CoachMascot mood="pumped" size={40} />
                <div className="bg-[#101736] px-4 py-2.5 rounded-2xl border-2 border-[#070b16] text-xs font-bold text-yellow-300 flex items-center gap-2.5">
                  <div className="flex items-center gap-1">
                    <m.span
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity, delay: 0 }}
                      className="w-2 h-2 rounded-full bg-[#ffc700] inline-block"
                    />
                    <m.span
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity, delay: 0.15 }}
                      className="w-2 h-2 rounded-full bg-[#ffc700] inline-block"
                    />
                    <m.span
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity, delay: 0.3 }}
                      className="w-2 h-2 rounded-full bg-[#ffc700] inline-block"
                    />
                  </div>
                  <span>Coach Bitz réfléchit à ta stratégie...</span>
                </div>
              </m.div>
            )}
          </div>

          {/* Quick prompt chips */}
          <div className="pt-3 border-t-2 border-[#070b16]/60 mt-3 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {quickPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                disabled={loading}
                className="text-xs font-cartoon bg-[#12183c] hover:bg-[#1a2355] text-slate-200 px-3.5 py-2 rounded-xl border-2 border-[#070b16] shadow-[0_2px_0_#070b16] whitespace-nowrap cursor-pointer transition-transform active:translate-y-0.5 disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Chat input glass capsule */}
          <GlassSurface
            level="subtle"
            className="p-1.5 rounded-2xl sm:rounded-3xl flex items-center gap-2 mt-2 shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Pose ta question à Bitz (ex: 'Conseil Heist', 'Build Spike')..."
              disabled={loading}
              className="flex-1 bg-transparent border-none px-4 py-2.5 text-xs sm:text-sm font-bold text-white placeholder-slate-400 focus:outline-none"
            />
            <Button
              variant="yellow"
              size="md"
              icon={<Send className="w-4 h-4 text-[#070b16]" />}
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
            >
              <span className="hidden sm:inline">Envoyer</span>
            </Button>
          </GlassSurface>
        </Card>
      )}

      {/* SUB-TAB 2: TYPED & EXPLAINED TIPS */}
      {activeSubTab === 'tips' && (
        <div className="space-y-4">
          {/* Category filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <Chip
              label="Tous les conseils"
              count={coachTips.length}
              active={tipFilter === 'all'}
              onClick={() => setTipFilter('all')}
              tone="yellow"
            />
            <Chip
              label="Tilt & Alertes"
              active={tipFilter === 'tilt_warning'}
              onClick={() => setTipFilter('tilt_warning')}
              tone="red"
            />
            <Chip
              label="Améliorations"
              active={tipFilter === 'upgrade_priority'}
              onClick={() => setTipFilter('upgrade_priority')}
              tone="cyan"
            />
            <Chip
              label="Patterns de défaite"
              active={tipFilter === 'loss_pattern'}
              onClick={() => setTipFilter('loss_pattern')}
              tone="purple"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTips.map((tip) => (
              <Card
                key={tip.id}
                topHighlight={true}
                className="p-5 flex flex-col justify-between border-3 border-[#070b16]"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-cartoon uppercase border-2 border-[#070b16] shadow-[0_2px_0_#070b16] ${
                        tip.priority === 'high'
                          ? 'bg-[#ef4444] text-white'
                          : tip.priority === 'medium'
                          ? 'bg-[#ffc700] text-[#070b16]'
                          : 'bg-[#00d9ff] text-[#070b16]'
                      }`}
                    >
                      {tip.tagText || 'Conseil'}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 bg-[#0d132c] px-2 py-0.5 rounded-lg border border-white/5">
                      {tip.confidence}
                    </span>
                  </div>

                  <h3 className="font-cartoon text-base text-white mt-1">{tip.title}</h3>

                  <div className="mt-3 bg-[#0d132c] p-3 rounded-xl border border-white/5 space-y-1.5">
                    <div className="text-xs text-slate-300 font-medium">
                      <span className="font-bold text-[#ffc700]">Donnée source : </span>
                      {tip.why}
                    </div>
                    <div className="text-xs text-slate-100 font-bold">
                      <span className="font-bold text-[#4ade80]">Quoi faire : </span>
                      {tip.action}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: SESSION OBJECTIVES */}
      {activeSubTab === 'session' && (
        <div className="space-y-4">
          {/* Tilt Alert Banner if active */}
          {lossReport?.tiltAlertActive && (
            <Card
              className="p-5 border-3 border-[#ef4444] bg-[#2d121c]"
              topHighlight={true}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-[#ef4444] border-2 border-[#070b16] text-white shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-cartoon text-base text-white">
                    Alerte Tilt Active ({lossReport.consecutiveLosses} défaites d&apos;affilée)
                  </h4>
                  <p className="text-xs text-rose-200 font-medium mt-1">
                    {lossReport.cooldownMessage ||
                      'Prenez une pause de 10 minutes ou changez d\'ambiance pour éviter de perdre vos trophées durement acquis.'}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Milestone Road */}
          {milestoneRoad && (
            <Card topHighlight={true} className="p-5 border-3 border-[#070b16]">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-[#ffc700] border-2 border-[#070b16] text-[#070b16]">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-cartoon text-base text-white">
                    Objectif Palier : {milestoneRoad.rankTitle}
                  </h4>
                  <p className="text-xs text-slate-300">
                    Plus que {milestoneRoad.trophiesRemaining} trophées (~{milestoneRoad.estimatedMatches} victoires estimées)
                  </p>
                </div>
              </div>
              <p className="text-xs text-yellow-300 bg-[#0d132c] p-3 rounded-xl border border-white/5 font-medium mt-2">
                💡 {milestoneRoad.advice}
              </p>
            </Card>
          )}

          {/* Session Objectives */}
          <Card topHighlight={true} className="p-5 sm:p-6 border-3 border-[#070b16]">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-[#c084fc] border-2 border-[#070b16] text-[#070b16]">
                <Target className="w-5 h-5 fill-[#070b16]" />
              </div>
              <div>
                <h3 className="font-cartoon text-lg text-white">
                  Feuille de Route de la Session
                </h3>
                <p className="text-xs text-slate-300 font-medium">
                  Objectifs réalistes calculés selon votre cadence de jeu actuelle
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {sessionObjectives.map((obj) => {
                const progressPct = Math.min(100, Math.round((obj.current / obj.target) * 100));

                return (
                  <div
                    key={obj.id}
                    className="brawl-card p-4 sm:p-5 bg-[#12183d] border-2 border-[#070b16]"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-cartoon text-base text-white">{obj.title}</span>
                          {obj.completed && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-cartoon bg-[#22c55e] text-[#070b16]">
                              Terminé !
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-300 font-medium mt-1">
                          {obj.targetDescription}
                        </p>
                      </div>

                      <span className="font-cartoon text-sm text-[#4ade80] shrink-0">
                        +{obj.potentialGain} tr potentiels
                      </span>
                    </div>

                    <ProgressBar
                      value={progressPct}
                      subLabel={`${obj.current} / ${obj.target} ${obj.unit} (${progressPct}%)`}
                      color={obj.completed ? 'green' : 'yellow'}
                      height="md"
                    />
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Upgrade Priorities */}
          {upgradePriorities.length > 0 && (
            <Card topHighlight={true} className="p-5 border-3 border-[#070b16]">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-xl bg-[#22c55e] border-2 border-[#070b16] text-[#070b16]">
                  <ArrowUpRight className="w-5 h-5 text-[#070b16]" />
                </div>
                <div>
                  <h4 className="font-cartoon text-base text-white">
                    Priorités d&apos;Amélioration Rentables
                  </h4>
                  <p className="text-xs text-slate-300">
                    Brawlers à améliorer pour débloquer Star Powers et Hypercharges
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {upgradePriorities.slice(0, 4).map((up) => (
                  <div
                    key={up.brawlerId}
                    className="brawl-card p-3 bg-[#12183d] border-2 border-[#070b16] flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-cartoon text-sm text-white">{up.brawlerName}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-cartoon bg-[#ffc700] text-[#070b16]">
                          {up.missingAccessory}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 font-medium">
                        {up.impactDescription}
                      </p>
                    </div>
                    <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Pouvoir {up.currentPower} &rarr; {up.targetPower}</span>
                      <span className="font-bold text-[#4ade80]">Priorité {up.priority}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
