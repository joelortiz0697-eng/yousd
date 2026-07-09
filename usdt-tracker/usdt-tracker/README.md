# USDT Tracker — PWA

App de gestión financiera personal para operaciones de USDT.

## ✅ Cómo subir a Vercel (paso a paso)

### 1. Subí el proyecto a GitHub
- Andá a https://github.com/new y creá un repositorio nuevo (ej: `usdt-tracker`)
- Descomprimí este ZIP en tu computadora
- Abrí una terminal en la carpeta y ejecutá:
  ```bash
  git init
  git add .
  git commit -m "primera versión"
  git remote add origin https://github.com/TU_USUARIO/usdt-tracker.git
  git push -u origin main
  ```

### 2. Desplegá en Vercel
- Andá a https://vercel.com y creá una cuenta gratis (podés entrar con GitHub)
- Hacé clic en **"Add New Project"**
- Seleccioná tu repositorio `usdt-tracker`
- Vercel detecta Vite automáticamente → hacé clic en **Deploy**
- En 1 minuto tenés tu URL pública, ej: `https://usdt-tracker-tuusuario.vercel.app`

### 3. Instalala como app en el celular
**Android (Chrome):**
- Abrí la URL en Chrome
- Tocá el menú (3 puntitos) → "Agregar a pantalla de inicio"

**iPhone (Safari):**
- Abrí la URL en Safari
- Tocá el botón compartir (cuadrado con flecha) → "Agregar a inicio"

---

## 💻 Correr en local (opcional)
```bash
npm install
npm run dev
```

## 🔨 Compilar para producción
```bash
npm run build
```

---

Los datos se guardan en el dispositivo (localStorage). No se envía nada a internet.
