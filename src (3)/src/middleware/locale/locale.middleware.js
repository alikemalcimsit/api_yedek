import { pickLang, t } from '../../utils/i18n.js';

export const localeMiddleware = (req, _res, next) => {
  const lang = pickLang(req);
  req.lang = lang;
  req.t = (key, fallback) => t(lang, key, fallback);
  next();
};