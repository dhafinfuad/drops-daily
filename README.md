# Drops Daily (PWA) — v0.7.0

Aplikasi web progresif (PWA) *local-first* untuk mencatat konsumsi air putih, menghitung target hidrasi harian berbasis standar Kemenkes AKG 2019, melihat statistik histori, dan menjadwalkan pengingat minum adaptif.

---

## 💧 Fitur Utama

- **100% Local-First & Menjaga Privasi**: Seluruh data profil, histori minum, dan pengaturan tersimpan secara lokal di IndexedDB perangkat. Tidak ada database server eksternal yang melacak riwayat pribadi Anda.
- **Kalkulator Hidrasi Ilmiah (Permenkes No. 28/2019)**:
  - Estimasi target air putih personal berdasarkan usia, jenis kelamin, dan berat badan.
  - Membedakan *total water reference* (termasuk dari makanan/cairan lain) dan *plain water goal* (~80%).
  - Safety-gate medis untuk kondisi khusus (pembatasan cairan oleh dokter, kehamilan trimester 1–3, dan masa menyusui).
  - Penanganan khusus bayi (0–5 bulan ASI eksklusif tanpa target air; 6–11 bulan panduan MPASI).
- **Porsi Tambah Cepat (Quick Add) Kustom**:
  - Tombol aksi utama dinamis (misal: `+ 250 ml`, `+ 500 ml`).
  - Tombol **Custom** langsung membuka modal **Porsi Tambah Cepat** dengan kartu preset ber-icon SVG wadah khas pekerja kantoran Indonesia:
    - `250 ml` — Gelas biasa (Pantry / Kemenkes)
    - `350 ml` — Mug meja (Kopi / Teh)
    - `500 ml` — Tumbler sedang (LocknLock, Tupperware)
    - `600 ml` — Botol sedang (Air mineral 600ml)
    - `750 ml` — Tumbler besar (24 oz / Olahraga)
    - `1.000 ml` — Botol 1 Liter (Stanley, Tyeso 1L)
  - Input kustom angka dengan keyboard numerik mobile murni (`inputmode="numeric"` dan `pattern="[0-9]*"`).
- **Pengingat Minum Adaptif (Adaptive Reminder Engine)**:
  - Menghitung interval dan porsi minum secara proporsional antara *Waktu Mulai* (bangun) dan *Waktu Selesai* (tidur).
  - Mode tenang (*quiet hours*) menjelang tidur agar tidak membebani kandung kemih di malam hari.
- **Notifikasi Web Push Lintas Perangkat**:
  - Dukungan Web Push berstandar W3C menggunakan VAPID.
  - Penjadwal notifikasi di latar belakang menggunakan Netlify Functions & Netlify Blobs.
- **Histori & Analisis Kebiasaan**:
  - Grafik dan statistik 7 hari & 30 hari terakhir.
  - Rata-rata asupan, tingkat ketercapaian target, dan catatan *streak* hari berturut-turut.
- **Desain iOS Modern & Responsif**:
  - *Sticky Frosted Glass Header* pada seluruh halaman.
  - *Floating Tab Bar* dengan interaksi navigasi yang halus.
  - Mikro-animasi tap & hover di seluruh komponen interaktif.
  - Modal dan bottom sheet dengan arsitektur UI seragam.
- **Pencadangan Data Mandiri (Backup & Restore)**:
  - Ekspor seluruh data ke file JSON lokal (`drops-daily-backup-YYYY-MM-DD.json`).
  - Impor backup JSON kapan saja untuk memulihkan atau memindahkan data antar-perangkat.

---

## 🛠️ Tech Stack

- **Framework**: Svelte 5 (Runes) + SvelteKit 2
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Bundler**: Vite 8
- **Penyimpanan Lokal**: IndexedDB via `idb`
- **PWA & Offline Shell**: Service Worker native
- **Notifikasi**: Web Push API (`web-push`)
- **Backend Serverless**: Netlify Functions (TypeScript) + Netlify Blobs (Atomic scheduling lock)

---

## 🚀 Menjalankan Secara Lokal

Pastikan Node.js telah terinstal (versi `>= 22`):

