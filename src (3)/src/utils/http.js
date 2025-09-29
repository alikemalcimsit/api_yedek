import axios from "axios";
import http from "node:http";
import https from "node:https";

const httpAgent  = new http.Agent({ keepAlive: true });
const httpsAgent = new https.Agent({ keepAlive: true });

export const httpClient = axios.create({
  timeout: 30_000,
  httpAgent,
  httpsAgent,
  validateStatus: () => true, // 4xx/5xx'te gövdeyi alalım
});