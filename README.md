# Kapital Music — Web de propuestas

## Cómo subir a Vercel (5 minutos)

### Opción A — Desde GitHub (recomendado)

1. Ve a **github.com** → crea cuenta si no tienes → clic en **"New repository"**
2. Nómbralo `kapital-music-web` → clic en **"Create repository"**
3. Sube esta carpeta completa (arrastra los archivos o usa GitHub Desktop)
4. Ve a **vercel.com** → "Sign up" con tu cuenta de GitHub
5. Clic en **"Add New Project"** → selecciona el repositorio `kapital-music-web`
6. Vercel detecta automáticamente que es React → clic en **"Deploy"**
7. En 2 minutos tienes tu link: `kapital-music-web.vercel.app`

### Opción B — Desde Vercel directamente

1. Ve a **vercel.com** → crea cuenta
2. Instala Vercel CLI: `npm install -g vercel`
3. Dentro de esta carpeta ejecuta: `vercel`
4. Sigue las instrucciones en pantalla

---

## Estructura del proyecto

```
kapital-web/
├── public/
│   └── index.html
├── src/
│   ├── index.js
│   └── App.js          ← Toda la lógica y UI
├── package.json
└── README.md
```

## Google Sheets

Los datos de cada encuesta se guardan automáticamente en:
**Kapital Leads** (tu Google Sheet)

Columnas guardadas:
- Fecha, Nombre artístico, Nombre real, Email, WhatsApp
- Géneros, Años de carrera, Lanzamientos, Registrado, Distribuidora
- Asesoría previa, Seguidores IG, Seguidores TikTok, Actividad en redes
- Objetivos, Servicios de interés, Presupuesto, Descripción
- Estudio elegido, Sesiones, Productor, Canciones
- Total base COP, Total con promos COP, Ahorro COP, Detalle cotización

## Dominio personalizado

Cuando tengas `formulario.kapitalmusic.co` o similar:
1. En Vercel → tu proyecto → **Settings → Domains**
2. Agrega tu dominio
3. Sigue las instrucciones para apuntar el DNS

## Soporte

contacto@kapitalmusic.co
