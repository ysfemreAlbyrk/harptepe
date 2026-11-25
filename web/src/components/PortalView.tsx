import { useState } from 'react';
import { KINGDOMS, PLAYER_ROLES } from '../data/gameData';
import type { KingdomId, PlayerRoleId } from '../types';

interface PortalViewProps {
  networkStatus: string;
  onEnterModerator: () => void;
  onEnterProjection: () => void;
  onEnterPlayer: (kingdomId: KingdomId, roleId: PlayerRoleId) => void;
}

export function PortalView({ networkStatus, onEnterModerator, onEnterProjection, onEnterPlayer }: PortalViewProps) {
  const [kingdomId, setKingdomId] = useState<KingdomId>('north');
  const [roleId, setRoleId] = useState<PlayerRoleId>('monarch');

  return (
    <main className="portal-shell main-menu-shell">
      <section className="portal-title-plaque">
        <div className="portal-title-copy">
          <div className="sigil" aria-hidden="true"><span /></div>
          <div>
            <p className="eyebrow">Harptepe canlı oyun sistemi</p>
            <h1>Krallık Simülasyonu</h1>
            <p>
              Altı krallık, tek masa ve 120 dakika: vergilerini topla, pazarlık masasına otur,
              keşif sandıklarını aç ve taç oylamasına kadar ayakta kal.
            </p>
          </div>
        </div>
        <span className={`network-pill network-${networkStatus}`}>Ağ durumu: {networkStatus}</span>
      </section>

      <div className="menu-war-table">
        <section className="portal-grid menu-cards" aria-label="Giriş seçenekleri">
          <article className="portal-card menu-card player-menu-card">
            <span className="menu-card-index">I</span>
            <p className="eyebrow">Oyuncu görünümü</p>
            <h2>Sefer katılım fermanı</h2>
            <p>Krallığını ve meclisteki rolünü seç; görevlerini, kaynaklarını ve canlı savaş haritasını takip et.</p>
            <div className="portal-selects">
              <label>
                <span>Krallık</span>
                <select value={kingdomId} onChange={(event) => setKingdomId(event.target.value as KingdomId)}>
                  {KINGDOMS.map((kingdom) => <option key={kingdom.id} value={kingdom.id}>{kingdom.name} · {kingdom.epithet}</option>)}
                </select>
              </label>
              <label>
                <span>Rol</span>
                <select value={roleId} onChange={(event) => setRoleId(event.target.value as PlayerRoleId)}>
                  {PLAYER_ROLES.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}
                </select>
              </label>
            </div>
            <button className="primary-button" type="button" onClick={() => onEnterPlayer(kingdomId, roleId)}>Oyuna katıl</button>
          </article>

          <article className="portal-card menu-card moderator-menu-card">
            <span className="menu-card-index">II</span>
            <p className="eyebrow">Oyun yönetimi</p>
            <h2>Moderatör komuta masası</h2>
            <p>Üretim, vergi, ticaret, anlaşma, keşif ve savaş sonuçlarını tek komuta panelinden yönet.</p>
            <button className="primary-button" type="button" onClick={onEnterModerator}>Komuta masasını aç</button>
          </article>

          <article className="portal-card menu-card projection-menu-card">
            <span className="menu-card-index">III</span>
            <p className="eyebrow">Salon ekranı</p>
            <h2>Projeksiyon çadırı</h2>
            <p>Harita ve canlı prestij sıralaması odaklı, yönetim düğmelerinden arındırılmış seyirci görünümü.</p>
            <button className="ghost-button" type="button" onClick={onEnterProjection}>Projeksiyonu aç</button>
          </article>
        </section>

        <aside className="portal-help menu-chronicle">
          <p className="eyebrow">Bağlantı emri</p>
          <h2>Oyuncular nasıl girer?</h2>
          <ol>
            <li>Moderatör bilgisayarında <code>npm start</code> çalıştırılır; uygulama 8787 portunda açılır.</li>
            <li>Oyuncular aynı yerel ağa bağlanır ve moderatörün paylaştığı IP adresini tarayıcıya yazar.</li>
            <li>Açılan kapı ekranından krallık ve rol seçilir.</li>
            <li>Oyuncu ekranı salt okunurdur; kaynak ve puan işlemleri moderatör tarafından işlenir.</li>
          </ol>
        </aside>
      </div>
    </main>
  );
}
