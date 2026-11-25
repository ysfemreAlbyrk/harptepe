import { useState } from 'react';
import { ActivityLog } from './components/ActivityLog';
import { AgreementsPanel } from './components/AgreementsPanel';
import { EventsPanel } from './components/EventsPanel';
import { Header } from './components/Header';
import { InteractiveMap } from './components/InteractiveMap';
import { OperationsPanel } from './components/OperationsPanel';
import { PlayerView } from './components/PlayerView';
import { PortalView } from './components/PortalView';
import { Scoreboard } from './components/Scoreboard';
import { KINGDOMS, PLAYER_ROLES, ROUND_EVENTS } from './data/gameData';
import { useGameState } from './state/useGameState';
import type { KingdomId, PlayerRoleId } from './types';
import { getCurrentPhase, getOperationalRound } from './utils/gameFlow';
import { calculateKingdomScore, getKingdomDefinition, sortedKingdomIds } from './utils/gameMath';

type PanelTab = 'operations' | 'agreements' | 'events';
type ViewMode = 'portal' | 'moderator' | 'projection' | 'player';

const tabLabels: Record<PanelTab, { title: string; seal: string; hint: string }> = {
  operations: { title: 'Hazine', seal: 'I', hint: 'üretim, vergi ve yapı' },
  agreements: { title: 'Tescil', seal: 'II', hint: 'ferman ve anlaşmalar' },
  events: { title: 'Sefer', seal: 'III', hint: 'keşif, turnuva ve savaş' },
};

function validKingdom(value: string | null): KingdomId {
  return KINGDOMS.some((kingdom) => kingdom.id === value) ? (value as KingdomId) : 'north';
}

function validRole(value: string | null): PlayerRoleId {
  return PLAYER_ROLES.some((role) => role.id === value) ? (value as PlayerRoleId) : 'monarch';
}

function initialNavigation(): { view: ViewMode; kingdom: KingdomId; role: PlayerRoleId } {
  const params = new URLSearchParams(window.location.search);
  const requested = params.get('view');
  const view: ViewMode = params.get('projection') === '1'
    ? 'projection'
    : requested === 'moderator' || requested === 'player' || requested === 'projection'
      ? requested
      : 'portal';
  return {
    view,
    kingdom: validKingdom(params.get('kingdom')),
    role: validRole(params.get('role')),
  };
}

function writeNavigation(view: ViewMode, kingdom: KingdomId, role: PlayerRoleId) {
  const url = new URL(window.location.href);
  url.search = '';
  if (view === 'projection') {
    url.searchParams.set('projection', '1');
  } else if (view !== 'portal') {
    url.searchParams.set('view', view);
  }
  if (view === 'player') {
    url.searchParams.set('kingdom', kingdom);
    url.searchParams.set('role', role);
  }
  window.history.replaceState(null, '', url);
}

export default function App() {
  const initial = useState(initialNavigation)[0];
  const [viewMode, setViewMode] = useState<ViewMode>(initial.view);
  const [playerKingdom, setPlayerKingdom] = useState<KingdomId>(initial.kingdom);
  const [playerRole, setPlayerRole] = useState<PlayerRoleId>(initial.role);
  const { state, dispatch, networkStatus } = useGameState({ publishNetwork: viewMode === 'moderator' });
  const [selectedKingdom, setSelectedKingdom] = useState<KingdomId>('north');
  const [activeTab, setActiveTab] = useState<PanelTab>('operations');

  function navigate(view: ViewMode, kingdom = playerKingdom, role = playerRole) {
    setViewMode(view);
    setPlayerKingdom(kingdom);
    setPlayerRole(role);
    writeNavigation(view, kingdom, role);
  }

  if (viewMode === 'portal') {
    return (
      <div className="app-shell portal-app">
        <PortalView
          networkStatus={networkStatus}
          onEnterModerator={() => navigate('moderator')}
          onEnterProjection={() => navigate('projection')}
          onEnterPlayer={(kingdom, role) => navigate('player', kingdom, role)}
        />
      </div>
    );
  }

  if (viewMode === 'player') {
    return (
      <div className="app-shell player-app">
        <PlayerView
          state={state}
          kingdomId={playerKingdom}
          roleId={playerRole}
          networkStatus={networkStatus}
          onChangeKingdom={(kingdom) => navigate('player', kingdom, playerRole)}
          onChangeRole={(role) => navigate('player', playerKingdom, role)}
          onExit={() => navigate('portal')}
        />
      </div>
    );
  }

  const projectionMode = viewMode === 'projection';
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
        onToggleProjection={() => navigate(projectionMode ? 'moderator' : 'projection')}
      />

      <main className="main-layout war-room-layout">
        <div className="board-column campaign-stage">
          <section className="board-area war-table" aria-label="Krallık haritası">
            <div className="board-heading map-caption">
              <div>
                <p className="eyebrow">Sefer haritası</p>
                <h2>Altı krallığın güç dengesi</h2>
              </div>
              <p>Komuta masasındaki mühürlere dokun; seçili krallık kaydı haritanın üzerinde açılır.</p>
            </div>

            <section className="event-banner campaign-notice">
              <div>
                <p className="eyebrow">Aktif olay</p>
                <h2>{event?.title ?? 'Hazırlık'}</h2>
                <p>{event?.description ?? 'Oyun başlamadan önce krallıklar ve roller hazırlanır.'}</p>
              </div>
              <div className="event-side-stack">
                <span className={`network-pill network-${networkStatus}`}>Ağ: {networkStatus}</span>
                <div className="leader-badge">
                  <span>Canlı lider</span>
                  <strong>{leaderLabel}</strong>
                </div>
              </div>
            </section>

            <div className="map-frame">
              <InteractiveMap state={state} round={operationalRound} selectedKingdom={selectedKingdom} onSelect={setSelectedKingdom} />
            </div>
          </section>

          {!projectionMode ? (
            <details className="ledger-drawer" open>
              <summary>
                <span>Meclis kayıtları</span>
                <small>Prestij tablosu ve moderatör işlem günlüğü</small>
              </summary>
              <div className="bottom-grid ledger-grid">
                <Scoreboard state={state} revealSecrets />
                <ActivityLog state={state} dispatch={dispatch} />
              </div>
            </details>
          ) : null}
        </div>

        <aside className="control-dock council-dock" aria-label="Moderatör kontrolleri">
          {projectionMode ? (
            <Scoreboard state={state} expandFirst={false} />
          ) : (
            <>
              <div className="council-dock-heading">
                <p className="eyebrow">Moderatör meclisi</p>
                <h2>Komuta masası</h2>
                <span>{getKingdomDefinition(selectedKingdom).name} seçili</span>
              </div>
              <nav className="panel-tabs council-tabs" aria-label="Moderatör paneli">
                {(Object.keys(tabLabels) as PanelTab[]).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    className={activeTab === tab ? 'active-tab' : ''}
                    onClick={() => setActiveTab(tab)}
                  >
                    <span className="tab-seal">{tabLabels[tab].seal}</span>
                    <span className="tab-copy">
                      <strong>{tabLabels[tab].title}</strong>
                      <small>{tabLabels[tab].hint}</small>
                    </span>
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
      </main>
    </div>
  );
}
