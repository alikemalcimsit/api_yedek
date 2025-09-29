import cors from 'cors';

const corsConfig = cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    const allowedDomains = [
      /^https?:\/\/(.+\.)?crmpanel\.tr$/,       // *.crmpanel.tr
      /^https?:\/\/(.+\.)?pratikcrm\.tr$/,      // *.pratikcrm.tr (ör: vatan.pratikcrm.tr)
      'http://localhost:3000'                   // Development için
    ];

    const isAllowed = allowedDomains.some(domain => {
      if (typeof domain === 'string') {
        return domain === origin;
      }
      return domain.test(origin);
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('CORS tarafından engellenmiştir'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
});

export { corsConfig };
