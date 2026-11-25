import type { GameDispatch } from '../state/useGameState';
import type { GameState } from '../types';
import { formatClock } from '../utils/gameMath';

interface ActivityLogProps {
  state: GameState;
  dispatch: GameDispatch;
}

export function ActivityLog({ state, dispatch }: ActivityLogProps) {
  return (
    <section className="activity-log">
      <div className="section-heading split-heading">
        <div>
          <p className="eyebrow">Oyun kaydı</p>
          <h3>Son işlemler</h3>
        </div>
        <button className="ghost-button small-button" type="button" onClick={() => dispatch({ type: 'clearLog' })}>
          Temizle
        </button>
      </div>
      <div className="log-list">
        {state.log.length === 0 ? (
          <p className="empty-state">Kayıt yok.</p>
        ) : (
          state.log.slice(0, 18).map((entry) => (
            <div className={`log-entry log-${entry.type}`} key={entry.id}>
              <time>{formatClock(entry.at)}</time>
              <p>{entry.message}</p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
