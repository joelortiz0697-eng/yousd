import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useTheme } from "../context/ThemeContext";
import { Card, StatCard, EmptyState } from "../components/ui";
import Icon from "../components/Icon";
import { fARS, fUSDT, isSameMonth, prevMonthDate } from "../utils/format";
import { PIE_COLORS } from "../utils/storage";

// Beneficio neto del mes = (ventas - compras) de operaciones USDT
// menos los gastos en efectivo registrados ese mismo mes.
function calcBeneficio(ops, gas, ref = new Date()) {
  const opsMes = ops.filter((o) => isSameMonth(o.fecha, ref));
  const gasMes = gas.filter((g) => isSameMonth(g.fecha, ref));
  const ventas = opsMes.filter((o) => o.tipo === "venta").reduce((s, o) => s + +o.total, 0);
  const compras = opsMes.filter((o) => o.tipo === "compra").reduce((s, o) => s + +o.total, 0);
  const gastos = gasMes.reduce((s, g) => s + +g.monto, 0);
  return { beneficio: ventas - compras - gastos, ventas, compras, gastos };
}

export default function Dashboard({ ops, bal, deu, gas }) {
  const { C } = useTheme();
  const now = new Date();

  const totalUSDT = bal.filter((b) => b.moneda === "USDT").reduce((s, b) => s + +b.monto, 0);
  const totalARS = bal.filter((b) => b.moneda === "ARS").reduce((s, b) => s + +b.monto, 0);
  const totalUSD = bal.filter((b) => b.moneda === "USD").reduce((s, b) => s + +b.monto, 0);
  const deudas = deu.filter((d) => d.tipo === "deuda" && d.estado === "activa").reduce((s, d) => s + +d.monto, 0);
  const invers = deu.filter((d) => d.tipo === "inversion" && d.estado === "activa").reduce((s, d) => s + +d.monto, 0);

  const { beneficio, ventas, compras, gastos: gastosMes } = calcBeneficio(ops, gas, now);
  const { beneficio: beneficioPrev } = calcBeneficio(ops, gas, prevMonthDate(now));
  const trend =
    beneficioPrev !== 0 ? ((beneficio - beneficioPrev) / Math.abs(beneficioPrev)) * 100 : beneficio !== 0 ? 100 : 0;

  const lastOps = [...ops].sort((a, b) => b.fecha.localeCompare(a.fecha)).slice(0, 5);
  const porCat = {};
  gas.forEach((g) => {
    porCat[g.categoria] = (porCat[g.categoria] || 0) + +g.monto;
  });
  const pieData = Object.entries(porCat).map(([name, value]) => ({ name, value }));

  const monthLabel = now.toLocaleDateString("es-AR", { month: "long", year: "numeric" });

  return (
    <div>
      <div style={{ marginBottom: 22 }}>
        <div style={{ color: C.muted, fontSize: 12.5, fontWeight: 600, marginBottom: 3, textTransform: "capitalize" }}>{monthLabel}</div>
        <h2 style={{ color: C.white, margin: 0, fontSize: 22, fontWeight: 800, letterSpacing: "-0.4px" }}>Resumen general</h2>
      </div>

      {/* Beneficio del mes — tarjeta destacada */}
      <div
        style={{
          background: `linear-gradient(135deg, ${beneficio >= 0 ? C.accent : C.sell}, ${beneficio >= 0 ? C.accentDark : "#B33"})`,
          borderRadius: 18,
          padding: "20px 20px",
          marginBottom: 16,
          color: "#fff",
          boxShadow: C.shadow,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 30, height: 30, borderRadius: 9, background: "rgba(255,255,255,0.22)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="target" size={15} color="#fff" />
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", opacity: 0.92 }}>
              Beneficio del mes
            </span>
          </div>
          {beneficioPrev !== 0 && (
            <span
              style={{
                fontSize: 11.5,
                fontWeight: 700,
                background: "rgba(255,255,255,0.2)",
                borderRadius: 20,
                padding: "3px 9px",
                display: "flex",
                alignItems: "center",
                gap: 3,
              }}
            >
              <Icon name={trend >= 0 ? "up" : "down"} size={11} color="#fff" />
              {Math.abs(trend).toFixed(0)}% vs. mes pasado
            </span>
          )}
        </div>
        <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-0.5px", marginBottom: 12 }}>
          {beneficio >= 0 ? "+" : "−"}
          {fARS(Math.abs(beneficio))}
        </div>
        <div style={{ display: "flex", gap: 18, flexWrap: "wrap", fontSize: 12.5, opacity: 0.95 }}>
          <span>📤 Ventas: {fARS(ventas)}</span>
          <span>📥 Compras: {fARS(compras)}</span>
          <span>💸 Gastos: {fARS(gastosMes)}</span>
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 20 }}>
        <StatCard label="USDT" value={fUSDT(totalUSDT)} icon="usdt" color={C.accent} />
        <StatCard label="Pesos" value={fARS(totalARS)} icon="bank" color={C.buy} />
        {totalUSD > 0 && <StatCard label="Dólares" value={`U$D ${totalUSD.toFixed(2)}`} icon="card" color={C.warn} />}
        <StatCard label="Deudas activas" value={fARS(deudas)} icon="card" color={C.sell} />
        <StatCard label="Inversiones" value={fARS(invers)} icon="invest" color={C.purple} />
        <StatCard label="Gastos del mes" value={fARS(gastosMes)} icon="expense" color={C.warn} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 14 }}>
        <Card>
          <h3 style={{ color: C.white, margin: "0 0 14px", fontSize: 14.5, fontWeight: 700 }}>Últimas operaciones</h3>
          {lastOps.length === 0 ? (
            <EmptyState icon="swap" text="Sin operaciones aún" />
          ) : (
            lastOps.map((op) => (
              <div
                key={op.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "11px 0",
                  borderBottom: `1px solid ${C.borderSoft}`,
                }}
              >
                <div>
                  <span style={{ color: op.tipo === "compra" ? C.buy : C.sell, fontWeight: 700, fontSize: 11, textTransform: "uppercase" }}>
                    {op.tipo}{" "}
                  </span>
                  <span style={{ color: C.white, fontWeight: 700 }}>{fUSDT(op.usdt)}</span>
                  <div style={{ color: C.muted, fontSize: 11, marginTop: 2 }}>
                    {op.fecha} · {op.metodo}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: C.white, fontWeight: 700 }}>{fARS(op.total)}</div>
                  <div style={{ color: C.muted, fontSize: 11 }}>{fARS(op.precio)}/USDT</div>
                </div>
              </div>
            ))
          )}
        </Card>
        <Card>
          <h3 style={{ color: C.white, margin: "0 0 14px", fontSize: 14.5, fontWeight: 700 }}>Gastos por categoría</h3>
          {pieData.length === 0 ? (
            <EmptyState icon="expense" text="Sin gastos registrados" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  label={({ name, percent }) => `${name.split(" ")[0]} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                  fontSize={10}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => fARS(v)} contentStyle={{ background: C.surface, border: `1px solid ${C.border}`, color: C.text, fontSize: 12, borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>
    </div>
  );
}
