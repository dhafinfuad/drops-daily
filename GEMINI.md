# Project Guidelines & Assistant Rules

## 1. Automatic Git Workflow
- **Auto Git Add & Commit**: Setiap kali asisten selesai melakukan penambahan, perubahan, atau penghapusan file dalam proyek ini untuk memenuhi permintaan pengguna, asisten **HARUS** secara otomatis menjalankan:
  1. `git add .`
  2. `git commit -m "<deskripsi singkat dan jelas mengenai perubahan yang dilakukan>"`
- **Jangan Git Push**: Asisten **TIDAK BOLEH** menjalankan `git push`. Pengguna akan menjalankan `git push` sendiri ketika sudah siap mengunggah ke GitHub.
- **Informasikan ke Pengguna**: Setelah commit dibuat, beritahukan pesan commit tersebut secara singkat kepada pengguna agar pengguna tahu perubahan apa saja yang baru saja dicatat.

## 2. Gaya Komunikasi
- Pengguna masih awam tentang Git, GitHub, dan pemrograman.
- Jelaskan setiap konsep teknis dengan ramah, sabar, bertahap (step-by-step), dan gunakan bahasa Indonesia yang mudah dipahami.
