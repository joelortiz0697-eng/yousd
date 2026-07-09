export const KEYS = { ops: "ft_ops_v1", bal: "ft_bal_v1", deu: "ft_deu_v1", gas: "ft_gas_v1", theme: "ft_theme_v1" };

export function loadKey(key) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : [];
  } catch {
    return [];
  }
}

export function saveKey(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {}
}

export const TABS = [
  { id: "dashboard", label: "Inicio", icon: "home" },
  { id: "operaciones", label: "Operaciones", icon: "swap" },
  { id: "balances", label: "Balances", icon: "wallet" },
  { id: "deudas", label: "Deudas", icon: "list" },
  { id: "gastos", label: "Gastos", icon: "expense" },
];

export const CATS = [
  "🍔 Alimentación",
  "🚌 Transporte",
  "💡 Servicios",
  "🎬 Entretenimiento",
  "💊 Salud",
  "👕 Ropa",
  "📚 Educación",
  "🔧 Mantenimiento",
  "📦 Otros",
];

export const PIE_COLORS = ["#00CBA8", "#A78BFA", "#F59E0B", "#F55C5C", "#22D47E", "#60A5FA", "#F472B6", "#34D399"];
