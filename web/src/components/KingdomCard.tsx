import type { CSSProperties } from 'react';
import { BUILDINGS, RESOURCE_LABELS, TAX_RULES } from '../data/gameData';
import type { GameState, KingdomId, ResourceKey } from '../types';
import { calculateKingdomScore, productionForKingdom, RESOURCE_KEYS } from '../utils/gameMath';
import { getKingdomDefinition } from '../utils/gameMath';

interface KingdomCardProps {
  kingdomId: KingdomId;
  state: GameState;
  round: number;
  selected: boolean;
  onSelect: (kingdomId: KingdomId) => void;
}

const resourceOrder: ResourceKey[] = ['food', 'wood', 'stone', 'ore', 'gold'];

export function KingdomCard({ kingdomId, state, round, selected, onSelect }: KingdomCardProps) {
  const definition = getKingdomDefinition(kingdomId);
  const kingdom = state.kingdoms[kingdomId];
  const score = calculateKingdomScore(state, kingdomId);
  const production = productionForKingdom(kingdom, Math.max(1, round));
  const currentTax = round > 0 ? kingdom.taxHistory[round] : undefined;

  return (
    <article
      className={`kingdom-card ${selected ? 'selected' : ''}`}
      style={{ '--kingdom-color': definition.color, '--kingdom-soft': definition.softColor } as CSSProperties}
      onClick={() => onSelect(kingdomId)}
    >
      <div className="kingdom-card-top">
        <div>
          <p className="kingdom-epithet">{definition.epithet}</p>
          <h2>{definition.name}</h2>
        </div>
        <div className="prestige-seal">
          <span>{score.total}</span>
          <small>PP</small>
        </div>
      </div>

      <div className="resource-grid">
        {resourceOrder.map((key) => (
          <div className={`resource-tile resource-${key}`} key={key}>
            <span>{RESOURCE_LABELS[key]}</span>
            <strong>{kingdom.resources[key]}</strong>
          </div>
        ))}
      </div>

      <div className="kingdom-metrics">
        <div>
          <span>Asker</span>
          <strong>{kingdom.military}</strong>
        </div>
        <div>
          <span>Üretim</span>
          <strong>
            {RESOURCE_KEYS.filter((key) => production[key] > 0)
              .map((key) => `+${production[key]}${RESOURCE_LABELS[key][0]}`)
              .join(' ') || '—'}
          </strong>
        </div>
        <div>
          <span>Vergi</span>
          <strong>{currentTax ? TAX_RULES[currentTax].label : '—'}</strong>
        </div>
      </div>

      <div className="building-strip">
        {kingdom.buildings.length === 0 ? (
          <span className="muted">Henüz yapı yok</span>
        ) : (
          kingdom.buildings.slice(0, 5).map((buildingId, index) => {
            const building = BUILDINGS.find((item) => item.id === buildingId);
            return <span key={`${buildingId}-${index}`}>{building?.name}</span>;
          })
        )}
        {kingdom.buildings.length > 5 ? <span>+{kingdom.buildings.length - 5}</span> : null}
      </div>

      <p className="kingdom-special">{definition.special}</p>
    </article>
  );
}
