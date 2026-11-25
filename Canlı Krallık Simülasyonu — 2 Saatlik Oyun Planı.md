# Canlı Krallık Simülasyonu — 2 Saatlik Oyun Planı

Nov 24, 2026 · @AHMET ARİF SEZER

## Özet

Oyun 120 dakikada şöyle akar: 30 dakika bilgi yarışması ve seçim hakları, 3 tur × 20 dakika oyun, 13 dakika final. Tasarım dokümanındaki her şey 2 saate sığmaz. Ana fikri (ekonomi, diplomasi, entrika) korumak için sistem sadeleştirildi.

**Kalanlar:** 6 krallık × 10 oyuncu, fiziksel ticaret, elçilik, tescilli anlaşmalar, sahte mektup, casusluk, keşif sandıkları, turnuva, basit savaş, vergi kararı, gizli hedefler.

**Değişenler:**

- **Tek para birimi:** Altın. Gümüş ve bronz yok, çünkü 2 saatte bozdurma hesabı oyunu yavaşlatır.
- **4 kaynak:** Gıda (buğday, arpa, ekmek ve erzak tek kartta), Odun, Taş, Maden.
- **Roller 10'dan 6 türe indi:** Başdanışman, Dışişleri Bakanı ve Halk Temsilcisi rolleri birleştirildi.
- **Mahkeme yerine hakem:** Anlaşmazlıklarda kararı moderatör 30 saniyede verir.
- **Web uygulaması yok:** İlk oyunda kaynaklar fiziksel kart olarak dolaşır. Skor tablosu bir Google Sheet'te tutulur ve projeksiyona yansıtılır. Ticaret, kartların elden ele geçmesiyle oynanır; dijital kayıt sadece puanlamada kullanılır.
- **İlk sürümde olmayanlar:** Kişisel servet, uzman transferi, borç senedi takibi, mülteci, seçim, isyan zinciri.

**Kazanan:** Oyun sonunda en çok **Prestij Puanı (PP)** toplayan krallık kazanır. Ayrıca bireysel MVP ödülleri verilir.

## Dakika dakika akış (120 dk)

Bu zaman çizelgesi Oyun Yöneticisi'nin ana belgesidir; telefonda sayacı kurup bu tabloya göre ilerler.

| Saat | Bölüm | Ne olur | Nerede |
| --- | --- | --- | --- |
| 0:00–0:08 | Karşılama ve kurallar | Takım numarası, renkli bileklik ve “Krallık Kataloğu” sayfası kapıda dağıtılır. 5 dakikalık kural sunumu yapılır. | Ortak alan, projeksiyon |
| 0:08–0:28 | Bilgi yarışması | 15 soru, son soru bahisli, gerekirse eşitlik sorusu. | Ortak alan |
| 0:28–0:38 | Seçim hakları (draft) | 3 tur yılan draft: krallık, ayrıcalık kartı, ek paket. Her takım krallık kitini alır. | Ortak alan |
| 0:38–0:43 | Rol seçimi ve odalara geçiş | Takımlar rollerini kendi içinde dağıtır, bayrağı odaya asar. | Krallık odaları |
| 0:43–1:03 | **1. Tur: Barış Çağı** | Saldırı yoktur. Odak ticaret, keşif ve ilk anlaşmalardır. | Tüm kat |
| 1:03–1:05 | Ara | Skor tablosu projeksiyona yansıtılır. | — |
| 1:05–1:25 | **2. Tur: Kıtlık** | Savaş açılır, gıda bakımı artar. | Tüm kat |
| 1:25–1:27 | Ara | Skor tablosu | — |
| 1:27–1:47 | **3. Tur: Taç Yarışı** | Son yapılar ve son ihanetler. Tur sonunda Taç oylaması yapılır. | Tüm kat |
| 1:47–1:52 | Puan sayımı | Moderatörler kalan kaynakları sayar. Oyuncular MVP oyu verir. | Odalar + ortak alan |
| 1:52–2:00 | Final | Gizli hedefler açıklanır, sıralama gösterilir, ödüller verilir, toplu fotoğraf çekilir. | Ortak alan |

**Bir turun içi (20 dk):**

