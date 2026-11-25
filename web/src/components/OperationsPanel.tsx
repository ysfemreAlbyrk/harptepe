import { useEffect, useState, type FormEvent } from 'react';
import {
  BUILDINGS,
  KINGDOMS,
  PRIVILEGE_CARDS,
  RESOURCE_LABELS,
  SECRET_OBJECTIVES,
  STARTING_PACKAGES,
  TAX_RULES,
} from '../data/gameData';
import type { GameDispatch } from '../state/useGameState';
import type { GameState, KingdomId, ResourceKey, Resources, TaxLevel } from '../types';
import { canAfford, formatResourceBundle, RESOURCE_KEYS } from '../utils/gameMath';
import { emptyBundle, ResourceBundleInput, type BundleState } from './ResourceBundleInput';

interface OperationsPanelProps {
  state: GameState;
  dispatch: GameDispatch;
  round: number;
  selectedKingdom: KingdomId;
}

const packageDescription = (packageId: string) => {
  const definition = STARTING_PACKAGES.find((item) => item.id === packageId);
  return definition
    ? `${formatResourceBundle(definition.resources)}${definition.military ? ` · +${definition.military} asker` : ''}`
    : '';
};

export function KingdomSelect({
  value,
  onChange,
  label,
}: {
  value: KingdomId;
  onChange: (value: KingdomId) => void;
  label: string;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value as KingdomId)}>
        {KINGDOMS.map((kingdom) => (
          <option key={kingdom.id} value={kingdom.id}>
            {kingdom.name}
          </option>
        ))}
      </select>
    </label>
  );
}

