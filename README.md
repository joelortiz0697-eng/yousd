import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { Button, IconButton, Modal, Field, Inp, Sel, Txta, BtnGroup, EmptyState, PageHeader } from "../components/ui";
import Icon from "../components/Icon";
import { uid, todayStr, fARS, fMoney } from "../utils/format";

const DEU0 = { tipo: "deuda", descripcion: "", contraparte: "", monto: "", moneda: "ARS", fecha: todayStr(), interes: "", estado: "activa", notas: "" };
const ESTADO_LABELS = { activa: "Activa", pagada: "Pagada", retirada: "Retirada", cancelada: "Cancelada" };

export default function DeudasInversiones({ deu, onSave }) {
  const { C } = useTheme();
  const ESTADO_COLORS = { activa: C.warn, pagada: C.buy, retirada: C.buy, cancelada: C.mutedSoft };
  const [show, setShow] = useState(false);
  const [form, setForm] = useState(DEU0);
  const [editId, setEditId] = useState(null);
  const [tab, setTab] = useState("deuda");

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const openAdd = () => {
    setForm({ ...DEU0, tipo: tab });
    setEditId(null);
    setShow(true);
  };
  const openEdit = (d) => {
    setForm({ ...d });
    setEditId(d.id);
    setShow(true);
  };
  const del = (id) => onSave(deu.filter((d) => d.id !== id));
  const save = () => {
    if (!form.descripcion || !form.monto) return;
    const next = editId ? deu.map((d) => (d.id === editId ? { ...form, id: editId } : d)) : [...deu, { ...form, id: uid() }];
    onSave(next);
    setShow(false);
  };

  const items = deu.filter((d) => d.tipo === tab);
  const activas = items.filter((d) => d.estado === "activa");
  const inactivas = items.filter((d) => d.estado !== "activa");
  const totalActivo = activas.reduce((s, d) => s + +d.monto, 0);

  const renderItem = (d) => (
    <div
      key={d.id}
      style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 14,
        padding: "14px 18px",
        marginBottom: 8,
        display: "flex",
        gap: 14,
        alignItems: "flex-start",
        boxShadow: C.shadow,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
          <span style={{ color: C.white, fontWeight: 700 }}>{d.descripcion}</span>
          <span
            style={{
              background: ESTADO_COLORS[d.estado] + "22",
              color: ESTADO_COLORS[d.estado],
              borderRadius: 6,
              padding: "2px 8px",
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            {ESTADO_LABELS[d.estado] || d.estado}
          </span>
        </div>
        <div style={{ color: d.tipo === "deuda" ? C.sell : C.purple, fontWeight: 800, fontSize: 18, marginBottom: 4 }}>{fMoney(d.monto, d.moneda)}</div>
        <div style={{ color: C.muted, fontSize: 12, display: "flex", gap: 12, flexWrap: "wrap" }}>
          {d.contraparte && <span>👤 {d.contraparte}</span>}
          <span>📅 {d.fecha}</span>
          {d.interes && <span>% {d.interes} interés anual</span>}
        </div>
        {d.notas && <div style={{ color: C.muted, fontSize: 12, marginTop: 6 }}>{d.notas}</div>}
      </div>
      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
        <IconButton name="edit" onClick={() => openEdit(d)} />
        <IconButton name="trash" tone="danger" onClick={() => del(d.id)} />
      </div>
    </div>
  );

  return (
    <div>
      <PageHeader
        title="Deudas & Inversiones"
        action={
          <Button onClick={openAdd}>
            <Icon name="plus" size={15} /> Agregar
          </Button>
        }
      />
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <button
          onClick={() => setTab("deuda")}
          style={{
            border: `1px solid ${C.border}`,
            cursor: "pointer",
            borderRadius: 10,
            fontWeight: 700,
            fontSize: 13,
            padding: "9px 16px",
            background: tab === "deuda" ? C.sell : C.card,
            color: tab === "deuda" ? "#fff" : C.muted,
          }}
        >
          💳 Deudas
        </button>
        <button
          onClick={() => setTab("inversion")}
          style={{
            border: `1px solid ${C.border}`,
            cursor: "pointer",
            borderRadius: 10,
            fontWeight: 700,
            fontSize: 13,
            padding: "9px 16px",
            background: tab === "inversion" ? C.purple : C.card,
            color: tab === "inversion" ? "#fff" : C.muted,
          }}
        >
          📈 Inversiones
        </button>
      </div>
      {activas.length > 0 && (
        <div
          style={{
            background: C.card,
            border: `1px solid ${(tab === "deuda" ? C.sell : C.purple)}44`,
            borderRadius: 14,
            padding: "14px 18px",
            marginBottom: 20,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxShadow: C.shadow,
          }}
        >
          <span style={{ color: C.muted, fontSize: 13, fontWeight: 600 }}>Total {tab === "deuda" ? "deudas" : "inversiones"} activas</span>
          <span style={{ color: tab === "deuda" ? C.sell : C.purple, fontWeight: 800, fontSize: 20 }}>{fARS(totalActivo)}</span>
        </div>
      )}
      {items.length === 0 && <EmptyState icon="card" text={`No hay ${tab === "deuda" ? "deudas" : "inversiones"} registradas.`} />}
      {activas.map(renderItem)}
      {inactivas.length > 0 && (
        <>
          <div style={{ color: C.muted, fontSize: 11, textTransform: "uppercase", letterSpacing: "1px", margin: "20px 0 12px", fontWeight: 700 }}>Historial</div>
          {inactivas.map(renderItem)}
        </>
      )}
      {show && (
        <Modal title={editId ? "Editar" : `Nueva ${tab === "deuda" ? "deuda" : "inversión"}`} onClose={() => setShow(false)}>
          <Field label="Tipo">
            <BtnGroup
              options={[
                { value: "deuda", label: "💳 Deuda" },
                { value: "inversion", label: "📈 Inversión" },
              ]}
              value={form.tipo}
              onChange={(v) => set("tipo", v)}
              colorFn={(v) => (v === "deuda" ? C.sell : C.purple)}
            />
          </Field>
          <Field label="Descripción">
            <Inp value={form.descripcion} onChange={(e) => set("descripcion", e.target.value)} placeholder="ej: Préstamo a Juan..." />
          </Field>
          <Field label="Contraparte">
            <Inp value={form.contraparte} onChange={(e) => set("contraparte", e.target.value)} placeholder="ej: Juan García" />
          </Field>
          <Field label="Monto">
            <Inp type="number" value={form.monto} onChange={(e) => set("monto", e.target.value)} placeholder="0.00" />
          </Field>
          <Field label="Moneda">
            <BtnGroup
              options={[
                { value: "ARS", label: "ARS" },
                { value: "USD", label: "USD" },
                { value: "USDT", label: "USDT" },
              ]}
              value={form.moneda}
              onChange={(v) => set("moneda", v)}
            />
          </Field>
          <Field label="Fecha">
            <Inp type="date" value={form.fecha} onChange={(e) => set("fecha", e.target.value)} />
          </Field>
          <Field label="Interés anual %">
            <Inp type="number" value={form.interes} onChange={(e) => set("interes", e.target.value)} placeholder="ej: 5" />
          </Field>
          <Field label="Estado">
            <Sel value={form.estado} onChange={(e) => set("estado", e.target.value)}>
              <option value="activa">Activa</option>
              <option value={form.tipo === "deuda" ? "pagada" : "retirada"}>{form.tipo === "deuda" ? "Pagada" : "Retirada"}</option>
              <option value="cancelada">Cancelada</option>
            </Sel>
          </Field>
          <Field label="Notas">
            <Txta value={form.notas} onChange={(e) => set("notas", e.target.value)} />
          </Field>
          <Button full size="lg" onClick={save}>
            {editId ? "Guardar cambios" : "Registrar"}
          </Button>
        </Modal>
      )}
    </div>
  );
}
