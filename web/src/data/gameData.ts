import type {
  BuildingDefinition,
  GamePhase,
  KingdomDefinition,
  PrivilegeCardDefinition,
  ResourceKey,
  Resources,
  SecretObjectiveDefinition,
  StartingPackageDefinition,
  TaxLevel,
} from '../types';

export const RESOURCE_LABELS: Record<ResourceKey, string> = {
  food: 'Gıda',
  wood: 'Odun',
  stone: 'Taş',
  ore: 'Maden',
  gold: 'Altın',
};

export const RESOURCE_SHORT_LABELS: Record<ResourceKey, string> = {
  food: 'G',
  wood: 'O',
  stone: 'T',
  ore: 'M',
  gold: 'A',
};

export const EMPTY_RESOURCES: Resources = {
  food: 0,
  wood: 0,
  stone: 0,
  ore: 0,
  gold: 0,
};

export const KINGDOMS: KingdomDefinition[] = [
  {
    id: 'north',
    name: 'Kuzey',
    epithet: 'Tarlalar',
    color: '#8ecf6f',
    softColor: 'rgba(142, 207, 111, 0.16)',
    strength: 'Gıda üretimi',
    weakness: 'Maden',
    special: 'Tur başı +4 Gıda, +1 Odun üretir.',
    startingResources: { food: 8, wood: 3, stone: 2, ore: 0, gold: 5 },
    production: { food: 4, wood: 1, stone: 0, ore: 0, gold: 0 },
  },
  {
    id: 'west',
    name: 'Batı',
    epithet: 'Ormanlar',
    color: '#5ebd8d',
    softColor: 'rgba(94, 189, 141, 0.16)',
    strength: 'Odun üretimi',
    weakness: 'Taş ve maden',
    special: 'Tur başı +4 Odun, +1 Gıda üretir.',
    startingResources: { food: 2, wood: 8, stone: 2, ore: 1, gold: 5 },
    production: { food: 1, wood: 4, stone: 0, ore: 0, gold: 0 },
  },
  {
    id: 'center',
    name: 'Merkez',
    epithet: 'Taş Ocakları',
    color: '#aeb8c7',
    softColor: 'rgba(174, 184, 199, 0.16)',
    strength: 'Taş üretimi',
    weakness: 'Gıda',
    special: 'Tur başı +4 Taş, +1 Odun üretir.',
    startingResources: { food: 2, wood: 2, stone: 7, ore: 2, gold: 5 },
    production: { food: 0, wood: 1, stone: 4, ore: 0, gold: 0 },
  },
  {
    id: 'east',
    name: 'Doğu',
    epithet: 'Madenler',
    color: '#69a7df',
    softColor: 'rgba(105, 167, 223, 0.16)',
    strength: 'Maden üretimi',
    weakness: 'Gıda',
    special: 'Tur başı +4 Maden, +1 Taş üretir.',
    startingResources: { food: 1, wood: 2, stone: 2, ore: 8, gold: 5 },
    production: { food: 0, wood: 0, stone: 1, ore: 4, gold: 0 },
  },
  {
    id: 'south',
    name: 'Güney',
    epithet: 'Liman Şehri',
    color: '#e7bb5b',
    softColor: 'rgba(231, 187, 91, 0.16)',
    strength: 'Ticaret ve altın',
    weakness: 'Odun',
    special: 'Güney Pazarı üzerinden yapılan takaslardan 1 Altın komisyon alır.',
    startingResources: { food: 3, wood: 0, stone: 3, ore: 2, gold: 15 },
    production: { food: 1, wood: 0, stone: 1, ore: 0, gold: 6 },
  },
  {
    id: 'gold',
    name: 'Altın',
    epithet: 'Hazine Krallığı',
    color: '#d99a45',
    softColor: 'rgba(217, 154, 69, 0.17)',
    strength: 'Finans ve bankacılık',
    weakness: 'Gıda',
    special: 'Tescilli borçları takip eder; ödenmeyen borçlar oyun sonunda ceza doğurur.',
    startingResources: { food: 1, wood: 2, stone: 2, ore: 3, gold: 15 },
    production: { food: 0, wood: 0, stone: 1, ore: 1, gold: 6 },
  },
];

