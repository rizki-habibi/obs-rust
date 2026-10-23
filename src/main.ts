import "./style.css";

type SourceItem = { id: string; name: string; kind: "camera" | "screen" | "url" | "text"; value?: string; stream?: MediaStream };

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) throw new Error("Elemen aplikasi tidak ditemukan.");

app.innerHTML = `
  <header class="topbar">
    <div class="brand"><span class="brand-mark">◉</span><div><strong>OBS <span>RUST</span></strong><small>WEB STUDIO</small></div></div>
    <div class="live-status"><i></i><span id="statusText">SIAP SIARAN</span></div>
    <div class="top-actions"><button class="icon-btn" id="settingsBtn" title="Pengaturan">⚙</button><a class="button subtle" href="https://studio.youtube.com/" target="_blank" rel="noreferrer">YouTube Studio ↗</a></div>
  </header>
  <main class="workspace">
    <section class="preview-column">
      <div class="section-head"><div><span class="eyebrow">KANVAS SIARAN</span><h1>Studio siaran</h1></div><span class="resolution">PRATINJAU · 16:9</span></div>
      <div class="preview-frame" id="previewFrame">
        <video id="previewVideo" autoplay muted playsinline></video>
        <div class="empty-state" id="emptyState"><div class="empty-icon">▣</div><h2>Studio siap digunakan</h2><p>Tambahkan kamera atau bagikan layar untuk memulai pratinjau.</p><button class="button primary" id="quickCamera">＋ Aktifkan kamera</button></div>
        <div class="preview-label"><i></i> PRATINJAU LOKAL</div><div class="canvas-badge">OBS RUST · 1080p</div>
      </div>
      <div class="transport">
        <div class="transport-left"><button class="button primary" id="startStream">▶ Mulai siaran</button><button class="button" id="recordBtn">● Rekam lokal</button></div>
        <div class="transport-right"><span class="metric"><b id="fps">—</b><small>FPS</small></span><span class="metric"><b id="resolutionMetric">—</b><small>RESOLUSI</small></span><span class="metric"><b id="sourceCount">0</b><small>SUMBER</small></span></div>
      </div>
      <div class="panel scene-panel">
        <div class="panel-title"><div><span class="eyebrow">ADEGAN</span><h3>Scene</h3></div><button class="square-btn" id="addScene" title="Tambah scene">＋</button></div>
        <div class="scene-list" id="sceneList"><button class="scene active"><span class="scene-thumb">▧</span><span>Scene Utama</span><small>AKTIF</small></button></div>
      </div>
    </section>
    <aside class="side-column">
      <section class="panel sources-panel">
        <div class="panel-title"><div><span class="eyebrow">KOMPOSISI</span><h3>Sumber</h3></div><button class="square-btn" id="addSource">＋</button></div>
        <div class="source-actions">
          <button class="source-action" id="cameraBtn"><span>▣</span><b>Kamera</b><small>Webcam</small></button>
          <button class="source-action" id="screenBtn"><span>▤</span><b>Layar</b><small>Berbagi layar</small></button>
          <button class="source-action" id="urlBtn"><span>↗</span><b>URL web</b><small>Overlay / tautan</small></button>
          <button class="source-action" id="textBtn"><span>T</span><b>Teks</b><small>Overlay teks</small></button>
        </div>
        <div class="source-list" id="sourceList"><div class="empty-list">Belum ada sumber. Pilih salah satu di atas.</div></div>
      </section>
      <section class="panel audio-panel">
        <div class="panel-title"><div><span class="eyebrow">SUARA</span><h3>Mixer audio</h3></div><span class="muted-pill">BROWSER</span></div>
        <div class="audio-row"><div class="audio-icon">♫</div><div class="audio-info"><b>Mikrofon</b><small id="micStatus">Belum diaktifkan</small><div class="meter"><span id="audioMeter"></span></div></div><button class="square-btn" id="micBtn" title="Aktifkan mikrofon">＋</button></div>
      </section>
      <section class="panel youtube-panel" id="youtubePanel">
        <div class="panel-title"><div><span class="eyebrow">TUJUAN SIARAN</span><h3>YouTube Live</h3></div><span class="youtube-icon">▶</span></div>
        <label for="liveTitle">Judul siaran</label><input id="liveTitle" placeholder="Siaran langsung saya" />
        <label for="ingestUrl">Endpoint media (RTMP/WHIP)</label><input id="ingestUrl" placeholder="https://media-server.example/whip/..." />
        <p class="hint">Endpoint harus mendukung protokol browser yang sesuai. YouTube RTMP biasa tidak bisa menerima koneksi langsung dari halaman web.</p>
        <button class="button full" id="saveTarget">Simpan konfigurasi di sesi ini</button>
        <div class="security-note">🔒 Jangan masukkan atau simpan stream key di halaman publik. Gunakan server media tepercaya untuk meneruskan siaran ke YouTube.</div>
      </section>
      <section class="panel links-panel"><div class="panel-title"><div><span class="eyebrow">TAUTAN CEPAT</span><h3>Studio & panduan</h3></div></div><a href="https://studio.youtube.com/" target="_blank" rel="noreferrer">YouTube Studio <span>↗</span></a><a href="https://support.google.com/youtube/answer/2907883" target="_blank" rel="noreferrer">Panduan live streaming <span>↗</span></a></section>
    </aside>
  </main>
  <footer><span><i class="footer-dot"></i> Semua kontrol media berjalan di browser Anda</span><span>OBS Rust Web Studio <b>0.1.0</b></span></footer>
  <div class="toast" id="toast" role="status"></div>
  <dialog id="sourceDialog"><form method="dialog" id="sourceForm"><div class="dialog-head"><h3 id="dialogTitle">Tambah sumber</h3><button class="square-btn" value="cancel">×</button></div><label id="sourceLabel" for="sourceValue">URL sumber</label><input id="sourceValue" placeholder="https://..." /><div class="dialog-actions"><button class="button" value="cancel">Batal</button><button class="button primary" id="confirmSource" value="default">Tambahkan</button></div></form></dialog>
`;

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const video = $("previewVideo") as HTMLVideoElement;
const emptyState = $("emptyState");
const sourceList = $("sourceList");
const sourceCount = $("sourceCount");
const statusText = $("statusText");
const sourceDialog = $("sourceDialog") as HTMLDialogElement;
const sourceValue = $("sourceValue") as HTMLInputElement;
const dialogTitle = $("dialogTitle");
const sourceLabel = $("sourceLabel");
let sources: SourceItem[] = [];
let scenes = ["Scene Utama"];
let currentScene = 0;
let nextId = 1;
let cameraStream: MediaStream | null = null;
let micStream: MediaStream | null = null;
let whipConnection: RTCPeerConnection | null = null;
let whipResourceUrl: string | null = null;
let recording: MediaRecorder | null = null;
let recordedChunks: BlobPart[] = [];
let pendingKind: "url" | "text" = "url";
let toastTimer = 0;

