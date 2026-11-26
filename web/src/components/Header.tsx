import type { GameDispatch } from '../state/useGameState';
import type { GamePhase, GameState } from '../types';
import { formatGameClock } from '../utils/gameMath';
import { getPhaseProgress, nextPhase } from '../utils/gameFlow';

interface HeaderProps {
  state: GameState;
  phase: GamePhase;
  dispatch: GameDispatch;
  projectionMode: boolean;
  onToggleProjection: () => void;
}

export function Header({ state, phase, dispatch, projectionMode, onToggleProjection }: HeaderProps) {
  const progress = getPhaseProgress(state.elapsedSeconds);
  const upcoming = nextPhase(state.elapsedSeconds);

  return (
    <header className="war-hud">
      <div className="hud-faction-plate">
        <div className="sigil" aria-hidden="true">
          <span />
        </div>
        <div className="hud-title-block">
          <span className="hud-kicker">Harptepe sefer kaydı</span>
          <h1>Krallık Simülasyonu</h1>
          <p>{projectionMode ? 'Salon için canlı sefer haritası' : 'Moderatör savaş meclisi'}</p>
        </div>
      </div>

      <div className={`hud-time-command ${projectionMode ? 'projection-timing' : ''}`}>
        <div className="phase-plaque">
          <span>Faza</span>
          <strong>{phase.label}</strong>
          {phase.round ? <em>{phase.round}. tur</em> : <em>Hazırlık</em>}
        </div>

        <div className="clock-plaque" aria-label="Oyun saati">
          <span>Sefer saati</span>
          <strong className="clock">{formatGameClock(state.elapsedSeconds)}</strong>
          <div className="phase-progress" aria-hidden="true">
            <span style={{ width: `${progress * 100}%` }} />
          </div>
          <p className="phase-description">{phase.description}</p>
        </div>

        {!projectionMode ? (
          <div className="command-actions" aria-label="Zaman komutları">
            <button className="primary-button" type="button" onClick={() => dispatch({ type: 'toggleTimer' })}>
              {state.timerRunning ? 'Duraklat' : 'Başlat'}
            </button>
            {upcoming ? (
              <button
                className="ghost-button"
                type="button"
                onClick={() => dispatch({ type: 'skipToMinute', minute: upcoming.startMinute })}
              >
                Sonraki faz
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      {projectionMode ? (
        <div className="hud-side-console projection-live-console">
          <button className="projection-button" type="button" onClick={onToggleProjection}>Yönetim</button>
          <span className="projection-live-note">Yayın görünümü</span>
        </div>
      ) : (
        <div className="hud-side-console">
          <button className="projection-button" type="button" onClick={onToggleProjection}>Projeksiyon</button>
          <div className="minute-jumps" aria-label="Hızlı zaman seçimi">
            {[43, 65, 87, 107].map((minute) => (
              <button key={minute} type="button" onClick={() => dispatch({ type: 'skipToMinute', minute })}>
                {minute}. dk
              </button>
            ))}
          </div>
          <button
            className="ghost-button danger-outline reset-button"
            type="button"
            onClick={() => {
              if (window.confirm('Tüm oyun verisi sıfırlanacak. Emin misiniz?')) {
                dispatch({ type: 'resetGame' });
              }
            }}
          >
            Sıfırla
          </button>
        </div>
      )}
    </header>
  );
}
