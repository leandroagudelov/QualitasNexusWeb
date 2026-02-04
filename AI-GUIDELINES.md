# Lineamientos para Asistentes de IA - QualitasNexusWeb Frontend

Este documento define reglas y patrones para que cualquier asistente de IA trabaje de forma consistente y segura en este proyecto.

---

## Información del Proyecto

| Campo | Valor |
|-------|-------|
| **Nombre** | QualitasNexusWeb (Frontend) |
| **Framework** | Next.js 13 (App Router) |
| **UI Library** | PrimeReact 10.2 + PrimeFlex + PrimeIcons |
| **Plantilla** | Sakai (estilos y patrones de UI) |
| **CSS** | Sass + PrimeFlex (utilidades) |
| **Lenguaje** | TypeScript 5.1 |
| **Node.js** | 18.x recomendado |
| **Arquitectura** | App Router con páginas, layouts y API Routes |

---

## Reglas Obligatorias

### 1. Usar App Router y componentes funcionales

- Siempre crear páginas dentro de `app/...` usando `page.tsx`.
- Usar componentes funcionales con Hooks (`useState`, `useEffect`, `useRef`).
- Preferir Server Components por defecto; marcar con `"use client"` solo cuando haya interacción o Hooks.

```tsx
// ✅ Página App Router
export default function Page() {
  return <div>Contenido</div>;
}

// ✅ Client Component cuando sea necesario
"use client";
import { useState } from 'react';
export function MiComponente() {
  const [open, setOpen] = useState(false);
  return <button onClick={() => setOpen(true)}>Abrir</button>;
}
```

### 2. Estándar PrimeReact + Sakai

- Usar componentes de PrimeReact para formularios, feedback y navegación.
- Usar PrimeFlex para grid responsivo (`grid`, `col-12 md:col-6`, etc.).
- Usar `classNames` y clases Sakai (`p-error`, `p-invalid`) para estados/validaciones.
- Centralizar feedback con `Toast` y loaders con `Skeleton`.

### 3. API Routes como proxy seguro

- Nunca enviar tokens desde cliente directamente al backend.
- Todas las llamadas al backend deben pasar por API Routes de Next (`app/api/.../route.ts`).
- API Routes deben:
  - Leer `access_token` y `tenant` de cookies.
  - Adjuntar `Authorization: Bearer {token}` y `tenant` en headers.
  - Usar `Accept: application/json` y `Content-Type: application/json` cuando aplique.
  - Manejar errores y devolver mensajes claros.

```ts
// ✅ API Route proxy
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const access = req.cookies.get('access_token')?.value;
  const tenant = req.cookies.get('tenant')?.value || 'root';
  if (!access) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });

  const res = await fetch(`${process.env.BACKEND_API_BASE_URL}/api/v1/identity/profile`, {
    headers: { Authorization: `Bearer ${access}`, tenant, Accept: 'application/json' },
    cache: 'no-store',
  });
  if (!res.ok) return NextResponse.json({ message: 'Upstream error' }, { status: res.status });
  return NextResponse.json(await res.json());
}
```

### 4. Autenticación y multi-tenant

- Tokens en cookies HttpOnly, nunca en `localStorage`.
- `tenant` se guarda en cookie y se propaga via proxy.
- Programar auto-refresh del `access_token` antes de expirar.
- Redirigir a `/auth/login` si no hay `access_token`.

### 5. Tipado y validaciones

- Usar TypeScript estricto y tipos específicos (evitar `any`).
- Validaciones en UI con `p-invalid` + `small.p-error` y toasts.
- Serializar imágenes como `FileUploadRequest` `{ fileName, contentType, data:number[] }`.

### 6. Estilo y organización

- Mantener componentes y páginas concisos; extraer utilidades a `lib/` si hace falta.
- Seguir patrones Sakai para botones, cards y layouts.
- Reutilizar helpers (`classNames`, `PrimeFlex`) y evitar CSS ad-hoc cuando exista componente.

---

## Estructura de Archivos

### Páginas y rutas

```
app/
  (full-page)/auth/login/page.tsx      # Página de login
  (main)/layout.tsx                    # Layout principal protegido
  (main)/pages/profile/page.tsx        # Perfil + cambio de contraseña
  api/
    auth/
      login/route.ts                   # Proxy POST /identity/token/issue
      refresh/route.ts                 # Proxy POST /identity/token/refresh
      logout/route.ts                  # Limpia cookies
      change-password/route.ts         # Proxy POST /identity/change-password
    me/route.ts                        # Proxy GET /identity/profile
```

