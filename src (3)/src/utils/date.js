// utils/dates.js
export function toMySqlDateTime(input, boundary = 'start') {
  if (!input) return null;
  const s = String(input).trim();

  // 1) ISO / YYYY-MM-DD (opsiyonel saat)
  if (/^\d{4}-\d{1,2}-\d{1,2}/.test(s)) {
    const d = new Date(s);
    if (!isNaN(d)) {
      if (!/\d{1,2}:\d{2}/.test(s)) {
        if (boundary === 'start') d.setHours(0,0,0,0);
        else d.setHours(23,59,59,999);
      }
      return fmt(d);
    }
  }

  // 2) TR D.M.YYYY (opsiyonel saat)
  let m = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
  if (m) {
    const [, dd, MM, yyyy, hh='0', mm='0', ss='0'] = m;
    const d = new Date(Number(yyyy), Number(MM)-1, Number(dd), Number(hh), Number(mm), Number(ss));
    if (!/\d{1,2}:\d{2}/.test(s)) {
      if (boundary === 'start') d.setHours(0,0,0,0);
      else d.setHours(23,59,59,999);
    }
    return fmt(d);
  }

  // 3) ABD MDY: M-D-YYYY (opsiyonel saat)  ←  **AY-GÜN-YIL** ZORUNLU
  m = s.match(/^(\d{1,2})-(\d{1,2})-(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
  if (m) {
    const [, MM, dd, yyyy, hh='0', mm='0', ss='0'] = m;
    const M = Number(MM), D = Number(dd);
    if (M < 1 || M > 12 || D < 1 || D > 31) return null;
    const d = new Date(Number(yyyy), M-1, D, Number(hh), Number(mm), Number(ss));
    if (!/\d{1,2}:\d{2}/.test(s)) {
      if (boundary === 'start') d.setHours(0,0,0,0);
      else d.setHours(23,59,59,999);
    }
    return fmt(d);
  }

  // 4) epoch ms
  if (!isNaN(Number(s))) {
    const d = new Date(Number(s));
    return fmt(d);
  }

  return null;

  function pad(n){ return String(n).padStart(2,'0'); }
  function fmt(d){
    const Y=d.getFullYear(), M=pad(d.getMonth()+1), D=pad(d.getDate());
    const h=pad(d.getHours()), m=pad(d.getMinutes()), s=pad(d.getSeconds());
    return `${Y}-${M}-${D} ${h}:${m}:${s}`; // MySQL DATETIME uyumlu
  }
}
