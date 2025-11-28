type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const shouldLog = (level: LogLevel): boolean => {
  if (process.env.NODE_ENV === 'production') {
    return level === 'error' || level === 'warn';
  }
  return true;
};

export const logger = {
  debug: (...args: unknown[]) => {
    if (shouldLog('debug')) console.log('🐛', ...args);
  },
  info: (...args: unknown[]) => {
    if (shouldLog('info')) console.log('ℹ️', ...args);
  },
  warn: (...args: unknown[]) => {
    if (shouldLog('warn')) console.warn('⚠️', ...args);
  },
  error: (...args: unknown[]) => {
    if (shouldLog('error')) console.error('❌', ...args);
  },
  api: (route: string, message: string, data?: unknown) => {
    if (shouldLog('debug')) {
      console.log(`🔌 [${route}]`, message, data || '');
    }
  }
};