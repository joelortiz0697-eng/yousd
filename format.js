// ── Theme tokens ─────────────────────────────────────────────────
// Same shape for both modes so components never branch on theme —
// they just read from the current palette.

export const dark = {
  mode: "dark",
  bg: "#070C15",
  surface: "#0C1422",
  card: "#101A29",
  card2: "#16223570",
  cardHover: "#152131",
  border: "#1D2E47",
  borderSoft: "#16223580",
  accent: "#00CBA8",
  accentDark: "#009E82",
  accentSoft: "#00CBA81A",
  buy: "#2FD98A",
  sell: "#FF6B6B",
  warn: "#F5A524",
  purple: "#A78BFA",
  text: "#E4EDF7",
  muted: "#7A93AF",
  mutedSoft: "#516278",
  white: "#F5F9FF",
  shadow: "0 8px 24px rgba(0,0,0,0.35)",
};

export const light = {
  mode: "light",
  bg: "#F4F7FB",
  surface: "#FFFFFF",
  card: "#FFFFFF",
  card2: "#F1F5F9",
  cardHover: "#F8FAFC",
  border: "#E4EAF2",
  borderSoft: "#EDF1F7",
  accent: "#00A98A",
  accentDark: "#00876E",
  accentSoft: "#00A98A14",
  buy: "#18A768",
  sell: "#E1443A",
  warn: "#DB8B0B",
  purple: "#7C5CE0",
  text: "#1B2635",
  muted: "#66788F",
  mutedSoft: "#8A9AB0",
  white: "#0F1824",
  shadow: "0 6px 18px rgba(30,42,64,0.08)",
};

export const getTheme = (mode) => (mode === "light" ? light : dark);
