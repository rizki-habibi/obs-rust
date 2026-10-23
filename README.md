# OBS Rust Web Studio

Studio streaming ringan berbasis web dengan UI bergaya OBS, dirancang memakai TypeScript/Vite untuk antarmuka dan Rust/WebAssembly untuk modul pemrosesan yang cocok dijalankan di browser.

## Status

Fondasi awal / MVP. Preview kamera dan layar berjalan di browser setelah izin diberikan. Output siaran langsung ke YouTube membutuhkan endpoint media yang kompatibel (RTMP/WHIP); Vercel digunakan untuk hosting aplikasi web, bukan sebagai encoder RTMP persisten.

## Fitur target

- Pratinjau kamera, mikrofon, dan berbagi layar
- Scene dan daftar sumber
- Teks overlay dan URL sumber browser
- Panel konfigurasi YouTube Live
- Modul Rust yang dapat dikompilasi ke WebAssembly
- Deploy frontend ke Vercel

## Menjalankan lokal

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Untuk membangun modul Rust/WASM, instal Rust, target `wasm32-unknown-unknown`, dan `wasm-pack`, lalu jalankan `npm run build:wasm`.

## Deployment Vercel

Impor repositori ini ke Vercel. Framework preset: Vite; build command: `npm run build`; output directory: `dist`.

Tambahkan endpoint media yang Anda kendalikan sebagai konfigurasi deployment jika ingin mengaktifkan output streaming. Jangan menyimpan stream key YouTube di kode frontend, repository, atau log.

## Catatan keamanan

- Stream key adalah rahasia; jangan commit atau menampilkannya di URL publik.
- Halaman web tidak dapat langsung mengirim RTMP hanya dengan API browser biasa.
- Batasi sumber URL dan endpoint ingest untuk menghindari penyalahgunaan.

## Lisensi

Tentukan lisensi proyek sebelum distribusi publik.