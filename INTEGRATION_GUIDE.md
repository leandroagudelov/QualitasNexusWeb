# Guía de Integración - Nuevas Utilidades de Autenticación y Perfil

Este documento explica cómo usar las nuevas utilidades agregadas para mejorar la experiencia de Login y Perfil de usuario.

## 📚 Utilidades Disponibles

### 1. **Detección de Cambios** (`lib/utils/profileChanges.ts`)

Detecta qué campos del perfil han sido modificados.

#### Uso:

```typescript
import { detectProfileChanges, getChangesSummary } from '@/lib/utils/profileChanges';
import { useProfile } from '@/hooks/useProfile';

export function ProfilePage() {
  const { user, detectChanges } = useProfile();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [deleteImage, setDeleteImage] = useState(false);

  // Detectar cambios
  const changes = detectChanges({
    firstName,
    lastName,
    phoneNumber,
    imageFile,
    deleteCurrentImage: deleteImage,
  });

  // Usar para deshabilitar botón
  return (
    <button
      disabled={!changes.hasChanges || isSaving}
      onClick={handleSave}
    >
      {changes.hasChanges ? `Guardar Cambios` : 'Sin cambios'}
    </button>
  );
}
```

#### Propiedades:

```typescript
interface ProfileChanges {
  hasChanges: boolean;           // ¿Hay cambios?
  changedFields: string[];       // Lista de campos cambiados
  changes: {
    firstName?: boolean;
    lastName?: boolean;
    phoneNumber?: boolean;
    image?: boolean;
    deleteImage?: boolean;
  };
}
```

---

### 2. **Logging de Seguridad** (`lib/utils/securityLogger.ts`)

Registra acciones de seguridad importantes.

#### Funciones Disponibles:

```typescript
import {
  logLoginAttempt,
  logLoginError,
  logProfileUpdate,
  logPasswordChange,
  logTokenRefresh,
  logSessionExpired,
  logTokenExpired,
  getStoredLogs,
  clearStoredLogs,
} from '@/lib/utils/securityLogger';

// Login
logLoginAttempt('user@example.com', true);           // Success
logLoginAttempt('user@example.com', false, 'Invalid credentials');
logLoginError('user@example.com', 'Network error');

// Profile
logProfileUpdate(['firstName', 'lastName'], true);
logProfileUpdate([], false, 'Server error');

// Password
logPasswordChange(true);
logPasswordChange(false, 'Current password incorrect');

// Tokens
logTokenRefresh(true);
logTokenRefresh(false, 'Refresh endpoint unreachable');
logTokenExpired();
logSessionExpired();

// Debugging
const logs = getStoredLogs();  // Últimos 50 logs en sessionStorage
clearStoredLogs();
```

#### Salida de Consola:

```
[QualitasNexus] [14:32:15] ✅ [AUTH] Usuario user@example.com inició sesión
[QualitasNexus] [14:32:45] ✅ [PROFILE] Perfil actualizado: firstName, lastName
[QualitasNexus] [14:33:10] ✅ [PASSWORD] Contraseña cambiada exitosamente
```

---

### 3. **Toast/Notificaciones** (`hooks/useToast.ts`)

Muestra notificaciones al usuario.

#### Uso:

```typescript
import { useToast } from '@/hooks/useToast';
import { Toast } from 'primereact/toast';

export function MyComponent() {
  const { toastRef, showSuccess, showError, showInfo } = useToast();

  const handleSave = async () => {
    try {
      await saveData();
      showSuccess('Datos guardados correctamente', 'Éxito');
    } catch (error) {
      showError('No se pudieron guardar los datos', 'Error');
    }
  };

  return (
    <>
      <Toast ref={toastRef} position="top-right" />
      <button onClick={handleSave}>Guardar</button>
    </>
  );
}
```

#### Métodos:

```typescript
const {
  toastRef,                    // Ref para el componente Toast
  show,                        // Genérico: show(message, severity, summary, options)
  showSuccess,                 // showSuccess(message, summary?, options?)
  showError,                   // showError(message, summary?, options?)
  showInfo,                    // showInfo(message, summary?, options?)
  showWarning,                 // showWarning(message, summary?, options?)
} = useToast();
```

#### Opciones:

```typescript
interface ToastOptions {
  life?: number;     // Duración en ms (default: 3000, error: 5000)
  sticky?: boolean;  // Permanente hasta cerrar (default: false)
}
```

