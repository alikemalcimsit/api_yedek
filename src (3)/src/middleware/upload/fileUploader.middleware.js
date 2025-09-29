import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import multer from "multer";
import express from "express"; // ✅ direkt import et

// Varsayılan upload klasörü
const UPLOAD_ROOT = process.env.UPLOAD_ROOT
  ? path.resolve(process.env.UPLOAD_ROOT)
  : path.resolve(process.cwd(), "upload");

const ALLOWED_EXTENSIONS = [
  "jpg","jpeg","png","gif","bmp","webp","svg","tiff",
  "doc","docx","xls","xlsx","ppt","pptx","pdf","odt","ods","odp",
  "mp4","avi","mov","wmv","flv","mkv","webm",
  "mp3","wav","ogg","m4a","wma",
  "zip","rar","7z"
];

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

function sanitizeFolder(input = "") {
  return String(input).toLowerCase().replace(/[^a-z0-9_-]/g, "_") || "general";
}

async function ensureWritableDir(dirAbsPath) {
  await fsp.mkdir(dirAbsPath, { recursive: true });
  await fsp.access(dirAbsPath, fs.constants.W_OK);
}

function extOf(filename) {
  return String(filename?.split(".").pop() || "").toLowerCase();
}

function generateSafeName(ext) {
  const rand = crypto.randomBytes(8).toString("hex");
  return `${Date.now()}_${rand}.${ext}`;
}

// ✅ multer storage (async/await yerine sync callback kullan)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      const rawFolder = req.params.folder || req.query.folder || req.body?.folder || "general";
      const folder = sanitizeFolder(rawFolder);
      const uploadDir = path.join(UPLOAD_ROOT, folder);

      // async beklenemeyeceği için sync çözüm:
      ensureWritableDir(uploadDir)
        .then(() => {
          req._upload = { folder, uploadDir };
          cb(null, uploadDir);
        })
        .catch(err => cb(err));
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const extension = extOf(file.originalname);
    cb(null, generateSafeName(extension));
  }
});

function fileFilter(req, file, cb) {
  const extension = extOf(file.originalname);
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", `Geçersiz uzantı: .${extension}`));
  }
  cb(null, true);
}

export const uploadSingleFile = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE }
}).single("file");

export function uploadErrorHandler(err, req, res, next) {
  if (!err) return next();
  let message = "Bilinmeyen dosya yükleme hatası.";
  let status = 400;

  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      message = `Dosya boyutu çok büyük. Maximum: ${Math.floor(MAX_FILE_SIZE / 1024 / 1024)}MB`;
    } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
      message = `Geçersiz dosya tipi. ${err.message || ""}`.trim();
    } else {
      message = `Yükleme hatası: ${err.message || err.code}`;
    }
  } else if (err.code === "EACCES") {
    message = "Yükleme dizini yazılabilir değil. Sistem yetkilisi ile görüşünüz.";
  } else {
    message = err.message || message;
  }

  res.status(status).json({ success: false, message });
}

// ✅ async import kaldırıldı, express.static direkt kullan
export function mountUploadStatic(app) {
  app.use(
    "/upload",
    (req, res, next) => {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
      res.header("Access-Control-Allow-Headers", "Content-Type");
      if (req.method === "OPTIONS") return res.sendStatus(200);
      next();
    },
    (req, res, next) => {
      ensureWritableDir(UPLOAD_ROOT).then(() => next()).catch(next);
    },
    express.static(UPLOAD_ROOT)
  );
}
