import { useCallback, useEffect, useReducer, useRef, useState, type Dispatch } from 'react';
import {
  BUILDINGS,
  KINGDOMS,
  PRIVILEGE_CARDS,
  RESOURCE_LABELS,
  SECRET_OBJECTIVES,
  STARTING_PACKAGES,
  TAX_RULES,
} from '../data/gameData';
import type {
  AgreementStatus,
  AgreementType,
  Chest,
  GameState,
  KingdomId,
  KingdomState,
  LogEntry,
  ResourceKey,
  Resources,
  TaxLevel,
} from '../types';
import {
  addResources,
  canAfford,
  clampResourceInputs,
  formatResourceBundle,
  getKingdomDefinition,
  productionForKingdom,
  subtractResources,
  zeroResources,
} from '../utils/gameMath';

const STORAGE_KEY = 'harptepe-krallik-simulasyonu-v1';
const GAME_END_SECONDS = 120 * 60;

export type GameAction =
  | { type: 'tick' }
  | { type: 'toggleTimer'; ownerId?: string }
  | { type: 'skipToMinute'; minute: number }
  | { type: 'resetGame' }
  | { type: 'adjustResource'; kingdomId: KingdomId; resource: ResourceKey; amount: number; reason: string }
  | { type: 'transferResources'; from: KingdomId; to: KingdomId; bundle: Partial<Resources>; reason: string }
  | { type: 'applyProduction'; round: number }
  | { type: 'chargeUpkeep'; round: number }
  | { type: 'setPrivilegeCard'; kingdomId: KingdomId; privilegeCardId: string | null }
  | { type: 'setStartingPackage'; kingdomId: KingdomId; packageId: string | null }
  | { type: 'setSecretObjective'; kingdomId: KingdomId; objectiveId: string }
  | { type: 'setTax'; kingdomId: KingdomId; round: number; tax: TaxLevel }
  | { type: 'buyBuilding'; kingdomId: KingdomId; buildingId: string; round: number; discountResource?: ResourceKey }
  | { type: 'createAgreement'; agreementType: AgreementType; parties: KingdomId[]; terms: string; round: number }
  | { type: 'setAgreementStatus'; agreementId: number; status: AgreementStatus; brokenBy?: KingdomId }
  | { type: 'unlockChests'; round: number }
  | { type: 'claimChest'; chestId: number; kingdomId: KingdomId }
  | { type: 'recordTournament'; round: number; winner: KingdomId; second?: KingdomId }
  | {
      type: 'resolveWar';
      round: number;
      attacker: KingdomId;
      defender: KingdomId;
      attackerDice: number;
      defenderDice: number;
      duelWinner: 'attacker' | 'defender' | 'none';
      spoils: Partial<Resources>;
    }
  | { type: 'setCrownVote'; voter: KingdomId; target: KingdomId }
  | { type: 'clearCrownVote'; voter: KingdomId }
  | { type: 'adjustMilitary'; kingdomId: KingdomId; amount: number; reason: string }
  | { type: 'adjustPrestige'; kingdomId: KingdomId; amount: number; reason: string }
  | { type: 'clearLog' }
  | { type: 'syncState'; state: GameState };

function chestList(): Chest[] {
  return [
    {
      id: 1,
      level: 'small',
      title: 'Sandık 1 · Küçük bilmece',
      unlockRound: 1,
      status: 'locked',
      reward: { wood: 2, food: 1 },
    },
    {
      id: 2,
      level: 'small',
      title: 'Sandık 2 · Hızlı soru',
      unlockRound: 1,
      status: 'locked',
      reward: { gold: 5 },
    },
    {
      id: 3,
      level: 'medium',
      title: 'Sandık 3 · Şifre çözme',
      unlockRound: 1,
      status: 'locked',
      reward: { stone: 2, ore: 1, prestige: 2 },
    },
    {
      id: 4,
      level: 'small',
      title: 'Sandık 4 · Mantık sorusu',
      unlockRound: 2,
      status: 'locked',
      reward: { food: 2, wood: 1 },
    },
    {
      id: 5,
      level: 'medium',
      title: 'Sandık 5 · İki aşamalı görev',
      unlockRound: 2,
      status: 'locked',
      reward: { wood: 2, stone: 1, prestige: 2 },
    },
    {
      id: 6,
      level: 'large',
      title: 'Sandık 6 · Verimli toprak',
      unlockRound: 2,
      status: 'locked',
      reward: { prestige: 2, productionFood: 2 },
    },
    {
      id: 7,
      level: 'small',
      title: 'Sandık 7 · Kaynak izi',
      unlockRound: 3,
      status: 'locked',
      reward: { ore: 2, gold: 1 },
    },
    {
      id: 8,
      level: 'medium',
      title: 'Sandık 8 · Krallık bulmacası',
      unlockRound: 3,
      status: 'locked',
      reward: { food: 1, ore: 1, stone: 1, prestige: 2 },
    },
    {
      id: 9,
      level: 'large',
      title: 'Sandık 9 · Kadim harita',
      unlockRound: 3,
      status: 'locked',
      reward: { prestige: 2, productionFood: 2 },
    },
  ];
}

