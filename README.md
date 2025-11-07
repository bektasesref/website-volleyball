# Online Turnuva Kura - Voleybol

Next.js ile oluşturulmuş 12 kişilik voleybol takımı için çevrim içi kura ve All-Star oylama uygulaması.

## Özellikler

- 🎲 **Haftalık Kura Yönetimi**: Katılımcı listesinden 12 oyuncu rastgele seçilir, kura yapan kişi ve tarih MongoDB'ye kaydedilir.
- 🗂️ **Kura Geçmişi**: Önceki kuraları API üzerinden çekerek header'da en güncel sonucu ve detaylı geçmiş listesini gösterir.
- 🗳️ **All-Star Oylaması**: Gizli oy mantığıyla 12 kişilik All-Star kadrosu seçilir, oy dağılımı ve tarihçesi tutulur.
- ✨ **Animasyonlu ve Modern UI**: Framer Motion animasyonları, Tailwind CSS + shadcn/ui bileşenleri.
- 📤 **Paylaşım Araçları**: Kura sonucunu metin olarak kopyala, WhatsApp'ta paylaş veya görsel olarak indir.
- 🔒 **Tip Güvenliği**: Zod, Axios ve TypeScript ile uçtan uca typed API iletişimi.

## Teknik Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** + **shadcn/ui**
- **Framer Motion** (animasyonlar)
- **Axios** + **Zod** (typed API katmanı)
- **Mongoose** + **MongoDB Atlas** (kalıcı veri)
- **date-fns** (tarih formatlama)
- **html2canvas** (paylaşılabilir görsel üretimi)

## Kurulum

```bash
# Bağımlılıkları yükle
npm install

# Development server'ı başlat
npm run dev
```

Uygulama `http://localhost:3000` adresinde çalışacaktır.

### Ortam Değişkenleri

`.env.local` dosyanızda aşağıdaki değişkenlerin tanımlı olduğundan emin olun:

```env
MONGODB_URI="<atlas bağlantınız>"
NEXT_PUBLIC_API_BASE_URL="http://localhost:3000"
```

Opsiyonel olarak `MONGODB_DB_NAME` tanımlayarak varsayılan veritabanı adını değiştirebilirsiniz.

### Veritabanı

Uygulama bağlantı sırasında istemci tarafında otomatik olarak MongoDB Atlas kümesine bağlanır. Mevcut modeller:

- `Draw`: kura sonucu, sorumlu oyuncu, ana ve yedek oyuncu listeleri
- `AllStarBallot`: oyunuzu kullanan oyuncu, 12 kişilik tercih listesi, tarih

`lib/db.ts` bağlantıyı cache'leyerek sunucu tarafında tekrar kullanır.

## Kullanım

### Kura Sekmesi

1. Katılımcı listesini kontrol edin, bu haftanın oyuncularını işaretleyin (varsayılan olarak herkes seçili gelir).
2. "Kura Çek" butonuna tıklayın, açılan pencerede kurayı başlatan kişiyi seçin.
3. Kura MongoDB'ye kaydedilir; seçilen 12 oyuncu ve yedekler ekranda, başlıkta ise sorumlu ve tarih bilgisi görünür.
4. Sonucu metin olarak kopyalayın, WhatsApp'ta paylaşın veya görsel olarak dışa aktarın.
5. "Geçmiş Kuraları Göster" alanından önceki çekilişleri inceleyin.

### All-Star Sekmesi

1. Oy kullanacak kişiyi açılır menüden seçin (kendi adınıza oy kullanamazsınız).
2. Maksimum 12 oyuncu seçerek All-Star kadronuzu oluşturun.
3. "Oyumu Gönder" diyerek oyu kaydedin. Sistem aynı oyuncu adına tekrar oy kullanılmasını engeller.
4. Sonuç kartında toplam oy sayısını ve oy dağılımını takip edin, gerektiğinde geçmiş oyları listeleyin.

## Oyuncu Listesini Güncelleme

Oyuncu isimlerini güncellemek için `constants/players.ts` dosyasını düzenleyin:

```typescript
export const ALL_PLAYERS = [
  { id: 1, name: "Oyuncu 1" },
  { id: 2, name: "Oyuncu 2" },
  // ... gerçek isimler
];
```

## Manuel Doğrulama Listesi

- [ ] Varsayılan oyuncu listesi ile kura çekilerek sonuçların paylaşım seçenekleri denenir.
- [ ] Kurayı başlatan kişi seçildiğinde kayıt MongoDB Atlas üzerinde doğrulanır (`Draw` koleksiyonu).
- [ ] All-Star sekmesinde 12 farklı oyuncu seçilerek oy kullanılır, oy dağılımı güncellenir.
- [ ] Aynı oyuncu için ikinci oy denemesinde API'den 409 hatası alındığı ve UI'da mesaj gösterildiği doğrulanır.
- [ ] "Geçmiş Kuraları Göster" ve "Geçmiş Oyları Göster" butonları listeleri doğru biçimde açıp kapatır.

## Lisans

MIT
