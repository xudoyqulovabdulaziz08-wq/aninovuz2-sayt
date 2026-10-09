# 🎌 AniNovuz Frontend — To'liq Loyiha Hujjati (read.md)

> **Oxirgi yangilanish:** 2026-10-09  
> **Dizayn standarti:** Pastki Toza Anime Kartalari (Nom pastda, badgeler rasm burchaklarida) + Bo'lim ustiga borganda `< >` tugmalari + Mustaqil karta Hover  
> **Framework:** Next.js (App Router, Turbopack) + TypeScript + Tailwind CSS  
> **Backend Worker:** `https://aninovuz-backend.xudoyqulovabdulaziz08.workers.dev`  
> **Build Holati:** 0 xatolik bilan muvaffaqiyatli (`Compiled successfully`) ✅  

---

## 🎨 1. Yangilangan Anime Kartasi va Bo'lim Dizayni

Foydalanuvchi chizmasi (`media_1791539646303_4dd1948b.png`) asosida quyidagi yangilanishlar amalga oshirildi:

```
┌──────────────────────────────────────────────┐
│ [ HOT / NEW ]                         [2026] │
│                                              │
│                   POSTER                     │
│               (Yorqin rasm)                  │
│                                              │
│ [ ★ 9.0 ]                          [12 qism] │
└──────────────────────────────────────────────┘
  Anime Nomi (Sig'masa 3 nuqta ...)
```

### ✨ Asosiy Yangiliklar:
1. **Toza Rasm va To'rt Burchakli Badgeler (`AnimeCard.tsx`):**
   - Rasm ustidagi umumiy xira qora blur qatlami butunlay olib tashlandi — rasm toza va yorqin ko'rinadi.
   - **Yuqori chapda:** `HOT` / `NEW` qizil nishoni.
   - **Yuqori o'ngda:** `2026` yili nishoni (shaffof qoramtir).
   - **Pastki chapda (rasm ustida):** `★ 9.0` yoki `★ 0` reyting nishoni.
   - **Pastki o'ngda (rasm ustida):** `12 qism` nishoni.

2. **Anime Nomi Rasm Tagiga O'tkazildi:**
   - Anime nomi rasmning ostidagi alohida sohaga joylashtirildi.
   - Nomi uzun bo'lsa `truncate` orqali 3 nuqta (`...`) bilan cheklanadi.

3. **Mustaqil Karta Hover Effekti (Faqat bitta karta):**
   - Guruhlash `group/card` va `group/section` ga ajratildi.
   - Foydalanuvchi qaysidir aniq bitta anime kartasi ustiga sichqonchani borganda, **faqat o'sha bitta kartaning rasmi kattalashadi va nomi qizil rangga kiradi**. Boshqa qo'shni kartalar qimirlamaydi va rangi o'zgarmaydi.

4. **Bo'lim Ustiga Borganda Siljish Tugmalari (`< >`):**
   - Bo'lim (section) ustiga hover bo'lgandagina chap va o'ngdagi `<` hamda `>` tugmalari paydo bo'ladi (`group-hover/section:opacity-100`).

5. **Qalinroq Qizil Chiziq:**
   - Bo'lim sarlavhasi chap tomonidagi vertikal qizil chiziq qalinroq va yaqqol ko'rinadigan qilindi (`border-l-[3.5px] border-red-600 pl-3`).

---

## 🚀 2. Ishga Tushirish

```bash
npm run dev     # Dev rejim
npm run build   # Production build
npm start       # Production start
```
