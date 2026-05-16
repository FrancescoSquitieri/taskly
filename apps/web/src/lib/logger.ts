type LogLevel = 'info' | 'warn' | 'error';

const isDev = import.meta.env.MODE !== 'production';

const emit = (level: LogLevel, message: string, context?: Record<string, unknown>): void => {
  if (!isDev) return;
  const payload = context ? { message, ...context } : { message };
  if (level === 'error') {
    console.error(payload);
  } else if (level === 'warn') {
    console.warn(payload);
  } else {
    // biome-ignore lint/suspicious/noConsole: dev-only structured logger surface
    console.info(payload);
  }
};

export const logger = {
  info: (message: string, context?: Record<string, unknown>): void =>
    emit('info', message, context),
  warn: (message: string, context?: Record<string, unknown>): void =>
    emit('warn', message, context),
  error: (message: string, context?: Record<string, unknown>): void =>
    emit('error', message, context),
};