function toast(message: string) {
  const el = $("toast");
  el.textContent = message;
  el.classList.add("show");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => el.classList.remove("show"), 3200);
}
function updatePreview(stream?: MediaStream) {
  const active = stream ?? sources.find(s => s.stream)?.stream ?? null;
  if (active) {
    video.srcObject = active;
    emptyState.classList.add("hidden");
    $("resolutionMetric").textContent = "LIVE";
    $("fps").textContent = "●";
  } else if (!sources.some(s => s.kind === "url" || s.kind === "text")) {
    video.srcObject = null;
    emptyState.classList.remove("hidden");
    $("resolutionMetric").textContent = "—";
    $("fps").textContent = "—";
  }
}
function renderSources() {
  sourceCount.textContent = String(sources.length);
  if (!sources.length) {
    sourceList.innerHTML = '<div class="empty-list">Belum ada sumber. Pilih salah satu di atas.</div>';
    return;
  }
  sourceList.innerHTML = sources.map(s => `<div class="source-item"><span class="source-type">${s.kind === "camera" ? "▣" : s.kind === "screen" ? "▤" : s.kind === "text" ? "T" : "↗"}</span><div class="source-name"><b>${escapeHtml(s.name)}</b><small>${s.kind.toUpperCase()}</small></div><button class="square-btn remove-source" data-id="${s.id}" title="Hapus sumber">×</button></div>`).join("");
  sourceList.querySelectorAll<HTMLButtonElement>(".remove-source").forEach(btn => btn.addEventListener("click", () => removeSource(btn.dataset.id!)));
}
function renderScenes() {
  $("sceneList").innerHTML = scenes.map((s, i) => `<button class="scene ${i === currentScene ? "active" : ""}" data-index="${i}"><span class="scene-thumb">▧</span><span>${escapeHtml(s)}</span>${i === currentScene ? "<small>AKTIF</small>" : ""}</button>`).join("");
  $("sceneList").querySelectorAll<HTMLButtonElement>(".scene").forEach(btn => btn.addEventListener("click", () => {
    currentScene = Number(btn.dataset.index);
    renderScenes();
    toast("Scene aktif: " + scenes[currentScene]);
  }));
}
function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]!));
}
function removeSource(id: string) {
  const item = sources.find(s => s.id === id);
  if (item?.stream) item.stream.getTracks().forEach(t => t.stop());
  sources = sources.filter(s => s.id !== id);
  renderSources();
  updatePreview();
}
async function addMedia(kind: "camera" | "screen" | "mic") {
  try {
    const stream = kind === "screen"
      ? await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
      : await navigator.mediaDevices.getUserMedia({ video: kind === "camera", audio: kind === "mic" });
    if (kind === "mic") {
      micStream?.getTracks().forEach(t => t.stop());
      micStream = stream;
      $("micStatus").textContent = "Mikrofon aktif";
      $("micBtn").textContent = "✓";
      toast("Mikrofon berhasil diaktifkan.");
      return;
    }
    const item: SourceItem = { id: String(nextId++), name: kind === "camera" ? "Kamera" : "Berbagi layar", kind, stream };
    sources.push(item);
    renderSources();
    updatePreview(stream);
    stream.getVideoTracks().forEach(track => track.addEventListener("ended", () => {
      sources = sources.filter(s => s.id !== item.id);
      renderSources();
      updatePreview();
    }));
    toast(kind === "camera" ? "Kamera siap." : "Berbagi layar aktif.");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Izin media tidak tersedia";
    toast("Tidak dapat mengaktifkan media: " + message);
  }
}
function openSourceDialog(kind: "url" | "text") {
  pendingKind = kind;
  dialogTitle.textContent = kind === "url" ? "Tambah sumber URL web" : "Tambah overlay teks";
  sourceLabel.textContent = kind === "url" ? "Alamat URL (HTTPS)" : "Teks overlay";
  sourceValue.value = "";
  sourceValue.placeholder = kind === "url" ? "https://contoh.com/overlay" : "Tulis teks di sini";
  sourceDialog.showModal();
  sourceValue.focus();
}
$("cameraBtn").addEventListener("click", () => void addMedia("camera"));
$("quickCamera").addEventListener("click", () => void addMedia("camera"));
$("screenBtn").addEventListener("click", () => void addMedia("screen"));
$("micBtn").addEventListener("click", () => void addMedia("mic"));
$("urlBtn").addEventListener("click", () => openSourceDialog("url"));
$("textBtn").addEventListener("click", () => openSourceDialog("text"));
$("addSource").addEventListener("click", () => openSourceDialog("url"));
$("confirmSource").addEventListener("click", event => {
  event.preventDefault();
  const value = sourceValue.value.trim();
  if (!value) return toast("Isi sumber terlebih dahulu.");
  if (pendingKind === "url") {
    try {
      const url = new URL(value);
      if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("URL harus HTTP atau HTTPS");
      sources.push({ id: String(nextId++), name: url.hostname, kind: "url", value: url.href });
      toast("URL ditambahkan ke daftar sumber. Sematan bergantung pada izin situs tujuan.");
    } catch { toast("URL tidak valid."); return; }
  } else {
    sources.push({ id: String(nextId++), name: value.slice(0, 40), kind: "text", value });
    toast("Overlay teks ditambahkan ke daftar sumber.");
  }
  sourceDialog.close();
  renderSources();
});
$("addScene").addEventListener("click", () => {
  if (scenes.length >= 8) return toast("Maksimal 8 scene pada versi awal.");
  scenes.push("Scene " + (scenes.length + 1));
  currentScene = scenes.length - 1;
  renderScenes();
  toast("Scene baru dibuat.");
});
$("saveTarget").addEventListener("click", () => {
  const endpoint = ($("ingestUrl") as HTMLInputElement).value.trim();
  if (endpoint && !/^https:\/\//i.test(endpoint)) return toast("Gunakan endpoint HTTPS yang tepercaya.");
  toast("Konfigurasi hanya digunakan dalam sesi browser ini. Output streaming belum tersambung.");
});
$("settingsBtn").addEventListener("click", () => $("youtubePanel").scrollIntoView({ behavior: "smooth", block: "center" }));
async function stopWhip() {
  whipConnection?.close();
  whipConnection = null;
  if (whipResourceUrl) {
    try { await fetch(whipResourceUrl, { method: "DELETE" }); } catch { /* Endpoint may not support session deletion. */ }
  }
  whipResourceUrl = null;
  $("startStream").textContent = "▶ Mulai siaran";
  statusText.textContent = "SIAP SIARAN";
  toast("Sesi siaran dihentikan.");
}
async function startWhip() {
  const endpoint = ($("ingestUrl") as HTMLInputElement).value.trim();
  if (!endpoint) return toast("Masukkan endpoint WHIP terlebih dahulu.");
  let parsed: URL;
  try { parsed = new URL(endpoint); } catch { return toast("Endpoint tidak valid."); }
  if (parsed.protocol !== "https:") return toast("Endpoint siaran wajib menggunakan HTTPS.");
  const localStream = video.srcObject as MediaStream | null;
  if (!localStream || !localStream.getVideoTracks().length) return toast("Aktifkan kamera atau layar terlebih dahulu.");
  const outgoing = new MediaStream([
    ...localStream.getVideoTracks(),
    ...(micStream?.getAudioTracks() ?? []),
    ...localStream.getAudioTracks()
  ]);
  const uniqueTracks = new Set<string>();
  const peer = new RTCPeerConnection();
  whipConnection = peer;
  outgoing.getTracks().forEach(track => {
    if (!uniqueTracks.has(track.id)) { peer.addTrack(track, outgoing); uniqueTracks.add(track.id); }
  });
  try {
    statusText.textContent = "MENGHUBUNGKAN";
    $("startStream").textContent = "Menghubungkan…";
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    await new Promise<void>((resolve, reject) => {
      if (peer.iceGatheringState === "complete") return resolve();
      const timeout = window.setTimeout(() => reject(new Error("ICE gathering timeout")), 10000);
      peer.addEventListener("icegatheringstatechange", () => {
        if (peer.iceGatheringState === "complete") { window.clearTimeout(timeout); resolve(); }
      });
    });
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/sdp", "Accept": "application/sdp" },
      body: peer.localDescription?.sdp
    });
    if (!response.ok) throw new Error("Endpoint menolak koneksi (HTTP " + response.status + ").");
    const answerSdp = await response.text();
    await peer.setRemoteDescription({ type: "answer", sdp: answerSdp });
    const location = response.headers.get("Location");
    whipResourceUrl = location ? new URL(location, endpoint).href : null;
    statusText.textContent = "TERHUBUNG";
    $("startStream").textContent = "■ Hentikan siaran";
    toast("Terhubung ke endpoint WHIP. Pastikan server meneruskan siaran ke YouTube.");
    peer.addEventListener("connectionstatechange", () => {
      if (peer.connectionState === "failed" || peer.connectionState === "disconnected") {
        statusText.textContent = "KONEKSI TERPUTUS";
      }
    });
  } catch (error) {
    peer.close();
    if (whipConnection === peer) whipConnection = null;
    statusText.textContent = "SIAP SIARAN";
    $("startStream").textContent = "▶ Mulai siaran";
    toast("Koneksi WHIP gagal: " + (error instanceof Error ? error.message : "periksa endpoint, CORS, dan server media."));
  }
}
$("startStream").addEventListener("click", () => {
  if (whipConnection) void stopWhip();
  else void startWhip();
});
$("recordBtn").addEventListener("click", () => {
  const stream = video.srcObject as MediaStream | null;
  if (!stream) return toast("Aktifkan kamera atau layar sebelum merekam.");
  if (recording?.state === "recording") {
    recording.stop();
    return;
  }
  try {
    recordedChunks = [];
    recording = new MediaRecorder(stream);
    recording.ondataavailable = e => { if (e.data.size) recordedChunks.push(e.data); };
    recording.onstop = () => {
      const blob = new Blob(recordedChunks, { type: recording?.mimeType || "video/webm" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "obs-rust-rekaman.webm"; a.click();
      URL.revokeObjectURL(url);
      $("recordBtn").textContent = "● Rekam lokal";
      toast("Rekaman diunduh.");
    };
    recording.start();
    $("recordBtn").textContent = "■ Hentikan rekaman";
    toast("Rekaman lokal dimulai.");
  } catch { toast("Perekaman tidak didukung browser ini."); }
});
renderSources();
renderScenes();
window.addEventListener("beforeunload", () => {
  sources.forEach(s => s.stream?.getTracks().forEach(t => t.stop()));
  micStream?.getTracks().forEach(t => t.stop());
  cameraStream?.getTracks().forEach(t => t.stop());
});
