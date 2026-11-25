# Oyuna Giriş ve Ağ Kurulumu

Bu sistem iki katmanlıdır: oyun fiziksel alanda oynanır, web uygulaması kaynakları ve skoru takip eder. Oyuncular telefonlarından veya bilgisayarlarından kendi rol ekranlarına girebilir.

## Moderatörün hazırlığı

1. Depoyu indir veya güncelle.
2. `web` klasöründe bağımlılıkları kur: `npm install`
3. Geliştirme sırasında tek komutla iki servisi başlat: `npm run dev:all`
4. Üretim benzeri kullanım için önce `npm run build`, sonra `npm run sync` çalıştır.

Geliştirme ekranı genellikle `http://localhost:5174` veya `http://localhost:5173` olur. Senkronizasyon ve hazır derleme sunucusu `http://localhost:8787` altında çalışır.

## Oyuncular nasıl bağlanır?

1. Oyuncular moderatör bilgisayarıyla aynı yerel ağa bağlanır.
2. Moderatör kendi yerel IP adresini öğrenir ve oyunculara paylaşır.
3. Oyuncular tarayıcıdan `http://IP-ADRESI:8787` adresine girer.
4. Giriş ekranında **Oyuncu olarak gir** seçilir.
5. Krallık ve rol seçilir.

Hızlı bağlantı biçimi de kullanılabilir:

```text
http://IP-ADRESI:8787/?view=player&kingdom=north&role=monarch
```

`kingdom` değerleri: `north`, `west`, `center`, `east`, `south`, `gold`  
`role` değerleri: `monarch`, `vizier`, `merchant`, `envoy`, `spy`, `commander`, `explorer`

## Görünümler

- **Moderatör:** tam yetkili yönetim ekranı
- **Oyuncu:** salt okunur durum, harita ve rol rehberi
- **Projeksiyon:** salon için sade skor ve harita ekranı

## Güvenlik notu

Bu sürüm yerel ağ içinde güvene dayanır. Oyuncu ekranları yazma yetkisi kullanmaz, ancak ağa erişen teknik bilgisi yüksek biri moderatör görünümünü açabilir. Oyun salonu dışına açık internet üzerinde kullanılmamalıdır.
