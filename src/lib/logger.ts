type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogContext {
  [key: string]: unknown;
}

const REDACTED_KEYS = [
  'password',
  'token',
  'secret',
  'key',
  'authorization',
  'cookie',
  'jwt',
  'api_key',
  'bot_token',
];

function sanitize(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') {
    // Redact Bearer tokens or Supabase keys if accidentally present
    if (obj.startsWith('sb_secret_') || obj.startsWith('AIza') || obj.length > 200) {
      return '[REDACTED_STRING]';
    }
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitize);
  }
  if (typeof obj === 'object') {
    const clean: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      const lower = k.toLowerCase();
      if (REDACTED_KEYS.some((redacted) => lower.includes(redacted))) {
        clean[k] = '[REDACTED]';
      } else {
        clean[k] = sanitize(v);
      }
    }
    return clean;
  }
  return obj;
}

export const logger = {
  log(level: LogLevel, message: string, context?: LogContext) {
    const timestamp = new Date().toISOString();
    const sanitized = context ? sanitize(context) : undefined;
    const output = {
      timestamp,
      level,
      message,
      ...(sanitized ? { context: sanitized } : {}),
    };

    if (level === 'error') {
      console.error(JSON.stringify(output));
    } else if (level === 'warn') {
      console.warn(JSON.stringify(output));
    } else {
      console.log(JSON.stringify(output));
    }
  },

  info(message: string, context?: LogContext) {
    this.log('info', message, context);
  },

  warn(message: string, context?: LogContext) {
    this.log('warn', message, context);
  },

  error(message: string, context?: LogContext) {
    this.log('error', message, context);
  },

  debug(message: string, context?: LogContext) {
    if (process.env.NODE_ENV !== 'production') {
      this.log('debug', message, context);
    }
  },
};
