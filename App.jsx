import { useTheme } from "../context/ThemeContext";
import Icon from "./Icon";

export default function Header() {
  const { C, mode, toggle } = useTheme();
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        background: C.surface + (C.mode === "dark" ? "E6" : "F2"),
        backdropFilter: "blur(10px)",
        borderBottom: `1px solid ${C.border}`,
      }}
    >
      <div
        style={{
          maxWidth: 560,
          margin: "0 auto",
          padding: "14px 18px",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 11,
            background: `linear-gradient(135deg, ${C.accent}, ${C.accentDark})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            fontWeight: 800,
            color: "#04140F",
            flexShrink: 0,
          }}
        >
          ₮
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: C.white, fontWeight: 800, fontSize: 16, lineHeight: 1.2, letterSpacing: "-0.2px" }}>USDT Tracker</div>
          <div style={{ color: C.muted, fontSize: 11.5 }}>Gestión financiera personal</div>
        </div>
        <button
          onClick={toggle}
          title={mode === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            border: `1px solid ${C.border}`,
            background: C.card2,
            color: C.text,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon name={mode === "dark" ? "sun" : "moon"} size={16} />
        </button>
      </div>
    </header>
  );
}
