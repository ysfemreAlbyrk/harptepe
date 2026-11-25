import { useEffect, useState, type FormEvent } from 'react';
import { KINGDOMS } from '../data/gameData';
import type { GameDispatch } from '../state/useGameState';
import type { GameState, KingdomId, Resources } from '../types';
import { formatResourceBundle, getKingdomDefinition, RESOURCE_KEYS } from '../utils/gameMath';
import { KingdomSelect } from './OperationsPanel';
import { emptyBundle, ResourceBundleInput, type BundleState } from './ResourceBundleInput';
import { CollapsibleSections } from './CollapsibleSections';

interface EventsPanelProps {
  state: GameState;
  dispatch: GameDispatch;
  round: number;
  selectedKingdom: KingdomId;
}

const chestLevelLabels = {
  small: 'Küçük',
  medium: 'Orta',
  large: 'Büyük',
} as const;

function chestRewardText(reward: Partial<Resources> & { prestige?: number; productionFood?: number }) {
  const parts = [formatResourceBundle(reward)];
  if (reward.prestige) parts.push(`${reward.prestige} PP`);
  if (reward.productionFood) parts.push(`+${reward.productionFood} Gıda/tur`);
  return parts.filter((part) => part !== 'Kaynak yok').join(' · ') || 'Ödül yok';
}

