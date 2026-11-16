import { TabType } from '@/components/BottomNav';

/**
 * Tokens d'animation centralisés pour BS Helper
 * Physique de type arcade/cartoon : rebonds courts, percutants, sans mollesse.
 */

// 1. Ressorts (Springs)
export const springSnappy = {
  type: 'spring' as const,
  stiffness: 480,
  damping: 32,
  mass: 0.8,
};

export const springBouncy = {
  type: 'spring' as const,
  stiffness: 420,
  damping: 22,
  mass: 0.9,
};

export const springGentle = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 28,
};

// 2. Transitions temporelles fixes (Strictement <= 200ms)
export const transitionFast = {
  duration: 0.15,
  ease: [0.16, 1, 0.3, 1] as const,
};

export const transitionTab = {
  duration: 0.18,
  ease: [0.16, 1, 0.3, 1] as const,
};

export const reducedTransition = {
  duration: 0.12,
  ease: 'linear' as const,
};

// 3. Ordre des onglets pour calculer la direction de slide (+1 droite, -1 gauche)
export const TAB_INDEX_MAP: Record<TabType, number> = {
  overview: 0,
  trophies: 1,
  maps: 2,
  battles: 3,
  coach: 4,
};

export function getTabDirection(prevTab: TabType, newTab: TabType): number {
  const prevIdx = TAB_INDEX_MAP[prevTab] ?? 0;
  const newIdx = TAB_INDEX_MAP[newTab] ?? 0;
  if (prevIdx === newIdx) return 0;
  return newIdx > prevIdx ? 1 : -1;
}
