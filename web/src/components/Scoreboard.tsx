import { SECRET_OBJECTIVES } from '../data/gameData';
import type { GameState } from '../types';
import {
  calculateKingdomScore,
  completedSecretObjective,
  crownWinners,
  getKingdomDefinition,
  resourceValue,
  sortedKingdomIds,
} from '../utils/gameMath';

interface ScoreboardProps {
  state: GameState;
  revealSecrets?: boolean;
  expandFirst?: boolean;
}

export function Scoreboard({ state, revealSecrets = false, expandFirst = true }: ScoreboardProps) {
  const ranking = sortedKingdomIds(state);
  const leaders = crownWinners(state);

  return (
    <div className="scoreboard-panel">
      <div className="section-heading split-heading">
        <div>
          <p className="eyebrow">Prestij tablosu</p>
          <h3>Canlı sıralama</h3>
        </div>
        {leaders.length > 0 ? (
          <span className="count-pill">Taç lideri: {leaders.map((id) => getKingdomDefinition(id).name).join(', ')}</span>
        ) : (
          <span className="count-pill">Taç oyu bekleniyor</span>
        )}
      </div>

      <div className="score-list">
        {ranking.map((kingdomId, index) => {
          const definition = getKingdomDefinition(kingdomId);
          const kingdom = state.kingdoms[kingdomId];
          const score = calculateKingdomScore(state, kingdomId);
          const objective = SECRET_OBJECTIVES.find((item) => item.id === kingdom.secretObjectiveId);
          const objectiveDone = completedSecretObjective(state, kingdomId);

          return (
            <details className="score-row" key={kingdomId} open={expandFirst && index === 0}>
              <summary>
                <span className="rank-number">{index + 1}</span>
                <span className="score-kingdom">
                  <i style={{ background: definition.color }} />
                  {definition.name}
                </span>
                <span className="score-resources">Kaynak değeri {resourceValue(kingdom.resources)}</span>
                <strong>{score.total} PP</strong>
              </summary>
              <div className="score-breakdown">
                {score.lines.length === 0 ? (
                  <span>Henüz puan bileşeni yok.</span>
                ) : (
                  score.lines.map((line) => (
                    <span key={line.label} className={line.points < 0 ? 'negative-line' : ''}>
                      {line.label}: {line.points > 0 ? '+' : ''}{line.points}
                    </span>
                  ))
                )}
                {revealSecrets && objective ? (
                  <span className={objectiveDone ? 'objective-complete' : 'objective-hidden'}>
                    Gizli hedef: {objective.name} · {objectiveDone ? 'tamamlandı' : 'tamamlanmadı'}
                  </span>
                ) : null}
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}
