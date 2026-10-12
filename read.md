# 🎌 AniNovuz Frontend — To'liq Loyiha Hujjati (read.md)

> **Oxirgi yangilanish:** 2026-10-11  
> **Dizayn standarti:** Professional Preloaded State (Netflix/YouTube uslubidagi 0ms glitchsiz o'tish) + F5 Initial Shuriken Loading Screen  
> **Framework:** Next.js (App Router, Turbopack) + TypeScript + Tailwind CSS  
> **Backend Worker:** `https://aninovuz-backend.xudoyqulovabdulaziz08.workers.dev`  
> **Build Holati:** 0 xatolik bilan muvaffaqiyatli (`Compiled successfully`) ✅  

---

## ⚡ 1. Professional Instant Navigatsiya va Loading Tizimi

1. **Netflix & YouTube Uslubidagi 0ms Glitchsiz Navigatsiya (`AnimeDataContext.tsx`):**
   - Sayt birinchi marta ochilganda yoki `F5` bosilganda barcha zaruriy ma'lumotlar (`homepageData` va `allAnimes`) xotiraga yuklab olinadi va keshlanadi.
   - Natijada, **Bosh sahifa (`/`)** va **Animelar (`/animes`)** bo'limlari o'rtasida o'tganda hech qanday skelet lipillashi (flicker/glitch) yoki to'xtalish bo'lmaydi — sahifalar **0ms da darhol va silliq ochiladi**!

2. **F5 Initial Loading Ekrani (`SiteLoadingScreen.tsx`):**
   - Saytga birinchi marta kirganda yoki `F5` (refresh) bosilganda, ma'lumotlar to'liq tayyor bo'lguncha aylanuvchi Shurikenli ninja logotip va haqiqiy progress barli chiroyli loading ekrani chiqadi (`0% -> 100%`).
   - Ma'lumotlar yuklanishi bilan silliq `fade-out` bo'lib yo'qoladi.
   - Ichki sahifalar o'rtasida navigatsiya qilganda esa qayta chiqmaydi va foydalanuvchiga xalaqit bermaydi.

---

## 🎬 2. Barcha Animelar Sahifasi (`/animes`) & Tafsilotlar (`/anime/[id]`)

- **Barcha Animelar:** `/animes` bo'limida 15-daqiqali kesh, 5 xil saralash filtrlari (Janr, Yil, Reyting, Holati, Saralash) va 7 ustunli kartalar gridi.
- **Anime Tafsiloti:** `/anime/[id]` sahifasida barcha qismlar pleylisti va o'xshash tavsiyalar.

---

## 🚀 3. Ishga Tushirish

```bash
npm run dev     # Dasturlash (Dev): http://localhost:3000
npm run build   # Production build
npm start       # Production start
```
