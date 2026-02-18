const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// --- AYARLAR ---
const API_KEY = process.env.API_KEY;
const TARGET_GROUP_ID = process.env.GROUP_ID;
const ADMIN_NUMBER = process.env.ADMIN_NUMBER;

// --- SYSTEM PROMPT ---
const SYSTEM_PROMPT = `
Sen SKY LAB Kulübü'nün resmi WhatsApp Duyuru Botusun. 
Görevin: Kullanıcıdan gelen ham metinleri profesyonel, ilgi çekici ve emojilerle desteklenmiş duyuru metinlerine dönüştürmektir.

KESİN KURALLAR:
1. Asla küfür, argo veya hakaret içerikli kelimeler kullanma.
2. Hassas veriler (kişisel telefon numaraları, özel adresler) hakkında duyuru yapma.
3. Siyaset, din veya tartışmalı toplumsal konulara girme.
4. Yanıtlarını her zaman nazik ve kurumsal bir dille (YTÜ SKY LAB vizyonuna uygun) hazırla.
5. Eğer gelen istek bu kurallara aykırıysa, tam olarak şu metni döndür: ICERIK_REDDEDILDI
`;

// --- BAŞLANGIÇ KONTROLLERİ ---
if (!API_KEY) {
    console.error("HATA: API_KEY bulunamadı! Lütfen .env dosyanızı kontrol edin.");
    process.exit(1);
}
if (!ADMIN_NUMBER) {
    console.error("HATA: ADMIN_NUMBER bulunamadı! Lütfen .env dosyanızı kontrol edin.");
    process.exit(1);
}

// --- AI KURULUMU ---
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: SYSTEM_PROMPT
});

// --- CHROME PATH (Linux/Windows uyumlu) ---
function getChromePath() {
    const platform = process.platform;
    if (platform === 'win32') {
        return 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    }
    // Linux: önce Chromium, sonra Chrome dene
    const { execSync } = require('child_process');
    const paths = [
        '/usr/bin/chromium-browser',
        '/usr/bin/chromium',
        '/usr/bin/google-chrome',
        '/usr/bin/google-chrome-stable',
    ];
    for (const p of paths) {
        try {
            execSync(`test -f ${p}`);
            return p;
        } catch (_) { }
    }
    // Bulunamazsa puppeteer'ın kendi Chromium'unu kullan
    return undefined;
}

// --- WHATSAPP CLIENT KURULUMU ---
const puppeteerArgs = [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--disable-features=site-per-process',
];

const chromePath = getChromePath();
const puppeteerConfig = chromePath
    ? { headless: true, executablePath: chromePath, args: puppeteerArgs }
    : { headless: true, args: puppeteerArgs };

const client = new Client({
    authStrategy: new LocalAuth(),
    webVersionCache: {
        type: 'remote',
        remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html',
    },
    puppeteer: puppeteerConfig
});

// Taslak: her kullanıcı için ayrı (Map ile)
const pendingAnnouncements = new Map();

console.log('SKY LAB Bot başlatılıyor...');

client.on('qr', (qr) => {
    console.log('QR KODU OKUTUNUZ:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Bot başarıyla bağlandı!');
    console.log('------------------------------------------------');
    console.log(`Yetkili Yönetici: ${ADMIN_NUMBER}`);
    console.log(`Hedef Grup ID: ${TARGET_GROUP_ID || 'Henüz Ayarlanmadı'}`);
    console.log(`Chrome Path: ${chromePath || 'Puppeteer varsayılanı'}`);
    console.log('------------------------------------------------');
});

client.on('auth_failure', (msg) => {
    console.error('Kimlik doğrulama hatası:', msg);
});

client.on('disconnected', (reason) => {
    console.warn('Bot bağlantısı kesildi:', reason);
});

// --- ADMIN KONTROLÜ ---
function isAdmin(from) {
    return from === ADMIN_NUMBER || from.includes(ADMIN_NUMBER.replace('@c.us', ''));
}

