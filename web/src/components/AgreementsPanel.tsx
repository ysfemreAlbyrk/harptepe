import { useEffect, useState, type FormEvent } from 'react';
import { KINGDOMS } from '../data/gameData';
import type { GameDispatch } from '../state/useGameState';
import type { AgreementStatus, AgreementType, GameState, KingdomId } from '../types';
import { formatClock, getKingdomDefinition } from '../utils/gameMath';
import { CollapsibleSections } from './CollapsibleSections';

interface AgreementsPanelProps {
  state: GameState;
  dispatch: GameDispatch;
  round: number;
  selectedKingdom: KingdomId;
}

const agreementLabels: Record<AgreementType, string> = {
  nonAggression: 'Saldırmazlık paktı',
  alliance: 'İttifak',
  debt: 'Borç',
  trade: 'Vadeli ticaret',
  sharedMonument: 'Ortak Anıt',
};

const statusLabels: Record<AgreementStatus, string> = {
  active: 'Aktif',
  completed: 'Tamamlandı',
  broken: 'Bozuldu',
};

export function AgreementsPanel({ state, dispatch, round, selectedKingdom }: AgreementsPanelProps) {
  const [agreementType, setAgreementType] = useState<AgreementType>('alliance');
  const [firstParty, setFirstParty] = useState<KingdomId>(selectedKingdom);
  const [secondParty, setSecondParty] = useState<KingdomId>('south');
  const [terms, setTerms] = useState('');
  const [breakers, setBreakers] = useState<Record<number, KingdomId>>({});

  useEffect(() => {
    setFirstParty(selectedKingdom);
  }, [selectedKingdom]);

  function submitAgreement(event: FormEvent) {
    event.preventDefault();
    dispatch({
      type: 'createAgreement',
      agreementType,
      parties: [firstParty, secondParty],
      terms,
      round: Math.max(1, round),
    });
    setTerms('');
  }

  return (
    <CollapsibleSections className="panel-stack">
      <section className="control-section">
        <div className="section-heading">
          <p className="eyebrow">Tescil Masası</p>
          <h3>Yeni anlaşma</h3>
        </div>
        <form className="form-grid" onSubmit={submitAgreement}>
          <label className="field">
            <span>Anlaşma türü</span>
            <select value={agreementType} onChange={(event) => setAgreementType(event.target.value as AgreementType)}>
              {(Object.keys(agreementLabels) as AgreementType[]).map((type) => (
                <option key={type} value={type}>
                  {agreementLabels[type]}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Birinci taraf</span>
            <select value={firstParty} onChange={(event) => setFirstParty(event.target.value as KingdomId)}>
              {KINGDOMS.map((kingdom) => (
                <option key={kingdom.id} value={kingdom.id}>
                  {kingdom.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>İkinci taraf</span>
            <select value={secondParty} onChange={(event) => setSecondParty(event.target.value as KingdomId)}>
              {KINGDOMS.map((kingdom) => (
                <option key={kingdom.id} value={kingdom.id}>
                  {kingdom.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field wide">
            <span>Şartlar</span>
            <textarea
              value={terms}
              onChange={(event) => setTerms(event.target.value)}
              placeholder="Örn. 3 tur boyunca saldırmazlık; 2. turda 4 Odun karşılığı 8 Altın"
            />
          </label>
          <button className="primary-button wide" type="submit" disabled={firstParty === secondParty || !terms.trim()}>
            Anlaşmayı tescille
          </button>
        </form>
      </section>

      <section className="control-section">
        <div className="section-heading split-heading">
          <div>
            <p className="eyebrow">Kayıtlar</p>
            <h3>Tescilli anlaşmalar</h3>
          </div>
          <span className="count-pill">{state.agreements.length}</span>
        </div>
        <div className="agreement-list">
          {state.agreements.length === 0 ? (
            <p className="empty-state">Henüz tescilli anlaşma yok.</p>
          ) : (
            state.agreements.map((agreement) => (
              <article className={`agreement-card status-${agreement.status}`} key={agreement.id}>
                <div className="agreement-main">
                  <span className="agreement-type">{agreementLabels[agreement.type]}</span>
                  <h4>
                    {agreement.parties.map((party) => getKingdomDefinition(party).name).join(' × ')}
                  </h4>
                  <p>{agreement.terms}</p>
                  <small>
                    Tur {agreement.round} · {formatClock(agreement.createdAt)} · {statusLabels[agreement.status]}
                  </small>
                </div>
                <div className="agreement-actions">
                  {(['active', 'completed'] as AgreementStatus[]).map((status) => (
                    <button
                      key={status}
                      type="button"
                      className={agreement.status === status ? 'selected-choice' : ''}
                      onClick={() => dispatch({ type: 'setAgreementStatus', agreementId: agreement.id, status })}
                    >
                      {statusLabels[status]}
                    </button>
                  ))}
                  <select
                    aria-label="Anlaşmayı bozan taraf"
                    className="breaker-select"
                    value={breakers[agreement.id] ?? agreement.parties[0]}
                    onChange={(event) =>
                      setBreakers((current) => ({
                        ...current,
                        [agreement.id]: event.target.value as KingdomId,
                      }))
                    }
                  >
                    {agreement.parties.map((party) => (
                      <option key={party} value={party}>
                        Bozan: {getKingdomDefinition(party).name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className={agreement.status === 'broken' ? 'selected-choice' : ''}
                    onClick={() =>
                      dispatch({
                        type: 'setAgreementStatus',
                        agreementId: agreement.id,
                        status: 'broken',
                        brokenBy: breakers[agreement.id] ?? agreement.parties[0],
                      })
                    }
                  >
                    Bozuldu
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </CollapsibleSections>
  );
}
