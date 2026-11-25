import { useState } from 'react';
import { InteractiveMap } from './InteractiveMap';
import { KINGDOMS, PLAYER_ROLES, RESOURCE_LABELS, SECRET_OBJECTIVES } from '../data/gameData';
import type { GameState, KingdomId, PlayerRoleId } from '../types';
import { calculateKingdomScore, formatGameClock, getKingdomDefinition, productionForKingdom, RESOURCE_KEYS } from '../utils/gameMath';
import { getCurrentPhase, getOperationalRound } from '../utils/gameFlow';

interface PlayerViewProps {
  state: GameState;
  kingdomId: KingdomId;
  roleId: PlayerRoleId;
  networkStatus: string;
  onChangeKingdom: (kingdomId: KingdomId) => void;
  onChangeRole: (roleId: PlayerRoleId) => void;
  onExit: () => void;
}

export function PlayerView({ state, kingdomId, roleId, networkStatus, onChangeKingdom, onChangeRole, onExit }: PlayerViewProps) {
  const [previewKingdom, setPreviewKingdom] = useState<KingdomId>(kingdomId);
  const kingdom = state.kingdoms[kingdomId];
  const definition = getKingdomDefinition(kingdomId);
  const role = PLAYER_ROLES.find((item) => item.id === roleId) ?? PLAYER_ROLES[0];
  const phase = getCurrentPhase(state.elapsedSeconds);
  const round = getOperationalRound(state.elapsedSeconds);
  const score = calculateKingdomScore(state, kingdomId);
  const production = productionForKingdom(kingdom, Math.max(1, round));
  const objective = SECRET_OBJECTIVES.find((item) => item.id === kingdom.secretObjectiveId);
  const canSeeObjective = roleId === 'monarch' || roleId === 'vizier';

  return (
    <main className="player-shell">
      <section className="player-header">
        <div>
          <p className="eyebrow">Oyuncu görünümü</p>
          <h1>{definition.name} · {role.name}</h1>
          <p>{role.mission}</p>
        </div>
        <div className="player-header-actions">
          <span className="phase-chip">{phase.label}</span>
          <strong className="player-clock">{formatGameClock(state.elapsedSeconds)}</strong>
          <span className={`network-pill network-${networkStatus}`}>{networkStatus}</span>
          <button className="ghost-button" type="button" onClick={onExit}>Giriş ekranı</button>
        </div>
      </section>

      <section className="player-identity-card">
        <label>
          <span>Krallık</span>
          <select value={kingdomId} onChange={(event) => {
            const next = event.target.value as KingdomId;
            setPreviewKingdom(next);
            onChangeKingdom(next);
          }}>
            {KINGDOMS.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </label>
        <label>
          <span>Rol</span>
          <select value={roleId} onChange={(event) => onChangeRole(event.target.value as PlayerRoleId)}>
            {PLAYER_ROLES.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </label>
        <p>Bu ekran salt okunurdur. Kaynak, yapı, anlaşma veya savaş işlemi gerektiğinde moderatöre başvur.</p>
      </section>

      <div className="player-layout">
        <section className="player-map-panel">
          <div className="board-heading">
            <div>
              <p className="eyebrow">Canlı harita</p>
              <h2>Krallıkların gücü</h2>
            </div>
          </div>
          <InteractiveMap state={state} round={round} selectedKingdom={previewKingdom} onSelect={setPreviewKingdom} />
        </section>

        <aside className="player-side-panel">
          <section className="player-card kingdom-status-card">
            <p className="eyebrow">Krallık durumun</p>
            <h2>{definition.name}</h2>
            <div className="player-score-line"><span>Prestij</span><strong>{score.total} PP</strong></div>
            <div className="player-score-line"><span>Asker</span><strong>{kingdom.military}</strong></div>
            <div className="player-score-line"><span>Üretim</span><strong>{RESOURCE_KEYS.filter((key) => production[key] > 0).map((key) => `+${production[key]} ${RESOURCE_LABELS[key]}`).join(', ') || '—'}</strong></div>
            <div className="player-resource-list">
              {RESOURCE_KEYS.map((key) => (
                <div key={key} className={`resource-${key}`}>
                  <span>{RESOURCE_LABELS[key]}</span>
                  <strong>{kingdom.resources[key]}</strong>
                </div>
              ))}
            </div>
            {canSeeObjective && objective ? (
              <div className="secret-objective-box">
                <span>Gizli hedef</span>
                <strong>{objective.name}</strong>
                <p>{objective.description}</p>
              </div>
            ) : (
              <p className="muted-note">Gizli hedef bilgisi Hükümdar ve Vezir görünümünde gösterilir.</p>
            )}
          </section>

          <section className="player-card role-guide-card">
            <p className="eyebrow">Rol rehberin</p>
            <h2>{role.name}</h2>
            <h3>Sorumlulukların</h3>
            <ul>{role.responsibilities.map((item) => <li key={item}>{item}</li>)}</ul>
            <h3>İpuçları</h3>
            <ul>{role.tips.map((item) => <li key={item}>{item}</li>)}</ul>
          </section>
        </aside>
      </div>
    </main>
  );
}
