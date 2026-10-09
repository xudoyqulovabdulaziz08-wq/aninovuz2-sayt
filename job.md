# 📘 Aninovuz Backend — To'liq Loyiha Hujjati (job.md)

> **Oxirgi yangilanish:** 2026-10-07  
> **Worker URL:** `https://aninovuz-backend.xudoyqulovabdulaziz08.workers.dev`  
> **Holat:** Ishlamoqda ✅ (Auth va WebApp tizimi to'liq integratsiya qilindi)

---

## 🏗️ 1. Loyiha Nima Qiladi?

**Aninovuz Backend** — Cloudflare Workers ustida ishlaydigan anime platformasi uchun serverless API.

**Asosiy maqsad:** PostgreSQL bazasiga yuklamani minimal darajaga tushirish va Cloudflare KV/R2 limitlarini optimal tejash. Ma'lumotlar uch pog'onali tejamkor kesh tizimi orqali uzatiladi:

```
Foydalanuvchi
     │
     ▼ (1 daqiqa CDN Edge Cache — 0ms / 0 Worker load)
Cloudflare Worker (Hono)
     │
     ├─ 1. KV Kesh (5–10ms)     ← Eng tezkor (Faqat Hash o'zgarsa yoziladi)
     │      search_index.json, genres.json, dubbers.json
     │
     ├─ 2. R2 Bucket (40–80ms)  ← Katta hajmli ma'lumotlar (Cheksiz limit)
     │      homepage.json, anime.json, xotira/anime.json, posters/*.jpg
     │
     └─ 3. PostgreSQL Hyperdrive ← Faqat /auth/*, /sync va live ko'rishlar/reytingda
            (Aiven Cloud, SSL talab qiladi)
```

---

## 📁 2. Haqiqiy Fayllar Tuzilmasi (Kodga Mos)

```
aninovuz sayt/
├── wrangler.toml                        # Worker konfiguratsiyasi
├── package.json                         # hono, pg, pg-cloudflare, wrangler
├── job.md                               # Ushbu hujjat
└── src/
    ├── app.js                           # Kirish nuqtasi: CORS, routes, Cron scheduled
    ├── config/
    │   └── database.js                  # PostgreSQL client (Hyperdrive + retry + SSL)
    ├── controllers/
    │   ├── anime/
    │   │   ├── homepage.controller.js   # 8 blokli homepage (faqat R2 + CDN, DB yo'q)
    │   │   ├── search.controller.js     # Qidiruv: Priority Scoring + filtr + pagination
    │   │   ├── genres.controller.js     # Janrlar ro'yxati + multi-janr AND filtri
    │   │   ├── dubbers.controller.js    # Dubberlar ro'yxati + dubber bo'yicha filtr
    │   │   └── animedetail.controller.js # Anime detail: R2 + live DB stats + 20 tavsiya
    │   └── user/
    │       └── auth.controller.js       # Login (OTP), WebApp (initData), /me, Logout
    ├── middlewares/
    │   └── auth.middleware.js           # Gibrid JWT tekshiruvi: Bearer Header + Cookie
    ├── repositories/
    │   └── auth.repository.js           # Users jadvali bilan DB amallari (OTP, WebApp, last_active)
    ├── routes/
    │   ├── index.js                     # Markaziy API router — barcha guruhlar + aliaslar
    │   ├── auth.routes.js               # /api/auth/* (login, webapp, me, logout)
    │   ├── anime.routes.js              # /api/anime/* (homepage, search, genres, dubbers, :id)
    │   ├── xotira.routes.js             # /api/xotira/* (anime.json, search.json, sync)
    │   └── system.routes.js             # /api/system/* (health, test-db)
    ├── services/
    │   ├── storage.service.js           # R2 va KV bilan ishlash (save/get/hash check)
    │   ├── poster.service.js            # Posterlarni R2 ga yuklash (chunk = 5)
    │   └── sync.service.js             # DB → R2/KV kesh qayta qurish + background tasks
    └── utils/
        └── crypto.js                    # safeCompare, encryptFileId, verifyTelegramWebAppData
```

---

## ⚙️ 3. Konfiguratsiya (wrangler.toml)

```toml
name = "aninovuz-backend"
main = "src/app.js"
compatibility_date = "2026-09-21"
compatibility_flags = ["nodejs_compat"]   # pg kutubxonasi uchun shart

[[hyperdrive]]
binding = "HYPERDRIVE"
id = "b5426fc760f04f0c8381fa00f3a095c9"
# DB: Aiven Cloud PostgreSQL (SSL talab qiladi: sslmode=require)

[[r2_buckets]]
binding = "R2_BUCKET"
bucket_name = "aninovuz-bucket"

[[kv_namespaces]]
binding = "ANINOVUZ_KV"
id = "e598e583d53542b098551ad972e334ec"

[triggers]
crons = ["*/10 * * * *"]   # Har 10 daqiqada keshni yangilaydi
```

### Maxfiy kalitlar (Secrets)

| O'zgaruvchi | Turi | Vazifasi |
|---|---|---|
| `SYNC_SECRET_KEY` | Secret | `/sync` endpointini himoyalash uchun admin token |
| `BOT_TOKEN` | Secret | Telegram API orqali poster yuklash |
| `CDN_BASE_URL` | Var | Poster CDN manzili (default: `https://cdn.aninov.uz`) |

```bash
npx wrangler secret put SYNC_SECRET_KEY
npx wrangler secret put BOT_TOKEN
npx wrangler secret put CDN_BASE_URL
```

---

## 🗄️ 4. Ma'lumotlar Bazasi Arxitekturasi (database.js)

### Ishlash tartibi:
1. `env.HYPERDRIVE.connectionString` dan URL olinadi
2. URL da `aivencloud.com`, `ssl=require` yoki `sslmode=require` bo'lsa → `ssl: { rejectUnauthorized: false }` qo'shiladi
3. Har bir so'rov uchun yangi `pg.Client` yaratiladi, `connect()` → query → `end()`
4. Tranzit xatolikda (ECONNRESET, timeout) **bir martta** avtomatik qayta urinadi

### DB ishlatiladigan joylar:

| Fayl | Maqsad |
|---|---|
| `sync.service.js` | Barcha animelarni bir SQL da olish (LEFT JOIN × 4 jadval) |
| `animedetail.controller.js` | `anime_list` dan live `views_total/week`, `rating_sum/count` |
| `app.js` (`/test-db`) | `SELECT NOW()` va `COUNT(*)` — ulanish sinovi |

### ✅ Yaqinda tuzatilgan muammo:
`client.on('error')` hodisasi soket yopilayotganda `This socket has been closed` xabarini console ga chiqarardi (soxta xato). Endi filtrlangan:
```js
if (err?.message?.includes('This socket has been closed') ||
    err?.message?.includes('Connection terminated')) return;
```

---

## 🌐 5. Barcha API Marshrutlar (Haqiqiy Kodga Mos)

### Asosiy (app.js)

| Metod | URL | Vazifasi |
|---|---|---|
| `GET` | `/` | API info: nom, versiya, endpoint guruhlari |

---

### 🔐 Autentifikatsiya Guruhi — `auth.routes.js` → `/api/auth/*`

| Metod | URL | Controller Metodi | Himoya / Kirish |
|---|---|---|---|
| `POST` | `/api/auth/login` | `authController.webLogin` | Telegram ID + 6 xonali OTP kod |
| `POST` | `/api/auth/webapp` | `authController.telegramWebAppLogin` | Telegram Mini App `initData` (HMAC-SHA256) |
| `GET` | `/api/auth/me` | `authController.checkAuth` | 🔒 Gibrid (Bearer Token yoki Cookie) |
| `POST` | `/api/auth/logout` | `authController.logout` | Cookie tozalash va chiqish |

---

### 🎌 Anime Guruhi — `anime.routes.js` → `/api/anime/*`

| Metod | Asosiy URL | Alias (Orqaga Moslik) | Controller | Kesh |
|---|---|---|---|---|
| `GET` | `/api/anime/homepage` | `/api/homepage` | `homepageController.getHomepage` | R2 + 60s CDN |
| `GET` | `/api/anime/search` | `/api/search` | `searchController.search` | 60s |
| `GET` | `/api/anime/genres` | `/api/genres` | `genresController.getGenres` | 120s |
| `GET` | `/api/anime/genres/search` | `/api/genres/search` | `genresController.searchByGenres` | 60s |
| `GET` | `/api/anime/dubbers` | `/api/dubbers` | `dubbersController.getDubbers` | 120s |
| `GET` | `/api/anime/dubbers/search` | `/api/dubbers/search` | `dubbersController.searchByDubber` | 60s |
| `GET` | `/api/anime/:id` | — | `animeDetailController.getAnimeDetail` | 30s |

---

### 📦 Xotira Guruhi — `xotira.routes.js` → `/api/xotira/*`

| Metod | URL | Handler | Himoya |
|---|---|---|---|
| `GET` | `/api/xotira` | Inline test | Ochiq |
| `GET` | `/api/xotira/anime.json` | `storageService.getR2Json` | Ochiq |
| `GET` | `/api/xotira/homepage.json` | `storageService.getR2Json` | Ochiq |
| `GET` | `/api/xotira/search.json` | `storageService.getKVJson` | Ochiq |
| `GET` | `/api/xotira/dubbers.json` | `storageService.getKVJson` | Ochiq |
| `ALL` | `/api/xotira/sync` | `syncService.rebuildCache` | 🔐 Bearer token |

---

### ⚙️ Tizim Guruhi — `system.routes.js` → `/api/system/*`

| Metod | Asosiy URL | Alias (Orqaga Moslik) | Tavsif |
|---|---|---|---|
| `GET` | `/api/system/health` | `/api/health` | Server holati |
| `GET` | `/api/system/test-db` | — | PostgreSQL ulanish testi + anime soni |

---

### Qidiruv parametrlari (GET /api/anime/search yoki /api/search)

| Parametr | Turi | Tavsif | Default |
|---|---|---|---|
| `q` yoki `query` | String/Raqam | Qidiruv so'zi yoki anime ID | — |
| `genre` | String | Janr filtri (masalan: `Action`) | — |
| `year` | Raqam | Yil filtri (masalan: `2024`) | — |
| `type` | String | `TV SERIES`, `MOVIE`, `OVA` | — |
| `sort` | String | `year_desc`, `year_asc`, `title_asc`, `rating_desc` | — |
| `page` | Raqam | Sahifa raqami | `1` |
| `limit` | Raqam | Sahifadagi element soni (maks: 100) | `40` |

---

### 🔐 Autentifikatsiya Tizimi (auth.controller.js)

**Maqsad:** Sayt va Telegram Mini App (WebApp) foydalanuvchilarini xavfsiz va qulay tizimga kiritish, sessiyalarini tekshirish hamda VIP holatini boshqarish.

**Xususiyatlari:**
- 🔒 **Gibrid JWT tekshiruvi:** `Authorization: Bearer <token>` sarlavhasi ham, `auth_token` HttpOnly Cookie ham qo'llab-quvvatlanadi.
- ⚡ **Telegram WebApp (initData):** Mini App ochilganda avtomatik HMAC-SHA256 tekshiruvi orqali parolsiz darhol tizimga kirish.
- 🔑 **Telegram OTP Kod:** Bot bergan bir martalik 6 xonali kod orqali kirish.
- ⏱️ **Faollik:** Har login yoki `/me` so'rovida `last_active_at` bazada avtomatik yangilanadi.

---

#### `POST /api/auth/login`
Telegram bot bergan bir martalik kod (`temporary_code`) orqali saytga kirish.

**So'rov tanasi (JSON):**
```json
{
  "userId": 123456789,
  "code": "849201"
}
```

**Muvaffaqiyatli javob (200):**
```json
{
  "success": true,
  "message": "Muvaffaqiyatli kirdingiz.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "userId": 123456789,
    "username": "aninov_user",
    "status": "user",
    "isVip": false,
    "vipExpireDate": null,
    "points": 150,
    "joinedAt": "2026-05-12T10:20:30.000Z",
    "lastActiveAt": "2026-10-07T14:45:00.000Z",
    "sleepReminderEnabled": true
  }
}
```

---

#### `POST /api/auth/webapp`
Telegram Mini App (WebApp) ochilganda `initData` orqali avtomatik ro'yxatdan o'tish / kirish.

**So'rov tanasi (JSON):**
```json
{
  "initData": "query_id=AAHd...&user=%7B%22id%22%3A123456789%2C%22first_name%22%3A%22Ali%22%7D&auth_date=1728300000&hash=d89e..."
}
```

**Javob (200):**
```json
{
  "success": true,
  "message": "Telegram WebApp orqali muvaffaqiyatli kirdingiz.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "userId": 123456789,
    "username": "Ali",
    "status": "user",
    "isVip": false,
    "vipExpireDate": null,
    "points": 0,
    "joinedAt": "2026-10-07T14:45:00.000Z",
    "lastActiveAt": "2026-10-07T14:45:00.000Z",
    "sleepReminderEnabled": true
  }
}
```

---

#### `GET /api/auth/me`
Joriy foydalanuvchi ma'lumotlarini tekshirish (`Bearer token` yoki Cookie orqali).

**Javob (Tizimga kirgan bo'lsa):**
```json
{
  "success": true,
  "authenticated": true,
  "user": {
    "userId": 123456789,
    "username": "aninov_user",
    "status": "vip",
    "isVip": true,
    "vipExpireDate": "2026-12-31T23:59:59.000Z",
    "points": 450,
    "joinedAt": "2026-05-12T10:20:30.000Z",
    "lastActiveAt": "2026-10-07T14:45:00.000Z",
    "sleepReminderEnabled": true
  }
}
```

**Javob (Tizimga kirmagan bo'lsa):**
```json
{
  "success": true,
  "authenticated": false,
  "user": null
}
```

---

#### `POST /api/auth/logout`
Tizimdan chiqish (Cookieni tozalaydi).

---

### 🎭 Janrlar API (genres.controller.js)

**Maqsad:** Sayt yoki mobil ilovadagi janr filtri uchun. Foydalanuvchi janrlar ro'yxatini ko'rib, bir yoki bir nechta janr tanlaganda, faqat shu janrlarga ega animeler ko'rsatiladi.

**Ma'lumot manbai:** Faqat KV (`genres.json` + `search_index.json`) — PostgreSQL ga **0 so'rov**.

---

#### `GET /api/genres`

Barcha mavjud janrlarni va har birida nechta anime borligini qaytaradi.

**Javob namunasi:**
```json
{
  "success": true,
  "total": 18,
  "data": [
    { "id": 1, "name": "Action",   "anime_count": 45 },
    { "id": 3, "name": "Drama",    "anime_count": 32 },
    { "id": 7, "name": "Komediya", "anime_count": 28 }
  ]
}
```

**Qoidalar:**
- Janrlar `anime_count` bo'yicha **kamayish tartibida** saralanadi
- `anime_count = 0` bo'lgan janrlar javobga kiritilmaydi
- Kesh: `Cache-Control: public, max-age=120`

---

#### `GET /api/genres/search`

Bir yoki bir nechta janr bo'yicha animelarnii filtrlaydi.

**Mantiq:** `AND` — faqat **barcha tanlangan janrlar** mavjud animeler qaytariladi.

| Parametr | Turi | Tavsif | Default |
|---|---|---|---|
| `genres` yoki `genre` | String | Vergul bilan ajratilgan janr nomlari | **Majburiy** |
| `page` | Raqam | Sahifa raqami | `1` |
| `limit` | Raqam | Sahifadagi element soni (maks: 100) | `40` |

**So'rov misollari:**
```
GET /api/genres/search?genres=Action
GET /api/genres/search?genres=Action,Drama
GET /api/genres/search?genres=Action,Drama,Shounen&page=2&limit=20
```

**Javob namunasi:**
```json
{
  "success": true,
  "genres": ["action", "drama"],
  "meta": {
    "total": 12,
    "page": 1,
    "limit": 40,
    "total_pages": 1,
    "has_next": false,
    "has_prev": false
  },
  "count": 12,
  "data": [
    {
      "id": 19,
      "anime_id": 19,
      "title_uz": "Demon Slayer",
      "title_en": "Kimetsu no Yaiba",
      "title_ru": "Клинок, рассекающий демонов",
      "year": 2019,
      "type": "TV SERIES",
      "poster_r2_url": "https://cdn.aninov.uz/posters/19.jpg",
      "rating": 9.6,
      "genres": ["Action", "Drama", "Shounen"]
    }
  ]
}
```

**Xato holatlari:**
| HTTP | Sabab |
|---|---|
| `400 Bad Request` | `genres` parametri berilmagan |
| `404 Not Found` | KV/R2 da anime ma'lumotlari yo'q — avval `/sync` qiling |
| `500 Internal` | Server ichki xatoligi |

---

### 🎙️ Dubberlar API (dubbers.controller.js)

**Maqsad:** Sayt yoki mobil ilovadagi dublyaj guruhlari (ovoz beruvchilar) filtri uchun. Foydalanuvchi dubberlar ro'yxatini ko'rib, bir yoki bir nechta dubber tanlaganda, faqat shu dubberlar ovoz bergan animelar ko'rsatiladi.

**Ma'lumot manbai:** Faqat KV (`search_index.json` / `search.json` dagi `dubbers` massivi) — PostgreSQL ga **0 so'rov**.

---

#### `GET /api/dubbers` (yoki `/api/anime/dubbers`)

Barcha mavjud dublyaj guruhlarini va har biri nechta animeni tarjima qilganini qaytaradi.

**Javob namunasi:**
```json
{
  "success": true,
  "total": 5,
  "data": [
    { "name": "AniUz",   "anime_count": 52 },
    { "name": "MangaUz", "anime_count": 31 },
    { "name": "Amedia",  "anime_count": 14 }
  ]
}
```

**Qoidalar:**
- Dubberlar `anime_count` bo'yicha **kamayish tartibida** saralanadi
- Kesh: `Cache-Control: public, max-age=120, s-maxage=300`

---

#### `GET /api/dubbers/search` (yoki `/api/anime/dubbers/search`)

Berilgan dubber nomi bo'yicha animelarnii filtrlaydi. Bir nechta dubber berilsa `AND` mantiq bilan ishlaydi.

| Parametr | Turi | Tavsif | Default |
|---|---|---|---|
| `dub` yoki `dubber` | String | Dubber nomi (yoki vergul bilan bir nechta: `AniUz,MangaUz`) | **Majburiy** |
| `page` | Raqam | Sahifa raqami | `1` |
| `limit` | Raqam | Sahifadagi element soni (maks: 100) | `40` |

**So'rov misollari:**
```
GET /api/dubbers/search?dub=AniUz
GET /api/dubbers/search?dub=AniUz,MangaUz
GET /api/anime/dubbers/search?dub=AniUz&page=1&limit=20
```

**Javob namunasi:**
```json
{
  "success": true,
  "dubbers": ["aniuz"],
  "meta": {
    "total": 15,
    "page": 1,
    "limit": 40,
    "total_pages": 1,
    "has_next": false,
    "has_prev": false
  },
  "count": 15,
  "data": [
    {
      "id": 19,
      "anime_id": 19,
      "title_uz": "Demon Slayer",
      "title_en": "Kimetsu no Yaiba",
      "title_ru": "Клинок, рассекающий демонов",
      "year": 2019,
      "type": "TV SERIES",
      "poster_r2_url": "https://cdn.aninov.uz/posters/19.jpg",
      "rating": 9.6,
      "genres": ["Action", "Drama", "Shounen"],
      "dubbers": ["AniUz", "MangaUz"]
    }
  ]
}
```

**Xato holatlari:**
| HTTP | Sabab |
|---|---|
| `400 Bad Request` | `dub` parametri berilmagan |
| `404 Not Found` | KV da ma'lumotlar yo'q — avval `/sync` qiling |
| `500 Internal` | Server ichki xatoligi |

---

## 🔄 6. Sync Jarayoni Qanday Ishlaydi (sync.service.js)
 
`/api/xotira/sync` yoki Cron (har 10 daqiqada) triggerida ishga tushadi:

```
1. DB dan barcha animelar bitta SQL so'rov bilan olinadi
   (anime_list + anime_titles + genres + anime_episodes + anime_episode_streams)

2. R2 ga saqlanadi (SHA-256 Hash o'zgargandagina):
   - anime.json          ← to'liq ma'lumot (epizodlar bilan)
   - xotira/anime.json   ← xuddi shu nusxa (zaxira)
   - homepage.json       ← 8 blokli homepage ma'lumotlari

3. KV ga saqlanadi (saveKVJsonIfChanged — SHA-256 Hash o'zgargandagina, aks holda 0 Write):
   - search_index.json   ← epizodlarsiz, yengil qidiruv indeksi (har bir animeda dubbers: ["AniUz", ...] massivi)
   - search.json         ← search_index.json ning nusxasi
   - genres.json         ← unikal janrlar ro'yxati { id, name }
   - dubbers.json        ← unikal dubberlar va ularning anime_count ro'yxati

4. Fonda (ctx.waitUntil):
   - Posterlar R2 ga tekshirib yuklanadi (chunk = 5)
   - ⚠️ KV Write limitini to'ldiruvchi anime:{id} tsikli butunlay olib tashlangan.
```

**HTTP response** darhol qaytariladi — fon jarayonlar HTTP timeoutga ta'sir qilmaydi.

---

## 🖼️ 7. Poster Tizimi (poster.service.js)

**R2 da saqlash joyi:** `posters/{anime_id}.jpg`  
**CDN URL:** `https://cdn.aninov.uz/posters/{anime_id}.jpg`

Har bir poster uchun quyidagi tartib:

```
1. HEAD so'rov → R2 da allaqachon bormi?
   - Bor → skip (qayta yuklanmaydi)
   - Yo'q → 2-qadamga

2. Manba aniqlash:
   A) poster_r2_url tashqi URL bo'lsa (cdn.aninov.uz EMAS) → shu URL dan yukla
   B) poster_id yoki poster Telegram file_id bo'lsa → BOT_TOKEN bilan
      getFile API → fayl URL → yukla
   C) Manba topilmasa → "no_source" qaytariladi

3. fetch() → ArrayBuffer → R2 ga PUT (image/jpeg)
```

**chunkSize = 5** — Cloudflare Workers subrequest limitiga urilmaslik uchun.

---

## 🔑 8. Xavfsizlik (crypto.js)

**`safeCompare(a, b)`** — Timing-attack dan himoyalangan string taqqoslash.  
Her bir belgi `XOR` orqali solishtirilib, vaqt farqidan token taxmin qilib bo'lmaydi.

**`encryptFileId(fileId, secretKey)`** — `SHA-256(fileId + ':' + secretKey)` ning hex ko'rinishining birinchi 32 belgisi.

---

## 🧪 9. Sinov Buyruqlari (Haqiqiy URL bilan)

```bash
# Worker URLi:
BASE="https://aninovuz-backend.xudoyqulovabdulaziz08.workers.dev"

# 1. Baza ulanishini tekshirish:
curl "$BASE/test-db"

# 2. Server holati:
curl "$BASE/api/health"

# 3. Foydalanuvchi login (OTP kod bilan):
curl -X POST "$BASE/api/auth/login" \
     -H "Content-Type: application/json" \
     -d '{"userId": 12345678, "code": "123456"}'

# 4. Telegram WebApp login (initData bilan):
curl -X POST "$BASE/api/auth/webapp" \
     -H "Content-Type: application/json" \
     -d '{"initData": "query_id=...&user=...&hash=..."}'

# 5. Profilni tekshirish (Bearer token bilan):
curl "$BASE/api/auth/me" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 6. Tizimdan chiqish:
curl -X POST "$BASE/api/auth/logout"

# 7. Homepage keshini tekshirish:
curl "$BASE/api/homepage"

# 8. Qidiruv:
curl "$BASE/api/search?q=Naruto&genre=Action&page=1&limit=10"

# 9. Dubberlar ro'yxati:
curl "$BASE/api/dubbers"

# 10. Dubber bo'yicha qidiruv (filtr):
curl "$BASE/api/dubbers/search?dub=AniUz&page=1&limit=10"

# 11. Anime detail:
curl "$BASE/api/anime/32"

# 12. Keshni qayta qurish (SYNC_SECRET_KEY kerak):
curl -X POST "$BASE/api/xotira/sync" \
     -H "Authorization: Bearer YOUR_SYNC_SECRET_KEY"

# 13. anime.json ni olish:
curl "$BASE/api/xotira/anime.json"
```

---

## ⚠️ 10. Hozirgi Kodda Mavjud Muammolar

> [!CAUTION]
> Quyidagi muammolar haqiqiy kodda topilgan. Ular tuzatilmasa, loyiha noto'g'ri ishlashi mumkin.

### ❌ Muammo 1: `/api/xotira/sync` HIMOYALANMAGAN

**Fayl:** [`xotira.routes.js`](file:///c:/Users/user/Desktop/aninovuz%20sayt/src/routes/xotira.routes.js#L27-L35)

`job.md` da `/sync` `SYNC_SECRET_KEY` bilan himoyalangan deb yozilgan.  
**Haqiqatda:** Hech qanday token tekshiruvi yo'q. Har kim `POST /api/xotira/sync` yuborsa, butun kesh qayta quriladi.

```js
// ❌ Hozirgi holat — hech qanday himoya yo'q:
xotiraRouter.all('/sync', async (c) => {
  const result = await syncService.rebuildCache(c.env);
  ...
});

// ✅ Kerakli holat:
import { safeCompare } from '../utils/crypto.js';
xotiraRouter.all('/sync', async (c) => {
  const authHeader = c.req.header('Authorization') || '';
  const token = authHeader.replace('Bearer ', '').trim();
  const secret = c.env?.SYNC_SECRET_KEY || '';
  if (!safeCompare(token, secret)) {
    return c.json({ success: false, message: 'Ruxsat yo\'q (401)' }, 401);
  }
  const result = await syncService.rebuildCache(c.env, c.executionCtx);
  ...
});
```

---

### ❌ Muammo 2: `/sync` da `ctx` (ExecutionContext) uzatilmayapti

**Fayl:** [`xotira.routes.js:29`](file:///c:/Users/user/Desktop/aninovuz%20sayt/src/routes/xotira.routes.js#L29)

```js
// ❌ Hozirgi:
await syncService.rebuildCache(c.env);

// ✅ Kerakli (background tasks ishlashi uchun):
await syncService.rebuildCache(c.env, c.executionCtx);
```

`ctx` uzatilmasa, `background_tasks_queued: true` deyiladi, lekin aslida `runBackgroundTasks()` `.catch()` orqali "fire-and-forget" sifatida ishga tushadi — Cloudflare esa Worker tugagandan so'ng bu jarayonni to'xtatib qo'yishi mumkin.

---

### ❌ Muammo 3: `/api/xotira/genres`, `/api/xotira/anime/:id`, `/api/xotira/debug-posters` yo'q

**Fayl:** [`xotira.routes.js`](file:///c:/Users/user/Desktop/aninovuz%20sayt/src/routes/xotira.routes.js)

`job.md` da bu marshrutlar "mavjud" deb yozilgan, lekin kodda yo'q. Ularga so'rov jo'natilsa `404` qaytadi.

**Mavjud xotira marshrutlari (haqiqiy):**
- `GET /api/xotira` — test
- `GET /api/xotira/anime.json` ✅
- `GET /api/xotira/search.json` ✅
- `ALL /api/xotira/sync` ✅ (lekin himoyasiz — yuqoridagi muammo)

---

### ❌ Muammo 4: `r2.controller.js` hech yerda ishlatilmayapti

**Fayl:** [`r2.controller.js`](file:///c:/Users/user/Desktop/aninovuz%20sayt/src/controllers/r2.controller.js)

Bu controller yaratilgan, lekin hech qanday routega ulanmagan. `getJson(c)` metodi hech qachon chaqirilmaydi.

---

### ⚠️ Muammo 5: `homepage_cache` TTL da e'tiborga olinmaydi

`homepage_cache` KV ga `expirationTtl: 60` bilan saqlanadi.  
Lekin KV `expirationTtl` minimal qiymati **60 soniya** — bu maqbul.  
Biroq Cron har **10 daqiqada** bir ishga tushadi va keshni yangilaydi. Demak, homepage yangi ma'lumotlari eng ko'pi bilan **10 daqiqa + 60 soniya** kechikib ko'rinadi.

---

## ✅ 11. Hozirgi Holat (Barcha Tuzatishlardan So'ng)

### 🔐 Autentifikatsiya guruhi

| Endpoint | Holat | Izoh |
|---|---|---|
| `POST /api/auth/login` | ✅ Ishlaydi | Telegram ID + OTP kod tekshiruvi, JWT token qaytaradi |
| `POST /api/auth/webapp` | ✅ Ishlaydi | Telegram Mini App `initData` (HMAC-SHA256) avto-login |
| `GET /api/auth/me` | ✅ Ishlaydi | Gibrid JWT tekshiruvi (Bearer Token / Cookie), live profil va VIP |
| `POST /api/auth/logout` | ✅ Ishlaydi | Cookieni xavfsiz tozalaydi |

### 🎌 Anime guruhi

| Endpoint | Alias | Holat | Izoh |
|---|---|---|---|
| `GET /api/anime/homepage` | `/api/homepage` | ✅ Ishlaydi | R2 → 8 blok, 60s CDN Edge Cache (0 KV Write) |
| `GET /api/anime/search` | `/api/search` | ✅ Ishlaydi | Priority scoring + filtr + pagination |
| `GET /api/anime/genres` | `/api/genres` | ✅ Ishlaydi | Janrlar + anime_count (KV, DB ga 0 so'rov) |
| `GET /api/anime/genres/search` | `/api/genres/search` | ✅ Ishlaydi | Multi-janr AND filtri + pagination |
| `GET /api/anime/dubbers` | `/api/dubbers` | ✅ Ishlaydi | Barcha dubberlar + anime_count (KV `dubbers.json`) |
| `GET /api/anime/dubbers/search` | `/api/dubbers/search` | ✅ Ishlaydi | Dubber filtri (AND mantiq) + pagination |
| `GET /api/anime/:id` | — | ✅ Ishlaydi | R2 `anime.json` + live DB stats + 20 tavsiya (0 KV Write) |

### ⚙️ Tizim guruhi

| Endpoint | Alias | Holat | Izoh |
|---|---|---|---|
| `GET /api/system/health` | `/api/health` | ✅ Ishlaydi | Oddiy healthcheck |
| `GET /api/system/test-db` | — | ✅ Ishlaydi | PostgreSQL ulanish testi + anime soni |

### 📦 Xotira guruhi

| Endpoint | Holat | Izoh |
|---|---|---|
| `GET /api/xotira/anime.json` | ✅ Ishlaydi | R2 dan to'liq anime ro'yxati |
| `GET /api/xotira/homepage.json` | ✅ Ishlaydi | R2 dan tayyor 8 blokli homepage |
| `GET /api/xotira/search.json` | ✅ Ishlaydi | KV dan qidiruv indeksi |
| `GET /api/xotira/dubbers.json` | ✅ Ishlaydi | KV dan dubberlar ro'yxati |
| `ALL /api/xotira/sync` | ✅ Ishlaydi | Bearer token himoyasi + executionCtx (Hash diff check) |

### Servislar va modullar

| Modul | Holat | Izoh |
|---|---|---|
| `auth.controller.js` | ✅ Yangilandi | OTP login, WebApp login, `/me`, logout |
| `auth.middleware.js` | ✅ Yangilandi | Gibrid JWT tekshiruvi (Bearer Header + Cookie) |
| `auth.repository.js` | ✅ Yangilandi | DB amallari: OTP tekshirish, WebApp user yaratish/yangilash, last_active |
| `auth.routes.js` | ✅ Ulandi | `/api/auth/*` yo'nalishlari ulandi |
| `database.js` | ✅ Ishlaydi | Socket yopilish false-alarm filtrlandi |
| `sync.service.js` | ✅ Optimallashtirildi | Hash-check orqali 0-waste KV/R2 yangilash + fon posterlar |
| `poster.service.js` | ✅ Ishlaydi | HEAD tekshiruv + Telegram + tashqi URL |
| `storage.service.js` | ✅ Optimallashtirildi | `saveKVJsonIfChanged` va `saveR2JsonIfChanged` qo'shildi |
| `crypto.js` | ✅ Yangilandi | `verifyTelegramWebAppData` (HMAC-SHA256) qo'shildi |
| `homepage.controller.js` | ✅ Optimallashtirildi | R2 `homepage.json` + 60s CDN Edge Cache (0 KV Write) |
| `animedetail.controller.js` | ✅ Optimallashtirildi | R2 `anime.json` dan o'qish (0 KV Write) |
| `dubbers.controller.js` | ✅ Ishlaydi | `dubbers.json` (KV) dan tezkor o'qish |

---

## 🔮 14. Keyingi Qo'shilishi Mumkin Bo'lgan Funksiyalar

| Funksiya | Endpoint | Tavsif |
|---|---|---|
| **Ko'rishlarni sanash** | `POST /api/anime/:id/view` | Foydalanuvchi animeni ochganda `views_total` va `views_week` ni +1 qilish |
| **Reyting berish** | `POST /api/anime/:id/rate` | Foydalanuvchi 1–10 ball bilan baholaydi, `rating_sum` va `rating_count` yangilanadi |
| **Turlar ro'yxati** | `GET /api/anime/types` | `MOVIE`, `TV SERIES`, `OVA` — statik javob |
| **VIP tekshiruv** | `GET /api/anime/stream/:hash` | `file_id_hash` orqali stream ma'lumotini xavfsiz qaytarish |
| **Poster API** | `GET /api/anime/poster/:id` | R2 dan `posters/{id}.jpg` ni to'g'ridan-to'g'ri serve qilish |
| **Epizodlar** | `GET /api/anime/:id/episodes` | Faqat epizodlar ro'yxatini alohida qaytarish |

---

## 🗒️ 15. SQL Jadvallar Tuzilmasi (models.py va DB ga mos)

```sql
-- Asosiy jadvallar:
users                 -- user_id (BigInteger), username, status, points, joined_at, last_active_at, vip_expire_date, sleep_reminder_enabled, temporary_code, code_expires_at
anime_list            -- anime_id, type, year, description, poster_r2_url, poster_id, views_total, views_week, rating_sum, rating_count
anime_titles          -- anime_id, title_uz, title_en, title_ru
genres                -- id, name
anime_genres          -- anime_id, genre_id (ko'p-ko'p)
dubbers               -- id, name
anime_dubbers         -- anime_id, dubber_id (ko'p-ko'p)
anime_episodes        -- id, anime_id, episode, is_filler
anime_episode_streams -- id, episode_id, dub_group, is_vip, file_id (SHA-256 hash orqali chiqariladi)
```

---

## 📝 16. Changelog (Nima O'zgardi)

| Sana | O'zgarish |
|---|---|
| 2026-10-07 | **Auth Tizimi To'liq Yangilandi & WebApp Integratsiyasi** — Telegram WebApp login, Gibrid JWT middleware (Header+Cookie), last_active_at, /api/auth/* marshrutlari ulandi ✅ |
| 2026-10-06 | **KV Write Limit Optimallashtirildi (Zero Redundant Writes)** — KV yozish limitlari to'lib qolishi to'liq bartaraf etildi ✅ |
| 2026-10-06 | `storage.service.js`: `saveKVJsonIfChanged` va `saveR2JsonIfChanged` (SHA-256 hash tekshiruvi, o'zgarmasa 0 write) ✅ |
| 2026-10-06 | `sync.service.js`: `anime:{id}` fon tsikli olib tashlandi, `homepage.json` R2 ga, `dubbers.json` KV ga saqlanadi ✅ |
| 2026-10-06 | `homepage.controller.js`: R2 dagi `homepage.json` dan o'qiydi, KV yozish olib tashlandi, 60s CDN Edge Cache o'rnatildi ✅ |
| 2026-10-06 | `animedetail.controller.js`: `saveAnimeById` KV yozishi olib tashlandi, to'g'ridan-to'g'ri R2 `anime.json` dan o'qiydi ✅ |
| 2026-10-06 | `dubbers.controller.js`: KV dagi tayyor `dubbers.json` dan to'g'ridan-to'g'ri o'qiydi ✅ |
| 2026-10-03 | **Dubbers Tizimi Integratsiyasi** — Dublyaj guruhlari filtri va ro'yxati qo'shildi ✅ |
| 2026-10-02 | **Routing Refactor** — Barcha marshrutlar guruhlarga bo'lindi ✅ |

