import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

// ── Constants ────────────────────────────────────────────────────
const KEYS = { ops: "ft_ops_v1", bal: "ft_bal_v1", deu: "ft_deu_v1", gas: "ft_gas_v1" };
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2);
const todayStr = () => new Date().toISOString().slice(0, 10);

const C = {
  bg: "#060B14", surface: "#0C1422", card: "#111D2E", card2: "#162235",
  border: "#1C3050", accent: "#00CBA8", accentDark: "#009E82",
  buy: "#22D47E", sell: "#F55C5C", warn: "#F59E0B", purple: "#A78BFA",
  text: "#DCE9F5", muted: "#5A7A9B", white: "#EDF5FF",
};

const fARS = n => `$${Number(n).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fUSD = n => `U$D ${Number(n).toFixed(2)}`;
const fUSDT = n => `${Number(n).toFixed(2)} USDT`;
const fMoney = (n, cur) => cur === "USDT" ? fUSDT(n) : cur === "USD" ? fUSD(n) : fARS(n);

function loadKey(key) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : []; }
  catch { return []; }
}
function saveKey(key, data) {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch {}
}

const TABS = [
  { id: "dashboard",   label: "Dashboard",    icon: "📊" },
  { id: "operaciones", label: "Operaciones",  icon: "💱" },
  { id: "balances",    label: "Balances",     icon: "💰" },
  { id: "deudas",      label: "Deudas & Inv.",icon: "📋" },
  { id: "gastos",      label: "Gastos",       icon: "💸" },
];

const CATS = ["🍔 Alimentación","🚌 Transporte","💡 Servicios","🎬 Entretenimiento","💊 Salud","👕 Ropa","📚 Educación","🔧 Mantenimiento","📦 Otros"];
const PIE_COLORS = ["#00CBA8","#A78BFA","#F59E0B","#F55C5C","#22D47E","#60A5FA","#F472B6","#34D399"];

// ── Shared UI ────────────────────────────────────────────────────
const btnStyle = (extra = {}) => ({
  border: "none", cursor: "pointer", borderRadius: 8, fontWeight: 600,
  fontSize: 13, padding: "8px 16px", transition: "opacity 0.15s", ...extra,
});

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, width:"100%", maxWidth:460, maxHeight:"90vh", overflowY:"auto" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"18px 24px 14px", borderBottom:`1px solid ${C.border}` }}>
          <h3 style={{ margin:0, color:C.white, fontSize:17 }}>{title}</h3>
          <button onClick={onClose} style={{ background:"none", border:"none", color:C.muted, cursor:"pointer", fontSize:24, lineHeight:1, padding:0 }}>×</button>
        </div>
        <div style={{ padding:"20px 24px 24px" }}>{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom:14 }}>
      <label style={{ display:"block", color:C.muted, fontSize:11, fontWeight:700, marginBottom:6, textTransform:"uppercase", letterSpacing:"0.6px" }}>{label}</label>
      {children}
    </div>
  );
}

const inpStyle = { width:"100%", background:C.card2, border:`1px solid ${C.border}`, borderRadius:8, padding:"10px 12px", color:C.text, fontSize:14, outline:"none", boxSizing:"border-box" };

function Inp(props) { return <input style={inpStyle} {...props} />; }
function Sel({ children, ...props }) { return <select style={inpStyle} {...props}>{children}</select>; }
function Txta(props) { return <textarea style={{ ...inpStyle, minHeight:64, resize:"vertical" }} {...props} />; }

function StatCard({ label, value, sub, color = C.accent, icon }) {
  return (
    <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:"16px 18px", flex:"1 1 150px", minWidth:0 }}>
      <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:8 }}>
        <span style={{ fontSize:16 }}>{icon}</span>
        <span style={{ color:C.muted, fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.5px" }}>{label}</span>
      </div>
      <div style={{ color, fontSize:20, fontWeight:700, wordBreak:"break-all" }}>{value}</div>
      {sub && <div style={{ color:C.muted, fontSize:12, marginTop:3 }}>{sub}</div>}
    </div>
  );
}

function BtnGroup({ options, value, onChange, colorFn }) {
  return (
    <div style={{ display:"flex", gap:8 }}>
      {options.map(o => (
        <button key={o.value} onClick={() => onChange(o.value)}
          style={btnStyle({ flex:1, background: value===o.value ? (colorFn?colorFn(o.value):C.accent) : C.card2, color: value===o.value ? "#fff" : C.muted, border:`1px solid ${C.border}` })}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ── Dashboard ────────────────────────────────────────────────────
function Dashboard({ ops, bal, deu, gas }) {
  const totalUSDT = bal.filter(b=>b.moneda==="USDT").reduce((s,b)=>s+ +b.monto,0);
  const totalARS  = bal.filter(b=>b.moneda==="ARS").reduce((s,b)=>s+ +b.monto,0);
  const totalUSD  = bal.filter(b=>b.moneda==="USD").reduce((s,b)=>s+ +b.monto,0);
  const deudas    = deu.filter(d=>d.tipo==="deuda"&&d.estado==="activa").reduce((s,d)=>s+ +d.monto,0);
  const invers    = deu.filter(d=>d.tipo==="inversion"&&d.estado==="activa").reduce((s,d)=>s+ +d.monto,0);
  const now       = new Date();
  const gastosMes = gas.filter(g=>{ const f=new Date(g.fecha); return f.getMonth()===now.getMonth()&&f.getFullYear()===now.getFullYear(); }).reduce((s,g)=>s+ +g.monto,0);
  const lastOps   = [...ops].sort((a,b)=>b.fecha.localeCompare(a.fecha)).slice(0,5);
  const porCat    = {};
  gas.forEach(g=>{porCat[g.categoria]=(porCat[g.categoria]||0)+ +g.monto;});
  const pieData   = Object.entries(porCat).map(([name,value])=>({name,value}));

  return (
    <div>
      <h2 style={{ color:C.white, marginBottom:20, fontSize:19 }}>📊 Resumen General</h2>
      <div style={{ display:"flex", flexWrap:"wrap", gap:10, marginBottom:24 }}>
        <StatCard label="USDT" value={fUSDT(totalUSDT)} icon="₮" color={C.accent} />
        <StatCard label="Pesos" value={fARS(totalARS)} icon="🏦" color={C.buy} />
        {totalUSD > 0 && <StatCard label="Dólares" value={fUSD(totalUSD)} icon="💵" color={C.warn} />}
        <StatCard label="Deudas activas" value={fARS(deudas)} icon="📋" color={C.sell} />
        <StatCard label="Inversiones" value={fARS(invers)} icon="📈" color={C.purple} />
        <StatCard label="Gastos del mes" value={fARS(gastosMes)} icon="💸" color={C.warn} />
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:16 }}>
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:20 }}>
          <h3 style={{ color:C.white, margin:"0 0 14px", fontSize:14 }}>Últimas operaciones</h3>
          {lastOps.length===0
            ? <p style={{ color:C.muted, fontSize:13, margin:0 }}>Sin operaciones aún</p>
            : lastOps.map(op=>(
              <div key={op.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:`1px solid ${C.border}` }}>
                <div>
                  <span style={{ color:op.tipo==="compra"?C.buy:C.sell, fontWeight:700, fontSize:11, textTransform:"uppercase" }}>{op.tipo} </span>
                  <span style={{ color:C.white, fontWeight:600 }}>{fUSDT(op.usdt)}</span>
                  <div style={{ color:C.muted, fontSize:11, marginTop:2 }}>{op.fecha} · {op.metodo}</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ color:C.white, fontWeight:600 }}>{fARS(op.total)}</div>
                  <div style={{ color:C.muted, fontSize:11 }}>{fARS(op.precio)}/USDT</div>
                </div>
              </div>
            ))
          }
        </div>
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:20 }}>
          <h3 style={{ color:C.white, margin:"0 0 14px", fontSize:14 }}>Gastos por categoría</h3>
          {pieData.length===0
            ? <p style={{ color:C.muted, fontSize:13, margin:0 }}>Sin gastos registrados</p>
            : <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={70}
                    label={({name,percent})=>`${name.split(" ")[0]} ${(percent*100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                    {pieData.map((_,i)=><Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={v=>fARS(v)} contentStyle={{ background:C.surface, border:`1px solid ${C.border}`, color:C.text, fontSize:12 }} />
                </PieChart>
              </ResponsiveContainer>
          }
        </div>
      </div>
    </div>
  );
}

// ── Operaciones ──────────────────────────────────────────────────
const OP0 = { tipo:"compra", usdt:"", precio:"", total:"", fecha:todayStr(), metodo:"efectivo", notas:"" };

function Operaciones({ ops, onSave }) {
  const [show,setShow] = useState(false);
  const [form,setForm] = useState(OP0);
  const [editId,setEditId] = useState(null);
  const [filter,setFilter] = useState("todos");

  const set = (k,v) => {
    const next={...form,[k]:v};
    if ((k==="usdt"||k==="precio")&&next.usdt&&next.precio)
      next.total=(parseFloat(next.usdt)*parseFloat(next.precio)).toFixed(2);
    setForm(next);
  };
  const openAdd=()=>{setForm(OP0);setEditId(null);setShow(true);};
  const openEdit=op=>{setForm({...op});setEditId(op.id);setShow(true);};
  const del=id=>onSave(ops.filter(o=>o.id!==id));
  const save=()=>{
    if(!form.usdt||!form.precio)return;
    const next=editId?ops.map(o=>o.id===editId?{...form,id:editId}:o):[{...form,id:uid()},...ops];
    onSave(next);setShow(false);
  };

  const filtered=filter==="todos"?ops:ops.filter(o=>o.tipo===filter);
  const sorted=[...filtered].sort((a,b)=>b.fecha.localeCompare(a.fecha));
  const totComp=ops.filter(o=>o.tipo==="compra").reduce((s,o)=>s+ +o.usdt,0);
  const totVend=ops.filter(o=>o.tipo==="venta").reduce((s,o)=>s+ +o.usdt,0);
  const gasComp=ops.filter(o=>o.tipo==="compra").reduce((s,o)=>s+ +o.total,0);
  const ingVent=ops.filter(o=>o.tipo==="venta").reduce((s,o)=>s+ +o.total,0);

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <h2 style={{ color:C.white, margin:0, fontSize:19 }}>💱 Operaciones USDT</h2>
        <button onClick={openAdd} style={btnStyle({ background:C.accent, color:"#000" })}>+ Nueva</button>
      </div>
      <div style={{ display:"flex", flexWrap:"wrap", gap:10, marginBottom:20 }}>
        <StatCard label="Comprado" value={fUSDT(totComp)} icon="📥" color={C.buy} sub={fARS(gasComp)} />
        <StatCard label="Vendido" value={fUSDT(totVend)} icon="📤" color={C.sell} sub={fARS(ingVent)} />
        <StatCard label="Balance neto" value={fUSDT(totComp-totVend)} icon="⚖️" color={C.accent} />
      </div>
      <div style={{ display:"flex", gap:8, marginBottom:16 }}>
        {["todos","compra","venta"].map(t=>(
          <button key={t} onClick={()=>setFilter(t)} style={btnStyle({ background:filter===t?C.accent:C.card, color:filter===t?"#000":C.muted, border:`1px solid ${C.border}` })}>
            {t.charAt(0).toUpperCase()+t.slice(1)}
          </button>
        ))}
      </div>
      {sorted.length===0
        ? <div style={{ textAlign:"center", padding:60, color:C.muted }}>No hay operaciones. ¡Agregá la primera!</div>
        : sorted.map(op=>(
          <div key={op.id} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:"14px 18px", marginBottom:8, display:"flex", alignItems:"center", gap:14 }}>
            <div style={{ width:4, borderRadius:4, height:48, background:op.tipo==="compra"?C.buy:C.sell, flexShrink:0 }}/>
            <div style={{ flex:1 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                <span style={{ color:op.tipo==="compra"?C.buy:C.sell, fontWeight:700, textTransform:"uppercase", fontSize:11 }}>{op.tipo}</span>
                <span style={{ color:C.white, fontWeight:700, fontSize:15 }}>{fUSDT(op.usdt)}</span>
                <span style={{ color:C.muted, fontSize:13 }}>→ {fARS(op.total)}</span>
              </div>
              <div style={{ color:C.muted, fontSize:12, marginTop:3 }}>{fARS(op.precio)}/USDT · {op.metodo} · {op.fecha}</div>
              {op.notas&&<div style={{ color:C.muted, fontSize:12, marginTop:2 }}>{op.notas}</div>}
            </div>
            <div style={{ display:"flex", gap:6, flexShrink:0 }}>
              <button onClick={()=>openEdit(op)} style={btnStyle({ background:C.card2, color:C.muted, padding:"6px 10px" })}>✏️</button>
              <button onClick={()=>del(op.id)} style={btnStyle({ background:"#2D0A0A", color:C.sell, padding:"6px 10px" })}>🗑️</button>
            </div>
          </div>
        ))
      }
      {show&&(
        <Modal title={editId?"Editar operación":"Nueva operación"} onClose={()=>setShow(false)}>
          <Field label="Tipo">
            <BtnGroup options={[{value:"compra",label:"📥 Compra"},{value:"venta",label:"📤 Venta"}]} value={form.tipo} onChange={v=>set("tipo",v)} colorFn={v=>v==="compra"?C.buy:C.sell} />
          </Field>
          <Field label="Cantidad USDT"><Inp type="number" value={form.usdt} onChange={e=>set("usdt",e.target.value)} placeholder="ej: 100" /></Field>
          <Field label="Precio por USDT (ARS)"><Inp type="number" value={form.precio} onChange={e=>set("precio",e.target.value)} placeholder="ej: 1200" /></Field>
          <Field label="Total ARS (auto-calculado)"><Inp type="number" value={form.total} onChange={e=>set("total",e.target.value)} /></Field>
          <Field label="Fecha"><Inp type="date" value={form.fecha} onChange={e=>set("fecha",e.target.value)} /></Field>
          <Field label="Método de pago">
            <Sel value={form.metodo} onChange={e=>set("metodo",e.target.value)}>
              {["efectivo","transferencia","crypto","otro"].map(m=><option key={m} value={m}>{m.charAt(0).toUpperCase()+m.slice(1)}</option>)}
            </Sel>
          </Field>
          <Field label="Notas (opcional)"><Txta value={form.notas} onChange={e=>set("notas",e.target.value)} /></Field>
          <button onClick={save} style={btnStyle({ background:C.accent, color:"#000", width:"100%", padding:"12px", fontSize:14 })}>
            {editId?"Guardar cambios":"Registrar operación"}
          </button>
        </Modal>
      )}
    </div>
  );
}

