import { BUILDINGS, KINGDOMS, RESOURCE_LABELS, RESOURCE_SHORT_LABELS } from '../data/gameData';
import type { GameState, KingdomId, KingdomState, ResourceKey, Resources } from '../types';

export const RESOURCE_KEYS: ResourceKey[] = ['food', 'wood', 'stone', 'ore', 'gold'];

export function zeroResources(): Resources {
  return { food: 0, wood: 0, stone: 0, ore: 0, gold: 0 };
}

export function cloneResources(resources: Resources): Resources {
  return { ...resources };
}

export function addResources(base: Resources, addition: Partial<Resources>): Resources {
  const next = cloneResources(base);
  RESOURCE_KEYS.forEach((key) => {
    next[key] += addition[key] ?? 0;
  });
  return next;
}

export function subtractResources(base: Resources, cost: Partial<Resources>): Resources {
  const next = cloneResources(base);
  RESOURCE_KEYS.forEach((key) => {
    next[key] -= cost[key] ?? 0;
  });
  return next;
}

export function canAfford(resources: Resources, cost: Partial<Resources>): boolean {
  return RESOURCE_KEYS.every((key) => resources[key] >= (cost[key] ?? 0));
}

export function isEmptyBundle(bundle: Partial<Resources>): boolean {
  return RESOURCE_KEYS.every((key) => !bundle[key]);
}

export function resourceValue(resources: Resources): number {
  return resources.gold + (resources.food + resources.wood + resources.stone + resources.ore) * 2;
}

export function formatResourceBundle(bundle: Partial<Resources>): string {
  const parts = RESOURCE_KEYS.filter((key) => bundle[key])
    .map((key) => `${bundle[key]} ${RESOURCE_SHORT_LABELS[key]}`);
  return parts.length > 0 ? parts.join(' · ') : 'Kaynak yok';
}

export function formatFullResourceBundle(bundle: Partial<Resources>): string {
  const parts = RESOURCE_KEYS.filter((key) => bundle[key])
    .map((key) => `${bundle[key]} ${RESOURCE_LABELS[key]}`);
  return parts.length > 0 ? parts.join(', ') : 'Kaynak yok';
}

export function clampResourceInputs(bundle: Partial<Resources>): Partial<Resources> {
  const next: Partial<Resources> = {};
  RESOURCE_KEYS.forEach((key) => {
    const value = Math.max(0, Math.floor(bundle[key] ?? 0));
    if (value > 0) next[key] = value;
  });
  return next;
}

export function getKingdomDefinition(id: KingdomId) {
  return KINGDOMS.find((kingdom) => kingdom.id === id)!;
}

export function buildingCount(kingdom: KingdomState, buildingId: string): number {
  return kingdom.buildings.filter((id) => id === buildingId).length;
}

export function productionForKingdom(kingdom: KingdomState, round: number): Resources {
  const definition = getKingdomDefinition(kingdom.id);
  let production = addResources(definition.production, kingdom.bonusProduction);
  if (kingdom.privilegeCardId === 'fertileValley') production.food += 1;
  if (kingdom.privilegeCardId === 'royalMint') production.gold += 2;

  if (round === 2 && kingdom.id === 'north' && kingdom.privilegeCardId !== 'fertileValley') {
    production = { ...production, food: Math.max(0, production.food - 1) };
  }

  production.food += buildingCount(kingdom, 'farm') * 2;
  production.gold += buildingCount(kingdom, 'market') * 2;

  return production;
}

export function allianceCount(state: GameState, kingdomId: KingdomId): number {
  return state.agreements.filter(
    (agreement) =>
      agreement.type === 'alliance' &&
      agreement.status !== 'broken' &&
      agreement.parties.includes(kingdomId),
  ).length;
}

export function crownWinners(state: GameState): KingdomId[] {
  const counts = new Map<KingdomId, number>();
  Object.values(state.crownVotes).forEach((target) => {
    if (!target) return;
    counts.set(target, (counts.get(target) ?? 0) + 1);
  });

  if (counts.size === 0) return [];
  const max = Math.max(...counts.values());
  return [...counts.entries()].filter(([, count]) => count === max).map(([id]) => id);
}

