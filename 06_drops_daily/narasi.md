**DROPS DAILY**  
Aplikasi Web Progresif (PWA) Pelacak & Pengingat Hidrasi Cerdas: Kalkulator Kebutuhan Cairan Personal Berbasis Standar Medis AKG Kemenkes RI 2019, Arsitektur 100% Local-First Tanpa Akun, Preset Wadah Realistis Khas Indonesia, Mesin Pengingat Adaptif dengan Notifikasi Push Web, serta Pengalaman Pengguna Modern Bergaya iOS.

Svelte 5 (Runes)  
SvelteKit 2  
TypeScript 5  
Tailwind CSS v4  
IndexedDB (idb)  
PWA (Service Worker)  
Web Push (VAPID)  
Netlify Functions & Blobs  
Vite 8  

### STUDI KASUS ARSITEKTUR
**Drops Daily — Rekayasa PWA Local-First untuk Pemantauan Hidrasi Presisi Berbasis Standar Medis Kemenkes RI**  
✕   

#### Latar Belakang
Sebagian besar aplikasi pelacak asupan air konvensional saat ini masih menerapkan formula seragam yang kaku ("semua orang wajib minum 2 liter per hari") tanpa memperhitungkan variabel biologis seperti usia, berat badan, intensitas aktivitas fisik, maupun kondisi medis khusus. Selain itu, banyak aplikasi komersial mewajibkan pembuatan akun pihak ketiga dan membebankan pelacak analitik iklan (*third-party trackers*), yang menimbulkan kekhawatiran privasi serius karena riwayat kesehatan dan profil fisik pengguna terekspos ke peladen komputasi awan. Ketergantungan penuh pada koneksi internet serta pilihan porsi minum yang tidak realistis dengan kebiasaan wadah minum masyarakat Indonesia semakin menurunkan kepatuhan hidrasi jangka panjang.

Aplikasi **Drops Daily** dirancang dan dibangun dari fondasi awal sebagai solusi pemantauan hidrasi modern yang presisi, aman, dan menghormati privasi penuh pengguna. Mengadopsi pedoman **Permenkes RI No. 28 Tahun 2019 tentang Angka Kecukupan Gizi (AKG)**, aplikasi ini menghitung target cairan harian secara ilmiah dan proporsional. Seluruh arsitektur berjalan dengan prinsip *local-first*, menjamin tidak ada satu pun byte data pengguna yang dikirim ke server luar, namun tetap memberikan keandalan notifikasi push cerdas di latar belakang serta pengalaman web setara aplikasi bawaan (*native-like app*) yang dapat dipasang di smartphone.

---

#### Cakupan 5 Modul Utama Aplikasi

**1. Kalkulator Hidrasi Presisi Berbasis Standar Medis AKG**  
**KALKULATOR AKG**  
Modul wizard onboarding dan kalkulasi otomatis yang mengolah data antropometri (usia, jenis kelamin, berat badan, dan intensitas aktivitas) mengacu pada standar resmi Kementerian Kesehatan RI. Sistem secara cerdas membedakan antara kebutuhan cairan total (*total water intake*) dan target air putih murni (*plain water* ~80%). Dilengkapi dengan *medical safety-gate*: penambahan asupan adaptif bagi ibu hamil (Trimester 1, 2, 3) dan ibu menyusui (semester 1 dan 2), dukungan pembatasan cairan medis (seperti gagal ginjal atau jantung kronis), serta panduan spesifik bayi 0–11 bulan tanpa rekomendasi air bebas.

**2. Pencatatan Cepat & Wadah Realistis Khas Indonesia**  
**QUICK ADD & WADAH**  
Antarmuka pencatatan instan dengan tombol aksi cepat sekali sentuh (+250 ml dan +500 ml) serta lembar aksi (*bottom sheet*) porsi kustom yang merefleksikan wadah minum nyata masyarakat Indonesia: Gelas Belimbing/Pantry (250 ml), Cangkir/Mug Meja (350 ml), Tumbler Sedang Tupperware/LocknLock (500 ml), Botol Air Mineral Sedang (600 ml), Tumbler Olahraga (750 ml), hingga Botol 1 Liter (Stanley/Tyeso). Dilengkapi input numerik manual berkecepatan tinggi yang secara otomatis memicu keypad angka pada perangkat bergerak.

