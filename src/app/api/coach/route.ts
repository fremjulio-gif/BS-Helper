import { NextRequest, NextResponse } from 'next/server';
import { fetchPlayerProfile, fetchEventsRotation, fetchPlayerBattleLog } from '@/lib/brawlstars-api';
import { getBrawlerFrenchName } from '@/lib/brawler-names';
import {
  analyzeBattleLog,
  analyzeLossPatterns,
  detectUpgradePriorities,
  calculateMilestoneRoad,
  generateComprehensiveTacticalTips,
} from '@/lib/strategy-engine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const question = body.question || body.message || '';
    const tag = body.tag;
    const playerTag = tag || process.env.DEFAULT_PLAYER_TAG || '#8L80JGJGG';

    const [profile, battleLog, events] = await Promise.all([
      fetchPlayerProfile(playerTag),
      fetchPlayerBattleLog(playerTag),
      fetchEventsRotation(),
    ]);

    const summary = analyzeBattleLog(battleLog.items, profile.tag);
    const lossReport = analyzeLossPatterns(battleLog.items, profile.tag);
    const upgrades = detectUpgradePriorities(profile);
    const milestone = calculateMilestoneRoad(profile, []);
    const tips = generateComprehensiveTacticalTips(
      profile,
      summary,
      lossReport,
      upgrades,
      milestone
    );

    // If GEMINI_API_KEY is available, use it with a strict prompt & timeout
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 7000);

        const prompt = `Tu es "Coach Bitz", un robot d'entraînement tactique amical, motivant et expert de Brawl Stars.
Tu tutoies le joueur (${profile.name}). Tu es direct, percutant et tu te bases STRICTEMENT sur les faits suivants sans jamais inventer de données :

DONNÉES VÉRIFIÉES DU JOUEUR :
- Pseudo : ${profile.name} (#${profile.tag.replace('#', '')})
- Trophées : ${profile.trophies} 🏆 (Record : ${profile.highestTrophies})
- Niveau d'EXP : ${profile.expLevel} | Rang classé : ${profile.rankedRankName || 'Non classé'} (${profile.rankedElo || 0} Elo)
- Victoires : ${profile['3vs3Victories']} en 3v3, ${profile.soloVictories} en Solo, ${profile.duoVictories} en Duo
- Performance récente (25 matchs) : ${summary.winRate}% de winrate (${summary.victories}V / ${summary.defeats}D), net ${summary.trophyDelta > 0 ? '+' : ''}${summary.trophyDelta} trophées
- Taux de Joueur Étoile (MVP) : ${summary.starPlayerRate}%
- Brawlers clés : ${profile.brawlers.slice(0, 5).map((b) => `${getBrawlerFrenchName(b.name, b.id)} (${b.trophies} tr, niv ${b.power})`).join(', ')}
- Alertes détectées : ${lossReport.tiltAlertActive ? 'Tilt actif (' + lossReport.consecutiveLosses + ' défaites consécutives)' : 'Pas de tilt critique'}
- Événements en cours : ${events.slice(0, 3).map((e) => `${e.event.mode} sur ${e.event.map}`).join(', ')}
- Conseils calculés : ${tips.slice(0, 3).map((t) => `${t.title} -> ${t.action}`).join(' | ')}

RÈGLES STRICTES :
1. UTILISE STRICTEMENT LES NOMS OFFICIELS FRANÇAIS DES BRAWLERS (El Costo et non El Primo, Corbac et non Crow, Bar-Tabac et non Barley, Polly et non Piper, Djinn et non Gene, Wally et non Sprout, Émeri et non Sandy, Ambre et non Amber, Gaël et non Gale, Colonel Médor et non Ruffs).
2. N'affirme QUE ce qui figure dans les données fournies. Ne prétends pas connaître les winrates globaux du jeu.
3. Structure ta réponse avec un titre percutant, des points d'action concrets (Quoi faire / Pourquoi) et un ton d'encouragement dynamique.
4. Si la question est vague, donne le meilleur plan d'action immédiat.

Question du joueur : "${question}"`;

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
            signal: controller.signal,
          }
        );

        clearTimeout(timeoutId);

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const reply = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (reply) {
            return NextResponse.json({ reply });
          }
        }
      } catch (geminiError) {
        console.warn('Gemini timeout or error, fallback to local Coach Bitz:', geminiError);
      }
    }

    // Local Specialized Rule-Based Coach Bitz
    const qLower = (question || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
    let advice = '';

    // Easter eggs secrets de Bitz
    if (qLower.includes('starr park') || qLower.includes('starrpark') || qLower.includes('1995')) {
      advice = `⚠️ **[TRANSMISSION BROUILLÉE - STARR PARK ARCHIVES]** 🎪
- *"Bienvenue au Starr Park ! Le lieu où rien ne peut mal se passer !"* 🎡
- *Note de Bitz :* Mes processeurs refusent d'en dire davantage sur les incidents de 1995... Restez souriant devant les caméras de surveillance ! 🤡`;
    } else if (
      qLower.includes('el primo') ||
      qLower.includes('el costo') ||
      qLower.includes('10 gemmes') ||
      (qLower.includes('gemme') && qLower.includes('saut'))
    ) {
      advice = `🥊 **RÈGLE N°1 DE BITZ : NE SAUTE PAS AVEC LES 10 GEMMES !** 💀
- Tu as 10 gemmes sur toi ? Recule vers ton camp ! El Costo n'a pas besoin de faire offrande de toutes vos gemmes au camp adverse avec son Super !
- Mes capteurs cardiaques surchauffent à chaque fois qu'un joueur tente ça... 🛑`;
    } else if (qLower.includes('trickshot') || qLower.includes('poteau') || (qLower.includes('mortis') && qLower.includes('balle'))) {
      advice = `⚽ **Arrête le Trickshot en Brawl Ball !** 🦇
- Le poteau n'est PAS ton coéquipier !
- Fais simplement la passe au partenaire démarqué devant les cages vides. Bitz te garantit +8 trophées sans faire rager tes coéquipiers ! 😂`;
    } else if (qLower.includes('konami') || qLower.includes('haut haut') || qLower.includes('cheat')) {
      advice = `🎮 **CODE SECRET KONAMI DÉTECTÉ !** 🚀
- Félicitations, tu as découvert le protocole secret de Bitz !
- Astuce : Tape 5 fois rapidement sur l'éclair du logo en haut pour déclencher l'Hypercharge de l'application ! ✨`;
    } else if (qLower.includes('code createur') || qLower.includes('createur')) {
      advice = `💎 **Code Créateur :**
- Tape le code de ton créateur favori dans la boutique Brawl Stars, ou pense à taper **BITZ** pour m'offrir une batterie lithium-ion neuve ! 🔋⚡`;
    } else if (qLower.includes('edgar') && (qLower.includes('shelly') || qLower.includes('saut'))) {
      advice = `💥 **Conseil de Survie N°1 :**
- Ne saute JAMAIS avec Edgar sur une Shelly qui a son Super jaune chargé ! C'est le retour au spawn le plus rapide de l'histoire du jeu. 💀`;
    } else if (qLower.includes('spike') || qLower.includes('1200') || qLower.includes('record')) {
      const spike = profile.brawlers.find((b) => b.name.toUpperCase() === 'SPIKE');
      const spikeTrophies = spike?.trophies || 1205;
      advice = `🌵 **Stratégie Spéciale Spike (${spikeTrophies} 🏆)** :
- **Pourquoi :** À plus de 1 000 trophées, chaque défaite coûte très cher (-10 à -12 tr) et le matchmaking affronte des équipes organisées.
- **Build recommandé :**
  • Pouvoir Star : *Curveball* (Balles à effet pour le contrôle de zone)
  • Gadget : *Life Plant* (Plante bouclier pour absorber les tirs directs de Piper ou les sauts d'Edgar)
  • Équipements : *Dégâts* (+15% de dégâts sous 50% de santé) & *Vitesse* dans les buissons.
- **Règle d'or de Bitz :** Ne lance JAMAIS Spike avec des randoms à ce rang. Joue en trio coordonné en Braquage ou Brawl Ball.`;
    } else if (qLower.includes('tilt') || qLower.includes('perdu') || qLower.includes('defaite') || qLower.includes('perdre')) {
      if (lossReport.tiltAlertActive) {
        advice = `🛑 **Plan Anti-Tilt d'Urgence pour ${profile.name}** :
- **Diagnostic :** Tu viens de subir ${lossReport.consecutiveLosses} défaites d'affilée. Le jeu en frustration altère les réflexes et pousse à sur-agresser.
- **Action 1 :** Pause stricte de 15 minutes. Pose le téléphone ou hydrate-toi.
- **Action 2 :** À la reprise, interdiction de relancer ton Brawler principal. Prends un Brawler sous les 200 trophées pour regagner 3 victoires faciles et remettre ta confiance au vert.`;
      } else {
        advice = `🛡️ **Gestion du Tilt & Préservation des Trophées** :
- **Diagnostic actuel :** Ton bilan récent est sain (${summary.winRate}% de winrate).
- **Règle des 2 défaites :** Dès qu'un Brawler perd 2 parties consécutives, range-le pour la journée. C'est la méthode n°1 des joueurs Masters pour ne jamais perdre 100 trophées d'un coup.`;
      }
    } else if (qLower.includes('amelior') || qLower.includes('upgrad') || qLower.includes('pouvoir') || qLower.includes('priorit')) {
      const top3 = upgrades.slice(0, 3);
      if (top3.length > 0) {
        advice = `⚡ **Priorités d'Amélioration Recommandées pour ${profile.name}** :
${top3.map((u, i) => `${i + 1}. **${u.brawlerName}** (${u.trophies} 🏆) : Passe de Pouvoir ${u.currentPower} à **Pouvoir ${u.targetPower}** pour débloquer son **${u.missingAccessory}**.\n   *Impact :* ${u.impactDescription}`).join('\n')}

💡 **Règle de rentabilité :** Ne dépense jamais d'or pour monter un Brawler au niveau 8 ou 10 sans aller directement au 9 (Pouvoir Star) ou 11 (Hypercharge), car ces niveaux intermédiaires ne débloquent aucun équipement décisif.`;
      } else {
        advice = `✨ **Roster Bien Équilibré !** Tes Brawlers les plus joués possèdent déjà leurs équipements clés (Pouvoir Star et Gadgets). Concentre ton or sur l'obtention d'Hypercharges sur tes Brawlers niveau 11.`;
      }
    } else if (qLower.includes('rush') || qLower.includes('monter') || qLower.includes('troph') || qLower.includes('1000')) {
      const easyBrawlers = profile.brawlers.filter((b) => b.trophies < 300);
      advice = `🚀 **Plan de Rush Express (+1 000 Trophées) pour ${profile.name}** :
- **Pourquoi :** Tu possèdes **${easyBrawlers.length} Brawlers sous les 300 trophées**. À ce niveau, le matchmaking est plus accessible et chaque victoire rapporte 8 à 10 trophées.
- **Feuille de route de la session :**
  1. Choisis 3 Brawlers parmi : ${easyBrawlers.slice(0, 3).map((b) => `**${getBrawlerFrenchName(b.name, b.id)}** (${b.trophies} tr)`).join(', ')}.
  2. Joue-les en **Survivant Duo** ou **Brawl Ball** jusqu'au palier 300 chacun.
  3. Gain immédiat estimé : **+${Math.min(1000, easyBrawlers.length * 150)} trophées** avec un risque de perte quasi nul !`;
    } else if (qLower.includes('map') || qLower.includes('rotation') || qLower.includes('mode')) {
      const topEvent = events[0];
      advice = `🗺️ **Analyse de la rotation active** :
- **Événement phare :** **${topEvent?.event?.mode || 'Showdown'}** sur la map **"${topEvent?.event?.map || 'Actuelle'}"**.
- **Picks recommandés dans ton roster :** Sélectionne tes Brawlers niveau 10 ou 11 avec Gadget et Pouvoir Star.
- **Positionnement :** Sécurise le contrôle central dès le début du match et ne te fais pas coincer contre les parois extérieures.`;
    } else {
      advice = `💡 **Diagnostic Global de Coach Bitz pour ${profile.name}** :
- **Forme du moment :** ${summary.winRate}% de victoires sur tes 25 derniers matchs (Bilan net : ${summary.trophyDelta > 0 ? '+' : ''}${summary.trophyDelta} 🏆).
- ${
  summary.starPlayerRate > 0
    ? `**Point fort :** Tu es élu Joueur Étoile (MVP) dans ${summary.starPlayerRate}% de tes parties, démontrant un fort impact individuel.`
    : `**Axe de progression :** Vise le titre de Joueur Étoile (MVP) en maximisant ton ratio dégâts/éliminations.`
}
- **Prochain jalon :** Il te reste ${milestone.trophiesRemaining} trophées pour franchir **${milestone.rankTitle}**. Priorise tes Brawlers de bas rang pour l'atteindre rapidement !`;
    }

    return NextResponse.json({ reply: advice });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur du coach';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