### Nombrado

| Tipo | Formato | Ejemplo |
|------|---------|---------|
| Página | `page.tsx` en carpeta kebab-case | `pages/profile/page.tsx` |
| API Route | `route.ts` | `api/auth/login/route.ts` |
| Componente | PascalCase archivo o carpeta | `layout/AppTopbar.tsx` |
| Utilidad | kebab-case | `lib/user-service.ts` |

---

## Patrones de Código

### Página estándar (client)

```tsx
"use client";
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { useRef, useState, useEffect } from 'react';

export default function MiPagina() {
  const toast = useRef<Toast>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { setLoading(false); }, []);

  return (
    <div className="p-3">
      <Toast ref={toast} />
      <Card title="Título">
        {loading ? 'Cargando…' : <Button label="Acción" onClick={() => toast.current?.show({ severity: 'success', summary: 'OK' })} />}
      </Card>
    </div>
  );
}
```

### API Route estándar

```ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const access = req.cookies.get('access_token')?.value;
  const tenant = req.cookies.get('tenant')?.value || 'root';
  if (!access) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });

  const payload = await req.json();
  const res = await fetch(`${process.env.BACKEND_API_BASE_URL}/api/v1/identity/change-password`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${access}`, tenant, Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const text = await res.text();
  if (!res.ok) return NextResponse.json({ message: 'Upstream error', details: text }, { status: res.status });
  return NextResponse.json(text ? JSON.parse(text) : { ok: true });
}
```

---

## PrimeReact - Componentes Comunes

### Formularios

- `InputText`, `Dropdown`, `Checkbox`, `Calendar`, `Password (InputText type=password)`
- `FileUpload` para archivos (modo `basic`, `customUpload` cuando procesamos en cliente)
- `Inline` feedback: `p-invalid` + `small.p-error`

### Feedback

- `Toast` para notificaciones
- `Skeleton` para estados de carga
- `OverlayPanel` para menús/acciones del usuario

### Layout

- `Card` + `Divider` para secciones
- PrimeFlex grid para responsividad: `grid`, `col-12 md:col-6`

---

## Autenticación

### Verificar autenticación

- El layout principal debe redirigir a `/auth/login` si falta `access_token`.
- El cliente no debe adjuntar headers de auth manualmente: usar API Routes.

### Cerrar sesión

- Usar `POST /api/auth/logout` y luego `router.push('/auth/login')`.

### Rutas protegidas

- Páginas bajo `(main)` están protegidas desde el layout.

---

## Environments

- `.env.local`:

```
BACKEND_API_BASE_URL=http://localhost:5030
BACKEND_TENANT=root
```

- Producir errores claros si falta `BACKEND_API_BASE_URL` y usar fallback local en dev.

---

## Errores Comunes a Evitar

### ❌ No hacer esto

- No almacenar tokens en `localStorage`.
- No llamar al backend directamente desde componentes para endpoints protegidos.
- No usar `any` salvo que sea imprescindible.
- No crear CSS ad-hoc si existe componente PrimeReact equivalente.

### ✅ Hacer esto

- Usar API Routes para adjuntar auth y tenant.
- Usar PrimeReact + PrimeFlex para UI.
- Usar `Toast` y `Skeleton` para feedback/carga.
- Tipar correctamente y validar en cliente.

---

## Checklist para IA

Antes de generar código, verificar:

- [ ] ¿La página está bajo `app/...` y usa App Router?
- [ ] ¿El componente es funcional y client-only solo si es necesario?
- [ ] ¿Se usan componentes PrimeReact y PrimeFlex para la UI?
- [ ] ¿Las llamadas al backend pasan por API Routes con `Authorization` y `tenant`?
- [ ] ¿Los tokens están en cookies HttpOnly (no `localStorage`)?
- [ ] ¿Hay validación visible (p-invalid, p-error) y toasts?
- [ ] ¿La serialización de archivos sigue `FileUploadRequest`?
- [ ] ¿La estructura/nombre de archivos sigue las convenciones?

---

## Comandos Útiles

```bash
# Desarrollo
npm run dev

# Build
npm run build

# Producción
npm start

# Calidad
npm run lint
npm run format
```

---

## Referencias

- Next.js (App Router): https://nextjs.org/docs/app
- PrimeReact: https://primereact.org
- PrimeFlex: https://primeflex.org
- Sakai React: https://www.primefaces.org/sakai-react