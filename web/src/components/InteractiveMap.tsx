import { useState, type CSSProperties } from 'react';
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

function roadPath(from: KingdomId, to: KingdomId, index: number) {
  const a = positions[from];
  const b = positions[to];
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const length = Math.max(1, Math.hypot(dx, dy));
  const direction = index % 2 === 0 ? 1 : -1;
  const bend = Math.min(7, length * 0.16) * direction;
  const controlX = (a.x + b.x) / 2 + (-dy / length) * bend;
  const controlY = (a.y + b.y) / 2 + (dx / length) * bend;
  return `M ${a.x} ${a.y} Q ${controlX} ${controlY} ${b.x} ${b.y}`;
}

const mountainMarkers = [
  { x: 47, y: 34, s: 3.2 }, { x: 51, y: 31, s: 4.4 }, { x: 55, y: 33, s: 3.6 },
  { x: 50, y: 37, s: 2.8 }, { x: 59, y: 30, s: 2.8 }, { x: 57, y: 36, s: 2.4 },
];

const forestMarkers = [
  { x: 13, y: 31, s: 2.1 }, { x: 16, y: 28, s: 2.4 }, { x: 19, y: 31, s: 2.5 },
  { x: 22, y: 28, s: 3.1 }, { x: 25, y: 31, s: 2.4 }, { x: 29, y: 30, s: 2.1 },
  { x: 14, y: 35, s: 2.3 }, { x: 17, y: 34, s: 2.8 }, { x: 20, y: 37, s: 2.9 },
  { x: 23, y: 34, s: 2.2 }, { x: 26, y: 37, s: 2.5 }, { x: 30, y: 35, s: 1.9 },
  { x: 15, y: 39, s: 2.1 }, { x: 19, y: 42, s: 2.2 }, { x: 24, y: 41, s: 2.4 },
  { x: 28, y: 40, s: 2.1 }, { x: 32, y: 37, s: 1.8 }, { x: 24, y: 25, s: 2.2 },
  { x: 77, y: 31, s: 1.7 }, { x: 82, y: 34, s: 1.8 }, { x: 76, y: 52, s: 1.6 },
  { x: 43, y: 73, s: 1.7 }, { x: 57, y: 75, s: 1.5 },
];