export function completedSecretObjective(state: GameState, kingdomId: KingdomId): boolean {
  const kingdom = state.kingdoms[kingdomId];
  switch (kingdom.secretObjectiveId) {
    case 'founder':
      return (
        kingdom.buildings.includes('monument') ||
        state.agreements.some(
          (agreement) =>
            agreement.type === 'sharedMonument' &&
            agreement.status === 'completed' &&
            agreement.parties.includes(kingdomId),
        )
      );
    case 'diplomat':
      return allianceCount(state, kingdomId) >= 3;
    case 'conqueror':
      return kingdom.warsWon >= 2;
    case 'explorer':
      return kingdom.chestsOpened >= 3;
    case 'lender':
      return (
        state.agreements.filter(
          (agreement) =>
            agreement.type === 'debt' &&
            agreement.status === 'completed' &&
            agreement.parties.includes(kingdomId),
        ).length >= 2
      );
    case 'steward': {
      if (kingdom.foodShortageCards > 0) return false;
      const maxFood = Math.max(...Object.values(state.kingdoms).map((item) => item.resources.food));
      return kingdom.resources.food === maxFood;
    }
    default:
      return false;
  }
}

export interface ScoreLine {
  label: string;
  points: number;
}

export interface KingdomScore {
  total: number;
  lines: ScoreLine[];
}

export function calculateKingdomScore(state: GameState, kingdomId: KingdomId): KingdomScore {
  const kingdom = state.kingdoms[kingdomId];
  const lines: ScoreLine[] = [];

  const buildingPoints = kingdom.buildings.reduce((sum, buildingId) => {
    return sum + (BUILDINGS.find((building) => building.id === buildingId)?.prestige ?? 0);
  }, 0);
  if (buildingPoints) lines.push({ label: 'Yapılar', points: buildingPoints });

  const sharedMonumentPoints =
    state.agreements.filter(
      (agreement) =>
        agreement.type === 'sharedMonument' &&
        agreement.status === 'completed' &&
        agreement.parties.includes(kingdomId),
    ).length * 6;
  if (sharedMonumentPoints) lines.push({ label: 'Ortak Anıt', points: sharedMonumentPoints });

  const alliances = Math.min(3, allianceCount(state, kingdomId));
  if (alliances) lines.push({ label: 'Tescilli ittifaklar', points: alliances });

  if (kingdom.tournamentWins) {
    lines.push({ label: 'Turnuva galibiyetleri', points: kingdom.tournamentWins * 3 });
  }

  const lowTaxRounds = Object.values(kingdom.taxHistory).filter((tax) => tax === 'low').length;
  if (lowTaxRounds) lines.push({ label: 'Düşük vergi turları', points: lowTaxRounds });

  if (crownWinners(state).includes(kingdomId)) {
    lines.push({ label: 'Taç oylaması', points: 5 });
  }

  const scoringStarted = state.elapsedSeconds >= 107 * 60;
  if (scoringStarted && completedSecretObjective(state, kingdomId)) {
    lines.push({ label: 'Gizli hedef', points: 5 });
  }

  const leftoverPoints = scoringStarted ? Math.floor(resourceValue(kingdom.resources) / 6) : 0;
  if (leftoverPoints) lines.push({ label: 'Kalan kaynaklar', points: leftoverPoints });

  if (kingdom.manualPrestige) {
    lines.push({ label: 'Manuel / görev puanı', points: kingdom.manualPrestige });
  }

  if (kingdom.penaltyPoints) {
    lines.push({ label: 'Cezalar', points: -kingdom.penaltyPoints });
  }

  const total = lines.reduce((sum, line) => sum + line.points, 0);
  return { total, lines };
}

export function sortedKingdomIds(state: GameState): KingdomId[] {
  return (Object.keys(state.kingdoms) as KingdomId[]).sort(
    (a, b) => calculateKingdomScore(state, b).total - calculateKingdomScore(state, a).total,
  );
}

export function formatClock(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function formatGameClock(elapsedSeconds: number): string {
  return formatClock(Math.min(elapsedSeconds, 120 * 60));
}