// --- MESAJ İŞLEYİCİ ---
async function handleMessage(msg) {
    // Kendi gönderdiğimiz mesajları yoksay
    if (msg.fromMe) return;

    const from = msg.from;
    const messageBody = msg.body ? msg.body.trim() : '';

    if (!messageBody) return;

    console.log(`[${new Date().toLocaleTimeString('tr-TR')}] Mesaj | Kimden: ${from} | İçerik: "${messageBody}"`);

    // --- GRUP KOMUTU (.grup) — Sadece grup içinde, herkese açık ---
    const chat = await msg.getChat();
    if (messageBody === '.grup') {
        if (chat.isGroup) {
            msg.reply(`Bu grubun ID'si:\n\`${chat.id._serialized}\`\n\nBu ID'yi .env dosyasına GROUP_ID olarak ekleyin.`);
        } else {
            msg.reply('Bu komutu sadece bir grup içinde kullanabilirsiniz.');
        }
        return;
    }

    // --- Grup mesajlarını yoksay (geri kalan her şey özel mesaj) ---
    if (chat.isGroup) return;

    // --- ADMIN KONTROLÜ ---
    if (!isAdmin(from)) {
        console.log(`Yetkisiz erişim denemesi: ${from}`);
        msg.reply('Bu botu kullanma yetkiniz bulunmamaktadır.');
        return;
    }

    // --- İPTAL ---
    if (messageBody.toLowerCase() === '.iptal') {
        pendingAnnouncements.delete(from);
        msg.reply('Taslak silindi. Yeni bir metin gönderebilirsiniz.');
        return;
    }

    // --- ONAY / GÖNDER ---
    if (messageBody.toLowerCase() === '.onay' || messageBody.toLowerCase() === '.gonder') {
        const pending = pendingAnnouncements.get(from);
        if (!pending) {
            msg.reply('Gönderilecek bir taslak yok. Lütfen önce duyuru metnini yazın.');
            return;
        }
        if (!TARGET_GROUP_ID) {
            msg.reply('HATA: Hedef Grup ID ayarlanmamis! .env dosyasini kontrol edin.');
            return;
        }
        try {
            await client.sendMessage(TARGET_GROUP_ID, pending);
            msg.reply('Duyuru basariyla yayinlandi!');
            pendingAnnouncements.delete(from);
        } catch (error) {
            console.error('Gönderim hatası:', error);
            msg.reply('Duyuru gonderilirken bir hata olustu. Lutfen tekrar deneyin.');
        }
        return;
    }

    // --- TASLAK GÖSTER ---
    if (messageBody.toLowerCase() === '.taslak') {
        const pending = pendingAnnouncements.get(from);
        if (!pending) {
            msg.reply('Henüz bir taslak yok.');
        } else {
            msg.reply(`*Mevcut Taslak:*\n\n${pending}`);
        }
        return;
    }

    // --- Nokta ile başlayan bilinmeyen komutlar ---
    if (messageBody.startsWith('.')) {
        msg.reply('Bilinmeyen komut. Komutlar:\n*.onay* — Taslagi gonder\n*.iptal* — Taslagi sil\n*.taslak* — Mevcut taslagi goster');
        return;
    }

    // --- AI İŞLEME ---
    await msg.reply('SKY LAB Asistani metnini duzenliyor, lutfen bekle...');

    try {
        const result = await model.generateContent(messageBody);
        const response = await result.response;
        const formattedText = response.text().trim();

        // Güvenilir ret kontrolü
        if (formattedText.includes('ICERIK_REDDEDILDI')) {
            msg.reply('Uzgunum, bu icerigi bir duyuruya donusturemem. Lutfen uygun bir metin girin.');
            return;
        }

        pendingAnnouncements.set(from, formattedText);

        await client.sendMessage(
            from,
            `*Taslak Hazirlandi:*\n\n${formattedText}\n\n------------------\n\nGondermek icin: *.onay*\nSilmek icin: *.iptal*\nDegistirmek icin yeni metni yaz`
        );

    } catch (error) {
        console.error("Gemini API Hatası:", error);
        msg.reply('Yapay zeka servisine baglanirken bir hata olustu. Lutfen tekrar dene.');
    }
}

// Sadece gelen mesajları dinle (message_create çift işlemeyi önlemek için kaldırıldı)
client.on('message', handleMessage);

client.initialize();