# Lunara

Lunara; browser tabanlı, premium hisli, uzun ömürlü oynanışa odaklanan blok düşürme oyunu ve tam kapsamlı oyun platformudur. Tek kişilik modlar, progression katmanı, görevler, başarımlar, koleksiyon vitrinleri, güvenli üyelik akışları, canlı 1v1 set sistemi ve turnuva omurgası aynı repo içinde birleşir.

## Teknoloji kararı

- `Next.js 16 + App Router`: modern route mimarisi, server component desteği ve deploy kolaylığı
- `React 19 + TypeScript strict`: güvenli, modüler ve ölçeklenebilir UI ve oyun entegrasyonu
- `Tailwind CSS 4 + özel token sistemi`: premium görünüm ve sürdürülebilir tema katmanı
- `Zustand`: hafif ama güçlü istemci state yönetimi
- `Prisma + PostgreSQL`: üretime uygun kalıcılık ve okunabilir veri modeli
- `Socket.IO`: canlı 1v1 oda, reconnect, raund ve set senkronizasyonu
- `Vitest`: oyun motoru, progression, auth, persistence ve multiplayer testleri

## Ana klasör yapısı

```text
app/
components/
features/
game-engine/
multiplayer/
progression/
achievements/
quests/
collections/
profile/
settings/
statistics/
audio/
persistence/
auth/
server/
db/
hooks/
store/
services/
data/
constants/
theme/
types/
tests/
prisma/
```

## Öne çıkan sistemler

- Modlar: `Klasik`, `Rahat`, `Zen`, `Sprint`, `Görev`, `Günlük Challenge`, `Düello`
- Oyun motoru: hold, next queue, ghost piece, combo, back-to-back, perfect clear, gravity, lock delay
- Progression: XP, level, yıldız, günlük seri, görev ve başarım senkronu
- Koleksiyon: kuşanılabilir kozmetikler, favorileme, yeni işaretleri
- Auth: kayıt, giriş, oturum, parola sıfırlama, e-posta doğrulama
- Hesap merkezi: parola değiştirme, kayıt dışa ve içe aktarma, kontrollü ilerleme sıfırlama
- Online: hızlı eşleşme, özel oda, set skoru, reconnect, raund arası geçiş ve garbage iletimi
- Turnuvalar: liste, detay, katılım, geçmiş, bracket veya puan tablosu görünümü
- PWA: manifest ve istemci taraflı service worker kaydı

## Hızlı başlangıç

1. Bağımlılıkları yükle:

```bash
npm install
```

2. Ortam değişkenlerini hazırla:

```bash
copy .env.example .env
```

3. Veritabanını ayağa kaldır:

```bash
npm run db:up
```

4. Prisma istemcisini üret, migration çalıştır ve seed verisini işle:

```bash
npm run db:setup
```

5. Web ve socket sunucusunu birlikte başlat:

```bash
npm run dev:full
```

## Geliştirme komutları

```bash
npm run dev
npm run dev:socket
npm run dev:full
npm run start:socket
npm run db:up
npm run db:down
npm run db:reset
npm run db:setup
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run typecheck
npm run lint
npm run test
npm run build
```

## Çalışma akışı

- Web uygulaması: [http://localhost:3000](http://localhost:3000)
- Socket sunucusu: [http://localhost:3001](http://localhost:3001)
- PostgreSQL: `localhost:5432`
- Auth, progression, bildirimler ve turnuva akışlarının tam çalışması için PostgreSQL bağlantısı gerekir
- SMTP değişkenleri sağlanırsa doğrulama ve parola sıfırlama e-postaları gerçek gönderim yapar
- Hesap sayfası üzerinden JSON tabanlı kayıt yedeği indirilebilir ve tekrar içe aktarılabilir

## Canlı 1v1 notu

- Hazır olan iki oyuncu ilk raundu birlikte başlatır
- Düello yapısı `best-of` set mantığı ile çalışır
- Raund kaybı sonrası set bitmediyse yeni raund otomatik zamanlayıcı ile açılır
- Bağlantısı kopan oyuncu 60 saniye içinde dönmezse set rakibe yazılır
- Oda, katılımcı ve set skoru verisi veritabanına da senkronize edilir

## Veritabanı omurgası

Temel modeller:

- `User`, `Profile`, `Session`
- `VerificationToken`, `PasswordResetToken`
- `UserSettings`, `UserStatistics`, `UserProgression`
- `Cosmetic`, `UserCosmetic`
- `UserQuestProgress`, `UserAchievementProgress`
- `GameSession`, `OnlineMatch`, `OnlineMatchParticipant`
- `Tournament`, `TournamentEntry`, `TournamentMatch`
- `DailyRewardClaim`, `Notification`

## Dağıtım notu

- Web katmanı Vercel benzeri ortamlara uygundur
- Socket sunucusu ayrı bir Node süreci olarak çalıştırılır
- `APP_SECRET`, `DATABASE_URL` ve SMTP bilgileri üretim ortamında secret yönetimi ile sağlanmalıdır
- Alan adı ve üretim açılışı için ayrıntılı rehber `DEPLOYMENT.md` içindedir

## Test kapsamı

- Oyun motoru başlangıç ve sert bırakma akışları
- Progression XP ve level hesabı
- Auth token hash davranışı
- Oda yöneticisi eşleşme, raund ve bağlantı kopma davranışı
- Kayıt dışa aktarma şeması doğrulaması
