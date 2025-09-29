import { saveLog } from '../../services/log/log.service.js';

export const requestLogger = (req, res, next) => {
  const start = Date.now();

  const originalSend = res.send.bind(res);
  res.send = function (body) {
    res.__body = body;
    return originalSend.call(this, body); // bu yapı da kullanılabilir res.send(body)

  };
  res.on('finish', async () => {
    try {
      await saveLog(req, res, start);
    } catch (err) {
      console.error('Loglama sırasında hata:', err);


    }
  });
  next();
};
