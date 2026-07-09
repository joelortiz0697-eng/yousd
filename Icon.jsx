import { useTheme } from "../context/ThemeContext";
import Icon from "./Icon";

// ── Button ───────────────────────────────────────────────────────
export function Button({ children, variant = "primary", full, size = "md", style, ...props }) {
  const { C } = useTheme();
  const sizes = { sm: "8px 12px", md: "11px 18px", lg: "13px 20px" };
  const fontSizes = { sm: 12.5, md: 13.5, lg: 15 };
  const variants = {
    primary: { background: C.accent, color: "#04140F", fontWeight: 700 },
    secondary: { background: C.card2, color: C.text, border: `1px solid ${C.border}` },
    ghost: { background: "transparent", color: C.muted },
    danger: { background: C.mode === "dark" ? "#3A1414" : "#FDECEC", color: C.sell },
  };
  return (
    <button
      {...props}
      style={{
        border: "none",
        cursor: "pointer",
        borderRadius: 10,
        fontWeight: 600,
        fontSize: fontSizes[size],
        padding: sizes[size],
        width: full ? "100%" : undefined,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        transition: "transform 0.12s ease, opacity 0.15s ease, background 0.15s ease",
        ...variants[variant],
        ...style,
      }}
      onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
      onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      {children}
    </button>
  );
}

export function IconButton({ name, onClick, tone = "muted", title }) {
  const { C } = useTheme();
  const tones = {
    muted: { background: C.card2, color: C.muted },
    danger: { background: C.mode === "dark" ? "#3A1414" : "#FDECEC", color: C.sell },
  };
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        border: "none",
        cursor: "pointer",
        borderRadius: 9,
        padding: 8,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        ...tones[tone],
      }}
    >
      <Icon name={name} size={15} />
    </button>
  );
}

// ── Modal ────────────────────────────────────────────────────────
export function Modal({ title, onClose, children }) {
  const { C } = useTheme();
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(4,8,14,0.6)",
        backdropFilter: "blur(3px)",
        zIndex: 100,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        padding: 0,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderBottom: "none",
          borderRadius: "20px 20px 0 0",
          width: "100%",
          maxWidth: 480,
          maxHeight: "88vh",
          overflowY: "auto",
          boxShadow: C.shadow,
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", padding: "10px 0 0" }}>
          <div style={{ width: 36, height: 4, borderRadius: 4, background: C.border }} />
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 22px 14px",
            borderBottom: `1px solid ${C.border}`,
          }}
        >
          <h3 style={{ margin: 0, color: C.white, fontSize: 17, fontWeight: 700 }}>{title}</h3>
          <button
            onClick={onClose}
            style={{ background: C.card2, border: "none", borderRadius: 8, color: C.muted, cursor: "pointer", padding: 6, display: "flex" }}
          >
            <Icon name="close" size={16} />
          </button>
        </div>
        <div style={{ padding: "20px 22px calc(24px + env(safe-area-inset-bottom))" }}>{children}</div>
      </div>
    </div>
  );
}

// ── Form fields ──────────────────────────────────────────────────
export function Field({ label, children }) {
  const { C } = useTheme();
  return (
    <div style={{ marginBottom: 14 }}>
      <label
        style={{
          display: "block",
          color: C.muted,
          fontSize: 11,
          fontWeight: 700,
          marginBottom: 6,
          textTransform: "uppercase",
          letterSpacing: "0.6px",
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function useInputStyle() {
  const { C } = useTheme();
  return {
    width: "100%",
    background: C.card2,
    border: `1px solid ${C.border}`,
    borderRadius: 10,
    padding: "11px 13px",
    color: C.text,
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
  };
}

export function Inp(props) {
  const inpStyle = useInputStyle();
  return <input style={{ ...inpStyle, ...props.style }} {...props} />;
}
export function Sel({ children, ...props }) {
  const inpStyle = useInputStyle();
  return (
    <select style={{ ...inpStyle, ...props.style }} {...props}>
      {children}
    </select>
  );
}
export function Txta(props) {
  const inpStyle = useInputStyle();
  return <textarea style={{ ...inpStyle, minHeight: 64, resize: "vertical", ...props.style }} {...props} />;
}

// ── StatCard ─────────────────────────────────────────────────────
export function StatCard({ label, value, sub, color, icon, trend }) {
  const { C } = useTheme();
  const tint = color || C.accent;
  return (
    <div
      style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 16,
        padding: "16px 16px",
        flex: "1 1 150px",
        minWidth: 0,
        boxShadow: C.shadow,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            background: tint + "1F",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon name={icon} size={16} color={tint} />
        </div>
        {trend !== undefined && trend !== null && (
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: trend >= 0 ? C.buy : C.sell,
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Icon name={trend >= 0 ? "up" : "down"} size={11} />
            {Math.abs(trend).toFixed(0)}%
          </span>
        )}
      </div>
      <div style={{ color: C.muted, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ color: C.white, fontSize: 19, fontWeight: 800, wordBreak: "break-all", letterSpacing: "-0.3px" }}>{value}</div>
      {sub && <div style={{ color: C.muted, fontSize: 12, marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

// ── BtnGroup (segmented control) ────────────────────────────────
export function BtnGroup({ options, value, onChange, colorFn }) {
  const { C } = useTheme();
  return (
    <div style={{ display: "flex", gap: 8 }}>
      {options.map((o) => {
        const active = value === o.value;
        const tint = colorFn ? colorFn(o.value) : C.accent;
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            style={{
              flex: 1,
              border: `1px solid ${active ? tint : C.border}`,
              cursor: "pointer",
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 13,
              padding: "9px 14px",
              background: active ? tint + "1F" : C.card2,
              color: active ? tint : C.muted,
              transition: "all 0.15s ease",
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

// ── ProgressBar ──────────────────────────────────────────────────
export function ProgressBar({ pct, color }) {
  const { C } = useTheme();
  return (
    <div style={{ background: C.card2, borderRadius: 5, height: 6, overflow: "hidden" }}>
      <div
        style={{
          background: color || C.accent,
          borderRadius: 5,
          height: 6,
          width: `${Math.min(100, Math.max(0, pct))}%`,
          transition: "width 0.3s ease",
        }}
      />
    </div>
  );
}

// ── EmptyState ───────────────────────────────────────────────────
export function EmptyState({ icon = "list", text }) {
  const { C } = useTheme();
  return (
    <div style={{ textAlign: "center", padding: "56px 20px", color: C.muted }}>
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          background: C.card2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 14px",
        }}
      >
        <Icon name={icon} size={22} color={C.mutedSoft} />
      </div>
      {text}
    </div>
  );
}

// ── Section card wrapper ─────────────────────────────────────────
export function Card({ children, style }) {
  const { C } = useTheme();
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20, boxShadow: C.shadow, ...style }}>
      {children}
    </div>
  );
}

export function PageHeader({ title, action }) {
  const { C } = useTheme();
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
      <h2 style={{ color: C.white, margin: 0, fontSize: 20, fontWeight: 800, letterSpacing: "-0.3px" }}>{title}</h2>
      {action}
    </div>
  );
}
