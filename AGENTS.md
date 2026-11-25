# Proje notları

## Web uygulaması

- Uygulama `web/` altında Vite + React 18 + TypeScript ile yazıldı.
- Geliştirme: `cd web && npm run dev`
- Testler: `cd web && npm test`
- Üretim derlemesi: `cd web && npm run build`
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
