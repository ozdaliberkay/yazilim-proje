# 6 Sefer ile Kelime Ezberleme Sistemi

İngilizce kelime öğrenmeyi kolaylaştıran, aralıklı tekrar (spaced repetition) algoritmasına dayalı bir web uygulaması.

## Özellikler

- **Kullanıcı Yönetimi:** Kayıt, giriş ve şifre sıfırlama
- **Kelime Kütüphanesi:** Kelime ekleme, örnek cümle ve görseller ile zenginleştirilmiş içerik
- **Sınav Modülü:** 6 seferlik aralıklı tekrar algoritması (1 gün → 1 hafta → 1 ay → 3 ay → 6 ay → 1 yıl)
- **Analiz Raporu:** Konu bazlı başarı istatistikleri ve yazdırılabilir raporlar
- **Bulmaca (Wordle):** Öğrenilen kelimelerden oluşturulan kelime bulmacası
- **Word Chain Hikaye:** Kelime zinciri ile hikaye oluşturma ve görselleştirme

## Teknolojiler

- **Framework:** Next.js (App Router)
- **Veritabanı:** SQLite (better-sqlite3)
- **Dil:** TypeScript
- **Stil:** CSS

## Kurulum

```bash
npm install
npm run dev
```

Tarayıcıda [http://localhost:3000](http://localhost:3000) adresini açın.

## Proje Yapısı

```
src/
├── app/           # Sayfa bileşenleri (App Router)
│   ├── auth/      # Giriş, kayıt, şifre sıfırlama
│   ├── words/     # Kelime kütüphanesi
│   ├── quiz/      # Sınav modülü
│   ├── analysis/  # Analiz raporu
│   ├── puzzle/    # Wordle bulmacası
│   ├── story/     # Word chain hikaye
│   └── settings/  # Kullanıcı ayarları
├── components/    # Ortak bileşenler
└── lib/           # Veritabanı ve server action'ları
```
