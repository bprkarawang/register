/**
 * DRIVE.JS
 * Semua fungsi untuk login Google & baca/tulis ke Google Drive.
 * Dipakai bersama oleh upload.html dan cari.html
 */

let gapiInited = false;
let gisInited = false;
let tokenClient;
let rootFolderId = null;

const authStatusEl = () => document.getElementById("authStatus");

// ---------- INISIALISASI ----------

function gapiLoaded() {
  gapi.load("client", initializeGapiClient);
}

async function initializeGapiClient() {
  await gapi.client.init({
    apiKey: CONFIG.API_KEY,
    discoveryDocs: [CONFIG.DISCOVERY_DOC],
  });
  gapiInited = true;
  maybeEnableButtons();
}

function gisLoaded() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CONFIG.CLIENT_ID,
    scope: CONFIG.SCOPES,
    callback: "", // di-set ulang tiap kali dibutuhkan (lihat ensureAuth)
  });
  gisInited = true;
  maybeEnableButtons();
}

function maybeEnableButtons() {
  if (gapiInited && gisInited) {
    document.dispatchEvent(new CustomEvent("drive-ready"));
  }
}

// Memastikan user sudah login & punya access token yang valid.
// Mengembalikan Promise yang resolve setelah token siap.
function ensureAuth() {
  return new Promise((resolve, reject) => {
    tokenClient.callback = (resp) => {
      if (resp.error) {
        reject(resp);
        return;
      }
      if (authStatusEl()) {
        authStatusEl().textContent = "Tersambung ke Google Drive";
        authStatusEl().classList.add("connected");
      }
      resolve(resp);
    };

    if (gapi.client.getToken() === null) {
      tokenClient.requestAccessToken({ prompt: "consent" });
    } else {
      tokenClient.requestAccessToken({ prompt: "" });
    }
  });
}

// ---------- FOLDER HELPERS ----------

// Cari folder dengan nama tertentu di dalam parent tertentu. Buat jika belum ada.
async function findOrCreateFolder(name, parentId) {
  const parentQuery = parentId ? `and '${parentId}' in parents` : "and 'root' in parents";
  const q = `mimeType='application/vnd.google-apps.folder' and name='${escapeQ(
    name
  )}' and trashed=false ${parentQuery}`;

  const res = await gapi.client.drive.files.list({
    q,
    fields: "files(id, name)",
    spaces: "drive",
  });

  if (res.result.files && res.result.files.length > 0) {
    return res.result.files[0].id;
  }

  const createRes = await gapi.client.drive.files.create({
    resource: {
      name: name,
      mimeType: "application/vnd.google-apps.folder",
      parents: parentId ? [parentId] : [],
    },
    fields: "id",
  });

  return createRes.result.id;
}

// Cari folder dengan nama tertentu, TANPA membuat baru. Return null jika tidak ada.
async function findFolder(name, parentId) {
  const parentQuery = parentId ? `and '${parentId}' in parents` : "and 'root' in parents";
  const q = `mimeType='application/vnd.google-apps.folder' and name='${escapeQ(
    name
  )}' and trashed=false ${parentQuery}`;

  const res = await gapi.client.drive.files.list({
    q,
    fields: "files(id, name)",
    spaces: "drive",
  });

  if (res.result.files && res.result.files.length > 0) {
    return res.result.files[0].id;
  }
  return null;
}

async function getRootFolderId() {
  if (rootFolderId) return rootFolderId;
  rootFolderId = await findOrCreateFolder(CONFIG.ROOT_FOLDER_NAME, null);
  return rootFolderId;
}

function escapeQ(str) {
  return str.replace(/'/g, "\\'");
}

// ---------- FILE HELPERS ----------

// Upload 1 file (blob) ke folder tertentu di Drive.
async function uploadFileToFolder(fileName, blob, mimeType, parentId) {
  const metadata = {
    name: fileName,
    parents: [parentId],
  };

  const accessToken = gapi.client.getToken().access_token;

  const form = new FormData();
  form.append(
    "metadata",
    new Blob([JSON.stringify(metadata)], { type: "application/json" })
  );
  form.append("file", blob, fileName);

  const res = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink,webContentLink",
    {
      method: "POST",
      headers: new Headers({ Authorization: "Bearer " + accessToken }),
      body: form,
    }
  );

  if (!res.ok) {
    throw new Error("Gagal upload file: " + fileName);
  }

  return res.json();
}

// List semua file di dalam sebuah folder (untuk halaman pencarian)
async function listFilesInFolder(parentId) {
  const res = await gapi.client.drive.files.list({
    q: `'${parentId}' in parents and trashed=false`,
    fields: "files(id, name, webViewLink, webContentLink, mimeType)",
    spaces: "drive",
  });
  return res.result.files || [];
}

// Set file agar bisa dilihat siapa saja yang punya link (supaya <img> preview jalan)
async function makeFilePublicReadable(fileId) {
  try {
    await gapi.client.drive.permissions.create({
      fileId: fileId,
      resource: { role: "reader", type: "anyone" },
    });
  } catch (e) {
    // Jika gagal (misal karena kebijakan organisasi), abaikan saja.
    console.warn("Tidak bisa mengubah izin file jadi publik:", e);
  }
}