// ── Balances ──────────────────────────────────────────────────────
const BAL0 = { tipo:"caja", nombre:"", moneda:"ARS", monto:"", notas:"" };
const TIPO_INFO = {
  caja:   { icon:"💵", label:"Caja / Efectivo" },
  banco:  { icon:"🏦", label:"Cuentas Bancarias" },
  wallet: { icon:"👛", label:"Wallets Crypto" },
};

function Balances({ bal, onSave }) {
  const [show,setShow] = useState(false);
  const [form,setForm] = useState(BAL0);
  const [editId,setEditId] = useState(null);

  const set=(k,v)=>setForm(p=>({...p,[k]:v}));
  const openAdd=()=>{setForm(BAL0);setEditId(null);setShow(true);};
  const openEdit=b=>{setForm({...b});setEditId(b.id);setShow(true);};
  const del=id=>onSave(bal.filter(b=>b.id!==id));
  const save=()=>{
    if(!form.nombre||!form.monto)return;
    const next=editId?bal.map(b=>b.id===editId?{...form,id:editId}:b):[...bal,{...form,id:uid()}];
    onSave(next);setShow(false);
  };

  const grupos={};
  bal.forEach(b=>{if(!grupos[b.tipo])grupos[b.tipo]=[];grupos[b.tipo].push(b);});

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <h2 style={{ color:C.white, margin:0, fontSize:19 }}>💰 Balances</h2>
        <button onClick={openAdd} style={btnStyle({ background:C.accent, color:"#000" })}>+ Agregar</button>
      </div>
      {bal.length===0&&<div style={{ textAlign:"center", padding:60, color:C.muted }}>No hay balances registrados.</div>}
      {Object.entries(grupos).map(([tipo,items])=>(
        <div key={tipo} style={{ marginBottom:24 }}>
          <h3 style={{ color:C.muted, fontSize:12, textTransform:"uppercase", letterSpacing:"1px", marginBottom:12 }}>
            {TIPO_INFO[tipo]?.icon} {TIPO_INFO[tipo]?.label||tipo}
          </h3>
          <div style={{ display:"flex", flexWrap:"wrap", gap:10 }}>
            {items.map(b=>(
              <div key={b.id} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:"16px 18px", minWidth:160, flex:"1 1 160px" }}>
                <div style={{ color:C.muted, fontSize:12, marginBottom:6 }}>{b.nombre}</div>
                <div style={{ color:C.white, fontWeight:700, fontSize:20 }}>{fMoney(b.monto,b.moneda)}</div>
                <div style={{ color:C.muted, fontSize:11, marginTop:4 }}>{b.moneda}</div>
                {b.notas&&<div style={{ color:C.muted, fontSize:11, marginTop:4 }}>{b.notas}</div>}
                <div style={{ display:"flex", gap:6, marginTop:14 }}>
                  <button onClick={()=>openEdit(b)} style={btnStyle({ background:C.card2, color:C.muted, padding:"4px 10px", fontSize:12 })}>✏️</button>
                  <button onClick={()=>del(b.id)} style={btnStyle({ background:"#2D0A0A", color:C.sell, padding:"4px 10px", fontSize:12 })}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      {show&&(
        <Modal title={editId?"Editar balance":"Nuevo balance"} onClose={()=>setShow(false)}>
          <Field label="Tipo">
            <Sel value={form.tipo} onChange={e=>set("tipo",e.target.value)}>
              <option value="caja">💵 Caja / Efectivo</option>
              <option value="banco">🏦 Banco</option>
              <option value="wallet">👛 Wallet Crypto</option>
            </Sel>
          </Field>
          <Field label="Nombre"><Inp value={form.nombre} onChange={e=>set("nombre",e.target.value)} placeholder="ej: Mercado Pago, Binance..." /></Field>
          <Field label="Moneda">
            <BtnGroup options={[{value:"ARS",label:"ARS"},{value:"USD",label:"USD"},{value:"USDT",label:"USDT"}]} value={form.moneda} onChange={v=>set("moneda",v)} />
          </Field>
          <Field label="Monto"><Inp type="number" value={form.monto} onChange={e=>set("monto",e.target.value)} placeholder="0.00" /></Field>
          <Field label="Notas (opcional)"><Inp value={form.notas} onChange={e=>set("notas",e.target.value)} /></Field>
          <button onClick={save} style={btnStyle({ background:C.accent, color:"#000", width:"100%", padding:"12px", fontSize:14 })}>
            {editId?"Guardar cambios":"Agregar balance"}
          </button>
        </Modal>
      )}
    </div>
  );
}

// ── Deudas & Inversiones ──────────────────────────────────────────
const DEU0 = { tipo:"deuda", descripcion:"", contraparte:"", monto:"", moneda:"ARS", fecha:todayStr(), interes:"", estado:"activa", notas:"" };
const ESTADO_COLORS = { activa:C.warn, pagada:C.buy, retirada:C.buy, cancelada:"#4A5568" };
const ESTADO_LABELS = { activa:"Activa", pagada:"Pagada", retirada:"Retirada", cancelada:"Cancelada" };

function DeudasInversiones({ deu, onSave }) {
  const [show,setShow] = useState(false);
  const [form,setForm] = useState(DEU0);
  const [editId,setEditId] = useState(null);
  const [tab,setTab] = useState("deuda");

  const set=(k,v)=>setForm(p=>({...p,[k]:v}));
  const openAdd=()=>{setForm({...DEU0,tipo:tab});setEditId(null);setShow(true);};
  const openEdit=d=>{setForm({...d});setEditId(d.id);setShow(true);};
  const del=id=>onSave(deu.filter(d=>d.id!==id));
  const save=()=>{
    if(!form.descripcion||!form.monto)return;
    const next=editId?deu.map(d=>d.id===editId?{...form,id:editId}:d):[...deu,{...form,id:uid()}];
    onSave(next);setShow(false);
  };

  const items=deu.filter(d=>d.tipo===tab);
  const activas=items.filter(d=>d.estado==="activa");
  const inactivas=items.filter(d=>d.estado!=="activa");
  const totalActivo=activas.reduce((s,d)=>s+ +d.monto,0);

  const renderItem=d=>(
    <div key={d.id} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:"14px 18px", marginBottom:8, display:"flex", gap:14, alignItems:"flex-start" }}>
      <div style={{ flex:1 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6, flexWrap:"wrap" }}>
          <span style={{ color:C.white, fontWeight:700 }}>{d.descripcion}</span>
          <span style={{ background:ESTADO_COLORS[d.estado]+"22", color:ESTADO_COLORS[d.estado], borderRadius:6, padding:"2px 8px", fontSize:11, fontWeight:600 }}>
            {ESTADO_LABELS[d.estado]||d.estado}
          </span>
        </div>
        <div style={{ color:d.tipo==="deuda"?C.sell:C.purple, fontWeight:700, fontSize:18, marginBottom:4 }}>{fMoney(d.monto,d.moneda)}</div>
        <div style={{ color:C.muted, fontSize:12, display:"flex", gap:12, flexWrap:"wrap" }}>
          {d.contraparte&&<span>👤 {d.contraparte}</span>}
          <span>📅 {d.fecha}</span>
          {d.interes&&<span>% {d.interes} interés anual</span>}
        </div>
        {d.notas&&<div style={{ color:C.muted, fontSize:12, marginTop:6 }}>{d.notas}</div>}
      </div>
      <div style={{ display:"flex", gap:6, flexShrink:0 }}>
        <button onClick={()=>openEdit(d)} style={btnStyle({ background:C.card2, color:C.muted, padding:"6px 10px" })}>✏️</button>
        <button onClick={()=>del(d.id)} style={btnStyle({ background:"#2D0A0A", color:C.sell, padding:"6px 10px" })}>🗑️</button>
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <h2 style={{ color:C.white, margin:0, fontSize:19 }}>📋 Deudas & Inversiones</h2>
        <button onClick={openAdd} style={btnStyle({ background:C.accent, color:"#000" })}>+ Agregar</button>
      </div>
      <div style={{ display:"flex", gap:8, marginBottom:20 }}>
        <button onClick={()=>setTab("deuda")} style={btnStyle({ background:tab==="deuda"?C.sell:C.card, color:tab==="deuda"?"#fff":C.muted, border:`1px solid ${C.border}` })}>💳 Deudas</button>
        <button onClick={()=>setTab("inversion")} style={btnStyle({ background:tab==="inversion"?C.purple:C.card, color:tab==="inversion"?"#fff":C.muted, border:`1px solid ${C.border}` })}>📈 Inversiones</button>
      </div>
      {activas.length>0&&(
        <div style={{ background:C.card, border:`1px solid ${(tab==="deuda"?C.sell:C.purple)}44`, borderRadius:12, padding:"14px 18px", marginBottom:20, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ color:C.muted, fontSize:13 }}>Total {tab==="deuda"?"deudas":"inversiones"} activas</span>
          <span style={{ color:tab==="deuda"?C.sell:C.purple, fontWeight:700, fontSize:20 }}>{fARS(totalActivo)}</span>
        </div>
      )}
      {items.length===0&&<div style={{ textAlign:"center", padding:60, color:C.muted }}>No hay {tab==="deuda"?"deudas":"inversiones"} registradas.</div>}
      {activas.map(renderItem)}
      {inactivas.length>0&&(
        <>
          <div style={{ color:C.muted, fontSize:11, textTransform:"uppercase", letterSpacing:"1px", margin:"20px 0 12px" }}>Historial</div>
          {inactivas.map(renderItem)}
        </>
      )}
      {show&&(
        <Modal title={editId?"Editar":`Nueva ${tab==="deuda"?"deuda":"inversión"}`} onClose={()=>setShow(false)}>
          <Field label="Tipo">
            <BtnGroup options={[{value:"deuda",label:"💳 Deuda"},{value:"inversion",label:"📈 Inversión"}]} value={form.tipo} onChange={v=>set("tipo",v)} colorFn={v=>v==="deuda"?C.sell:C.purple} />
          </Field>
          <Field label="Descripción"><Inp value={form.descripcion} onChange={e=>set("descripcion",e.target.value)} placeholder="ej: Préstamo a Juan..." /></Field>
          <Field label="Contraparte"><Inp value={form.contraparte} onChange={e=>set("contraparte",e.target.value)} placeholder="ej: Juan García" /></Field>
          <Field label="Monto"><Inp type="number" value={form.monto} onChange={e=>set("monto",e.target.value)} placeholder="0.00" /></Field>
          <Field label="Moneda">
            <BtnGroup options={[{value:"ARS",label:"ARS"},{value:"USD",label:"USD"},{value:"USDT",label:"USDT"}]} value={form.moneda} onChange={v=>set("moneda",v)} />
          </Field>
          <Field label="Fecha"><Inp type="date" value={form.fecha} onChange={e=>set("fecha",e.target.value)} /></Field>
          <Field label="Interés anual %"><Inp type="number" value={form.interes} onChange={e=>set("interes",e.target.value)} placeholder="ej: 5" /></Field>
          <Field label="Estado">
            <Sel value={form.estado} onChange={e=>set("estado",e.target.value)}>
              <option value="activa">Activa</option>
              <option value={form.tipo==="deuda"?"pagada":"retirada"}>{form.tipo==="deuda"?"Pagada":"Retirada"}</option>
              <option value="cancelada">Cancelada</option>
            </Sel>
          </Field>
          <Field label="Notas"><Txta value={form.notas} onChange={e=>set("notas",e.target.value)} /></Field>
          <button onClick={save} style={btnStyle({ background:C.accent, color:"#000", width:"100%", padding:"12px", fontSize:14 })}>
            {editId?"Guardar cambios":"Registrar"}
          </button>
        </Modal>
      )}
    </div>
  );
}

// ── Gastos ────────────────────────────────────────────────────────
const GAS0 = { descripcion:"", monto:"", categoria:CATS[0], fecha:todayStr(), notas:"" };

function Gastos({ gas, onSave }) {
  const [show,setShow] = useState(false);
  const [form,setForm] = useState(GAS0);
  const [editId,setEditId] = useState(null);
  const [mesFilter,setMesFilter] = useState(()=>new Date().toISOString().slice(0,7));

  const set=(k,v)=>setForm(p=>({...p,[k]:v}));
  const openAdd=()=>{setForm(GAS0);setEditId(null);setShow(true);};
  const openEdit=g=>{setForm({...g});setEditId(g.id);setShow(true);};
  const del=id=>onSave(gas.filter(g=>g.id!==id));
  const save=()=>{
    if(!form.descripcion||!form.monto)return;
    const next=editId?gas.map(g=>g.id===editId?{...form,id:editId}:g):[...gas,{...form,id:uid()}];
    onSave(next);setShow(false);
  };

  const filtered=gas.filter(g=>g.fecha.startsWith(mesFilter));
  const sorted=[...filtered].sort((a,b)=>b.fecha.localeCompare(a.fecha));
  const total=filtered.reduce((s,g)=>s+ +g.monto,0);
  const porCat={};
  filtered.forEach(g=>{porCat[g.categoria]=(porCat[g.categoria]||0)+ +g.monto;});
  const catData=Object.entries(porCat).sort((a,b)=>b[1]-a[1]);
  const meses=[...new Set(gas.map(g=>g.fecha.slice(0,7)))].sort().reverse();
  if(!meses.includes(mesFilter))meses.unshift(mesFilter);

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <h2 style={{ color:C.white, margin:0, fontSize:19 }}>💸 Gastos en Efectivo</h2>
        <button onClick={openAdd} style={btnStyle({ background:C.accent, color:"#000" })}>+ Agregar</button>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:20, flexWrap:"wrap" }}>
        <Sel value={mesFilter} onChange={e=>setMesFilter(e.target.value)} style={{ ...inpStyle, maxWidth:160 }}>
          {meses.map(m=><option key={m} value={m}>{m}</option>)}
        </Sel>
        <div style={{ color:C.muted, fontSize:14 }}>Total: <span style={{ color:C.sell, fontWeight:700 }}>{fARS(total)}</span></div>
      </div>
      {catData.length>0&&(
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:20, marginBottom:20 }}>
          <h3 style={{ color:C.white, margin:"0 0 16px", fontSize:14 }}>Por categoría</h3>
          {catData.map(([cat,monto])=>(
            <div key={cat} style={{ marginBottom:10 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                <span style={{ color:C.text, fontSize:13 }}>{cat}</span>
                <span style={{ color:C.white, fontWeight:600, fontSize:13 }}>{fARS(monto)}</span>
              </div>
              <div style={{ background:C.border, borderRadius:4, height:6 }}>
                <div style={{ background:C.accent, borderRadius:4, height:6, width:`${(monto/total)*100}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
      {sorted.length===0
        ? <div style={{ textAlign:"center", padding:60, color:C.muted }}>Sin gastos este mes.</div>
        : sorted.map(g=>(
          <div key={g.id} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:10, padding:"12px 16px", marginBottom:8, display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ flex:1 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                <span style={{ color:C.white, fontWeight:600 }}>{g.descripcion}</span>
                <span style={{ background:C.border, color:C.muted, borderRadius:4, padding:"2px 6px", fontSize:11 }}>{g.categoria}</span>
              </div>
              <div style={{ color:C.muted, fontSize:12, marginTop:3 }}>{g.fecha}{g.notas&&` · ${g.notas}`}</div>
            </div>
            <div style={{ color:C.sell, fontWeight:700, fontSize:16, flexShrink:0 }}>{fARS(g.monto)}</div>
            <div style={{ display:"flex", gap:6, flexShrink:0 }}>
              <button onClick={()=>openEdit(g)} style={btnStyle({ background:C.card2, color:C.muted, padding:"5px 10px" })}>✏️</button>
              <button onClick={()=>del(g.id)} style={btnStyle({ background:"#2D0A0A", color:C.sell, padding:"5px 10px" })}>🗑️</button>
            </div>
          </div>
        ))
      }
      {show&&(
        <Modal title={editId?"Editar gasto":"Nuevo gasto"} onClose={()=>setShow(false)}>
          <Field label="Descripción"><Inp value={form.descripcion} onChange={e=>set("descripcion",e.target.value)} placeholder="ej: Almuerzo, nafta..." /></Field>
          <Field label="Monto (ARS)"><Inp type="number" value={form.monto} onChange={e=>set("monto",e.target.value)} placeholder="0.00" /></Field>
          <Field label="Categoría">
            <Sel value={form.categoria} onChange={e=>set("categoria",e.target.value)}>
              {CATS.map(c=><option key={c} value={c}>{c}</option>)}
            </Sel>
          </Field>
          <Field label="Fecha"><Inp type="date" value={form.fecha} onChange={e=>set("fecha",e.target.value)} /></Field>
          <Field label="Notas"><Inp value={form.notas} onChange={e=>set("notas",e.target.value)} /></Field>
          <button onClick={save} style={btnStyle({ background:C.accent, color:"#000", width:"100%", padding:"12px", fontSize:14 })}>
            {editId?"Guardar":"Registrar gasto"}
          </button>
        </Modal>
      )}
    </div>
  );
}

// ── App Shell ─────────────────────────────────────────────────────
export default function App() {
  const [activeTab,setActiveTab] = useState("dashboard");
  const [ops,setOps] = useState(()=>loadKey(KEYS.ops));
  const [bal,setBal] = useState(()=>loadKey(KEYS.bal));
  const [deu,setDeu] = useState(()=>loadKey(KEYS.deu));
  const [gas,setGas] = useState(()=>loadKey(KEYS.gas));

  const saveOps=d=>{setOps(d);saveKey(KEYS.ops,d);};
  const saveBal=d=>{setBal(d);saveKey(KEYS.bal,d);};
  const saveDeu=d=>{setDeu(d);saveKey(KEYS.deu,d);};
  const saveGas=d=>{setGas(d);saveKey(KEYS.gas,d);};

  return (
    <div style={{ minHeight:"100vh", background:C.bg, color:C.text, fontFamily:"system-ui,sans-serif" }}>
      <header style={{ background:C.surface, borderBottom:`1px solid ${C.border}`, position:"sticky", top:0, zIndex:10 }}>
        <div style={{ maxWidth:900, margin:"0 auto", padding:"12px 20px", display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:36, height:36, borderRadius:9, background:`linear-gradient(135deg,${C.accent},${C.accentDark})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, fontWeight:700, color:"#000", flexShrink:0 }}>₮</div>
          <div>
            <div style={{ color:C.white, fontWeight:700, fontSize:16, lineHeight:1.2 }}>USDT Tracker</div>
            <div style={{ color:C.muted, fontSize:11 }}>Gestión financiera personal</div>
          </div>
        </div>
        <nav style={{ display:"flex", overflowX:"auto", borderTop:`1px solid ${C.border}` }}>
          <div style={{ maxWidth:900, margin:"0 auto", display:"flex", width:"100%", padding:"0 12px" }}>
            {TABS.map(t=>(
              <button key={t.id} onClick={()=>setActiveTab(t.id)} style={{
                background:"none", border:"none", cursor:"pointer",
                color:activeTab===t.id?C.accent:C.muted,
                padding:"11px 12px", fontSize:12, fontWeight:600,
                borderBottom:`2px solid ${activeTab===t.id?C.accent:"transparent"}`,
                whiteSpace:"nowrap", display:"flex", alignItems:"center", gap:5, flexShrink:0
              }}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </nav>
      </header>
      <main style={{ maxWidth:900, margin:"0 auto", padding:"24px 16px" }}>
        {activeTab==="dashboard"    && <Dashboard ops={ops} bal={bal} deu={deu} gas={gas} />}
        {activeTab==="operaciones"  && <Operaciones ops={ops} onSave={saveOps} />}
        {activeTab==="balances"     && <Balances bal={bal} onSave={saveBal} />}
        {activeTab==="deudas"       && <DeudasInversiones deu={deu} onSave={saveDeu} />}
        {activeTab==="gastos"       && <Gastos gas={gas} onSave={saveGas} />}
      </main>
    </div>
  );
}
