/**
 * CARI.JS
 * Logika untuk halaman cari.html — mengikuti Flowchart Pencarian:
 * Input Nama Register -> Cari di Google Drive -> Ditemukan / Tidak Ditemukan
 */

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("btnCari").addEventListener("click", handleCari);
  document.getElementById("namaCari").addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleCari();
  });
});

document.addEventListener("drive-ready", () => {
  document.getElementById("authStatus").textContent = "Klik \"Cari\" untuk masuk ke akun Google Anda";
});

async function handleCari() {
  const nama = document.getElementById("namaCari").value.trim();
  const resultCard = document.getElementById("resultCard");
  resultCard.style.display = "none";

  if (!nama) {
    showStatus("err", "Isi nomor register terlebih dahulu.");
    return;
  }

  showStatus("working", "Menyambungkan ke Google Drive…");

  try {
    await ensureAuth();

    showStatus("working", "Mencari data…");
    const rootId = await getRootFolderId();
    const folderId = await findFolder(nama, rootId);

    if (!folderId) {
      showStatus("err", `Data Tidak Ada untuk register "${nama}".`);
      return;
    }

    const files = await listFilesInFolder(folderId);
    const foto = files.find((f) => f.name.toLowerCase().startsWith("foto"));
    const ttd = files.find((f) => f.name.toLowerCase().startsWith("ttd"));

    if (!foto && !ttd) {
      showStatus("err", `Folder ditemukan tetapi belum ada file untuk "${nama}".`);
      return;
    }

    await Promise.all(
      [foto, ttd].filter(Boolean).map((f) => makeFilePublicReadable(f.id))
    );

    document.getElementById("resultTitle").textContent = `Ditemukan: ${nama}`;
    fillResult("foto", foto);
    fillResult("ttd", ttd);

    resultCard.style.display = "block";
    clearStatus();
  } catch (err) {
    console.error(err);
    showStatus("err", "Gagal mencari: " + (err.message || "terjadi kesalahan. Coba lagi."));
  }
}

function fillResult(prefix, file) {
  const img = document.getElementById(prefix + "Img");
  const lihat = document.getElementById(prefix + "Lihat");
  const download = document.getElementById(prefix + "Download");

  if (!file) {
    img.style.display = "none";
    lihat.style.pointerEvents = "none";
    download.style.pointerEvents = "none";
    return;
  }

  img.src = `https://drive.google.com/uc?export=view&id=${file.id}`;
  img.style.display = "block";
  lihat.href = file.webViewLink || `https://drive.google.com/file/d/${file.id}/view`;
  download.href = file.webContentLink || `https://drive.google.com/uc?export=download&id=${file.id}`;
}

function showStatus(type, text) {
  const box = document.getElementById("statusBox");
  box.className = "status-box show " + type;
  const seal =
    type === "ok"
      ? `<span class="seal"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span>`
      : "";
  box.innerHTML = seal + `<span>${text}</span>`;
}

function clearStatus() {
  document.getElementById("statusBox").className = "status-box";
}