```bash
# 1. Install dependencies
npm install

# 2. Jalankan development server
npm run dev
```

Buka URL di browser (biasanya `http://localhost:5173`).  
Semua fitur utama (PWA shell, IndexedDB, kalkulator hidrasi, pencatatan minum, histori, dan kustomisasi porsi) dapat diuji langsung di mode dev.

---

## 🧪 Validasi & Build

```bash
# Pemeriksaan tipe TypeScript & Svelte
npm run check

# Kompilasi bundle produksi
npm run build

# Preview hasil build produksi
npm run preview
```

---

## 🔔 Konfigurasi Web Push (Opsional)

Untuk menguji push notification latar belakang secara lokal maupun produksi:

1. Buat pasangan kunci VAPID:
   ```bash
   npm run vapid
   ```
2. Tambahkan kunci tersebut ke environment variables Netlify:
   - `VAPID_PUBLIC_KEY`
   - `VAPID_PRIVATE_KEY`
   - `VAPID_SUBJECT` (misal: `mailto:admin@domain.com`)
3. Jalankan Netlify dev environment lokal:
   ```bash
   npm run netlify:dev
   ```

---

## ☁️ Deploy ke Netlify

Proyek ini telah dikonfigurasi dengan `@sveltejs/adapter-netlify`:

- **Build command**: `npm run build`
- **Publish directory**: `build`

Deploy menggunakan Netlify CLI:
```bash
# Deploy ke draft / preview URL
npx netlify-cli deploy

# Deploy langsung ke production
npx netlify-cli deploy --prod
```

---

## 🗄️ Struktur Database Lokal (IndexedDB: `hydration-pwa`)

```text
hydration-pwa
├── appMeta         # Metadata instalasi, status onboarding, dan push token
├── profile         # Profil fisik pengguna (usia, berat, gender, aktivitas)
├── settings        # Pengaturan aplikasi (targetMode, wake/sleep time, quickAddMl)
├── intakeEntries   # Catatan setiap sesi minum air (timestamp, ml, sumber)
├── dailyTargets    # Riwayat target harian yang dihitung
└── reminderState   # Jadwal & status eksekusi reminder adaptif
```

---

## 📋 Catatan Rilis (Changelog)

### v0.7.0 (Versi Saat Ini)
- **Rebranding Metadata**: Mengubah nama aplikasi dan branding metadata menjadi **Drops Daily**.
- **Kustomisasi Porsi Tambah Cepat**: Tombol *Custom* pada halaman Hari Ini kini membuka modal *Porsi Tambah Cepat* dengan kartu preset wadah realistis pekerja kantoran Indonesia (250ml, 350ml, 500ml, 600ml, 750ml, 1.000ml) lengkap dengan icon SVG wadah.
- **Keyboard Angka Otomatis**: Input ml pada seluruh modal dan pengaturan menggunakan `inputmode="numeric"` dan `pattern="[0-9]*"`.
- **Pembersihan Menu**: Menghapus duplikasi menu porsi dari halaman Pengaturan sehingga terpusat langsung di tombol Custom halaman Hari Ini.
- **Sticky Frosted Header**: Header frosted glass dengan efek blur di semua halaman dan subhalaman.
- **Mikro-Animasi**: Transisi hover, active press, dan feedback klik di seluruh tombol utama.

### v0.6.1
- Penyesuaian density komponen UI dan ritme vertikal antar-seksi yang seimbang.

### v0.6.0
- Desain antarmuka iOS padat: radius 10–14px, row 48–50px, progress ring 180px, bottom nav 48px.

### v0.5.0
- Perampingan geometri UI: card radius 14–20px, progress ring 200px, bottom navigation datar.

### v0.4.0
- Penguatan produksi: persistensi storage `navigator.storage.persist()`, sinkronisasi state Web Push otomatis saat foreground, penanganan atomic claim Netlify Blobs (`onlyIfNew`), dan pembersihan log otomatis >72 jam.

### v0.1 – v0.3
- Implementasi dasar PWA, SvelteKit, IndexedDB, kalkulator AKG Kemenkes 2019, adaptive reminder, gesture swipe-back, dan generator rumus perhitungan.
