/**
 * useToast Hook
 * Provides toast notification functionality using PrimeReact
 */

import { useRef, useCallback } from 'react';
import { Toast } from 'primereact/toast';

export type ToastSeverity = 'success' | 'info' | 'warn' | 'error';

export interface ToastOptions {
  life?: number;
  sticky?: boolean;
}

/**
 * Hook para mostrar notificaciones Toast
 * Debe ser usado dentro de un componente que tenga acceso a la ref del Toast
 */
export function useToast() {
  const toastRef = useRef<Toast>(null);

  const show = useCallback(
    (
      message: string,
      severity: ToastSeverity = 'info',
      summary?: string,
      options?: ToastOptions
    ) => {
      if (!toastRef.current) {
        console.warn('[useToast] Toast ref not set');
        return;
      }

      toastRef.current.show({
        severity,
        summary: summary || getSummary(severity),
        detail: message,
        life: options?.life || 3000,
        sticky: options?.sticky || false,
      });
    },
    []
  );

  const showSuccess = useCallback(
    (message: string, summary?: string, options?: ToastOptions) => {
      show(message, 'success', summary, options);
    },
    [show]
  );

  const showError = useCallback(
    (message: string, summary?: string, options?: ToastOptions) => {
      show(message, 'error', summary, { ...options, life: 5000 });
    },
    [show]
  );

  const showInfo = useCallback(
    (message: string, summary?: string, options?: ToastOptions) => {
      show(message, 'info', summary, options);
    },
    [show]
  );

  const showWarning = useCallback(
    (message: string, summary?: string, options?: ToastOptions) => {
      show(message, 'warn', summary, options);
    },
    [show]
  );

  return {
    toastRef,
    show,
    showSuccess,
    showError,
    showInfo,
    showWarning,
  };
}

/**
 * Get default summary for severity
 */
function getSummary(severity: ToastSeverity): string {
  const summaries: Record<ToastSeverity, string> = {
    success: '✅ Éxito',
    error: '❌ Error',
    info: 'ℹ️ Información',
    warn: '⚠️ Advertencia',
  };

  return summaries[severity];
}
