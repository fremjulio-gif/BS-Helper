import { NextRequest, NextResponse } from 'next/server';
import { fetchPlayerProfile, fetchEventsRotation, fetchPlayerBattleLog } from '@/lib/brawlstars-api';
import { analyzeBattleLog } from '@/lib/strategy-engine';

export async function POST(req: NextRequest) {
  try {
    const { question, tag } = await req.json();
    const playerTag = tag || process.env.DEFAULT_PLAYER_TAG || '#8L80JGJGG';

    const [profile, battleLog, events] = await Promise.all([
      fetchPlayerProfile(playerTag),
      fetchPlayerBattleLog(playerTag),
      fetchEventsRotation(),
    ]);

    const summary = analyzeBattleLog(battleLog.items, profile.tag);

    // If GEMINI_API_KEY is available, use it for rich dynamic responses
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
      try {
        const prompt = `Tu es un coach expert Brawl Stars professionnel (niveau e-sport).
Données du joueur :
- Pseudo : ${profile.name} (Tag: ${profile.tag})
- Trophées : ${profile.trophies} (Record: ${profile.highestTrophies})
- Rang classé : ${profile.rankedRankName || 'Non classé'} (${profile.rankedElo || 0} Elo)
- 3v3 Victoires : ${profile['3vs3Victories']}, Solo : ${profile.soloVictories}, Duo : ${profile.duoVictories}
- Winrate récent : ${summary.winRate}% (${summary.victories}V / ${summary.defeats}D sur les 25 derniers combats, net : ${summary.trophyDelta > 0 ? '+' : ''}${summary.trophyDelta} trophées)
- Taux Star Player : ${summary.starPlayerRate}%
- Brawlers clés : ${profile.brawlers.slice(0, 5).map((b) => `${b.name} (${b.trophies} tr, niv ${b.power})`).join(', ')}

Question du joueur : "${question}"

Réponds de manière concise, percutante, motivante et très tactique (choix de brawler, gadget, star power, positionnement, gestion du tilt). Formate ta réponse avec des listes à puces claires et des émojis adaptés.`;

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
            }),
          }
        );

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const reply = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (reply) {
            return NextResponse.json({ reply });
          }
        }
      } catch (geminiError) {
        console.warn('Gemini API call failed, falling back to local coach:', geminiError);
      }
    }

    // Local Specialized Rule-Based Coach
    const qLower = (question || '').toLowerCase();
    let advice = '';

    if (qLower.includes('spike') || qLower.includes('1200') || qLower.includes('record')) {
      advice = `🌵 **Stratégie Spéciale Spike (Actuellement à 1 205 tr)** :
- **Build optimal :** Pouvoir Star *Curveball* (Balles à effet) + Gadget *Life Plant* (Plante bouclier/soin) + Équipements *Dégâts* & *Vitesse*.
- **Règles d'or à 1200+ trophées :**
  1. Ne joue **JAMAIS** en solo ou avec des randoms à ce rang : la perte de trophées (-10 à -12 par défaite) est trop punitive.
  2. Joue en équipe pré-construite en **Braquage (Heist)** sur des maps ouvertes ou en **Brawl Ball** en contrôle de ligne.
  3. Utilise la Plante pour bloquer les tirs directs (Piper, Bea, Brock) ou les assauts (Edgar, Mortis).`;
    } else if (qLower.includes('monter') || qLower.includes('troph') || qLower.includes('rush')) {
      const easyBrawlers = profile.brawlers.filter((b) => b.trophies < 300);
      advice = `🚀 **Plan de Rush Rapide pour ${profile.name} (Objectif +1 000 trophées)** :
1. **Pillage de trophées faciles :** Vous avez **${easyBrawlers.length} Brawlers sous les 300 trophées** (ex: ${easyBrawlers.slice(0, 4).map((b) => b.name).join(', ')}).
   - *Pourquoi ?* Chaque victoire rapporte 8 à 10 trophées avec matchmaking 80% bots jusqu'à 300 trophées.
2. **Votre mode le plus efficace récemment :** Vous affichez un excellent winrate en **Duo Showdown** avec ${summary.starPlayerCount > 0 ? 'un gros taux de MVP' : 'une bonne régularité'}.
3. **Gestion du Tilt :** Arrêtez de jouer un Brawler dès que vous perdez 2 parties consécutives avec lui.`;
    } else if (qLower.includes('map') || qLower.includes('rotation') || qLower.includes('mode')) {
      const topEvent = events[0];
      advice = `🗺️ **Analyse de la rotation actuelle** :
- **Mode phare en cours :** ${topEvent?.event?.mode || 'Showdown'} sur la map **"${topEvent?.event?.map || 'Actuelle'}"**.
- **Conseil compo :** Privilégiez vos Brawlers niveau 10/11 avec Hypercharge (Spike, Jessie, Buzz).
- Si vous jouez en solo/duo, sécurisez rapidement 2 boîtes et temporisez au centre sans sur-engager avant le top 4.`;
    } else {
      advice = `💡 **Conseils du Coach pour ${profile.name}** :
- **Winrate récent :** ${summary.winRate}% sur 25 parties (Net: ${summary.trophyDelta > 0 ? '+' : ''}${summary.trophyDelta} tr).
- **Point fort :** Votre niveau d'EXP (${profile.expLevel}) et vos victoires 3v3 (${profile['3vs3Victories']}) montrent une excellente maîtrise du jeu en équipe.
- **Action recommandée immédiate :** Montez vos Brawlers récemment débloqués jusqu'au Palier 500 pour franchir rapidement les 27 000 trophées globaux !`;
    }

    return NextResponse.json({ reply: advice });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur du coach';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