export const PRIVILEGE_CARDS: PrivilegeCardDefinition[] = [
  {
    id: 'fertileValley',
    name: 'Bereketli Vadi',
    effect: 'Her tur +1 Gıda; Kıtlık olayından etkilenmez.',
  },
  {
    id: 'royalMint',
    name: 'Hazine Darphanesi',
    effect: 'Her tur +2 Altın.',
  },
  {
    id: 'architectsGuild',
    name: 'Mimarlar Loncası',
    effect: 'Her tur bir yapının maliyetinden 1 kaynak kartı düşer.',
  },
  {
    id: 'royalExplorers',
    name: 'Kraliyet Kâşifleri',
    effect: 'İki ipucu hakkı; her açılan sandıktan +1 Altın.',
  },
  {
    id: 'portRight',
    name: 'Liman Hakkı',
    effect: 'Her tur bankada 2 kartı 1\'e 1 oranıyla çevirebilir.',
  },
  {
    id: 'shadowNetwork',
    name: 'Gölge Ağı',
    effect: '4 casus jetonu; bir kez sahte tescil şüphesi sorabilir.',
  },
];

export const STARTING_PACKAGES: StartingPackageDefinition[] = [
  {
    id: 'treasureChest',
    name: 'Hazine Sandığı',
    resources: { gold: 8 },
    military: 0,
    value: 8,
  },
  {
    id: 'granary',
    name: 'Ambar',
    resources: { food: 4 },
    military: 0,
    value: 8,
  },
  {
    id: 'stoneQuarry',
    name: 'Taş Ocağı',
    resources: { stone: 3, gold: 1 },
    military: 0,
    value: 7,
  },
  {
    id: 'timberAid',
    name: 'Kereste Yardımı',
    resources: { wood: 3, gold: 1 },
    military: 0,
    value: 7,
  },
  {
    id: 'oreVein',
    name: 'Maden Damarı',
    resources: { ore: 3 },
    military: 0,
    value: 6,
  },
  {
    id: 'mercenaries',
    name: 'Paralı Askerler',
    resources: { gold: 2 },
    military: 1,
    value: 6,
  },
];

export const BUILDINGS: BuildingDefinition[] = [
  {
    id: 'farm',
    name: 'Çiftlik',
    cost: { wood: 2, stone: 1 },
    effect: 'Her tur +2 Gıda',
    prestige: 1,
  },
  {
    id: 'market',
    name: 'Pazar',
    cost: { wood: 1, stone: 1, gold: 2 },
    effect: 'Her tur +2 Altın',
    prestige: 1,
  },
  {
    id: 'barracks',
    name: 'Kışla',
    cost: { wood: 1, ore: 1, gold: 2 },
    effect: 'Kalıcı +1 asker gücü',
    prestige: 1,
  },
  {
    id: 'wall',
    name: 'Sur',
    cost: { stone: 3, ore: 1 },
    effect: 'Savunmada +2',
    prestige: 2,
  },
  {
    id: 'academy',
    name: 'Akademi',
    cost: { stone: 2, wood: 1, ore: 1, gold: 2 },
    effect: 'Prestij',
    prestige: 3,
  },
  {
    id: 'monument',
    name: 'Anıt',
    cost: { stone: 4, wood: 3, ore: 3, food: 2, gold: 5 },
    effect: 'Büyük prestij',
    prestige: 10,
    uniquePerKingdom: true,
  },
];

