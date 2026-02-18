# SKY LAB WhatsApp Duyuru Botu — Kurulum Rehberi

Bu rehber botu üç farklı ortamda nasıl kuracağınızı adım adım açıklar.

---

## Önce Yapılması Gerekenler (Her Ortam İçin Ortak)

### 1. Google Gemini API Anahtarı Alın

1. https://aistudio.google.com/app/apikey adresine gidin
2. Google hesabınızla giriş yapın
3. "Create API Key" butonuna tıklayın
4. Oluşan anahtarı kopyalayıp saklayın (örnek: `AIzaSyXXXXXXXXXXXXXXXX`)

### 2. Bot için Ayrı WhatsApp Numarası Hazırlayın

- Botun kendi WhatsApp hesabı olması gerekir
- SKY LAB'a özel ayrı bir SIM kart edinilmesi önerilir
- Bu numara hem bot olarak çalışacak hem de admin numaranıza özel mesaj gönderecektir

### 3. Admin Numaranızı Öğrenin

WhatsApp numarası formatı: `90XXXXXXXXXX@c.us`

Örnek: `905551234567@c.us` (başında 0 olmadan, ülke kodu ile)

---

## Seçenek A: Windows PC (Yerel Kurulum)

En hızlı başlangıç yöntemidir. Bilgisayar açık olduğu sürece bot çalışır.

### Gereksinimler

- Windows 10/11
- Node.js 18 veya üzeri → https://nodejs.org
- Google Chrome (zaten kuruluysa atla)

### Kurulum Adımları

```
1. Projeyi indirin veya klonlayın:
   git clone https://github.com/KULLANICI/skylabAiBot.git
   cd skylabAiBot

2. Bağımlılıkları yükleyin:
   npm install

3. .env dosyasını oluşturun (.env.example'ı kopyalayın):
   copy .env.example .env

4. .env dosyasını Not Defteri ile açıp doldurun:
   API_KEY=AIzaSyXXXXXXXXXXXXXXXX
   GROUP_ID=120363XXXXXXXXXX@g.us
   ADMIN_NUMBER=905551234567@c.us

5. Botu başlatın:
   npm start

6. Terminalde QR kodu görünecek.
   Botun WhatsApp numarasına bağlı telefonu açın.
   WhatsApp > Ayarlar > Bağlı Cihazlar > Cihaz Ekle
   QR'ı okutun. Bot "Bot başarıyla bağlandı!" yazınca hazır.
```

### Grup ID Nasıl Öğrenilir?

1. Botu (botun numarasını) hedef WhatsApp grubuna ekleyin
2. Grup içinde `.grup` yazın
3. Bot ID'yi gönderir, bunu `.env` dosyasındaki `GROUP_ID` alanına yapıştırın
4. Botu yeniden başlatın: Ctrl+C ardından `npm start`

### Windows'ta Arka Planda Çalıştırmak (Opsiyonel)

Terminali kapatınca bot durmasın istiyorsanız `pm2` kullanın:

```
npm install -g pm2
pm2 start bot.js --name skylab-bot
pm2 save
pm2 startup
```

---

## Seçenek B: Linux VPS (7/24 Production Kurulum)

Hetzner, DigitalOcean, Contabo veya herhangi bir Ubuntu sunucu.
Önerilen minimum sunucu: 1 vCPU, 2GB RAM, Ubuntu 22.04

### Sunucu Kurulumu

Sunucuya SSH ile bağlanın, ardından sırasıyla şunları çalıştırın:

```bash
# Sistemi güncelleyin
sudo apt update && sudo apt upgrade -y

# Node.js 18 yükleyin
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Chromium yükleyin (WhatsApp web için gerekli)
sudo apt install -y chromium-browser

# Git yükleyin (yoksa)
sudo apt install -y git

# Versiyonları kontrol edin
node -v    # v18.x.x görünmeli
npm -v
chromium-browser --version
```

### Proje Kurulumu

```bash
# Projeyi çekin
git clone https://github.com/KULLANICI/skylabAiBot.git
cd skylabAiBot

# Bağımlılıkları yükleyin
npm install

# .env dosyasını oluşturun
cp .env.example .env
nano .env
```

nano editörü açılınca şu değerleri girin:

```
API_KEY=AIzaSyXXXXXXXXXXXXXXXX
GROUP_ID=120363XXXXXXXXXX@g.us
ADMIN_NUMBER=905551234567@c.us
```

Kaydetmek için: Ctrl+O → Enter → Ctrl+X

### İlk Çalıştırma ve QR Okutma

QR kodu terminalde görmek için önce manuel başlatın:

```bash
node bot.js
```

QR kodu terminalde görünecektir (ASCII karakter QR). Bunu okutmak için:

- Telefonunuzda WhatsApp uygulamasını açın
- Ayarlar > Bağlı Cihazlar > Cihaz Ekle
- Terminaldeki QR'ı okutun

"Bot başarıyla bağlandı!" mesajını gördükten sonra Ctrl+C ile durdurun.

### PM2 ile Sürekli Çalıştırma (Sunucu restart'ta da başlar)