1. **0–2 dk · Olay ve üretim:** Projeksiyonda olay kartı okunur. Hazinedarlar Hazine Masası'ndan üretim kartlarını alır.
2. **2–6 dk · Krallık meclisi:** Odada plan yapılır ve vergi kararı verilir. Tüccar ve elçiler görevlerini alır.
3. **6–16 dk · Serbest hareket:** Ticaret, elçilik, keşif ve casusluk yapılır. Turnuva 10. dakikada başlar ve 2–3 dakika sürer.
4. **16–19 dk · Kapanış:** Son tesciller yapılır, gıda bakımı ödenir, savaşlar sonuçlandırılır. Yapılar serbest harekette de inşa edilebilir.
5. **19–20 dk · Skor:** Projeksiyon güncellenir.

Pratik kural: Oyun Yöneticisi her faz değişiminde düdük veya zil çalar. 60 kişilik katta sözlü duyuru duyulmaz.

## Giriş: takımlar ve bilgi yarışması

Yarışmada kazanılan tek şey **seçim sırasıdır**; ilk olan başlangıçta ekstra kaynak almaz. Böylece yarışma heyecanlı olur ama oyunun dengesini bozmaz.

**Takımlar oyundan önce kurulur.** Katılımcı listesi 6 takıma rastgele bölünür. Arkadaş grupları dağıtılırsa diplomasi daha canlı olur. Takımların henüz krallığı yoktur, sadece numarası ve rengi vardır: 1 Kırmızı, 2 Mavi, 3 Yeşil, 4 Sarı, 5 Mor, 6 Turuncu. Oda numaraları takım numaralarıyla aynıdır.

**Format:**

- Her takıma bir A4 yazı tahtası (veya lamine kart) ve marker verilir. Tüm takımlar aynı anda cevap yazar ve süre bitince tahtaları kaldırır. Buzzer kullanılmaz, çünkü 60 kişilik salonda buzzer kavgaya döner.
- Alternatif olarak Kahoot kullanılabilir: takım başına tek telefon. Hız bonusu otomatik hesaplanır ama internet ve ekran riski vardır. A4 tahta yedekte hazır tutulur.
- Soru başına 30 saniye düşünme ve 20 saniye cevap gösterme süresi vardır. 15 soru yaklaşık 13 dakika sürer, sunumla birlikte toplam 20 dakika.
- Her doğru cevap 10 puandır.
- **Son soru bahislidir:** Takımlar sorudan önce mevcut puanının ne kadarını ortaya koyduklarını tahtaya yazar. Doğru cevap bahsi ekler, yanlış cevap düşer. Geride kalan takımın son anda öne geçebilmesi için bu soru çok önemlidir.
- **Eşitlik sorusu:** Sayısal bir tahmin sorusu sorulur, en yakın tahmin kazanır.
- Soru dağılımı şöyledir: 5 genel kültür, 4 tarih ve coğrafya (krallık temalı), 4 mantık ve bilmece, 1 yurda özel soru (yurtta herkesin bildiği bir şey), 1 bahisli final sorusu.

**Örnek soru seti** (kendi sorularınızla değiştirin; yurda özel soru sizden gelmeli):

| # | Soru | Cevap | Tür |
| --- | --- | --- | --- |
| 1 | Periyodik tabloda “Au” hangi elementtir? | Altın | Genel |
| 2 | Satrançta oyun başında bir oyuncunun kaç piyonu vardır? | 8 | Genel |
| 3 | Dünyanın en büyük okyanusu hangisidir? | Pasifik | Genel |
| 4 | Roma rakamıyla “L” kaçtır? | 50 | Genel |
| 5 | Arz sabitken talep artarsa fiyata ne olur? | Artar | Genel |
| 6 | İstanbul'un fethi hangi yıl gerçekleşti? | 1453 | Tarih |
| 7 | Malazgirt Savaşı hangi yıl yapıldı? | 1071 | Tarih |
| 8 | Osmanlı Devleti'nin kurucusu kimdir? | Osman Bey | Tarih |
| 9 | Magna Carta hangi ülkede imzalandı? | İngiltere (1215) | Tarih |
| 10 | Bir çobanın 17 koyunu var. 9'u hariç hepsi ölür. Kaç koyun kalır? | 9 | Mantık |
| 11 | 2, 6, 12, 20, 30, ? | 42 | Mantık |
| 12 | Ne kadar çok alırsan o kadar çok geride bırakırsın. Nedir? | Adım / ayak izi | Bilmece |
| 13 | Bir babayla oğlunun yaşları toplamı 36'dır. Baba oğlundan 30 yaş büyüktür. Oğul kaç yaşındadır? | 3 | Mantık |
| 14 | *(Yurda özel soru: sizin yazacağınız soru)* | — | Özel |
| 15 | **Bahisli final:** Kanuni Sultan Süleyman kaç yıl tahtta kaldı? | 46 (1520–1566) | Final |
| E | **Eşitlik:** Türkiye'nin yüzölçümü yaklaşık kaç km²'dir? | 783.562 km² | Tahmin |

