/**
 * KONFIGURASI GOOGLE API
 * ----------------------------------------------------------
 * Isi 2 nilai di bawah ini dengan milik Anda sendiri dari
 * Google Cloud Console. Cara mendapatkannya ada di README.md
 * (langkah "Setup Google Cloud").
 * ----------------------------------------------------------
 */

const CONFIG = {
  // Contoh: "123456789012-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com"
  CLIENT_ID: "ISI_CLIENT_ID_ANDA_DI_SINI",

  // Contoh: "AIzaSyABCDEFGHIJKLMNOPQRSTUVWXYZ1234567"
  API_KEY: "ISI_API_KEY_ANDA_DI_SINI",

  // Nama folder utama di Google Drive tempat semua data disimpan
  ROOT_FOLDER_NAME: "Tanda Terima",

  // Scope minimal: hanya bisa akses file yang DIBUAT oleh aplikasi ini,
  // bukan seluruh isi Google Drive Anda (lebih aman & privat).
  SCOPES: "https://www.googleapis.com/auth/drive.file",

  DISCOVERY_DOC: "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
};