export function EventsPanel({ state, dispatch, round, selectedKingdom }: EventsPanelProps) {
  const activeRound = Math.max(1, round);
  const [claimKingdom, setClaimKingdom] = useState<KingdomId>(selectedKingdom);
  const [tournamentWinner, setTournamentWinner] = useState<KingdomId>(selectedKingdom);
  const [tournamentSecond, setTournamentSecond] = useState<KingdomId>('south');
  const [militaryKingdom, setMilitaryKingdom] = useState<KingdomId>(selectedKingdom);
  const [militaryAmount, setMilitaryAmount] = useState(1);
  const [militaryReason, setMilitaryReason] = useState('Paralı asker / düzeltme');

  const [attacker, setAttacker] = useState<KingdomId>(selectedKingdom);
  const [defender, setDefender] = useState<KingdomId>('south');
  const [attackerDice, setAttackerDice] = useState(3);
  const [defenderDice, setDefenderDice] = useState(3);
  const [duelWinner, setDuelWinner] = useState<'attacker' | 'defender' | 'none'>('none');
  const [spoils, setSpoils] = useState<BundleState>(emptyBundle);

  useEffect(() => {
    setClaimKingdom(selectedKingdom);
    setTournamentWinner(selectedKingdom);
    setMilitaryKingdom(selectedKingdom);
    setAttacker(selectedKingdom);
  }, [selectedKingdom]);

  const attackerState = state.kingdoms[attacker];
  const defenderState = state.kingdoms[defender];
  const attackerScore =
    attackerState.military + attackerDice + (duelWinner === 'attacker' ? 2 : 0);
  const defenderScore =
    defenderState.military +
    defenderDice +
    (duelWinner === 'defender' ? 2 : 0) +
    (defenderState.buildings.includes('wall') ? 2 : 0);
  const attackerProjectedWinner = attackerScore >= defenderScore;
  const spoilsTotal = RESOURCE_KEYS.reduce((sum, key) => sum + spoils[key], 0);
  const canPayWarCost = attackerState.resources.gold >= 3 && attackerState.resources.food >= 1;
  const validSpoils = !attackerProjectedWinner || spoilsTotal <= 4;
  const warOpen = activeRound >= 2;
  const attackerAlreadyAttacked = state.wars.some((war) => war.round === activeRound && war.attacker === attacker);
  const pactBlocksWar = state.agreements.some(
    (agreement) =>
      agreement.type === 'nonAggression' &&
      agreement.status === 'active' &&
      agreement.parties.includes(attacker) &&
      agreement.parties.includes(defender),
  );

  function submitTournament(event: FormEvent) {
    event.preventDefault();
    dispatch({
      type: 'recordTournament',
      round: activeRound,
      winner: tournamentWinner,
      second: tournamentSecond === tournamentWinner ? undefined : tournamentSecond,
    });
  }

  function submitMilitaryAdjustment(event: FormEvent) {
    event.preventDefault();
    dispatch({
      type: 'adjustMilitary',
      kingdomId: militaryKingdom,
      amount: militaryAmount,
      reason: militaryReason.trim() || 'Paralı asker / düzeltme',
    });
  }

  function submitWar(event: FormEvent) {
    event.preventDefault();
    const payload: Partial<Resources> = {};
    RESOURCE_KEYS.forEach((key) => {
      if (spoils[key] > 0) payload[key] = spoils[key];
    });
    dispatch({
      type: 'resolveWar',
      round: activeRound,
      attacker,
      defender,
      attackerDice,
      defenderDice,
      duelWinner,
      spoils: payload,
    });
    setSpoils(emptyBundle);
  }

  return (
    <CollapsibleSections className="panel-stack">
      <section className="control-section">
        <div className="section-heading split-heading">
          <div>
            <p className="eyebrow">Keşif Masası</p>
            <h3>Sandıklar</h3>
          </div>
          <KingdomSelect label="Ödülü alan" value={claimKingdom} onChange={setClaimKingdom} />
        </div>
        <div className="chest-grid">
          {state.chests.map((chest) => (
            <article className={`chest-card ${chest.status}`} key={chest.id}>
              <div>
                <span className={`level-pill level-${chest.level}`}>{chestLevelLabels[chest.level]}</span>
                <h4>{chest.title}</h4>
                <p>{chestRewardText(chest.reward)}</p>
                <small>Tur {chest.unlockRound} açılır</small>
              </div>
              {chest.status === 'available' ? (
                <button type="button" onClick={() => dispatch({ type: 'claimChest', chestId: chest.id, kingdomId: claimKingdom })}>
                  Ödülü ver
                </button>
              ) : (
                <span className="chest-status">
                  {chest.status === 'claimed'
                    ? `${chest.claimedBy ? getKingdomDefinition(chest.claimedBy).name : '—'} aldı`
                    : 'Kilitli'}
                </span>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="control-section">
        <div className="section-heading">
          <p className="eyebrow">Turnuva</p>
          <h3>Tur turnuvası sonucu</h3>
        </div>
        <form className="form-grid" onSubmit={submitTournament}>
          <KingdomSelect label="Birinci (+3 PP)" value={tournamentWinner} onChange={setTournamentWinner} />
          <KingdomSelect label="İkinci (+2 Altın)" value={tournamentSecond} onChange={setTournamentSecond} />
          <button
            className="primary-button wide"
            type="submit"
            disabled={state.tournamentRecordedRounds.includes(activeRound)}
          >
            {state.tournamentRecordedRounds.includes(activeRound) ? 'Turnuva kaydedildi' : 'Turnuvayı kaydet'}
          </button>
        </form>
      </section>

      <section className="control-section">
        <div className="section-heading">
          <p className="eyebrow">Ordu</p>
          <h3>Askerî güç düzeltmesi</h3>
        </div>
        <form className="form-grid" onSubmit={submitMilitaryAdjustment}>
          <KingdomSelect label="Krallık" value={militaryKingdom} onChange={setMilitaryKingdom} />
          <label className="field">
            <span>Değişim</span>
            <input
              type="number"
              min="-12"
              max="12"
              value={militaryAmount}
              onChange={(event) => setMilitaryAmount(Number(event.target.value))}
            />
          </label>
          <label className="field wide">
            <span>Gerekçe</span>
            <input value={militaryReason} onChange={(event) => setMilitaryReason(event.target.value)} />
          </label>
          <button className="primary-button wide" type="submit" disabled={!militaryAmount}>
            Gücü uygula
          </button>
        </form>
      </section>

      <section className="control-section">
        <div className="section-heading">
          <p className="eyebrow">Hakem Masası</p>
          <h3>Savaş sonucu</h3>
        </div>
        <form className="war-form" onSubmit={submitWar}>
          <div className="war-columns">
            <div className="war-side attacker-side">
              <KingdomSelect label="Saldıran" value={attacker} onChange={setAttacker} />
              <label className="field">
                <span>Zar (1–6)</span>
                <input
                  type="number"
                  min="1"
                  max="6"
                  value={attackerDice}
                  onChange={(event) => setAttackerDice(Number(event.target.value))}
                />
              </label>
              <div className="war-score">{attackerScore}</div>
            </div>
            <div className="war-versus">VS</div>
            <div className="war-side defender-side">
              <KingdomSelect label="Savunan" value={defender} onChange={setDefender} />
              <label className="field">
                <span>Zar (1–6)</span>
                <input
                  type="number"
                  min="1"
                  max="6"
                  value={defenderDice}
                  onChange={(event) => setDefenderDice(Number(event.target.value))}
                />
              </label>
              <div className="war-score">{defenderScore}</div>
            </div>
          </div>

          <label className="field">
            <span>Taş-kâğıt-makas</span>
            <select value={duelWinner} onChange={(event) => setDuelWinner(event.target.value as 'attacker' | 'defender' | 'none')}>
              <option value="none">Berabere / yok</option>
              <option value="attacker">Saldıran kazandı (+2)</option>
              <option value="defender">Savunan kazandı (+2)</option>
            </select>
          </label>

          <div className="spoils-box">
            <div className="split-heading compact">
              <strong>Ganimet dağılımı</strong>
              <span className={spoilsTotal === 4 ? 'valid-pill' : 'count-pill'}>{spoilsTotal}/4 kart</span>
            </div>
            <ResourceBundleInput bundle={spoils} onChange={setSpoils} />
            <small>
              Ön izleme: {attackerProjectedWinner ? 'saldıran kazanır ve en fazla 4 kart alır' : 'savunan kazanır ve 3 Altın alır'}.
            </small>
          </div>

          {!warOpen && <p className="inline-warning">Barış Çağında savaş kapalıdır; savaşlar 2. turdan itibaren sonuçlandırılır.</p>}
          {warOpen && attackerAlreadyAttacked && <p className="inline-warning">Bu krallık bu tur zaten saldırdı.</p>}
          {warOpen && pactBlocksWar && <p className="inline-warning">Aktif saldırmazlık paktı bu savaşı engeller. Önce anlaşma durumu güncellenmeli.</p>}
          {warOpen && !canPayWarCost && <p className="inline-warning">Savaş bedeli için saldıranın en az 3 Altın ve 1 Gıdası olmalı.</p>}

          <button
            className="primary-button danger-button"
            type="submit"
            disabled={
              attacker === defender ||
              !warOpen ||
              attackerAlreadyAttacked ||
              pactBlocksWar ||
              !canPayWarCost ||
              attackerDice < 1 ||
              attackerDice > 6 ||
              defenderDice < 1 ||
              defenderDice > 6 ||
              !validSpoils
            }
          >
            Savaşı sonuçlandır
          </button>
        </form>
      </section>

      <section className="control-section">
        <div className="section-heading">
          <p className="eyebrow">Taç oylaması</p>
          <h3>Hükümdar oyları</h3>
        </div>
        <div className="crown-grid">
          {KINGDOMS.map((kingdom) => (
            <label className="field" key={kingdom.id}>
              <span>{kingdom.name} oyu</span>
              <select
                value={state.crownVotes[kingdom.id] ?? ''}
                onChange={(event) => {
                  const target = event.target.value;
                  if (target) {
                    dispatch({ type: 'setCrownVote', voter: kingdom.id, target: target as KingdomId });
                  } else {
                    dispatch({ type: 'clearCrownVote', voter: kingdom.id });
                  }
                }}
              >
                <option value="">Oy yok</option>
                {KINGDOMS.filter((target) => target.id !== kingdom.id).map((target) => (
                  <option key={target.id} value={target.id}>
                    {target.name}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
      </section>
    </CollapsibleSections>
  );
}
