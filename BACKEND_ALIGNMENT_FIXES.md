# 🔧 Correcciones Necesarias - Alineamiento Backend

Este documento detalla los cambios específicos que requiere el frontend para alinear con el backend .NET.

---

## 🔴 PROBLEMA 1: Formato de Imagen (CRÍTICO)

### Actual (Error 415):
```typescript
// lib/api/profile.ts
const formData = new FormData();
formData.append('imageFile', data.image);
// Envía: multipart/form-data ❌
```

### Corregido:
El backend espera **JSON con array de bytes**, no FormData.

**Actualización requerida en `lib/api/profile.ts`:**

```typescript
export async function updateProfile(data: UpdateProfileRequest): Promise<void> {
  try {
    const payload: any = {
      firstName: data.firstName,
      lastName: data.lastName,
      phoneNumber: data.phoneNumber,
      email: data.email,
      deleteCurrentImage: data.deleteCurrentImage,
    };

    // Convertir imagen a bytes si existe
    if (data.image instanceof File) {
      const arrayBuffer = await data.image.arrayBuffer();
      const uint8 = new Uint8Array(arrayBuffer);

      payload.image = {
        fileName: data.image.name,
        contentType: data.image.type || 'application/octet-stream',
        data: Array.from(uint8),  // ← Convierte a array de números
      };
    } else if (data.image && typeof data.image === 'object' && 'fileName' in data.image) {
      // Ya es FileUploadRequest, enviar como está
      payload.image = data.image;
    }

    const response = await fetchWithAuth(apiEndpoints.updateProfile, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',  // ← JSON, no FormData
        'tenant': getTenant(),
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(parseApiError(response, text));
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`No se pudo actualizar el perfil: ${error.message}`);
    }
    throw new Error('No se pudo actualizar el perfil');
  }
}
```

**Agregar función auxiliar** en `lib/utils/api.ts`:

```typescript
export function getTenant(): string {
  // Leer del localStorage, context, o cookie
  return typeof window !== 'undefined'
    ? localStorage.getItem('tenant') || 'root'
    : 'root';
}
```

---

## 🔴 PROBLEMA 2: Header `tenant` No Enviado (CRÍTICO)

### Actual:
```typescript
// Ningún header tenant
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password, tenant }),  // En body, no header
});
```

### Corregido:

**Actualizar todos los endpoints para enviar header `tenant`:**

#### 1. Login (`app/(full-page)/auth/login/page.tsx`):
```typescript
const res = await fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'tenant': tenant || 'root',  // ← AGREGAR
  },
  body: JSON.stringify({ email, password }),  // ← REMOVER tenant
  signal: abortControllerRef.current.signal,
});
```

#### 2. Crear interceptor global en `lib/api/fetchWithAuth.ts`:

```typescript
// Nuevo: Agregar tenant a todos los requests
export async function fetchWithAuth(
  url: string,
  options: FetchWithAuthOptions = {}
): Promise<Response> {
  const { skipAuthRefresh = false, ...fetchOptions } = options;

  // Agregar headers automáticamente
  const headers = new Headers(fetchOptions.headers || {});

  // Agregar tenant si no está presente
  if (!headers.has('tenant')) {
    headers.set('tenant', getTenant());
  }

  // Agregar Content-Type por defecto si no es FormData
  if (!(fetchOptions.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  try {
    let response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    // ... resto del código
  }
}
```

**Resultado:** Todos los requests incluyen automáticamente el header `tenant`.

---

## 🔴 PROBLEMA 3: POST /token/refresh (CRÍTICO)

### Actual (No envía datos):
```typescript
// lib/api/fetchWithAuth.ts
const refreshResponse = await fetch('/api/auth/refresh', {
  method: 'POST',
  signal: fetchOptions.signal,
});
```

### Corregido:

El backend espera `{ token, refreshToken }` en el body.

**Actualizar `lib/api/fetchWithAuth.ts`:**

```typescript
if (response.status === 401 && !skipAuthRefresh) {
  logTokenExpired();

  // Obtener tokens actuales de cookies
  const currentAccessToken = getCookie('access_token') || '';
  const currentRefreshToken = getCookie('refresh_token') || '';

  const refreshResponse = await fetch('/api/auth/refresh', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'tenant': getTenant(),
    },
    body: JSON.stringify({
      token: currentAccessToken,
      refreshToken: currentRefreshToken,
    }),
    signal: fetchOptions.signal,
  });

  if (refreshResponse.ok) {
    const data = await refreshResponse.json();
    logTokenRefresh(true);

    // Mapear respuesta del backend
    // Backend devuelve: { token, refreshToken, refreshTokenExpiryTime }
    // Frontend espera: { accessToken, refreshToken, accessTokenExpiresAt }

    updateTokens({
      accessToken: data.token,
      refreshToken: data.refreshToken,
      accessTokenExpiresAt: data.refreshTokenExpiryTime,  // Mapeo
    });

    // Reintentar request original
    response = await fetch(url, {
      ...fetchOptions,
      headers: new Headers(fetchOptions.headers || {}),
    });
  } else {
    logTokenRefresh(false, 'Token refresh failed');
    logSessionExpired();

    setTimeout(() => {
      window.location.href = '/auth/login?expired=true';
    }, 100);
  }
}
```

**Crear función de ayuda** en `lib/utils/auth.ts`:

```typescript
export function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function updateTokens(tokens: {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
}): void {
  // Actualizar cookies
  const options = '; path=/; SameSite=Lax';
  const isSecure = window.location.protocol === 'https:';

  document.cookie = `access_token=${tokens.accessToken}${options}${isSecure ? '; Secure' : ''}; HttpOnly`;
  document.cookie = `refresh_token=${tokens.refreshToken}${options}${isSecure ? '; Secure' : ''}; HttpOnly`;
  document.cookie = `access_expires_at=${tokens.accessTokenExpiresAt}${options}`;
}
```

---

## 🟡 PROBLEMA 4: Header `tenant` en GET Profile (MEDIO)

### Actual:
```typescript
// lib/api/profile.ts
export async function fetchCurrentProfile(): Promise<UserDto> {
  const response = await fetchWithAuth(apiEndpoints.me, {
    cache: 'no-store',
  });
  // No incluye header tenant
}
```

### Corregido:

**Solución 1 (Recomendada):** Usar interceptor en `fetchWithAuth` (ya está arriba)

**Solución 2 (Alternativa):** Agregar explícitamente:

```typescript
export async function fetchCurrentProfile(): Promise<UserDto> {
  const response = await fetchWithAuth(apiEndpoints.me, {
    cache: 'no-store',
    headers: {
      'tenant': getTenant(),
    },
  });

  // ...
}
```

---

## 📋 ARCHIVOS A ACTUALIZAR

### 1. `lib/api/profile.ts`
**Cambios:**
- [ ] Convertir imagen a bytes en updateProfile()
- [ ] Agregar header tenant
- [ ] Mapear respuesta de refresh token

### 2. `lib/api/fetchWithAuth.ts`
**Cambios:**
- [ ] Agregar interceptor para header tenant
- [ ] Actualizar POST /token/refresh para enviar tokens en body
- [ ] Mapear respuesta de refresh (token → accessToken)

### 3. `lib/utils/auth.ts`
**Cambios:**
- [ ] Agregar getCookie()
- [ ] Agregar updateTokens()
- [ ] Agregar getTenant()

### 4. `app/(full-page)/auth/login/page.tsx`
**Cambios:**
- [ ] Remover tenant del body JSON
- [ ] Agregar tenant en header

### 5. `types/profile.ts`
**Cambios:**
- [ ] ✅ Ya actualizado (image?: File | FileUploadRequest)

---

## 🧪 TESTING DE CORRECCIONES

### Prueba 1: Login
```bash
curl -X POST http://localhost:5030/api/v1/identity/token/issue \
  -H "Content-Type: application/json" \
  -H "tenant: root" \
  -d '{"email": "admin@root.com", "password": "123Pa$$word!"}'

# Esperado: 200 OK con tokens
```

### Prueba 2: Refresh Token
```bash
curl -X POST http://localhost:5030/api/v1/identity/token/refresh \
  -H "Content-Type: application/json" \
  -H "tenant: root" \
  -d '{
    "token": "eyJ...",
    "refreshToken": "xyz..."
  }'

# Esperado: 200 OK con nuevo token
```

### Prueba 3: Update Profile con Imagen
```bash
# Convertir imagen a bytes (node.js)
const fs = require('fs');
const imageBytes = Array.from(fs.readFileSync('./avatar.jpg'));

curl -X PUT http://localhost:5030/api/v1/identity/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJ..." \
  -H "tenant: root" \
  -d '{
    "firstName": "Jane",
    "lastName": "Doe",
    "phoneNumber": "+1-555-0000",
    "email": "jane@example.com",
    "image": {
      "fileName": "avatar.jpg",
      "contentType": "image/jpeg",
      "data": [255, 216, 255, ...]
    },
    "deleteCurrentImage": false
  }'

# Esperado: 204 No Content
```

---

## 📊 CHECKLIST FINAL

### Frontend Necesita:
- [ ] Actualizar updateProfile() para convertir imagen a bytes
- [ ] Agregar interceptor global de tenant header
- [ ] Actualizar POST /token/refresh para enviar tokens
- [ ] Mapear respuesta de refresh token
- [ ] Agregar funciones helper (getCookie, updateTokens, getTenant)
- [ ] Remover tenant del body JSON en login
- [ ] Probar todos los endpoints en Postman
- [ ] Validar que error 415 se resuelve
- [ ] Validar que refresh token funciona
- [ ] Validar que tenant es correcto

### Backend (Opcional):
- [ ] Considerar aceptar tenant como parámetro de query
- [ ] Considerar soportar multipart/form-data para imágenes
- [ ] Agregar validación clara de tenant

---

## 🚀 IMPLEMENTACIÓN PASO A PASO

1. **Paso 1:** Actualizar `lib/utils/auth.ts` con funciones helper
2. **Paso 2:** Actualizar `lib/api/fetchWithAuth.ts` con interceptor
3. **Paso 3:** Actualizar `lib/api/profile.ts` para convertir imagen
4. **Paso 4:** Actualizar login page para enviar tenant en header
5. **Paso 5:** Probar cada endpoint en Postman
6. **Paso 6:** Probar flujo completo en UI
7. **Paso 7:** Validar que no hay errores 415, 401, 400

---

## 📞 VALIDACIÓN CON BACKEND

**Preguntas para el equipo de backend:**

1. ¿El endpoint de refresh espera que el token esté vigente o puede estar expirado?
2. ¿El tenant es siempre requerido como header, o puede venir del token?
3. ¿Hay alternativa para upload de imágenes en multipart/form-data?
4. ¿Cuál es el tamaño máximo de imagen permitido?
5. ¿Se puede retornar el nuevo imageUrl después de PUT /profile?

