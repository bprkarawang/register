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
  CLIENT_ID: "272971243173",

  // Contoh: "AIzaSyABCDEFGHIJKLMNOPQRSTUVWXYZ1234567"
  API_KEY: "AIzaSyDBeaetg2lLRCeKR_4_vNdcY1L2A7z7rpI",

  // Nama folder utama di Google Drive tempat semua data disimpan
  ROOT_FOLDER_NAME: "REGISTERJAMINAN",

  // Scope minimal: hanya bisa akses file yang DIBUAT oleh aplikasi ini,
  // bukan seluruh isi Google Drive Anda (lebih aman & privat).
  SCOPES: "https://www.googleapis.com/auth/drive.file",

  DISCOVERY_DOC: "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
};
