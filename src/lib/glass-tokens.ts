/**
 * Tokens de design "Liquid Glass" (Apple-like) & Grille d'espacement unifiée
 *
 * Règle d'or : Le verre est translucide et lumineux, flottant au-dessus du contenu cartoon.
 * Le contenu cartoon reste opaque, saturé et percutant avec ses contours sombres.
 */

export interface GlassConfig {
  background: string;
  backdropBlur: string;
  backdropSaturate: string;
  border: string;
  boxShadow: string;
  fallbackBackground: string;
}

export const GLASS_TOKENS = {
  // Niveau 1 (Subtle) : Pour barres de nav, floating dock, toasts, tooltips
  subtle: {
    background: 'rgba(28, 25, 76, 0.58)',
    backdropBlur: '18px',
    backdropSaturate: '160%',
    border: '1px solid rgba(255, 255, 255, 0.16)',
    boxShadow:
      '0 8px 32px 0 rgba(7, 11, 22, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.25)',
    fallbackBackground: '#171445',
  },

  // Niveau 2 (Pronounced) : Pour UNE modale/sheet à la fois
  pronounced: {
    background: 'rgba(32, 28, 88, 0.70)',
    backdropBlur: '22px',
    backdropSaturate: '180%',
    border: '1px solid rgba(255, 255, 255, 0.22)',
    boxShadow:
      '0 16px 48px 0 rgba(7, 11, 22, 0.50), inset 0 1.5px 0 rgba(255, 255, 255, 0.35)',
    fallbackBackground: '#1c1852',
  },
} as const;

/**
 * Grille d'espacement unifiée (base 4/8 px)
 * Remplace toutes les valeurs magiques dispersées.
 */
export const SPACING_GRID = {
  // Marges et paddings conteneurs
  pagePadding: 'px-4 sm:px-6 lg:px-8',
  pageMaxWidth: 'max-w-6xl', // 1152px pour une respiration optimale à 1440px
  
  // Padding vertical d'évitement des barres flottantes
  pagePaddingTop: 'pt-24 sm:pt-28', // Dégage la navbar flottante
  pagePaddingBottom: 'pb-28 sm:pb-32', // Dégage le dock mobile flottant

  // Cartes
  cardPadding: 'p-4 sm:p-6',
  cardPaddingCompact: 'p-3.5 sm:p-4',

  // Gaps
  gapContent: 'gap-4 sm:gap-6',
  gapElements: 'gap-3 sm:gap-4',
  gapTight: 'gap-2 sm:gap-3',

  // Rythme vertical de sections
  sectionSpace: 'space-y-6 sm:space-y-8',
} as const;

/**
 * Échelle typographique minimale
 * Aucun texte sous 12px (tags) et 14px (texte courant)
 */
export const TYPOGRAPHY = {
  body: 'text-sm sm:text-base leading-relaxed',
  bodyCompact: 'text-sm leading-normal',
  label: 'text-xs sm:text-sm font-cartoon uppercase tracking-wider',
  badge: 'text-xs font-cartoon uppercase tracking-wide',
  tabularNumbers: 'tabular-nums',
} as const;
