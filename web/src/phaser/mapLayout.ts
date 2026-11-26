import type { KingdomId } from '../types';

export const WORLD_WIDTH = 1600;
export const WORLD_HEIGHT = 1000;
export const MIN_USER_ZOOM = 1;
export const MAX_USER_ZOOM = 2.8;
export const CAMERA_HOME_Y = WORLD_HEIGHT / 2 + 24;

export interface PercentPoint {
  x: number;
  y: number;
}

export interface SizedPercentPoint extends PercentPoint {
  s: number;
}

export const KINGDOM_POSITIONS: Record<KingdomId, PercentPoint> = {
  north: { x: 50, y: 23 },
  west: { x: 22, y: 42 },
  center: { x: 50, y: 48 },
  east: { x: 68, y: 42 },
  south: { x: 31, y: 79 },
  gold: { x: 69, y: 79 },
};

export const ROAD_LINKS: Array<[KingdomId, KingdomId]> = [
  ['north', 'west'],
  ['north', 'center'],
  ['north', 'east'],
  ['west', 'center'],
  ['center', 'east'],
  ['west', 'south'],
  ['south', 'gold'],
  ['gold', 'east'],
  ['center', 'south'],
  ['center', 'gold'],
];

export const MOUNTAIN_MARKERS: SizedPercentPoint[] = [
  { x: 47, y: 34, s: 3.2 }, { x: 51, y: 31, s: 4.4 }, { x: 55, y: 33, s: 3.6 },
  { x: 50, y: 37, s: 2.8 }, { x: 59, y: 30, s: 2.8 }, { x: 57, y: 36, s: 2.4 },
];

export const FOREST_MARKERS: SizedPercentPoint[] = [
  { x: 13, y: 31, s: 2.1 }, { x: 16, y: 28, s: 2.4 }, { x: 19, y: 31, s: 2.5 },
  { x: 22, y: 28, s: 3.1 }, { x: 25, y: 31, s: 2.4 }, { x: 29, y: 30, s: 2.1 },
  { x: 14, y: 35, s: 2.3 }, { x: 17, y: 34, s: 2.8 }, { x: 20, y: 37, s: 2.9 },
  { x: 23, y: 34, s: 2.2 }, { x: 26, y: 37, s: 2.5 }, { x: 30, y: 35, s: 1.9 },
  { x: 15, y: 39, s: 2.1 }, { x: 19, y: 42, s: 2.2 }, { x: 24, y: 41, s: 2.4 },
  { x: 28, y: 40, s: 2.1 }, { x: 32, y: 37, s: 1.8 }, { x: 24, y: 25, s: 2.2 },
  { x: 77, y: 31, s: 1.7 }, { x: 82, y: 34, s: 1.8 }, { x: 76, y: 52, s: 1.6 },
  { x: 43, y: 73, s: 1.7 }, { x: 57, y: 75, s: 1.5 },
];

export const HILL_MARKERS: SizedPercentPoint[] = [
  { x: 73, y: 28, s: 2.7 }, { x: 80, y: 27, s: 2.2 }, { x: 87, y: 31, s: 2.4 },
  { x: 72, y: 55, s: 2.5 }, { x: 82, y: 57, s: 2.1 }, { x: 39, y: 66, s: 2.2 },
  { x: 60, y: 68, s: 2.3 }, { x: 69, y: 72, s: 1.9 }, { x: 12, y: 55, s: 2.1 },
];

export const HAMLET_MARKERS: SizedPercentPoint[] = [
  { x: 36, y: 27, s: 1.8 }, { x: 63, y: 54, s: 1.7 }, { x: 28, y: 61, s: 1.6 },
  { x: 74, y: 66, s: 1.8 }, { x: 47, y: 86, s: 1.6 }, { x: 86, y: 52, s: 1.4 },
];

export const CHEST_POSITIONS: PercentPoint[] = [
  { x: 12, y: 18 },
  { x: 34, y: 25 },
  { x: 66, y: 25 },
  { x: 88, y: 18 },
  { x: 11, y: 64 },
  { x: 47, y: 68 },
  { x: 89, y: 64 },
  { x: 22, y: 90 },
  { x: 79, y: 91 },
];

export function percentToWorld(point: PercentPoint): { x: number; y: number } {
  return {
    x: (point.x / 100) * WORLD_WIDTH,
    y: (point.y / 100) * WORLD_HEIGHT,
  };
}

export function roadCurve(from: KingdomId, to: KingdomId, index: number) {
  const a = KINGDOM_POSITIONS[from];
  const b = KINGDOM_POSITIONS[to];
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const length = Math.max(1, Math.hypot(dx, dy));
  const direction = index % 2 === 0 ? 1 : -1;
  const bend = Math.min(7, length * 0.16) * direction;
  return {
    a,
    b,
    control: {
      x: (a.x + b.x) / 2 + (-dy / length) * bend,
      y: (a.y + b.y) / 2 + (dx / length) * bend,
    },
  };
}
