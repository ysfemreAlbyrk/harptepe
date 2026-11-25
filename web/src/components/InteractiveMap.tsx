import type { CSSProperties } from 'react';
import { BUILDINGS, RESOURCE_SHORT_LABELS, TAX_RULES } from '../data/gameData';
import type { GameState, KingdomId, ResourceKey } from '../types';
import { calculateKingdomScore, getKingdomDefinition, productionForKingdom, RESOURCE_KEYS } from '../utils/gameMath';

interface InteractiveMapProps {
  state: GameState;
  round: number;
  selectedKingdom: KingdomId;
  onSelect: (kingdomId: KingdomId) => void;
}

const positions: Record<KingdomId, { x: number; y: number }> = {
  north: { x: 50, y: 14 },
  west: { x: 18, y: 42 },
  center: { x: 50, y: 48 },
  east: { x: 82, y: 42 },
  south: { x: 31, y: 79 },
  gold: { x: 69, y: 79 },
};

const roads: Array<[KingdomId, KingdomId]> = [
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

const chestPositions = [
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

export function InteractiveMap({ state, round, selectedKingdom, onSelect }: InteractiveMapProps) {
  const selectedDefinition = getKingdomDefinition(selectedKingdom);
  const selectedState = state.kingdoms[selectedKingdom];
  const selectedScore = calculateKingdomScore(state, selectedKingdom);
  const production = productionForKingdom(selectedState, Math.max(1, round));
  const currentTax = round > 0 ? selectedState.taxHistory[round] : undefined;

  return (
    <div className="interactive-map" aria-label="İnteraktif krallık haritası">
      <svg className="map-terrain" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="river" x1="0" x2="1">
            <stop offset="0" stopColor="rgba(93, 148, 188, 0.42)" />
            <stop offset="1" stopColor="rgba(93, 148, 188, 0.08)" />
          </linearGradient>
        </defs>
        <path className="map-river" d="M -4 70 C 20 58, 22 39, 45 39 C 68 39, 69 23, 104 12" />
        <path className="map-coast" d="M -4 91 C 20 83, 40 96, 64 88 C 79 83, 91 88, 104 80" />
        {roads.map(([from, to]) => (
          <line
            key={`${from}-${to}`}
            className="map-road"
            x1={positions[from].x}
            y1={positions[from].y}
            x2={positions[to].x}
            y2={positions[to].y}
          />
        ))}
      </svg>

      <div className="map-landmark landmark-mountain" style={{ left: '54%', top: '29%' }} />
      <div className="map-landmark landmark-forest" style={{ left: '25%', top: '32%' }} />
      <div className="map-landmark landmark-harbor" style={{ left: '72%', top: '88%' }} />

      {state.chests.map((chest, index) => {
        const position = chestPositions[index] ?? { x: 50, y: 50 };
        return (
          <span
            key={chest.id}
            className={`map-chest chest-${chest.status}`}
            style={{ left: `${position.x}%`, top: `${position.y}%` }}
            title={`${chest.title} · ${chest.status === 'claimed' ? 'açıldı' : chest.status === 'available' ? 'açık' : 'kapalı'}`}
          >
            {chest.id}
          </span>
        );
      })}

      {(Object.keys(positions) as KingdomId[]).map((kingdomId) => {
        const definition = getKingdomDefinition(kingdomId);
        const kingdom = state.kingdoms[kingdomId];
        const score = calculateKingdomScore(state, kingdomId);
        const position = positions[kingdomId];
        return (
          <button
            key={kingdomId}
            type="button"
            className={`map-kingdom ${selectedKingdom === kingdomId ? 'selected' : ''}`}
            style={
              {
                left: `${position.x}%`,
                top: `${position.y}%`,
                '--kingdom-color': definition.color,
                '--kingdom-soft': definition.softColor,
              } as CSSProperties
            }
            onClick={() => onSelect(kingdomId)}
            aria-label={`${definition.name} krallığını seç`}
          >
            <span className="map-keep" aria-hidden="true">
              <i />
            </span>
            <span className="map-kingdom-label">
              <small>{definition.epithet}</small>
              <strong>{definition.name}</strong>
            </span>
            <span className="map-kingdom-stats">
              <b>{score.total} PP</b>
              <em>{kingdom.military} asker</em>
            </span>
          </button>
        );
      })}

      <aside className="map-detail" style={{ '--kingdom-color': selectedDefinition.color } as CSSProperties}>
        <div className="map-detail-heading">
          <div>
            <p className="eyebrow">Seçili krallık</p>
            <h3>{selectedDefinition.name}</h3>
          </div>
          <strong>{selectedScore.total} PP</strong>
        </div>
        <div className="map-resource-row">
          {RESOURCE_KEYS.map((key: ResourceKey) => (
            <span key={key} className={`mini-resource resource-${key}`}>
              <span>{RESOURCE_SHORT_LABELS[key]}</span>
              <strong>{selectedState.resources[key]}</strong>
            </span>
          ))}
        </div>
        <div className="map-detail-facts">
          <span>Üretim: {RESOURCE_KEYS.filter((key) => production[key] > 0).map((key) => `+${production[key]}${RESOURCE_SHORT_LABELS[key]}`).join(' ') || '—'}</span>
          <span>Vergi: {currentTax ? TAX_RULES[currentTax].label : 'seçilmedi'}</span>
          <span>Yapılar: {selectedState.buildings.length ? selectedState.buildings.map((id) => BUILDINGS.find((item) => item.id === id)?.name).filter(Boolean).join(', ') : 'yok'}</span>
        </div>
      </aside>
    </div>
  );
}
