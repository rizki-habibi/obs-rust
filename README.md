# OBS Rust Web Studio

Studio streaming ringan berbasis web dengan UI bergaya OBS, dirancang memakai TypeScript/Vite untuk antarmuka dan Rust/WebAssembly untuk modul pemrosesan yang cocok dijalankan di browser.

## Status

Fondasi awal / MVP. Preview kamera/layar, rekaman lokal WebM, scene dasar, overlay teks/URL, dan penerbitan WebRTC WHIP ke endpoint yang kompatibel tersedia. Untuk mencapai YouTube, endpoint WHIP harus terhubung ke server media yang meneruskan ke ingest YouTube. Vercel hanya meng-host aplikasi web, bukan encoder RTMP persisten.

## Fitur target

- Pratinjau kamera, mikrofon, dan berbagi layar
- Scene dan daftar sumber
- Teks overlay dan URL sumber browser
- Panel konfigurasi YouTube Live
- Penerbitan WebRTC WHIP ke endpoint media yang kompatibel
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

Pada panel YouTube Live, isi endpoint WHIP HTTPS dari server media yang Anda kendalikan. Server media tersebut harus meneruskan/merelay stream ke YouTube melalui RTMP atau layanan ingest yang didukung. Endpoint harus mengizinkan permintaan browser (CORS) dan metode WHIP POST; jika server mengembalikan Location, aplikasi akan mencoba DELETE saat siaran dihentikan. Jangan masukkan stream key YouTube ke frontend atau repository.

## Catatan keamanan

- Stream key adalah rahasia; jangan commit atau menampilkannya di URL publik.
- Halaman web tidak dapat langsung mengirim RTMP hanya dengan API browser biasa.
- Batasi sumber URL dan endpoint ingest untuk menghindari penyalahgunaan.

## Lisensi

Tentukan lisensi proyek sebelum distribusi publik.