---

## 🔄 Auto-Refresh de Tokens (`lib/api/fetchWithAuth.ts`)

Ya está integrado automáticamente en todos los endpoints protegidos.

#### Características:

- ✅ Detecta respuestas 401 (Unauthorized)
- ✅ Intenta renovar token automáticamente
- ✅ Reintenenta el request original
- ✅ Redirige a login si falla el refresh
- ✅ Registra eventos en security logger

#### Uso (Automático):

El cliente API ya usa `fetchWithAuth`:

```typescript
// lib/api/profile.ts
export async function fetchCurrentProfile(): Promise<UserDto> {
  const response = await fetchWithAuth(apiEndpoints.me, {
    cache: 'no-store',
  });
  // ...
}
```

---

## 📋 Ejemplo Completo: Componente de Perfil con Todas las Utilidades

```typescript
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Toast } from 'primereact/toast';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/useToast';
import { detectProfileChanges } from '@/lib/utils/profileChanges';
import { logProfileUpdate } from '@/lib/utils/securityLogger';

export function ProfilePageComplete() {
  const { toastRef, showSuccess, showError } = useToast();
  const { user, profileSaving, profileError, updateProfile, detectChanges } = useProfile();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [deleteImage, setDeleteImage] = useState(false);

  // Inicializar con datos del usuario
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName);
      setLastName(user.lastName);
      setPhoneNumber(user.phoneNumber || '');
    }
  }, [user]);

  // Detectar cambios
  const changes = useMemo(() => {
    return detectChanges({
      firstName,
      lastName,
      phoneNumber,
      imageFile,
      deleteCurrentImage: deleteImage,
    });
  }, [firstName, lastName, phoneNumber, imageFile, deleteImage, detectChanges]);

  // Manejar guardado
  const handleSave = async () => {
    try {
      await updateProfile({
        firstName,
        lastName,
        phoneNumber,
        email: user?.email,
        image: imageFile,
        deleteCurrentImage: deleteImage,
      });

      showSuccess('Perfil actualizado correctamente', 'Éxito');
      logProfileUpdate(changes.changedFields, true);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      showError(message, 'Error');
      logProfileUpdate([], false, message);
    }
  };

  return (
    <>
      <Toast ref={toastRef} position="top-right" />

      <div className="profile-form">
        {/* Formulario aquí */}

        <button
          onClick={handleSave}
          disabled={!changes.hasChanges || profileSaving}
        >
          {profileSaving ? 'Guardando...' : 'Guardar Cambios'}
        </button>

        {/* Mostrar cambios detectados */}
        {changes.hasChanges && (
          <small className="text-info">
            Cambios: {changes.changedFields.join(', ')}
          </small>
        )}

        {profileError && (
          <small className="text-danger">{profileError}</small>
        )}
      </div>
    </>
  );
}
```

---

## 🔍 Debugging

### Ver Logs de Seguridad:

```javascript
// En la consola del navegador
import { getStoredLogs, clearStoredLogs } from '@/lib/utils/securityLogger';

getStoredLogs().forEach(log => {
  console.log(`[${log.timestamp}] ${log.category}: ${log.message}`, log.details);
});

clearStoredLogs();
```

### Monitorar Token Refresh:

```javascript
// Los logs aparecerán automáticamente en consola cuando:
// - El token expire (401)
// - Se intente refrescar
// - El refresh falle y se redirija a login
```

---

## ✅ Checklist de Implementación

- [x] Auto-refresh de tokens implementado
- [x] Logging de acciones de seguridad
- [x] Detección de cambios en perfil
- [x] Sistema de notificaciones (Toast)
- [ ] Integrar Toast en páginas principales
- [ ] Integrar detección de cambios en formularios
- [ ] Agregar notificaciones de éxito/error en componentes
- [ ] Probar flujos completos de autenticación

---

## 📖 Referencias Rápidas

| Utilidad | Archivo | Función Principal |
|----------|---------|-------------------|
| Cambios | `lib/utils/profileChanges.ts` | `detectProfileChanges()` |
| Logging | `lib/utils/securityLogger.ts` | `logLoginAttempt()` |
| Toast | `hooks/useToast.ts` | `useToast()` |
| Auth Fetch | `lib/api/fetchWithAuth.ts` | `fetchWithAuth()` |
| Perfil | `hooks/useProfile.ts` | `useProfile()` |