**Puan tablosunu** bir moderatör projeksiyondaki sheet'e canlı olarak girer. Yarışma sırasında skorun görünmesi bahis sorusunu çok daha heyecanlı yapar.

## Seçim hakları: yılan draft

Yarışma sırasına göre 3 tur seçim yapılır ve sıra her turda ters döner. Birincinin avantajı gerçektir ama sonuncu da ezilmez. Her takımdan bir seçici (sonradan genelde Hükümdar olur) sahneye çıkar ve her seçim için 30 saniyesi vardır.

| Draft turu | Seçilen | Sıra |
| --- | --- | --- |
| A | Krallık (coğrafya + başlangıç + üretim) | 1. → 6. |
| B | Ayrıcalık kartı | 6. → 1. |
| C | Ek başlangıç paketi | 1. → 6. |

Yani birinci takım 1., 12. ve 13. seçimi yapar; altıncı takım 6., 7. ve 18. seçimi. Krallık Kataloğu kapıda dağıtıldığı için takımlar yarışma aralarında stratejilerini konuşabilir.

### A · Krallıklar

Altı krallığın başlangıç değeri aynıdır: 1 kaynak kartı = 2 Altın kabulüyle her biri yaklaşık 31 Altın değerindedir. Tur başı üretim değeri de yaklaşık 10'dur. Fark, neyin bol neyin eksik olduğundadır.

| Krallık | Başlangıç (G / O / T / M / A) | Tur başı üretim | Eksik olan |
| --- | --- | --- | --- |
| Kuzey — Tarlalar | 8 / 3 / 2 / 0 / 5 | +4 G, +1 O | Maden |
| Batı — Ormanlar | 2 / 8 / 2 / 1 / 5 | +4 O, +1 G | Taş, maden |
| Merkez — Taş Ocakları | 2 / 2 / 7 / 2 / 5 | +4 T, +1 O | Gıda |
| Doğu — Madenler | 1 / 2 / 2 / 8 / 5 | +4 M, +1 T | Gıda |
| Güney — Liman Şehri | 3 / 0 / 3 / 2 / 15 | +1 G, +1 T, +6 A | Odun |
| Altın — Hazine Krallığı | 1 / 2 / 2 / 3 / 15 | +6 A, +1 M, +1 T | Gıda |

*G = Gıda, O = Odun, T = Taş, M = Maden, A = Altın.*

Güney ve Altın'ın farkı şudur: Güney'in tek krallık özelliği, tescil masasında herkesin her tur 1 kez başvurabileceği **“Güney Pazarı”** olmasıdır. Başka bir krallık Güney üzerinden takas yaparsa Güney 1 Altın komisyon alır. Altın Krallığı ise **bankadır**: verdiği borçlar tescil edilir ve geri ödenmeyen borç için borçlu oyun sonunda borcun yarısı kadar PP kaybeder.

### B · Ayrıcalık kartları

| Kart | Etkisi |
| --- | --- |
| Bereketli Vadi | Her tur +1 Gıda. Kıtlık olayından etkilenmez. |
| Hazine Darphanesi | Her tur +2 Altın. |
| Mimarlar Loncası | Her tur bir yapının maliyetinden 1 kaynak kartı düşer. |
| Kraliyet Kâşifleri | Keşif sandıklarında oyun boyunca 2 kez ipucu hakkı vardır. Her açılan sandıktan +1 Altın kazanılır. |
| Liman Hakkı | Her tur, bankada 2 kartı 1'e 1 oranıyla başka kaynağa çevirebilir. |
| Gölge Ağı | Casus jetonu 2 yerine 4 olur. Bir kez “sahte tescil” şüphesini moderatöre sorabilir. |