const hillMarkers = [
  { x: 73, y: 28, s: 2.7 }, { x: 80, y: 27, s: 2.2 }, { x: 87, y: 31, s: 2.4 },
  { x: 72, y: 55, s: 2.5 }, { x: 82, y: 57, s: 2.1 }, { x: 39, y: 66, s: 2.2 },
  { x: 60, y: 68, s: 2.3 }, { x: 69, y: 72, s: 1.9 }, { x: 12, y: 55, s: 2.1 },
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
  const [detailOpen, setDetailOpen] = useState(() => window.innerWidth > 760);
  const selectedDefinition = getKingdomDefinition(selectedKingdom);
  const selectedState = state.kingdoms[selectedKingdom];
  const selectedScore = calculateKingdomScore(state, selectedKingdom);
  const production = productionForKingdom(selectedState, Math.max(1, round));
  const currentTax = round > 0 ? selectedState.taxHistory[round] : undefined;

  return (
    <>
      <div className="interactive-map" aria-label="İnteraktif krallık haritası">
      <svg className="map-terrain" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="river" x1="0" x2="1">
            <stop offset="0" stopColor="rgba(91, 123, 122, 0.48)" />
            <stop offset="1" stopColor="rgba(91, 123, 122, 0.16)" />
          </linearGradient>
          <filter id="terrain-rough" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" seed="11" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.6" />
          </filter>
        </defs>
        <path className="map-terrain-shade" d="M 5 58 C 19 43, 34 42, 47 47 C 61 53, 72 49, 95 32 L 105 105 L -5 105 Z" />
        <path className="map-sea" d="M -5 91 C 20 83, 40 96, 64 88 C 79 83, 91 88, 105 80 L 105 105 L -5 105 Z" />
        <path className="map-highland" filter="url(#terrain-rough)" d="M 37 38 C 44 25, 58 22, 67 29 C 72 35, 67 44, 56 47 C 46 50, 36 47, 37 38 Z" />
        <path className="map-forest-mass" filter="url(#terrain-rough)" d="M 9 34 C 15 24, 29 24, 36 34 C 39 43, 28 48, 17 45 C 9 43, 6 39, 9 34 Z" />
        <g className="map-fields" aria-hidden="true">
          <path d="M 39 7 L 58 10 M 38 10 L 59 13 M 39 13 L 58 16 M 43 5 L 42 17 M 49 6 L 48 18 M 55 8 L 54 18" />
        </g>
        <path className="map-contour" d="M 35 53 C 45 48, 59 49, 70 54" />
        <path className="map-contour" d="M 40 59 C 51 55, 62 56, 74 61" />
        <path className="map-contour" d="M 8 49 C 17 45, 28 46, 36 51" />
        <path className="map-contour" d="M 58 18 C 67 15, 78 16, 87 20" />
        <path className="map-river" d="M -4 70 C 20 58, 22 39, 45 39 C 68 39, 69 23, 104 12" />
        <path className="map-coast" d="M -4 91 C 20 83, 40 96, 64 88 C 79 83, 91 88, 104 80" />
        <g className="map-waves" aria-hidden="true">
          <path d="M 16 94 Q 19 92 22 94 M 35 96 Q 38 94 41 96 M 70 92 Q 73 90 76 92 M 86 94 Q 89 92 92 94" />
        </g>
        <g className="map-mountain-range" aria-hidden="true">
          {mountainMarkers.map((marker) => (
            <g key={`${marker.x}-${marker.y}`}>
              <path
                className="mountain-body"
                d={`M ${marker.x - marker.s * 0.58} ${marker.y + marker.s * 0.38} L ${marker.x - marker.s * 0.25} ${marker.y - marker.s * 0.02} L ${marker.x} ${marker.y - marker.s * 0.52} L ${marker.x + marker.s * 0.24} ${marker.y - marker.s * 0.02} L ${marker.x + marker.s * 0.58} ${marker.y + marker.s * 0.38} Z`}
              />
              <path
                className="mountain-ridge"
                d={`M ${marker.x} ${marker.y - marker.s * 0.52} L ${marker.x - marker.s * 0.08} ${marker.y - marker.s * 0.18} M ${marker.x} ${marker.y - marker.s * 0.52} L ${marker.x + marker.s * 0.1} ${marker.y - marker.s * 0.13}`}
              />
              <path
                className="mountain-shadow"
                d={`M ${marker.x - marker.s * 0.46} ${marker.y + marker.s * 0.3} C ${marker.x - marker.s * 0.12} ${marker.y + marker.s * 0.48}, ${marker.x + marker.s * 0.2} ${marker.y + marker.s * 0.48}, ${marker.x + marker.s * 0.5} ${marker.y + marker.s * 0.3}`}
              />
            </g>
          ))}
        </g>
        <g className="map-tree-clusters" aria-hidden="true">
          {forestMarkers.map((marker) => (
            <g key={`${marker.x}-${marker.y}`}>
              <path
                className="tree-crown"
                d={`M ${marker.x} ${marker.y - marker.s * 0.55} L ${marker.x - marker.s * 0.43} ${marker.y + marker.s * 0.2} L ${marker.x + marker.s * 0.43} ${marker.y + marker.s * 0.2} Z`}
              />
              <path
                className="tree-trunk"
                d={`M ${marker.x - marker.s * 0.07} ${marker.y + marker.s * 0.16} L ${marker.x + marker.s * 0.07} ${marker.y + marker.s * 0.16} L ${marker.x + marker.s * 0.07} ${marker.y + marker.s * 0.43} L ${marker.x - marker.s * 0.07} ${marker.y + marker.s * 0.43} Z`}
              />
            </g>
          ))}
        </g>
        <g className="map-hills" aria-hidden="true">
          {hillMarkers.map((marker) => (
            <g key={`${marker.x}-${marker.y}`}>
              <path
                className="hill-body"
                d={`M ${marker.x - marker.s} ${marker.y + marker.s * 0.28} Q ${marker.x} ${marker.y - marker.s * 0.58} ${marker.x + marker.s} ${marker.y + marker.s * 0.28} Z`}
              />
              <path
                className="hill-hatch"
                d={`M ${marker.x - marker.s * 0.45} ${marker.y + marker.s * 0.08} Q ${marker.x} ${marker.y - marker.s * 0.24} ${marker.x + marker.s * 0.45} ${marker.y + marker.s * 0.08}`}
              />
            </g>
          ))}
        </g>
        {roads.map(([from, to], index) => (
          <path
            key={`${from}-${to}`}
            className="map-road"
            d={roadPath(from, to, index)}
          />
        ))}
      </svg>

      <div className="map-landmark landmark-harbor" style={{ left: '72%', top: '88%' }} />
      <div className="map-compass" aria-hidden="true"><span /></div>
      <span className="map-region-label label-north" aria-hidden="true">Kuzey tarlaları</span>
      <span className="map-region-label label-west" aria-hidden="true">Batı ormanları</span>
      <span className="map-region-label label-east" aria-hidden="true">Doğu madenleri</span>
      <span className="map-region-label label-south" aria-hidden="true">Güney liman yolu</span>

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
            onClick={() => {
              onSelect(kingdomId);
              setDetailOpen(true);
            }}
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

      </div>

      {detailOpen ? (
        <aside className="map-detail" style={{ '--kingdom-color': selectedDefinition.color } as CSSProperties}>
          <button className="map-detail-close" type="button" onClick={() => setDetailOpen(false)} aria-label="Krallık kaydını kapat">
            ×
          </button>
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
      ) : (
        <button
          className="map-detail-open"
          type="button"
          style={{ '--kingdom-color': selectedDefinition.color } as CSSProperties}
          onClick={() => setDetailOpen(true)}
        >
          {selectedDefinition.name} kaydı
        </button>
      )}
    </>
  );
}
