# UI compact scale — v0.5.0

Versi ini dibuat dari project `hydration-pwa-production-v0.4.1-manual-edit-2` milik pengguna dan mempertahankan revisi teks/UI manual yang sudah ada.

Skala visual yang dipakai:
- card hero: sekitar 20px
- grouped card / settings: 16px
- control: 12–14px
- compact card: 14px
- bottom sheet: 30px (dipertahankan sebagai surface besar)
- settings icon box: 36px
- settings row: minimum 56px
- progress ring: 200px, stroke 10px
- primary control: padding vertikal 14px (py-3.5)

Bottom navigation dibuat lebih datar: tidak ada nested active pill/circle; status aktif ditunjukkan terutama lewat tint biru.

## Tes lokal

```powershell
npm install
npm run dev
```

Sebelum deploy:

```powershell
npm run check
npm run build
npx netlify-cli deploy --prod
```
