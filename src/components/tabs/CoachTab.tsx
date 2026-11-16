'use client';

import React, { useState } from 'react';
import { PlayerProfile, BattleLogSummary } from '@/types/brawlstars';
import { BotMessageSquare, Send, Sparkles } from 'lucide-react';

interface CoachTabProps {
  profile: PlayerProfile;
  battleSummary: BattleLogSummary;
  coachTips: Array<{ title: string; message: string; priority: 'high' | 'medium' | 'low'; icon: string }>;
}

interface Message {
  role: 'assistant' | 'user';
  text: string;
}

export function CoachTab({ profile, battleSummary, coachTips }: CoachTabProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: `Salut ${profile.name} ! Je suis ton coach tactique IA Brawl Stars.
J'ai analysé ton profil (**${profile.trophies.toLocaleString()} trophées**, niveau **${profile.expLevel}**, rang **${profile.rankedRankName || 'DIAMOND I'}**) et tes 25 derniers combats (**${battleSummary.winRate}% de winrate**).

Je suis prêt à t'aider à franchir un palier : choix de Brawler pour la map en cours, stratégie pour ton Spike à 1 200+ trophées, ou plan de rush express. Que veux-tu savoir ?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const quickPrompts = [
    '🚀 Quel est le plan le plus rapide pour monter de 1 000 trophées ?',
    '🌵 Comment pousser mon Spike (1 205 tr) sans risquer de tilt ?',
    '🗺️ Quel Brawler dois-je choisir sur la rotation actuelle ?',
    '🛡️ Analyse mes erreurs et points faibles récents',
  ];

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

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
        setMessages((prev) => [...prev, { role: 'assistant', text: data.reply }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', text: "Désolé, je n'ai pas pu générer de conseil pour l'instant." },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: 'Une erreur de connexion est survenue avec le coach IA.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
          <BotMessageSquare className="w-6 h-6 text-yellow-400" />
          Coach Tactique & IA Stratégique
        </h2>
        <p className="text-xs sm:text-sm text-slate-400">
          Analyse vos forces, détecte vos opportunités et vous guide vers vos objectifs de trophées.
        </p>
      </div>

      {/* Coach Diagnostic Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {coachTips.slice(0, 3).map((tip, idx) => (
          <div
            key={idx}
            className="esport-card p-4 rounded-xl border-yellow-500/20 hover:border-yellow-500/40 transition-all"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className="p-1 rounded bg-yellow-500/20 text-yellow-400">
                <Sparkles className="w-3.5 h-3.5" />
              </span>
              <span className="text-xs font-bold text-white truncate">{tip.title}</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{tip.message}</p>
          </div>
        ))}
      </div>

      {/* Interactive Chat Console */}
      <div className="esport-card rounded-2xl p-4 sm:p-5 flex flex-col h-[520px]">
        {/* Messages list */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 ${
                msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  msg.role === 'user'
                    ? 'bg-slate-700 text-white'
                    : 'bg-yellow-500 text-black shadow-md shadow-yellow-500/20'
                }`}
              >
                {msg.role === 'user' ? 'MOI' : 'IA'}
              </div>

              <div
                className={`rounded-2xl px-4 py-3 max-w-[85%] text-xs sm:text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-yellow-500/15 text-yellow-200 border border-yellow-500/30'
                    : 'bg-slate-900/90 text-slate-200 border border-white/10'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-slate-400 italic">
              <div className="w-2 h-2 rounded-full bg-yellow-400 animate-ping" />
              Le Coach IA analyse vos données de combat...
            </div>
          )}
        </div>

        {/* Quick Prompts */}
        <div className="pt-3 border-t border-white/10 mt-3 flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSend(prompt)}
              disabled={loading}
              className="text-[11px] font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-white/5 whitespace-nowrap cursor-pointer transition-all disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Chat Input */}
        <div className="pt-2 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Posez votre question au coach (ex: 'Conseil pour Heist', 'Build Colt')..."
            disabled={loading}
            className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-yellow-500"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="px-4 py-2.5 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold text-xs sm:text-sm transition-all shadow-md shadow-yellow-500/20 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Envoyer</span>
          </button>
        </div>
      </div>
    </div>
  );
}