function initialKingdomState(): Record<KingdomId, KingdomState> {
  return KINGDOMS.reduce<Record<KingdomId, KingdomState>>((acc, definition, index) => {
    acc[definition.id] = {
      id: definition.id,
      resources: { ...definition.startingResources },
      military: 2,
      buildings: [],
      taxHistory: {},
      productionBlockedRounds: [],
      chestsOpened: 0,
      tournamentWins: 0,
      warsWon: 0,
      manualPrestige: 0,
      penaltyPoints: 0,
      foodShortageCards: 0,
      bonusProduction: zeroResources(),
      privilegeCardId: null,
      startingPackageId: null,
      architectDiscountRounds: [],
      secretObjectiveId: SECRET_OBJECTIVES[index % SECRET_OBJECTIVES.length].id,
    };
    return acc;
  }, {} as Record<KingdomId, KingdomState>);
}

function makeLog(id: number, at: number, type: LogEntry['type'], message: string): LogEntry {
  return { id, at, type, message };
}

function appendLog(state: GameState, type: LogEntry['type'], message: string): GameState {
  const entry = makeLog(state.nextIds.log, state.elapsedSeconds, type, message);
  return {
    ...state,
    log: [entry, ...state.log].slice(0, 90),
    nextIds: { ...state.nextIds, log: state.nextIds.log + 1 },
  };
}

export function createInitialState(): GameState {
  const state: GameState = {
    elapsedSeconds: 0,
    timerRunning: false,
    timerOwnerId: null,
    kingdoms: initialKingdomState(),
    agreements: [],
    chests: chestList(),
    wars: [],
    crownVotes: {},
    productionAppliedRounds: [],
    upkeepChargedRounds: [],
    tournamentRecordedRounds: [],
    log: [],
    nextIds: { agreement: 1, war: 1, log: 1 },
  };
  return appendLog(state, 'info', 'Oyun taslağı hazır. Zamanlayıcı başlatılmayı bekliyor.');
}

function updateKingdom(
  state: GameState,
  kingdomId: KingdomId,
  updater: (kingdom: KingdomState) => KingdomState,
): GameState {
  return {
    ...state,
    kingdoms: {
      ...state.kingdoms,
      [kingdomId]: updater(state.kingdoms[kingdomId]),
    },
  };
}

function deductLimited(resources: Resources, cost: Partial<Resources>): { next: Resources; unpaid: Partial<Resources> } {
  const next = { ...resources };
  const unpaid: Partial<Resources> = {};
  (Object.keys(next) as ResourceKey[]).forEach((key) => {
    const requested = cost[key] ?? 0;
    const paid = Math.min(next[key], requested);
    next[key] -= paid;
    if (requested > paid) unpaid[key] = requested - paid;
  });
  return { next, unpaid };
}

