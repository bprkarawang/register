# Sistem Tanda Terima — Panduan Setup

Aplikasi web statis (HTML/JS) untuk mengunggah foto tanda terima + tanda tangan
digital, tersimpan langsung ke **Google Drive milik Anda sendiri**. Tidak
butuh server/backend — bisa di-hosting gratis di GitHub Pages, Netlify, atau
Vercel.

## Struktur file

```
tanda-terima-app/
├── index.html        (halaman beranda)
├── upload.html        (form upload — Flowchart 1)
├── cari.html           (form pencarian — Flowchart 2)
├── css/style.css
├── js/config.js       (ISI DENGAN CLIENT ID & API KEY ANDA)
├── js/drive.js         (logika Google Drive API)
├── js/upload.js
└── js/cari.js
```

## Langkah 1 — Setup Google Cloud (sekali saja)

1. Buka https://console.cloud.google.com/ dan buat project baru (misal:
   "Tanda Terima App").
2. Buka **APIs & Services → Library**, cari **Google Drive API**, klik
   **Enable**.
3. Buka **APIs & Services → OAuth consent screen**:
   - Pilih **External** (kecuali Anda pakai Google Workspace).
   - Isi nama aplikasi, email Anda.
   - Pada bagian **Scopes**, tambahkan
     `https://www.googleapis.com/auth/drive.file`.
   - Pada bagian **Test users**, tambahkan alamat Gmail Anda sendiri
     (selama aplikasi belum "Published", hanya test user yang bisa login).
4. Buka **APIs & Services → Credentials**:
   - Klik **Create Credentials → API Key** → salin nilainya untuk
     `API_KEY`.
   - Klik **Create Credentials → OAuth client ID**:
     - Application type: **Web application**
     - **Authorized JavaScript origins**: isi dengan alamat hosting Anda,
       contoh:
       - `http://localhost:5500` (untuk tes lokal)
       - `https://nama-anda.github.io` (jika pakai GitHub Pages)
       - `https://nama-app-anda.netlify.app` (jika pakai Netlify)
     - Salin **Client ID** yang dihasilkan.

5. Buka `js/config.js`, isi:
   ```js
   CLIENT_ID: "xxxxx.apps.googleusercontent.com",
   API_KEY: "AIzaSy...",
   ```

> Catatan: aplikasi hanya meminta izin `drive.file`, artinya aplikasi HANYA
> bisa melihat/menulis file & folder yang **dibuat oleh aplikasi ini
> sendiri** — bukan seluruh isi Google Drive Anda. Ini lebih aman dan lebih
> mudah disetujui Google.

## Langkah 2 — Coba secara lokal (opsional)

Buka folder ini dengan ekstensi **Live Server** di VS Code, atau jalankan:

```bash
npx serve .
```

lalu buka `http://localhost:5500` (sesuaikan port) — pastikan alamat ini
terdaftar di **Authorized JavaScript origins** (Langkah 1.4).

## Langkah 3 — Hosting gratis

Pilih salah satu:

**A. GitHub Pages**
1. Buat repo baru di GitHub, upload semua file ini.
2. Masuk ke **Settings → Pages**, pilih branch `main` folder `/root`.
3. Alamat aktif di `https://username.github.io/nama-repo/`.
4. Tambahkan alamat ini ke **Authorized JavaScript origins** di Google
   Cloud Console (Langkah 1.4), lalu tunggu 1-2 menit.

**B. Netlify**
1. Daftar di https://netlify.com, drag & drop folder ini ke dashboard
   ("Deploys" → "Drag and drop").
2. Salin alamat `https://nama-app-anda.netlify.app`, tambahkan ke
   **Authorized JavaScript origins**.

**C. Vercel** — caranya serupa, `vercel.com` → import folder → deploy.

## Cara pakai aplikasi

1. **Upload** (`upload.html`): isi nomor register → unggah foto → tanda
   tangan di kotak putih → klik **Simpan** → login Google (sekali saja,
   browser akan mengingat) → file otomatis tersimpan ke:
   ```
   Google Drive
   └── Tanda Terima
       └── <Nomor Register>
           ├── foto.jpg
           └── ttd.png
   ```
2. **Cari** (`cari.html`): isi nomor register yang sama → klik **Cari** →
   foto & tanda tangan ditampilkan dengan tombol **Lihat**/**Unduh**.

## Publish agar semua orang bisa login (opsional)

Selama status OAuth consent screen masih **Testing**, hanya akun yang
didaftarkan sebagai *test user* yang bisa login. Jika aplikasi akan dipakai
banyak orang (misal staf kantor), buka **OAuth consent screen → Publish
App**. Untuk scope `drive.file`, Google biasanya tidak mewajibkan proses
verifikasi tambahan karena aksesnya terbatas.

## Troubleshooting

- **"Error 400: redirect_uri_mismatch" / popup login gagal** → pastikan
  alamat website Anda persis sama dengan yang didaftarkan di
  *Authorized JavaScript origins* (termasuk `http` vs `https`).
- **"Access blocked: App not verified"** → tambahkan akun Anda sebagai
  *test user* (Langkah 1.3), atau klik "Advanced → Go to (nama app) (unsafe)"
  saat login (aman, karena ini aplikasi Anda sendiri).
- **Foto/tanda tangan tidak muncul di halaman Cari** → pastikan scope yang
  dipakai adalah `drive.file` dan folder dibuat lewat aplikasi ini
  (bukan folder lama yang Anda buat manual sebelumnya).
