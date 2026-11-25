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
    <header className="hero-panel">
      <div className="hero-brand">
        <div className="sigil" aria-hidden="true">
          <span />
        </div>
        <div>
          <p className="eyebrow">Harptepe canlı oyun sistemi</p>
          <h1>Krallık Simülasyonu</h1>
          <p className="hero-subtitle">Ekonomi, diplomasi ve entrika için moderatör komuta ekranı</p>
        </div>
      </div>

      <div className="time-console">
        <div className="phase-row">
          <span className="phase-chip">{phase.label}</span>
          {phase.round ? <span className="round-chip">Tur {phase.round}</span> : null}
        </div>
        <div className="clock" aria-label="Oyun saati">
          {formatGameClock(state.elapsedSeconds)}
        </div>
        <div className="phase-progress" aria-hidden="true">
          <span style={{ width: `${progress * 100}%` }} />
        </div>
        <p className="phase-description">{phase.description}</p>
        <div className="timer-actions">
          <button className="primary-button" type="button" onClick={() => dispatch({ type: 'toggleTimer' })}>
            {state.timerRunning ? 'Duraklat' : 'Başlat'}
          </button>
          {upcoming ? (
            <button
              className="ghost-button"
              type="button"
              onClick={() => dispatch({ type: 'skipToMinute', minute: upcoming.startMinute })}
            >
              Sonraki faza geç
            </button>
          ) : null}
          <button
            className="ghost-button danger-outline"
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
      </div>

      <div className="hero-side">
        <button className="projection-button" type="button" onClick={onToggleProjection}>
          {projectionMode ? 'Yönetim görünümü' : 'Projeksiyon görünümü'}
        </button>
        <div className="minute-jumps" aria-label="Hızlı zaman seçimi">
          {[43, 65, 87, 107].map((minute) => (
            <button key={minute} type="button" onClick={() => dispatch({ type: 'skipToMinute', minute })}>
              {minute}. dk
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
