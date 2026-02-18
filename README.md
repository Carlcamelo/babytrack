# BabyTrack 👶

Tracking inteligente para tu bebé. PWA con React + Supabase.

## Setup

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar Supabase
- Ve a [supabase.com](https://supabase.com) y crea un proyecto
- Copia el contenido de `sql/schema.sql` y ejecútalo en el **SQL Editor** de Supabase
- Habilita autenticación con **Email** en Authentication → Providers
- (Opcional) Habilita **Google** OAuth en Authentication → Providers

### 3. Variables de entorno
Crea un archivo `.env` con:
```
VITE_SUPABASE_URL=tu_url
VITE_SUPABASE_ANON_KEY=tu_anon_key
```

### 4. Desarrollo local
```bash
npm run dev
```

### 5. Deploy a Vercel
```bash
# Conecta el repo en vercel.com
# Agrega las variables de entorno en Vercel → Settings → Environment Variables
# Push a main = deploy automático
```

## Stack
- React 18 + Vite
- Supabase (PostgreSQL + Auth + RLS)
- PWA (instalable como app)
- Claude AI (asistente pediátrico)
