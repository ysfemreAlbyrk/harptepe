import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { BUILDINGS, RESOURCE_SHORT_LABELS, TAX_RULES } from '../data/gameData';
import type { GameState, KingdomId, ResourceKey } from '../types';
import { calculateKingdomScore, getKingdomDefinition, productionForKingdom, RESOURCE_KEYS } from '../utils/gameMath';
import type { KingdomMapBridge, KingdomMapScene } from '../phaser/KingdomMapScene';

interface InteractiveMapProps {
  state: GameState;
  round: number;
  selectedKingdom: KingdomId;
  onSelect: (kingdomId: KingdomId) => void;
  detailInitiallyOpen?: boolean;
}

export function InteractiveMap({ state, round, selectedKingdom, onSelect, detailInitiallyOpen }: InteractiveMapProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [detailOpen, setDetailOpen] = useState(() => detailInitiallyOpen ?? window.innerWidth > 760);
  const [dragging, setDragging] = useState(false);
  const [engineReady, setEngineReady] = useState(false);
  const bridgeRef = useRef<KingdomMapBridge>({
    state,
    round,
    selectedKingdom,
    onSelect,
    onDraggingChange: setDragging,
    onReady: () => setEngineReady(true),
  });

  const selectedDefinition = getKingdomDefinition(selectedKingdom);
  const selectedState = state.kingdoms[selectedKingdom];
  const selectedScore = calculateKingdomScore(state, selectedKingdom);
  const production = productionForKingdom(selectedState, Math.max(1, round));
  const currentTax = round > 0 ? selectedState.taxHistory[round] : undefined;

  useEffect(() => {
    Object.assign(bridgeRef.current, {
      state,
      round,
      selectedKingdom,
      onSelect,
      onDraggingChange: setDragging,
      onReady: () => setEngineReady(true),
    });
    bridgeRef.current.scene?.syncDynamic();
  }, [state, round, selectedKingdom, onSelect]);

  useEffect(() => {
    let cancelled = false;
    let game: import('phaser').Game | undefined;
    let scene: KingdomMapScene | undefined;
    let observer: ResizeObserver | undefined;

    async function bootPhaser() {
      const host = hostRef.current;
      if (!host) return;

      const fontReady = 'fonts' in document ? document.fonts.ready : Promise.resolve();
      const [phaserModule, sceneModule] = await Promise.all([
        import('phaser'),
        import('../phaser/KingdomMapScene'),
        fontReady,
      ]);
      if (cancelled || !hostRef.current) return;

      const Phaser = phaserModule.default;
      scene = new sceneModule.KingdomMapScene(bridgeRef.current);
      const rect = hostRef.current.getBoundingClientRect();
      game = new Phaser.Game({
        type: Phaser.AUTO,
        parent: hostRef.current,
        width: Math.max(1, Math.floor(rect.width)),
        height: Math.max(1, Math.floor(rect.height)),
        transparent: true,
        scene,
        banner: false,
        disableContextMenu: true,
        input: {
          activePointers: 3,
          mouse: {
            preventDefaultWheel: true,
          },
          touch: true,
        },
        scale: {
          mode: Phaser.Scale.NONE,
          autoCenter: Phaser.Scale.NO_CENTER,
        },
        render: {
          antialias: true,
        },
      });

      const resize = () => {
        const nextHost = hostRef.current;
        if (!nextHost || !game) return;
        const nextRect = nextHost.getBoundingClientRect();
        game.scale.resize(
          Math.max(1, Math.floor(nextRect.width)),
          Math.max(1, Math.floor(nextRect.height)),
        );
      };
      observer = new ResizeObserver(resize);
      observer.observe(hostRef.current);
      resize();
    }

    void bootPhaser();

    return () => {
      cancelled = true;
      observer?.disconnect();
      if (scene && bridgeRef.current.scene === scene) bridgeRef.current.scene = undefined;
      game?.destroy(true);
    };
  }, []);


  return (
    <div className={`interactive-map game-map-viewport phaser-game-map ${dragging ? 'dragging' : ''}`}>
      <div ref={hostRef} className="phaser-map-host" aria-label="İnteraktif krallık haritası" />

      {!engineReady ? (
        <div className="phaser-map-loading" aria-hidden="true">
          <span className="loading-compass" />
          <strong>Sefer haritası hazırlanıyor</strong>
        </div>
      ) : null}

      <div className="map-camera-controls" aria-label="Harita kamera kontrolleri">
        <button type="button" onClick={() => bridgeRef.current.scene?.zoomCenter(1.25)} aria-label="Yakınlaştır">+</button>
        <button type="button" onClick={() => bridgeRef.current.scene?.zoomCenter(0.8)} aria-label="Uzaklaştır">−</button>
        <button type="button" onClick={() => bridgeRef.current.scene?.resetCamera()} aria-label="Haritayı sıfırla">⌂</button>
      </div>

      {detailOpen ? (
        <aside className="map-detail" style={{ '--kingdom-color': selectedDefinition.color } as CSSProperties}>
          <button className="map-detail-close" type="button" onClick={() => setDetailOpen(false)} aria-label="Krallık kaydını kapat">
            ×
          </button>
          <div className="map-detail-heading">
            <div>
              <p className="eyebrow">Seçili krallık</p>
              <h3>{selectedDefinition.name}</h3>
            </div>
            <strong>{selectedScore.total} PP</strong>
          </div>
          <div className="map-resource-row">
            {RESOURCE_KEYS.map((key: ResourceKey) => (
              <span key={key} className={`mini-resource resource-${key}`}>
                <span>{RESOURCE_SHORT_LABELS[key]}</span>
                <strong>{selectedState.resources[key]}</strong>
              </span>
            ))}
          </div>
          <div className="map-detail-facts">
            <span>Üretim: {RESOURCE_KEYS.filter((key) => production[key] > 0).map((key) => `+${production[key]}${RESOURCE_SHORT_LABELS[key]}`).join(' ') || '—'}</span>
            <span>Vergi: {currentTax ? TAX_RULES[currentTax].label : 'seçilmedi'}</span>
            <span>Yapılar: {selectedState.buildings.length ? selectedState.buildings.map((id) => BUILDINGS.find((item) => item.id === id)?.name).filter(Boolean).join(', ') : 'yok'}</span>
          </div>
        </aside>
      ) : (
        <button
          className="map-detail-open"
          type="button"
          style={{ '--kingdom-color': selectedDefinition.color } as CSSProperties}
          onClick={() => setDetailOpen(true)}
        >
          {selectedDefinition.name} kaydı
        </button>
      )}
    </div>
  );
}