### C · Ek başlangıç paketleri

Değerleri 8'den 6'ya kadar hafifçe azalır, böylece yarışma sırası burada da küçük bir fark yaratır. Paket türleri farklı olduğu için her krallığa farklı bir paket daha çok yarar.

| Paket | İçerik | Değer (Altın) |
| --- | --- | --- |
| Hazine Sandığı | 8 A | 8 |
| Ambar | 4 G | 8 |
| Taş Ocağı | 3 T + 1 A | 7 |
| Kereste Yardımı | 3 O + 1 A | 7 |
| Maden Damarı | 3 M | 6 |
| Paralı Askerler | Kalıcı +1 asker gücü + 2 A | \~6 |

**Krallık kiti** draft biter bitmez masadan alınır. İçinde şunlar bulunur: bayrak, krallık mührü (çıkartma seti), başlangıç kaynakları (krallık ve paket), ayrıcalık kartı, kapalı **gizli hedef kartı** (rastgele), 2 casus jetonu, rol kartları, boş anlaşma formları.

## Ekonomi

Ekonominin motoru üç baskıdır. **Gıda** her tur ödenmek zorundadır ve toplamda zar zor yeter. **Yapılar** puan getirir ama malzemesi hep başka krallıktadır. **Kalan kaynaklar** oyun sonunda az puan eder, bu yüzden biriktiren kaybeder.

### Kaynaklar

- Fiziksel kartlarla oynanır: 4 renkli kaynak kartı (Gıda sarı, Odun kahverengi, Taş gri, Maden mavi) ve Altın için poker fişi.
- Kartlar Hazinedar'ın kutusunda durur. Tüccar ve elçiler ticarete giderken kutudan kart alır. Ticaret, kartların elden ele verilmesiyle tamamlanır ve tescil gerekmez.
- Referans fiyat: 1 kaynak kartı = 2 Altın. Projeksiyonda sadece referans olarak görünür; gerçek fiyat pazarlıkla belirlenir.

### Gıda bakımı

- Her turun kapanışında her krallık Hazine Masası'na **2 Gıda** öder (2. turdaki Kıtlık olayında 3).
- Ödeyemediği her Gıda için **–2 PP** cezası alır.
- Hesap: Oyundaki toplam gıda arzı (başlangıç + üretim) yaklaşık 42 karttan ibarettir. Toplam talep de 42'dir. Yani çiftlik kurulmazsa en az bir krallık aç kalır. Gıda savaşı tasarım gereğidir.

### Yapılar

Yapılar serbest hareket ve kapanış fazlarında Hazine Masası'nda “satın alınır”: kartlar teslim edilir, yapı kartı alınır ve krallık odasının duvarına asılır. Üretim veren yapılar bir sonraki turdan itibaren üretir.

| Yapı | Maliyet | Etkisi | PP |
| --- | --- | --- | --- |
| Çiftlik | 2 O + 1 T | Her tur +2 G | 1 |
| Pazar | 1 O + 1 T + 2 A | Her tur +2 A | 1 |
| Kışla | 1 O + 1 M + 2 A | Kalıcı +1 asker gücü | 1 |
| Sur | 3 T + 1 M | Savunmada +2 | 2 |
| Akademi | 2 T + 1 O + 1 M + 2 A | — | 3 |
| Anıt (krallık başına en fazla 1) | 4 T + 3 O + 3 M + 2 G + 5 A | — | 10 |

Anıt tek başına hiçbir krallığın kaynaklarıyla yapılamaz. Kurmak isteyen herkes en az 2 krallıkla ticaret yapmak zorundadır. Oyunun en büyük pazarlıkları 3. turda Anıt malzemesi üzerine çıkar.

### Vergi kararı

Her krallık meclisinde Hükümdar vergi seviyesini masa kartıyla bildirir:

| Vergi | Gelir | Bedel |
| --- | --- | --- |
| Düşük | +0 A | Oyun sonunda Düşük seçilen her tur için +1 PP |
| Normal | +2 A | — |
| Yüksek | +5 A | Üst üste 2 tur Yüksek seçilirse **isyan** çıkar: –4 PP ve o tur üretim alınmaz. |

## Roller (krallık başına 10 kişi)

