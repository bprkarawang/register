/**
 * UPLOAD.JS
 * Logika untuk halaman upload.html — mengikuti Flowchart Upload:
 * Input Nama -> Upload Foto -> Preview -> Tanda Tangan -> Simpan -> Google Drive
 */

let signaturePad;
let selectedFotoFile = null;

document.addEventListener("DOMContentLoaded", () => {
  setupSignaturePad();
  setupFotoInput();
  setupValidation();

  document.getElementById("btnClearSig").addEventListener("click", () => {
    signaturePad.clear();
    document.querySelector(".sig-wrap").classList.remove("has-ink");
    validateForm();
  });

  document.getElementById("btnSimpan").addEventListener("click", handleSimpan);
});

document.addEventListener("drive-ready", () => {
  const el = document.getElementById("authStatus");
  el.textContent = "Klik \"Simpan\" untuk masuk ke akun Google Anda";
});

// ---------- SIGNATURE PAD ----------

function setupSignaturePad() {
  const canvas = document.getElementById("sigCanvas");
  resizeCanvas(canvas);
  signaturePad = new SignaturePad(canvas, {
    backgroundColor: "rgba(255,255,255,1)",
    penColor: "rgb(31,51,80)",
  });

  signaturePad.addEventListener("beginStroke", () => {
    document.querySelector(".sig-wrap").classList.add("has-ink");
  });
  signaturePad.addEventListener("endStroke", validateForm);
  window.addEventListener("resize", () => {
    const data = signaturePad.toData();
    resizeCanvas(canvas);
    signaturePad.clear();
    signaturePad.fromData(data);
  });
}

function resizeCanvas(canvas) {
  const ratio = Math.max(window.devicePixelRatio || 1, 1);
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * ratio;
  canvas.height = 200 * ratio;
  canvas.getContext("2d").scale(ratio, ratio);
}

// ---------- FOTO INPUT ----------

function setupFotoInput() {
  const drop = document.getElementById("fileDrop");
  const input = document.getElementById("fotoInput");
  const preview = document.getElementById("fotoPreview");

  drop.addEventListener("click", () => input.click());

  drop.addEventListener("dragover", (e) => {
    e.preventDefault();
    drop.style.borderColor = "var(--ink)";
  });
  drop.addEventListener("dragleave", () => {
    drop.style.borderColor = "";
  });
  drop.addEventListener("drop", (e) => {
    e.preventDefault();
    drop.style.borderColor = "";
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFotoFile(e.dataTransfer.files[0]);
    }
  });

  input.addEventListener("change", (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFotoFile(e.target.files[0]);
    }
  });

  function handleFotoFile(file) {
    selectedFotoFile = file;
    const url = URL.createObjectURL(file);
    preview.src = url;
    preview.style.display = "block";
    drop.textContent = file.name;
    validateForm();
  }
}

// ---------- VALIDASI ----------

function setupValidation() {
  document.getElementById("namaRegister").addEventListener("input", validateForm);
}

function validateForm() {
  const nama = document.getElementById("namaRegister").value.trim();
  const adaFoto = !!selectedFotoFile;
  const adaTtd = !signaturePad.isEmpty();
  document.getElementById("btnSimpan").disabled = !(nama && adaFoto && adaTtd);
  return nama && adaFoto && adaTtd;
}

// ---------- SIMPAN KE GOOGLE DRIVE ----------

async function handleSimpan() {
  if (!validateForm()) return;

  const nama = document.getElementById("namaRegister").value.trim();
  const btn = document.getElementById("btnSimpan");
  const status = document.getElementById("statusBox");

  btn.disabled = true;
  showStatus("working", "Menyambungkan ke Google Drive…");

  try {
    await ensureAuth();

    showStatus("working", "Menyiapkan folder di Google Drive…");
    const rootId = await getRootFolderId();
    const registerFolderId = await findOrCreateFolder(nama, rootId);

    showStatus("working", "Mengunggah foto tanda terima…");
    await uploadFileToFolder(
      "foto.jpg",
      selectedFotoFile,
      selectedFotoFile.type || "image/jpeg",
      registerFolderId
    );

    showStatus("working", "Mengunggah tanda tangan…");
    const sigBlob = await new Promise((resolve) =>
      document.getElementById("sigCanvas").toBlob(resolve, "image/png")
    );
    await uploadFileToFolder("ttd.png", sigBlob, "image/png", registerFolderId);

    showStatus("ok", `Upload berhasil untuk "${nama}". Formulir akan direset.`);
    setTimeout(resetForm, 1800);
  } catch (err) {
    console.error(err);
    showStatus("err", "Gagal menyimpan: " + (err.message || "terjadi kesalahan. Coba lagi."));
    btn.disabled = false;
  }
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

function resetForm() {
  document.getElementById("namaRegister").value = "";
  selectedFotoFile = null;
  document.getElementById("fotoPreview").style.display = "none";
  document.getElementById("fotoPreview").src = "";
  document.getElementById("fileDrop").textContent = "Klik untuk memilih foto, atau tarik & lepas di sini";
  signaturePad.clear();
  document.querySelector(".sig-wrap").classList.remove("has-ink");
  document.getElementById("btnSimpan").disabled = true;
  document.getElementById("statusBox").className = "status-box";
}