export function OperationsPanel({ state, dispatch, round, selectedKingdom }: OperationsPanelProps) {
  const activeRound = Math.max(1, round);
  const [from, setFrom] = useState<KingdomId>(selectedKingdom);
  const [to, setTo] = useState<KingdomId>('south');
  const [bundle, setBundle] = useState<BundleState>(emptyBundle);
  const [transferReason, setTransferReason] = useState('Ticaret');

  const [buildingKingdom, setBuildingKingdom] = useState<KingdomId>(selectedKingdom);
  const [buildingId, setBuildingId] = useState(BUILDINGS[0].id);
  const [discountResource, setDiscountResource] = useState<ResourceKey | ''>('');

  const [adjustKingdom, setAdjustKingdom] = useState<KingdomId>(selectedKingdom);
  const [adjustResource, setAdjustResource] = useState<ResourceKey>('gold');
  const [adjustAmount, setAdjustAmount] = useState(1);
  const [adjustReason, setAdjustReason] = useState('');

  const [prestigeKingdom, setPrestigeKingdom] = useState<KingdomId>(selectedKingdom);
  const [prestigeAmount, setPrestigeAmount] = useState(1);
  const [prestigeReason, setPrestigeReason] = useState('');

  useEffect(() => {
    setFrom(selectedKingdom);
    setBuildingKingdom(selectedKingdom);
    setAdjustKingdom(selectedKingdom);
    setPrestigeKingdom(selectedKingdom);
  }, [selectedKingdom]);

  const selectedBuilding = BUILDINGS.find((building) => building.id === buildingId) ?? BUILDINGS[0];
  const selectedBuildingKingdom = state.kingdoms[buildingKingdom];
  const discountableResources = RESOURCE_KEYS.filter((key) => (selectedBuilding.cost[key] ?? 0) > 0);
  const architectDiscountUsed = (selectedBuildingKingdom.architectDiscountRounds ?? []).includes(activeRound);
  const architectDiscountAvailable =
    selectedBuildingKingdom.privilegeCardId === 'architectsGuild' && !architectDiscountUsed;
  const selectedDiscount =
    architectDiscountAvailable && discountResource && discountableResources.includes(discountResource)
      ? discountResource
      : undefined;
  const effectiveBuildingCost: Partial<Resources> = { ...selectedBuilding.cost };
  if (selectedDiscount) {
    effectiveBuildingCost[selectedDiscount] = (effectiveBuildingCost[selectedDiscount] ?? 0) - 1;
  }
  const productionApplied = state.productionAppliedRounds.includes(activeRound);
  const upkeepCharged = state.upkeepChargedRounds.includes(activeRound);
  const transferTotal = RESOURCE_KEYS.reduce((sum, key) => sum + bundle[key], 0);

  function submitTransfer(event: FormEvent) {
    event.preventDefault();
    const payload: Partial<Resources> = {};
    RESOURCE_KEYS.forEach((key) => {
      if (bundle[key] > 0) payload[key] = bundle[key];
    });
    dispatch({ type: 'transferResources', from, to, bundle: payload, reason: transferReason });
    setBundle(emptyBundle);
  }

  function submitAdjustment(event: FormEvent) {
    event.preventDefault();
    dispatch({
      type: 'adjustResource',
      kingdomId: adjustKingdom,
      resource: adjustResource,
      amount: adjustAmount,
      reason: adjustReason,
    });
    setAdjustReason('');
  }

  function submitPrestige(event: FormEvent) {
    event.preventDefault();
    dispatch({ type: 'adjustPrestige', kingdomId: prestigeKingdom, amount: prestigeAmount, reason: prestigeReason });
    setPrestigeReason('');
  }

  return (
    <div className="panel-stack">
      <section className="control-section">
        <div className="section-heading">
          <p className="eyebrow">Tur operasyonu</p>
          <h3>{activeRound}. tur komutları</h3>
        </div>
        <div className="round-actions">
          <button type="button" className="primary-button" onClick={() => dispatch({ type: 'unlockChests', round: activeRound })}>
            Sandıkları aç
          </button>
          <button
            type="button"
            className="ghost-button"
            disabled={productionApplied}
            onClick={() => dispatch({ type: 'applyProduction', round: activeRound })}
          >
            {productionApplied ? 'Üretim alındı' : 'Üretimi dağıt'}
          </button>
          <button
            type="button"
            className="ghost-button"
            disabled={upkeepCharged}
            onClick={() => dispatch({ type: 'chargeUpkeep', round: activeRound })}
          >
            {upkeepCharged ? 'Bakım alındı' : `Gıda bakımı al (${activeRound === 2 ? 3 : 2})`}
          </button>
        </div>
      </section>

      <section className="control-section">
        <div className="section-heading">
          <p className="eyebrow">Kurulum</p>
          <h3>Draft sonuçları</h3>
        </div>
        <div className="draft-grid">
          {KINGDOMS.map((definition) => {
            const kingdom = state.kingdoms[definition.id];
            return (
              <div className="draft-row" key={definition.id}>
                <span>{definition.name}</span>
                <select
                  aria-label={`${definition.name} ayrıcalık kartı`}
                  value={kingdom.privilegeCardId ?? ''}
                  onChange={(event) =>
                    dispatch({
                      type: 'setPrivilegeCard',
                      kingdomId: definition.id,
                      privilegeCardId: event.target.value || null,
                    })
                  }
                >
                  <option value="">Ayrıcalık yok</option>
                  {PRIVILEGE_CARDS.map((privilege) => (
                    <option key={privilege.id} value={privilege.id} title={privilege.effect}>
                      {privilege.name}
                    </option>
                  ))}
                </select>
                <select
                  aria-label={`${definition.name} başlangıç paketi`}
                  value={kingdom.startingPackageId ?? ''}
                  onChange={(event) =>
                    dispatch({
                      type: 'setStartingPackage',
                      kingdomId: definition.id,
                      packageId: event.target.value || null,
                    })
                  }
                >
                  <option value="">Paket yok</option>
                  {STARTING_PACKAGES.map((startingPackage) => (
                    <option key={startingPackage.id} value={startingPackage.id} title={packageDescription(startingPackage.id)}>
                      {startingPackage.name}
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>
        <div className="setup-subsection">
          <h4>Gizli hedefler</h4>
          <div className="tax-grid">
            {KINGDOMS.map((definition) => {
              const kingdom = state.kingdoms[definition.id];
              return (
                <div className="tax-row privilege-row" key={definition.id}>
                  <span>{definition.name}</span>
                  <select
                    value={kingdom.secretObjectiveId}
                    onChange={(event) =>
                      dispatch({ type: 'setSecretObjective', kingdomId: definition.id, objectiveId: event.target.value })
                    }
                  >
                    {SECRET_OBJECTIVES.map((objective) => (
                      <option key={objective.id} value={objective.id}>
                        {objective.name}
                      </option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="control-section">
        <div className="section-heading">
          <p className="eyebrow">Vergi</p>
          <h3>Tur vergisi seçimi</h3>
        </div>
        <div className="tax-grid">
          {KINGDOMS.map((definition) => {
            const kingdom = state.kingdoms[definition.id];
            const selected = kingdom.taxHistory[activeRound];
            return (
              <div className="tax-row" key={definition.id}>
                <span>{definition.name}</span>
                <div>
                  {(Object.keys(TAX_RULES) as TaxLevel[]).map((tax) => (
                    <button
                      key={tax}
                      type="button"
                      className={selected === tax ? 'selected-choice' : ''}
                      disabled={Boolean(selected)}
                      onClick={() => dispatch({ type: 'setTax', kingdomId: definition.id, round: activeRound, tax })}
                    >
                      {TAX_RULES[tax].label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="control-section">
        <div className="section-heading">
          <p className="eyebrow">Kaynak hareketi</p>
          <h3>Ticaret / transfer kaydı</h3>
        </div>
        <form onSubmit={submitTransfer} className="form-grid">
          <KingdomSelect label="Gönderen" value={from} onChange={setFrom} />
          <KingdomSelect label="Alan" value={to} onChange={setTo} />
          <label className="field wide">
            <span>İşlem notu</span>
            <input value={transferReason} onChange={(event) => setTransferReason(event.target.value)} />
          </label>
          <div className="wide">
            <ResourceBundleInput bundle={bundle} onChange={setBundle} />
          </div>
          <button className="primary-button wide" type="submit" disabled={from === to || transferTotal === 0}>
            Transferi uygula{transferTotal > 0 ? ` · ${formatResourceBundle(bundle)}` : ''}
          </button>
        </form>
      </section>

      <section className="control-section">
        <div className="section-heading">
          <p className="eyebrow">Yapı</p>
          <h3>Yapı satın al</h3>
        </div>
        <div className="form-grid">
          <KingdomSelect label="Krallık" value={buildingKingdom} onChange={setBuildingKingdom} />
          <label className="field">
            <span>Yapı</span>
            <select value={buildingId} onChange={(event) => setBuildingId(event.target.value)}>
              {BUILDINGS.map((building) => (
                <option key={building.id} value={building.id}>
                  {building.name} · {building.prestige} PP
                </option>
              ))}
            </select>
          </label>
          {selectedBuildingKingdom.privilegeCardId === 'architectsGuild' ? (
            <label className="field wide">
              <span>Mimarlar Loncası indirimi</span>
              <select
                value={discountResource}
                disabled={!architectDiscountAvailable}
                onChange={(event) => setDiscountResource(event.target.value as ResourceKey | '')}
              >
                <option value="">Bu yapıda kullanma</option>
                {discountableResources.map((key) => (
                  <option key={key} value={key}>
                    -1 {RESOURCE_LABELS[key]}
                  </option>
                ))}
              </select>
              <small className="muted">
                {architectDiscountUsed ? 'Bu tur indirim kullanıldı.' : 'Tur başına bir yapıda 1 kaynak kartı düşer.'}
              </small>
            </label>
          ) : null}
          <div className="building-preview wide">
            <strong>{selectedBuilding.name}</strong>
            <span>{selectedBuilding.effect}</span>
            <small>
              Maliyet: {formatResourceBundle(effectiveBuildingCost)}
              {selectedDiscount ? ` · Mimar indirimi: -1 ${RESOURCE_LABELS[selectedDiscount]}` : ''}
            </small>
          </div>
          <button
            className="primary-button wide"
            type="button"
            disabled={!canAfford(selectedBuildingKingdom.resources, effectiveBuildingCost)}
            onClick={() => {
              dispatch({
                type: 'buyBuilding',
                kingdomId: buildingKingdom,
                buildingId,
                round: activeRound,
                discountResource: selectedDiscount,
              });
              setDiscountResource('');
            }}
          >
            Yapıyı inşa et
          </button>
        </div>
      </section>

      <section className="control-section two-column-section">
        <div>
          <div className="section-heading">
            <p className="eyebrow">Kaynak düzeltme</p>
            <h3>Manuel kaynak</h3>
          </div>
          <form onSubmit={submitAdjustment} className="compact-form">
            <KingdomSelect label="Krallık" value={adjustKingdom} onChange={setAdjustKingdom} />
            <label className="field">
              <span>Kaynak</span>
              <select value={adjustResource} onChange={(event) => setAdjustResource(event.target.value as ResourceKey)}>
                {RESOURCE_KEYS.map((key) => (
                  <option key={key} value={key}>
                    {RESOURCE_LABELS[key]}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Miktar (+/-)</span>
              <input type="number" value={adjustAmount} onChange={(event) => setAdjustAmount(Number(event.target.value))} />
            </label>
            <label className="field">
              <span>Neden</span>
              <input value={adjustReason} onChange={(event) => setAdjustReason(event.target.value)} placeholder="Örn. moderatör düzeltmesi" />
            </label>
            <button className="ghost-button" type="submit">
              Kaynağı düzenle
            </button>
          </form>
        </div>

        <div>
          <div className="section-heading">
            <p className="eyebrow">Prestij düzeltme</p>
            <h3>Manuel PP</h3>
          </div>
          <form onSubmit={submitPrestige} className="compact-form">
            <KingdomSelect label="Krallık" value={prestigeKingdom} onChange={setPrestigeKingdom} />
            <label className="field">
              <span>PP (+/-)</span>
              <input type="number" value={prestigeAmount} onChange={(event) => setPrestigeAmount(Number(event.target.value))} />
            </label>
            <label className="field">
              <span>Neden</span>
              <input value={prestigeReason} onChange={(event) => setPrestigeReason(event.target.value)} placeholder="Örn. görev ödülü" />
            </label>
            <button className="ghost-button" type="submit">
              PP düzenle
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