function kingdomName(kingdomId: KingdomId): string {
  return getKingdomDefinition(kingdomId).name;
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'tick': {
      if (!state.timerRunning) return state;
      const nextSeconds = Math.min(GAME_END_SECONDS, state.elapsedSeconds + 1);
      return {
        ...state,
        elapsedSeconds: nextSeconds,
        timerRunning: nextSeconds < GAME_END_SECONDS,
        timerOwnerId: nextSeconds < GAME_END_SECONDS ? state.timerOwnerId : null,
      };
    }

    case 'toggleTimer': {
      const timerRunning = !state.timerRunning && state.elapsedSeconds < GAME_END_SECONDS;
      return {
        ...state,
        timerRunning,
        timerOwnerId: timerRunning ? (action.ownerId ?? null) : null,
      };
    }

    case 'skipToMinute': {
      const minute = Math.max(0, Math.min(120, action.minute));
      return appendLog(
        { ...state, elapsedSeconds: minute * 60 },
        'info',
        `Zaman ${minute}. dakikaya ayarlandı.`,
      );
    }

    case 'resetGame':
      return createInitialState();

    case 'adjustResource': {
      const amount = Math.trunc(action.amount);
      if (!amount) return state;
      let next = updateKingdom(state, action.kingdomId, (kingdom) => ({
        ...kingdom,
        resources: {
          ...kingdom.resources,
          [action.resource]: Math.max(0, kingdom.resources[action.resource] + amount),
        },
      }));
      const sign = amount > 0 ? '+' : '';
      return appendLog(
        next,
        amount > 0 ? 'success' : 'warning',
        `${kingdomName(action.kingdomId)}: ${sign}${amount} ${RESOURCE_LABELS[action.resource]} (${action.reason || 'manuel düzeltme'}).`,
      );
    }

    case 'transferResources': {
      const bundle = clampResourceInputs(action.bundle);
      const hasAny = Object.values(bundle).some(Boolean);
      if (!hasAny || action.from === action.to) return state;

      const sender = state.kingdoms[action.from];
      const transferable: Partial<Resources> = {};
      (Object.keys(bundle) as ResourceKey[]).forEach((key) => {
        transferable[key] = Math.min(sender.resources[key], bundle[key] ?? 0);
      });

      let next = updateKingdom(state, action.from, (kingdom) => ({
        ...kingdom,
        resources: subtractResources(kingdom.resources, transferable),
      }));
      next = updateKingdom(next, action.to, (kingdom) => ({
        ...kingdom,
        resources: addResources(kingdom.resources, transferable),
      }));

      return appendLog(
        next,
        'success',
        `${kingdomName(action.from)} → ${kingdomName(action.to)}: ${formatResourceBundle(transferable)} transfer edildi (${action.reason || 'ticaret'}).`,
      );
    }

    case 'applyProduction': {
      if (state.productionAppliedRounds.includes(action.round)) {
        return appendLog(state, 'warning', `${action.round}. tur üretimi zaten uygulanmış.`);
      }

      let next: GameState = {
        ...state,
        productionAppliedRounds: [...state.productionAppliedRounds, action.round],
      };

      (Object.keys(next.kingdoms) as KingdomId[]).forEach((kingdomId) => {
        const kingdom = next.kingdoms[kingdomId];
        if (kingdom.productionBlockedRounds.includes(action.round)) return;
        const production = productionForKingdom(kingdom, action.round);
        next = updateKingdom(next, kingdomId, (item) => ({
          ...item,
          resources: addResources(item.resources, production),
        }));
      });

      return appendLog(next, 'success', `${action.round}. tur üretimleri dağıtıldı.`);
    }

    case 'chargeUpkeep': {
      if (state.upkeepChargedRounds.includes(action.round)) {
        return appendLog(state, 'warning', `${action.round}. tur gıda bakımı zaten alınmış.`);
      }

      const baseRequired = action.round === 2 ? 3 : 2;
      let next: GameState = {
        ...state,
        upkeepChargedRounds: [...state.upkeepChargedRounds, action.round],
      };
      const hungry: KingdomId[] = [];

      (Object.keys(next.kingdoms) as KingdomId[]).forEach((kingdomId) => {
        next = updateKingdom(next, kingdomId, (kingdom) => {
          const required = action.round === 2 && kingdom.privilegeCardId === 'fertileValley' ? 2 : baseRequired;
          const paid = Math.min(required, kingdom.resources.food);
          const shortage = required - paid;
          if (shortage > 0) hungry.push(kingdomId);
          return {
            ...kingdom,
            resources: { ...kingdom.resources, food: kingdom.resources.food - paid },
            penaltyPoints: kingdom.penaltyPoints + shortage * 2,
            foodShortageCards: kingdom.foodShortageCards + shortage,
          };
        });
      });

      next = appendLog(next, 'success', `${action.round}. tur için ${baseRequired} Gıda bakımı tahsil edildi.`);
      if (hungry.length > 0) {
        next = appendLog(
          next,
          'danger',
          `Açlık cezası: ${hungry.map(kingdomName).join(', ')}.`,
        );
      }
      return next;
    }

    case 'setPrivilegeCard': {
      const privilege = PRIVILEGE_CARDS.find((item) => item.id === action.privilegeCardId);
      const kingdom = state.kingdoms[action.kingdomId];
      if (!kingdom || (action.privilegeCardId && !privilege) || kingdom.privilegeCardId === action.privilegeCardId) return state;
      const owner = Object.values(state.kingdoms).find(
        (item) => item.id !== action.kingdomId && item.privilegeCardId === action.privilegeCardId,
      );
      if (owner) {
        return appendLog(state, 'warning', `${privilege?.name ?? 'Bu ayrıcalık'} zaten ${kingdomName(owner.id)} krallığında.`);
      }
      const next = updateKingdom(state, action.kingdomId, (item) => ({
        ...item,
        privilegeCardId: action.privilegeCardId,
      }));
      const message = privilege
        ? `${kingdomName(action.kingdomId)} ayrıcalık kartı: ${privilege.name}.`
        : `${kingdomName(action.kingdomId)} ayrıcalık kartı kaldırıldı.`;
      return appendLog(next, 'info', message);
    }

    case 'setStartingPackage': {
      const selectedPackage = STARTING_PACKAGES.find((item) => item.id === action.packageId);
      const kingdom = state.kingdoms[action.kingdomId];
      if (!kingdom || (action.packageId && !selectedPackage) || kingdom.startingPackageId === action.packageId) return state;
      const previousPackage = STARTING_PACKAGES.find((item) => item.id === kingdom.startingPackageId);
      const owner = Object.values(state.kingdoms).find(
        (item) => item.id !== action.kingdomId && item.startingPackageId === action.packageId,
      );
      if (owner) {
        return appendLog(state, 'warning', `${selectedPackage?.name ?? 'Bu paket'} zaten ${kingdomName(owner.id)} krallığında.`);
      }

      const next = updateKingdom(state, action.kingdomId, (item) => {
        let resources = item.resources;
        let military = item.military;
        if (previousPackage) {
          resources = deductLimited(resources, previousPackage.resources).next;
          military = Math.max(0, military - previousPackage.military);
        }
        if (selectedPackage) {
          resources = addResources(resources, selectedPackage.resources);
          military += selectedPackage.military;
        }
        return {
          ...item,
          resources,
          military,
          startingPackageId: action.packageId,
        };
      });

      const message = selectedPackage
        ? `${kingdomName(action.kingdomId)} başlangıç paketi: ${selectedPackage.name} (${formatResourceBundle(selectedPackage.resources)}${selectedPackage.military ? `, +${selectedPackage.military} asker` : ''}).`
        : `${kingdomName(action.kingdomId)} başlangıç paketi kaldırıldı.`;
      return appendLog(next, 'info', message);
    }

    case 'setSecretObjective': {
      const objective = SECRET_OBJECTIVES.find((item) => item.id === action.objectiveId);
      const kingdom = state.kingdoms[action.kingdomId];
      if (!objective || !kingdom || kingdom.secretObjectiveId === action.objectiveId) return state;
      const owner = Object.values(state.kingdoms).find(
        (item) => item.id !== action.kingdomId && item.secretObjectiveId === action.objectiveId,
      );
      let next = state;
      if (owner) {
        next = updateKingdom(next, owner.id, (item) => ({
          ...item,
          secretObjectiveId: kingdom.secretObjectiveId,
        }));
      }
      next = updateKingdom(next, action.kingdomId, (item) => ({
        ...item,
        secretObjectiveId: action.objectiveId,
      }));
      return appendLog(
        next,
        'info',
        `${kingdomName(action.kingdomId)} gizli hedefi güncellendi: ${objective.name}.${owner ? ` ${kingdomName(owner.id)} ile kartlar değiştirildi.` : ''}`,
      );
    }

    case 'setTax': {
      const kingdom = state.kingdoms[action.kingdomId];
      if (kingdom.taxHistory[action.round]) {
        return appendLog(state, 'warning', `${kingdomName(action.kingdomId)} için ${action.round}. tur vergisi zaten seçilmiş.`);
      }

      let revolt = false;
      let next = updateKingdom(state, action.kingdomId, (item) => {
        revolt =
          action.tax === 'high' &&
          action.round > 1 &&
          item.taxHistory[action.round - 1] === 'high';
        return {
          ...item,
          resources: { ...item.resources, gold: item.resources.gold + TAX_RULES[action.tax].gold },
          taxHistory: { ...item.taxHistory, [action.round]: action.tax },
          penaltyPoints: item.penaltyPoints + (revolt ? 4 : 0),
          productionBlockedRounds: revolt
            ? [...new Set([...item.productionBlockedRounds, action.round])]
            : item.productionBlockedRounds,
        };
      });

      next = appendLog(
        next,
        'success',
        `${kingdomName(action.kingdomId)} vergi kararı: ${TAX_RULES[action.tax].label} (+${TAX_RULES[action.tax].gold} Altın).`,
      );
      if (revolt) {
        next = appendLog(next, 'danger', `${kingdomName(action.kingdomId)} krallığında isyan çıktı: -4 PP ve üretim engeli.`);
      }
      return next;
    }

    case 'buyBuilding': {
      const building = BUILDINGS.find((item) => item.id === action.buildingId);
      if (!building) return state;
      const kingdom = state.kingdoms[action.kingdomId];

      if (building.uniquePerKingdom && kingdom.buildings.includes(building.id)) {
        return appendLog(state, 'warning', `${kingdomName(action.kingdomId)} zaten bir Anıta sahip.`);
      }

      const cost: Partial<Resources> = { ...building.cost };
      const discountRounds = kingdom.architectDiscountRounds ?? [];
      let architectDiscountUsed = false;
      if (action.discountResource) {
        if (kingdom.privilegeCardId !== 'architectsGuild') {
          return appendLog(state, 'warning', `${kingdomName(action.kingdomId)} Mimarlar Loncası ayrıcalığına sahip değil.`);
        }
        if (discountRounds.includes(action.round)) {
          return appendLog(state, 'warning', `${kingdomName(action.kingdomId)} bu tur Mimarlar Loncası indirimini zaten kullandı.`);
        }
        if ((cost[action.discountResource] ?? 0) < 1) {
          return appendLog(state, 'warning', `${building.name} maliyetinde ${RESOURCE_LABELS[action.discountResource]} indirimi uygulanamaz.`);
        }
        cost[action.discountResource] = (cost[action.discountResource] ?? 0) - 1;
        architectDiscountUsed = true;
      }

      if (!canAfford(kingdom.resources, cost)) {
        return appendLog(state, 'warning', `${kingdomName(action.kingdomId)} için ${building.name} maliyeti yetersiz.`);
      }

      const next = updateKingdom(state, action.kingdomId, (item) => ({
        ...item,
        resources: subtractResources(item.resources, cost),
        buildings: [...item.buildings, building.id],
        military: item.military + (building.id === 'barracks' ? 1 : 0),
        architectDiscountRounds: architectDiscountUsed
          ? [...new Set([...(item.architectDiscountRounds ?? []), action.round])]
          : (item.architectDiscountRounds ?? []),
      }));

      return appendLog(
        next,
        'success',
        `${kingdomName(action.kingdomId)} ${building.name} inşa etti.${architectDiscountUsed ? ' Mimarlar Loncası indirimi kullanıldı.' : ''}`,
      );
    }

    case 'createAgreement': {
      const parties = [...new Set(action.parties)].filter(Boolean);
      if (parties.length < 2 || !action.terms.trim()) return state;
      const agreement = {
        id: state.nextIds.agreement,
        type: action.agreementType,
        parties,
        terms: action.terms.trim(),
        round: action.round,
        status: 'active' as AgreementStatus,
        penaltyApplied: false,
        createdAt: state.elapsedSeconds,
      };
      let next: GameState = {
        ...state,
        agreements: [agreement, ...state.agreements],
        nextIds: { ...state.nextIds, agreement: state.nextIds.agreement + 1 },
      };
      const peaceBonusParties =
        action.round === 1
          ? parties.filter(
              (party) => !state.agreements.some((item) => item.round === 1 && item.parties.includes(party)),
            )
          : [];
      peaceBonusParties.forEach((party) => {
        next = updateKingdom(next, party, (kingdom) => ({
          ...kingdom,
          resources: { ...kingdom.resources, gold: kingdom.resources.gold + 1 },
        }));
      });
      const peaceBonusNote = peaceBonusParties.length
        ? ` Barış Çağı ilk anlaşma bonusu: ${peaceBonusParties.map(kingdomName).join(', ')} +1 Altın.`
        : '';
      return appendLog(
        next,
        'success',
        `${parties.map(kingdomName).join(' + ')} arasında tescilli anlaşma oluşturuldu.${peaceBonusNote}`,
      );
    }

    case 'setAgreementStatus': {
      const agreement = state.agreements.find((item) => item.id === action.agreementId);
      if (!agreement || agreement.status === action.status) return state;

      let next: GameState = {
        ...state,
        agreements: state.agreements.map((item) =>
          item.id === action.agreementId ? { ...item, status: action.status } : item,
        ),
      };

      if (action.status === 'broken' && !agreement.penaltyApplied) {
        const penalty = agreement.type === 'nonAggression' ? 5 : agreement.type === 'alliance' ? 3 : 0;
        if (penalty > 0 && action.brokenBy) {
          next = updateKingdom(next, action.brokenBy, (kingdom) => ({
            ...kingdom,
            penaltyPoints: kingdom.penaltyPoints + penalty,
          }));
        }
        next = {
          ...next,
          agreements: next.agreements.map((item) =>
            item.id === action.agreementId ? { ...item, penaltyApplied: true } : item,
          ),
        };
      }

      const breakerNote = action.status === 'broken' && action.brokenBy ? ` Bozan taraf: ${kingdomName(action.brokenBy)}.` : '';
      return appendLog(next, action.status === 'broken' ? 'danger' : 'info', `Anlaşma #${action.agreementId} durumu: ${action.status}.${breakerNote}`);
    }

    case 'unlockChests': {
      const before = state.chests.filter((chest) => chest.status === 'available').length;
      const next: GameState = {
        ...state,
        chests: state.chests.map((chest) =>
          chest.status === 'locked' && chest.unlockRound <= action.round
            ? { ...chest, status: 'available' }
            : chest,
        ),
      };
      const after = next.chests.filter((chest) => chest.status === 'available').length;
      if (after === before) return state;
      return appendLog(next, 'info', `${action.round}. tur keşif sandıkları açıldı.`);
    }

    case 'claimChest': {
      const chest = state.chests.find((item) => item.id === action.chestId);
      if (!chest || chest.status !== 'available') return state;

      let next: GameState = {
        ...state,
        chests: state.chests.map((item) =>
          item.id === action.chestId ? { ...item, status: 'claimed', claimedBy: action.kingdomId } : item,
        ),
      };

      const explorerBonus = state.kingdoms[action.kingdomId].privilegeCardId === 'royalExplorers' ? 1 : 0;
      next = updateKingdom(next, action.kingdomId, (kingdom) => ({
        ...kingdom,
        resources: addResources(addResources(kingdom.resources, chest.reward), { gold: explorerBonus }),
        manualPrestige: kingdom.manualPrestige + (chest.reward.prestige ?? 0),
        chestsOpened: kingdom.chestsOpened + 1,
        bonusProduction: chest.reward.productionFood
          ? { ...kingdom.bonusProduction, food: kingdom.bonusProduction.food + chest.reward.productionFood }
          : kingdom.bonusProduction,
      }));

      return appendLog(
        next,
        'success',
        `${kingdomName(action.kingdomId)} ${chest.title} ödülünü aldı.${explorerBonus ? ' Kraliyet Kâşifleri bonusu: +1 Altın.' : ''}`,
      );
    }

    case 'recordTournament': {
      if (state.tournamentRecordedRounds.includes(action.round)) {
        return appendLog(state, 'warning', `${action.round}. tur turnuvası zaten kaydedilmiş.`);
      }
      let next: GameState = {
        ...state,
        tournamentRecordedRounds: [...state.tournamentRecordedRounds, action.round],
      };
      next = updateKingdom(next, action.winner, (kingdom) => ({
        ...kingdom,
        tournamentWins: kingdom.tournamentWins + 1,
      }));
      if (action.second) {
        next = updateKingdom(next, action.second, (kingdom) => ({
          ...kingdom,
          resources: { ...kingdom.resources, gold: kingdom.resources.gold + 2 },
        }));
      }
      return appendLog(next, 'success', `${action.round}. tur turnuvası: birinci ${kingdomName(action.winner)}.`);
    }

    case 'resolveWar': {
      if (action.attacker === action.defender) return state;
      const validDice = [action.attackerDice, action.defenderDice].every(
        (value) => Number.isInteger(value) && value >= 1 && value <= 6,
      );
      if (!validDice) return state;
      if (action.round < 2) {
        return appendLog(state, 'warning', 'Barış Çağında savaş sonuçlandırılamaz.');
      }
      const hasNonAggressionPact = state.agreements.some(
        (agreement) =>
          agreement.type === 'nonAggression' &&
          agreement.status === 'active' &&
          agreement.parties.includes(action.attacker) &&
          agreement.parties.includes(action.defender),
      );
      if (hasNonAggressionPact) {
        return appendLog(state, 'warning', 'Aktif saldırmazlık paktı olan krallıklar birbirine saldıramaz.');
      }
      if (state.wars.some((war) => war.round === action.round && war.attacker === action.attacker)) {
        return appendLog(state, 'warning', `${kingdomName(action.attacker)} bu tur zaten saldırdı.`);
      }
      const attacker = state.kingdoms[action.attacker];
      const defender = state.kingdoms[action.defender];
      if (!canAfford(attacker.resources, { gold: 3, food: 1 })) {
        return appendLog(state, 'warning', `${kingdomName(action.attacker)} savaş bedelini ödeyemedi.`);
      }
      const attackerScore =
        attacker.military + action.attackerDice + (action.duelWinner === 'attacker' ? 2 : 0);
      const defenderScore =
        defender.military +
        action.defenderDice +
        (action.duelWinner === 'defender' ? 2 : 0) +
        (defender.buildings.includes('wall') ? 2 : 0);
      const winner = attackerScore >= defenderScore ? action.attacker : action.defender;
      const spoilsTotal = Object.values(clampResourceInputs(action.spoils)).reduce((sum, value) => sum + value, 0);
      if (winner === action.attacker && spoilsTotal > 4) return state;
      let spoilsTakenTotal = 0;

      let next = updateKingdom(state, action.attacker, (kingdom) => {
        const cost = deductLimited(kingdom.resources, { gold: 3, food: 1 });
        return { ...kingdom, resources: cost.next };
      });

      if (winner === action.attacker) {
        const spoils = clampResourceInputs(action.spoils);
        const limitedSpoils: Partial<Resources> = {};
        (Object.keys(spoils) as ResourceKey[]).forEach((key) => {
          limitedSpoils[key] = Math.min(next.kingdoms[action.defender].resources[key], spoils[key] ?? 0);
        });
        spoilsTakenTotal = Object.values(limitedSpoils).reduce((sum, value) => sum + (value ?? 0), 0);
        next = updateKingdom(next, action.defender, (kingdom) => ({
          ...kingdom,
          resources: subtractResources(kingdom.resources, limitedSpoils),
        }));
        next = updateKingdom(next, action.attacker, (kingdom) => ({
          ...kingdom,
          resources: addResources(kingdom.resources, limitedSpoils),
          warsWon: kingdom.warsWon + 1,
        }));
      } else {
        next = updateKingdom(next, action.attacker, (kingdom) => {
          const penalty = deductLimited(kingdom.resources, { gold: 3 });
          return { ...kingdom, resources: penalty.next };
        });
        next = updateKingdom(next, action.defender, (kingdom) => ({
          ...kingdom,
          resources: { ...kingdom.resources, gold: kingdom.resources.gold + 3 },
          warsWon: kingdom.warsWon + 1,
        }));
      }

      const war = {
        id: state.nextIds.war,
        round: action.round,
        attacker: action.attacker,
        defender: action.defender,
        attackerScore,
        defenderScore,
        winner,
        note: winner === action.attacker ? `Saldıran ${spoilsTakenTotal} kart ganimet aldı.` : 'Savunan kazandı; saldıran 3 Altın ödedi.',
      };
      next = {
        ...next,
        wars: [war, ...next.wars],
        nextIds: { ...next.nextIds, war: state.nextIds.war + 1 },
      };
      return appendLog(
        next,
        winner === action.attacker ? 'danger' : 'warning',
        `Savaş: ${kingdomName(action.attacker)} ${attackerScore} — ${defenderScore} ${kingdomName(action.defender)}. Kazanan ${kingdomName(winner)}.`,
      );
    }

    case 'setCrownVote': {
      if (action.voter === action.target) return state;
      const next: GameState = {
        ...state,
        crownVotes: { ...state.crownVotes, [action.voter]: action.target },
      };
      return appendLog(next, 'info', `${kingdomName(action.voter)} Taç oyunu kullandı.`);
    }

    case 'clearCrownVote': {
      if (!(action.voter in state.crownVotes)) return state;
      const crownVotes = { ...state.crownVotes };
      delete crownVotes[action.voter];
      const next: GameState = { ...state, crownVotes };
      return appendLog(next, 'info', `${kingdomName(action.voter)} Taç oyu geri alındı.`);
    }

    case 'adjustMilitary': {
      const amount = Math.trunc(action.amount);
      if (!amount) return state;
      const kingdom = state.kingdoms[action.kingdomId];
      if (!kingdom) return state;
      const applied = Math.max(-kingdom.military, amount);
      const next = updateKingdom(state, action.kingdomId, (entry) => ({
        ...entry,
        military: entry.military + applied,
      }));
      return appendLog(
        next,
        applied > 0 ? 'success' : 'warning',
        `${kingdomName(action.kingdomId)}: askerî güç ${applied > 0 ? '+' : ''}${applied} (${action.reason || 'manuel düzeltme'}).`,
      );
    }

    case 'adjustPrestige': {
      const amount = Math.trunc(action.amount);
      if (!amount) return state;
      const next = updateKingdom(state, action.kingdomId, (kingdom) => ({
        ...kingdom,
        manualPrestige: kingdom.manualPrestige + amount,
      }));
      return appendLog(
        next,
        amount > 0 ? 'success' : 'warning',
        `${kingdomName(action.kingdomId)}: ${amount > 0 ? '+' : ''}${amount} PP (${action.reason || 'manuel düzeltme'}).`,
      );
    }

    case 'clearLog':
      return { ...state, log: [] };

    case 'syncState':
      return action.state;

    default:
      return state;
  }
}

