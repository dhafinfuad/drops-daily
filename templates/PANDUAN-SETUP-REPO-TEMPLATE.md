# 📖 Panduan Menyiapkan Repositori Template Privat di GitHub & Antigravity IDE

Panduan ini menjelaskan langkah demi langkah cara membuat satu repositori **Private** khusus di GitHub yang berfungsi sebagai **Master Template**, serta bagaimana cara membukanya di Antigravity IDE kapan saja.

---

## 🌟 Mengapa Memakai "Template Repository" di GitHub?

GitHub memiliki fitur resmi bernama **Template Repository**. 
Keuntungannya:
1. **Bersifat Privat**: Hanya Anda yang dapat melihat dan mengaksesnya.
2. **Sekali Klik Jadi Repo Baru**: Setiap kali Anda ingin membuat proyek baru di GitHub, Anda cukup memilih *"Use this template"*, dan seluruh struktur file (termasuk template README ini) langsung otomatis ada di proyek baru Anda.
3. **Bisa Dibuka di Antigravity IDE**: Anda bisa membuka folder repo template ini atau repo hasil generate-nya di Antigravity IDE kapan saja.

---

## 🛠️ Langkah 1: Buat Repositori Baru di GitHub (Private)

1. Buka peramban web dan masuk ke akun GitHub Anda: [github.com](https://github.com/).
2. Klik tombol **New** (warna hijau) atau ikon `+` di kanan atas > pilih **New repository**.
3. Isi informasi berikut:
   - **Repository name**: `github-templates` *(atau nama lain yang Anda sukai, misalnya `project-starter`)*.
   - **Description**: `Koleksi template README dan starter proyek pribadi`.
   - **Visibility**: Pilih **Private** 🔒 *(agar tidak terlihat oleh publik)*.
   - **Initialize this repository with**: Biarkan tidak dicentang (atau centang Add README juga boleh).
4. Klik tombol hijau **Create repository**.

---

## ⚙️ Langkah 2: Aktifkan Fitur "Template Repository" di GitHub

Agar repo ini bisa langsung dipakai membuat proyek baru dengan 1 klik:
1. Pada halaman repository GitHub yang baru saja dibuat, klik tab **Settings** (di sebelah kanan tab *Pull requests* dan *Actions*).
2. Di bagian paling atas (**General**), cari opsi:
   - ☑️ **Template repository**
3. Beri tanda centang pada kotak tersebut.
4. Selesai! Sekarang repo Anda resmi menjadi Master Template.

---

## 💻 Langkah 3: Siapkan di Komputer Lokal & Unggah Template Ini

Buka terminal (Git Bash atau PowerShell) di komputer Anda, lalu jalankan langkah ini:

1. Buat folder baru di Laragon untuk repositori template Anda:
   ```bash
   mkdir c:\laragon\www\github-templates
   cd c:\laragon\www\github-templates
   git init
   ```

2. Salin file template dari proyek Drops Daily ke folder baru tersebut:
   *(Atau buat file `README.md` dan tempel isi dari `templates/README-TEMPLATE.md`)*

3. Buat commit pertama:
   ```bash
   git add .
   git commit -m "feat: inisialisasi master template README"
   ```

4. Sambungkan ke GitHub (ganti `USERNAME_ANDA` dengan username GitHub Anda):
   ```bash
   git branch -M main
   git remote add origin https://github.com/USERNAME_ANDA/github-templates.git
   git push -u origin main
   ```

---

## 🚀 Cara Menggunakan Template Ini untuk Proyek Baru

Ada **2 cara mudah** menggunakannya di masa depan:

### Cara A: Melalui Tombol "Use this template" di GitHub (Paling Mudah)
1. Buka repo `https://github.com/USERNAME_ANDA/github-templates` di browser.
2. Di bagian atas, klik tombol hijau **Use this template** > pilih **Create a new repository**.
3. Beri nama repo proyek baru Anda (misal `aplikasi-toko-buku`).
4. Repo baru langsung terisi otomatis dengan format template README ini!
5. Clone repo baru tersebut ke `c:\laragon\www\...`, lalu buka di Antigravity IDE.

### Cara B: Dibuka Langsung di Antigravity IDE
1. Di Antigravity IDE, klik menu **File > Open Folder...**
2. Pilih folder `c:\laragon\www\github-templates`.
3. Anda bisa minta bantuan asisten:
   > *"Tolong sesuaikan template README ini untuk proyek baru saya yang bernama 'Aplikasi Kasir Masjid'..."*
4. Asisten AI akan otomatis membantu mengisi semua placeholder sesuai kebutuhan proyek Anda.

---

## 💡 Tips Variasi Badge Shields.io untuk Tech Stack Populer

Berikut contoh URL badge yang bisa langsung di-copy-paste ke template README:

- **Laravel**: `https://img.shields.io/badge/Laravel-11.x-FF2D20?logo=laravel&logoColor=white`
- **React**: `https://img.shields.io/badge/React-19.x-61DAFB?logo=react&logoColor=black`
- **Next.js**: `https://img.shields.io/badge/Next.js-15.x-000000?logo=nextdotjs&logoColor=white`
- **Vue**: `https://img.shields.io/badge/Vue.js-3.x-4FC08D?logo=vuedotjs&logoColor=white`
- **Python / FastAPI**: `https://img.shields.io/badge/FastAPI-0.110-009688?logo=fastapi&logoColor=white`
- **Docker**: `https://img.shields.io/badge/Docker-Container-2496ED?logo=docker&logoColor=white`
- **PostgreSQL**: `https://img.shields.io/badge/PostgreSQL-16.x-4169E1?logo=postgresql&logoColor=white`
- **MySQL**: `https://img.shields.io/badge/MySQL-8.x-4479A1?logo=mysql&logoColor=white`
