/**
 * Security Logger
 * Logs important security events for debugging and auditing
 */

type LogLevel = 'info' | 'warn' | 'error' | 'success';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: 'auth' | 'profile' | 'password' | 'token' | 'error';
  message: string;
  details?: Record<string, any>;
}

const LOG_PREFIX = '[QualitasNexus]';

/**
 * Format log entry
 */
function formatLog(entry: LogEntry): string {
  const time = new Date(entry.timestamp).toLocaleTimeString('es-ES');
  const levelEmoji: Record<LogLevel, string> = {
    info: 'ℹ️',
    warn: '⚠️',
    error: '❌',
    success: '✅',
  };

  return `${LOG_PREFIX} [${time}] ${levelEmoji} [${entry.category.toUpperCase()}] ${entry.message}`;
}

/**
 * Log security event
 */
function log(
  level: LogLevel,
  category: LogEntry['category'],
  message: string,
  details?: Record<string, any>
) {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    category,
    message,
    details,
  };

  const formatted = formatLog(entry);

  // Log to console based on level
  switch (level) {
    case 'error':
      console.error(formatted, details);
      break;
    case 'warn':
      console.warn(formatted, details);
      break;
    case 'success':
      console.log(formatted, details);
      break;
    default:
      console.log(formatted, details);
  }

  // Store in sessionStorage for debugging (last 50 logs)
  try {
    const logs: LogEntry[] = JSON.parse(
      sessionStorage.getItem('security_logs') || '[]'
    );
    logs.push(entry);

    // Keep only last 50 logs
    if (logs.length > 50) {
      logs.shift();
    }

    sessionStorage.setItem('security_logs', JSON.stringify(logs));
  } catch {
    // Silently fail if storage is not available
  }
}

/**
 * Log login attempt
 */
export function logLoginAttempt(email: string, success: boolean, reason?: string) {
  const message = success
    ? `Usuario ${email} inició sesión`
    : `Intento de login fallido para ${email}`;

  log(
    success ? 'success' : 'warn',
    'auth',
    message,
    success ? undefined : { reason }
  );
}

/**
 * Log login error
 */
export function logLoginError(email: string, error: string) {
  log('error', 'auth', `Error en login para ${email}`, { error });
}

/**
 * Log profile update
 */
export function logProfileUpdate(
  fields: string[],
  success: boolean,
  reason?: string
) {
  const message = success
    ? `Perfil actualizado: ${fields.join(', ')}`
    : 'Error al actualizar perfil';

  log(
    success ? 'success' : 'error',
    'profile',
    message,
    success ? undefined : { reason }
  );
}

/**
 * Log password change
 */
export function logPasswordChange(success: boolean, reason?: string) {
  const message = success
    ? 'Contraseña cambiada exitosamente'
    : 'Error al cambiar contraseña';

  log(
    success ? 'success' : 'error',
    'password',
    message,
    success ? undefined : { reason }
  );
}

/**
 * Log token refresh
 */
export function logTokenRefresh(success: boolean, reason?: string) {
  const message = success
    ? 'Token renovado'
    : 'Error al renovar token';

  log(
    success ? 'info' : 'warn',
    'token',
    message,
    success ? undefined : { reason }
  );
}

/**
 * Log session expiration
 */
export function logSessionExpired() {
  log('warn', 'token', 'Sesión expirada, redirigiendo a login');
}

/**
 * Log token expired error
 */
export function logTokenExpired() {
  log('warn', 'token', 'Token expirado detectado');
}

/**
 * Get all stored logs
 */
export function getStoredLogs(): LogEntry[] {
  try {
    return JSON.parse(sessionStorage.getItem('security_logs') || '[]');
  } catch {
    return [];
  }
}

/**
 * Clear stored logs
 */
export function clearStoredLogs() {
  try {
    sessionStorage.removeItem('security_logs');
    console.log(`${LOG_PREFIX} Logs de seguridad limpiados`);
  } catch {
    // Silently fail
  }
}
