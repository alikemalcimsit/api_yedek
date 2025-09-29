import { prisma } from '../../utils/index.js'; // Tek prisma client

const loggableMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];



function getLogDetails(responseBody) {
  if (responseBody?.username && responseBody?.message) {
    return `${responseBody.username} adlı kullanıcı: ${responseBody.message}`;
  }
  if (responseBody?.message) {
    return responseBody.message;
  }
  return 'No details available';
}

export async function saveLog(req, res, startTime) {
  if (!loggableMethods.includes(req.method)) return;

  const duration = Date.now() - startTime;
  const user = req.user || {};
  let responseBody = res.__body;

  if (typeof responseBody === 'string') {
    try {
      responseBody = JSON.parse(responseBody);
    } catch {}
  }

  const requestBodyString = safeStringify(req.body);
  const responseBodyString = safeStringify(responseBody);
  const headerString = safeStringify(req.headers);
  const host = req.headers['x-domain'] || req.headers.host || '';

  const logEntry = {
    usersystemid: user.userSystemId ?? 123,
    action: `${req.method} ${req.originalUrl}`,
    created_at: new Date().toISOString(),
    details: getLogDetails(responseBody),
    request_body: requestBodyString,
    response_body: responseBodyString,
    header: headerString,
    response_time: duration,
    http_status: res.statusCode,
    error_message: res.statusCode >= 400 ? res.statusMessage : null,
    host: host
  };

  try {
    await prisma.crmlogs.create({ data: logEntry });
  } catch (err) {
    console.error('📛 Log veritabanına yazılamadı:', err);
  }
}

function safeStringify(value) {
  try {
    return JSON.stringify(value ?? {});
  } catch {
    return '[Unserializable]';
  }
}