**3. Arsitektur 100% Local-First & Privasi Penuh**  
**LOCAL-FIRST & PRIVASI**  
Fondasi *Zero-Login* tanpa formulir pendaftaran, tanpa kata sandi, dan bebas 100% dari iklan maupun pelacak analitik pihak ketiga. Seluruh basis data profil fisik, log sesi minum, preferensi pengguna, dan status pengingat disimpan secara terenkripsi dan terstruktur pada IndexedDB lokal peramban. Dilengkapi integrasi API peramban modern `navigator.storage.persist()` untuk mencegah sistem operasi membersihkan memori basis data saat kapasitas penyimpanan perangkat menipis.

**4. Mesin Pengingat Adaptif & Web Push Notifications**  
**ADAPTIVE REMINDER**  
Algoritma penjadwalan cerdas yang menghitung interval dan takaran minum secara proporsional di sepanjang rentang waktu aktif biologis pengguna (antara Jam Bangun dan Jam Tidur). Menerapkan *Quiet Hours* otomatis untuk menjaga kenyamanan istirahat malam pengguna. Terintegrasi penuh dengan standar W3C Web Push melalui enkripsi VAPID (*Voluntary Application Server Identification*) dan penjadwal serverless Netlify Functions dengan mekanisme penguncian atomik (*atomic lock*) pada Netlify Blobs.

**5. Analitik Riwayat, Audit Trail & Pencadangan Data Mandiri**  
**HISTORI & BACKUP**  
Dasbor histori komprehensif yang memvisualisasikan tren hidrasi 7 hari dan 30 hari terakhir dalam grafik batang intuitif, metrik persentase keberhasilan harian, rata-rata konsumsi cairan, dan perhitungan hari konsisten (*streak counter*). Pengguna dapat melihat daftar audit log konsumsi per jam serta menghapus entri yang salah catat. Dilengkapi fitur *Backup & Restore* mandiri untuk mengekspor seluruh basis data ke berkas JSON lokal dan memulihkannya ke perangkat lain kapan saja.

---

#### Spesifikasi Rekayasa & Tata Kelola Keamanan

* **Arsitektur Reaktif Modern (Svelte 5 Runes & Tailwind CSS v4)**  
  Dibangun menggunakan mesin reaktivitas generasi terbaru **Svelte 5** dengan paradigma *Runes* (`$state`, `$derived`, `$props`) yang mengeliminasi overhead virtual DOM sehingga menghasilkan rendering 60 FPS yang ultra-ringan pada perangkat hemat daya. Dipadukan dengan **SvelteKit 2** dan sistem desain **Tailwind CSS v4** bertema *iOS-inspired compact layout* (radius 10–14px, sticky frosted glass header dengan efek blur, dan floating bottom navigation bar).

* **Penyimpanan Lokal Terstruktur, Sanitasi Input & Ketahanan Data**  
  Menggunakan abstraksi asinkron **IndexedDB** via library `idb` untuk menangani transaksi data terstruktur berkecepatan tinggi tanpa pemblokiran antarmuka utama. Setiap input volume disanitasi ketat dengan batas ambang fisiologis wajar (50 ml hingga 3.000 ml per sesi) guna mencegah anomali data. Struktur data dirancang modular dalam 6 *object store* (`profile`, `settings`, `intakeEntries`, `dailyTargets`, `reminderState`, `appMeta`).

* **Progressive Web App (PWA) Offline-Ready & Serverless Push Engine**  
  Didukung Service Worker native dengan strategi caching cerdas yang memungkinkan aplikasi terbuka seketika dan berfungsi penuh 100% secara luring (*offline*). Pengiriman notifikasi push mengadopsi standar enkripsi payload Web Push VAPID, di mana kunci privat (*private key*) terlindungi rapat pada *environment variables* serverless Netlify dan tidak pernah terekspos ke klien. Seluruh antrean log push serverless dibersihkan otomatis setelah 72 jam demi meminimalkan jejak metadata.
