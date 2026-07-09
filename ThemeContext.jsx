import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { Button, IconButton, Modal, Field, Inp, Sel, ProgressBar, EmptyState, PageHeader } from "../components/ui";
import Icon from "../components/Icon";
import { uid, todayStr, fARS } from "../utils/format";
import { CATS } from "../utils/storage";

const GAS0 = { descripcion: "", monto: "", categoria: CATS[0], fecha: todayStr(), notas: "" };

export default function Gastos({ gas, onSave }) {
  const { C } = useTheme();
  const [show, setShow] = useState(false);
  const [form, setForm] = useState(GAS0);
  const [editId, setEditId] = useState(null);
  const [mesFilter, setMesFilter] = useState(() => new Date().toISOString().slice(0, 7));

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const openAdd = () => {
    setForm(GAS0);
    setEditId(null);
    setShow(true);
  };
  const openEdit = (g) => {
    setForm({ ...g });
    setEditId(g.id);
    setShow(true);
  };
  const del = (id) => onSave(gas.filter((g) => g.id !== id));
  const save = () => {
    if (!form.descripcion || !form.monto) return;
    const next = editId ? gas.map((g) => (g.id === editId ? { ...form, id: editId } : g)) : [...gas, { ...form, id: uid() }];
    onSave(next);
    setShow(false);
  };

  const filtered = gas.filter((g) => g.fecha.startsWith(mesFilter));
  const sorted = [...filtered].sort((a, b) => b.fecha.localeCompare(a.fecha));
  const total = filtered.reduce((s, g) => s + +g.monto, 0);
  const porCat = {};
  filtered.forEach((g) => {
    porCat[g.categoria] = (porCat[g.categoria] || 0) + +g.monto;
  });
  const catData = Object.entries(porCat).sort((a, b) => b[1] - a[1]);
  const meses = [...new Set(gas.map((g) => g.fecha.slice(0, 7)))].sort().reverse();
  if (!meses.includes(mesFilter)) meses.unshift(mesFilter);

  return (
    <div>
      <PageHeader
        title="Gastos en efectivo"
        action={
          <Button onClick={openAdd}>
            <Icon name="plus" size={15} /> Agregar
          </Button>
        }
      />
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20, flexWrap: "wrap" }}>
        <Sel value={mesFilter} onChange={(e) => setMesFilter(e.target.value)} style={{ maxWidth: 170 }}>
          {meses.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </Sel>
        <div style={{ color: C.muted, fontSize: 14 }}>
          Total: <span style={{ color: C.sell, fontWeight: 800 }}>{fARS(total)}</span>
        </div>
      </div>
      {catData.length > 0 && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20, marginBottom: 20, boxShadow: C.shadow }}>
          <h3 style={{ color: C.white, margin: "0 0 16px", fontSize: 14.5, fontWeight: 700 }}>Por categoría</h3>
          {catData.map(([cat, monto]) => (
            <div key={cat} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ color: C.text, fontSize: 13 }}>{cat}</span>
                <span style={{ color: C.white, fontWeight: 700, fontSize: 13 }}>{fARS(monto)}</span>
              </div>
              <ProgressBar pct={(monto / total) * 100} />
            </div>
          ))}
        </div>
      )}
      {sorted.length === 0 ? (
        <EmptyState icon="expense" text="Sin gastos este mes." />
      ) : (
        sorted.map((g) => (
          <div
            key={g.id}
            style={{
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              padding: "12px 16px",
              marginBottom: 8,
              display: "flex",
              alignItems: "center",
              gap: 12,
              boxShadow: C.shadow,
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={{ color: C.white, fontWeight: 700 }}>{g.descripcion}</span>
                <span style={{ background: C.card2, color: C.muted, borderRadius: 6, padding: "2px 8px", fontSize: 11 }}>{g.categoria}</span>
              </div>
              <div style={{ color: C.muted, fontSize: 12, marginTop: 3 }}>
                {g.fecha}
                {g.notas && ` · ${g.notas}`}
              </div>
            </div>
            <div style={{ color: C.sell, fontWeight: 800, fontSize: 16, flexShrink: 0 }}>{fARS(g.monto)}</div>
            <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
              <IconButton name="edit" onClick={() => openEdit(g)} />
              <IconButton name="trash" tone="danger" onClick={() => del(g.id)} />
            </div>
          </div>
        ))
      )}
      {show && (
        <Modal title={editId ? "Editar gasto" : "Nuevo gasto"} onClose={() => setShow(false)}>
          <Field label="Descripción">
            <Inp value={form.descripcion} onChange={(e) => set("descripcion", e.target.value)} placeholder="ej: Almuerzo, nafta..." />
          </Field>
          <Field label="Monto (ARS)">
            <Inp type="number" value={form.monto} onChange={(e) => set("monto", e.target.value)} placeholder="0.00" />
          </Field>
          <Field label="Categoría">
            <Sel value={form.categoria} onChange={(e) => set("categoria", e.target.value)}>
              {CATS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Sel>
          </Field>
          <Field label="Fecha">
            <Inp type="date" value={form.fecha} onChange={(e) => set("fecha", e.target.value)} />
          </Field>
          <Field label="Notas">
            <Inp value={form.notas} onChange={(e) => set("notas", e.target.value)} />
          </Field>
          <Button full size="lg" onClick={save}>
            {editId ? "Guardar" : "Registrar gasto"}
          </Button>
        </Modal>
      )}
    </div>
  );
}