export const SECRET_OBJECTIVES: SecretObjectiveDefinition[] = [
  {
    id: 'founder',
    name: 'Kurucu',
    description: 'Oyun sonunda tek başına veya ortak bir Anıtın olsun.',
  },
  {
    id: 'diplomat',
    name: 'Diplomat',
    description: 'Oyun sonunda en az 3 tescilli ittifakın olsun.',
  },
  {
    id: 'conqueror',
    name: 'Fatih',
    description: 'En az 2 savaş kazan.',
  },
  {
    id: 'explorer',
    name: 'Kâşif',
    description: 'En az 3 sandık aç.',
  },
  {
    id: 'lender',
    name: 'Tefeci',
    description: 'En az 2 tescilli borç ilişkisi tamamlanmış olsun.',
  },
  {
    id: 'steward',
    name: 'Ambar Beyi',
    description: 'Hiç açlık cezası alma ve oyun sonunda en çok Gıda sende olsun.',
  },
];

export const GAME_PHASES: GamePhase[] = [
  {
    id: 'arrival',
    label: 'Karşılama',
    startMinute: 0,
    endMinute: 8,
    description: 'Kurallar anlatılır, takımlar ve kataloglar dağıtılır.',
  },
  {
    id: 'quiz',
    label: 'Bilgi Yarışması',
    startMinute: 8,
    endMinute: 28,
    description: 'Seçim sırasını belirleyen 15 soruluk yarışma.',
  },
  {
    id: 'draft',
    label: 'Seçim Hakları',
    startMinute: 28,
    endMinute: 38,
    description: 'Yılan draft ile krallık, ayrıcalık ve ek paket seçilir.',
  },
  {
    id: 'roles',
    label: 'Rol Dağılımı',
    startMinute: 38,
    endMinute: 43,
    description: 'Roller seçilir ve krallıklar odalarına geçer.',
  },
  {
    id: 'round1',
    label: '1. Tur · Barış Çağı',
    startMinute: 43,
    endMinute: 63,
    round: 1,
    description: 'Savaş yok. İlk anlaşmalar her iki tarafa +1 Altın verir.',
  },
  {
    id: 'break1',
    label: 'Ara',
    startMinute: 63,
    endMinute: 65,
    description: 'Skor tablosu yenilenir.',
  },
  {
    id: 'round2',
    label: '2. Tur · Kıtlık',
    startMinute: 65,
    endMinute: 85,
    round: 2,
    description: 'Gıda bakımı 3 olur, savaş açılır.',
  },
  {
    id: 'break2',
    label: 'Ara',
    startMinute: 85,
    endMinute: 87,
    description: 'Skor tablosu yenilenir.',
  },
  {
    id: 'round3',
    label: '3. Tur · Taç Yarışı',
    startMinute: 87,
    endMinute: 107,
    round: 3,
    description: 'Tur sonunda Hükümdarlar Taç oylaması yapar.',
  },
  {
    id: 'scoring',
    label: 'Puan Sayımı',
    startMinute: 107,
    endMinute: 112,
    description: 'Kalan kaynaklar, cezalar ve hedefler hesaplanır.',
  },
  {
    id: 'final',
    label: 'Final',
    startMinute: 112,
    endMinute: 120,
    description: 'Sıralama, gizli hedefler ve MVP ödülleri açıklanır.',
  },
];

export const TAX_RULES: Record<TaxLevel, { label: string; gold: number; note: string }> = {
  low: {
    label: 'Düşük',
    gold: 0,
    note: 'Oyun sonunda seçilen her tur için +1 PP',
  },
  normal: {
    label: 'Normal',
    gold: 2,
    note: '+2 Altın',
  },
  high: {
    label: 'Yüksek',
    gold: 5,
    note: '+5 Altın; üst üste ikinci turda isyan',
  },
};

export const ROUND_EVENTS: Record<number, { title: string; description: string }> = {
  1: {
    title: 'Barış Çağı',
    description: 'Savaş yoktur. Bu tur tescillenen ilk anlaşmalar ekonomiyi hareketlendirir.',
  },
  2: {
    title: 'Kıtlık',
    description: 'Gıda bakımı 3 karttır. Kuzey bu tur +4 yerine +3 Gıda üretir. Savaş açılır.',
  },
  3: {
    title: 'Taç Yarışı',
    description: 'Son pazarlıklar yapılır. Tur sonunda en çok Taç oyu alan krallık +5 PP kazanır.',
  },
};
