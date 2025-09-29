// src/utils/i18n.js
import tr from '../locale/tr/tr.json' with { type: 'json' };
import en from '../locale/eng/eng.json' with { type: 'json' };

const SUPPORTED = ['tr', 'en'];
const LOCALES = { tr, en };

export function pickLang(req) {
  const al = (req.headers['accept-language'] || '').toLowerCase();
  if (!al) return 'tr';
  const first = al.split(',')[0];
  const base = first.split('-')[0];
  return SUPPORTED.includes(base) ? base : 'tr';
}

// nested key desteği ("auth.LOGIN_SUCCESS" gibi)
function deepGet(obj, path) {
  if (!obj || !path) return undefined;
  return path.split('.').reduce((acc, k) => (acc && acc[k] !== undefined ? acc[k] : undefined), obj);
}

export function t(lang, key, fallback = null) {
  const dict = LOCALES[lang] || LOCALES.tr;

  // Önce nested lookup, sonra düz lookup
  const val = deepGet(dict, key) ?? dict[key];

  if (typeof val === 'string') return val;

  // Özel fallback verildiyse onu dön
  if (fallback) return fallback;

  // Son çare: sözlükte varsa genel hata metni, yoksa anahtarın kendisi
  return dict.INTERNAL_SERVER_ERROR || key;
}
