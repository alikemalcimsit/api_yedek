import util from 'node:util';

const inspect = (v) => util.inspect(v, { depth: null, maxArrayLength: 100 });

// İstersen BigInt güvenli stringify:
const safeStringify = (v, space = 2) =>
  JSON.stringify(v, (_, x) => (typeof x === 'bigint' ? x.toString() : x), space);

// Dönüşüm yardımcıları:
const asStr  = (v) => (typeof v === 'bigint' ? v.toString() : (v != null ? String(v) : null));
const asNum  = (v) => (typeof v === 'bigint' ? Number(v) : (v == null ? null : Number(v)));
const asText = (v) => (v == null ? '' : String(v));


export {
    inspect,
    safeStringify,
    asStr,
    asNum,
    asText
}