10 kişiye 6 rol türü yeter. Kural şudur: serbest hareket fazında odada en fazla 3 kişi kalır, geri kalan 7 kişi koridordadır. Hareketi bu kural sağlar.

| Rol | Kişi | Ne yapar | Yetki sınırı |
| --- | --- | --- | --- |
| Hükümdar | 1 | Vergi, savaş ve ittifak kararlarını verir. Tescilli anlaşmaları imzalar ve mührü taşır. Final Taç oylamasında krallık adına oy verir. | Odadan ayrılabilir ama mühür yanındadır. |
| Vezir-Hazinedar | 1 | Kart kutusunu yönetir. Üretimi alır, bakımı öder, yapı satın alır. Hükümdar yokken onun yerine imza atar. | Kutudan kartı sadece o verir. |
| Tüccar | 2 | Elinde kartlarla diğer krallıkları gezip takas yapar. | Tek seferde en fazla 6 kart veya 10 Altın değerinde işlem; üstü Hükümdar onayı. |
| Elçi | 2 | İttifak, saldırmazlık, borç ve ortak Anıt anlaşmaları müzakere eder. Mektup ve haber taşır. | Anlaşmayı tescile Hükümdar imzasıyla götürür. |
| Casus | 1 | Söylenti toplar, sahte mektup yazar ve casus jetonlarını kullanır. | Gerçek kart veya kutuya dokunamaz. |
| Komutan | 1 | Savaş düellosuna çıkar, kışla ve paralı asker pazarlığı yapar. | Savaşı Hükümdar ilan eder. |
| Kâşif | 2 | Keşif sandıklarını çözer ve turnuvaya katılır. | Sandık başına 1 cevap hakkı vardır. |

Roller takım içinde 5 dakikada seçilir. Utangaç oyuncular için Kâşif çok uygundur: oyun içindedirler ama pazarlık yapmak zorunda kalmazlar. Konuşkan oyuncular Elçi ve Tüccar olmalıdır. Her rolün yetkileri, boyuna asılan bir kartta kısaca yazar.

## Mekanikler

Temel kural: **Yalnızca Tescil Masası'nda mühürlenmiş anlaşma bağlayıcıdır.** Geri kalan her şey (söz, mektup, söylenti) yalan olabilir. Entrika bu ayrımla çalışır.

### Ticaret

Ticaret serbesttir ve kayıt gerektirmez: kartlar el değiştirdiği an işlem tamamlanır. Gelecek tura söz verilen ödemeler (“şimdi 3 Taş ver, 3. turda 4 Gıda vereyim”) ancak tescil edilirse zorla tahsil edilir.

### Diplomasi ve tescil

Tescil Masası'nda önceden basılmış A6 anlaşma formu doldurulur. Formda tür, taraflar, şartlar, iki Hükümdarın (veya Vezir'in) imzası ve iki krallığın mühür çıkartması bulunur. Moderatör formu panoya asar ve sheet'e işler.

| Anlaşma | Etkisi | Bozmanın bedeli |
| --- | --- | --- |
| Saldırmazlık paktı | Taraflar birbirine saldıramaz. | Saldıran –5 PP |
| İttifak | Her tescilli ittifak her iki tarafa oyun sonunda +1 PP verir (krallık başına en fazla +3). | Ayrılan –3 PP |
| Vadeli ticaret / borç | Moderatör vadesi gelince kartları zorla aktarır. Kart yetmezse ödenmeyen her kart için –1 PP. | Otomatik |
| Ortak Anıt | İki krallık malzemeyi bölüşen tek bir Anıt kurar ve her biri 6 PP alır. | — |

### Entrika ve sahte mektup

- Mektuplar mühürsüzdür ve herkes herkes adına mektup yazabilir. Sahte ittifak teklifi, sahte tehdit ve sahte fiyat bilgisi serbesttir.
- Mühür çıkartmaları sadece Hükümdar ve Vezir'dedir. Mühürün verilmesi, satılması veya kopyalanması yasaktır. Bu kuralı çiğneyen krallık –5 PP ceza alır.
- Doğrulama yolu şudur: bir mektuba inanmak istemeyen krallık, karar vermeden önce elçisini göndererek yüz yüze teyit alır. Bunun zaman maliyeti vardır ve oyunun dokusu bu maliyettir.
- Yasak olanlar: gerçek kişisel eşyalara dokunmak, özel odalara girmek, başka krallığın kart kutusuna el uzatmak, oyuncuları fiziksel olarak engellemek.

