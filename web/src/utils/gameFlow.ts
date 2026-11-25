import { GAME_PHASES, ROUND_EVENTS } from '../data/gameData';
import type { GamePhase } from '../types';

export function getCurrentPhase(elapsedSeconds: number): GamePhase {
  const minute = elapsedSeconds / 60;
  if (minute >= 120) {
    return {
      id: 'finished',
      label: 'Oyun Bitti',
      startMinute: 120,
      endMinute: 120,
      description: 'Final sonuçları açıklandı.',
    };
  }
  return GAME_PHASES.find((phase) => minute >= phase.startMinute && minute < phase.endMinute) ?? GAME_PHASES[0];
}

export function getCurrentRound(elapsedSeconds: number): number {
  return getCurrentPhase(elapsedSeconds).round ?? 0;
}

export function getOperationalRound(elapsedSeconds: number): number {
  const minute = elapsedSeconds / 60;
  if (minute < 65) return 1;
  if (minute < 87) return 2;
  return 3;
}

export function getPhaseProgress(elapsedSeconds: number): number {
  const phase = getCurrentPhase(elapsedSeconds);
  if (phase.id === 'finished') return 1;
  const duration = (phase.endMinute - phase.startMinute) * 60;
  const elapsed = elapsedSeconds - phase.startMinute * 60;
  return Math.max(0, Math.min(1, elapsed / duration));
}

export function getRoundEvent(round: number) {
  return ROUND_EVENTS[round] ?? {
    title: 'Hazırlık',
    description: 'Oyun başlamadan önce takımlar, roller ve başlangıç dağılımı hazırlanır.',
  };
}

export function nextPhase(elapsedSeconds: number): GamePhase | null {
  const current = getCurrentPhase(elapsedSeconds);
  const index = GAME_PHASES.findIndex((phase) => phase.id === current.id);
  return GAME_PHASES[index + 1] ?? null;
}
