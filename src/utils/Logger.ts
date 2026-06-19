import type { LoggerConfig } from '../types/index.js';

export class Logger {
  private config: LoggerConfig;

  constructor(config: LoggerConfig = { level: 'info' }) {
    this.config = config;
  }

  private shouldLog(level: LoggerConfig['level']): boolean {
    const levels = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.config.level);
  }

  private format(level: string, message: string, ...args: unknown[]): string {
    const prefix = this.config.prefix ? `[${this.config.prefix}] ` : '';
    const timestamp = new Date().toISOString();
    return `${timestamp} ${prefix}[${level.toUpperCase()}] ${message}`;
  }

  debug(message: string, ...args: unknown[]): void {
    if (this.shouldLog('debug')) {
      console.debug(this.format('debug', message), ...args);
    }
  }

  info(message: string, ...args: unknown[]): void {
    if (this.shouldLog('info')) {
      console.info(this.format('info', message), ...args);
    }
  }

  warn(message: string, ...args: unknown[]): void {
    if (this.shouldLog('warn')) {
      console.warn(this.format('warn', message), ...args);
    }
  }

  error(message: string, ...args: unknown[]): void {
    if (this.shouldLog('error')) {
      console.error(this.format('error', message), ...args);
    }
  }
}
