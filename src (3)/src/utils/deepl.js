import qs from "qs";
import { httpClient } from "./http.js";

const API_KEY  = process.env.DEEPL_API_KEY;
const API_BASE = process.env.DEEPL_API_BASE 

if (!API_KEY) {
  console.warn("[DeepL] DEEPL_API_KEY yok!");
}

/**
 * PHP’deki tek metin çevirisinin birebir karşılığı.
 * @returns {Promise<{ translatedText: string, detectedLanguage: string|null }>}
 */
export async function deeplTranslateOne(text, targetLang, sourceLang) {
  if (!text || !targetLang) {
    throw new Error("Çeviri için metin ve hedef dil gereklidir.");
  }

  const payload = {
    auth_key: API_KEY,
    text: String(text),
    target_lang: String(targetLang).toUpperCase(),
  };
  if (sourceLang) payload.source_lang = String(sourceLang).toUpperCase();

  const body = qs.stringify(payload, { arrayFormat: "repeat" });

  const resp = await httpClient.post(`${API_BASE}`, body, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  if (resp.status >= 400) {
    const raw = typeof resp.data === "string" ? resp.data : JSON.stringify(resp.data);
    const err = new Error(`API hatası (HTTP ${resp.status}): ${raw}`);
    err.statusCode = resp.status;
    throw err;
  }

  const json = typeof resp.data === "string" ? JSON.parse(resp.data) : resp.data;

  if (!json?.translations?.[0]?.text) {
    throw new Error("Geçersiz API yanıtı yapısı");
  }

  return {
    translatedText: json.translations[0].text,
    detectedLanguage: json.translations[0].detected_source_language ?? null,
  };
}
