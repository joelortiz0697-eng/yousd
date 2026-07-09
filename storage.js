import { useState } from "react";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import Header from "./components/Header";
import BottomNav from "./components/BottomNav";
import Dashboard from "./pages/Dashboard";
import Operaciones from "./pages/Operaciones";
import Balances from "./pages/Balances";
import DeudasInversiones from "./pages/DeudasInversiones";
import Gastos from "./pages/Gastos";
import { KEYS, loadKey, saveKey } from "./utils/storage";

function AppShell() {
  const { C } = useTheme();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [ops, setOps] = useState(() => loadKey(KEYS.ops));
  const [bal, setBal] = useState(() => loadKey(KEYS.bal));
  const [deu, setDeu] = useState(() => loadKey(KEYS.deu));
  const [gas, setGas] = useState(() => loadKey(KEYS.gas));

  const saveOps = (d) => {
    setOps(d);
    saveKey(KEYS.ops, d);
  };
  const saveBal = (d) => {
    setBal(d);
    saveKey(KEYS.bal, d);
  };
  const saveDeu = (d) => {
    setDeu(d);
    saveKey(KEYS.deu, d);
  };
  const saveGas = (d) => {
    setGas(d);
    saveKey(KEYS.gas, d);
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
      <Header />
      <main style={{ maxWidth: 560, margin: "0 auto", padding: "20px 16px calc(96px + env(safe-area-inset-bottom))" }}>
        {activeTab === "dashboard" && <Dashboard ops={ops} bal={bal} deu={deu} gas={gas} />}
        {activeTab === "operaciones" && <Operaciones ops={ops} onSave={saveOps} />}
        {activeTab === "balances" && <Balances bal={bal} onSave={saveBal} />}
        {activeTab === "deudas" && <DeudasInversiones deu={deu} onSave={saveDeu} />}
        {activeTab === "gastos" && <Gastos gas={gas} onSave={saveGas} />}
      </main>
      <BottomNav active={activeTab} onChange={setActiveTab} />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppShell />
    </ThemeProvider>
  );
}
