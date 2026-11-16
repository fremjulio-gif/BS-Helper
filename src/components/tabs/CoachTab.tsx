'use client';

import React, { useState } from 'react';
import { PlayerProfile, BattleLogSummary } from '@/types/brawlstars';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { CoachMascot, MascotMood } from '../ui/CoachMascot';
import { soundManager } from '@/lib/sound-manager';
import { Send, Sparkles } from 'lucide-react';

interface CoachTabProps {
  profile: PlayerProfile;
  battleSummary: BattleLogSummary;
  coachTips: Array<{ title: string; message: string; priority: 'high' | 'medium' | 'low'; icon: string }>;
}

interface Message {
  role: 'assistant' | 'user';
  text: string;
  mood?: MascotMood;
}

export function CoachTab({ profile, battleSummary, coachTips }: CoachTabProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      mood: 'pumped',
      text: `Salut ${profile.name} ! Je suis **Coach Bitz**, ton partenaire tactique d'entraînement.

J'ai analysé ton profil (**${profile.trophies.toLocaleString()} trophées**, niveau **${profile.expLevel}**, rang **${profile.rankedRankName || 'DIAMOND I'}**) et tes 25 derniers combats (**${battleSummary.winRate}% de winrate**).

Dis-moi tout : quel Brawler veux-tu pousser ou sur quel mode veux-tu un plan de jeu ?`,
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
        const replyMood: MascotMood = data.reply.includes('Tilt') || data.reply.includes('Attention') ? 'tilt' : 'proud';
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-cartoon text-white flex items-center gap-2.5 text-stroke-sm">
          <div className="p-1.5 rounded-xl bg-[#ffc700] border-2 border-[#070b16] text-[#070b16]">
            <Sparkles className="w-5 h-5 fill-[#070b16]" />
          </div>
          Coach Bitz — Entraîneur Tactique
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
          Conseils actionnables basés sur vos vraies statistiques et votre style de jeu.
        </p>
      </div>

      {/* Top 3 Diagnostic Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {coachTips.slice(0, 3).map((tip, idx) => (
          <Card key={idx} topHighlight={true} className="p-4 border-2 border-[#070b16]">
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1 rounded-lg bg-[#ffc700] text-[#070b16] border border-[#070b16]">
                <Sparkles className="w-3.5 h-3.5 fill-[#070b16]" />
              </span>
              <span className="font-cartoon text-sm text-white truncate">{tip.title}</span>
            </div>
            <p className="text-xs text-slate-300 font-medium leading-relaxed">{tip.message}</p>
          </Card>
        ))}
      </div>

      {/* Interactive Messenger Console */}
      <Card topHighlight={true} className="p-4 sm:p-5 flex flex-col h-[540px] border-3 border-[#070b16]">
        {/* Messages feed */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {messages.map((msg, i) => (
            <div
              key={i}
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
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3">
              <CoachMascot mood="pumped" size={40} />
              <div className="bg-[#101736] px-4 py-2.5 rounded-2xl border-2 border-[#070b16] text-xs font-bold text-yellow-300 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#ffc700] animate-ping" />
                Coach Bitz calcule ta stratégie...
              </div>
            </div>
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

        {/* Chat input */}
        <div className="pt-2 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Pose ta question à Bitz (ex: 'Conseil Heist', 'Build Spike')..."
            disabled={loading}
            className="flex-1 bg-[#0b1029] border-2 border-[#070b16] rounded-2xl px-4 py-3 text-xs sm:text-sm font-bold text-white placeholder-slate-400 focus:outline-none focus:border-[#ffc700]"
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
        </div>
      </Card>
    </div>
  );
}
