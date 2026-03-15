# Dağıtım Kılavuzu

Bu repo, `tetris.io` kök alan adında web uygulamasını ve `ws.tetris.io` alt alan adında gerçek zamanlı socket servisinin çalışmasını hedefler.

## Önerilen dağıtım mimarisi

- Web uygulaması: Vercel
- Socket servisi: Render, Railway, Fly.io veya Docker destekli benzer bir servis
- Veritabanı: Yönetilen PostgreSQL
- E-posta: SMTP destekleyen bir sağlayıcı

## Alan adı düzeni

- `https://tetris.io` → Next.js web uygulaması
- `https://www.tetris.io` → `https://tetris.io` yönlendirmesi
- `https://ws.tetris.io` → Socket servisi

## Web uygulaması ortam değişkenleri

```env
DATABASE_URL=postgresql://...
NEXT_PUBLIC_APP_URL=https://tetris.io
NEXT_PUBLIC_SOCKET_URL=https://ws.tetris.io
APP_SECRET=buraya-uzun-ve-guclu-bir-gizli-anahtar
ALLOWED_ORIGINS=https://tetris.io,https://www.tetris.io,https://ws.tetris.io
SMTP_HOST=...
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
SMTP_FROM=Lunara <no-reply@tetris.io>
```

## Socket servisi ortam değişkenleri

```env
DATABASE_URL=postgresql://...
NEXT_PUBLIC_APP_URL=https://tetris.io
NEXT_PUBLIC_SOCKET_URL=https://ws.tetris.io
APP_SECRET=buraya-uzun-ve-guclu-bir-gizli-anahtar
SOCKET_PORT=3001
ALLOWED_ORIGINS=https://tetris.io,https://www.tetris.io
```

## Vercel tarafı

1. GitHub reposunu Vercel’e bağla.
2. Kök proje olarak bu dizini seç.
3. Yukarıdaki web ortam değişkenlerini gir.
4. Özel alan adı olarak `tetris.io` ve `www.tetris.io` ekle.
5. `www.tetris.io` için kök domaine yönlendirme tanımla.

## Socket servisi tarafı

1. Aynı GitHub reposunu socket servisine bağla.
2. Docker dosyası olarak `Dockerfile.socket` kullan.
3. Sağlık kontrolü için `/health` yolunu tanımla.
4. Ortam değişkenlerini gir.
5. Özel alan adı olarak `ws.tetris.io` ekle.

## Dağıtımdan sonra kontrol listesi

1. `https://tetris.io/api/health` yanıt veriyor mu kontrol et.
2. `https://ws.tetris.io/health` yanıt veriyor mu kontrol et.
3. Kayıt ol, doğrulama e-postası al ve giriş yap.
4. Tek kişilik bir seans bitirip progression kaydı oluştuğunu doğrula.
5. İki farklı hesap ile online odaya girip set akışını test et.
6. Turnuvaya katılım ve profil güncellemelerini doğrula.