function normalizeKingdomState(kingdom: KingdomState): KingdomState {
  return {
    ...kingdom,
    productionBlockedRounds: kingdom.productionBlockedRounds ?? [],
    architectDiscountRounds: kingdom.architectDiscountRounds ?? [],
    privilegeCardId: kingdom.privilegeCardId ?? null,
    startingPackageId: kingdom.startingPackageId ?? null,
    bonusProduction: kingdom.bonusProduction ?? zeroResources(),
  };
}

function normalizeState(state: GameState): GameState {
  return {
    ...state,
    timerOwnerId: state.timerOwnerId ?? null,
    kingdoms: KINGDOMS.reduce<Record<KingdomId, KingdomState>>((acc, definition) => {
      const kingdom = state.kingdoms[definition.id];
      if (kingdom) acc[definition.id] = normalizeKingdomState(kingdom);
      return acc;
    }, {} as Record<KingdomId, KingdomState>),
  };
}

function loadInitialState(): GameState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialState();
    const parsed = JSON.parse(raw) as GameState;
    if (!parsed.kingdoms || !parsed.nextIds) return createInitialState();
    const normalized = normalizeState(parsed);
    if (KINGDOMS.some((definition) => !normalized.kingdoms[definition.id])) return createInitialState();
    return normalized;
  } catch {
    return createInitialState();
  }
}

