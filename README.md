# SKY LAB WhatsApp Duyuru Botu

YTU SKY LAB Kulubu icin gelistirilmis, **Google Gemini AI** destekli WhatsApp duyuru botudur.  
Ham metinleri profesyonel duyuru metinlerine donusturur ve belirlenen WhatsApp grubuna gonderir.

---

## Ozellikler

- Gemini AI ile otomatik duyuru metni olusturma
- Sadece yetkili admin kullanabilir
- Onay/iptal mekanizmasi (yanlislikla gonderimi onler)
- Kufur, siyaset, hassas veri iceriklerini otomatik filtreler
- Windows ve Linux uyumlu
- WhatsApp QR ile kolay giris ve oturum saklama

---

## Gereksinimler

| Gereksinim | Versiyon |
|---|---|
| Node.js | >= 18.0.0 |
| Google Chrome / Chromium | Guncel surum |
| Google Gemini API Anahtari | — |
| Ayri bir WhatsApp numarasi (bot icin) | — |

---

## Kurulum

### 1. Repoyu klonlayin

```bash
git clone https://github.com/KULLANICI_ADINIZ/skylabAiBot.git
cd skylabAiBot
```

### 2. Bagimliliklar yukleyin

```bash
npm install
```

### 3. Ortam degiskenlerini ayarlayin

```bash
# Windows
copy .env.example .env

# Mac / Linux
cp .env.example .env
```

`.env` dosyasini acip doldurun:

```
API_KEY=BURAYA_GEMINI_API_ANAHTARINIZI_YAZIN
GROUP_ID=BURAYA_GRUP_ID_YAZIN
ADMIN_NUMBER=905XXXXXXXXX@c.us
```

| Degisken | Aciklama |
|---|---|
| `API_KEY` | [Google AI Studio](https://aistudio.google.com/app/apikey) adresinden ucretsiz alinir |
| `GROUP_ID` | Duyurularin gonderilecegi WhatsApp grubu ID'si |
| `ADMIN_NUMBER` | Botu yonetecek kisinin numarasi — ornek: `905551234567@c.us` |

### 4. Botu baslatin

```bash
npm start
```

Ilk calistirmada terminalde bir **QR kodu** gorunecektir.  
Bu QR'i botun kullanacagi WhatsApp hesabiyla okutun.  
Oturum `.wwebjs_auth/` klasorunde saklanir, bir sonraki calistirmada QR gerekmez.

---

## Kullanim

Bot calistiktan sonra **botun numarasina ozel mesaj** gondererek yonetim yapilir.

### Adim Adim

1. Botun numarasina ham metni gonderin
   > *Ornek: "Yarin saat 14:00'da toplanti var"*
2. Bot metni AI ile duzenleyip **taslak** olarak geri gonderir
3. Taslagi onaylamak icin `.onay` yazin — duyuru gruba gonderilir
4. Begenmediyseni yeni metin gonderin ya da `.iptal` yazin

### Komutlar

| Komut | Aciklama |
|---|---|
| *(herhangi bir metin)* | AI ile duzenleyip taslak olusturur |
| `.onay` veya `.gonder` | Taslagi hedef gruba gonderir |
| `.iptal` | Mevcut taslagi siler |
| `.taslak` | Mevcut taslagi tekrar gosterir |
| `.grup` | (Grup icinde) Grubun ID'sini gosterir |

---

## Grup ID Nasil Ogrenilir?

1. Botu hedef WhatsApp grubuna ekleyin
2. Grup icinde `.grup` yazin
3. Bot ID'yi mesaj olarak gonderir
4. Bu ID'yi `.env` dosyasindaki `GROUP_ID` alanina yapistirin
5. Botu yeniden baslatin

---

## Linux Sunucu Kurulumu (7/24)

```bash
# Chromium yukle
sudo apt update && sudo apt install -y chromium-browser

# Bagimliliklar
npm install

# PM2 ile surdurulebilir calistirma
sudo npm install -g pm2
pm2 start bot.js --name skylab-bot
pm2 save
pm2 startup
```

---

## Proje Yapisi

```
skylabAiBot/
├── bot.js              # Ana bot kodu
├── package.json        # Proje bagimliliklar
├── package-lock.json   # Bagimlilik kilit dosyasi
├── .env.example        # Ortam degiskenleri sablonu
├── .gitignore          # Git'e eklenmeyecek dosyalar
│
│   # Asagidakiler repoda BULUNMAZ:
├── .env                # Gercek ortam degiskenleri (git'e eklenmez!)
├── node_modules/       # npm install ile kurulur
└── .wwebjs_auth/       # WhatsApp oturum verileri
```

---

## Sorun Giderme

**QR kodu cikmiyor / baglanamıyor:**
- Chrome/Chromium'un kurulu oldugunu kontrol edin
- `.wwebjs_auth/` ve `.wwebjs_cache/` klasorlerini silip tekrar deneyin

**Gemini API hatasi:**
- `API_KEY`'in dogru girildigini kontrol edin
- [Google AI Studio](https://aistudio.google.com/) uzerinden anahtarin aktif oldugunu dogrulayin

**Bot mesaja yanit vermiyor:**
- `ADMIN_NUMBER` formatinin `905551234567@c.us` seklinde oldugunu kontrol edin

---

## Lisans

Bu proje YTU SKY LAB Kulubu icin gelistirilmistir.
