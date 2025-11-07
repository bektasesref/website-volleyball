# Online Turnuva Kura & All-Star Platformu

12 kişilik voleybol grubu için haftalık kura çekimi, gizli All-Star oylaması, maç günü planlaması ve katılım takibini tek panelde yürüten Next.js uygulaması.

## Öne Çıkanlar

- 🎲 **Haftalık Kura Akışı**: Kesin katılacak oyuncular kilitlenir, kalan adaylardan kura çekilir; kurayı başlatan kişi modaldan belirlenir ve sonuç MongoDB’ye kaydedilir.
- 🗂️ **Kura Arşivi**: Header’da son kura özeti, açılır listede geçmiş detayları; ana kadro + yedekler ayrı tutulur.
- 🗳️ **All-Star Oylaması**: Her oyuncu 12 kişilik kadroya kendisini de dahil ederek gizli oy verebilir; sonuçlar sadece toplu istatistik olarak gösterilir.
- 🔐 **Gizli Oy Geçmişi**: Toplam oy veren sayısı görülebilir, kimlerin kimi seçtiği sistemde saklı kalır.
- 📅 **Haftalık Maç Günü Oylaması**: Oyuncular haftanın 7 gününden birini seçer; en çok oy alan gün ve oy dağılımı otomatik özetlenir.
- ✅ **Katılım Anketi & Kura Entegrasyonu**: Oyuncular “katılacağım / katılamayacağım” yanıtı verir; kura sekmesinde tek tıkla katılanlar aktarılır, katılamayanlar “Bu hafta yok” etiketiyle işaretlenir.
- ✨ **Modern UI/UX**: Blur’lu fotoğraf arka plan, Framer Motion animasyonları, shadcn/ui bileşenleri ve paylaşım aksiyonları.
- 🔄 **Typed API Katmanı**: Axios interceptor’lu istemci, Zod doğrulamaları ve TypeScript tipleri ile uçtan uca güvenli iletişim.

## Teknolojiler

- Next.js 14 (App Router, React 19)
- TypeScript
- Tailwind CSS & shadcn/ui
- Framer Motion
- Axios + Zod
- MongoDB Atlas + Mongoose
- date-fns, html2canvas

## Kurulum

```bash
npm install
npm run dev
```

Uygulama varsayılan olarak `http://localhost:3000` adresinde çalışır.

### Ortam Değişkenleri

`.env.local` dosyasına minimum şu değerler eklenmelidir:

```env
MONGODB_URI="<atlas bağlantınız>"
NEXT_PUBLIC_API_BASE_URL="http://localhost:3000"
# Opsiyonel: MONGODB_DB_NAME="volleyball"
```

### Veritabanı Yapısı

- `Draw` modeli: konduktör snapshot’ı, 12 kişilik ana kadro, yedekler ve haftalık cycle anahtarı.
- `AllStarBallot` modeli: oy veren snapshot’ı, 12 seçim ve birleştirilmiş sonuçlar için zaman damgası.
- `MatchDayVote` modeli: oy veren snapshot’ı, seçilen gün ve haftalık cycle anahtarı.
- `ParticipationStatus` modeli: oyuncu snapshot’ı, hafta bazlı katılım durumu ve zaman damgası.
- `lib/db.ts` tekil mongoose bağlantısını cache’ler.

## Kullanım Akışları

### 1. Haftalık Kura

1. Varsayılan olarak seçilmiş oyuncu listesini kontrol edin, gerekirse seçimleri değiştirin.
2. “Kura Çek” butonuna basın; açılan pencerede kurayı başlatan kişiyi seçin.
3. Sistem 12 kişilik ana kadro + yedekleri rastgele oluşturur, MongoDB’ye kaydeder ve anasayfayı günceller.
4. Sonucu kopyalayın, WhatsApp’ta paylaşın veya ekran görüntüsünü html2canvas ile alın.
5. “Geçmiş Kuraları Göster” ile önceki kayıtları listeleyin.

### 2. All-Star Oylaması

1. Oy verecek oyuncuyu drop-down’dan seçin (oy veren kişi kendisini de tercih listesine ekleyebilir).
2. 12 farklı oyuncuyu seçin; seçimler tekrarsız olmalıdır.
3. “Oyumu Gönder” ile API’ye gönderin. Aynı kişi aynı hafta tekrar oy kullanmaya çalışırsa 409 çatışma yanıtı döner.
4. Sonuç kartında toplam oy sayısı ve isimlere göre oy dağılımı görüntülenir.
5. “Geçmiş Oyları Göster” yalnızca toplam oy veren sayısını listeler, bireysel tercihleri gizli tutar.

### 3. Maç Günü Oylaması

1. "Maç Günü Oylaması" sekmesinde oy kullanacak oyuncuyu seçin.
2. Haftanın günlerinden birini işaretleyip "Tercihimi Kaydet" butonuna tıklayın.
3. Aynı hafta yeniden gönderirseniz önceki tercihiniz güncellenir.
4. Sonuç kartı o haftanın kazanan gününü, oy dağılımını ve toplam oy sayısını gösterir.
5. "Oy Geçmişini Göster" paneli kim, hangi gün için oy kullandı bilgisini listeler.

### 4. Katılım Anketi

1. "Katılım Anketi" sekmesinde adınızı seçin.
2. "Katılmak istiyorum" veya "Katılamıyorum" seçeneklerinden birini işaretleyip kaydedin.
3. Aynı hafta içinde yanıtınızı güncellediğinizde eski kayıt otomatik olarak yer değiştirir.
4. Özet kartı toplam katılan / katılamayan sayısını ve son güncellenme zamanını gösterir.
5. Kura sekmesindeki "Katılanları Doldur" butonu tek tıkla aday havuzunu katılacaklarla doldurur, "katılamıyorum" diyenler "Bu hafta yok" etiketiyle görünür.

## Geliştirme İpuçları

- Tipler `types/` altında, Zod şemaları `lib/validation/` klasöründe tutulur.
- İstemci tarafı veri çağrıları `services/` dizinindeki typed fonksiyonlar üzerinden yapılır.
- Paylaşım özelliği `components/ShareButtons.tsx` ile kopyalama, WhatsApp ve görsel çıkışı destekler.
- Arka plan görseli `public/images/bg.jpeg` ile blur + düşük opaklık gradient overlay kombinasyonu.

## Manuel Doğrulama

- [ ] Kura akışıyla yeni sonuç kaydedilir, header ve geçmiş güncellenir.
- [ ] Paylaşım butonları metin kopyalama / WhatsApp / görsel indirme adımlarını doğru yürütür.
- [ ] All-Star oylamasında aynı oyuncu için tekrarlı oy 409 hatası üretir.
- [ ] All-Star geçmiş paneli yalnızca toplam oy veren sayısını gösterir.
- [ ] Maç günü oylaması en çok oy alan günü doğru hesaplar, geçmiş listesi güncellenir.
- [ ] Katılım anketi yanıtları kura sekmesindeki "Katılanları Doldur" butonuyla aday havuzuna aktarılır; "katılamıyorum" diyenler "Bu hafta yok" etiketiyle görünür.
- [ ] MongoDB Atlas üzerinde `Draw`, `AllStarBallot`, `MatchDayVote` ve `ParticipationStatus` koleksiyonları kayıtları doğru saklar.

## Lisans

MIT
