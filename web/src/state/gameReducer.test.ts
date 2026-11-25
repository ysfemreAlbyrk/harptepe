import { describe, expect, it } from 'vitest';
import { createInitialState, gameReducer } from './useGameState';
import { calculateKingdomScore } from '../utils/gameMath';

describe('gameReducer', () => {
  it('altı krallığı planlanan başlangıç kaynaklarıyla kurar', () => {
    const state = createInitialState();

    expect(Object.keys(state.kingdoms)).toHaveLength(6);
    expect(state.kingdoms.north.resources).toEqual({ food: 8, wood: 3, stone: 2, ore: 0, gold: 5 });
    expect(state.kingdoms.south.resources.gold).toBe(15);
    expect(calculateKingdomScore(state, 'north').total).toBe(0);
  });

  it('üretimi bir turda yalnızca bir kez uygular', () => {
    const initial = createInitialState();
    const produced = gameReducer(initial, { type: 'applyProduction', round: 1 });
    const repeated = gameReducer(produced, { type: 'applyProduction', round: 1 });

    expect(produced.kingdoms.north.resources.food).toBe(12);
    expect(produced.kingdoms.west.resources.wood).toBe(12);
    expect(repeated.kingdoms.north.resources.food).toBe(12);
    expect(repeated.productionAppliedRounds).toEqual([1]);
  });

  it('gıda bakımını tahsil eder ve eksik kart için ceza uygular', () => {
    const initial = createInitialState();
    const state = gameReducer(initial, { type: 'chargeUpkeep', round: 1 });

    expect(state.kingdoms.north.resources.food).toBe(6);
    expect(state.kingdoms.east.resources.food).toBe(0);
    expect(state.kingdoms.east.penaltyPoints).toBe(2);
    expect(state.kingdoms.east.foodShortageCards).toBe(1);
  });

  it('çiftlik maliyetini düşer ve sonraki üretime bonus ekler', () => {
    const initial = createInitialState();
    const withFarm = gameReducer(initial, { type: 'buyBuilding', kingdomId: 'north', buildingId: 'farm', round: 1 });
    const produced = gameReducer(withFarm, { type: 'applyProduction', round: 1 });

    expect(withFarm.kingdoms.north.resources.wood).toBe(1);
    expect(withFarm.kingdoms.north.resources.stone).toBe(1);
    expect(produced.kingdoms.north.resources.food).toBe(14);
  });

  it('anlaşma bozma cezasını yalnızca bozan tarafa uygular', () => {
    const initial = createInitialState();
    const withAgreement = gameReducer(initial, {
      type: 'createAgreement',
      agreementType: 'alliance',
      parties: ['north', 'south'],
      terms: 'Oyun sonuna kadar ittifak',
      round: 1,
    });
    const broken = gameReducer(withAgreement, {
      type: 'setAgreementStatus',
      agreementId: 1,
      status: 'broken',
      brokenBy: 'south',
    });

    expect(broken.kingdoms.south.penaltyPoints).toBe(3);
    expect(broken.kingdoms.north.penaltyPoints).toBe(0);
  });

  it('sandık ödülünü kaynak, prestij ve üretim bonusuyla uygular', () => {
    const initial = createInitialState();
    const unlocked = gameReducer(initial, { type: 'unlockChests', round: 2 });
    const claimed = gameReducer(unlocked, { type: 'claimChest', chestId: 6, kingdomId: 'east' });

    expect(claimed.chests.find((chest) => chest.id === 6)?.status).toBe('claimed');
    expect(claimed.kingdoms.east.manualPrestige).toBe(2);
    expect(claimed.kingdoms.east.bonusProduction.food).toBe(2);
    expect(claimed.kingdoms.east.chestsOpened).toBe(1);
  });

  it('savaş skorunu hesaplar ve ganimeti aktarır', () => {
    const initial = createInitialState();
    const state = gameReducer(initial, {
      type: 'resolveWar',
      round: 2,
      attacker: 'north',
      defender: 'center',
      attackerDice: 6,
      defenderDice: 1,
      duelWinner: 'none',
      spoils: { stone: 4 },
    });

    expect(state.wars).toHaveLength(1);
    expect(state.wars[0].winner).toBe('north');
    expect(state.kingdoms.north.resources.stone).toBe(6);
    expect(state.kingdoms.center.resources.stone).toBe(3);
    expect(state.kingdoms.north.warsWon).toBe(1);
  });

  it('kalan kaynak puanını puanlama fasından önce göstermez', () => {
    const initial = createInitialState();
    expect(calculateKingdomScore(initial, 'north').total).toBe(0);

    const scoringState = { ...initial, elapsedSeconds: 107 * 60 };
    expect(calculateKingdomScore(scoringState, 'north').total).toBeGreaterThan(0);
  });

  it('üst üste yüksek vergi isyan cezası ve üretim engeli oluşturur', () => {
    const initial = createInitialState();
    const first = gameReducer(initial, { type: 'setTax', kingdomId: 'north', round: 1, tax: 'high' });
    const second = gameReducer(first, { type: 'setTax', kingdomId: 'north', round: 2, tax: 'high' });

    expect(second.kingdoms.north.penaltyPoints).toBe(4);
    expect(second.kingdoms.north.productionBlockedRounds).toContain(2);
  });

  it('Bereketli Vadi ayrıcalığını tur üretimine ekler', () => {
    const initial = createInitialState();
    const privileged = gameReducer(initial, {
      type: 'setPrivilegeCard',
      kingdomId: 'north',
      privilegeCardId: 'fertileValley',
    });
    const produced = gameReducer(privileged, { type: 'applyProduction', round: 1 });

    expect(produced.kingdoms.north.resources.food).toBe(13);
  });

  it('Mimarlar Loncası indirimini tur başına bir kez uygular', () => {
    const initial = createInitialState();
    const privileged = gameReducer(initial, {
      type: 'setPrivilegeCard',
      kingdomId: 'north',
      privilegeCardId: 'architectsGuild',
    });
    const built = gameReducer(privileged, {
      type: 'buyBuilding',
      kingdomId: 'north',
      buildingId: 'farm',
      round: 1,
      discountResource: 'wood',
    });
    const secondAttempt = gameReducer(built, {
      type: 'buyBuilding',
      kingdomId: 'north',
      buildingId: 'farm',
      round: 1,
      discountResource: 'stone',
    });

    expect(built.kingdoms.north.resources.wood).toBe(2);
    expect(built.kingdoms.north.resources.stone).toBe(1);
    expect(built.kingdoms.north.architectDiscountRounds).toEqual([1]);
    expect(secondAttempt.kingdoms.north.buildings).toHaveLength(1);
  });

  it('başlangıç paketini uygular ve değiştirildiğinde öncekini geri alır', () => {
    const initial = createInitialState();
    const mercenary = gameReducer(initial, {
      type: 'setStartingPackage',
      kingdomId: 'north',
      packageId: 'mercenaries',
    });
    const granary = gameReducer(mercenary, {
      type: 'setStartingPackage',
      kingdomId: 'north',
      packageId: 'granary',
    });

    expect(mercenary.kingdoms.north.resources.gold).toBe(7);
    expect(mercenary.kingdoms.north.military).toBe(3);
    expect(granary.kingdoms.north.resources.gold).toBe(5);
    expect(granary.kingdoms.north.military).toBe(2);
    expect(granary.kingdoms.north.resources.food).toBe(12);
  });

  it('ayrıcalık ve başlangıç paketinin iki krallığa verilmesini engeller', () => {
    const initial = createInitialState();
    const assigned = gameReducer(initial, {
      type: 'setPrivilegeCard',
      kingdomId: 'north',
      privilegeCardId: 'fertileValley',
    });
    const duplicatePrivilege = gameReducer(assigned, {
      type: 'setPrivilegeCard',
      kingdomId: 'east',
      privilegeCardId: 'fertileValley',
    });
    const withPackage = gameReducer(assigned, {
      type: 'setStartingPackage',
      kingdomId: 'north',
      packageId: 'granary',
    });
    const duplicatePackage = gameReducer(withPackage, {
      type: 'setStartingPackage',
      kingdomId: 'east',
      packageId: 'granary',
    });

    expect(duplicatePrivilege.kingdoms.east.privilegeCardId).toBeNull();
    expect(duplicatePackage.kingdoms.east.startingPackageId).toBeNull();
  });

  it('Bereketli Vadi sahibi Kıtlık bakımını 2 Gıda olarak öder', () => {
    const initial = createInitialState();
    const privileged = gameReducer(initial, {
      type: 'setPrivilegeCard',
      kingdomId: 'east',
      privilegeCardId: 'fertileValley',
    });
    const charged = gameReducer(privileged, { type: 'chargeUpkeep', round: 2 });

    expect(charged.kingdoms.east.penaltyPoints).toBe(2);
    expect(charged.kingdoms.east.foodShortageCards).toBe(1);
  });

  it('Kraliyet Kâşifleri sahibine sandık başına ekstra 1 Altın verir', () => {
    const initial = createInitialState();
    const privileged = gameReducer(initial, {
      type: 'setPrivilegeCard',
      kingdomId: 'east',
      privilegeCardId: 'royalExplorers',
    });
    const unlocked = gameReducer(privileged, { type: 'unlockChests', round: 1 });
    const claimed = gameReducer(unlocked, { type: 'claimChest', chestId: 2, kingdomId: 'east' });

    expect(claimed.kingdoms.east.resources.gold).toBe(11);
  });

  it('askerî güç düzeltmesini sıfırın altına indirmez', () => {
    const initial = createInitialState();
    const reinforced = gameReducer(initial, {
      type: 'adjustMilitary',
      kingdomId: 'north',
      amount: 3,
      reason: 'Paralı asker',
    });
    const reduced = gameReducer(reinforced, {
      type: 'adjustMilitary',
      kingdomId: 'north',
      amount: -99,
      reason: 'Düzeltme',
    });

    expect(reinforced.kingdoms.north.military).toBe(5);
    expect(reduced.kingdoms.north.military).toBe(0);
  });

  it('gizli hedefi moderatör atamasıyla günceller', () => {
    const initial = createInitialState();
    const state = gameReducer(initial, {
      type: 'setSecretObjective',
      kingdomId: 'north',
      objectiveId: 'explorer',
    });

    expect(state.kingdoms.north.secretObjectiveId).toBe('explorer');
    expect(state.kingdoms.east.secretObjectiveId).toBe('founder');
  });

  it('taç oyunu geri alabilmeyi destekler', () => {
    const initial = createInitialState();
    const voted = gameReducer(initial, { type: 'setCrownVote', voter: 'north', target: 'south' });
    const cleared = gameReducer(voted, { type: 'clearCrownVote', voter: 'north' });

    expect(voted.crownVotes.north).toBe('south');
    expect(cleared.crownVotes.north).toBeUndefined();
  });

  it('1. turda krallığın ilk tescilli anlaşmasına Barış Çağı bonusu verir', () => {
    const initial = createInitialState();
    const firstAgreement = gameReducer(initial, {
      type: 'createAgreement',
      agreementType: 'trade',
      parties: ['north', 'south'],
      terms: 'Odun karşılığı altın',
      round: 1,
    });
    const secondAgreement = gameReducer(firstAgreement, {
      type: 'createAgreement',
      agreementType: 'trade',
      parties: ['north', 'east'],
      terms: 'Taş karşılığı gıda',
      round: 1,
    });

    expect(firstAgreement.kingdoms.north.resources.gold).toBe(6);
    expect(firstAgreement.kingdoms.south.resources.gold).toBe(16);
    expect(secondAgreement.kingdoms.north.resources.gold).toBe(6);
    expect(secondAgreement.kingdoms.east.resources.gold).toBe(6);
  });

  it('tamamlanan Ortak Anıt her iki tarafa 6 PP verir', () => {
    const initial = createInitialState();
    const withAgreement = gameReducer(initial, {
      type: 'createAgreement',
      agreementType: 'sharedMonument',
      parties: ['north', 'east'],
      terms: 'Malzemeler bölüşülerek tek Anıt kurulacak',
      round: 2,
    });
    const completed = gameReducer(withAgreement, {
      type: 'setAgreementStatus',
      agreementId: 1,
      status: 'completed',
    });

    expect(calculateKingdomScore(completed, 'north').lines).toContainEqual({ label: 'Ortak Anıt', points: 6 });
    expect(calculateKingdomScore(completed, 'east').lines).toContainEqual({ label: 'Ortak Anıt', points: 6 });
  });

  it('aktif saldırmazlık paktı olan krallıklar arasında savaşı engeller', () => {
    const initial = createInitialState();
    const withPact = gameReducer(initial, {
      type: 'createAgreement',
      agreementType: 'nonAggression',
      parties: ['north', 'center'],
      terms: 'Oyun sonuna kadar saldırmazlık',
      round: 1,
    });
    const state = gameReducer(withPact, {
      type: 'resolveWar',
      round: 2,
      attacker: 'north',
      defender: 'center',
      attackerDice: 6,
      defenderDice: 1,
      duelWinner: 'none',
      spoils: { stone: 4 },
    });

    expect(state.wars).toHaveLength(0);
  });

  it('bir krallığın aynı turda ikinci kez saldırmasını engeller', () => {
    const initial = createInitialState();
    const firstWar = gameReducer(initial, {
      type: 'resolveWar',
      round: 2,
      attacker: 'north',
      defender: 'center',
      attackerDice: 6,
      defenderDice: 1,
      duelWinner: 'none',
      spoils: { stone: 4 },
    });
    const secondWar = gameReducer(firstWar, {
      type: 'resolveWar',
      round: 2,
      attacker: 'north',
      defender: 'east',
      attackerDice: 6,
      defenderDice: 1,
      duelWinner: 'none',
      spoils: { ore: 4 },
    });

    expect(firstWar.wars).toHaveLength(1);
    expect(secondWar.wars).toHaveLength(1);
  });

  it('Barış Çağında savaş sonuçlandırmayı engeller', () => {
    const initial = createInitialState();
    const state = gameReducer(initial, {
      type: 'resolveWar',
      round: 1,
      attacker: 'north',
      defender: 'center',
      attackerDice: 6,
      defenderDice: 1,
      duelWinner: 'none',
      spoils: { stone: 4 },
    });

    expect(state.wars).toHaveLength(0);
  });

  it('başka bir sekmeden gelen oyun durumunu eşitler', () => {
    const initial = createInitialState();
    const external = gameReducer(initial, {
      type: 'adjustPrestige',
      kingdomId: 'north',
      amount: 4,
      reason: 'Dış sekme',
    });
    const synced = gameReducer(initial, { type: 'syncState', state: external });

    expect(synced.kingdoms.north.manualPrestige).toBe(4);
  });

  it('bedeli ödenemeyen veya 4 kartı aşan ganimetli savaşı reddeder', () => {
    const initial = createInitialState();
    const poorNorth = {
      ...initial.kingdoms.north,
      resources: { ...initial.kingdoms.north.resources, gold: 2 },
    };
    const poorState = {
      ...initial,
      kingdoms: { ...initial.kingdoms, north: poorNorth },
    };
    const unpaid = gameReducer(poorState, {
      type: 'resolveWar',
      round: 2,
      attacker: 'north',
      defender: 'center',
      attackerDice: 6,
      defenderDice: 1,
      duelWinner: 'none',
      spoils: { stone: 4 },
    });
    const tooManySpoils = gameReducer(initial, {
      type: 'resolveWar',
      round: 2,
      attacker: 'north',
      defender: 'center',
      attackerDice: 6,
      defenderDice: 1,
      duelWinner: 'none',
      spoils: { stone: 5 },
    });

    expect(unpaid.wars).toHaveLength(0);
    expect(tooManySpoils.wars).toHaveLength(0);
  });
});
