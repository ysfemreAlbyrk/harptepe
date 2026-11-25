import { useState } from 'react';
import { ActivityLog } from './components/ActivityLog';
import { AgreementsPanel } from './components/AgreementsPanel';
import { EventsPanel } from './components/EventsPanel';
import { Header } from './components/Header';
import { KingdomCard } from './components/KingdomCard';
import { OperationsPanel } from './components/OperationsPanel';
import { Scoreboard } from './components/Scoreboard';
import { KINGDOMS, ROUND_EVENTS } from './data/gameData';
import { useGameState } from './state/useGameState';
import type { KingdomId } from './types';
import { getCurrentPhase, getOperationalRound } from './utils/gameFlow';
import { calculateKingdomScore, getKingdomDefinition, sortedKingdomIds } from './utils/gameMath';

type PanelTab = 'operations' | 'agreements' | 'events';

const tabLabels: Record<PanelTab, string> = {
  operations: 'Operasyon',
  agreements: 'Tescil',
  events: 'Keşif & Savaş',
};

export default function App() {
  const { state, dispatch } = useGameState();
  const [selectedKingdom, setSelectedKingdom] = useState<KingdomId>('north');
  const [activeTab, setActiveTab] = useState<PanelTab>('operations');
  const [projectionMode, setProjectionMode] = useState(
    () => new URLSearchParams(window.location.search).get('projection') === '1',
  );

  const phase = getCurrentPhase(state.elapsedSeconds);
  const round = phase.round ?? 0;
  const operationalRound = getOperationalRound(state.elapsedSeconds);
  const event = ROUND_EVENTS[round];
  const ranking = sortedKingdomIds(state);
  const topScore = calculateKingdomScore(state, ranking[0]).total;
  const leaders = ranking.filter((kingdomId) => calculateKingdomScore(state, kingdomId).total === topScore);
  const leaderLabel = leaders.length > 1 ? 'Beraberlik' : getKingdomDefinition(leaders[0]).name;

  return (
    <div className={`app-shell ${projectionMode ? 'projection-mode' : ''}`}>
      <Header
        state={state}
        phase={phase}
        dispatch={dispatch}
        projectionMode={projectionMode}
        onToggleProjection={() => setProjectionMode((value) => !value)}
      />

      <section className="event-banner">
        <div>
          <p className="eyebrow">Aktif olay</p>
          <h2>{event?.title ?? 'Hazırlık'}</h2>
          <p>{event?.description ?? 'Oyun başlamadan önce krallıklar ve roller hazırlanır.'}</p>
        </div>
        <div className="leader-badge">
          <span>Canlı lider</span>
          <strong>{leaderLabel}</strong>
        </div>
      </section>

      <main className="main-layout">
        <section className="board-area" aria-label="Krallık durumları">
          <div className="board-heading">
            <div>
              <p className="eyebrow">Altı krallık</p>
              <h2>Kaynak ve güç haritası</h2>
            </div>
            <p>Serbest hareket sırasında odada en fazla 3 kişi kalır.</p>
          </div>
          <div className="kingdom-grid">
            {KINGDOMS.map((kingdom) => (
              <KingdomCard
                key={kingdom.id}
                kingdomId={kingdom.id}
                state={state}
                round={operationalRound}
                selected={selectedKingdom === kingdom.id}
                onSelect={setSelectedKingdom}
              />
            ))}
          </div>
        </section>

        <aside className="control-dock" aria-label="Moderatör kontrolleri">
          {projectionMode ? (
            <Scoreboard state={state} expandFirst={false} />
          ) : (
            <>
              <nav className="panel-tabs" aria-label="Moderatör paneli">
                {(Object.keys(tabLabels) as PanelTab[]).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    className={activeTab === tab ? 'active-tab' : ''}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tabLabels[tab]}
                  </button>
                ))}
              </nav>
              {activeTab === 'operations' ? (
                <OperationsPanel state={state} dispatch={dispatch} round={operationalRound} selectedKingdom={selectedKingdom} />
              ) : null}
              {activeTab === 'agreements' ? (
                <AgreementsPanel state={state} dispatch={dispatch} round={operationalRound} selectedKingdom={selectedKingdom} />
              ) : null}
              {activeTab === 'events' ? (
                <EventsPanel state={state} dispatch={dispatch} round={operationalRound} selectedKingdom={selectedKingdom} />
              ) : null}
            </>
          )}
        </aside>

        {!projectionMode ? (
          <div className="bottom-grid">
            <Scoreboard state={state} revealSecrets />
            <ActivityLog state={state} dispatch={dispatch} />
          </div>
        ) : null}
      </main>
    </div>
  );
}
