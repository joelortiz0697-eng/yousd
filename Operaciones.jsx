// ── Formatters & helpers ─────────────────────────────────────────
export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2);
export const todayStr = () => new Date().toISOString().slice(0, 10);

export const fARS = (n) =>
  `$${Number(n || 0).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
export const fUSD = (n) => `U$D ${Number(n || 0).toFixed(2)}`;
export const fUSDT = (n) => `${Number(n || 0).toFixed(2)} USDT`;
export const fMoney = (n, cur) => (cur === "USDT" ? fUSDT(n) : cur === "USD" ? fUSD(n) : fARS(n));

export const fPct = (n) => `${n > 0 ? "+" : ""}${Number(n || 0).toFixed(1)}%`;

export const isSameMonth = (dateStr, ref = new Date()) => {
  const f = new Date(dateStr);
  return f.getMonth() === ref.getMonth() && f.getFullYear() === ref.getFullYear();
};

export const monthKey = (d = new Date()) => d.toISOString().slice(0, 7);

export const prevMonthDate = (ref = new Date()) => {
  const d = new Date(ref.getFullYear(), ref.getMonth() - 1, 1);
  return d;
};