### Casus jetonları

Her krallığın 2 jetonu vardır (Gölge Ağı kartıyla 4). Casus bir jetonu Hakem'e verir ve bir krallık hakkında şu sorulardan birini sorar:

1. Hangi kaynağa kaç kartı var?
2. Gizli hedefi nedir?
3. Hangi krallıklarla tescilli anlaşması var?
4. Bu tur kime saldırmayı planlıyor? (Hakem sadece “söylendi / söylenmedi” der. Saldırı kartı önceden Hakem'e verilmişse cevap “evet”dir.)

Cevap sadece Casus'a fısıldanır. Casus aldığı bilgiyi doğru da aktarabilir, yalan da, başka krallığa da satabilir.

### Keşif sandıkları

- Katta 9 sandık (kutu veya zarf) bulunur, numaralı noktalara yerleştirilir. Her sandıkta bir soru, bilmece veya görev vardır.
- Kâşif cevabı Keşif Masası'na götürür. Doğruysa ödül kartı kazanır ve sandık kapanır (ilk gelen alır). Yanlışsa o krallık o sandığa bu tur bir daha cevap veremez.
- Sandıklar her turda 3'er 3'er açılır: tur başında 3 yeni sandık “keşfedilir”. Böylece ilk turda her şey kapılmaz.

| Seviye | Adet | Görev | Ödül |
| --- | --- | --- | --- |
| Küçük | 4 | Tek bilmece | 3 kaynak veya 5 A |
| Orta | 3 | Şifre çözme, 2 adım | 2 PP + 3 kaynak |
| Büyük | 2 | Çok aşamalı (ipucu başka sandığa yönlendirir) | **Verimli Toprak:** kalıcı +2 G/tur + 2 PP |

### Turnuva

Her turun 10. dakikasında ortak alanda 2–3 dakikalık bir mini oyun oynanır ve her krallıktan 1 kişi katılır. Kazanan +3 PP alır, ikinci 2 A alır.

- 1. tur: Bardak dizme (en yüksek kule, 60 saniye)
- 2. tur: Hızlı hafıza (15 nesneye 30 saniye bakılır, sonra listelenir)
- 3. tur: Sessiz sinema (krallık çiftleri)

### Savaş (2. ve 3. turda)

- Hükümdar savaş kartına hedefi yazar ve Hakem'e verir. Bedeli 3 A + 1 G'dir. Her krallık tur başına en fazla 1 saldırı yapabilir.
- İki Komutan Hakem'in önünde düello yapar. Skor şöyle hesaplanır: **zar (1–6) + asker gücü + taş-kâğıt-makas galibiyeti (+2) + savunanın Suru (+2)**.
- Başlangıç asker gücü 2'dir. Kışla ve Paralı Askerler paketi her biri +1 ekler.
- Saldıran kazanırsa savunanın kutusundan seçtiği **4 kaynak kartını** alır (Hakem aktarır). Savunan kazanırsa saldıran ona 3 A öder.
- Paralı asker: Bir krallık başka bir krallığın Komutan'ını bir düello için kiralayabilir. Kiralık komutanın asker gücü düelloya eklenir. Fiyatı taraflar pazarlıkla belirler ve tescil edilir.

### Olay kartları

| Tur | Olay | Etkisi |
| --- | --- | --- |
| 1 | **Barış Çağı** | Savaş yoktur. Bu tur tescil edilen her ilk anlaşma her iki tarafa +1 A verir. |
| 2 | **Kıtlık** | Gıda bakımı 3 olur. Kuzey'in üretimi bu tur +4 yerine +3 G'dir. Savaş açılır. |
| 3 | **Taç Yarışı** | Turun sonunda her Hükümdar kendisi hariç bir krallığa gizli oy verir. En çok oyu alan +5 PP alır. Bu son turda diplomasiyi çok önemli kılar. |

Ayrıca Oyun Yöneticisi'nin elinde 2 yedek “sürpriz” kartı bulunur ve tempo düşerse kullanılır. Biri **Gezgin Tüccar**dır: 3 dakikalık açık artırmayla bir Anıt malzeme paketi satılır. Diğeri **Veba Söylentisi**dir: bir krallığın kapısı 1 dakika kapanır.

## Zafer ve puanlama

Oyun sonunda en yüksek **Prestij Puanı (PP)** toplayan krallık kazanır. Eşitlik olursa Taç oylamasında daha çok oy alan krallık kazanır.

| Kaynak | PP |
| --- | --- |
| Yapılar | Tablodaki değeri kadar (Anıt 10) |
| Gizli hedef tamamlandı | +5 |
| Tescilli ittifaklar | +1 her biri, en fazla +3 |
| Turnuva galibiyeti | +3 her biri |
| Orta/Büyük sandık | +2 |
| Taç oylaması birincisi | +5 |
| Düşük vergi turları | +1 her biri |
| Kalan kaynaklar | Her 6 Altın değeri (3 kart veya 6 A) = 1 PP |
| Cezalar | Açlık –2/kart, isyan –4, pakt bozma –5, ittifaktan ayrılma –3, mühür ihlali –5 |

Kalan kaynakların 6:1 oranıyla puana dönmesi bilinçlidir; yapılar 3:1 civarında verir. Bu yüzden biriktirmek değil, harcamak kazandırır.

### Gizli hedefler (rastgele, her krallığa 1)

1. **Kurucu:** Oyun sonunda Anıt'ın olsun (tek başına veya ortak).
2. **Diplomat:** Oyun sonunda en az 3 tescilli ittifakın olsun.
3. **Fatih:** En az 2 savaş kazan (saldırı veya savunma).
4. **Kâşif:** En az 3 sandık aç.
5. **Tefeci:** Oyun sonunda en az 2 krallık sana tescilli borç ödemiş olsun.
6. **Ambar Beyi:** Hiç açlık cezası almadan bitir ve oyun sonunda en çok Gıda senin elinde olsun.

### Bireysel ödüller (MVP)

Puan sayımı sırasında her oyuncu kendi krallığı dışından bir kişiye oy verir (kâğıt veya QR form). Kategoriler: **En İyi Tüccar**, **En Tehlikeli Entrikacı**, **En Sadık Müttefik**, **Yılın Kâşifi**. Krallığı kaybeden oyuncuların da sahneye çıkmasını sağlar.

## Mekân, moderatörler ve malzeme

### Mekân

- **6 krallık odası:** Kapılarına numara ve takım rengi asılır. Bayrak draft sonrası takılır. Mümkünse odalar koridorun iki yanına dağıtılır ki kimse hep yan komşusuyla ticaret yapmasın.
- **Ortak alan:** Projeksiyon, Hazine/Tescil Masası, Keşif/Hakem Masası, turnuva alanı ve anlaşma panosu buradadır. Yarışma, draft ve final de burada yapılır.
- **9 sandık noktası:** Koridorlarda, ortak alanlarda ve izin alınmış boş odalarda bulunur. Mescit, özel odalar ve yangın çıkışları oyun dışıdır; kapılarına “Oyun Dışı” tabelası asılır.
- Koşmak yasaktır. İlk ihlal uyarı, ikincisi o tur krallığa –1 PP olur.

### Moderatörler (3 kişi)

| Moderatör | Görevi | Yeri |
| --- | --- | --- |
| Oyun Yöneticisi | Zaman, düdük, olay kartları, turnuva, yarışma sunuculuğu, draft | Sahne / ortak alan |
| Hazine ve Tescil | Üretim dağıtımı, gıda bakımı, yapı satışı, anlaşma tescili, skor sheet'i | Hazine/Tescil Masası |
| Keşif ve Hakem | Sandık cevapları, casus soruları, savaş düelloları, anlaşmazlıklar | Keşif/Hakem Masası |

En büyük darboğaz Hazine ve Tescil Masası'dır. 4. bir gönüllü bulunursa ilk işi bu masaya “kasiyer” olarak eklenmektir. Üretim kartları tur başlamadan önce krallık zarflarına önceden hazırlanırsa tur başı 2 dakikaya sığar.

### Malzeme listesi

| Malzeme | Adet | Not |
| --- | --- | --- |
| Gıda kartı (sarı) | 70 | Karton, kartvizit boyu |
| Odun kartı (kahverengi) | 50 |  |
| Taş kartı (gri) | 50 |  |
| Maden kartı (mavi) | 50 |  |
| Altın fişi | 100 × “1” + 40 × “5” | Poker fişi veya basılı jeton |
| Yapı kartları | Çiftlik 10, Pazar 8, Kışla 8, Sur 6, Akademi 8, Anıt 6 | Duvara asılabilir |
| Kart kutusu | 6 | Krallık başına 1 |
| Bayrak | 6 | A3 baskı yeterli |
| Mühür çıkartması | 6 × 30 | Her krallığa farklı şekil ve renk |
| Anlaşma formu (A6) | 80 |  |
| Savaş kartı | 15 |  |
| Vergi masa kartı | 6 × 3 | Düşük / Normal / Yüksek |
| Ayrıcalık kartı, gizli hedef kartı | 6 + 6 |  |
| Rol kartı (boyun kordonlu) | 60 + 5 yedek | Renk takım rengiyle aynı |
| Casus jetonu | 16 |  |
| Keşif sandığı ve içerik | 9 | Kutu veya zarf |
| A4 yazı tahtası ve marker | 6 + 6 | Yarışma için |
| Zar, kronometre, düdük/zil | 2, 1, 1 |  |
| Projeksiyon ve laptop | 1 | Skor sheet'i + yarışma slaytları |
| Krallık Kataloğu (A4 tek sayfa) | 65 | Krallıklar, ayrıcalıklar, paketler, yapılar |
| Bardak (turnuva) ve hafıza nesneleri | \~60 bardak, 15 nesne |  |

## Riskler, hazırlık ve açık kararlar

### En olası sorunlar

| Risk | Önlem |
| --- | --- |
| Kuralları anlatmak 8 dakikayı aşar | Tek sayfalık katalog önceden dağıtılır. Kural sunumu 6 slaytı geçmez. Kalan detayı rol kartları anlatır. |
| Hazine Masası'nda kuyruk | Üretim zarfları önceden hazırlanır. Yapı satışı serbest hareket boyunca açıktır. 4. gönüllü kasiyer olur. |
| 1. tur sessiz geçer (oyuncular odadan çıkmaz) | “Odada en fazla 3 kişi” kuralı uygulanır. Barış Çağı bonusu ilk anlaşmayı ödüllendirir. |
| Bir krallık erken çöker | Kalan kaynaklar 6:1 puana döner. Taç oylaması ve turnuva her zaman açıktır. Gezgin Tüccar kartı devreye sokulabilir. |
| Sahte mektup gerçek kırgınlığa dönüşür | Oyun başında açıkça söylenir: oyunda yalan serbesttir, oyun dışında yoktur. Finalde “en tehlikeli entrikacı” ödülü entrikayı kutlamaya çevirir. |
| Zaman kayar | 3. tur 15 dakikaya kısılabilir. Final kesinlikle 2:00'da biter. |

### Hazırlık takvimi

- [ ] **3 hafta önce:** Tarih, kat ve oda izinleri; 3 moderatör + 1 gönüllü; katılımcı listesi
- [ ] **2 hafta önce:** Kartların, kataloğun ve formların tasarımı ve baskısı; sandık soruları ve yarışma soruları
- [ ] **10 gün önce:** 8–12 kişilik deneme oyunu (2 krallık, 2 tur) — gıda dengesi ve Hazine Masası hızı test edilir
- [ ] **1 hafta önce:** Denemeye göre sayılar ayarlanır; takımlar kurulur; skor sheet'i hazırlanır
- [ ] **Oyun günü −2 saat:** Sandıklar yerleştirilir, krallık kitleri ve üretim zarfları hazırlanır, projeksiyon test edilir

### Netleşmesi gerekenler

1. **Deneme oyunu yapılabilecek mi?** En çok bu önerilir. Sayılar (gıda 42/42, yapı maliyetleri) kağıt üzerinde dengeli ama hiç oynanmadı.
2. **Yarışma: tahta mı, Kahoot mu?** Katın internet ve projeksiyon durumuna göre karar verilir.
3. **Krallık isimleri:** Şimdilik yön adları kullanılıyor. Yurda özel, komik isimler draft'ı daha eğlenceli yapar.
4. **Dijital uygulama ilk oyunda gerekli mi?** Bu planda gerekli değil. İkinci oyuna yapılacaksa ilk modül “tescil + skor ekranı” olmalı.
