# Proje notları

## Web uygulaması

- Uygulama `web/` altında Vite + React 18 + TypeScript ile yazıldı.
- Geliştirme: `cd web && npm run dev`
- Web + yerel ağ senkronizasyonu ile geliştirme: `cd web && npm run dev:all`
- Testler: `cd web && npm test`
- Üretim derlemesi: `cd web && npm run build`
- Derleyip tek sunucuda oyuncu erişimi başlatma: `cd web && npm start`
- Yerel durum `localStorage` anahtarı `harptepe-krallik-simulasyonu-v1` altında saklanır.
- Projeksiyon/seyirci görünümü için `?projection=1` sorgu parametresi kullanılır.

## Git ve GitHub yönetimi

- Uzak depo: `https://github.com/ysfemreAlbyrk/harptepe.git`
- `main` dalı her zaman çalışır ve derlenebilir durumda tutulur.
- Büyük özellikler için kısa ömürlü dallar kullanılır: `feature/...`, `fix/...`, `docs/...`.
- Commit mesajları Conventional Commits biçiminde ve Türkçe yazılır; örnek: `feat: harita görünümünü ekle`, `fix: savaş maliyetini düzelt`, `docs: kral rehberini genişlet`.
- Her push öncesinde mümkünse `cd web && npm test` ve `cd web && npm run build` çalıştırılır.
- `node_modules`, `dist`, derleme artıkları, ekran görüntüleri ve yerel durum dosyaları commitlenmez.
- Kullanıcı açıkça istemedikçe geçmiş yeniden yazılmaz, force-push yapılmaz ve uzak depo ayarları değiştirilmez.

## Harita/oyun motoru

- Tam ekran harita Phaser 3 ile çalışır; sahne kodu `web/src/phaser/KingdomMapScene.ts`, arazi üretimi `web/src/phaser/terrainPainter.ts` içindedir.
- React tarafı Phaser sahnesini `web/src/components/InteractiveMap.tsx` üzerinden yükler; oyun motoru dinamik import ile ayrı chunk olarak yüklenir.
- Harita etkileşimi veya görsel dünya değiştirileceğinde SVG/DOM harita varsayımı yerine Phaser sahnesi ve canvas arazi üretimi güncellenmelidir.