function timerClientId(): string {
  try {
    const existing = window.sessionStorage.getItem(`${STORAGE_KEY}-timer-client`);
    if (existing) return existing;
    const created = `client-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    window.sessionStorage.setItem(`${STORAGE_KEY}-timer-client`, created);
    return created;
  } catch {
    return `client-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

export type NetworkStatus = 'kapalı' | 'bağlanıyor' | 'bağlı' | 'kopuk';

interface UseGameStateOptions {
  publishNetwork?: boolean;
}

export function useGameState({ publishNetwork = false }: UseGameStateOptions = {}) {
  const [state, baseDispatch] = useReducer(gameReducer, undefined as unknown as GameState, loadInitialState);
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>('kapalı');
  const [networkReady, setNetworkReady] = useState(false);
  const lastSerializedRef = useRef('');
  const lastNetworkSerializedRef = useRef('');
  const socketRef = useRef<WebSocket | null>(null);
  const clientIdRef = useRef(timerClientId());
  const dispatch = useCallback<GameDispatch>((action) => {
    baseDispatch(action.type === 'toggleTimer' ? { ...action, ownerId: clientIdRef.current } : action);
  }, []);

  useEffect(() => {
    const serialized = JSON.stringify(state);
    window.localStorage.setItem(STORAGE_KEY, serialized);
    lastSerializedRef.current = serialized;
  }, [state]);

  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key !== STORAGE_KEY || !event.newValue || event.newValue === lastSerializedRef.current) return;
      try {
        const parsed = JSON.parse(event.newValue) as GameState;
        if (!parsed.kingdoms || !parsed.nextIds) return;
        dispatch({ type: 'syncState', state: normalizeState(parsed) });
      } catch {
        return;
      }
    }

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [dispatch]);

  useEffect(() => {
    let disposed = false;
    let reconnectTimer = 0;

    function connect() {
      if (disposed) return;
      setNetworkStatus('bağlanıyor');
      setNetworkReady(false);
      const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
      const host = window.location.hostname || 'localhost';
      const socket = new WebSocket(`${protocol}://${host}:8787`);
      socketRef.current = socket;

      socket.onopen = () => {
        setNetworkStatus('bağlı');
        socket.send(JSON.stringify({ type: 'hello' }));
      };

      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(String(event.data)) as { type?: string; state?: GameState | null };
          if (message.type !== 'state') return;
          setNetworkReady(true);
          if (!message.state?.kingdoms || !message.state.nextIds) return;
          const normalized = normalizeState(message.state);
          const serialized = JSON.stringify(normalized);
          if (serialized === lastSerializedRef.current) return;
          lastNetworkSerializedRef.current = serialized;
          dispatch({ type: 'syncState', state: normalized });
        } catch {
          return;
        }
      };

      socket.onclose = () => {
        setNetworkReady(false);
        setNetworkStatus(disposed ? 'kapalı' : 'kopuk');
        if (!disposed) reconnectTimer = window.setTimeout(connect, 3000);
      };

      socket.onerror = () => {
        socket.close();
      };
    }

    connect();
    return () => {
      disposed = true;
      window.clearTimeout(reconnectTimer);
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, [dispatch]);

  useEffect(() => {
    if (!publishNetwork || networkStatus !== 'bağlı' || !networkReady) return;
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    const serialized = JSON.stringify(state);
    if (serialized === lastNetworkSerializedRef.current) return;
    socket.send(JSON.stringify({ type: 'state', state }));
    lastNetworkSerializedRef.current = serialized;
  }, [state, publishNetwork, networkStatus, networkReady]);

  useEffect(() => {
    if (!state.timerRunning || state.timerOwnerId !== clientIdRef.current) return;
    const timer = window.setInterval(() => dispatch({ type: 'tick' }), 1000);
    return () => window.clearInterval(timer);
  }, [state.timerRunning, state.timerOwnerId, dispatch]);

  return { state, dispatch, networkStatus };
}

export type GameDispatch = Dispatch<GameAction>;
