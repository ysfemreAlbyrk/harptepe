export type ResourceKey = 'food' | 'wood' | 'stone' | 'ore' | 'gold';

export type KingdomId = 'north' | 'west' | 'center' | 'east' | 'south' | 'gold';

export type TaxLevel = 'low' | 'normal' | 'high';

export type AgreementType = 'nonAggression' | 'alliance' | 'debt' | 'trade' | 'sharedMonument';

export type AgreementStatus = 'active' | 'completed' | 'broken';

export type ChestLevel = 'small' | 'medium' | 'large';

export type GamePhaseId =
  | 'arrival'
  | 'quiz'
  | 'draft'
  | 'roles'
  | 'round1'
  | 'break1'
  | 'round2'
  | 'break2'
  | 'round3'
  | 'scoring'
  | 'final'
  | 'finished';

export interface Resources {
  food: number;
  wood: number;
  stone: number;
  ore: number;
  gold: number;
}

export interface KingdomDefinition {
  id: KingdomId;
  name: string;
  epithet: string;
  color: string;
  softColor: string;
  strength: string;
  weakness: string;
  special: string;
  startingResources: Resources;
  production: Resources;
}

export interface KingdomState {
  id: KingdomId;
  resources: Resources;
  military: number;
  buildings: string[];
  taxHistory: Record<number, TaxLevel>;
  productionBlockedRounds: number[];
  chestsOpened: number;
  tournamentWins: number;
  warsWon: number;
  manualPrestige: number;
  penaltyPoints: number;
  foodShortageCards: number;
  bonusProduction: Resources;
  privilegeCardId: string | null;
  startingPackageId: string | null;
  architectDiscountRounds: number[];
  secretObjectiveId: string;
}

export interface Agreement {
  id: number;
  type: AgreementType;
  parties: KingdomId[];
  terms: string;
  round: number;
  status: AgreementStatus;
  penaltyApplied: boolean;
  createdAt: number;
}

export interface Chest {
  id: number;
  level: ChestLevel;
  title: string;
  unlockRound: number;
  status: 'locked' | 'available' | 'claimed';
  claimedBy?: KingdomId;
  reward: Partial<Resources> & { prestige?: number; productionFood?: number };
}

export interface WarRecord {
  id: number;
  round: number;
  attacker: KingdomId;
  defender: KingdomId;
  attackerScore: number;
  defenderScore: number;
  winner: KingdomId;
  note: string;
}

export interface LogEntry {
  id: number;
  at: number;
  type: 'info' | 'success' | 'warning' | 'danger';
  message: string;
}

export interface GameState {
  elapsedSeconds: number;
  timerRunning: boolean;
  timerOwnerId: string | null;
  kingdoms: Record<KingdomId, KingdomState>;
  agreements: Agreement[];
  chests: Chest[];
  wars: WarRecord[];
  crownVotes: Partial<Record<KingdomId, KingdomId>>;
  productionAppliedRounds: number[];
  upkeepChargedRounds: number[];
  tournamentRecordedRounds: number[];
  log: LogEntry[];
  nextIds: {
    agreement: number;
    war: number;
    log: number;
  };
}

export interface BuildingDefinition {
  id: string;
  name: string;
  cost: Partial<Resources>;
  effect: string;
  prestige: number;
  uniquePerKingdom?: boolean;
}

export interface SecretObjectiveDefinition {
  id: string;
  name: string;
  description: string;
}

export interface PrivilegeCardDefinition {
  id: string;
  name: string;
  effect: string;
}

export interface StartingPackageDefinition {
  id: string;
  name: string;
  resources: Partial<Resources>;
  military: number;
  value: number;
}

export interface GamePhase {
  id: GamePhaseId;
  label: string;
  startMinute: number;
  endMinute: number;
  round?: number;
  description: string;
}

export type PlayerRoleId = 'monarch' | 'vizier' | 'merchant' | 'envoy' | 'spy' | 'commander' | 'explorer';

export interface PlayerRoleDefinition {
  id: PlayerRoleId;
  name: string;
  count: number;
  mission: string;
  responsibilities: string[];
  tips: string[];
}
