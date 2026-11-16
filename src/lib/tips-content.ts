/**
 * Base éditoriale tactique Brawl Stars
 * Conseils vérifiés par mode et par classe d'archétype
 */

export interface ModeTacticalRule {
  modeName: string;
  rules: string[];
  classSpecific: Record<string, string>;
}

export const MODE_TACTICAL_RULES: Record<string, ModeTacticalRule> = {
  brawlBall: {
    modeName: 'Brawl Ball',
    rules: [
      'Détruisez les murs devant les cages adverses dès le premier Super pour ouvrir les lignes de tir.',
      'Ne tirez jamais vers le but sans vous assurer que le gardien adverse est éliminé ou hors de portée.',
      'Si vous êtes en surnombre (3v1 ou 3v2), avancez en bloc pour forcer le recul de la ligne ennemie.',
    ],
    classSpecific: {
      Tank: 'Servez de paratonnerre pour créer de l\'espace et portez la balle lors des phases de pression.',
      Assassin: 'Éliminez le porteur de balle adverse en interception et profitez des rebonds de murs.',
      Controller: 'Posez des zones de ralentissement ou de poison sur la trajectoire des cages.',
      Marksman: 'Tenez une ligne de tir directe depuis votre moitié de terrain pour punir les porteurs.',
    },
  },
  heist: {
    modeName: 'Braquage',
    rules: [
      'Ne jouez jamais la défense passive : dans 75% des matchs de haut niveau, l\'équipe qui inflige les premiers 30% au coffre l\'emporte.',
      'En cas d\'élimination d\'un ennemi dans votre zone, contre-attaquez immédiatement sans temporiser.',
      'Gardez votre Super pour le coffre adverse plutôt que pour un duel secondaire, sauf urgence vitale.',
    ],
    classSpecific: {
      'Damage Dealer': 'Fondez sur le coffre dès qu\'une brèche s\'ouvre pour décharger tout votre chargeur.',
      Tank: 'Encaissez les tirs de couverture pour escorter votre carry jusqu\'au coffre adverse.',
      Artillery: 'Pilonnez le coffre par-dessus les murs sans vous exposer à la ligne de vue des défenseurs.',
    },
  },
  knockout: {
    modeName: 'Hors-Jeu (Knockout)',
    rules: [
      'La première élimination décide quasiment de la manche : ne risquez aucun face-à-face à découvert.',
      'Utilisez les obstacles pour recharger entièrement votre santé avant de repiquer une tête.',
      'Quand le gaz rétrécit l\'arène, regroupez-vous pour combiner vos tirs sur la même cible.',
    ],
    classSpecific: {
      Marksman: 'Prenez l\'ascendant psychologique dès les 5 premières secondes en contrôlant les couloirs larges.',
      Support: 'Maintenez vos coéquipiers en vie à distance ; votre survie garantit le surnombre.',
      Assassin: 'Restez en embuscade jusqu\'à ce qu\'un ennemi passe sous les 40% de santé pour l\'achever.',
    },
  },
  gemGrab: {
    modeName: 'Razzia de Gemmes',
    rules: [
      'Désignez UN SEUL porteur de gemmes (souvent le joueur du centre à longue portée ou mobilité).',
      'Les deux autres joueurs doivent tenir les couloirs gauche et droite sans ramasser les gemmes inutilement.',
      'Dès que vous atteignez le compte à rebours de 10 gemmes, repliez-vous ensemble dans votre zone de départ.',
    ],
    classSpecific: {
      Controller: 'Verrouillez le puits à gemmes pour interdire la collecte aux adversaires.',
      Tank: 'Prenez position dans les buissons avancés pour intercepter quiconque tente d\'approcher votre porteur.',
      Support: 'Soignez ou boostez continuellement le porteur principal pendant le compte à rebours.',
    },
  },
  soloShowdown: {
    modeName: 'Survivant Solo',
    rules: [
      'Sécurisez rapidement 1 ou 2 boîtes, puis temporisez : la place dans le top 4 est plus rentable que les éliminations risquées.',
      'Ne vous engagez jamais entre deux adversaires pour éviter d\'être pris en tenaille (sandwich).',
      'Surveillez en permanence les herbes hautes à proximité de votre trajectoire de repli.',
    ],
    classSpecific: {
      Assassin: 'Traquez les brawlers isolés à faible portée ou les snipers surpris au corps à corps.',
      Tank: 'Monopolisez le centre seulement si vous possédez au moins 3 cubes de puissance de plus que les rivaux.',
    },
  },
  duoShowdown: {
    modeName: 'Survivant Duo',
    rules: [
      'Si votre allié est éliminé, fuyez et cachez-vous jusqu\'au compte à rebours de réapparition.',
      'Partagez les cubes de boost : restez à portée pour que les deux membres de l\'équipe profitent des bonus.',
      'Priorisez toujours la survie à deux plutôt que le finish héroïque d\'un ennemi au loin.',
    ],
    classSpecific: {
      Support: 'Permettez à votre allié plus offensif d\'agresser tout en couvrant ses arrières.',
      Marksman: 'Tirez à longue portée pour repousser les équipes adverses sans vous approcher des buissons.',
    },
  },
};

export const DID_YOU_KNOW_TRIVIA = [
  {
    title: 'La règle des 3 munitions',
    tip: 'Ne tirez jamais votre dernière munition si vous n\'avez pas la certitude d\'éliminer la cible : vous resteriez vulnérable pendant tout le cycle de recharge.',
  },
  {
    title: 'Le reset de santé',
    tip: 'La régénération passive commence exactement 3 secondes après avoir cessé de tirer ou de subir des dégâts. Chaque tir retarde ce soin vital.',
  },
  {
    title: 'Prise de buisson sécurisée',
    tip: 'Vérifiez toujours les buissons (bush-check) avec un tir régulier avant d\'y entrer, surtout en fin de partie.',
  },
  {
    title: 'Tempo du Super',
    tip: 'Toucher plusieurs ennemis avec un Super recharge une partie significative du Super suivant. Cherchez toujours les alignements de cibles.',
  },
  {
    title: 'Gestion de l\'invulnérabilité',
    tip: 'Après réapparition, vous disposez de 3 secondes d\'invulnérabilité. Utilisez ce temps pour avancer ou repousser l\'adversaire, pas pour tirer dans le vide.',
  },
];
