# 💧 Drops Daily — Aplikasi Pengingat & Pelacak Hidrasi Pintar

<p align="center">
  <img src="static/icons/icon-192.png" width="96" height="96" alt="Drops Daily Logo" />
</p>

<p align="center">
  <strong>Aplikasi Progressive Web App (PWA) <i>local-first</i> modern untuk mencatat asupan air harian, menghitung kebutuhan cairan berbasis ilmiah (AKG Kemenkes RI 2019), serta memberikan pengingat minum cerdas adaptif langsung di perangkat Anda.</strong>
</p>

<p align="center">
  <a href="https://svelte.dev"><img src="https://img.shields.io/badge/Svelte-5%20(Runes)-FF3E00?logo=svelte&logoColor=white" alt="Svelte 5" /></a>
  <a href="https://kit.svelte.dev"><img src="https://img.shields.io/badge/SvelteKit-2.x-FF3E00?logo=svelte&logoColor=white" alt="SvelteKit 2" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white" alt="TypeScript" /></a>
  <a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/Tailwind_CSS-v4.0-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS v4" /></a>
  <a href="https://web.dev/progressive-web-apps/"><img src="https://img.shields.io/badge/PWA-100%25%20Offline_Ready-5A0FC8?logo=pwa&logoColor=white" alt="PWA Ready" /></a>
  <a href="https://www.netlify.com/"><img src="https://img.shields.io/badge/Deploy-Netlify-00C7B7?logo=netlify&logoColor=white" alt="Deploy to Netlify" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License MIT" /></a>
  <img src="https://img.shields.io/badge/Build-Passing-brightgreen.svg" alt="Build Passing" />
  <img src="https://img.shields.io/badge/Status-Production_Ready-success.svg" alt="Status Production Ready" />
</p>

---

## 📑 Daftar Isi (Table of Contents)

