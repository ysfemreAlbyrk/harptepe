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
    <main className="portal-shell">
      <section className="portal-hero">
        <div className="sigil" aria-hidden="true"><span /></div>
        <p className="eyebrow">Harptepe canlı oyun sistemi</p>
        <h1>Krallık Simülasyonu</h1>
        <p>
          Ekonomi, diplomasi ve entrikanın aynı masada buluştuğu 120 dakikalık canlı oyun için giriş kapısı.
          Moderatör oyunu yönetir, projeksiyon salonu bilgilendirir, oyuncu ekranı ise rolüne göre yol gösterir.
        </p>
        <span className={`network-pill network-${networkStatus}`}>Ağ durumu: {networkStatus}</span>
      </section>

      <section className="portal-grid" aria-label="Giriş seçenekleri">
        <article className="portal-card moderator-card">
          <p className="eyebrow">Oyun yönetimi</p>
          <h2>Moderatör girişi</h2>
          <p>Kaynakları, üretimi, anlaşmaları, savaşları, keşifleri ve skoru yöneten tam yetkili komuta ekranı.</p>
          <button className="primary-button" type="button" onClick={onEnterModerator}>Moderatör olarak gir</button>
        </article>

        <article className="portal-card player-card">
          <p className="eyebrow">Oyuncu görünümü</p>
          <h2>Role göre gir</h2>
          <p>Krallığını ve rolünü seç; görevlerini, canlı kaynak durumunu ve tur bilgisini salt okunur gör.</p>
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
          <button className="primary-button" type="button" onClick={() => onEnterPlayer(kingdomId, roleId)}>Oyuncu olarak gir</button>
        </article>

        <article className="portal-card projection-card">
          <p className="eyebrow">Salon ekranı</p>
          <h2>Projeksiyon</h2>
          <p>Harita, liderlik ve canlı skor odaklı sade görünüm. Yönetim butonları oyunculardan gizlenir.</p>
          <button className="ghost-button" type="button" onClick={onEnterProjection}>Projeksiyonu aç</button>
        </article>
      </section>

      <section className="portal-help">
        <h2>Oyuncular nasıl girer?</h2>
        <ol>
          <li>Moderatör bilgisayarında <code>npm start</code> çalıştırılır; uygulama ve senkronizasyon 8787 portunda açılır.</li>
          <li>Oyuncular aynı yerel ağa bağlanır ve moderatörün paylaştığı IP adresini 8787 portuyla tarayıcıya yazar.</li>
          <li>Açılan giriş ekranından krallık ve rol seçilir.</li>
          <li>Oyuncu ekranı salt okunurdur; kaynak ve puan işlemleri moderatör tarafından işlenir.</li>
        </ol>
      </section>
    </main>
  );
}