```bash
# PM2 yükleyin
sudo npm install -g pm2

# Botu PM2 ile başlatın
pm2 start bot.js --name skylab-bot

# Sunucu yeniden başlayınca otomatik başlasın
pm2 save
pm2 startup
# Çıkan komutu kopyalayıp çalıştırın (sudo ile başlar)

# Durum kontrolü
pm2 status

# Logları görüntüle
pm2 logs skylab-bot

# Botu yeniden başlat
pm2 restart skylab-bot

# Botu durdur
pm2 stop skylab-bot
```

### Grup ID Öğrenme (Linux)

Botu gruba ekledikten sonra grup içinde `.grup` yazın, bot ID'yi gönderir.
Ardından `.env` dosyasını güncelleyip botu yeniden başlatın:

```bash
nano .env          # GROUP_ID satırını güncelleyin
pm2 restart skylab-bot
```

---

## Seçenek C: Railway (Cloud — Ücretsiz Başlangıç)

> **Uyarı:** Railway'in ücretsiz tier'ında disk kalıcılığı sınırlıdır.
> WhatsApp oturumu (`.wwebjs_auth/`) silinirse her deploy'da QR okutmanız gerekir.
> Bunu aşmak için Railway'de Volume bağlamanız gerekir (ücretli özellik).
> Bu nedenle Railway yerine Linux VPS önerilir.

Yine de denemek istiyorsanız:

1. https://railway.app adresine gidin, GitHub ile giriş yapın
2. "New Project" > "Deploy from GitHub repo" seçin
3. Repo'yu seçin
4. "Variables" sekmesinden şu değişkenleri ekleyin:
   - `API_KEY`
   - `GROUP_ID`
   - `ADMIN_NUMBER`
5. Deploy edin
6. "Logs" sekmesinden QR kodu görün ve okutun

---

## Kullanım

Bot çalıştıktan sonra yönetim tamamen **botun numarasına gönderilen özel mesajlar** üzerinden yapılır.

### Duyuru Gönderme Akışı

```
1. Botun numarasına özel mesaj olarak ham metni gönderin
   Örnek: "Yarın saat 14:00'da genel kurul toplantısı yapılacaktır"

2. Bot Gemini AI ile metni düzenleyip taslak olarak geri gönderir

3. Taslağı onaylamak için: .onay
   Reddetmek için: .iptal
   Yeniden düzenlemek için yeni metni gönderin
```

### Komut Listesi

| Komut | Açıklama |
|-------|----------|
| *(herhangi bir metin)* | AI ile düzenleyip taslak oluşturur |
| `.onay` veya `.gonder` | Taslağı hedef gruba gönderir |
| `.iptal` | Mevcut taslağı siler |
| `.taslak` | Mevcut taslağı tekrar gösterir |
| `.grup` | (Grup içinde kullanılır) Grubun ID'sini gösterir |

---

## Sorun Giderme

### QR kodu çıkmıyor / bağlanamıyor (Linux)

```bash
# Chromium kurulu mu kontrol edin
which chromium-browser
chromium-browser --version

# .wwebjs_auth ve cache klasörlerini silip tekrar deneyin
rm -rf .wwebjs_auth .wwebjs_cache
node bot.js
```

### "API_KEY bulunamadı" hatası

`.env` dosyasının proje klasöründe olduğundan ve doğru doldurulduğundan emin olun:

```bash
cat .env   # içeriği görüntüle
```

### Gemini API hatası

- API anahtarının geçerli olduğunu https://aistudio.google.com adresinden kontrol edin
- Ücretsiz tier için günlük istek limitini aşmış olabilirsiniz

### Bot mesaja yanıt vermiyor

- Admin numarasının `.env`'deki `ADMIN_NUMBER` ile birebir aynı olduğunu kontrol edin
- Format: `905551234567@c.us` (ülke kodu dahil, başında 0 yok, sonda `@c.us`)
- `pm2 logs skylab-bot` ile hata loglarına bakın

### Oturum süresi doldu / tekrar QR istiyor

```bash
pm2 stop skylab-bot
rm -rf .wwebjs_auth
pm2 start skylab-bot
# QR'ı tekrar okutun
```

---

## Proje Yapısı

```
skylabAiBot/
├── bot.js              # Ana bot kodu
├── package.json        # Proje bağımlılıkları
├── package-lock.json   # Bağımlılık kilit dosyası
├── .env.example        # Ortam değişkenleri şablonu
├── .gitignore          # Git'e eklenmeyecek dosyalar
│
│   # Aşağıdakiler repoda BULUNMAZ, kurulum sonrası oluşur:
├── .env                # Gerçek ortam değişkenleri (git'e eklenmez!)
├── node_modules/       # npm install ile kurulur (git'e eklenmez!)
└── .wwebjs_auth/       # WhatsApp oturum verileri (git'e eklenmez!)
```

---

## Önemli Notlar

- Bot yalnızca admin numarasından gelen özel mesajları işler
- Grup ID ve Admin numarası değiştirilirse botu yeniden başlatmak gerekir
- WhatsApp oturumu `.wwebjs_auth/` klasöründe saklanır; bu klasör silinirse QR tekrar okutulmalıdır
- Gemini API ücretsiz tier günlük 1500 istek ile sınırlıdır, kulüp kullanımı için yeterlidir#   W P _ A I _ D u y u r u _ B o t u  
 