- [📌 Tentang Drops Daily](#-tentang-drops-daily)
- [📸 Screenshot Tampilan Aplikasi](#-screenshot-tampilan-aplikasi)
- [💧 Fitur Unggulan](#-fitur-unggulan)
  - [1. Kalkulator Hidrasi Berbasis Standar Medis Kemenkes](#1-kalkulator-hidrasi-berbasis-standar-medis-kemenkes)
  - [2. Quick Add & Kustom Porsi Wadah Khas Indonesia](#2-quick-add--kustom-porsi-wadah-khas-indonesia)
  - [3. Arsitektur 100% Local-First & Privasi Penuh](#3-arsitektur-100-local-first--privasi-penuh)
  - [4. Mesin Pengingat Adaptif & Web Push Notifications](#4-mesin-pengingat-adaptif--web-push-notifications)
  - [5. Analisis Riwayat & Statistik Interaktif](#5-analisis-riwayat--statistik-interaktif)
  - [6. Pengalaman Pengguna Modern Bergaya iOS](#6-pengalaman-pengguna-modern-bergaya-ios)
  - [7. Pencadangan & Pemulihan Data Mandiri (Backup & Restore)](#7-pencadangan--pemulihan-data-mandiri-backup--restore)
- [🛠️ Tabel Tech Stack](#️-tabel-tech-stack)
- [🔑 Kredensial Default & Sistem Autentikasi](#-kredensial-default--sistem-autentikasi)
- [🏁 Panduan Instalasi & Menjalankan Proyek](#-panduan-instalasi--menjalankan-proyek)
- [🧪 Panduan Pengujian (Testing Guide)](#-panduan-pengujian-testing-guide)
- [🔒 Praktik Keamanan Terbaik (Security Best Practices)](#-praktik-keamanan-terbaik-security-best-practices)
- [☁️ Panduan Deployment (Netlify & VAPID)](#️-panduan-deployment-netlify--vapid)
- [🗄️ Struktur Database Lokal (IndexedDB)](#️-struktur-database-lokal-indexeddb)
- [🗺️ Roadmap Pengembangan](#️-roadmap-pengembangan)
- [🤝 Panduan Kontribusi (Contributing)](#-panduan-kontribusi-contributing)
- [💬 Kontak & Dukungan](#-kontak--dukungan)
- [💖 Dukungan Sponsor (Sponsorship)](#-dukungan-sponsor-sponsorship)
- [📜 Lisensi](#-lisensi)

---

## 📌 Tentang Drops Daily

**Drops Daily** adalah aplikasi web progresif (*Progressive Web App*) yang dirancang khusus untuk mempermudah siapa saja membangun kebiasaan minum air yang sehat, konsisten, dan terukur. 

Berbeda dengan aplikasi pelacak air konvensional yang memaksakan target kaku "2 liter untuk semua orang" atau mewajibkan pendaftaran akun pihak ketiga yang rentan pelacakan data, **Drops Daily**:
- Menghitung kebutuhan cairan secara personal berdasarkan usia, gender, berat badan, tingkat aktivitas fisik, hingga kondisi medis/biologis khusus (hamil, menyusui, anjuran dokter) mengacu pada standar **Permenkes RI No. 28 Tahun 2019 (AKG)**.
- Menjamin privasi 100%: seluruh riwayat kesehatan tersimpan di perangkat lokal pengguna (*IndexedDB*).
- Dapat dipasang (*installable*) di Android, iOS, Windows, dan macOS serta berfungsi penuh secara luring (*offline*).

---

## 📸 Screenshot Tampilan Aplikasi

Berikut adalah dokumentasi tampilan antarmuka nyata dari aplikasi **Drops Daily**:

| 🚀 Onboarding & Profil Fisik | 💧 Dashboard Hari Ini | 🫗 Modal Porsi Wadah Khas Indonesia |
| :---: | :---: | :---: |
| <img src="docs/screenshots/01-onboarding.png" width="260" alt="Onboarding Drops Daily" /> | <img src="docs/screenshots/02-today-view.png" width="260" alt="Dashboard Utama Hari Ini" /> | <img src="docs/screenshots/03-custom-portions.png" width="260" alt="Modal Porsi Kustom" /> |
| *Wizard onboarding personal berbasis AKG Kemenkes* | *Cincin progres hidrasi dinamis & tombol aksi cepat* | *Preset wadah nyata (Gelas, Tumbler, Botol 1L)* |

<br />

| 📊 Histori & Analisis Kebiasaan | ⚙️ Pengaturan & Pencadangan Data |
| :---: | :---: |
| <img src="docs/screenshots/04-history-view.png" width="340" alt="Histori & Statistik" /> | <img src="docs/screenshots/05-settings-view.png" width="340" alt="Pengaturan Profil & Sistem" /> |
| *Grafik tren mingguan, rata-rata konsumsi, & streak harian* | *Penyesuaian jam aktif, target manual, & ekspor JSON* |

---

## 💧 Fitur Unggulan

### 1. Kalkulator Hidrasi Berbasis Standar Medis Kemenkes
- **Perhitungan Ilmiah Akurat**: Menggunakan formula rujukan Angka Kecukupan Gizi (AKG 2019) dari Kementerian Kesehatan Republik Indonesia yang disesuaikan dengan proporsi berat badan dan usia.
- **Diferensiasi Air Murni vs Cairan Total**: Memisahkan kebutuhan cairan total (*total water intake*) dengan target air putih murni (*plain water intake* ~80%) secara transparan.
- **Safety Gate Medis**:
  - Dukungan khusus kondisi pembatasan cairan medis (seperti pasien penyakit ginjal atau gagal jantung kronis).
  - Penambahan asupan adaptif untuk ibu hamil (Trimester 1, 2, dan 3) serta ibu menyusui (6 bulan pertama & kedua).
  - Penanganan khusus bayi: 0–5 bulan ASI eksklusif (tidak memerlukan target air) dan 6–11 bulan dengan pendampingan MPASI.

### 2. Quick Add & Kustom Porsi Wadah Khas Indonesia
- **Aksi Cepat Sekali Sentuh**: Tombol aksi utama langsung mencatat konsumsi reguler (misal `+ 250 ml` dan `+ 500 ml`).
- **Porsi Kustom Realistis**: Tombol **Custom** membuka lembar aksi (*bottom sheet*) interaktif dengan ikon SVG khas wadah yang sering digunakan sehari-hari:
  - 🥛 `250 ml` — Gelas Biasa (Pantry / Acuan Kemenkes)
  - ☕ `350 ml` — Cangkir / Mug Meja (Kopi / Teh)
  - 🍶 `500 ml` — Tumbler Sedang (LocknLock, Tupperware)
  - 💧 `600 ml` — Botol Sedang (Air Mineral 600ml)
  - 🥤 `750 ml` — Tumbler Besar (24 oz / Olahraga)
  - 🫙 `1.000 ml` — Botol 1 Liter (Stanley, Tyeso)
- **Input Angka Fleksibel**: Dilengkapi masukan angka manual dengan keyboard numerik mobile otomatis (`inputmode="numeric"` dan `pattern="[0-9]*"`).

### 3. Arsitektur 100% Local-First & Privasi Penuh
- **Zero Tracker, Zero Ads**: Bebas dari pelacak analitik pihak ketiga dan iklan mengganggu.
- **Penyimpanan Lokal IndexedDB**: Seluruh data profil pengguna, log pencatatan minum, dan preferensi disimpan pada IndexedDB peramban lokal.
- **Ketahanan Penyimpanan**: Menggunakan API `navigator.storage.persist()` agar sistem operasi tidak menghapus basis data aplikasi saat ruang penyimpanan menipis.

### 4. Mesin Pengingat Adaptif & Web Push Notifications
- **Jadwal Pintar Mengikuti Ritme Biologis**: Menghitung interval dan takaran minum secara proporsional di antara *Waktu Bangun* dan *Waktu Tidur*.
- **Mode Tenang Malam Hari (*Quiet Hours*)**: Pengingat otomatis dijeda menjelang waktu istirahat agar tidak mengganggu kualitas tidur Anda.
- **Standar W3C Web Push**: Terintegrasi dengan protokol VAPID (*Voluntary Application Server Identification*) dan penjadwal latar belakang Netlify Functions & Netlify Blobs.

### 5. Analisis Riwayat & Statistik Interaktif
- **Visualisasi Tren**: Menampilkan grafik konsumsi 7 hari dan 30 hari terakhir.
- **Statistik Kebiasaan**: Rangkuman rata-rata asupan harian, persentase keberhasilan target, dan pencapaian hari berturut-turut (*streak counter*).
- **Audit Log Lengkap**: Pengguna dapat melihat daftar waktu konsumsi per hari dan menghapus entri jika terjadi salah catat.

### 6. Pengalaman Pengguna Modern Bergaya iOS
- **Header Frosted Glass Sticky**: Navigasi atas dengan efek blur transparan yang elegan.
- **Floating Bottom Nav Bar**: Bilah navigasi melayang yang nyaman dijangkau oleh satu ibu jari pada ponsel layar besar.
- **Mikro-Animasi Responsif**: Umpan balik haptik visual saat tombol ditekan, transisi modal yang halus, dan cincin progres SVG animasi.

### 7. Pencadangan & Pemulihan Data Mandiri (Backup & Restore)
- **Ekspor JSON**: Cadangkan seluruh basis data ke file JSON lokal (`drops-daily-backup-YYYY-MM-DD.json`) kapan saja.
- **Impor & Migrasi**: Pulihkan data cadangan ke perangkat lain dengan mudah tanpa bergantung pada akun komputasi awan.

---

## 🛠️ Tabel Tech Stack

| Layer Arsitektur | Teknologi / Library | Versi | Peran & Alasan Penggunaan |
| :--- | :--- | :--- | :--- |
| **Frontend Core** | [Svelte](https://svelte.dev/) | `^5.0.0` | Library reaktif generasi terbaru menggunakan paradigma *Runes* (`$state`, `$derived`, `$props`) yang ultra-ringan dan tanpa overhead virtual DOM. |
| **Meta Framework** | [SvelteKit](https://kit.svelte.dev/) | `^2.0.0` | Menyediakan routing berbasis filesystem, adaptabilitas serverless, dan arsitektur PWA yang optimal. |
| **Bahasa Pemrograman** | [TypeScript](https://www.typescriptlang.org/) | `^5.0.0` | Menjamin tipe data yang ketat (*type safety*) dan mencegah bug waktu kompilasi pada formula AKG dan operasi basis data. |
| **Styling & CSS** | [Tailwind CSS](https://tailwindcss.com/) | `^4.0.0` | Mesin CSS performa tinggi berbasis *Oxide engine* dengan skema warna HSL yang modern. |
| **Build Tooling** | [Vite](https://vitejs.dev/) | `^8.0.0` | Kompilasi kilat (*lightning fast HMR*) dan pembuatan bundel produksi teroptimasi. |
| **Basis Data Klien** | [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) via [`idb`](https://github.com/jakearchibald/idb) | `^8.0.0` | Penyimpanan data terstruktur berkapasitas besar di sisi peramban dengan dukungan *promises* asinkron. |
| **PWA & Offline** | Service Worker Native + Web Manifest | Standard | Memungkinkan aplikasi dapat dipasang di homescreen dan berfungsi tanpa koneksi internet. |
| **Web Push Engine** | [`web-push`](https://github.com/web-push-libs/web-push) | `^3.6.0` | Pengiriman notifikasi berbasis standar W3C & VAPID. |
| **Backend Serverless** | [Netlify Functions](https://www.netlify.com/platform/core/functions/) & Blobs | Native | Penjadwalan eksekusi notifikasi latar belakang dengan kunci atomik (*atomic lock*). |

---

## 🔑 Kredensial Default & Sistem Autentikasi

> [!NOTE]  
> **Drops Daily mengusung prinsip "Zero-Login / No Credentials Required" (Arsitektur Local-First).**

1. **Apakah Perlu Email / Password?**  
   **TIDAK.** Anda tidak perlu mendaftar, mengisi formulir email, atau membuat kata sandi. Aplikasi ini langsung siap digunakan begitu Anda membukanya di peramban.
2. **Di Mana Akun Saya Disimpan?**  
   "Akun" Anda adalah profil lokal yang disimpan secara aman di peramban perangkat Anda sendiri melalui IndexedDB (`hydration-pwa`).
3. **Bagaimana Cara Menguji Aplikasi Pertama Kali?**  
   - Buka aplikasi di peramban.
   - Anda akan disambut oleh alur **Onboarding Wizard** interaktif (6 langkah mudah: nama panggilan, jenis kelamin, usia, berat badan, intensitas aktivitas, dan jam bangun/tidur).
   - Setelah selesai, Anda langsung diarahkan ke Dashboard utama dan siap mencatat konsumsi air.

---

## 🏁 Panduan Instalasi & Menjalankan Proyek

Ikuti langkah-langkah mudah di bawah ini untuk menjalankan **Drops Daily** di komputer lokal Anda:

### 1️⃣ Prasyarat Sistem
Pastikan komputer Anda telah terpasang:
- **Node.js**: Versi `22.x` atau lebih baru ([Unduh Node.js](https://nodejs.org/))
- **NPM**: Versi `10.x` atau lebih baru (biasanya sudah terpasang bersama Node.js)
- **Git**: Untuk mengelola repositori kode

Periksa versi yang terpasang di terminal Anda:
```bash
node -v
npm -v
```

### 2️⃣ Clone Repositori
Buka terminal dan unduh repositori ini ke direktori kerja Anda:
```bash
git clone https://github.com/dhafinfuad/drops-daily.git
cd drops-daily
```

### 3️⃣ Pasang Dependensi Proyek
Unduh semua pustaka yang dibutuhkan menggunakan NPM:
```bash
npm install
```

### 4️⃣ Jalankan Server Pengembangan (Dev Mode)
Jalankan server pengembangan lokal dengan perintah:
```bash
npm run dev
```
Setelah berjalan, buka alamat berikut pada peramban web favorit Anda:
```text
http://localhost:5173
```
*Tip: Anda dapat menekan `F12` lalu mengaktifkan mode responsive/mobile di DevTools (misal: iPhone 14 Pro) untuk melihat pengalaman tampilan ponsel yang sesungguhnya.*

---

## 🧪 Panduan Pengujian (Testing Guide)

Kami menjaga stabilitas kode dengan serangkaian pemeriksaan kualitas ketat:

### Pemeriksaan Tipe & Validasi Sintaks
Untuk memastikan tidak ada kesalahan tipe data pada TypeScript dan komponen Svelte:
```bash
npm run check
```
*Hasil yang diharapkan: `0 errors, 0 warnings`.*

### Pengujian Kompilasi Produksi (Production Build)
Untuk memastikan seluruh modul dapat dibundel secara optimal tanpa masalah:
```bash
npm run build
```

### Menjalankan Preview Hasil Build
Untuk meninjau bundle produksi lokal sebelum diunggah ke hosting:
```bash
npm run preview
```

### Skenario Uji Manual Fitur Utama
1. **Uji Formula AKG**: Ubah berat badan pada Pengaturan dan amati pembaruan target harian otomatis.
2. **Uji Quick Add & Custom**: Klik tombol `+ 250 ml`, verifikasi kenaikan cincin persentase. Buka tombol `Custom`, pilih wadah `500 ml`, lalu cek histori log.
3. **Uji Mode Offline**: Buka tab *Network* di DevTools, ubah status ke *Offline*, muat ulang halaman. Aplikasi harus tetap terbuka sempurna.
4. **Uji Backup & Restore**: Ekspor data dari Pengaturan, reset data, lalu impor kembali file JSON tersebut.

---

## 🔒 Praktik Keamanan Terbaik (Security Best Practices)

Keamanan dan privasi pengguna adalah prioritas utama rancangan **Drops Daily**:

- 🛡️ **Zero Server Data Exposure**: Tidak ada data medis atau riwayat personal yang dikirim atau disimpan di server basis data eksternal. Semua data berada di kendali fisik pengguna.
- 🔑 **Perlindungan Kunci VAPID**: Kunci privat VAPID (`VAPID_PRIVATE_KEY`) hanya disimpan pada environment variable Netlify Functions dan tidak pernah terekspos ke bundle JavaScript frontend.
- 🧼 **Sanitasi Data Masukan**: Setiap input numerik divalidasi dan disanitasi menggunakan skema batas minimum dan maksimum untuk mencegah anomali data (misal: batasan volume minum wajar per sesi 50ml s.d. 3.000ml).
- 🔒 **Content Security Policy (CSP)**: Menolak injeksi skrip eksternal yang tidak sah guna melindungi integritas runtime aplikasi.
- 📦 **Pembersihan Log Otomatis**: Antrean log notifikasi sementara di sisi serverless dibersihkan secara otomatis setelah melewati ambang batas 72 jam untuk mencegah penumpukan metadata.

---

## ☁️ Panduan Deployment (Netlify & VAPID)

Aplikasi ini telah siap untuk disebarkan secara instan ke platform **Netlify** menggunakan `@sveltejs/adapter-netlify`.

### Langkah 1: Generate Pasangan Kunci VAPID (Untuk Web Push)
Jalankan skrip pembuat kunci VAPID:
```bash
npm run vapid
```
Skrip akan mencetak dua buah kunci:
- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`

### Langkah 2: Konfigurasi Environment Variables di Netlify
Buka **Site Settings > Environment Variables** di dasbor Netlify Anda, lalu tambahkan:
- `VAPID_PUBLIC_KEY`: Kunci publik yang dihasilkan
- `VAPID_PRIVATE_KEY`: Kunci privat yang dihasilkan
- `VAPID_SUBJECT`: Alamat email kontak pengelola (contoh: `mailto:admin@domainanda.com`)

### Langkah 3: Deploy Menggunakan Netlify CLI atau Git
Jika menggunakan **Netlify CLI**:
```bash
# Deploy ke draft / staging
npx netlify deploy

# Deploy langsung ke production
npx netlify deploy --prod
```
Atau cukup sambungkan branch `main` repositori GitHub Anda ke Netlify. Netlify akan secara otomatis mendeteksi pengaturan build:
- **Build Command**: `npm run build`
- **Publish Directory**: `build`

---

## 🗄️ Struktur Database Lokal (IndexedDB)

Aplikasi menggunakan basis data lokal bernama `hydration-pwa` dengan pembagian *object stores* sebagai berikut:

```text
hydration-pwa
├── 📄 appMeta         # Metadata instalasi, status onboarding, dan token Web Push
├── 👤 profile         # Profil fisik pengguna (usia, jenis kelamin, berat badan, aktivitas)
├── ⚙️ settings        # Preferensi pengguna (targetMode, jam aktif bangun/tidur, preset porsi)
├── 📝 intakeEntries   # Catatan log setiap sesi minum (id, timestamp, volume ml, jenis wadah)
├── 🎯 dailyTargets    # Riwayat target harian yang dihitung secara dinamis
└── ⏰ reminderState   # Jadwal, jeda waktu, dan status eksekusi pengingat adaptif
```

---

## 🗺️ Roadmap Pengembangan

- [x] **v0.5.0**: Desain iOS compact, circular progress ring, bottom navigation melayang.
- [x] **v0.6.0**: Standardisasi radius komponen (10–14px) dan ritme vertikal proporsional.
- [x] **v0.7.0**: Rebranding **Drops Daily**, kustomisasi porsi khas Indonesia, sticky frosted header, input numerik mobile murni.
- [ ] **v0.8.0**:
  - [ ] Pilihan tema gelap / terang (*Dark Mode & Light Mode*) otomatis sesuai sistem.
  - [ ] Pilihan jenis minuman tambahan (kopi, teh, susu, jus) dengan faktor hidrasi spesifik.
  - [ ] Widget PWA untuk layar utama Android (*Android PWA Shortcuts & Widgets*).
- [ ] **v1.0.0**:
  - [ ] Integrasi opsional dengan Apple HealthKit & Google Health Connect.
  - [ ] Dukungan sinkronisasi multi-perangkat terenkripsi ujung-ke-ujung (*End-to-End Encrypted Cloud Sync*).
  - [ ] Lokalisasi multibahasa penuh (Bahasa Indonesia & Bahasa Inggris).

---

## 🤝 Panduan Kontribusi (Contributing)

Kami sangat menyambut baik kontribusi dari komunitas! Baik berupa perbaikan bug, penyempurnaan dokumentasi, maupun usulan fitur baru.

1. **Fork** repositori ini ke akun GitHub Anda.
2. Buat branch fitur baru dari `main`:
   ```bash
   git checkout -b fitur/nama-fitur-keren
   ```
3. Lakukan perubahan kode dan pastikan validasi berhasil:
   ```bash
   npm run check
   npm run build
   ```
4. Buat commit dengan pesan yang deskriptif dan terstruktur:
   ```bash
   git commit -m "feat: tambahkan fitur pilihan jenis minuman"
   ```
5. Push branch Anda ke repositori fork:
   ```bash
   git push origin fitur/nama-fitur-keren
   ```
6. Buka **Pull Request** di GitHub dan jelaskan perubahan yang Anda ajukan.

---

## 💬 Kontak & Dukungan

Jika Anda menemukan kendala teknis, memiliki ide fitur menarik, atau ingin berdiskusi mengenai proyek ini:

- 🐛 **Laporkan Bug / Request Fitur**: [GitHub Issues](https://github.com/dhafinfuad/drops-daily/issues)
- 💡 **Diskusi Ide & Saran**: [GitHub Discussions](https://github.com/dhafinfuad/drops-daily/discussions)
- 📧 **Surel Pengembang**: Kontak melalui profil GitHub [@dhafinfuad](https://github.com/dhafinfuad)

---

## 💖 Dukungan Sponsor (Sponsorship)

Jika **Drops Daily** membantu Anda menjaga kesehatan atau menjadi referensi bermanfaat dalam mempelajari arsitektur Svelte 5 PWA modern, pertimbangkan untuk memberikan dukungan:

- ⭐ **Beri Bintang (Star)** pada repositori ini di GitHub!
- 📢 Bagikan proyek ini kepada teman, keluarga, dan rekan kerja Anda.
- ☕ Dukung pengembang melalui tautan donasi / sponsor di profil GitHub.

---

## 📜 Lisensi

Proyek ini dilisensikan di bawah lisensi **MIT License** — silakan gunakan, pelajari, dan kembangkan secara bebas untuk keperluan non-komersial maupun komersial dengan tetap menyertakan atribusi hak cipta.

<p align="center">
  Dibuat dengan ❤️ dan kepedulian terhadap kesehatan hidrasi Anda.
</p>
