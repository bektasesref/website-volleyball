# Online Turnuva Kura - Voleybol

Next.js ile oluşturulmuş 12 kişilik voleybol takımı için random kura çekimi uygulaması.

## Özellikler

- 🎲 **Random Kura Çekimi**: Seçilen oyuncular arasından 12 kişilik takım rastgele seçilir
- ✨ **Animasyonlu UI**: Framer Motion ile modern ve gerilimli animasyonlar
- 📱 **Responsive Tasarım**: Mobil ve masaüstü uyumlu
- 📤 **Paylaşım Özellikleri**: 
  - Sonuçları kopyala
  - WhatsApp ile paylaş
- 🎨 **Modern UI**: Tailwind CSS ve shadcn/ui ile tasarlandı

## Teknik Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui**
- **Framer Motion** (animasyonlar)
- **html2canvas** (ekran görüntüsü)

## Kurulum

```bash
# Bağımlılıkları yükle
npm install

# Development server'ı başlat
npm run dev
```

Uygulama `http://localhost:3000` adresinde çalışacaktır.

## Kullanım

1. Oyuncu listesinde bu haftaki maça katılacak oyuncuları işaretleyin
2. En az 12 oyuncu seçmeniz gerekir
3. "Kura Çek" butonuna tıklayın
4. Animasyonlu çekimin sonunda 12 seçilmiş oyuncuyu görün
5. Sonuçları paylaşın (Kopyala veya WhatsApp)

## Oyuncu Listesini Güncelleme

Oyuncu isimlerini güncellemek için `constants/players.ts` dosyasını düzenleyin:

```typescript
export const ALL_PLAYERS = [
  { id: 1, name: "Oyuncu 1" },
  { id: 2, name: "Oyuncu 2" },
  // ... gerçek isimler
];
```

## Lisans

MIT
