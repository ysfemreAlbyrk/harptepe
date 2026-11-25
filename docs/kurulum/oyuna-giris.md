# Oyuna Giriş ve Ağ Kurulumu

Bu sistem iki katmanlıdır: oyun fiziksel alanda oynanır, web uygulaması kaynakları ve skoru takip eder. Oyuncular telefonlarından veya bilgisayarlarından kendi rol ekranlarına girebilir.

## Moderatörün hazırlığı

1. Depoyu indir veya güncelle.
2. `web` klasöründe bağımlılıkları kur: `npm install`
3. Geliştirme ve test sırasında `npm run dev:all` çalıştır. Bu komut Vite arayüzünü ve senkronizasyon sunucusunu birlikte açar.
4. Oyun günü tek adres kullanmak için `npm start` çalıştır. Bu komut uygulamayı derler ve `8787` portunda hem web arayüzünü hem senkronizasyonu sunar.

Geliştirme ekranı genellikle `http://localhost:5174` veya `http://localhost:5173` olur; kesin adresi Vite terminali yazar. Oyun günü kullanımında ana adres `http://localhost:8787` olur.

## Oyuncular nasıl bağlanır?

1. Oyuncular moderatör bilgisayarıyla aynı yerel ağa bağlanır.
2. Moderatör kendi yerel IP adresini öğrenir ve oyunculara paylaşır.
3. Oyun günü kurulumunda oyuncular tarayıcıdan `http://IP-ADRESI:8787` adresine girer.
4. Geliştirme modunda kullanılıyorsa oyuncular Vite terminalinde yazan ağ adresine girer; senkronizasyon arka planda 8787 portunu kullanır.
5. Giriş ekranında **Oyuncu olarak gir** seçilir.
6. Krallık ve rol seçilir.

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
